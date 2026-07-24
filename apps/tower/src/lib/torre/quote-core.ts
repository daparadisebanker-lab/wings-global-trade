// src/lib/torre/quote-core.ts
// The shared quote pricing+persist core (extracted from the flagship action so the
// agentic tool path — propose_quote, C1 — and the natural-language action
// (runTorreQuote) drive the SAME money pipeline; one source of truth, no drift).
//
// Given a lane the operator can see and a STRUCTURED spec, it:
//   fetch costing refs (RLS) → resolve freight (A1) + tariff (A2) + margin/validity (A3)
//   → buildQuoteRun (the parity-tested pure builder) → persist the linked DRAFT trio.
//
// Governance is unchanged from the flagship: rates ALWAYS from config, tariff never
// model-guessed, no model arithmetic, nothing auto-commits (the trio lands as ai_drafts
// DRAFT). The only new knob is `hsCodeHint`: when the agentic caller already resolved an
// ambiguous position (the model chose from get_tariff), it pins that HS code.
import type { SupabaseClient } from '@supabase/supabase-js'
import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { resolveAdValoremRate } from '@/lib/costing/ad-valorem'
import type { QuoteSpec } from '@/lib/torre/parse-spec'
import { assembleQuoteRunInput, buildQuoteRun, type QuoteRunContext, type QuoteRunResult } from '@/lib/torre/quote-run'
import {
  buildTorreInsert,
  mapTorreDraftRow,
  TORRE_DRAFT_SELECT_COLS,
  type RawTorreDraftRow,
} from '@/lib/torre/drafts'
import type { SourceRef, TariffCandidateRef, TorreArtifactPayload } from '@/lib/torre/artifacts'
import { resolveFreightRate, type RateRow } from '@/lib/torre/rates'
import { resolveQuoteTariff, toCandidate, type TariffPosition } from '@/lib/torre/tariff'
import { resolveMarginFraction, ORG_RULES_FALLBACK, type OrgRules } from '@/lib/torre/org-rules'

export type TowerDb = ReturnType<SupabaseClient['schema']>

export interface QuoteLaneRow {
  id: string
  brand_id: string
  code: string | null
  archetype: string | null
}

export interface QuoteCoreResult {
  result: QuoteRunResult
  /** The three persisted ai_drafts ids (null when compute-only or persistence failed). */
  draftIds: { hojaCostos: string; cotizacion: string; comunicacion: string } | null
  persisted: boolean
  /** Present when compute succeeded but the DRAFT could not be saved (e.g. RLS). */
  persistNote?: { es: string; en: string }
}

export interface QuoteCoreOptions {
  today: string
  /** Persist the trio as DRAFTs (default true). false = compute-only preview. */
  persist: boolean
  createdBy: string | null
  /** Agentic caller's chosen HS code — pins an otherwise-ambiguous tariff position. */
  hsCodeHint?: string
}

/** ISO date `days` after a timestamptz/date string (for the tariff re-verify horizon). */
function plusDaysISO(iso: string, days: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Price a quote from a structured spec and (optionally) persist the linked DRAFT trio.
 * The lane must already be resolved + authorized by the caller (RLS-scoped `db`).
 */
export async function runQuoteFromSpec(
  db: TowerDb,
  laneRow: QuoteLaneRow,
  spec: QuoteSpec,
  opts: QuoteCoreOptions,
): Promise<QuoteCoreResult> {
  const { today, createdBy } = opts
  const persist = opts.persist

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

  // Freight (A1): operator-stated wins; else source a DATED rate from rate_tables —
  // never invented (Directive 4).
  const { data: freightRows } = await db
    .from('rate_tables')
    .select('kind,route,mode,container_type,rate_minor,currency,valid_from,valid_to,source')
    .eq('brand_id', laneRow.brand_id)
    // this lane's rates + brand-wide (lane_id null) — never a sibling lane's rates
    .or(`lane_id.eq.${laneRow.id},lane_id.is.null`)
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

  // Tariff (A2): resolve the product to HS candidate positions. An hsCodeHint pins a
  // position ONLY when it is one of the keyword candidates (resolveQuoteTariff) — an
  // unrelated hint is ignored, so it can never dodge the ambiguity blocker. 1 → use its
  // duty; ≥2 → ambiguous (blocks + presents); 0 → brand default.
  const { positions: candidatePositions, pinnedByAgent } = resolveQuoteTariff(
    tariffPositions,
    [effectiveSpec.productName, effectiveSpec.brand, effectiveSpec.model].filter(Boolean).join(' '),
    opts.hsCodeHint,
  )
  let adValoremRate: number | null
  let tariffCandidates: TariffCandidateRef[] | undefined
  let tariffUnverified = false
  let tariffSource: SourceRef
  if (candidatePositions.length === 1) {
    const p = candidatePositions[0]
    adValoremRate = p.dutyBps / 10_000
    tariffUnverified = p.verifiedAt == null
    const verifiedUntil = p.verifiedAt ? plusDaysISO(p.verifiedAt, 365) : undefined
    tariffSource = {
      kind: 'tariff_position',
      label: `HS ${p.hsCode} · ${p.description} (${(adValoremRate * 100).toFixed(0)}%)${tariffUnverified ? ' · sin verificar' : ''}${pinnedByAgent ? ' · elegida por el agente' : ''}`,
      ref: p.hsCode,
      validUntil: verifiedUntil,
    }
  } else if (candidatePositions.length >= 2) {
    adValoremRate = null // → tariff-ambiguous blocker, carrying the candidates
    tariffCandidates = candidatePositions.map(toCandidate)
    tariffSource = { kind: 'tariff_position', label: `${candidatePositions.length} partidas candidatas` }
  } else {
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
    return { result, draftIds: null, persisted: false }
  }

  // Persist the linked pair as DRAFTs (Directive 7). Order: hoja → cotizacion → comunicacion.
  const confidence = result.approvable ? 0.85 : 0.45
  const commonOpts = { brandId: laneRow.brand_id, laneId: laneRow.id, confidence, createdBy }

  const hojaId = await insertOne(db, result.hojaCostos, { ...commonOpts, refTable: null, refId: null })
  if (!hojaId) {
    return {
      result,
      draftIds: null,
      persisted: false,
      persistNote: {
        es: 'Cotización calculada, pero no se pudo guardar el borrador (permisos de lane).',
        en: 'Quote computed, but the draft could not be saved (lane permissions).',
      },
    }
  }
  const cotizacionPayload = { ...result.cotizacion, hojaCostosRef: hojaId }
  const cotizacionId = await insertOne(db, cotizacionPayload, { ...commonOpts, refTable: null, refId: null })
  const comunicacionPayload = { ...result.comunicacion, cotizacionRef: cotizacionId }
  const comunicacionId = cotizacionId ? await insertOne(db, comunicacionPayload, { ...commonOpts, refTable: null, refId: null }) : null

  if (!cotizacionId || !comunicacionId) {
    return {
      result: { ...result, cotizacion: cotizacionPayload, comunicacion: comunicacionPayload },
      draftIds: null,
      persisted: false,
      persistNote: {
        es: 'Se guardó la hoja de costos, pero no el par completo. Reintenta.',
        en: 'The cost sheet saved, but not the full pair. Retry.',
      },
    }
  }

  return {
    result: { ...result, cotizacion: cotizacionPayload, comunicacion: comunicacionPayload },
    draftIds: { hojaCostos: hojaId, cotizacion: cotizacionId, comunicacion: comunicacionId },
    persisted: true,
  }
}

async function insertOne(
  db: TowerDb,
  payload: TorreArtifactPayload,
  opts: { brandId: string; laneId: string; refTable: string | null; refId: string | null; confidence: number; createdBy: string | null },
): Promise<string | null> {
  const row = buildTorreInsert(payload, { ...opts, model: INTELLIGENCE_MODELS.reason })
  const { data, error } = await db.from('ai_drafts').insert(row).select(TORRE_DRAFT_SELECT_COLS).single()
  if (error || !data) return null
  const mapped = mapTorreDraftRow(data as unknown as RawTorreDraftRow)
  return mapped?.id ?? null
}
