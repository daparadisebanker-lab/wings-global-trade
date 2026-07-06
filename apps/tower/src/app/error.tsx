'use client'

import { useEffect } from 'react'

/**
 * Global error boundary. Raw errors never surface to the operator (API_MAP /
 * ARCHITECTURE): the message is logged for the console, the screen shows a
 * contained instrument-panel failure with a retry.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[tower]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="font-mono text-label uppercase tracking-[0.15em] text-negative">Error</span>
      <h1 className="font-ui text-t3 text-ink-primary">Algo falló / Something went wrong</h1>
      <button
        type="button"
        onClick={reset}
        className="rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
      >
        Reintentar / Retry
      </button>
    </div>
  )
}
