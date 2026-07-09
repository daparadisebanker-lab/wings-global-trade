// src/lib/schemas/spec/resolve.ts
// Relative import (not the `@/*` alias): vitest/Vite has no path-alias config in
// this workspace yet (only Next.js's tsconfig resolves `@/*`), so a value-level
// `@/` import here would resolve fine under `next build` but fail every test
// that transitively imports this module. Relative works under both.
import { resolveSpecSchema, type Archetype, type SpecSchemaRow } from '../../archetypes'
import { SPEC_JSON_SCHEMA_DEFAULTS } from './registry'
import type { JsonSchema } from './types'

/**
 * Resolve the JSON-Schema SpecForm/SpecView render from, for a product of
 * `archetype` in lane `laneId`. Mirrors the `tower.spec_schemas` precedence via
 * `lib/archetypes.resolveSpecSchema` (lane override wins when the archetype
 * allows it, else the archetype default, highest version).
 *
 * This module owns the field *definitions*, not the Supabase read — the
 * catalog page/server action fetches the lane's `tower.spec_schemas` rows
 * (RLS-scoped) and passes them in as `overrideRows`. With no rows (or none
 * matching), the archetype default is returned — which is enough to unblock
 * SpecForm before any lane has published an override.
 */
export function getSpecSchema(
  archetype: Archetype,
  laneId?: string | null,
  overrideRows?: SpecSchemaRow[],
): JsonSchema {
  if (overrideRows && overrideRows.length > 0) {
    const resolved = resolveSpecSchema(archetype, laneId ?? null, overrideRows)
    if (resolved) return resolved.jsonSchema as unknown as JsonSchema
  }
  return SPEC_JSON_SCHEMA_DEFAULTS[archetype]
}
