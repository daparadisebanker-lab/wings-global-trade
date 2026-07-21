import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { formatMinor } from '@/lib/money'
import type { PriceBasis, QuoteProposalData, QuoteProposalLine } from '@/lib/copilot/capabilities/quote-build'

/**
 * The quote-proposal "artifact" — the line items Mister assembled, each unit
 * price tagged with WHERE it came from (costed / stated / gap), and an honest
 * subtotal (or none, if any line is a gap). INLINE styles only (dark-bubble
 * palette) to match the other artifacts.
 *
 * Phase 1: this DISPLAYS a proposal. It does not persist a quote — the footer
 * points the operator to the composer, where creating the DRAFT quote and issuing
 * it (the binding act) stay human-gated.
 */

const TEXT = '#eef4fb'
const MUTED = '#a8c0dc'
const GOLD = '#e0b866'
const STEEL = '#9db4d4'
const PANEL_BG = 'rgba(0,17,46,0.55)'
const BORDER = '1px solid rgba(168,192,220,0.2)'
const MONO = 'var(--font-mono)'

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
          {line.quantity} ×{' '}
          {line.unitPriceMinor !== null ? formatMinor(line.unitPriceMinor, currency) : '—'}
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
          {t({ es: 'Cotización · propuesta', en: 'Quote · proposal' }, locale)}
          {r.clientHint ? ` · ${r.clientHint}` : ''}
        </span>
        {r.incoterm ? (
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: GOLD }}>{r.incoterm}</span>
        ) : null}
      </div>

      {/* Lines */}
      {r.lines.map((line, i) => (
        <Line key={i} line={line} currency={r.currency} locale={locale} />
      ))}

      {/* Subtotal */}
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

      <p style={{ margin: '8px 0 0', fontSize: 10.5, lineHeight: 1.4, color: MUTED }}>
        {r.hasGaps
          ? t(
              {
                es: 'Completa los renglones “por cotizar” y ábrela en el cotizador del deal para emitir.',
                en: 'Fill the “to quote” lines, then open it in the deal’s composer to issue.',
              },
              locale,
            )
          : t(
              {
                es: 'Revísala y ábrela en el cotizador del deal para emitir — el IGV y el número se aplican al emitir.',
                en: 'Review it, then open it in the deal’s composer to issue — tax and number apply at issue.',
              },
              locale,
            )}
      </p>
    </div>
  )
}
