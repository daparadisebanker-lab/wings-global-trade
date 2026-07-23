'use client'

// LandedCostEditor — the editable landed-cost surface (Phase E editor loop,
// hardened by Fable review). Change FOB, incoterm, margin, Ad Valorem, exchange
// rate, fuel or engine and the whole SUNAT chain recomputes instantly through the
// parity-validated engine (computeImportCost — no rate invented, no server round-
// trip), rendered by CostArtifact. Commits a real cost sheet via CostSheetSavePanel
// (saveCostCalculation, server-authoritative). Uses the shared editor-kit so the
// locale-hardened parseNum + Field are identical across every editor.
import { useMemo, useState } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { computeImportCost } from '@/lib/costing/engine'
import type { FuelType, ImportInputs, Incoterm } from '@/lib/costing/types'
import type { LandedCostData } from '@/lib/copilot/capabilities/landed-cost'
import { CostArtifact } from './CostArtifact'
import { CostSheetSavePanel } from './CostSheetSavePanel'
import { Field, fieldStyle, parseNum, usePersistOnUnmount } from './mister/editor-kit'
import { useArtifactDraft, useCanvasContext } from './mister/MisterProvider'
import { MISTER_ARTIFACT } from './mister-theme'

/** Persisted editor state (canvas working memory) — survives artifact remount. */
type LCSnap = {
  fob: string
  incoterm: Incoterm
  marginPct: string
  adValoremPct: string
  fuelType: FuelType
  engineCC: string
  exchangeRate: string
}

const { text: TEXT, muted: MUTED, panelBg: PANEL_BG, border: BORDER } = MISTER_ARTIFACT

const INCOTERMS: Incoterm[] = ['EXW', 'FOB', 'CFR', 'CIF']
const FUELS: { value: FuelType; label: { es: string; en: string } }[] = [
  { value: 'gasoline', label: { es: 'Gasolina', en: 'Gasoline' } },
  { value: 'diesel', label: { es: 'Diésel', en: 'Diesel' } },
  { value: 'hybrid', label: { es: 'Híbrido', en: 'Hybrid' } },
  { value: 'electric', label: { es: 'Eléctrico', en: 'Electric' } },
]

/** Seed a percent field at full precision, trimming only float noise (finding 3). */
function seedPct(fraction: number): string {
  return String(Math.round(fraction * 1e6) / 1e4)
}

export function LandedCostEditor({ result, locale = DEFAULT_LOCALE, seq }: { result: unknown; locale?: Locale; seq: number }) {
  const seed = (result as LandedCostData).input
  const { draft: d, persist } = useArtifactDraft<LCSnap>(String(seq))

  const [fob, setFob] = useState(d?.fob ?? (seed?.fob ? String(seed.fob) : ''))
  const [incoterm, setIncoterm] = useState<Incoterm>(d?.incoterm ?? seed?.incoterm ?? 'FOB')
  const [marginPct, setMarginPct] = useState(d?.marginPct ?? (seed ? seedPct(seed.marginPercent) : ''))
  const [adValoremPct, setAdValoremPct] = useState(d?.adValoremPct ?? (seed ? seedPct(seed.adValoremRate) : ''))
  const [fuelType, setFuelType] = useState<FuelType>(d?.fuelType ?? seed?.fuelType ?? 'gasoline')
  const [engineCC, setEngineCC] = useState(d?.engineCC ?? (seed?.engineCC ? String(seed.engineCC) : ''))
  const [exchangeRate, setExchangeRate] = useState(d?.exchangeRate ?? (seed?.exchangeRate ? String(seed.exchangeRate) : ''))

  usePersistOnUnmount<LCSnap>({ fob, incoterm, marginPct, adValoremPct, fuelType, engineCC, exchangeRate }, persist)

  const computed = useMemo(() => {
    if (!seed) return null
    const inputs: ImportInputs = {
      ...seed,
      fob: parseNum(fob) ?? seed.fob,
      incoterm,
      fuelType,
      // Server requires an integer engineCC (finding 4) — match the preview.
      engineCC: Math.round(parseNum(engineCC) ?? seed.engineCC),
      adValoremRate: (parseNum(adValoremPct) ?? seed.adValoremRate * 100) / 100,
      marginMode: 'percent',
      marginPercent: (parseNum(marginPct) ?? seed.marginPercent * 100) / 100,
      exchangeRate: parseNum(exchangeRate) || seed.exchangeRate,
    }
    const data: LandedCostData = {
      ...computeImportCost(inputs),
      currency: 'USD',
      incoterm: inputs.incoterm,
      productName: inputs.productName,
      input: inputs,
    }
    return { data, inputs }
  }, [seed, fob, incoterm, marginPct, adValoremPct, fuelType, engineCC, exchangeRate])

  // Feed the tuned inputs back into Mister so a chained ask inherits them (Part B).
  useCanvasContext(seq, computed ? { kind: 'costing', inputs: computed.inputs } : null)

  return (
    <div style={{ background: PANEL_BG, border: BORDER, borderRadius: 12, padding: '14px 16px', color: TEXT, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
        {t({ es: 'Costo de importación · editable', en: 'Landed cost · editable' }, locale)}
      </span>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Field label={`${incoterm} (USD)`}>
          <input inputMode="decimal" style={fieldStyle} value={fob} onChange={(e) => setFob(e.target.value)} placeholder={seed ? String(seed.fob) : '0'} />
        </Field>
        <Field label={t({ es: 'Incoterm', en: 'Incoterm' }, locale)}>
          <select style={{ ...fieldStyle, textAlign: 'left' }} value={incoterm} onChange={(e) => setIncoterm(e.target.value as Incoterm)}>
            {INCOTERMS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Field label={t({ es: 'Margen (%)', en: 'Margin (%)' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={marginPct} onChange={(e) => setMarginPct(e.target.value)} placeholder={seed ? seedPct(seed.marginPercent) : '0'} />
        </Field>
        <Field label={t({ es: 'Ad Valorem (%)', en: 'Ad Valorem (%)' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={adValoremPct} onChange={(e) => setAdValoremPct(e.target.value)} placeholder={seed ? seedPct(seed.adValoremRate) : '0'} />
        </Field>
        <Field label={t({ es: 'Tipo de cambio', en: 'Exchange rate' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} placeholder={seed ? String(seed.exchangeRate) : '3.70'} />
        </Field>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Field label={t({ es: 'Combustible', en: 'Fuel' }, locale)}>
          <select style={{ ...fieldStyle, textAlign: 'left' }} value={fuelType} onChange={(e) => setFuelType(e.target.value as FuelType)}>
            {FUELS.map((f) => (
              <option key={f.value} value={f.value}>
                {t(f.label, locale)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t({ es: 'Cilindrada (CC)', en: 'Engine (CC)' }, locale)}>
          <input inputMode="numeric" style={fieldStyle} value={engineCC} onChange={(e) => setEngineCC(e.target.value)} placeholder={seed?.engineCC ? String(seed.engineCC) : '—'} />
        </Field>
      </div>

      {computed ? (
        <>
          <CostArtifact result={computed.data} locale={locale} />
          <CostSheetSavePanel inputs={computed.inputs} locale={locale} draftKey={`${seq}:commit`} />
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 12.5, color: MUTED }}>
          {t({ es: 'Sin datos de entrada para recalcular.', en: 'No input data to recompute.' }, locale)}
        </p>
      )}
    </div>
  )
}
