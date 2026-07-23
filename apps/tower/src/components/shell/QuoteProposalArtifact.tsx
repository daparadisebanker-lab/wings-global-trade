'use client'

import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { formatMinor } from '@/lib/money'
import type { PriceBasis, QuoteProposalData, QuoteProposalLine } from '@/lib/copilot/capabilities/quote-build'
import { MISTER_ARTIFACT } from './mister-theme'
import { QuoteSavePanel } from './QuoteSavePanel'

/**
 * The quote-proposal artifact — Mister's assembled quote (read-only), plus the
 * shared save-draft panel. Displays each line with its price provenance; when
 * fully priced, QuoteSavePanel offers a lane + client and "Guardar borrador",
 * which creates a real DRAFT quotation (createRFQ → composeQuote) and points the
 * operator to the Quotations window to issue + print. This is the THREAD form;
 * the canvas serves an editable form (QuoteProposalEditor) committing through the
 * same QuoteSavePanel. INLINE styles, dark-bubble palette.
 */

const { text: TEXT, muted: MUTED, gold: GOLD, steel: STEEL, panelBg: PANEL_BG, border: BORDER, mono: MONO } =
  MISTER_ARTIFACT

const BASIS_STYLE: Record<PriceBasis, { color: string; label: { es: string; en: string } }> = {
  costed: { color: GOLD, label: { es: 'costeado', en: 'costed' } },
  stated: { color: STEEL, label: { es: 'indicado', en: 'stated' } },
  gap: { color: MUTED, label: { es: 'por cotizar', en: 'to quote' } },
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

      <QuoteSavePanel
        lines={r.lines.map((l) => ({ description: l.description, quantity: l.quantity, unitPriceMinor: l.unitPriceMinor }))}
        hasGaps={r.hasGaps}
        locale={locale}
      />
    </div>
  )
}
