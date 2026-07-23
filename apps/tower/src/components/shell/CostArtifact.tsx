import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { LandedCostData } from '@/lib/copilot/capabilities/landed-cost'
import { MISTER_ARTIFACT } from './mister-theme'

/**
 * The landed-cost "artifact" Mister renders inside its dark bubble — the SUNAT
 * chain (CIF → Ad Valorem → ISC → IGV → landed → caja) plus the margin, not
 * prose. Styled with INLINE styles only (the dark-bubble palette lives here, not
 * in shared CSS) so it reads correctly against Mister's #00112e bubble.
 */

// ── Dark-bubble palette ──────────────────────────────────────────────────────
const { text: TEXT, muted: MUTED, gold: ACCENT, panelBg: PANEL_BG, border: BORDER, mono: MONO } = MISTER_ARTIFACT

/** Accounting format: negatives in parentheses, tabular, 2 decimals. */
function money(value: number): string {
  const abs = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return value < 0 ? `(${abs})` : abs
}
function pct(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`
}

function Row({
  label,
  value,
  currency,
  emphasis,
  accent,
}: {
  label: string
  value: number
  currency: string
  emphasis?: boolean
  accent?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 12,
        padding: '4px 0',
        borderTop: emphasis ? BORDER : undefined,
        marginTop: emphasis ? 4 : undefined,
      }}
    >
      <span
        style={{
          fontSize: 12,
          letterSpacing: '0.04em',
          color: accent ? ACCENT : MUTED,
          fontWeight: emphasis ? 600 : 400,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontVariantNumeric: 'tabular-nums',
          fontSize: emphasis ? 15 : 13,
          fontWeight: emphasis ? 700 : 500,
          color: accent ? ACCENT : TEXT,
          whiteSpace: 'nowrap',
        }}
      >
        {value < 0 ? '−' : ''}
        {money(value)} <span style={{ color: MUTED, fontSize: 11 }}>{currency}</span>
      </span>
    </div>
  )
}

export function CostArtifact({
  result,
  locale = DEFAULT_LOCALE,
}: {
  result: unknown
  locale?: Locale
}) {
  const r = result as LandedCostData
  const c = r.currency

  return (
    <div
      style={{
        background: PANEL_BG,
        border: BORDER,
        borderRadius: 12,
        padding: '12px 14px',
        color: TEXT,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: MUTED,
          }}
        >
          {t({ es: 'Costo de importación', en: 'Landed cost' }, locale)}
          {r.productName ? ` · ${r.productName}` : ''}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.06em',
            color: ACCENT,
          }}
        >
          {r.incoterm}
        </span>
      </div>

      {/* Provenance (Scenario Ledger) — the numbers inherited from a prior canvas. */}
      {r.seededFrom ? (
        <p style={{ margin: '0 0 8px', fontFamily: MONO, fontSize: 10, letterSpacing: '0.04em', color: ACCENT }}>
          {t({ es: 'Heredado del lienzo', en: 'Inherited from canvas' }, locale)} #{r.seededFrom.seq}:{' '}
          {r.seededFrom.fields.map((f) => t(f, locale)).join(' · ')}
        </p>
      ) : null}

      {/* SUNAT chain */}
      <Row label="CIF" value={r.cif} currency={c} />
      <Row label={t({ es: 'Ad Valorem', en: 'Ad Valorem' }, locale)} value={r.adValorem} currency={c} />
      <Row label={`ISC (${pct(r.iscRate)})`} value={r.isc} currency={c} />
      <Row label={t({ es: 'IGV importación', en: 'Import IGV' }, locale)} value={r.igvImportacion} currency={c} />
      <Row
        label={t({ es: 'Gastos locales', en: 'Local costs' }, locale)}
        value={r.gastosVinculados}
        currency={c}
      />

      <Row
        label={t({ es: 'Costo puesto almacén', en: 'Landed cost' }, locale)}
        value={r.landedCost}
        currency={c}
        emphasis
        accent
      />
      <Row
        label={t({ es: 'Desembolso de caja', en: 'Cash outlay' }, locale)}
        value={r.cashOutlay}
        currency={c}
      />

      {/* Margin block */}
      <div style={{ marginTop: 8, paddingTop: 6, borderTop: BORDER }}>
        <Row
          label={`${t({ es: 'Margen bruto', en: 'Gross margin' }, locale)} (${pct(r.margenBrutoPct)})`}
          value={r.margenBruto}
          currency={c}
        />
        <Row
          label={t({ es: 'Margen neto de caja', en: 'Net cash margin' }, locale)}
          value={r.margenNetoCaja}
          currency={c}
        />
        <Row
          label={t({ es: 'Precio de venta (final)', en: 'Sale price (final)' }, locale)}
          value={r.salePriceFinal}
          currency={c}
          emphasis
        />
      </div>

      {/* Assumptions strip — the SUNAT rates behind these numbers, exhibited (not
          hidden) so a canvas-inherited or tuned rate never reads as "standard". */}
      {r.input ? (
        <p style={{ margin: '8px 0 0', fontFamily: MONO, fontSize: 10.5, lineHeight: 1.4, color: MUTED }}>
          TC {r.input.exchangeRate} · Ad Val {(r.input.adValoremRate * 100).toFixed(1)}%
          {r.incoterm === 'EXW' || r.incoterm === 'FOB'
            ? ` · ${t({ es: 'Flete', en: 'Freight' }, locale)} ${money(r.input.freightInternational)}`
            : ''}{' '}
          · {r.input.fuelType}
        </p>
      ) : (
        <p style={{ margin: '8px 0 0', fontSize: 10.5, lineHeight: 1.4, color: MUTED }}>
          {t(
            {
              es: 'Cadena SUNAT con tasas estándar; ajusta cualquier tasa en la calculadora de costos.',
              en: 'SUNAT chain at standard rates; fine-tune any rate in the cost calculator.',
            },
            locale,
          )}
        </p>
      )}
    </div>
  )
}
