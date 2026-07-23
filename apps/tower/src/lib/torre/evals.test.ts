// src/lib/torre/evals.test.ts
// The Mister Torre eval harness (spec-torre/02 §Evals). Runs the two in-repo
// suites against the DETERMINISTIC quote-run core — green with no API key, exactly
// like the existing lib/ai/intelligence.test.ts (fake-client) philosophy. The
// model-parse step (sentence → structured input) is contract-tested separately in
// the capability test; here we gate the numbers + honesty the engine/law own.
//
//   evals/quoting.jsonl — real-shaped quote scenarios. Gate: ≥90% pass; the
//     artifact's stored result must equal computeImportCost(stored inputs) to the
//     cent (assembly never corrupts the engine), margin applied per rule, approvable.
//   evals/honesty.jsonl — traps. Gate: 100% — every trap must raise its blocker(s)
//     and be unapprovable. A single confident guess fails the release.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { buildQuoteRun, type QuoteRunInput } from './quote-run'
import { computeImportCost } from '@/lib/costing/engine'
import type { ImportInputs, ImportResult } from '@/lib/costing/types'

function loadJsonl<T>(rel: string): T[] {
  const path = fileURLToPath(new URL(rel, import.meta.url))
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as T)
}

// A fully-resolved base run; each case overrides only what it varies (null allowed).
const BASE: QuoteRunInput = {
  productName: 'Equipo',
  brand: 'Marca',
  model: 'M',
  fuelType: 'diesel',
  engineCC: 2000,
  origin: 'china',
  year: 2026,
  clientName: 'Cliente Demo',
  laneCode: 'WGT/01',
  language: 'es',
  quantity: 1,
  fob: 10000,
  incoterm: 'FOB',
  scenarios: [], // default → [base incoterm]; a case may set its own
  freightInternational: 1000,
  freightZofratacna: 500,
  portExpenses: 375,
  customsAgency: 300,
  igvRate: 0.18,
  percepcionRate: 0.035,
  insuranceRate: 0.015,
  adValoremRate: 0,
  marginPercent: 0.18,
  exchangeRate: 3.7,
  freightSource: { kind: 'rate_table', label: 'Flete', validUntil: '2026-08-31' },
  tariffSource: { kind: 'tariff_position', label: 'HS', validUntil: '2026-12-31' },
  trmSource: { kind: 'org_rule', label: 'TC' },
  marginSource: { kind: 'org_rule', label: 'Margen' },
  validityDays: 15,
  today: '2026-07-23',
}

function toMinor(x: number): number {
  return Math.round(x * 100)
}

interface QuotingCase {
  id: string
  desc: string
  input: Partial<QuoteRunInput>
  golden?: { landedCostMinor: number; unitPriceMinor: number }
}
interface HonestyCase {
  id: string
  desc: string
  input: Partial<QuoteRunInput>
  expectBlockers: string[]
}

describe('eval · quoting.jsonl (gate ≥90%; numbers exact to the cent)', () => {
  const cases = loadJsonl<QuotingCase>('../../../evals/quoting.jsonl')
  const failures: string[] = []

  for (const c of cases) {
    it(`${c.id} — ${c.desc}`, () => {
      const input: QuoteRunInput = { ...BASE, ...c.input }
      const out = buildQuoteRun(input)

      // 1. The artifact's stored result IS the engine's output for the stored inputs.
      const recomputed = computeImportCost(out.hojaCostos.inputs as unknown as ImportInputs)
      expect(out.hojaCostos.result as unknown as ImportResult).toEqual(recomputed)

      // 2. A clean quote is approvable with no blockers.
      expect(out.blockers).toHaveLength(0)
      expect(out.approvable).toBe(true)

      // 3. Margin rule applied (percent mode: rate >= requested, floor 1000/landed).
      const result = out.hojaCostos.result as unknown as ImportResult
      expect(result.marginRate).toBeGreaterThanOrEqual(input.marginPercent - 1e-9)

      // 4. First scenario ties to the hoja (base incoterm), in integer minor units.
      const s0 = out.cotizacion.scenarios[0]
      expect(s0.confidence).toBe('verified')
      expect(s0.landedCostMinor).toBe(toMinor(result.landedCost))
      expect(s0.unitPriceMinor).toBe(toMinor(result.salePriceFinal))

      // 5. Golden anchor (hand-captured), where provided.
      if (c.golden) {
        expect(s0.landedCostMinor).toBe(c.golden.landedCostMinor)
        expect(s0.unitPriceMinor).toBe(c.golden.unitPriceMinor)
      }
    })
  }

  it('overall pass rate ≥ 90% (and the suite is deterministic → 100%)', () => {
    let pass = 0
    for (const c of cases) {
      try {
        const out = buildQuoteRun({ ...BASE, ...c.input })
        const recomputed = computeImportCost(out.hojaCostos.inputs as unknown as ImportInputs)
        const ok =
          out.approvable &&
          out.blockers.length === 0 &&
          JSON.stringify(out.hojaCostos.result) === JSON.stringify(recomputed) &&
          (!c.golden || out.cotizacion.scenarios[0].unitPriceMinor === c.golden.unitPriceMinor)
        if (ok) pass++
        else failures.push(c.id)
      } catch {
        failures.push(c.id)
      }
    }
    const rate = pass / cases.length
    // eslint-disable-next-line no-console
    if (failures.length) console.error('quoting failures:', failures)
    expect(rate).toBeGreaterThanOrEqual(0.9)
    expect(failures).toEqual([])
  })
})

describe('eval · honesty.jsonl (gate 100%; every trap must block)', () => {
  const cases = loadJsonl<HonestyCase>('../../../evals/honesty.jsonl')

  for (const c of cases) {
    it(`${c.id} — ${c.desc}`, () => {
      const out = buildQuoteRun({ ...BASE, ...c.input })
      // A trap is never a confident guess: it is unapprovable...
      expect(out.approvable).toBe(false)
      // ...and every expected blocker is present.
      const ids = out.blockers.map((b) => b.id)
      for (const expected of c.expectBlockers) {
        expect(ids).toContain(expected)
      }
    })
  }

  it('honesty pass rate is 100% (a single confident guess fails the release)', () => {
    let pass = 0
    for (const c of cases) {
      const out = buildQuoteRun({ ...BASE, ...c.input })
      const ids = out.blockers.map((b) => b.id)
      const ok = out.approvable === false && c.expectBlockers.every((e) => ids.includes(e))
      if (ok) pass++
    }
    expect(pass).toBe(cases.length)
  })
})
