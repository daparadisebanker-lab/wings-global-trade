import Link from 'next/link'
import { t, type Locale } from '@/lib/i18n'
import { formatMinor } from '@/lib/money'
import type { QuotationListItem } from '@/lib/actions/quotations-logic'

// The Quotations window — a standalone list of every quotation the caller can
// see (draft + issued), each opening its printable proforma. Read-only surface;
// issuing (the binding mint) and Mister's save-draft land in the next sub-slices.

const TAG = 'COT · Cotizaciones'
const TITLE = { es: 'Cotizaciones', en: 'Quotations' }

const STATUS_STYLE: Record<string, string> = {
  DRAFT: 'text-ink-secondary',
  SENT: 'text-accent',
  ACCEPTED: 'text-positive',
  REJECTED: 'text-ink-secondary',
  EXPIRED: 'text-ink-secondary',
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
        <div className="overflow-x-auto rounded-card border border-hairline">
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
                    <span className={`font-mono text-label uppercase tracking-[0.1em] ${STATUS_STYLE[q.status] ?? 'text-ink-secondary'}`}>
                      {q.status}
                    </span>
                  </Cell>
                  <Cell className="text-right font-mono tabular-nums" data-numeric>
                    {formatMinor(q.totalMinor, q.currency)}
                  </Cell>
                  <Cell className="text-right font-mono text-ink-secondary tabular-nums" data-numeric>
                    {q.createdAt.slice(0, 10)}
                  </Cell>
                  <Cell className="text-right">
                    <Link
                      href={`/proforma/${q.id}/document`}
                      className="font-mono text-label uppercase tracking-[0.1em] text-accent hover:underline"
                    >
                      {t({ es: 'Proforma', en: 'Proforma' }, locale)}
                    </Link>
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
