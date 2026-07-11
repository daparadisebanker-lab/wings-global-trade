// src/app/global-error.tsx
// Last-resort boundary (root layout itself crashed) — must render its own
// <html>/<body>. Same one-shot self-heal for skew/reconciliation errors;
// inline styles only, since globals.css may not have loaded.
'use client'

import { useEffect, useState } from 'react'

function isSelfHealable(error: Error): boolean {
  const text = `${error.name} ${error.message}`
  return (
    /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|import\(\) failed/i.test(text) ||
    /NotFoundError|removeChild|insertBefore/i.test(text)
  )
}

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  const [healing, setHealing] = useState(true)

  useEffect(() => {
    console.error('[global-error]', error)
    const key = 'wgt-heal:global'
    if (isSelfHealable(error) && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1')
      window.location.reload()
      return
    }
    setHealing(false)
  }, [error])

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          background: '#F8F6F0',
          color: '#001E50',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: 24,
        }}
      >
        {!healing && (
          <>
            <p style={{ letterSpacing: '0.18em', fontSize: 11, textTransform: 'uppercase', color: '#C4933F', fontFamily: 'monospace' }}>
              Wings Global Trade
            </p>
            <h1 style={{ fontSize: 26, maxWidth: 520, lineHeight: 1.2, margin: 0 }}>
              Algo se interrumpió al cargar la página
            </h1>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('wgt-heal:global')
                window.location.reload()
              }}
              style={{
                padding: '14px 32px',
                background: '#001E50',
                color: '#F8F6F0',
                border: 0,
                fontFamily: 'monospace',
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
            {error.digest && (
              <p style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.4 }}>ref {error.digest}</p>
            )}
          </>
        )}
      </body>
    </html>
  )
}
