'use server'
// src/lib/actions/torre-policy.ts
// Ajustes-lite (Mister Torre A4): the operator's window into the policy driving the
// quote run — the freight/insurance rate tables, the tariff (HS) positions, and the
// brand's org_rules. Read is RLS-scoped; adding a freight rate goes through the same
// RLS write policy (LANE_DIRECTOR/TRADE_OPS) — the UI never enforces, RLS does.
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'

const uuid = z.string().uuid()

export interface RateTableRow {
  id: string
  kind: 'FREIGHT' | 'INSURANCE'
  route: string
  mode: string
  containerType: string | null
  rateMinor: number
  currency: string
  validFrom: string
  validTo: string | null
  source: string | null
}
export interface TariffPositionRow {
  hsCode: string
  description: string
  dutyBps: number
  ivaBps: number
  verifiedAt: string | null
}
export interface OrgRulesView {
  marginDefaultBps: number
  marginRules: Record<string, number>
  incotermDefault: string
  validityDays: number
  approvalMatrix: Record<string, string[]>
}
export interface TorrePolicy {
  laneCode: string | null
  rateTables: RateTableRow[]
  tariffPositions: TariffPositionRow[]
  orgRules: OrgRulesView | null
}

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase: supabase.schema('tower'), user }
}

export interface PolicyLane {
  id: string
  code: string
  name: string
}

/**
 * Lanes for the policy picker — ANY read role (VIEWER/CATALOG_EDITOR included), via
 * the lanes_read RLS, so the picker matches the rate_tables read policy (listCostingLanes
 * narrows to operational roles, which would hide the read surface from a VIEWER).
 */
export async function listPolicyLanes(): Promise<ActionResult<PolicyLane[]>> {
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const { data, error } = await auth.supabase.from('lanes').select('id,code,name').order('code')
  if (error) return fail('FORBIDDEN_LANE', 'No se pudieron listar los lanes / Could not list lanes')
  return ok(((data ?? []) as Array<{ id: string; code: string; name: string }>).map((l) => ({ id: l.id, code: l.code, name: l.name })))
}

/** Read the policy for a lane (rate tables + tariff positions + org rules). */
export async function getTorrePolicy(laneId: string): Promise<ActionResult<TorrePolicy>> {
  const parsed = uuid.safeParse(laneId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const db = auth.supabase

  const { data: lane } = await db.from('lanes').select('id,brand_id,code').eq('id', parsed.data).maybeSingle()
  const laneRow = lane as { id: string; brand_id: string; code: string | null } | null
  if (!laneRow?.brand_id) return fail('FORBIDDEN_LANE', 'Lane no encontrado / Lane not found')

  const { data: rates, error: ratesErr } = await db
    .from('rate_tables')
    .select('id,kind,route,mode,container_type,rate_minor,currency,valid_from,valid_to,source')
    .eq('brand_id', laneRow.brand_id)
    .or(`lane_id.eq.${parsed.data},lane_id.is.null`)
    .order('valid_from', { ascending: false })
  const { data: tariffs, error: tariffsErr } = await db
    .from('tariff_positions')
    .select('hs_code,description,duty_bps,iva_bps,verified_at')
    .eq('brand_id', laneRow.brand_id)
    .order('hs_code')
  const { data: orgRow, error: orgErr } = await db
    .from('org_rules')
    .select('margin_default_bps,margin_rules,incoterm_default,validity_days,approval_matrix')
    .eq('brand_id', laneRow.brand_id)
    .maybeSingle()
  // A failed read must NOT masquerade as an empty policy — this surface's whole job is
  // to show the operator the real policy. Surface the error instead.
  if (ratesErr || tariffsErr || orgErr) return fail('FORBIDDEN_LANE', 'No se pudo leer la política / Could not read the policy')

  const rateTables: RateTableRow[] = (
    (rates ?? []) as Array<{
      id: string
      kind: 'FREIGHT' | 'INSURANCE'
      route: string
      mode: string
      container_type: string | null
      rate_minor: number
      currency: string
      valid_from: string
      valid_to: string | null
      source: string | null
    }>
  ).map((r) => ({
    id: r.id,
    kind: r.kind,
    route: r.route,
    mode: r.mode,
    containerType: r.container_type,
    rateMinor: r.rate_minor,
    currency: r.currency,
    validFrom: r.valid_from,
    validTo: r.valid_to,
    source: r.source,
  }))

  const tariffPositions: TariffPositionRow[] = (
    (tariffs ?? []) as Array<{ hs_code: string; description: string; duty_bps: number; iva_bps: number; verified_at: string | null }>
  ).map((r) => ({ hsCode: r.hs_code, description: r.description, dutyBps: r.duty_bps, ivaBps: r.iva_bps, verifiedAt: r.verified_at }))

  const orgRules: OrgRulesView | null = orgRow
    ? {
        marginDefaultBps: (orgRow as { margin_default_bps: number }).margin_default_bps,
        marginRules: ((orgRow as { margin_rules: Record<string, number> }).margin_rules ?? {}) as Record<string, number>,
        incotermDefault: (orgRow as { incoterm_default: string }).incoterm_default,
        validityDays: (orgRow as { validity_days: number }).validity_days,
        approvalMatrix: ((orgRow as { approval_matrix: Record<string, string[]> }).approval_matrix ?? {}) as Record<string, string[]>,
      }
    : null

  return ok({ laneCode: laneRow.code, rateTables, tariffPositions, orgRules })
}

const addFreightSchema = z.object({
  laneId: uuid,
  kind: z.enum(['FREIGHT', 'INSURANCE']).default('FREIGHT'),
  route: z.string().trim().min(1).max(120),
  mode: z.enum(['SEA', 'AIR', 'LAND']).default('SEA'),
  containerType: z.enum(['20GP', '40GP', '40HC', 'LCL', 'RORO']).nullish(),
  rateMinor: z.number().int().min(0),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  validTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish(),
  source: z.string().trim().max(200).nullish(),
}).refine((v) => !v.validTo || v.validTo >= v.validFrom, {
  message: 'validTo must be on or after validFrom',
  path: ['validTo'],
})
export type AddFreightRateInput = z.input<typeof addFreightSchema>

/** Add a dated freight/insurance rate (USD). RLS enforces the write role. */
export async function addFreightRate(input: AddFreightRateInput): Promise<ActionResult<RateTableRow>> {
  const parsed = addFreightSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Entrada inválida / Invalid input')
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const db = auth.supabase

  const { data: lane } = await db.from('lanes').select('brand_id').eq('id', parsed.data.laneId).maybeSingle()
  const brandId = (lane as { brand_id?: string } | null)?.brand_id
  if (!brandId) return fail('FORBIDDEN_LANE', 'Lane no encontrado / Lane not found')

  const { data, error } = await db
    .from('rate_tables')
    .insert({
      brand_id: brandId,
      lane_id: parsed.data.laneId,
      kind: parsed.data.kind,
      route: parsed.data.route,
      mode: parsed.data.mode,
      container_type: parsed.data.containerType ?? null,
      rate_minor: parsed.data.rateMinor,
      currency: 'USD',
      valid_from: parsed.data.validFrom,
      valid_to: parsed.data.validTo ?? null,
      source: parsed.data.source ?? null,
    })
    .select('id,kind,route,mode,container_type,rate_minor,currency,valid_from,valid_to,source')
    .single()
  if (error || !data) {
    const code = (error as { code?: string } | null)?.code
    if (code === '23505')
      return fail('VALIDATION', 'Ya existe una tarifa con esa ruta/modo/fecha — usa una nueva vigencia / A rate with that route/mode/date already exists — use a new valid_from')
    if (code === '22007' || code === '22008') return fail('VALIDATION', 'Fecha inválida / Invalid date')
    return fail('FORBIDDEN_LANE', 'No se pudo guardar (permisos) / Could not save (permissions)')
  }
  const r = data as {
    id: string
    kind: 'FREIGHT' | 'INSURANCE'
    route: string
    mode: string
    container_type: string | null
    rate_minor: number
    currency: string
    valid_from: string
    valid_to: string | null
    source: string | null
  }
  return ok({
    id: r.id,
    kind: r.kind,
    route: r.route,
    mode: r.mode,
    containerType: r.container_type,
    rateMinor: r.rate_minor,
    currency: r.currency,
    validFrom: r.valid_from,
    validTo: r.valid_to,
    source: r.source,
  })
}
