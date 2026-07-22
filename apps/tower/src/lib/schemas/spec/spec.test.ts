import { describe, expect, it } from 'vitest'
import { listArchetypes, type Archetype } from '../../archetypes'
import {
  getSpecSchema,
  SPEC_JSON_SCHEMA_DEFAULTS,
  SPEC_SCHEMA_VERSION,
  SPEC_SCHEMA_VERSIONS,
  SPEC_ZOD_DEFAULTS,
} from './index'

/** The six archetypes that predate the ALLOCATION spec_rows amendment — none may change. */
const SIX_ARCHETYPES: Archetype[] = ['EQUIPMENT', 'PROJECT', 'COMMODITY', 'PROGRAM', 'CREDENTIAL', 'ORIGIN']

describe('spec schema registry', () => {
  it.each(listArchetypes() as unknown as Archetype[])(
    '%s resolves a well-formed JSON-Schema default',
    (archetype) => {
      const schema = getSpecSchema(archetype)
      expect(schema.type).toBe('object')
      expect(schema['x-archetype']).toBe(archetype)
      expect(schema['x-version']).toBe(SPEC_SCHEMA_VERSIONS[archetype])
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

  it('the six pre-amendment archetypes are unchanged: still v1, no spec_rows field', () => {
    for (const archetype of SIX_ARCHETYPES) {
      const schema = getSpecSchema(archetype)
      expect(SPEC_SCHEMA_VERSIONS[archetype]).toBe(SPEC_SCHEMA_VERSION) // 1
      expect(schema['x-version']).toBe(1)
      // No property carries the new object-array marker — the amendment is ALLOCATION-only.
      for (const prop of Object.values(schema.properties)) {
        expect(prop['x-spec-rows']).toBeUndefined()
      }
    }
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

describe('ALLOCATION spec_rows object-array field (framework amendment)', () => {
  it('ALLOCATION default is v2 and emits a well-formed array-of-objects spec_rows field', () => {
    const schema = getSpecSchema('ALLOCATION')
    expect(schema['x-version']).toBe(2)
    expect(SPEC_SCHEMA_VERSIONS.ALLOCATION).toBe(2)

    const rows = schema.properties.specRows
    expect(rows).toBeDefined()
    expect(rows.type).toBe('array')
    expect(rows['x-spec-rows']).toBe(true)
    // A valid JSON-Schema array-of-objects: {label, value, icon?}.
    const items = rows.items
    expect(items?.type).toBe('object')
    if (items && items.type === 'object') {
      expect(items.properties.label.type).toBe('string')
      expect(items.properties.value.type).toBe('string')
      expect(items.required).toEqual(['label', 'value'])
      // Icon is a bounded, tokenized set.
      expect(items.properties.icon?.enum).toContain('box')
    }
    // The pre-existing ALLOCATION fields are untouched.
    expect(schema.properties.unitLabel['x-localized']).toBe(true)
    expect(schema.properties.highlights.type).toBe('array')
  })

  it('the ALLOCATION Zod validator accepts spec_rows and rejects an out-of-set icon', () => {
    const zod = SPEC_ZOD_DEFAULTS.ALLOCATION
    const good = zod.safeParse({
      unitLabel: { es: 'Cupo', en: 'Slot' },
      description: { es: 'Contenedor', en: 'Container' },
      specRows: [
        { label: 'Origen', value: 'China' },
        { label: 'Peso', value: '9,7 kg', icon: 'weight' },
      ],
    })
    expect(good.success).toBe(true)

    const badIcon = zod.safeParse({
      unitLabel: { es: 'Cupo', en: 'Slot' },
      description: { es: 'Contenedor', en: 'Container' },
      specRows: [{ label: 'Origen', value: 'China', icon: 'skull' }],
    })
    expect(badIcon.success).toBe(false)

    // spec_rows is optional — a fiche without it is valid.
    const noRows = zod.safeParse({
      unitLabel: { es: 'Cupo', en: 'Slot' },
      description: { es: 'Contenedor', en: 'Container' },
    })
    expect(noRows.success).toBe(true)
  })
})
