// src/components/catalog/spec-form/spec-form.test.ts
//
// NOTE ON TEST STRATEGY: this workspace has no jsdom / @testing-library/react
// installed (checked `node_modules/.pnpm` — absent everywhere in the monorepo,
// not just apps/tower), and Wave 2 must not add a dependency. That rules out
// simulating a literal click/keystroke. Instead this file proves the DoD's
// three claims like so:
//   1. schema resolution — call getSpecSchema directly (real, no DOM needed).
//   2. "SpecForm renders … and emits onChange" — render via
//      `react-dom/server` (already a dependency; no DOM required for SSR
//      string output) to prove the markup is correct, and call
//      `mergeSpecValue` directly to prove the exact computation every field's
//      onChange is wired to in SpecForm.tsx (`onChange={(v) =>
//      onChange(mergeSpecValue(value, key, v))}`).
//   3. "locale tabs switch the edited locale" — render to prove both tab
//      buttons exist, and call `updateLocalizedPair` directly to prove the
//      exact computation the active tab's input is wired to in
//      LocalizedStringField (`onChange={(e) =>
//      onChange(updateLocalizedPair(pair, activeTab, e.target.value))}`).
// A follow-up wave should add jsdom + @testing-library/react so this can
// become a true interaction test (fireEvent.click on the EN tab, assert the
// input's value swaps) — this file documents exactly the seam to convert.
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { getSpecSchema } from '../../../lib/schemas/spec'
import { SpecForm } from './SpecForm'
import { SpecView } from './SpecView'
import { mergeSpecValue, normalizeLocalizedPair, updateLocalizedPair } from './state'

describe('getSpecSchema — archetype resolution', () => {
  it('EQUIPMENT resolves a schema with its signature field', () => {
    const schema = getSpecSchema('EQUIPMENT')
    expect(schema['x-archetype']).toBe('EQUIPMENT')
    expect(schema.properties.model).toBeDefined()
  })

  it('PROJECT resolves a schema with its signature field', () => {
    const schema = getSpecSchema('PROJECT')
    expect(schema['x-archetype']).toBe('PROJECT')
    expect(schema.properties.discipline).toBeDefined()
  })

  it('COMMODITY resolves a schema with its signature grade/harvest fields', () => {
    const schema = getSpecSchema('COMMODITY')
    expect(schema['x-archetype']).toBe('COMMODITY')
    expect(schema.properties.grade).toBeDefined()
    expect(schema.properties.harvestWindow).toBeDefined()
  })
})

describe('SpecForm — render', () => {
  const schema = getSpecSchema('EQUIPMENT')

  it('renders a representative schema: one control per property, labels in the requested locale', () => {
    const markup = renderToStaticMarkup(
      createElement(SpecForm, {
        schema,
        value: { model: 'X-200', condition: 'new' },
        onChange: () => {},
        locale: 'es',
      }),
    )

    // Container carries the archetype for integration/debugging hooks.
    expect(markup).toContain('data-archetype="EQUIPMENT"')
    // ES label copy (locale='es') for a plain string field.
    expect(markup).toContain('Modelo')
    // The bound value renders back into the input.
    expect(markup).toContain('value="X-200"')
    // Enum field renders as a <select> with its bilingual option label.
    expect(markup).toContain('<select')
    expect(markup).toContain('Nuevo')
    // Localized field renders both ES/EN tabs.
    expect(markup).toContain('role="tab"')
    expect(markup).toContain('>ES<')
    expect(markup).toContain('>EN<')
    // Array field renders its add-item input.
    expect(markup).toContain('Certificaciones')
  })

  it('renders EN labels when locale="en"', () => {
    const markup = renderToStaticMarkup(
      createElement(SpecForm, { schema, value: {}, onChange: () => {}, locale: 'en' }),
    )
    expect(markup).toContain('Model')
    expect(markup).toContain('Certifications')
  })

  it('emits onChange via mergeSpecValue — the exact computation every field is wired to', () => {
    // This is not "call the component's prop" (SpecForm never exposes
    // mergeSpecValue as a callable on the instance) — it is the literal
    // function SpecForm.tsx invokes inside every field's onChange closure:
    // `onChange: (v) => onChange(mergeSpecValue(value, key, v))`.
    const current = { model: 'X-200', condition: 'new' }
    const next = mergeSpecValue(current, 'weightKg', 18000)
    expect(next).toEqual({ model: 'X-200', condition: 'new', weightKg: 18000 })
    // Original object is untouched (SpecForm always passes the *next* full record to its own onChange prop).
    expect(current).toEqual({ model: 'X-200', condition: 'new' })
  })
})

describe('SpecForm — localized (ES/EN) fields', () => {
  it('locale tabs switch which language of the pair gets edited', () => {
    // Simulates: field currently reads { es: 'Excavadora', en: '' }, the EN tab
    // is active, and the user types "Excavator" — only `en` changes.
    const startingPair = normalizeLocalizedPair({ es: 'Excavadora hidráulica', en: '' })
    const afterEnEdit = updateLocalizedPair(startingPair, 'en', 'Hydraulic excavator')
    expect(afterEnEdit).toEqual({ es: 'Excavadora hidráulica', en: 'Hydraulic excavator' })

    // Switching the active tab back to ES and editing again only changes `es`.
    const afterEsEdit = updateLocalizedPair(afterEnEdit, 'es', 'Excavadora hidráulica CAT')
    expect(afterEsEdit).toEqual({ es: 'Excavadora hidráulica CAT', en: 'Hydraulic excavator' })
  })

  it('renders both ES/EN tab buttons for a localized field', () => {
    const schema = getSpecSchema('EQUIPMENT')
    const markup = renderToStaticMarkup(
      createElement(SpecForm, {
        schema,
        value: { materialDescription: { es: 'Excavadora hidráulica', en: 'Hydraulic excavator' } },
        onChange: () => {},
        locale: 'es',
      }),
    )
    expect(markup).toContain('aria-selected="true"')
    expect((markup.match(/role="tab"/g) ?? []).length).toBeGreaterThanOrEqual(2)
  })
})

describe('SpecView — read-only render', () => {
  it('renders filled fields and omits empty optional ones', () => {
    const schema = getSpecSchema('COMMODITY')
    const markup = renderToStaticMarkup(
      createElement(SpecView, {
        schema,
        value: { varietal: { es: 'Café arábica', en: 'Arabica coffee' }, grade: 'export' },
        locale: 'es',
      }),
    )
    expect(markup).toContain('Café arábica')
    expect(markup).toContain('Exportación') // enum label, resolved via x-enum-labels
    expect(markup).not.toContain('Ventana de cosecha') // harvestWindow left empty — omitted, not printed blank
  })

  it('resolves the localized value in the requested locale', () => {
    const schema = getSpecSchema('COMMODITY')
    const value = { varietal: { es: 'Café arábica', en: 'Arabica coffee' } }
    const es = renderToStaticMarkup(createElement(SpecView, { schema, value, locale: 'es' }))
    const en = renderToStaticMarkup(createElement(SpecView, { schema, value, locale: 'en' }))
    expect(es).toContain('Café arábica')
    expect(en).toContain('Arabica coffee')
  })
})
