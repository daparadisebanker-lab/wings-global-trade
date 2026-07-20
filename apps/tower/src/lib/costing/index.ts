// Peru SUNAT import-cost engine (TOWER Wave 6.1 — faithful port of
// wings-operations, validated by parity.test.ts against fixtures.json).
// Pure numeric core only; persistence (integer minor units) + UI land in
// later waves (programs/peru-costing/SPEC.md §7).
export { computeImportCost, deriveISCRate, DEFAULT_INPUTS } from './engine'
export { calcularProrrateo } from './prorrateo'
export type {
  ImportInputs,
  ImportResult,
  Incoterm,
  FuelType,
  Origin,
  ItemProrrateo,
  GastoProrrateo,
  ResultadoItemProrrateo,
  ResultadoProrrateo,
  MetodoProrrateo,
  Moneda,
} from './types'
