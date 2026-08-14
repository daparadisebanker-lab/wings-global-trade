'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { t, type Locale } from '@/lib/i18n'
import type { ClientBrandOption, ClientOwnerOption } from '@/lib/actions/clients'
import { archetypeLabel, sourceLabel, type ClientListItem } from '@/lib/actions/clients-logic'
import { StageChip, locationOf } from './ClientList'
import { ClientForm, initialFromClient } from './ClientForm'
import {
  assignAccountSupplier,
  unassignAccountSupplier,
  type AssignAccountSupplierInput,
} from '@/lib/actions/account-suppliers'
import type { AccountSupplierListItem } from '@/lib/actions/account-suppliers-logic'
import type { RfqRow, OrderRow } from '@/lib/actions/pipeline'
import type { QuotationListItem } from '@/lib/actions/quotations-logic'
import type { SupplierOption } from '@/lib/actions/suppliers-logic'
import { createTask, updateTaskStatus } from '@/lib/actions/tasks'
import type { TaskListItem } from '@/lib/actions/tasks-logic'
import { formatMinor } from '@/lib/money'

function SectionCard({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-card-lg border border-line bg-surface-1 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-label uppercase tracking-[0.12em] text-lane-accent">{title}</span>
        {action}
      </div>
      {children}
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-pill border border-line bg-surface-2 px-2 py-0.5 font-mono text-label uppercase tracking-[0.08em] text-ink-primary">
      {children}
    </span>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="font-ui text-t0 text-ink-secondary">{children}</p>
}

/**
 * The client window — one client's profile plus everything running against it:
 * suppliers being sourced for them, their RFQ pipeline, quotations issued, and
 * orders won. Profile editing reuses ClientForm as-is; RFQs/quotes/orders are
 * read-only summaries linking out to their own detail surfaces.
 */
export function ClientDetail({
  client: initialClient,
  brands,
  roster,
  ownerName,
  suppliers,
  initialAssignedSuppliers,
  initialRfqs,
  initialQuotations,
  initialOrders,
  initialTasks,
  locale,
}: {
  client: ClientListItem
  brands: ClientBrandOption[]
  roster: ClientOwnerOption[]
  ownerName: string | null
  suppliers: SupplierOption[]
  initialAssignedSuppliers: AccountSupplierListItem[]
  initialRfqs: RfqRow[]
  initialQuotations: QuotationListItem[]
  initialOrders: OrderRow[]
  initialTasks: TaskListItem[]
  locale: Locale
}) {
  const [client, setClient] = useState(initialClient)
  const [editing, setEditing] = useState(false)
  const [assigned, setAssigned] = useState(initialAssignedSuppliers)
  const [assigning, setAssigning] = useState(false)
  const [pickSupplierId, setPickSupplierId] = useState('')
  const [assignError, setAssignError] = useState<string | null>(null)
  const [tasks, setTasks] = useState(initialTasks)
  const [addingTask, setAddingTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [taskError, setTaskError] = useState<string | null>(null)
  const [pending, startPending] = useTransition()

  const availableSuppliers = suppliers.filter((s) => !assigned.some((a) => a.supplierId === s.id))

  function onAssign() {
    if (!pickSupplierId) return
    setAssignError(null)
    startPending(async () => {
      const input: AssignAccountSupplierInput = { accountId: client.id, supplierId: pickSupplierId }
      const res = await assignAccountSupplier(input)
      if (res.error) {
        setAssignError(res.error.message)
        return
      }
      setAssigned((xs) => [res.data, ...xs])
      setPickSupplierId('')
      setAssigning(false)
    })
  }

  function onUnassign(id: string) {
    setAssignError(null)
    const prev = assigned
    setAssigned((xs) => xs.filter((a) => a.id !== id))
    startPending(async () => {
      const res = await unassignAccountSupplier(id)
      if (res.error) {
        setAssigned(prev)
        setAssignError(res.error.message)
      }
    })
  }

  function onAddTask() {
    if (!taskTitle.trim()) return
    setTaskError(null)
    startPending(async () => {
      const res = await createTask({ title: taskTitle.trim(), dueDate: taskDue || null, accountId: client.id })
      if (res.error) {
        setTaskError(res.error.message)
        return
      }
      setTasks((xs) => [res.data, ...xs])
      setTaskTitle('')
      setTaskDue('')
      setAddingTask(false)
    })
  }

  function onSetTaskStatus(id: string, status: 'DONE' | 'CANCELLED') {
    setTaskError(null)
    const prev = tasks
    setTasks((xs) => xs.map((tk) => (tk.id === id ? { ...tk, status } : tk)))
    startPending(async () => {
      const res = await updateTaskStatus(id, status)
      if (res.error) {
        setTasks(prev)
        setTaskError(res.error.message)
      }
    })
  }

  const openTasks = tasks.filter((tk) => tk.status === 'OPEN')

  const field =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <Link
          href="/clients"
          className="w-fit font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-lane-accent"
        >
          {t({ es: '← Clientes', en: '← Clients' }, locale)}
        </Link>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-t3 text-ink-primary">{client.name}</h1>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-primary hover:border-lane-accent"
          >
            {editing ? t({ es: 'Cerrar', en: 'Close' }, locale) : t({ es: 'Editar', en: 'Edit' }, locale)}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StageChip stage={client.stage} locale={locale} />
          {client.brandName ? <Chip>{client.brandName}</Chip> : null}
          {client.source ? <Chip>{sourceLabel(client.source, locale)}</Chip> : null}
          {archetypeLabel(client.archetype, locale) ? <Chip>{archetypeLabel(client.archetype, locale)}</Chip> : null}
        </div>
        {locationOf(client) ? <p className="text-t0 text-ink-secondary">{locationOf(client)}</p> : null}
        {ownerName ? (
          <p className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
            {t({ es: 'Responsable', en: 'Owner' }, locale)}: {ownerName}
          </p>
        ) : null}
        {client.primaryContact ? (
          <p className="text-t0 text-ink-secondary">
            {client.primaryContact.name}
            {client.primaryContact.role ? ` · ${client.primaryContact.role}` : ''}
            {client.primaryContact.whatsapp ? ` · ${client.primaryContact.whatsapp}` : ''}
            {client.primaryContact.email ? ` · ${client.primaryContact.email}` : ''}
          </p>
        ) : null}
        {client.demand ? <p className="max-w-prose text-t0 text-ink-secondary">{client.demand}</p> : null}
      </header>

      {editing ? (
        <div className="rounded-card-lg border border-line bg-surface-1 p-4 shadow-elevation-2">
          <ClientForm
            locale={locale}
            brands={brands}
            roster={roster}
            initial={initialFromClient(client)}
            onDone={(updated) => {
              setClient(updated)
              setEditing(false)
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title={t({ es: 'Proveedores asignados', en: 'Assigned suppliers' }, locale)}
          action={
            !assigning ? (
              <button
                type="button"
                onClick={() => setAssigning(true)}
                className="font-mono text-label uppercase tracking-[0.08em] text-lane-accent hover:underline"
              >
                {t({ es: '+ Asignar', en: '+ Assign' }, locale)}
              </button>
            ) : null
          }
        >
          {assigning ? (
            <div className="flex flex-wrap items-center gap-2">
              <select className={`${field} flex-1`} value={pickSupplierId} onChange={(e) => setPickSupplierId(e.target.value)}>
                <option value="">{t({ es: '— Proveedor —', en: '— Supplier —' }, locale)}</option>
                {availableSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.country ? ` · ${s.country}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!pickSupplierId || pending}
                onClick={onAssign}
                className="rounded-card bg-accent px-3 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
              >
                {t({ es: 'Guardar', en: 'Save' }, locale)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssigning(false)
                  setPickSupplierId('')
                }}
                className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-ink-primary"
              >
                {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
              </button>
            </div>
          ) : null}
          {assignError ? <p className="font-ui text-t0 text-negative">{assignError}</p> : null}
          {assigned.length === 0 ? (
            <Empty>{t({ es: 'Ningún proveedor asignado todavía.', en: 'No suppliers assigned yet.' }, locale)}</Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {assigned.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-card border border-line-hairline p-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-ink-primary">{a.supplierName || '—'}</span>
                    <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                      {a.supplierCountry ?? ''}
                      {a.note ? (a.supplierCountry ? ` · ${a.note}` : a.note) : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUnassign(a.id)}
                    className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-negative"
                  >
                    {t({ es: 'Quitar', en: 'Remove' }, locale)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title={t({ es: 'Tareas', en: 'Tasks' }, locale)}
          action={
            !addingTask ? (
              <button
                type="button"
                onClick={() => setAddingTask(true)}
                className="font-mono text-label uppercase tracking-[0.08em] text-lane-accent hover:underline"
              >
                {t({ es: '+ Nueva', en: '+ New' }, locale)}
              </button>
            ) : null
          }
        >
          {addingTask ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                className={`${field} flex-1`}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder={t({ es: 'Título de la tarea', en: 'Task title' }, locale)}
              />
              <input type="date" className={field} value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
              <button
                type="button"
                disabled={!taskTitle.trim() || pending}
                onClick={onAddTask}
                className="rounded-card bg-accent px-3 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
              >
                {t({ es: 'Guardar', en: 'Save' }, locale)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingTask(false)
                  setTaskTitle('')
                  setTaskDue('')
                }}
                className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-ink-primary"
              >
                {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
              </button>
            </div>
          ) : null}
          {taskError ? <p className="font-ui text-t0 text-negative">{taskError}</p> : null}
          {openTasks.length === 0 ? (
            <Empty>{t({ es: 'Nada pendiente.', en: 'Nothing pending.' }, locale)}</Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {openTasks.map((tk) => (
                <li key={tk.id} className="flex items-center justify-between gap-3 rounded-card border border-line-hairline p-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-ink-primary">{tk.title}</span>
                    {tk.dueDate ? (
                      <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary" data-numeric>
                        {tk.dueDate}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSetTaskStatus(tk.id, 'DONE')}
                      className="rounded-control border border-line px-2 py-1 font-mono text-label uppercase tracking-[0.06em] text-ink-secondary hover:border-positive hover:text-positive"
                    >
                      {t({ es: 'Hecho', en: 'Done' }, locale)}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetTaskStatus(tk.id, 'CANCELLED')}
                      className="font-mono text-label uppercase tracking-[0.06em] text-ink-secondary hover:text-negative"
                    >
                      {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={t({ es: 'Pipeline (RFQ)', en: 'Pipeline (RFQ)' }, locale)}>
          {initialRfqs.length === 0 ? (
            <Empty>{t({ es: 'Sin RFQ todavía.', en: 'No RFQs yet.' }, locale)}</Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {initialRfqs.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/pipeline/${r.id}`}
                    className="flex items-center justify-between gap-3 rounded-card border border-line-hairline p-3 hover:border-lane-accent"
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-primary">{r.laneSlug}</span>
                      <span className="text-t0 text-ink-secondary" data-numeric>
                        {r.createdAt.slice(0, 10)}
                      </span>
                    </div>
                    <Chip>{r.stage}</Chip>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={t({ es: 'Cotizaciones', en: 'Quotations' }, locale)}>
          {initialQuotations.length === 0 ? (
            <Empty>{t({ es: 'Sin cotizaciones todavía.', en: 'No quotations yet.' }, locale)}</Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {initialQuotations.map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-3 rounded-card border border-line-hairline p-3">
                  <div className="flex flex-col">
                    <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-primary" data-numeric>
                      {q.quoteNo ?? t({ es: 'Borrador', en: 'Draft' }, locale)}
                    </span>
                    <span className="text-t0 text-ink-secondary" data-numeric>
                      {(q.issuedOn ?? q.createdAt).slice(0, 10)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-ink-primary" data-numeric>
                      {formatMinor(q.totalMinor, q.currency)}
                    </span>
                    <Chip>{q.status}</Chip>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={t({ es: 'Pedidos', en: 'Orders' }, locale)}>
          {initialOrders.length === 0 ? (
            <Empty>{t({ es: 'Sin pedidos todavía.', en: 'No orders yet.' }, locale)}</Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {initialOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 rounded-card border border-line-hairline p-3">
                  <div className="flex flex-col">
                    <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-primary">
                      {o.incoterm ?? '—'}
                    </span>
                    <span className="text-t0 text-ink-secondary" data-numeric>
                      {o.createdAt.slice(0, 10)}
                    </span>
                  </div>
                  <Chip>{o.status}</Chip>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
