// src/lib/costing/prorrateo.ts
// Multi-item cost allocation — a FAITHFUL PORT of wings-operations
// lib/prorrateo.ts (engine commit c74b60e), validated to fixtures.json case F.
//
// Allocates each shared gasto across items by cbm / peso / valor_cif / unidad,
// rounds each share to 2dp, then applies a rounding adjuster that assigns the
// residual to the largest item so the shares always sum back to the original.
// As-coded quirks replicated (EXCEL_PARITY.md): totalBase=0 sends the whole
// monto to the first item via the adjuster; ties pick the first maximum;
// costo_total_total = rounded unit × cantidad (may diverge from component sum).
import type {
  ItemProrrateo,
  GastoProrrateo,
  ResultadoItemProrrateo,
  ResultadoProrrateo,
  MetodoProrrateo,
} from './types'

function getBase(item: ItemProrrateo, metodo: MetodoProrrateo): number {
  switch (metodo) {
    case 'cbm':
      return item.cbm_total
    case 'peso':
      return item.peso_total_kg
    case 'valor_cif':
      return item.valor_total_cif
    case 'unidad':
      return item.cantidad
  }
}

export function calcularProrrateo(
  items: ItemProrrateo[],
  gastos: GastoProrrateo[],
  tipo_cambio: number,
): ResultadoProrrateo {
  if (items.length === 0 || gastos.length === 0) {
    return { items: [], validacion: {}, tipo_cambio }
  }

  // Per-item accumulated costs in USD
  const costoUSD: Record<string, number> = {}
  items.forEach((it) => {
    costoUSD[it.item_id] = 0
  })

  // Desglose matrix: item_id → gasto_id → detail
  const desglose: Record<string, ResultadoItemProrrateo['desglose']> = {}
  items.forEach((it) => {
    desglose[it.item_id] = {}
  })

  // Validation
  const validacion: ResultadoProrrateo['validacion'] = {}

  for (const gasto of gastos) {
    const bases = items.map((it) => getBase(it, gasto.metodo))
    const totalBase = bases.reduce((a, b) => a + b, 0)

    // Raw prorated amounts
    const rawAmounts = items.map((it, idx) =>
      totalBase > 0 ? (bases[idx] / totalBase) * gasto.monto_total : 0,
    )

    // Round to 2 decimals
    const rounded = rawAmounts.map((v) => Math.round(v * 100) / 100)

    // Rounding adjuster: assign diff to largest item
    const sumRounded = rounded.reduce((a, b) => a + b, 0)
    const diff = Math.round((gasto.monto_total - sumRounded) * 100) / 100
    if (diff !== 0) {
      const maxIdx = rounded.reduce((best, v, i) => (v > rounded[best] ? i : best), 0)
      rounded[maxIdx] = Math.round((rounded[maxIdx] + diff) * 100) / 100
    }

    // Record into matrix
    items.forEach((it, idx) => {
      const proporcion = totalBase > 0 ? bases[idx] / totalBase : 0
      const montoUSD = gasto.moneda === 'USD' ? rounded[idx] : rounded[idx] / tipo_cambio
      desglose[it.item_id][gasto.gasto_id] = {
        monto: rounded[idx],
        moneda: gasto.moneda,
        metodo: gasto.metodo,
        proporcion,
      }
      costoUSD[it.item_id] += montoUSD
    })

    // Validation check
    const sumaFinal = rounded.reduce((a, b) => a + b, 0)
    validacion[gasto.gasto_id] = {
      monto_original: gasto.monto_total,
      moneda: gasto.moneda,
      suma_prorrateada: Math.round(sumaFinal * 100) / 100,
      coincide: Math.abs(sumaFinal - gasto.monto_total) < 0.01,
    }
  }

  const resultItems: ResultadoItemProrrateo[] = items.map((it) => {
    const costoLogisticoTotal = Math.round(costoUSD[it.item_id] * 100) / 100
    const costoLogisticoUnitario =
      it.cantidad > 0 ? Math.round((costoLogisticoTotal / it.cantidad) * 100) / 100 : 0
    const costoCompraUnitario =
      it.cantidad > 0 ? Math.round((it.valor_total_cif / it.cantidad) * 100) / 100 : 0
    const costoTotalUnitario =
      Math.round((costoCompraUnitario + costoLogisticoUnitario) * 100) / 100
    const costoTotalTotal = Math.round(costoTotalUnitario * it.cantidad * 100) / 100

    return {
      item: it,
      desglose: desglose[it.item_id],
      costo_logistico_total_usd: costoLogisticoTotal,
      costo_logistico_unitario_usd: costoLogisticoUnitario,
      costo_compra_unitario_usd: costoCompraUnitario,
      costo_total_puesto_almacen_unitario_usd: costoTotalUnitario,
      costo_total_puesto_almacen_total_usd: costoTotalTotal,
    }
  })

  return { items: resultItems, validacion, tipo_cambio }
}
