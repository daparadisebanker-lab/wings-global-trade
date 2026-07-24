// src/lib/torre/rates.ts
// Freight-rate resolution for the quote run (Mister Torre A1). PURE + unit-tested:
// given the lane's rate_tables rows, pick the best matching FREIGHT rate for the
// route/mode/container. Prefers a CURRENTLY-VALID rate; if only lapsed rates exist it
// returns the most recent one WITH its validUntil, so the quote run computes a
// provisional number and raises the rate-expiry blocker (never invents a rate — the
// caller passes null when nothing matches, which becomes the rate-missing blocker).
import type { SourceRef } from './artifacts'

export interface RateRow {
  kind: 'FREIGHT' | 'INSURANCE'
  route: string
  mode: 'SEA' | 'AIR' | 'LAND'
  containerType: string | null
  rateMinor: number
  currency: string
  validFrom: string // ISO date
  validTo: string | null // ISO date; null = open-ended
  source: string | null
}

export interface FreightCriteria {
  mode?: string
  containerType?: string
  route?: string
}

export interface ResolvedFreight {
  /** USD major units for the SUNAT engine (rate_minor / 100). */
  rateMajor: number
  currency: string
  source: SourceRef
}

function isValidAt(r: RateRow, today: string): boolean {
  return r.validFrom <= today && (r.validTo === null || today <= r.validTo)
}

/**
 * PURE: the best FREIGHT rate that ACTUALLY APPLIES, or null (→ the caller raises the
 * rate-missing blocker; a rate is never invented). Criteria are HARD FILTERS, not mere
 * preferences — a rate that doesn't match the shipment can't be used:
 *  · currency must be USD (the engine's unit; multi-currency is not modelled yet);
 *  · a row not yet effective (validFrom > today) is excluded — pricing on a
 *    not-in-force rate would escape both blockers;
 *  · mode/route must equal when the caller specifies them; containerType must be an
 *    exact match OR a generic (null) row.
 * Among survivors it prefers currently-valid over lapsed, then exact container, then
 * recency, then a fully deterministic total order (cheapest, then route). A lapsed
 * survivor keeps its PAST validUntil so the quote run raises the rate-expiry blocker.
 */
export function resolveFreightRate(rows: RateRow[], criteria: FreightCriteria, today: string): ResolvedFreight | null {
  const applicable = rows.filter(
    (r) =>
      r.kind === 'FREIGHT' &&
      r.currency === 'USD' &&
      r.validFrom <= today && // exclude not-yet-effective (future) rates
      (!criteria.mode || r.mode === criteria.mode) &&
      (!criteria.route || r.route === criteria.route) &&
      (!criteria.containerType || r.containerType === null || r.containerType === criteria.containerType),
  )
  if (applicable.length === 0) return null

  const best = [...applicable].sort((a, b) => {
    const va = isValidAt(a, today) ? 1 : 0
    const vb = isValidAt(b, today) ? 1 : 0
    if (va !== vb) return vb - va // currently-valid before lapsed
    const sa = criteria.containerType && a.containerType === criteria.containerType ? 1 : 0
    const sb = criteria.containerType && b.containerType === criteria.containerType ? 1 : 0
    if (sa !== sb) return sb - sa // exact container before generic
    if (a.validFrom !== b.validFrom) return b.validFrom.localeCompare(a.validFrom) // recency
    if (a.rateMinor !== b.rateMinor) return a.rateMinor - b.rateMinor // deterministic: cheaper first
    return a.route.localeCompare(b.route) // final total order
  })[0]

  const label = `Flete ${best.route} ${best.mode}${best.containerType ? ` ${best.containerType}` : ''}`.trim()
  const source: SourceRef = {
    kind: 'rate_table',
    label,
    ref: best.source ?? undefined,
    validUntil: best.validTo ?? undefined,
  }
  return { rateMajor: best.rateMinor / 100, currency: best.currency, source }
}
