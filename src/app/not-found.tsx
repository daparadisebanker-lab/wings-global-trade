// src/app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-navy px-6 pt-16 text-center text-warm-white">
      <p className="font-mono text-label-sm uppercase tracking-widest-2 text-gold">Error 404</p>
      <h1 className="mt-3 font-display text-display-lg font-semibold">Página no encontrada</h1>
      <p className="mt-3 max-w-md font-body text-body-md text-text-muted-inverse">
        La página que buscas no existe o fue movida. Vuelve al catálogo o usa el Motor Accio para
        una búsqueda personalizada.
      </p>
      {/* Per ia-architect.md §Internal Linking — 404 → /catalogo + /accio */}
      <div className="mt-8 flex gap-3">
        <Link href="/catalogo">
          <Button>Ver catálogo</Button>
        </Link>
        <Link href="/accio">
          <Button variant="secondary">Calcular mi importación</Button>
        </Link>
      </div>
    </div>
  )
}
