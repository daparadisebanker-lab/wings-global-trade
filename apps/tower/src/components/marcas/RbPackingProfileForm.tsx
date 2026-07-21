'use client'

// RB packing profile (RB Console Wave 2 tail). The write-side for
// tower.rb_packing_profiles — the row a product's ALLOCATION math + the public
// fiche join to by (brand, product_slug = slug). Auth/RLS live in the action;
// this only collects the numbers (exhibited in tabular mono) and upserts them.
import { useEffect, useState, useTransition } from 'react'
import {
  getRbPackingProfile,
  upsertRbPackingProfile,
  type RbPackingProfileInput,
  type RbPackingProfileRow,
} from '@/lib/actions/rb-catalog'

const LABEL = 'font-mono text-label uppercase tracking-[0.1em] text-ink-secondary'
const INPUT =
  'rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none placeholder:text-ink-secondary focus-visible:border-lane-accent disabled:opacity-50'

interface FormState {
  productName: string
  gtin: string
  packageKind: string
  packetsPerPackage: string
  unitsPerPackage: string
  unitNamePlural: string
  packageCbm: string
  packageKg: string
  stackable: boolean
  notes: string
}

const EMPTY: FormState = {
  productName: '',
  gtin: '',
  packageKind: 'box',
  packetsPerPackage: '1',
  unitsPerPackage: '',
  unitNamePlural: 'unidades',
  packageCbm: '',
  packageKg: '',
  stackable: true,
  notes: '',
}

function toFormState(row: RbPackingProfileRow | null, fallbackName: string): FormState {
  if (!row) return { ...EMPTY, productName: fallbackName }
  return {
    productName: row.productName,
    gtin: row.gtin ?? '',
    packageKind: row.packageKind,
    packetsPerPackage: String(row.packetsPerPackage),
    unitsPerPackage: String(row.unitsPerPackage),
    unitNamePlural: row.unitNamePlural,
    packageCbm: String(row.packageCbm),
    packageKg: String(row.packageKg),
    stackable: row.stackable,
    notes: row.notes ?? '',
  }
}

function toInput(productSlug: string, form: FormState): RbPackingProfileInput {
  return {
    productSlug,
    productName: form.productName.trim(),
    gtin: form.gtin.trim() ? form.gtin.trim() : null,
    packageKind: form.packageKind.trim() || 'box',
    packetsPerPackage: Number(form.packetsPerPackage),
    unitsPerPackage: Number(form.unitsPerPackage),
    unitNamePlural: form.unitNamePlural.trim() || 'unidades',
    packageCbm: Number(form.packageCbm),
    packageKg: Number(form.packageKg),
    stackable: form.stackable,
    notes: form.notes.trim() ? form.notes.trim() : null,
  }
}

export function RbPackingProfileForm({
  brandId,
  productSlug,
  productName,
  disabled = false,
}: {
  brandId: string
  productSlug: string
  productName: string
  disabled?: boolean
}) {
  const [form, setForm] = useState<FormState>(() => ({ ...EMPTY, productName }))
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let active = true
    setLoaded(false)
    setError(null)
    setSaved(false)
    getRbPackingProfile(brandId, productSlug).then((res) => {
      if (!active) return
      if (res.error) setError(res.error.message)
      else setForm(toFormState(res.data, productName))
      setLoaded(true)
    })
    return () => {
      active = false
    }
  }, [brandId, productSlug, productName])

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await upsertRbPackingProfile(brandId, toInput(productSlug, form))
      if (res.error) {
        setError(res.error.message)
        return
      }
      setForm(toFormState(res.data, productName))
      setSaved(true)
    })
  }

  const busy = disabled || isPending || !loaded

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Nombre logístico / Logistics name</span>
          <input value={form.productName} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>GTIN</span>
          <input value={form.gtin} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, gtin: e.target.value }))} className={INPUT} data-numeric />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Empaque / Package</span>
          <input value={form.packageKind} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, packageKind: e.target.value }))} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Paquetes / empaque</span>
          <input type="number" min={1} value={form.packetsPerPackage} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, packetsPerPackage: e.target.value }))} className={INPUT} data-numeric />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Unidades / empaque</span>
          <input type="number" min={1} value={form.unitsPerPackage} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, unitsPerPackage: e.target.value }))} className={INPUT} data-numeric />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Unidad (plural)</span>
          <input value={form.unitNamePlural} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, unitNamePlural: e.target.value }))} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>CBM / empaque (m³)</span>
          <input type="number" min={0} step="0.0001" value={form.packageCbm} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, packageCbm: e.target.value }))} className={INPUT} data-numeric />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Peso / empaque (kg)</span>
          <input type="number" min={0} step="0.01" value={form.packageKg} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, packageKg: e.target.value }))} className={INPUT} data-numeric />
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.stackable} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, stackable: e.target.checked }))} />
        <span className={LABEL}>Apilable / Stackable</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className={LABEL}>Notas / Notes</span>
        <textarea value={form.notes} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className={INPUT} />
      </label>

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}
      {saved ? <p className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Perfil guardado / Profile saved</p> : null}

      <div>
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.08em] text-ink-primary hover:border-lane-accent disabled:opacity-50"
        >
          Guardar perfil de empaque / Save packing profile
        </button>
      </div>
    </div>
  )
}
