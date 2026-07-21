'use server'

// src/lib/actions/containers.ts
// Container Desk (ERP) mutations — API_MAP "Containers" domain. Every action
// follows the mutation law: auth → Zod parse → RLS-scoped query (result.ts).
// RLS (tower.containers/purchase_orders/qc_checks/trade_documents/landed_costs/
// container_commitments policies — proposed in migration/wave3-container.sql,
// NOT yet applied) is the permission boundary; this file never gates with
// `if (role === …)`. The one exception to "RLS is the whole story": CBM
// capacity is an ATOMIC check that a bare RLS policy can't express (it needs a
// row lock across concurrent commits), so `commitCbm` calls the
// `tower.commit_container_cbm` SQL function instead of a plain insert — see
// that migration file for the function body and its own internal
// has_lane_role() permission check (SECURITY DEFINER bypasses RLS, so the
// function re-implements the same TRADE_OPS/SALES/LANE_DIRECTOR gate RLS would
// have enforced on a normal insert).
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import {
  buildTradeDocumentStoragePath,
  canAdvancePoStatus,
  canTransitionContainerStatus,
  computeContainerCapabilities,
  computeFillPercent,
  computeLandedCostTotal,
  computeNextContainerCode,
  type ContainerCapabilities,
  type DbLaneRole,
} from './containers-logic'
import { decodeContainerCursor, encodeContainerCursor } from './containers-cursor'
import {
  CONTAINER_KINDS,
  CONTAINER_MODES,
  CONTAINER_STATUSES,
  DOCUMENT_KINDS,
  PO_STATUSES,
  QC_RESULTS,
  TRADE_DOCUMENTS_BUCKET,
  type CommitmentStatus,
  type ContainerCommitmentRow,
  type ContainerRow,
  type ContainerStatus,
  type LandedCostRow,
  type PoStatus,
  type PurchaseOrderRow,
  type QcCheckRow,
  type TradeDocumentRow,
} from './containers-types'

const uuidSchema = z.string().uuid()

// ── Row mappers ──────────────────────────────────────────────────────────────

const CONTAINER_SELECT_COLS =
  'id,brand_id,lane_id,code,kind,capacity_cbm,mode,status,route,public_fill_visible,created_at,lanes(code,slug)'

interface RawLaneJoin {
  code: string
  slug: string
}

interface RawContainerRow {
  id: string
  brand_id: string
  lane_id: string
  code: string
  kind: string
  capacity_cbm: number | string
  mode: string
  status: string
  route: Record<string, unknown> | null
  public_fill_visible: boolean
  created_at: string
  lanes: RawLaneJoin | RawLaneJoin[] | null
}

function toNumber(v: number | string): number {
  return typeof v === 'string' ? Number(v) : v
}

function mapContainerRow(row: RawContainerRow, committedCbm: number): ContainerRow {
  const laneJoin = Array.isArray(row.lanes) ? row.lanes[0] : row.lanes
  const capacityCbm = toNumber(row.capacity_cbm)
  return {
    id: row.id,
    brandId: row.brand_id,
    laneId: row.lane_id,
    laneCode: laneJoin?.code ?? '',
    laneSlug: laneJoin?.slug ?? '',
    code: row.code,
    kind: row.kind as ContainerRow['kind'],
    capacityCbm,
    mode: row.mode as ContainerRow['mode'],
    status: row.status as ContainerRow['status'],
    route: (row.route ?? {}) as ContainerRow['route'],
    publicFillVisible: row.public_fill_visible,
    createdAt: row.created_at,
    committedCbm,
    fillPercent: computeFillPercent(committedCbm, capacityCbm),
  }
}

interface RawCommitmentRow {
  id: string
  container_id: string
  order_id: string | null
  account_id: string | null
  cbm: number | string
  status: string
  created_at: string
  accounts: { name: string } | { name: string }[] | null
}

function mapCommitmentRow(row: RawCommitmentRow): ContainerCommitmentRow {
  const accountJoin = Array.isArray(row.accounts) ? row.accounts[0] : row.accounts
  return {
    id: row.id,
    containerId: row.container_id,
    orderId: row.order_id,
    accountId: row.account_id,
    accountName: accountJoin?.name ?? null,
    cbm: toNumber(row.cbm),
    status: row.status as CommitmentStatus,
    createdAt: row.created_at,
  }
}

interface RawPurchaseOrderRow {
  id: string
  container_id: string | null
  supplier_id: string
  lane_id: string
  lines: unknown
  // bigint — PostgREST may serialize as a string when it doesn't fit a safe
  // JS number; same defensive `toNumber` used for the `numeric` CBM columns.
  total_minor: number | string
  currency: string
  status: string
  suppliers: { name: string } | { name: string }[] | null
}

function mapPurchaseOrderRow(row: RawPurchaseOrderRow): PurchaseOrderRow {
  const supplierJoin = Array.isArray(row.suppliers) ? row.suppliers[0] : row.suppliers
  return {
    id: row.id,
    containerId: row.container_id,
    supplierId: row.supplier_id,
    supplierName: supplierJoin?.name ?? null,
    laneId: row.lane_id,
    lines: row.lines,
    totalMinor: toNumber(row.total_minor),
    currency: row.currency,
    status: row.status as PurchaseOrderRow['status'],
  }
}

function mapQcCheckRow(row: {
  id: string
  purchase_order_id: string
  checkpoint: string
  result: string | null
  evidence: unknown[] | null
  checked_by: string | null
  checked_at: string | null
}): QcCheckRow {
  return {
    id: row.id,
    purchaseOrderId: row.purchase_order_id,
    checkpoint: row.checkpoint,
    result: row.result as QcCheckRow['result'],
    evidence: row.evidence ?? [],
    checkedBy: row.checked_by,
    checkedAt: row.checked_at,
  }
}

function mapLandedCostRow(row: {
  container_id: string
  fob_minor: number | string | null
  freight_minor: number | string | null
  insurance_minor: number | string | null
  duties_minor: number | string | null
  handling_minor: number | string | null
  currency: string
  computed_at: string
}): LandedCostRow {
  const fobMinor = row.fob_minor != null ? toNumber(row.fob_minor) : 0
  const freightMinor = row.freight_minor != null ? toNumber(row.freight_minor) : 0
  const insuranceMinor = row.insurance_minor != null ? toNumber(row.insurance_minor) : 0
  const dutiesMinor = row.duties_minor != null ? toNumber(row.duties_minor) : 0
  const handlingMinor = row.handling_minor != null ? toNumber(row.handling_minor) : 0
  const total = computeLandedCostTotal({
    fobMinor,
    freightMinor,
    insuranceMinor,
    dutiesMinor,
    handlingMinor,
    currency: row.currency,
  })
  return {
    containerId: row.container_id,
    fobMinor,
    freightMinor,
    insuranceMinor,
    dutiesMinor,
    handlingMinor,
    currency: row.currency,
    totalMinor: total.minor,
    computedAt: row.computed_at,
  }
}

// ── Auth helper (identical shape to catalog.ts's requireUser) ───────────────

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), storage: supabase.storage, user } as const
}

/** Sums committed CBM (RESERVED/CONFIRMED/LOADED) per container id in one query. */
async function committedCbmByContainerId(
  supabase: ReturnType<SupabaseClient['schema']>,
  containerIds: string[],
): Promise<Map<string, number> | null> {
  if (containerIds.length === 0) return new Map()
  const { data, error } = await supabase
    .from('container_commitments')
    .select('container_id,cbm,status')
    .in('container_id', containerIds)
    .in('status', ['RESERVED', 'CONFIRMED', 'LOADED'])
  if (error) return null

  const byId = new Map<string, number>()
  for (const row of (data ?? []) as { container_id: string; cbm: number | string; status: string }[]) {
    const cbm = toNumber(row.cbm)
    byId.set(row.container_id, (byId.get(row.container_id) ?? 0) + cbm)
  }
  return byId
}

// ── Zod input schemas ────────────────────────────────────────────────────────

const routeSchema = z
  .object({
    origin: z.string().trim().min(1).optional(),
    destination: z.string().trim().min(1).optional(),
    etd: z.string().optional(),
    eta: z.string().optional(),
  })
  .default({})

const openContainerInputSchema = z.object({
  kind: z.enum(CONTAINER_KINDS).default('40HC'),
  capacityCbm: z.number().positive(),
  mode: z.enum(CONTAINER_MODES).default('DEDICATED'),
  route: routeSchema,
  publicFillVisible: z.boolean().default(true),
})
export type OpenContainerInput = z.input<typeof openContainerInputSchema>

const listContainersInputSchema = z.object({
  laneId: z.string().uuid().optional(),
  status: z.enum(CONTAINER_STATUSES).optional(),
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(200).default(50),
})
export type ListContainersInput = z.input<typeof listContainersInputSchema>

export interface ContainerListPage {
  rows: ContainerRow[]
  nextCursor: string | null
}

// ── Reads ────────────────────────────────────────────────────────────────────

export async function listContainers(input: ListContainersInput): Promise<ActionResult<ContainerListPage>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = listContainersInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Filtros inválidos / Invalid filters', parsed.error.flatten().fieldErrors)
  }
  const { laneId, status, limit } = parsed.data
  const cursor = decodeContainerCursor(parsed.data.cursor)

  let query = supabase
    .from('containers')
    .select(CONTAINER_SELECT_COLS)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1)

  if (laneId) query = query.eq('lane_id', laneId)
  if (status) query = query.eq('status', status)
  if (cursor) {
    query = query.or(`created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`)
  }

  const { data, error } = await query
  if (error) return fail('VALIDATION', 'No se pudo listar contenedores / Could not list containers')

  const rows = (data ?? []) as unknown as RawContainerRow[]
  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows

  const committed = await committedCbmByContainerId(
    supabase,
    page.map((r) => r.id),
  )
  if (committed === null) return fail('VALIDATION', 'No se pudo calcular el llenado / Could not compute fill state')

  const mapped = page.map((r) => mapContainerRow(r, committed.get(r.id) ?? 0))
  const last = page[page.length - 1]
  const nextCursor = hasMore && last ? encodeContainerCursor({ createdAt: last.created_at, id: last.id }) : null

  return ok({ rows: mapped, nextCursor })
}

export async function getContainer(id: string): Promise<ActionResult<ContainerRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(id)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await supabase
    .from('containers')
    .select(CONTAINER_SELECT_COLS)
    .eq('id', parsed.data)
    .maybeSingle()
  if (error) return fail('VALIDATION', 'No se pudo leer el contenedor / Could not read container')
  if (!data) return fail('FORBIDDEN_LANE', 'Contenedor no encontrado o sin acceso / Container not found or no access')

  const committed = await committedCbmByContainerId(supabase, [parsed.data])
  if (committed === null) return fail('VALIDATION', 'No se pudo calcular el llenado / Could not compute fill state')

  return ok(mapContainerRow(data as unknown as RawContainerRow, committed.get(parsed.data) ?? 0))
}

export async function listCommitments(containerId: string): Promise<ActionResult<ContainerCommitmentRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(containerId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await supabase
    .from('container_commitments')
    .select('id,container_id,order_id,account_id,cbm,status,created_at,accounts(name)')
    .eq('container_id', parsed.data)
    .order('created_at', { ascending: false })

  if (error) return fail('VALIDATION', 'No se pudieron listar los compromisos / Could not list commitments')

  return ok((data ?? []).map((r) => mapCommitmentRow(r as unknown as RawCommitmentRow)))
}

export async function listPurchaseOrders(containerId: string): Promise<ActionResult<PurchaseOrderRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(containerId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await supabase
    .from('purchase_orders')
    .select('id,container_id,supplier_id,lane_id,lines,total_minor,currency,status,suppliers(name)')
    .eq('container_id', parsed.data)

  if (error) return fail('VALIDATION', 'No se pudieron listar las órdenes de compra / Could not list purchase orders')

  return ok((data ?? []).map((r) => mapPurchaseOrderRow(r as unknown as RawPurchaseOrderRow)))
}

export async function listQcChecks(purchaseOrderId: string): Promise<ActionResult<QcCheckRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(purchaseOrderId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await supabase
    .from('qc_checks')
    .select('id,purchase_order_id,checkpoint,result,evidence,checked_by,checked_at')
    .eq('purchase_order_id', parsed.data)
    .order('checked_at', { ascending: false })

  if (error) return fail('VALIDATION', 'No se pudieron listar los checkpoints de QC / Could not list QC checkpoints')

  return ok((data ?? []).map(mapQcCheckRow))
}

export async function listDocuments(containerId: string): Promise<ActionResult<TradeDocumentRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, storage } = gate

  const parsed = uuidSchema.safeParse(containerId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await supabase
    .from('trade_documents')
    .select('id,container_id,order_id,kind,storage_path,uploaded_by,uploaded_at')
    .eq('container_id', parsed.data)
    .order('uploaded_at', { ascending: false })

  if (error) return fail('VALIDATION', 'No se pudieron listar los documentos / Could not list documents')

  const rows = (data ?? []) as {
    id: string
    container_id: string | null
    order_id: string | null
    kind: string
    storage_path: string
    uploaded_by: string | null
    uploaded_at: string
  }[]

  // Private bucket (components/containers/README.md) — a signed read URL is
  // issued per row at request time, never a public path.
  const withUrls: TradeDocumentRow[] = await Promise.all(
    rows.map(async (row) => {
      const { data: signed } = await storage.from(TRADE_DOCUMENTS_BUCKET).createSignedUrl(row.storage_path, 300)
      return {
        id: row.id,
        containerId: row.container_id,
        orderId: row.order_id,
        kind: row.kind,
        storagePath: row.storage_path,
        uploadedBy: row.uploaded_by,
        uploadedAt: row.uploaded_at,
        signedUrl: signed?.signedUrl ?? null,
      }
    }),
  )

  return ok(withUrls)
}

export async function getLandedCost(containerId: string): Promise<ActionResult<LandedCostRow | null>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(containerId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await supabase
    .from('landed_costs')
    .select('container_id,fob_minor,freight_minor,insurance_minor,duties_minor,handling_minor,currency,computed_at')
    .eq('container_id', parsed.data)
    .maybeSingle()

  if (error) return fail('VALIDATION', 'No se pudo leer el costo de aterrizaje / Could not read landed cost')
  if (!data) return ok(null)

  return ok(mapLandedCostRow(data))
}

/** Lanes the user has ANY membership in (read scope is broader than write —
 * VIEWER/SALES/CATALOG_EDITOR can all see Container Desk read-only per the
 * proposed RLS read policy). Group admins see every lane. Mirrors
 * catalog.ts's `listEditableLanes` shape but without the write-role filter. */
export async function listContainerLanes(): Promise<
  ActionResult<{ laneId: string; laneCode: string; laneSlug: string; laneName: string; brandId: string }[]>
> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const { data: profile } = await supabase.from('profiles').select('is_group_admin').eq('id', user.id).maybeSingle()

  if ((profile as { is_group_admin?: boolean } | null)?.is_group_admin) {
    const { data, error } = await supabase.from('lanes').select('id,code,slug,name,brand_id').neq('status', 'ARCHIVED')
    if (error) return fail('VALIDATION', 'No se pudieron listar las lanes / Could not list lanes')
    return ok(
      (data ?? []).map((l: { id: string; code: string; slug: string; name: string; brand_id: string }) => ({
        laneId: l.id,
        laneCode: l.code,
        laneSlug: l.slug,
        laneName: l.name,
        brandId: l.brand_id,
      })),
    )
  }

  const { data, error } = await supabase
    .from('lane_memberships')
    .select('lanes(id,code,slug,name,brand_id)')
    .eq('user_id', user.id)

  if (error) return fail('VALIDATION', 'No se pudieron listar las lanes / Could not list lanes')

  const byLaneId = new Map<string, { laneId: string; laneCode: string; laneSlug: string; laneName: string; brandId: string }>()
  for (const row of (data ?? []) as unknown as {
    lanes: { id: string; code: string; slug: string; name: string; brand_id: string } | null
  }[]) {
    if (!row.lanes) continue
    byLaneId.set(row.lanes.id, {
      laneId: row.lanes.id,
      laneCode: row.lanes.code,
      laneSlug: row.lanes.slug,
      laneName: row.lanes.name,
      brandId: row.lanes.brand_id,
    })
  }
  return ok([...byLaneId.values()])
}

export async function getContainerCapabilities(laneId: string): Promise<ActionResult<ContainerCapabilities>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const parsed = uuidSchema.safeParse(laneId)
  if (!parsed.success) return fail('VALIDATION', 'Lane inválida / Invalid lane')

  const [{ data: profile }, { data: memberships, error }] = await Promise.all([
    supabase.from('profiles').select('is_group_admin').eq('id', user.id).maybeSingle(),
    supabase.from('lane_memberships').select('role').eq('user_id', user.id).eq('lane_id', parsed.data),
  ])
  if (error) return fail('VALIDATION', 'No se pudo resolver permisos / Could not resolve permissions')

  const roles = (memberships ?? []).map((m: { role: string }) => m.role as DbLaneRole)
  const isGroupAdmin = Boolean((profile as { is_group_admin?: boolean } | null)?.is_group_admin)

  return ok(computeContainerCapabilities(roles, isGroupAdmin))
}

// ── Mutations ────────────────────────────────────────────────────────────────

export async function openContainer(laneId: string, input: OpenContainerInput): Promise<ActionResult<ContainerRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const laneParsed = uuidSchema.safeParse(laneId)
  if (!laneParsed.success) return fail('VALIDATION', 'Lane inválida / Invalid lane')

  const parsed = openContainerInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  const { data: lane, error: laneError } = await supabase
    .from('lanes')
    .select('id,code,brand_id')
    .eq('id', laneParsed.data)
    .maybeSingle()
  if (laneError) return fail('VALIDATION', 'No se pudo leer la lane / Could not read lane')
  if (!lane) return fail('FORBIDDEN_LANE', 'Lane no encontrada o sin acceso / Lane not found or no access')
  const laneRow = lane as { id: string; code: string; brand_id: string }

  // Append-only code issuance (CLAUDE.md Directive 4): count every container
  // ever issued for the lane (any status) — codes are never reused, so a
  // `count` (not `max`) over all rows is the correct, race-tolerant-enough
  // sequence source given codes only need to be unique, not gap-free.
  const { count, error: countError } = await supabase
    .from('containers')
    .select('id', { count: 'exact', head: true })
    .eq('lane_id', laneRow.id)
  if (countError) return fail('VALIDATION', 'No se pudo generar el código / Could not generate the container code')

  const code = computeNextContainerCode(laneRow.code, count ?? 0)

  const { data, error } = await supabase
    .from('containers')
    .insert({
      brand_id: laneRow.brand_id,
      lane_id: laneRow.id,
      code,
      kind: parsed.data.kind,
      capacity_cbm: parsed.data.capacityCbm,
      mode: parsed.data.mode,
      route: parsed.data.route,
      public_fill_visible: parsed.data.publicFillVisible,
    })
    .select(CONTAINER_SELECT_COLS)
    .single()

  if (error) {
    if (error.code === '23505') {
      return fail('VALIDATION', 'Código de contenedor duplicado — reintenta / Duplicate container code — retry', {
        code: ['duplicate'],
      })
    }
    return fail('FORBIDDEN_LANE', 'No se pudo abrir el contenedor / Could not open container')
  }

  return ok(mapContainerRow(data as unknown as RawContainerRow, 0))
}

const transitionInputSchema = z.object({ id: uuidSchema, status: z.enum(CONTAINER_STATUSES) })

export async function transitionContainer(id: string, status: string): Promise<ActionResult<ContainerRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = transitionInputSchema.safeParse({ id, status })
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const { data: current, error: currentError } = await supabase
    .from('containers')
    .select('status')
    .eq('id', parsed.data.id)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer el contenedor / Could not read container')
  if (!current) return fail('FORBIDDEN_LANE', 'Contenedor no encontrado o sin acceso / Container not found or no access')

  if (!canTransitionContainerStatus((current as { status: string }).status as ContainerStatus, parsed.data.status)) {
    return fail('STAGE_INVALID', 'Transición de estado inválida / Invalid status transition')
  }

  const { data, error } = await supabase
    .from('containers')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)
    .select(CONTAINER_SELECT_COLS)
    .single()

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo cambiar el estado / Could not change status')

  const committed = await committedCbmByContainerId(supabase, [parsed.data.id])
  return ok(mapContainerRow(data as unknown as RawContainerRow, committed?.get(parsed.data.id) ?? 0))
}

const commitCbmInputSchema = z.object({
  orderId: z.string().uuid().nullable().optional(),
  accountId: z.string().uuid(),
  cbm: z.number().positive(),
})
export type CommitCbmInput = z.input<typeof commitCbmInputSchema>

/**
 * Commits CBM against a container via the atomic `tower.commit_container_cbm`
 * SQL function (migration/wave3-container.sql) — NOT a plain insert. The
 * function row-locks the container, sums existing RESERVED/CONFIRMED/LOADED
 * commitments, and raises if `committed + cbm > capacity_cbm`; that's the one
 * check that must happen under a lock so two concurrent commits can't both
 * read a stale sum and both pass (API_MAP: "rejects over-capacity atomically
 * (SQL check)").
 */
export async function commitCbm(containerId: string, input: CommitCbmInput): Promise<ActionResult<ContainerCommitmentRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const containerParsed = uuidSchema.safeParse(containerId)
  if (!containerParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const parsed = commitCbmInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  const { data, error } = await supabase.rpc('commit_container_cbm', {
    p_container: containerParsed.data,
    p_order: parsed.data.orderId ?? null,
    p_account: parsed.data.accountId,
    p_cbm: parsed.data.cbm,
  })

  if (error) {
    // The SQL function raises a bare message ('CAPACITY_EXCEEDED',
    // 'FORBIDDEN_LANE', 'CONTAINER_NOT_FOUND', 'INVALID_CBM') — see the
    // migration file's RAISE EXCEPTION calls. Map the two API_MAP-known codes
    // explicitly; anything else (e.g. the function not yet applied) is a
    // generic VALIDATION failure, never a leaked raw DB error.
    const message = error.message ?? ''
    if (message.includes('CAPACITY_EXCEEDED')) {
      return fail('CAPACITY_EXCEEDED', 'Capacidad del contenedor excedida / Container capacity exceeded')
    }
    if (message.includes('FORBIDDEN_LANE')) {
      return fail('FORBIDDEN_LANE', 'Sin permiso para comprometer CBM en esta lane / No permission to commit CBM on this lane')
    }
    return fail('VALIDATION', 'No se pudo comprometer el CBM / Could not commit CBM')
  }

  return ok(mapCommitmentRow(data as unknown as RawCommitmentRow))
}

const issuePoLinesSchema = z.array(z.record(z.unknown())).min(1)

const issuePoInputSchema = z.object({
  supplierId: z.string().uuid(),
  laneId: z.string().uuid(),
  lines: issuePoLinesSchema,
  totalMinor: z.number().int().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/, 'ISO-4217 code').default('USD'),
})
export type IssuePoInput = z.input<typeof issuePoInputSchema>

export async function issuePO(containerId: string, input: IssuePoInput): Promise<ActionResult<PurchaseOrderRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const containerParsed = uuidSchema.safeParse(containerId)
  if (!containerParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const parsed = issuePoInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  const { data, error } = await supabase
    .from('purchase_orders')
    .insert({
      container_id: containerParsed.data,
      supplier_id: parsed.data.supplierId,
      lane_id: parsed.data.laneId,
      lines: parsed.data.lines,
      total_minor: parsed.data.totalMinor,
      currency: parsed.data.currency,
    })
    .select('id,container_id,supplier_id,lane_id,lines,total_minor,currency,status,suppliers(name)')
    .single()

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo emitir la orden de compra / Could not issue purchase order')

  return ok(mapPurchaseOrderRow(data as unknown as RawPurchaseOrderRow))
}

const advancePoInputSchema = z.object({ id: uuidSchema, status: z.enum(PO_STATUSES) })

export async function advancePOStatus(poId: string, status: string): Promise<ActionResult<PurchaseOrderRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = advancePoInputSchema.safeParse({ id: poId, status })
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const { data: current, error: currentError } = await supabase
    .from('purchase_orders')
    .select('status')
    .eq('id', parsed.data.id)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer la orden de compra / Could not read purchase order')
  if (!current) return fail('FORBIDDEN_LANE', 'Orden no encontrada o sin acceso / Order not found or no access')

  if (!canAdvancePoStatus((current as { status: string }).status as PoStatus, parsed.data.status)) {
    return fail('STAGE_INVALID', 'Transición de estado inválida / Invalid status transition')
  }

  const { data, error } = await supabase
    .from('purchase_orders')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)
    .select('id,container_id,supplier_id,lane_id,lines,total_minor,currency,status,suppliers(name)')
    .single()

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo actualizar la orden de compra / Could not update purchase order')

  return ok(mapPurchaseOrderRow(data as unknown as RawPurchaseOrderRow))
}

const recordQcInputSchema = z.object({
  checkpoint: z.string().trim().min(1).max(120),
  result: z.enum(QC_RESULTS),
  evidence: z.array(z.string()).default([]),
})
export type RecordQcInput = z.input<typeof recordQcInputSchema>

export async function recordQC(purchaseOrderId: string, input: RecordQcInput): Promise<ActionResult<QcCheckRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const poParsed = uuidSchema.safeParse(purchaseOrderId)
  if (!poParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const parsed = recordQcInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  const { data, error } = await supabase
    .from('qc_checks')
    .insert({
      purchase_order_id: poParsed.data,
      checkpoint: parsed.data.checkpoint,
      result: parsed.data.result,
      evidence: parsed.data.evidence,
      checked_by: user.id,
      checked_at: new Date().toISOString(),
    })
    .select('id,purchase_order_id,checkpoint,result,evidence,checked_by,checked_at')
    .single()

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo registrar el checkpoint de QC / Could not record QC checkpoint')

  return ok(mapQcCheckRow(data))
}

const createDocumentUploadInputSchema = z.object({
  kind: z.enum(DOCUMENT_KINDS),
  fileName: z.string().trim().min(1).max(200),
})

export interface DocumentUploadTicket {
  path: string
  token: string
  signedUrl: string
  bucket: string
}

/** Mirrors media.ts's `createMediaUploadUrl` — signed upload URL for the
 * private `trade-documents` bucket (components/containers/README.md). */
export async function createDocumentUploadUrl(
  containerId: string,
  input: z.input<typeof createDocumentUploadInputSchema>,
): Promise<ActionResult<DocumentUploadTicket>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, storage } = gate

  const idParsed = uuidSchema.safeParse(containerId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de contenedor inválido / Invalid container id')

  const parsed = createDocumentUploadInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  const { data: containerRow, error: containerError } = await supabase
    .from('containers')
    .select('code, lanes(slug), brands(slug)')
    .eq('id', idParsed.data)
    .maybeSingle()
  if (containerError || !containerRow) {
    return fail('FORBIDDEN_LANE', 'Contenedor no encontrado o sin acceso / Container not found or no access')
  }

  const row = containerRow as unknown as {
    code: string
    lanes: { slug: string } | { slug: string }[] | null
    brands: { slug: string } | { slug: string }[] | null
  }
  const laneJoin = Array.isArray(row.lanes) ? row.lanes[0] : row.lanes
  const brandJoin = Array.isArray(row.brands) ? row.brands[0] : row.brands

  const path = buildTradeDocumentStoragePath({
    brandSlug: brandJoin?.slug ?? 'unknown',
    laneSlug: laneJoin?.slug ?? 'unknown',
    containerCode: row.code,
    kind: parsed.data.kind,
    fileName: parsed.data.fileName,
  })

  const { data, error } = await storage.from(TRADE_DOCUMENTS_BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    return fail('VALIDATION', 'No se pudo generar la URL de carga / Could not create the upload URL')
  }

  return ok({ path: data.path, token: data.token, signedUrl: data.signedUrl, bucket: TRADE_DOCUMENTS_BUCKET })
}

const attachDocumentInputSchema = z.object({
  kind: z.enum(DOCUMENT_KINDS),
  storagePath: z.string().min(1),
  orderId: z.string().uuid().nullable().optional(),
})
export type AttachDocumentInput = z.input<typeof attachDocumentInputSchema>

export async function attachDocument(containerId: string, input: AttachDocumentInput): Promise<ActionResult<true>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const idParsed = uuidSchema.safeParse(containerId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de contenedor inválido / Invalid container id')

  const parsed = attachDocumentInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  const { error } = await supabase.from('trade_documents').insert({
    container_id: idParsed.data,
    order_id: parsed.data.orderId ?? null,
    kind: parsed.data.kind,
    storage_path: parsed.data.storagePath,
    uploaded_by: user.id,
  })

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo adjuntar el documento / Could not attach document')

  return ok(true as const)
}

const computeLandedCostInputSchema = z.object({
  fobMinor: z.number().int().nonnegative(),
  freightMinor: z.number().int().nonnegative(),
  insuranceMinor: z.number().int().nonnegative(),
  dutiesMinor: z.number().int().nonnegative(),
  handlingMinor: z.number().int().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/, 'ISO-4217 code').default('USD'),
})
export type ComputeLandedCostInput = z.input<typeof computeLandedCostInputSchema>

/** Landed cost is ALWAYS computed server-side (CLAUDE.md/ARCHITECTURE ADR-7).
 * Upserts the single `landed_costs` row for the container. */
export async function computeLandedCost(
  containerId: string,
  input: ComputeLandedCostInput,
): Promise<ActionResult<LandedCostRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const idParsed = uuidSchema.safeParse(containerId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de contenedor inválido / Invalid container id')

  const parsed = computeLandedCostInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  // Total is computed here (server) via containers-logic — never trusted from
  // the client — even though `landed_costs` stores the components, not the
  // total, so a caller can't smuggle in a mismatched total.
  computeLandedCostTotal({ ...parsed.data })

  const { data, error } = await supabase
    .from('landed_costs')
    .upsert(
      {
        container_id: idParsed.data,
        fob_minor: parsed.data.fobMinor,
        freight_minor: parsed.data.freightMinor,
        insurance_minor: parsed.data.insuranceMinor,
        duties_minor: parsed.data.dutiesMinor,
        handling_minor: parsed.data.handlingMinor,
        currency: parsed.data.currency,
        computed_at: new Date().toISOString(),
      },
      { onConflict: 'container_id' },
    )
    .select('container_id,fob_minor,freight_minor,insurance_minor,duties_minor,handling_minor,currency,computed_at')
    .single()

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo calcular el costo de aterrizaje / Could not compute landed cost')

  return ok(mapLandedCostRow(data))
}

// ============================================================
// Entity lookups for the container-desk forms (typeahead pickers).
// The issue-PO and commit forms once took hand-typed UUIDs; these back the
// EntityCombobox instead. Each resolves the container's OWN brand server-side
// (RLS-scoped) so the client never passes a brand id and can't widen scope —
// the picker only ever shows entities the operator may already reach.
// ============================================================

export interface SupplierOption {
  id: string
  name: string
  country: string | null
  verified: boolean
}

export interface AccountOption {
  id: string
  name: string
  country: string | null
}

export interface OrderOption {
  id: string
  status: string
  incoterm: string | null
  accountName: string | null
  createdAt: string
}

/** The container's brand id, or null if unreadable/no access (RLS-scoped). */
async function containerBrandId(
  supabase: ReturnType<SupabaseClient['schema']>,
  containerId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('containers')
    .select('brand_id')
    .eq('id', containerId)
    .maybeSingle()
  if (error || !data) return null
  return (data as { brand_id: string }).brand_id
}

/** Suppliers registered under the container's brand, A→Z (typeahead source). */
export async function listSuppliersForContainer(containerId: string): Promise<ActionResult<SupplierOption[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(containerId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const brandId = await containerBrandId(supabase, parsed.data)
  if (!brandId) return fail('FORBIDDEN_LANE', 'Contenedor no encontrado o sin acceso / Container not found or no access')

  const { data, error } = await supabase
    .from('suppliers')
    .select('id,name,country,verified')
    .eq('brand_id', brandId)
    .order('name', { ascending: true })
    .limit(200)

  if (error) return fail('VALIDATION', 'No se pudieron listar los proveedores / Could not list suppliers')
  return ok((data ?? []) as SupplierOption[])
}

/** Accounts under the container's brand, A→Z (commit form's account picker). */
export async function listAccountsForContainer(containerId: string): Promise<ActionResult<AccountOption[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(containerId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const brandId = await containerBrandId(supabase, parsed.data)
  if (!brandId) return fail('FORBIDDEN_LANE', 'Contenedor no encontrado o sin acceso / Container not found or no access')

  const { data, error } = await supabase
    .from('accounts')
    .select('id,name,country')
    .eq('brand_id', brandId)
    .order('name', { ascending: true })
    .limit(200)

  if (error) return fail('VALIDATION', 'No se pudieron listar las cuentas / Could not list accounts')
  return ok((data ?? []) as AccountOption[])
}

/**
 * Orders under the container's brand — optionally narrowed to one account (the
 * commit form scopes orders to the chosen account, since an order belongs to an
 * account). Orders carry no human name, so the account name + status + date
 * compose the label client-side. Newest first.
 */
export async function listOrdersForContainer(
  containerId: string,
  accountId?: string,
): Promise<ActionResult<OrderOption[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(containerId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const brandId = await containerBrandId(supabase, parsed.data)
  if (!brandId) return fail('FORBIDDEN_LANE', 'Contenedor no encontrado o sin acceso / Container not found or no access')

  let q = supabase
    .from('orders')
    .select('id,status,incoterm,created_at,accounts(name)')
    .eq('brand_id', brandId)

  if (accountId) {
    const accParsed = uuidSchema.safeParse(accountId)
    if (!accParsed.success) return fail('VALIDATION', 'Cuenta inválida / Invalid account')
    q = q.eq('account_id', accParsed.data)
  }

  const { data, error } = await q.order('created_at', { ascending: false }).limit(100)

  if (error) return fail('VALIDATION', 'No se pudieron listar las órdenes / Could not list orders')

  const rows = (data ?? []).map((raw) => {
    const r = raw as { id: string; status: string; incoterm: string | null; created_at: string; accounts: { name: string } | { name: string }[] | null }
    const acc = Array.isArray(r.accounts) ? r.accounts[0] : r.accounts
    return {
      id: r.id,
      status: r.status,
      incoterm: r.incoterm,
      accountName: acc?.name ?? null,
      createdAt: r.created_at,
    } satisfies OrderOption
  })

  return ok(rows)
}
