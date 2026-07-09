'use client'

// Pipeline (CRM) board (COMPONENT_TREE §2 <PipelineBoard>): columns are the
// active lane's archetype stage set — never configurable per-user, never
// hardcoded here. Cards are RFQs; a lightweight inline form creates a new one.
import { useMemo, useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getStages } from '@/lib/archetypes'
import type { EditableLane } from '@/lib/actions/catalog'
import {
  createRFQ,
  getPipelineCapabilities,
  listAccountsForBrand,
  updateStage,
  type AccountOption,
  type RfqRow,
  type RfqSource,
} from '@/lib/actions/pipeline'
import { RfqCard } from './RfqCard'
import { useRfqsQuery } from './useRfqsQuery'

const SOURCE_OPTIONS: RfqSource[] = ['MANUAL', 'RFQ_FORM', 'WHATSAPP', 'MISTER', 'ADVISOR']

export function PipelineBoard({ lanes, initialLaneId }: { lanes: EditableLane[]; initialLaneId?: string }) {
  const [laneId, setLaneId] = useState<string | undefined>(initialLaneId ?? lanes[0]?.laneId)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newAccountId, setNewAccountId] = useState<string>('')
  const [newSource, setNewSource] = useState<RfqSource>('MANUAL')
  const [newCurrency, setNewCurrency] = useState('USD')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const lane = lanes.find((l) => l.laneId === laneId)

  const capsQuery = useQuery({
    queryKey: ['tower', 'pipeline', 'capabilities', laneId],
    queryFn: async () => {
      if (!laneId) return null
      const result = await getPipelineCapabilities(laneId)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    enabled: Boolean(laneId),
  })

  const accountsQuery = useQuery({
    queryKey: ['tower', 'pipeline', 'accounts', lane?.brandId],
    queryFn: async () => {
      if (!lane) return [] as AccountOption[]
      const result = await listAccountsForBrand(lane.brandId)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    enabled: Boolean(lane),
  })

  const rfqsQuery = useRfqsQuery({ laneId: laneId ?? '' })
  const capabilities = capsQuery.data

  const columns = useMemo(() => (lane ? getStages(lane.archetype) : []), [lane])
  const rows = rfqsQuery.data?.rows ?? []

  const byStage = useMemo(() => {
    const map = new Map<string, RfqRow[]>()
    for (const col of columns) map.set(col.id, [])
    for (const row of rows) {
      const bucket = map.get(row.stage)
      if (bucket) bucket.push(row)
      else map.set(row.stage, [row]) // unknown/legacy stage — still surfaced
    }
    return map
  }, [columns, rows])

  function handleStageChange(rfqId: string, stage: string) {
    setError(null)
    startTransition(async () => {
      const result = await updateStage(rfqId, stage)
      if (result.error) {
        setError(result.error.message)
        return
      }
      await rfqsQuery.refetch()
    })
  }

  function handleCreate() {
    if (!laneId) return
    setError(null)
    startTransition(async () => {
      const result = await createRFQ(laneId, {
        accountId: newAccountId || null,
        source: newSource,
        currency: newCurrency,
      })
      if (result.error) {
        setError(result.error.message)
        return
      }
      setShowNewForm(false)
      setNewAccountId('')
      await rfqsQuery.refetch()
    })
  }

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        {lanes.length > 1 ? (
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Lane</span>
            <select
              value={laneId ?? ''}
              onChange={(e) => setLaneId(e.target.value || undefined)}
              className="rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            >
              {lanes.map((l) => (
                <option key={l.laneId} value={l.laneId}>
                  {l.laneCode} · {l.laneName}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
            {lane ? `${lane.laneCode} · ${lane.laneName} · ${lane.archetype}` : ''}
          </p>
        )}

        {capabilities?.canCreateRfq ? (
          <button
            type="button"
            onClick={() => setShowNewForm((s) => !s)}
            className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
          >
            Nuevo RFQ / New RFQ
          </button>
        ) : null}
      </div>

      {showNewForm ? (
        <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface-1 p-4">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Cuenta / Account</span>
            <select
              value={newAccountId}
              onChange={(e) => setNewAccountId(e.target.value)}
              className="w-56 rounded-card border border-line bg-surface-0 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            >
              <option value="">Sin cuenta / No account</option>
              {(accountsQuery.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Fuente / Source</span>
            <select
              value={newSource}
              onChange={(e) => setNewSource(e.target.value as RfqSource)}
              className="rounded-card border border-line bg-surface-0 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Moneda / Currency</span>
            <input
              value={newCurrency}
              onChange={(e) => setNewCurrency(e.target.value.toUpperCase().slice(0, 3))}
              className="w-20 rounded-card border border-line bg-surface-0 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            />
          </label>

          <button
            type="button"
            onClick={handleCreate}
            disabled={isPending}
            className="rounded-card bg-positive px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
          >
            Crear / Create
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}
      {rfqsQuery.error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          No se pudo cargar el pipeline / Could not load the pipeline: {rfqsQuery.error.message}
        </p>
      ) : null}

      <div className="flex flex-1 gap-4 overflow-x-auto">
        {columns.map((stage) => {
          const stageRows = byStage.get(stage.id) ?? []
          return (
            <div key={stage.id} className="flex w-72 flex-none flex-col gap-3 rounded-card border border-line bg-surface-0 p-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-primary">{stage.label.es}</span>
                <span className="font-mono text-label text-ink-secondary" data-numeric>
                  {stageRows.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto">
                {stageRows.map((rfq) => (
                  <RfqCard
                    key={rfq.id}
                    rfq={rfq}
                    archetype={rfq.laneArchetype}
                    canAdvanceStage={Boolean(capabilities?.canAdvanceStage)}
                    busy={isPending}
                    onStageChange={(nextStage) => handleStageChange(rfq.id, nextStage)}
                  />
                ))}
                {stageRows.length === 0 ? (
                  <p className="font-ui text-t0 text-ink-secondary">Sin RFQs / No RFQs</p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
