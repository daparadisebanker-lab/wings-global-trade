// src/app/not-found.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 — Wings Global Trade',
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#000C1F] px-6 text-center">
      <div className="wings-rule mx-auto mb-12" />
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-warm-white/30 mb-6">
        404
      </p>
      <h1 className="font-display text-display-lg font-light text-warm-white mb-4">
        Esta página no existe
      </h1>
      <p className="font-body text-warm-white/50 mb-10 max-w-sm">
        La ruta que buscas no está en nuestro catálogo.
      </p>
      <Link
        href="/"
        className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold hover:text-gold/70 transition-colors duration-200"
      >
        Volver al inicio →
      </Link>
    </main>
  )
}
