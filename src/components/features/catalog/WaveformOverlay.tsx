// src/components/features/catalog/WaveformOverlay.tsx
'use client'

// WAVEFORM OVERLAY — an oscilloscope reading, not a chart.
//
// HP, torque, and RPM become three overlapping sine waves in a thin strip. The
// values set frequency (how many cycles cross the strip), nothing is plotted to
// scale — this is the engine's signature as a waveform. Sits between the HP
// meter and the spec table, where a number would be expected and a phenomenon
// appears instead.

import { useId, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface WaveformOverlayProps {
  hp?: number
  torque?: number
  rpm?: number
  className?: string
}

const GOLD = '#C4933F'
const WARM = '#F8F6F0'

const HEIGHT = 48
const AMP = 16
const POINTS = 200

/** Map a raw value within an expected band to a 1–5 cycle count. */
function cycles(value: number, min: number, max: number): number {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return 1 + t * 4
}

function wavePath(
  width: number,
  freq: number,
  amp: number,
  phase: number,
  midline: number,
): string {
  const pts: string[] = []
  for (let i = 0; i <= POINTS; i++) {
    const x = (i / POINTS) * width
    const theta = (i / POINTS) * Math.PI * 2 * freq + phase
    const y = midline + Math.sin(theta) * amp
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return `M ${pts.join(' L ')}`
}

export function WaveformOverlay({
  hp = 100,
  torque = 300,
  rpm = 2200,
  className,
}: WaveformOverlayProps) {
  const uid = useId()
  const width = 1000 // viewBox units; SVG scales to container via preserveAspectRatio

  const paths = useMemo(() => {
    const mid = HEIGHT / 2
    return {
      hp: wavePath(width, cycles(hp, 18, 400), AMP, 0, mid),
      torque: wavePath(width, cycles(torque, 50, 2000), AMP * 0.78, Math.PI / 3, mid),
      rpm: wavePath(width, cycles(rpm, 800, 4000), AMP * 0.55, Math.PI / 1.5, mid),
    }
  }, [hp, torque, rpm])

  return (
    <svg
      viewBox={`0 0 ${width} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={cn('block w-full', className)}
      style={{ height: HEIGHT }}
      aria-hidden="true"
    >
      {/* Centre baseline — the oscilloscope's zero line */}
      <line
        x1={0}
        y1={HEIGHT / 2}
        x2={width}
        y2={HEIGHT / 2}
        stroke={GOLD}
        strokeOpacity={0.14}
        strokeWidth={0.5}
        vectorEffect="non-scaling-stroke"
      />

      {/* RPM — faintest, behind */}
      <path
        d={paths.rpm}
        fill="none"
        stroke={GOLD}
        strokeOpacity={0.3}
        strokeWidth={0.5}
        vectorEffect="non-scaling-stroke"
      />
      {/* Torque — mid */}
      <path
        d={paths.torque}
        fill="none"
        stroke={WARM}
        strokeOpacity={0.6}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      {/* HP — lead trace, gold */}
      <path
        id={`wf-hp-${uid}`}
        d={paths.hp}
        fill="none"
        stroke={GOLD}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
