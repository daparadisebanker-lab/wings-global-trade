import { describe, expect, it } from 'vitest'
import { formatHex, interpolate, oklch } from 'culori'
import { RAMP_STOPS, rampColor } from './ramp'

const encodes = { encodes: 'test-fixture-variable' }

// oklch() types the return as `Oklch | undefined` because it also accepts
// arbitrary strings that may fail to parse — every hex here is one this
// module produced or a frozen ramp stop literal, so it always parses.
function lch(hex: string): { c: number; h: number } {
  const color = oklch(hex)
  if (!color) throw new Error(`unparseable color in test fixture: ${hex}`)
  return { c: color.c ?? 0, h: color.h ?? 0 }
}

describe('rampColor — endpoints', () => {
  it.each(RAMP_STOPS.map((s) => [s.t, s.hex] as const))(
    'returns the exact stop hex at t=%s',
    (t, hex) => {
      expect(rampColor(t, encodes)).toBe(hex)
    },
  )
})

describe('rampColor — INSTRUMENT COLOR law (encodes required)', () => {
  it('throws when meta is missing entirely', () => {
    // @ts-expect-error — exercising the runtime guard against a missing arg
    expect(() => rampColor(0.5)).toThrow(/encodes/)
  })

  it('throws when encodes is undefined', () => {
    // @ts-expect-error — exercising the runtime guard against a bad shape
    expect(() => rampColor(0.5, {})).toThrow(/encodes/)
  })

  it('throws when encodes is not a string', () => {
    // @ts-expect-error — exercising the runtime guard against a wrong type
    expect(() => rampColor(0.5, { encodes: 42 })).toThrow(/encodes/)
  })

  it('throws when encodes is an empty string', () => {
    expect(() => rampColor(0.5, { encodes: '' })).toThrow(/encodes/)
  })

  it('throws when encodes is whitespace only', () => {
    expect(() => rampColor(0.5, { encodes: '   ' })).toThrow(/encodes/)
  })

  it('does not throw with a valid encodes string', () => {
    expect(() => rampColor(0.5, { encodes: 'fillmeter.pct' })).not.toThrow()
  })
})

describe('rampColor — t clamping', () => {
  it('clamps t below 0 to the t=0 stop', () => {
    expect(rampColor(-5, encodes)).toBe(RAMP_STOPS[0].hex)
    expect(rampColor(-0.001, encodes)).toBe(RAMP_STOPS[0].hex)
  })

  it('clamps t above 1 to the t=1 stop', () => {
    expect(rampColor(5, encodes)).toBe(RAMP_STOPS[RAMP_STOPS.length - 1].hex)
    expect(rampColor(1.001, encodes)).toBe(RAMP_STOPS[RAMP_STOPS.length - 1].hex)
  })
})

describe('rampColor — hue-exclusion corridor (D-2 regression gate)', () => {
  // Founder ruling D-2 (2026-07-08, spec/DEFERRED.md): the ramp is a thermal
  // reading — its chromatic path may only occupy the blue corridor on the
  // cold side and the warm corridor on the hot side. Green/cyan is not on
  // the instrument's temperature register at ANY visible chroma: the old
  // polar-OKLCH interpolation detoured the azul→white segment through
  // h≈220°→150° (cyan→mint), which this suite exists to keep dead.
  //
  // Measured (culori, OKLab piecewise, 2026-07-08, t sampled 0..1 @ 0.01):
  //   cold-side chromatic hues span 250.1°–259.3°; warm-side 36.6°–81.5°;
  //   chroma < NEUTRAL_THRESHOLD only inside t ∈ [0.47, 0.53] around the
  //   warm-white stop. Corridors below carry margin around those spans.
  const NEUTRAL_THRESHOLD = 0.02 // below this a sample is neutral; hue is noise
  const COLD_CORRIDOR = [230, 290] as const // blue; measured 250.1–259.3
  const WARM_CORRIDOR = [15, 100] as const // gold→burnt orange; measured 36.6–81.5
  const GREEN_CYAN_BAND = [100, 220] as const // fail here at any visible chroma

  const inBand = (h: number, [lo, hi]: readonly [number, number]) =>
    h >= lo && h <= hi

  it('every sample is neutral or inside its side\'s corridor — never green/cyan', () => {
    for (let i = 0; i <= 100; i++) {
      const t = i / 100
      const { c, h } = lch(rampColor(t, encodes))
      if (c < NEUTRAL_THRESHOLD) continue // neutral neighborhood — exempt

      expect(
        inBand(h, GREEN_CYAN_BAND),
        `green/cyan hue ${h.toFixed(1)}° at t=${t} (chroma ${c.toFixed(3)}) — thermal ramp left the temperature register`,
      ).toBe(false)

      const corridor = t <= 0.5 ? COLD_CORRIDOR : WARM_CORRIDOR
      expect(
        inBand(h, corridor),
        `hue ${h.toFixed(1)}° at t=${t} outside the ${t <= 0.5 ? 'cold/blue' : 'warm'} corridor [${corridor.join(', ')}]`,
      ).toBe(true)
    }
  })

  it('proves the gate catches the failure it was built for: polar-OKLCH azul→white violates the corridor', () => {
    // The retired interpolation mode, reproduced locally. If this ever stops
    // violating the band, the corridor bounds have gone soft — tighten them.
    const oldSegment = interpolate(
      [RAMP_STOPS[1].hex, RAMP_STOPS[2].hex],
      'oklch',
    )
    const violations: number[] = []
    for (let i = 1; i < 25; i++) {
      const { c, h } = lch(formatHex(oldSegment(i / 25)))
      if (c >= NEUTRAL_THRESHOLD && inBand(h, GREEN_CYAN_BAND))
        violations.push(h)
    }
    expect(violations.length).toBeGreaterThan(0)
  })
})
