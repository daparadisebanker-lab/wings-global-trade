'use client'

// Bulk costing (peru-costing Wave 6.4) — the file-in → rows-out loop ops lost
// when wings-operations froze. Shared shipment terms up top, a per-row product
// table below (import from XLSX/CSV or add by hand), each row costed live by the
// engine. Save persists the whole batch (append-only, server-recomputed);
// Export writes an XLSX. Rates default from costing_config (G5); Ad Valorem
// resolves per row from the HS code.
import { useEffect, useMemo, useState, useTransition } from 'react'
import { computeImportCost, DEFAULT_INPUTS } from '@/lib/costing/engine'
import type { ImportInputs } from '@/lib/costing/types'
import {
  getCostingReference,
  saveBulkCostCalculations,
  type CostingLane,
  type CostingReference,
} from '@/lib/actions/costing'
import { resolveAdValoremRate } from '@/lib/costing/ad-valorem'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT = 'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'

interface Shared {
  incoterm: ImportInputs['incoterm']
  transportOrigin: number
  freightInternational: number
  freightZofratacna: number
  portExpenses: number
  customsAgency: number
  handlingStowage: number
  igvRate: number
  percepcionRate: number
  insuranceRate: number
  exchangeRate: number
  marginMode: ImportInputs['marginMode']
  marginPercent: number
}

interface Row {
  id: string
  productName: string
  brand: string
  model: string
  fuelType: ImportInputs['fuelType']
  engineCC: string
  year: string
  hsCode: string
  fob: string
}

const SHARED0: Shared = {
  incoterm: 'FOB',
  transportOrigin: 0,
  freightInternational: DEFAULT_INPUTS.freightInternational,
  freightZofratacna: DEFAULT_INPUTS.freightZofratacna,
  portExpenses: DEFAULT_INPUTS.portExpenses,
  customsAgency: DEFAULT_INPUTS.customsAgency,
  handlingStowage: 0,
  igvRate: DEFAULT_INPUTS.igvRate,
  percepcionRate: DEFAULT_INPUTS.percepcionRate,
  insuranceRate: DEFAULT_INPUTS.insuranceRate,
  exchangeRate: DEFAULT_INPUTS.exchangeRate,
  marginMode: 'percent',
  marginPercent: DEFAULT_INPUTS.marginPercent,
}

const HEADERS = ['productName', 'brand', 'model', 'fuelType', 'engineCC', 'year', 'hsCode', 'fob'] as const
const FUELS: ImportInputs['fuelType'][] = ['gasoline', 'diesel', 'hybrid', 'electric']

let rid = 0
function emptyRow(): Row {
  rid += 1
  return { id: `r${rid}`, productName: '', brand: '', model: '', fuelType: 'gasoline', engineCC: '1500', year: '2026', hsCode: '', fob: '0' }
}

function money(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BulkCostImport({ lanes }: { lanes: CostingLane[] }) {
  const [laneId, setLaneId] = useState(lanes[0]?.id ?? '')
  const [shared, setShared] = useState<Shared>(SHARED0)
  const [reference, setReference] = useState<CostingReference | null>(null)
  const [rows, setRows] = useState<Row[]>([emptyRow()])
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!laneId) return
    let active = true
    getCostingReference(laneId).then((res) => {
      if (!active || res.error) return
      setReference(res.data)
      setShared((s) => ({ ...s, igvRate: res.data.igvRate, percepcionRate: res.data.percepcionRate, insuranceRate: res.data.insuranceRate }))
    })
    return () => {
      active = false
    }
  }, [laneId])

  const buildInputs = useMemo(() => {
    return (row: Row): ImportInputs => ({
      productName: row.productName,
      brand: row.brand,
      model: row.model,
      fuelType: row.fuelType,
      engineCC: Number(row.engineCC) || 0,
      origin: 'other',
      year: Number(row.year) || 2026,
      incoterm: shared.incoterm,
      fob: Number(row.fob) || 0,
      transportOrigin: shared.transportOrigin,
      freightInternational: shared.freightInternational,
      freightZofratacna: shared.freightZofratacna,
      portExpenses: shared.portExpenses,
      customsAgency: shared.customsAgency,
      handlingStowage: shared.handlingStowage,
      adValoremRate: resolveAdValoremRate(reference?.adValoremRates ?? [], row.hsCode),
      igvRate: shared.igvRate,
      percepcionRate: shared.percepcionRate,
      insuranceRate: shared.insuranceRate,
      exchangeRate: shared.exchangeRate,
      marginMode: shared.marginMode,
      marginPercent: shared.marginPercent,
      targetSalePrice: 0,
    })
  }, [shared, reference])

  const costed = rows.map((row) => {
    try {
      const inputs = buildInputs(row)
      const result = computeImportCost(inputs)
      return { row, inputs, landed: result.landedCost, sale: result.salePriceFinal, ok: true as const }
    } catch {
      return { row, inputs: null, landed: 0, sale: 0, ok: false as const }
    }
  })
  const totalLanded = costed.reduce((a, c) => a + c.landed, 0)

  function setRow(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    setSavedCount(null)
  }
  function setSh<K extends keyof Shared>(key: K, value: Shared[K]) {
    setShared((s) => ({ ...s, [key]: value }))
    setSavedCount(null)
  }

  function rowsFromRecords(records: Record<string, unknown>[]) {
    const norm = (obj: Record<string, unknown>, key: string): string => {
      const hit = Object.keys(obj).find((k) => k.trim().toLowerCase() === key.toLowerCase())
      return hit != null ? String(obj[hit] ?? '') : ''
    }
    const next = records
      .map((rec) => {
        const fuel = norm(rec, 'fuelType').toLowerCase()
        return {
          ...emptyRow(),
          productName: norm(rec, 'productName'),
          brand: norm(rec, 'brand'),
          model: norm(rec, 'model'),
          fuelType: (FUELS.includes(fuel as ImportInputs['fuelType']) ? fuel : 'gasoline') as ImportInputs['fuelType'],
          engineCC: norm(rec, 'engineCC') || '1500',
          year: norm(rec, 'year') || '2026',
          hsCode: norm(rec, 'hsCode'),
          fob: norm(rec, 'fob') || '0',
        }
      })
      .filter((r) => r.productName || r.brand || Number(r.fob) > 0)
    if (next.length) {
      setRows(next)
      setSavedCount(null)
    }
  }

  async function handleFile(file: File) {
    setError(null)
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      rowsFromRecords(XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[])
    } catch {
      setError('No se pudo leer el archivo / Could not read the file')
    }
  }

  function handlePaste(text: string) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean)
    if (lines.length === 0) return
    const records = lines.map((line) => {
      const cells = line.split(/\t|,/).map((c) => c.trim())
      const rec: Record<string, string> = {}
      HEADERS.forEach((h, i) => (rec[h] = cells[i] ?? ''))
      return rec
    })
    rowsFromRecords(records)
  }

  async function handleExport() {
    const XLSX = await import('xlsx')
    const data = costed.map((c) => ({
      productName: c.row.productName,
      brand: c.row.brand,
      model: c.row.model,
      fuelType: c.row.fuelType,
      engineCC: c.row.engineCC,
      year: c.row.year,
      hsCode: c.row.hsCode,
      fob: c.row.fob,
      landed_usd: c.landed,
      sale_final_usd: c.sale,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Costeo masivo')
    XLSX.writeFile(wb, `wings-costeo-masivo.xlsx`)
  }

  function handleSaveAll() {
    if (!laneId) {
      setError('Selecciona un lane / Select a lane')
      return
    }
    const valid = costed.filter((c) => c.ok && c.inputs && (c.row.productName || c.row.brand || Number(c.row.fob) > 0))
    if (valid.length === 0) {
      setError('Agrega al menos una fila válida / Add at least one valid row')
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await saveBulkCostCalculations({
        laneId,
        label: label.trim() || null,
        rows: valid.map((c) => c.inputs as ImportInputs),
      })
      if (res.error) {
        setError(res.error.message)
        return
      }
      setSavedCount(res.data.length)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Shared terms */}
      <fieldset className="grid grid-cols-2 gap-2 rounded-card border border-line bg-surface-1 p-3 sm:grid-cols-4 lg:grid-cols-6">
        <legend className="px-1 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Condiciones compartidas
        </legend>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Incoterm</span>
          <select value={shared.incoterm} onChange={(e) => setSh('incoterm', e.target.value as Shared['incoterm'])} className={INPUT}>
            <option value="EXW">EXW</option>
            <option value="FOB">FOB</option>
            <option value="CFR">CFR</option>
            <option value="CIF">CIF</option>
          </select>
        </label>
        {(
          [
            ['exchangeRate', 'TC'],
            ['freightInternational', 'Flete intl'],
            ['freightZofratacna', 'Flete Zofra'],
            ['portExpenses', 'Portuarios'],
            ['customsAgency', 'Aduanas'],
            ['handlingStowage', 'Manipuleo'],
            ['marginPercent', 'Margen (frac)'],
          ] as [keyof Shared, string][]
        ).map(([key, lbl]) => (
          <label key={key} className="flex flex-col gap-1">
            <span className={LABEL}>{lbl}</span>
            <input
              type="number"
              step="any"
              value={shared[key] as number}
              onChange={(e) => setSh(key, Number(e.target.value) as never)}
              data-numeric
              className={INPUT}
            />
          </label>
        ))}
        <div className="col-span-2 text-t0 text-ink-secondary sm:col-span-1">
          <span className={LABEL}>Tasas (config)</span>
          <p className="font-mono text-label text-ink-secondary">
            IGV {(shared.igvRate * 100).toFixed(1)}% · Perc {(shared.percepcionRate * 100).toFixed(1)}%
          </p>
        </div>
      </fieldset>

      {/* Import controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface-1 p-3">
        <label className={`cursor-pointer rounded-card border border-line px-3 py-1.5 ${LABEL} hover:border-lane-accent`}>
          Subir XLSX / CSV
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleFile(f)
            }}
          />
        </label>
        <button type="button" onClick={() => setRows((r) => [...r, emptyRow()])} className={`rounded-card border border-line px-3 py-1.5 ${LABEL} hover:border-lane-accent`}>
          + Fila
        </button>
        <button type="button" onClick={handleExport} className={`rounded-card border border-line px-3 py-1.5 ${LABEL} hover:border-lane-accent`}>
          Exportar XLSX ↓
        </button>
        <details className="flex-1">
          <summary className={`cursor-pointer ${LABEL}`}>Pegar filas (CSV)</summary>
          <textarea
            rows={3}
            placeholder="productName,brand,model,fuelType,engineCC,year,hsCode,fob"
            onChange={(e) => handlePaste(e.target.value)}
            className={`mt-2 w-full ${INPUT} font-ui`}
          />
        </details>
      </div>

      {/* Rows */}
      <div className="overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-surface-1 text-left">
              {['Producto', 'Marca', 'Modelo', 'Comb.', 'CC', 'Año', 'HS', 'FOB', 'Landed', 'Precio final', ''].map((h) => (
                <th key={h} className="px-2 py-2 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {costed.map((c) => (
              <tr key={c.row.id} className="border-t border-line">
                <td className="px-1 py-1"><input value={c.row.productName} onChange={(e) => setRow(c.row.id, { productName: e.target.value })} className={`w-36 ${INPUT} font-ui`} /></td>
                <td className="px-1 py-1"><input value={c.row.brand} onChange={(e) => setRow(c.row.id, { brand: e.target.value })} className={`w-24 ${INPUT} font-ui`} /></td>
                <td className="px-1 py-1"><input value={c.row.model} onChange={(e) => setRow(c.row.id, { model: e.target.value })} className={`w-24 ${INPUT} font-ui`} /></td>
                <td className="px-1 py-1">
                  <select value={c.row.fuelType} onChange={(e) => setRow(c.row.id, { fuelType: e.target.value as Row['fuelType'] })} className={INPUT}>
                    {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </td>
                <td className="px-1 py-1"><input value={c.row.engineCC} onChange={(e) => setRow(c.row.id, { engineCC: e.target.value })} data-numeric className={`w-16 ${INPUT}`} /></td>
                <td className="px-1 py-1"><input value={c.row.year} onChange={(e) => setRow(c.row.id, { year: e.target.value })} data-numeric className={`w-16 ${INPUT}`} /></td>
                <td className="px-1 py-1"><input value={c.row.hsCode} onChange={(e) => setRow(c.row.id, { hsCode: e.target.value })} className={`w-20 ${INPUT}`} /></td>
                <td className="px-1 py-1"><input value={c.row.fob} onChange={(e) => setRow(c.row.id, { fob: e.target.value })} data-numeric className={`w-24 ${INPUT}`} /></td>
                <td className="px-2 py-1 font-mono text-t0 tabular-nums text-ink-primary" data-numeric>{money(c.landed)}</td>
                <td className="px-2 py-1 font-mono text-t0 tabular-nums text-ink-primary" data-numeric>{money(c.sale)}</td>
                <td className="px-1 py-1">
                  <button type="button" onClick={() => setRows((rs) => rs.filter((r) => r.id !== c.row.id))} className="font-mono text-label text-ink-secondary hover:text-negative" aria-label="Eliminar fila">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line bg-surface-1">
              <td colSpan={8} className="px-2 py-2 text-right font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                {rows.length} filas · landed total
              </td>
              <td className="px-2 py-2 font-mono text-t0 tabular-nums text-ink-primary" data-numeric>{money(totalLanded)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Save */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Lane</span>
          <select value={laneId} onChange={(e) => setLaneId(e.target.value)} className={INPUT}>
            {lanes.length === 0 ? <option value="">— sin acceso —</option> : null}
            {lanes.map((l) => <option key={l.id} value={l.id}>{l.code} · {l.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Etiqueta del lote</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={`${INPUT} font-ui`} />
        </label>
        <button type="button" onClick={handleSaveAll} disabled={isPending} className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40">
          Guardar lote / Save batch
        </button>
        {savedCount != null ? <span className="font-mono text-label uppercase tracking-[0.08em] text-positive">{savedCount} guardados</span> : null}
      </div>
      {error ? <p role="alert" className="font-ui text-t0 text-negative">{error}</p> : null}
    </div>
  )
}
