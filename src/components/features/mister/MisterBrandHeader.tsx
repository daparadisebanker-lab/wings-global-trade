// src/components/features/mister/MisterBrandHeader.tsx
// Full brand identity header for embedded /mister page and fullscreen overlay.
// Recreates the "tool" feel: big MISTER identity, session ref, archetype badge.
// Overlay mode adds a "← VOLVER AL SITIO" exit control (Law 3: a door, not a switch).
'use client'

import { useMister } from '@/components/features/mister/MisterProvider'

const ARCHETYPE_LABELS: Record<string, string> = {
  lead_buyer: 'Comprador Final',
  project_manager: 'Project Manager',
  logistics_manager: 'Gerencia de Logística',
  reseller: 'Distribuidor / Reseller',
  wholesale_partner: 'Socio Wholesale B2B',
  unresolved: '',
}

interface Props {
  mode?: 'embedded' | 'overlay'
  onClose?: () => void
}

export function MisterBrandHeader({ mode = 'embedded', onClose }: Props) {
  const { sessionId, archetype, isResolved, stage } = useMister()

  const archetypeLabel = ARCHETYPE_LABELS[archetype] ?? ''

  return (
    <div className="flex-shrink-0 border-b border-[var(--mister-gold-rule)] bg-[var(--mister-bg-header)] px-6 pt-4 pb-0">
      {/* Top strip: issuing authority + exit control (overlay only) */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-[400] uppercase tracking-[0.20em] text-[var(--mister-text-ghost)]">
          ASESOR DE IMPORTACIÓN · WINGS GLOBAL TRADE
        </p>

        {mode === 'overlay' && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Volver al sitio"
            className="group flex items-center gap-2 font-mono text-[10px] font-[400] uppercase tracking-[0.14em] text-[var(--mister-text-ghost)] transition-colors duration-150 hover:text-[var(--mister-text-primary)]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <line x1="11" y1="6" x2="1" y2="6" stroke="currentColor" strokeWidth="1" />
              <polyline points="4,3 1,6 4,9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            VOLVER AL SITIO
          </button>
        )}
      </div>

      {/* MISTER wordmark — display font, large */}
      <div className="mt-3 flex items-end justify-between">
        <h1 className="font-display text-[48px] font-[400] uppercase leading-none tracking-[-0.01em] text-[var(--mister-text-primary)] md:text-[64px]">
          MISTER
        </h1>

        {/* Archetype badge — visible once resolved */}
        {isResolved && (
          <div className="mb-1 flex flex-col items-end gap-1">
            <p className="font-mono text-[9px] font-[400] uppercase tracking-[0.14em] text-[var(--mister-text-ghost)]">
              PERFIL IDENTIFICADO
            </p>
            <p className="font-mono text-[12px] font-[600] uppercase tracking-[0.08em] text-[var(--mister-gold)]">
              {archetypeLabel}
            </p>
          </div>
        )}
      </div>

      {/* Gold rule */}
      <div className="mt-3 h-px w-full bg-[var(--mister-gold-rule)]" />

      {/* Session row */}
      <div className="flex items-center justify-between py-2">
        <p className="font-mono text-[10px] font-[300] uppercase tracking-[0.10em] text-[var(--mister-text-ghost)]">
          CONSULTA #{sessionId}
        </p>
        <p className="font-mono text-[10px] font-[300] uppercase tracking-[0.10em] text-[var(--mister-text-ghost)]">
          {stage.replace('_', ' ')}
        </p>
      </div>
    </div>
  )
}
