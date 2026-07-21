'use client'

// Print/close controls for the proforma invoice. A thin client island so the
// document itself stays a pure server-rendered artifact. Hidden when printing
// (the toolbar must never appear on the PDF).

export function PrintBar({ proformaNo }: { proformaNo: string | null }) {
  return (
    <div className="pdoc-toolbar" data-print-hidden>
      <span className="pdoc-toolbar-label">{proformaNo ?? 'Proforma · borrador'}</span>
      <button type="button" className="pdoc-toolbar-btn" onClick={() => window.print()}>
        Imprimir / Guardar PDF
      </button>
    </div>
  )
}
