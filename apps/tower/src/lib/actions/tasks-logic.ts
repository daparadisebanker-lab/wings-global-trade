// Pure logic for the Backlog — the display type, the join-row shape, the row
// mapper, and the urgency-bucketing a rep actually scans by (overdue first).
// Split from tasks.ts because a 'use server' file may only export async
// functions (mirrors clients.ts / clients-logic.ts). Unit-tested.

export type TaskStatus = 'OPEN' | 'DONE' | 'CANCELLED'

export interface TaskListItem {
  id: string
  brandId: string
  title: string
  dueDate: string | null
  assigneeId: string | null
  status: TaskStatus
  /** Polymorphic link (Directive-free reuse of tower.tasks' ref_table/ref_id) — 'accounts' (a client) or 'rfqs' (a Pipeline deal, the Backlog→Pipeline hand-off). */
  refTable: string | null
  refId: string | null
  accountName: string | null
}

export type UrgencyBucket = 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'NO_DATE'

// `ref_id`/`ref_table` is a polymorphic reference (by design — a task can
// point at any table) with no real foreign key, so PostgREST can't embed
// `accounts(name)` in the select. The account name is resolved by the caller
// (a separate batched lookup) and passed in as `accountNamesById`.
export interface RawTaskRow {
  id: string
  brand_id: string
  title: string
  due_date: string | null
  assignee_id: string | null
  status: string | null
  ref_table: string | null
  ref_id: string | null
}

const STATUSES: ReadonlySet<string> = new Set(['OPEN', 'DONE', 'CANCELLED'])

/** PURE: raw row (+ a resolved ref_id → account name lookup) → the flat display item. */
export function mapTaskRow(row: RawTaskRow, accountNamesById: ReadonlyMap<string, string> = new Map()): TaskListItem {
  const accountName = row.ref_table === 'accounts' && row.ref_id ? (accountNamesById.get(row.ref_id) ?? null) : null
  return {
    id: row.id,
    brandId: row.brand_id,
    title: row.title,
    dueDate: row.due_date,
    assigneeId: row.assignee_id,
    status: row.status && STATUSES.has(row.status) ? (row.status as TaskStatus) : 'OPEN',
    refTable: row.ref_table,
    refId: row.ref_id,
    accountName,
  }
}

/** PURE: which urgency bucket a due date falls in, relative to `today`
 *  (an injected ISO date string — never `new Date()` inline, so this stays
 *  testable without mocking the clock). */
export function bucketOf(dueDate: string | null, today: string): UrgencyBucket {
  if (!dueDate) return 'NO_DATE'
  if (dueDate < today) return 'OVERDUE'
  if (dueDate === today) return 'TODAY'
  return 'UPCOMING'
}

const BUCKET_ORDER: UrgencyBucket[] = ['OVERDUE', 'TODAY', 'UPCOMING', 'NO_DATE']

/** PURE: group OPEN tasks into urgency buckets, each sorted by due date
 *  (earliest first; no-date tasks keep their incoming order). */
export function groupByUrgency(tasks: TaskListItem[], today: string): { bucket: UrgencyBucket; items: TaskListItem[] }[] {
  const byBucket = new Map<UrgencyBucket, TaskListItem[]>()
  for (const b of BUCKET_ORDER) byBucket.set(b, [])
  for (const task of tasks) {
    const b = bucketOf(task.dueDate, today)
    byBucket.get(b)!.push(task)
  }
  for (const b of BUCKET_ORDER) {
    byBucket.get(b)!.sort((a, c) => (a.dueDate ?? '').localeCompare(c.dueDate ?? ''))
  }
  return BUCKET_ORDER.map((bucket) => ({ bucket, items: byBucket.get(bucket)! }))
}

export const TASK_SELECT = 'id,brand_id,title,due_date,assignee_id,status,ref_table,ref_id'
