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
//
// NUMERIC CORE (TOWER Directive 3 — no IEEE float touches money): every money
// computation runs in `decimal.js`, the same sanctioned arbitrary-precision core
// as engine.ts — never native `number` arithmetic. The `.toNumber()` conversions
// are ALL applied to values already rounded to 2dp, so they are exact; the
// integer-minor conversion for storage happens at the persistence boundary
// (costing action → `toMinor`), never here.
//
// ROUNDING SEMANTICS: the source used `Math.round(x*100)/100`, i.e. round-half
// toward +∞ (Math.round: 2.5→3, −2.5→−2) — which is decimal.js ROUND_HALF_CEIL,
// NOT the global ROUND_HALF_UP (away-from-zero) that engine.ts sets. `r2` below
// pins ROUND_HALF_CEIL explicitly so parity holds at every half-cent boundary.
import Decimal from 'decimal.js'
import type {
  ItemProrrateo,
  GastoProrrateo,
  ResultadoItemProrrateo,
  ResultadoProrrateo,
  MetodoProrrateo,
} from './types'

function d(n: number): Decimal {
  return new Decimal(n)
}
/** Round to 2dp, ties toward +∞ — byte-faithful to the source's Math.round(x*100)/100. */
function r2(x: Decimal): Decimal {
  return x.toDecimalPlaces(2, Decimal.ROUND_HALF_CEIL)
}

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

  // Desglose matrix: item_id → gasto_id → detail
  const desglose: Record<string, ResultadoItemProrrateo['desglose']> = {}
  items.forEach((it) => {
    desglose[it.item_id] = {}
  })

  // Validation
  const validacion: ResultadoProrrateo['validacion'] = {}

  // Per-item accumulated cost in USD — kept as Decimal until the final round.
  const costoUSDdec: Record<string, Decimal> = {}
  items.forEach((it) => {
    costoUSDdec[it.item_id] = d(0)
  })
  const tc = d(tipo_cambio)

  for (const gasto of gastos) {
    const bases = items.map((it) => d(getBase(it, gasto.metodo)))
    const totalBase = bases.reduce((a, b) => a.plus(b), d(0))
    const monto = d(gasto.monto_total)
    const hasBase = totalBase.gt(0)

    // Raw prorated amounts (exact decimal proportion), then round to 2dp.
    const rounded = bases.map((base) =>
      hasBase ? r2(base.dividedBy(totalBase).times(monto)) : d(0),
    )

    // Rounding adjuster: assign the residual to the largest item (first max).
    const sumRounded = rounded.reduce((a, b) => a.plus(b), d(0))
    const diff = r2(monto.minus(sumRounded))
    if (!diff.isZero()) {
      let maxIdx = 0
      for (let i = 1; i < rounded.length; i++) {
        if (rounded[i].gt(rounded[maxIdx])) maxIdx = i
      }
      rounded[maxIdx] = r2(rounded[maxIdx].plus(diff))
    }

    // Record into matrix + accumulate per-item USD cost.
    items.forEach((it, idx) => {
      const proporcion = hasBase ? bases[idx].dividedBy(totalBase) : d(0)
      const montoUSD = gasto.moneda === 'USD' ? rounded[idx] : rounded[idx].dividedBy(tc)
      desglose[it.item_id][gasto.gasto_id] = {
        monto: rounded[idx].toNumber(),
        moneda: gasto.moneda,
        metodo: gasto.metodo,
        proporcion: proporcion.toNumber(),
      }
      costoUSDdec[it.item_id] = costoUSDdec[it.item_id].plus(montoUSD)
    })

    // Validation check.
    const sumaFinal = rounded.reduce((a, b) => a.plus(b), d(0))
    validacion[gasto.gasto_id] = {
      monto_original: gasto.monto_total,
      moneda: gasto.moneda,
      suma_prorrateada: r2(sumaFinal).toNumber(),
      coincide: sumaFinal.minus(monto).abs().lessThan(0.01),
    }
  }

  const resultItems: ResultadoItemProrrateo[] = items.map((it) => {
    const cantidad = d(it.cantidad)
    const hasQty = cantidad.gt(0)
    const costoLogisticoTotal = r2(costoUSDdec[it.item_id])
    const costoLogisticoUnitario = hasQty ? r2(costoLogisticoTotal.dividedBy(cantidad)) : d(0)
    const costoCompraUnitario = hasQty ? r2(d(it.valor_total_cif).dividedBy(cantidad)) : d(0)
    const costoTotalUnitario = r2(costoCompraUnitario.plus(costoLogisticoUnitario))
    const costoTotalTotal = r2(costoTotalUnitario.times(cantidad))

    return {
      item: it,
      desglose: desglose[it.item_id],
      costo_logistico_total_usd: costoLogisticoTotal.toNumber(),
      costo_logistico_unitario_usd: costoLogisticoUnitario.toNumber(),
      costo_compra_unitario_usd: costoCompraUnitario.toNumber(),
      costo_total_puesto_almacen_unitario_usd: costoTotalUnitario.toNumber(),
      costo_total_puesto_almacen_total_usd: costoTotalTotal.toNumber(),
    }
  })

  return { items: resultItems, validacion, tipo_cambio }
}
