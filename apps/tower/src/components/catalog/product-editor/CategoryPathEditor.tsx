'use client'

// category_path chip editor — an ordered array of slug segments
// (DATABASE_SCHEMA `products.category_path text[]`, e.g. {'ffe','seating'}).
import { useState } from 'react'

function normalizeSegment(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function CategoryPathEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
}) {
  const [draft, setDraft] = useState('')

  function commit() {
    const segment = normalizeSegment(draft)
    if (segment && !value.includes(segment)) onChange([...value, segment])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
        Ruta de categoría / Category path
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {value.map((segment, index) => (
          <span
            key={segment}
            className="flex items-center gap-1 rounded-card border border-line bg-surface-1 px-2 py-1 font-mono text-t0 text-ink-primary"
          >
            {index > 0 ? <span className="text-ink-secondary">/</span> : null}
            {segment}
            {!disabled ? (
              <button
                type="button"
                aria-label={`Quitar ${segment}`}
                onClick={() => onChange(value.filter((s) => s !== segment))}
                className="text-ink-secondary hover:text-negative"
              >
                ×
              </button>
            ) : null}
          </span>
        ))}
        {!disabled ? (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                commit()
              }
            }}
            onBlur={commit}
            placeholder="agregar segmento… / add segment…"
            className="w-40 rounded-card border border-line bg-surface-0 px-2 py-1 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
          />
        ) : null}
      </div>
    </div>
  )
}
