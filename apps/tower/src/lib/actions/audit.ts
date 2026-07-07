'use server'

// src/lib/actions/audit.ts
// The AuditExplorer read layer (COMPONENT_TREE §6 <AuditExplorer>): a
// group-admin-only, filterable, append-only view of tower.audit_log.
//
// PERMISSION MODEL. audit_log's SELECT is restricted to group admin
// (DATABASE_SCHEMA.sql: "select restricted to group admin"). This module
// resolves is_group_admin through the RLS-scoped client (getIsGroupAdmin reads
// the caller's own profile row), returns FORBIDDEN for non-admins, and only
// then reads the log through the SERVICE-ROLE client — the exact admin-gated
// service-read shape as getGroupSignalDeck (signals.ts). The group-admin SELECT
// policy on audit_log remains as defense-in-depth. Raw DB errors never surface.
//
// SQL, NOT MEMORY. Every filter and the keyset page are applied in the query
// (never fetch-all): action/actor/table on real columns; date range on `at`;
// lane/brand best-effort from the before/after JSON (audit_log has no lane_id/
// brand_id column). Cursor keyset is (at DESC, id DESC).
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getIsGroupAdmin } from '@/lib/lanes/memberships'
import { fail, ok, type ActionResult } from './result'
import { AUDIT_ACTIONS, AUDITED_TABLES, type AuditAction } from './audit-logic'
import { auditKeysetClause, decodeAuditCursor, encodeAuditCursor } from './audit-cursor'

// ── Shapes ─────────────────────────────────────────────────────────────────

export interface AuditLogRow {
  id: number
  at: string
  actor: string | null
  tableName: string
  rowId: string | null
  action: AuditAction
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
}

export interface AuditListPage {
  rows: AuditLogRow[]
  nextCursor: string | null
}

export interface AuditActorRef {
  id: string
  name: string
}

export interface AuditFacets {
  tables: readonly string[]
  actions: readonly AuditAction[]
  actors: AuditActorRef[]
  lanes: { id: string; code: string; name: string }[]
  brands: { id: string; slug: string; name: string }[]
}

// ── Input ──────────────────────────────────────────────────────────────────

const listAuditInputSchema = z.object({
  tableName: z.enum(AUDITED_TABLES).optional(),
  action: z.enum(AUDIT_ACTIONS).optional(),
  actor: z.string().uuid().optional(),
  laneId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  // ISO date-time boundaries (inclusive from / exclusive to) on audit_log.at.
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(200).default(50),
})
export type ListAuditInput = z.input<typeof listAuditInputSchema>

const AUDIT_SELECT_COLS = 'id,at,actor,table_name,row_id,action,before,after'

interface RawAuditRow {
  id: number | string
  at: string
  actor: string | null
  table_name: string
  row_id: string | null
  action: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
}

function mapAuditRow(row: RawAuditRow): AuditLogRow {
  return {
    id: typeof row.id === 'string' ? Number(row.id) : row.id,
    at: row.at,
    actor: row.actor,
    tableName: row.table_name,
    rowId: row.row_id,
    action: row.action as AuditAction,
    before: row.before,
    after: row.after,
  }
}

type ServiceClient = NonNullable<ReturnType<typeof createServiceClient>>

/**
 * Best-effort lane/brand `.or()` clause. audit_log carries no lane_id/brand_id
 * column, so we match rows whose before OR after JSON carries the id. `value`
 * is a validated uuid (no injection risk in the filter string).
 */
function jsonScopeClause(field: 'lane_id' | 'brand_id', value: string): string {
  return `after->>${field}.eq.${value},before->>${field}.eq.${value}`
}

// ── Reads (group-admin only) ───────────────────────────────────────────────

export async function listAuditLog(input: ListAuditInput): Promise<ActionResult<AuditListPage>> {
  if (!(await getIsGroupAdmin())) {
    return fail('FORBIDDEN_LANE', 'La auditoría es solo para administradores del grupo / Audit is group-admin only')
  }

  const parsed = listAuditInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Filtros inválidos / Invalid filters', parsed.error.flatten().fieldErrors)
  }
  const { tableName, action, actor, laneId, brandId, from, to, limit } = parsed.data
  const cursor = decodeAuditCursor(parsed.data.cursor)

  const service = createServiceClient()
  if (!service) return fail('VALIDATION', 'Servicio no disponible / Service unavailable')

  let query = (service as ServiceClient)
    .schema('tower')
    .from('audit_log')
    .select(AUDIT_SELECT_COLS)
    .order('at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1)

  if (tableName) query = query.eq('table_name', tableName)
  if (action) query = query.eq('action', action)
  if (actor) query = query.eq('actor', actor)
  if (from) query = query.gte('at', from)
  if (to) query = query.lt('at', to)
  // Best-effort JSON-derived scope filters (each ANDed as its own .or()).
  if (laneId) query = query.or(jsonScopeClause('lane_id', laneId))
  if (brandId) query = query.or(jsonScopeClause('brand_id', brandId))
  if (cursor) query = query.or(auditKeysetClause(cursor))

  const { data, error } = await query
  if (error) return fail('VALIDATION', 'No se pudo leer la auditoría / Could not read the audit log')

  const raw = (data ?? []) as unknown as RawAuditRow[]
  const hasMore = raw.length > limit
  const page = hasMore ? raw.slice(0, limit) : raw
  const rows = page.map(mapAuditRow)
  const last = rows[rows.length - 1]
  const nextCursor = hasMore && last ? encodeAuditCursor({ at: last.at, id: last.id }) : null

  return ok({ rows, nextCursor })
}

/**
 * Filter dropdown options. `tables`/`actions` are the curated static sets
 * (audit-logic.ts) — no DISTINCT scan over the append-only log. `actors`,
 * `lanes`, `brands` are read from their small tables so the UI shows names, not
 * bare uuids. Group-admin only.
 */
export async function getAuditFacets(): Promise<ActionResult<AuditFacets>> {
  if (!(await getIsGroupAdmin())) {
    return fail('FORBIDDEN_LANE', 'La auditoría es solo para administradores del grupo / Audit is group-admin only')
  }

  const service = createServiceClient()
  if (!service) return fail('VALIDATION', 'Servicio no disponible / Service unavailable')
  const db = (service as ServiceClient).schema('tower')

  const [profilesRes, lanesRes, brandsRes] = await Promise.all([
    db.from('profiles').select('id,full_name,email'),
    db.from('lanes').select('id,code,name').neq('status', 'ARCHIVED'),
    db.from('brands').select('id,slug,name'),
  ])

  const actors: AuditActorRef[] = (
    (profilesRes.data ?? []) as { id: string; full_name: string | null; email: string | null }[]
  )
    .map((p) => ({ id: p.id, name: p.full_name || p.email || p.id }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const lanes = ((lanesRes.data ?? []) as { id: string; code: string; name: string }[]).sort((a, b) =>
    a.code.localeCompare(b.code),
  )
  const brands = ((brandsRes.data ?? []) as { id: string; slug: string; name: string }[]).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  return ok({ tables: AUDITED_TABLES, actions: AUDIT_ACTIONS, actors, lanes, brands })
}
