'use client'

// The user × lane × role grid editor (COMPONENT_TREE §6 UserManager). Columns
// are the five DB lane roles (LANE_ROLES — group admin is NOT here; it is
// profiles.is_group_admin, D-11). Rows are every lane. Toggling cells builds the
// desired membership set; Save diffs it server-side (setMemberships) — RLS/DB is
// the real boundary, this grid only composes intent. Fully keyboard reachable
// (native checkboxes); state reads without color.
import { useMemo, useState, useTransition } from 'react'
import { LANE_ROLES } from '@/lib/actions/admin-logic'
import type { DbLaneRole } from '@/lib/actions/catalog-logic'
import { setMemberships, type AdminUserRow, type LaneAdminRow } from '@/lib/actions/admin'
import { LaneStatusChip } from '../StatusChip'

function cellKey(laneId: string, role: DbLaneRole): string {
  return `${laneId}::${role}`
}

export function MembershipMatrix({
  user,
  lanes,
  onSaved,
}: {
  user: AdminUserRow
  lanes: LaneAdminRow[]
  onSaved: () => void
}) {
  const initial = useMemo(
    () => new Set(user.memberships.map((m) => cellKey(m.laneId, m.role))),
    [user.memberships],
  )
  const [selected, setSelected] = useState<Set<string>>(initial)
  const [banner, setBanner] = useState<{ tone: 'positive' | 'negative'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Reset local edits whenever a different user is selected.
  const dirty = useMemo(() => {
    if (selected.size !== initial.size) return true
    for (const k of selected) if (!initial.has(k)) return true
    return false
  }, [selected, initial])

  function toggle(laneId: string, role: DbLaneRole) {
    const key = cellKey(laneId, role)
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function save() {
    const desired = [...selected].map((k) => {
      const [laneId, role] = k.split('::')
      return { laneId, role: role as DbLaneRole }
    })
    startTransition(async () => {
      const result = await setMemberships(user.id, desired)
      if (result.error) {
        setBanner({ tone: 'negative', text: `No se pudo guardar / Could not save: ${result.error.message}` })
        return
      }
      setBanner({ tone: 'positive', text: 'Memberships guardadas / Memberships saved.' })
      onSaved()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-ui text-t1 text-ink-primary">{user.fullName}</span>
          <span className="font-mono text-t0 text-ink-secondary">{user.email ?? user.id}</span>
        </div>
        {user.isGroupAdmin ? (
          <span className="font-mono text-label uppercase tracking-[0.1em] text-accent">GROUP ADMIN</span>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-card border border-line">
        <table className="w-full border-collapse">
          <thead className="bg-surface-1">
            <tr className="border-b border-line">
              <th className="px-3 py-2 text-left font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                Lane
              </th>
              {LANE_ROLES.map((role) => (
                <th
                  key={role}
                  className="px-3 py-2 text-center font-mono text-label uppercase tracking-[0.08em] text-ink-secondary"
                >
                  {role.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lanes.map((lane) => (
              <tr key={lane.id} className="border-b border-line last:border-b-0 hover:bg-surface-1">
                <td className="whitespace-nowrap px-3 py-2">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-t0 text-ink-primary">{lane.code}</span>
                    <span className="font-ui text-t0 text-ink-secondary">{lane.name}</span>
                    <LaneStatusChip status={lane.status} />
                  </span>
                </td>
                {LANE_ROLES.map((role) => {
                  const key = cellKey(lane.id, role)
                  return (
                    <td key={role} className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${lane.code} · ${role} · ${user.fullName}`}
                        checked={selected.has(key)}
                        onChange={() => toggle(lane.id, role)}
                        className="h-4 w-4 accent-[color:var(--accent)]"
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {lanes.length === 0 ? (
          <div className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
            No hay lanes registradas todavía / No lanes registered yet.
          </div>
        ) : null}
      </div>

      {banner ? (
        <p role="status" className={`font-ui text-t0 ${banner.tone === 'positive' ? 'text-positive' : 'text-negative'}`}>
          {banner.text}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || isPending}
          className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
        >
          Guardar memberships / Save
        </button>
        <button
          type="button"
          onClick={() => {
            setSelected(new Set(initial))
            setBanner(null)
          }}
          disabled={!dirty || isPending}
          className="rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary disabled:opacity-40"
        >
          Descartar / Reset
        </button>
      </div>
    </div>
  )
}
