'use client'

// Mobile card for one catalog ProductRow — the below-md fallback for the
// virtualized ProductTable / CatalogBrowse (a 7-column manifest table can't fit a
// 390px viewport without sideways scroll, and its header desyncs from the body).
// Exhibits the same fields as the table columns, numerals in tabular mono. The
// selection checkbox (edit surfaces only) is wrapped in a ≥44px tap target.
import Link from 'next/link'
import { DEFAULT_LOCALE, t } from '@/lib/i18n'
import type { ProductRow } from '@/lib/actions/catalog'
import { StatusStamp } from './product-table/StatusStamp'

function formatUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return iso
  }
}

function Metric({ label, value }: { label: string; value: string | number | null }) {
  return (
    <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
      {label}{' '}
      <span data-numeric className="text-ink-primary">
        {value ?? '—'}
      </span>
    </span>
  )
}

export function ProductCard({
  row,
  selected,
  onToggleSelected,
}: {
  row: ProductRow
  /** Selection state — present only on the editable surface (ProductTable). */
  selected?: boolean
  onToggleSelected?: (id: string) => void
}) {
  const name = t(row.name, DEFAULT_LOCALE)
  const category = row.categoryPath.join(' / ')
  return (
    <li className="flex flex-col gap-3 rounded-card border border-line bg-surface-1 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          {onToggleSelected ? (
            // 44px tap target; negative margin keeps the visual checkbox aligned.
            <label className="-ml-1 -mt-1 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[color:var(--accent)]"
                aria-label={`Seleccionar ${row.slug} / Select ${row.slug}`}
                checked={!!selected}
                onChange={() => onToggleSelected(row.id)}
              />
            </label>
          ) : null}
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link
              href={`/catalog/${row.id}`}
              className="truncate font-ui text-t0 text-ink-primary underline-offset-2 hover:text-lane-accent hover:underline"
            >
              {name}
            </Link>
            <span className="truncate font-mono text-label text-ink-secondary">{row.slug}</span>
          </div>
        </div>
        <StatusStamp status={row.status} className="shrink-0" />
      </div>

      {category ? <p className="font-ui text-t0 text-ink-secondary">{category}</p> : null}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-3">
        <Metric label="CBM" value={row.cbmPerUnit} />
        <Metric label="MOQ" value={row.moq} />
        <span className="ml-auto font-mono text-label text-ink-secondary" data-numeric>
          {formatUpdated(row.updatedAt)}
        </span>
      </div>
    </li>
  )
}
