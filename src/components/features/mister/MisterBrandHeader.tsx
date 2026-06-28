// src/components/features/mister/MisterBrandHeader.tsx
// Full brand identity header for embedded /mister page and fullscreen overlay.
// Overlay mode: pill-style "← Volver al sitio" exit with 44px tap target.
// Mobile stage tracker: expandable progress list (lg:hidden — panel handles it on desktop).
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMister } from '@/components/features/mister/MisterProvider'
import { HAPTIC } from '@/lib/mister/haptics'
import type { MisterStage } from '@/types/mister'

const ARCHETYPE_LABELS: Record<string, string> = {
  lead_buyer: 'Comprador Final',
  project_manager: 'Project Manager',
  logistics_manager: 'Gerencia de Logística',
  reseller: 'Distribuidor / Reseller',
  wholesale_partner: 'Socio Wholesale B2B',
  unresolved: '',
}

const STAGE_ORDER: MisterStage[] = [
  'induction',
  'discovery',
  'consideration',
  'pre_qualification',
  'support',
]

const STAGE_LABELS: Record<MisterStage, string> = {
  induction: 'Inducción',
  discovery: 'Descubrimiento',
  consideration: 'Consideración',
  pre_qualification: 'Pre-calificación',
  support: 'Soporte',
}

const STAGE_DESCRIPTIONS: Record<MisterStage, string> = {
  induction: 'Identificando tu perfil operativo',
  discovery: 'Explorando el catálogo y opciones',
  consideration: 'Evaluando especificaciones y condiciones',
  pre_qualification: 'Definiendo volumen y términos',
  support: 'Conectando con el equipo comercial',
}

// Minimal cross-hair icon — clinical, technical, alive via breathing animation
function MisterIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      className="flex-shrink-0"
    >
      <circle
        cx="14"
        cy="14"
        r="10.5"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="2 3.5"
        opacity="0.30"
      />
      <line x1="14" y1="6" x2="14" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <line x1="14" y1="18" x2="14" y2="22" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <line x1="6" y1="14" x2="10" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <line x1="18" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <rect x="12.5" y="12.5" width="3" height="3" fill="currentColor" />
    </svg>
  )
}

interface Props {
  mode?: 'embedded' | 'overlay'
  onClose?: () => void
}

export function MisterBrandHeader({ mode = 'embedded', onClose }: Props) {
  const { sessionId, archetype, isResolved, stage } = useMister()
  const [stageExpanded, setStageExpanded] = useState(false)

  const archetypeLabel = ARCHETYPE_LABELS[archetype] ?? ''
  const stageIdx = STAGE_ORDER.indexOf(stage)

  const handleStageToggle = () => {
    HAPTIC.stageExpand()
    setStageExpanded((prev) => !prev)
  }

  const handleClose = () => {
    HAPTIC.exit()
    onClose?.()
  }

  return (
    <div className="flex-shrink-0 border-b border-[var(--mister-gold-rule)] bg-[var(--mister-bg-header)]">
      <div className="px-6 pt-4 pb-0">
        {/* Top strip: issuing authority + exit control */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-[400] uppercase tracking-[0.20em] text-[var(--mister-text-ghost)]">
            ASESOR DE IMPORTACIÓN · WINGS GLOBAL TRADE
          </p>

          {mode === 'overlay' && onClose && (
            <button
              type="button"
              onClick={handleClose}
              aria-label="Volver al sitio"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center"
            >
              <span className="flex items-center gap-1.5 rounded-full border border-[rgba(248,246,240,0.20)] bg-[rgba(248,246,240,0.04)] px-3 py-1.5 font-mono text-[10px] font-[400] uppercase tracking-[0.14em] text-[var(--mister-text-ghost)] transition-all duration-150 hover:border-[rgba(248,246,240,0.35)] hover:text-[var(--mister-text-primary)]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <line x1="9" y1="5" x2="1" y2="5" stroke="currentColor" strokeWidth="1" />
                  <polyline points="3,2.5 1,5 3,7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                Volver
              </span>
            </button>
          )}
        </div>

        {/* MISTER wordmark + breathing icon */}
        <div className="mt-3 flex items-end justify-between">
          <div className="flex items-end gap-3">
            {/* Breathing icon — opacity cycles 0.6→1→0.6 over 3s */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
              className="mb-1 text-[var(--mister-text-primary)]"
            >
              <MisterIcon />
            </motion.div>

            <h1 className="font-display text-[48px] font-[400] uppercase leading-none tracking-[-0.01em] text-[var(--mister-text-primary)] md:text-[64px]">
              MISTER
            </h1>
          </div>

          {/* Archetype badge */}
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

        {/* Session row — stage label is tappable on mobile */}
        <div className="flex items-center justify-between py-2">
          <p className="font-mono text-[10px] font-[300] uppercase tracking-[0.10em] text-[var(--mister-text-ghost)]">
            CONSULTA #{sessionId}
          </p>

          {/* Stage toggle — visible only on mobile (lg: shows the progress panel instead) */}
          <button
            type="button"
            onClick={handleStageToggle}
            aria-expanded={stageExpanded}
            aria-label="Ver progreso de consulta"
            className="flex items-center gap-1 lg:hidden"
          >
            <span className="h-1.5 w-1.5 flex-shrink-0 bg-[var(--mister-gold)]" />
            <span className="font-mono text-[10px] font-[300] uppercase tracking-[0.10em] text-[var(--mister-gold)]">
              {STAGE_LABELS[stage]}
            </span>
            <motion.span
              animate={{ rotate: stageExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="font-mono text-[10px] text-[var(--mister-text-ghost)]"
              aria-hidden
            >
              ▾
            </motion.span>
          </button>

          {/* Static stage label on desktop — panel handles the full tracker */}
          <p className="hidden font-mono text-[10px] font-[300] uppercase tracking-[0.10em] text-[var(--mister-text-ghost)] lg:block">
            {STAGE_LABELS[stage]}
          </p>
        </div>
      </div>

      {/* Expandable mobile stage tracker — hidden on lg (progress panel takes over) */}
      <AnimatePresence>
        {stageExpanded && (
          <motion.div
            key="mister-stage-tracker"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.20, 0.00, 0.00, 1.00] }}
            className="overflow-hidden border-t border-[var(--mister-border-window)] lg:hidden"
          >
            <div className="flex flex-col gap-2 px-6 py-3">
              {STAGE_ORDER.map((s, i) => {
                const isActive = s === stage
                const isPast = i < stageIdx
                return (
                  <div key={s} className="flex items-start gap-2.5">
                    <div
                      className={`mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-none ${
                        isActive
                          ? 'bg-[var(--mister-gold)]'
                          : isPast
                            ? 'bg-[rgba(196,147,63,0.35)]'
                            : 'bg-[var(--mister-text-ghost)] opacity-30'
                      }`}
                    />
                    <div>
                      <p
                        className={`font-mono text-[10px] uppercase tracking-[0.08em] ${
                          isActive
                            ? 'font-[600] text-[var(--mister-gold)]'
                            : isPast
                              ? 'font-[400] text-[var(--mister-text-muted)]'
                              : 'font-[300] text-[var(--mister-text-ghost)] opacity-50'
                        }`}
                      >
                        {STAGE_LABELS[s]}
                      </p>
                      {isActive && (
                        <p className="mt-0.5 font-body text-[11px] font-[300] text-[var(--mister-text-secondary)]">
                          {STAGE_DESCRIPTIONS[s]}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
