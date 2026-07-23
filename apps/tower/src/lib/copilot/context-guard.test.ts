import { describe, it, expect } from 'vitest'
import { sanitizeCanvasContext } from './context-guard'

describe('sanitizeCanvasContext (trust boundary)', () => {
  it('accepts a valid costing context', () => {
    const ctx = { kind: 'costing', inputs: { fob: 8000, adValoremRate: 0.06, incoterm: 'CIF' } }
    expect(sanitizeCanvasContext(ctx)).toEqual(ctx)
  })

  it('accepts a valid fit context', () => {
    const ctx = { kind: 'fit', input: { itemLengthM: 1.2, containerKind: '40HC' } }
    expect(sanitizeCanvasContext(ctx)).toEqual(ctx)
  })

  it('rejects Infinity / NaN / absurd magnitudes', () => {
    expect(sanitizeCanvasContext({ kind: 'costing', inputs: { fob: Infinity } })).toBeUndefined()
    expect(sanitizeCanvasContext({ kind: 'costing', inputs: { fob: Number.NaN } })).toBeUndefined()
    expect(sanitizeCanvasContext({ kind: 'costing', inputs: { fob: 1e13 } })).toBeUndefined()
    expect(sanitizeCanvasContext({ kind: 'fit', input: { itemLengthM: -Infinity } })).toBeUndefined()
  })

  it('rejects unknown kinds and non-objects', () => {
    expect(sanitizeCanvasContext({ kind: 'evil', inputs: {} })).toBeUndefined()
    expect(sanitizeCanvasContext(null)).toBeUndefined()
    expect(sanitizeCanvasContext('nope')).toBeUndefined()
    expect(sanitizeCanvasContext(undefined)).toBeUndefined()
  })
})
