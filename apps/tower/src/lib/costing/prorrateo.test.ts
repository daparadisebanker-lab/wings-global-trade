// Unit coverage for the decimal.js allocation core (in addition to the
// fixtures.json case-F parity gate in parity.test.ts). Locks the residual
// adjuster, the sum-back invariant, and the PEN→USD conversion so the
// Decimal port cannot silently drift.
import { describe, expect, it } from 'vitest'
import { calcularProrrateo } from './prorrateo'
import type { ItemProrrateo, GastoProrrateo } from './types'

function item(id: string, over: Partial<ItemProrrateo> = {}): ItemProrrateo {
  return {
    item_id: id,
    sku: id,
    descripcion: id,
    cantidad: 1,
    peso_total_kg: 0,
    cbm_total: 1,
    valor_total_cif: 0,
    ...over,
  }
}

describe('calcularProrrateo — decimal core', () => {
  it('rounds a 3-way split and assigns the residual to the first largest item', () => {
    const items = [item('a'), item('b'), item('c')] // equal cbm → equal shares
    const gastos: GastoProrrateo[] = [
      { gasto_id: 'g1', nombre: 'flete', monto_total: 100, moneda: 'USD', metodo: 'cbm' },
    ]
    const r = calcularProrrateo(items, gastos, 3.7)

    // 100/3 = 33.333… → 33.33 each; residual 0.01 lands on the first item.
    expect(r.items[0].desglose.g1.monto).toBe(33.34)
    expect(r.items[1].desglose.g1.monto).toBe(33.33)
    expect(r.items[2].desglose.g1.monto).toBe(33.33)

    // Sum-back invariant: shares reconstruct the original gasto exactly.
    const sum = r.items.reduce((a, it) => a + it.desglose.g1.monto, 0)
    expect(sum).toBeCloseTo(100, 10)
    expect(r.validacion.g1.suma_prorrateada).toBe(100)
    expect(r.validacion.g1.coincide).toBe(true)

    expect(r.items[0].costo_total_puesto_almacen_total_usd).toBe(33.34)
  })

  it('converts a PEN gasto into USD by the exchange rate', () => {
    const items = [item('a'), item('b')]
    const gastos: GastoProrrateo[] = [
      { gasto_id: 'g1', nombre: 'agencia', monto_total: 74, moneda: 'PEN', metodo: 'cbm' },
    ]
    const r = calcularProrrateo(items, gastos, 3.7)
    // 74 PEN / 2 items = 37.00 PEN each; /3.70 = 10.00 USD each.
    expect(r.items[0].desglose.g1.monto).toBe(37) // recorded in gasto currency (PEN)
    expect(r.items[0].costo_logistico_total_usd).toBe(10)
    expect(r.items[1].costo_logistico_total_usd).toBe(10)
  })

  it('empty inputs return an empty result', () => {
    expect(calcularProrrateo([], [], 3.7).items).toEqual([])
  })
})
