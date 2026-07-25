'use client'

// CostingWorkbench — the lane-aware entry to Costeo (root CLAUDE.md §3). Before
// dropping the operator into a form, it asks WHAT they're costing: an inbound
// import (the SUNAT landed-cost engine — machinery, vehicles, commodities) or an
// outbound origin export (the export build-up engine — coffee, cacao, provenance
// goods). Each mode shows product examples so a rep recognizes their lane, then
// renders the form true to that costing logic. Prorrateo + bulk import stay as
// their own routes (header links) — they're import sub-tools.
import { useState } from 'react'
import { cn } from '@wings/trade-ui'
import { CostCalculator } from './CostCalculator'
import { ExportCostCalculator } from './ExportCostCalculator'
import type { CostCalculationRow, CostingLane } from '@/lib/actions/costing'
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '@/lib/i18n'

type Mode = 'import' | 'export'

interface ModeCard {
  mode: Mode
  title: Localized
  blurb: Localized
  /** Product / subcategory examples so a rep recognizes their lane at a glance. */
  examples: Localized
}

const MODES: ModeCard[] = [
  {
    mode: 'import',
    title: { es: 'Importación (Perú)', en: 'Import (Peru)' },
    blurb: {
      es: 'Costo puesto en almacén con impuestos SUNAT (CIF → derechos → IGV → margen).',
      en: 'Landed cost with SUNAT taxes (CIF → duties → IGV → margin).',
    },
    examples: {
      es: 'Maquinaria · vehículos · línea blanca · materiales de construcción · textiles · insumos',
      en: 'Machinery · vehicles · appliances · construction materials · textiles · inputs',
    },
  },
  {
    mode: 'export',
    title: { es: 'Exportación (origen)', en: 'Export (origin)' },
    blurb: {
      es: 'Oferta de salida por Incoterm (EXW → FOB → CFR → CIF + margen), sin impuestos de destino.',
      en: 'Outbound offer by Incoterm (EXW → FOB → CFR → CIF + margin), no destination taxes.',
    },
    examples: {
      es: 'Café · cacao · superfoods · textiles · provenance',
      en: 'Coffee · cacao · superfoods · textiles · provenance',
    },
  },
]

export function CostingWorkbench({
  lanes,
  initialHistory,
  locale = DEFAULT_LOCALE,
}: {
  lanes: CostingLane[]
  initialHistory: CostCalculationRow[]
  locale?: Locale
}) {
  const [mode, setMode] = useState<Mode>('import')

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="pb-1 font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
          {t({ es: '¿Qué estás costeando?', en: 'What are you costing?' }, locale)}
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODES.map((m) => {
            const on = mode === m.mode
            return (
              <button
                key={m.mode}
                type="button"
                aria-pressed={on}
                onClick={() => setMode(m.mode)}
                className={cn(
                  'flex flex-col gap-1.5 rounded-card border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent',
                  on ? 'border-lane-accent bg-surface-2' : 'border-line bg-surface-1 hover:border-lane-accent',
                )}
              >
                <span className={cn('font-display text-t1', on ? 'text-ink-primary' : 'text-ink-secondary')}>
                  {t(m.title, locale)}
                </span>
                <span className="font-ui text-t0 text-ink-secondary">{t(m.blurb, locale)}</span>
                <span className="mt-1 font-mono text-label uppercase tracking-[0.06em] text-ink-tertiary">
                  {t(m.examples, locale)}
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {mode === 'import' ? (
        <CostCalculator lanes={lanes} initialHistory={initialHistory} />
      ) : (
        <ExportCostCalculator locale={locale} />
      )}
    </div>
  )
}
