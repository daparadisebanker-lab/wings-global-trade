'use client'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { calculate, DEFAULT_INPUTS, fmt, fmtPct } from '@/lib/import-calculator'
import type { ImportInputs, ImportResult } from '@/lib/import-calculator'

interface HistoryRecord {
  id: string
  timestamp: string
  inputs: ImportInputs
  result: ImportResult
}

export default function FinancialEnginePage() {
  const [inputs, setInputs] = useState<ImportInputs>(DEFAULT_INPUTS)
  const [result, setResult] = useState<ImportResult>(() => calculate(DEFAULT_INPUTS))
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('wings_financial_history')
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
  }, [])

  const update = useCallback((patch: Partial<ImportInputs>) => {
    setInputs((prev) => {
      const next = { ...prev, ...patch }
      setResult(calculate(next))
      return next
    })
    setSaved(false)
  }, [])

  function saveRecord() {
    const record: HistoryRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      inputs,
      result,
    }
    const updated = [record, ...history].slice(0, 50)
    setHistory(updated)
    localStorage.setItem('wings_financial_history', JSON.stringify(updated))
    setSaved(true)
  }

  function deleteRecord(id: string) {
    const updated = history.filter((r) => r.id !== id)
    setHistory(updated)
    localStorage.setItem('wings_financial_history', JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">Admin</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600">Financial Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Engine</h1>
          <p className="text-sm text-gray-500 mt-1">
            SUNAT import cost cascade — FOB → CIF → Landed Cost → Cash Outlay
          </p>
        </div>
        <button
          onClick={saveRecord}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            saved
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-[#001E50] text-white hover:bg-[#002870]'
          }`}
        >
          {saved ? '✓ Saved to History' : 'Save Calculation'}
        </button>
      </div>

      {/* Calculator + Cascade */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Inputs */}
        <div className="space-y-4">
          {/* Product */}
          <Card title="Product">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Brand">
                <TextInput value={inputs.brand} onChange={(v) => update({ brand: v })} placeholder="New Holland" />
              </Field>
              <Field label="Model">
                <TextInput value={inputs.model} onChange={(v) => update({ model: v })} placeholder="SH504" />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Field label="Fuel Type">
                <SelectInput
                  value={inputs.fuelType}
                  options={[
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'gasoline', label: 'Gasoline' },
                    { value: 'diesel', label: 'Diesel' },
                  ]}
                  onChange={(v) => update({ fuelType: v as ImportInputs['fuelType'] })}
                />
              </Field>
              <Field label="Engine CC">
                <NumInput value={inputs.engineCC} onChange={(v) => update({ engineCC: v })} />
              </Field>
              <Field label="Origin">
                <SelectInput
                  value={inputs.origin}
                  options={[
                    { value: 'china', label: 'China (0%)' },
                    { value: 'other', label: 'Other (6%)' },
                  ]}
                  onChange={(v) => {
                    const origin = v as ImportInputs['origin']
                    update({ origin, adValoremRate: origin === 'china' ? 0 : 0.06 })
                  }}
                />
              </Field>
            </div>
          </Card>

          {/* FOB & Freight */}
          <Card title="FOB & Freight">
            <div className="grid grid-cols-3 gap-4">
              <Field label="FOB (USD)">
                <NumInput value={inputs.fob} onChange={(v) => update({ fob: v })} prefix="$" />
              </Field>
              <Field label="Int'l Freight">
                <NumInput value={inputs.freightInternational} onChange={(v) => update({ freightInternational: v })} prefix="$" />
              </Field>
              <Field label="Zofratacna">
                <NumInput value={inputs.freightZofratacna} onChange={(v) => update({ freightZofratacna: v })} prefix="$" />
              </Field>
            </div>
          </Card>

          {/* Local Expenses */}
          <Card title="Local Expenses">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Port (USD)">
                <NumInput value={inputs.portExpenses} onChange={(v) => update({ portExpenses: v })} prefix="$" />
              </Field>
              <Field label="Agency (USD)">
                <NumInput value={inputs.customsAgency} onChange={(v) => update({ customsAgency: v })} prefix="$" />
              </Field>
              <Field label="Handling">
                <NumInput value={inputs.handlingStowage} onChange={(v) => update({ handlingStowage: v })} prefix="$" />
              </Field>
            </div>
          </Card>

          {/* Margin */}
          <Card title="Margin">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Mode">
                <SelectInput
                  value={inputs.marginMode}
                  options={[
                    { value: 'percent', label: 'By Percentage' },
                    { value: 'target_price', label: 'By Target Price' },
                  ]}
                  onChange={(v) => update({ marginMode: v as ImportInputs['marginMode'] })}
                />
              </Field>
              {inputs.marginMode === 'percent' ? (
                <Field label="Margin % (min 5% / $1k)">
                  <NumInput value={inputs.marginPercent * 100} onChange={(v) => update({ marginPercent: v / 100 })} suffix="%" />
                </Field>
              ) : (
                <Field label="Target Sale Price (incl. IGV)">
                  <NumInput value={inputs.targetSalePrice} onChange={(v) => update({ targetSalePrice: v })} prefix="$" />
                </Field>
              )}
            </div>
          </Card>

          {/* Exchange Rate */}
          <Card title="Exchange Rate">
            <div className="grid grid-cols-2 gap-4">
              <Field label="PEN / USD">
                <NumInput value={inputs.exchangeRate} onChange={(v) => update({ exchangeRate: v })} step={0.01} />
              </Field>
              <div className="flex items-end pb-0.5">
                <p className="text-xs text-gray-400">
                  IGV net payable: <span className="font-mono font-medium text-gray-700">S/ {fmt(result.igvNetPayable)}</span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Cost Cascade */}
        <div className="space-y-4">
          {/* Cascade */}
          <Card title="Cost Cascade">
            <div className="space-y-0.5">
              <CRow label="FOB" value={`$${fmt(inputs.fob)}`} />
              <CRow label={`Insurance (${fmtPct(inputs.insuranceRate)})`} value={`$${fmt(result.insurance)}`} indent />
              <CRow label="Int'l Freight" value={`$${fmt(inputs.freightInternational)}`} indent />
              <div className="pt-2 border-t border-gray-100">
                <CRow label="CIF" value={`$${fmt(result.cif)}`} bold />
              </div>
              <CRow label={`Ad Valorem (${fmtPct(inputs.adValoremRate)})`} value={`$${fmt(result.adValorem)}`} indent faded={result.adValorem === 0} />
              <CRow label={`ISC (${fmtPct(result.iscRate)})`} value={`$${fmt(result.isc)}`} indent faded={result.isc === 0} />
              <CRow label="Gastos Vinculados" value={`$${fmt(result.gastosVinculados)}`} indent />
              <div className="pt-2 border-t border-gray-100">
                <CRow label="Landed Cost" value={`$${fmt(result.landedCost)}`} bold navy />
              </div>
              <div className="pt-2 border-t border-gray-100">
                <CRow label={`IGV Importación (${fmtPct(inputs.igvRate)}) ↻`} value={`$${fmt(result.igvImportacion)}`} recoverable />
                <CRow label={`Percepción IGV (${fmtPct(inputs.percepcionRate)}) ↻`} value={`$${fmt(result.percepcion)}`} recoverable />
              </div>
              <div className="pt-2 border-t border-gray-100">
                <CRow label="Cash Outlay" value={`$${fmt(result.cashOutlay)}`} bold gold />
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              ↻ recoverable advance — offset against IGV ventas at sale
            </p>
          </Card>

          {/* Sale Price */}
          <Card title="Sale Price">
            <div className="space-y-0.5">
              <CRow label="Landed Cost" value={`$${fmt(result.landedCost)}`} />
              <CRow label={`Margin (${fmtPct(result.marginRate)})`} value={`+$${fmt(result.marginUSD)}`} indent green />
              <div className="pt-2 border-t border-gray-100">
                <CRow label="Sale Price (ex-IGV)" value={`$${fmt(result.salePrice)}`} bold />
              </div>
              <CRow label={`IGV Ventas (${fmtPct(inputs.igvRate)})`} value={`+$${fmt(result.igvVentas)}`} indent />
              <div className="pt-2 border-t border-gray-100">
                <CRow label="Final Price (incl. IGV)" value={`$${fmt(result.salePriceFinal)}`} bold green />
              </div>
            </div>
          </Card>

          {/* Key metrics summary */}
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Landed Cost" value={`$${fmt(result.landedCost)}`} color="text-[#001E50]" />
            <Metric label="Cash Outlay" value={`$${fmt(result.cashOutlay)}`} color="text-[#C4933F]" />
            <Metric label="Margin" value={fmtPct(result.marginRate)} color="text-green-700" />
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Calculation History</h2>
            <button
              onClick={() => {
                setHistory([])
                localStorage.removeItem('wings_financial_history')
              }}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Date', 'Product', 'FOB', 'Landed Cost', 'Cash Outlay', 'Margin', 'Sale Price', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {history.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.inputs.brand} {r.inputs.model}</td>
                    <td className="px-4 py-3 font-mono text-gray-500">${fmt(r.inputs.fob)}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-[#001E50]">${fmt(r.result.landedCost)}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-[#C4933F]">${fmt(r.result.cashOutlay)}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">{fmtPct(r.result.marginRate)}</td>
                    <td className="px-4 py-3 font-mono text-gray-500">${fmt(r.result.salePriceFinal)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteRecord(r.id)} className="text-xs text-gray-300 hover:text-red-500 transition-colors">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Primitives ──────────────────────────────────────────────────────────── */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#004389] focus:border-transparent transition"

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
}

function NumInput({ value, onChange, prefix, suffix, step = 1 }: { value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; step?: number }) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none">{prefix}</span>}
      <input
        type="number"
        step={step}
        className={`${inputCls} ${prefix ? 'pl-6' : ''} ${suffix ? 'pr-8' : ''}`}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
      {suffix && <span className="absolute right-3 top-2 text-sm text-gray-400 pointer-events-none">{suffix}</span>}
    </div>
  )
}

function SelectInput({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <select className={`${inputCls} cursor-pointer`} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function CRow({
  label, value, bold, indent, faded, navy, gold, green, recoverable,
}: {
  label: string; value: string; bold?: boolean; indent?: boolean; faded?: boolean;
  navy?: boolean; gold?: boolean; green?: boolean; recoverable?: boolean;
}) {
  const valueColor = navy ? 'text-[#001E50]' : gold ? 'text-[#C4933F]' : green ? 'text-green-700' : recoverable ? 'text-[#C4933F]' : 'text-gray-800'
  const labelColor = faded ? 'text-gray-300' : recoverable ? 'text-amber-500' : 'text-gray-500'
  return (
    <div className={`flex justify-between items-center py-1.5 ${indent ? 'pl-4' : ''}`}>
      <span className={`text-xs ${labelColor}`}>{label}</span>
      <span className={`text-sm font-mono ${bold ? 'font-bold' : ''} ${valueColor}`}>{value}</span>
    </div>
  )
}
