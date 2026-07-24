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

// ── L7 · remaining states — VERBATIM from CONSTELLATION-SPEC §4 (measured contracts,
//        never invented). The state table is CLOSED — no state is added here. ──────────

/** LISTENING: satellites contract 8% toward the centroid over 300 ms, then residual amp 0.002. */
export const LISTENING = { contractMs: 300, contractTo: 0.92, residualAmp: 0.002 } as const
/** SPEAKING: core radial pulse amp 0.004 synced to token cadence, throttled ≤ 8 Hz. */
export const SPEAKING = { amp: 0.004, maxHz: 8, settleMs: 300 } as const
/** ERROR: field loosens (amp ×2 for 400 ms), dots 2 & 10 drop 0.02, core cools toward
 *  Horizon. NEVER shakes, NEVER turns red (spec §4, verbatim). */
export const ERROR = { loosenMs: 400, ampMultiplier: 2, dotDrop: 0.02 } as const

/**
 * LISTENING: the satellite-radius scale at `elapsedMs` — eases 1.0 → 0.92 (an 8% contraction
 * toward the centroid) over 300 ms, then holds near-still (residual amp is 0.002, negligible).
 * Reduced motion → the settled 0.92 (a still frame, not a perpetual breath).
 */
export function listeningSatelliteScale(elapsedMs: number, reducedMotion = false): number {
  if (reducedMotion) return LISTENING.contractTo
  if (elapsedMs <= 0) return 1
  if (elapsedMs >= LISTENING.contractMs) return LISTENING.contractTo
  return 1 - (1 - LISTENING.contractTo) * easeInOutCubic(elapsedMs / LISTENING.contractMs)
}

/**
 * SPEAKING: the core-radius scale — a tiny pulse (amp 0.004) at the token cadence, capped at
 * 8 Hz. Nearly still on purpose (the tower's restraint). Reduced motion → 1 (no pulse).
 */
export function speakingCoreScale(elapsedMs: number, tokenCadenceHz = 6, reducedMotion = false): number {
  if (reducedMotion) return 1
  const hz = Math.min(Math.max(0, tokenCadenceHz), SPEAKING.maxHz)
  return 1 + SPEAKING.amp * Math.sin(2 * Math.PI * hz * (elapsedMs / 1000))
}

/**
 * ERROR: the field's idle-amplitude MULTIPLIER — doubles at onset and eases back to 1× over
 * 400 ms (the field "loosens"). NO shake, NO red — the core cooling toward Horizon (a blue)
 * is a color concern handled by the field. Reduced motion → 1 (color still signals).
 */
export function errorAmpMultiplier(elapsedMs: number, reducedMotion = false): number {
  if (reducedMotion || elapsedMs < 0 || elapsedMs > ERROR.loosenMs) return 1
  return 1 + (ERROR.ampMultiplier - 1) * (1 - elapsedMs / ERROR.loosenMs)
}

/**
 * ERROR: how far dots 2 & 10 have dropped out of formation at `elapsedMs` (0 → 0.02 → 0 over
 * 400 ms, a gentle displacement — not a shake). Reduced motion → 0.
 */
export function errorDotDrop(elapsedMs: number, reducedMotion = false): number {
  if (reducedMotion || elapsedMs < 0 || elapsedMs > ERROR.loosenMs) return 0
  return ERROR.dotDrop * Math.sin(Math.PI * (elapsedMs / ERROR.loosenMs))
}
