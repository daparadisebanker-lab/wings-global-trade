import { describe, it, expect } from 'vitest'
import {
  mapSupplierOfferRow,
  mapSupplierRow,
  parseOfferExtras,
  offerSourceLabel,
  offerStatusLabel,
  type RawSupplierOfferRow,
  type RawSupplierRow,
} from './suppliers-logic'

const baseOffer: RawSupplierOfferRow = {
  id: 'o1',
  supplier_id: 's1',
  product_id: null,
  product_label: 'Electric scooter 500W',
  category_path: ['mobility', 'scooters'],
  unit_price_minor: 12800,
  currency: 'USD',
  price_unit: 'per unit',
  moq: '100 units',
  incoterm: 'FOB',
  lead_time_days: 25,
  port: 'Ningbo',
  hs_code: '8711.60',
  extras: [{ label: 'Payment', value: '30% TT deposit' }],
  source: 'whatsapp',
  status: 'ACTIVE',
  valid_until: null,
  notes: null,
  created_at: '2026-08-01T00:00:00Z',
  suppliers: { name: 'Ningbo Wentai', country: 'CN' },
}

describe('mapSupplierOfferRow', () => {
  it('flattens the supplier join and coerces numeric fields', () => {
    const item = mapSupplierOfferRow(baseOffer)
    expect(item.supplierName).toBe('Ningbo Wentai')
    expect(item.supplierCountry).toBe('CN')
    expect(item.unitPriceMinor).toBe(12800)
    expect(item.leadTimeDays).toBe(25)
    expect(item.incoterm).toBe('FOB')
    expect(item.categoryPath).toEqual(['mobility', 'scooters'])
    expect(item.extras).toEqual([{ label: 'Payment', value: '30% TT deposit' }])
    expect(item.source).toBe('whatsapp')
    expect(item.status).toBe('ACTIVE')
  })

  it('array-shaped supplier join, string price/lead-time, and unknown status falls back to ACTIVE', () => {
    const item = mapSupplierOfferRow({
      ...baseOffer,
      unit_price_minor: '12800',
      lead_time_days: '25',
      status: 'bogus',
      suppliers: [{ name: 'Ningbo Wentai', country: 'CN' }],
    })
    expect(item.unitPriceMinor).toBe(12800)
    expect(item.leadTimeDays).toBe(25)
    expect(item.status).toBe('ACTIVE')
    expect(item.supplierName).toBe('Ningbo Wentai')
  })

  it('missing supplier join and null price/moq degrade to safe defaults', () => {
    const item = mapSupplierOfferRow({ ...baseOffer, unit_price_minor: null, suppliers: null })
    expect(item.supplierName).toBe('')
    expect(item.supplierCountry).toBeNull()
    expect(item.unitPriceMinor).toBeNull()
  })

  it('unknown source falls back to manual', () => {
    const item = mapSupplierOfferRow({ ...baseOffer, source: 'carrier-pigeon' })
    expect(item.source).toBe('manual')
  })
})

describe('parseOfferExtras', () => {
  it('drops malformed entries and keeps only complete label/value pairs', () => {
    const extras = parseOfferExtras([{ label: 'Color' }, { value: 'only-value' }, { label: 'Voltage', value: '220V' }, null])
    expect(extras).toEqual([{ label: 'Voltage', value: '220V' }])
  })

  it('non-array input returns empty', () => {
    expect(parseOfferExtras(null)).toEqual([])
    expect(parseOfferExtras('nope')).toEqual([])
  })
})

describe('mapSupplierRow', () => {
  const baseSupplier: RawSupplierRow = {
    id: 's1',
    name: 'Ningbo Wentai',
    country: 'CN',
    verified: true,
    contact_whatsapp: '+86 130 0000 0000',
    contact_email: 'sales@wentai.cn',
    notes: 'Reliable on scooters',
  }

  it('flattens contact fields and defaults verified to false when null', () => {
    expect(mapSupplierRow(baseSupplier)).toEqual({
      id: 's1',
      name: 'Ningbo Wentai',
      country: 'CN',
      verified: true,
      contactWhatsapp: '+86 130 0000 0000',
      contactEmail: 'sales@wentai.cn',
      notes: 'Reliable on scooters',
    })
    expect(mapSupplierRow({ ...baseSupplier, verified: null }).verified).toBe(false)
  })
})

describe('vocabularies', () => {
  it('label helpers translate known ids and fall back to the raw id', () => {
    expect(offerSourceLabel('whatsapp', 'es')).toBe('WhatsApp')
    expect(offerSourceLabel('unknown', 'en')).toBe('unknown')
    expect(offerStatusLabel('EXPIRED', 'en')).toBe('Expired')
  })
})
