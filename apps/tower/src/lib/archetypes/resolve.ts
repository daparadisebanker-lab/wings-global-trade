import { ARCHETYPES } from './config'
import {
  ARCHETYPE_CODES,
  type Archetype,
  type ArchetypeConfig,
  type LineExtension,
  type LineInput,
  type SpecSchemaRow,
  type Stage,
  type Unit,
} from './types'

/**
 * Data-driven accessors over the archetype registry. Every function reads from
 * `ARCHETYPES[archetype]` — there is NO `switch (archetype)` anywhere. Adding an
 * archetype is a config edit, never a branch edit.
 */

export function listArchetypes(): readonly Archetype[] {
  return ARCHETYPE_CODES
}

export function getArchetypeConfig(archetype: Archetype): ArchetypeConfig {
  return ARCHETYPES[archetype]
}

// ── Stages ─────────────────────────────────────────────────────────────────

export function getStages(archetype: Archetype): Stage[] {
  return ARCHETYPES[archetype].stages
}

export function getStageIds(archetype: Archetype): string[] {
  return ARCHETYPES[archetype].stages.map((s) => s.id)
}

/** Validates a stage id against the archetype's set — used by `updateStage`. */
export function isValidStage(archetype: Archetype, stageId: string): boolean {
  return ARCHETYPES[archetype].stages.some((s) => s.id === stageId)
}

// ── Units & line math ────────────────────────────────────────────────────────

export function getUnits(archetype: Archetype): Unit[] {
  return ARCHETYPES[archetype].unitMath.units
}

export function getDefaultUnit(archetype: Archetype): Unit {
  const { units, defaultUnitId } = ARCHETYPES[archetype].unitMath
  // Non-null: config validation guarantees defaultUnitId ∈ units.
  return units.find((u) => u.id === defaultUnitId)!
}

export function getUnit(archetype: Archetype, unitId: string): Unit | undefined {
  return ARCHETYPES[archetype].unitMath.units.find((u) => u.id === unitId)
}

/** True when `unitId` is a valid negotiating unit for the archetype. */
export function isValidUnit(archetype: Archetype, unitId: string): boolean {
  return ARCHETYPES[archetype].unitMath.units.some((u) => u.id === unitId)
}

/**
 * Compute a line-item extension. Money is integer minor units (ADR-7): a float
 * never touches money. The one sanctioned rounding point is the product of a
 * fractional quantity (m², MT) and the integer minor-unit price — rounded to the
 * nearest minor unit. cbm-bearing units also return derived container volume.
 *
 * @throws if the unit is not valid for the archetype, or price/cbm are dirty.
 */
export function computeLineExtension(archetype: Archetype, input: LineInput): LineExtension {
  const unit = getUnit(archetype, input.unitId)
  if (!unit) {
    throw new Error(`Unit "${input.unitId}" is not valid for archetype ${archetype}`)
  }
  if (!Number.isInteger(input.unitPriceMinor)) {
    throw new Error('unitPriceMinor must be an integer (minor units) — money is never a float')
  }
  if (input.quantity < 0) {
    throw new Error('quantity must be non-negative')
  }

  const totalMinor = Math.round(input.quantity * input.unitPriceMinor)

  const ext: LineExtension = { totalMinor }
  if (unit.cbmBearing && input.cbmPerUnit !== undefined) {
    ext.cbm = input.quantity * input.cbmPerUnit
  }
  return ext
}

// ── Spec-schema resolution ────────────────────────────────────────────────────

/**
 * Resolve the spec JSON-Schema for a product of `archetype` in lane `laneId`,
 * given the candidate `spec_schemas` rows. Precedence (matching the table shape):
 *   1. Lane override (laneId match), highest version — only if the archetype
 *      allows lane overrides.
 *   2. Archetype default (laneId = null), highest version.
 * Returns the winning row, or null when nothing is published yet.
 *
 * Pure data selection — identical logic for all six archetypes.
 */
export function resolveSpecSchema(
  archetype: Archetype,
  laneId: string | null,
  rows: SpecSchemaRow[],
): SpecSchemaRow | null {
  const forArchetype = rows.filter((r) => r.archetype === archetype)

  const highestVersion = (candidates: SpecSchemaRow[]): SpecSchemaRow | null =>
    candidates.reduce<SpecSchemaRow | null>(
      (best, r) => (best === null || r.version > best.version ? r : best),
      null,
    )

  if (laneId !== null && ARCHETYPES[archetype].specSchema.allowLaneOverride) {
    const override = highestVersion(forArchetype.filter((r) => r.laneId === laneId))
    if (override) return override
  }

  return highestVersion(forArchetype.filter((r) => r.laneId === null))
}
