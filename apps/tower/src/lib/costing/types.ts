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

export interface ImportInputs {
  productName: string
  brand: string
  model: string
  fuelType: FuelType
  engineCC: number
  origin: Origin
  year: number
  incoterm: Incoterm
  fob: number // EXW=factory price, FOB=fob, CFR=cfr value, CIF=cif value
  transportOrigin: number // EXW only: transporte fábrica → puerto origen
  freightInternational: number // EXW + FOB only
  freightZofratacna: number
  portExpenses: number
  customsAgency: number
  handlingStowage: number
  adValoremRate: number
  igvRate: number
  percepcionRate: number
  insuranceRate: number
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
