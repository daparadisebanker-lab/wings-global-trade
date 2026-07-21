'use client'

// Print/close controls for the RB container quote. A thin client island so the
// document itself stays a pure server-rendered artifact. Hidden when printing
// (the toolbar must never appear on the PDF). Mirrors the Ficha/Cotización PrintBar.
//
// `xlsxHref` points at the sibling tech-sheet.xlsx route — the Excel twin of the
// technical annex. It carries the SAME query string, so the workbook's Asignación
// section matches the on-screen document. Bilingual, wholesale (no cart language).

export function PrintBar({ quoteRef, xlsxHref }: { quoteRef: string | null; xlsxHref: string }) {
  return (
    <div className="rbqdoc-toolbar" data-print-hidden>
      <span className="rbqdoc-toolbar-label">{quoteRef ?? 'Cotización de contenedor · borrador'}</span>
      <div className="rbqdoc-toolbar-actions">
        <a className="rbqdoc-toolbar-link" href={xlsxHref} download>
          Ficha técnica (Excel) · Data sheet
        </a>
        <button type="button" className="rbqdoc-toolbar-btn" onClick={() => window.print()}>
          Imprimir / Guardar PDF
        </button>
      </div>
    </div>
  )
}
