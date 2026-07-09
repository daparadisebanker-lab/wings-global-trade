'use client'

// SPEC POSITION BAND — shows where this product sits in the Wings catalog on 6 axes.
//
// A 32px SVG strip of 6 horizontal range bars. Each bar is one of the six
// normalization axes (HP, payload, GVW, wheelbase, speed, weight). A gold dot
// marks the catalog percentile position for each axis. No animation — static data.

import { useMemo } from 'react'
import { normalizeSpecs, SPEC_AXES } from '@/lib/spec-normalize'
import { catalogPercentile } from '@/lib/product-intelligence'
import { cn } from '@/lib/utils'

interface CellularAutomatonProps {
  gvw?: number
  hp?: number
  specs?: Record<string, unknown>
  className?: string
}

const AXIS_LABELS: Record<string, string> = {
  hp: 'HP',
  payload: 'CRG',
  gvw: 'GVW',
  wheelbase: 'BAT',
  speed: 'VEL',
  weight: 'PES',
}

export function CellularAutomaton({ gvw, hp, specs, className }: CellularAutomatonProps) {
  const normalized = useMemo(() => {
    if (specs) return normalizeSpecs(specs)
    // Fallback when only gvw/hp passed (no specs object yet)
    return {
      hp: hp ? Math.min(1, Math.max(0, (hp - 18) / (400 - 18))) : 0,
      payload: 0,
      gvw: gvw ? Math.min(1, Math.max(0, (gvw - 800) / (35000 - 800))) : 0,
      wheelbase: 0,
      speed: 0,
      weight: 0,
    }
  }, [specs, hp, gvw])

  const ariaLabel = `Posición en catálogo: ${SPEC_AXES.map(
    (a) => `${AXIS_LABELS[a]} ${catalogPercentile(normalized[a] ?? 0)}`,
  ).join(', ')}`

  return (
    <svg
      viewBox="0 0 1000 32"
      height={32}
      width="100%"
      className={cn('block', className)}
      aria-label={ariaLabel}
    >
      {SPEC_AXES.map((axis, i) => {
        const barY = 2.5 + i * 5
        const val = normalized[axis] ?? 0

        return (
          <g key={axis}>
            {/* Axis label */}
            <text
              x={0}
              y={barY + 1.5}
              fontSize={4.5}
              fontFamily="DM Mono"
              fill="#001E50"
              fillOpacity={0.4}
            >
              {AXIS_LABELS[axis]}
            </text>

            {/* Track line */}
            <line
              x1={32}
              y1={barY}
              x2={1000}
              y2={barY}
              stroke="#001E50"
              strokeOpacity={val > 0.001 ? 0.1 : 0.05}
              strokeWidth={0.75}
            />

            {/* Position dot */}
            {val > 0.001 && (
              <circle cx={32 + val * 968} cy={barY} r={2} fill="#C4933F" />
            )}
          </g>
        )
      })}
    </svg>
  )
}
