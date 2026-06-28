// src/components/features/mister/surfaces/ContactCard.tsx
// WhatsApp action card — the handoff. A button, not a text link.
// Pre-fills the WhatsApp message with archetype + sessionId + detected intent
// so the Wings team receives context-rich first messages.
'use client'

import { motion } from 'framer-motion'
import type { ContactSurface } from '@/types/mister'
import { surfaceCardVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMister } from '@/components/features/mister/MisterProvider'
import { HAPTIC } from '@/lib/mister/haptics'

const ARCHETYPE_LABELS: Record<string, string> = {
  lead_buyer: 'Comprador Final',
  project_manager: 'Project Manager',
  logistics_manager: 'Gerencia de Logística',
  reseller: 'Distribuidor / Reseller',
  wholesale_partner: 'Socio Wholesale B2B',
  unresolved: '',
}

interface Props {
  payload: ContactSurface
}

export function ContactCard({ payload }: Props) {
  const reduced = useReducedMotion()
  const { archetype, sessionId, collected } = useMister()

  const archetypeLabel = ARCHETYPE_LABELS[archetype] ?? ''
  const productIds = collected.productInterest ?? []
  const intent = productIds.length > 0 ? productIds.join(', ') : ''

  const waNumber = payload.whatsapp.replace(/\D/g, '')
  const waParts = [
    'Hola, vengo de Mister (Asesor Wings).',
    archetypeLabel ? `Perfil: ${archetypeLabel}.` : '',
    `Consulta #${sessionId}.`,
    intent ? `Interés: ${intent}.` : '',
  ].filter(Boolean)
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waParts.join(' '))}`

  return (
    <motion.div
      variants={surfaceCardVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="rounded-none border border-[var(--mister-border-surface)] border-l-[3px] border-l-[var(--mister-gold)] bg-[var(--mister-bg-inset)] mister-shadow-surface overflow-hidden"
    >
      {/* Header strip */}
      <div className="flex items-start justify-between px-4 pt-3.5 pb-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.12em] text-[rgba(196,147,63,0.60)]">
            WINGS GLOBAL TRADE
          </p>
          <p className="mt-0.5 font-body text-[14px] font-[600] leading-[1.3] text-[var(--mister-text-primary)]">
            {payload.name}
          </p>
          <p className="font-mono text-[11px] font-[400] tracking-[0.04em] text-[var(--mister-text-secondary)]">
            {payload.role}
          </p>
        </div>
        <p className="flex-shrink-0 font-mono text-[9px] font-[300] tracking-[0.04em] text-[var(--mister-text-ghost)]">
          Responde &lt; 2h
        </p>
      </div>

      {/* Gold rule */}
      <div className="mx-4 h-px bg-[var(--mister-gold-rule)]" />

      {/* Primary CTA */}
      <div className="px-4 pt-3 pb-3.5">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => HAPTIC.whatsapp()}
          className="flex h-10 w-full items-center justify-center gap-2 bg-[var(--mister-gold)] font-mono text-[11px] font-[600] uppercase tracking-[0.12em] text-[#001E50] transition-opacity duration-150 hover:opacity-90 active:opacity-75"
        >
          Abrir WhatsApp →
        </a>

        {payload.email && (
          <a
            href={`mailto:${payload.email}`}
            className="mt-2 block text-center font-mono text-[10px] font-[300] uppercase tracking-[0.06em] text-[var(--mister-text-muted)] transition-colors duration-150 hover:text-[var(--mister-text-secondary)]"
          >
            → {payload.email}
          </a>
        )}
      </div>
    </motion.div>
  )
}
