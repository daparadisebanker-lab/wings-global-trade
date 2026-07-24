// src/lib/torre/quote-run.ts
// Mister Torre — THE FLAGSHIP: the quote run (spec-torre/03 §"The quote run").
//
// Trigger → approvable pair. Given a STRUCTURED machine spec + the lane's costing
// reference, this PURE builder produces the linked artifact pair —
//   · hoja_costos (internal, full math trace + ±flete/±TRM sensitivity), and
//   · cotizacion (client-ready, per-incoterm scenarios) —
// plus the cover comunicacion. It is the deterministic half of the run: a model
// (in the server action / capability) only PARSES the operator's sentence into the
// structured `QuoteRunInput`; every number below is produced by computeImportCost
// (the parity-validated SUNAT engine), never by a model (CLAUDE.md Directive 3).
//
// Honesty is structural (Directive 5): a missing FOB or a missing freight RATE is a
// hard blocker (rates are never invented — Directive 4); an unresolved tariff makes
// the numbers provisional and unapprovable. Blockers flow to isApprovable().
import { computeImportCost } from '@/lib/costing/engine'
import { COST_DEFAULTS, buildInputsFrom } from '@/lib/copilot/capabilities/landed-cost'
import type { ImportInputs, Incoterm, FuelType, Origin } from '@/lib/costing/types'
import {
  type Blocker,
  type SourceRef,
  type ConfidenceState,
  type TariffCandidateRef,
  type HojaCostosPayload,
  type CotizacionPayload,
  type ComunicacionPayload,
  isApprovable,
} from './artifacts'
import type { QuoteSpec } from './parse-spec'

// ── The structured input the model parses into (the model NEVER produces money math) ──
export interface QuoteRunInput {
  // identity
  productName: string
  brand: string
  model: string
  fuelType: FuelType
  engineCC: number
  origin: Origin
  year: number
  // commercial
  clientName: string | null
  laneCode: string | null
  /** Client's language for the cotizacion + comunicacion ('es' | 'en' | ...). */
  language: string
  quantity: number
  // money knobs the operator stated (USD major units)
  /** REQUIRED — null ⇒ hard blocker (no landed cost without a base value). */
  fob: number | null
  /** The incoterm the operator asked in; also the first scenario. */
  incoterm: Incoterm
  /** Which incoterm scenarios to render (defaults to [incoterm] when empty). */
  scenarios: Incoterm[]
  /** REQUIRED — null ⇒ hard blocker (a freight rate is never invented from memory). */
  freightInternational: number | null
  freightZofratacna: number | null
  portExpenses: number | null
  customsAgency: number | null
  // rates resolved from the lane's costing_config (never from the model)
  igvRate: number
  percepcionRate: number
  insuranceRate: number
  /** null ⇒ tariff unresolved/ambiguous: numbers go provisional + a tariff blocker is raised. */
  adValoremRate: number | null
  /** When ambiguous (adValoremRate null), the candidate positions to present on the blocker. */
  tariffCandidates?: TariffCandidateRef[]
  /** fraction, e.g. 0.18 — org rule default or operator override. */
  marginPercent: number
  /** dated TC (PEN/USD). */
  exchangeRate: number
  // provenance for the sources block
  freightSource: SourceRef | null
  tariffSource: SourceRef | null
  trmSource: SourceRef | null
  marginSource: SourceRef | null
  /** Quote validity window in days. */
  validityDays: number
  /** ISO date 'today' — injected so the builder stays pure/deterministic. */
  today: string
}

export interface QuoteRunResult {
  hojaCostos: HojaCostosPayload
  cotizacion: CotizacionPayload
  comunicacion: ComunicacionPayload
  /** Union of every blocker across the pair (drives approvability). */
  blockers: Blocker[]
  /** isApprovable(cotizacion) — false while any blocker is open. */
  approvable: boolean
}

// ── helpers ──────────────────────────────────────────────────────────────────
/** USD major (2dp engine output) → integer minor units. Exact (engine pre-rounds). */
function toMinor(major: number): number {
  return Math.round(major * 100)
}
function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
function isPast(iso: string | undefined, today: string): boolean {
  return typeof iso === 'string' && iso < today
}

/** Build the engine inputs for one incoterm, from the structured run input. */
function inputsFor(inp: QuoteRunInput, incoterm: Incoterm): ImportInputs {
  return buildInputsFrom(COST_DEFAULTS, {
    productName: inp.productName,
    brand: inp.brand || undefined,
    model: inp.model || undefined,
    fuelType: inp.fuelType,
    engineCC: inp.engineCC,
    origin: inp.origin,
    year: inp.year,
    incoterm,
    fob: inp.fob ?? undefined,
    freightInternational: inp.freightInternational ?? undefined,
    freightZofratacna: inp.freightZofratacna ?? undefined,
    portExpenses: inp.portExpenses ?? undefined,
    customsAgency: inp.customsAgency ?? undefined,
    // adValorem is provisional 0 when unresolved (a blocker is raised separately).
    adValoremRate: inp.adValoremRate ?? 0,
    igvRate: inp.igvRate,
    percepcionRate: inp.percepcionRate,
    insuranceRate: inp.insuranceRate,
    exchangeRate: inp.exchangeRate,
    marginMode: 'percent',
    marginPercent: inp.marginPercent,
  })
}

/**
 * THE quote run. Pure and deterministic — the same input always yields the same
 * artifact pair, so it is unit-tested to the cent without a network or API key.
 */
export function buildQuoteRun(inp: QuoteRunInput): QuoteRunResult {
  const blockers: Blocker[] = []

  // ── (1) Detect blockers up front (Directive 5 honesty) ─────────────────────
  const fobOk = inp.fob !== null && inp.fob > 0
  if (!fobOk) {
    blockers.push({
      id: 'fob-missing',
      field: 'fob',
      reason: {
        es: 'Falta el valor FOB/CIF del equipo — sin base no hay costo puesto.',
        en: 'Missing FOB/CIF value — no landed cost without a base value.',
      },
      task: { es: 'Confirmar valor FOB con el proveedor', en: 'Confirm FOB value with supplier' },
    })
  }
  const freightOk = inp.freightInternational !== null && inp.freightInternational >= 0
  if (!freightOk) {
    blockers.push({
      id: 'rate-missing',
      field: 'freightInternational',
      reason: {
        es: 'No hay tarifa de flete vigente para la ruta — no se inventa (Directiva 4).',
        en: 'No valid freight rate for the route — never invented (Directive 4).',
      },
      task: { es: 'Cotizar flete con el agente de la ruta', en: 'Request freight rate from the route agent' },
    })
  }
  const tariffUnresolved = inp.adValoremRate === null
  if (tariffUnresolved) {
    const cands = inp.tariffCandidates ?? []
    const listEs = cands.map((c) => `HS ${c.hsCode} (${(c.dutyPct * 100).toFixed(0)}%)`).join(' · ')
    blockers.push({
      id: 'tariff-ambiguous',
      field: 'hs_code',
      reason: {
        es: cands.length
          ? `Partida arancelaria ambigua — ${cands.length} candidatas: ${listEs}. Ad Valorem provisional 0%. Elegir HS antes de aprobar.`
          : 'Posición arancelaria sin resolver — Ad Valorem provisional 0%. Elegir HS antes de aprobar.',
        en: cands.length
          ? `Ambiguous tariff position — ${cands.length} candidates: ${listEs}. Ad Valorem provisional 0%. Choose the HS before approval.`
          : 'Tariff position unresolved — Ad Valorem provisional 0%. Choose the HS position before approval.',
      },
      task: { es: 'Resolver partida arancelaria (HS)', en: 'Resolve the HS tariff position' },
      candidates: cands.length ? cands : undefined,
    })
  }
  if (isPast(inp.tariffSource?.validUntil, inp.today)) {
    blockers.push({
      id: 'tariff-stale',
      field: 'hs_code',
      reason: {
        es: `La partida arancelaria venció el ${inp.tariffSource?.validUntil} — re-verificar antes de aprobar.`,
        en: `The tariff position lapsed on ${inp.tariffSource?.validUntil} — re-verify before approval.`,
      },
      task: { es: 'Re-verificar arancel vigente', en: 'Re-verify the current tariff' },
    })
  }
  if (isPast(inp.freightSource?.validUntil, inp.today)) {
    blockers.push({
      id: 'rate-expired',
      field: 'freightInternational',
      reason: {
        es: `La tarifa de flete venció el ${inp.freightSource?.validUntil} — revalidar.`,
        en: `The freight rate lapsed on ${inp.freightSource?.validUntil} — revalidate.`,
      },
      task: { es: 'Revalidar tarifa de flete', en: 'Revalidate the freight rate' },
    })
  }

  // ── (2) Compute (only when the hard money inputs exist) ────────────────────
  const canCompute = fobOk && freightOk
  const scenarioIncoterms = inp.scenarios.length > 0 ? inp.scenarios : [inp.incoterm]
  const baseIncoterm = inp.incoterm
  const baseInputs = inputsFor(inp, baseIncoterm)
  const baseResult = canCompute ? computeImportCost(baseInputs) : null

  // Numbers are provisional (not verified) whenever any blocker is open.
  const numberState: ConfidenceState =
    blockers.length === 0 ? 'verified' : canCompute ? 'estimado' : 'requiere_verificacion'

  // ── (3) hoja_costos — the internal trace ───────────────────────────────────
  const sources: SourceRef[] = [{ kind: 'engine', label: 'Motor SUNAT (computeImportCost)' }]
  if (inp.freightSource) sources.push(inp.freightSource)
  if (inp.tariffSource) sources.push(inp.tariffSource)
  if (inp.trmSource) sources.push(inp.trmSource)
  if (inp.marginSource) sources.push(inp.marginSource)

  const cautions: HojaCostosPayload['cautions'] = []
  if (baseResult) {
    if (baseResult.margenNetoCaja < 0) {
      cautions.push({
        es: 'Margen neto en CAJA negativo: los impuestos recuperables (IGV/percepción) superan el margen en el desembolso. Confirmar plazo de recuperación.',
        en: 'Negative CASH net margin: recoverable taxes (IGV/percepción) exceed the margin at outlay. Confirm the recovery window.',
      })
    }
    if (baseResult.margenNetoRealPct < 0.1) {
      cautions.push({
        es: `Margen neto real ${(baseResult.margenNetoRealPct * 100).toFixed(1)}% — por debajo del 10% objetivo.`,
        en: `Real net margin ${(baseResult.margenNetoRealPct * 100).toFixed(1)}% — below the 10% target.`,
      })
    }
    if (fobOk && inp.freightInternational !== null && inp.fob !== null && inp.freightInternational > inp.fob * 0.25) {
      cautions.push({
        es: 'El flete supera el 25% del FOB — revisar la ruta / consolidar.',
        en: 'Freight exceeds 25% of FOB — review the route / consolidate.',
      })
    }
  }

  // ±flete / ±TRM sensitivity (spec-torre/03).
  const sensitivity: HojaCostosPayload['sensitivity'] = []
  if (baseResult && inp.freightInternational !== null) {
    const baseLanded = baseResult.landedCost
    const freightUp = computeImportCost({
      ...baseInputs,
      freightInternational: Math.round(inp.freightInternational * 1.1 * 100) / 100,
    })
    const freightDown = computeImportCost({
      ...baseInputs,
      freightInternational: Math.round(inp.freightInternational * 0.9 * 100) / 100,
    })
    const trmUp = computeImportCost({ ...baseInputs, exchangeRate: inp.exchangeRate + 0.1 })
    const trmDown = computeImportCost({ ...baseInputs, exchangeRate: inp.exchangeRate - 0.1 })
    sensitivity.push(
      { label: 'Flete +10%', landedCost: freightUp.landedCost, deltaLanded: round2(freightUp.landedCost - baseLanded) },
      { label: 'Flete −10%', landedCost: freightDown.landedCost, deltaLanded: round2(freightDown.landedCost - baseLanded) },
      { label: `TC +0.10 (${(inp.exchangeRate + 0.1).toFixed(2)})`, landedCost: trmUp.landedCost, deltaLanded: round2(trmUp.landedCost - baseLanded) },
      { label: `TC −0.10 (${(inp.exchangeRate - 0.1).toFixed(2)})`, landedCost: trmDown.landedCost, deltaLanded: round2(trmDown.landedCost - baseLanded) },
    )
  }

  const machine: HojaCostosPayload['machine'] = {
    productName: inp.productName,
    brand: inp.brand,
    model: inp.model,
    fuelType: inp.fuelType,
    engineCC: inp.engineCC,
    incoterm: baseIncoterm,
    origin: inp.origin,
  }

  const hojaCostos: HojaCostosPayload = {
    kind: 'HOJA_COSTOS',
    version: 1,
    title: `Hoja de costos — ${inp.productName || 'equipo'}`,
    machine,
    inputs: baseInputs as unknown as Record<string, unknown>,
    result: (baseResult ?? {}) as unknown as Record<string, unknown>,
    currency: 'USD',
    exchangeRate: inp.exchangeRate,
    marginPercent: inp.marginPercent,
    sources,
    sensitivity,
    cautions,
    // hoja blockers = the compute-affecting ones (fob/freight); tariff shows too.
    blockers,
  }

  // ── (4) cotizacion — the client-ready quote ────────────────────────────────
  const scenarios = scenarioIncoterms.map((ic) => {
    const r = canCompute ? computeImportCost(inputsFor(inp, ic)) : null
    return {
      incoterm: ic,
      landedCostMinor: r ? toMinor(r.landedCost) : null,
      unitPriceMinor: r ? toMinor(r.salePriceFinal) : null,
      confidence: numberState,
    }
  })

  const terms = [
    inp.language.startsWith('en')
      ? `Wholesale B2B pricing, valid until ${addDaysISO(inp.today, inp.validityDays)}.`
      : `Precios mayoristas B2B, válidos hasta ${addDaysISO(inp.today, inp.validityDays)}.`,
    inp.language.startsWith('en')
      ? `Incoterm ${baseIncoterm}. Prices in USD; import taxes per Peru SUNAT.`
      : `Incoterm ${baseIncoterm}. Precios en USD; tributos de importación según SUNAT Perú.`,
    inp.language.startsWith('en')
      ? 'Subject to written confirmation. Not a retail offer.'
      : 'Sujeto a confirmación por escrito. No es una oferta retail.',
  ]

  const cotizacion: CotizacionPayload = {
    kind: 'COTIZACION',
    version: 1,
    clientName: inp.clientName,
    laneCode: inp.laneCode,
    language: inp.language,
    machine,
    currency: 'USD',
    scenarios,
    quantity: inp.quantity,
    validityUntil: addDaysISO(inp.today, inp.validityDays),
    terms,
    sources,
    blockers,
    hojaCostosRef: null,
  }

  // ── (5) comunicacion — the cover message ───────────────────────────────────
  const client = inp.clientName ?? (inp.language.startsWith('en') ? 'the client' : 'el cliente')
  const body = inp.language.startsWith('en')
    ? coverEN(client, inp)
    : coverES(client, inp)
  const comunicacion: ComunicacionPayload = {
    kind: 'COMUNICACION',
    version: 1,
    channel: 'email',
    audience: 'client',
    language: inp.language,
    to: null,
    subject: inp.language.startsWith('en')
      ? `Quotation — ${inp.productName || 'equipment'}`
      : `Cotización — ${inp.productName || 'equipo'}`,
    body,
    sideEffect: {
      es: `Enviar la cotización a ${client} por correo (requiere destinatario).`,
      en: `Send the quotation to ${client} by email (recipient required).`,
    },
    // A cover message with no recipient can't be "sent" — but it CAN be reviewed.
    // The recipient gap is surfaced at approve time, not as a hard artifact blocker.
    blockers: blockers.length > 0 ? [blockers[0]] : [],
    cotizacionRef: null,
  }

  return { hojaCostos, cotizacion, comunicacion, blockers, approvable: isApprovable(cotizacion) }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ── Assembler: a model-extracted QuoteSpec + the lane's costing reference → the
// structured QuoteRunInput. Rates ALWAYS come from the lane config (never the
// model); international freight is left null when unstated (a hard blocker — never
// invented), while the standard operational gastos fall back to engine defaults. ──
export interface QuoteRunContext {
  laneCode: string | null
  igvRate: number
  percepcionRate: number
  insuranceRate: number
  /** Resolved Ad Valorem fraction, or null when the tariff is unresolved/ambiguous (→ blocker). */
  adValoremRate: number | null
  /** Candidate positions to present when the tariff is ambiguous (adValoremRate null). */
  tariffCandidates?: TariffCandidateRef[]
  exchangeRate: number
  /** Org-rule default margin (fraction) when the operator states none. */
  marginDefault: number
  freightSource: SourceRef | null
  tariffSource: SourceRef | null
  trmSource: SourceRef | null
  marginSource: SourceRef | null
  validityDays: number
  today: string
  defaultClientName: string | null
  defaultLanguage: string
}

export function assembleQuoteRunInput(spec: QuoteSpec, ctx: QuoteRunContext): QuoteRunInput {
  const fuelType = spec.fuelType ?? 'gasoline'
  return {
    productName: spec.productName ?? '',
    brand: spec.brand ?? '',
    model: spec.model ?? '',
    fuelType,
    engineCC: spec.engineCC ?? (fuelType === 'electric' ? 0 : 1500),
    origin: spec.origin ?? 'china',
    year: 2026,
    clientName: spec.clientName ?? ctx.defaultClientName,
    laneCode: ctx.laneCode,
    language: spec.language ?? ctx.defaultLanguage,
    quantity: spec.quantity && spec.quantity > 0 ? spec.quantity : 1,
    fob: spec.fob,
    incoterm: spec.incoterm ?? 'FOB',
    scenarios: spec.scenarios,
    // A route freight rate is NEVER invented — null stays null (→ rate-missing blocker).
    freightInternational: spec.freightInternational,
    // Standard operational gastos fall back to engine defaults (not route rates).
    freightZofratacna: null,
    portExpenses: null,
    customsAgency: null,
    tariffCandidates: ctx.tariffCandidates,
    igvRate: ctx.igvRate,
    percepcionRate: ctx.percepcionRate,
    insuranceRate: ctx.insuranceRate,
    adValoremRate: ctx.adValoremRate,
    marginPercent: spec.marginPercent ?? ctx.marginDefault,
    exchangeRate: ctx.exchangeRate,
    freightSource: ctx.freightSource,
    tariffSource: ctx.tariffSource,
    trmSource: ctx.trmSource,
    marginSource: ctx.marginSource,
    validityDays: ctx.validityDays,
    today: ctx.today,
  }
}

function coverES(client: string, inp: QuoteRunInput): string {
  const val = addDaysISO(inp.today, inp.validityDays)
  return [
    `Estimados ${client}:`,
    ``,
    `Adjuntamos la cotización mayorista para ${inp.productName || 'el equipo solicitado'}${inp.model ? ` (${inp.brand} ${inp.model})` : ''}, incoterm ${inp.incoterm}, en USD.`,
    `La propuesta considera el costo puesto en Perú (cadena SUNAT: CIF, Ad Valorem, ISC, IGV y percepción) con nuestro margen mayorista.`,
    `Validez hasta ${val}. Quedamos atentos para coordinar volumen, contenedor y plazos.`,
    ``,
    `Cordialmente,`,
    `Wings Global Trade`,
  ].join('\n')
}

function coverEN(client: string, inp: QuoteRunInput): string {
  const val = addDaysISO(inp.today, inp.validityDays)
  return [
    `Dear ${client},`,
    ``,
    `Please find our wholesale quotation for ${inp.productName || 'the requested equipment'}${inp.model ? ` (${inp.brand} ${inp.model})` : ''}, incoterm ${inp.incoterm}, in USD.`,
    `The proposal reflects the landed cost in Peru (SUNAT chain: CIF, Ad Valorem, ISC, IGV and percepción) with our wholesale margin.`,
    `Valid until ${val}. We remain available to align volume, container and lead times.`,
    ``,
    `Best regards,`,
    `Wings Global Trade`,
  ].join('\n')
}
