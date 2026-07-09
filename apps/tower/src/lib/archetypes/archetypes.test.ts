import { describe, expect, it } from 'vitest'
import {
  ARCHETYPES,
  computeLineExtension,
  getDefaultUnit,
  getStages,
  getUnits,
  isValidStage,
  isValidUnit,
  listArchetypes,
  resolveSpecSchema,
  type Archetype,
  type SpecSchemaRow,
} from './index'

const ALL = listArchetypes()

describe('archetype registry', () => {
  it('exposes exactly the six archetypes', () => {
    expect([...ALL].sort()).toEqual(
      ['COMMODITY', 'CREDENTIAL', 'EQUIPMENT', 'ORIGIN', 'PROGRAM', 'PROJECT'].sort(),
    )
  })

  // The load-bearing proof: every archetype resolves a stage set and unit math
  // by DATA, driven by a single loop — no per-archetype branching.
  it.each([...ALL])('%s resolves a stage set + unit math without branching', (archetype: Archetype) => {
    const stages = getStages(archetype)
    expect(stages.length).toBeGreaterThan(0)

    // Stage ids are unique and machine-safe; exactly one terminal stage.
    const ids = stages.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(stages.filter((s) => s.terminal).length).toBe(1)
    expect(isValidStage(archetype, ids[0])).toBe(true)
    expect(isValidStage(archetype, 'not_a_stage')).toBe(false)

    // Bilingual labels present on every stage (ES/EN-ready).
    for (const s of stages) {
      expect(s.label.es.length).toBeGreaterThan(0)
      expect(s.label.en.length).toBeGreaterThan(0)
    }

    // Unit math resolves a default unit that is a member of the unit set.
    const units = getUnits(archetype)
    expect(units.length).toBeGreaterThan(0)
    const def = getDefaultUnit(archetype)
    expect(isValidUnit(archetype, def.id)).toBe(true)
    expect(units.map((u) => u.id)).toContain(def.id)
  })

  it.each([...ALL])('%s computes integer-money line totals', (archetype: Archetype) => {
    const def = getDefaultUnit(archetype)
    // 12 units at 150_00 minor units = 1_800_00 minor units.
    const ext = computeLineExtension(archetype, {
      unitId: def.id,
      quantity: 12,
      unitPriceMinor: 15000,
    })
    expect(ext.totalMinor).toBe(180000)
    expect(Number.isInteger(ext.totalMinor)).toBe(true)
  })

  it('rejects float money at the type/runtime edge', () => {
    const def = getDefaultUnit('COMMODITY')
    expect(() =>
      computeLineExtension('COMMODITY', {
        unitId: def.id,
        quantity: 1,
        unitPriceMinor: 12.5, // dirty float — must throw
      }),
    ).toThrow()
  })

  it('derives CBM for cbm-bearing units only', () => {
    // COMMODITY per_container is cbm-bearing.
    const withCbm = computeLineExtension('COMMODITY', {
      unitId: 'per_container',
      quantity: 2,
      unitPriceMinor: 100,
      cbmPerUnit: 33,
    })
    expect(withCbm.cbm).toBe(66)

    // per_mt is not cbm-bearing — no derived volume even if cbmPerUnit is passed.
    const noCbm = computeLineExtension('COMMODITY', {
      unitId: 'per_mt',
      quantity: 2,
      unitPriceMinor: 100,
      cbmPerUnit: 33,
    })
    expect(noCbm.cbm).toBeUndefined()
  })
})

describe('resolveSpecSchema', () => {
  const laneId = '00000000-0000-0000-0000-000000000001'

  const rows: SpecSchemaRow[] = [
    { archetype: 'EQUIPMENT', laneId: null, version: 1, jsonSchema: { title: 'eq-default-v1' } },
    { archetype: 'EQUIPMENT', laneId: null, version: 2, jsonSchema: { title: 'eq-default-v2' } },
    { archetype: 'EQUIPMENT', laneId, version: 1, jsonSchema: { title: 'eq-lane-v1' } },
    { archetype: 'COMMODITY', laneId: null, version: 5, jsonSchema: { title: 'co-default-v5' } },
  ]

  it('prefers a lane override over the archetype default', () => {
    const r = resolveSpecSchema('EQUIPMENT', laneId, rows)
    expect(r?.jsonSchema.title).toBe('eq-lane-v1')
  })

  it('falls back to the highest-version archetype default', () => {
    const r = resolveSpecSchema('EQUIPMENT', null, rows)
    expect(r?.jsonSchema.title).toBe('eq-default-v2')
  })

  it('returns the default when a lane has no override', () => {
    const r = resolveSpecSchema('COMMODITY', laneId, rows)
    expect(r?.jsonSchema.title).toBe('co-default-v5')
  })

  it('returns null when nothing is published for the archetype', () => {
    expect(resolveSpecSchema('ORIGIN', laneId, rows)).toBeNull()
  })

  // Every archetype in the registry is addressable by the same resolver.
  it('resolves for every archetype from one code path', () => {
    for (const a of ALL) {
      const key = ARCHETYPES[a].specSchema.defaultSchemaKey
      const synthetic: SpecSchemaRow[] = [
        { archetype: a, laneId: null, version: 1, jsonSchema: { key } },
      ]
      expect(resolveSpecSchema(a, null, synthetic)?.jsonSchema.key).toBe(key)
    }
  })
})
