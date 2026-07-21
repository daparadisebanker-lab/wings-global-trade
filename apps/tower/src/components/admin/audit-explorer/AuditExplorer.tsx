'use client'

// <AuditExplorer> (COMPONENT_TREE §6) — group-admin-only, filterable,
// append-only view of tower.audit_log. Filters (table / action / actor / lane /
// brand / date range) and the keyset page are ALL applied in SQL by
// `listAuditLog` — this component never fetches-all. Rows virtualize past 100
// (react-virtual, fixed 40px rows per DESIGN_SYSTEM density). Selecting a row
// opens <AuditRowDetail> with the readable JSON diff.
//
// Like the other TOWER tables, this styles raw elements against DESIGN_SYSTEM
// tokens rather than @wings/trade-ui primitives (those carry the public site's
// gold/navy brand, not TOWER's graphite control-room tokens).
import { useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { AuditFacets, AuditLogRow, ListAuditInput } from '@/lib/actions/audit'
import type { AuditAction } from '@/lib/actions/audit-logic'
import { useAuditQuery } from './useAuditQuery'
import { ActionStamp } from './ActionStamp'
import { AuditRowDetail } from './AuditRowDetail'

const ROW_HEIGHT = 40 // DESIGN_SYSTEM operational density

const FIELD_LABEL = 'font-mono text-label uppercase tracking-[0.1em] text-ink-secondary'
const SELECT_CLS =
  'rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'

/** datetime-local value → ISO with offset (what the action's Zod expects), or undefined. */
function toIso(local: string): string | undefined {
  if (!local) return undefined
  const d = new Date(local)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

function formatTimestamp(at: string, locale: Locale): string {
  const d = new Date(at)
  if (Number.isNaN(d.getTime())) return at
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-PE' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d)
}

export function AuditExplorer({ facets, locale = DEFAULT_LOCALE }: { facets: AuditFacets; locale?: Locale }) {
  const [tableName, setTableName] = useState<string>('')
  const [action, setAction] = useState<string>('')
  const [actor, setActor] = useState<string>('')
  const [laneId, setLaneId] = useState<string>('')
  const [brandId, setBrandId] = useState<string>('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [limit, setLimit] = useState(50)
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [cursorStack, setCursorStack] = useState<string[]>([])
  const [selected, setSelected] = useState<AuditLogRow | null>(null)

  const input: ListAuditInput = useMemo(
    () => ({
      tableName: (tableName || undefined) as ListAuditInput['tableName'],
      action: (action || undefined) as AuditAction | undefined,
      actor: actor || undefined,
      laneId: laneId || undefined,
      brandId: brandId || undefined,
      from: toIso(from),
      to: toIso(to),
      cursor,
      limit,
    }),
    [tableName, action, actor, laneId, brandId, from, to, cursor, limit],
  )

  const query = useAuditQuery(input)
  const rows = useMemo(() => query.data?.rows ?? [], [query.data])

  const actorName = useMemo(() => new Map(facets.actors.map((a) => [a.id, a.name])), [facets.actors])

  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  })

  function resetPaging() {
    setCursor(undefined)
    setCursorStack([])
  }

  function onFilterChange<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      resetPaging()
    }
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
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          ADM · Audit
        </span>
        <h1 className="font-display text-t3 text-ink-primary">{t({ es: 'Auditoría', en: 'Audit' }, locale)}</h1>
      </header>

      {/* Filters — every one applied in SQL. */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className={FIELD_LABEL}>{t({ es: 'Tabla', en: 'Table' }, locale)}</span>
          <select value={tableName} onChange={(e) => onFilterChange(setTableName)(e.target.value)} className={SELECT_CLS}>
            <option value="">{t({ es: 'Todas', en: 'All' }, locale)}</option>
            {facets.tables.map((tbl) => (
              <option key={tbl} value={tbl}>
                {tbl}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={FIELD_LABEL}>{t({ es: 'Acción', en: 'Action' }, locale)}</span>
          <select value={action} onChange={(e) => onFilterChange(setAction)(e.target.value)} className={SELECT_CLS}>
            <option value="">{t({ es: 'Todas', en: 'All' }, locale)}</option>
            {facets.actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={FIELD_LABEL}>{t({ es: 'Actor', en: 'Actor' }, locale)}</span>
          <select value={actor} onChange={(e) => onFilterChange(setActor)(e.target.value)} className={SELECT_CLS}>
            <option value="">{t({ es: 'Todos', en: 'All' }, locale)}</option>
            {facets.actors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={FIELD_LABEL}>{t({ es: 'Lane', en: 'Lane' }, locale)}</span>
          <select value={laneId} onChange={(e) => onFilterChange(setLaneId)(e.target.value)} className={SELECT_CLS}>
            <option value="">{t({ es: 'Todas', en: 'All' }, locale)}</option>
            {facets.lanes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.code} · {l.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={FIELD_LABEL}>{t({ es: 'Marca', en: 'Brand' }, locale)}</span>
          <select value={brandId} onChange={(e) => onFilterChange(setBrandId)(e.target.value)} className={SELECT_CLS}>
            <option value="">{t({ es: 'Todas', en: 'All' }, locale)}</option>
            {facets.brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={FIELD_LABEL}>{t({ es: 'Desde', en: 'From' }, locale)}</span>
          <input
            type="datetime-local"
            value={from}
            onChange={(e) => onFilterChange(setFrom)(e.target.value)}
            className={SELECT_CLS}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={FIELD_LABEL}>{t({ es: 'Hasta', en: 'To' }, locale)}</span>
          <input
            type="datetime-local"
            value={to}
            onChange={(e) => onFilterChange(setTo)(e.target.value)}
            className={SELECT_CLS}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={FIELD_LABEL}>{t({ es: 'Filas', en: 'Rows' }, locale)}</span>
          <select
            value={limit}
            onChange={(e) => onFilterChange(setLimit)(Number(e.target.value))}
            className={SELECT_CLS}
          >
            {[50, 100, 200].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Paging */}
      <div className="flex items-center justify-end gap-3 border-b border-line pb-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={cursorStack.length === 0 && !cursor}
          className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary disabled:opacity-40"
        >
          ← {t({ es: 'Anterior', en: 'Prev' }, locale)}
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!query.data?.nextCursor}
          className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary disabled:opacity-40"
        >
          {t({ es: 'Siguiente', en: 'Next' }, locale)} →
        </button>
      </div>

      {query.error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {t({ es: 'No se pudo cargar la auditoría', en: 'Could not load the audit log' }, locale)}: {query.error.message}
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1 gap-4">
        {/* Virtualized log */}
        <div ref={parentRef} className="min-w-0 flex-1 overflow-auto rounded-card border border-line">
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface-1 px-3 py-2">
            <span className={`${FIELD_LABEL} w-44 flex-none`}>{t({ es: 'Fecha', en: 'When' }, locale)}</span>
            <span className={`${FIELD_LABEL} w-28 flex-none`}>{t({ es: 'Acción', en: 'Action' }, locale)}</span>
            <span className={`${FIELD_LABEL} w-40 flex-none`}>{t({ es: 'Tabla', en: 'Table' }, locale)}</span>
            <span className={`${FIELD_LABEL} min-w-0 flex-1`}>{t({ es: 'Fila', en: 'Row' }, locale)}</span>
            <span className={`${FIELD_LABEL} w-40 flex-none`}>{t({ es: 'Actor', en: 'Actor' }, locale)}</span>
          </div>

          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((vRow) => {
              const row = rows[vRow.index]
              const isSelected = selected?.id === row.id
              return (
                <button
                  type="button"
                  key={row.id}
                  onClick={() => setSelected(row)}
                  aria-pressed={isSelected}
                  className={`absolute left-0 flex w-full items-center gap-3 border-b border-line px-3 text-left hover:bg-surface-1 ${
                    isSelected ? 'bg-surface-1' : ''
                  }`}
                  style={{ top: vRow.start, height: vRow.size }}
                >
                  <span className="w-44 flex-none font-mono text-label text-ink-secondary" data-numeric>
                    {formatTimestamp(row.at, locale)}
                  </span>
                  <span className="w-28 flex-none">
                    <ActionStamp action={row.action} />
                  </span>
                  <span className="w-40 flex-none truncate font-mono text-label text-ink-primary">{row.tableName}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-label text-ink-secondary" data-numeric>
                    {row.rowId ?? '—'}
                  </span>
                  <span className="w-40 flex-none truncate font-mono text-label text-ink-secondary">
                    {row.actor ? (actorName.get(row.actor) ?? row.actor) : t({ es: 'sistema', en: 'system' }, locale)}
                  </span>
                </button>
              )
            })}
          </div>

          {!query.isLoading && rows.length === 0 ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <p className="font-ui text-t0 text-ink-secondary">
                {t({ es: 'Sin registros con estos filtros.', en: 'No entries match these filters.' }, locale)}
              </p>
            </div>
          ) : null}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="w-[28rem] max-w-[45%] flex-none">
            <AuditRowDetail row={selected} onClose={() => setSelected(null)} locale={locale} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
