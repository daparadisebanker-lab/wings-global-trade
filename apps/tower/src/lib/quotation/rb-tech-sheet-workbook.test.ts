import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { buildTechSheetSections, type TechSheetFacts } from '@wings/rb-core'
import { buildRbTechSheetWorkbook, type RbTechSheetWorkbookModel } from './rb-tech-sheet-workbook'

const FACTS: TechSheetFacts = {
  container: {
    kind: '40HC',
    ref: 'RB01-40HC',
    totalSlots: 10,
    packagesPerSlot: 100,
    routeLabel: 'Qingdao → Callao',
    phaseLabel: 'En tránsito',
  },
  packing: {
    packageKind: 'caja',
    unitsPerPackage: 48,
    packetsPerPackage: 4,
    packageCbm: 0.05,
    packageKg: 9.7,
    unitNamePlural: 'rollos',
    gtin: '07750182000012',
  },
  product: { hsCode: '4818.10.00.00', moq: 1, moqUnit: 'cupos', cbmPerUnit: 0.001 },
  requestedSlots: 3,
}

function model(overrides: Partial<RbTechSheetWorkbookModel> = {}): RbTechSheetWorkbookModel {
  return {
    brandName: 'Áladín',
    productName: 'Papel Higiénico Premium',
    containerCode: 'RB01-40HC-001',
    containerKind: '40HC',
    quoteRef: 'COT-RB-2026-0007',
    routeLabel: 'Qingdao → Callao',
    phaseLabel: 'En tránsito',
    slotsTotal: 10,
    slotsAvailable: 7,
    techSheet: buildTechSheetSections(FACTS),
    ...overrides,
  }
}

/** The value cell (col 3) of the row whose EN label (col 2) matches. */
function valueCellByEnLabel(ws: ExcelJS.Worksheet, labelEn: string): ExcelJS.Cell | null {
  let found: ExcelJS.Cell | null = null
  ws.eachRow((row) => {
    if (row.getCell(2).value === labelEn) found = row.getCell(3)
  })
  return found
}

describe('buildRbTechSheetWorkbook', () => {
  it('produces a single "Ficha técnica" worksheet', () => {
    const wb = buildRbTechSheetWorkbook(model())
    expect(wb.worksheets).toHaveLength(1)
    expect(wb.getWorksheet('Ficha técnica')).toBeTruthy()
  })

  it('types numeric exhibits as real numbers (not strings) so Excel treats them numerically', () => {
    const wb = buildRbTechSheetWorkbook(model())
    const ws = wb.getWorksheet('Ficha técnica')!
    const totalSlots = valueCellByEnLabel(ws, 'Total slots')!
    expect(typeof totalSlots.value).toBe('number')
    expect(totalSlots.value).toBe(10)

    const packagesPerContainer = valueCellByEnLabel(ws, 'Packages per container')!
    expect(packagesPerContainer.value).toBe(1000)
    expect(packagesPerContainer.numFmt).toContain('#,##0')
  })

  it('formats volume as m³ and weight as kg on the numeric cell', () => {
    const wb = buildRbTechSheetWorkbook(model())
    const ws = wb.getWorksheet('Ficha técnica')!
    const vol = valueCellByEnLabel(ws, 'Package volume')!
    expect(typeof vol.value).toBe('number')
    expect(vol.value).toBeCloseTo(0.05, 5)
    expect(vol.numFmt).toContain('m³')

    const weight = valueCellByEnLabel(ws, 'Package weight')!
    expect(weight.numFmt).toContain('kg')
    expect(weight.value).toBeCloseTo(9.7, 5)
  })

  it('keeps identifier codes (HS, GTIN) as text — leading zeros / dots are load-bearing', () => {
    const wb = buildRbTechSheetWorkbook(model())
    const ws = wb.getWorksheet('Ficha técnica')!
    const hs = valueCellByEnLabel(ws, 'HS code')!
    expect(hs.value).toBe('4818.10.00.00')
    const gtin = valueCellByEnLabel(ws, 'GTIN')!
    expect(typeof gtin.value).toBe('string')
    expect(gtin.value).toBe('07750182000012')
  })

  it('mirrors the allocation section when the model carries requested slots', () => {
    const wb = buildRbTechSheetWorkbook(model())
    const ws = wb.getWorksheet('Ficha técnica')!
    // 3 slots × 100 packages/slot × 48 units = 14 400 units
    expect(valueCellByEnLabel(ws, 'Slots allocated')!.value).toBe(3)
    expect(valueCellByEnLabel(ws, 'Units (rollos)')!.value).toBe(14400)
  })

  it('round-trips through a real .xlsx buffer preserving numeric typing', async () => {
    const wb = buildRbTechSheetWorkbook(model())
    const buffer = await wb.xlsx.writeBuffer()
    expect(buffer.byteLength).toBeGreaterThan(0)

    const reloaded = new ExcelJS.Workbook()
    await reloaded.xlsx.load(buffer as ArrayBuffer)
    const ws = reloaded.getWorksheet('Ficha técnica')!
    const totalSlots = valueCellByEnLabel(ws, 'Total slots')!
    expect(typeof totalSlots.value).toBe('number')
    expect(totalSlots.value).toBe(10)
  })

  it('exhibits available slots in the identity header as a number', () => {
    const wb = buildRbTechSheetWorkbook(model({ slotsAvailable: 4 }))
    const ws = wb.getWorksheet('Ficha técnica')!
    expect(valueCellByEnLabel(ws, 'Available slots')!.value).toBe(4)
  })
})
