'use client'

// /costing/history — the full, filterable archive of saved cost calculations
// (peru-costing follow-up: the in-calculator history list is capped and scoped
// to one lane at a time, right for "reopen my last few to revise" but wrong for
// "browse the whole fleet"). Client-side filtering against the full RLS-scoped
// set (listAllCostCalculations) — fine at hundreds of rows; see that action's
// doc comment for the scaling note.
import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatAccounting } from '@/lib/money'
import type { CostCalculationSummary, CostingLane } from '@/lib/actions/costing'
import { listAccountsForBrand, createRFQ, upsertLines, type AccountOption, type RfqLineInput } from '@/lib/actions/pipeline'
import { getDefaultUnit, type Archetype } from '@/lib/archetypes'
import { exportFleetCostingXlsx } from './export'

const INPUT =
  'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'
const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'

function money(n: number): string {
  return formatAccounting(n, 'en-US')
}

export function CostingHistoryView({ rows, lanes: laneOptions }: { rows: CostCalculationSummary[]; lanes: CostingLane[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [laneCode, setLaneCode] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  // Selection persists across filter changes (a Set of ids against the full
  // set, not the filtered view) — narrowing the filters to check a few more
  // rows never silently drops what was already picked.
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Bundling: turn N selected calculations into one multi-line RFQ/quote —
  // the multi-brand-dealer gap (an RFQ belongs to one lane, so the selection
  // must share one; the client picker and line unit both come from that
  // lane). QuoteComposer already renders N pre-filled draft lines from
  // rfq_lines with zero changes needed there — this panel is the only piece
  // that was missing.
  const [bundleOpen, setBundleOpen] = useState(false)
  const [bundleAccounts, setBundleAccounts] = useState<AccountOption[]>([])
  const [bundleAccountId, setBundleAccountId] = useState('')
  const [bundleQty, setBundleQty] = useState<Record<string, number>>({})
  const [bundleError, setBundleError] = useState<string | null>(null)
  const [isBundling, startBundleTransition] = useTransition()

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

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id))
  function toggleAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        for (const r of filtered) next.delete(r.id)
      } else {
        for (const r of filtered) next.add(r.id)
      }
      return next
    })
  }

  const selectedRows = useMemo(() => rows.filter((r) => selected.has(r.id)), [rows, selected])

  function handleExportSelected() {
    void exportFleetCostingXlsx(
      selectedRows.map((r) => ({ label: r.label || r.inputs.productName, inputs: r.inputs, result: r.result })),
      `Costeo seleccionado — ${selectedRows.length} modelo(s)`,
    )
  }

  // An RFQ belongs to exactly one lane — the selection can span brands (that's
  // the point: Jetour + Changan on one dealer proposal) but not lanes.
  const selectedLaneIds = useMemo(() => new Set(selectedRows.map((r) => r.laneId)), [selectedRows])
  const bundleLaneId = selectedLaneIds.size === 1 ? [...selectedLaneIds][0] : null
  const bundleLane = bundleLaneId ? laneOptions.find((l) => l.id === bundleLaneId) : null

  useEffect(() => {
    if (!bundleOpen || !bundleLane) {
      setBundleAccounts([])
      return
    }
    let active = true
    setBundleAccountId('')
    listAccountsForBrand(bundleLane.brandId).then((res) => {
      if (active && res.data) setBundleAccounts(res.data)
    })
    return () => {
      active = false
    }
  }, [bundleOpen, bundleLane])

  function openBundle() {
    setBundleError(null)
    setBundleQty(Object.fromEntries(selectedRows.map((r) => [r.id, bundleQty[r.id] ?? 1])))
    setBundleOpen(true)
  }

  function setQty(id: string, qty: number) {
    setBundleQty((q) => ({ ...q, [id]: qty }))
  }

  // Costing → Client → Quotation, but for N selected calculations at once:
  // one RFQ, one upsertLines call carrying every selected model as its own
  // line (own qty, own computed price) — QuoteComposer already prefills N
  // draft lines from rfq_lines, so the rep lands ready to "Componer
  // cotización" instead of retyping each model's price by hand.
  function handleCreateBundleQuote() {
    if (!bundleLane || !bundleAccountId || selectedRows.length === 0) {
      setBundleError('Selecciona un cliente / Select a client')
      return
    }
    setBundleError(null)
    startBundleTransition(async () => {
      const rfqRes = await createRFQ(bundleLane.id, { accountId: bundleAccountId, source: 'MANUAL', currency: 'USD' })
      if (rfqRes.error) {
        setBundleError(rfqRes.error.message)
        return
      }
      const unit = getDefaultUnit(bundleLane.archetype as Archetype).id
      const lines: RfqLineInput[] = selectedRows.map((r) => ({
        description: r.label || r.inputs.productName || 'Cálculo',
        brand: r.inputs.brand || null,
        qty: bundleQty[r.id] ?? 1,
        unit,
        targetPriceMinor: r.salePriceMinor,
        currency: 'USD',
      }))
      const linesRes = await upsertLines(rfqRes.data.id, lines)
      if (linesRes.error) {
        setBundleError(linesRes.error.message)
        return
      }
      router.push(`/pipeline/${rfqRes.data.id}`)
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-col gap-1 border-b border-line pb-4">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">CST · Costeo</span>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-display text-t2 text-ink-primary">Historial de cálculos / Saved calculations</h1>
          <div className="flex items-center gap-3">
            <span className="font-mono text-label text-ink-secondary" data-numeric>
              {filtered.length} / {rows.length}
            </span>
            <button
              type="button"
              onClick={handleExportSelected}
              disabled={selectedRows.length === 0}
              title="Exporta solo los cálculos marcados con el checkbox, agrupados por marca / Exports only the checked calculations, grouped by brand"
              className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-primary hover:border-lane-accent disabled:opacity-40"
            >
              Exportar seleccionados ({selectedRows.length}) ↓
            </button>
            <button
              type="button"
              onClick={bundleOpen ? () => setBundleOpen(false) : openBundle}
              disabled={selectedRows.length === 0}
              title="Arma un RFQ con una línea por cada cálculo marcado — un solo cliente, varios modelos y marcas / Builds one RFQ with a line per checked calculation — one client, several models and brands"
              className="rounded-card bg-accent px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
            >
              {bundleOpen ? 'Cerrar' : `Crear cotización con seleccionados (${selectedRows.length}) →`}
            </button>
          </div>
        </div>
        <p className="max-w-prose text-t0 text-ink-secondary">
          Todos los cálculos guardados, en todas tus lanes. Marca los que quieras compartir, exportarlos juntos o armar una
          cotización multi-modelo para un mismo cliente — o abre uno para ver la hoja de costo o revisarlo en la calculadora.
        </p>
      </header>

      {bundleOpen ? (
        <div className="flex flex-col gap-3 rounded-card border border-lane-accent bg-surface-1 p-4">
          {!bundleLane ? (
            <p role="alert" className="font-ui text-t0 text-negative">
              Los cálculos seleccionados están en más de un lane — un RFQ solo puede tener un lane. Deja marcados solo los de
              un mismo lane (lanes: {[...new Set(selectedRows.map((r) => r.laneCode))].join(', ')}).
              {' / '}
              Selected calculations span more than one lane — an RFQ can only have one. Keep only one lane checked.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-1 flex-col gap-1" style={{ minWidth: '14rem' }}>
                  <span className={LABEL}>Cliente / Client — {bundleLane.code}</span>
                  <select
                    value={bundleAccountId}
                    onChange={(e) => setBundleAccountId(e.target.value)}
                    disabled={bundleAccounts.length === 0}
                    className={`${INPUT} disabled:opacity-40`}
                  >
                    <option value="">
                      {bundleAccounts.length === 0 ? '— sin clientes en este lane —' : '— selecciona cliente / select client —'}
                    </option>
                    {bundleAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                        {a.country ? ` · ${a.country}` : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleCreateBundleQuote}
                  disabled={isBundling || !bundleAccountId}
                  className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
                >
                  Crear RFQ y cotización →
                </button>
              </div>
              <ul className="flex flex-col divide-y divide-line rounded-card border border-line">
                {selectedRows.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2">
                    <span className="font-ui text-t0 text-ink-primary">
                      {r.label || r.inputs.productName}
                      <span className="ml-2 font-mono text-label text-ink-secondary">{r.inputs.brand}</span>
                    </span>
                    <label className="flex items-center gap-2">
                      <span className={LABEL}>Cant. / Qty</span>
                      <input
                        type="number"
                        min={1}
                        step="1"
                        value={bundleQty[r.id] ?? 1}
                        onChange={(e) => setQty(r.id, Math.max(1, Number(e.target.value) || 1))}
                        data-numeric
                        className={`${INPUT} w-20`}
                      />
                    </label>
                  </li>
                ))}
              </ul>
            </>
          )}
          {bundleError ? (
            <p role="alert" className="font-ui text-t0 text-negative">
              {bundleError}
            </p>
          ) : null}
        </div>
      ) : null}

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
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAllFiltered}
                    aria-label="Seleccionar todos los filtrados / Select all filtered"
                    className="h-4 w-4 accent-lane-accent"
                  />
                </th>
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
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleOne(r.id)}
                      aria-label={`Seleccionar ${r.label || r.inputs.productName}`}
                      className="h-4 w-4 accent-lane-accent"
                    />
                  </td>
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
