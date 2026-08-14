'use client'

// /costing/history — the full, filterable archive of saved cost calculations
// (peru-costing follow-up: the in-calculator history list is capped and scoped
// to one lane at a time, right for "reopen my last few to revise" but wrong for
// "browse the whole fleet"). Client-side filtering against the full RLS-scoped
// set (listAllCostCalculations) — fine at hundreds of rows; see that action's
// doc comment for the scaling note.
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatAccounting } from '@/lib/money'
import type { CostCalculationSummary } from '@/lib/actions/costing'

const INPUT =
  'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'
const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'

function money(n: number): string {
  return formatAccounting(n, 'en-US')
}

export function CostingHistoryView({ rows }: { rows: CostCalculationSummary[] }) {
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [laneCode, setLaneCode] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const brands = useMemo(
    () => Array.from(new Set(rows.map((r) => r.inputs.brand).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [rows],
  )
  const lanes = useMemo(
    () => Array.from(new Set(rows.map((r) => r.laneCode))).sort((a, b) => a.localeCompare(b)),
    [rows],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (brand && r.inputs.brand !== brand) return false
      if (laneCode && r.laneCode !== laneCode) return false
      if (dateFrom && r.createdAt.slice(0, 10) < dateFrom) return false
      if (dateTo && r.createdAt.slice(0, 10) > dateTo) return false
      if (term) {
        const haystack = `${r.label ?? ''} ${r.inputs.productName} ${r.inputs.brand} ${r.inputs.model}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [rows, search, brand, laneCode, dateFrom, dateTo])

  const hasFilters = Boolean(search || brand || laneCode || dateFrom || dateTo)
  function clearFilters() {
    setSearch('')
    setBrand('')
    setLaneCode('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-col gap-1 border-b border-line pb-4">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">CST · Costeo</span>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-display text-t2 text-ink-primary">Historial de cálculos / Saved calculations</h1>
          <span className="font-mono text-label text-ink-secondary" data-numeric>
            {filtered.length} / {rows.length}
          </span>
        </div>
        <p className="max-w-prose text-t0 text-ink-secondary">
          Todos los cálculos guardados, en todas tus lanes. Abre uno para ver la hoja de costo o revísalo en la calculadora.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-1 flex-col gap-1" style={{ minWidth: '12rem' }}>
          <span className={LABEL}>Buscar / Search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Producto, marca, modelo…"
            className={`w-full ${INPUT} font-ui`}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Marca / Brand</span>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className={INPUT}>
            <option value="">— todas / all —</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        {lanes.length > 1 ? (
          <label className="flex flex-col gap-1">
            <span className={LABEL}>Lane</span>
            <select value={laneCode} onChange={(e) => setLaneCode(e.target.value)} className={INPUT}>
              <option value="">— todas / all —</option>
              {lanes.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Desde / From</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Hasta / To</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={INPUT} />
        </label>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
          >
            Limpiar / Clear
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-line-hairline bg-surface-1 p-8 text-center text-t0 text-ink-secondary">
          {rows.length === 0
            ? 'Sin cálculos guardados todavía / No saved calculations yet.'
            : 'Ningún cálculo coincide con estos filtros / No calculations match these filters.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full border-collapse text-t0">
            <thead className="sticky top-0 bg-surface-1">
              <tr className="border-b border-line text-left font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                <th className="px-3 py-2">Producto / Product</th>
                <th className="px-3 py-2">Marca</th>
                <th className="px-3 py-2">Lane</th>
                <th className="px-3 py-2 text-right">Landed</th>
                <th className="px-3 py-2 text-right">Precio final</th>
                <th className="px-3 py-2 text-right">Margen</th>
                <th className="px-3 py-2 text-right">Fecha</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 hover:bg-surface-1">
                  <td className="px-3 py-2 font-ui text-ink-primary">{r.label || r.inputs.productName}</td>
                  <td className="px-3 py-2 font-ui text-ink-secondary">{r.inputs.brand}</td>
                  <td className="px-3 py-2 font-mono text-label uppercase text-ink-secondary">{r.laneCode}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-ink-primary" data-numeric>
                    {money(r.landedMinor / 100)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-ink-primary" data-numeric>
                    {money(r.salePriceMinor / 100)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-ink-secondary" data-numeric>
                    {money(r.marginMinor / 100)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-ink-secondary tabular-nums" data-numeric>
                    {r.createdAt.slice(0, 10)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/costing?calcId=${r.id}`}
                        className="font-mono text-label uppercase tracking-[0.08em] text-lane-accent hover:underline"
                      >
                        Revisar →
                      </Link>
                      <Link
                        href={`/cost-sheet/${r.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-lane-accent"
                      >
                        Ver ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
