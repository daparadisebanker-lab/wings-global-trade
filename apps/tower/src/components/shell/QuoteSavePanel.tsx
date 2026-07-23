'use client'

// QuoteSavePanel — the ONE seam that turns a Mister quote proposal into a real
// DRAFT quotation (Phase E slice 3). Extracted from QuoteProposalArtifact so both
// the read-only artifact (in the thread) and the editable QuoteProposalEditor (on
// the canvas) commit through the exact same path: pick a lane + client, then
// saveMisterQuoteDraft → createRFQ → composeQuote (server recomputes line totals,
// RLS gates the write). It NEVER issues — minting the binding number stays a
// human act in the Quotations window. Takes lines already in save shape, so the
// editor can hand it whatever the operator edited.
import { useEffect, useState, useTransition } from 'react'
import { t, type Locale } from '@/lib/i18n'
import { listPipelineLanes, listAccountsForBrand, type AccountOption } from '@/lib/actions/pipeline'
import { saveMisterQuoteDraft } from '@/lib/actions/mister-quote'
import type { EditableLane } from '@/lib/actions/catalog'
import { MISTER_ARTIFACT } from './mister-theme'

const { text: TEXT, muted: MUTED, gold: GOLD, error: ERROR, ink: INK, fieldBg: FIELD_BG, border: BORDER, steelLine: STEEL_LINE, mono: MONO } =
  MISTER_ARTIFACT

/** A line in the save shape the server action accepts. */
export interface SaveLine {
  description: string
  quantity: number
  unitPriceMinor: number | null
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: FIELD_BG,
  color: TEXT,
  border: BORDER,
  borderRadius: 8,
  padding: '7px 9px',
  fontFamily: 'var(--font-ui)',
  fontSize: 13,
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
function saveButtonStyle(enabled: boolean): React.CSSProperties {
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

export function QuoteSavePanel({ lines, hasGaps, locale }: { lines: SaveLine[]; hasGaps: boolean; locale: Locale }) {
  const [lanes, setLanes] = useState<EditableLane[] | null>(null)
  const [laneId, setLaneId] = useState('')
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [clientChoice, setClientChoice] = useState('') // '' = none, uuid = existing, '__new__' = new
  const [newClientName, setNewClientName] = useState('')
  const [saved, setSaved] = useState<{ quoteId: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSave] = useTransition()

  // Load the operator's lanes once.
  useEffect(() => {
    let live = true
    listPipelineLanes().then((res) => {
      if (!live || res.error) return
      setLanes(res.data)
      if (res.data.length === 1) setLaneId(res.data[0].laneId)
    })
    return () => {
      live = false
    }
  }, [])

  // Load accounts for the chosen lane's brand.
  const lane = lanes?.find((l) => l.laneId === laneId) ?? null
  useEffect(() => {
    if (!lane) {
      setAccounts([])
      return
    }
    let live = true
    listAccountsForBrand(lane.brandId).then((res) => {
      if (live && !res.error) setAccounts(res.data)
    })
    return () => {
      live = false
    }
  }, [lane])

  function onSave() {
    setError(null)
    startSave(async () => {
      const res = await saveMisterQuoteDraft({
        laneId,
        accountId: clientChoice && clientChoice !== '__new__' ? clientChoice : null,
        newClientName: clientChoice === '__new__' ? newClientName.trim() || null : null,
        lines: lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPriceMinor: l.unitPriceMinor,
        })),
      })
      if (res.error) {
        setError(res.error.message)
        return
      }
      setSaved({ quoteId: res.data.quoteId })
    })
  }

  if (saved) {
    return (
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: BORDER, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: GOLD, textTransform: 'uppercase' }}>
          {t({ es: 'Borrador guardado ✓', en: 'Draft saved ✓' }, locale)}
        </span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="/quotations" style={linkStyle}>
            {t({ es: 'Ver en Cotizaciones →', en: 'Open in Quotations →' }, locale)}
          </a>
          <a href={`/proforma/${saved.quoteId}/document`} style={{ ...linkStyle, color: MUTED }}>
            {t({ es: 'Imprimir proforma', en: 'Print proforma' }, locale)}
          </a>
        </div>
      </div>
    )
  }

  const canSave = Boolean(laneId) && !hasGaps && !saving

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: BORDER, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {hasGaps ? (
        <span style={{ fontSize: 11, color: MUTED }}>
          {t(
            { es: 'Completa los renglones “por cotizar” para guardar.', en: 'Fill the “to quote” lines to save.' },
            locale,
          )}
        </span>
      ) : (
        <>
          <label style={labelStyle}>{t({ es: 'Lane', en: 'Lane' }, locale)}</label>
          <select style={selectStyle} value={laneId} onChange={(e) => setLaneId(e.target.value)}>
            <option value="">{t({ es: '— Elige una lane —', en: '— Choose a lane —' }, locale)}</option>
            {(lanes ?? []).map((l) => (
              <option key={l.laneId} value={l.laneId}>
                {l.laneCode} · {l.laneName}
              </option>
            ))}
          </select>

          <label style={labelStyle}>{t({ es: 'Cliente', en: 'Client' }, locale)}</label>
          <select
            style={selectStyle}
            value={clientChoice}
            onChange={(e) => setClientChoice(e.target.value)}
            disabled={!laneId}
          >
            <option value="">{t({ es: '— Sin cliente —', en: '— No client —' }, locale)}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
            <option value="__new__">{t({ es: '+ Nuevo cliente…', en: '+ New client…' }, locale)}</option>
          </select>
          {clientChoice === '__new__' ? (
            <input
              style={{ ...selectStyle }}
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder={t({ es: 'Nombre del cliente', en: 'Client name' }, locale)}
            />
          ) : null}

          {error ? <span style={{ fontSize: 11, color: ERROR }}>{error}</span> : null}

          <button type="button" onClick={onSave} disabled={!canSave} style={saveButtonStyle(canSave)}>
            {saving
              ? t({ es: 'Guardando…', en: 'Saving…' }, locale)
              : t({ es: 'Guardar borrador', en: 'Save draft' }, locale)}
          </button>
        </>
      )}
    </div>
  )
}
