'use client'

// src/components/features/catalog/ProductHpMeter.tsx

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface ProductHpMeterProps {
  specs: Record<string, string>
  categorySlug?: string
}

const HP_KEYS = ['Potencia', 'HP', 'Potencia máxima', 'Motor', 'CV', 'Horsepower']

interface RangeConfig {
  min: number
  max: number
}

function getRangeForCategory(categorySlug?: string): RangeConfig {
  switch (categorySlug) {
    case 'maquinaria-agricola':
      return { min: 40, max: 160 }
    case 'camiones':
      return { min: 100, max: 500 }
    default:
      return { min: 40, max: 500 }
  }
}

function extractHp(specs: Record<string, string>): number | null {
  for (const key of HP_KEYS) {
    const value = specs[key]
    if (value) {
      const parsed = parseFloat(value.replace(/[^0-9.]/g, ''))
      if (!isNaN(parsed) && parsed > 0) {
        return parsed
      }
    }
  }
  return null
}

export function ProductHpMeter({ specs, categorySlug }: ProductHpMeterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })

  const hp = extractHp(specs)
  if (hp === null) return null

  const { min, max } = getRangeForCategory(categorySlug)
  const clampedHp = Math.min(Math.max(hp, min), max)
  const pct = ((clampedHp - min) / (max - min)) * 100

  return (
    <div className="space-y-1">
      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35 mb-3">
        Potencia relativa
      </p>

      <div ref={ref} className="relative">
        {/* Value label above dot */}
        <div
          className="absolute -top-7 font-mono text-[11px] text-gold -translate-x-1/2"
          style={{ left: `${pct}%` }}
        >
          {Math.round(hp)} HP
        </div>

        {/* Track */}
        <div className="relative h-1 w-full rounded-full bg-[rgba(0,30,80,0.08)]">
          {/* Filled bar */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gold/40"
            initial={{ width: '0%' }}
            animate={inView ? { width: `${pct}%` } : { width: '0%' }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          />

          {/* Dot at position */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-gold border-2 border-white shadow-sm -translate-x-1/2"
            initial={{ left: '0%' }}
            animate={inView ? { left: `${pct}%` } : { left: '0%' }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>

        {/* End labels */}
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[9px] text-navy/30">{min} HP</span>
          <span className="font-mono text-[9px] text-navy/30">{max} HP</span>
        </div>
      </div>
    </div>
  )
}
