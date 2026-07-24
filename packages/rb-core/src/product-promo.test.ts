import { describe, expect, it } from 'vitest'
import { buildProductPromoCopy, buildProductPromoCardSvg, type ProductPromo } from './product-promo'

const listed: ProductPromo = {
  productName: 'Tractor agrícola 40HP',
  ownerLabel: 'WGT/01 Maquinaria',
  category: 'Tractores',
  specs: [
    { label: 'Potencia', value: '40 HP' },
    { label: 'Transmisión', value: '4x4' },
  ],
  priceNote: 'precio de campaña',
  moq: '2',
  listingUrl: 'https://wingsglobaltrade.com/x',
  accent: '#C4933F',
}

const trial: ProductPromo = {
  productName: 'Bomba sumergible solar',
  category: 'Riego',
  specs: [{ label: 'Caudal', value: '5 m³/h' }],
  trial: true,
}

describe('buildProductPromoCopy — copy law', () => {
  it('is wholesale and carries no exclamation marks', () => {
    for (const v of ['whatsapp', 'ad', 'marketing', 'clients'] as const) {
      const listedCopy = buildProductPromoCopy(listed, v)
      const trialCopy = buildProductPromoCopy(trial, v)
      expect(listedCopy).toContain('al por mayor')
      expect(listedCopy).not.toMatch(/[!¡]/)
      expect(trialCopy).not.toMatch(/[!¡]/)
    }
  })
})

describe('buildProductPromoCopy — listed', () => {
  it('ad body includes product, category, specs and the listing URL', () => {
    const ad = buildProductPromoCopy(listed, 'ad')
    expect(ad).toContain('Tractor agrícola 40HP')
    expect(ad).toContain('Tractores')
    expect(ad).toContain('Potencia: 40 HP')
    expect(ad).toContain('https://wingsglobaltrade.com/x')
  })
  it('clients appends the wholesale end-text', () => {
    expect(buildProductPromoCopy(listed, 'clients')).toContain('coordinar tu compra')
  })
  it('whatsapp shows the price note and MOQ', () => {
    const wa = buildProductPromoCopy(listed, 'whatsapp')
    expect(wa).toContain('precio de campaña')
    expect(wa).toContain('Pedido mínimo: 2')
  })
})

describe('buildProductPromoCopy — trial (sondeo framing)', () => {
  it('reframes the lead as evaluating demand, never a live listing', () => {
    const ad = buildProductPromoCopy(trial, 'ad')
    expect(ad).toContain('evaluando disponibilidad')
    const wa = buildProductPromoCopy(trial, 'whatsapp')
    expect(wa).toContain('Aún no está en el catálogo')
    expect(wa).toContain('medir el interés')
  })
  it('omits a listing URL it does not have (no fabricated link)', () => {
    expect(buildProductPromoCopy(trial, 'ad')).not.toContain('http')
  })
})

describe('buildProductPromoCardSvg', () => {
  it('renders the product name and a spec section', () => {
    const svg = buildProductPromoCardSvg(listed)
    expect(svg).toContain('Tractor')
    expect(svg).toContain('Especificaciones')
    expect(svg).toContain('40 HP')
    expect(svg).toContain('https://wingsglobaltrade.com/x')
  })
  it('stamps a trial as a muestra and never as a listing', () => {
    expect(buildProductPromoCardSvg(trial)).toContain('MUESTRA · SONDEO')
    expect(buildProductPromoCardSvg(listed)).not.toContain('MUESTRA')
  })
  it('embeds a data:image but never an arbitrary href', () => {
    const withImg = buildProductPromoCardSvg({ ...trial, imageHref: 'data:image/png;base64,AAAA' })
    expect(withImg).toContain('<image href="data:image/png;base64,AAAA"')
    const withEvil = buildProductPromoCardSvg({ ...trial, imageHref: 'https://evil.example/x.png' })
    expect(withEvil).not.toContain('<image')
    const withJs = buildProductPromoCardSvg({ ...trial, imageHref: 'javascript:alert(1)' })
    expect(withJs).not.toContain('<image')
  })
  it('falls back to a contact line when there is no listing URL', () => {
    const svg = buildProductPromoCardSvg(trial)
    expect(svg).toContain('wingsglobaltrade.com')
  })
  it('escapes angle brackets in the product name (no injection)', () => {
    const svg = buildProductPromoCardSvg({ ...trial, productName: 'A <script> B' })
    expect(svg).not.toContain('<script>')
    expect(svg).toContain('&lt;script&gt;')
  })
})
