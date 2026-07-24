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

// ── L7 · remaining states (LISTENING · SPEAKING · ERROR) + watch-catch pulse ──

/** LISTENING: a slow, calm breathing scale (the tower is attentive but still). */
export const LISTENING = { periodMs: 2400, amplitude: 0.06 } as const // ±6% core radius
/** SPEAKING: a faster, shallower pulse synced to output cadence. */
export const SPEAKING = { periodMs: 900, amplitude: 0.09 } as const
/** ERROR: a single amber shake that decays — never a loop (an error states once). */
export const ERROR = { durationMs: 500, shakes: 3, maxOffset: 0.05 } as const // fraction of radius
/** WATCH-CATCH: the pulse when a watch signal is caught — a single sharp ring (spec 05). */
export const WATCH_CATCH = { pulseMs: 720, ringScale: 2.1, alpha: 0.4 } as const

/** Reduced-motion collapses every animated state to a still frame (scale 1, no offset). */
export function breathingScale(elapsedMs: number, state: 'listening' | 'speaking', reducedMotion = false): number {
  if (reducedMotion) return 1
  const { periodMs, amplitude } = state === 'listening' ? LISTENING : SPEAKING
  // a smooth sine breath around 1.0
  return 1 + amplitude * Math.sin((2 * Math.PI * elapsedMs) / periodMs)
}

/**
 * ERROR shake offset (fraction of radius) at `elapsedMs`: a decaying sine that runs once
 * over durationMs then settles to 0. Reduced motion → always 0 (the color still signals).
 */
export function errorShake(elapsedMs: number, reducedMotion = false): number {
  if (reducedMotion || elapsedMs < 0 || elapsedMs > ERROR.durationMs) return 0
  const t = elapsedMs / ERROR.durationMs
  const decay = 1 - t // amplitude fades to 0 by the end
  return ERROR.maxOffset * decay * Math.sin(2 * Math.PI * ERROR.shakes * t)
}

/**
 * WATCH-CATCH ring at `elapsedMs` since a signal was caught: 0→1 expansion over 720ms,
 * then null. Reduced motion → a single static frame at full ring, no expansion.
 */
export function watchCatchRing(elapsedMs: number, reducedMotion = false): { radiusScale: number; alpha: number } | null {
  if (elapsedMs < 0 || elapsedMs > WATCH_CATCH.pulseMs) return null
  if (reducedMotion) return { radiusScale: WATCH_CATCH.ringScale, alpha: WATCH_CATCH.alpha }
  const t = elapsedMs / WATCH_CATCH.pulseMs
  const eased = easeInOutCubic(t)
  return {
    radiusScale: 1 + (WATCH_CATCH.ringScale - 1) * eased,
    alpha: WATCH_CATCH.alpha * (1 - t),
  }
}
