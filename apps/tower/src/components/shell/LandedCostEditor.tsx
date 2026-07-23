'use client'

// LandedCostEditor — the editable landed-cost surface (Phase E, editors batch).
// The thread shows the read-only SUNAT chain; the canvas serves THIS: change the
// FOB, incoterm, margin, Ad Valorem, fuel or engine and the whole chain (CIF →
// Ad Valorem → ISC → IGV → landed → margin → sale price) recomputes instantly
// through the SAME parity-validated engine (computeImportCost — no rate invented,
// no server round-trip). Rendered through the existing CostArtifact. There is no
// persistence seam for a standalone landed cost yet (unlike quotes), so the commit
// here is a hand-off into the full Costing calculator; the rail also links there.
import { useMemo, useState } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { computeImportCost } from '@/lib/costing/engine'
import type { FuelType, ImportInputs, Incoterm } from '@/lib/costing/types'
import type { LandedCostData } from '@/lib/copilot/capabilities/landed-cost'
import { CostArtifact } from './CostArtifact'
import { MISTER_ARTIFACT } from './mister-theme'

const { text: TEXT, muted: MUTED, gold: GOLD, panelBg: PANEL_BG, fieldBg: FIELD_BG, border: BORDER, mono: MONO } = MISTER_ARTIFACT

const INCOTERMS: Incoterm[] = ['EXW', 'FOB', 'CFR', 'CIF']
const FUELS: { value: FuelType; label: { es: string; en: string } }[] = [
  { value: 'gasoline', label: { es: 'Gasolina', en: 'Gasoline' } },
  { value: 'diesel', label: { es: 'Diésel', en: 'Diesel' } },
  { value: 'hybrid', label: { es: 'Híbrido', en: 'Hybrid' } },
  { value: 'electric', label: { es: 'Eléctrico', en: 'Electric' } },
]

/** Parse a positive decimal; blank/invalid → null (fall back to the seed value). */
function parseNum(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  if (cleaned === '' || cleaned === '.') return null
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : null
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: FIELD_BG,
  color: TEXT,
  border: BORDER,
  borderRadius: 8,
  padding: '7px 9px',
  fontFamily: MONO,
  fontSize: 13,
  textAlign: 'right',
  WebkitAppearance: 'none',
  appearance: 'none',
}
const labelStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 9.5,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: MUTED,
}
const linkStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: GOLD,
  textDecoration: 'none',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  )
}

export function LandedCostEditor({ result, locale = DEFAULT_LOCALE }: { result: unknown; locale?: Locale }) {
  const seed = (result as LandedCostData).input

  const [fob, setFob] = useState(seed?.fob ? String(seed.fob) : '')
  const [incoterm, setIncoterm] = useState<Incoterm>(seed?.incoterm ?? 'FOB')
  const [marginPct, setMarginPct] = useState(seed ? String(Math.round(seed.marginPercent * 1000) / 10) : '')
  const [adValoremPct, setAdValoremPct] = useState(seed ? String(Math.round(seed.adValoremRate * 1000) / 10) : '')
  const [fuelType, setFuelType] = useState<FuelType>(seed?.fuelType ?? 'gasoline')
  const [engineCC, setEngineCC] = useState(seed?.engineCC ? String(seed.engineCC) : '')
  const [exchangeRate, setExchangeRate] = useState(seed?.exchangeRate ? String(seed.exchangeRate) : '')

  const data = useMemo<LandedCostData | null>(() => {
    if (!seed) return null
    const inputs: ImportInputs = {
      ...seed,
      fob: parseNum(fob) ?? seed.fob,
      incoterm,
      fuelType,
      engineCC: parseNum(engineCC) ?? seed.engineCC,
      adValoremRate: (parseNum(adValoremPct) ?? seed.adValoremRate * 100) / 100,
      marginMode: 'percent',
      marginPercent: (parseNum(marginPct) ?? seed.marginPercent * 100) / 100,
      exchangeRate: parseNum(exchangeRate) || seed.exchangeRate,
    }
    return {
      ...computeImportCost(inputs),
      currency: 'USD',
      incoterm: inputs.incoterm,
      productName: inputs.productName,
      input: inputs,
    }
  }, [seed, fob, incoterm, marginPct, adValoremPct, fuelType, engineCC, exchangeRate])

  return (
    <div style={{ background: PANEL_BG, border: BORDER, borderRadius: 12, padding: '14px 16px', color: TEXT, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
        {t({ es: 'Costo de importación · editable', en: 'Landed cost · editable' }, locale)}
      </span>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Field label={`${incoterm} (USD)`}>
          <input inputMode="decimal" style={fieldStyle} value={fob} onChange={(e) => setFob(e.target.value)} placeholder="0" />
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
          <input inputMode="decimal" style={fieldStyle} value={marginPct} onChange={(e) => setMarginPct(e.target.value)} placeholder="0" />
        </Field>
        <Field label={t({ es: 'Ad Valorem (%)', en: 'Ad Valorem (%)' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={adValoremPct} onChange={(e) => setAdValoremPct(e.target.value)} placeholder="0" />
        </Field>
        <Field label={t({ es: 'Tipo de cambio', en: 'Exchange rate' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} placeholder="3.70" />
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
          <input inputMode="numeric" style={fieldStyle} value={engineCC} onChange={(e) => setEngineCC(e.target.value)} placeholder="—" />
        </Field>
      </div>

      {data ? (
        <CostArtifact result={data} locale={locale} />
      ) : (
        <p style={{ margin: 0, fontSize: 12.5, color: MUTED }}>
          {t({ es: 'Sin datos de entrada para recalcular.', en: 'No input data to recompute.' }, locale)}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <a href="/costing" style={linkStyle}>
          {t({ es: 'Abrir en Costeo →', en: 'Open in Costing →' }, locale)}
        </a>
      </div>
    </div>
  )
}
