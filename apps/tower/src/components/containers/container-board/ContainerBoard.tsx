'use client'

// Container Desk board (COMPONENT_TREE §3): columns by status
// OPEN→FILLING→BOOKED→IN_TRANSIT→ARRIVED→CLEARED→CLOSED. Server-paginated
// (cursor, per API_MAP) — the board accumulates pages via "Load more" rather
// than true per-column infinite scroll (flagged in components/containers/README.md).
import { useMemo, useState } from 'react'
import type { ContainerRow } from '@/lib/actions/containers-types'
import { CONTAINER_STATUSES } from '@/lib/actions/containers-types'
import { ContainerCard } from './ContainerCard'
import { OpenContainerForm } from './OpenContainerForm'
import { useContainersQuery } from './useContainersQuery'

export interface ContainerBoardLane {
  laneId: string
  laneCode: string
  laneName: string
}

export function ContainerBoard({
  lanes,
  initialLaneId,
  canOpenContainer,
}: {
  lanes: ContainerBoardLane[]
  initialLaneId?: string
  canOpenContainer: boolean
}) {
  const [laneId, setLaneId] = useState<string | undefined>(initialLaneId)
  const [accumulated, setAccumulated] = useState<ContainerRow[]>([])
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [showOpenForm, setShowOpenForm] = useState(false)

  const query = useContainersQuery({ laneId, cursor, limit: 100 })

  // Merge each fetched page into the accumulated set (keyed by id — a lane/
  // filter change resets via `key` below rather than trying to reconcile).
  const rows = useMemo(() => {
    const page = query.data?.rows ?? []
    if (cursor === undefined) return page
    const byId = new Map(accumulated.map((r) => [r.id, r]))
    for (const r of page) byId.set(r.id, r)
    return [...byId.values()]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data])

  const columns = useMemo(() => {
    const byStatus = new Map<string, ContainerRow[]>(CONTAINER_STATUSES.map((s) => [s, []]))
    for (const row of rows) byStatus.get(row.status)?.push(row)
    return byStatus
  }, [rows])

  function changeLane(next: string | undefined) {
    setLaneId(next)
    setCursor(undefined)
    setAccumulated([])
  }

  function loadMore() {
    if (!query.data?.nextCursor) return
    setAccumulated(rows)
    setCursor(query.data.nextCursor)
  }

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          {lanes.length > 1 ? (
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Lane</span>
              <select
                value={laneId ?? ''}
                onChange={(e) => changeLane(e.target.value || undefined)}
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
        </div>

        {canOpenContainer && laneId ? (
          <button
            type="button"
            onClick={() => setShowOpenForm((s) => !s)}
            className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
          >
            Abrir contenedor / Open container
          </button>
        ) : null}
      </div>

      {showOpenForm && laneId ? (
        <OpenContainerForm
          laneId={laneId}
          onClose={() => setShowOpenForm(false)}
          onOpened={() => {
            setShowOpenForm(false)
            setAccumulated([])
            setCursor(undefined)
            void query.refetch()
          }}
        />
      ) : null}

      {query.error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          No se pudieron cargar los contenedores / Could not load containers: {query.error.message}
        </p>
      ) : null}

      {/* Mobile: one focused column with a peek, scroll-snapped; desktop: fixed
          288px columns. Mirrors the Pipeline board. */}
      <div className="-mx-6 flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto px-6 scroll-p-6 md:mx-0 md:px-0">
        {CONTAINER_STATUSES.map((status) => {
          const items = columns.get(status) ?? []
          return (
            <div
              key={status}
              className="flex w-[86vw] max-w-[20rem] flex-shrink-0 snap-start flex-col gap-3 md:w-72 md:max-w-none"
            >
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">{status}</span>
                <span className="font-mono text-label text-ink-secondary" data-numeric>
                  {items.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto">
                {items.map((c) => (
                  <ContainerCard key={c.id} container={c} />
                ))}
                {items.length === 0 ? <p className="font-ui text-t0 text-ink-secondary">—</p> : null}
              </div>
            </div>
          )
        })}
      </div>

      {query.data?.nextCursor ? (
        <button
          type="button"
          onClick={loadMore}
          className="self-center rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
        >
          Cargar más / Load more
        </button>
      ) : null}
    </div>
  )
}
