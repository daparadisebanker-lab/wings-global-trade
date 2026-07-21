import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { ReverseQuoteData } from '@/lib/copilot/capabilities/reverse-quote'

/**
 * The reverse-quote "artifact" Mister renders inside its dark bubble — the sale
 * price that hits a target margin, plus the achieved margin and the figures
 * behind it (landed cost, cash outlay). INLINE styles only (no dependency on
 * mister-dock.css) so this capability's chrome ships self-contained.
 */

const TEXT = '#eef4fb'
const MUTED = '#a8c0dc'
const GOLD = '#e0b866'
const PANEL_BG = 'rgba(0,17,46,0.55)'
const BORDER = '1px solid rgba(168,192,220,0.2)'
const MONO = 'var(--font-mono)'

function money(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function pct(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`
}

export function ReverseQuoteArtifact({
  result,
  locale = DEFAULT_LOCALE,
}: {
  result: ReverseQuoteData
  locale?: Locale
}) {
  const kindLabel =
    result.marginKind === 'neto_caja'
      ? t({ es: 'margen neto de caja', en: 'net-cash margin' }, locale)
      : t({ es: 'margen bruto', en: 'gross margin' }, locale)

  return (
    <div
      style={{
        background: PANEL_BG,
        border: BORDER,
        borderRadius: 12,
        padding: 16,
        color: TEXT,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: MUTED,
        }}
      >
        {t({ es: 'Precio de venta', en: 'Sale price' }, locale)} · {kindLabel} {pct(result.targetPct)}
      </div>

      {/* The headline: the sale price that hits the target. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: MUTED }}>USD</span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 34,
            lineHeight: 1,
            fontWeight: 600,
            color: GOLD,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {money(result.salePrice)}
        </span>
      </div>

      {/* Achieved margin — honest about the band (net-cash can be capped). */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 13,
          fontVariantNumeric: 'tabular-nums',
          color: result.onTarget ? TEXT : GOLD,
        }}
      >
        {result.onTarget
          ? t({ es: 'Margen alcanzado', en: 'Achieved margin' }, locale)
          : t({ es: 'Margen más cercano', en: 'Closest margin' }, locale)}{' '}
        <b>{pct(result.achievedPct)}</b>
      </div>

      {/* Supporting figures. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          borderTop: BORDER,
          paddingTop: 12,
        }}
      >
        <Figure
          label={`${result.incoterm} · ${t({ es: 'costo base', en: 'cost basis' }, locale)}`}
          value={money(result.fob)}
        />
        <Figure label={t({ es: 'Costo puesto (landed)', en: 'Landed cost' }, locale)} value={money(result.landedCost)} />
        <Figure label={t({ es: 'Desembolso de caja', en: 'Cash outlay' }, locale)} value={money(result.cashOutlay)} />
        <Figure
          label={t({ es: 'Objetivo', en: 'Target' }, locale)}
          value={pct(result.targetPct)}
        />
      </div>
    </div>
  )
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: MUTED,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 15,
          color: TEXT,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}
