'use client'

// ReverseQuoteEditor — the editable reverse-quote surface (Phase E editor loop,
// round 1, hardened by Fable review). Change the target margin + kind, cost basis,
// incoterm, Ad Valorem, exchange rate, fuel and engine; the sale price re-solves
// instantly through the pure, engine-authoritative solveReverseQuote (bisection on
// the SUNAT engine — imported from a CLIENT-SAFE module, not the capability's LLM
// graph). Renders through the existing ReverseQuoteArtifact. Commit reuses the
// cost-sheet seam: solveReverseQuote returns the exact ImportInputs that reproduce
// the displayed price, so the saved sheet never drifts from what's on screen.
import { useMemo, useState } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { FuelType, ImportInputs, Incoterm } from '@/lib/costing/types'
import { solveReverseQuote, type MarginKind, type ReverseQuoteData } from '@/lib/copilot/reverse-quote-solve'
import { ReverseQuoteArtifact } from './ReverseQuoteArtifact'
import { CostSheetSavePanel } from './CostSheetSavePanel'
import { Field, fieldStyle, parseNum, usePersistOnUnmount } from './mister/editor-kit'
import { useArtifactDraft, useCanvasContext } from './mister/MisterProvider'
import { MISTER_ARTIFACT } from './mister-theme'

/** Persisted editor state (canvas working memory) — survives artifact remount. */
type RQSnap = {
  fob: string
  incoterm: Incoterm
  marginKind: MarginKind
  targetPctInput: string
  adValoremPct: string
  exchangeRate: string
  fuelType: FuelType
  engineCC: string
}

const { muted: MUTED, panelBg: PANEL_BG, border: BORDER } = MISTER_ARTIFACT

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

/** Server (saveCostCalculation) caps marginPercent at 10 (1000%). */
const MAX_GROSS_TARGET = 10

const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

/** Seed a percent field at full precision, trimming only float noise (finding 3). */
function seedPct(fraction: number): string {
  return String(Math.round(fraction * 1e6) / 1e4)
}
const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pctStr = (f: number) => `${(f * 100).toFixed(1)}%`

export function ReverseQuoteEditor({ result, locale = DEFAULT_LOCALE, seq }: { result: unknown; locale?: Locale; seq: number }) {
  const payload = result as ReverseQuoteData
  const seed = payload.input
  const { draft: d, persist } = useArtifactDraft<RQSnap>(String(seq))

  const [fob, setFob] = useState(d?.fob ?? (payload.fob ? String(payload.fob) : ''))
  const [incoterm, setIncoterm] = useState<Incoterm>(d?.incoterm ?? payload.incoterm ?? 'FOB')
  const [marginKind, setMarginKind] = useState<MarginKind>(d?.marginKind ?? payload.marginKind ?? 'bruto')
  const [targetPctInput, setTargetPctInput] = useState(d?.targetPctInput ?? seedPct(payload.targetPct ?? 0))
  const [adValoremPct, setAdValoremPct] = useState(d?.adValoremPct ?? (seed ? seedPct(seed.adValoremRate) : ''))
  const [exchangeRate, setExchangeRate] = useState(d?.exchangeRate ?? (seed?.exchangeRate ? String(seed.exchangeRate) : ''))
  const [fuelType, setFuelType] = useState<FuelType>(d?.fuelType ?? seed?.fuelType ?? 'gasoline')
  const [engineCC, setEngineCC] = useState(d?.engineCC ?? (seed?.engineCC ? String(seed.engineCC) : ''))

  usePersistOnUnmount<RQSnap>({ fob, incoterm, marginKind, targetPctInput, adValoremPct, exchangeRate, fuelType, engineCC }, persist)

  const solved = useMemo(() => {
    if (!seed) return null
    const targetPct = (parseNum(targetPctInput) ?? (payload.targetPct ?? 0) * 100) / 100
    const baseInputs: ImportInputs = {
      ...seed,
      fob: parseNum(fob) ?? seed.fob,
      incoterm,
      fuelType,
      // The server requires an integer engineCC (finding 4) — match the preview.
      engineCC: Math.round(parseNum(engineCC) ?? seed.engineCC),
      adValoremRate: (parseNum(adValoremPct) ?? seed.adValoremRate * 100) / 100,
      exchangeRate: parseNum(exchangeRate) || seed.exchangeRate,
    }
    const { data, commitInputs } = solveReverseQuote(baseInputs, marginKind, targetPct)
    const overCap = marginKind === 'bruto' && targetPct > MAX_GROSS_TARGET
    return { data, commitInputs, targetPct, overCap }
  }, [seed, fob, incoterm, marginKind, targetPctInput, adValoremPct, exchangeRate, fuelType, engineCC, payload.targetPct])

  // Feed the tuned inputs back into Mister so a chained ask inherits them (Part B).
  // commitInputs pins the margin (gross → marginPercent), so the target travels too.
  useCanvasContext(seq, solved ? { kind: 'costing', inputs: solved.commitInputs, sourceSeq: seq } : null)

  return (
    <div style={{ background: PANEL_BG, border: BORDER, borderRadius: 12, padding: '14px 16px', color: MISTER_ARTIFACT.text, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
        {t({ es: 'Precio de venta · editable', en: 'Sale price · editable' }, locale)}
      </span>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Field label={t({ es: 'Margen objetivo (%)', en: 'Target margin (%)' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={targetPctInput} onChange={(e) => setTargetPctInput(e.target.value)} placeholder={seedPct(payload.targetPct ?? 0)} />
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

      {solved ? (
        <>
          <ReverseQuoteArtifact result={solved.data} locale={locale} />
          {/* Announce the newly-solved price to assistive tech (the canvas has no
              busy row like the thread does). */}
          <span role="status" aria-live="polite" style={visuallyHidden}>
            {`USD ${money(solved.data.salePrice)} · ${pctStr(solved.data.achievedPct)}`}
          </span>
          {/* Say WHY the target was missed, when it was (finding 9). */}
          {!solved.data.onTarget ? (
            <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
              {marginKind === 'bruto' && solved.data.achievedPct > solved.targetPct
                ? t({ es: 'El motor aplica un margen bruto mínimo de US$1,000.', en: 'The engine enforces a US$1,000 minimum gross margin.' }, locale)
                : t({ es: 'Es el margen más cercano que alcanza la banda de caja.', en: 'This is the closest the net-cash band reaches.' }, locale)}
            </p>
          ) : null}
          {solved.overCap ? (
            <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
              {t(
                { es: 'El margen bruto supera el máximo (1000%) que acepta el registro — ajústalo para guardar.', en: 'Gross margin exceeds the record maximum (1000%) — lower it to save.' },
                locale,
              )}
            </p>
          ) : (
            <CostSheetSavePanel inputs={solved.commitInputs} locale={locale} draftKey={`${seq}:commit`} />
          )}
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 12.5, color: MUTED }}>
          {t({ es: 'Sin datos de entrada para re-resolver.', en: 'No input data to re-solve.' }, locale)}
        </p>
      )}
    </div>
  )
}
