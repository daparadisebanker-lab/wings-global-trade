'use client'

import { useEffect, useState, useTransition } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { formatMinor } from '@/lib/money'
import { listPipelineLanes, listAccountsForBrand, type AccountOption } from '@/lib/actions/pipeline'
import { saveMisterQuoteDraft } from '@/lib/actions/mister-quote'
import type { EditableLane } from '@/lib/actions/catalog'
import type { PriceBasis, QuoteProposalData, QuoteProposalLine } from '@/lib/copilot/capabilities/quote-build'
import { MISTER_ARTIFACT } from './mister-theme'

/**
 * The quote-proposal artifact — Mister's assembled quote, plus the save-draft
 * panel (Slice 1C). Displays each line with its price provenance; when fully
 * priced, offers a lane + client (existing or new) and "Guardar borrador", which
 * creates a real DRAFT quotation (createRFQ → composeQuote) and points the
 * operator to the Quotations window to issue + print. Client component: it owns
 * the lane/account fetch + save state. INLINE styles, dark-bubble palette.
 */

const { text: TEXT, muted: MUTED, gold: GOLD, steel: STEEL, error: ERROR, ink: INK, panelBg: PANEL_BG, fieldBg: FIELD_BG, border: BORDER, steelLine: STEEL_LINE, mono: MONO } =
  MISTER_ARTIFACT

const BASIS_STYLE: Record<PriceBasis, { color: string; label: { es: string; en: string } }> = {
  costed: { color: GOLD, label: { es: 'costeado', en: 'costed' } },
  stated: { color: STEEL, label: { es: 'indicado', en: 'stated' } },
  gap: { color: MUTED, label: { es: 'por cotizar', en: 'to quote' } },
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

function Line({ line, currency, locale }: { line: QuoteProposalLine; currency: string; locale: Locale }) {
  const basis = BASIS_STYLE[line.basis]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '8px 0', borderTop: BORDER }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
        <span style={{ fontSize: 13.5, color: TEXT, fontWeight: 500 }}>{line.description}</span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 13.5,
            color: line.lineTotalMinor !== null ? TEXT : MUTED,
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {line.lineTotalMinor !== null
            ? formatMinor(line.lineTotalMinor, currency)
            : t({ es: 'por cotizar', en: 'to quote' }, locale)}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: MONO, fontSize: 10.5, color: MUTED }}>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {line.quantity} × {line.unitPriceMinor !== null ? formatMinor(line.unitPriceMinor, currency) : '—'}
        </span>
        <span
          style={{
            color: basis.color,
            border: `1px solid ${basis.color}`,
            borderRadius: 4,
            padding: '1px 5px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontSize: 9.5,
          }}
        >
          {t(basis.label, locale)}
        </span>
        {line.basisNote ? <span style={{ opacity: 0.8 }}>· {line.basisNote}</span> : null}
      </div>
    </div>
  )
}

function SavePanel({ data, locale }: { data: QuoteProposalData; locale: Locale }) {
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
        lines: data.lines.map((l) => ({
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

  const canSave = Boolean(laneId) && !data.hasGaps && !saving

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: BORDER, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.hasGaps ? (
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

export function QuoteProposalArtifact({
  result,
  locale = DEFAULT_LOCALE,
}: {
  result: unknown
  locale?: Locale
}) {
  const r = result as QuoteProposalData

  return (
    <div
      style={{
        background: PANEL_BG,
        border: BORDER,
        borderRadius: 12,
        padding: '12px 14px',
        color: TEXT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
          {t({ es: 'Cotización · propuesta', en: 'Quote · proposal' }, locale)}
          {r.clientHint ? ` · ${r.clientHint}` : ''}
        </span>
        {r.incoterm ? (
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: GOLD }}>{r.incoterm}</span>
        ) : null}
      </div>

      {r.lines.map((line, i) => (
        <Line key={i} line={line} currency={r.currency} locale={locale} />
      ))}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 10,
          borderTop: BORDER,
          marginTop: 4,
          paddingTop: 8,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: MUTED }}>
          {t({ es: 'Subtotal', en: 'Subtotal' }, locale)}
          <span style={{ fontSize: 10, opacity: 0.7 }}> · {t({ es: 'sin IGV', en: 'excl. tax' }, locale)}</span>
        </span>
        <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: GOLD, fontVariantNumeric: 'tabular-nums' }}>
          {r.subtotalMinor !== null
            ? formatMinor(r.subtotalMinor, r.currency)
            : t({ es: 'por definir', en: 'to be set' }, locale)}
        </span>
      </div>

      <SavePanel data={r} locale={locale} />
    </div>
  )
}
