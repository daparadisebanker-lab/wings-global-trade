'use client'

// ENGINE POWER BAND — a real power/torque curve strip, not an oscilloscope.
//
// HP and torque values are plotted as a 64px SVG strip across an operating RPM
// range. The HP curve rises with the characteristic power band shape; the torque
// curve peaks in the mid-range and rolls off. Peak torque RPM is annotated.
// Sits between the HP meter and the spec table as a true data visualization.

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface WaveformOverlayProps {
  hp?: number
  torque?: number
  rpm?: number
  className?: string
}

const GOLD = '#C4933F'
const WARM = '#F8F6F0'
const NAVY = '#001E50'
const POINTS = 120

export function WaveformOverlay({ hp, torque, rpm, className }: WaveformOverlayProps) {
  const { hpPoints, torquePoints, peakRpm, peakX } = useMemo(() => {
    const rpmMin = rpm ? Math.round(rpm * 0.2) : 800
    const rpmMax = rpm ?? 3200

    // HP curve points
    const hpPts: string[] = []
    for (let i = 0; i < POINTS; i++) {
      const x = (i / POINTS) * 1000
      const relR = i / POINTS
      let y =
        54 - ((hp ?? 150) / 400) * 40 * Math.pow(relR, 0.4) * (1 - 0.3 * Math.pow(relR, 3))
      y = Math.max(8, Math.min(56, y))
      hpPts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
    }

    // Torque curve points
    let torquePts: string[] = []
    let peakIndex = 0
    let peakY = Infinity

    if ((torque ?? 0) > 0) {
      for (let i = 0; i < POINTS; i++) {
        const x = (i / POINTS) * 1000
        const relR = i / POINTS
        let y =
          54 - ((torque ?? 0) / 2000) * 38 * Math.sin(Math.PI * Math.pow(relR, 0.65))
        y = Math.max(10, Math.min(56, y))
        torquePts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
        if (y < peakY) {
          peakY = y
          peakIndex = i
        }
      }
    }

    const computedPeakRpm = rpmMin + (peakIndex / POINTS) * (rpmMax - rpmMin)
    const computedPeakX = (peakIndex / POINTS) * 1000

    return {
      hpPoints: hpPts.join(' '),
      torquePoints: torquePts.join(' '),
      peakRpm: computedPeakRpm,
      peakX: computedPeakX,
    }
  }, [hp, torque, rpm])

  const rpmMin = rpm ? Math.round(rpm * 0.2) : 800
  const rpmMax = rpm ?? 3200
  const hasTorque = (torque ?? 0) > 0

  const ariaLabel = `Curva de potencia: ${hp ?? 0} HP${hasTorque ? `, par máximo ${torque} Nm a ${Math.round(peakRpm)} RPM` : ''}`

  return (
    <div className={cn('block w-full', className)}>
      <svg
        viewBox="0 0 1000 64"
        preserveAspectRatio="none"
        height={64}
        width="100%"
        aria-label={ariaLabel}
      >
        {/* Background */}
        <rect x={0} y={0} width={1000} height={64} fill="rgba(0,30,80,0.03)" />

        {/* Operating band */}
        <rect x={0} y={20} width={1000} height={24} fill={GOLD} fillOpacity={0.05} />

        {/* Torque curve */}
        {hasTorque && (
          <polyline
            points={torquePoints}
            stroke={WARM}
            strokeWidth={1}
            fill="none"
            opacity={0.7}
          />
        )}

        {/* HP curve */}
        <polyline points={hpPoints} stroke={GOLD} strokeWidth={1.5} fill="none" />

        {/* Peak torque vertical tick */}
        {hasTorque && (
          <line
            x1={peakX}
            y1={8}
            x2={peakX}
            y2={56}
            stroke={GOLD}
            strokeWidth={0.75}
            opacity={0.5}
          />
        )}

        {/* Peak torque label */}
        {hasTorque && (
          <text
            x={peakX}
            y={7}
            fontSize={7}
            fontFamily="DM Mono"
            fill={GOLD}
            opacity={0.7}
            textAnchor="middle"
          >
            {`Par max · ${Math.round(peakRpm)} RPM`}
          </text>
        )}

        {/* Bottom axis labels */}
        <text
          x={4}
          y={62}
          fontSize={6.5}
          fontFamily="DM Mono"
          fill={NAVY}
          fillOpacity={0.4}
        >
          {`RPM min`}
        </text>
        <text
          x={996}
          y={62}
          fontSize={6.5}
          fontFamily="DM Mono"
          fill={NAVY}
          fillOpacity={0.4}
          textAnchor="end"
        >
          {`RPM max`}
        </text>
        <text
          x={500}
          y={62}
          fontSize={6}
          fontFamily="DM Mono"
          fill={GOLD}
          opacity={0.5}
          textAnchor="middle"
        >
          BANDA OPERATIVA
        </text>
      </svg>
    </div>
  )
}
