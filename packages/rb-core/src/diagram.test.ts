import { describe, expect, it } from 'vitest'
import { packingSpecFromGeometry, type RbDiagramGeometry } from './diagram'

const geometry: RbDiagramGeometry = {
  packageLengthMm: 600,
  packageWidthMm: 400,
  packageHeightMm: 300,
  unitsPerPackage: 48,
  packagesPerSlot: 60,
  cellsAcross: 5,
  cellsHigh: 2,
  cellsDeep: 3,
  detail: 'rolls',
  caption: null,
}

describe('packingSpecFromGeometry', () => {
  it('maps mm dims to box (x=length, d=width/depth, h=height)', () => {
    const spec = packingSpecFromGeometry(geometry, 'Papel higiénico')
    expect(spec.box).toEqual({ w: 600, d: 400, h: 300 })
  })

  it('maps cells (x=across, z=deep, y=high) — depth is z, height is y', () => {
    const spec = packingSpecFromGeometry(geometry, 'Papel higiénico')
    expect(spec.cells).toEqual({ x: 5, z: 3, y: 2 })
  })

  it('derives the composition line from the two counts when no caption', () => {
    const spec = packingSpecFromGeometry(geometry, 'Papel higiénico')
    expect(spec.composition).toBe('48 u/caja · 60 cajas/cupo')
    expect(spec.title).toBe('Papel higiénico')
    expect(spec.detail).toBe('rolls')
  })

  it('uses the authored caption verbatim when present', () => {
    const spec = packingSpecFromGeometry({ ...geometry, caption: 'Caja máster x48' }, 'X')
    expect(spec.composition).toBe('Caja máster x48')
  })

  it('defensively floors non-positive / non-finite inputs to ≥1 and normalizes detail', () => {
    const spec = packingSpecFromGeometry(
      {
        packageLengthMm: 0,
        packageWidthMm: -5,
        packageHeightMm: Number.NaN,
        unitsPerPackage: 0,
        packagesPerSlot: 12,
        cellsAcross: 0,
        cellsHigh: 0,
        cellsDeep: 0,
        detail: 'slabs',
        caption: '',
      },
      'Y',
    )
    expect(spec.box).toEqual({ w: 1, d: 1, h: 1 })
    expect(spec.cells).toEqual({ x: 1, z: 1, y: 1 })
    expect(spec.detail).toBe('slabs')
    // empty caption falls through to the derived composition (counts floored to ≥1)
    expect(spec.composition).toBe('1 u/caja · 12 cajas/cupo')
  })
})
