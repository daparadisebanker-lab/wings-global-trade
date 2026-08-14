'use client'

// The direct "generate a proposal" path — no Mister round-trip required. Two
// decisions only (lane, client): everything else (source, currency) defaults
// silently, because every extra decision here is a rep who closes the tab
// instead of drafting. Creates a bare RFQ (createRFQ, same call PipelineBoard's
// own inline form uses) and hands off straight to QuoteComposer on that RFQ's
// Pipeline card — composeQuote takes its own line drafts, so the rep adds
// product lines and sends from there; this button's only job is to not make
// them go find the Kanban button themselves first.
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { t, type Locale } from '@/lib/i18n'
import { createRFQ, listAccountsForBrand, listPipelineLanes, type AccountOption } from '@/lib/actions/pipeline'
import type { EditableLane } from '@/lib/actions/catalog'

export function NewQuotationForm({ locale }: { locale: Locale }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [lanes, setLanes] = useState<EditableLane[]>([])
  const [laneId, setLaneId] = useState('')
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [accountId, setAccountId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open || lanes.length > 0) return
    listPipelineLanes().then((res) => {
      if (res.data) {
        setLanes(res.data)
        setLaneId((prev) => prev || res.data[0]?.laneId || '')
      }
    })
  }, [open, lanes.length])

  useEffect(() => {
    setAccountId('')
    const lane = lanes.find((l) => l.laneId === laneId)
    if (!lane) {
      setAccounts([])
      return
    }
    let active = true
    listAccountsForBrand(lane.brandId).then((res) => {
      if (active && res.data) setAccounts(res.data)
    })
    return () => {
      active = false
    }
  }, [laneId, lanes])

  function handleCreate() {
    if (!laneId || !accountId) {
      setError(t({ es: 'Selecciona un lane y un cliente / Select a lane and a client', en: 'Select a lane and a client' }, locale))
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await createRFQ(laneId, { accountId, source: 'MANUAL', currency: 'USD' })
      if (res.error) {
        setError(res.error.message)
        return
      }
      router.push(`/pipeline/${res.data.id}`)
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
      >
        {t({ es: '+ Nueva cotización', en: '+ New quotation' }, locale)}
      </button>
    )
  }

  return (
    <div
      role="group"
      aria-label={t({ es: 'Nueva cotización', en: 'New quotation' }, locale)}
      className="tower-settle flex flex-wrap items-end gap-3 rounded-card-lg border border-line bg-surface-1 p-4 shadow-elevation-2"
    >
      <label className="flex w-full flex-col gap-1 sm:w-auto">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Lane</span>
        <select
          autoFocus
          value={laneId}
          onChange={(e) => setLaneId(e.target.value)}
          className="w-full rounded-card border border-line bg-surface-0 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent sm:w-52"
        >
          {lanes.length === 0 ? <option value="">…</option> : null}
          {lanes.map((l) => (
            <option key={l.laneId} value={l.laneId}>
              {l.laneCode} · {l.laneName}
            </option>
          ))}
        </select>
      </label>

      <label className="flex w-full flex-1 flex-col gap-1 sm:w-auto">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          {t({ es: 'Cliente', en: 'Client' }, locale)}
        </span>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          disabled={accounts.length === 0}
          className="w-full rounded-card border border-line bg-surface-0 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-40 sm:w-56"
        >
          <option value="">
            {accounts.length === 0
              ? t({ es: '— sin clientes en este lane —', en: '— no clients on this lane —' }, locale)
              : t({ es: '— selecciona —', en: '— select —' }, locale)}
          </option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
              {a.country ? ` · ${a.country}` : ''}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={handleCreate}
        disabled={isPending || !laneId || !accountId}
        className="w-full rounded-card bg-positive px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40 sm:w-auto"
      >
        {t({ es: 'Crear y redactar →', en: 'Create and draft →' }, locale)}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
      >
        {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
      </button>

      {error ? (
        <p role="alert" className="w-full font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}
    </div>
  )
}
