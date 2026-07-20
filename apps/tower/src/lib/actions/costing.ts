'use server'

// src/lib/actions/costing.ts
// Peru costing persistence — peru-costing SPEC Wave 6.2. Mutation law:
// auth → Zod parse → RLS-scoped query (tower.cost_calculations "SALES/TRADE_OPS/
// LANE_DIRECTOR write"). The SUNAT engine runs HERE, server-side and
// authoritative (the client's copy is a live preview only); the integer-minor
// split is extracted at persistence (lib/costing/persistence). Saved sheets are
// append-only — a re-run is a new row, never an edit.
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { computeImportCost } from '@/lib/costing/engine'
import { calcularProrrateo } from '@/lib/costing/prorrateo'
import { costCalcMoney, toMinor } from '@/lib/costing/persistence'
import type { AdValoremRate } from '@/lib/costing/ad-valorem'
import type {
  GastoProrrateo,
  ImportInputs,
  ImportResult,
  ItemProrrateo,
  ResultadoProrrateo,
} from '@/lib/costing/types'

const uuidSchema = z.string().uuid()

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

// ── Import inputs schema (mirrors lib/costing/types#ImportInputs) ────────────
const importInputsSchema = z.object({
  productName: z.string().max(200).default(''),
  brand: z.string().max(120).default(''),
  model: z.string().max(120).default(''),
  fuelType: z.enum(['hybrid', 'gasoline', 'diesel', 'electric']),
  engineCC: z.number().int().min(0).max(100_000),
  origin: z.enum(['china', 'other']),
  year: z.number().int().min(1900).max(2100),
  incoterm: z.enum(['EXW', 'FOB', 'CFR', 'CIF']),
  fob: z.number().min(0),
  transportOrigin: z.number().min(0),
  freightInternational: z.number().min(0),
  freightZofratacna: z.number().min(0),
  portExpenses: z.number().min(0),
  customsAgency: z.number().min(0),
  handlingStowage: z.number().min(0),
  adValoremRate: z.number().min(0).max(1),
  igvRate: z.number().min(0).max(1),
  percepcionRate: z.number().min(0).max(1),
  insuranceRate: z.number().min(0).max(1),
  exchangeRate: z.number().gt(0).max(100),
  marginMode: z.enum(['percent', 'target_price']),
  marginPercent: z.number().min(0).max(10),
  targetSalePrice: z.number().min(0),
})

const saveSchema = z.object({
  laneId: uuidSchema,
  containerId: uuidSchema.nullish(),
  orderId: uuidSchema.nullish(),
  productId: uuidSchema.nullish(),
  label: z.string().trim().max(200).nullish(),
  inputs: importInputsSchema,
})
export type SaveCostCalculationInput = z.input<typeof saveSchema>

export interface CostCalculationRow {
  id: string
  laneId: string
  incoterm: string
  landedMinor: number
  cashOutlayMinor: number
  salePriceMinor: number
  marginMinor: number
  label: string | null
  createdAt: string
  result: ImportResult
  inputs: ImportInputs
}

export interface CostingLane {
  id: string
  code: string
  name: string
  archetype: string
}

/** Config-sourced rate defaults (fractions) + the brand's Ad Valorem table (G5).
 *  IGV/percepción/insurance come from versioned costing_config (single source of
 *  truth); the exchange rate stays per-operation. ISC thresholds stay engine-
 *  internal (parity-locked) — config mirrors them for reference only. */
export interface CostingReference {
  igvRate: number
  percepcionRate: number
  insuranceRate: number
  adValoremRates: AdValoremRate[]
}

export async function getCostingReference(laneId: string): Promise<ActionResult<CostingReference>> {
  const parsed = uuidSchema.safeParse(laneId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data: lane } = await auth.supabase.from('lanes').select('brand_id').eq('id', parsed.data).maybeSingle()
  const brandId = (lane as { brand_id?: string } | null)?.brand_id
  if (!brandId) return fail('FORBIDDEN_LANE', 'Lane no encontrado / Lane not found')

  const { data: config } = await auth.supabase
    .from('costing_config')
    .select('igv_bps,percepcion_bps,insurance_bps,version')
    .eq('brand_id', brandId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  const c = config as { igv_bps: number; percepcion_bps: number; insurance_bps: number } | null

  const { data: rates } = await auth.supabase
    .from('ad_valorem_rates')
    .select('hs_prefix,bps,label')
    .eq('brand_id', brandId)

  return ok({
    igvRate: (c?.igv_bps ?? 1800) / 10_000,
    percepcionRate: (c?.percepcion_bps ?? 350) / 10_000,
    insuranceRate: (c?.insurance_bps ?? 150) / 10_000,
    adValoremRates: ((rates ?? []) as { hs_prefix: string; bps: number; label: string | null }[]).map((r) => ({
      hsPrefix: r.hs_prefix,
      bps: r.bps,
      label: r.label,
    })),
  })
}

// ── Lanes the user may cost for ──────────────────────────────────────────────
export async function listCostingLanes(): Promise<ActionResult<CostingLane[]>> {
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_group_admin')
    .eq('id', user.id)
    .maybeSingle()

  const select = 'id,code,name,archetype'
  if ((profile as { is_group_admin?: boolean } | null)?.is_group_admin) {
    const { data, error } = await supabase.from('lanes').select(select).order('code')
    if (error) return fail('FORBIDDEN_LANE', 'No se pudieron leer los lanes / Could not read lanes')
    return ok((data ?? []) as unknown as CostingLane[])
  }

  const { data: memberships } = await supabase
    .from('lane_memberships')
    .select('lane_id,role')
    .eq('user_id', user.id)
    .in('role', ['LANE_DIRECTOR', 'TRADE_OPS', 'SALES'])
  const laneIds = Array.from(new Set(((memberships ?? []) as { lane_id: string }[]).map((m) => m.lane_id)))
  if (laneIds.length === 0) return ok([])

  const { data, error } = await supabase.from('lanes').select(select).in('id', laneIds).order('code')
  if (error) return fail('FORBIDDEN_LANE', 'No se pudieron leer los lanes / Could not read lanes')
  return ok((data ?? []) as unknown as CostingLane[])
}

export interface CostingContainer {
  id: string
  code: string
  status: string
}

/** Containers in a lane a cost sheet can be attached to (G2 — keyed to containers). */
export async function listCostingContainers(laneId: string): Promise<ActionResult<CostingContainer[]>> {
  const parsed = uuidSchema.safeParse(laneId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .from('containers')
    .select('id,code,status')
    .eq('lane_id', parsed.data)
    .order('code', { ascending: false })
    .limit(100)
  if (error) return fail('FORBIDDEN_LANE', 'No se pudieron leer los contenedores / Could not read containers')
  return ok((data ?? []) as unknown as CostingContainer[])
}

// ── Save a computed cost sheet (append-only) ─────────────────────────────────
export async function saveCostCalculation(
  input: SaveCostCalculationInput,
): Promise<ActionResult<CostCalculationRow>> {
  const parsed = saveSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const { supabase } = auth

  // Resolve the lane's brand (RLS lets a member read their lane).
  const { data: lane, error: laneError } = await supabase
    .from('lanes')
    .select('brand_id')
    .eq('id', parsed.data.laneId)
    .maybeSingle()
  if (laneError || !lane) return fail('FORBIDDEN_LANE', 'Lane no encontrado / Lane not found')

  // Compute server-side (authoritative).
  const inputs = parsed.data.inputs as ImportInputs
  const result = computeImportCost(inputs)
  const money = costCalcMoney(inputs, result)

  const { data, error } = await supabase
    .from('cost_calculations')
    .insert({
      brand_id: (lane as { brand_id: string }).brand_id,
      lane_id: parsed.data.laneId,
      container_id: parsed.data.containerId ?? null,
      order_id: parsed.data.orderId ?? null,
      product_id: parsed.data.productId ?? null,
      inputs,
      result,
      incoterm: money.incoterm,
      exchange_rate_milli: money.exchange_rate_milli,
      landed_minor: money.landed_minor,
      cash_outlay_minor: money.cash_outlay_minor,
      sale_price_minor: money.sale_price_minor,
      margin_minor: money.margin_minor,
      label: parsed.data.label ?? null,
    })
    .select('id,lane_id,incoterm,landed_minor,cash_outlay_minor,sale_price_minor,margin_minor,label,created_at,result,inputs')
    .single()
  if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo guardar / Could not save')

  return ok(mapRow(data as unknown as RawCostRow))
}

// ── Bulk: cost + persist many rows at once (Wave 6.4) ────────────────────────
const bulkSchema = z.object({
  laneId: uuidSchema,
  label: z.string().trim().max(200).nullish(),
  rows: z.array(importInputsSchema).min(1).max(500),
})
export type SaveBulkInput = z.input<typeof bulkSchema>

export async function saveBulkCostCalculations(
  input: SaveBulkInput,
): Promise<ActionResult<CostCalculationRow[]>> {
  const parsed = bulkSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const { supabase } = auth

  const { data: lane, error: laneError } = await supabase
    .from('lanes')
    .select('brand_id')
    .eq('id', parsed.data.laneId)
    .maybeSingle()
  if (laneError || !lane) return fail('FORBIDDEN_LANE', 'Lane no encontrado / Lane not found')
  const brandId = (lane as { brand_id: string }).brand_id

  // Cost every row server-side (authoritative), then one batch insert.
  const payload = parsed.data.rows.map((inputs) => {
    const result = computeImportCost(inputs as ImportInputs)
    const money = costCalcMoney(inputs as ImportInputs, result)
    return {
      brand_id: brandId,
      lane_id: parsed.data.laneId,
      inputs,
      result,
      incoterm: money.incoterm,
      exchange_rate_milli: money.exchange_rate_milli,
      landed_minor: money.landed_minor,
      cash_outlay_minor: money.cash_outlay_minor,
      sale_price_minor: money.sale_price_minor,
      margin_minor: money.margin_minor,
      label: parsed.data.label ?? null,
    }
  })

  const { data, error } = await supabase
    .from('cost_calculations')
    .insert(payload)
    .select('id,lane_id,incoterm,landed_minor,cash_outlay_minor,sale_price_minor,margin_minor,label,created_at,result,inputs')
  if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo guardar el lote / Could not save the batch')

  return ok((data as unknown as RawCostRow[]).map(mapRow))
}

// ── Prorrateo: allocate shared costs across items (Wave 6.4 / ERP) ───────────
const itemSchema = z.object({
  item_id: z.string().min(1).max(64),
  sku: z.string().max(120),
  descripcion: z.string().max(200),
  cantidad: z.number().min(0),
  peso_total_kg: z.number().min(0),
  cbm_total: z.number().min(0),
  valor_total_cif: z.number().min(0),
})
const gastoSchema = z.object({
  gasto_id: z.string().min(1).max(64),
  nombre: z.string().max(120),
  monto_total: z.number().min(0),
  moneda: z.enum(['USD', 'PEN']),
  metodo: z.enum(['cbm', 'peso', 'valor_cif', 'unidad']),
})
const prorrateoSchema = z.object({
  laneId: uuidSchema,
  containerId: uuidSchema.nullish(),
  exchangeRate: z.number().gt(0).max(100),
  items: z.array(itemSchema).min(1).max(200),
  gastos: z.array(gastoSchema).min(1).max(50),
})
export type SaveProrrateoInput = z.input<typeof prorrateoSchema>

export interface ProrrateoRunResult {
  runId: string
  result: ResultadoProrrateo
}

export async function saveProrrateoRun(input: SaveProrrateoInput): Promise<ActionResult<ProrrateoRunResult>> {
  const parsed = prorrateoSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const { supabase } = auth

  const { data: lane, error: laneError } = await supabase
    .from('lanes')
    .select('brand_id')
    .eq('id', parsed.data.laneId)
    .maybeSingle()
  if (laneError || !lane) return fail('FORBIDDEN_LANE', 'Lane no encontrado / Lane not found')

  // Allocate server-side (authoritative).
  const result = calcularProrrateo(
    parsed.data.items as ItemProrrateo[],
    parsed.data.gastos as GastoProrrateo[],
    parsed.data.exchangeRate,
  )

  const { data: run, error: runError } = await supabase
    .from('prorrateo_runs')
    .insert({
      brand_id: (lane as { brand_id: string }).brand_id,
      lane_id: parsed.data.laneId,
      container_id: parsed.data.containerId ?? null,
      exchange_rate_milli: Math.round(parsed.data.exchangeRate * 1000),
      gastos: parsed.data.gastos,
    })
    .select('id')
    .single()
  if (runError || !run) return fail('FORBIDDEN_LANE', 'No se pudo guardar el prorrateo / Could not save')
  const runId = (run as { id: string }).id

  const items = result.items.map((r) => ({
    run_id: runId,
    item: r.item,
    result: r,
    costo_total_minor: toMinor(r.costo_total_puesto_almacen_total_usd),
  }))
  const { error: itemsError } = await supabase.from('prorrateo_items').insert(items)
  if (itemsError) return fail('FORBIDDEN_LANE', 'No se pudieron guardar los ítems / Could not save items')

  return ok({ runId, result })
}

interface RawCostRow {
  id: string
  lane_id: string
  incoterm: string
  landed_minor: number | string
  cash_outlay_minor: number | string
  sale_price_minor: number | string
  margin_minor: number | string
  label: string | null
  created_at: string
  result: ImportResult
  inputs: ImportInputs
}

function toNum(v: number | string): number {
  return typeof v === 'string' ? Number(v) : v
}

function mapRow(r: RawCostRow): CostCalculationRow {
  return {
    id: r.id,
    laneId: r.lane_id,
    incoterm: r.incoterm,
    landedMinor: toNum(r.landed_minor),
    cashOutlayMinor: toNum(r.cash_outlay_minor),
    salePriceMinor: toNum(r.sale_price_minor),
    marginMinor: toNum(r.margin_minor),
    label: r.label,
    createdAt: r.created_at,
    result: r.result,
    inputs: r.inputs,
  }
}

const COST_COLS =
  'id,lane_id,incoterm,landed_minor,cash_outlay_minor,sale_price_minor,margin_minor,label,created_at,result,inputs'

// ── History: saved cost sheets for a lane ────────────────────────────────────
export async function listCostCalculations(laneId: string): Promise<ActionResult<CostCalculationRow[]>> {
  const parsed = uuidSchema.safeParse(laneId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .from('cost_calculations')
    .select(COST_COLS)
    .eq('lane_id', parsed.data)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo leer el historial / Could not read history')
  return ok(((data ?? []) as unknown as RawCostRow[]).map(mapRow))
}

export async function getCostCalculation(id: string): Promise<ActionResult<CostCalculationRow>> {
  const parsed = uuidSchema.safeParse(id)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase.from('cost_calculations').select(COST_COLS).eq('id', parsed.data).maybeSingle()
  if (error || !data) return fail('FORBIDDEN_LANE', 'Cálculo no encontrado / Calculation not found')
  return ok(mapRow(data as unknown as RawCostRow))
}
