// constellation-motion.test.ts — the LOADING/CONFIRM numeric contracts (CONSTELLATION-SPEC §4).
import { describe, it, expect } from 'vitest'
import {
  easeInOutCubic,
  condensationScatter,
  confirmHalo,
  staggerFor,
  listeningSatelliteScale,
  speakingCoreScale,
  errorAmpMultiplier,
  errorDotDrop,
  LISTENING,
  SPEAKING,
  ERROR,
  CONDENSATION,
  CONFIRM,
} from './constellation-motion'

describe('easeInOutCubic', () => {
  it('pins 0, 0.5, 1 and clamps', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5)
    expect(easeInOutCubic(1)).toBe(1)
    expect(easeInOutCubic(-1)).toBe(0)
    expect(easeInOutCubic(2)).toBe(1)
  })
})

describe('condensation cycle', () => {
  it('honours the 3200ms total = condense + hold + dissolve', () => {
    expect(CONDENSATION.condenseMs + CONDENSATION.holdMs + CONDENSATION.dissolveMs).toBe(CONDENSATION.totalMs)
  })

  it('starts fully scattered and reaches formation by the end of condense', () => {
    expect(condensationScatter(0)).toBeCloseTo(1, 2) // scattered at t=0
    expect(condensationScatter(CONDENSATION.condenseMs)).toBeCloseTo(0, 2) // formed
  })

  it('holds in exact formation through the hold phase', () => {
    const mid = CONDENSATION.condenseMs + CONDENSATION.holdMs / 2
    expect(condensationScatter(mid)).toBe(0)
  })

  it('dissolves back to scattered by the end of the cycle', () => {
    const end = CONDENSATION.totalMs - 1
    expect(condensationScatter(end)).toBeGreaterThan(0.95)
  })

  it('is periodic (loops every 3200ms)', () => {
    expect(condensationScatter(500)).toBeCloseTo(condensationScatter(500 + CONDENSATION.totalMs), 6)
  })

  it('staggers near-centroid dots first (smaller rank condenses earlier)', () => {
    const t = 300 // mid-condense
    const near = condensationScatter(t, staggerFor(0))
    const far = condensationScatter(t, staggerFor(6))
    expect(near).toBeLessThan(far) // nearer dot is already more formed (less scattered)
  })
})

describe('confirm halo', () => {
  it('expands 1.0 → 1.8 and fades 0.35 → 0 over 600ms, then null', () => {
    const a = confirmHalo(0)!
    expect(a.radiusScale).toBeCloseTo(1, 3)
    expect(a.alpha).toBeCloseTo(CONFIRM.haloAlpha, 3)
    const b = confirmHalo(CONFIRM.haloMs)!
    expect(b.radiusScale).toBeCloseTo(CONFIRM.haloScale, 3)
    expect(b.alpha).toBeCloseTo(0, 3)
    expect(confirmHalo(CONFIRM.haloMs + 1)).toBeNull()
    expect(confirmHalo(-1)).toBeNull()
  })
})

describe('LISTENING (spec §4: contract 8% over 300ms, then near-still)', () => {
  it('eases 1.0 → 0.92 across 300ms', () => {
    expect(listeningSatelliteScale(0)).toBe(1)
    expect(listeningSatelliteScale(150)).toBeCloseTo(0.96, 2) // mid-contraction (eased)
    expect(listeningSatelliteScale(LISTENING.contractMs)).toBeCloseTo(0.92, 5)
    expect(listeningSatelliteScale(1000)).toBeCloseTo(0.92, 5) // holds after contraction
  })
  it('reduced motion → the settled scale (still frame, not a perpetual breath)', () => {
    expect(listeningSatelliteScale(150, true)).toBe(LISTENING.contractTo)
  })
})

describe('SPEAKING (spec §4: core pulse amp 0.004, ≤8Hz)', () => {
  it('pulses within ±0.004 of 1.0 and caps the frequency at 8Hz', () => {
    const s = speakingCoreScale(50, 6)
    expect(Math.abs(s - 1)).toBeLessThanOrEqual(SPEAKING.amp + 1e-9)
    // a runaway cadence is throttled to 8Hz (no faster pulse than the spec cap)
    expect(speakingCoreScale(31.25, 100)).toBeCloseTo(speakingCoreScale(31.25, 8), 9)
  })
  it('reduced motion → still (no pulse)', () => {
    expect(speakingCoreScale(50, 6, true)).toBe(1)
  })
})

describe('ERROR (spec §4: loosen amp ×2 for 400ms, dots drop — NEVER shakes/red)', () => {
  it('amp multiplier is 2× at onset and eases to 1× by 400ms', () => {
    expect(errorAmpMultiplier(0)).toBeCloseTo(ERROR.ampMultiplier, 5)
    expect(errorAmpMultiplier(ERROR.loosenMs)).toBe(1)
    expect(errorAmpMultiplier(401)).toBe(1) // past the window
    expect(errorAmpMultiplier(200, true)).toBe(1) // reduced motion
  })
  it('dots 2 & 10 drop up to 0.02 then return (a displacement, not a shake — never negative)', () => {
    expect(errorDotDrop(0)).toBeCloseTo(0, 5)
    expect(errorDotDrop(ERROR.loosenMs / 2)).toBeCloseTo(ERROR.dotDrop, 5) // peak at mid
    expect(errorDotDrop(ERROR.loosenMs)).toBeCloseTo(0, 5)
    // the displacement is monotone non-negative (no oscillating shake)
    for (let t = 0; t <= ERROR.loosenMs; t += 40) expect(errorDotDrop(t)).toBeGreaterThanOrEqual(0)
    expect(errorDotDrop(200, true)).toBe(0)
  })
})
