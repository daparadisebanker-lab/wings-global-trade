'use client'

import { useState } from 'react'
import Link from 'next/link'
import { t, type Locale } from '@/lib/i18n'
import {
  groupClientsByStage,
  STAGE_OPTIONS,
  sourceLabel,
  type ClientListItem,
  type ClientStage,
} from '@/lib/actions/clients-logic'
import { perfilOf } from './ClientList'

// Pipeline board — one column per stage. Cards are drag-and-droppable between
// columns (mouse); every card also carries a stage <select> so moving works by
// keyboard (TOWER a11y law — never mouse-only). Both paths call onMove; the
// parent persists (moveClientStage) and reconciles.

export function ClientBoard({
  items,
  locale,
  onEdit,
  onMove,
}: {
  items: ClientListItem[]
  locale: Locale
  onEdit: (c: ClientListItem) => void
  onMove: (id: string, stage: ClientStage) => void
}) {
  const columns = groupClientsByStage(items)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<ClientStage | null>(null)
  const stageLabelEs = (s: ClientStage) => {
    const o = STAGE_OPTIONS.find((x) => x.id === s)!
    return locale === 'es' ? o.es : o.en
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {columns.map((col) => (
        <section
          key={col.stage}
          onDragOver={(e) => {
            if (dragId) {
              e.preventDefault()
              setOverStage(col.stage)
            }
          }}
          onDragLeave={() => setOverStage((s) => (s === col.stage ? null : s))}
          onDrop={(e) => {
            e.preventDefault()
            const id = e.dataTransfer.getData('text/plain') || dragId
            if (id) onMove(id, col.stage)
            setDragId(null)
            setOverStage(null)
          }}
          className={`flex w-64 shrink-0 flex-col gap-2 rounded-card border p-2 ${
            overStage === col.stage ? 'border-lane-accent bg-surface-2' : 'border-line-hairline bg-surface-1'
          }`}
        >
          <div className="flex items-center justify-between px-1 py-1">
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              {stageLabelEs(col.stage)}
            </span>
            <span className="font-mono text-label tabular-nums text-ink-secondary" data-numeric>
              {col.items.length}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {col.items.map((c) => (
              <article
                key={c.id}
                draggable
                onDragStart={(e) => {
                  setDragId(c.id)
                  e.dataTransfer.setData('text/plain', c.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onDragEnd={() => {
                  setDragId(null)
                  setOverStage(null)
                }}
                className="flex cursor-grab flex-col gap-1.5 rounded-card border border-line-hairline bg-surface-0 p-2.5 active:cursor-grabbing"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/clients/${c.id}`} className="text-left text-t0 font-medium text-ink-primary hover:text-lane-accent">
                    {c.name}
                  </Link>
                  <span className="shrink-0 font-mono text-label tabular-nums text-ink-secondary" data-numeric>
                    {c.score}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                  <span>{c.brandName ?? '—'}</span>
                  {c.source ? <span>{sourceLabel(c.source, locale)}</span> : null}
                </div>
                {perfilOf(c, locale) ? (
                  <span className="text-label text-ink-secondary">{perfilOf(c, locale)}</span>
                ) : null}
                {c.primaryContact ? (
                  <span className="truncate text-label text-ink-secondary">{c.primaryContact.name}</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => onEdit(c)}
                  className="w-fit font-mono text-label uppercase tracking-[0.06em] text-ink-secondary hover:text-lane-accent"
                >
                  {t({ es: 'Editar', en: 'Edit' }, locale)}
                </button>
                {/* Keyboard-accessible move (never mouse-only). */}
                <label className="mt-1 flex items-center gap-1.5">
                  <span className="sr-only">{t({ es: 'Mover a etapa', en: 'Move to stage' }, locale)}</span>
                  <select
                    value={c.stage}
                    onChange={(e) => onMove(c.id, e.target.value as ClientStage)}
                    className="w-full rounded-control border border-line bg-surface-1 px-1.5 py-1 font-mono text-label uppercase tracking-[0.06em] text-ink-secondary outline-none focus-visible:border-lane-accent"
                  >
                    {STAGE_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {locale === 'es' ? o.es : o.en}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
            {col.items.length === 0 ? (
              <p className="px-1 py-3 text-center font-ui text-label text-ink-secondary">
                {t({ es: 'Vacío', en: 'Empty' }, locale)}
              </p>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  )
}
