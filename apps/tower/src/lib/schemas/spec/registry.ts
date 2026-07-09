// src/lib/schemas/spec/registry.ts
// THE source of truth for archetype-default spec fields. Mirrors
// lib/archetypes/config.ts: one entry per archetype, no branching downstream —
// getSpecSchema (./resolve.ts) and seed.sql are both generated from this map.
import { z } from 'zod'
import type { Archetype } from '@/lib/archetypes'
import { COMMODITY_SPEC_FIELDS } from './commodity'
import { CREDENTIAL_SPEC_FIELDS } from './credential'
import { EQUIPMENT_SPEC_FIELDS } from './equipment'
import type { SpecFieldDef } from './fields'
import { ORIGIN_SPEC_FIELDS } from './origin'
import { PROGRAM_SPEC_FIELDS } from './program'
import { PROJECT_SPEC_FIELDS } from './project'
import { specFieldsToJsonSchema, specFieldsToZodObject } from './to-json-schema'
import type { JsonSchema } from './types'

/** Bumping this requires a new `tower.spec_schemas` row (version, not an edit-in-place — ADR-3/ADR-6). */
export const SPEC_SCHEMA_VERSION = 1

export const SPEC_FIELD_DEFAULTS: Record<Archetype, SpecFieldDef[]> = {
  EQUIPMENT: EQUIPMENT_SPEC_FIELDS,
  PROJECT: PROJECT_SPEC_FIELDS,
  COMMODITY: COMMODITY_SPEC_FIELDS,
  PROGRAM: PROGRAM_SPEC_FIELDS,
  CREDENTIAL: CREDENTIAL_SPEC_FIELDS,
  ORIGIN: ORIGIN_SPEC_FIELDS,
}

const ARCHETYPE_ENTRIES = Object.entries(SPEC_FIELD_DEFAULTS) as [Archetype, SpecFieldDef[]][]

export const SPEC_JSON_SCHEMA_DEFAULTS: Record<Archetype, JsonSchema> = Object.fromEntries(
  ARCHETYPE_ENTRIES.map(([archetype, fields]) => [
    archetype,
    specFieldsToJsonSchema(archetype, SPEC_SCHEMA_VERSION, fields),
  ]),
) as Record<Archetype, JsonSchema>

/** Real Zod validators — for server actions validating `products.specs` before insert/update. */
export const SPEC_ZOD_DEFAULTS: Record<Archetype, z.ZodObject<Record<string, z.ZodTypeAny>>> = Object.fromEntries(
  ARCHETYPE_ENTRIES.map(([archetype, fields]) => [archetype, specFieldsToZodObject(fields)]),
) as Record<Archetype, z.ZodObject<Record<string, z.ZodTypeAny>>>
