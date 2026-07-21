import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { SupplierExtractData } from '@/lib/copilot/capabilities/supplier-screenshot'

/**
 * The supplier-screenshot "artifact" — the offer Mister read out of a screenshot,
 * as a scannable card, not prose. INLINE styles only (dark-bubble palette lives
 * here, not shared CSS) so it reads against Mister's #00112e bubble, matching the
 * other artifacts. Only fields that were actually read are shown.
 */

const TEXT = '#eef4fb'
const MUTED = '#a8c0dc'
const GOLD = '#e0b866'
const PANEL_BG = 'rgba(0,17,46,0.55)'
const BORDER = '1px solid rgba(168,192,220,0.2)'
const MONO = 'var(--font-mono)'

const SOURCE_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  alibaba: 'Alibaba',
  email: 'Email',
  other: '',
}

function money(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

/** One captured field — mono value under an upper-case label. Null values skip. */
function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
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
      <span style={{ fontSize: 14, color: TEXT, wordBreak: 'break-word' }}>{value}</span>
    </div>
  )
}

export function SupplierExtractArtifact({
  result,
  locale = DEFAULT_LOCALE,
}: {
  result: unknown
  locale?: Locale
}) {
  const r = result as SupplierExtractData
  const sourceTag = r.source ? SOURCE_LABEL[r.source] : ''
  const price =
    r.unitPrice !== null
      ? `${r.currency ? `${r.currency} ` : ''}${money(r.unitPrice)}${r.priceUnit ? ` · ${r.priceUnit}` : ''}`
      : null

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
        gap: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
          {t({ es: 'Oferta del proveedor', en: 'Supplier offer' }, locale)}
        </span>
        {sourceTag ? (
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.06em', color: GOLD }}>
            {sourceTag}
          </span>
        ) : null}
      </div>

      {/* Product headline + price */}
      {r.product ? (
        <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>{r.product}</div>
      ) : null}
      {price ? (
        <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 600, color: GOLD, fontVariantNumeric: 'tabular-nums' }}>
          {price}
        </div>
      ) : null}

      {/* Fixed commercial fields */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          borderTop: BORDER,
          paddingTop: 10,
        }}
      >
        <Field label={t({ es: 'Proveedor', en: 'Supplier' }, locale)} value={r.supplier} />
        <Field label="MOQ" value={r.moq} />
        <Field label="Incoterm" value={r.incoterm} />
        <Field
          label={t({ es: 'Plazo', en: 'Lead time' }, locale)}
          value={
            r.leadTimeDays !== null
              ? t({ es: `${r.leadTimeDays} días`, en: `${r.leadTimeDays} days` }, locale)
              : null
          }
        />
        <Field label={t({ es: 'Puerto', en: 'Port' }, locale)} value={r.port} />
        <Field label="HS" value={r.hsCode} />
        {r.extras.map((e, i) => (
          <Field key={i} label={e.label} value={e.value} />
        ))}
      </div>

      <p style={{ margin: '2px 0 0', fontSize: 10.5, lineHeight: 1.4, color: MUTED }}>
        {t(
          {
            es: 'Léelo, corrígelo si hace falta y pásame el precio para costear la importación.',
            en: 'Read it, correct anything, then give me the price to cost the import.',
          },
          locale,
        )}
      </p>
    </div>
  )
}
