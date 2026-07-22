'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { t, type Locale } from '@/lib/i18n'
import { createClient, listClientBrands, type ClientBrandOption } from '@/lib/actions/clients'

/**
 * "+ Nuevo cliente" — the manual create path for the Clients window (the other
 * path is Mister's save-draft). A toggled inline form: brand + name (+ optional
 * country/region) → createClient → refresh. RLS gates the write; a rejection
 * shows an inline message.
 */
export function NewClient({ locale }: { locale: Locale }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [brands, setBrands] = useState<ClientBrandOption[]>([])
  const [brandId, setBrandId] = useState('')
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, startSave] = useTransition()

  useEffect(() => {
    if (!open) return
    let live = true
    listClientBrands().then((res) => {
      if (!live || res.error) return
      setBrands(res.data)
      if (res.data.length === 1) setBrandId(res.data[0].id)
    })
    return () => {
      live = false
    }
  }, [open])

  function reset() {
    setName('')
    setCountry('')
    setRegion('')
    setError(null)
  }

  function onSave() {
    setError(null)
    startSave(async () => {
      const res = await createClient({
        brandId,
        name: name.trim(),
        country: country.trim() || null,
        region: region.trim() || null,
      })
      if (res.error) {
        setError(res.error.message)
        return
      }
      reset()
      setOpen(false)
      router.refresh()
    })
  }

  const field =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent placeholder:text-ink-secondary'

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
      >
        {t({ es: '+ Nuevo cliente', en: '+ New client' }, locale)}
      </button>
    )
  }

  const canSave = Boolean(brandId) && name.trim().length > 0 && !saving

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-card-lg border border-line bg-surface-1 p-4 shadow-elevation-2">
      <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
        {t({ es: 'Nuevo cliente', en: 'New client' }, locale)}
      </span>

      <select className={field} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
        <option value="">{t({ es: '— Marca —', en: '— Brand —' }, locale)}</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <input
        className={field}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t({ es: 'Nombre del cliente', en: 'Client name' }, locale)}
      />

      <div className="flex gap-3">
        <input
          className={`${field} flex-1`}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder={t({ es: 'País (opcional)', en: 'Country (optional)' }, locale)}
        />
        <input
          className={`${field} flex-1`}
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder={t({ es: 'Región (opcional)', en: 'Region (optional)' }, locale)}
        />
      </div>

      {error ? <p className="font-ui text-t0 text-negative">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-50"
        >
          {saving ? t({ es: 'Guardando…', en: 'Saving…' }, locale) : t({ es: 'Guardar', en: 'Save' }, locale)}
        </button>
        <button
          type="button"
          onClick={() => {
            reset()
            setOpen(false)
          }}
          className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
        >
          {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
        </button>
      </div>
    </div>
  )
}
