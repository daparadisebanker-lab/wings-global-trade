'use server'

// src/lib/actions/pipeline.ts
// Pipeline (CRM) mutations — API_MAP "Pipeline" domain: RFQs, line items,
// quotes, and RFQ → order conversion. Every action follows the mutation law:
// auth → Zod parse → RLS-scoped query (result.ts). RLS (tower.rfqs/quotes/
// orders policies — "SALES + LANE_DIRECTOR write", DATABASE_SCHEMA.sql) is the
// only permission boundary; this file never gates with `if (role === …)` —
// see pipeline-logic.ts#computePipelineCapabilities for the presentation-only
// capability derivation PipelineBoard/RfqDetail read.
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fail, ok, type ActionResult } from './result'
import { isValidStage, isValidUnit, type Archetype } from '@/lib/archetypes'
import { getConversation, type Conversation } from '@/lib/conversations'
import type { EditableLane } from './catalog'
import {
  computePipelineCapabilities,
  computeQuoteLines,
  computeQuoteTotal,
  canConvertToOrder as statusCanConvertToOrder,
  canMarkQuoteStatus as statusCanMarkQuoteStatus,
  canSendQuote as statusCanSendQuote,
  defaultStageFor,
  nextQuoteVersion,
  type DbLaneRole,
  type OrderStatus,
  type PipelineCapabilities,
  type QuoteLineComputed,
  type QuoteLineInput,
  type QuoteStatus,
} from './pipeline-logic'

// Re-export the capabilities type so client components import it from the action
// module they already depend on (QuoteComposer, RfqDetail).
export type { PipelineCapabilities } from './pipeline-logic'

const uuidSchema = z.string().uuid()

// ── Row shapes ───────────────────────────────────────────────────────────────

export type RfqSource = 'MISTER' | 'RFQ_FORM' | 'WHATSAPP' | 'MANUAL' | 'ADVISOR'
const RFQ_SOURCES: RfqSource[] = ['MISTER', 'RFQ_FORM', 'WHATSAPP', 'MANUAL', 'ADVISOR']

export interface RfqRow {
  id: string
  brandId: string
  laneId: string
  laneSlug: string
  laneArchetype: Archetype
  accountId: string | null
  accountName: string | null
  source: RfqSource
  stage: string
  ownerId: string | null
  misterSessionId: string | null
  currency: string
  createdAt: string
}

export interface RfqLineRow {
  id: string
  rfqId: string
  productId: string | null
  productName: { es: string; en: string } | null
  description: string | null
  qty: number
  unit: string
  targetPriceMinor: number | null
  currency: string
}

export interface QuoteRow {
  id: string
  rfqId: string
  version: number
  lines: QuoteLineComputed[]
  totalMinor: number
  currency: string
  status: QuoteStatus
  validUntil: string | null
  createdBy: string | null
  createdAt: string
}

export interface OrderRow {
  id: string
  quoteId: string
  brandId: string
  laneId: string
  accountId: string
  status: OrderStatus
  incoterm: string | null
  createdAt: string
}

export interface AccountOption {
  id: string
  name: string
  country: string | null
  region: string | null
}

interface RawLaneJoin {
  slug: string
  archetype: string
}
interface RawAccountJoin {
  name: string
}
interface RawProductJoin {
  name: { es: string; en: string }
}

interface RawRfqRow {
  id: string
  brand_id: string
  lane_id: string
  account_id: string | null
  source: string
  stage: string
  owner_id: string | null
  mister_session_id: string | null
  currency: string
  created_at: string
  lanes: RawLaneJoin | RawLaneJoin[] | null
  accounts: RawAccountJoin | RawAccountJoin[] | null
}

interface RawRfqLineRow {
  id: string
  rfq_id: string
  product_id: string | null
  description: string | null
  qty: number | string
  unit: string
  target_price_minor: number | string | null
  currency: string
  products: RawProductJoin | RawProductJoin[] | null
}

interface RawQuoteRow {
  id: string
  rfq_id: string
  version: number
  lines: unknown
  total_minor: number | string
  currency: string
  status: string
  valid_until: string | null
  created_by: string | null
  created_at: string
}

interface RawOrderRow {
  id: string
  quote_id: string
  brand_id: string
  lane_id: string
  account_id: string
  status: string
  incoterm: string | null
  created_at: string
}

function firstOf<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v
}

function toNumber(v: number | string | null | undefined): number {
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? (n as number) : 0
}

function toNumberOrNull(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null
  return toNumber(v)
}

const RFQ_SELECT_COLS =
  'id,brand_id,lane_id,account_id,source,stage,owner_id,mister_session_id,currency,created_at,lanes(slug,archetype),accounts(name)'

function mapRfqRow(row: RawRfqRow): RfqRow {
  const lane = firstOf(row.lanes)
  const account = firstOf(row.accounts)
  return {
    id: row.id,
    brandId: row.brand_id,
    laneId: row.lane_id,
    laneSlug: lane?.slug ?? '',
    laneArchetype: (lane?.archetype as Archetype) ?? 'EQUIPMENT',
    accountId: row.account_id,
    accountName: account?.name ?? null,
    source: (RFQ_SOURCES.includes(row.source as RfqSource) ? row.source : 'MANUAL') as RfqSource,
    stage: row.stage,
    ownerId: row.owner_id,
    misterSessionId: row.mister_session_id,
    currency: row.currency,
    createdAt: row.created_at,
  }
}

const RFQ_LINE_SELECT_COLS = 'id,rfq_id,product_id,description,qty,unit,target_price_minor,currency,products(name)'

function mapRfqLineRow(row: RawRfqLineRow): RfqLineRow {
  const product = firstOf(row.products)
  return {
    id: row.id,
    rfqId: row.rfq_id,
    productId: row.product_id,
    productName: product?.name ?? null,
    description: row.description,
    qty: toNumber(row.qty),
    unit: row.unit,
    targetPriceMinor: toNumberOrNull(row.target_price_minor),
    currency: row.currency,
  }
}

function mapQuoteRow(row: RawQuoteRow): QuoteRow {
  return {
    id: row.id,
    rfqId: row.rfq_id,
    version: row.version,
    lines: Array.isArray(row.lines) ? (row.lines as QuoteLineComputed[]) : [],
    totalMinor: toNumber(row.total_minor),
    currency: row.currency,
    status: row.status as QuoteStatus,
    validUntil: row.valid_until,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

function mapOrderRow(row: RawOrderRow): OrderRow {
  return {
    id: row.id,
    quoteId: row.quote_id,
    brandId: row.brand_id,
    laneId: row.lane_id,
    accountId: row.account_id,
    status: row.status as OrderStatus,
    incoterm: row.incoterm,
    createdAt: row.created_at,
  }
}

/** Mirrors catalog.ts's private `mapLaneRow` (same `lanes` row shape) —
 * kept local rather than importing a non-exported helper from a sibling
 * 'use server' module. */
function mapLaneRow(row: { id: string; code: string; slug: string; name: string; archetype: string; brand_id: string }): EditableLane {
  return {
    laneId: row.id,
    laneCode: row.code,
    laneSlug: row.slug,
    laneName: row.name,
    archetype: row.archetype as Archetype,
    brandId: row.brand_id,
  }
}

// ── Zod input schemas ────────────────────────────────────────────────────────

const createRfqInputSchema = z.object({
  accountId: z.string().uuid().nullable().optional(),
  source: z.enum(['MISTER', 'RFQ_FORM', 'WHATSAPP', 'MANUAL', 'ADVISOR']).default('MANUAL'),
  currency: z.string().regex(/^[A-Z]{3}$/, 'ISO-4217 code').default('USD'),
})
export type CreateRfqInput = z.input<typeof createRfqInputSchema>

const listRfqsInputSchema = z.object({
  laneId: uuidSchema,
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(500).default(200),
})
export type ListRfqsInput = z.input<typeof listRfqsInputSchema>

const lineInputSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid().nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
  qty: z.number().positive(),
  unit: z.string().min(1),
  targetPriceMinor: z.number().int().nullable().optional(),
  currency: z.string().regex(/^[A-Z]{3}$/).default('USD'),
})
export type RfqLineInput = z.input<typeof lineInputSchema>

const quoteLineInputSchema = z.object({
  rfqLineId: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1).max(500),
  unitId: z.string().min(1),
  quantity: z.number().positive(),
  unitPriceMinor: z.number().int().nonnegative(),
  cbmPerUnit: z.number().nonnegative().optional(),
})
export type QuoteLineDraft = z.input<typeof quoteLineInputSchema>

// ── Auth helper (mirrors catalog.ts/media.ts) ───────────────────────────────

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

// `supabase` is the RLS-scoped, schema('tower') client from `requireUser()`.
async function loadRfqContext(supabase: ReturnType<SupabaseClient['schema']>, rfqId: string) {
  const { data, error } = await supabase
    .from('rfqs')
    .select('id,brand_id,lane_id,account_id,stage,currency,lanes(archetype)')
    .eq('id', rfqId)
    .maybeSingle()
  if (error) return { found: false as const }
  if (!data) return { found: false as const }
  const row = data as unknown as {
    id: string
    brand_id: string
    lane_id: string
    account_id: string | null
    stage: string
    currency: string
    lanes: { archetype: string } | { archetype: string }[] | null
  }
  const lane = firstOf(row.lanes)
  return {
    found: true as const,
    rfqId: row.id,
    brandId: row.brand_id,
    laneId: row.lane_id,
    accountId: row.account_id,
    stage: row.stage,
    currency: row.currency,
    archetype: (lane?.archetype as Archetype) ?? 'EQUIPMENT',
  }
}

// ── Capabilities ─────────────────────────────────────────────────────────────

export async function getPipelineCapabilities(laneId: string): Promise<ActionResult<PipelineCapabilities>> {
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

  const roles = (memberships ?? []).map((m) => m.role as DbLaneRole)
  const isGroupAdmin = Boolean((profile as { is_group_admin?: boolean } | null)?.is_group_admin)

  return ok(computePipelineCapabilities(roles, isGroupAdmin))
}

/**
 * Lanes the current user can work Pipeline in — mirrors catalog.ts's
 * `listEditableLanes` shape (same `EditableLane` type, re-exported for
 * components) but scoped to the roles that actually get pipeline write
 * (SALES/LANE_DIRECTOR, or group admin), not catalog's CATALOG_EDITOR set.
 * `lib/rbac.ts`'s `ROLE_MODULES` already only shows the Pipeline nav item to
 * SALES/LANE_DIRECTOR — reusing catalog's lane list here would silently hide
 * every lane from a pure SALES rep, so this is intentionally its own query.
 */
export async function listPipelineLanes(): Promise<ActionResult<EditableLane[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const { data: profile } = await supabase.from('profiles').select('is_group_admin').eq('id', user.id).maybeSingle()

  if ((profile as { is_group_admin?: boolean } | null)?.is_group_admin) {
    const { data, error } = await supabase
      .from('lanes')
      .select('id,code,slug,name,archetype,brand_id')
      .neq('status', 'ARCHIVED')
    if (error) return fail('VALIDATION', 'No se pudieron listar las lanes / Could not list lanes')
    return ok((data ?? []).map(mapLaneRow))
  }

  const { data, error } = await supabase
    .from('lane_memberships')
    .select('role, lanes(id,code,slug,name,archetype,brand_id)')
    .eq('user_id', user.id)
    .in('role', ['LANE_DIRECTOR', 'SALES'])

  if (error) return fail('VALIDATION', 'No se pudieron listar las lanes / Could not list lanes')

  const rows = (data ?? []) as unknown as {
    lanes: { id: string; code: string; slug: string; name: string; archetype: string; brand_id: string } | null
  }[]
  const byLaneId = new Map<string, EditableLane>()
  for (const row of rows) {
    if (!row.lanes) continue
    const lane = mapLaneRow(row.lanes)
    byLaneId.set(lane.laneId, lane)
  }
  return ok([...byLaneId.values()])
}

// ── Accounts (minimal picker — full AccountTable is out of this wave's scope) ─

export async function listAccountsForBrand(brandId: string): Promise<ActionResult<AccountOption[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(brandId)
  if (!parsed.success) return fail('VALIDATION', 'Marca inválida / Invalid brand')

  const { data, error } = await supabase
    .from('accounts')
    .select('id,name,country,region')
    .eq('brand_id', parsed.data)
    .order('name', { ascending: true })
    .limit(200)

  if (error) return fail('VALIDATION', 'No se pudieron listar las cuentas / Could not list accounts')

  return ok((data ?? []) as AccountOption[])
}

// ── RFQs ─────────────────────────────────────────────────────────────────────

export async function listRfqs(input: ListRfqsInput): Promise<ActionResult<{ rows: RfqRow[]; nextCursor: string | null }>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = listRfqsInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Filtros inválidos / Invalid filters', parsed.error.flatten().fieldErrors)
  }
  const { laneId, limit } = parsed.data

  // PipelineBoard groups the full lane roster into archetype stage columns
  // client-side, so this fetches one page across all stages rather than
  // paginating per-column — pragmatic for v1 CRM volumes; a true per-column
  // cursor is a Wave-4+ concern if a lane's open RFQ count grows past this.
  const { data, error } = await supabase
    .from('rfqs')
    .select(RFQ_SELECT_COLS)
    .eq('lane_id', laneId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return fail('VALIDATION', 'No se pudo listar el pipeline / Could not list the pipeline')

  const rows = ((data ?? []) as unknown as RawRfqRow[]).map(mapRfqRow)
  return ok({ rows, nextCursor: null })
}

export async function getRfq(id: string): Promise<ActionResult<RfqRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(id)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await supabase.from('rfqs').select(RFQ_SELECT_COLS).eq('id', parsed.data).maybeSingle()
  if (error) return fail('VALIDATION', 'No se pudo leer el RFQ / Could not read the RFQ')
  if (!data) return fail('FORBIDDEN_LANE', 'RFQ no encontrado o sin acceso / RFQ not found or no access')

  return ok(mapRfqRow(data as unknown as RawRfqRow))
}

export async function createRFQ(laneId: string, input: CreateRfqInput): Promise<ActionResult<RfqRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const laneParsed = uuidSchema.safeParse(laneId)
  if (!laneParsed.success) return fail('VALIDATION', 'Lane inválida / Invalid lane')

  const parsed = createRfqInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', { lines: parsed.error.issues.map((i) => i.message) })
  }

  const { data: lane, error: laneError } = await supabase
    .from('lanes')
    .select('id,brand_id,archetype')
    .eq('id', laneParsed.data)
    .maybeSingle()
  if (laneError) return fail('VALIDATION', 'No se pudo leer la lane / Could not read lane')
  if (!lane) return fail('FORBIDDEN_LANE', 'Lane no encontrada o sin acceso / Lane not found or no access')

  const laneRow = lane as { id: string; brand_id: string; archetype: string }
  const stage = defaultStageFor(laneRow.archetype as Archetype)

  const { data, error } = await supabase
    .from('rfqs')
    .insert({
      brand_id: laneRow.brand_id,
      lane_id: laneRow.id,
      account_id: parsed.data.accountId ?? null,
      source: parsed.data.source,
      stage,
      currency: parsed.data.currency,
    })
    .select(RFQ_SELECT_COLS)
    .single()

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo crear el RFQ / Could not create the RFQ')

  return ok(mapRfqRow(data as unknown as RawRfqRow))
}

const updateStageInputSchema = z.object({ id: uuidSchema, stage: z.string().min(1) })

export async function updateStage(id: string, stage: string): Promise<ActionResult<RfqRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = updateStageInputSchema.safeParse({ id, stage })
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const context = await loadRfqContext(supabase, parsed.data.id)
  if (!context.found) return fail('FORBIDDEN_LANE', 'RFQ no encontrado o sin acceso / RFQ not found or no access')

  if (!isValidStage(context.archetype, parsed.data.stage)) {
    return fail(
      'STAGE_INVALID',
      `Etapa inválida para el arquetipo ${context.archetype} / Invalid stage for archetype ${context.archetype}`,
    )
  }

  const { data, error } = await supabase
    .from('rfqs')
    .update({ stage: parsed.data.stage })
    .eq('id', parsed.data.id)
    .select(RFQ_SELECT_COLS)
    .single()

  if (error) {
    // DB backstop (migration tower_39 rfq_stage_guard) — mirrors the isValidStage
    // archetype-membership check above.
    if ((error.message ?? '').includes('RFQ_STAGE_INVALID')) {
      return fail('STAGE_INVALID', `Etapa inválida para el arquetipo ${context.archetype} / Invalid stage for archetype ${context.archetype}`)
    }
    return fail('FORBIDDEN_LANE', 'No se pudo actualizar la etapa / Could not update the stage')
  }

  return ok(mapRfqRow(data as unknown as RawRfqRow))
}

// ── Line items ───────────────────────────────────────────────────────────────

export async function listLines(rfqId: string): Promise<ActionResult<RfqLineRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(rfqId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await supabase
    .from('rfq_lines')
    .select(RFQ_LINE_SELECT_COLS)
    .eq('rfq_id', parsed.data)

  if (error) return fail('VALIDATION', 'No se pudieron listar las líneas / Could not list line items')

  return ok(((data ?? []) as unknown as RawRfqLineRow[]).map(mapRfqLineRow))
}

/**
 * Full-sync upsert (API_MAP `upsertLines(rfqId, lines[])`): lines carrying an
 * `id` are updated, lines without one are inserted, and any existing line not
 * present in `lines` is deleted — the caller always submits the RFQ's
 * complete, desired line set. Every line's `unit` must be valid for the lane's
 * archetype (CLAUDE.md Directive 2) — rejected wholesale as VALIDATION rather
 * than silently dropping the bad line.
 */
export async function upsertLines(rfqId: string, lines: RfqLineInput[]): Promise<ActionResult<RfqLineRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const rfqParsed = uuidSchema.safeParse(rfqId)
  if (!rfqParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const parsed = z.array(lineInputSchema).max(200).safeParse(lines)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', { lines: parsed.error.issues.map((i) => i.message) })
  }

  const context = await loadRfqContext(supabase, rfqParsed.data)
  if (!context.found) return fail('FORBIDDEN_LANE', 'RFQ no encontrado o sin acceso / RFQ not found or no access')

  const invalidUnit = parsed.data.find((l) => !isValidUnit(context.archetype, l.unit))
  if (invalidUnit) {
    return fail(
      'VALIDATION',
      `Unidad "${invalidUnit.unit}" no válida para el arquetipo ${context.archetype} / Unit "${invalidUnit.unit}" is not valid for archetype ${context.archetype}`,
      { unit: [invalidUnit.unit] },
    )
  }

  const { data: existingRows, error: existingError } = await supabase
    .from('rfq_lines')
    .select('id')
    .eq('rfq_id', rfqParsed.data)
  if (existingError) return fail('VALIDATION', 'No se pudieron leer las líneas / Could not read existing lines')

  const existingIds = new Set(((existingRows ?? []) as { id: string }[]).map((r) => r.id))
  const keepIds = new Set(parsed.data.filter((l) => l.id).map((l) => l.id as string))
  const staleIds = [...existingIds].filter((id) => !keepIds.has(id))

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase.from('rfq_lines').delete().in('id', staleIds)
    if (deleteError) return fail('FORBIDDEN_LANE', 'No se pudieron eliminar líneas / Could not remove line items')
  }

  for (const line of parsed.data) {
    const payload = {
      rfq_id: rfqParsed.data,
      product_id: line.productId ?? null,
      description: line.description ?? null,
      qty: line.qty,
      unit: line.unit,
      target_price_minor: line.targetPriceMinor ?? null,
      currency: line.currency,
    }
    if (line.id) {
      const { error } = await supabase.from('rfq_lines').update(payload).eq('id', line.id)
      if (error) return fail('FORBIDDEN_LANE', 'No se pudo actualizar una línea / Could not update a line item')
    } else {
      const { error } = await supabase.from('rfq_lines').insert(payload)
      if (error) return fail('FORBIDDEN_LANE', 'No se pudo crear una línea / Could not create a line item')
    }
  }

  const { data: refreshed, error: refreshedError } = await supabase
    .from('rfq_lines')
    .select(RFQ_LINE_SELECT_COLS)
    .eq('rfq_id', rfqParsed.data)
  if (refreshedError) return fail('VALIDATION', 'No se pudieron releer las líneas / Could not re-read line items')

  return ok(((refreshed ?? []) as unknown as RawRfqLineRow[]).map(mapRfqLineRow))
}

// ── Quotes ───────────────────────────────────────────────────────────────────

export async function listQuotes(rfqId: string): Promise<ActionResult<QuoteRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(rfqId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await supabase
    .from('quotes')
    .select('id,rfq_id,version,lines,total_minor,currency,status,valid_until,created_by,created_at')
    .eq('rfq_id', parsed.data)
    .order('version', { ascending: false })

  if (error) return fail('VALIDATION', 'No se pudieron listar las cotizaciones / Could not list quotes')

  return ok(((data ?? []) as unknown as RawQuoteRow[]).map(mapQuoteRow))
}

/**
 * Compose a new (versioned) quote. Totals are computed HERE, server-side, in
 * integer minor units via the lane's archetype unit math — the client's
 * preview numbers are never trusted or persisted directly (ARCHITECTURE
 * "Money is integers" / CLAUDE.md Directive 3).
 */
export async function composeQuote(rfqId: string, lines: QuoteLineDraft[]): Promise<ActionResult<QuoteRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const rfqParsed = uuidSchema.safeParse(rfqId)
  if (!rfqParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const parsed = z.array(quoteLineInputSchema).min(1).max(200).safeParse(lines)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', { lines: parsed.error.issues.map((i) => i.message) })
  }

  const context = await loadRfqContext(supabase, rfqParsed.data)
  if (!context.found) return fail('FORBIDDEN_LANE', 'RFQ no encontrado o sin acceso / RFQ not found or no access')

  let computedLines: QuoteLineComputed[]
  try {
    computedLines = computeQuoteLines(context.archetype, parsed.data as QuoteLineInput[])
  } catch (err) {
    return fail('VALIDATION', err instanceof Error ? err.message : 'Línea de cotización inválida / Invalid quote line')
  }

  const totalMinor = computeQuoteTotal(computedLines, context.currency)

  const { data: existingVersions, error: versionsError } = await supabase
    .from('quotes')
    .select('version')
    .eq('rfq_id', rfqParsed.data)
  if (versionsError) return fail('VALIDATION', 'No se pudo leer el historial de cotizaciones / Could not read quote history')

  const version = nextQuoteVersion((existingVersions ?? []) as { version: number }[])

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      rfq_id: rfqParsed.data,
      version,
      lines: computedLines,
      total_minor: totalMinor,
      currency: context.currency,
      status: 'DRAFT',
      created_by: user.id,
    })
    .select('id,rfq_id,version,lines,total_minor,currency,status,valid_until,created_by,created_at')
    .single()

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo componer la cotización / Could not compose the quote')

  return ok(mapQuoteRow(data as unknown as RawQuoteRow))
}

const sendQuoteInputSchema = z.object({ id: uuidSchema, validUntil: z.string().nullable().optional() })

export async function sendQuote(quoteId: string, validUntil?: string | null): Promise<ActionResult<QuoteRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = sendQuoteInputSchema.safeParse({ id: quoteId, validUntil })
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const { data: current, error: currentError } = await supabase
    .from('quotes')
    .select('status')
    .eq('id', parsed.data.id)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer la cotización / Could not read the quote')
  if (!current) return fail('FORBIDDEN_LANE', 'Cotización no encontrada o sin acceso / Quote not found or no access')
  if (!statusCanSendQuote((current as { status: string }).status as QuoteStatus)) {
    return fail('VALIDATION', 'Solo un borrador puede enviarse / Only a draft quote can be sent')
  }

  const payload: Record<string, unknown> = { status: 'SENT' }
  if (parsed.data.validUntil) payload.valid_until = parsed.data.validUntil

  const { data, error } = await supabase
    .from('quotes')
    .update(payload)
    .eq('id', parsed.data.id)
    .select('id,rfq_id,version,lines,total_minor,currency,status,valid_until,created_by,created_at')
    .single()

  if (error) {
    // DB backstop (migration tower_39 quotes_status_guard) — mirrors canSendQuote.
    if ((error.message ?? '').includes('STATUS_TRANSITION_INVALID')) {
      return fail('STAGE_INVALID', 'Transición de estado inválida / Invalid status transition')
    }
    return fail('FORBIDDEN_LANE', 'No se pudo enviar la cotización / Could not send the quote')
  }

  return ok(mapQuoteRow(data as unknown as RawQuoteRow))
}

const markQuoteStatusInputSchema = z.object({
  id: uuidSchema,
  status: z.enum(['ACCEPTED', 'REJECTED', 'EXPIRED']),
})

/**
 * Records the buyer's response to a SENT quote. Not itself named in API_MAP,
 * but required to reach the `quote ACCEPTED → convertToOrder` precondition
 * the spec describes — see this wave's report for the ambiguity note.
 */
export async function markQuoteStatus(
  quoteId: string,
  status: 'ACCEPTED' | 'REJECTED' | 'EXPIRED',
): Promise<ActionResult<QuoteRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = markQuoteStatusInputSchema.safeParse({ id: quoteId, status })
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const { data: current, error: currentError } = await supabase
    .from('quotes')
    .select('status')
    .eq('id', parsed.data.id)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer la cotización / Could not read the quote')
  if (!current) return fail('FORBIDDEN_LANE', 'Cotización no encontrada o sin acceso / Quote not found or no access')
  if (!statusCanMarkQuoteStatus((current as { status: string }).status as QuoteStatus)) {
    return fail('VALIDATION', 'Solo una cotización enviada puede resolverse / Only a sent quote can be resolved')
  }

  const { data, error } = await supabase
    .from('quotes')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)
    .select('id,rfq_id,version,lines,total_minor,currency,status,valid_until,created_by,created_at')
    .single()

  if (error) {
    // DB backstop (migration tower_39 quotes_status_guard) — mirrors canMarkQuoteStatus.
    if ((error.message ?? '').includes('STATUS_TRANSITION_INVALID')) {
      return fail('STAGE_INVALID', 'Transición de estado inválida / Invalid status transition')
    }
    return fail('FORBIDDEN_LANE', 'No se pudo actualizar la cotización / Could not update the quote')
  }

  return ok(mapQuoteRow(data as unknown as RawQuoteRow))
}

// ── Convert to order ─────────────────────────────────────────────────────────

export async function convertToOrder(quoteId: string): Promise<ActionResult<OrderRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(quoteId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('id,rfq_id,status,currency')
    .eq('id', parsed.data)
    .maybeSingle()
  if (quoteError) return fail('VALIDATION', 'No se pudo leer la cotización / Could not read the quote')
  if (!quote) return fail('FORBIDDEN_LANE', 'Cotización no encontrada o sin acceso / Quote not found or no access')

  const quoteRow = quote as { id: string; rfq_id: string; status: string; currency: string }
  if (!statusCanConvertToOrder(quoteRow.status as QuoteStatus)) {
    return fail('VALIDATION', 'Solo una cotización aceptada puede convertirse en pedido / Only an accepted quote can convert to an order')
  }

  const { data: rfq, error: rfqError } = await supabase
    .from('rfqs')
    .select('id,brand_id,lane_id,account_id')
    .eq('id', quoteRow.rfq_id)
    .maybeSingle()
  if (rfqError) return fail('VALIDATION', 'No se pudo leer el RFQ / Could not read the RFQ')
  if (!rfq) return fail('FORBIDDEN_LANE', 'RFQ no encontrado o sin acceso / RFQ not found or no access')

  const rfqRow = rfq as { id: string; brand_id: string; lane_id: string; account_id: string | null }
  if (!rfqRow.account_id) {
    return fail('VALIDATION', 'El RFQ necesita una cuenta antes de generar un pedido / The RFQ needs an account before it can become an order')
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      quote_id: quoteRow.id,
      brand_id: rfqRow.brand_id,
      lane_id: rfqRow.lane_id,
      account_id: rfqRow.account_id,
      status: 'CONTRACTED',
    })
    .select('id,quote_id,brand_id,lane_id,account_id,status,incoterm,created_at')
    .single()

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo generar el pedido / Could not create the order')

  return ok(mapOrderRow(data as unknown as RawOrderRow))
}

// ── Conversation (sibling W3.C contract — lib/conversations.ts) ─────────────

export async function fetchConversation(rfqId: string): Promise<ActionResult<Conversation>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error

  const parsed = uuidSchema.safeParse(rfqId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  try {
    const conversation = await getConversation(parsed.data)
    return ok(conversation)
  } catch (err) {
    console.error('[pipeline] fetchConversation failed', err)
    return fail('VALIDATION', 'No se pudo cargar la conversación / Could not load the conversation')
  }
}

