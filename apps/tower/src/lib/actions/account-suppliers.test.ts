import { describe, it, expect } from 'vitest'
import { mapAccountSupplierRow, type RawAccountSupplierRow } from './account-suppliers-logic'

const base: RawAccountSupplierRow = {
  id: 'as1',
  supplier_id: 's1',
  note: 'Only source for this SKU family',
  created_at: '2026-08-13T00:00:00Z',
  suppliers: { name: 'Ningbo Wentai', country: 'CN' },
}

describe('mapAccountSupplierRow', () => {
  it('flattens the supplier join', () => {
    const item = mapAccountSupplierRow(base)
    expect(item.supplierId).toBe('s1')
    expect(item.supplierName).toBe('Ningbo Wentai')
    expect(item.supplierCountry).toBe('CN')
    expect(item.note).toBe('Only source for this SKU family')
  })

  it('array-shaped supplier join resolves to the first element', () => {
    const item = mapAccountSupplierRow({ ...base, suppliers: [{ name: 'Ningbo Wentai', country: 'CN' }] })
    expect(item.supplierName).toBe('Ningbo Wentai')
  })

  it('missing supplier join and null note degrade to safe defaults', () => {
    const item = mapAccountSupplierRow({ ...base, note: null, suppliers: null })
    expect(item.supplierName).toBe('')
    expect(item.supplierCountry).toBeNull()
    expect(item.note).toBeNull()
  })
})
