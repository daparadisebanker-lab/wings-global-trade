'use client'

// ES/EN name inputs — wholesale copy is bilingual everywhere (root CLAUDE.md).
import type { Localized } from '@/lib/archetypes'

export function NameFields({
  value,
  onChange,
  disabled = false,
}: {
  value: Localized
  onChange: (next: Localized) => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Nombre (ES)</span>
        <input
          value={value.es}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, es: e.target.value })}
          className="rounded-card border border-line bg-surface-1 px-3 py-2 font-ui text-t1 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-50"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Name (EN)</span>
        <input
          value={value.en}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          className="rounded-card border border-line bg-surface-1 px-3 py-2 font-ui text-t1 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-50"
        />
      </label>
    </div>
  )
}
