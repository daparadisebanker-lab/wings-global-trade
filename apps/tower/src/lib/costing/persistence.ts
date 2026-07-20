// src/lib/costing/persistence.ts
// The engine ↔ TOWER money boundary (SPEC §2.1). The engine computes in
// decimal.js and emits `number`s ALREADY rounded to 2 decimals (r2) for every
// money field. Crossing into storage we extract the queryable figures as integer
// minor units and the exchange rate as an integer ×1000. Because the inputs are
// pre-rounded to cents, `usd * 100` is integer-valued and `Math.round` is exact
// (no half-way case, so the rounding-direction concern that rules out a full
// integer reimplementation does not apply here — see phase0/G1-G2-technical.md).
import type { ImportInputs, ImportResult } from './types'

/** USD major (2dp) → integer minor units. Exact for engine outputs. */
export function toMinor(usd: number): number {
  return Math.round(usd * 100)
}

/** Exchange rate → integer ×1000 (per-operation data, not a statutory rate). */
export function rateToMilli(tc: number): number {
  return Math.round(tc * 1000)
}

/** The queryable integer columns extracted from a computed result + inputs. */
export interface CostCalcMoney {
  incoterm: string
  exchange_rate_milli: number
  landed_minor: number
  cash_outlay_minor: number
  sale_price_minor: number
  margin_minor: number
}

export function costCalcMoney(inputs: ImportInputs, result: ImportResult): CostCalcMoney {
  return {
    incoterm: inputs.incoterm,
    exchange_rate_milli: rateToMilli(inputs.exchangeRate),
    landed_minor: toMinor(result.landedCost),
    cash_outlay_minor: toMinor(result.cashOutlay),
    sale_price_minor: toMinor(result.salePrice),
    margin_minor: toMinor(result.marginUSD),
  }
}
