'use client'

// Catalog Studio's ManifestTable-pattern list (COMPONENT_TREE §1). Server
// pagination via cursor (API_MAP), virtualized past 100 rows (ARCHITECTURE
// performance budget), filters: status / category text search / lane.
// Bulk actions: retire, export. "Reassign" (COMPONENT_TREE) is intentionally
// not implemented — DATABASE_SCHEMA has no owner/assignee column on
// `products` to reassign to; see components/catalog/README.md.
//
// `@wings/trade-ui`'s Button/Input/Select are styled for the public site's
// gold/navy brand tokens (not TOWER's graphite control-room tokens) and
// would render unstyled under `[data-app="tower"]`, so this table uses raw
// elements styled directly against DESIGN_SYSTEM tokens instead.
import { useMemo, useRef, useState, useTransition } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import Link from 'next/link'
import { retireProduct, type EditableLane, type ProductRow } from '@/lib/actions/catalog'
import type { ProductStatus } from '@/lib/actions/catalog-logic'
import { productColumns } from './columns'
import { useProductsQuery } from './useProductsQuery'

const ROW_HEIGHT = 40 // DESIGN_SYSTEM operational density (compact toggle = 32)
const STATUS_OPTIONS: (ProductStatus | 'ALL')[] = ['ALL', 'DRAFT', 'IN_REVIEW', 'PUBLISHED', 'RETIRED']

function toCsv(rows: ProductRow[]): string {
  const header = ['slug', 'status', 'category_path', 'name_es', 'name_en', 'moq', 'cbm_per_unit', 'updated_at']
  const lines = rows.map((r) =>
    [r.slug, r.status, r.categoryPath.join('|'), r.name.es, r.name.en, r.moq ?? '', r.cbmPerUnit ?? '', r.updatedAt]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

function downloadCsv(csv: string, fileName: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export function ProductTable({
  lanes,
  initialLaneId,
  canCreateAny,
}: {
  lanes: EditableLane[]
  initialLaneId?: string
  canCreateAny: boolean
}) {
  const [laneId, setLaneId] = useState<string | undefined>(initialLaneId)
  const [status, setStatus] = useState<ProductStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [cursorStack, setCursorStack] = useState<string[]>([])
  const [limit, setLimit] = useState(50)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [banner, setBanner] = useState<{ tone: 'positive' | 'negative'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const query = useProductsQuery({
    laneId,
    status: status === 'ALL' ? undefined : status,
    search: search || undefined,
    cursor,
    limit,
  })

  const rows = useMemo(() => query.data?.rows ?? [], [query.data])

  const table = useReactTable({
    data: rows,
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  const parentRef = useRef<HTMLDivElement>(null)
  const tableRows = table.getRowModel().rows
  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  })

  function resetPaging() {
    setCursor(undefined)
    setCursorStack([])
  }

  function goNext() {
    if (!query.data?.nextCursor) return
    setCursorStack((s) => [...s, cursor ?? ''])
    setCursor(query.data.nextCursor)
  }

  function goPrev() {
    setCursorStack((s) => {
      const copy = [...s]
      const prev = copy.pop()
      setCursor(prev ? prev : undefined)
      return copy
    })
  }

  function toggleSelected(id: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((s) => (s.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))))
  }

  function bulkRetire() {
    const ids = [...selected]
    if (ids.length === 0) return
    startTransition(async () => {
      const results = await Promise.allSettled(ids.map((id) => retireProduct(id)))
      const succeeded = results.filter((r) => r.status === 'fulfilled' && !r.value.error).length
      const failed = results.length - succeeded
      setBanner(
        failed === 0
          ? { tone: 'positive', text: `${succeeded} producto(s) retirado(s). / ${succeeded} product(s) retired.` }
          : {
              tone: 'negative',
              text: `${succeeded} retirado(s), ${failed} sin permiso o inválido(s). / ${succeeded} retired, ${failed} forbidden or invalid.`,
            },
      )
      setSelected(new Set())
      await query.refetch()
    })
  }

  function exportCsv() {
    downloadCsv(toCsv(rows), `tower-catalog-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const newHref = laneId ? `/catalog/new?lane=${laneId}` : lanes[0] ? `/catalog/new?lane=${lanes[0].laneId}` : '/catalog/new'

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              Buscar / Search
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                resetPaging()
              }}
              placeholder="Nombre ES/EN…"
              className="w-56 rounded-card border border-line bg-surface-1 px-3 py-2 font-ui text-t0 text-ink-primary outline-none placeholder:text-ink-secondary focus-visible:border-lane-accent"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Estado / Status</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ProductStatus | 'ALL')
                resetPaging()
              }}
              className="rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          {lanes.length > 1 ? (
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Lane</span>
              <select
                value={laneId ?? ''}
                onChange={(e) => {
                  setLaneId(e.target.value || undefined)
                  resetPaging()
                }}
                className="rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
              >
                <option value="">Todas / All</option>
                {lanes.map((l) => (
                  <option key={l.laneId} value={l.laneId}>
                    {l.laneCode} · {l.laneName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Filas / Rows</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                resetPaging()
              }}
              className="rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            >
              {[50, 100, 200].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        {canCreateAny ? (
          <Link
            href={newHref}
            className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
          >
            Nuevo producto / New product
          </Link>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={bulkRetire}
            disabled={selected.size === 0 || isPending}
            className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-negative disabled:opacity-40"
          >
            Retirar ({selected.size}) / Retire
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
          >
            Exportar CSV / Export
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={cursorStack.length === 0 && !cursor}
            className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary disabled:opacity-40"
          >
            ← Anterior / Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!query.data?.nextCursor}
            className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary disabled:opacity-40"
          >
            Siguiente / Next →
          </button>
        </div>
      </div>

      {banner ? (
        <p role="status" className={`font-ui text-t0 ${banner.tone === 'positive' ? 'text-positive' : 'text-negative'}`}>
          {banner.text}
        </p>
      ) : null}

      {query.error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          No se pudo cargar el catálogo / Could not load catalog: {query.error.message}
        </p>
      ) : null}

      <div ref={parentRef} className="flex-1 overflow-auto rounded-card border border-line">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-surface-1">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-line">
                <th className="w-9 px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todo / Select all"
                    checked={rows.length > 0 && selected.size === rows.length}
                    onChange={toggleAll}
                  />
                </th>
                {hg.headers.slice(1).map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left font-mono text-label uppercase tracking-[0.1em] text-ink-secondary"
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody style={{ height: virtualizer.getTotalSize(), position: 'relative', display: 'block' }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = tableRows[virtualRow.index]
              return (
                <tr
                  key={row.id}
                  className="absolute left-0 flex w-full items-center border-b border-line hover:bg-surface-1"
                  style={{ top: virtualRow.start, height: virtualRow.size }}
                >
                  <td className="w-9 flex-none px-3">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar ${row.original.slug}`}
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelected(row.id)}
                    />
                  </td>
                  {row.getVisibleCells().slice(1).map((cell) => (
                    <td
                      key={cell.id}
                      className="flex-none overflow-hidden text-ellipsis whitespace-nowrap px-3"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>

        {!query.isLoading && rows.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <p className="font-ui text-t0 text-ink-secondary">
              Sin productos con estos filtros / No products match these filters.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
