// src/components/features/mister/MisterProgressPanel.tsx
// Right-sidebar for embedded Mister. Shows stage progress, archetype, collected
// qualification fields (filled vs pending), and a stage-appropriate CTA.
// Desktop only — hidden on mobile (controlled by parent layout).
'use client'

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

// ─── Component ────────────────────────────────────────────────────────────────

export function MisterProgressPanel() {
  const { stage, archetype, isResolved, collected, sessionId, sendMessage, inFlight, isStreaming } =
    useMister()

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
      className="hidden w-72 flex-shrink-0 flex-col overflow-y-auto border-l border-[var(--mister-border-window)] bg-[var(--mister-bg-header)] lg:flex xl:w-80"
      aria-label="Panel de progreso de sesión"
    >
      {/* Header */}
      <div className="border-b border-[var(--mister-gold-rule)] px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] font-[400] uppercase tracking-[0.16em] text-[var(--mister-text-ghost)]">
            SESIÓN EN PROGRESO
          </p>
          <p className="font-mono text-[9px] font-[300] tracking-[0.06em] text-[var(--mister-text-ghost)]">
            {sessionId.slice(-8)}
          </p>
        </div>
        {/* Campo count */}
        <p className="mt-2 font-mono text-[22px] font-[500] leading-none text-[var(--mister-text-primary)]">
          {filledCount}
          <span className="text-[var(--mister-text-ghost)]"> / {totalCount}</span>
        </p>
        <p className="mt-0.5 font-body text-[10px] font-[300] text-[var(--mister-text-muted)]">
          campos capturados
        </p>
      </div>

      {/* Stage progress */}
      <div className="border-b border-[var(--mister-border-window)] px-5 py-4">
        <p className="mb-3 font-mono text-[9px] font-[400] uppercase tracking-[0.16em] text-[var(--mister-text-ghost)]">
          ETAPA
        </p>
        <div className="flex flex-col gap-1.5">
          {STAGE_ORDER.map((s, i) => {
            const isActive = s === stage
            const isPast = i < stageIdx
            return (
              <div key={s} className="flex items-center gap-2.5">
                {/* Dot */}
                <div
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-none ${
                    isActive
                      ? 'bg-[var(--mister-gold)]'
                      : isPast
                        ? 'bg-[rgba(196,147,63,0.35)]'
                        : 'bg-[var(--mister-text-ghost)] opacity-30'
                  }`}
                />
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
      <div className="border-b border-[var(--mister-border-window)] px-5 py-4">
        <p className="mb-2 font-mono text-[9px] font-[400] uppercase tracking-[0.16em] text-[var(--mister-text-ghost)]">
          PERFIL
        </p>
        <p
          className={`font-mono text-[11px] font-[500] uppercase tracking-[0.06em] ${
            isResolved ? 'text-[var(--mister-gold)]' : 'text-[var(--mister-text-ghost)]'
          }`}
        >
          {ARCHETYPE_LABELS[archetype] ?? 'Identificando perfil...'}
        </p>
      </div>

      {/* Collected fields */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {Object.entries(groups).map(([groupName, fields]) => (
          <div key={groupName} className="mb-5">
            <p className="mb-2 font-mono text-[9px] font-[400] uppercase tracking-[0.16em] text-[var(--mister-text-ghost)]">
              {groupName}
            </p>
            <div className="flex flex-col gap-2">
              {fields.map((field) => {
                const value = field.getValue(collected)
                const isFilled = value !== undefined && value !== ''
                return (
                  <div key={field.key} className="flex items-start gap-2">
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
                      <p
                        className={`font-body text-[11px] leading-[1.4] ${
                          isFilled
                            ? 'text-[var(--mister-text-primary)]'
                            : 'italic text-[var(--mister-text-ghost)] opacity-50'
                        }`}
                      >
                        {isFilled ? String(value) : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {ctaLabel && (
        <div className="border-t border-[var(--mister-gold-rule)] p-5">
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
