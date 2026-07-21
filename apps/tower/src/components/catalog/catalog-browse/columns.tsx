'use client'

// Read-only column defs for the pure-rep CatalogBrowse. No `select` column and
// no row actions (the persona has no edit permission — RLS enforces, the UI
// simply offers no affordance). Name links to the read-only spec view. Numbers
// (CBM/MOQ/HS) are tabular mono — "numbers are exhibited, not hidden".
import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'
import { DEFAULT_LOCALE, t } from '@/lib/i18n'
import type { ProductRow } from '@/lib/actions/catalog'

const columnHelper = createColumnHelper<ProductRow>()

function formatUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return iso
  }
}

export const browseColumns = [
  columnHelper.accessor((row) => t(row.name, DEFAULT_LOCALE), {
    id: 'name',
    header: 'Nombre / Name',
    cell: (info) => (
      <Link
        href={`/catalog/browse/${info.row.original.id}`}
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
    size: 240,
  }),
  columnHelper.accessor('hsCode', {
    header: 'HS',
    cell: (info) => (
      <span data-numeric className="font-mono text-t0 text-ink-primary">
        {info.getValue() ?? '—'}
      </span>
    ),
    size: 120,
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
