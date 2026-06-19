'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { CountUp } from '@/components/ui/CountUp'

interface ProductHpMeterProps {
  specs: Record<string, string>
  categorySlug?: string
}

// 'Motor' deliberately excluded — its value is engine displacement (e.g. "1249cc"), not power
const HP_KEYS = [
  'Potencia del motor',
  'Potencia',
  'HP',
  'Potencia máxima',
  'Potencia nominal',
  'CV',
  'Horsepower',
]
const KW_KEYS = ['Potencia kW', 'kW', 'Potencia (kW)']

interface RangeConfig {
  min: number
  max: number
}

function getRangeForCategory(categorySlug?: string): RangeConfig {
  switch (categorySlug) {
    case 'maquinaria-agricola':
      return { min: 40, max: 160 }
    case 'camiones':
      return { min: 50, max: 400 }
    default:
      return { min: 40, max: 400 }
  }
}

function extractHp(specs: Record<string, string>): number | null {
  for (const key of HP_KEYS) {
    const value = specs[key]
    if (value) {
      const parsed = parseFloat(value.replace(/[^0-9.]/g, ''))
      if (!isNaN(parsed) && parsed > 5 && parsed < 2000) return parsed
    }
  }
  for (const key of KW_KEYS) {
    const value = specs[key]
    if (value) {
      const parsed = parseFloat(value.replace(/[^0-9.]/g, ''))
      if (!isNaN(parsed) && parsed > 3) return Math.round(parsed * 1.341)
    }
  }
  return null
}

// Spring config for the overshoot-then-settle feel
const OVERSHOOT_SPRING = { type: 'spring', stiffness: 300, damping: 18, mass: 1 } as const

export function ProductHpMeter({ specs, categorySlug }: ProductHpMeterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  const prefersReducedMotion = useReducedMotion()

  const hp = extractHp(specs)
  if (hp === null) return null

  const { min, max } = getRangeForCategory(categorySlug)
  const clampedHp = Math.min(Math.max(hp, min), max)
  const rawPct = ((clampedHp - min) / (max - min)) * 100
  const labelPct = Math.min(Math.max(rawPct, 5), 93)

  // Overshoot target: dot goes 5% beyond then settles back via spring physics
  const overshootPct = Math.min(rawPct + 5, 100)

  const dotAnimation = prefersReducedMotion
    ? { left: inView ? `${rawPct}%` : '0%' }
    : {
        left: inView ? [`0%`, `${overshootPct}%`, `${rawPct}%`] : '0%',
      }

  const dotTransition = prefersReducedMotion
    ? { duration: 0 }
    : inView
      ? { ...OVERSHOOT_SPRING, delay: 0 }
      : { duration: 0 }

  // Bar lands 80ms after dot starts
  const barTransition = prefersReducedMotion
    ? { duration: 0 }
    : { ...OVERSHOOT_SPRING, delay: 0.08 }

  return (
    <div className="space-y-1">
      <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/40">
        Potencia relativa
      </p>

      <div ref={ref} className="relative pt-7">
        {/* Value label above dot — CountUp on mount */}
        <div
          className="absolute top-0 -translate-x-1/2 font-mono text-[12px] font-medium text-gold"
          style={{ left: `${labelPct}%` }}
        >
          {inView ? (
            /* Ambient pulse: barely perceptible scale oscillation — the machine breathes */
            <motion.span
              animate={
                prefersReducedMotion
                  ? {}
                  : { scale: [1, 1.002, 1] }
              }
              transition={
                prefersReducedMotion
                  ? {}
                  : { repeat: Infinity, duration: 4, ease: 'easeInOut' }
              }
              style={{ display: 'inline-block' }}
            >
              <CountUp value={Math.round(hp)} suffix=" HP" />
            </motion.span>
          ) : (
            <span>— HP</span>
          )}
        </div>

        {/* Track */}
        <div className="relative h-1.5 w-full rounded-full bg-[rgba(0,30,80,0.08)]">
          {/* Filled bar — 80ms delayed behind dot */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gold/35"
            initial={{ width: '0%' }}
            animate={inView ? { width: `${rawPct}%` } : { width: '0%' }}
            transition={barTransition}
          />

          {/* Dot — overshoots then settles with spring */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-gold border-2 border-white shadow-md -translate-x-1/2"
            initial={{ left: '0%' }}
            animate={dotAnimation}
            transition={dotTransition}
          />
        </div>

        {/* End labels */}
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[10px] text-navy/35">{min} HP</span>
          <span className="font-mono text-[10px] text-navy/35">{max} HP</span>
        </div>
      </div>
    </div>
  )
}
