import { describe, expect, it } from 'vitest'
import { oklch } from 'culori'
import { RAMP_STOPS, rampColor } from './ramp'

const encodes = { encodes: 'test-fixture-variable' }

// oklch() types the return as `Oklch | undefined` because it also accepts
// arbitrary strings that may fail to parse — every hex here is one this
// module produced or a frozen ramp stop literal, so it always parses.
function chromaOf(hex: string): number {
  const color = oklch(hex)
  if (!color) throw new Error(`unparseable color in test fixture: ${hex}`)
  return color.c ?? 0
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

describe('rampColor — chroma floor (no muddy-grey dead zones)', () => {
  // Measured (culori oklch(), this ramp, 2026-07-08) by sampling t from 0.25
  // to 0.72 in steps of 0.01 (and re-verified at 0.001 resolution):
  //
  //   - The ramp's chroma forms a smooth V centered exactly at the neutral
  //     stop (t=0.5, #F8F6F0): chroma descends from ~0.188 at t=0.25 down
  //     to ~0.0082 at t=0.5, then rises back to ~0.116 at t=0.72.
  //   - The GLOBAL MINIMUM across the whole band is ~0.0082, occurring
  //     exactly at t=0.5 — the warm-white stop is near-neutral BY DESIGN
  //     (spec: "intentionally near-neutral"), so this is not a dead zone.
  //   - Outside a +/-0.03 window around the neutral stop, the measured
  //     floor is ~0.0222 (at t=0.53). That is the number that matters:
  //     it proves OKLCH interpolation does not introduce a SECOND, wider
  //     dead zone anywhere else in the segment — chroma only ever
  //     bottoms out in the immediate neighborhood of the neutral stop
  //     itself, never between arbitrary points on a segment (which is
  //     the muddy-grey failure mode RGB lerp would produce here).
  const NEUTRAL_WINDOW = 0.03
  const OUTSIDE_WINDOW_FLOOR = 0.02

  it('never dips into muddy grey between stops (outside the neutral stop\'s own neighborhood)', () => {
    const samples: { t: number; c: number }[] = []
    for (let i = 0; i <= 47; i++) {
      const t = 0.25 + i * 0.01
      samples.push({ t, c: chromaOf(rampColor(t, encodes)) })
    }

    const outsideNeutralWindow = samples.filter(
      (s) => Math.abs(s.t - 0.5) > NEUTRAL_WINDOW,
    )
    for (const s of outsideNeutralWindow) {
      expect(s.c, `chroma dead zone at t=${s.t}`).toBeGreaterThan(
        OUTSIDE_WINDOW_FLOOR,
      )
    }
  })

  it('the neutral stop\'s own low point never dips below the neutral stop\'s own chroma', () => {
    const neutralChroma = chromaOf(RAMP_STOPS[2].hex) // #F8F6F0
    const EPSILON = 1e-4

    for (let i = 0; i <= 47; i++) {
      const t = 0.25 + i * 0.01
      const c = chromaOf(rampColor(t, encodes))
      expect(
        c,
        `chroma at t=${t} fell below the neutral stop's own chroma`,
      ).toBeGreaterThanOrEqual(neutralChroma - EPSILON)
    }
  })
})
