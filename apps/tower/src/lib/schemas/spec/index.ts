// src/lib/schemas/spec — schema-driven Catalog Studio spec definitions
// (ARCHITECTURE.md ADR-3). Zod builds and validates; JSON-Schema is the wire
// format SpecForm/SpecView render from.
export * from './types'
export * from './fields'
export {
  SPEC_SCHEMA_VERSION,
  SPEC_FIELD_DEFAULTS,
  SPEC_JSON_SCHEMA_DEFAULTS,
  SPEC_ZOD_DEFAULTS,
} from './registry'
export { getSpecSchema } from './resolve'
export { fieldToZod, specFieldsToJsonSchema, specFieldsToZodObject } from './to-json-schema'
