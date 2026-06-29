// src/components/features/mister/MisterProgressPanel.tsx
// Right-sidebar for embedded Mister. Shows stage progress, archetype, collected
// qualification fields (filled vs pending), and a stage-appropriate CTA.
// Desktop only — hidden on mobile (controlled by parent layout).
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMister } from '@/components/features/mister/MisterProvider'
import type { MisterCollected, MisterStage } from '@/types/mister'

// ─── Field definitions ────────────────────────────────────────────────────────

interface FieldDef {
  key: keyof MisterCollected
  label: string
  group: string
  getValue: (c: MisterCollected) => string | undefined
}

const FIELDS: FieldDef[] = [
  // Operación
  {
    key: 'destinationCountry',
    label: 'País de destino',
    group: 'OPERACIÓN',
    getValue: (c) => c.destinationCountry,
  },
  {
    key: 'incoterm',
    label: 'Incoterm',
    group: 'OPERACIÓN',
    getValue: (c) => c.incoterm,
  },
  {
    key: 'containerType',
    label: 'Contenedor',
    group: 'OPERACIÓN',
    getValue: (c) => c.containerType,
  },
  {
    key: 'volume',
    label: 'Volumen / cantidad',
    group: 'OPERACIÓN',
    getValue: (c) => c.volume,
  },
  // Empresa
  {
    key: 'ruc',
    label: 'RUC / empresa',
    group: 'EMPRESA',
    getValue: (c) => c.ruc,
  },
  {
    key: 'timeline',
    label: 'Timeline',
    group: 'EMPRESA',
    getValue: (c) => c.timeline,
  },
  // Comercial
  {
    key: 'budgetBand',
    label: 'Band de presupuesto',
    group: 'COMERCIAL',
    getValue: (c) => c.budgetBand,
  },
]

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

const ARCHETYPE_LABELS: Record<string, string> = {
  lead_buyer: 'Comprador Final',
  project_manager: 'Project Manager',
  logistics_manager: 'Gerencia de Logística',
  reseller: 'Distribuidor / Reseller',
  wholesale_partner: 'Socio Wholesale B2B',
  unresolved: 'Identificando perfil...',
}

// ─── Field ring progress indicator ───────────────────────────────────────────

const RING_SIZE = 36
const RING_STROKE = 2.5
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function FieldRing({ filled, total }: { filled: number; total: number }) {
  const progress = total > 0 ? filled / total : 0
  const dashoffset = RING_CIRCUMFERENCE - progress * RING_CIRCUMFERENCE
  return (
    <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90 flex-shrink-0" aria-hidden>
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(196,147,63,0.15)"
        strokeWidth={RING_STROKE}
      />
      <motion.circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke="#C4933F"
        strokeWidth={RING_STROKE}
        strokeLinecap="square"
        strokeDasharray={RING_CIRCUMFERENCE}
        animate={{ strokeDashoffset: dashoffset }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MisterProgressPanel() {
  const { stage, archetype, isResolved, collected, sessionId, sendMessage, inFlight, isStreaming } =
    useMister()

  // Track which fields were just captured for the amber flash animation
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set())
  const prevCollectedRef = useRef<MisterCollected>({})

  useEffect(() => {
    const prev = prevCollectedRef.current
    const isFilled = (v: unknown): boolean => {
      if (v === undefined || v === null || v === '') return false
      return Array.isArray(v) ? v.length > 0 : true
    }
    const newKeys = (Object.keys(collected) as (keyof MisterCollected)[]).filter(
      (k) => !isFilled(prev[k]) && isFilled(collected[k]),
    )
    if (newKeys.length > 0) {
      setHighlightedFields((curr) => new Set([...curr, ...newKeys]))
      const timer = window.setTimeout(() => {
        setHighlightedFields((curr) => {
          const next = new Set(curr)
          newKeys.forEach((k) => next.delete(k as string))
          return next
        })
      }, 1500)
      prevCollectedRef.current = { ...collected }
      return () => clearTimeout(timer)
    }
    prevCollectedRef.current = { ...collected }
  }, [collected])

  const stageIdx = STAGE_ORDER.indexOf(stage)
  const filledFields = FIELDS.filter((f) => {
    const v = f.getValue(collected)
    return v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  })
  const filledCount = filledFields.length
  const totalCount = FIELDS.length

  // Group fields for display
  const groups: Record<string, FieldDef[]> = {}
  for (const field of FIELDS) {
    if (!groups[field.group]) groups[field.group] = []
    groups[field.group]!.push(field)
  }

  const handleCta = () => {
    if (inFlight || isStreaming) return
    if (stage === 'pre_qualification') {
      sendMessage('Quiero solicitar una cotización formal', 'open_quotation')
    } else if (stage === 'support') {
      sendMessage('Quiero hablar con un especialista de Wings', 'connect_whatsapp')
    } else {
      sendMessage('¿Cuál es el siguiente paso?', 'ask_followup')
    }
  }

  const ctaLabel =
    stage === 'pre_qualification'
      ? 'SOLICITAR COTIZACIÓN'
      : stage === 'support'
        ? 'HABLAR CON ESPECIALISTA'
        : null

  return (
    <aside
      className="hidden w-72 flex-shrink-0 flex-col overflow-y-auto border-l border-[rgba(248,246,240,0.08)] bg-[var(--mister-bg-header)] lg:flex xl:w-80"
      aria-label="Panel de progreso de sesión"
    >
      {/* Header */}
      <div className="border-b border-[rgba(248,246,240,0.08)] px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] font-[400] uppercase tracking-[0.16em] text-[var(--mister-text-ghost)]">
            SESIÓN EN PROGRESO
          </p>
          <p className="font-mono text-[9px] font-[300] tracking-[0.06em] text-[var(--mister-text-ghost)]">
            {sessionId.slice(-8)}
          </p>
        </div>
        {/* Campo count — arc ring progress indicator */}
        <div className="mt-3 flex items-center gap-3">
          <FieldRing filled={filledCount} total={totalCount} />
          <div>
            <p className="font-mono text-[22px] font-[500] leading-none text-[var(--mister-text-primary)]">
              {filledCount}
              <span className="text-[var(--mister-text-ghost)]"> / {totalCount}</span>
            </p>
            <p className="mt-0.5 font-body text-[10px] font-[300] text-[var(--mister-text-muted)]">
              campos capturados
            </p>
          </div>
        </div>
      </div>

      {/* Stage progress */}
      <div className="border-b border-[rgba(248,246,240,0.08)] px-5 py-4">
        <p className="mb-3 font-mono text-[9px] font-[400] uppercase tracking-[0.16em] text-[var(--mister-text-ghost)]">
          ETAPA
        </p>
        <div className="flex flex-col gap-1.5">
          {STAGE_ORDER.map((s, i) => {
            const isActive = s === stage
            const isPast = i < stageIdx
            return (
              <div key={s} className="flex items-center gap-2.5">
                {/* Dot — size hierarchy: active 8px, past 6px, upcoming 4px */}
                <div className="flex h-2 w-2 flex-shrink-0 items-center justify-center">
                  {isPast ? (
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none" aria-hidden>
                      <polyline points="0.5,3.5 2,5 5.5,1" stroke="rgba(196,147,63,0.55)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <div
                      className={`rounded-none ${
                        isActive
                          ? 'h-2 w-2 bg-[var(--mister-gold)]'
                          : 'h-1 w-1 bg-[var(--mister-text-ghost)] opacity-30'
                      }`}
                    />
                  )}
                </div>
                <p
                  className={`font-mono text-[10px] uppercase tracking-[0.08em] ${
                    isActive
                      ? 'font-[600] text-[var(--mister-gold)]'
                      : isPast
                        ? 'font-[400] text-[var(--mister-text-muted)]'
                        : 'font-[300] text-[var(--mister-text-ghost)]'
                  }`}
                >
                  {STAGE_LABELS[s]}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Archetype */}
      <div className="border-b border-[rgba(248,246,240,0.08)] px-5 py-4">
        <p className="mb-2 font-mono text-[9px] font-[400] uppercase tracking-[0.16em] text-[var(--mister-text-ghost)]">
          PERFIL
        </p>
        <p
          className={`font-mono text-[11px] font-[500] uppercase tracking-[0.06em] ${
            isResolved ? 'text-[var(--mister-gold)]' : 'text-[var(--mister-text-ghost)]'
          }`}
        >
          {isResolved ? (
            ARCHETYPE_LABELS[archetype] ?? 'Identificando perfil...'
          ) : (
            <>
              <span>Identificando</span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
              >
                ···
              </motion.span>
            </>
          )}
        </p>
      </div>

      {/* Collected fields */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {Object.entries(groups).map(([groupName, fields]) => (
          <div key={groupName} className="mb-5">
            <p className="mb-2 font-mono text-[9px] font-[400] uppercase tracking-[0.14em] text-[rgba(248,246,240,0.45)]">
              {groupName}
            </p>
            <div className="flex flex-col gap-2">
              {fields.map((field) => {
                const value = field.getValue(collected)
                const isFilled = value !== undefined && value !== ''
                const isHighlighted = highlightedFields.has(field.key)
                return (
                  <motion.div
                    key={field.key}
                    animate={{
                      backgroundColor: isHighlighted
                        ? 'rgba(196,147,63,0.08)'
                        : 'transparent',
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex items-start gap-2 -mx-1 rounded-sm px-1"
                  >
                    {/* Status dot */}
                    <div
                      className={`mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                        isFilled ? 'bg-[var(--mister-gold)]' : 'bg-[var(--mister-text-ghost)] opacity-40'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[9px] uppercase tracking-[0.10em] text-[var(--mister-text-ghost)]">
                        {field.label}
                      </p>
                      {isFilled ? (
                        <p className="font-body text-[11px] leading-[1.4] text-[var(--mister-text-primary)]">
                          {String(value)}
                        </p>
                      ) : (
                        <span className="mt-0.5 inline-flex items-center rounded-[3px] border border-[rgba(248,246,240,0.10)] bg-[rgba(248,246,240,0.05)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--mister-text-ghost)]">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {ctaLabel && (
        <div className="border-t border-[rgba(248,246,240,0.08)] p-5">
          <button
            type="button"
            onClick={handleCta}
            disabled={inFlight || isStreaming}
            className="w-full bg-[var(--mister-gold)] px-4 py-3 font-mono text-[11px] font-[600] uppercase tracking-[0.14em] text-[var(--mister-bg-window)] transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ctaLabel}
          </button>
        </div>
      )}
    </aside>
  )
}
