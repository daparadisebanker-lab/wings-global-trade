'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

export interface EntityOption {
  /** The value written back on select (an id). */
  id: string
  /** Primary label shown in the field and the list. */
  label: string
  /** Optional secondary text (country, account, …), demoted. */
  hint?: string | null
  /** Optional short mono badge (a stamp like ✓ or a status). */
  badge?: string | null
}

/**
 * EntityCombobox — the typeahead that retired the hand-typed-UUID inputs on the
 * container desk. A real ARIA combobox: filter as you type, arrow/enter/escape
 * keyboard nav, a clear affordance, and honest loading / empty states. Styled to
 * TOWER's instrument aesthetic (mono, hairline rules, token-only) and reduced-
 * motion aware (the list fades via tower-fade, which collapses under reduce).
 *
 * Controlled: the parent owns `value` (the selected id or null) and maps its
 * domain rows into EntityOption[]. Options are expected to be a bounded set
 * (≤200, server-capped), so filtering is client-side and instant.
 */
export function EntityCombobox({
  options,
  value,
  onChange,
  placeholder,
  loading = false,
  disabled = false,
  emptyText,
  locale = DEFAULT_LOCALE,
  ariaLabel,
  className,
}: {
  options: EntityOption[]
  value: string | null
  onChange: (id: string | null) => void
  placeholder?: string
  loading?: boolean
  disabled?: boolean
  emptyText?: string
  locale?: Locale
  ariaLabel?: string
  className?: string
}) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = useMemo(() => options.find((o) => o.id === value) ?? null, [options, value])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint ?? '').toLowerCase().includes(q),
    )
  }, [options, query])

  // Keep the active row in range as the filtered set changes.
  useEffect(() => {
    setActive((a) => (a >= filtered.length ? 0 : a))
  }, [filtered.length])

  // Close on outside click (blur alone can't tell a list click from leaving).
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function commit(option: EntityOption) {
    onChange(option.id)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  function clear() {
    onChange(null)
    setQuery('')
    setOpen(true)
    inputRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      setActive((a) => Math.min(a + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && filtered[active]) {
        e.preventDefault()
        commit(filtered[active])
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        setOpen(false)
        setQuery('')
      }
    }
  }

  // When closed, the field shows the selected label; when open, the live query.
  const displayValue = open ? query : selected?.label ?? ''
  const activeId = open && filtered[active] ? `${listId}-opt-${active}` : undefined

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center rounded-card border bg-surface-0',
          disabled ? 'border-line opacity-50' : 'border-line focus-within:border-lane-accent',
        )}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-label={ariaLabel}
          autoComplete="off"
          disabled={disabled}
          value={displayValue}
          placeholder={selected ? undefined : placeholder}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent px-3 py-1.5 font-mono text-t0 text-ink-primary outline-none placeholder:text-ink-secondary"
        />
        {selected && !disabled ? (
          <button
            type="button"
            onClick={clear}
            aria-label={t({ es: 'Quitar selección', en: 'Clear selection' }, locale)}
            className="px-2 text-ink-secondary hover:text-ink-primary"
          >
            <span aria-hidden>✕</span>
          </button>
        ) : (
          <span aria-hidden className="px-2 text-ink-secondary">
            ▾
          </span>
        )}
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="tower-fade absolute z-20 mt-1 max-h-64 w-full overflow-y-auto border border-line bg-surface-1"
        >
          {loading ? (
            <li role="presentation" className="px-3 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              {t({ es: 'Cargando…', en: 'Loading…' }, locale)}
            </li>
          ) : filtered.length === 0 ? (
            <li role="presentation" className="px-3 py-2 font-ui text-t0 text-ink-secondary">
              {emptyText ?? t({ es: 'Sin resultados', en: 'No results' }, locale)}
            </li>
          ) : (
            filtered.map((o, i) => (
              <li
                key={o.id}
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown (not click) so selection lands before the input blurs.
                onMouseDown={(e) => {
                  e.preventDefault()
                  commit(o)
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 px-3 py-2',
                  i === active ? 'bg-surface-0' : '',
                )}
              >
                <span className="min-w-0 flex-1 truncate font-ui text-t0 text-ink-primary">{o.label}</span>
                {o.hint ? (
                  <span className="shrink-0 font-mono text-label text-ink-secondary" data-numeric>
                    {o.hint}
                  </span>
                ) : null}
                {o.badge ? (
                  <span className="shrink-0 font-mono text-label uppercase tracking-[0.08em] text-lane-accent">
                    {o.badge}
                  </span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
