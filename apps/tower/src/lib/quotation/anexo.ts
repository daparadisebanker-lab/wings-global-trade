// src/lib/quotation/anexo.ts
// The Anexo (landed-cost annex) model — a SEPARATE branded document that enlists
// the APPROXIMATE logistic handling costs to the port of destination, plus the
// proforma sale, plus the landed cost to the client. It is a render of the SAME
// quote it annexes: `proformaSaleMinor` is the quote's total_minor (NEVER a copied
// constant — the bug the 0.35→0.40 change exposed), and the grand total is
// computed, not stored. Freight/insurance lines are resolved from tower.rate_tables
// (lib/torre/rates.ts) — never invented; a missing rate renders "No incluido", a
// lapsed one renders flagged. Money is integer minor units (Directive 3); the only
// arithmetic here is addition.
import type { CompanyInfo } from './company'
import type { SourceRef } from '@/lib/torre/artifacts'
import type { ResolvedFreight } from '@/lib/torre/rates'

/** A single logistics line. `amountMinor: null` → the doc prints "No incluido". */
export interface AnexoLine {
  label: string
  /** Integer minor units, or null when the item is not included / has no rate. */
  amountMinor: number | null
  /** Provenance for a resolved rate (rate_tables); absent for stored/manual lines. */
  source?: SourceRef
  /** An estimate / lapsed-rate marker (rendered with the "requiere verificación" cue). */
  flagged?: boolean
}

export interface AnexoDocument {
  /** The proforma this annexes (e.g. "PF-WGT-2026-0723"); null before issue. */
  anexoOf: string | null
  issuer: CompanyInfo
  /** Resolved issuing-entity id (issuers.ts). */
  issuerId: string
  /** Language posture from the entity (CL → 'es'). */
  locale: 'es' | 'es-en'
  issuedCity: string
  issuedOn: string | null
  route: { origin: string | null; destination: string | null }
  /** CBM / revenue-ton label, e.g. "10.30 RT"; null when unknown. */
  cbmLabel: string | null
  currency: string
  lines: AnexoLine[]
  /** Σ of the non-null line amounts (only included items count). */
  logisticsSubtotalMinor: number
  /** The quote's total — the sale agreed on the proforma. */
  proformaSaleMinor: number
  /** logisticsSubtotal + proformaSale — the client's landed cost to destination. */
  grandTotalMinor: number
  /** Whether any line is flagged (drives the referential caveat emphasis). */
  hasFlagged: boolean
  observations: string[]
}

// ── Route derivation (pure) ──────────────────────────────────────────────────
// Map a free-text port ("Qingdao, China") to a rate_tables route token
// ("CN-QINGDAO"). Known ports only — an unknown port yields null, so freight
// resolves to "No incluido" rather than a wrong route match.
const PORT_TOKENS: Array<{ match: RegExp; token: string }> = [
  { match: /qingdao/i, token: 'CN-QINGDAO' },
  { match: /shanghai/i, token: 'CN-SHANGHAI' },
  { match: /ningbo/i, token: 'CN-NINGBO' },
  { match: /callao/i, token: 'PE-CALLAO' },
  { match: /paita/i, token: 'PE-PAITA' },
  { match: /iquique/i, token: 'CL-IQUIQUE' },
  { match: /antofagasta/i, token: 'CL-ANTOFAGASTA' },
  { match: /arica/i, token: 'CL-ARICA' },
]

export function portToken(port: string | null | undefined): string | null {
  if (!port) return null
  const hit = PORT_TOKENS.find((p) => p.match.test(port))
  return hit ? hit.token : null
}

/** "CN-QINGDAO>CL-IQUIQUE", or null when either port is unknown. */
export function deriveRouteCode(origin: string | null | undefined, destination: string | null | undefined): string | null {
  const o = portToken(origin)
  const d = portToken(destination)
  return o && d ? `${o}>${d}` : null
}

// ── Document assembly (pure) ─────────────────────────────────────────────────

/** Sum only the included (non-null) line amounts. */
export function logisticsSubtotal(lines: AnexoLine[]): number {
  return lines.reduce((acc, l) => acc + (l.amountMinor ?? 0), 0)
}

/**
 * PURE: a resolved freight rate → an AnexoLine. No rate → "No incluido" (null).
 * A lapsed rate (its validUntil is before today) is shown but flagged, mirroring
 * the rate-expiry honesty law in resolveFreightRate.
 */
export function freightLineFrom(resolved: ResolvedFreight | null, today: string, label: string): AnexoLine {
  if (!resolved) return { label, amountMinor: null }
  const amountMinor = Math.round(resolved.rateMajor * 100)
  const lapsed = !!resolved.source.validUntil && resolved.source.validUntil < today
  return { label, amountMinor, source: resolved.source, ...(lapsed ? { flagged: true } : {}) }
}

export interface BuildAnexoParams {
  anexoOf: string | null
  issuer: CompanyInfo
  issuerId: string
  locale: 'es' | 'es-en'
  issuedCity: string
  issuedOn: string | null
  route: { origin: string | null; destination: string | null }
  cbmLabel: string | null
  currency: string
  lines: AnexoLine[]
  /** The quote total — the proforma sale (never re-derived here). */
  proformaSaleMinor: number
  observations?: string[]
}

/**
 * PURE: assemble the annex. Subtotal = Σ included lines; grand total = subtotal +
 * the proforma sale. No line amount is invented, no total is copied — both totals
 * derive from the inputs every time (change the quote total → grand total moves).
 */
export function buildAnexoDocument(p: BuildAnexoParams): AnexoDocument {
  const logisticsSubtotalMinor = logisticsSubtotal(p.lines)
  return {
    anexoOf: p.anexoOf,
    issuer: p.issuer,
    issuerId: p.issuerId,
    locale: p.locale,
    issuedCity: p.issuedCity,
    issuedOn: p.issuedOn,
    route: p.route,
    cbmLabel: p.cbmLabel,
    currency: p.currency,
    lines: p.lines,
    logisticsSubtotalMinor,
    proformaSaleMinor: p.proformaSaleMinor,
    grandTotalMinor: logisticsSubtotalMinor + p.proformaSaleMinor,
    hasFlagged: p.lines.some((l) => l.flagged === true),
    observations:
      p.observations ?? [
        'Los montos son aproximaciones sujetas a variación según tarifas vigentes, tipo de cambio y condiciones portuarias.',
        'El costo de carga, descarga y almacenaje en destino no está incluido.',
        'Este anexo es referencial y complementa la proforma; no constituye una factura.',
      ],
  }
}
