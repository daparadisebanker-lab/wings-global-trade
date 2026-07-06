import { describe, expect, it } from 'vitest'
import { listArchetypes, type Archetype } from '../../archetypes'
import { getSpecSchema, SPEC_JSON_SCHEMA_DEFAULTS, SPEC_SCHEMA_VERSION, SPEC_ZOD_DEFAULTS } from './index'

describe('spec schema registry', () => {
  it.each(listArchetypes() as unknown as Archetype[])(
    '%s resolves a well-formed JSON-Schema default',
    (archetype) => {
      const schema = getSpecSchema(archetype)
      expect(schema.type).toBe('object')
      expect(schema['x-archetype']).toBe(archetype)
      expect(schema['x-version']).toBe(SPEC_SCHEMA_VERSION)
      expect(Object.keys(schema.properties).length).toBeGreaterThan(0)

      // Every property carries a bilingual label — SpecForm has no hardcoded copy.
      for (const prop of Object.values(schema.properties)) {
        expect(prop['x-label'].es.length).toBeGreaterThan(0)
        expect(prop['x-label'].en.length).toBeGreaterThan(0)
      }

      // Required keys are real property keys.
      for (const key of schema.required) {
        expect(schema.properties[key]).toBeDefined()
      }
    },
  )

  it('registers all six archetypes identically in the JSON-Schema and Zod maps', () => {
    const archetypes = listArchetypes() as unknown as Archetype[]
    expect(Object.keys(SPEC_JSON_SCHEMA_DEFAULTS).sort()).toEqual([...archetypes].sort())
    expect(Object.keys(SPEC_ZOD_DEFAULTS).sort()).toEqual([...archetypes].sort())
  })

  it('COMMODITY exposes grade + harvest fields (task requirement)', () => {
    const schema = getSpecSchema('COMMODITY')
    expect(schema.properties.grade).toBeDefined()
    expect(schema.properties.grade.enum).toContain('export')
    expect(schema.properties.harvestWindow).toBeDefined()
  })

  it('the Zod object for EQUIPMENT validates a representative payload and rejects a missing required field', () => {
    const zodSchema = SPEC_ZOD_DEFAULTS.EQUIPMENT
    const ok = zodSchema.safeParse({
      model: 'X-200',
      materialDescription: { es: 'Excavadora hidráulica', en: 'Hydraulic excavator' },
      hsCode: '8429.51',
      condition: 'new',
      weightKg: 18000,
    })
    expect(ok.success).toBe(true)

    const missing = zodSchema.safeParse({ model: 'X-200' })
    expect(missing.success).toBe(false)
  })

  it('a lane override row (highest version) wins over the archetype default when allowed', () => {
    const overridden = getSpecSchema('EQUIPMENT', 'lane-1', [
      {
        archetype: 'EQUIPMENT',
        laneId: 'lane-1',
        version: 2,
        jsonSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        archetype: 'EQUIPMENT',
        laneId: null,
        version: 1,
        jsonSchema: { type: 'object', properties: { fallback: {} }, required: [] },
      },
    ])
    expect(overridden).toEqual({ type: 'object', properties: {}, required: [] })
  })
})
