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
  phase: 'EN_TRANSITO',
}

describe('buildPromoCopy', () => {
  it('whatsapp copy has the slots, wholesale pitch, specs, phase+route and the listing URL, no exclamation', () => {
    const c = buildPromoCopy(promo, 'whatsapp')
    expect(c).toContain('7 de 20 cupos')
    expect(c).toContain('al por mayor')
    expect(c).toContain('precio mayorista de campaña')
    expect(c).toContain('Hojas: doble hoja')
    expect(c).toContain('En tránsito · China → Callao') // phase + route from the spec
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

  // Two-audience share: marketing (internal ad-production handoff) and clients
  // (client-facing wholesale CTA) reuse the ad-script body and append an end-text.
  describe('two-audience share', () => {
    it('marketing and clients share the identical ad-script body, differ only in the end-text', () => {
      const ad = buildPromoCopy(promo, 'ad')
      const marketing = buildPromoCopy(promo, 'marketing')
      const clients = buildPromoCopy(promo, 'clients')
      // Each audience copy begins with the exact ad-script body (the shared logic).
      expect(marketing.startsWith(ad)).toBe(true)
      expect(clients.startsWith(ad)).toBe(true)
      // The shared body is identical between the two audiences.
      const marketingBody = marketing.split('\n')[0]
      const clientsBody = clients.split('\n')[0]
      expect(marketingBody).toBe(clientsBody)
      expect(marketingBody).toBe(ad)
      // Only the appended end-text differs.
      const marketingEnd = marketing.slice(ad.length).trim()
      const clientsEnd = clients.slice(ad.length).trim()
      expect(marketingEnd).not.toBe(clientsEnd)
      expect(marketingEnd.length).toBeGreaterThan(0)
      expect(clientsEnd.length).toBeGreaterThan(0)
    })
    it('marketing appends the internal handoff close; clients the wholesale CTA — no exclamation', () => {
      const marketing = buildPromoCopy(promo, 'marketing')
      const clients = buildPromoCopy(promo, 'clients')
      expect(marketing).toContain('equipo de marketing')
      expect(clients).toContain('Reserva tu cupo')
      expect(clients).toContain('al por mayor')
      expect(marketing).not.toContain('!')
      expect(clients).not.toContain('!')
    })
    it('keeps whatsapp and ad backward-compatible (unchanged output)', () => {
      // ad stays a one-liner with no appended end-text.
      const ad = buildPromoCopy(promo, 'ad')
      expect(ad.split('\n')).toHaveLength(1)
      expect(ad).toContain('7 cupos disponibles')
      expect(ad).not.toContain('equipo de marketing')
      // whatsapp is still the multi-line message.
      const wa = buildPromoCopy(promo, 'whatsapp')
      expect(wa).toContain('7 de 20 cupos')
      expect(wa).not.toContain('equipo de marketing')
    })
  })
})

describe('buildPromoCardSvg', () => {
  it('is a well-formed square SVG with the wordmark, product, slot count and URL', () => {
    const svg = buildPromoCardSvg(promo)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('width="1080" height="1080"')
    expect(svg).toContain('M3045.77') // the inlined Wings imagotipo mark (path signature)
    expect(svg).toContain('Papel higiénico Áladín')
    expect(svg).toContain('7 de 20 cupos disponibles')
    expect(svg).toContain('EN TRÁNSITO') // shipment status badge
    expect(svg).toContain('China → Callao') // origin → destination from the spec
    expect(svg).toContain(promo.listingUrl)
  })
  it('shows the arrived state when the phase is ARRIBADO', () => {
    const svg = buildPromoCardSvg({ ...promo, phase: 'ARRIBADO' })
    expect(svg).toContain('ARRIBADO')
  })
  it('draws the container as slotsTotal numbered bays with three states + legend', () => {
    const svg = buildPromoCardSvg(promo)
    const bays = (svg.match(/data-slot="/g) ?? []).length
    expect(bays).toBe(20)
    // No committed/reserved given → 13 taken all show vendido, 7 open.
    expect((svg.match(/data-slot="committed"/g) ?? []).length).toBe(13)
    expect((svg.match(/data-slot="reserved"/g) ?? []).length).toBe(0)
    expect((svg.match(/data-slot="open"/g) ?? []).length).toBe(7)
    expect(svg).toContain('Vendido')
    expect(svg).toContain('Reservado')
    expect(svg).toContain('Disponible')
    expect(svg).toContain('<desc>taken:13 committed:13 reserved:0 available:7</desc>')
  })
  it('splits vendido vs reservado when the breakdown is given', () => {
    const svg = buildPromoCardSvg({ ...promo, slotsCommitted: 8, slotsReserved: 5 })
    expect((svg.match(/data-slot="committed"/g) ?? []).length).toBe(8)
    expect((svg.match(/data-slot="reserved"/g) ?? []).length).toBe(5)
    expect((svg.match(/data-slot="open"/g) ?? []).length).toBe(7)
  })
  it('uses the brand accent for the container fill when provided', () => {
    const svg = buildPromoCardSvg({ ...promo, accent: '#3E6B2F' })
    expect(svg).toContain('fill="#3E6B2F"')
  })
  it('escapes user text', () => {
    const svg = buildPromoCardSvg({ ...promo, productName: 'A & B <x>' })
    expect(svg).toContain('A &amp; B &lt;x&gt;')
  })
})
