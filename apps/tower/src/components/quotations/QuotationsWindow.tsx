import Link from 'next/link'
import { cn } from '@wings/trade-ui'
import { t, type Locale } from '@/lib/i18n'
import { formatMinor } from '@/lib/money'
import type { QuotationListItem } from '@/lib/actions/quotations-logic'
import { IssueButton } from './IssueButton'

// The Quotations window — a standalone list of every quotation the caller can
// see (draft + issued), each opening its printable proforma. Responsive: a table
// on desktop, stacked cards on mobile (a 7-column table never scrolls sideways on
// a phone). Issuing (the binding mint) is the IssueButton client island.

const TAG = 'COT · Cotizaciones'
const TITLE = { es: 'Cotizaciones', en: 'Quotations' }

const STATUS_STYLE: Record<string, string> = {
  DRAFT: 'text-ink-secondary',
  SENT: 'text-accent',
  ACCEPTED: 'text-positive',
  REJECTED: 'text-ink-secondary',
  EXPIRED: 'text-ink-secondary',
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn('shrink-0 font-mono text-label uppercase tracking-[0.1em]', STATUS_STYLE[status] ?? 'text-ink-secondary')}>
      {status}
    </span>
  )
}

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-middle ${className}`}>{children}</td>
}

export function QuotationsWindow({ items, locale }: { items: QuotationListItem[]; locale: Locale }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          {TAG}
        </span>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-h2 font-semibold">{t(TITLE, locale)}</h1>
          <span className="font-mono text-label text-ink-secondary" data-numeric>
            {items.length}
          </span>
        </div>
        <p className="max-w-prose text-body-sm text-ink-secondary">
          {t(
            {
              es: 'Cotizaciones borrador y emitidas. Ábrelas para imprimir. Pídele a Mister “ármame una cotización” para crear una nueva.',
              en: 'Draft and issued quotations. Open one to print. Ask Mister “build me a quote” to create a new one.',
            },
            locale,
          )}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-card border border-hairline bg-surface-1 p-8 text-center text-body-sm text-ink-secondary">
          {t(
            {
              es: 'Todavía no hay cotizaciones. Genera la primera con Mister.',
              en: 'No quotations yet. Create the first one with Mister.',
            },
            locale,
          )}
        </div>
      ) : (
        <>
          {/* Mobile: one card per quotation — the total is the headline. */}
          <ul className="flex flex-col gap-3 md:hidden">
            {items.map((q) => (
              <li key={q.id} className="flex flex-col gap-3 rounded-card border border-hairline bg-surface-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-mono text-t0 text-ink-primary" data-numeric>
                      {q.quoteNo ?? t({ es: 'Borrador', en: 'Draft' }, locale)}
                    </span>
                    <span className="truncate text-body-sm text-ink-secondary">{q.clientName ?? '—'}</span>
                  </div>
                  <StatusPill status={q.status} />
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-t2 tabular-nums text-ink-primary" data-numeric>
                    {formatMinor(q.totalMinor, q.currency)}
                  </span>
                  <span
                    className="shrink-0 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary"
                    data-numeric
                  >
                    {q.laneSlug ? `${q.laneSlug} · ` : ''}
                    {q.createdAt.slice(0, 10)}
                  </span>
                </div>
                <div className="flex items-center gap-6 border-t border-hairline pt-3">
                  {q.status === 'DRAFT' ? <IssueButton quoteId={q.id} locale={locale} /> : null}
                  <Link
                    href={`/proforma/${q.id}/document`}
                    className="font-mono text-label uppercase tracking-[0.1em] text-accent"
                  >
                    {t({ es: 'Proforma', en: 'Proforma' }, locale)}
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: the full manifest table. */}
          <div className="hidden overflow-x-auto rounded-card border border-hairline md:block">
            <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-hairline text-left font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                <Cell>{t({ es: 'Número', en: 'Number' }, locale)}</Cell>
                <Cell>{t({ es: 'Cliente', en: 'Client' }, locale)}</Cell>
                <Cell>{t({ es: 'Lane', en: 'Lane' }, locale)}</Cell>
                <Cell>{t({ es: 'Estado', en: 'Status' }, locale)}</Cell>
                <Cell className="text-right">{t({ es: 'Total', en: 'Total' }, locale)}</Cell>
                <Cell className="text-right">{t({ es: 'Fecha', en: 'Date' }, locale)}</Cell>
                <Cell className="text-right">{t({ es: 'Abrir', en: 'Open' }, locale)}</Cell>
              </tr>
            </thead>
            <tbody>
              {items.map((q) => (
                <tr key={q.id} className="border-b border-hairline last:border-0 hover:bg-surface-2">
                  <Cell className="font-mono" >
                    {q.quoteNo ?? (
                      <span className="text-ink-secondary">{t({ es: 'borrador', en: 'draft' }, locale)}</span>
                    )}
                  </Cell>
                  <Cell>{q.clientName ?? <span className="text-ink-tertiary">—</span>}</Cell>
                  <Cell className="font-mono uppercase text-ink-secondary">{q.laneSlug ?? '—'}</Cell>
                  <Cell>
                    <StatusPill status={q.status} />
                  </Cell>
                  <Cell className="text-right font-mono tabular-nums" data-numeric>
                    {formatMinor(q.totalMinor, q.currency)}
                  </Cell>
                  <Cell className="text-right font-mono text-ink-secondary tabular-nums" data-numeric>
                    {q.createdAt.slice(0, 10)}
                  </Cell>
                  <Cell className="text-right">
                    <div className="flex items-center justify-end gap-4">
                      {q.status === 'DRAFT' ? <IssueButton quoteId={q.id} locale={locale} /> : null}
                      <Link
                        href={`/proforma/${q.id}/document`}
                        className="font-mono text-label uppercase tracking-[0.1em] text-accent hover:underline"
                      >
                        {t({ es: 'Proforma', en: 'Proforma' }, locale)}
                      </Link>
                    </div>
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  )
}
