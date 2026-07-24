// constellation-motion.test.ts — the LOADING/CONFIRM numeric contracts (CONSTELLATION-SPEC §4).
import { describe, it, expect } from 'vitest'
import {
  easeInOutCubic,
  condensationScatter,
  confirmHalo,
  staggerFor,
  breathingScale,
  errorShake,
  watchCatchRing,
  CONDENSATION,
  CONFIRM,
  WATCH_CATCH,
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

describe('L7 states — LISTENING / SPEAKING breathing', () => {
  it('breathes around 1.0 and reduced motion pins to 1', () => {
    expect(breathingScale(0, 'listening')).toBeCloseTo(1, 5) // sin(0)=0
    const peak = breathingScale(2400 / 4, 'listening') // quarter period → sin=1
    expect(peak).toBeGreaterThan(1)
    expect(breathingScale(225, 'speaking', true)).toBe(1) // reduced motion → still
  })

  it('speaking pulses faster (shorter period) than listening', () => {
    // at the same elapsed the two states differ (different periods) — sanity, not identical
    expect(breathingScale(450, 'speaking')).not.toBeCloseTo(breathingScale(450, 'listening'), 3)
  })
})

describe('L7 states — ERROR shake', () => {
  it('runs once, decays to 0, and is 0 outside its window / under reduced motion', () => {
    expect(errorShake(0)).toBeCloseTo(0, 5) // sin(0)=0 at start
    expect(errorShake(600)).toBe(0) // past durationMs
    expect(errorShake(-1)).toBe(0)
    expect(errorShake(200, true)).toBe(0) // reduced motion
    // amplitude decays: an early peak exceeds a late one
    const early = Math.abs(errorShake(500 / 12))
    const late = Math.abs(errorShake((500 * 11) / 12))
    expect(early).toBeGreaterThan(late)
  })
})

describe('L7 states — watch-catch ring', () => {
  it('expands 1→ringScale then ends; reduced motion shows a static ring', () => {
    const start = watchCatchRing(0)
    expect(start?.radiusScale).toBeCloseTo(1, 3)
    expect(start?.alpha).toBeCloseTo(WATCH_CATCH.alpha, 3)
    expect(watchCatchRing(WATCH_CATCH.pulseMs + 1)).toBeNull()
    const rm = watchCatchRing(200, true)
    expect(rm?.radiusScale).toBe(WATCH_CATCH.ringScale) // static full ring, no expansion
  })
})
