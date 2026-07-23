// src/lib/copilot/capabilities/quote-run.test.ts
import { describe, it, expect } from 'vitest'
import { quoteRunCapability, type TorreQuoteRenderData } from './quote-run'
import type { IntelligenceClient } from '@/lib/ai/client'

function client(json: object): IntelligenceClient {
  return {
    async complete() {
      return JSON.stringify(json)
    },
    async *stream() {},
  }
}

describe('quoteRunCapability (preview, standard rates)', () => {
  it('builds the quote pair from a understood spec', async () => {
    const res = await quoteRunCapability.run(
      client({ understood: true, productName: 'Montacargas', fuelType: 'diesel', engineCC: 3300, incoterm: 'FOB', fob: 14000, freightInternational: 1600, marginPercent: 18, clientName: 'Provemaq' }),
      'cotiza un montacargas',
    )
    expect(res.renderer).toBe('torre-quote')
    const data = res.data as TorreQuoteRenderData
    expect(data.result.approvable).toBe(true)
    expect(data.result.cotizacion.scenarios[0].unitPriceMinor).toBeGreaterThan(0)
    expect(data.result.cotizacion.clientName).toBe('Provemaq')
  })

  it('falls back to a text prompt when the spec is not understood', async () => {
    const res = await quoteRunCapability.run(client({ understood: false, note: 'no entendí' }), 'hola')
    expect(res.renderer).toBe('text')
  })

  it('raises a blocker (unapprovable preview) when the FOB is missing', async () => {
    const res = await quoteRunCapability.run(
      client({ understood: true, productName: 'Equipo', incoterm: 'FOB', fob: null, freightInternational: 900 }),
      'cotiza un equipo sin precio',
    )
    const data = res.data as TorreQuoteRenderData
    expect(data.result.approvable).toBe(false)
    expect(data.result.blockers.some((b) => b.id === 'fob-missing')).toBe(true)
  })
})
