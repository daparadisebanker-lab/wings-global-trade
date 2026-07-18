'use client'

// Print/close controls for the quotation document. A thin client island so the
// document itself stays a pure server-rendered artifact. Hidden when printing
// (the toolbar must never appear on the PDF).

export function PrintBar({ quoteNo }: { quoteNo: string | null }) {
  return (
    <div className="qdoc-toolbar" data-print-hidden>
      <span className="qdoc-toolbar-label">{quoteNo ?? 'Cotización · borrador'}</span>
      <button type="button" className="qdoc-toolbar-btn" onClick={() => window.print()}>
        Imprimir / Guardar PDF
      </button>
    </div>
  )
}
