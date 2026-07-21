import { describe, it, expect } from 'vitest'
import { parseSupplierExtract } from './supplier-screenshot'

describe('parseSupplierExtract', () => {
  it('extracts a full WhatsApp offer, normalizing weeks→days and upper-casing incoterm', () => {
    const raw = JSON.stringify({
      source: 'whatsapp',
      supplier: 'Ningbo Wentai',
      product: 'Electric scooter 500W',
      unitPrice: 128,
      currency: 'USD',
      priceUnit: 'per unit',
      moq: '100 units',
      incoterm: 'fob',
      leadTimeDays: 25,
      port: 'Ningbo',
      hsCode: '8711.60',
      extras: [{ label: 'Payment', value: '30% TT deposit' }],
      summary: 'Scooter 500W a USD 128 FOB Ningbo, MOQ 100.',
    })
    const d = parseSupplierExtract(raw)
    expect(d.hasContent).toBe(true)
    expect(d.supplier).toBe('Ningbo Wentai')
    expect(d.unitPrice).toBe(128)
    expect(d.incoterm).toBe('FOB')
    expect(d.leadTimeDays).toBe(25)
    expect(d.extras).toHaveLength(1)
    expect(d.summary).toContain('Scooter')
  })

  it('parses a fenced JSON block and coerces a numeric string price', () => {
    const raw = '```json\n{ "product": "LED panel", "unitPrice": "USD 4.50", "moq": "500 pcs" }\n```'
    const d = parseSupplierExtract(raw)
    expect(d.product).toBe('LED panel')
    expect(d.unitPrice).toBe(4.5)
    expect(d.hasContent).toBe(true)
  })

  it('drops malformed extras and keeps only complete label/value pairs', () => {
    const raw = JSON.stringify({
      product: 'Gasket set',
      extras: [{ label: 'Color' }, { value: 'only-value' }, { label: 'Voltage', value: '220V' }, null],
    })
    const d = parseSupplierExtract(raw)
    expect(d.extras).toEqual([{ label: 'Voltage', value: '220V' }])
  })

  it('reports hasContent=false when nothing commercial was read (summary only)', () => {
    const raw = JSON.stringify({ summary: 'No pude leer una oferta.', product: null, unitPrice: null })
    const d = parseSupplierExtract(raw)
    expect(d.hasContent).toBe(false)
    expect(d.summary).toContain('No pude leer')
  })

  it('returns an all-null, empty result for non-JSON model text', () => {
    const d = parseSupplierExtract('the model rambled without json')
    expect(d.hasContent).toBe(false)
    expect(d.supplier).toBeNull()
    expect(d.extras).toEqual([])
  })
})
