'use client'

// Rep membership matrix (RB Console Wave 1b, Ch 01) — the UserManager grid
// re-pointed at rb_memberships. Group-admin surface: pick a user, see their
// brand × role grid, toggle cells, Save replaces their full desired set
// (setRepresentedBrandMemberships → rbDiffMemberships minimal add/remove). RLS +
// the memberships policies are the real gate; this only edits what admin may.
import { useEffect, useMemo, useState, useTransition } from 'react'
import { listUsers, type AdminUserRow } from '@/lib/actions/admin'
import {
  listRepresentedBrands,
  listUserRbMemberships,
  setRepresentedBrandMemberships,
  type RepresentedBrandRow,
} from '@/lib/actions/represented-brands'
import { RB_ROLES, type RbRole } from '@/lib/actions/represented-brands-logic'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT = 'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'

function cellKey(brandId: string, role: RbRole): string {
  return `${brandId}::${role}`
}

export function RepMembershipMatrix() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [brands, setBrands] = useState<RepresentedBrandRow[]>([])
  const [userId, setUserId] = useState('')
  const [cells, setCells] = useState<Set<string>>(new Set())
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const [u, b] = await Promise.all([listUsers(), listRepresentedBrands()])
      if (u.data) setUsers(u.data)
      if (b.data) setBrands(b.data)
    })
  }, [])

  useEffect(() => {
    if (!userId) {
      setCells(new Set())
      return
    }
    startTransition(async () => {
      const res = await listUserRbMemberships(userId)
      if (res.data) setCells(new Set(res.data.map((m) => cellKey(m.brandId, m.role))))
      setDirty(false)
      setSaved(false)
    })
  }, [userId])

  function toggle(brandId: string, role: RbRole) {
    setCells((prev) => {
      const next = new Set(prev)
      const k = cellKey(brandId, role)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
    setDirty(true)
    setSaved(false)
  }

  const desired = useMemo(
    () =>
      Array.from(cells).map((k) => {
        const [brandId, role] = k.split('::')
        return { brandId, role: role as RbRole }
      }),
    [cells],
  )

  function handleSave() {
    if (!userId) return
    setError(null)
    startTransition(async () => {
      const res = await setRepresentedBrandMemberships({ userId, desired })
      if (res.error) {
        setError(res.error.message)
        return
      }
      setDirty(false)
      setSaved(true)
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface-1 p-4">
      <h3 className={LABEL}>Representantes por marca</h3>

      <label className="flex flex-col gap-1">
        <span className={LABEL}>Usuario</span>
        <select value={userId} onChange={(e) => setUserId(e.target.value)} className={`w-72 ${INPUT}`}>
          <option value="">— selecciona —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName} {u.email ? `· ${u.email}` : ''}
            </option>
          ))}
        </select>
      </label>

      {userId && brands.length > 0 ? (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr className="bg-surface-0 text-left">
                <th className={`px-2 py-2 ${LABEL}`}>Marca</th>
                {RB_ROLES.map((r) => (
                  <th key={r} className={`px-2 py-2 text-center ${LABEL}`}>{r.replace('BRAND_', '')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="px-2 py-1 font-ui text-t0 text-ink-primary">
                    <span className="font-mono text-label text-ink-secondary">{b.code}</span> {b.name}
                  </td>
                  {RB_ROLES.map((r) => (
                    <td key={r} className="px-2 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={cells.has(cellKey(b.id, r))}
                        onChange={() => toggle(b.id, r)}
                        aria-label={`${b.name} ${r}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : userId ? (
        <p className="font-ui text-t0 text-ink-secondary">Sin marcas registradas todavía.</p>
      ) : null}

      {error ? <p role="alert" className="font-ui text-t0 text-negative">{error}</p> : null}

      {userId ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !dirty}
            className="w-fit rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
          >
            Guardar asignaciones / Save
          </button>
          {saved ? <span className="font-mono text-label uppercase tracking-[0.08em] text-positive">Guardado</span> : null}
        </div>
      ) : null}
    </div>
  )
}
