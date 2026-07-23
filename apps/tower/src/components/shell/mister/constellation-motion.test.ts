// constellation-motion.test.ts — the LOADING/CONFIRM numeric contracts (CONSTELLATION-SPEC §4).
import { describe, it, expect } from 'vitest'
import {
  easeInOutCubic,
  condensationScatter,
  confirmHalo,
  staggerFor,
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
