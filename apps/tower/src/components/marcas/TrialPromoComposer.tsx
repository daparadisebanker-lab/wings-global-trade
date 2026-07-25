'use client'

// Prueba — a market probe (sondeo). The rep composes a product that is NOT on our
// listings: name, category, a few specs, an optional price note + MOQ, and an
// optional image dropped in from their device. It produces a Wings-branded card
// stamped as a MUESTRA (never a live listing) and shares it to a few leads to test
// demand — nothing is ever published to the site. When the library (tower_56) is
// live the rep may SAVE a trial to their own private library (image persisted to a
// private bucket) and reuse it; when it isn't, the compose stays purely ephemeral
// (image only a browser data-URL). Same compose→share pipeline as every source.
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { cn } from '@wings/trade-ui'
import type { ProductPromo, ProductPromoSpec } from '@wings/rb-core'
import { ProductComposePanel } from './ProductComposePanel'
import type { ShareRecipient } from '@/lib/actions/share-recipients-logic'
import {
  listMyTrialProducts,
  saveTrialProduct,
  deleteTrialProduct,
  createTrialImageUploadUrl,
  getTrialImageUrl,
} from '@/lib/actions/trial-products'
import type { TrialProduct, TrialImageExt } from '@/lib/actions/trial-products-logic'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

const MIME_EXT: Record<string, TrialImageExt> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }

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
  const [imageExt, setImageExt] = useState<TrialImageExt | null>(null)
  const [imagePath, setImagePath] = useState<string | null>(null) // set once persisted
  const fileRef = useRef<HTMLInputElement>(null)
  // Only the latest read may commit, so two quick selections can't land out of order.
  const imageReqRef = useRef(0)

  // ── Library (tower_56) — dormant-safe: unavailable until the table exists ──
  const [libraryAvailable, setLibraryAvailable] = useState(false)
  const [library, setLibrary] = useState<TrialProduct[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)
  const [isSaving, startSave] = useTransition()

  useEffect(() => {
    listMyTrialProducts()
      .then((res) => {
        if (res.error) return // dormant (or transient) — hide the library
        setLibraryAvailable(true)
        setLibrary(res.data)
      })
      .catch(() => {
        /* transport failure — leave the library hidden, Prueba stays ephemeral */
      })
  }, [])

  function resetFileInput() {
    if (fileRef.current) fileRef.current.value = ''
  }

  function onFile(file: File | null) {
    setImageError(null)
    const myId = ++imageReqRef.current
    if (!file) return
    // Derive the ext from the SAME map the upload uses, so the accept set and the
    // persistable set can never disagree (else an image previews but silently
    // isn't saved). On rejection, clear the input so the rejected filename isn't
    // left beside the error (the previously-accepted image, if any, stays).
    const ext = MIME_EXT[file.type.toLowerCase()]
    if (!ext) {
      setImageError(t({ es: 'Formato no soportado (PNG, JPG o WEBP).', en: 'Unsupported format (PNG, JPG or WEBP).' }, locale))
      resetFileInput()
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(t({ es: 'La imagen supera 4 MB.', en: 'The image exceeds 4 MB.' }, locale))
      resetFileInput()
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (myId !== imageReqRef.current) return
      setImageHref(typeof reader.result === 'string' ? reader.result : null)
      setImageExt(ext)
      setImagePath(null) // a fresh upload isn't persisted yet
    }
    reader.onerror = () => {
      if (myId !== imageReqRef.current) return
      setImageError(t({ es: 'No se pudo leer la imagen.', en: 'Could not read the image.' }, locale))
      resetFileInput()
    }
    reader.readAsDataURL(file)
  }

  function clearImage() {
    imageReqRef.current++ // cancel any in-flight read
    setImageHref(null)
    setImageError(null)
    setImageExt(null)
    setImagePath(null)
    resetFileInput()
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

  function newTrial() {
    setName('')
    setCategory('')
    setPriceNote('')
    setMoq('')
    setSpecs([{ label: '', value: '' }])
    setEditingId(null)
    clearImage()
    setSaveState(null)
  }

  function saveToLibrary() {
    const name0 = name.trim()
    if (!name0) return
    setSaveState(null)
    startSave(async () => {
     try {
      let path = imagePath
      // Upload a fresh image (a data-URL not yet persisted) to the private bucket.
      if (imageHref && !imagePath && imageExt) {
        const ticket = await createTrialImageUploadUrl(imageExt)
        if (ticket.error) {
          setSaveState({ tone: 'err', text: ticket.error.message })
          return
        }
        try {
          const blob = await (await fetch(imageHref)).blob()
          const put = await fetch(ticket.data.signedUrl, { method: 'PUT', headers: { 'content-type': blob.type }, body: blob })
          if (!put.ok) throw new Error('upload')
          path = ticket.data.path
          setImagePath(path)
        } catch {
          setSaveState({ tone: 'err', text: t({ es: 'No se pudo subir la imagen', en: 'Could not upload the image' }, locale) })
          return
        }
      }
      const cleanedSpecs = specs.map((s) => ({ label: s.label.trim(), value: s.value.trim() })).filter((s) => s.label && s.value)
      const res = await saveTrialProduct({
        id: editingId ?? undefined,
        name: name0,
        category: category.trim() || null,
        specs: cleanedSpecs,
        priceNote: priceNote.trim() || null,
        moq: moq.trim() || null,
        imagePath: path,
      })
      if (res.error) {
        setSaveState({ tone: 'err', text: res.error.message })
        return
      }
      setEditingId(res.data.id)
      setLibrary((prev) => [res.data, ...prev.filter((x) => x.id !== res.data.id)])
      setSaveState({ tone: 'ok', text: t({ es: 'Guardado en tu biblioteca', en: 'Saved to your library' }, locale) })
     } catch {
       setSaveState({ tone: 'err', text: t({ es: 'Error inesperado al guardar.', en: 'Unexpected error while saving.' }, locale) })
     }
    })
  }

  async function loadTrial(tp: TrialProduct) {
    setName(tp.name)
    setCategory(tp.category ?? '')
    setMoq(tp.moq ?? '')
    setPriceNote(tp.priceNote ?? '')
    setSpecs(tp.specs.length ? tp.specs.map((s) => ({ ...s })) : [{ label: '', value: '' }])
    setEditingId(tp.id)
    setImageError(null)
    setSaveState(null)
    setImageExt(null)
    setImagePath(tp.imagePath)
    resetFileInput()
    const myId = ++imageReqRef.current
    if (!tp.imagePath) {
      setImageHref(null)
      return
    }
    const failImage = () => {
      if (myId !== imageReqRef.current) return
      setImageHref(null)
      setImageError(t({ es: 'No se pudo cargar la imagen guardada.', en: 'Could not load the saved image.' }, locale))
    }
    try {
      const res = await getTrialImageUrl(tp.imagePath)
      if (myId !== imageReqRef.current) return // superseded by another load
      if (res.error) return failImage()
      const blob = await (await fetch(res.data)).blob()
      if (myId !== imageReqRef.current) return
      const reader = new FileReader()
      reader.onload = () => {
        if (myId !== imageReqRef.current) return
        setImageHref(typeof reader.result === 'string' ? reader.result : null)
      }
      reader.onerror = failImage
      reader.readAsDataURL(blob)
    } catch {
      failImage()
    }
  }

  function deleteTrial(id: string) {
    startSave(async () => {
      try {
        const res = await deleteTrialProduct(id)
        if (res.error) {
          setSaveState({ tone: 'err', text: res.error.message })
          return
        }
        setLibrary((prev) => prev.filter((x) => x.id !== id))
        if (editingId === id) newTrial()
      } catch {
        setSaveState({ tone: 'err', text: t({ es: 'No se pudo eliminar.', en: 'Could not delete.' }, locale) })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Composer form */}
      <div className="flex flex-col gap-3">
        <p className="rounded-card border border-line bg-surface-1 p-3 font-ui text-t0 text-ink-secondary">
          {libraryAvailable
            ? t(
                {
                  es: 'Sondeo de mercado: comparte un producto que aún no está en el catálogo para medir interés. La tarjeta se marca como muestra y nunca se publica en el sitio; puedes guardarla en tu biblioteca privada abajo.',
                  en: 'Market probe: share a product not yet on the catalog to gauge interest. The card is stamped as a sample and never published to the site; you can save it to your private library below.',
                },
                locale,
              )
            : t(
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
          <label className="flex flex-col gap-2">
            <span className={LABEL}>{t({ es: 'Imagen (opcional)', en: 'Image (optional)' }, locale)}</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              className="font-mono text-label text-ink-secondary file:mr-3 file:rounded-card file:border file:border-line file:bg-surface-1 file:px-3 file:py-1.5 file:font-mono file:text-label file:uppercase file:tracking-[0.08em] file:text-ink-primary hover:file:border-lane-accent"
            />
          </label>
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

      {/* My trial library (tower_56) — save the current probe, reuse it later.
          Only shown when the backend is live; Prueba is fully ephemeral without it. */}
      {libraryAvailable ? (
        <section className="flex flex-col gap-3 rounded-card border border-line bg-surface-1 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={LABEL}>{t({ es: 'Mi biblioteca de pruebas', en: 'My trial library' }, locale)}</span>
            <button
              type="button"
              onClick={saveToLibrary}
              disabled={isSaving || !ready}
              className="rounded-card bg-accent px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-surface-0 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
            >
              {editingId ? t({ es: 'Actualizar', en: 'Update' }, locale) : t({ es: 'Guardar en biblioteca', en: 'Save to library' }, locale)}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={newTrial}
                className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
              >
                {t({ es: 'Nuevo', en: 'New' }, locale)}
              </button>
            ) : null}
            {saveState ? (
              <span role="status" className={cn('font-ui text-t0', saveState.tone === 'ok' ? 'text-positive' : 'text-negative')}>
                {saveState.text}
              </span>
            ) : null}
          </div>
          {library.length ? (
            <ul className="flex flex-col divide-y divide-line rounded-card border border-line">
              {library.map((tp) => (
                <li key={tp.id} className={cn('flex flex-wrap items-center justify-between gap-2 px-3 py-2', editingId === tp.id && 'bg-surface-2')}>
                  <button
                    type="button"
                    onClick={() => void loadTrial(tp)}
                    className="min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
                  >
                    <span className="font-ui text-t0 text-ink-primary">{tp.name}</span>
                    <span className="ml-2 font-mono text-label text-ink-secondary">
                      {tp.category ?? '—'}
                      {tp.imagePath ? ` · ${t({ es: 'imagen', en: 'image' }, locale)}` : ''}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTrial(tp.id)}
                    disabled={isSaving}
                    aria-label={`${t({ es: 'Eliminar', en: 'Delete' }, locale)} ${tp.name}`}
                    className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-negative disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
                  >
                    {t({ es: 'Eliminar', en: 'Delete' }, locale)}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-ui text-t0 text-ink-secondary">
              {t({ es: 'Aún no has guardado pruebas.', en: 'You haven’t saved any trials yet.' }, locale)}
            </p>
          )}
        </section>
      ) : null}
    </div>
  )
}
