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

/**
 * PURE: resolve the tariff positions for a quote, honoring an agent's chosen HS code
 * ONLY when it is one of the KEYWORD candidates. This closes the pin bypass: an agent
 * cannot pin an unrelated position (e.g. a fresh 0%-duty code) to dodge the ambiguity
 * blocker — a hint outside the candidate set is ignored, so ≥2 candidates still block.
 * Returns the chosen positions and whether the agent's pin actually applied.
 */
export function resolveQuoteTariff(
  positions: TariffPosition[],
  productText: string,
  hsCodeHint?: string,
): { positions: TariffPosition[]; pinnedByAgent: boolean } {
  const candidates = resolveTariffCandidates(positions, productText)
  if (hsCodeHint) {
    const pinned = candidates.find((p) => p.hsCode === hsCodeHint)
    if (pinned) return { positions: [pinned], pinnedByAgent: true }
    // hint not among the keyword candidates → ignore it, keep the real candidate set
  }
  return { positions: candidates, pinnedByAgent: false }
}
