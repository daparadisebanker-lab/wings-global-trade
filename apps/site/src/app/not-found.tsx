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

      {/* Onward routes — keep the dead end from ending the visit */}
      <nav
        aria-label="Continuar navegando"
        className="flex flex-col items-center gap-4 border-t border-warm-white/10 pt-8"
      >
        <Link
          href="/catalogo"
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold hover:text-gold/70 transition-colors duration-200"
        >
          Ver el catálogo completo →
        </Link>
        <Link
          href="/cotizar"
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold hover:text-gold/70 transition-colors duration-200"
        >
          Solicitar una cotización →
        </Link>
        <Link
          href="/mister"
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold hover:text-gold/70 transition-colors duration-200"
        >
          Consultar con Mister →
        </Link>
      </nav>

      <Link
        href="/"
        className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-warm-white/30 hover:text-warm-white/60 transition-colors duration-200"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
