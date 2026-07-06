'use client'

// Column defs for ProductTable. `views(7d)` from COMPONENT_TREE is
// intentionally omitted — that number comes from `tower.metric_rollups_daily`
// (Signal Deck, Wave 4), which doesn't exist yet; fabricating it here would
// violate "rollups, not raw events, behind any chart" by inventing data with
// no chart or rollup behind it at all. Add it back once Signal Deck ships.
import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'
import { DEFAULT_LOCALE, t } from '@/lib/i18n'
import type { ProductRow } from '@/lib/actions/catalog'
import { StatusStamp } from './StatusStamp'

const columnHelper = createColumnHelper<ProductRow>()

function formatUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return iso
  }
}

export const productColumns = [
  columnHelper.display({
    id: 'select',
    size: 36,
  }),
  columnHelper.accessor('status', {
    header: 'Estado / Status',
    cell: (info) => <StatusStamp status={info.getValue()} />,
    size: 140,
  }),
  columnHelper.accessor((row) => t(row.name, DEFAULT_LOCALE), {
    id: 'name',
    header: 'Nombre / Name',
    cell: (info) => (
      <Link
        href={`/catalog/${info.row.original.id}`}
        className="font-ui text-t0 text-ink-primary underline-offset-2 hover:text-lane-accent hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
    size: 320,
  }),
  columnHelper.accessor((row) => row.categoryPath.join(' / '), {
    id: 'category',
    header: 'Categoría / Category',
    cell: (info) => <span className="font-ui text-t0 text-ink-secondary">{info.getValue() || '—'}</span>,
    size: 220,
  }),
  columnHelper.accessor('cbmPerUnit', {
    header: 'CBM',
    cell: (info) => (
      <span data-numeric className="font-mono text-t0 text-ink-primary">
        {info.getValue() ?? '—'}
      </span>
    ),
    size: 90,
  }),
  columnHelper.accessor('moq', {
    header: 'MOQ',
    cell: (info) => (
      <span data-numeric className="font-mono text-t0 text-ink-primary">
        {info.getValue() ?? '—'}
      </span>
    ),
    size: 90,
  }),
  columnHelper.accessor('updatedAt', {
    header: 'Actualizado / Updated',
    cell: (info) => (
      <span data-numeric className="font-mono text-t0 text-ink-secondary">
        {formatUpdated(info.getValue())}
      </span>
    ),
    size: 140,
  }),
]
