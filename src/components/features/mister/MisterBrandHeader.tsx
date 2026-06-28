// src/components/features/mister/MisterBrandHeader.tsx
// Full brand identity header for embedded /mister page.
// Recreates the "tool" feel: big MISTER identity, session ref, archetype badge.
// NOT used in floating mode (floating uses MisterHeader, the 48px compact band).
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

export function MisterBrandHeader() {
  const { sessionId, archetype, isResolved, stage } = useMister()

  const archetypeLabel = ARCHETYPE_LABELS[archetype] ?? ''

  return (
    <div className="flex-shrink-0 border-b border-[var(--mister-gold-rule)] bg-[var(--mister-bg-header)] px-6 pt-5 pb-0">
      {/* Issuing authority */}
      <p className="mb-3 font-mono text-[10px] font-[400] uppercase tracking-[0.20em] text-[var(--mister-text-ghost)]">
        ASESOR DE IMPORTACIÓN · WINGS GLOBAL TRADE
      </p>

      {/* MISTER wordmark — display font, large */}
      <div className="flex items-end justify-between">
        <h1 className="font-display text-[56px] font-[400] uppercase leading-none tracking-[-0.01em] text-[var(--mister-text-primary)] md:text-[72px]">
          MISTER
        </h1>

        {/* Archetype badge — visible once resolved */}
        {isResolved && (
          <div className="mb-2 flex flex-col items-end gap-1">
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
