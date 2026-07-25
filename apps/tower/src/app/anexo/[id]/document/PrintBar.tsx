'use client'

// Print/close controls for the anexo. A thin client island so the document stays a
// pure server-rendered artifact. Hidden when printing.
export function PrintBar({ anexoOf }: { anexoOf: string | null }) {
  const handlePrint = () => {
    if (typeof window === 'undefined' || typeof window.print !== 'function') return
    window.setTimeout(() => window.print(), 0)
  }
  return (
    <div className="adoc-toolbar" data-print-hidden>
      <span className="adoc-toolbar-label">{anexoOf ? `Anexo · ${anexoOf}` : 'Anexo · borrador'}</span>
      <button type="button" className="adoc-toolbar-btn" onClick={handlePrint}>
        Imprimir / Guardar PDF
      </button>
    </div>
  )
}
