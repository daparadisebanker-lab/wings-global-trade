// src/components/catalog/spec-form/SpecForm.tsx
// The signature Catalog Studio component (COMPONENT_TREE.md ★): renders typed
// fields from a `tower.spec_schemas.json_schema` (ADR-3) — one component for
// all six archetypes, never a per-archetype form. TOWER control-room styling
// only (DESIGN_SYSTEM.md); no @wings/trade-ui primitives (those carry the
// public site's brand tokens, the wrong livery here).
'use client'

// Explicit default import: needed for the classic JSX runtime this workspace's
// vitest falls back to (no @vitejs/plugin-react configured) — see fields.tsx.
import React, { useMemo } from 'react'
import { DEFAULT_LOCALE, type Locale } from '../../../lib/i18n'
import type { JsonSchema } from '../../../lib/schemas/spec'
import { ArrayField, BooleanField, EnumField, LocalizedStringField, NumberField, StringField } from './fields'
import { mergeSpecValue } from './state'
import { validateSpecValue } from './validate'

export interface SpecFormProps {
  schema: JsonSchema
  value: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
  locale?: Locale
  disabled?: boolean
}

/** Renders one field for a JSON-Schema property — the only switch in the module (data-driven, one branch per JSON type). */
function renderField(
  key: string,
  prop: JsonSchema['properties'][string],
  props: Omit<Parameters<typeof StringField>[0], 'fieldKey' | 'prop'>,
) {
  if (prop['x-localized']) return <LocalizedStringField key={key} fieldKey={key} prop={prop} {...props} />
  if (prop.enum) return <EnumField key={key} fieldKey={key} prop={prop} {...props} />

  switch (prop.type) {
    case 'string':
      return <StringField key={key} fieldKey={key} prop={prop} {...props} />
    case 'number':
    case 'integer':
      return <NumberField key={key} fieldKey={key} prop={prop} {...props} />
    case 'boolean':
      return <BooleanField key={key} fieldKey={key} prop={prop} {...props} />
    case 'array':
      return <ArrayField key={key} fieldKey={key} prop={prop} {...props} />
    default:
      return null
  }
}

export function SpecForm({ schema, value, onChange, locale = DEFAULT_LOCALE, disabled = false }: SpecFormProps) {
  const errors = useMemo(() => validateSpecValue(schema, value, locale), [schema, value, locale])

  const orderedEntries = useMemo(
    () =>
      Object.entries(schema.properties).sort(
        ([, a], [, b]) => (a['x-order'] ?? 0) - (b['x-order'] ?? 0),
      ),
    [schema],
  )

  return (
    <div className="flex flex-col gap-4" data-spec-form data-archetype={schema['x-archetype']}>
      {orderedEntries.map(([key, prop]) =>
        renderField(key, prop, {
          value: value[key],
          onChange: (fieldValue) => onChange(mergeSpecValue(value, key, fieldValue)),
          locale,
          disabled,
          error: errors[key],
          required: schema.required.includes(key),
        }),
      )}
    </div>
  )
}
