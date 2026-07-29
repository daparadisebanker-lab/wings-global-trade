// The outbound RFQ is the only artefact a counterparty reads. Everything
// upstream is decimal-exact; these tests exist so that exactness survives
// transmission to a factory that does not read es-ES.

import { describe, expect, it } from 'vitest'
import { requestBody } from '@/pasillo/lib/export'
import { SERIES, SKUS } from '@/pasillo/data/catalogue'
import type { Buyer, Folder } from '@/pasillo/lib/record'

const series = SERIES[0]
const skus = SKUS.filter((s) => s.series_uid === series.series_uid).slice(0, 2)

const buyer: Buyer = {
  name: 'A. Ramos',
  company: 'Constructora Sur',
  project: 'Hotel Miraflores',
  port: 'Callao',
  incoterm: 'EXW',
  target: '2026-11-30',
}

const folders: Folder[] = [
  { series_uid: series.series_uid, addedAt: 0, selected: skus.map((s) => s.sku_uid), note: '' },
]

const build = (qty: Record<string, { basis: 'm2'; value: number }> = {}) =>
  requestBody({ folders, qty, notes: {}, buyer, kind: '20GP', dateISO: '2026-07-29' })

describe('outbound RFQ · number conventions', () => {
  const body = build({ [skus[0].sku_uid]: { basis: 'm2', value: 47.52 } })

  it('applies the comma rule to EVERY figure, including fractional thickness', () => {
    // Several series are 8.8 mm thick — the header line was the one place a raw
    // dot survived, and only a series with a fractional thickness reveals it.
    const thick = SERIES.find((s) => !Number.isInteger(s.thickness_mm))
    expect(thick).toBeDefined()
    const f: Folder[] = [
      {
        series_uid: thick!.series_uid,
        addedAt: 0,
        selected: [SKUS.find((s) => s.series_uid === thick!.series_uid)!.sku_uid],
        note: '',
      },
    ]
    const out = requestBody({
      folders: f,
      qty: {},
      notes: {},
      buyer,
      kind: '20GP',
      dateISO: '2026-07-29',
    })
    expect(out).toContain('×8,8 mm')
    expect(out).not.toMatch(/\d\.\d/)
  })

  it('never emits a dot inside a number — es-ES thousands read as decimals abroad', () => {
    // `25.000 kg` is twenty-five thousand here and twenty-five in Foshan.
    // No carve-out needed any more: the packing-rules build id was internal and
    // has been removed from the document entirely.
    expect(body.match(/\d\.\d/g)).toBeNull()
  })

  it('separates thousands with a space', () => {
    expect(body).toMatch(/carga útil 28 200 kg/)
  })

  it('uses a decimal comma consistently', () => {
    expect(body).toContain('0,99 m²/caja')
    expect(body).toContain('47,52 m²')
  })

  it('carries the float trap through to the document — 48 cartons, not 49', () => {
    expect(body).toMatch(/48 cajas · 47,52 m²/)
  })
})

describe('outbound RFQ · the request matches the header', () => {
  it('asks for the incoterm the buyer actually selected', () => {
    const body = build({ [skus[0].sku_uid]: { basis: 'm2', value: 10 } })
    expect(body).toContain('Entrega: EXW Callao')
    expect(body).toContain('Precio por m² por referencia, EXW Callao.')
    // The old body hardcoded this while stating different terms above it.
    expect(body).not.toContain('FOB y CIF')
  })

  it('asks exactly once, whether or not quantities are set', () => {
    for (const body of [build(), build({ [skus[0].sku_uid]: { basis: 'm2', value: 10 } })]) {
      expect(body.match(/SOLICITAMOS/g)).toHaveLength(1)
      expect(body.match(/Precio por m² por referencia/g)).toHaveLength(1)
    }
  })
})

describe('outbound RFQ · asks for what the catalogue cannot answer', () => {
  it('requests the fields that render pendiente in the UI', () => {
    const body = build()
    expect(body).toContain('PEI')
    expect(body).toContain('absorción de agua')
    expect(body).toContain('resistencia al deslizamiento')
  })

  it('carries nothing internal to the tool', () => {
    const body = build({ [skus[0].sku_uid]: { basis: 'm2', value: 47.52 } })
    // A packing-rules build id and an admission about our own catalogue's gaps
    // are both ours, not the client's, and neither belongs in their message.
    expect(body).not.toMatch(/Cálculo:/)
    // The build id is a date with a `.N` revision suffix — matched precisely, so
    // the legitimate `Fecha de solicitud` line is not caught with it.
    expect(body).not.toMatch(/\d{4}-\d{2}-\d{2}\.\d/)
    expect(body).not.toMatch(/catálogo impreso no los declara/)
  })

  it('quotes the supplier’s own printed finish, not our translation', () => {
    const body = build()
    expect(body).toContain(skus[0].finish_raw)
  })

  it('carries a review flag to the supplier instead of hiding it', () => {
    const flagged = SKUS.find((s) => s.face_kind === 'review')
    expect(flagged).toBeDefined()
    const f: Folder[] = [
      { series_uid: flagged!.series_uid, addedAt: 0, selected: [flagged!.sku_uid], note: '' },
    ]
    const body = requestBody({
      folders: f,
      qty: {},
      notes: {},
      buyer,
      kind: '20GP',
      dateISO: '2026-07-29',
    })
    expect(body).toContain('Verificar antes de cotizar')
  })
})

describe('outbound RFQ · wholesale law', () => {
  it('states no price and no currency', () => {
    const body = build({ [skus[0].sku_uid]: { basis: 'm2', value: 47.52 } })
    // `S/` must be followed by an amount to be Soles — bare `S/` appears
    // legitimately inside the supplier's own packing notation, `PCS/CTN`.
    expect(body).not.toMatch(/US\$|USD|S\/\s?\d|€|\$\d/)
  })

  it('contains no retail vocabulary', () => {
    const body = build({ [skus[0].sku_uid]: { basis: 'm2', value: 47.52 } })
    expect(body).not.toMatch(/carrito|comprar ahora|añadir|checkout/i)
  })
})
