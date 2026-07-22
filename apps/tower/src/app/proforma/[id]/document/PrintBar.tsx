'use client'

// Print/close controls for the proforma invoice. A thin client island so the
// document itself stays a pure server-rendered artifact. Hidden when printing
// (the toolbar must never appear on the PDF).

export function PrintBar({ proformaNo }: { proformaNo: string | null }) {
  // Deferred to the next tick so the tap's click has fully settled before the
  // print dialog steals focus — iOS Safari otherwise intermittently drops a
  // print() invoked inline in the handler. Guarded because a handful of in-app
  // webviews expose no window.print, and calling it there throws.
  const handlePrint = () => {
    if (typeof window === 'undefined' || typeof window.print !== 'function') return
    window.setTimeout(() => window.print(), 0)
  }

  return (
    <div className="pdoc-toolbar" data-print-hidden>
      <span className="pdoc-toolbar-label">{proformaNo ?? 'Proforma · borrador'}</span>
      <button type="button" className="pdoc-toolbar-btn" onClick={handlePrint}>
        Imprimir / Guardar PDF
      </button>
    </div>
  )
}
