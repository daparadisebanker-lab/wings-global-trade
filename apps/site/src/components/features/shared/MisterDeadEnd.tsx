// src/components/features/shared/MisterDeadEnd.tsx
// Reusable dead-end section for catalog zero-states and category bottoms.
// Renders as a contained section — NOT a full page.

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export interface MisterDeadEndProps {
  context?: 'no-results' | 'category-bottom' | 'product-not-found' | 'custom'
  customMessage?: string
}

const HEADINGS: Record<NonNullable<MisterDeadEndProps['context']>, string> = {
  'no-results': 'No encontramos lo que buscas. Mister puede importarlo.',
  'category-bottom': '¿Necesitas especificaciones distintas?',
  'product-not-found': 'Este modelo no está en catálogo. Podemos importarlo.',
  custom: '',
}

export function MisterDeadEnd({ context = 'no-results', customMessage }: MisterDeadEndProps) {
  const heading =
    context === 'custom' ? (customMessage ?? HEADINGS['no-results']) : HEADINGS[context]

  return (
    <section aria-label="Consulta con Mister">
      {/* Thin gold rule */}
      <div className="h-px bg-gold/30" />

      <div className="rounded-b-wings-card border border-t-0 border-border-default bg-white px-8 py-10">
        {/* Eyebrow */}
        <p className="font-mono text-[10px] uppercase tracking-widest-3 text-gold/60">
          MISTER · ASISTENTE IA
        </p>

        {/* Heading */}
        <h3 className="mt-2 font-display text-display-sm font-light text-navy">{heading}</h3>

        {/* Body */}
        <p className="mt-3 max-w-xl font-body text-body-md text-text-muted">
          Mister calcula el CIF exacto desde China, gestiona la zona franca y coordina la entrega.
          Sin llamadas previas.
        </p>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href="/mister">
            <Button variant="primary" size="md">
              Iniciar consulta técnica →
            </Button>
          </Link>
          <Link
            href="/contacto"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-navy/60 transition-colors hover:text-navy"
          >
            Contacto directo
          </Link>
        </div>
      </div>
    </section>
  )
}
