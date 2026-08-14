'use client'

import { useMemo, useState, useTransition } from 'react'
import { t, type Locale } from '@/lib/i18n'
import { listSupplierOffers } from '@/lib/actions/suppliers'
import type { ClientBrandOption } from '@/lib/actions/clients'
import type { SupplierOfferListItem, SupplierOption } from '@/lib/actions/suppliers-logic'
import { OfferForm } from './OfferForm'
import { OfferList } from './OfferList'

const TAG = 'SUP · Proveedores'
const TITLE = { es: 'Proveedores', en: 'Suppliers' }

/**
 * The Supplier FOB Price Book — every offer captured from a supplier
 * (WhatsApp/Alibaba/email read by Mister, or typed in), searchable by product
 * regardless of category, so "what FOB have we gotten for X" is one lookup
 * instead of scrolling old chats.
 */
export function SuppliersView({
  initialItems,
  suppliers,
  brands,
  locale,
}: {
  initialItems: SupplierOfferListItem[]
  suppliers: SupplierOption[]
  brands: ClientBrandOption[]
  locale: Locale
}) {
  const [items, setItems] = useState<SupplierOfferListItem[]>(initialItems)
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>(suppliers)
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searching, startSearch] = useTransition()

  const filtered = useMemo(() => {
    if (!supplierFilter) return items
    return items.filter((o) => o.supplierId === supplierFilter)
  }, [items, supplierFilter])

  function runSearch(term: string) {
    setSearch(term)
    setError(null)
    startSearch(async () => {
      const res = await listSupplierOffers({ search: term || undefined })
      if (res.error) {
        setError(res.error.message)
        return
      }
      setItems(res.data)
    })
  }

  function onOfferSaved(offer: SupplierOfferListItem, newSupplier?: SupplierOption) {
    setItems((xs) => [offer, ...xs])
    if (newSupplier) setSupplierOptions((xs) => [...xs, newSupplier].sort((a, b) => a.name.localeCompare(b.name)))
    setCreating(false)
  }

  const field =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent placeholder:text-ink-secondary'

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          {TAG}
        </span>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-t3 text-ink-primary">{t(TITLE, locale)}</h1>
          <span className="font-mono text-label text-ink-secondary" data-numeric>
            {filtered.length}
          </span>
        </div>
        <p className="max-w-prose text-t0 text-ink-secondary">
          {t(
            {
              es: 'El historial de precios FOB que han cotizado tus proveedores — por producto, sin importar la categoría. Captúralas aquí o desde una lectura de Mister.',
              en: 'The FOB price history your suppliers have quoted — by product, regardless of category. Capture them here or from a Mister read.',
            },
            locale,
          )}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            className={`${field} min-w-[220px] flex-1`}
            value={search}
            onChange={(e) => runSearch(e.target.value)}
            placeholder={t({ es: 'Buscar producto…', en: 'Search product…' }, locale)}
          />
          <select className={field} value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
            <option value="">{t({ es: 'Todos los proveedores', en: 'All suppliers' }, locale)}</option>
            {supplierOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="ml-auto rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
          >
            {t({ es: '+ Nueva oferta', en: '+ New offer' }, locale)}
          </button>
        </div>
      </header>

      {creating ? (
        <div className="rounded-card-lg border border-line bg-surface-1 p-4 shadow-elevation-2">
          <span className="mb-3 block font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
            {t({ es: 'Nueva oferta de proveedor', en: 'New supplier offer' }, locale)}
          </span>
          <OfferForm
            locale={locale}
            brands={brands}
            suppliers={supplierOptions}
            onDone={onOfferSaved}
            onCancel={() => setCreating(false)}
          />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      {searching ? (
        <p className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
          {t({ es: 'Buscando…', en: 'Searching…' }, locale)}
        </p>
      ) : filtered.length === 0 ? (
        <div className="rounded-card border border-line-hairline bg-surface-1 p-8 text-center text-t0 text-ink-secondary">
          {t(
            {
              es: 'Todavía no hay ofertas capturadas. Guarda la primera aquí o léela con Mister desde una captura de WhatsApp.',
              en: 'No offers captured yet. Save the first one here or read it with Mister from a WhatsApp screenshot.',
            },
            locale,
          )}
        </div>
      ) : (
        <OfferList items={filtered} locale={locale} />
      )}
    </div>
  )
}
