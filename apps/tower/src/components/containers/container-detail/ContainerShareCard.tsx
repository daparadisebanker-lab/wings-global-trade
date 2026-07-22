'use client'

// Lightweight Wings status/share card for an ERP container (shell IA/UI Phase D).
// Reuses the rb-core promo generator via a CBM-based adapter — a shareable 1080²
// card image + client-copy text — with NO server call and NO represented-brand
// tables. This is the general-container "share status with a client" artifact;
// the rich brand marketing promo (slots/price/product) stays on the marcas
// surfaces. Collapsed by default so it never weighs down the detail.
import { useMemo, useState } from 'react'
import { buildPromoCardSvg, buildPromoCopy } from '@wings/rb-core'
import { containerRowToPromo } from '@/lib/promo/erp-container-promo'
import { rasterizePromoCard } from '@/lib/promo/raster'
import type { ContainerRow } from '@/lib/actions/containers-types'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

const ACTION_BTN =
  'rounded-control border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent'

export function ContainerShareCard({ container, locale = DEFAULT_LOCALE }: { container: ContainerRow; locale?: Locale }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const promo = useMemo(() => containerRowToPromo(container), [container])
  // buildPromoCardSvg returns a trusted pure SVG string (rb-core, no user input).
  const svg = useMemo(() => buildPromoCardSvg(promo), [promo])

  async function copy() {
    try {
      await navigator.clipboard.writeText(buildPromoCopy(promo, 'clients'))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <section aria-label={t({ es: 'Compartir contenedor', en: 'Share container' }, locale)} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-label uppercase tracking-[0.14em] text-ink-secondary">
          {t({ es: 'Compartir / Share', en: 'Share' }, locale)}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center rounded-control border border-line bg-surface-1 px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-primary transition-colors hover:border-lane-accent hover:text-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
        >
          {open ? t({ es: 'Ocultar tarjeta', en: 'Hide card' }, locale) : t({ es: 'Tarjeta de contenedor', en: 'Container card' }, locale)}
        </button>
      </div>

      {open ? (
        <div className="flex flex-col gap-4 rounded-panel border border-line bg-surface-1 p-4 sm:flex-row">
          <div
            aria-label={t({ es: 'Vista previa de la tarjeta', en: 'Card preview' }, locale)}
            className="w-full max-w-[320px] shrink-0 overflow-hidden rounded-card border border-line [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <div className="flex flex-1 flex-col gap-3">
            <p className="font-ui text-t0 text-ink-secondary">
              {t(
                {
                  es: 'Tarjeta Wings de estado del contenedor (CBM · ruta · fase), para compartir con un cliente. La promo comercial de marca vive en Marcas.',
                  en: 'Wings container status card (CBM · route · phase) to share with a client. The brand marketing promo lives under Marcas.',
                },
                locale,
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => rasterizePromoCard(svg, `contenedor-${container.code}`, 'png')} className={ACTION_BTN}>
                PNG
              </button>
              <button type="button" onClick={() => rasterizePromoCard(svg, `contenedor-${container.code}`, 'jpeg')} className={ACTION_BTN}>
                JPG
              </button>
              <button type="button" onClick={copy} className={ACTION_BTN}>
                {copied ? t({ es: 'Copiado', en: 'Copied' }, locale) : t({ es: 'Copiar texto', en: 'Copy text' }, locale)}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
