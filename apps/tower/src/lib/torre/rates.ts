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
 * PURE: best FREIGHT rate for the criteria, or null when the brand has none. Scoring
 * favours (in order): currently-valid, exact container, matching route, matching mode,
 * then the most recently effective row.
 */
export function resolveFreightRate(rows: RateRow[], criteria: FreightCriteria, today: string): ResolvedFreight | null {
  const freight = rows.filter((r) => r.kind === 'FREIGHT')
  if (freight.length === 0) return null

  function score(r: RateRow): number {
    let s = 0
    if (isValidAt(r, today)) s += 1000
    if (criteria.containerType && r.containerType === criteria.containerType) s += 100
    if (criteria.route && r.route === criteria.route) s += 50
    if (criteria.mode && r.mode === criteria.mode) s += 10
    return s
  }

  const best = [...freight].sort((a, b) => {
    const d = score(b) - score(a)
    if (d !== 0) return d
    return b.validFrom.localeCompare(a.validFrom) // recency tiebreak
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
