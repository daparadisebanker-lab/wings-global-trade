// Unit test for the pure browse facet helper backing the read-only, cross-
// category catalog browse (pure-rep persona). No DB: deriveTopCategories is
// pure, so it's tested directly — the server action just feeds it the RLS-
// scoped `category_path` column.
import { describe, expect, it } from 'vitest'
import { deriveTopCategories } from './catalog-logic'

describe('deriveTopCategories', () => {
  it('returns distinct top-level segments, sorted', () => {
    expect(
      deriveTopCategories([
        ['Máquinas', 'Corte'],
        ['Máquinas', 'Soldadura'],
        ['Provisiones', 'Granos'],
        ['Interiores'],
      ]),
    ).toEqual(['Interiores', 'Máquinas', 'Provisiones'])
  })

  it('ignores empty, null, and whitespace-only paths', () => {
    expect(
      deriveTopCategories([
        null,
        undefined,
        [],
        ['   '],
        ['Válido', 'x'],
      ]),
    ).toEqual(['Válido'])
  })

  it('trims the top segment before de-duping', () => {
    expect(deriveTopCategories([['  Textiles  '], ['Textiles']])).toEqual(['Textiles'])
  })

  it('returns an empty array for no usable paths', () => {
    expect(deriveTopCategories([])).toEqual([])
    expect(deriveTopCategories([null, [], ['']])).toEqual([])
  })
})
