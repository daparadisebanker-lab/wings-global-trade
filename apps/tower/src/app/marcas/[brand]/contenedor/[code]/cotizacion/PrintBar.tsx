'use client'

// Print/close controls for the RB container quote. A thin client island so the
// document itself stays a pure server-rendered artifact. Hidden when printing
// (the toolbar must never appear on the PDF). Mirrors the Ficha/Cotización PrintBar.

export function PrintBar({ quoteRef }: { quoteRef: string | null }) {
  return (
    <div className="rbqdoc-toolbar" data-print-hidden>
      <span className="rbqdoc-toolbar-label">{quoteRef ?? 'Cotización de contenedor · borrador'}</span>
      <button type="button" className="rbqdoc-toolbar-btn" onClick={() => window.print()}>
        Imprimir / Guardar PDF
      </button>
    </div>
  )
}
