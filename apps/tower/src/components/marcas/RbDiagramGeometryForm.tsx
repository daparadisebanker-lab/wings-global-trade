'use client'

// RB diagram-geometry form (RB Console Wave 4 tail). The write-side for
// tower.rb_diagram_specs — the BOUNDED geometry a product's technical package
// drawing is derived from (root §5-bis / R1: geometry lives OUTSIDE the spec
// value). Auth/RLS live in the action; this only collects the numbers (exhibited
// in tabular mono) and upserts them. A live SVG preview mounts the SAME
// PackingDiagram organ the public fiche + tech sheet render — what the rep sees is
// what ships (single-source render).
import { useEffect, useState, useTransition, type CSSProperties } from 'react'
import { PackingDiagram } from '@wings/trade-ui'
import { packingSpecFromGeometry } from '@wings/rb-core'
import {
  getRbDiagramSpec,
  upsertRbDiagramSpec,
  type RbDiagramSpecInput,
  type RbDiagramSpecRow,
} from '@/lib/actions/rb-diagrams'

const LABEL = 'font-mono text-label uppercase tracking-[0.1em] text-ink-secondary'
const INPUT =
  'rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none placeholder:text-ink-secondary focus-visible:border-lane-accent disabled:opacity-50'

// Neutral document palette for the console preview — the same --rb-* token contract
// the public fiche resolves, so the organ is drawn faithfully in the tower shell.
const RB_PREVIEW_TOKENS = {
  '--rb-ink': '#0f1216',
  '--rb-surface-tint': '#f7f8f9',
  '--rb-accent-soft': '#eef1f4',
  '--rb-accent-ink': '#4b5563',
} as CSSProperties

interface FormState {
  packageLengthMm: string
  packageWidthMm: string
  packageHeightMm: string
  unitsPerPackage: string
  packagesPerSlot: string
  cellsAcross: string
  cellsHigh: string
  cellsDeep: string
  detail: 'rolls' | 'slabs'
  caption: string
}

const EMPTY: FormState = {
  packageLengthMm: '',
  packageWidthMm: '',
  packageHeightMm: '',
  unitsPerPackage: '',
  packagesPerSlot: '',
  cellsAcross: '1',
  cellsHigh: '1',
  cellsDeep: '1',
  detail: 'slabs',
  caption: '',
}

function toFormState(row: RbDiagramSpecRow | null): FormState {
  if (!row) return { ...EMPTY }
  return {
    packageLengthMm: String(row.packageLengthMm),
    packageWidthMm: String(row.packageWidthMm),
    packageHeightMm: String(row.packageHeightMm),
    unitsPerPackage: String(row.unitsPerPackage),
    packagesPerSlot: String(row.packagesPerSlot),
    cellsAcross: String(row.cellsAcross),
    cellsHigh: String(row.cellsHigh),
    cellsDeep: String(row.cellsDeep),
    detail: row.detail,
    caption: row.caption ?? '',
  }
}

function toInput(form: FormState): RbDiagramSpecInput {
  return {
    packageLengthMm: Number(form.packageLengthMm),
    packageWidthMm: Number(form.packageWidthMm),
    packageHeightMm: Number(form.packageHeightMm),
    unitsPerPackage: Number(form.unitsPerPackage),
    packagesPerSlot: Number(form.packagesPerSlot),
    cellsAcross: Number(form.cellsAcross) || 1,
    cellsHigh: Number(form.cellsHigh) || 1,
    cellsDeep: Number(form.cellsDeep) || 1,
    detail: form.detail,
    caption: form.caption.trim() ? form.caption.trim() : null,
  }
}

/** True when every dimension/count needed to draw is a positive number — gates the
 *  live preview so it never renders a degenerate box. */
function isDrawable(form: FormState): boolean {
  const n = (v: string) => Number(v) > 0
  return (
    n(form.packageLengthMm) &&
    n(form.packageWidthMm) &&
    n(form.packageHeightMm) &&
    n(form.unitsPerPackage) &&
    n(form.packagesPerSlot)
  )
}

export function RbDiagramGeometryForm({
  rbProductId,
  productName,
  disabled = false,
}: {
  rbProductId: string
  productName: string
  disabled?: boolean
}) {
  const [form, setForm] = useState<FormState>(() => ({ ...EMPTY }))
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let active = true
    setLoaded(false)
    setError(null)
    setSaved(false)
    getRbDiagramSpec(rbProductId).then((res) => {
      if (!active) return
      if (res.error) setError(res.error.message)
      else setForm(toFormState(res.data))
      setLoaded(true)
    })
    return () => {
      active = false
    }
  }, [rbProductId])

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await upsertRbDiagramSpec(rbProductId, toInput(form))
      if (res.error) {
        setError(res.error.message)
        return
      }
      setForm(toFormState(res.data))
      setSaved(true)
    })
  }

  const busy = disabled || isPending || !loaded
  const previewSpec = isDrawable(form)
    ? packingSpecFromGeometry(
        {
          packageLengthMm: Number(form.packageLengthMm),
          packageWidthMm: Number(form.packageWidthMm),
          packageHeightMm: Number(form.packageHeightMm),
          unitsPerPackage: Number(form.unitsPerPackage),
          packagesPerSlot: Number(form.packagesPerSlot),
          cellsAcross: Number(form.cellsAcross) || 1,
          cellsHigh: Number(form.cellsHigh) || 1,
          cellsDeep: Number(form.cellsDeep) || 1,
          detail: form.detail,
          caption: form.caption.trim() || null,
        },
        productName,
      )
    : null

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Largo / Length (mm)</span>
          <input type="number" min={1} value={form.packageLengthMm} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, packageLengthMm: e.target.value }))} className={INPUT} data-numeric />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Ancho / Width (mm)</span>
          <input type="number" min={1} value={form.packageWidthMm} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, packageWidthMm: e.target.value }))} className={INPUT} data-numeric />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Alto / Height (mm)</span>
          <input type="number" min={1} value={form.packageHeightMm} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, packageHeightMm: e.target.value }))} className={INPUT} data-numeric />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Unidades / caja</span>
          <input type="number" min={1} value={form.unitsPerPackage} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, unitsPerPackage: e.target.value }))} className={INPUT} data-numeric />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Cajas / cupo</span>
          <input type="number" min={1} value={form.packagesPerSlot} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, packagesPerSlot: e.target.value }))} className={INPUT} data-numeric />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Detalle / Detail</span>
          <select value={form.detail} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value as 'rolls' | 'slabs' }))} className={INPUT}>
            <option value="slabs">Bloques / slabs</option>
            <option value="rolls">Rollos / rolls</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Celdas ancho / across</span>
          <input type="number" min={1} value={form.cellsAcross} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, cellsAcross: e.target.value }))} className={INPUT} data-numeric />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Celdas alto / high</span>
          <input type="number" min={1} value={form.cellsHigh} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, cellsHigh: e.target.value }))} className={INPUT} data-numeric />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Celdas fondo / deep</span>
          <input type="number" min={1} value={form.cellsDeep} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, cellsDeep: e.target.value }))} className={INPUT} data-numeric />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className={LABEL}>Leyenda / Caption</span>
        <input value={form.caption} disabled={busy} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} placeholder="derivada de los conteos si se deja vacío / derived from counts if blank" className={INPUT} />
      </label>

      {previewSpec ? (
        <div className="flex flex-col gap-1">
          <span className={LABEL}>Vista previa / Preview</span>
          {/* The console has no --rb-* stylesheet (that lives on the public
              (brands) route group); inject a neutral document palette as inline
              custom properties so the SAME organ renders legibly here — the
              geometry the rep authors is identical regardless of theme (SPEC
              Ch04 §5). */}
          <div className="max-w-[430px] rounded-card border border-line bg-white p-2" style={RB_PREVIEW_TOKENS}>
            <PackingDiagram spec={previewSpec} />
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}
      {saved ? <p className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Geometría guardada / Geometry saved</p> : null}

      <div>
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.08em] text-ink-primary hover:border-lane-accent disabled:opacity-50"
        >
          Guardar geometría / Save geometry
        </button>
      </div>
    </div>
  )
}
