'use server'

// The Backlog data layer over tower.tasks — a table that has carried full RLS
// and an audit trigger since Wave 1 (tower_06/tower_08) but was never wired
// into the app. `ref_table`/`ref_id` is a polymorphic pointer; today the only
// producer is the client window ('accounts'). `lane_id` is always left null
// here — a client relationship isn't lane-specific — so RLS falls through to
// the brand-scoped branch (tasks_read/ins/upd's `case … else has_brand_role`).
//
// Account names can't be embedded in the select (ref_id has no real FK — it's
// polymorphic by design), so they're resolved with a second, batched query.

import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import { mapTaskRow, TASK_SELECT, type RawTaskRow, type TaskListItem } from './tasks-logic'

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase, user }
}

/** Batch-resolve account names for the tasks that reference one (ref_table = 'accounts'). */
async function resolveAccountNames(
  db: ReturnType<SupabaseClient['schema']>,
  rows: RawTaskRow[],
): Promise<Map<string, string>> {
  const ids = [...new Set(rows.filter((r) => r.ref_table === 'accounts' && r.ref_id).map((r) => r.ref_id as string))]
  if (ids.length === 0) return new Map()
  const { data } = await db.from('accounts').select('id,name').in('id', ids)
  return new Map(((data ?? []) as { id: string; name: string }[]).map((a) => [a.id, a.name]))
}

/**
 * The backlog — every task the caller can see (brand/lane RLS-scoped),
 * OPEN first by due date. `mine`/`all` is a client-side filter on the result
 * (small volumes at this stage; a server-side filter is a fast follow if the
 * table grows).
 */
export async function listTasks(): Promise<ActionResult<TaskListItem[]>> {
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const db = auth.supabase.schema('tower')

  const { data, error } = await db.from('tasks').select(TASK_SELECT).order('due_date', { ascending: true }).limit(300)

  if (error) return fail('VALIDATION', 'No se pudo cargar el backlog / Could not load the backlog')
  const rows = (data ?? []) as unknown as RawTaskRow[]
  const names = await resolveAccountNames(db, rows)
  return ok(rows.map((r) => mapTaskRow(r, names)))
}

/** Tasks linked to one client — the client window's Tasks card. */
export async function listTasksForAccount(accountId: string): Promise<ActionResult<TaskListItem[]>> {
  const parsed = z.string().uuid().safeParse(accountId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .schema('tower')
    .from('tasks')
    .select(TASK_SELECT)
    .eq('ref_table', 'accounts')
    .eq('ref_id', parsed.data)
    .order('due_date', { ascending: true })

  if (error) return fail('VALIDATION', 'No se pudieron listar las tareas / Could not list tasks')
  return ok(((data ?? []) as unknown as RawTaskRow[]).map((r) => mapTaskRow(r)))
}

const nz = (max: number) => z.string().trim().max(max).nullish()

const createTaskSchema = z.object({
  brandId: z.string().uuid().nullish(),
  title: z.string().trim().min(1).max(300),
  dueDate: nz(10),
  assigneeId: z.string().uuid().nullish(),
  accountId: z.string().uuid().nullish(),
})
export type CreateTaskInput = z.input<typeof createTaskSchema>

/**
 * Create a task (RLS: tasks_ins — brand-scoped since lane_id is always null
 * here). When linked to a client, brand_id is derived server-side from that
 * account — never trusted from the caller — so a task can't land under a
 * brand its client doesn't belong to. A brandId is required otherwise.
 */
export async function createTask(input: CreateTaskInput): Promise<ActionResult<TaskListItem>> {
  const parsed = createTaskSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  const d = parsed.data

  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const db = auth.supabase.schema('tower')

  let brandId = d.brandId ?? null
  let accountName: string | null = null
  if (d.accountId) {
    const { data: account, error } = await db.from('accounts').select('id,brand_id,name').eq('id', d.accountId).maybeSingle()
    if (error || !account) return fail('FORBIDDEN_LANE', 'Cliente no encontrado o sin acceso / Client not found or no access')
    const row = account as { id: string; brand_id: string; name: string }
    brandId = row.brand_id
    accountName = row.name
  }
  if (!brandId) return fail('VALIDATION', 'Falta la marca o el cliente / Missing brand or client')

  const { data, error } = await db
    .from('tasks')
    .insert({
      brand_id: brandId,
      title: d.title,
      due_date: d.dueDate ?? null,
      assignee_id: d.assigneeId ?? auth.user.id,
      ref_table: d.accountId ? 'accounts' : null,
      ref_id: d.accountId ?? null,
      status: 'OPEN',
    })
    .select(TASK_SELECT)
    .single()

  if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo crear la tarea / Could not create the task')
  const item = mapTaskRow(data as unknown as RawTaskRow, accountName && d.accountId ? new Map([[d.accountId, accountName]]) : undefined)
  return ok(item)
}

const statusSchema = z.enum(['OPEN', 'DONE', 'CANCELLED'])

/** Move a task's status (RLS: tasks_upd — brand-scoped since lane_id is always null here). */
export async function updateTaskStatus(id: string, status: string): Promise<ActionResult<{ id: string; status: string }>> {
  const parsedId = z.string().uuid().safeParse(id)
  const parsedStatus = statusSchema.safeParse(status)
  if (!parsedId.success || !parsedStatus.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .schema('tower')
    .from('tasks')
    .update({ status: parsedStatus.data })
    .eq('id', parsedId.data)
    .select('id,status')
    .single()

  if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo actualizar / Could not update')
  return ok(data as { id: string; status: string })
}
