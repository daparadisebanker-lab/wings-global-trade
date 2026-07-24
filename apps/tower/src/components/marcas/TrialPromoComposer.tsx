'use client'

// Prueba — a market probe (sondeo). The rep composes a product that is NOT on our
// listings: name, category, a few specs, an optional price note + MOQ, and an
// optional image dropped in from their device. It produces a Wings-branded card
// stamped as a MUESTRA (never a live listing) and shares it to a few leads to test
// demand. Fully EPHEMERAL — the image is held as a data-URL in the browser and
// nothing is persisted (a saved rep library is a queued follow-up). Same
// compose→share pipeline as every other source.
import { useMemo, useRef, useState } from 'react'
import type { ProductPromo, ProductPromoSpec } from '@wings/rb-core'
import { ProductComposePanel } from './ProductComposePanel'
import type { ShareRecipient } from '@/lib/actions/share-recipients-logic'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT =
  'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent'

// Cap the in-browser image so the data-URL (and the rasterized card) stay sane.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024

export function TrialPromoComposer({
  recipients,
  repWhatsappE164 = null,
  repWhatsappLabel = null,
  locale = DEFAULT_LOCALE,
}: {
  recipients: ShareRecipient[]
  repWhatsappE164?: string | null
  repWhatsappLabel?: string | null
  locale?: Locale
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [priceNote, setPriceNote] = useState('')
  const [moq, setMoq] = useState('')
  const [specs, setSpecs] = useState<ProductPromoSpec[]>([{ label: '', value: '' }])
  const [imageHref, setImageHref] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function onFile(file: File | null) {
    setImageError(null)
    if (!file) return
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setImageError(t({ es: 'Formato no soportado (PNG, JPG o WEBP).', en: 'Unsupported format (PNG, JPG or WEBP).' }, locale))
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(t({ es: 'La imagen supera 4 MB.', en: 'The image exceeds 4 MB.' }, locale))
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImageHref(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => setImageError(t({ es: 'No se pudo leer la imagen.', en: 'Could not read the image.' }, locale))
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageHref(null)
    setImageError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const ready = name.trim().length > 0
  const promo: ProductPromo | null = useMemo(() => {
    if (!ready) return null
    return {
      productName: name.trim(),
      category: category.trim() || undefined,
      specs: specs.map((s) => ({ label: s.label.trim(), value: s.value.trim() })).filter((s) => s.label && s.value),
      priceNote: priceNote.trim() || undefined,
      moq: moq.trim() || undefined,
      imageHref: imageHref ?? undefined,
      trial: true,
    }
  }, [ready, name, category, specs, priceNote, moq, imageHref])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Composer form */}
      <div className="flex flex-col gap-3">
        <p className="rounded-card border border-line bg-surface-1 p-3 font-ui text-t0 text-ink-secondary">
          {t(
            {
              es: 'Sondeo de mercado: comparte un producto que aún no está en el catálogo para medir interés. La tarjeta se marca como muestra; no se publica ni se guarda.',
              en: 'Market probe: share a product not yet on the catalog to gauge interest. The card is stamped as a sample; nothing is published or saved.',
            },
            locale,
          )}
        </p>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>{t({ es: 'Producto', en: 'Product' }, locale)}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t({ es: 'nombre del producto', en: 'product name' }, locale)} className={INPUT} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className={LABEL}>{t({ es: 'Categoría', en: 'Category' }, locale)}</span>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={LABEL}>{t({ es: 'Pedido mínimo', en: 'MOQ' }, locale)}</span>
            <input value={moq} onChange={(e) => setMoq(e.target.value)} placeholder="100" className={INPUT} />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>{t({ es: 'Nota de precio (opcional)', en: 'Price note (optional)' }, locale)}</span>
          <input value={priceNote} onChange={(e) => setPriceNote(e.target.value)} placeholder={t({ es: 'precio de sondeo', en: 'probe price' }, locale)} className={INPUT} />
        </label>

        {/* Specs editor */}
        <div className="flex flex-col gap-2">
          <span className={LABEL}>{t({ es: 'Especificaciones', en: 'Specs' }, locale)}</span>
          {specs.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={s.label}
                onChange={(e) => setSpecs((rows) => rows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))}
                placeholder={t({ es: 'etiqueta', en: 'label' }, locale)}
                className={`w-40 ${INPUT}`}
              />
              <input
                value={s.value}
                onChange={(e) => setSpecs((rows) => rows.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))}
                placeholder={t({ es: 'valor', en: 'value' }, locale)}
                className={`flex-1 ${INPUT}`}
              />
              <button
                type="button"
                onClick={() => setSpecs((rows) => (rows.length > 1 ? rows.filter((_, j) => j !== i) : rows))}
                aria-label={t({ es: 'Quitar especificación', en: 'Remove spec' }, locale)}
                className="rounded-card border border-line px-2 py-1.5 font-mono text-label text-ink-secondary hover:border-negative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
              >
                ✕
              </button>
            </div>
          ))}
          {specs.length < 6 ? (
            <button
              type="button"
              onClick={() => setSpecs((rows) => [...rows, { label: '', value: '' }])}
              className="w-fit rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
            >
              {t({ es: '+ Agregar', en: '+ Add' }, locale)}
            </button>
          ) : null}
        </div>

        {/* Image (client-side, ephemeral) */}
        <div className="flex flex-col gap-2">
          <span className={LABEL}>{t({ es: 'Imagen (opcional)', en: 'Image (optional)' }, locale)}</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="font-mono text-label text-ink-secondary file:mr-3 file:rounded-card file:border file:border-line file:bg-surface-1 file:px-3 file:py-1.5 file:font-mono file:text-label file:uppercase file:tracking-[0.08em] file:text-ink-primary hover:file:border-lane-accent"
          />
          {imageError ? (
            <span role="alert" className="font-ui text-t0 text-negative">
              {imageError}
            </span>
          ) : null}
          {imageHref ? (
            <button
              type="button"
              onClick={clearImage}
              className="w-fit font-mono text-label uppercase tracking-[0.08em] text-lane-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
            >
              {t({ es: 'Quitar imagen', en: 'Remove image' }, locale)}
            </button>
          ) : null}
        </div>
      </div>

      {/* Compose */}
      <div className="flex flex-col gap-4">
        {promo ? (
          <ProductComposePanel
            promo={promo}
            baseName="muestra"
            recipients={recipients}
            repWhatsappE164={repWhatsappE164}
            repWhatsappLabel={repWhatsappLabel}
            locale={locale}
          />
        ) : (
          <div className="flex h-full min-h-[40vh] items-center justify-center rounded-card border border-line">
            <p className="font-ui text-t0 text-ink-secondary">
              {t({ es: 'Escribe el nombre del producto para ver la tarjeta.', en: 'Enter the product name to see the card.' }, locale)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
