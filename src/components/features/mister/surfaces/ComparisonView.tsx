// src/components/features/mister/surfaces/ComparisonView.tsx
// Formal comparison table. designer.md §4.
// Delta summary row at bottom with --mister-wf-total-separator rule (per spec).
'use client'

import { motion } from 'framer-motion'
import type { ComparisonSurface } from '@/types/mister'
import { surfaceCardVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  payload: ComparisonSurface
}

export function ComparisonView({ payload }: Props) {
  const reduced = useReducedMotion()
  const [productA, productB] = payload.products

  if (!productA || !productB) return null

  // Compute delta: count axes where each product has a distinct value
  let aLeadCount = 0
  let bLeadCount = 0
  payload.axes.forEach((axis) => {
    const valA = productA.specs[axis] ?? '—'
    const valB = productB.specs[axis] ?? '—'
    if (valA !== '—' && valA !== valB) aLeadCount++
    else if (valB !== '—' && valA !== valB) bLeadCount++
  })

  const deltaSummary =
    bLeadCount > aLeadCount
      ? `Opción B diferenciada en ${bLeadCount - aLeadCount} eje${bLeadCount - aLeadCount !== 1 ? 's' : ''} de ${payload.axes.length} comparados`
      : aLeadCount > bLeadCount
        ? `Opción A diferenciada en ${aLeadCount - bLeadCount} eje${aLeadCount - bLeadCount !== 1 ? 's' : ''} de ${payload.axes.length} comparados`
        : 'Especificaciones equivalentes en todos los ejes comparados'

  return (
    <motion.div
      variants={surfaceCardVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="rounded-none border border-[var(--mister-border-surface)] bg-[var(--mister-bg-inset)] mister-shadow-surface"
    >
      {/* Column header band */}
      <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-[var(--mister-gold-rule)] bg-[var(--mister-bg-header)]">
        <div className="px-4 py-3" />
        {[productA, productB].map((p, i) => (
          <div key={p.id} className="border-l border-[var(--mister-border-row)] px-4 py-3">
            <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.10em] text-[var(--mister-text-secondary)]">
              {i === 0 ? 'OPCIÓN A' : 'OPCIÓN B'}
            </p>
            <p className="mt-0.5 font-display text-[15px] font-[400] leading-tight text-[var(--mister-text-primary)]">
              {p.name}
            </p>
          </div>
        ))}
      </div>

      {/* Spec rows */}
      {payload.axes.map((axis, rowIdx) => {
        const valA = productA.specs[axis] ?? '—'
        const valB = productB.specs[axis] ?? '—'
        const aLeads = valA !== '—' && valA !== valB
        const bLeads = valB !== '—' && valA !== valB && !aLeads

        return (
          <div
            key={axis}
            className={`grid grid-cols-[1fr_1fr_1fr] ${rowIdx < payload.axes.length - 1 ? 'border-b border-[var(--mister-border-row)]' : ''}`}
          >
            <div className="px-4 py-2.5">
              <p className="font-mono text-[11px] font-[300] tracking-[0.06em] text-[var(--mister-text-secondary)]">
                {axis}
              </p>
            </div>
            {/* 3px gold left border when this column leads — structural mark, not background fill */}
            <div
              className={`border-l border-[var(--mister-border-row)] px-4 py-2.5 ${
                aLeads ? 'border-l-[3px] border-l-[var(--mister-gold)]' : ''
              }`}
            >
              <p className="font-mono text-[13px] font-[500] text-[var(--mister-text-primary)]">
                {valA}
              </p>
            </div>
            <div
              className={`border-l border-[var(--mister-border-row)] px-4 py-2.5 ${
                bLeads ? 'border-l-[3px] border-l-[var(--mister-gold)]' : ''
              }`}
            >
              <p className="font-mono text-[13px] font-[500] text-[var(--mister-text-primary)]">
                {valB}
              </p>
            </div>
          </div>
        )
      })}

      {/* Delta summary row — Teko 400 12px, --mister-text-secondary, --mister-wf-total-separator top rule */}
      {payload.axes.length > 0 && (
        <div className="border-t border-[var(--mister-wf-total-separator)] px-4 py-2.5">
          <p className="font-mono text-[12px] font-[400] tracking-[0.02em] text-[var(--mister-text-secondary)]">
            {deltaSummary}
          </p>
        </div>
      )}
    </motion.div>
  )
}
