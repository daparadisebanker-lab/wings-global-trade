import { describe, expect, it } from 'vitest'
import {
  promoCopySchema,
  computeSlotsTaken,
  computeSlotBreakdown,
  containerListingUrl,
  defaultSpecs,
  toContainerPromo,
} from './container-promo-logic'

const NOW = new Date('2026-07-20T12:00:00Z')

describe('computeSlotsTaken', () => {
  it('counts CONFIRMED/LOADED + unexpired RESERVED, ignores RELEASED and expired', () => {
    const taken = computeSlotsTaken(
      [
        { slots: 3, status: 'CONFIRMED', expires_at: null },
        { slots: 2, status: 'LOADED', expires_at: null },
        { slots: 1, status: 'RESERVED', expires_at: '2026-07-21T12:00:00Z' }, // future → counts
        { slots: 5, status: 'RESERVED', expires_at: '2026-07-19T12:00:00Z' }, // past → drops
        { slots: 4, status: 'RELEASED', expires_at: null }, // never counts
      ],
      NOW,
    )
    expect(taken).toBe(6)
  })
  it('treats a null-expiry RESERVED as counting', () => {
    expect(computeSlotsTaken([{ slots: 2, status: 'RESERVED', expires_at: null }], NOW)).toBe(2)
  })
})

describe('computeSlotBreakdown', () => {
  it('splits committed (vendido) vs reserved (reservado), taken = both', () => {
    const b = computeSlotBreakdown(
      [
        { slots: 3, status: 'CONFIRMED', expires_at: null },
        { slots: 2, status: 'LOADED', expires_at: null },
        { slots: 1, status: 'RESERVED', expires_at: '2026-07-21T12:00:00Z' },
        { slots: 5, status: 'RESERVED', expires_at: '2026-07-19T12:00:00Z' }, // expired
        { slots: 4, status: 'RELEASED', expires_at: null },
      ],
      NOW,
    )
    expect(b).toEqual({ committed: 5, reserved: 1, taken: 6 })
  })
})

describe('containerListingUrl', () => {
  it('builds the canonical marcas path and trims a trailing slash on the base', () => {
    expect(containerListingUrl('aladin', 'RB01-40HC-001', 'https://x.com/')).toBe(
      'https://x.com/marcas/aladin/contenedor/RB01-40HC-001',
    )
  })
  it('falls back to the production host when no base given', () => {
    expect(containerListingUrl('aladin', 'RB01-40HC-001')).toBe(
      'https://wingsglobaltrade.com/marcas/aladin/contenedor/RB01-40HC-001',
    )
  })
})

describe('defaultSpecs', () => {
  it('derives a cupo line, packets, weight and gtin from the packing facts', () => {
    const specs = defaultSpecs({
      packagesPerSlot: 94,
      unitsPerPackage: 60,
      unitNamePlural: 'rollos',
      packetsPerPackage: 6,
      packageKg: 9.7,
      gtin: '0723707931803',
    })
    expect(specs[0]).toEqual({ label: 'Cupo', value: '94 cajas · 5640 rollos' })
    expect(specs).toContainEqual({ label: 'Peso por caja', value: '9.7 kg' })
    expect(specs).toContainEqual({ label: 'GTIN', value: '0723707931803' })
  })
})

describe('toContainerPromo', () => {
  const base = {
    code: 'RB01-40HC-001',
    brandSlug: 'aladin',
    brandName: 'Áladín',
    productName: 'Papel higiénico de bambú',
    slotsTotal: 10,
    slotsAvailable: 7,
    route: { origin: 'Qingdao', destination: 'Callao' },
    facts: { packagesPerSlot: 94, unitsPerPackage: 60, unitNamePlural: 'rollos' },
    copy: {},
    siteBase: 'https://wingsglobaltrade.com',
  }
  it('uses derived defaults when the rep authored no copy', () => {
    const p = toContainerPromo(base)
    expect(p.productName).toBe('Papel higiénico de bambú')
    expect(p.unitLabel).toBe('cupos')
    expect(p.routeLabel).toBe('Qingdao → Callao')
    expect(p.listingUrl).toBe('https://wingsglobaltrade.com/marcas/aladin/contenedor/RB01-40HC-001')
    expect(p.specs && p.specs.length).toBeGreaterThan(0)
    expect(p.priceNote).toBeUndefined()
  })
  it('lets rep copy override headline, price, route, unit and specs', () => {
    const p = toContainerPromo({
      ...base,
      copy: {
        headline: 'Papel de bambú premium',
        priceNote: 'precio de campaña julio',
        routeLabel: 'China directo',
        unitLabel: 'slots',
        specs: [{ label: 'Marca', value: 'Áladín' }],
      },
    })
    expect(p.productName).toBe('Papel de bambú premium')
    expect(p.priceNote).toBe('precio de campaña julio')
    expect(p.routeLabel).toBe('China directo')
    expect(p.unitLabel).toBe('slots')
    expect(p.specs).toEqual([{ label: 'Marca', value: 'Áladín' }])
  })
})

describe('promoCopySchema', () => {
  it('accepts an empty object (use defaults)', () => {
    expect(promoCopySchema.safeParse({}).success).toBe(true)
  })
  it('rejects an over-long headline and too many specs', () => {
    expect(promoCopySchema.safeParse({ headline: 'x'.repeat(200) }).success).toBe(false)
    expect(
      promoCopySchema.safeParse({ specs: Array.from({ length: 8 }, () => ({ label: 'a', value: 'b' })) }).success,
    ).toBe(false)
  })
})
