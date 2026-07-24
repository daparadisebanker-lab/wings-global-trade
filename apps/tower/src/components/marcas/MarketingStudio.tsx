'use client'

// MarketingStudio — the marketing space's front door (root CLAUDE.md §5-bis). It
// asks WHAT you're promoting, then routes to the source true to that scenario;
// everything downstream is one uniform Wings pipeline (compose copy + share card
// → share to a client via WhatsApp, WS5). Three sources:
//   · Contenedor — an active allocation (the original slot-visualization promo)
//   · Catálogo   — a product already on our listings (spec-forward)
//   · Prueba     — a market probe: a product NOT listed, shared to test demand
import { useState } from 'react'
import { cn } from '@wings/trade-ui'
import { PromoWorkbench } from './PromoWorkbench'
import { CatalogPromoWorkbench } from './CatalogPromoWorkbench'
import { TrialPromoComposer } from './TrialPromoComposer'
import type { PromotableContainerRow } from '@/lib/actions/container-promo'
import type { ShareRecipient } from '@/lib/actions/share-recipients-logic'
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '@/lib/i18n'

type Source = 'contenedor' | 'catalogo' | 'prueba'

const SOURCES: { source: Source; title: Localized; blurb: Localized; examples: Localized }[] = [
  {
    source: 'contenedor',
    title: { es: 'Contenedor', en: 'Container' },
    blurb: {
      es: 'Un contenedor activo con cupos por vender.',
      en: 'An active container with slots to sell.',
    },
    examples: { es: 'Asignaciones de marcas representadas', en: 'Represented-brand allocations' },
  },
  {
    source: 'catalogo',
    title: { es: 'Catálogo', en: 'Catalog' },
    blurb: {
      es: 'Un producto que ya está en nuestras listas.',
      en: 'A product already on our listings.',
    },
    examples: { es: 'Maquinaria · insumos · productos publicados', en: 'Machinery · inputs · published products' },
  },
  {
    source: 'prueba',
    title: { es: 'Prueba', en: 'Trial' },
    blurb: {
      es: 'Un producto sin listar — mide interés antes de publicarlo.',
      en: 'An unlisted product — gauge interest before publishing it.',
    },
    examples: { es: 'Sondeo con leads · muestra a tu lista de WhatsApp', en: 'Probe with leads · sample to your WhatsApp list' },
  },
]

export function MarketingStudio({
  containerRows,
  initialContainerId,
  recipients,
  repWhatsappE164 = null,
  repWhatsappLabel = null,
  locale = DEFAULT_LOCALE,
}: {
  containerRows: PromotableContainerRow[]
  initialContainerId?: string
  recipients: ShareRecipient[]
  repWhatsappE164?: string | null
  repWhatsappLabel?: string | null
  locale?: Locale
}) {
  // Deep-linked to a container? Start on that source. Otherwise the catalog.
  const [source, setSource] = useState<Source>(initialContainerId ? 'contenedor' : 'catalogo')

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="pb-1 font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
          {t({ es: '¿Qué vas a promocionar?', en: 'What are you promoting?' }, locale)}
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SOURCES.map((s) => {
            const on = source === s.source
            return (
              <button
                key={s.source}
                type="button"
                aria-pressed={on}
                onClick={() => setSource(s.source)}
                className={cn(
                  'flex flex-col gap-1.5 rounded-card border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent',
                  on ? 'border-lane-accent bg-surface-2' : 'border-line bg-surface-1 hover:border-lane-accent',
                )}
              >
                <span className={cn('font-display text-t1', on ? 'text-ink-primary' : 'text-ink-secondary')}>
                  {t(s.title, locale)}
                </span>
                <span className="font-ui text-t0 text-ink-secondary">{t(s.blurb, locale)}</span>
                <span className="mt-1 font-mono text-label uppercase tracking-[0.06em] text-ink-tertiary">{t(s.examples, locale)}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {source === 'contenedor' ? (
        <PromoWorkbench
          initialRows={containerRows}
          initialSelectedId={initialContainerId}
          recipients={recipients}
          repWhatsappE164={repWhatsappE164}
          repWhatsappLabel={repWhatsappLabel}
        />
      ) : source === 'catalogo' ? (
        <CatalogPromoWorkbench
          recipients={recipients}
          repWhatsappE164={repWhatsappE164}
          repWhatsappLabel={repWhatsappLabel}
          locale={locale}
        />
      ) : (
        <TrialPromoComposer
          recipients={recipients}
          repWhatsappE164={repWhatsappE164}
          repWhatsappLabel={repWhatsappLabel}
          locale={locale}
        />
      )}
    </div>
  )
}
