// src/lib/torre/tariff.ts
// Tariff (HS) candidate resolution for the quote run (Mister Torre A2). PURE +
// unit-tested. Given the brand's curated tariff_positions and a product text, return
// the matching candidate positions by keyword. The action then: 1 candidate →
// resolve the duty (blocking if the position is unverified/stale); ≥2 → ambiguous
// (the quote run blocks and PRESENTS both); 0 → brand default or block. Never guesses.

export interface TariffPosition {
  hsCode: string
  description: string
  keywords: string[]
  dutyBps: number
  ivaBps: number
  verifiedAt: string | null
}

/** A candidate as shown to the reviewer (duty as a fraction). */
export interface TariffCandidate {
  hsCode: string
  description: string
  dutyPct: number
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents so 'electrógeno' matches 'electrogeno'
    .trim()
}

/**
 * PURE: positions whose any keyword appears in the product text. Deterministic and
 * order-preserving (input order). Empty text or no keywords → no candidates.
 */
export function resolveTariffCandidates(positions: TariffPosition[], text: string): TariffPosition[] {
  const hay = norm(text)
  if (hay.length === 0) return []
  return positions.filter((p) => p.keywords.some((k) => norm(k).length > 0 && hay.includes(norm(k))))
}

/** Shape a position into the reviewer-facing candidate. */
export function toCandidate(p: TariffPosition): TariffCandidate {
  return { hsCode: p.hsCode, description: p.description, dutyPct: p.dutyBps / 10_000 }
}
