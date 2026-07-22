'use client'

// Shared-container participants ("Trae tu grupo" groups) — COMPONENT_TREE §3
// <CommitmentsTable>. Commit form calls the atomic commitCbm action (backed
// by tower.commit_container_cbm — see containers.ts's header comment); a
// CAPACITY_EXCEEDED response surfaces as a readable banner, never a raw error.
import { useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { commitCbm, listAccountsForContainer, listOrdersForContainer } from '@/lib/actions/containers'
import type { CommitmentStatus } from '@/lib/actions/containers-types'
import { EntityCombobox, type EntityOption } from '@/components/ui/EntityCombobox'
import { useCommitmentsQuery } from './useCommitmentsQuery'

const STATUS_STYLE: Record<CommitmentStatus, string> = {
  RESERVED: 'text-accent',
  CONFIRMED: 'text-positive',
  LOADED: 'text-positive',
  RELEASED: 'text-ink-secondary line-through',
}

export function CommitmentsTable({
  containerId,
  canCommit,
}: {
  containerId: string
  canCommit: boolean
}) {
  const query = useCommitmentsQuery(containerId)
  const [accountId, setAccountId] = useState('')
  const [cbm, setCbm] = useState('')
  const [orderId, setOrderId] = useState('')
  const [banner, setBanner] = useState<{ tone: 'positive' | 'negative'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const accountsQuery = useQuery({
    queryKey: ['tower', 'containers', 'accounts', containerId],
    queryFn: async () => {
      const result = await listAccountsForContainer(containerId)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    enabled: canCommit,
  })
  const accountOptions: EntityOption[] = (accountsQuery.data ?? []).map((a) => ({
    id: a.id,
    label: a.name,
    hint: a.country,
  }))

  // Orders belong to an account, so the order picker only loads once an account
  // is chosen — and resets if the account changes.
  const ordersQuery = useQuery({
    queryKey: ['tower', 'containers', 'orders', containerId, accountId],
    queryFn: async () => {
      const result = await listOrdersForContainer(containerId, accountId)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    enabled: canCommit && Boolean(accountId),
  })
  const orderOptions: EntityOption[] = (ordersQuery.data ?? []).map((o) => ({
    id: o.id,
    label: `${o.status} · ${new Date(o.createdAt).toLocaleDateString()}`,
    hint: o.incoterm,
  }))

  function submit() {
    setBanner(null)
    const cbmValue = Number(cbm)
    if (!Number.isFinite(cbmValue) || cbmValue <= 0) {
      setBanner({ tone: 'negative', text: 'CBM inválido / Invalid CBM' })
      return
    }
    startTransition(async () => {
      const result = await commitCbm(containerId, {
        accountId,
        cbm: cbmValue,
        orderId: orderId || undefined,
      })
      if (result.error) {
        setBanner({ tone: 'negative', text: `${result.error.code}: ${result.error.message}` })
        return
      }
      setBanner({ tone: 'positive', text: 'CBM comprometido / CBM committed' })
      setAccountId('')
      setCbm('')
      setOrderId('')
      await query.refetch()
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
        Compromisos / Commitments
      </h2>

      {canCommit ? (
        <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface-1 p-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              Cuenta / Account
            </span>
            <EntityCombobox
              className="w-56"
              options={accountOptions}
              value={accountId || null}
              onChange={(id) => {
                setAccountId(id ?? '')
                setOrderId('') // the previous account's order no longer applies
              }}
              loading={accountsQuery.isLoading}
              placeholder="Buscar cuenta… / Search account…"
              ariaLabel="Cuenta / Account"
              emptyText="Sin cuentas para esta marca / No accounts for this brand"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">CBM</span>
            <input
              value={cbm}
              onChange={(e) => setCbm(e.target.value)}
              inputMode="decimal"
              className="w-28 rounded-card border border-line bg-surface-0 px-3 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              Orden (opcional) / Order (optional)
            </span>
            <EntityCombobox
              className="w-56"
              options={orderOptions}
              value={orderId || null}
              onChange={(id) => setOrderId(id ?? '')}
              loading={ordersQuery.isLoading}
              disabled={!accountId}
              placeholder={
                accountId
                  ? 'Buscar orden… / Search order…'
                  : 'Elige una cuenta / Pick an account first'
              }
              ariaLabel="Orden / Order"
              emptyText="Sin órdenes para esta cuenta / No orders for this account"
            />
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !accountId || !cbm}
            className="rounded-card bg-accent px-4 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
          >
            {isPending ? 'Comprometiendo… / Committing…' : 'Comprometer / Commit'}
          </button>
        </div>
      ) : null}

      {banner ? (
        <p role="status" className={`font-ui text-t0 ${banner.tone === 'positive' ? 'text-positive' : 'text-negative'}`}>
          {banner.text}
        </p>
      ) : null}

      {query.error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          No se pudieron cargar los compromisos / Could not load commitments: {query.error.message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-card border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line">
              {['Cuenta / Account', 'CBM', 'Estado / Status', 'Orden / Order', 'Fecha / Date'].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left font-mono text-label uppercase tracking-[0.1em] text-ink-secondary"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(query.data ?? []).map((c) => (
              <tr key={c.id} className="border-b border-line">
                <td className="px-3 py-2 font-ui text-t0 text-ink-primary">{c.accountName ?? c.accountId ?? '—'}</td>
                <td className="px-3 py-2 font-mono text-t0 text-ink-primary" data-numeric>
                  {c.cbm.toFixed(2)}
                </td>
                <td className={`px-3 py-2 font-mono text-label uppercase tracking-[0.08em] ${STATUS_STYLE[c.status]}`}>
                  {c.status}
                </td>
                <td className="px-3 py-2 font-mono text-t0 text-ink-secondary">{c.orderId ?? '—'}</td>
                <td className="px-3 py-2 font-mono text-t0 text-ink-secondary" data-numeric>
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!query.isLoading && (query.data ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
                  Sin compromisos / No commitments yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
