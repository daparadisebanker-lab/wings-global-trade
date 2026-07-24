'use client'

// CostSheetSavePanel — the commit seam for the landed-cost editor (Phase E,
// editors batch, part B). Turns a recomputed landed cost into a persisted cost
// sheet: pick a lane, optional label, then saveCostCalculation(laneId, inputs) —
// the sanctioned mutation that recomputes the SUNAT chain server-side
// (authoritative), RLS-gates the write, and returns the row. On success it deep-
// links to the printable cost sheet. Mirrors QuoteSavePanel / ContainerActivatePanel
// so all three canvas editors commit through one consistent shape.
import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { t, type Locale } from '@/lib/i18n'
import { listCostingLanes, saveCostCalculation, type CostingLane } from '@/lib/actions/costing'
import type { ImportInputs } from '@/lib/costing/types'
import { usePersistOnUnmount } from './mister/editor-kit'
import { useArtifactDraft } from './mister/MisterProvider'
import { MISTER_ARTIFACT } from './mister-theme'

/** Persisted panel state (canvas working memory) — the saved latch + deep-link
 *  survive a remount so a saved sheet can't be re-submitted into a duplicate. */
type CSPSnap = { laneId: string; label: string; saved: { id: string } | null; savedFingerprint: string | null }

const { text: TEXT, muted: MUTED, gold: GOLD, error: ERROR, ink: INK, fieldBg: FIELD_BG, border: BORDER, steelLine: STEEL_LINE, mono: MONO } =
  MISTER_ARTIFACT

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: FIELD_BG,
  color: TEXT,
  border: BORDER,
  borderRadius: 8,
  padding: '7px 9px',
  fontFamily: 'var(--font-ui)',
  fontSize: 13,
  WebkitAppearance: 'none',
  appearance: 'none',
}
const labelStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
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
function buttonStyle(enabled: boolean): React.CSSProperties {
  return {
    alignSelf: 'flex-start',
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: enabled ? INK : MUTED,
    background: enabled ? GOLD : 'transparent',
    border: `1px solid ${enabled ? GOLD : STEEL_LINE}`,
    borderRadius: 6,
    padding: '6px 12px',
    cursor: enabled ? 'pointer' : 'default',
  }
}

export function CostSheetSavePanel({
  inputs,
  locale,
  draftKey,
}: {
  inputs: ImportInputs
  locale: Locale
  draftKey?: string
}) {
  const { draft: d, persist } = useArtifactDraft<CSPSnap>(draftKey)
  const [lanes, setLanes] = useState<CostingLane[] | null>(null)
  const [laneId, setLaneId] = useState(d?.laneId ?? '')
  const [label, setLabel] = useState(d?.label ?? '')
  const [saved, setSaved] = useState<{ id: string } | null>(d?.saved ?? null)
  const [savedFingerprint, setSavedFingerprint] = useState<string | null>(d?.savedFingerprint ?? null)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSave] = useTransition()

  usePersistOnUnmount<CSPSnap>({ laneId, label, saved, savedFingerprint }, persist)

  // When the upstream artifact re-solves (the `inputs` change), the "saved ✓"
  // confirmation must retract — otherwise it keeps vouching for an OLD sheet while
  // a new, uncommittable price is on screen (Fable review finding 2). But a bare
  // remount (which rehydrates a still-valid saved sheet) must NOT retract: only
  // clear when the current inputs differ from the ones that were saved.
  const inputsFingerprint = JSON.stringify(inputs)
  useEffect(() => {
    if (saved && savedFingerprint !== inputsFingerprint) {
      setSaved(null)
      setSavedFingerprint(null)
    }
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputsFingerprint])

  useEffect(() => {
    let live = true
    listCostingLanes().then((res) => {
      if (!live || res.error) return
      setLanes(res.data)
      if (res.data.length === 1) setLaneId(res.data[0].id)
    })
    return () => {
      live = false
    }
  }, [])

  function onSave() {
    setError(null)
    startSave(async () => {
      const res = await saveCostCalculation({ laneId, inputs, label: label.trim() || null })
      if (res.error) {
        setError(res.error.message)
        return
      }
      setSaved({ id: res.data.id })
      setSavedFingerprint(inputsFingerprint)
    })
  }

  if (saved) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{ marginTop: 10, paddingTop: 10, borderTop: BORDER, display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: GOLD, textTransform: 'uppercase' }}>
          {t({ es: 'Hoja de costo guardada ✓', en: 'Cost sheet saved ✓' }, locale)}
        </span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href={`/cost-sheet/${saved.id}`} style={linkStyle}>
            {t({ es: 'Abrir hoja de costo →', en: 'Open cost sheet →' }, locale)}
          </Link>
          <Link href="/costing" style={{ ...linkStyle, color: MUTED }}>
            {t({ es: 'Ir a Costeo', en: 'Go to Costing' }, locale)}
          </Link>
        </div>
      </div>
    )
  }

  const canSave = Boolean(laneId) && !saving

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: BORDER, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
        {t({ es: 'Guardar hoja de costo', en: 'Save cost sheet' }, locale)}
      </span>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={labelStyle}>{t({ es: 'Lane', en: 'Lane' }, locale)}</span>
        <select style={fieldStyle} value={laneId} onChange={(e) => setLaneId(e.target.value)}>
          <option value="">{t({ es: '— Elige una lane —', en: '— Choose a lane —' }, locale)}</option>
          {(lanes ?? []).map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} · {l.name}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={labelStyle}>{t({ es: 'Etiqueta (opcional)', en: 'Label (optional)' }, locale)}</span>
        <input
          style={fieldStyle}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t({ es: 'p. ej. Montacargas — cliente X', en: 'e.g. Forklift — client X' }, locale)}
        />
      </label>

      {error ? <span style={{ fontSize: 11, color: ERROR }}>{error}</span> : null}

      <button type="button" onClick={onSave} disabled={!canSave} style={buttonStyle(canSave)}>
        {saving ? t({ es: 'Guardando…', en: 'Saving…' }, locale) : t({ es: 'Guardar hoja de costo', en: 'Save cost sheet' }, locale)}
      </button>
    </div>
  )
}
