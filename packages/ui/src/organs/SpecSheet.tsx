// @wings/trade-ui · SpecSheet — scoped blueprint / printed technical spec page.
// Shared organ (ecosystem §2). Styles are token-driven only; renders from
// --mister-* / skeleton tokens with no hardcoded brand values.
// Extracted verbatim from apps/site mister/surfaces/SpecSheet.tsx (M3).
'use client'

import { motion } from 'framer-motion'
import { surfaceCardVariants } from '../motion/surface'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface Props {
  payload: Record<string, string>
}

export function SpecSheet({ payload }: Props) {
  const reduced = useReducedMotion()
  const entries = Object.entries(payload)

  const title = payload['name'] ?? payload['Nombre'] ?? 'Ficha Técnica'
  const category = payload['category'] ?? payload['Categoría'] ?? ''
  const hsCode = payload['hs_code'] ?? payload['HS'] ?? ''
  const specEntries = entries.filter(
    ([k]) => !['name', 'Nombre', 'category', 'Categoría', 'hs_code', 'HS'].includes(k),
  )

  return (
    <motion.div
      variants={surfaceCardVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="rounded-none border border-[var(--mister-border-surface)] bg-[var(--mister-bg-inset)] mister-shadow-surface"
    >
      {/* Title bar */}
      <div className="border-b border-[var(--mister-gold-rule)] px-5 py-4">
        <p className="font-display text-[20px] font-[400] leading-tight tracking-[-0.01em] text-[var(--mister-text-primary)]">
          {title}
        </p>
        {(category || hsCode) && (
          <p className="mt-1 font-mono text-[12px] font-[400] tracking-[0.06em] text-[var(--mister-text-muted)]">
            {[category, hsCode ? `HS ${hsCode}` : ''].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* Spec grid */}
      <div>
        {specEntries.map(([label, value], i) => (
          <div
            key={label}
            className={`flex items-baseline justify-between px-5 py-2.5 ${
              i < specEntries.length - 1 ? 'border-b border-[var(--mister-border-row)]' : ''
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

      {/* Export action */}
      <div className="border-t border-[var(--mister-border-row)] px-5 py-3">
        <button
          type="button"
          className="font-body text-[12px] text-[var(--mister-gold)] hover:underline"
        >
          ↓ Exportar ficha técnica
        </button>
      </div>
    </motion.div>
  )
}
