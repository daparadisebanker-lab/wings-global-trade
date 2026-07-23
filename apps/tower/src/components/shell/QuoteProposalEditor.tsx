'use client'

// QuoteProposalEditor — the editable quote, the flagship of "draft a quotation
// INSIDE Mister" (Phase E slice 3). The thread shows the read-only proposal; the
// canvas serves THIS — the operator adjusts descriptions, quantities and unit
// prices, adds or drops lines, watches the subtotal recompute live, then commits
// through the SAME QuoteSavePanel (createRFQ → composeQuote, server-recomputed,
// RLS-gated). No number is invented here: line totals and the subtotal come from
// the money layer, exactly as the capability's pure resolver does. Navy World-B
// palette, inline styles — consistent with the read-only artifact.
import { useMemo, useState } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { addMinor, formatMinor, lineTotalMinor as calcLineTotal } from '@/lib/money'
import type { PriceBasis, QuoteProposalData } from '@/lib/copilot/capabilities/quote-build'
import { MISTER_ARTIFACT } from './mister-theme'
import { QuoteSavePanel, type SaveLine } from './QuoteSavePanel'
import { usePersistOnUnmount } from './mister/editor-kit'
import { useArtifactDraft } from './mister/MisterProvider'

const { text: TEXT, muted: MUTED, gold: GOLD, steel: STEEL, error: ERROR, panelBg: PANEL_BG, fieldBg: FIELD_BG, border: BORDER, mono: MONO } =
  MISTER_ARTIFACT

/** One editable row of the quote. Price is held as a MAJOR-unit string for typing. */
interface EditLine {
  id: number
  description: string
  quantity: number
  priceMajor: string
  origBasis: PriceBasis
  origNote: string | null
  origMajor: string
}

/** A resolved-for-render view of an edit line (money-layer math, never invented). */
interface DerivedLine {
  unitPriceMinor: number | null
  lineTotalMinor: number | null
  basis: PriceBasis
  basisNote: string | null
}

const BASIS_STYLE: Record<PriceBasis, { color: string; label: { es: string; en: string } }> = {
  costed: { color: GOLD, label: { es: 'costeado', en: 'costed' } },
  stated: { color: STEEL, label: { es: 'indicado', en: 'stated' } },
  gap: { color: MUTED, label: { es: 'por cotizar', en: 'to quote' } },
}

/** Major-unit string → integer minor units, or null if blank/unparseable. */
function parseMajor(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  if (cleaned === '' || cleaned === '.') return null
  const n = Number(cleaned)
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null
}

function derive(line: EditLine): DerivedLine {
  const unitPriceMinor = parseMajor(line.priceMajor)
  if (unitPriceMinor === null) {
    return { unitPriceMinor: null, lineTotalMinor: null, basis: 'gap', basisNote: 'por cotizar' }
  }
  const unchanged = line.priceMajor.trim() === line.origMajor.trim() && line.origBasis !== 'gap'
  return {
    unitPriceMinor,
    lineTotalMinor: calcLineTotal(unitPriceMinor, Math.max(1, line.quantity)),
    basis: unchanged ? line.origBasis : 'stated',
    basisNote: unchanged ? line.origNote : 'editado',
  }
}

const fieldStyle: React.CSSProperties = {
  background: FIELD_BG,
  color: TEXT,
  border: BORDER,
  borderRadius: 8,
  padding: '7px 9px',
  fontFamily: 'var(--font-ui)',
  fontSize: 13,
  width: '100%',
  WebkitAppearance: 'none',
  appearance: 'none',
}

export function QuoteProposalEditor({ result, locale = DEFAULT_LOCALE, seq }: { result: unknown; locale?: Locale; seq: number }) {
  const data = result as QuoteProposalData
  const { draft: d, persist } = useArtifactDraft<{ lines: EditLine[]; nextId: number }>(seq)

  const [lines, setLines] = useState<EditLine[]>(
    () =>
      d?.lines ??
      data.lines.map((l, i) => {
        const major = l.unitPriceMinor !== null ? String(l.unitPriceMinor / 100) : ''
        return {
          id: i,
          description: l.description,
          quantity: l.quantity,
          priceMajor: major,
          origBasis: l.basis,
          origNote: l.basisNote,
          origMajor: major,
        }
      }),
  )
  const [nextId, setNextId] = useState(d?.nextId ?? data.lines.length)

  usePersistOnUnmount({ lines, nextId }, persist)

  const derived = useMemo(() => lines.map(derive), [lines])
  const hasGaps = lines.length === 0 || derived.some((d) => d.unitPriceMinor === null)
  const subtotalMinor = useMemo(() => {
    if (hasGaps) return null
    return addMinor(derived.map((d) => ({ minor: d.lineTotalMinor as number, currency: data.currency }))).minor
  }, [derived, hasGaps, data.currency])

  const saveLines: SaveLine[] = lines.map((l, i) => ({
    description: l.description.trim() || '—',
    quantity: Math.max(1, l.quantity),
    unitPriceMinor: derived[i].unitPriceMinor,
  }))

  function patch(id: number, next: Partial<EditLine>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...next } : l)))
  }
  function addLine() {
    setLines((prev) => [...prev, { id: nextId, description: '', quantity: 1, priceMajor: '', origBasis: 'gap', origNote: null, origMajor: '' }])
    setNextId((n) => n + 1)
  }
  function removeLine(id: number) {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div style={{ background: PANEL_BG, border: BORDER, borderRadius: 12, padding: '14px 16px', color: TEXT, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
          {t({ es: 'Cotización · editable', en: 'Quote · editable' }, locale)}
          {data.clientHint ? ` · ${data.clientHint}` : ''}
        </span>
        {data.incoterm ? (
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: GOLD }}>{data.incoterm}</span>
        ) : null}
      </div>

      {lines.map((line, i) => {
        const d = derived[i]
        const basis = BASIS_STYLE[d.basis]
        return (
          <div key={line.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 0', borderTop: BORDER }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <input
                style={fieldStyle}
                value={line.description}
                onChange={(e) => patch(line.id, { description: e.target.value })}
                placeholder={t({ es: 'Descripción del renglón', en: 'Line description' }, locale)}
                aria-label={t({ es: 'Descripción', en: 'Description' }, locale)}
              />
              <button
                type="button"
                onClick={() => removeLine(line.id)}
                aria-label={t({ es: 'Quitar renglón', en: 'Remove line' }, locale)}
                style={{ flex: 'none', width: 30, height: 32, borderRadius: 8, border: BORDER, background: 'transparent', color: MUTED, cursor: 'pointer', fontSize: 13 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                min={1}
                step={1}
                style={{ ...fieldStyle, width: 74, textAlign: 'right', fontFamily: MONO }}
                value={line.quantity}
                onChange={(e) => patch(line.id, { quantity: Math.max(1, Math.round(Number(e.target.value) || 1)) })}
                aria-label={t({ es: 'Cantidad', en: 'Quantity' }, locale)}
              />
              <span style={{ color: MUTED, fontFamily: MONO, fontSize: 12 }}>×</span>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: MUTED, fontFamily: MONO, fontSize: 11 }}>
                  {data.currency}
                </span>
                <input
                  inputMode="decimal"
                  style={{ ...fieldStyle, paddingLeft: 42, textAlign: 'right', fontFamily: MONO }}
                  value={line.priceMajor}
                  onChange={(e) => patch(line.id, { priceMajor: e.target.value })}
                  placeholder={t({ es: 'precio unitario', en: 'unit price' }, locale)}
                  aria-label={t({ es: 'Precio unitario', en: 'Unit price' }, locale)}
                />
              </div>
              <span style={{ minWidth: 92, textAlign: 'right', fontFamily: MONO, fontSize: 13.5, color: d.lineTotalMinor !== null ? TEXT : MUTED, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {d.lineTotalMinor !== null ? formatMinor(d.lineTotalMinor, data.currency) : t({ es: 'por cotizar', en: 'to quote' }, locale)}
              </span>
            </div>

            <span
              style={{
                alignSelf: 'flex-start',
                color: basis.color,
                border: `1px solid ${basis.color}`,
                borderRadius: 4,
                padding: '1px 5px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontFamily: MONO,
                fontSize: 9.5,
              }}
            >
              {t(basis.label, locale)}
              {d.basisNote ? ` · ${d.basisNote}` : ''}
            </span>
          </div>
        )
      })}

      <button
        type="button"
        onClick={addLine}
        style={{ alignSelf: 'flex-start', marginTop: 8, fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: TEXT, background: 'transparent', border: BORDER, borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
      >
        {t({ es: '+ Renglón', en: '+ Line' }, locale)}
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, borderTop: BORDER, marginTop: 10, paddingTop: 10 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: MUTED }}>
          {t({ es: 'Subtotal', en: 'Subtotal' }, locale)}
          <span style={{ fontSize: 10, opacity: 0.7 }}> · {t({ es: 'sin IGV', en: 'excl. tax' }, locale)}</span>
        </span>
        <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: GOLD, fontVariantNumeric: 'tabular-nums' }}>
          {subtotalMinor !== null ? formatMinor(subtotalMinor, data.currency) : t({ es: 'por definir', en: 'to be set' }, locale)}
        </span>
      </div>

      {lines.length === 0 ? (
        <span style={{ fontSize: 11, color: ERROR, marginTop: 8 }}>
          {t({ es: 'Agrega al menos un renglón.', en: 'Add at least one line.' }, locale)}
        </span>
      ) : null}

      <QuoteSavePanel lines={saveLines} hasGaps={hasGaps} locale={locale} />
    </div>
  )
}
