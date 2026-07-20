'use client'

// Prorrateo (peru-costing) — allocate shared shipment gastos across the items in
// a container by cbm / peso / valor_cif / unidad, with the rounding adjuster.
// Live allocation via the ported engine (calcularProrrateo, parity-locked);
// Save persists the run + per-item results; Export writes an XLSX. The validación
// row flags any gasto whose allocated shares don't sum back to the original.
import { useMemo, useState, useTransition } from 'react'
import { calcularProrrateo } from '@/lib/costing/prorrateo'
import type { GastoProrrateo, ItemProrrateo, MetodoProrrateo, Moneda } from '@/lib/costing/types'
import { saveProrrateoRun, type CostingLane } from '@/lib/actions/costing'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT = 'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'

interface ItemRow { id: string; sku: string; descripcion: string; cantidad: string; peso: string; cbm: string; cif: string }
interface GastoRow { id: string; nombre: string; monto: string; moneda: Moneda; metodo: MetodoProrrateo }

let iid = 0
let gid = 0
const newItem = (): ItemRow => ({ id: `i${(iid += 1)}`, sku: '', descripcion: '', cantidad: '1', peso: '0', cbm: '0', cif: '0' })
const newGasto = (): GastoRow => ({ id: `g${(gid += 1)}`, nombre: '', monto: '0', moneda: 'USD', metodo: 'cbm' })

function money(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ProrrateoTool({ lanes }: { lanes: CostingLane[] }) {
  const [items, setItems] = useState<ItemRow[]>([newItem(), newItem()])
  const [gastos, setGastos] = useState<GastoRow[]>([newGasto()])
  const [tc, setTc] = useState('3.70')
  const [laneId, setLaneId] = useState(lanes[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const engineItems: ItemProrrateo[] = items.map((r) => ({
    item_id: r.id,
    sku: r.sku,
    descripcion: r.descripcion,
    cantidad: Number(r.cantidad) || 0,
    peso_total_kg: Number(r.peso) || 0,
    cbm_total: Number(r.cbm) || 0,
    valor_total_cif: Number(r.cif) || 0,
  }))
  const engineGastos: GastoProrrateo[] = gastos.map((g) => ({
    gasto_id: g.id,
    nombre: g.nombre,
    monto_total: Number(g.monto) || 0,
    moneda: g.moneda,
    metodo: g.metodo,
  }))

  const result = useMemo(() => {
    try {
      return calcularProrrateo(engineItems, engineGastos, Number(tc) || 0)
    } catch {
      return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, gastos, tc])

  function setItem(id: string, patch: Partial<ItemRow>) {
    setItems((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    setSavedId(null)
  }
  function setGasto(id: string, patch: Partial<GastoRow>) {
    setGastos((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    setSavedId(null)
  }

  async function handleExport() {
    if (!result) return
    const XLSX = await import('xlsx')
    const data = result.items.map((r) => ({
      sku: r.item.sku,
      descripcion: r.item.descripcion,
      cantidad: r.item.cantidad,
      costo_logistico_total_usd: r.costo_logistico_total_usd,
      costo_logistico_unitario_usd: r.costo_logistico_unitario_usd,
      costo_compra_unitario_usd: r.costo_compra_unitario_usd,
      costo_total_unitario_usd: r.costo_total_puesto_almacen_unitario_usd,
      costo_total_total_usd: r.costo_total_puesto_almacen_total_usd,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Prorrateo')
    XLSX.writeFile(wb, 'wings-prorrateo.xlsx')
  }

  function handleSave() {
    if (!laneId) {
      setError('Selecciona un lane / Select a lane')
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await saveProrrateoRun({
        laneId,
        exchangeRate: Number(tc) || 0,
        items: engineItems,
        gastos: engineGastos,
      })
      if (res.error) {
        setError(res.error.message)
        return
      }
      setSavedId(res.data.runId)
    })
  }

  const resultById = new Map(result?.items.map((r) => [r.item.item_id, r]) ?? [])

  return (
    <div className="flex flex-col gap-4">
      {/* Items */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className={LABEL}>Ítems del contenedor</h3>
          <button type="button" onClick={() => setItems((r) => [...r, newItem()])} className={`rounded-card border border-line px-2 py-1 ${LABEL} hover:border-lane-accent`}>+ ítem</button>
        </div>
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-surface-1 text-left">
                {['SKU', 'Descripción', 'Cant.', 'Peso kg', 'CBM', 'CIF USD', 'Costo total / ud', ''].map((h) => (
                  <th key={h} className={`px-2 py-2 ${LABEL}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const res = resultById.get(r.id)
                return (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-1 py-1"><input value={r.sku} onChange={(e) => setItem(r.id, { sku: e.target.value })} className={`w-24 ${INPUT} font-ui`} /></td>
                    <td className="px-1 py-1"><input value={r.descripcion} onChange={(e) => setItem(r.id, { descripcion: e.target.value })} className={`w-40 ${INPUT} font-ui`} /></td>
                    <td className="px-1 py-1"><input value={r.cantidad} onChange={(e) => setItem(r.id, { cantidad: e.target.value })} data-numeric className={`w-16 ${INPUT}`} /></td>
                    <td className="px-1 py-1"><input value={r.peso} onChange={(e) => setItem(r.id, { peso: e.target.value })} data-numeric className={`w-20 ${INPUT}`} /></td>
                    <td className="px-1 py-1"><input value={r.cbm} onChange={(e) => setItem(r.id, { cbm: e.target.value })} data-numeric className={`w-20 ${INPUT}`} /></td>
                    <td className="px-1 py-1"><input value={r.cif} onChange={(e) => setItem(r.id, { cif: e.target.value })} data-numeric className={`w-24 ${INPUT}`} /></td>
                    <td className="px-2 py-1 font-mono text-t0 tabular-nums text-ink-primary" data-numeric>{res ? money(res.costo_total_puesto_almacen_unitario_usd) : '—'}</td>
                    <td className="px-1 py-1"><button type="button" onClick={() => setItems((rs) => rs.filter((x) => x.id !== r.id))} className="font-mono text-label text-ink-secondary hover:text-negative" aria-label="Eliminar">✕</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Gastos */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className={LABEL}>Gastos a prorratear</h3>
          <button type="button" onClick={() => setGastos((r) => [...r, newGasto()])} className={`rounded-card border border-line px-2 py-1 ${LABEL} hover:border-lane-accent`}>+ gasto</button>
        </div>
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="bg-surface-1 text-left">
                {['Concepto', 'Monto', 'Moneda', 'Método', 'Validación', ''].map((h) => <th key={h} className={`px-2 py-2 ${LABEL}`}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {gastos.map((g) => {
                const v = result?.validacion[g.id]
                return (
                  <tr key={g.id} className="border-t border-line">
                    <td className="px-1 py-1"><input value={g.nombre} onChange={(e) => setGasto(g.id, { nombre: e.target.value })} className={`w-40 ${INPUT} font-ui`} /></td>
                    <td className="px-1 py-1"><input value={g.monto} onChange={(e) => setGasto(g.id, { monto: e.target.value })} data-numeric className={`w-24 ${INPUT}`} /></td>
                    <td className="px-1 py-1">
                      <select value={g.moneda} onChange={(e) => setGasto(g.id, { moneda: e.target.value as Moneda })} className={INPUT}>
                        <option value="USD">USD</option>
                        <option value="PEN">PEN</option>
                      </select>
                    </td>
                    <td className="px-1 py-1">
                      <select value={g.metodo} onChange={(e) => setGasto(g.id, { metodo: e.target.value as MetodoProrrateo })} className={INPUT}>
                        <option value="cbm">cbm</option>
                        <option value="peso">peso</option>
                        <option value="valor_cif">valor_cif</option>
                        <option value="unidad">unidad</option>
                      </select>
                    </td>
                    <td className="px-2 py-1 font-mono text-label">
                      {v ? <span className={v.coincide ? 'text-positive' : 'text-negative'}>{v.coincide ? '✓ cuadra' : '✗ revisar'}</span> : '—'}
                    </td>
                    <td className="px-1 py-1"><button type="button" onClick={() => setGastos((rs) => rs.filter((x) => x.id !== g.id))} className="font-mono text-label text-ink-secondary hover:text-negative" aria-label="Eliminar">✕</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface-1 p-4">
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Tipo de cambio</span>
          <input value={tc} onChange={(e) => setTc(e.target.value)} data-numeric className={`w-24 ${INPUT}`} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Lane</span>
          <select value={laneId} onChange={(e) => setLaneId(e.target.value)} className={INPUT}>
            {lanes.length === 0 ? <option value="">— sin acceso —</option> : null}
            {lanes.map((l) => <option key={l.id} value={l.id}>{l.code} · {l.name}</option>)}
          </select>
        </label>
        <button type="button" onClick={handleExport} disabled={!result} className={`rounded-card border border-line px-3 py-2 ${LABEL} text-ink-primary hover:border-lane-accent disabled:opacity-40`}>Exportar XLSX ↓</button>
        <button type="button" onClick={handleSave} disabled={isPending || !result} className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40">Guardar prorrateo / Save</button>
        {savedId ? <span className="font-mono text-label uppercase tracking-[0.08em] text-positive">Guardado</span> : null}
      </div>
      {error ? <p role="alert" className="font-ui text-t0 text-negative">{error}</p> : null}
    </div>
  )
}
