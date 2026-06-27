// src/components/features/mister/CifBreakdownChart.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface CifBreakdownChartProps {
  fob: number
  freight: number
  insurance: number
  duty: number
  total: number
  currency?: string
}

type ChartState = 'idle' | 'building' | 'collapsing' | 'resolved'

const BARS: ReadonlyArray<{ key: 'fob' | 'freight' | 'insurance' | 'duty'; label: string }> = [
  { key: 'fob', label: 'FOB' },
  { key: 'freight', label: 'FLETE' },
  { key: 'insurance', label: 'SEGURO' },
  { key: 'duty', label: 'ARANCEL' },
]

// stagger: bar[3] starts at 3*0.28=0.84s, finishes at 0.84+0.35=1.19s; +0.5s pause
const BUILD_HOLD_MS = Math.round((3 * 0.28 + 0.35 + 0.5) * 1000) // 1690ms
const COLLAPSE_HOLD_MS = 300 // 0.25s animation + 50ms buffer

const containerVariants = {
  building: { transition: { staggerChildren: 0.28 } },
  collapsing: { transition: { staggerChildren: 0 } },
}

const barVariants = {
  idle: { scaleX: 0 },
  building: {
    scaleX: 1,
    transition: { duration: 0.35, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
  collapsing: {
    scaleX: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  },
}

// fires at ~85% of the 0.35s bar animation (0.35 * 0.85 ≈ 0.298s delay from bar start)
const pctVariants = {
  idle: { opacity: 0 },
  building: { opacity: 1, transition: { delay: 0.298, duration: 0.08 } },
  collapsing: { opacity: 0, transition: { duration: 0.1 } },
}

function fmt(v: number, currency: string): string {
  const n = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v)
  return `$${n} ${currency}`
}

export function CifBreakdownChart({
  fob,
  freight,
  insurance,
  duty,
  total,
  currency = 'USD',
}: CifBreakdownChartProps) {
  const prefersReducedMotion = useReducedMotion()
  const [chartState, setChartState] = useState<ChartState>('idle')

  // idle → building → (timer) → collapsing
  useEffect(() => {
    if (total <= 0) return
    if (prefersReducedMotion) {
      setChartState('resolved')
      return
    }
    setChartState('building')
    const t1 = setTimeout(() => setChartState('collapsing'), BUILD_HOLD_MS)
    return () => clearTimeout(t1)
  }, [total, prefersReducedMotion])

  // collapsing → (timer) → resolved
  useEffect(() => {
    if (chartState !== 'collapsing') return
    const t2 = setTimeout(() => setChartState('resolved'), COLLAPSE_HOLD_MS)
    return () => clearTimeout(t2)
  }, [chartState])

  if (chartState === 'idle') return null

  const values: Record<'fob' | 'freight' | 'insurance' | 'duty', number> = {
    fob,
    freight,
    insurance,
    duty,
  }

  if (chartState === 'resolved') {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="mb-4 border border-[#C4933F]/20 p-4"
      >
        <p className="font-mono text-[10px] tracking-widest uppercase text-[#C4933F]/60">
          TOTAL CIF
        </p>
        <p className="mt-1 font-mono text-3xl font-bold text-[#C4933F]">
          {fmt(total, currency)}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="mb-4 border border-[#C4933F]/10 p-4">
      {/* stagger container — direct motion children are the row motion.divs */}
      <motion.div
        variants={containerVariants}
        animate={chartState}
        initial="idle"
        className="space-y-3"
      >
        {BARS.map(({ key, label }) => {
          const v = values[key]
          const pct = total > 0 ? (v / total) * 100 : 0

          return (
            // motion.div makes this a stagger target; variant propagates to bar and pct descendants
            <motion.div key={key} className="flex items-center gap-2">
              <span className="w-14 shrink-0 font-mono text-[10px] tracking-widest uppercase text-[#F8F6F0]/40">
                {label}
              </span>

              {/* bar track */}
              <div className="relative h-2 min-w-0 flex-1 bg-[#F8F6F0]/5">
                <motion.div
                  variants={barVariants}
                  className="absolute inset-y-0 left-0 bg-[#C4933F]"
                  style={{ width: `${pct}%`, transformOrigin: 'left center' }}
                />
                <motion.span
                  variants={pctVariants}
                  className="absolute inset-y-0 right-1 flex items-center font-mono text-[7px] leading-none text-[#F8F6F0]/60"
                >
                  {pct.toFixed(0)}%
                </motion.span>
              </div>

              <span className="w-24 shrink-0 text-right font-mono text-[10px] text-[#F8F6F0]/50">
                {fmt(v, currency)}
              </span>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
