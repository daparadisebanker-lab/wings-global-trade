import { z } from 'zod'

/**
 * The six purchase-logic archetypes (ecosystem CLAUDE.md §3). Every lane maps to
 * exactly one. The archetype — never a hardcoded list in a component — determines
 * pipeline stages, RFQ unit math, and spec-schema resolution. A new lane lights up
 * in TOWER with zero code changes: one `lanes` row + memberships.
 */
export const ARCHETYPE_CODES = [
  'EQUIPMENT',
  'PROJECT',
  'COMMODITY',
  'PROGRAM',
  'CREDENTIAL',
  'ORIGIN',
  // ALLOCATION — the 7th archetype (root CLAUDE.md §3, §5-bis). Represented
  // brands (RB/xx) sell container-only: a buyer buys a share of a planned
  // container (per slot / per quantity-in-container, server-converted to slots).
  // Ratified in §5-bis, so this is registration, not a new-archetype proposal.
  'ALLOCATION',
] as const

export const archetypeSchema = z.enum(ARCHETYPE_CODES)
export type Archetype = z.infer<typeof archetypeSchema>

/** A bilingual label. Copy is ES/EN-ready across TOWER. */
export const localizedSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
})
export type Localized = z.infer<typeof localizedSchema>

/**
 * One ordered pipeline stage. The set is archetype-native (PRODUCT_BRIEF
 * "archetype-native pipelines"): PipelineBoard columns read the set from here,
 * never from admin configuration.
 */
export const stageSchema = z.object({
  /** Machine key, snake_case — stable, used for stage validation on RFQs. */
  id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  label: localizedSchema,
  /** A closing/won stage — no further forward transition. */
  terminal: z.boolean().default(false),
})
export type Stage = z.infer<typeof stageSchema>

export const stageSetSchema = z.array(stageSchema).min(1)
export type StageSet = z.infer<typeof stageSetSchema>

/**
 * A unit the buyer negotiates in (root CLAUDE.md §3 "Unit math"). RFQ line items
 * read their unit set from here so the RFQFlow never hardcodes "per MT" or "per key".
 */
export const unitSchema = z.object({
  /** Machine key, e.g. 'per_unit', 'per_key', 'per_m2', 'per_container'. */
  id: z.string().regex(/^per_[a-z0-9_]+$/),
  label: localizedSchema,
  /** Short display token, e.g. 'u', 'key', 'm²', 'MT', 'CTNR'. */
  abbr: z.string().min(1),
  /**
   * True when the unit's quantity multiplies a per-unit CBM to yield container
   * volume — the FillMeter and container commit math read this flag, not the code.
   */
  cbmBearing: z.boolean().default(false),
})
export type Unit = z.infer<typeof unitSchema>

export const unitMathSchema = z
  .object({
    units: z.array(unitSchema).min(1),
    /** Primary unit the buyer negotiates in — must be one of `units`. */
    defaultUnitId: z.string(),
  })
  .refine((m) => m.units.some((u) => u.id === m.defaultUnitId), {
    message: 'defaultUnitId must reference a unit in `units`',
    path: ['defaultUnitId'],
  })
export type UnitMath = z.infer<typeof unitMathSchema>

/**
 * How a product's spec JSON-Schema is resolved for this archetype. Mirrors the
 * `spec_schemas` table shape (archetype, lane_id nullable, version, json_schema):
 * a lane override wins over the archetype default; the highest version wins.
 */
export const specSchemaResolutionSchema = z.object({
  /** Key hint for the archetype-default schema row (lane_id = null). */
  defaultSchemaKey: z.string().min(1),
  /** Whether a lane may publish an override row (lane_id = the lane). */
  allowLaneOverride: z.boolean(),
})
export type SpecSchemaResolution = z.infer<typeof specSchemaResolutionSchema>

/** A row of the `spec_schemas` table, as read by `resolveSpecSchema`. */
export const specSchemaRowSchema = z.object({
  archetype: archetypeSchema,
  /** null = archetype default; a uuid = lane override. */
  laneId: z.string().uuid().nullable(),
  version: z.number().int().positive(),
  jsonSchema: z.record(z.unknown()),
})
export type SpecSchemaRow = z.infer<typeof specSchemaRowSchema>

/** The complete config for one archetype — the single source of truth. */
export const archetypeConfigSchema = z.object({
  code: archetypeSchema,
  label: localizedSchema,
  /** What the buyer actually buys (root CLAUDE.md §3). */
  buyerBuys: localizedSchema,
  /** Short IA-pattern descriptor (root CLAUDE.md §3 / §Phase-3). */
  iaPattern: z.string().min(1),
  stages: stageSetSchema,
  unitMath: unitMathSchema,
  specSchema: specSchemaResolutionSchema,
})
export type ArchetypeConfig = z.infer<typeof archetypeConfigSchema>

/** Line-item math input. Money is always integer minor units (ADR-7). */
export interface LineInput {
  unitId: string
  /** Count of units. May be fractional for area/mass units (m², MT). */
  quantity: number
  /** Price per unit, integer minor units (e.g. cents). Never a float. */
  unitPriceMinor: number
  /** Per-unit CBM, required only for `cbmBearing` units. */
  cbmPerUnit?: number
}

export interface LineExtension {
  /** Line total, integer minor units. */
  totalMinor: number
  /** Derived container volume, present only for cbm-bearing units. */
  cbm?: number
}
