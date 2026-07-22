import { describe, it, expect } from 'vitest'
import { mapQuotationRow } from './quotations-logic'

describe('mapQuotationRow', () => {
  it('flattens a nested-object join into client + lane, keeping the quote number', () => {
    const item = mapQuotationRow({
      id: 'q1',
      quote_no: 'COT-WGT-2026-0007',
      status: 'SENT',
      total_minor: 1_250_000,
      currency: 'USD',
      created_at: '2026-07-21T00:00:00Z',
      issued_on: '2026-07-21',
      rfqs: { accounts: { name: 'Distribuidora Lima' }, lanes: { slug: 'machinery' } },
    })
    expect(item.quoteNo).toBe('COT-WGT-2026-0007')
    expect(item.clientName).toBe('Distribuidora Lima')
    expect(item.laneSlug).toBe('machinery')
    expect(item.totalMinor).toBe(1_250_000)
  })

  it('handles array-shaped joins and a string total', () => {
    const item = mapQuotationRow({
      id: 'q2',
      quote_no: null,
      status: 'DRAFT',
      total_minor: '480000',
      currency: 'USD',
      created_at: '2026-07-20T00:00:00Z',
      issued_on: null,
      rfqs: [{ accounts: [{ name: 'Andes Corp' }], lanes: [{ slug: 'interiors' }] }],
    })
    expect(item.quoteNo).toBeNull() // draft
    expect(item.clientName).toBe('Andes Corp')
    expect(item.laneSlug).toBe('interiors')
    expect(item.totalMinor).toBe(480000)
  })

  it('degrades gracefully when joins are missing', () => {
    const item = mapQuotationRow({
      id: 'q3',
      quote_no: null,
      status: 'DRAFT',
      total_minor: 0,
      currency: 'USD',
      created_at: '2026-07-19T00:00:00Z',
      issued_on: null,
      rfqs: null,
    })
    expect(item.clientName).toBeNull()
    expect(item.laneSlug).toBeNull()
    expect(item.currency).toBe('USD')
  })
})
