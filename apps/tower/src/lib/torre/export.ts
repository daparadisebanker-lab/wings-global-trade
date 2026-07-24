// src/lib/torre/export.ts
// Exporters for Torre artifacts. The hoja_costos reuses the existing SUNAT XLSX
// exporter (one source of truth for the cost cascade); the cotizacion gets its own
// client-ready sheet. Row builders are PURE (unit-tested); the XLSX write is a thin
// client-only wrapper (dynamic import, like the costing module). PDF export of the
// cotizacion is browser print-to-PDF over the rendered card (the review UI wires it).
import { exportCostSheetXlsx } from '@/components/costing/export'
import type { ImportInputs, ImportResult } from '@/lib/costing/types'
import { CONFIDENCE_LABEL, type CotizacionPayload, type HojaCostosPayload } from './artifacts'

/** PURE: the client-facing cotizacion as a sheet (rows), in the client's language. */
export function cotizacionAoa(payload: CotizacionPayload, locale: 'es' | 'en' = 'es'): (string | number)[][] {
  const L = locale
  const rows: (string | number)[][] = [
    [L === 'en' ? 'Quotation' : 'Cotización', payload.machine.productName || ''],
    [L === 'en' ? 'Client' : 'Cliente', payload.clientName ?? ''],
    ['Lane', payload.laneCode ?? ''],
    [L === 'en' ? 'Valid until' : 'Válida hasta', payload.validityUntil],
    [L === 'en' ? 'Currency' : 'Moneda', payload.currency],
    [L === 'en' ? 'Quantity' : 'Cantidad', payload.quantity],
    ['', ''],
    [
      'Incoterm',
      L === 'en' ? 'Landed cost' : 'Costo puesto',
      L === 'en' ? 'Unit price' : 'Precio unitario',
      L === 'en' ? 'Confidence' : 'Confianza',
    ],
  ]
  for (const s of payload.scenarios) {
    rows.push([
      s.incoterm,
      s.landedCostMinor === null ? '—' : s.landedCostMinor / 100,
      s.unitPriceMinor === null ? '—' : s.unitPriceMinor / 100,
      CONFIDENCE_LABEL[s.confidence][L],
    ])
  }
  rows.push(['', ''])
  rows.push([L === 'en' ? 'Terms' : 'Términos', ''])
  for (const term of payload.terms) rows.push([term])
  return rows
}

function slug(s: string): string {
  return (s || 'cotizacion').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'cotizacion'
}

/** Client-only: write the cotizacion as an .xlsx. */
export async function exportCotizacionXlsx(payload: CotizacionPayload, locale: 'es' | 'en' = 'es'): Promise<void> {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.aoa_to_sheet(cotizacionAoa(payload, locale))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, locale === 'en' ? 'Quotation' : 'Cotización')
  XLSX.writeFile(wb, `wings-cotizacion-${slug(payload.machine.productName)}.xlsx`)
}

/** Client-only: write the internal hoja_costos as an .xlsx (reuses the SUNAT exporter). */
export async function exportHojaCostosXlsx(payload: HojaCostosPayload): Promise<void> {
  const inputs = payload.inputs as unknown as ImportInputs
  const result = payload.result as unknown as ImportResult
  if (typeof result.landedCost !== 'number') return // nothing computed (blocked) — nothing to export
  await exportCostSheetXlsx(inputs, result, payload.title)
}
