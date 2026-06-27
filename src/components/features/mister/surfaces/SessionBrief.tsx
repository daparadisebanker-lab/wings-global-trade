// src/components/features/mister/surfaces/SessionBrief.tsx
// The Live Session Brief — replaces TprSheet in v2.
// Professional intake format: shows what Mister has learned.
// Empty fields create the pull (game-designer.md).
// NO TPR/CIF semantics — uses MisterCollected vocabulary.
'use client'

import { useMister } from '@/components/features/mister/MisterProvider'

const ARCHETYPE_LABELS: Record<string, string> = {
  lead_buyer:         'Comprador directo',
  project_manager:    'Gerente de proyecto',
  logistics_manager:  'Gerente de logística',
  reseller:           'Revendedor',
  wholesale_partner:  'Socio mayorista',
  unresolved:         'Sin clasificar',
}

const STAGE_LABELS: Record<string, string> = {
  induction:          'Inducción',
  discovery:          'Descubrimiento',
  consideration:      'Consideración',
  pre_qualification:  'Pre-calificación',
  support:            'Soporte',
}

// Field template — display label + placeholder for empty
const BRIEF_FIELDS: { key: string; label: string }[] = [
  { key: 'productInterest', label: 'PRODUCTO / CATEGORÍA' },
  { key: 'destinationCountry', label: 'PAÍS DE DESTINO' },
  { key: 'destinationCity', label: 'CIUDAD DESTINO' },
  { key: 'incoterm', label: 'INCOTERM' },
  { key: 'containerType', label: 'TIPO CONTENEDOR' },
  { key: 'volume', label: 'VOLUMEN' },
  { key: 'timeline', label: 'PLAZO' },
  { key: 'budgetBand', label: 'BANDA PRESUPUESTAL' },
  { key: 'ruc', label: 'RUC' },
]

export function SessionBrief() {
  const { sessionId, archetype, stage, isResolved, entries } = useMister()

  const turnCount = entries.filter((e) => e.role === 'assistant').length

  return (
    <div className="flex h-full flex-col border-t border-[var(--mister-border-window)] bg-[var(--mister-bg-inset)] lg:border-l lg:border-t-0">
      {/* Brief header */}
      <div className="border-b border-[var(--mister-gold-rule)] px-5 py-4">
        <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.12em] text-[var(--mister-text-secondary)]">
          RESUMEN DE SESIÓN
        </p>
        <p className="mt-1 font-mono text-[11px] font-[400] uppercase tracking-[0.08em] text-[var(--mister-text-ghost)]">
          {sessionId}
        </p>
      </div>

      {/* Identity block */}
      <div className="border-b border-[var(--mister-border-row)] px-5 py-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] font-[300] uppercase tracking-[0.08em] text-[var(--mister-text-ghost)]">
            PERFIL
          </p>
          <span
            className={`font-mono text-[10px] font-[500] uppercase tracking-[0.08em] ${
              isResolved
                ? 'text-[var(--mister-status-resolved)]'
                : 'text-[var(--mister-status-unresolved)]'
            }`}
          >
            {ARCHETYPE_LABELS[archetype] ?? archetype}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="font-mono text-[9px] font-[300] uppercase tracking-[0.08em] text-[var(--mister-text-ghost)]">
            ETAPA
          </p>
          <span className="font-mono text-[10px] font-[500] uppercase tracking-[0.08em] text-[var(--mister-text-secondary)]">
            {STAGE_LABELS[stage] ?? stage}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="font-mono text-[9px] font-[300] uppercase tracking-[0.08em] text-[var(--mister-text-ghost)]">
            TURNOS
          </p>
          <span className="font-mono text-[10px] font-[500] text-[var(--mister-text-secondary)]">
            {turnCount}
          </span>
        </div>
      </div>

      {/* Collected fields — empty fields shown as "--" to create pull */}
      <div className="flex-1 overflow-y-auto">
        {BRIEF_FIELDS.map(({ key, label }, i) => (
          <div
            key={key}
            className={`flex items-baseline justify-between px-5 py-2.5 ${
              i < BRIEF_FIELDS.length - 1 ? 'border-b border-[var(--mister-border-row)]' : ''
            }`}
          >
            <p className="mr-3 font-mono text-[9px] font-[300] uppercase tracking-[0.08em] text-[var(--mister-text-ghost)]">
              {label}
            </p>
            <p className="font-mono text-[11px] font-[500] text-[var(--mister-text-ghost)]">
              —
            </p>
          </div>
        ))}
      </div>

      {/* Footer disclaimer */}
      <div className="border-t border-[var(--mister-border-row)] px-5 py-3">
        <p className="font-body text-[10px] font-[300] text-[var(--mister-text-ghost)]">
          Los campos se completan a medida que avanza la consulta.
        </p>
      </div>
    </div>
  )
}
