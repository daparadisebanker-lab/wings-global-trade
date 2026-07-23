'use client'

// ReverseQuoteEditor — the editable reverse-quote surface (Phase E, editors
// batch, round 1). The thread shows the read-only solve; the canvas serves THIS:
// change the target margin, its kind (gross / net-cash), the cost basis, incoterm,
// fuel or engine, and the sale price RE-SOLVES instantly through the same pure,
// engine-authoritative solver (solveSalePriceForMargin — bisection on the SUNAT
// engine, no number faked, no server). Renders through the existing
// ReverseQuoteArtifact. Commit reuses the cost-sheet seam: the solved price is
// reproduced as ImportInputs (gross → marginPercent; net-cash → target price) and
// persisted via CostSheetSavePanel → saveCostCalculation.
import { useMemo, useState } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { FuelType, ImportInputs, Incoterm } from '@/lib/costing/types'
import {
  solveSalePriceForMargin,
  MARGIN_TOLERANCE,
  type MarginKind,
  type ReverseQuoteData,
} from '@/lib/copilot/capabilities/reverse-quote'
import { ReverseQuoteArtifact } from './ReverseQuoteArtifact'
import { CostSheetSavePanel } from './CostSheetSavePanel'
import { MISTER_ARTIFACT } from './mister-theme'

const { text: TEXT, muted: MUTED, gold: GOLD, panelBg: PANEL_BG, fieldBg: FIELD_BG, border: BORDER, mono: MONO } = MISTER_ARTIFACT

const INCOTERMS: Incoterm[] = ['EXW', 'FOB', 'CFR', 'CIF']
const FUELS: { value: FuelType; label: { es: string; en: string } }[] = [
  { value: 'gasoline', label: { es: 'Gasolina', en: 'Gasoline' } },
  { value: 'diesel', label: { es: 'Diésel', en: 'Diesel' } },
  { value: 'hybrid', label: { es: 'Híbrido', en: 'Hybrid' } },
  { value: 'electric', label: { es: 'Eléctrico', en: 'Electric' } },
]
const KINDS: { value: MarginKind; label: { es: string; en: string } }[] = [
  { value: 'bruto', label: { es: 'Bruto', en: 'Gross' } },
  { value: 'neto_caja', label: { es: 'Neto de caja', en: 'Net-cash' } },
]

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  )
}

export function ReverseQuoteEditor({ result, locale = DEFAULT_LOCALE }: { result: unknown; locale?: Locale }) {
  const payload = result as ReverseQuoteData
  const seed = payload.input

  const [fob, setFob] = useState(payload.fob ? String(payload.fob) : '')
  const [incoterm, setIncoterm] = useState<Incoterm>(payload.incoterm ?? 'FOB')
  const [marginKind, setMarginKind] = useState<MarginKind>(payload.marginKind ?? 'bruto')
  const [targetPctInput, setTargetPctInput] = useState(String(Math.round(payload.targetPct * 1000) / 10))
  const [fuelType, setFuelType] = useState<FuelType>(seed?.fuelType ?? 'gasoline')
  const [engineCC, setEngineCC] = useState(seed?.engineCC ? String(seed.engineCC) : '')

  const solved = useMemo(() => {
    if (!seed) return null
    const targetPct = (parseNum(targetPctInput) ?? payload.targetPct * 100) / 100
    const baseInputs: ImportInputs = {
      ...seed,
      fob: parseNum(fob) ?? seed.fob,
      incoterm,
      fuelType,
      engineCC: parseNum(engineCC) ?? seed.engineCC,
    }
    const solution = solveSalePriceForMargin(baseInputs, marginKind, targetPct)
    const data: ReverseQuoteData = {
      marginKind,
      targetPct,
      achievedPct: solution.achievedPct,
      onTarget: Math.abs(solution.achievedPct - targetPct) <= MARGIN_TOLERANCE,
      salePrice: solution.salePrice,
      landedCost: solution.result.landedCost,
      cashOutlay: solution.result.cashOutlay,
      fob: baseInputs.fob,
      incoterm,
      input: baseInputs,
    }
    // Reproduce the solved price as concrete inputs so a saved cost sheet lands
    // on exactly the price shown: gross is a native margin input; net-cash pins
    // the target sale price the bisection converged to.
    const commitInputs: ImportInputs =
      marginKind === 'bruto'
        ? { ...baseInputs, marginMode: 'percent', marginPercent: targetPct }
        : { ...baseInputs, marginMode: 'target_price', targetSalePrice: solution.salePrice }
    return { data, commitInputs }
  }, [seed, fob, incoterm, marginKind, targetPctInput, fuelType, engineCC, payload.targetPct])

  return (
    <div style={{ background: PANEL_BG, border: BORDER, borderRadius: 12, padding: '14px 16px', color: TEXT, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
        {t({ es: 'Precio de venta · editable', en: 'Reverse quote · editable' }, locale)}
      </span>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Field label={t({ es: 'Margen objetivo (%)', en: 'Target margin (%)' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={targetPctInput} onChange={(e) => setTargetPctInput(e.target.value)} placeholder="0" />
        </Field>
        <Field label={t({ es: 'Tipo de margen', en: 'Margin kind' }, locale)}>
          <select style={{ ...fieldStyle, textAlign: 'left' }} value={marginKind} onChange={(e) => setMarginKind(e.target.value as MarginKind)}>
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {t(k.label, locale)}
              </option>
            ))}
          </select>
        </Field>
      </div>

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

      {solved ? (
        <>
          <ReverseQuoteArtifact result={solved.data} locale={locale} />
          <CostSheetSavePanel inputs={solved.commitInputs} locale={locale} />
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 12.5, color: MUTED }}>
          {t({ es: 'Sin datos de entrada para re-resolver.', en: 'No input data to re-solve.' }, locale)}
        </p>
      )}
    </div>
  )
}
