import { t, type Locale } from '@/lib/i18n'
import { offerSourceLabel, offerStatusLabel, type SupplierOfferListItem } from '@/lib/actions/suppliers-logic'
import { formatMinor } from '@/lib/money'

// Presentational offer list (table on desktop, cards on mobile) — the FOB price
// history, newest first. Pure; SuppliersView owns the live data + filters.

function priceOf(o: SupplierOfferListItem): string {
  if (o.unitPriceMinor === null) return '—'
  const amount = formatMinor(o.unitPriceMinor, o.currency ?? 'USD')
  return o.priceUnit ? `${amount} · ${o.priceUnit}` : amount
}

function StatusChip({ status, locale }: { status: SupplierOfferListItem['status']; locale: Locale }) {
  const tone = status === 'ACTIVE' ? 'text-positive' : 'text-ink-secondary'
  return (
    <span
      className={`inline-flex items-center rounded-pill border border-line bg-surface-2 px-2 py-0.5 font-mono text-label uppercase tracking-[0.08em] ${tone}`}
    >
      {offerStatusLabel(status, locale)}
    </span>
  )
}

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-top ${className}`}>{children}</td>
}

export function OfferList({ items, locale }: { items: SupplierOfferListItem[]; locale: Locale }) {
  return (
    <>
      {/* Mobile: one card per offer. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((o) => (
          <li key={o.id} className="flex flex-col gap-2 rounded-card border border-line-hairline bg-surface-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium text-ink-primary">{o.productLabel}</span>
              <StatusChip status={o.status} locale={locale} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              <span>{o.supplierName || '—'}</span>
              <span>{offerSourceLabel(o.source, locale)}</span>
              {o.incoterm ? <span>{o.incoterm}</span> : null}
            </div>
            <span className="font-mono text-t0 tabular-nums text-ink-primary" data-numeric>
              {priceOf(o)}
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-t0 text-ink-secondary">
              {o.moq ? <span>MOQ {o.moq}</span> : null}
              {o.leadTimeDays !== null ? (
                <span>{t({ es: `${o.leadTimeDays} días`, en: `${o.leadTimeDays} days` }, locale)}</span>
              ) : null}
              {o.port ? <span>{o.port}</span> : null}
            </div>
            <span className="font-mono text-label text-ink-secondary" data-numeric>
              {o.createdAt.slice(0, 10)}
            </span>
          </li>
        ))}
      </ul>

      {/* Desktop: the table. */}
      <div className="hidden overflow-x-auto rounded-card border border-line-hairline md:block">
        <table className="w-full border-collapse text-t0">
          <thead>
            <tr className="border-b border-line-hairline text-left font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              <Cell>{t({ es: 'Producto', en: 'Product' }, locale)}</Cell>
              <Cell>{t({ es: 'Proveedor', en: 'Supplier' }, locale)}</Cell>
              <Cell className="text-right">{t({ es: 'Precio FOB', en: 'FOB price' }, locale)}</Cell>
              <Cell>Incoterm</Cell>
              <Cell>MOQ</Cell>
              <Cell>{t({ es: 'Plazo', en: 'Lead time' }, locale)}</Cell>
              <Cell>{t({ es: 'Puerto', en: 'Port' }, locale)}</Cell>
              <Cell>{t({ es: 'Origen', en: 'Source' }, locale)}</Cell>
              <Cell>{t({ es: 'Estado', en: 'Status' }, locale)}</Cell>
              <Cell className="text-right">{t({ es: 'Captura', en: 'Captured' }, locale)}</Cell>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="border-b border-line-hairline last:border-0 hover:bg-surface-2">
                <Cell className="text-ink-primary">
                  <span className="font-medium">{o.productLabel}</span>
                  {o.hsCode ? (
                    <span className="mt-0.5 block font-mono text-label text-ink-secondary">HS {o.hsCode}</span>
                  ) : null}
                </Cell>
                <Cell className="text-ink-secondary">
                  {o.supplierName || '—'}
                  {o.supplierCountry ? (
                    <span className="mt-0.5 block font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                      {o.supplierCountry}
                    </span>
                  ) : null}
                </Cell>
                <Cell className="text-right font-mono tabular-nums text-ink-primary" data-numeric>
                  {priceOf(o)}
                </Cell>
                <Cell className="font-mono text-ink-secondary">{o.incoterm ?? '—'}</Cell>
                <Cell className="text-ink-secondary">{o.moq ?? '—'}</Cell>
                <Cell className="text-ink-secondary">
                  {o.leadTimeDays !== null
                    ? t({ es: `${o.leadTimeDays} días`, en: `${o.leadTimeDays} days` }, locale)
                    : '—'}
                </Cell>
                <Cell className="text-ink-secondary">{o.port ?? '—'}</Cell>
                <Cell className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                  {offerSourceLabel(o.source, locale)}
                </Cell>
                <Cell>
                  <StatusChip status={o.status} locale={locale} />
                </Cell>
                <Cell className="text-right font-mono text-ink-secondary tabular-nums" data-numeric>
                  {o.createdAt.slice(0, 10)}
                </Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
