// packages/liveries/mister/ramp.ts
//
// The Mister thermal ramp — single source of truth for INSTRUMENT COLOR.
// Governed by spec/WINGS_IMAGE_GENERATION_THESIS.md (Palette Law,
// INSTRUMENT COLOR — amendment 2026-07-08-B) and
// spec/MISTER_EXPRESSIVE_LAYER_SPEC.md (Axis 2 — TEMPERATURE = DEMAND).
//
// Interpolation runs in OKLab (rectangular), not linear RGB and not
// polar OKLCH. RGB lerp crosses muddy grey dead zones in the midtones;
// polar OKLCH inherits the near-neutral warm-white stop's arbitrary hue
// angle and detours the azul->white segment through cyan/green (founder
// ruling D-2, 2026-07-08 — see spec/DEFERRED.md). OKLab desaturates in
// a straight line through neutral with no hue detour. The hue-exclusion
// corridor test in ramp.test.ts is the regression gate for this.
//
// The ramp is never eyedropper-picked at a call site. `rampColor()` is
// the only sanctioned color source, and it enforces the `encodes:` law:
// every rendered color must be driven by a named variable, or it throws.
//
// CHANGELOG
// | Date       | Ver | Change |
// |------------|-----|--------|
// | 2026-07-08 | 1.0 | Created (OKLCH piecewise; --ramp-hot #C63A1E pending calibration) |
// | 2026-07-08 | 1.1 | --ramp-hot FROZEN at #B93400 (founder ratification D-1: #C63A1E was ΔE 5.42 from the error red — scarcity must not read as failure). Interpolation OKLCH→OKLab (founder ratification D-2: kill the cyan/green midtone detour). |
export const RAMP_VERSION = '1.1'

import { interpolate, formatHex } from 'culori'

export interface RampStop {
  /** Position on the ramp, 0..1. */
  t: number
  /** Frozen hex literal for this stop. */
  hex: string
  /** CSS custom property name this stop is exposed as. */
  token: string
}

export const RAMP_STOPS = [
  { t: 0.0, hex: '#001E50', token: '--ramp-cold' },
  { t: 0.25, hex: '#1D83F2', token: '--ramp-active' },
  { t: 0.5, hex: '#F8F6F0', token: '--ramp-neutral' },
  { t: 0.72, hex: '#C4933F', token: '--ramp-warm' },
  // FROZEN 2026-07-08 by founder ratification (D-1). Was #C63A1E, which sat
  // ΔE2000 = 5.42 from the site error red — indistinguishable from failure.
  { t: 1.0, hex: '#B93400', token: '--ramp-hot' },
] as const satisfies readonly RampStop[]

/** Token names in ramp order, for callers that just need the CSS var names. */
export const RAMP_TOKENS = {
  cold: RAMP_STOPS[0].token,
  active: RAMP_STOPS[1].token,
  neutral: RAMP_STOPS[2].token,
  warm: RAMP_STOPS[3].token,
  hot: RAMP_STOPS[4].token,
} as const

export interface RampMeta {
  /** The named variable this rendered color reads (INSTRUMENT COLOR law). */
  encodes: string
}

/**
 * Resolves a position on the thermal ramp to a hex color, interpolating
 * piecewise between the nearest two stops in OKLab.
 *
 * Throws unless `meta.encodes` is a non-empty, non-whitespace string — a
 * gradient without a named variable behind it is a decoration, not a
 * reading, and the expressive-layer spec refuses that at the gate.
 */
export function rampColor(t: number, meta: RampMeta): string {
  if (
    !meta ||
    typeof meta.encodes !== 'string' ||
    meta.encodes.trim().length === 0
  ) {
    throw new Error(
      'rampColor: meta.encodes is required and must be a non-empty string. ' +
        'Every rendered ramp color must be bound to a named variable ' +
        '(spec/MISTER_EXPRESSIVE_LAYER_SPEC.md — Axis 2 / INSTRUMENT COLOR).',
    )
  }

  const clamped = Math.min(1, Math.max(0, t))

  const exact = RAMP_STOPS.find((stop) => stop.t === clamped)
  if (exact) return exact.hex

  let lo: RampStop = RAMP_STOPS[0]
  let hi: RampStop = RAMP_STOPS[RAMP_STOPS.length - 1]
  for (let i = 0; i < RAMP_STOPS.length - 1; i++) {
    if (clamped >= RAMP_STOPS[i].t && clamped <= RAMP_STOPS[i + 1].t) {
      lo = RAMP_STOPS[i]
      hi = RAMP_STOPS[i + 1]
      break
    }
  }

  const localT = (clamped - lo.t) / (hi.t - lo.t)
  const segment = interpolate([lo.hex, hi.hex], 'oklab')
  return formatHex(segment(localT))
}
