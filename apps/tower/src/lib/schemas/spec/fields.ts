// src/lib/schemas/spec/fields.ts
// The authoring layer for spec-schema fields. Each archetype file (./equipment,
// ./project, ./commodity, …) builds a `SpecFieldDef[]` with these helpers; the
// same list drives BOTH a real Zod object schema (validation, ADR-3) and the
// JSON-Schema stored in `tower.spec_schemas` (see ./to-json-schema.ts). This
// indirection exists because there is no `zod-to-json-schema` package installed
// in this workspace and Wave 2 must not add a dependency — introspecting Zod's
// internal `_def` shape directly is exactly the kind of version-fragile hack
// that library exists to avoid. Do not "simplify" this by deleting the
// descriptor layer and walking Zod internals instead.
import type { Localized } from '@/lib/i18n'

export type SpecFieldKind =
  | 'string'
  | 'localizedString'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'enum'
  | 'array'
  | 'specRows'

/**
 * The tokenized icon set a `specRows` object-array row may carry. Small, closed,
 * append-only — the row's optional glyph is chosen from THIS list only, so the
 * wire schema publishes a bounded `enum` and the renderer keeps a fixed glyph
 * map (never a raw asset path; Prime Directive 3). Keep it design-token simple.
 */
export const SPEC_ROW_ICONS = ['box', 'pallet', 'cbm', 'weight', 'clock', 'doc', 'tag'] as const
export type SpecRowIcon = (typeof SPEC_ROW_ICONS)[number]

interface BaseFieldDef {
  /** JSON property key — stored verbatim in `products.specs`. */
  key: string
  label: Localized
  description?: Localized
  required?: boolean
}

export interface StringFieldDef extends BaseFieldDef {
  kind: 'string'
  multiline?: boolean
}

export interface LocalizedStringFieldDef extends BaseFieldDef {
  kind: 'localizedString'
}

export interface NumberFieldDef extends BaseFieldDef {
  kind: 'number' | 'integer'
  min?: number
  max?: number
  unit?: string
}

export interface BooleanFieldDef extends BaseFieldDef {
  kind: 'boolean'
}

export interface EnumOption {
  value: string
  label: Localized
}

export interface EnumFieldDef extends BaseFieldDef {
  kind: 'enum'
  options: EnumOption[]
}

export interface ArrayFieldDef extends BaseFieldDef {
  kind: 'array'
  items: { type: 'string' | 'number'; options?: EnumOption[] }
}

/**
 * An object-array field whose items are `{ label, value, icon? }` rows — the
 * fiche/spec-row table the frozen scalar `ArrayFieldDef` could not express
 * (root allocation.ts note). Additive: existing kinds are untouched. `label` and
 * `value` are free author text (a single string each — the row is brand-authored
 * presentation, not a localized pair); `icon` is optional, from `SPEC_ROW_ICONS`.
 */
export interface SpecRowsFieldDef extends BaseFieldDef {
  kind: 'specRows'
}

export type SpecFieldDef =
  | StringFieldDef
  | LocalizedStringFieldDef
  | NumberFieldDef
  | BooleanFieldDef
  | EnumFieldDef
  | ArrayFieldDef
  | SpecRowsFieldDef

// ── Builders (archetype files compose these) ──────────────────────────────

export function stringField(
  key: string,
  label: Localized,
  opts: Partial<Omit<StringFieldDef, 'key' | 'kind' | 'label'>> = {},
): StringFieldDef {
  return { key, kind: 'string', label, ...opts }
}

export function localizedStringField(
  key: string,
  label: Localized,
  opts: Partial<Omit<LocalizedStringFieldDef, 'key' | 'kind' | 'label'>> = {},
): LocalizedStringFieldDef {
  return { key, kind: 'localizedString', label, ...opts }
}

export function numberField(
  key: string,
  label: Localized,
  opts: Partial<Omit<NumberFieldDef, 'key' | 'kind' | 'label'>> = {},
): NumberFieldDef {
  return { key, kind: 'number', label, ...opts }
}

export function integerField(
  key: string,
  label: Localized,
  opts: Partial<Omit<NumberFieldDef, 'key' | 'kind' | 'label'>> = {},
): NumberFieldDef {
  return { key, kind: 'integer', label, ...opts }
}

export function booleanField(
  key: string,
  label: Localized,
  opts: Partial<Omit<BooleanFieldDef, 'key' | 'kind' | 'label'>> = {},
): BooleanFieldDef {
  return { key, kind: 'boolean', label, ...opts }
}

export function enumField(
  key: string,
  label: Localized,
  options: EnumOption[],
  opts: Partial<Omit<EnumFieldDef, 'key' | 'kind' | 'label' | 'options'>> = {},
): EnumFieldDef {
  return { key, kind: 'enum', label, options, ...opts }
}

export function arrayField(
  key: string,
  label: Localized,
  items: ArrayFieldDef['items'],
  opts: Partial<Omit<ArrayFieldDef, 'key' | 'kind' | 'label' | 'items'>> = {},
): ArrayFieldDef {
  return { key, kind: 'array', label, items, ...opts }
}

export function specRowsField(
  key: string,
  label: Localized,
  opts: Partial<Omit<SpecRowsFieldDef, 'key' | 'kind' | 'label'>> = {},
): SpecRowsFieldDef {
  return { key, kind: 'specRows', label, ...opts }
}
