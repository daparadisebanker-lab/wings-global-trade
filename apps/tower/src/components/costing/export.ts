// src/components/costing/export.ts
// Single cost-sheet export (peru-costing Wave 6.3) — a TRUE branded .xlsx, same
// posture as lib/quotation/rb-tech-sheet-workbook.ts (kicker/title header,
// section bars, right-aligned numeric columns, thin rules, frozen header): this
// is the artifact ops hands to a client or shares with the team, not a raw data
// dump. jsPDF-free: a client PDF is available via the print route
// (/costing/[id]/sheet → browser print), consistent with the quotation document.
import type { ImportInputs, ImportResult } from '@/lib/costing/types'

function slug(s: string): string {
  return (s || 'costeo').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'costeo'
}

/** Build the section rows shared by the print sheet (CostSheetDocument). */
export function costSheetRows(inputs: ImportInputs, result: ImportResult): [string, string | number][] {
  return [
    ['Producto', inputs.productName],
    ['Marca', inputs.brand],
    ['Modelo', inputs.model],
    ['Combustible', inputs.fuelType],
    ['Cilindrada CC', inputs.engineCC],
    ['Incoterm', inputs.incoterm],
    ['Tipo de cambio (PEN/USD)', inputs.exchangeRate],
    ['—', ''],
    ['CASCADA DE COSTOS (USD)', ''],
    ['FOB / valor', inputs.fob],
    ['Seguro', result.insurance],
    ['CIF', result.cif],
    ['Ad Valorem', result.adValorem],
    ['ISC', result.isc],
    ['IGV importación', result.igvImportacion],
    ['Percepción', result.percepcion],
    ['Gastos vinculados', result.gastosVinculados],
    ['Landed cost', result.landedCost],
    ['Desembolso de caja', result.cashOutlay],
    ['—', ''],
    ['PRECIO Y MÁRGENES (USD)', ''],
    ['Precio de venta (ex-IGV)', result.salePrice],
    ['IGV ventas', result.igvVentas],
    ['Precio final', result.salePriceFinal],
    ['Margen bruto', result.margenBruto],
    ['Margen bruto %', `${(result.margenBrutoPct * 100).toFixed(1)}%`],
    ['Impuestos recuperables USD', result.impuestosRecuperablesUSD],
    ['Pago a cuenta IR (1.77%)', result.paCuentaRenta],
    ['Margen neto de caja', result.margenNetoCaja],
    ['Margen neto de caja %', `${(result.margenNetoCajaPct * 100).toFixed(1)}%`],
  ]
}

// Self-contained light-document palette (ARGB) — same posture as
// rb-tech-sheet-workbook.ts: a workbook is a print artifact, not a lane
// component, so it carries its own ink rather than semantic CSS tokens.
const INK = 'FF0F1216'
const SECONDARY = 'FF6B7280'
const BAR_BG = 'FF1B1E22'
const BAR_INK = 'FFE8EAED'
const HEAD_BG = 'FFF1F1F2'
const RULE = 'FFD6D8DB'
const EMPHASIS_BG = 'FFEFEFEF'
const NEGATIVE = 'FFB3261E'

const USD = '#,##0.00" USD"'
const PCT = '0.0%'

function thinBottom(): { bottom: { style: 'thin'; color: { argb: string } } } {
  return { bottom: { style: 'thin', color: { argb: RULE } } }
}

interface SheetRow {
  label: string
  value: number | string
  /** Excel number format for numeric values; omitted for text values. */
  numFmt?: string
  emphasis?: boolean
  negative?: boolean
}

/** Build the branded single-sheet cost-sheet workbook (identity + both cascades). */
async function buildCostSheetWorkbook(
  inputs: ImportInputs,
  result: ImportResult,
  label?: string | null,
): Promise<import('exceljs').Workbook> {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Wings Global Trade · TOWER'
  wb.company = 'Wings Global Trade'

  const ws = wb.addWorksheet('Costeo', {
    views: [{ state: 'frozen', ySplit: 4 }],
    pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0, orientation: 'portrait' },
  })
  ws.columns = [{ key: 'label', width: 34 }, { key: 'value', width: 26 }]
  const merge = (row: number) => ws.mergeCells(row, 1, row, 2)

  // ── Header ──────────────────────────────────────────────────────────────
  const kicker = ws.addRow(['CST · Costeo SUNAT — Wings Global Trade'])
  merge(kicker.number)
  kicker.font = { size: 9, bold: true, color: { argb: INK } }

  const title = ws.addRow([label || inputs.productName || 'Costo de importación'])
  merge(title.number)
  title.font = { size: 18, bold: true, color: { argb: INK } }
  title.height = 26

  const meta = ws.addRow([`${inputs.brand}${inputs.model ? ` · ${inputs.model}` : ''} · ${inputs.incoterm} · TC ${inputs.exchangeRate}`])
  merge(meta.number)
  meta.font = { size: 11, color: { argb: SECONDARY } }

  // ── Identity block ─────────────────────────────────────────────────────
  addSectionBar(ws, 'Identidad')
  const identity: SheetRow[] = [
    { label: 'Combustible', value: inputs.fuelType },
    { label: 'Cilindrada CC', value: inputs.engineCC, numFmt: '#,##0' },
    { label: 'Origen', value: inputs.origin },
  ]
  for (const r of identity) addDataRow(ws, r)

  // ── Cascada de costos ──────────────────────────────────────────────────
  addSectionBar(ws, 'Cascada de costos (USD)')
  const cascade: SheetRow[] = [
    { label: 'FOB / valor', value: inputs.fob, numFmt: USD },
    { label: 'Seguro', value: result.insurance, numFmt: USD },
    { label: 'CIF', value: result.cif, numFmt: USD },
    { label: 'Ad Valorem', value: result.adValorem, numFmt: USD },
    { label: `ISC (${(result.iscRate * 100).toFixed(1)}%)`, value: result.isc, numFmt: USD },
    { label: 'IGV importación', value: result.igvImportacion, numFmt: USD },
    { label: 'Percepción', value: result.percepcion, numFmt: USD },
    { label: 'Gastos vinculados', value: result.gastosVinculados, numFmt: USD },
    { label: 'Costo puesto en almacén (landed)', value: result.landedCost, numFmt: USD, emphasis: true },
    { label: 'Desembolso de caja', value: result.cashOutlay, numFmt: USD, emphasis: true },
  ]
  for (const r of cascade) addDataRow(ws, r)

  // ── Precio y márgenes ───────────────────────────────────────────────────
  addSectionBar(ws, 'Precio y márgenes (USD)')
  const pricing: SheetRow[] = [
    { label: 'Precio de venta (ex-IGV)', value: result.salePrice, numFmt: USD },
    { label: 'IGV ventas', value: result.igvVentas, numFmt: USD },
    { label: 'Precio final', value: result.salePriceFinal, numFmt: USD, emphasis: true },
    { label: 'Margen bruto', value: result.margenBruto, numFmt: USD, emphasis: true },
    { label: 'Margen bruto %', value: result.margenBrutoPct, numFmt: PCT },
    { label: 'Impuestos recuperables', value: result.impuestosRecuperablesUSD, numFmt: USD },
    { label: 'Pago a cuenta IR (1.77%)', value: result.paCuentaRenta, numFmt: USD, negative: true },
    {
      label: 'Margen neto de caja',
      value: result.margenNetoCaja,
      numFmt: USD,
      emphasis: true,
      negative: result.margenNetoCaja < 0,
    },
    { label: 'Margen neto de caja %', value: result.margenNetoCajaPct, numFmt: PCT, negative: result.margenNetoCajaPct < 0 },
  ]
  for (const r of pricing) addDataRow(ws, r)

  ws.addRow([])
  const note = ws.addRow(['Cifras SUNAT (Perú) — incoterm, ISC por combustible/cilindrada, IGV + percepción, margen configurado por el operador.'])
  merge(note.number)
  note.font = { italic: true, size: 9, color: { argb: SECONDARY } }
  note.alignment = { wrapText: true, vertical: 'top' }
  note.height = 24

  return wb
}

function addSectionBar(ws: import('exceljs').Worksheet, title: string): void {
  ws.addRow([])
  const bar = ws.addRow([title])
  ws.mergeCells(bar.number, 1, bar.number, 2)
  bar.font = { bold: true, size: 11, color: { argb: BAR_INK } }
  bar.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BAR_BG } }
  bar.getCell(1).alignment = { vertical: 'middle' }
  bar.height = 20
}

function addDataRow(ws: import('exceljs').Worksheet, r: SheetRow): void {
  const row = ws.addRow([r.label, r.value])
  const labelCell = row.getCell(1)
  const valueCell = row.getCell(2)
  labelCell.font = { size: 10, bold: !!r.emphasis, color: { argb: INK } }
  valueCell.font = { size: 10, bold: !!r.emphasis, color: { argb: r.negative ? NEGATIVE : INK } }
  valueCell.alignment = { horizontal: 'right' }
  labelCell.border = thinBottom()
  valueCell.border = thinBottom()
  if (r.numFmt) valueCell.numFmt = r.numFmt
  if (r.emphasis) {
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EMPHASIS_BG } }
    valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EMPHASIS_BG } }
  }
}

async function downloadWorkbook(wb: import('exceljs').Workbook, fileName: string): Promise<void> {
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportCostSheetXlsx(
  inputs: ImportInputs,
  result: ImportResult,
  label?: string | null,
): Promise<void> {
  const wb = await buildCostSheetWorkbook(inputs, result, label)
  await downloadWorkbook(wb, `wings-costeo-${slug(label || inputs.productName)}.xlsx`)
}

// ── Fleet export — every saved calculation in one branded manifest ───────────
// The "share with the team" deliverable: one row per costed model instead of
// one file per model. Column-for-column with the cost cascade above, HEAD_BG
// captions, frozen header, a manifest table a rep can filter/sort in Excel.

export interface FleetRow {
  label: string
  inputs: ImportInputs
  result: ImportResult
}

const FLEET_COLUMNS: {
  header: string
  width: number
  numFmt?: string
  get: (r: FleetRow) => string | number
}[] = [
  { header: 'Modelo', width: 44, get: (r) => r.label },
  { header: 'Marca', width: 16, get: (r) => r.inputs.brand },
  { header: 'Combustible', width: 12, get: (r) => r.inputs.fuelType },
  { header: 'CC', width: 8, numFmt: '#,##0', get: (r) => r.inputs.engineCC },
  { header: 'Incoterm', width: 10, get: (r) => r.inputs.incoterm },
  { header: 'FOB', width: 14, numFmt: USD, get: (r) => r.inputs.fob },
  { header: 'Flete intl.', width: 12, numFmt: USD, get: (r) => r.inputs.freightInternational },
  { header: 'CIF', width: 14, numFmt: USD, get: (r) => r.result.cif },
  { header: 'ISC %', width: 8, numFmt: PCT, get: (r) => r.result.iscRate },
  { header: 'ISC', width: 12, numFmt: USD, get: (r) => r.result.isc },
  { header: 'IGV importación', width: 14, numFmt: USD, get: (r) => r.result.igvImportacion },
  { header: 'Percepción', width: 12, numFmt: USD, get: (r) => r.result.percepcion },
  { header: 'Landed cost', width: 14, numFmt: USD, get: (r) => r.result.landedCost },
  { header: 'Desembolso caja', width: 15, numFmt: USD, get: (r) => r.result.cashOutlay },
  { header: 'Margen %', width: 10, numFmt: PCT, get: (r) => r.result.marginRate },
  { header: 'Margen USD', width: 12, numFmt: USD, get: (r) => r.result.marginUSD },
  { header: 'Precio final (con IGV)', width: 16, numFmt: USD, get: (r) => r.result.salePriceFinal },
  { header: 'Pago a cuenta IR', width: 14, numFmt: USD, get: (r) => r.result.paCuentaRenta },
  { header: 'Margen neto de caja', width: 16, numFmt: USD, get: (r) => r.result.margenNetoCaja },
]

/** Build the branded fleet-manifest workbook — one row per costed model. */
async function buildFleetWorkbook(rows: FleetRow[], title: string): Promise<import('exceljs').Workbook> {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Wings Global Trade · TOWER'
  wb.company = 'Wings Global Trade'

  const ws = wb.addWorksheet('Costeo flota', {
    views: [{ state: 'frozen', ySplit: 5 }],
    pageSetup: { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
  })
  ws.columns = FLEET_COLUMNS.map((c) => ({ width: c.width }))
  const lastCol = FLEET_COLUMNS.length
  const merge = (row: number) => ws.mergeCells(row, 1, row, lastCol)

  const kicker = ws.addRow(['CST · Costeo SUNAT — Wings Global Trade'])
  merge(kicker.number)
  kicker.font = { size: 9, bold: true, color: { argb: INK } }

  const titleRow = ws.addRow([title])
  merge(titleRow.number)
  titleRow.font = { size: 18, bold: true, color: { argb: INK } }
  titleRow.height = 26

  const meta = ws.addRow([`${rows.length} modelo(s) · margen por defecto 10% · costos landed puesto en almacén Lima`])
  merge(meta.number)
  meta.font = { size: 11, color: { argb: SECONDARY } }

  ws.addRow([])

  const captionRow = ws.addRow(FLEET_COLUMNS.map((c) => c.header))
  captionRow.font = { bold: true, size: 10, color: { argb: INK } }
  captionRow.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD_BG } }
    c.border = thinBottom()
    c.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
  })

  for (const r of rows) {
    const row = ws.addRow(FLEET_COLUMNS.map((c) => c.get(r)))
    FLEET_COLUMNS.forEach((c, i) => {
      const cell = row.getCell(i + 1)
      cell.font = { size: 10, color: { argb: INK } }
      cell.border = thinBottom()
      if (c.numFmt) {
        cell.numFmt = c.numFmt
        cell.alignment = { horizontal: 'right' }
      }
    })
  }

  return wb
}

/** Export every saved cost calculation as one branded fleet manifest — the
 *  "share with the team" deliverable (one row per model, sortable/filterable
 *  in Excel), rather than 76 separate single-model files. */
export async function exportFleetCostingXlsx(rows: FleetRow[], title = 'Costeo de flota'): Promise<void> {
  const wb = await buildFleetWorkbook(rows, title)
  await downloadWorkbook(wb, `wings-costeo-flota-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
