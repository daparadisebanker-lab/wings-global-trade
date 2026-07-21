'use client'

// CatalogBrowse — the read-only, cross-category catalog surface for the "pure
// rep" persona (RB read across the PUBLISHED catalog via tower_31, no editable
// lane). It is the ManifestTable-pattern list minus every mutation: no select
// column, no bulk retire, no "new product", no reassign. RLS is the boundary
// (products_read_published); this component simply offers no edit affordance.
//
// Performance law: server pagination (cursor), virtualized past 100 rows, the
// facet list bounded server-side. Filters: category (top-level, from the
// product taxonomy — a pure rep can't read tower.lanes) + name search.
//
// Like ProductTable, it uses raw elements styled against DESIGN_SYSTEM tokens
// because @wings/trade-ui controls carry the public site's brand tokens.
import { useMemo, useRef, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { ProductRow } from '@/lib/actions/catalog'
import { browseColumns } from './columns'
import { useBrowseQuery } from './useBrowseQuery'

const ROW_HEIGHT = 40 // DESIGN_SYSTEM operational density

export function CatalogBrowse({ categories }: { categories: string[] }) {
  const [category, setCategory] = useState<string>('')
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [cursorStack, setCursorStack] = useState<string[]>([])
  const [limit, setLimit] = useState(50)

  const query = useBrowseQuery({
    category: category || undefined,
    search: search || undefined,
    cursor,
    limit,
  })

  const rows = useMemo<ProductRow[]>(() => query.data?.rows ?? [], [query.data])

  const table = useReactTable({
    data: rows,
    columns: browseColumns,
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

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          CAT · Explorar catálogo / Browse
        </span>
        <h1 className="font-display text-t2 text-ink-primary">Catálogo publicado / Published catalog</h1>
        <p className="font-ui text-t0 text-ink-secondary">
          Solo lectura, en todas las categorías. / Read-only, across every category.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Buscar / Search</span>
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
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
            Categoría / Category
          </span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              resetPaging()
            }}
            className="rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
          >
            <option value="">Todas / All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

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

      <div className="flex items-center justify-end gap-3 border-b border-line pb-3">
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
                {hg.headers.map((header) => (
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
                  {row.getVisibleCells().map((cell) => (
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
