// src/app/error.tsx
// Route-level error boundary — replaces Next's raw "Application error"
// screen. Two error classes SELF-HEAL with a one-shot reload:
//   · ChunkLoadError / failed dynamic import — deployment skew: the open
//     page references chunks purged by a newer deploy (incident 2026-07-11)
//   · DOM NotFoundError — React reconciling externally-mutated nodes
// Everything else gets a branded recovery screen. Reload is guarded per
// pathname in sessionStorage so a persistent crash can never reload-loop.
'use client'

import { useEffect, useState } from 'react'

function isSelfHealable(error: Error): boolean {
  const text = `${error.name} ${error.message}`
  return (
    /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|import\(\) failed/i.test(text) ||
    /NotFoundError|removeChild|insertBefore/i.test(text)
  )
}

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [healing, setHealing] = useState(true)

  useEffect(() => {
    console.error('[route-error]', error)
    const key = `wgt-heal:${window.location.pathname}`
    if (isSelfHealable(error) && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1')
      window.location.reload()
      return
    }
    setHealing(false)
  }, [error])

  // While the one-shot reload is in flight, show nothing jarring.
  if (healing) {
    return <div className="min-h-[60vh] bg-warm-white" aria-busy="true" />
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-warm-white px-6 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-widest-3 text-gold">
        Wings Global Trade
      </p>
      <h1 className="max-w-lg font-display text-display-sm text-navy">
        Algo se interrumpió al cargar esta página
      </h1>
      <p className="max-w-md text-body-md text-navy/60">
        Ya quedó registrado. Puede reintentar ahora — si persiste, escríbanos y lo
        resolvemos de inmediato.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(`wgt-heal:${window.location.pathname}`)
            reset()
          }}
          className="inline-flex h-12 items-center bg-navy px-8 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white transition-colors hover:bg-navy-light"
        >
          Reintentar
        </button>
        <a
          href="https://wa.me/50760250735"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center border border-navy/25 px-6 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors hover:border-navy"
        >
          WhatsApp
        </a>
      </div>
      {error.digest && (
        <p className="font-mono text-[11px] text-navy/35">ref {error.digest}</p>
      )}
    </div>
  )
}
