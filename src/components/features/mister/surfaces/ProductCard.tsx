// src/components/features/mister/surfaces/ProductCard.tsx
// A manifest entry, not a marketplace card. designer.md §4.
'use client'

import { motion } from 'framer-motion'
import type { ProductSurface } from '@/types/mister'
import { surfaceCardVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  payload: ProductSurface
}

export function ProductCard({ payload }: Props) {
  const reduced = useReducedMotion()
  const animate = reduced ? 'visibleReduced' : 'visible'

  // Show first 6 spec entries
  const specEntries = Object.entries(payload.specs).slice(0, 6)

  return (
    <motion.div
      variants={surfaceCardVariants}
      initial="hidden"
      animate={animate}
      className="rounded-none border border-[var(--mister-border-surface)] bg-[var(--mister-bg-inset)] mister-shadow-surface"
    >
      {/* Header band */}
      <div className="flex min-h-[40px] items-center justify-between bg-[var(--mister-bg-header)] px-4">
        <p className="font-display text-[18px] font-[400] leading-tight tracking-[-0.01em] text-[var(--mister-text-primary)]">
          {payload.name}
        </p>
        <span className="ml-3 flex-shrink-0 rounded-none border border-[var(--mister-border-window)] bg-[var(--mister-bg-window)] px-2 py-0.5 font-mono text-[10px] font-[500] uppercase tracking-[0.12em] text-[var(--mister-text-primary)]">
          {payload.category}
        </span>
      </div>

      {/* Gold rule */}
      <div className="border-t border-[var(--mister-gold-rule)]" />

      {/* Spec grid */}
      <div>
        {specEntries.map(([label, value], i) => (
          <div
            key={label}
            className={`flex items-baseline justify-between px-4 py-2.5 ${
              i < specEntries.length - 1
                ? 'border-b border-[var(--mister-border-row)]'
                : ''
            }`}
          >
            <span className="mr-4 font-mono text-[11px] font-[300] tracking-[0.06em] text-[var(--mister-text-secondary)]">
              {label}
            </span>
            <span className="font-mono text-[13px] font-[500] text-[var(--mister-text-primary)]">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex min-h-[36px] items-center justify-between border-t border-[var(--mister-border-row)] px-4">
        <span className="rounded-none border border-[var(--mister-border-window)] bg-[var(--mister-bg-window)] px-2 py-0.5 font-mono text-[10px] font-[500] uppercase tracking-[0.12em] text-[var(--mister-text-primary)]">
          CHINA
        </span>
        <a
          href={`/catalogo/${payload.category}/${payload.slug}`}
          className="font-body text-[12px] text-[var(--mister-gold)] hover:underline"
        >
          Ver ficha completa →
        </a>
      </div>
    </motion.div>
  )
}
