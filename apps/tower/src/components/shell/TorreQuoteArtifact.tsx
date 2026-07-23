// Mister Torre artifact renderers (World-B navy exemption, mister-theme.ts). These
// draw the quote-run pair — cotizacion (client-ready) + hoja_costos (internal
// trace) + comunicacion (cover) — inside Mister's dark bubble, on both surfaces the
// scope allows: the cockpit canvas (preview) and the review-queue draft preview.
//
// Every number is already computed by the SUNAT engine (lib/torre/quote-run); these
// components only FORMAT. Typed confidence is visual law: verified = normal ink,
// estimado = gold + dotted underline, requiere_verificacion = a blocker chip. An
// artifact with open blockers shows a "No aprobable" banner (isApprovable === false).
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { MISTER_ARTIFACT } from './mister-theme'
import {
  CONFIDENCE_LABEL,
  isApprovable,
  type Blocker,
  type ConfidenceState,
  type SourceRef,
  type CotizacionPayload,
  type ComunicacionPayload,
  type HojaCostosPayload,
} from '@/lib/torre/artifacts'
import type { QuoteRunResult } from '@/lib/torre/quote-run'
import type { ImportResult } from '@/lib/costing/types'
import './mister/mister-motion.css'

const { text: TEXT, body: BODY, muted: MUTED, gold: ACCENT, steel: STEEL, error: ERR, panelBg: PANEL_BG, fieldBg: FIELD_BG, border: BORDER, steelLine: STEEL_LINE, mono: MONO } =
  MISTER_ARTIFACT

// ── format helpers ───────────────────────────────────────────────────────────
function money(value: number): string {
  const abs = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return value < 0 ? `(${abs})` : abs
}
function moneyMinor(minor: number | null): string {
  if (minor === null) return '—'
  return money(minor / 100)
}
function pct(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`
}

// ── small shared bits ─────────────────────────────────────────────────────────
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>{children}</span>
  )
}

function ConfidenceBadge({ state, locale }: { state: ConfidenceState; locale: Locale }) {
  const color = state === 'verified' ? STEEL : state === 'estimado' ? ACCENT : ERR
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color,
        border: `1px solid ${color}`,
        borderRadius: 999,
        padding: '1px 8px',
      }}
    >
      {CONFIDENCE_LABEL[state][locale === 'en' ? 'en' : 'es']}
    </span>
  )
}

function BlockerPanel({ blockers, locale }: { blockers: Blocker[]; locale: Locale }) {
  if (blockers.length === 0) return null
  return (
    <div style={{ marginTop: 10, padding: '8px 10px', border: `1px solid ${ERR}`, borderRadius: 8, background: FIELD_BG }}>
      <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: ERR, marginBottom: 6 }}>
        {t({ es: 'No aprobable — verificar', en: 'Not approvable — verify' }, locale)}
      </div>
      {blockers.map((b) => (
        <div key={b.id} style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12.5, color: BODY }}>• {locale === 'en' ? b.reason.en : b.reason.es}</div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: MUTED, paddingLeft: 12 }}>
            → {locale === 'en' ? b.task.en : b.task.es}
          </div>
        </div>
      ))}
    </div>
  )
}

function Sources({ sources, locale }: { sources: SourceRef[]; locale: Locale }) {
  if (sources.length === 0) return null
  return (
    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <Kicker>{t({ es: 'Fuentes', en: 'Sources' }, locale)}:</Kicker>
      {sources.map((s, i) => (
        <span
          key={i}
          title={s.validUntil ? `válido hasta ${s.validUntil}` : undefined}
          style={{
            fontFamily: MONO,
            fontSize: 10,
            color: MUTED,
            border: BORDER,
            borderRadius: 999,
            padding: '1px 7px',
          }}
        >
          {s.label}
          {s.validUntil ? ` · ${s.validUntil}` : ''}
        </span>
      ))}
    </div>
  )
}

function Row({ label, value, currency, emphasis, accent, caution }: { label: string; value: number; currency: string; emphasis?: boolean; accent?: boolean; caution?: boolean }) {
  const valColor = caution && value < 0 ? ERR : accent ? ACCENT : TEXT
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, padding: '3px 0', borderTop: emphasis ? BORDER : undefined, marginTop: emphasis ? 4 : undefined }}>
      <span style={{ fontSize: 11.5, letterSpacing: '0.04em', color: accent ? ACCENT : MUTED, fontWeight: emphasis ? 600 : 400, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: emphasis ? 15 : 13, fontWeight: emphasis ? 700 : 500, color: valColor, whiteSpace: 'nowrap' }}>
        {value < 0 ? '−' : ''}
        {money(value)} <span style={{ color: MUTED, fontSize: 11 }}>{currency}</span>
      </span>
    </div>
  )
}

/**
 * The document metadata strip (MISTER · <kind> · v<n> · <date>). When `sweep` is
 * set (an approve just landed) a single Sky glow crosses it, 600ms — the "shipped"
 * moment, paired with the avatar's CONFIRM snap. `key` forces a fresh sweep each time.
 */
function MetaStrip({ label, sweep }: { label: string; sweep?: boolean }) {
  return (
    <div
      key={sweep ? 'sweep' : 'rest'}
      className={sweep ? 'mister-motion mister-sweep' : undefined}
      style={{
        marginTop: 10,
        paddingTop: 6,
        borderTop: BORDER,
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: MUTED,
      }}
    >
      {label}
    </div>
  )
}

// ── (1) cotizacion card ───────────────────────────────────────────────────────
export function CotizacionCard({ payload, locale = DEFAULT_LOCALE, sweep }: { payload: CotizacionPayload; locale?: Locale; sweep?: boolean }) {
  const c = payload.currency
  return (
    <div style={{ background: PANEL_BG, border: BORDER, borderRadius: 12, padding: '12px 14px', color: TEXT }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <Kicker>
          {t({ es: 'Cotización', en: 'Quotation' }, locale)}
          {payload.machine.productName ? ` · ${payload.machine.productName}` : ''}
        </Kicker>
        <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>
          {payload.clientName ?? '—'}
          {payload.laneCode ? ` · ${payload.laneCode}` : ''}
        </span>
      </div>

      {/* scenarios table */}
      <div style={{ border: `1px solid ${STEEL_LINE}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, padding: '6px 10px', background: FIELD_BG }}>
          <Kicker>Incoterm</Kicker>
          <span style={{ fontSize: 10, textAlign: 'right', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t({ es: 'Costo puesto', en: 'Landed' }, locale)}</span>
          <span style={{ fontSize: 10, textAlign: 'right', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t({ es: 'Precio unit.', en: 'Unit price' }, locale)}</span>
          <span />
        </div>
        {payload.scenarios.map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, padding: '6px 10px', borderTop: `1px solid ${STEEL_LINE}`, alignItems: 'center' }}>
            <span style={{ fontFamily: MONO, fontSize: 12, color: ACCENT }}>{s.incoterm}</span>
            <span style={{ fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 12.5, textAlign: 'right', color: BODY }}>{moneyMinor(s.landedCostMinor)}</span>
            <span
              style={{
                fontFamily: MONO,
                fontVariantNumeric: 'tabular-nums',
                fontSize: 13.5,
                fontWeight: 700,
                textAlign: 'right',
                color: s.confidence === 'estimado' ? ACCENT : TEXT,
                textDecoration: s.confidence === 'estimado' ? 'underline dotted' : undefined,
              }}
            >
              {moneyMinor(s.unitPriceMinor)}
            </span>
            <ConfidenceBadge state={s.confidence} locale={locale} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 10.5, color: MUTED }}>
        {c} · {t({ es: 'Válida hasta', en: 'Valid until' }, locale)} {payload.validityUntil} · {t({ es: 'Cant.', en: 'Qty' }, locale)} {payload.quantity}
      </div>

      <BlockerPanel blockers={payload.blockers} locale={locale} />
      <Sources sources={payload.sources} locale={locale} />

      {payload.terms.length > 0 && (
        <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none' }}>
          {payload.terms.map((term, i) => (
            <li key={i} style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>· {term}</li>
          ))}
        </ul>
      )}

      <MetaStrip sweep={sweep} label={`MISTER · COTIZACIÓN · v${payload.version} · ${payload.validityUntil}`} />
    </div>
  )
}

// ── (2) hoja_costos card (the internal trace) ─────────────────────────────────
export function HojaCostosCard({ payload, locale = DEFAULT_LOCALE, sweep }: { payload: HojaCostosPayload; locale?: Locale; sweep?: boolean }) {
  const r = payload.result as unknown as Partial<ImportResult>
  const c = payload.currency
  const hasNumbers = typeof r.landedCost === 'number'
  return (
    <div style={{ background: PANEL_BG, border: BORDER, borderRadius: 12, padding: '12px 14px', color: TEXT }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <Kicker>{t({ es: 'Hoja de costos (interna)', en: 'Cost sheet (internal)' }, locale)}</Kicker>
        <span style={{ fontFamily: MONO, fontSize: 11, color: ACCENT }}>{payload.machine.incoterm} · TC {payload.exchangeRate}</span>
      </div>

      {hasNumbers ? (
        <>
          <Row label="CIF" value={r.cif as number} currency={c} />
          <Row label="Ad Valorem" value={r.adValorem as number} currency={c} />
          <Row label={`ISC (${pct((r.iscRate as number) ?? 0)})`} value={r.isc as number} currency={c} />
          <Row label={t({ es: 'IGV importación', en: 'Import IGV' }, locale)} value={r.igvImportacion as number} currency={c} />
          <Row label={t({ es: 'Gastos locales', en: 'Local costs' }, locale)} value={r.gastosVinculados as number} currency={c} />
          <Row label={t({ es: 'Costo puesto', en: 'Landed cost' }, locale)} value={r.landedCost as number} currency={c} emphasis accent />
          <Row label={t({ es: 'Desembolso de caja', en: 'Cash outlay' }, locale)} value={r.cashOutlay as number} currency={c} />
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: BORDER }}>
            <Row label={`${t({ es: 'Margen bruto', en: 'Gross margin' }, locale)} (${pct((r.margenBrutoPct as number) ?? 0)})`} value={r.margenBruto as number} currency={c} />
            <Row label={t({ es: 'Margen neto de caja', en: 'Net cash margin' }, locale)} value={r.margenNetoCaja as number} currency={c} caution />
            <Row label={t({ es: 'Precio de venta (final)', en: 'Sale price (final)' }, locale)} value={r.salePriceFinal as number} currency={c} emphasis />
          </div>
        </>
      ) : (
        <p style={{ fontSize: 12, color: MUTED }}>{t({ es: 'Sin números — faltan insumos verificados.', en: 'No numbers — verified inputs missing.' }, locale)}</p>
      )}

      {payload.cautions.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {payload.cautions.map((cn, i) => (
            <div key={i} style={{ fontSize: 11.5, color: ACCENT, lineHeight: 1.45 }}>⚠ {locale === 'en' ? cn.en : cn.es}</div>
          ))}
        </div>
      )}

      {payload.sensitivity.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <Kicker>{t({ es: 'Sensibilidad', en: 'Sensitivity' }, locale)}</Kicker>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
            {payload.sensitivity.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 11, color: MUTED, background: FIELD_BG, borderRadius: 6, padding: '3px 8px' }}>
                <span>{s.label}</span>
                <span style={{ color: s.deltaLanded > 0 ? ERR : STEEL }}>
                  {s.deltaLanded > 0 ? '+' : ''}
                  {money(s.deltaLanded)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BlockerPanel blockers={payload.blockers} locale={locale} />
      <Sources sources={payload.sources} locale={locale} />
      <MetaStrip sweep={sweep} label={`MISTER · HOJA DE COSTOS · v${payload.version}`} />
    </div>
  )
}

// ── (3) comunicacion card (the cover message) ─────────────────────────────────
export function ComunicacionCard({ payload, locale = DEFAULT_LOCALE, sweep }: { payload: ComunicacionPayload; locale?: Locale; sweep?: boolean }) {
  return (
    <div style={{ background: PANEL_BG, border: BORDER, borderRadius: 12, padding: '12px 14px', color: TEXT }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <Kicker>
          {t({ es: 'Mensaje', en: 'Message' }, locale)} · {payload.channel} · {payload.audience}
        </Kicker>
        <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>{payload.language}</span>
      </div>
      {payload.subject && <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 6 }}>{payload.subject}</div>}
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 12.5, lineHeight: 1.5, color: BODY }}>{payload.body}</pre>
      <div style={{ marginTop: 8, paddingTop: 6, borderTop: BORDER, fontFamily: MONO, fontSize: 10.5, color: ACCENT }}>
        {t({ es: 'Al aprobar', en: 'On approve' }, locale)}: {locale === 'en' ? payload.sideEffect.en : payload.sideEffect.es}
      </div>
      <MetaStrip sweep={sweep} label={`MISTER · COMUNICACIÓN · v${payload.version}`} />
    </div>
  )
}

// ── composite: the whole quote run (cockpit preview) ──────────────────────────
export function TorreQuoteArtifact({ result, locale = DEFAULT_LOCALE }: { result: QuoteRunResult; locale?: Locale }) {
  const ok = isApprovable(result.cotizacion)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 8,
          background: FIELD_BG,
          border: `1px solid ${ok ? STEEL_LINE : ERR}`,
        }}
      >
        <Kicker>{t({ es: 'Par de cotización', en: 'Quote pair' }, locale)}</Kicker>
        <span style={{ fontFamily: MONO, fontSize: 11, color: ok ? STEEL : ERR }}>
          {ok ? t({ es: 'Listo para revisión', en: 'Ready for review' }, locale) : t({ es: `${result.blockers.length} bloqueo(s)`, en: `${result.blockers.length} blocker(s)` }, locale)}
        </span>
      </div>
      <CotizacionCard payload={result.cotizacion} locale={locale} />
      <HojaCostosCard payload={result.hojaCostos} locale={locale} />
      <ComunicacionCard payload={result.comunicacion} locale={locale} />
    </div>
  )
}
