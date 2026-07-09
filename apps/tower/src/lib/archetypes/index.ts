/**
 * lib/archetypes — the single source of truth for TOWER's six purchase-logic
 * archetypes (ecosystem CLAUDE.md §3). Pipeline stage columns, RFQ line units,
 * and the schema-driven SpecForm all read from this module. Nothing downstream
 * hardcodes a stage list or a unit — a new lane lights up with zero code changes.
 */
export * from './types'
export { ARCHETYPES } from './config'
export {
  listArchetypes,
  getArchetypeConfig,
  getStages,
  getStageIds,
  isValidStage,
  getUnits,
  getDefaultUnit,
  getUnit,
  isValidUnit,
  computeLineExtension,
  resolveSpecSchema,
} from './resolve'
