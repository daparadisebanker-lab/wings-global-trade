'use client'

// Print/close controls for the ficha técnica. A thin client island so the
// document itself stays a pure server-rendered artifact. Hidden when printing
// (the toolbar must never appear on the PDF).

export function PrintBar({ fichaNo }: { fichaNo: string | null }) {
  return (
    <div className="fdoc-toolbar" data-print-hidden>
      <span className="fdoc-toolbar-label">{fichaNo ?? 'Ficha técnica · borrador'}</span>
      <button type="button" className="fdoc-toolbar-btn" onClick={() => window.print()}>
        Imprimir / Guardar PDF
      </button>
    </div>
  )
}
