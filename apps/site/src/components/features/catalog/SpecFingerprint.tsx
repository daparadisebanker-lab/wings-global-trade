// src/components/features/catalog/SpecFingerprint.tsx
'use client'

// SPEC FINGERPRINT — the machine's visual identity.
//
// Vera Molnár's method, literally: define a geometric rule (a 6-axis radar of
// normalized specs), apply it, then introduce controlled deviation, and observe
// what emerges. The rule is shared across the catalog; the deviation is seeded
// by the product slug, so two near-identical machines (tractor-snh504 vs
// tractor-snh704) carry subtly different fingerprints that are *stable* across
// reloads. Chance within a designed range — never random per frame.

import { useId, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  normalizeSpecs,
  getSpecPath,
  hashString,
  rawSpecValues,
  SPEC_AXES,
  type SpecAxis,
} from '@/lib/spec-normalize'
import { catalogPercentile } from '@/lib/product-intelligence'

const NAVY = '#001E50'
const GOLD = '#C4933F'

const AXIS_LABEL: Record<SpecAxis, string> = {
  hp: 'HP',
  payload: 'CARGA',
  gvw: 'GVW',
  wheelbase: 'BATALLA',
  speed: 'VEL',
  weight: 'PESO',
}

const UNIT: Record<SpecAxis, string> = {
  hp: 'HP',
  payload: 'kg',
  gvw: 'kg',
  wheelbase: 'mm',
  speed: 'km/h',
  weight: 'kg',
}

interface SpecFingerprintProps {
  specs: Record<string, unknown>
  /** Stable seed for the controlled deviation. Pass the product slug. */
  seed?: string
  size?: number
  className?: string
  /** When true, the polygon draws in with a stroke-dashoffset sweep. */
  animate?: boolean
  /** Render axis tick labels around the perimeter. */
  showLabels?: boolean
  /** Show raw value tooltip on vertex hover. */
  showValues?: boolean
  /** Show catalog percentile annotations around the perimeter. */
  showPercentiles?: boolean
  /** Ghost polygon for side-by-side comparison. */
  comparisonSpecs?: Record<string, unknown> | null
}

/**
 * Build the deterministic ±2% per-axis deviation from a seed. A mulberry32 PRNG
 * advanced once per axis gives an even spread; the same seed always yields the
 * same jitter, so the fingerprint is a fixed signature, not noise.
 */
function seededDeviation(seed: string): Partial<Record<SpecAxis, number>> {
  let state = hashString(seed) || 1
  const next = () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const out: Partial<Record<SpecAxis, number>> = {}
  for (const axis of SPEC_AXES) {
    out[axis] = (next() - 0.5) * 0.04 // ±0.02 in 0–1 units = ±2%
  }
  return out
}

export function SpecFingerprint({
  specs,
  seed = 'wings',
  size = 120,
  className,
  animate = false,
  showLabels = false,
  showValues = false,
  showPercentiles = false,
  comparisonSpecs,
}: SpecFingerprintProps) {
  const uid = useId()
  const gradId = `fp-grad-${uid}`

  const [hoveredAxis, setHoveredAxis] = useState<SpecAxis | null>(null)

  const { path, gridRings, axisLines, labelPoints } = useMemo(() => {
    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - (showLabels ? 16 : 6)
    const normalized = normalizeSpecs(specs)
    const deviation = seededDeviation(seed)

    const path = getSpecPath(normalized, radius, cx, cy, deviation)

    // Concentric reference rings (the rule's scaffold) at 0.33 / 0.66 / 1.0.
    const ringPath = (frac: number) => {
      const pts = SPEC_AXES.map((_, i) => {
        const a = -Math.PI / 2 + (i / SPEC_AXES.length) * Math.PI * 2
        return `${(cx + Math.cos(a) * radius * frac).toFixed(2)} ${(
          cy +
          Math.sin(a) * radius * frac
        ).toFixed(2)}`
      })
      return `M ${pts.join(' L ')} Z`
    }
    const gridRings = [0.33, 0.66, 1].map(ringPath)

    const axisLines = SPEC_AXES.map((_, i) => {
      const a = -Math.PI / 2 + (i / SPEC_AXES.length) * Math.PI * 2
      return {
        x2: cx + Math.cos(a) * radius,
        y2: cy + Math.sin(a) * radius,
      }
    })

    const labelPoints = SPEC_AXES.map((axis, i) => {
      const a = -Math.PI / 2 + (i / SPEC_AXES.length) * Math.PI * 2
      const lr = radius + 9
      return {
        axis,
        x: cx + Math.cos(a) * lr,
        y: cy + Math.sin(a) * lr,
      }
    })

    return { path, gridRings, axisLines, labelPoints, cx, cy }
  }, [specs, seed, size, showLabels])

  // Vertex positions — used for hover tooltip (showValues) and percentile
  // annotations (showPercentiles). Kept in a separate memo so they can be
  // cheaply reused across both features without re-running the full scaffold.
  const vertexData = useMemo(() => {
    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - (showLabels ? 16 : 6)
    const normalized = normalizeSpecs(specs)
    const deviation = seededDeviation(seed)
    return SPEC_AXES.map((axis, i) => {
      const a = -Math.PI / 2 + (i / SPEC_AXES.length) * Math.PI * 2
      const r = Math.max(0, Math.min(1, normalized[axis] + (deviation[axis] ?? 0))) * radius
      return {
        axis,
        cx: cx + Math.cos(a) * r,
        cy: cy + Math.sin(a) * r,
        // Outward tooltip anchor — offset along the axis direction at full radius + 16
        tx: cx + Math.cos(a) * (radius + 16),
        ty: cy + Math.sin(a) * (radius + 16),
        // Percentile annotation — further outward at radius + 22
        px: cx + Math.cos(a) * (radius + 22),
        py: cy + Math.sin(a) * (radius + 22),
        normalized: normalized[axis],
      }
    })
  }, [specs, seed, size, showLabels])

  // Raw values for tooltip display
  const rawVals = useMemo(() => rawSpecValues(specs), [specs])

  // Comparison ghost path — rendered behind the main polygon
  const comparisonPath = useMemo(() => {
    if (!comparisonSpecs) return null
    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - (showLabels ? 16 : 6)
    return getSpecPath(normalizeSpecs(comparisonSpecs), radius, cx, cy)
  }, [comparisonSpecs, size, showLabels])

  const cx = size / 2
  const cy = size / 2

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('select-none', className)}
      role="img"
      aria-label="Huella técnica del producto"
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GOLD} stopOpacity={0.28} />
          <stop offset="100%" stopColor={GOLD} stopOpacity={0.08} />
        </radialGradient>
      </defs>

      {/* Scaffold — the geometric rule made faintly visible */}
      <g stroke={NAVY} strokeOpacity={0.12} fill="none" strokeWidth={0.75}>
        {gridRings.map((d, i) => (
          <path key={i} d={d} />
        ))}
        {axisLines.map((l, i) => (
          <line key={i} x1={cx} y1={cy} x2={l.x2} y2={l.y2} />
        ))}
      </g>

      {/* Ring fraction labels — rendered at the top axis intersection */}
      {showLabels && [0.33, 0.66, 1.0].map((f, i) => (
        <text
          key={i}
          x={cx + 3}
          y={cy - (size / 2 - (showLabels ? 16 : 6)) * f - 2}
          fontSize={5}
          fontFamily="DM Mono"
          fill={NAVY}
          fillOpacity={0.25}
        >{['33%', '66%', 'MAX'][i]}</text>
      ))}

      {/* Comparison ghost polygon — behind main polygon in SVG paint order */}
      {comparisonPath && (
        <path
          d={comparisonPath}
          fill="rgba(248,246,240,0.06)"
          stroke="rgba(248,246,240,0.4)"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      )}

      {/* The fingerprint — rule + controlled deviation */}
      <path
        d={path}
        fill={`url(#${gradId})`}
        stroke={GOLD}
        strokeWidth={1.5}
        strokeLinejoin="round"
        style={{
          transition: 'd 400ms ease-in-out',
          ...(animate
            ? {
                strokeDasharray: size * 4,
                strokeDashoffset: size * 4,
                animation: 'fp-draw 1100ms ease-out forwards',
              }
            : {}),
        }}
      />

      {/* Vertices — small gold nodes mark each axis value */}
      {(() => {
        const radius = size / 2 - (showLabels ? 16 : 6)
        const normalized = normalizeSpecs(specs)
        const deviation = seededDeviation(seed)
        return SPEC_AXES.map((axis, i) => {
          const a = -Math.PI / 2 + (i / SPEC_AXES.length) * Math.PI * 2
          const r = Math.max(0, Math.min(1, normalized[axis] + (deviation[axis] ?? 0))) * radius
          return (
            <circle
              key={axis}
              cx={cx + Math.cos(a) * r}
              cy={cy + Math.sin(a) * r}
              r={1.6}
              fill={GOLD}
              onMouseEnter={() => { if (showValues) setHoveredAxis(axis) }}
              onMouseLeave={() => setHoveredAxis(null)}
            />
          )
        })
      })()}

      {showLabels &&
        labelPoints.map(({ axis, x, y }) => (
          <text
            key={axis}
            x={x}
            y={y}
            fontSize={7}
            fontFamily="'DM Mono', monospace"
            fill={NAVY}
            fillOpacity={0.55}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {AXIS_LABEL[axis]}
          </text>
        ))}

      {/* Percentile annotations — one per axis, outward at radius + 22 */}
      {showPercentiles && vertexData.map(({ axis, px, py, normalized }) => (
        <text
          key={axis}
          x={px}
          y={py}
          fontSize={5}
          fontFamily="DM Mono"
          fill={NAVY}
          fillOpacity={0.38}
          textAnchor="middle"
        >
          {catalogPercentile(normalized)}
        </text>
      ))}

      {/* Hover tooltip — rendered last so it paints above everything */}
      {hoveredAxis !== null && rawVals[hoveredAxis] !== null && (() => {
        const v = vertexData.find(d => d.axis === hoveredAxis)
        if (!v) return null
        const vx = v.tx
        const vy = v.ty
        return (
          <g>
            <rect x={vx - 20} y={vy - 16} width={40} height={20} rx={1} fill="#F8F6F0" fillOpacity={0.95} />
            <text x={vx} y={vy - 7} fontSize={5.5} fontFamily="DM Mono" fill="#001E50" fillOpacity={0.5} textAnchor="middle">
              {AXIS_LABEL[hoveredAxis]}
            </text>
            <text x={vx} y={vy + 5} fontSize={8} fontFamily="DM Mono" fill="#001E50" fontWeight={500} textAnchor="middle">
              {rawVals[hoveredAxis]} {UNIT[hoveredAxis]}
            </text>
          </g>
        )
      })()}

      <style>{`@keyframes fp-draw { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  )
}

export { getSpecPath } from '@/lib/spec-normalize'
