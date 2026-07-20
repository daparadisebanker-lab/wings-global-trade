'use client'

export function PrintBar({ title }: { title: string }) {
  return (
    <div className="csheet-toolbar" data-print-hidden>
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13 }}>{title}</span>
      <button type="button" className="csheet-toolbar-btn" onClick={() => window.print()}>
        Imprimir / Guardar PDF
      </button>
    </div>
  )
}
