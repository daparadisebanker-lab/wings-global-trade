'use client'

// Catálogo — promote a product that's already on our listings. The rep browses
// published products (RLS-scoped), picks one, optionally adds a price note (there
// is no price on a product), and the studio derives a spec-forward promo from the
// listing data. Same compose→share pipeline as every other source.
import { useEffect, useMemo, useState, useTransition } from 'react'
import { listBrowseProducts, listBrowseCategories, type ProductRow } from '@/lib/actions/catalog'
import { productRowToPromo } from '@/lib/marcas/product-promo-map'
import { ProductComposePanel } from './ProductComposePanel'
import type { ShareRecipient } from '@/lib/actions/share-recipients-logic'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT =
  'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent'

export function CatalogPromoWorkbench({
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
  const [categories, setCategories] = useState<string[]>([])
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<ProductRow[]>([])
  const [selected, setSelected] = useState<ProductRow | null>(null)
  const [priceNote, setPriceNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, startLoad] = useTransition()

  useEffect(() => {
    void listBrowseCategories().then((res) => {
      if (res.data) setCategories(res.data)
    })
  }, [])

  // (Re)load the product list on filter change (server-side, RLS + PUBLISHED).
  useEffect(() => {
    startLoad(async () => {
      const res = await listBrowseProducts({
        category: category || undefined,
        search: search.trim() || undefined,
        limit: 40,
      })
      if (res.error) {
        setError(res.error.message)
        setRows([])
        return
      }
      setError(null)
      setRows(res.data.rows)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search])

  const promo = useMemo(
    () => (selected ? productRowToPromo(selected, locale, { priceNote }) : null),
    [selected, locale, priceNote],
  )
  const productName = (r: ProductRow) => (r.name?.[locale] || r.name?.es || r.name?.en || r.slug).trim()

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,360px)_1fr]">
      {/* Picker */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className={LABEL}>{t({ es: 'Categoría', en: 'Category' }, locale)}</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT}>
              <option value="">{t({ es: 'Todas', en: 'All' }, locale)}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t({ es: 'Buscar producto…', en: 'Search product…' }, locale)}
            aria-label={t({ es: 'Buscar producto', en: 'Search product' }, locale)}
            className={INPUT}
          />
        </div>

        <ul className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto rounded-card border border-line" aria-label={t({ es: 'Productos', en: 'Products' }, locale)}>
          {rows.map((r) => {
            const on = selected?.id === r.id
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelected(r)}
                  aria-current={on ? 'true' : undefined}
                  className={`flex w-full flex-col items-start gap-0.5 border-b border-line px-3 py-2 text-left last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent ${
                    on ? 'bg-surface-2 text-ink-primary' : 'text-ink-secondary hover:bg-surface-1'
                  }`}
                >
                  <span className="font-ui text-t0">{productName(r)}</span>
                  <span className="font-mono text-label text-ink-secondary">
                    {r.categoryPath?.[0] ?? '—'}
                    {r.moq != null ? ` · MOQ ${r.moq}` : ''}
                  </span>
                </button>
              </li>
            )
          })}
          {isLoading ? (
            <li className="px-3 py-3 font-mono text-label text-ink-secondary">{t({ es: 'Cargando…', en: 'Loading…' }, locale)}</li>
          ) : rows.length === 0 ? (
            <li className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
              {error ?? t({ es: 'Sin productos publicados.', en: 'No published products.' }, locale)}
            </li>
          ) : null}
        </ul>
      </div>

      {/* Compose */}
      <div className="flex flex-col gap-4">
        {promo && selected ? (
          <>
            <label className="flex max-w-md flex-col gap-1">
              <span className={LABEL}>{t({ es: 'Nota de precio (opcional)', en: 'Price note (optional)' }, locale)}</span>
              <input
                value={priceNote}
                onChange={(e) => setPriceNote(e.target.value)}
                placeholder={t({ es: 'precio de campaña', en: 'campaign price' }, locale)}
                className={INPUT}
              />
            </label>
            <ProductComposePanel
              promo={promo}
              baseName={`producto-${selected.slug}`}
              recipients={recipients}
              repWhatsappE164={repWhatsappE164}
              repWhatsappLabel={repWhatsappLabel}
              locale={locale}
            />
          </>
        ) : (
          <div className="flex h-full min-h-[40vh] items-center justify-center rounded-card border border-line">
            <p className="font-ui text-t0 text-ink-secondary">
              {t({ es: 'Selecciona un producto para promocionar.', en: 'Select a product to promote.' }, locale)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
