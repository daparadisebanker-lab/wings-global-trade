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

/** Items schema for an `array` property — SpecForm supports string/number items only. */
export interface JsonSchemaArrayItems {
  type: 'string' | 'number'
  enum?: string[]
  'x-enum-labels'?: Record<string, Localized>
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
  enum?: string[]
  /** Bilingual label per enum value — required whenever `enum` is set. */
  'x-enum-labels'?: Record<string, Localized>
  minimum?: number
  maximum?: number
  items?: JsonSchemaArrayItems
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
