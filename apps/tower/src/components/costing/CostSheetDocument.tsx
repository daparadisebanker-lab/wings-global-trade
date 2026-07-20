// Printable SUNAT cost sheet (peru-costing Wave 6.3, PDF path). Pure
// presentational, light surface — renders a saved calculation's inputs + full
// cascade for browser print-to-PDF. Uses the shared costSheetRows so the PDF and
// the XLSX export never diverge.
import type { ImportInputs, ImportResult } from '@/lib/costing/types'
import { costSheetRows } from './export'
import './cost-sheet.css'

function money(v: string | number): string {
  if (typeof v === 'number') return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return v
}

export function CostSheetDocument({
  inputs,
  result,
  label,
  createdAt,
}: {
  inputs: ImportInputs
  result: ImportResult
  label?: string | null
  createdAt?: string
}) {
  const rows = costSheetRows(inputs, result)
  const title = label || inputs.productName || inputs.brand || 'Costo de importación'

  return (
    <article className="csheet">
      <h1 className="csheet-title">Costo de importación</h1>
      <p className="csheet-sub">
        {title}
        {createdAt ? ` · ${createdAt.slice(0, 10)}` : ''} · Perú (SUNAT)
      </p>
      <div className="csheet-rule" aria-hidden />

      <table className="csheet-table">
        <tbody>
          {rows.map(([k, v], i) => {
            if (k === '—') return <tr key={i} className="csheet-spacer"><td colSpan={2} /></tr>
            const isSection = v === '' && k === k.toUpperCase()
            if (isSection) {
              return (
                <tr key={i} className="csheet-section">
                  <td colSpan={2}>{k}</td>
                </tr>
              )
            }
            return (
              <tr key={i}>
                <td>{k}</td>
                <td className="csheet-val">{money(v)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="csheet-foot">
        Wings Global Trade · Documento interno de costeo. Cifras en USD salvo indicación. Tipo de cambio{' '}
        {inputs.exchangeRate} PEN/USD.
      </p>
    </article>
  )
}
