'use client'

// RepInvitePanel — the "Invitar / Invite rep" affordance inside the group-admin
// UserManager. A rep is enrolled by email against ONE membership target (a
// represented brand OR a lane) with a role; inviteRep does the privileged work
// (auth invite → profile → membership → empty rep_profiles row). This is
// presentation only — the server action re-checks group-admin in the DB.
//
// Tokens only; ES/EN throughout; native controls keep it fully keyboard reachable.
import { useState, useTransition } from 'react'
import { inviteRep } from '@/lib/actions/rep-invite'
import { RB_ROLES } from '@/lib/actions/represented-brands-logic'
import { LANE_ROLES } from '@/lib/actions/admin-logic'
import type { LaneAdminRow } from '@/lib/actions/admin'

export interface RepBrandOption {
  id: string
  code: string
  name: string
}

type TargetKind = 'brand' | 'lane'

export function RepInvitePanel({
  lanes,
  brands,
  onInvited,
}: {
  lanes: LaneAdminRow[]
  brands: RepBrandOption[]
  onInvited: () => void
}) {
  const [email, setEmail] = useState('')
  const [kind, setKind] = useState<TargetKind>('brand')
  const [brandId, setBrandId] = useState<string>(brands[0]?.id ?? '')
  const [laneId, setLaneId] = useState<string>(lanes[0]?.id ?? '')
  const [role, setRole] = useState<string>(RB_ROLES[0])
  const [banner, setBanner] = useState<{ tone: 'positive' | 'negative'; text: string } | null>(null)
  const [isPending, startInvite] = useTransition()

  function selectKind(next: TargetKind) {
    setKind(next)
    setRole(next === 'brand' ? RB_ROLES[0] : LANE_ROLES[0])
  }

  const roleOptions = kind === 'brand' ? RB_ROLES : LANE_ROLES
  const targetId = kind === 'brand' ? brandId : laneId
  const canSubmit = email.trim().length > 0 && targetId.length > 0 && !isPending

  function submit() {
    if (!canSubmit) return
    const target =
      kind === 'brand'
        ? ({ kind: 'brand', brandId, role: role as (typeof RB_ROLES)[number] } as const)
        : ({ kind: 'lane', laneId, role: role as (typeof LANE_ROLES)[number] } as const)
    startInvite(async () => {
      const result = await inviteRep({ email: email.trim(), target })
      if (result.error) {
        setBanner({ tone: 'negative', text: `No se pudo invitar / Could not invite: ${result.error.message}` })
        return
      }
      setBanner({
        tone: 'positive',
        text: result.data.invited
          ? `Rep invitado: ${result.data.email} / Rep invited.`
          : `Acceso asignado a ${result.data.email} (ya existía) / Access granted (already a user).`,
      })
      setEmail('')
      onInvited()
    })
  }

  return (
    <section className="flex flex-col gap-3 rounded-card border border-line bg-surface-1 p-4">
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-lane-accent">Invitar rep / Invite rep</span>
        <span className="font-ui text-label text-ink-secondary">
          Invita por correo y asigna un acceso; el rep completa su perfil al ingresar. / Invite by email and grant one
          access; the rep completes their profile on sign-in.
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Correo / Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
            placeholder="rep@empresa.com"
            className="w-64 rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none placeholder:text-ink-secondary focus-visible:border-lane-accent"
          />
        </label>

        {/* Target kind — brand vs lane */}
        <fieldset className="flex flex-col gap-1">
          <legend className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Tipo / Type</legend>
          <div className="flex items-center gap-1 rounded-card border border-line p-0.5">
            {(['brand', 'lane'] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kind === k}
                onClick={() => selectKind(k)}
                className={`rounded-card px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] ${
                  kind === k ? 'bg-accent text-surface-0' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {k === 'brand' ? 'Marca / Brand' : 'Lane'}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Target selector */}
        <label className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
            {kind === 'brand' ? 'Marca / Brand' : 'Lane'}
          </span>
          {kind === 'brand' ? (
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-56 rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            >
              {brands.length === 0 ? <option value="">Sin marcas / No brands</option> : null}
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} · {b.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={laneId}
              onChange={(e) => setLaneId(e.target.value)}
              className="w-56 rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            >
              {lanes.length === 0 ? <option value="">Sin lanes / No lanes</option> : null}
              {lanes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code} · {l.name}
                </option>
              ))}
            </select>
          )}
        </label>

        {/* Role */}
        <label className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Rol / Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-48 rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
        >
          Enviar invitación / Send invite
        </button>
      </div>

      {banner ? (
        <p role="status" className={`font-ui text-t0 ${banner.tone === 'positive' ? 'text-positive' : 'text-negative'}`}>
          {banner.text}
        </p>
      ) : null}
    </section>
  )
}
