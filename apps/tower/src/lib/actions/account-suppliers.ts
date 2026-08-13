'use server'

// The client window's "suppliers assigned" data layer over
// tower.account_suppliers (tower_61) — which suppliers a rep is sourcing a
// given client from. RLS scopes both sides through the account's brand
// (account_suppliers_read/ins/del); insert also requires the supplier to
// belong to the SAME brand as the account (enforced in the policy itself).

import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import {
  mapAccountSupplierRow,
  ACCOUNT_SUPPLIER_SELECT,
  type AccountSupplierListItem,
  type RawAccountSupplierRow,
} from './account-suppliers-logic'

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase, user }
}

/** Suppliers assigned to one client, newest first. RLS on account_suppliers is the scope boundary. */
export async function listAccountSuppliers(accountId: string): Promise<ActionResult<AccountSupplierListItem[]>> {
  const parsed = z.string().uuid().safeParse(accountId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .schema('tower')
    .from('account_suppliers')
    .select(ACCOUNT_SUPPLIER_SELECT)
    .eq('account_id', parsed.data)
    .order('created_at', { ascending: false })

  if (error) return fail('VALIDATION', 'No se pudieron listar los proveedores asignados / Could not list assigned suppliers')
  return ok(((data ?? []) as unknown as RawAccountSupplierRow[]).map(mapAccountSupplierRow))
}

const assignSchema = z.object({
  accountId: z.string().uuid(),
  supplierId: z.string().uuid(),
  note: z.string().trim().max(500).nullish(),
})
export type AssignAccountSupplierInput = z.input<typeof assignSchema>

/** Assign a supplier to a client (RLS: LANE_DIRECTOR/SALES on the account's brand). */
export async function assignAccountSupplier(
  input: AssignAccountSupplierInput,
): Promise<ActionResult<AccountSupplierListItem>> {
  const parsed = assignSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  const d = parsed.data

  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .schema('tower')
    .from('account_suppliers')
    .insert({ account_id: d.accountId, supplier_id: d.supplierId, note: d.note ?? null })
    .select(ACCOUNT_SUPPLIER_SELECT)
    .single()

  if (error || !data) {
    // Unique violation (already assigned) reads as a validation error, not a
    // generic failure — the operator just needs to see the existing row.
    return fail('VALIDATION', 'No se pudo asignar (¿ya estaba asignado?) / Could not assign (already assigned?)')
  }
  return ok(mapAccountSupplierRow(data as unknown as RawAccountSupplierRow))
}

/** Unassign a supplier from a client (RLS: LANE_DIRECTOR/SALES on the account's brand). */
export async function unassignAccountSupplier(id: string): Promise<ActionResult<{ id: string }>> {
  const parsed = z.string().uuid().safeParse(id)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { error } = await auth.supabase.schema('tower').from('account_suppliers').delete().eq('id', parsed.data)
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo quitar / Could not unassign')
  return ok({ id: parsed.data })
}
