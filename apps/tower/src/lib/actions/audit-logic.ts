// src/lib/actions/audit-logic.ts
// Pure, client-safe helpers for the AuditExplorer (COMPONENT_TREE §6
// <AuditExplorer>): the filter vocabulary and the before/after JSON diff.
// Deterministic and DB-free — unit-tested without a client, and imported by
// both audit.ts (server) and <AuditRowDetail> (client). The Buffer-using cursor
// helpers live in audit-cursor.ts so this stays client-safe.
//
// audit_log's real columns (DATABASE_SCHEMA.sql): id (bigint identity), at
// (timestamptz), actor (uuid), table_name, row_id (uuid), action
// (INSERT|UPDATE|DELETE), before jsonb, after jsonb. It carries NO lane_id /
// brand_id column, so a lane filter is BEST-EFFORT, derived from the before/
// after payload (most tower rows carry lane_id) — see audit.ts.

// ── Filter vocabulary ──────────────────────────────────────────────────────
// audit_log.table_name is free text; rather than an expensive DISTINCT scan on
// a large append-only log, the table filter offers this curated set of tower
// tables that carry the audit trigger. New audited tables get added here (one
// line) — cheaper and more stable than querying the log for its own shape.
export const AUDITED_TABLES = [
  'products',
  'product_versions',
  'spec_schemas',
  'rfqs',
  'quotes',
  'orders',
  'containers',
  'container_commitments',
  'purchase_orders',
  'qc_checks',
  'trade_documents',
  'landed_costs',
  'accounts',
  'contacts',
  'suppliers',
  'lanes',
  'lane_memberships',
  'brands',
  'profiles',
  'tasks',
  'ai_drafts',
  'whatsapp_messages',
] as const

export const AUDIT_ACTIONS = ['INSERT', 'UPDATE', 'DELETE'] as const
export type AuditAction = (typeof AUDIT_ACTIONS)[number]

// ── JSON diff (row-detail view) ─────────────────────────────────────────────
export type DiffChange = 'added' | 'removed' | 'changed' | 'unchanged'

export interface DiffField {
  key: string
  change: DiffChange
  before: unknown
  after: unknown
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Stable stringify for scalar/array/object equality (key-order independent). */
function stableStringify(v: unknown): string {
  if (isPlainObject(v)) {
    return `{${Object.keys(v)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(v[k])}`)
      .join(',')}}`
  }
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(',')}]`
  return JSON.stringify(v ?? null)
}

export function valuesEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b)
}

/**
 * Field-level diff of an audit row's before/after JSON, sorted by key. Both
 * INSERT (before null) and DELETE (after null) collapse to added/removed rows.
 * Rendered readably by <AuditRowDetail>; the raw JSON is never shown as a blob.
 */
export function diffAuditRow(before: unknown, after: unknown): DiffField[] {
  const b = isPlainObject(before) ? before : {}
  const a = isPlainObject(after) ? after : {}
  const keys = [...new Set([...Object.keys(b), ...Object.keys(a)])].sort()

  return keys.map((key): DiffField => {
    const inB = key in b
    const inA = key in a
    const beforeVal = b[key]
    const afterVal = a[key]
    let change: DiffChange
    if (inB && !inA) change = 'removed'
    else if (!inB && inA) change = 'added'
    else if (!valuesEqual(beforeVal, afterVal)) change = 'changed'
    else change = 'unchanged'
    return { key, change, before: beforeVal, after: afterVal }
  })
}

/** Only the fields that actually moved — the default row-detail view. */
export function changedFields(before: unknown, after: unknown): DiffField[] {
  return diffAuditRow(before, after).filter((f) => f.change !== 'unchanged')
}
