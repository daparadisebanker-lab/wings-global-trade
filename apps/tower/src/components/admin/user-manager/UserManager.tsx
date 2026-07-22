'use client'

// UserManager (COMPONENT_TREE §6): invite flow + the membership matrix editor.
// Group-admin-only surface — the page guards access; every mutation re-checks
// group-admin in the DB (admin.ts requireGroupAdmin). This is presentation.
import { useMemo, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { inviteUser, setUserGroupAdmin, type LaneAdminRow } from '@/lib/actions/admin'
import { ADMIN_USERS_KEY, useAdminUsersQuery } from './useAdminUsersQuery'
import { MembershipMatrix } from './MembershipMatrix'
import { RepInvitePanel, type RepBrandOption } from './RepInvitePanel'

export function UserManager({ lanes, brands }: { lanes: LaneAdminRow[]; brands: RepBrandOption[] }) {
  const queryClient = useQueryClient()
  const usersQuery = useAdminUsersQuery()
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [inviteBanner, setInviteBanner] = useState<{ tone: 'positive' | 'negative'; text: string } | null>(null)
  const [isInviting, startInvite] = useTransition()
  const [isSettingAdmin, startAdmin] = useTransition()

  const selectedUser = users.find((u) => u.id === selectedId) ?? null

  function invalidateUsers() {
    void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY })
  }

  function submitInvite() {
    const value = email.trim()
    if (!value) return
    startInvite(async () => {
      const result = await inviteUser(value)
      if (result.error) {
        setInviteBanner({ tone: 'negative', text: `No se pudo invitar / Could not invite: ${result.error.message}` })
        return
      }
      setInviteBanner({ tone: 'positive', text: `Invitación enviada a ${result.data.email} / Invite sent.` })
      setEmail('')
      invalidateUsers()
    })
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent">ADM · Usuarios / Users</span>
        <h1 className="font-display text-t3 text-ink-primary">Usuarios y accesos / Users & access</h1>
      </header>

      {/* Invite flow */}
      <section className="flex flex-col gap-2 rounded-card border border-line bg-surface-1 p-4">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Invitar / Invite</span>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitInvite()
            }}
            placeholder="persona@empresa.com"
            className="w-72 rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none placeholder:text-ink-secondary focus-visible:border-lane-accent"
          />
          <button
            type="button"
            onClick={submitInvite}
            disabled={isInviting || email.trim().length === 0}
            className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
          >
            Enviar invitación / Send invite
          </button>
        </div>
        {inviteBanner ? (
          <p
            role="status"
            className={`font-ui text-t0 ${inviteBanner.tone === 'positive' ? 'text-positive' : 'text-negative'}`}
          >
            {inviteBanner.text}
          </p>
        ) : null}
      </section>

      {/* Rep enrollment — invite + membership + empty rep profile in one act. */}
      <RepInvitePanel lanes={lanes} brands={brands} onInvited={invalidateUsers} />

      {usersQuery.error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          No se pudieron cargar los usuarios / Could not load users: {usersQuery.error.message}
        </p>
      ) : null}

      <div className="grid flex-1 grid-cols-[minmax(240px,320px)_1fr] gap-6">
        {/* User list */}
        <aside className="flex flex-col gap-1 overflow-y-auto rounded-card border border-line">
          {users.map((u) => {
            const active = u.id === selectedId
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedId(u.id)}
                aria-current={active ? 'true' : undefined}
                className={`flex flex-col items-start gap-0.5 border-b border-line px-3 py-2 text-left last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent ${
                  active ? 'bg-surface-1' : 'hover:bg-surface-1'
                }`}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-ui text-t0 text-ink-primary">{u.fullName}</span>
                  {u.isGroupAdmin ? (
                    <span className="font-mono text-label uppercase tracking-[0.08em] text-accent">ADMIN</span>
                  ) : (
                    <span className="font-mono text-label text-ink-secondary">{u.memberships.length}</span>
                  )}
                </span>
                <span className="font-mono text-label text-ink-secondary">{u.email ?? u.id}</span>
              </button>
            )
          })}
          {!usersQuery.isLoading && users.length === 0 ? (
            <p className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
              Sin usuarios todavía / No users yet.
            </p>
          ) : null}
        </aside>

        {/* Matrix */}
        <section className="overflow-y-auto rounded-card border border-line p-4">
          {selectedUser ? (
            <div className="flex flex-col gap-4">
              {/* Group-admin tier — the whole small team runs as admins; lane/brand
                  roles below are for external reps + scale. Presentation only; the
                  DB (column revoke + service-role writer) is the gate. */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface-1 p-3">
                <div className="flex flex-col">
                  <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Acceso total (admin de grupo)</span>
                  <span className="font-ui text-label text-ink-secondary">
                    {selectedUser.isGroupAdmin ? 'Ve y opera todo el sistema' : 'Acceso por lane/marca únicamente'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    startAdmin(async () => {
                      const res = await setUserGroupAdmin({ userId: selectedUser.id, isGroupAdmin: !selectedUser.isGroupAdmin })
                      if (!res.error) invalidateUsers()
                    })
                  }
                  disabled={isSettingAdmin}
                  className={`rounded-card px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] disabled:opacity-40 ${
                    selectedUser.isGroupAdmin
                      ? 'border border-line text-ink-secondary hover:border-negative'
                      : 'bg-accent text-surface-0'
                  }`}
                >
                  {selectedUser.isGroupAdmin ? 'Quitar admin' : 'Hacer admin de grupo'}
                </button>
              </div>
              {/* key=user id forces a fresh mount per user, so the matrix's
                  local checkbox edits can never leak from one user to the next
                  (its useState seeds from `user` only on mount). */}
              <MembershipMatrix
                key={selectedUser.id}
                user={selectedUser}
                lanes={lanes}
                onSaved={invalidateUsers}
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[30vh] items-center justify-center">
              <p className="font-ui text-t0 text-ink-secondary">
                Selecciona un usuario para editar sus accesos / Select a user to edit access.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
