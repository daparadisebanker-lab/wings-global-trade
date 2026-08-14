'use client'

import { useState, useTransition } from 'react'
import { t, type Locale } from '@/lib/i18n'
import { createSupplier, createSupplierOffer } from '@/lib/actions/suppliers'
import {
  OFFER_SOURCE_OPTIONS,
  type SupplierOfferListItem,
  type SupplierOfferSource,
  type SupplierOption,
} from '@/lib/actions/suppliers-logic'
import type { ClientBrandOption } from '@/lib/actions/clients'

const CURRENCIES = ['USD', 'CNY', 'PEN', 'EUR']

/**
 * Capture a supplier FOB offer — pick or quick-create the supplier inline (a
 * rep reading a new WhatsApp chat rarely already has the supplier on file), then
 * the commercial fields Mister's screenshot-read already produces (product,
 * price, MOQ, incoterm, lead time, port, HS code).
 */
export function OfferForm({
  locale,
  brands,
  suppliers,
  onDone,
  onCancel,
}: {
  locale: Locale
  brands: ClientBrandOption[]
  suppliers: SupplierOption[]
  onDone: (offer: SupplierOfferListItem, newSupplier?: SupplierOption) => void
  onCancel: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [saving, startSave] = useTransition()

  const [supplierId, setSupplierId] = useState('')
  const [addingSupplier, setAddingSupplier] = useState(suppliers.length === 0)
  const [newSupplierBrandId, setNewSupplierBrandId] = useState(brands.length === 1 ? brands[0].id : '')
  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierCountry, setNewSupplierCountry] = useState('')
  const [newSupplierWhatsapp, setNewSupplierWhatsapp] = useState('')

  const [productLabel, setProductLabel] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [priceUnit, setPriceUnit] = useState('')
  const [moq, setMoq] = useState('')
  const [incoterm, setIncoterm] = useState('FOB')
  const [leadTimeDays, setLeadTimeDays] = useState('')
  const [port, setPort] = useState('')
  const [hsCode, setHsCode] = useState('')
  const [source, setSource] = useState<SupplierOfferSource>('manual')
  const [notes, setNotes] = useState('')

  const field =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent placeholder:text-ink-secondary'
  const lbl = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
  const legend = 'font-mono text-label uppercase tracking-[0.12em] text-lane-accent'
  const L = (o: { es: string; en: string }) => (locale === 'es' ? o.es : o.en)

  const canSave =
    productLabel.trim().length > 0 &&
    (addingSupplier ? newSupplierName.trim().length > 0 && Boolean(newSupplierBrandId) : Boolean(supplierId)) &&
    !saving

  function onSave() {
    setError(null)
    startSave(async () => {
      let resolvedSupplierId = supplierId
      let newSupplier: SupplierOption | undefined

      if (addingSupplier) {
        const res = await createSupplier({
          brandId: newSupplierBrandId,
          name: newSupplierName.trim(),
          country: newSupplierCountry.trim() || null,
          contactWhatsapp: newSupplierWhatsapp.trim() || null,
        })
        if (res.error) {
          setError(res.error.message)
          return
        }
        resolvedSupplierId = res.data.id
        newSupplier = res.data
      }

      const res = await createSupplierOffer({
        supplierId: resolvedSupplierId,
        productLabel: productLabel.trim(),
        unitPriceMinor: price.trim() ? Math.round(Number(price) * 100) : null,
        currency: price.trim() ? currency : null,
        priceUnit: priceUnit.trim() || null,
        moq: moq.trim() || null,
        incoterm: incoterm.trim() || null,
        leadTimeDays: leadTimeDays.trim() ? Number(leadTimeDays) : null,
        port: port.trim() || null,
        hsCode: hsCode.trim() || null,
        source,
        notes: notes.trim() || null,
      })
      if (res.error) {
        setError(res.error.message)
        return
      }
      onDone(res.data, newSupplier)
    })
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Supplier */}
      <div className="flex flex-col gap-2">
        <span className={legend}>{t({ es: 'Proveedor', en: 'Supplier' }, locale)}</span>
        {addingSupplier ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {brands.length > 1 ? (
              <label className="flex flex-col gap-1">
                <span className={lbl}>{t({ es: 'Marca', en: 'Brand' }, locale)}</span>
                <select className={field} value={newSupplierBrandId} onChange={(e) => setNewSupplierBrandId(e.target.value)}>
                  <option value="">{t({ es: '— Marca —', en: '— Brand —' }, locale)}</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="flex flex-col gap-1">
              <span className={lbl}>{t({ es: 'Nombre', en: 'Name' }, locale)}</span>
              <input className={field} value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={lbl}>{t({ es: 'País', en: 'Country' }, locale)}</span>
              <input className={field} value={newSupplierCountry} onChange={(e) => setNewSupplierCountry(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={lbl}>WhatsApp</span>
              <input className={field} value={newSupplierWhatsapp} onChange={(e) => setNewSupplierWhatsapp(e.target.value)} />
            </label>
            {suppliers.length > 0 ? (
              <button
                type="button"
                onClick={() => setAddingSupplier(false)}
                className="col-span-full text-left font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-lane-accent"
              >
                {t({ es: '← Elegir uno existente', en: '← Pick an existing one' }, locale)}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[220px] flex-1 flex-col gap-1">
              <span className={lbl}>{t({ es: 'Proveedor', en: 'Supplier' }, locale)}</span>
              <select className={field} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">{t({ es: '— Proveedor —', en: '— Supplier —' }, locale)}</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.country ? ` · ${s.country}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setAddingSupplier(true)}
              className="rounded-card border border-line px-3 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-primary hover:border-lane-accent"
            >
              {t({ es: '+ Nuevo proveedor', en: '+ New supplier' }, locale)}
            </button>
          </div>
        )}
      </div>

      {/* Offer */}
      <div className="flex flex-col gap-2">
        <span className={legend}>{t({ es: 'Oferta', en: 'Offer' }, locale)}</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className={lbl}>{t({ es: 'Producto', en: 'Product' }, locale)}</span>
            <input
              className={field}
              value={productLabel}
              onChange={(e) => setProductLabel(e.target.value)}
              placeholder={t({ es: 'p. ej. Scooter eléctrico 500W', en: 'e.g. Electric scooter 500W' }, locale)}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className={lbl}>{t({ es: 'Precio unitario', en: 'Unit price' }, locale)}</span>
              <input className={field} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={lbl}>{t({ es: 'Moneda', en: 'Currency' }, locale)}</span>
              <select className={field} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className={lbl}>{t({ es: 'Se cotiza por', en: 'Quoted per' }, locale)}</span>
            <input
              className={field}
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value)}
              placeholder={t({ es: 'por unidad, por set…', en: 'per unit, per set…' }, locale)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={lbl}>MOQ</span>
            <input
              className={field}
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              placeholder="100 unidades"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={lbl}>Incoterm</span>
            <input className={field} value={incoterm} onChange={(e) => setIncoterm(e.target.value.toUpperCase())} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={lbl}>{t({ es: 'Plazo (días)', en: 'Lead time (days)' }, locale)}</span>
            <input
              className={field}
              inputMode="numeric"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={lbl}>{t({ es: 'Puerto', en: 'Port' }, locale)}</span>
            <input className={field} value={port} onChange={(e) => setPort(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={lbl}>HS Code</span>
            <input className={field} value={hsCode} onChange={(e) => setHsCode(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={lbl}>{t({ es: 'Origen de la captura', en: 'Capture source' }, locale)}</span>
            <select className={field} value={source} onChange={(e) => setSource(e.target.value as SupplierOfferSource)}>
              {OFFER_SOURCE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {L(o)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className={lbl}>{t({ es: 'Notas', en: 'Notes' }, locale)}</span>
            <textarea className={`${field} min-h-[56px] resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
      </div>

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
        >
          {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={onSave}
          className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
        >
          {saving ? t({ es: 'Guardando…', en: 'Saving…' }, locale) : t({ es: 'Guardar oferta', en: 'Save offer' }, locale)}
        </button>
      </div>
    </div>
  )
}
