'use client'

// ContainerFitEditor — the editable container-fit surface (Phase E, editors
// batch). The thread shows the read-only fit; the canvas serves THIS: adjust the
// box dimensions, per-unit weight, quantity and container kind, and the fit
// recomputes instantly through the SAME pure engine (computeContainerFit — no
// number is invented, no server round-trip). The recomputed fit renders through
// the existing FitArtifact, and ContainerActivatePanel turns it into a real
// container via openContainer. "Calculate AND activate a container inside Mister."
import { useMemo, useState } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { CONTAINER_KINDS, type ContainerKind } from '@/lib/actions/containers-types'
import { computeContainerFit, CONTAINER_SPECS } from '@/lib/copilot/container-fit'
import type { ContainerFitPayload } from '@/lib/copilot/capabilities/container-fit'
import { FitArtifact } from './FitArtifact'
import { ContainerActivatePanel } from './ContainerActivatePanel'
import { MISTER_ARTIFACT } from './mister-theme'

const { text: TEXT, muted: MUTED, panelBg: PANEL_BG, fieldBg: FIELD_BG, border: BORDER, mono: MONO } = MISTER_ARTIFACT

/** Parse a decimal field; blank/invalid → null (so an optional field clears cleanly). */
function parseNum(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  if (cleaned === '' || cleaned === '.') return null
  const n = Number(cleaned)
  return Number.isFinite(n) && n > 0 ? n : null
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

export function ContainerFitEditor({ result, locale = DEFAULT_LOCALE }: { result: unknown; locale?: Locale }) {
  const payload = result as ContainerFitPayload
  const seed = payload.input

  const [kind, setKind] = useState<ContainerKind>(seed?.containerKind ?? payload.containerKind)
  const [lengthM, setLengthM] = useState(seed?.itemLengthM ? String(seed.itemLengthM) : '')
  const [widthM, setWidthM] = useState(seed?.itemWidthM ? String(seed.itemWidthM) : '')
  const [heightM, setHeightM] = useState(seed?.itemHeightM ? String(seed.itemHeightM) : '')
  const [weightEach, setWeightEach] = useState(seed?.weightEachKg ? String(seed.weightEachKg) : '')
  const [quantity, setQuantity] = useState(seed?.quantity ? String(seed.quantity) : '')
  const [weightCap, setWeightCap] = useState(seed?.weightCapKg ? String(seed.weightCapKg) : '')

  const fit = useMemo(
    () =>
      computeContainerFit({
        itemLengthM: parseNum(lengthM) ?? 0,
        itemWidthM: parseNum(widthM) ?? 0,
        itemHeightM: parseNum(heightM) ?? 0,
        weightEachKg: parseNum(weightEach),
        weightCapKg: parseNum(weightCap),
        quantity: parseNum(quantity),
        containerKind: kind,
      }),
    [lengthM, widthM, heightM, weightEach, weightCap, quantity, kind],
  )

  return (
    <div style={{ background: PANEL_BG, border: BORDER, borderRadius: 12, padding: '14px 16px', color: TEXT, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
        {t({ es: 'Cubicaje · editable', en: 'Container fit · editable' }, locale)}
      </span>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Field label={t({ es: 'Contenedor', en: 'Container' }, locale)}>
          <select style={{ ...fieldStyle, textAlign: 'left' }} value={kind} onChange={(e) => setKind(e.target.value as ContainerKind)}>
            {CONTAINER_KINDS.map((k) => (
              <option key={k} value={k}>
                {CONTAINER_SPECS[k].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t({ es: 'Cantidad', en: 'Quantity' }, locale)}>
          <input inputMode="numeric" style={fieldStyle} value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="—" />
        </Field>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Field label={t({ es: 'Largo (m)', en: 'Length (m)' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={lengthM} onChange={(e) => setLengthM(e.target.value)} placeholder="0.00" />
        </Field>
        <Field label={t({ es: 'Ancho (m)', en: 'Width (m)' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={widthM} onChange={(e) => setWidthM(e.target.value)} placeholder="0.00" />
        </Field>
        <Field label={t({ es: 'Alto (m)', en: 'Height (m)' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={heightM} onChange={(e) => setHeightM(e.target.value)} placeholder="0.00" />
        </Field>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Field label={t({ es: 'Peso c/u (kg)', en: 'Weight each (kg)' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={weightEach} onChange={(e) => setWeightEach(e.target.value)} placeholder="—" />
        </Field>
        <Field label={t({ es: 'Tope de peso (kg)', en: 'Weight cap (kg)' }, locale)}>
          <input inputMode="decimal" style={fieldStyle} value={weightCap} onChange={(e) => setWeightCap(e.target.value)} placeholder="—" />
        </Field>
      </div>

      {fit ? (
        <FitArtifact fit={fit} locale={locale} />
      ) : (
        <p style={{ margin: 0, fontSize: 12.5, color: MUTED }}>
          {t(
            { es: 'Ingresa largo, ancho y alto de la caja para calcular el encaje.', en: 'Enter the box length, width and height to compute the fit.' },
            locale,
          )}
        </p>
      )}

      <ContainerActivatePanel kind={kind} suggestedCapacityCbm={CONTAINER_SPECS[kind].internalCbm} locale={locale} />
    </div>
  )
}
