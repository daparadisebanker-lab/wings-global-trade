// src/components/features/mister/surfaces/MoqTable.tsx
// Trade directory data table. designer.md §4.
'use client'

import { motion } from 'framer-motion'
import type { MoqSurface } from '@/types/mister'
import { surfaceCardVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  payload: MoqSurface
}

export function MoqTable({ payload }: Props) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      variants={surfaceCardVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="rounded-none border border-[var(--mister-border-surface)] bg-[var(--mister-bg-inset)] mister-shadow-surface"
    >
      {/* Header */}
      <div className="border-b border-[var(--mister-gold-rule)] px-4 py-3">
        <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.12em] text-[var(--mister-text-secondary)]">
          TABLA DE MOQ
        </p>
        <p className="mt-0.5 font-body text-[12px] font-[400] text-[var(--mister-text-primary)]">
          {payload.category}
        </p>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_2fr] border-b border-[var(--mister-gold-rule)]">
        <div className="px-4 py-2">
          <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.10em] text-[var(--mister-text-muted)]">
            MOQ MÍNIMO
          </p>
        </div>
        <div className="border-l border-[var(--mister-border-row)] px-4 py-2">
          <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.10em] text-[var(--mister-text-muted)]">
            DESCRIPCIÓN
          </p>
        </div>
      </div>

      {/* Data rows — tabular-nums on all numeric values */}
      {payload.tiers.map((tier, i) => (
        <div
          key={i}
          className={`grid grid-cols-[1fr_2fr] ${
            i < payload.tiers.length - 1 ? 'border-b border-[var(--mister-border-row)]' : ''
          }`}
        >
          <div className="px-4 py-2.5">
            <p
              className={`font-mono text-[13px] font-[400] tabular-nums ${
                i === 0
                  ? 'text-[var(--mister-gold)]'
                  : 'text-[var(--mister-text-primary)]'
              }`}
            >
              {tier.minQty}
            </p>
          </div>
          <div className="border-l border-[var(--mister-border-row)] px-4 py-2.5">
            <p className="font-mono text-[13px] font-[400] text-[var(--mister-text-primary)]">
              {tier.description}
            </p>
          </div>
        </div>
      ))}
    </motion.div>
  )
}
