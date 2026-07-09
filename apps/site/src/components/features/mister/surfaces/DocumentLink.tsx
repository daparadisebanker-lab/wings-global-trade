// src/components/features/mister/surfaces/DocumentLink.tsx
// Document entry in a file index. Inline, not a card. designer.md §4.
'use client'

import { motion } from 'framer-motion'
import type { DocumentSurface } from '@/types/mister'
import { surfaceCardVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  payload: DocumentSurface
}

export function DocumentLink({ payload }: Props) {
  const reduced = useReducedMotion()

  if (!payload.available) {
    return (
      <div className="flex items-center gap-3 py-1">
        {/* Geometric document icon */}
        <svg
          width="14"
          height="16"
          viewBox="0 0 14 16"
          fill="none"
          className="flex-shrink-0"
          aria-hidden
        >
          <path
            d="M1 1h8l4 4v10H1V1z"
            stroke="rgba(248,246,240,0.35)"
            strokeWidth="1.5"
            fill="none"
          />
          <path d="M9 1v4h4" stroke="rgba(248,246,240,0.35)" strokeWidth="1.5" />
        </svg>
        <p className="font-body text-[13px] text-[var(--mister-text-muted)]">
          Documento no disponible para {payload.productType} / {payload.country}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={surfaceCardVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="flex items-center gap-3 py-1"
    >
      {/* Geometric document icon */}
      <svg
        width="14"
        height="16"
        viewBox="0 0 14 16"
        fill="none"
        className="flex-shrink-0"
        aria-hidden
      >
        <path
          d="M1 1h8l4 4v10H1V1z"
          stroke="var(--mister-text-primary)"
          strokeWidth="1.5"
          fill="none"
        />
        <path d="M9 1v4h4" stroke="var(--mister-text-primary)" strokeWidth="1.5" />
      </svg>

      <p className="font-body text-[13px] text-[var(--mister-text-primary)]">
        {payload.title ?? `Documento ${payload.productType}`}
      </p>

      <span className="rounded-none border border-[rgba(196,147,63,0.20)] bg-[rgba(196,147,63,0.08)] px-1.5 py-0.5 font-mono text-[10px] font-[400] uppercase tracking-[0.08em] text-[var(--mister-text-secondary)]">
        PDF
      </span>

      {payload.url && (
        <a
          href={payload.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto font-body text-[12px] text-[var(--mister-gold)] hover:underline"
        >
          ↓ Descargar
        </a>
      )}
    </motion.div>
  )
}
