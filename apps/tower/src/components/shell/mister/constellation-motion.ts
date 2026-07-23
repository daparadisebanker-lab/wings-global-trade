// constellation-motion.ts — PURE timing for the Constellation's LOADING and CONFIRM
// states (CONSTELLATION-SPEC §4). Extracted from the canvas so the numeric contracts
// are unit-testable: the render loop just calls these with `elapsed` and draws.
//
// LOADING (condensation cycle): initial scatter radius 0.5; condense 1100ms cubic
// ease-in-out with per-dot stagger by distance from centroid (near first, ~40ms/step);
// hold 1000ms; dissolve 1100ms; total 3200ms — then loops.
// CONFIRM: one Sky halo pulse, 1.8·r, 600ms, once.

export const CONDENSATION = {
  scatter: 0.5, // initial scatter radius (fraction of canvas), from the centroid
  condenseMs: 1100,
  holdMs: 1000,
  dissolveMs: 1100,
  totalMs: 3200,
  perDotStaggerMs: 40, // near-centroid dots condense first
} as const

export const CONFIRM = {
  haloMs: 600,
  haloScale: 1.8, // ring grows to 1.8× the field's core radius
  haloAlpha: 0.35, // Sky stroke alpha at the start of the pulse
} as const

/** Cubic ease-in-out (the spec's condense/dissolve easing). */
export function easeInOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

/**
 * How SCATTERED a dot is at `elapsedMs` into the condensation cycle: 1 = fully
 * scattered (at radius `scatter`), 0 = exactly in formation. `staggerMs` delays a
 * dot's condense by its distance rank (near-centroid dots have the smallest delay).
 * Pure and periodic (loops every totalMs).
 */
export function condensationScatter(elapsedMs: number, staggerMs = 0): number {
  const { condenseMs, holdMs, dissolveMs, totalMs } = CONDENSATION
  const cycle = ((elapsedMs % totalMs) + totalMs) % totalMs
  if (cycle < condenseMs) {
    // condense: scattered → formed, delayed by staggerMs, over the remaining window
    const window = Math.max(1, condenseMs - staggerMs)
    const p = easeInOutCubic((cycle - staggerMs) / window)
    return 1 - p
  }
  if (cycle < condenseMs + holdMs) return 0 // hold in formation
  // dissolve: formed → scattered
  const p = easeInOutCubic((cycle - condenseMs - holdMs) / dissolveMs)
  return p
}

/** The per-dot stagger (ms) for a dot at `rank` (0 = nearest the centroid). */
export function staggerFor(rank: number): number {
  return rank * CONDENSATION.perDotStaggerMs
}

/**
 * CONFIRM halo progress at `elapsedMs` since the confirm started: 0→1 over 600ms,
 * then null (pulse is over — draw nothing). Returns {radiusScale, alpha} while active.
 */
export function confirmHalo(elapsedMs: number): { radiusScale: number; alpha: number } | null {
  if (elapsedMs < 0 || elapsedMs > CONFIRM.haloMs) return null
  const t = elapsedMs / CONFIRM.haloMs
  const eased = easeInOutCubic(t)
  return {
    // ring expands 1.0 → haloScale
    radiusScale: 1 + (CONFIRM.haloScale - 1) * eased,
    // alpha fades haloAlpha → 0
    alpha: CONFIRM.haloAlpha * (1 - t),
  }
}
