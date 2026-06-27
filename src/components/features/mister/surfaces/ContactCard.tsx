// src/components/features/mister/surfaces/ContactCard.tsx
// Business card entry from a trade directory. The handoff card.
// 3px gold left accent — stronger than the 2px assistant message rule.
// designer.md §4.
'use client'

import { motion } from 'framer-motion'
import type { ContactSurface } from '@/types/mister'
import { surfaceCardVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  payload: ContactSurface
}

export function ContactCard({ payload }: Props) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      variants={surfaceCardVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="rounded-none border border-[var(--mister-border-surface)] border-l-[3px] border-l-[var(--mister-gold)] bg-[var(--mister-bg-inset)] px-4 py-3.5 mister-shadow-surface"
    >
      {/* Issuing authority label */}
      <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.12em] text-[rgba(196,147,63,0.60)]">
        WINGS GLOBAL TRADE
      </p>

      {/* Contact name */}
      <p className="mt-1 font-body text-[14px] font-[600] text-[var(--mister-text-primary)]">
        {payload.name}
      </p>

      {/* Role */}
      <p className="font-mono text-[12px] font-[400] tracking-[0.04em] text-[var(--mister-text-secondary)]">
        {payload.role}
      </p>

      {/* WhatsApp action */}
      <a
        href={`https://wa.me/${payload.whatsapp.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block font-body text-[13px] text-[var(--mister-gold)] hover:underline"
      >
        → WhatsApp {payload.whatsapp}
      </a>

      {/* Email action */}
      {payload.email && (
        <a
          href={`mailto:${payload.email}`}
          className="mt-1 block font-body text-[12px] text-[var(--mister-text-secondary)] hover:text-[var(--mister-gold)] transition-colors duration-[150ms]"
        >
          → {payload.email}
        </a>
      )}
    </motion.div>
  )
}
