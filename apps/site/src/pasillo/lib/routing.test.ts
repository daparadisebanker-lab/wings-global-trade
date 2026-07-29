// Site search must be able to find this catalogue, and must never send one of
// its part numbers somewhere else. The bare-numeric case is the one that bit:
// 14 real SKUs are 7-digit numerics that the HS-code heuristic swallowed whole.

import { describe, expect, it } from 'vitest'
import { detectSearchIntent, resolveSearchUrl } from '@/lib/routing'
import { CATALOGUE_CODES } from '@/pasillo/data/codeIndex'
import { PASILLO_ROUTES, LANE_BASE } from '@/pasillo/lib/routes'

describe('search routing · catalogue codes', () => {
  it('routes a bare numeric SKU code to the tile, NOT to Mister as an HS code', () => {
    expect(detectSearchIntent('1500084')).toEqual({
      type: 'lane',
      href: `${PASILLO_ROUTES.lane}?sku=1500084`,
    })
    expect(resolveSearchUrl('1500084')).toContain(PASILLO_ROUTES.lane)
  })

  it('routes a prefixed SKU code to the tile', () => {
    expect(resolveSearchUrl('HJ-F1551')).toBe(`${PASILLO_ROUTES.lane}?sku=HJ-F1551`)
  })

  it('is case-insensitive on codes', () => {
    expect(resolveSearchUrl('hj-f1551')).toBe(`${PASILLO_ROUTES.lane}?sku=HJ-F1551`)
  })

  it('still routes a genuine HS code to Mister', () => {
    // 6907 is the real HS heading for ceramic flags and tiles, and is NOT a
    // code in this catalogue — the heuristic must survive the new exact test.
    expect(CATALOGUE_CODES.has('6907')).toBe(false)
    expect(detectSearchIntent('6907')).toEqual({ type: 'mister' })
  })

  it('routes product vocabulary to the catalogue and discipline vocabulary to the lane', () => {
    expect(resolveSearchUrl('azulejos')).toBe(PASILLO_ROUTES.lane)
    expect(resolveSearchUrl('porcelanato para piso')).toBe(PASILLO_ROUTES.lane)
    expect(resolveSearchUrl('mobiliario')).toBe(LANE_BASE)
  })

  it('leaves machinery vocabulary exactly where it was', () => {
    expect(resolveSearchUrl('tractor')).toContain('/catalogo/maquinaria-agricola')
    expect(resolveSearchUrl('camión')).toContain('/catalogo/camiones')
    expect(detectSearchIntent('arancel')).toEqual({ type: 'mister' })
  })

  it('every code in the index resolves into the catalogue', () => {
    for (const code of CATALOGUE_CODES) {
      expect(resolveSearchUrl(code).startsWith(PASILLO_ROUTES.lane)).toBe(true)
    }
  })
})
