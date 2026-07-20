// src/lib/costing/ad-valorem.ts
// Pure HS-code → Ad Valorem resolution (G5). Lives outside the 'use server'
// action module so it can be imported by client components (a 'use server' file
// may only export async functions). The rate table is sourced server-side via
// getCostingReference; this just does the longest-prefix match.

export interface AdValoremRate {
  hsPrefix: string
  bps: number
  label: string | null
}

/** Longest-prefix match of an HS code against the brand's Ad Valorem table. */
export function resolveAdValoremRate(rates: AdValoremRate[], hsCode: string): number {
  const code = (hsCode ?? '').replace(/\D/g, '')
  let best: AdValoremRate | null = null
  for (const r of rates) {
    if (code.startsWith(r.hsPrefix) && (!best || r.hsPrefix.length > best.hsPrefix.length)) best = r
  }
  return best ? best.bps / 10_000 : 0
}
