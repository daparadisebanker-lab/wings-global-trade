'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { t, type Locale } from '@/lib/i18n'
import { createTask, updateTaskStatus, type CreateTaskInput } from '@/lib/actions/tasks'
import { groupByUrgency, type TaskListItem, type UrgencyBucket } from '@/lib/actions/tasks-logic'
import type { ClientBrandOption, ClientOwnerOption } from '@/lib/actions/clients'
import { listRfqsForAccount, type RfqRow } from '@/lib/actions/pipeline'

const TAG = 'BKL · Backlog'
const TITLE = { es: 'Backlog', en: 'Backlog' }

export interface BacklogClientOption {
  id: string
  name: string
  brandName: string | null
}

const BUCKET_LABEL: Record<UrgencyBucket, { es: string; en: string }> = {
  OVERDUE: { es: 'Vencidas', en: 'Overdue' },
  TODAY: { es: 'Hoy', en: 'Today' },
  UPCOMING: { es: 'Próximas', en: 'Upcoming' },
  NO_DATE: { es: 'Sin fecha', en: 'No date' },
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * The Backlog — every open task across the caller's clients, grouped by
 * urgency (overdue first), with a mine/all toggle. Wires up tower.tasks
 * (live with RLS + audit since Wave 1, never read/written by the app until
 * now). Quick-create links a task to a client when one is picked; otherwise
 * it needs an explicit brand.
 */
export function BacklogView({
  initialTasks,
  currentUserId,
  roster,
  brands,
  clients,
  locale,
}: {
  initialTasks: TaskListItem[]
  currentUserId: string
  roster: ClientOwnerOption[]
  brands: ClientBrandOption[]
  clients: BacklogClientOption[]
  locale: Locale
}) {
  const [tasks, setTasks] = useState(initialTasks)
  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [showCompleted, setShowCompleted] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startPending] = useTransition()

  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [accountId, setAccountId] = useState('')
  const [brandId, setBrandId] = useState(brands.length === 1 ? brands[0].id : '')
  const [assigneeId, setAssigneeId] = useState(currentUserId)
  // Backlog → Pipeline hand-off: once a client is picked, offer their open
  // deals so the task can point straight at a Kanban card instead of just the
  // client window — "entry point of the pipeline."
  const [rfqOptions, setRfqOptions] = useState<RfqRow[]>([])
  const [rfqId, setRfqId] = useState('')

  useEffect(() => {
    setRfqId('')
    if (!accountId) {
      setRfqOptions([])
      return
    }
    let active = true
    listRfqsForAccount(accountId).then((res) => {
      if (active && res.data) setRfqOptions(res.data)
    })
    return () => {
      active = false
    }
  }, [accountId])

  const ownerName = useMemo(() => {
    const byId = new Map(roster.map((o) => [o.id, o.name]))
    return (id: string | null) => (id ? (byId.get(id) ?? '—') : '—')
  }, [roster])

  const scoped = scope === 'mine' ? tasks.filter((tk) => tk.assigneeId === currentUserId) : tasks
  const open = scoped.filter((tk) => tk.status === 'OPEN')
  const completed = scoped.filter((tk) => tk.status !== 'OPEN')
  const groups = groupByUrgency(open, todayISO())

  const canSave = title.trim().length > 0 && (accountId || brandId) && !pending

  function onCreate() {
    setError(null)
    startPending(async () => {
      const input: CreateTaskInput = {
        title: title.trim(),
        dueDate: dueDate || null,
        assigneeId: assigneeId || null,
        accountId: accountId || null,
        rfqId: rfqId || null,
        brandId: accountId ? null : brandId || null,
      }
      const res = await createTask(input)
      if (res.error) {
        setError(res.error.message)
        return
      }
      setTasks((xs) => [res.data, ...xs])
      setTitle('')
      setDueDate('')
      setAccountId('')
      setRfqId('')
      setCreating(false)
    })
  }

  function onSetStatus(id: string, status: 'DONE' | 'CANCELLED' | 'OPEN') {
    setError(null)
    const prev = tasks
    setTasks((xs) => xs.map((tk) => (tk.id === id ? { ...tk, status } : tk)))
    startPending(async () => {
      const res = await updateTaskStatus(id, status)
      if (res.error) {
        setTasks(prev)
        setError(res.error.message)
      }
    })
  }

  const field =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'

  function TaskRow({ task }: { task: TaskListItem }) {
    return (
      <li className="flex items-center justify-between gap-3 rounded-card border border-line-hairline bg-surface-0 p-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium text-ink-primary">{task.title}</span>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
            {task.dueDate ? <span data-numeric>{task.dueDate}</span> : null}
            <span>{ownerName(task.assigneeId)}</span>
            {task.refTable === 'accounts' && task.refId && task.accountName ? (
              <Link href={`/clients/${task.refId}`} className="hover:text-lane-accent">
                {task.accountName}
              </Link>
            ) : null}
            {task.refTable === 'rfqs' && task.refId ? (
              <Link href={`/pipeline/${task.refId}`} className="text-lane-accent hover:underline">
                {t({ es: 'Ver en Pipeline →', en: 'Open in Pipeline →' }, locale)}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {task.status === 'OPEN' ? (
            <>
              <button
                type="button"
                onClick={() => onSetStatus(task.id, 'DONE')}
                className="rounded-control border border-line px-2 py-1 font-mono text-label uppercase tracking-[0.06em] text-ink-secondary hover:border-positive hover:text-positive"
              >
                {t({ es: 'Hecho', en: 'Done' }, locale)}
              </button>
              <button
                type="button"
                onClick={() => onSetStatus(task.id, 'CANCELLED')}
                className="font-mono text-label uppercase tracking-[0.06em] text-ink-secondary hover:text-negative"
              >
                {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
              </button>
            </>
          ) : (
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              {task.status === 'DONE' ? t({ es: 'Hecho', en: 'Done' }, locale) : t({ es: 'Cancelada', en: 'Cancelled' }, locale)}
            </span>
          )}
        </div>
      </li>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          {TAG}
        </span>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-t3 text-ink-primary">{t(TITLE, locale)}</h1>
          <span className="font-mono text-label text-ink-secondary" data-numeric>
            {open.length}
          </span>
        </div>
        <p className="max-w-prose text-t0 text-ink-secondary">
          {t(
            {
              es: 'Lo pendiente en cada relación con cliente — vencido primero. Crea una tarea aquí o desde la ficha del cliente. El punto de entrada al Pipeline: vincula una tarea a un RFQ y ábrela directo en el Kanban.',
              en: 'What is pending on each client relationship — overdue first. Create a task here or from the client window. The entry point into Pipeline: link a task to an RFQ and open it straight on the Kanban.',
            },
            locale,
          )}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Link
            href="/pipeline"
            className="rounded-control border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent hover:text-lane-accent"
          >
            {t({ es: 'Pipeline →', en: 'Pipeline →' }, locale)}
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setScope('mine')}
              className={`rounded-control px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] ${scope === 'mine' ? 'bg-accent text-surface-0' : 'border border-line text-ink-secondary hover:text-ink-primary'}`}
            >
              {t({ es: 'Mis tareas', en: 'My tasks' }, locale)}
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`rounded-control px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] ${scope === 'all' ? 'bg-accent text-surface-0' : 'border border-line text-ink-secondary hover:text-ink-primary'}`}
            >
              {t({ es: 'Todas', en: 'All' }, locale)}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="ml-auto rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
          >
            {t({ es: '+ Nueva tarea', en: '+ New task' }, locale)}
          </button>
        </div>
      </header>

      {creating ? (
        <div className="flex flex-col gap-3 rounded-card-lg border border-line bg-surface-1 p-4 shadow-elevation-2">
          <input
            className={field}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t({ es: 'Título de la tarea', en: 'Task title' }, locale)}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                {t({ es: 'Vence', en: 'Due' }, locale)}
              </span>
              <input type="date" className={field} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                {t({ es: 'Cliente', en: 'Client' }, locale)}
              </span>
              <select className={field} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">{t({ es: '— Sin cliente —', en: '— No client —' }, locale)}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.brandName ? ` · ${c.brandName}` : ''}
                  </option>
                ))}
              </select>
            </label>
            {accountId && rfqOptions.length > 0 ? (
              <label className="flex flex-col gap-1">
                <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                  {t({ es: 'Vincular a RFQ', en: 'Link to RFQ' }, locale)}
                </span>
                <select className={field} value={rfqId} onChange={(e) => setRfqId(e.target.value)}>
                  <option value="">{t({ es: '— Solo el cliente —', en: '— Client only —' }, locale)}</option>
                  {rfqOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.stage} · {r.source}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {!accountId ? (
              <label className="flex flex-col gap-1">
                <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                  {t({ es: 'Marca', en: 'Brand' }, locale)}
                </span>
                <select className={field} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                  <option value="">{t({ es: '— Marca —', en: '— Brand —' }, locale)}</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="flex flex-col gap-1">
                <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                  {t({ es: 'Asignado a', en: 'Assignee' }, locale)}
                </span>
                <select className={field} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                  {roster.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {accountId ? null : (
            <label className="flex flex-col gap-1 sm:w-1/3">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                {t({ es: 'Asignado a', en: 'Assignee' }, locale)}
              </span>
              <select className={field} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                {roster.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
            >
              {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={onCreate}
              className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
            >
              {t({ es: 'Guardar', en: 'Save' }, locale)}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      {open.length === 0 ? (
        <div className="rounded-card border border-line-hairline bg-surface-1 p-8 text-center text-t0 text-ink-secondary">
          {t({ es: 'Backlog vacío. Buen trabajo — o crea la primera tarea.', en: 'Backlog empty. Nice work — or create the first task.' }, locale)}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <section key={g.bucket} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-label uppercase tracking-[0.1em] text-lane-accent">
                    {t(BUCKET_LABEL[g.bucket], locale)}
                  </span>
                  <span className="font-mono text-label text-ink-secondary" data-numeric>
                    {g.items.length}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {g.items.map((tk) => (
                    <TaskRow key={tk.id} task={tk} />
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}

      {completed.length > 0 ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="w-fit font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-lane-accent"
          >
            {showCompleted
              ? t({ es: '▾ Ocultar completadas', en: '▾ Hide completed' }, locale)
              : t({ es: `▸ Completadas (${completed.length})`, en: `▸ Completed (${completed.length})` }, locale)}
          </button>
          {showCompleted ? (
            <ul className="flex flex-col gap-2">
              {completed.map((tk) => (
                <TaskRow key={tk.id} task={tk} />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
