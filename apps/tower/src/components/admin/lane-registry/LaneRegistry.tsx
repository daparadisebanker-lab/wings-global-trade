'use client'

// LaneRegistry (COMPONENT_TREE §6): the append-only lanes table + status flips
// (OPENING → ACTIVE → ARCHIVED) + the register form. Codes are shown as-is and
// never editable — the registry mirrors the ecosystem CLAUDE.md's lane index.
import { useMemo, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { nextLaneStatuses, type LaneStatus } from '@/lib/actions/admin-logic'
import { setLaneStatus, type BrandRow } from '@/lib/actions/admin'
import { ADMIN_LANES_KEY, useAdminLanesQuery } from './useAdminLanesQuery'
import { RegisterLaneForm } from './RegisterLaneForm'
import { LaneStatusChip } from '../StatusChip'

export function LaneRegistry({ brands }: { brands: BrandRow[] }) {
  const queryClient = useQueryClient()
  const lanesQuery = useAdminLanesQuery()
  const lanes = useMemo(() => lanesQuery.data ?? [], [lanesQuery.data])

  const [banner, setBanner] = useState<{ tone: 'positive' | 'negative'; text: string } | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ADMIN_LANES_KEY })
  }

  function flip(laneId: string, to: LaneStatus) {
    setPendingId(laneId)
    startTransition(async () => {
      const result = await setLaneStatus(laneId, to)
      setPendingId(null)
      if (result.error) {
        setBanner({ tone: 'negative', text: `No se pudo cambiar el estado / Could not change status: ${result.error.message}` })
        return
      }
      setBanner({ tone: 'positive', text: `Lane → ${result.data.status}.` })
      invalidate()
    })
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent">ADM · Lanes</span>
        <h1 className="font-ui text-t3 text-ink-primary">Registro de lanes / Lane registry</h1>
        <p className="max-w-2xl font-ui text-t0 text-ink-secondary">
          Códigos append-only: nunca se reutilizan, reordenan ni eliminan. / Append-only codes: never reused,
          reordered, or deleted.
        </p>
      </header>

      {brands.length > 0 ? (
        <RegisterLaneForm brands={brands} lanes={lanes} onRegistered={invalidate} />
      ) : (
        <p className="font-ui text-t0 text-ink-secondary">
          Crea una marca antes de registrar lanes / Create a brand before registering lanes.
        </p>
      )}

      {banner ? (
        <p role="status" className={`font-ui text-t0 ${banner.tone === 'positive' ? 'text-positive' : 'text-negative'}`}>
          {banner.text}
        </p>
      ) : null}

      {lanesQuery.error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          No se pudieron cargar las lanes / Could not load lanes: {lanesQuery.error.message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-card border border-line">
        <table className="w-full border-collapse">
          <thead className="bg-surface-1">
            <tr className="border-b border-line">
              {['Código / Code', 'Marca / Brand', 'Lane', 'Arquetipo / Archetype', 'Estado / Status', 'Acciones / Actions'].map(
                (h) => (
                  <th key={h} className="px-3 py-2 text-left font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {lanes.map((lane) => (
              <tr key={lane.id} className="border-b border-line last:border-b-0 hover:bg-surface-1">
                <td className="whitespace-nowrap px-3 py-2 font-mono text-t0 text-ink-primary" data-numeric>
                  {lane.code}
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-ui text-t0 text-ink-secondary">{lane.brandName}</td>
                <td className="px-3 py-2">
                  <span className="flex flex-col">
                    <span className="font-ui text-t0 text-ink-primary">{lane.name}</span>
                    <span className="font-mono text-label text-ink-secondary">{lane.slug}</span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                  {lane.archetype}
                </td>
                <td className="px-3 py-2">
                  <LaneStatusChip status={lane.status} />
                </td>
                <td className="px-3 py-2">
                  <span className="flex flex-wrap gap-2">
                    {nextLaneStatuses(lane.status).map((to) => (
                      <button
                        key={to}
                        type="button"
                        onClick={() => flip(lane.id, to)}
                        disabled={pendingId === lane.id}
                        className="rounded-card border border-line px-2.5 py-1 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-ink-primary disabled:opacity-40"
                      >
                        → {to}
                      </button>
                    ))}
                    {nextLaneStatuses(lane.status).length === 0 ? (
                      <span className="font-mono text-label text-ink-secondary">—</span>
                    ) : null}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!lanesQuery.isLoading && lanes.length === 0 ? (
          <div className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
            Sin lanes registradas todavía / No lanes registered yet.
          </div>
        ) : null}
      </div>
    </div>
  )
}
