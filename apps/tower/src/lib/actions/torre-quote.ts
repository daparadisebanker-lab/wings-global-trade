'use server'
// src/lib/actions/torre-quote.ts
// Mister Torre — the quote-run server action (the flagship's mutation path).
//
//     auth → validate → RLS-scoped lane/costing reference → MODEL parses spec →
//     computeImportCost (engine) builds the pair → persist 3 ai_drafts (DRAFT)
//
// Governance: the model ONLY parses the operator's sentence; every number comes
// from the SUNAT engine (Directive 3). Nothing is sent/committed — the run ends at
// "a reviewable linked pair exists" (Directive 7). Rates come from costing_config,
// never the model (Directive 4). Connectors are mocked; no external I/O here.
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { getIntelligenceClient } from '@/lib/ai/client'
import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { resolveAdValoremRate } from '@/lib/costing/ad-valorem'
import { extractQuoteSpec, type QuoteSpec } from '@/lib/torre/parse-spec'
import {
  assembleQuoteRunInput,
  buildQuoteRun,
  type QuoteRunContext,
  type QuoteRunResult,
} from '@/lib/torre/quote-run'
import {
  buildTorreInsert,
  mapTorreDraftRow,
  TORRE_DRAFT_SELECT_COLS,
  type RawTorreDraftRow,
} from '@/lib/torre/drafts'
import type { SourceRef, TariffCandidateRef, TorreArtifactPayload } from '@/lib/torre/artifacts'
import { resolveFreightRate, type RateRow } from '@/lib/torre/rates'
import { resolveTariffCandidates, toCandidate, type TariffPosition } from '@/lib/torre/tariff'
import { resolveMarginFraction, ORG_RULES_FALLBACK, type OrgRules } from '@/lib/torre/org-rules'

const uuid = z.string().uuid()

const runSchema = z.object({
  laneId: uuid,
  text: z.string().trim().min(3).max(2000),
  /** Persist the pair as reviewable drafts (default true). false = compute-only preview. */
  persist: z.boolean().optional(),
  /** Test/replay hook: pin 'today' (server uses the real date otherwise). */
  today: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})
export type RunTorreQuoteInput = z.infer<typeof runSchema>

export interface TorreQuoteResult {
  result: QuoteRunResult
  spec: QuoteSpec
  /** The three persisted ai_drafts ids (null when compute-only or persistence failed). */
  draftIds: { hojaCostos: string; cotizacion: string; comunicacion: string } | null
  persisted: boolean
  /** Present when compute succeeded but the DRAFT could not be saved (e.g. RLS). */
  persistNote?: { es: string; en: string }
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

function serverToday(pinned?: string): string {
  return pinned ?? new Date().toISOString().slice(0, 10)
}

/** ISO date `days` after a timestamptz/date string (for the tariff re-verify horizon). */
function plusDaysISO(iso: string, days: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function runTorreQuote(input: RunTorreQuoteInput): Promise<ActionResult<TorreQuoteResult>> {
  const parsed = runSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Entrada inválida / Invalid input')
  const { laneId, text } = parsed.data
  const persist = parsed.data.persist !== false

  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const db = auth.supabase

  // Lane → brand + code (RLS-scoped: a lane the operator can't see returns nothing).
  const { data: lane } = await db.from('lanes').select('id,brand_id,code,archetype').eq('id', laneId).maybeSingle()
  const laneRow = lane as { id: string; brand_id: string; code: string | null; archetype: string | null } | null
  if (!laneRow?.brand_id) return fail('FORBIDDEN_LANE', 'Lane no encontrado / Lane not found')

  // Costing reference — rates ALWAYS from config, never the model (Directive 4).
  const { data: config } = await db
    .from('costing_config')
    .select('igv_bps,percepcion_bps,insurance_bps,version')
    .eq('brand_id', laneRow.brand_id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  const c = config as { igv_bps: number; percepcion_bps: number; insurance_bps: number } | null
  const { data: rateRows } = await db.from('ad_valorem_rates').select('hs_prefix,bps,label').eq('brand_id', laneRow.brand_id)
  const adValoremTable = ((rateRows ?? []) as { hs_prefix: string; bps: number; label: string | null }[]).map((r) => ({
    hsPrefix: r.hs_prefix,
    bps: r.bps,
    label: r.label,
  }))
  const { data: tariffRows } = await db
    .from('tariff_positions')
    .select('hs_code,description,keywords,duty_bps,iva_bps,verified_at')
    .eq('brand_id', laneRow.brand_id)
    .order('hs_code') // deterministic candidate order (blocker chips + persisted reason)
  const tariffPositions: TariffPosition[] = (
    (tariffRows ?? []) as Array<{
      hs_code: string
      description: string
      keywords: string[] | null
      duty_bps: number
      iva_bps: number
      verified_at: string | null
    }>
  ).map((r) => ({
    hsCode: r.hs_code,
    description: r.description,
    keywords: r.keywords ?? [],
    dutyBps: r.duty_bps,
    ivaBps: r.iva_bps,
    verifiedAt: r.verified_at,
  }))

  // Commercial policy (A3) — margin + validity from org_rules, not hardcoded.
  const { data: orgRow } = await db
    .from('org_rules')
    .select('margin_default_bps,margin_rules,incoterm_default,validity_days,approval_matrix')
    .eq('brand_id', laneRow.brand_id)
    .maybeSingle()
  const org: OrgRules = orgRow
    ? {
        marginDefaultBps: (orgRow as { margin_default_bps: number }).margin_default_bps,
        marginRules: ((orgRow as { margin_rules: Record<string, number> }).margin_rules ?? {}) as Record<string, number>,
        incotermDefault: (orgRow as { incoterm_default: string }).incoterm_default,
        validityDays: (orgRow as { validity_days: number }).validity_days,
        approvalMatrix: ((orgRow as { approval_matrix: Record<string, string[]> }).approval_matrix ?? {}) as Record<string, string[]>,
      }
    : ORG_RULES_FALLBACK

  // The MODEL step (only the sentence → structured spec).
  const client = getIntelligenceClient()
  if (!client) {
    return fail('VALIDATION', 'Intelligence no configurado (falta ANTHROPIC_API_KEY) / Intelligence not configured')
  }
  let spec: QuoteSpec
  try {
    spec = await extractQuoteSpec(client, text)
  } catch {
    return fail('VALIDATION', 'No se pudo interpretar la solicitud / Could not parse the request')
  }
  if (!spec.understood) {
    return fail(
      'VALIDATION',
      spec.note ||
        'Dime el equipo y su valor FOB (o CIF) para armar la cotización / Give me the equipment and its FOB (or CIF) value',
    )
  }

  const today = serverToday(parsed.data.today)

  // Freight (A1): operator-stated wins; else source a DATED rate from rate_tables —
  // never invented (Directive 4). A lapsed rate carries a past validUntil so the quote
  // run raises the rate-expiry blocker; nothing matching → null → rate-missing blocker.
  const { data: freightRows } = await db
    .from('rate_tables')
    .select('kind,route,mode,container_type,rate_minor,currency,valid_from,valid_to,source')
    .eq('brand_id', laneRow.brand_id)
    // this lane's rates + brand-wide (lane_id null) — never a sibling lane's rates
    .or(`lane_id.eq.${laneId},lane_id.is.null`)
  const rates: RateRow[] = (
    (freightRows ?? []) as Array<{
      kind: 'FREIGHT' | 'INSURANCE'
      route: string
      mode: 'SEA' | 'AIR' | 'LAND'
      container_type: string | null
      rate_minor: number
      currency: string
      valid_from: string
      valid_to: string | null
      source: string | null
    }>
  ).map((r) => ({
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

  let effectiveSpec = spec
  let freightSource: SourceRef | null =
    spec.freightInternational != null ? { kind: 'operator', label: 'Flete indicado por el operador' } : null
  if (spec.freightInternational == null) {
    const resolved = resolveFreightRate(rates, { mode: 'SEA' }, today)
    if (resolved) {
      effectiveSpec = { ...spec, freightInternational: resolved.rateMajor }
      freightSource = resolved.source
    }
  }

  // Tariff (A2): resolve the product to HS candidate positions. 1 → use its duty;
  // ≥2 → ambiguous (adValoremRate null → the quote run blocks and PRESENTS them);
  // 0 → fall back to the brand-default Ad Valorem. Never a model-guessed duty.
  const candidatePositions = resolveTariffCandidates(
    tariffPositions,
    [effectiveSpec.productName, effectiveSpec.brand, effectiveSpec.model].filter(Boolean).join(' '),
  )
  let adValoremRate: number | null
  let tariffCandidates: TariffCandidateRef[] | undefined
  let tariffUnverified = false
  let tariffSource: SourceRef
  if (candidatePositions.length === 1) {
    // 1 candidate → use its duty. verified_at drives honesty: unverified → block;
    // verified → the source carries a re-verify horizon (verifiedAt + 1y) so a stale
    // classification raises the tariff-stale blocker instead of passing silently.
    const p = candidatePositions[0]
    adValoremRate = p.dutyBps / 10_000
    tariffUnverified = p.verifiedAt == null
    const verifiedUntil = p.verifiedAt ? plusDaysISO(p.verifiedAt, 365) : undefined
    tariffSource = {
      kind: 'tariff_position',
      label: `HS ${p.hsCode} · ${p.description} (${(adValoremRate * 100).toFixed(0)}%)${tariffUnverified ? ' · sin verificar' : ''}`,
      ref: p.hsCode,
      validUntil: verifiedUntil,
    }
  } else if (candidatePositions.length >= 2) {
    adValoremRate = null // → tariff-ambiguous blocker, carrying the candidates
    tariffCandidates = candidatePositions.map(toCandidate)
    tariffSource = { kind: 'tariff_position', label: `${candidatePositions.length} partidas candidatas` }
  } else {
    // 0 candidates → the CONFIGURED brand default (a '' prefix row), or — if none is
    // configured — unresolved (null → block), never a silent 0%.
    const hasDefault = adValoremTable.some((r) => r.hsPrefix === '')
    if (hasDefault) {
      const brandDefault = resolveAdValoremRate(adValoremTable, '')
      adValoremRate = brandDefault
      tariffSource = {
        kind: 'tariff_position',
        label: `Ad Valorem ${(brandDefault * 100).toFixed(0)}% (predeterminado de marca)`,
      }
    } else {
      adValoremRate = null // no candidate + no configured default → unresolved (blocks)
      tariffSource = { kind: 'tariff_position', label: 'Sin posición ni arancel predeterminado' }
    }
  }

  // Build the context (rates from config; tariff resolved above; margin/validity from
  // org_rules per the lane's archetype; mocked TRM).
  const marginDefault = resolveMarginFraction(org, laneRow.archetype)
  // marginSource names WHOSE margin the quote actually used (mirrors freightSource):
  // the operator's stated margin wins over the org rule; the fallback is labelled honestly.
  const marginUsed = spec.marginPercent ?? marginDefault
  const marginSource: SourceRef =
    spec.marginPercent != null
      ? { kind: 'operator', label: `Margen ${(marginUsed * 100).toFixed(0)}% (indicado por el operador)` }
      : orgRow
        ? { kind: 'org_rule', label: `Margen ${(marginUsed * 100).toFixed(0)}% (regla de marca${laneRow.archetype ? ` · ${laneRow.archetype}` : ''})` }
        : { kind: 'org_rule', label: `Margen ${(marginUsed * 100).toFixed(0)}% (por defecto del sistema)` }
  const ctx: QuoteRunContext = {
    laneCode: laneRow.code,
    igvRate: (c?.igv_bps ?? 1800) / 10_000,
    percepcionRate: (c?.percepcion_bps ?? 350) / 10_000,
    insuranceRate: (c?.insurance_bps ?? 150) / 10_000,
    adValoremRate,
    tariffCandidates,
    tariffUnverified,
    exchangeRate: 3.7, // MOCK_CONNECTORS: no live TRM feed; referential rate
    marginDefault,
    incotermDefault: org.incotermDefault,
    freightSource,
    tariffSource,
    trmSource: { kind: 'org_rule', label: 'TC referencial 3.70 (mock)' },
    marginSource,
    validityDays: org.validityDays,
    today,
    defaultClientName: spec.clientName,
    defaultLanguage: spec.language ?? 'es',
  }

  const runInput = assembleQuoteRunInput(effectiveSpec, ctx)
  const result = buildQuoteRun(runInput)

  if (!persist) {
    return ok({ result, spec, draftIds: null, persisted: false })
  }

  // Persist the linked pair as DRAFTs (Directive 7). Order: hoja → cotizacion → comunicacion.
  const model = INTELLIGENCE_MODELS.reason
  const confidence = result.approvable ? 0.85 : 0.45
  const commonOpts = { brandId: laneRow.brand_id, laneId, confidence, model, createdBy: auth.user.id }

  const hojaId = await insertOne(db, result.hojaCostos, { ...commonOpts, refTable: null, refId: null })
  if (!hojaId) {
    return ok({
      result,
      spec,
      draftIds: null,
      persisted: false,
      persistNote: {
        es: 'Cotización calculada, pero no se pudo guardar el borrador (permisos de lane).',
        en: 'Quote computed, but the draft could not be saved (lane permissions).',
      },
    })
  }
  const cotizacionPayload = { ...result.cotizacion, hojaCostosRef: hojaId }
  const cotizacionId = await insertOne(db, cotizacionPayload, { ...commonOpts, refTable: null, refId: null })
  const comunicacionPayload = { ...result.comunicacion, cotizacionRef: cotizacionId }
  const comunicacionId = cotizacionId ? await insertOne(db, comunicacionPayload, { ...commonOpts, refTable: null, refId: null }) : null

  if (!cotizacionId || !comunicacionId) {
    return ok({
      result: { ...result, cotizacion: cotizacionPayload, comunicacion: comunicacionPayload },
      spec,
      draftIds: null,
      persisted: false,
      persistNote: {
        es: 'Se guardó la hoja de costos, pero no el par completo. Reintenta.',
        en: 'The cost sheet saved, but not the full pair. Retry.',
      },
    })
  }

  return ok({
    result: { ...result, cotizacion: cotizacionPayload, comunicacion: comunicacionPayload },
    spec,
    draftIds: { hojaCostos: hojaId, cotizacion: cotizacionId, comunicacion: comunicacionId },
    persisted: true,
  })
}

type TowerDb = ReturnType<SupabaseClient['schema']>

async function insertOne(
  db: TowerDb,
  payload: TorreArtifactPayload,
  opts: { brandId: string; laneId: string; refTable: string | null; refId: string | null; confidence: number; model: string; createdBy: string | null },
): Promise<string | null> {
  const row = buildTorreInsert(payload, opts)
  const { data, error } = await db.from('ai_drafts').insert(row).select(TORRE_DRAFT_SELECT_COLS).single()
  if (error || !data) return null
  const mapped = mapTorreDraftRow(data as unknown as RawTorreDraftRow)
  return mapped?.id ?? null
}
