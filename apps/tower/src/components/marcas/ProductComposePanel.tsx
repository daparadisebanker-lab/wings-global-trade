'use client'

// ProductComposePanel — the shared OUTPUT surface for a product-based promo
// (Catálogo + Prueba). Given a normalized ProductPromo it renders the live copy
// (whatsapp / ad, one-tap copy), the spec-forward share card (inline preview +
// PNG/JPG download), and the WS5 share bar (pick a client, share via WhatsApp —
// no Meta API). The subject is composed upstream by the workbench; this panel is
// purely the compose→share step, so both sources share one voice + one pipeline.
import { useMemo, useState } from 'react'
import { buildProductPromoCopy, buildProductPromoCardSvg, type ProductPromo, type PromoVariant } from '@wings/rb-core'
import { PromoShareBar } from './PromoShareBar'
import { downloadCardRaster } from './promo-raster'
import type { ShareRecipient } from '@/lib/actions/share-recipients-logic'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'

export function ProductComposePanel({
  promo,
  baseName,
  recipients,
  repWhatsappE164 = null,
  repWhatsappLabel = null,
  locale = DEFAULT_LOCALE,
}: {
  promo: ProductPromo
  /** File-name stem for the downloaded card. */
  baseName: string
  recipients: ShareRecipient[]
  repWhatsappE164?: string | null
  repWhatsappLabel?: string | null
  locale?: Locale
}) {
  const [variant, setVariant] = useState<Extract<PromoVariant, 'whatsapp' | 'ad'>>('whatsapp')
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [dlError, setDlError] = useState(false)

  const copyText = useMemo(() => buildProductPromoCopy(promo, variant), [promo, variant])
  const svg = useMemo(() => buildProductPromoCardSvg(promo), [promo])

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopyState('ok')
    } catch {
      // Clipboard blocked — surface it (the copy text is on screen to copy by hand).
      setCopyState('fail')
    }
    setTimeout(() => setCopyState('idle'), 1800)
  }

  function download(kind: 'png' | 'jpeg') {
    setDlError(false)
    downloadCardRaster(svg, baseName, kind, () => setDlError(true))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Copy preview */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className={LABEL}>{t({ es: 'Copia', en: 'Copy' }, locale)}</span>
          <div className="flex overflow-hidden rounded-card border border-line">
            {(['whatsapp', 'ad'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                aria-pressed={variant === v}
                className={`px-2 py-1 font-mono text-label uppercase tracking-[0.08em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent ${
                  variant === v ? 'bg-accent text-surface-0' : 'text-ink-secondary'
                }`}
              >
                {v === 'whatsapp' ? 'WhatsApp' : t({ es: 'Anuncio', en: 'Ad' }, locale)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={copyToClipboard}
            className="rounded-card border border-line px-2 py-1 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
          >
            {t({ es: 'Copiar', en: 'Copy' }, locale)}
          </button>
          <span role="status" aria-live="polite" className="font-mono text-label text-ink-secondary">
            {copyState === 'ok'
              ? t({ es: 'Copiado ✓', en: 'Copied ✓' }, locale)
              : copyState === 'fail'
                ? t({ es: 'No se pudo copiar', en: 'Copy failed' }, locale)
                : ''}
          </span>
        </div>
        <pre className="whitespace-pre-wrap rounded-card border border-line bg-surface-0 p-3 font-ui text-t0 text-ink-primary">
          {copyText}
        </pre>
      </div>

      {/* Share the script → a client / WhatsApp (WS5). */}
      <PromoShareBar
        recipients={recipients}
        repWhatsappE164={repWhatsappE164}
        repWhatsappLabel={repWhatsappLabel}
        buildText={(audience) => buildProductPromoCopy(promo, audience)}
        locale={locale}
      />

      {/* Card preview + downloads */}
      <div className="flex flex-col gap-2">
        <span className={LABEL}>{t({ es: 'Tarjeta para compartir (1080×1080)', en: 'Share card (1080×1080)' }, locale)}</span>
        <div
          className="overflow-hidden rounded-card border border-line [&>svg]:h-auto [&>svg]:w-full"
          // buildProductPromoCardSvg is our own pure, escaped SVG string — no user HTML.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => download('png')}
            className="rounded-card bg-accent px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-surface-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
          >
            {t({ es: 'Descargar PNG', en: 'Download PNG' }, locale)}
          </button>
          <button
            type="button"
            onClick={() => download('jpeg')}
            className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
          >
            {t({ es: 'Descargar JPG', en: 'Download JPG' }, locale)}
          </button>
          {dlError ? (
            <span role="alert" className="font-mono text-label text-negative">
              {t({ es: 'No se pudo generar la imagen', en: 'Could not generate the image' }, locale)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
