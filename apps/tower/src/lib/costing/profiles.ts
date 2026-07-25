// src/lib/costing/profiles.ts
// Goods-type cost profiles — the lane-logic layer over the (parity-locked) SUNAT
// engine. The engine never changes: a profile only decides WHICH driver inputs a
// costing form exposes and HOW ISC is set, routing through the engine's existing
// `iscRate` seam (D5). Vehicles keep the fuel/displacement rule; every other kind
// of goods hides those fields and passes an explicit (default 0, editable) ISC —
// so a chemicals or machinery sheet never inherits automotive ISC.
//
// This is the same "archetype drives structure" law the ecosystem applies to
// lanes, brought to the costing form: pick the goods, the form filters itself.
// Pure + unit-tested; the component reads it, the engine stays untouched.

export type GoodsProfileId =
  | 'vehiculos'
  | 'maquinaria'
  | 'linea_blanca'
  | 'materiales_construccion'
  | 'textiles'
  | 'insumos'
  | 'generico'

/** An identity text input, bound to one of the engine's free-text fields but
 *  RELABELLED per goods (a vehicle's "Marca/Modelo" is a chemical's
 *  "Fabricante/Grado"). No new stored fields — the engine shape is unchanged. */
export interface IdentityField {
  key: 'productName' | 'brand' | 'model'
  labelEs: string
  labelEn: string
}

export interface GoodsProfile {
  id: GoodsProfileId
  labelEs: string
  labelEn: string
  /** One-line hint of the goods this profile costs. */
  hintEs: string
  /** Ordered identity fields (product/brand/model relabelled for the goods). */
  identity: IdentityField[]
  /** Show the automotive drivers: fuel type · displacement (CC) · year. */
  vehicleDrivers: boolean
  /**
   * How ISC is set:
   *  · 'auto_fuel_cc' — leave `iscRate` unset so the engine's fuel/CC rule runs
   *    (vehicles only; preserves parity).
   *  · 'zero_editable' — pass an explicit `iscRate` (default 0, operator-editable),
   *    so non-automotive goods carry no ISC unless one is entered.
   */
  isc: 'auto_fuel_cc' | 'zero_editable'
}

/** Selector order (vehicles first — the parity-anchored path — then by import volume). */
export const GOODS_PROFILE_ORDER: GoodsProfileId[] = [
  'vehiculos',
  'maquinaria',
  'linea_blanca',
  'materiales_construccion',
  'textiles',
  'insumos',
  'generico',
]

export const GOODS_PROFILES: Record<GoodsProfileId, GoodsProfile> = {
  vehiculos: {
    id: 'vehiculos',
    labelEs: 'Vehículos',
    labelEn: 'Vehicles',
    hintEs: 'ISC por combustible y cilindrada',
    identity: [
      { key: 'productName', labelEs: 'Producto', labelEn: 'Product' },
      { key: 'brand', labelEs: 'Marca', labelEn: 'Make' },
      { key: 'model', labelEs: 'Modelo', labelEn: 'Model' },
    ],
    vehicleDrivers: true,
    isc: 'auto_fuel_cc',
  },
  maquinaria: {
    id: 'maquinaria',
    labelEs: 'Maquinaria',
    labelEn: 'Machinery',
    hintEs: 'Ad Valorem por HS · sin ISC',
    identity: [
      { key: 'productName', labelEs: 'Producto', labelEn: 'Product' },
      { key: 'brand', labelEs: 'Fabricante', labelEn: 'Manufacturer' },
      { key: 'model', labelEs: 'Modelo / Serie', labelEn: 'Model / Series' },
    ],
    vehicleDrivers: false,
    isc: 'zero_editable',
  },
  linea_blanca: {
    id: 'linea_blanca',
    labelEs: 'Línea blanca',
    labelEn: 'Appliances',
    hintEs: 'Ad Valorem por HS · sin ISC',
    identity: [
      { key: 'productName', labelEs: 'Producto', labelEn: 'Product' },
      { key: 'brand', labelEs: 'Marca', labelEn: 'Brand' },
      { key: 'model', labelEs: 'Modelo / Capacidad', labelEn: 'Model / Capacity' },
    ],
    vehicleDrivers: false,
    isc: 'zero_editable',
  },
  materiales_construccion: {
    id: 'materiales_construccion',
    labelEs: 'Materiales de construcción',
    labelEn: 'Construction materials',
    hintEs: 'Ad Valorem por HS · sin ISC',
    identity: [
      { key: 'productName', labelEs: 'Producto', labelEn: 'Product' },
      { key: 'brand', labelEs: 'Marca / Fabricante', labelEn: 'Brand / Manufacturer' },
      { key: 'model', labelEs: 'Formato / medida', labelEn: 'Format / size' },
    ],
    vehicleDrivers: false,
    isc: 'zero_editable',
  },
  textiles: {
    id: 'textiles',
    labelEs: 'Textiles',
    labelEn: 'Textiles',
    hintEs: 'Ad Valorem por HS · sin ISC',
    identity: [
      { key: 'productName', labelEs: 'Producto', labelEn: 'Product' },
      { key: 'brand', labelEs: 'Marca / Fabricante', labelEn: 'Brand / Manufacturer' },
      { key: 'model', labelEs: 'Composición / calidad', labelEn: 'Composition / quality' },
    ],
    vehicleDrivers: false,
    isc: 'zero_editable',
  },
  insumos: {
    id: 'insumos',
    labelEs: 'Insumos',
    labelEn: 'Inputs',
    hintEs: 'Ad Valorem por HS · sin ISC',
    identity: [
      { key: 'productName', labelEs: 'Producto', labelEn: 'Product' },
      { key: 'brand', labelEs: 'Proveedor', labelEn: 'Supplier' },
      { key: 'model', labelEs: 'Presentación', labelEn: 'Presentation' },
    ],
    vehicleDrivers: false,
    isc: 'zero_editable',
  },
  generico: {
    id: 'generico',
    labelEs: 'Genérico',
    labelEn: 'Generic',
    hintEs: 'Ad Valorem por HS · sin ISC',
    identity: [
      { key: 'productName', labelEs: 'Producto', labelEn: 'Product' },
      { key: 'brand', labelEs: 'Marca', labelEn: 'Brand' },
      { key: 'model', labelEs: 'Modelo', labelEn: 'Model' },
    ],
    vehicleDrivers: false,
    isc: 'zero_editable',
  },
}

/**
 * Default goods profile for a lane's archetype (the selector's starting point;
 * always operator-overridable). Deliberately maps NOTHING to `vehiculos` — the
 * automotive path is only reached by an explicit pick, so a non-vehicle lane
 * never opens on fuel/cylinder fields. Unknown/absent → `generico`.
 */
const ARCHETYPE_DEFAULT: Record<string, GoodsProfileId> = {
  EQUIPMENT: 'maquinaria',
  COMMODITY: 'insumos',
  PROGRAM: 'linea_blanca',
  PROJECT: 'materiales_construccion', // Interiors buys building / finishing materials
  CREDENTIAL: 'generico',
  ORIGIN: 'insumos',
  ALLOCATION: 'generico',
}

export function defaultProfileForArchetype(archetype?: string | null): GoodsProfileId {
  if (!archetype) return 'generico'
  return ARCHETYPE_DEFAULT[archetype.toUpperCase()] ?? 'generico'
}

/**
 * Best-effort profile for a re-opened saved calc, inferred from its inputs alone
 * (the profile itself isn't persisted). Vehicles are the ONLY path that leaves
 * ISC to the fuel/CC rule (iscRate null/undefined); anything else stored an
 * explicit rate. Legacy rows (pre-profiles) have no iscRate and were all
 * vehicle-costed, so they correctly infer `vehiculos`.
 */
export function inferProfileFromInputs(inputs: { iscRate?: number | null }): GoodsProfileId {
  return inputs.iscRate == null ? 'vehiculos' : 'generico'
}
