// src/components/features/mister/surfaces/IndexComparison.tsx
// Side-by-side scenario comparison. Always 2 scenarios. No currency delta.
// designer.md §4, types/mister.ts IndexComparisonView.
'use client'

import { motion } from 'framer-motion'
import type { IndexComparisonView } from '@/types/mister'
import { DISCLAIMERS } from '@/types/mister'
import { DEFAULT_SEGMENTS } from '@/lib/mister/waterfall-segments'
import { surfaceCardVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  payload: IndexComparisonView
}

export function IndexComparison({ payload }: Props) {
  const reduced = useReducedMotion()
  const [scenA, scenB] = payload.scenarios

  if (!scenA || !scenB) return null

  const totalA = scenA.segments.reduce(
    (acc, s) => ({ low: acc.low + s.indexLow, high: acc.high + s.indexHigh }),
    { low: 0, high: 0 },
  )
  const totalB = scenB.segments.reduce(
    (acc, s) => ({ low: acc.low + s.indexLow, high: acc.high + s.indexHigh }),
    { low: 0, high: 0 },
  )

  // Use spec axes or derive from first scenario
  const axes = (scenA.segments.length > 0 ? scenA.segments : DEFAULT_SEGMENTS).map(
    (s) => s.key,
  )

  return (
    <motion.div
      variants={surfaceCardVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="rounded-none border border-[var(--mister-border-surface)] bg-[var(--mister-bg-inset)] mister-shadow-surface"
    >
      {/* Header */}
      <div className="border-b border-[var(--mister-gold-rule)] bg-[var(--mister-bg-header)] px-5 py-3">
        <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.12em] text-[var(--mister-text-secondary)]">
          COMPARACIÓN DE ESCENARIOS
        </p>
        <p className="mt-0.5 font-body text-[10px] font-[300] text-[var(--mister-text-muted)]">
          Rangos indexados · base 100 · no es cotización
        </p>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-[var(--mister-border-row)]">
        <div className="px-4 py-2" />
        {[scenA, scenB].map((sc, i) => (
          <div key={sc.label} className="border-l border-[var(--mister-border-row)] px-4 py-2">
            <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.10em] text-[var(--mister-text-secondary)]">
              {i === 0 ? 'ESCENARIO A' : 'ESCENARIO B'}
            </p>
            <p className="font-body text-[12px] font-[400] text-[var(--mister-text-primary)]">
              {sc.label}
            </p>
          </div>
        ))}
      </div>

      {/* Data rows */}
      {axes.map((key, rowIdx) => {
        const segA = scenA.segments.find((s) => s.key === key)
        const segB = scenB.segments.find((s) => s.key === key)

        return (
          <div
            key={key}
            className={`grid grid-cols-[1fr_1fr_1fr] ${rowIdx < axes.length - 1 ? 'border-b border-[var(--mister-border-row)]' : ''}`}
          >
            <div className="px-4 py-2.5">
              <p className="font-mono text-[11px] font-[300] uppercase tracking-[0.06em] text-[var(--mister-text-secondary)]">
                {key}
              </p>
            </div>
            {[segA, segB].map((seg, i) => (
              <div key={i} className="border-l border-[var(--mister-border-row)] px-4 py-2.5">
                {seg ? (
                  seg.indexLow === 100 && seg.indexHigh === 100 ? (
                    <p className="font-mono text-[13px] font-[500] text-[var(--mister-wf-base)]">
                      BASE 100
                    </p>
                  ) : (
                    <p className="font-mono text-[13px] font-[500] text-[var(--mister-text-primary)]">
                      +{seg.indexLow} – {seg.indexHigh}
                    </p>
                  )
                ) : (
                  <p className="font-mono text-[13px] text-[var(--mister-text-ghost)]">—</p>
                )}
              </div>
            ))}
          </div>
        )
      })}

      {/* Delta callout */}
      <div className="border-t border-[var(--mister-wf-total-separator)] px-5 py-3">
        <div className="grid grid-cols-[1fr_1fr_1fr]">
          <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.10em] text-[var(--mister-text-secondary)]">
            TOTAL
          </p>
          <div className="border-l border-[var(--mister-border-row)] px-4">
            <p className="font-mono text-[16px] font-[700] text-[var(--mister-text-primary)]">
              {totalA.low} – {totalA.high}
            </p>
          </div>
          <div className="border-l border-[var(--mister-border-row)] px-4">
            <p className="font-mono text-[16px] font-[700] text-[var(--mister-text-primary)]">
              {totalB.low} – {totalB.high}
            </p>
          </div>
        </div>
        <p className="mt-2 font-body text-[12px] font-[300] text-[var(--mister-text-secondary)]">
          {payload.deltaCallout.label}
        </p>
        <p className="mt-1 font-body text-[12px] font-[400] text-[var(--mister-text-primary)]">
          {payload.conclusion}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-[var(--mister-border-row)] px-5 py-2.5">
        <p className="font-body text-[10px] font-[300] text-[var(--mister-text-ghost)]">
          {DISCLAIMERS.range}
        </p>
      </div>
    </motion.div>
  )
}
