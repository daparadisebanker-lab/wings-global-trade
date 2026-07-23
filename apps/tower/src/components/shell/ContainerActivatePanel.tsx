'use client'

// ContainerActivatePanel — the commit seam for the container-fit editor: turn a
// fit into a REAL container record (Phase E, editors batch). "Activate a container
// INSIDE Mister." Mirrors QuoteSavePanel: pick a lane, confirm capacity + route,
// then openContainer(laneId, …) — the sanctioned mutation (RLS-gated, status
// OPEN). Capacity is prefilled from the chosen container kind's internal volume;
// the operator can override. On success it deep-links to the new container.
import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { t, type Locale } from '@/lib/i18n'
import { listContainerLanes, openContainer } from '@/lib/actions/containers'
import type { ContainerKind } from '@/lib/actions/containers-types'
import { MISTER_ARTIFACT } from './mister-theme'

const { text: TEXT, muted: MUTED, gold: GOLD, error: ERROR, ink: INK, fieldBg: FIELD_BG, border: BORDER, steelLine: STEEL_LINE, mono: MONO } =
  MISTER_ARTIFACT

type Lane = { laneId: string; laneCode: string; laneName: string }

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
const linkStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: GOLD,
  textDecoration: 'none',
}

export function ContainerActivatePanel({
  kind,
  suggestedCapacityCbm,
  locale,
}: {
  kind: ContainerKind
  suggestedCapacityCbm: number
  locale: Locale
}) {
  const [lanes, setLanes] = useState<Lane[] | null>(null)
  const [laneId, setLaneId] = useState('')
  const [capacity, setCapacity] = useState(String(suggestedCapacityCbm))
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [saved, setSaved] = useState<{ id: string; code: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSave] = useTransition()

  // Keep the capacity suggestion in step with the kind, until the operator edits it.
  useEffect(() => {
    setCapacity((prev) => (prev === '' || Number(prev) === 0 ? String(suggestedCapacityCbm) : prev))
  }, [suggestedCapacityCbm])

  useEffect(() => {
    let live = true
    listContainerLanes().then((res) => {
      if (!live || res.error) return
      const opts = res.data.map((l) => ({ laneId: l.laneId, laneCode: l.laneCode, laneName: l.laneName }))
      setLanes(opts)
      if (opts.length === 1) setLaneId(opts[0].laneId)
    })
    return () => {
      live = false
    }
  }, [])

  function onActivate() {
    setError(null)
    startSave(async () => {
      const res = await openContainer(laneId, {
        kind,
        capacityCbm: Number(capacity),
        mode: 'DEDICATED',
        route: { origin: origin.trim() || undefined, destination: destination.trim() || undefined },
        publicFillVisible: true,
      })
      if (res.error) {
        setError(res.error.message)
        return
      }
      setSaved({ id: res.data.id, code: res.data.code })
    })
  }

  if (saved) {
    return (
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: BORDER, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: GOLD, textTransform: 'uppercase' }}>
          {t({ es: 'Contenedor abierto ✓', en: 'Container opened ✓' }, locale)} · {saved.code}
        </span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href={`/containers/${saved.id}`} style={linkStyle}>
            {t({ es: 'Abrir contenedor →', en: 'Open container →' }, locale)}
          </Link>
          <Link href="/containers" style={{ ...linkStyle, color: MUTED }}>
            {t({ es: 'Ver todos', en: 'View all' }, locale)}
          </Link>
        </div>
      </div>
    )
  }

  const capNum = Number(capacity)
  const canActivate = Boolean(laneId) && Number.isFinite(capNum) && capNum > 0 && !saving

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: BORDER, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
        {t({ es: 'Activar contenedor', en: 'Activate container' }, locale)} · {kind}
      </span>

      <label style={labelStyle}>{t({ es: 'Lane', en: 'Lane' }, locale)}</label>
      <select style={fieldStyle} value={laneId} onChange={(e) => setLaneId(e.target.value)}>
        <option value="">{t({ es: '— Elige una lane —', en: '— Choose a lane —' }, locale)}</option>
        {(lanes ?? []).map((l) => (
          <option key={l.laneId} value={l.laneId}>
            {l.laneCode} · {l.laneName}
          </option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t({ es: 'Capacidad (CBM)', en: 'Capacity (CBM)' }, locale)}</label>
          <input
            inputMode="decimal"
            style={{ ...fieldStyle, fontFamily: MONO, textAlign: 'right' }}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            aria-label={t({ es: 'Capacidad en CBM', en: 'Capacity in CBM' }, locale)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t({ es: 'Origen', en: 'Origin' }, locale)}</label>
          <input
            style={fieldStyle}
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder={t({ es: 'p. ej. Ningbo', en: 'e.g. Ningbo' }, locale)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t({ es: 'Destino', en: 'Destination' }, locale)}</label>
          <input
            style={fieldStyle}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={t({ es: 'p. ej. Callao', en: 'e.g. Callao' }, locale)}
          />
        </div>
      </div>

      {error ? <span style={{ fontSize: 11, color: ERROR }}>{error}</span> : null}

      <button type="button" onClick={onActivate} disabled={!canActivate} style={buttonStyle(canActivate)}>
        {saving ? t({ es: 'Abriendo…', en: 'Opening…' }, locale) : t({ es: 'Abrir contenedor', en: 'Open container' }, locale)}
      </button>
    </div>
  )
}
