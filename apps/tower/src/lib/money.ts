// src/lib/money.ts
// Money is ALWAYS integer minor units + an ISO currency code (TOWER Directive 3).
// Percentages are basis points (1% = 100 bps). Every helper keeps values as
// integers; the ONLY rounding is an explicit Math.round where a fractional
// quantity or bps is applied. Never do money arithmetic on a formatted string,
// and never let a float touch a stored amount.
//
// Assumes 2-decimal (exponent-2) currencies for display (USD/EUR/PEN). If a
// zero- or three-decimal currency is ever added, formatMinor must consult the
// currency's exponent — flagged here so it isn't silently wrong.

export interface Money {
  minor: number
  currency: string
}

export function money(minor: number, currency: string): Money {
  if (!Number.isInteger(minor)) throw new Error(`money.minor must be an integer, got ${minor}`)
  return { minor, currency }
}

/** Sum amounts of the SAME currency. Throws on mismatch — never silently coerces. */
export function addMinor(items: Money[]): Money {
  if (items.length === 0) throw new Error('addMinor: no items')
  const currency = items[0].currency
  let total = 0
  for (const it of items) {
    if (it.currency !== currency) throw new Error(`addMinor: currency mismatch ${it.currency} vs ${currency}`)
    if (!Number.isInteger(it.minor)) throw new Error(`addMinor: non-integer minor ${it.minor}`)
    total += it.minor
  }
  return { minor: total, currency }
}

/** unitPriceMinor × quantity (quantity may be fractional: CBM, MT, keys). Rounds to nearest integer minor. */
export function lineTotalMinor(unitPriceMinor: number, quantity: number): number {
  if (!Number.isInteger(unitPriceMinor)) throw new Error(`lineTotalMinor: non-integer price ${unitPriceMinor}`)
  return Math.round(unitPriceMinor * quantity)
}

/** Apply basis points: minor × bps / 10_000, rounded to nearest integer minor. */
export function applyBps(minor: number, bps: number): number {
  if (!Number.isInteger(minor)) throw new Error(`applyBps: non-integer minor ${minor}`)
  return Math.round((minor * bps) / 10_000)
}

/** Display only. Never feed the returned string back into arithmetic. */
export function formatMinor(minor: number, currency: string, locale = 'es-PE'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100)
}
