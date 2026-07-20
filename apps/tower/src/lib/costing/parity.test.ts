// Parity gate for the ported Peru cost engine. The engine is correct iff it
// reproduces wings-operations' fixtures.json (generated from the live engine,
// commit c74b60e). Any drift here means the port diverged from the ops-validated
// numbers — a release blocker. Tolerance mirrors the Excel parity run: |Δ| ≤ 0.005.
import { describe, expect, it } from 'vitest'
import fixtures from './fixtures.json'
import { computeImportCost, deriveISCRate } from './engine'
import { calcularProrrateo } from './prorrateo'
import type { ImportInputs, GastoProrrateo, ItemProrrateo } from './types'

const TOL = 0.005

/** Recursively assert `actual` matches `expected`: numbers within TOL, everything
 *  else strictly equal. Walks the nested prorrateo result (desglose/validacion). */
function expectDeepClose(actual: unknown, expected: unknown, path = ''): void {
  if (typeof expected === 'number') {
    expect(typeof actual, `type at ${path}`).toBe('number')
    expect(Math.abs((actual as number) - expected), `|Δ| at ${path} (got ${actual}, want ${expected})`).toBeLessThanOrEqual(TOL)
    return
  }
  if (expected === null || typeof expected !== 'object') {
    expect(actual, `value at ${path}`).toBe(expected)
    return
  }
  if (Array.isArray(expected)) {
    expect(Array.isArray(actual), `array at ${path}`).toBe(true)
    expect((actual as unknown[]).length, `length at ${path}`).toBe(expected.length)
    expected.forEach((v, i) => expectDeepClose((actual as unknown[])[i], v, `${path}[${i}]`))
    return
  }
  for (const key of Object.keys(expected as Record<string, unknown>)) {
    expectDeepClose(
      (actual as Record<string, unknown>)[key],
      (expected as Record<string, unknown>)[key],
      path ? `${path}.${key}` : key,
    )
  }
}

const importCases = fixtures.importCases as Record<
  string,
  { label: string; inputs: ImportInputs; iscRate: number; result: Record<string, number> }
>

describe('SUNAT import-cost engine — parity vs fixtures.json', () => {
  for (const [id, c] of Object.entries(importCases)) {
    it(`case ${id}: ${c.label}`, () => {
      const result = computeImportCost(c.inputs)
      expect(deriveISCRate(c.inputs)).toBeCloseTo(c.iscRate, 6)
      expectDeepClose(result, c.result, `case ${id}`)
    })
  }
})

describe('prorrateo — parity vs fixtures.json', () => {
  const p = fixtures.prorrateoCase as {
    label: string
    items: ItemProrrateo[]
    gastos: GastoProrrateo[]
    tipo_cambio: number
    result: unknown
  }
  it(`case F: ${p.label}`, () => {
    const result = calcularProrrateo(p.items, p.gastos, p.tipo_cambio)
    expectDeepClose(result, p.result, 'prorrateo')
  })
})
