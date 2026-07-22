// src/lib/quotation/rb-tech-sheet-workbook.ts
// A TRUE .xlsx render of the RB technical spec sheet — the same technical data
// the print sheet (RbTechSheet) exhibits, as a real Excel workbook. ALLOCATION
// archetype (root CLAUDE.md §5-bis): a container is sold by slot / by container,
// never by unit — so this is a technical annex of exhibited numbers (Directive 5:
// CBM, slots, packages-per-slot, packing cascade, HS, GTIN are brand assets), not
// a retail listing. Wholesale only (Directive 2): no cart, no per-unit price.
//
// Pure + framework-agnostic, exactly like document.ts / rb-container.ts: given the
// assembled model it returns a Workbook, no I/O, no Supabase, no route concerns.
// The route (…/tech-sheet.xlsx/route.ts) does auth → RLS read → build → stream;
// the numbers arrive fully built from @wings/rb-core's buildTechSheetSections, so
// this file NEVER re-derives packing math — it only lays the exhibit out in cells.
//
// The exhibit is typed: every quantity row carries a machine `num` (rb-core), so a
// spreadsheet treats CBM/slots/packing as real numbers (sortable, summable), not
// strings. Identifier codes (HS partida, GTIN) stay text — leading zeros and dot
// notation are load-bearing there. Labels are bilingual ES · EN, mirroring the
// print sheet's section/row order column-for-column.
import ExcelJS from 'exceljs'
import type { TechSheetSection } from '@wings/rb-core'

/** The subset of RbContainerQuoteDocument this exporter reads (structural — the
 *  full document is assignable, so the route passes `doc` straight through). */
export interface RbTechSheetWorkbookModel {
  brandName: string
  productName: string
  containerCode: string
  containerKind: string
  quoteRef: string | null
  routeLabel: string | null
  phaseLabel: string | null
  slotsTotal: number
  slotsAvailable: number
  techSheet: TechSheetSection[]
}

// Self-contained light-document palette (ARGB), the same posture as the print
// surfaces (document-page.css) — a workbook is a print artifact, not a lane
// component, so it carries its own ink rather than semantic CSS tokens.
const INK = 'FF0F1216'
const BAR_BG = 'FF1B1E22'
const BAR_INK = 'FFE8EAED'
const HEAD_BG = 'FFF1F1F2'
const RULE = 'FFD6D8DB'

/** Excel number format for a tech-sheet quantity. m³ → 3-decimal volume, kg →
 *  2-decimal weight, otherwise a grouped integer count. */
function numFmtFor(unit?: 'm³' | 'kg'): string {
  if (unit === 'm³') return '#,##0.000" m³"'
  if (unit === 'kg') return '#,##0.00" kg"'
  return '#,##0'
}

function thinBottom(): Partial<ExcelJS.Borders> {
  return { bottom: { style: 'thin', color: { argb: RULE } } }
}

/**
 * Build the RB technical-spec workbook from an assembled tech-sheet model.
 * Pure: same model → same cells. The caller streams it via `workbook.xlsx`.
 */
export function buildRbTechSheetWorkbook(doc: RbTechSheetWorkbookModel): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Wings Global Trade · TOWER'
  wb.company = 'Wings Global Trade'

  const ws = wb.addWorksheet('Ficha técnica', {
    views: [{ state: 'frozen', ySplit: 6 }],
    pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0, orientation: 'portrait' },
  })
  ws.columns = [
    { key: 'es', width: 40 },
    { key: 'en', width: 34 },
    { key: 'val', width: 24 },
  ]

  const merge = (row: number) => ws.mergeCells(row, 1, row, 3)

  // ── Header (identity) ──────────────────────────────────────────────────────
  const kicker = ws.addRow(['Ficha técnica del contenedor · Container technical data sheet'])
  merge(kicker.number)
  kicker.font = { size: 9, color: { argb: INK }, bold: true }
  kicker.getCell(1).alignment = { vertical: 'middle' }

  const title = ws.addRow([doc.productName])
  merge(title.number)
  title.font = { size: 18, bold: true, color: { argb: INK } }
  title.height = 26

  const metaText = `${doc.brandName} · ${doc.containerCode}${doc.quoteRef ? ` · ${doc.quoteRef}` : ''}`
  const meta = ws.addRow([metaText])
  merge(meta.number)
  meta.font = { size: 11, color: { argb: INK } }

  ws.addRow([]) // spacer

  // Column captions for the exhibit tables (bilingual).
  const caption = ws.addRow(['Concepto', 'Concept', 'Valor / Value'])
  caption.font = { bold: true, size: 10, color: { argb: INK } }
  caption.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD_BG } }
    c.border = thinBottom()
  })

  // Live identity numbers not repeated inside the sections (available slots is
  // the one time-sensitive figure worth exhibiting up top).
  addValueRow(ws, 'Cupos disponibles', 'Available slots', doc.slotsAvailable)

  // ── Sections (mirror the print sheet, column-for-column) ───────────────────
  for (const section of doc.techSheet) {
    ws.addRow([]) // spacer between sections
    const bar = ws.addRow([`${section.title} · ${section.titleEn}`])
    merge(bar.number)
    bar.font = { bold: true, size: 11, color: { argb: BAR_INK } }
    bar.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BAR_BG } }
    bar.getCell(1).alignment = { vertical: 'middle' }
    bar.height = 20

    for (const r of section.rows) {
      if (typeof r.num === 'number') {
        addValueRow(ws, r.label, r.labelEn, r.num, r.unit)
      } else {
        addTextRow(ws, r.label, r.labelEn, r.value)
      }
    }
  }

  // ── Wholesale footnote (Directive 2) ───────────────────────────────────────
  ws.addRow([])
  const note = ws.addRow([
    'Venta por contenedor y por asignación de cupos — no se comercializa por unidad. · Sold by container and by slot allocation — not sold per unit.',
  ])
  merge(note.number)
  note.font = { italic: true, size: 9, color: { argb: INK } }
  note.alignment = { wrapText: true, vertical: 'top' }
  note.height = 28

  return wb
}

/** A numeric exhibit row: ES label · EN label · a REAL number (right-aligned,
 *  unit-formatted) so the spreadsheet treats it numerically. */
function addValueRow(
  ws: ExcelJS.Worksheet,
  labelEs: string,
  labelEn: string,
  num: number,
  unit?: 'm³' | 'kg',
): void {
  const row = ws.addRow([labelEs, labelEn, num])
  styleLabelCells(row)
  const cell = row.getCell(3)
  cell.numFmt = numFmtFor(unit)
  cell.alignment = { horizontal: 'right' }
  cell.font = { size: 10, color: { argb: INK } }
  cell.border = thinBottom()
}

/** A text exhibit row for identifier/code values (HS, GTIN) or textual facts. */
function addTextRow(ws: ExcelJS.Worksheet, labelEs: string, labelEn: string, value: string): void {
  const row = ws.addRow([labelEs, labelEn, value])
  styleLabelCells(row)
  const cell = row.getCell(3)
  cell.alignment = { horizontal: 'right' }
  cell.font = { size: 10, color: { argb: INK } }
  cell.border = thinBottom()
}

function styleLabelCells(row: ExcelJS.Row): void {
  const es = row.getCell(1)
  const en = row.getCell(2)
  es.font = { size: 10, color: { argb: INK } }
  en.font = { size: 9, color: { argb: 'FF6B7280' } }
  es.border = thinBottom()
  en.border = thinBottom()
}
