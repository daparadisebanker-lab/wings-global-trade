import { describe, it, expect } from 'vitest'
import { mapDocumentRow, sanitizeFileName } from './documents-logic'

describe('mapDocumentRow', () => {
  it('flattens brand + lane joins and coerces size', () => {
    const d = mapDocumentRow({
      id: 'd1',
      title: 'Ficha X904',
      kind: 'SPEC_SHEET',
      mime_type: 'application/pdf',
      size_bytes: '204800',
      created_at: '2026-07-22T00:00:00Z',
      brands: { name: 'Wings' },
      lanes: { slug: 'machinery' },
    })
    expect(d.title).toBe('Ficha X904')
    expect(d.kind).toBe('SPEC_SHEET')
    expect(d.brandName).toBe('Wings')
    expect(d.laneSlug).toBe('machinery')
    expect(d.sizeBytes).toBe(204800)
  })

  it('handles array joins, a missing lane, and an unknown kind → DOCUMENT', () => {
    const d = mapDocumentRow({
      id: 'd2',
      title: 'Contrato',
      kind: 'WEIRD',
      mime_type: null,
      size_bytes: null,
      created_at: '2026-07-21T00:00:00Z',
      brands: [{ name: 'Wings' }],
      lanes: null,
    })
    expect(d.kind).toBe('DOCUMENT')
    expect(d.laneSlug).toBeNull()
    expect(d.sizeBytes).toBeNull()
  })
})

describe('sanitizeFileName', () => {
  it('lowercases, strips diacritics, and collapses unsafe runs to dashes', () => {
    expect(sanitizeFileName('Ficha Técnica (Final).PDF')).toBe('ficha-tecnica-final-.pdf')
  })

  it('keeps dots, dashes and underscores; never returns empty', () => {
    expect(sanitizeFileName('my_file-v2.pdf')).toBe('my_file-v2.pdf')
    expect(sanitizeFileName('***')).toBe('file')
  })
})
