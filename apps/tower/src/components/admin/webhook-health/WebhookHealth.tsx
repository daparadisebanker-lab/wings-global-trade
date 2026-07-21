// <WebhookHealth> (COMPONENT_TREE §6) — revalidation + n8n pipeline delivery
// status. Server component; reads a pre-fetched WebhookHealthSummary
// (getWebhookHealth). Three panels: overview counts, per-source health
// (success/failure + last-seen), and the recent deliveries log. Instrument
// aesthetic: mono numerals, rules-not-shadows, status readable without color.
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { sourceLabel, type WebhookHealthSummary } from '@/lib/actions/webhooks-logic'
import { StatusChip } from './StatusChip'

const HEAD = 'px-3 py-2 font-mono text-label uppercase tracking-[0.12em] text-ink-secondary'
const CELL = 'px-3 py-2 font-mono text-t0'

function formatTimestamp(at: string | null, locale: Locale): string {
  if (!at) return '—'
  const d = new Date(at)
  if (Number.isNaN(d.getTime())) return at
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-PE' : 'en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

export function WebhookHealth({
  summary,
  locale = DEFAULT_LOCALE,
}: {
  summary: WebhookHealthSummary
  locale?: Locale
}) {
  return (
    <div className="flex flex-col gap-8 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          ADM · Webhooks
        </span>
        <h1 className="font-display text-t3 text-ink-primary">{t({ es: 'Estado de Webhooks', en: 'Webhook Health' }, locale)}</h1>
        <p className="font-ui text-t0 text-ink-secondary">
          {t(
            {
              es: `Entregas de los últimos ${summary.windowDays} días.`,
              en: `Deliveries over the last ${summary.windowDays} days.`,
            },
            locale,
          )}
        </p>
      </header>

      {/* Overview counts */}
      <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">
        <Stat label={{ es: 'Entregas OK', en: 'Deliveries OK' }} value={summary.totalOk} tone="positive" locale={locale} />
        <Stat label={{ es: 'Fallidas', en: 'Failed' }} value={summary.totalFailed} tone={summary.totalFailed > 0 ? 'negative' : 'neutral'} locale={locale} />
        <Stat label={{ es: 'Fuentes', en: 'Sources' }} value={summary.sources.length} tone="neutral" locale={locale} />
      </div>

      {/* Per-source health */}
      <section aria-label={t({ es: 'Salud por fuente', en: 'Per-source health' }, locale)}>
        <h2 className="mb-3 font-mono text-label uppercase tracking-[0.15em] text-ink-secondary">
          {t({ es: 'Salud por fuente', en: 'Per-source health' }, locale)}
        </h2>
        <div className="overflow-x-auto border border-line">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-surface-1">
                <th scope="col" className={HEAD}>{t({ es: 'Fuente', en: 'Source' }, locale)}</th>
                <th scope="col" className={HEAD}>{t({ es: 'Dirección', en: 'Direction' }, locale)}</th>
                <th scope="col" className={`${HEAD} text-right`}>OK</th>
                <th scope="col" className={`${HEAD} text-right`}>{t({ es: 'Fallidas', en: 'Failed' }, locale)}</th>
                <th scope="col" className={HEAD}>{t({ es: 'Última', en: 'Last seen' }, locale)}</th>
                <th scope="col" className={HEAD}>{t({ es: 'Estado', en: 'Status' }, locale)}</th>
              </tr>
            </thead>
            <tbody>
              {summary.sources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
                    {t({ es: 'Sin entregas en el periodo.', en: 'No deliveries in this window.' }, locale)}
                  </td>
                </tr>
              ) : (
                summary.sources.map((s) => (
                  <tr key={s.source} className="h-row border-b border-line last:border-b-0">
                    <td className={`${CELL} text-ink-primary`}>{t(sourceLabel(s.source), locale)}</td>
                    <td className={`${CELL} text-ink-secondary`}>{s.direction}</td>
                    <td className={`${CELL} text-right text-ink-primary`} data-numeric>{s.ok}</td>
                    <td className={`${CELL} text-right ${s.failed > 0 ? 'text-negative' : 'text-ink-secondary'}`} data-numeric>
                      {s.failed}
                    </td>
                    <td className={`${CELL} text-ink-secondary`} data-numeric>{formatTimestamp(s.lastSeen, locale)}</td>
                    <td className={CELL}>{s.lastStatus ? <StatusChip status={s.lastStatus} /> : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent deliveries */}
      <section aria-label={t({ es: 'Entregas recientes', en: 'Recent deliveries' }, locale)}>
        <h2 className="mb-3 font-mono text-label uppercase tracking-[0.15em] text-ink-secondary">
          {t({ es: 'Entregas recientes', en: 'Recent deliveries' }, locale)}
        </h2>
        <div className="overflow-x-auto border border-line">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-surface-1">
                <th scope="col" className={HEAD}>{t({ es: 'Fecha', en: 'When' }, locale)}</th>
                <th scope="col" className={HEAD}>{t({ es: 'Fuente', en: 'Source' }, locale)}</th>
                <th scope="col" className={HEAD}>{t({ es: 'Dirección', en: 'Direction' }, locale)}</th>
                <th scope="col" className={HEAD}>{t({ es: 'Estado', en: 'Status' }, locale)}</th>
                <th scope="col" className={HEAD}>{t({ es: 'Referencia', en: 'Reference' }, locale)}</th>
              </tr>
            </thead>
            <tbody>
              {summary.recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
                    {t({ es: 'Sin entregas en el periodo.', en: 'No deliveries in this window.' }, locale)}
                  </td>
                </tr>
              ) : (
                summary.recent.map((d) => (
                  <tr key={d.id} className="h-row border-b border-line last:border-b-0">
                    <td className={`${CELL} text-ink-secondary`} data-numeric>{formatTimestamp(d.occurredAt, locale)}</td>
                    <td className={`${CELL} text-ink-primary`}>{t(sourceLabel(d.source), locale)}</td>
                    <td className={`${CELL} text-ink-secondary`}>{d.direction}</td>
                    <td className={CELL}><StatusChip status={d.status} /></td>
                    <td className={`${CELL} text-ink-secondary`} data-numeric>{d.reference ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
  locale,
}: {
  label: { es: string; en: string }
  value: number
  tone: 'positive' | 'negative' | 'neutral'
  locale: Locale
}) {
  const valueTone = tone === 'positive' ? 'text-positive' : tone === 'negative' ? 'text-negative' : 'text-ink-primary'
  return (
    <div className="flex flex-col gap-2 bg-surface-1 p-4">
      <span className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">{t(label, locale)}</span>
      <span className={`font-mono text-t4 leading-none ${valueTone}`} data-numeric>
        {value}
      </span>
    </div>
  )
}
