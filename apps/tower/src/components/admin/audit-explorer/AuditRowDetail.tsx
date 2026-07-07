'use client'

// Row-detail panel for a selected audit entry — a readable field-level diff of
// the before/after JSON (COMPONENT_TREE §6: "old/new JSON diff rendered
// readably; raw DB errors never rendered"). Only changed fields by default;
// a toggle reveals the unchanged fields too. Values are rendered as compact
// JSON, never a raw error blob.
import { useState } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { diffAuditRow, changedFields, type DiffField } from '@/lib/actions/audit-logic'
import type { AuditLogRow } from '@/lib/actions/audit'
import { ActionStamp } from './ActionStamp'

function renderValue(v: unknown): string {
  if (v === undefined) return '—'
  if (typeof v === 'string') return v
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

const CHANGE_STYLE: Record<DiffField['change'], string> = {
  added: 'text-positive',
  removed: 'text-negative',
  changed: 'text-accent',
  unchanged: 'text-ink-secondary',
}

export function AuditRowDetail({
  row,
  onClose,
  locale = DEFAULT_LOCALE,
}: {
  row: AuditLogRow
  onClose: () => void
  locale?: Locale
}) {
  const [showAll, setShowAll] = useState(false)
  const fields = showAll ? diffAuditRow(row.before, row.after) : changedFields(row.before, row.after)

  return (
    <aside
      aria-label={t({ es: 'Detalle de auditoría', en: 'Audit detail' }, locale)}
      className="flex h-full flex-col gap-4 border-l border-line bg-surface-1 p-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary" data-numeric>
            {row.tableName} · #{row.id}
          </span>
          <ActionStamp action={row.action} />
          <span className="font-mono text-label text-ink-secondary" data-numeric>
            {row.rowId ?? '—'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t({ es: 'Cerrar', en: 'Close' }, locale)}
          className="border border-line px-2 py-1 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
        >
          ✕
        </button>
      </header>

      <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
        <span className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
          {showAll
            ? t({ es: 'Todos los campos', en: 'All fields' }, locale)
            : t({ es: 'Campos modificados', en: 'Changed fields' }, locale)}
        </span>
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary underline-offset-4 hover:text-lane-accent hover:underline"
        >
          {showAll ? t({ es: 'Solo cambios', en: 'Changes only' }, locale) : t({ es: 'Ver todos', en: 'Show all' }, locale)}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {fields.length === 0 ? (
          <p className="font-ui text-t0 text-ink-secondary">{t({ es: 'Sin cambios de campo.', en: 'No field changes.' }, locale)}</p>
        ) : (
          <dl className="flex flex-col gap-3">
            {fields.map((f) => (
              <div key={f.key} className="flex flex-col gap-1 border-b border-line pb-2 last:border-b-0">
                <dt className={`font-mono text-label uppercase tracking-[0.08em] ${CHANGE_STYLE[f.change]}`}>
                  {f.key} · {f.change}
                </dt>
                <dd className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 font-mono text-label">
                  {f.change !== 'added' ? (
                    <>
                      <span className="text-ink-secondary">−</span>
                      <span className="break-all text-ink-secondary line-through">{renderValue(f.before)}</span>
                    </>
                  ) : null}
                  {f.change !== 'removed' ? (
                    <>
                      <span className="text-ink-secondary">+</span>
                      <span className="break-all text-ink-primary" data-numeric>
                        {renderValue(f.after)}
                      </span>
                    </>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </aside>
  )
}
