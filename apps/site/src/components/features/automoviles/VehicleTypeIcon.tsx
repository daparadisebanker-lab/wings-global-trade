// src/components/features/automoviles/VehicleTypeIcon.tsx
//
// WGT/07's body-type icon set — the visual vocabulary behind the "select by
// vehicle type" pattern dubicars and every OEM configurator uses, redrawn
// for this lane's own blueprint-line language rather than borrowed art.
// Bi-color by construction, not by accident: the body is a STROKE only
// (matching the lane's blueprint-grid texture, packages/liveries/
// automoviles/livery.css), glass + wheels are FILLED in the second color —
// two colors, two roles, never blended. `accentColor` defaults to the
// lane's own accent-ink but is meant to be overridden with --oem-accent
// wherever an icon sits inside a `[data-oem]` scope, the same "brand takes
// over the accent role" pattern every other card in this lane already uses.
//
// Five silhouettes, one per lane.config.ts taxonomy entry — differentiated
// by roofline height, greenhouse length and wheel size rather than by
// photographic detail; a UI icon needs to read at 32px, not survive close
// inspection.
import type { CSSProperties } from 'react'

export type VehicleSegmentSlug =
  | 'sedan'
  | 'suv-compacto'
  | 'suv-mediano-grande'
  | 'suv-todoterreno'
  | 'mpv-furgoneta'

interface VehicleTypeIconProps {
  segment: VehicleSegmentSlug
  className?: string
  /** Body outline color. Defaults to currentColor so it inherits ink from
   *  whatever text color surrounds it (the usual case on a light card). */
  bodyColor?: string
  /** Glass + wheel fill. Defaults to the lane accent; pass 'var(--oem-accent)'
   *  (with the lane-accent fallback already baked in) inside a brand scope. */
  accentColor?: string
}

interface IconGeometry {
  body: string
  windows: string
  wheels: [cx: number, cy: number][]
  wheelRadius: number
  /** Optional extra stroke-only detail lines (roof rail, rocker step, door seam). */
  detailLines?: string[]
}

const GEOMETRY: Record<VehicleSegmentSlug, IconGeometry> = {
  sedan: {
    body: 'M8,40 L8,32 Q8,28 12,27 L24,25 Q30,15 42,12 L64,12 Q76,12 84,20 L100,22 Q108,23 110,29 L112,32 L112,40',
    windows: 'M30,25 L40,15 L60,15 L68,22 L34,22 Z',
    wheels: [
      [28, 40],
      [92, 40],
    ],
    wheelRadius: 6.5,
  },
  'suv-compacto': {
    body: 'M6,40 L6,26 Q6,20 12,19 L22,17 Q28,9 40,8 L68,8 Q78,9 84,16 L100,18 Q108,19 111,25 L112,28 L112,40',
    windows: 'M26,18 L36,9 L64,9 L74,17 L30,17 Z',
    wheels: [
      [26, 40],
      [92, 40],
    ],
    wheelRadius: 7,
  },
  'suv-mediano-grande': {
    body: 'M4,40 L4,24 Q4,18 10,17 L20,15 Q26,7 38,6 L82,6 Q92,7 98,15 L106,17 Q112,18 113,24 L114,40',
    windows: 'M22,16 L34,7 L84,7 L96,15 L28,15 Z',
    wheels: [
      [26, 40],
      [96, 40],
    ],
    wheelRadius: 7.5,
    detailLines: ['M32,6 L86,6'],
  },
  'suv-todoterreno': {
    body: 'M4,38 L4,22 Q4,16 10,15 L18,14 L26,6 L88,6 L96,14 L106,15 Q112,16 112,22 L112,38',
    windows: 'M22,14 L28,7 L86,7 L92,14 Z',
    wheels: [
      [24, 40],
      [94, 40],
    ],
    wheelRadius: 8,
    detailLines: ['M4,38 L112,38'],
  },
  'mpv-furgoneta': {
    body: 'M6,40 L6,16 Q6,8 14,8 L102,8 Q110,8 110,16 L110,40',
    windows: 'M14,10 L102,10 L102,20 L14,20 Z',
    wheels: [
      [26, 40],
      [90, 40],
    ],
    wheelRadius: 6.5,
    detailLines: ['M70,10 L70,38'],
  },
}

export function VehicleTypeIcon({
  segment,
  className,
  bodyColor = 'currentColor',
  accentColor = 'var(--accent-ink)',
}: VehicleTypeIconProps) {
  const g = GEOMETRY[segment]
  const style = { '--vt-body': bodyColor, '--vt-accent': accentColor } as CSSProperties

  return (
    <svg
      viewBox="0 0 120 48"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {/* Ground line — every icon in the set shares this baseline, the one
          structural constant that reads as "this is a body-type system." */}
      <line x1="2" y1="41.5" x2="118" y2="41.5" stroke="var(--vt-body)" strokeWidth="1" opacity="0.25" />
      <path d={g.windows} fill="var(--vt-accent)" opacity="0.85" />
      <path
        d={g.body}
        fill="none"
        stroke="var(--vt-body)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {g.detailLines?.map((d) => (
        <path key={d} d={d} fill="none" stroke="var(--vt-body)" strokeWidth="1.5" strokeLinecap="round" />
      ))}
      {g.wheels.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={g.wheelRadius} fill="var(--vt-accent)" />
      ))}
      {g.wheels.map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}-ring`}
          cx={cx}
          cy={cy}
          r={g.wheelRadius}
          fill="none"
          stroke="var(--vt-body)"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}
