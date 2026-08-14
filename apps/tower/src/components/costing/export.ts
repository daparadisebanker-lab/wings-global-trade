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

/** Build the section rows shared by the print sheet (CostSheetDocument).
 *  Follows how the price is actually BUILT (2026-08-14): landed cost → the
 *  margin applied on top of it → the resulting sale/final price — margin
 *  comes BEFORE the price it produces, never after (landedCost + marginUSD =
 *  salePrice, per engine.ts). The recoverable-tax bridge (IGV importación +
 *  Percepción → desembolso de caja) is a SEPARATE, parallel concern — it does
 *  not feed the price at all — so it trails at the end next to the other
 *  cash-timing figures instead of interrupting the cost→margin→price read. */
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
    ['COSTO ADUANERO — COMPONE EL LANDED (USD)', ''],
    ['FOB / valor', inputs.fob],
    ['Seguro', result.insurance],
    ['CIF', result.cif],
    ['Ad Valorem', result.adValorem],
    ['ISC', result.isc],
    ['Gastos vinculados', result.gastosVinculados],
    ['Costo puesto en almacén (landed)', result.landedCost],
    ['—', ''],
    ['GANANCIA REAL ESPERADA — SE APLICA SOBRE EL LANDED (USD)', ''],
    ['Margen bruto (ganancia real)', result.margenBruto],
    ['Margen bruto %', `${(result.margenBrutoPct * 100).toFixed(1)}%`],
    ['—', ''],
    ['PRECIO PARA EL CLIENTE — LANDED + GANANCIA (USD)', ''],
    ['Precio de venta (ex-IGV)', result.salePrice],
    ['IGV ventas', result.igvVentas],
    ['Precio final', result.salePriceFinal],
    ['—', ''],
    ['IMPUESTOS RECUPERABLES — SE SUMAN AL DESEMBOLSO, NO AL LANDED NI AL PRECIO (USD)', ''],
    ['IGV importación', result.igvImportacion],
    ['Percepción', result.percepcion],
    ['+ Impuestos recuperables', result.impuestosRecuperablesUSD],
    ['= Desembolso de caja al despacho', result.cashOutlay],
    ['—', ''],
    ['POSICIÓN DE CAJA AL DESPACHO — NO ES UTILIDAD (USD)', ''],
    ['Impuestos recuperables', result.impuestosRecuperablesUSD],
    ['Pago a cuenta IR (1.77%)', result.paCuentaRenta],
    ['Caja disponible hoy', result.margenNetoCaja],
    ['Caja disponible hoy %', `${(result.margenNetoCajaPct * 100).toFixed(1)}%`],
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
// The real-profit callout's fill — matches the UI's gold "Ganancia real
// esperada" card, so the exported file singles out the same number.
const GOLD_BG = 'FFF3E6BE'
const GOLD_RULE = 'FFCBA94F'

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
  /** The real-profit headline (margen bruto) — gold fill, distinct from a
   *  plain subtotal, so it reads as THE answer rather than one more row. */
  gold?: boolean
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
  ws.columns = [{ key: 'label', width: 40 }, { key: 'value', width: 28 }]
  ws.properties.defaultRowHeight = 17
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

  // ── Costo aduanero — compone el landed ───────────────────────────────────
  // Same grouping as CostWaterfall: only these lines sum to the landed cost.
  // IGV importación and Percepción live in the NEXT group deliberately — they
  // are excluded from landed and only bridge into the cash outlay below.
  addSectionBar(ws, 'Costo aduanero — compone el landed (USD)')
  const customsCost: SheetRow[] = [
    { label: 'FOB / valor', value: inputs.fob, numFmt: USD },
    { label: 'Seguro', value: result.insurance, numFmt: USD },
    { label: 'CIF', value: result.cif, numFmt: USD },
    { label: 'Ad Valorem', value: result.adValorem, numFmt: USD },
    { label: `ISC (${(result.iscRate * 100).toFixed(1)}%)`, value: result.isc, numFmt: USD },
    { label: 'Gastos vinculados', value: result.gastosVinculados, numFmt: USD },
    { label: 'Costo puesto en almacén (landed)', value: result.landedCost, numFmt: USD, emphasis: true },
  ]
  for (const r of customsCost) addDataRow(ws, r)

  // ── Ganancia real esperada — the margin applied ON TOP of the landed cost,
  // BEFORE the price it produces (landedCost + marginUSD = salePrice) ──────
  addSectionBar(ws, 'Ganancia real esperada — se aplica sobre el landed (USD)')
  const realProfit: SheetRow[] = [
    { label: 'Margen bruto (ganancia real)', value: result.margenBruto, numFmt: USD, gold: true },
    { label: 'Margen bruto %', value: result.margenBrutoPct, numFmt: PCT, gold: true },
  ]
  for (const r of realProfit) addDataRow(ws, r)

  // ── Precio para el cliente — landed + ganancia ───────────────────────────
  addSectionBar(ws, 'Precio para el cliente — landed + ganancia (USD)')
  const pricing: SheetRow[] = [
    { label: 'Precio de venta (ex-IGV)', value: result.salePrice, numFmt: USD },
    { label: 'IGV ventas', value: result.igvVentas, numFmt: USD },
    { label: 'Precio final', value: result.salePriceFinal, numFmt: USD, emphasis: true },
  ]
  for (const r of pricing) addDataRow(ws, r)

  // ── Impuestos recuperables — a SEPARATE bridge to the cash outlay; never
  // part of the landed cost or the price above ────────────────────────────
  addSectionBar(ws, 'Impuestos recuperables — se suman al desembolso, no al landed ni al precio (USD)')
  const recoverable: SheetRow[] = [
    { label: 'IGV importación', value: result.igvImportacion, numFmt: USD },
    { label: 'Percepción', value: result.percepcion, numFmt: USD },
    { label: '+ Impuestos recuperables', value: result.impuestosRecuperablesUSD, numFmt: USD },
    { label: '= Desembolso de caja al despacho', value: result.cashOutlay, numFmt: USD, emphasis: true },
  ]
  for (const r of recoverable) addDataRow(ws, r)

  // ── Posición de caja — a timing figure, never a second "profit" ─────────
  addSectionBar(ws, 'Posición de caja al despacho — no es utilidad (USD)')
  const cashPosition: SheetRow[] = [
    { label: 'Impuestos recuperables', value: result.impuestosRecuperablesUSD, numFmt: USD },
    { label: 'Pago a cuenta IR (1.77%)', value: result.paCuentaRenta, numFmt: USD, negative: true },
    {
      label: 'Caja disponible hoy',
      value: result.margenNetoCaja,
      numFmt: USD,
      negative: result.margenNetoCaja < 0,
    },
    { label: 'Caja disponible hoy %', value: result.margenNetoCajaPct, numFmt: PCT, negative: result.margenNetoCajaPct < 0 },
  ]
  for (const r of cashPosition) addDataRow(ws, r)

  ws.addRow([])
  const note = ws.addRow([
    'Cifras SUNAT (Perú). El landed excluye IGV importación y percepción — se suman solo al desembolso de caja porque se ' +
      'recuperan después. La ganancia real de la operación es el margen bruto; el desembolso/caja es una posición de ' +
      'caja, no una segunda utilidad.',
  ])
  merge(note.number)
  note.font = { italic: true, size: 9, color: { argb: SECONDARY } }
  note.alignment = { wrapText: true, vertical: 'top' }
  note.height = 32

  return wb
}

function addSectionBar(ws: import('exceljs').Worksheet, title: string): void {
  // Two blank rows (not one) ahead of every section bar — the "more spacing"
  // pass: a print/share artifact reads as more professional with visible air
  // between groups, not rows packed edge to edge.
  ws.addRow([])
  ws.addRow([])
  const bar = ws.addRow([title])
  ws.mergeCells(bar.number, 1, bar.number, 2)
  bar.font = { bold: true, size: 11, color: { argb: BAR_INK } }
  bar.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BAR_BG } }
  bar.getCell(1).alignment = { vertical: 'middle' }
  bar.height = 22
}

function addDataRow(ws: import('exceljs').Worksheet, r: SheetRow): void {
  const row = ws.addRow([r.label, r.value])
  row.height = 17
  const labelCell = row.getCell(1)
  const valueCell = row.getCell(2)
  const bold = !!(r.emphasis || r.gold)
  labelCell.font = { size: 10, bold, color: { argb: INK } }
  valueCell.font = { size: 10, bold, color: { argb: r.negative ? NEGATIVE : INK } }
  valueCell.alignment = { horizontal: 'right' }
  labelCell.border = thinBottom()
  valueCell.border = thinBottom()
  if (r.numFmt) valueCell.numFmt = r.numFmt
  if (r.gold) {
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_BG } }
    valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_BG } }
    labelCell.border = { bottom: { style: 'thin', color: { argb: GOLD_RULE } } }
    valueCell.border = { bottom: { style: 'thin', color: { argb: GOLD_RULE } } }
  } else if (r.emphasis) {
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

// Column order follows how a price is actually BUILT, not the tax mechanics:
// landed cost → margin applied on top of it → sale price → final price for
// the client. That's the sequence a rep reads left to right when asking
// "what did we pay, what do we add, what do we charge" — margin sits BEFORE
// the price it produces, never after. The recoverable-tax bridge (IGV
// importación/Percepción → desembolso de caja) is a SEPARATE, parallel
// concern — it does not feed the price at all (see engine.ts: cashOutlay is
// derived from landedCost, salePrice is derived from landedCost + margin,
// independently) — so it trails at the end next to the other cash-timing
// columns instead of interrupting the cost→margin→price read.
// "Ganancia real (margen bruto)" keeps the UI's gold shading so it reads as
// the answer, not one more column.
const FLEET_COLUMNS: {
  header: string
  width: number
  numFmt?: string
  emphasis?: boolean
  gold?: boolean
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
  { header: 'Ad Valorem', width: 12, numFmt: USD, get: (r) => r.result.adValorem },
  { header: 'ISC %', width: 8, numFmt: PCT, get: (r) => r.result.iscRate },
  { header: 'ISC', width: 12, numFmt: USD, get: (r) => r.result.isc },
  { header: 'Gastos vinculados', width: 14, numFmt: USD, get: (r) => r.result.gastosVinculados },
  { header: 'Landed cost', width: 14, numFmt: USD, emphasis: true, get: (r) => r.result.landedCost },
  { header: 'Margen %', width: 10, numFmt: PCT, get: (r) => r.result.marginRate },
  { header: 'Ganancia real (margen bruto)', width: 18, numFmt: USD, gold: true, get: (r) => r.result.margenBruto },
  { header: 'Precio de venta (ex-IGV)', width: 16, numFmt: USD, get: (r) => r.result.salePrice },
  { header: 'IGV ventas', width: 12, numFmt: USD, get: (r) => r.result.igvVentas },
  { header: 'Precio final (con IGV)', width: 16, numFmt: USD, emphasis: true, get: (r) => r.result.salePriceFinal },
  { header: 'IGV importación', width: 14, numFmt: USD, get: (r) => r.result.igvImportacion },
  { header: 'Percepción', width: 12, numFmt: USD, get: (r) => r.result.percepcion },
  { header: 'Desembolso caja', width: 15, numFmt: USD, emphasis: true, get: (r) => r.result.cashOutlay },
  { header: 'Pago a cuenta IR', width: 14, numFmt: USD, get: (r) => r.result.paCuentaRenta },
  { header: 'Caja disponible hoy', width: 16, numFmt: USD, get: (r) => r.result.margenNetoCaja },
]

/** Bucket rows by brand (fallback "Sin marca"), A→Z by brand, then by model
 *  label within each brand — the fleet export's brand-wise organization. */
function groupByBrand(rows: FleetRow[]): [string, FleetRow[]][] {
  const map = new Map<string, FleetRow[]>()
  for (const r of rows) {
    const key = r.inputs.brand?.trim() || 'Sin marca'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  for (const group of map.values()) group.sort((a, b) => a.label.localeCompare(b.label))
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
}

/** Build the branded fleet-manifest workbook — one row per costed model,
 *  grouped into a labeled band per brand so a multi-brand export reads as an
 *  organized manifest instead of one long undifferentiated list. */
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
  ws.properties.defaultRowHeight = 17
  const lastCol = FLEET_COLUMNS.length
  const merge = (row: number) => ws.mergeCells(row, 1, row, lastCol)

  const brandGroups = groupByBrand(rows)

  const kicker = ws.addRow(['CST · Costeo SUNAT — Wings Global Trade'])
  merge(kicker.number)
  kicker.font = { size: 9, bold: true, color: { argb: INK } }

  const titleRow = ws.addRow([title])
  merge(titleRow.number)
  titleRow.font = { size: 18, bold: true, color: { argb: INK } }
  titleRow.height = 26

  const meta = ws.addRow([
    `${rows.length} modelo(s) · ${brandGroups.length} marca(s) · costos landed puesto en almacén Lima`,
  ])
  merge(meta.number)
  meta.font = { size: 11, color: { argb: SECONDARY } }

  ws.addRow([])

  const captionRow = ws.addRow(FLEET_COLUMNS.map((c) => c.header))
  captionRow.height = 30
  captionRow.font = { bold: true, size: 10, color: { argb: INK } }
  captionRow.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD_BG } }
    c.border = thinBottom()
    c.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
  })

  for (const [brand, brandRows] of brandGroups) {
    // One dark band per brand, same posture as the single-sheet's section
    // bars — the "brand-wise organized" ask: a reader scanning a 76-row
    // export can find a brand's block at a glance instead of scrolling a
    // flat list and cross-checking the Marca column row by row.
    ws.addRow([])
    const band = ws.addRow([`${brand} — ${brandRows.length} modelo(s)`])
    merge(band.number)
    band.font = { bold: true, size: 11, color: { argb: BAR_INK } }
    band.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BAR_BG } }
    band.getCell(1).alignment = { vertical: 'middle' }
    band.height = 22

    for (const r of brandRows) {
      const row = ws.addRow(FLEET_COLUMNS.map((c) => c.get(r)))
      row.height = 17
      FLEET_COLUMNS.forEach((c, i) => {
        const cell = row.getCell(i + 1)
        const bold = !!(c.emphasis || c.gold)
        cell.font = { size: 10, bold, color: { argb: INK } }
        cell.border = thinBottom()
        if (c.numFmt) {
          cell.numFmt = c.numFmt
          cell.alignment = { horizontal: 'right' }
        }
        if (c.gold) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_BG } }
        } else if (c.emphasis) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EMPHASIS_BG } }
        }
      })
    }
  }

  return wb
}

/** Export a chosen set of saved cost calculations as one branded fleet
 *  manifest, grouped by brand — the "share with the team" deliverable (one
 *  row per model, sortable/filterable in Excel), rather than a file per
 *  model. Callers (CostCalculator's history list, /costing/history) pass
 *  whichever rows the operator selected — this never assumes "export
 *  everything." */
export async function exportFleetCostingXlsx(rows: FleetRow[], title = 'Costeo de flota'): Promise<void> {
  const wb = await buildFleetWorkbook(rows, title)
  await downloadWorkbook(wb, `wings-costeo-flota-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
