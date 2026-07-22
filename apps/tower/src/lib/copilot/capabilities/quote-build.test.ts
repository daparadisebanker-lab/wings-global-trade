import { describe, it, expect } from 'vitest'
import { resolveLine, buildQuoteProposal } from './quote-build'

describe('resolveLine', () => {
  it('transcribes a stated unit price into integer minor units', () => {
    const line = resolveLine({ description: 'Generador diésel', quantity: 50, statedUnitPrice: 8500 }, 'FOB')
    expect(line.basis).toBe('stated')
    expect(line.unitPriceMinor).toBe(850000)
    expect(line.lineTotalMinor).toBe(850000 * 50)
    expect(line.basisNote).toBe('precio indicado')
  })

  it('costs a line from FOB + margin via the engine (deterministic, > 0)', () => {
    const line = resolveLine(
      { description: 'Scooter eléctrico', quantity: 200, fob: 128, marginPercent: 22, fuelType: 'electric' },
      'FOB',
    )
    expect(line.basis).toBe('costed')
    expect(line.unitPriceMinor).not.toBeNull()
    expect(Number.isInteger(line.unitPriceMinor)).toBe(true)
    // Sale price must exceed the raw FOB in minor units (landed + margin > FOB).
    expect(line.unitPriceMinor!).toBeGreaterThan(12800)
    expect(line.lineTotalMinor).toBe(line.unitPriceMinor! * 200)
    expect(line.basisNote).toContain('22% margen')
  })

  it('marks a line as a gap when neither a stated price nor FOB+margin is present', () => {
    const line = resolveLine({ description: 'Repuestos varios', quantity: 10, fob: 500 }, 'FOB')
    expect(line.basis).toBe('gap')
    expect(line.unitPriceMinor).toBeNull()
    expect(line.lineTotalMinor).toBeNull()
    expect(line.basisNote).toBe('por cotizar')
  })

  it('defaults a missing/invalid quantity to 1', () => {
    expect(resolveLine({ description: 'x', statedUnitPrice: 100 }, 'FOB').quantity).toBe(1)
  })
})

describe('buildQuoteProposal', () => {
  it('sums an honest subtotal when every line is priced', () => {
    const raw = JSON.stringify({
      understood: true,
      clientHint: 'Distribuidora Lima',
      currency: 'usd',
      incoterm: 'FOB',
      lines: [
        { description: 'A', quantity: 2, statedUnitPrice: 100 },
        { description: 'B', quantity: 3, statedUnitPrice: 50 },
      ],
    })
    const d = buildQuoteProposal(raw)!
    expect(d.currency).toBe('USD')
    expect(d.clientHint).toBe('Distribuidora Lima')
    expect(d.hasGaps).toBe(false)
    expect(d.subtotalMinor).toBe(2 * 10000 + 3 * 5000)
  })

  it('returns a null subtotal (never a partial one) when any line is a gap', () => {
    const raw = JSON.stringify({
      understood: true,
      lines: [
        { description: 'A', quantity: 1, statedUnitPrice: 100 },
        { description: 'B', quantity: 1 },
      ],
    })
    const d = buildQuoteProposal(raw)!
    expect(d.hasGaps).toBe(true)
    expect(d.subtotalMinor).toBeNull()
  })

  it('returns null when not understood, no lines, or non-JSON', () => {
    expect(buildQuoteProposal(JSON.stringify({ understood: false, lines: [] }))).toBeNull()
    expect(buildQuoteProposal(JSON.stringify({ understood: true, lines: [] }))).toBeNull()
    expect(buildQuoteProposal('not json')).toBeNull()
  })
})
