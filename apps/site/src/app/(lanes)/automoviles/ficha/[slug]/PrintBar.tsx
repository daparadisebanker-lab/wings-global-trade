'use client'

// Print/download controls for the ficha técnica — mirrors TOWER's PrintBar
// exactly (apps/tower/src/app/ficha/[id]/document/PrintBar.tsx): a thin
// client island so the document itself stays server-rendered, hidden on
// print via [data-print-hidden] so the toolbar never appears on the PDF.
import Link from 'next/link'

export function PrintBar({ reference, backHref }: { reference: string; backHref: string }) {
  return (
    <div className="fdoc-toolbar" data-print-hidden>
      <Link href={backHref} className="fdoc-toolbar-back">
        ← Volver
      </Link>
      <span className="fdoc-toolbar-label">{reference}</span>
      <button type="button" className="fdoc-toolbar-btn" onClick={() => window.print()}>
        Imprimir / Guardar PDF
      </button>
    </div>
  )
}
