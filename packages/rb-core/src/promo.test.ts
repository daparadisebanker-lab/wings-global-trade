import { describe, expect, it } from 'vitest'
import { buildPromoCopy, buildPromoCardSvg, type ContainerPromo } from './promo'

const promo: ContainerPromo = {
  productName: 'Papel higiénico Áladín',
  ownerLabel: 'Áladín',
  containerCode: 'RB01-40HC-001',
  slotsTotal: 20,
  slotsAvailable: 7,
  priceNote: 'precio mayorista de campaña',
  specs: [
    { label: 'Hojas', value: 'doble hoja' },
    { label: 'Rollo', value: '30 m' },
    { label: 'Empaque', value: 'x48' },
  ],
  listingUrl: 'https://wingsglobaltrade.com/marcas/aladin/contenedor/RB01-40HC-001',
  routeLabel: 'China → Callao',
}

describe('buildPromoCopy', () => {
  it('whatsapp copy has the slots, wholesale pitch, specs and the listing URL, no exclamation', () => {
    const c = buildPromoCopy(promo, 'whatsapp')
    expect(c).toContain('7 de 20 cupos')
    expect(c).toContain('al por mayor')
    expect(c).toContain('precio mayorista de campaña')
    expect(c).toContain('Hojas: doble hoja')
    expect(c).toContain(promo.listingUrl)
    expect(c).not.toContain('!')
  })
  it('ad copy is a one-liner with the URL', () => {
    const c = buildPromoCopy(promo, 'ad')
    expect(c.split('\n')).toHaveLength(1)
    expect(c).toContain('7 cupos disponibles')
    expect(c).toContain(promo.listingUrl)
  })
  it('defaults price note + unit label when absent', () => {
    const c = buildPromoCopy({ ...promo, priceNote: undefined, unitLabel: undefined }, 'whatsapp')
    expect(c).toContain('a precio especial')
    expect(c).toContain('cupos')
  })
})

describe('buildPromoCardSvg', () => {
  it('is a well-formed square SVG with the wordmark, product, slot count and URL', () => {
    const svg = buildPromoCardSvg(promo)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('width="1080" height="1080"')
    expect(svg).toContain('WINGS GLOBAL TRADE')
    expect(svg).toContain('Papel higiénico Áladín')
    expect(svg).toContain('7 de 20 cupos disponibles')
    expect(svg).toContain(promo.listingUrl)
  })
  it('draws exactly slotsTotal cells (7 available gold + 13 taken muted)', () => {
    const svg = buildPromoCardSvg(promo)
    const cells = (svg.match(/<rect [^>]*rx="2"/g) ?? []).length
    expect(cells).toBe(20)
    // count grid CELLS only (rx="2" fill=…), not reused text/divider fills
    expect((svg.match(/rx="2" fill="#C4933F"/g) ?? []).length).toBe(7) // available
    expect((svg.match(/rx="2" fill="#D8D3C6"/g) ?? []).length).toBe(13) // taken
    expect(svg).toContain('<desc>taken:13 available:7</desc>')
  })
  it('escapes user text', () => {
    const svg = buildPromoCardSvg({ ...promo, productName: 'A & B <x>' })
    expect(svg).toContain('A &amp; B &lt;x&gt;')
  })
})
