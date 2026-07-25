'use client'

// Print / save-PDF controls for the Torre cotización document. A thin client
// island so the document itself stays a pure server-rendered artifact; hidden
// when printing (the toolbar must never appear on the PDF).

export function PrintBar({ label, printLabel }: { label: string; printLabel: string }) {
  // Deferred a tick so the tap's click settles before the print dialog steals
  // focus (iOS Safari otherwise intermittently drops an inline print()); guarded
  // because some in-app webviews expose no window.print and calling it throws.
  const handlePrint = () => {
    if (typeof window === 'undefined' || typeof window.print !== 'function') return
    window.setTimeout(() => window.print(), 0)
  }

  return (
    <div className="tcot-toolbar" data-print-hidden>
      <span className="tcot-toolbar-label">{label}</span>
      <button type="button" className="tcot-toolbar-btn" onClick={handlePrint}>
        {printLabel}
      </button>
    </div>
  )
}
