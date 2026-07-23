// src/lib/torre/parse-spec.test.ts
import { describe, it, expect } from 'vitest'
import { parseQuoteSpec, extractQuoteSpec } from './parse-spec'
import type { IntelligenceClient } from '@/lib/ai/client'

describe('parseQuoteSpec (pure normalization)', () => {
  it('normalizes a well-formed quote sentence', () => {
    const s = parseQuoteSpec(
      JSON.stringify({
        understood: true,
        productName: 'Excavadora CAT 320',
        fuelType: 'diesel',
        engineCC: 6600,
        incoterm: 'FOB',
        scenarios: ['FOB', 'CIF'],
        fob: 78400,
        marginPercent: 18,
        clientName: 'Provemaq',
        language: 'es',
        note: 'listo',
      }),
    )
    expect(s.understood).toBe(true)
    expect(s.marginPercent).toBe(0.18) // 18 → 0.18
    expect(s.scenarios).toEqual(['FOB', 'CIF'])
    expect(s.fob).toBe(78400)
    expect(s.engineCC).toBe(6600)
  })

  it('keeps a fractional margin as a fraction', () => {
    expect(parseQuoteSpec(JSON.stringify({ marginPercent: 0.22 })).marginPercent).toBe(0.22)
  })

  it('strips thousands separators and currency symbols from numbers', () => {
    const s = parseQuoteSpec(JSON.stringify({ fob: '78,400', freightInternational: 'USD 4,200' }))
    expect(s.fob).toBe(78400)
    expect(s.freightInternational).toBe(4200)
  })

  it('drops invalid enums and leaves nulls', () => {
    const s = parseQuoteSpec(JSON.stringify({ fuelType: 'nuclear', incoterm: 'DDP', origin: 'mars' }))
    expect(s.fuelType).toBeNull()
    expect(s.incoterm).toBeNull() // DDP is not modeled
    expect(s.origin).toBeNull()
  })

  it('handles non-JSON gracefully (understood=false)', () => {
    const s = parseQuoteSpec('no puedo con esto')
    expect(s.understood).toBe(false)
    expect(s.fob).toBeNull()
  })

  it('filters invalid incoterms out of scenarios', () => {
    const s = parseQuoteSpec(JSON.stringify({ scenarios: ['FOB', 'DDP', 'CIF'] }))
    expect(s.scenarios).toEqual(['FOB', 'CIF'])
  })
})

describe('extractQuoteSpec (model seam, faked)', () => {
  const fake: IntelligenceClient = {
    async complete() {
      return JSON.stringify({ understood: true, productName: 'Montacargas', fob: 14000, incoterm: 'FOB', marginPercent: 18 })
    },
    async *stream() {},
  }

  it('runs the model call and returns a normalized spec', async () => {
    const s = await extractQuoteSpec(fake, 'cotiza un montacargas 14000 fob 18%')
    expect(s.productName).toBe('Montacargas')
    expect(s.marginPercent).toBe(0.18)
  })
})
