// src/components/catalog/spec-form/SpecView.tsx
// Read-only render of a spec value against its JSON-Schema — the printed /
// blueprint-mode spec sheet (COMPONENT_TREE.md `<SpecForm>` sibling used
// wherever a product's spec is displayed rather than edited). Distinct from
// @wings/trade-ui's `SpecSheet` organ, which is the *public-site* surface
// hardcoded to `--mister-*` tokens — this one speaks the control-room livery
// and reads directly off a `tower.spec_schemas` JSON-Schema, not a flat payload.
// Explicit default import: needed for the classic JSX runtime this workspace's
// vitest falls back to (no @vitejs/plugin-react configured) — see fields.tsx.
import React from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '../../../lib/i18n'
import { isScalarArrayItems, type JsonSchema, type JsonSchemaProperty } from '../../../lib/schemas/spec'

export interface SpecViewProps {
  schema: JsonSchema
  value: Record<string, unknown>
  locale?: Locale
  className?: string
}

function formatValue(prop: JsonSchemaProperty, value: unknown, locale: Locale): string | null {
  if (prop['x-localized']) {
    const pair = value as { es?: string; en?: string } | undefined
    const text = pair?.[locale]
    return text && text.length > 0 ? text : null
  }

  if (prop['x-spec-rows']) {
    if (!Array.isArray(value) || value.length === 0) return null
    return (value as Array<{ label?: unknown; value?: unknown }>)
      .map((row) => {
        const label = typeof row?.label === 'string' ? row.label : ''
        const rowValue = typeof row?.value === 'string' ? row.value : ''
        return label && rowValue ? `${label}: ${rowValue}` : label || rowValue
      })
      .filter((s) => s.length > 0)
      .join(' · ') || null
  }

  if (prop.type === 'array') {
    if (!Array.isArray(value) || value.length === 0) return null
    const scalarItems = isScalarArrayItems(prop.items) ? prop.items : undefined
    const labels = scalarItems?.['x-enum-labels'] ?? {}
    return value.map((item) => (labels[String(item)] ? t(labels[String(item)], locale) : String(item))).join(' · ')
  }

  if (prop.type === 'boolean') {
    return value ? t({ es: 'Sí', en: 'Yes' }, locale) : t({ es: 'No', en: 'No' }, locale)
  }

  if (value === undefined || value === null || value === '') return null

  if (prop.enum) {
    const labels = prop['x-enum-labels'] ?? {}
    const key = String(value)
    return labels[key] ? t(labels[key], locale) : key
  }

  return String(value)
}

export function SpecView({ schema, value, locale = DEFAULT_LOCALE, className }: SpecViewProps) {
  const entries = Object.entries(schema.properties)
    .sort(([, a], [, b]) => (a['x-order'] ?? 0) - (b['x-order'] ?? 0))
    .map(([key, prop]) => ({ key, prop, display: formatValue(prop, value[key], locale) }))
    .filter((entry) => entry.display !== null)

  return (
    <div
      className={cn('rounded-card border border-line bg-surface-1', className)}
      data-spec-view
      data-archetype={schema['x-archetype']}
    >
      {entries.map(({ key, prop, display }, index) => (
        <div
          key={key}
          className={cn(
            'flex items-baseline justify-between gap-4 px-4 py-2.5',
            index < entries.length - 1 && 'border-b border-line',
          )}
        >
          <span className="font-mono text-label uppercase tracking-[0.06em] text-ink-secondary">
            {t(prop['x-label'], locale)}
          </span>
          <span className="font-mono text-t1 text-ink-primary" data-numeric>
            {display}
            {prop['x-unit'] ? ` ${prop['x-unit']}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
