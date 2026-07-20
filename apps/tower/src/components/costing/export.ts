// src/components/costing/export.ts
// Single cost-sheet export (peru-costing Wave 6.3). Client-side XLSX of a
// computed SUNAT sheet — the data-faithful artifact ops archives / re-exports
// from history. jsPDF-free: a client PDF is available via the print route
// (/costing/[id]/sheet → browser print), consistent with the quotation document.
import type { ImportInputs, ImportResult } from '@/lib/costing/types'

function slug(s: string): string {
  return (s || 'costeo').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'costeo'
}

/** Build the section rows shared by the XLSX export and the print sheet. */
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
    ['Margen neto de caja', result.margenNetoCaja],
    ['Margen neto de caja %', `${(result.margenNetoCajaPct * 100).toFixed(1)}%`],
  ]
}

export async function exportCostSheetXlsx(
  inputs: ImportInputs,
  result: ImportResult,
  label?: string | null,
): Promise<void> {
  const XLSX = await import('xlsx')
  const header: [string, string | number][] = [['Costo de importación (Perú)', label || inputs.productName || ''], ['—', '']]
  const ws = XLSX.utils.aoa_to_sheet([...header, ...costSheetRows(inputs, result)])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Costeo')
  XLSX.writeFile(wb, `wings-costeo-${slug(label || inputs.productName)}.xlsx`)
}
