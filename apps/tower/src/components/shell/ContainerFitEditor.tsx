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
import { Field, fieldStyle, parseNum, usePersistOnUnmount } from './mister/editor-kit'
import { useArtifactDraft } from './mister/MisterProvider'
import { MISTER_ARTIFACT } from './mister-theme'

const { text: TEXT, muted: MUTED, panelBg: PANEL_BG, border: BORDER } = MISTER_ARTIFACT

// Dimensions and weights must be > 0 to be meaningful — the kit's allowZero:false
// makes a blank/zero field read as "absent" rather than a bogus 0.
const dim = (raw: string) => parseNum(raw, { allowZero: false })

/** Persisted editor state (canvas working memory) — survives artifact remount. */
type FitSnap = {
  kind: ContainerKind
  lengthM: string
  widthM: string
  heightM: string
  weightEach: string
  quantity: string
  weightCap: string
}

export function ContainerFitEditor({ result, locale = DEFAULT_LOCALE, seq }: { result: unknown; locale?: Locale; seq: number }) {
  const payload = result as ContainerFitPayload
  const seed = payload.input
  const { draft: d, persist } = useArtifactDraft<FitSnap>(String(seq))

  const [kind, setKind] = useState<ContainerKind>(d?.kind ?? seed?.containerKind ?? payload.containerKind)
  const [lengthM, setLengthM] = useState(d?.lengthM ?? (seed?.itemLengthM ? String(seed.itemLengthM) : ''))
  const [widthM, setWidthM] = useState(d?.widthM ?? (seed?.itemWidthM ? String(seed.itemWidthM) : ''))
  const [heightM, setHeightM] = useState(d?.heightM ?? (seed?.itemHeightM ? String(seed.itemHeightM) : ''))
  const [weightEach, setWeightEach] = useState(d?.weightEach ?? (seed?.weightEachKg ? String(seed.weightEachKg) : ''))
  const [quantity, setQuantity] = useState(d?.quantity ?? (seed?.quantity ? String(seed.quantity) : ''))
  const [weightCap, setWeightCap] = useState(d?.weightCap ?? (seed?.weightCapKg ? String(seed.weightCapKg) : ''))

  usePersistOnUnmount<FitSnap>({ kind, lengthM, widthM, heightM, weightEach, quantity, weightCap }, persist)

  const fit = useMemo(
    () =>
      computeContainerFit({
        itemLengthM: dim(lengthM) ?? 0,
        itemWidthM: dim(widthM) ?? 0,
        itemHeightM: dim(heightM) ?? 0,
        weightEachKg: dim(weightEach),
        weightCapKg: dim(weightCap),
        quantity: dim(quantity),
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

      <ContainerActivatePanel kind={kind} suggestedCapacityCbm={CONTAINER_SPECS[kind].internalCbm} locale={locale} draftKey={`${seq}:commit`} />
    </div>
  )
}
