// src/lib/schemas/spec/types.ts
// JSON-Schema (draft-07-ish subset) + TOWER vendor extensions (`x-*`) that the
// schema-driven SpecForm renders from. Field defs are authored in Zod-backed
// builders (./fields.ts) for validation + static types; `toJsonSchema`
// (./to-json-schema.ts) is the one-way projection stored in
// `tower.spec_schemas.json_schema` (ADR-3) and consumed by SpecForm/SpecView.
// This is the wire format — the form renderer never imports Zod.
import type { Archetype } from '@/lib/archetypes'
import type { Localized } from '@/lib/i18n'

export type JsonSchemaFieldType = 'string' | 'number' | 'integer' | 'boolean' | 'array'

/** Items schema for a scalar `array` property — SpecForm supports string/number items. */
export interface JsonSchemaArrayItems {
  type: 'string' | 'number'
  enum?: string[]
  'x-enum-labels'?: Record<string, Localized>
}

/**
 * Items schema for a `specRows` object-array property — `{ label, value, icon? }`
 * rows. Additive to the wire format: a valid JSON-Schema array-of-objects. The
 * `x-spec-rows` marker on the property is the renderer's discriminator (a scalar
 * array never carries it), so existing scalar-array handling is untouched.
 */
export interface JsonSchemaObjectItems {
  type: 'object'
  properties: {
    label: { type: 'string' }
    value: { type: 'string' }
    icon?: { type: 'string'; enum: string[] }
  }
  required: string[]
}

/** Narrows a property's `items` to the scalar shape (false for `specRows` object items). */
export function isScalarArrayItems(
  items: JsonSchemaArrayItems | JsonSchemaObjectItems | undefined,
): items is JsonSchemaArrayItems {
  return items !== undefined && items.type !== 'object'
}

/** One property in the spec object schema. */
export interface JsonSchemaProperty {
  type: JsonSchemaFieldType
  /** Bilingual field label — SpecForm's only source of copy (no hardcoded ES/EN strings in the renderer). */
  'x-label': Localized
  'x-description'?: Localized
  /** Render order (ascending). Ties fall back to object key order. */
  'x-order'?: number
  /** Display suffix, e.g. 'kg', 'CBM', 'm²', '%'. Never hardcoded in the component. */
  'x-unit'?: string
  /**
   * True when the *value* is a `{ es: string, en: string }` pair, not a scalar —
   * SpecForm renders an ES/EN tab pair instead of a single input. Only valid on
   * type 'string'.
   */
  'x-localized'?: boolean
  /** True → multi-line text (textarea) instead of a single-line input. */
  'x-multiline'?: boolean
  /**
   * True when this `array` property is an object-array of `{ label, value, icon? }`
   * rows (the `specRows` kind). SpecForm/SpecView branch on this before the scalar
   * array path; when absent, `items` is always the scalar shape (back-compat).
   */
  'x-spec-rows'?: boolean
  enum?: string[]
  /** Bilingual label per enum value — required whenever `enum` is set. */
  'x-enum-labels'?: Record<string, Localized>
  minimum?: number
  maximum?: number
  items?: JsonSchemaArrayItems | JsonSchemaObjectItems
  default?: unknown
}

export interface JsonSchema {
  type: 'object'
  /** Which of the six archetypes this schema was resolved for. */
  'x-archetype': Archetype
  /** Matches the winning `tower.spec_schemas.version` row. */
  'x-version': number
  properties: Record<string, JsonSchemaProperty>
  required: string[]
}
