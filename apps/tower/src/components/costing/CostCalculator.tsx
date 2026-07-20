'use client'

// Peru SUNAT cost calculator — the Costing module's hero surface. Inputs on the
// left, a LIVE preview waterfall on the right (the engine runs client-side for
// instant feedback), Save persists an append-only sheet (the server recomputes
// authoritatively). Standalone calculator mode; attach-to-container is a later
// wave. Rates are entered as percentages for the operator and converted to the
// engine's fractions.
import { useEffect, useMemo, useState, useTransition } from 'react'
import { computeImportCost, DEFAULT_INPUTS } from '@/lib/costing/engine'
import type { ImportInputs } from '@/lib/costing/types'
import {
  getCostingReference,
  listCostingContainers,
  saveCostCalculation,
  type CostCalculationRow,
  type CostingContainer,
  type CostingLane,
  type CostingReference,
} from '@/lib/actions/costing'
import { resolveAdValoremRate } from '@/lib/costing/ad-valorem'
import { exportCostSheetXlsx } from './export'
import { CostWaterfall } from './CostWaterfall'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT =
  'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'

function money(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Num({
  label,
  value,
  onChange,
  step = 'any',
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: string
  hint?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={LABEL}>
        {label}
        {hint ? <span className="ml-1 lowercase text-ink-secondary">· {hint}</span> : null}
      </span>
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        data-numeric
        className={`w-full ${INPUT}`}
      />
    </label>
  )
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className={LABEL}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${INPUT} font-ui`} />
    </label>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2 rounded-card border border-line bg-surface-1 p-3">
      <legend className="px-1 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">{title}</legend>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </fieldset>
  )
}

export function CostCalculator({
  lanes,
  initialHistory,
}: {
  lanes: CostingLane[]
  initialHistory: CostCalculationRow[]
}) {
  const [inputs, setInputs] = useState<ImportInputs>(DEFAULT_INPUTS)
  const [laneId, setLaneId] = useState(lanes[0]?.id ?? '')
  const [label, setLabel] = useState('')
  const [hsCode, setHsCode] = useState('')
  const [reference, setReference] = useState<CostingReference | null>(null)
  const [containers, setContainers] = useState<CostingContainer[]>([])
  const [containerId, setContainerId] = useState('')
  const [history, setHistory] = useState(initialHistory)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Config-sourced rate defaults per lane's brand (G5): IGV / percepción /
  // insurance come from versioned costing_config; the Ad Valorem table is used
  // to resolve a rate from the HS code. Applied on lane change; the operator can
  // still override any rate for a one-off.
  useEffect(() => {
    if (!laneId) return
    let active = true
    getCostingReference(laneId).then((res) => {
      if (!active || res.error) return
      setReference(res.data)
      setInputs((p) => ({
        ...p,
        igvRate: res.data.igvRate,
        percepcionRate: res.data.percepcionRate,
        insuranceRate: res.data.insuranceRate,
        adValoremRate: resolveAdValoremRate(res.data.adValoremRates, hsCode),
      }))
    })
    setContainerId('')
    listCostingContainers(laneId).then((res) => {
      if (active && res.data) setContainers(res.data)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laneId])

  function reopen(row: CostCalculationRow) {
    setInputs(row.inputs)
    setLabel(row.label ?? '')
    setSaved(null)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function applyHsCode(code: string) {
    setHsCode(code)
    if (reference) set('adValoremRate', resolveAdValoremRate(reference.adValoremRates, code))
  }

  const preview = useMemo(() => {
    try {
      return computeImportCost(inputs)
    } catch {
      return null
    }
  }, [inputs])

  function set<K extends keyof ImportInputs>(key: K, value: ImportInputs[K]) {
    setInputs((p) => ({ ...p, [key]: value }))
    setSaved(null)
  }

  function handleSave() {
    if (!laneId) {
      setError('Selecciona un lane / Select a lane')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await saveCostCalculation({
        laneId,
        containerId: containerId || null,
        label: label.trim() || null,
        inputs,
      })
      if (result.error) {
        setError(result.error.message)
        return
      }
      setHistory((h) => [result.data, ...h])
      setSaved(result.data.id)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,420px)_1fr]">
        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <Group title="Identidad">
            <Text label="Producto" value={inputs.productName} onChange={(v) => set('productName', v)} />
            <Text label="Marca" value={inputs.brand} onChange={(v) => set('brand', v)} />
            <Text label="Modelo" value={inputs.model} onChange={(v) => set('model', v)} />
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Combustible</span>
              <select
                value={inputs.fuelType}
                onChange={(e) => set('fuelType', e.target.value as ImportInputs['fuelType'])}
                className={INPUT}
              >
                <option value="gasoline">gasoline</option>
                <option value="diesel">diesel</option>
                <option value="hybrid">hybrid</option>
                <option value="electric">electric</option>
              </select>
            </label>
            <Num label="Cilindrada CC" value={inputs.engineCC} onChange={(v) => set('engineCC', v)} step="1" />
            <Num label="Año" value={inputs.year} onChange={(v) => set('year', v)} step="1" />
          </Group>

          <Group title="Valores">
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Incoterm</span>
              <select
                value={inputs.incoterm}
                onChange={(e) => set('incoterm', e.target.value as ImportInputs['incoterm'])}
                className={INPUT}
              >
                <option value="EXW">EXW</option>
                <option value="FOB">FOB</option>
                <option value="CFR">CFR</option>
                <option value="CIF">CIF</option>
              </select>
            </label>
            <Num label="FOB / valor" value={inputs.fob} onChange={(v) => set('fob', v)} />
            <Num
              label="Transporte origen"
              hint="solo EXW"
              value={inputs.transportOrigin}
              onChange={(v) => set('transportOrigin', v)}
            />
            <Num
              label="Flete internacional"
              hint="EXW/FOB"
              value={inputs.freightInternational}
              onChange={(v) => set('freightInternational', v)}
            />
          </Group>

          <Group title="Gastos locales">
            <Num label="Flete Zofratacna" value={inputs.freightZofratacna} onChange={(v) => set('freightZofratacna', v)} />
            <Num label="Gastos portuarios" value={inputs.portExpenses} onChange={(v) => set('portExpenses', v)} />
            <Num label="Agencia de aduanas" value={inputs.customsAgency} onChange={(v) => set('customsAgency', v)} />
            <Num label="Manipuleo / estiba" value={inputs.handlingStowage} onChange={(v) => set('handlingStowage', v)} />
          </Group>

          <Group title="Tasas (%)">
            <Text label="HS code → Ad Valorem" value={hsCode} onChange={applyHsCode} />
            <Num label="Ad Valorem" value={inputs.adValoremRate * 100} onChange={(v) => set('adValoremRate', v / 100)} />
            <Num label="IGV" value={inputs.igvRate * 100} onChange={(v) => set('igvRate', v / 100)} />
            <Num label="Percepción" value={inputs.percepcionRate * 100} onChange={(v) => set('percepcionRate', v / 100)} />
            <Num label="Seguro" value={inputs.insuranceRate * 100} onChange={(v) => set('insuranceRate', v / 100)} />
            <Num label="Tipo de cambio" hint="PEN/USD" value={inputs.exchangeRate} onChange={(v) => set('exchangeRate', v)} />
          </Group>

          <Group title="Margen">
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Modo</span>
              <select
                value={inputs.marginMode}
                onChange={(e) => set('marginMode', e.target.value as ImportInputs['marginMode'])}
                className={INPUT}
              >
                <option value="percent">percent</option>
                <option value="target_price">target_price</option>
              </select>
            </label>
            {inputs.marginMode === 'percent' ? (
              <Num label="Margen %" value={inputs.marginPercent * 100} onChange={(v) => set('marginPercent', v / 100)} />
            ) : (
              <Num label="Precio objetivo" value={inputs.targetSalePrice} onChange={(v) => set('targetSalePrice', v)} />
            )}
          </Group>
        </div>

        {/* Preview + save */}
        <div className="flex flex-col gap-4">
          {preview ? (
            <CostWaterfall result={preview} />
          ) : (
            <p className="font-ui text-t0 text-ink-secondary">Revisa los valores para ver el cálculo.</p>
          )}

          <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface-1 p-4">
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Lane</span>
              <select value={laneId} onChange={(e) => setLaneId(e.target.value)} className={INPUT}>
                {lanes.length === 0 ? <option value="">— sin acceso —</option> : null}
                {lanes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} · {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Contenedor</span>
              <select value={containerId} onChange={(e) => setContainerId(e.target.value)} className={INPUT}>
                <option value="">— sin contenedor —</option>
                {containers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.status}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className={LABEL}>Etiqueta / Label</span>
              <input value={label} onChange={(e) => setLabel(e.target.value)} className={`${INPUT} font-ui`} />
            </label>
            <button
              type="button"
              onClick={() => preview && void exportCostSheetXlsx(inputs, preview, label)}
              disabled={!preview}
              className="rounded-card border border-line px-3 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-primary hover:border-lane-accent disabled:opacity-40"
            >
              Exportar XLSX ↓
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !preview}
              className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
            >
              Guardar cálculo / Save
            </button>
            {saved ? <span className="font-mono text-label uppercase tracking-[0.08em] text-positive">Guardado</span> : null}
          </div>
          {error ? (
            <p role="alert" className="font-ui text-t0 text-negative">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      {/* History */}
      <section className="flex flex-col gap-2">
        <h3 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Historial / Saved calculations
        </h3>
        {history.length === 0 ? (
          <p className="font-ui text-t0 text-ink-secondary">Sin cálculos guardados / No saved calculations.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-card border border-line">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
                <button
                  type="button"
                  onClick={() => reopen(h)}
                  title="Reabrir en la calculadora / Re-open in the calculator"
                  className="text-left font-ui text-t0 text-ink-primary hover:text-lane-accent"
                >
                  {h.label || h.inputs.productName || h.inputs.brand || 'Cálculo'}
                  <span className="ml-2 font-mono text-label text-ink-secondary">{h.incoterm}</span>
                </button>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-t0 tabular-nums text-ink-secondary" data-numeric>
                    landed {money(h.landedMinor / 100)} · venta {money(h.salePriceMinor / 100)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void exportCostSheetXlsx(h.inputs, h.result, h.label)}
                    className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-lane-accent"
                    title="Re-exportar XLSX / Re-export XLSX"
                  >
                    XLSX ↓
                  </button>
                  <a
                    href={`/cost-sheet/${h.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-lane-accent"
                    title="Hoja imprimible / Printable sheet (PDF)"
                  >
                    PDF ↗
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
