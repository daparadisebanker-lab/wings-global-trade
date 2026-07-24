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

  it('rejects numeric-looking STRINGS, nulls, and non-scalars (decimal.js coercion path)', () => {
    expect(sanitizeCanvasContext({ kind: 'costing', inputs: { fob: '1e99' } })).toBeUndefined()
    expect(sanitizeCanvasContext({ kind: 'costing', inputs: { exchangeRate: 'NaN' } })).toBeUndefined()
    expect(sanitizeCanvasContext({ kind: 'costing', inputs: { freightInternational: null } })).toBeUndefined()
    expect(sanitizeCanvasContext({ kind: 'costing', inputs: { fob: { evil: 1 } } })).toBeUndefined()
    // A genuine text field (not numeric) is fine.
    expect(sanitizeCanvasContext({ kind: 'costing', inputs: { productName: 'Montacargas', fob: 8000 } })).toBeTruthy()
  })

  it('rejects an over-large payload', () => {
    expect(sanitizeCanvasContext({ kind: 'costing', inputs: { productName: 'x'.repeat(50_000) } })).toBeUndefined()
  })

  it('rejects unknown kinds and non-objects', () => {
    expect(sanitizeCanvasContext({ kind: 'evil', inputs: {} })).toBeUndefined()
    expect(sanitizeCanvasContext(null)).toBeUndefined()
    expect(sanitizeCanvasContext('nope')).toBeUndefined()
    expect(sanitizeCanvasContext(undefined)).toBeUndefined()
  })

  it('keeps a valid lineage baseline (Stage 2)', () => {
    const ctx = {
      kind: 'costing',
      inputs: { fob: 8000 },
      baseline: { renderer: 'landed-cost', landedCost: 10240, salePriceFinal: 15000 },
    }
    expect(sanitizeCanvasContext(ctx)).toEqual(ctx)
  })

  it('strips a malformed baseline but keeps the otherwise-valid context', () => {
    const bad = { kind: 'costing', inputs: { fob: 8000 }, baseline: { renderer: 'landed-cost', landedCost: NaN } }
    const out = sanitizeCanvasContext(bad)
    expect(out).toBeTruthy()
    expect((out as { baseline?: unknown }).baseline).toBeUndefined()
    // Unknown renderer / bad marginKind are stripped too.
    const badKind = { kind: 'fit', input: { itemLengthM: 1 }, baseline: { renderer: 'evil', x: 1 } }
    expect((sanitizeCanvasContext(badKind) as { baseline?: unknown }).baseline).toBeUndefined()
    const badMargin = {
      kind: 'costing',
      inputs: { fob: 1 },
      baseline: { renderer: 'reverse-quote', salePrice: 1, achievedPct: 0.2, marginKind: 'evil' },
    }
    expect((sanitizeCanvasContext(badMargin) as { baseline?: unknown }).baseline).toBeUndefined()
  })
})
