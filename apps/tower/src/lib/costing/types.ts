// src/lib/costing/types.ts
// Peru SUNAT import-cost engine types — ported faithfully from wings-operations
// (lib/types.ts, engine commit c74b60e) so the numeric parity oracle
// (fixtures.json) transfers 1:1. This is the engine's INTERNAL representation:
// amounts are USD major units and rates are decimal fractions, exactly as the
// validated engine consumes them. The integer-minor-units + basis-points
// persistence boundary (TOWER Directive 3) is applied by the costing action
// layer in a later wave (SPEC §2.1) — never inside the engine, where it would
// risk the load-bearing soles↔USD rounding.

export type FuelType = 'hybrid' | 'gasoline' | 'diesel' | 'electric'
export type Origin = 'china' | 'other'
export type Incoterm = 'EXW' | 'FOB' | 'CFR' | 'CIF'

/** How `freightInternational` was derived from container fill (container-freight.ts).
 *  Persisted alongside the plain number so a reopened calculation shows its own
 *  working, not just the resulting figure — optional, backward compatible. */
export interface ContainerFreightConfig {
  itemLengthMm: number
  itemWidthMm: number
  itemHeightMm: number
  weightEachKg?: number | null
  containerKind: '20GP' | '40GP' | '40HC'
  rotatable: boolean
  stackable: boolean
  containerRateUsd: number
  quantity: number
}

export interface ImportInputs {
  productName: string
  brand: string
  model: string
  // Automotive ISC drivers (required for the parity-locked auto path). A
  // non-automotive lane still supplies neutral values (e.g. gasoline/0) and sets
  // `iscRate` below to 0 — which overrides these, so they never affect its math.
  fuelType: FuelType
  engineCC: number
  /** Explicit ISC rate (decimal fraction) — the generalization seam (D5). When
   *  set, overrides the fuel/CC derivation: non-automotive lanes pass 0; goods
   *  that DO carry ISC (alcohol, tobacco, fuels) pass their statutory rate. Left
   *  undefined for vehicles so the automotive fuel/CC rule (and its parity) holds. */
  iscRate?: number
  origin: Origin
  year: number
  incoterm: Incoterm
  fob: number // EXW=factory price, FOB=fob, CFR=cfr value, CIF=cif value
  transportOrigin: number // EXW only: transporte fábrica → puerto origen
  freightInternational: number // EXW + FOB only
  /** Present when `freightInternational` was derived from container fill rather
   *  than typed by hand — see ContainerFreightConfig. Null/undefined when the
   *  operator entered the number directly. */
  containerFreight?: ContainerFreightConfig | null
  freightZofratacna: number
  portExpenses: number
  customsAgency: number
  handlingStowage: number
  adValoremRate: number
  igvRate: number
  percepcionRate: number
  insuranceRate: number
  /** Pago a Cuenta del Impuesto a la Renta — the monthly income-tax advance
   *  (statutory default 1.77% of the pre-IGV sale price). A real cash outflow at
   *  sale time, distinct from the recoverable IGV/percepción advanced at import.
   *  Optional — defaults to 0.0177 in the engine when omitted (legacy inputs/fixtures). */
  paCuentaRentaRate?: number
  exchangeRate: number
  marginMode: 'percent' | 'target_price'
  marginPercent: number
  targetSalePrice: number
}

export interface ImportResult {
  insurance: number
  cif: number
  adValorem: number
  iscRate: number
  isc: number
  igvImportacion: number
  percepcion: number
  gastosVinculados: number
  landedCost: number
  cashOutlay: number
  marginRate: number
  marginUSD: number
  salePrice: number
  igvVentas: number
  salePriceFinal: number
  igvNetPayable: number
  netProfit: number
  // Módulo 7 — tres bloques de margen
  margenBruto: number
  margenBrutoPct: number
  impuestosRecuperablesUSD: number
  impuestosRecuperablesPEN: number
  margenNetoReal: number
  margenNetoRealPct: number
  /** Pago a Cuenta del Impuesto a la Renta on the pre-IGV sale price (USD/PEN) —
   *  deducted from margenNetoCaja below (2026-08-14 addition; see engine.ts). */
  paCuentaRenta: number
  paCuentaRentaPEN: number
  margenNetoCaja: number
  margenNetoCajaPct: number
}

// ── Prorrateo (multi-item cost allocation) ───────────────────────────────────

export type MetodoProrrateo = 'cbm' | 'peso' | 'valor_cif' | 'unidad'
export type Moneda = 'USD' | 'PEN'

export interface ItemProrrateo {
  item_id: string
  sku: string
  descripcion: string
  cantidad: number
  peso_total_kg: number
  cbm_total: number
  valor_total_cif: number
}

export interface GastoProrrateo {
  gasto_id: string
  nombre: string
  monto_total: number
  moneda: Moneda
  metodo: MetodoProrrateo
}

export interface ResultadoItemProrrateo {
  item: ItemProrrateo
  desglose: Record<
    string,
    { monto: number; moneda: Moneda; metodo: MetodoProrrateo; proporcion: number }
  >
  costo_logistico_total_usd: number
  costo_logistico_unitario_usd: number
  costo_compra_unitario_usd: number
  costo_total_puesto_almacen_unitario_usd: number
  costo_total_puesto_almacen_total_usd: number
}

export interface ResultadoProrrateo {
  items: ResultadoItemProrrateo[]
  validacion: Record<
    string,
    { monto_original: number; moneda: Moneda; suma_prorrateada: number; coincide: boolean }
  >
  tipo_cambio: number
}
