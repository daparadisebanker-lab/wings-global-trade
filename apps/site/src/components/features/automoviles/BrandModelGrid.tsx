// src/components/features/automoviles/BrandModelGrid.tsx
//
// The brand page's model grid, extracted into its own client island so it
// can carry the vehicle-type filter bar + filtration animation — the data
// fetch stays server-side in the page; this component only ever receives
// products it's already allowed to show. Filter chips are built from what
// THIS brand actually sells (never a chip for a body type the brand has
// zero models in), each carrying its own bi-color VehicleTypeIcon in the
// brand's own --oem-accent — the same "brand owns the accent role" pattern
// every other card in this lane already uses.
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { Product } from '@/types/database'
import { lane } from '@wings/liveries/automoviles/lane.config'
import { segmentSlug } from '@/lib/automoviles/segments'
import { VehicleTypeIcon, type VehicleSegmentSlug } from './VehicleTypeIcon'
import { MotionCard } from './MotionCard'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const EASE_SETTLE = [0.22, 1, 0.36, 1] as const
const SEGMENT_LABEL = new Map<string, string>(lane.taxonomy.map((s) => [s.slug, s.name.es]))

interface BrandModelGridProps {
  products: Product[]
  brandName: string
}

export function BrandModelGrid({ products, brandName }: BrandModelGridProps) {
  const reduced = useReducedMotion()
  const [activeSegment, setActiveSegment] = useState<string | null>(null)

  const segmentCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) {
      const raw = p.specs?.['Segmento']
      const slug = raw ? segmentSlug(raw) : null
      if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
    return counts
  }, [products])

  if (products.length === 0) {
    return (
      <p className="mt-10 text-body-md text-[color:var(--ink-decoration)]">
        Sin líneas activas en catálogo por el momento. Escríbanos — Wings importa bajo pedido
        más allá del catálogo publicado.
      </p>
    )
  }

  const filtered = activeSegment
    ? products.filter((p) => {
        const raw = p.specs?.['Segmento']
        return raw ? segmentSlug(raw) === activeSegment : false
      })
    : products

  return (
    <div>
      {/* Vehicle-type selector — only appears once there's more than one
          body type to actually filter between; a single-segment brand has
          nothing to select. */}
      {segmentCounts.size > 1 && (
        <div
          role="group"
          aria-label="Filtrar por tipo de carrocería"
          className="mt-10 flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setActiveSegment(null)}
            aria-pressed={activeSegment === null}
            className={[
              'rounded-[var(--radius-control)] border px-4 py-2 font-mono text-[11px] uppercase tracking-widest-2 transition-colors',
              activeSegment === null
                ? 'border-[color:var(--oem-accent)] bg-[color:var(--oem-accent-soft,transparent)] text-[color:var(--oem-accent)]'
                : 'border-[color:var(--ink-decoration)] text-[color:var(--ink-secondary)] hover:border-[color:var(--oem-accent,_var(--accent-border))]',
            ].join(' ')}
          >
            Todos ({products.length})
          </button>
          {[...segmentCounts.entries()].map(([slug, count]) => (
            <button
              key={slug}
              type="button"
              onClick={() => setActiveSegment((cur) => (cur === slug ? null : slug))}
              aria-pressed={activeSegment === slug}
              className={[
                'flex items-center gap-2 rounded-[var(--radius-control)] border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest-2 transition-colors',
                activeSegment === slug
                  ? 'border-[color:var(--oem-accent)] bg-[color:var(--oem-accent-soft,transparent)] text-[color:var(--oem-accent)]'
                  : 'border-[color:var(--ink-decoration)] text-[color:var(--ink-secondary)] hover:border-[color:var(--oem-accent,_var(--accent-border))]',
              ].join(' ')}
            >
              <VehicleTypeIcon
                segment={slug as VehicleSegmentSlug}
                bodyColor="currentColor"
                accentColor="var(--oem-accent,_var(--accent-ink))"
                className="h-6 w-10 shrink-0"
              />
              <span>
                {SEGMENT_LABEL.get(slug) ?? slug} ({count})
              </span>
            </button>
          ))}
        </div>
      )}

      <motion.div layout className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={reduced ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: EASE_SETTLE }}
            >
              <MotionCard
                imageUrl={p.images?.[1]}
                imageAlt={p.name_es}
                className="border border-[color:var(--ink-decoration)] bg-[color:var(--surface-1)] p-6"
              >
                <p className="font-display text-xl text-[color:var(--ink-primary)]">
                  {p.name_es.replace(`${brandName} `, '')}
                </p>
                <dl className="mt-3 space-y-1 font-mono text-[12px] text-[color:var(--ink-secondary)]">
                  {p.specs?.['Segmento'] && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-[color:var(--ink-decoration)]">Segmento</dt>
                      <dd className="text-right">
                        {segmentSlug(p.specs['Segmento']) ? (
                          <Link
                            href={`/automoviles/${segmentSlug(p.specs['Segmento'])}`}
                            className="underline decoration-[color:var(--ink-decoration)] underline-offset-2 transition-colors hover:text-[color:var(--oem-accent)]"
                          >
                            {p.specs['Segmento']}
                          </Link>
                        ) : (
                          p.specs['Segmento']
                        )}
                      </dd>
                    </div>
                  )}
                  {p.specs?.['Motor'] && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-[color:var(--ink-decoration)]">Motor</dt>
                      <dd className="text-right">{p.specs['Motor']}</dd>
                    </div>
                  )}
                  {p.specs?.['Transmisión'] && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-[color:var(--ink-decoration)]">Transmisión</dt>
                      <dd className="text-right">{p.specs['Transmisión']}</dd>
                    </div>
                  )}
                  {p.specs?.['Plazas'] && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-[color:var(--ink-decoration)]">Plazas</dt>
                      <dd className="text-right">{p.specs['Plazas']}</dd>
                    </div>
                  )}
                </dl>
                <div aria-hidden className="mt-4 h-px w-full bg-[color:var(--ink-decoration)]" />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase text-[color:var(--oem-accent)]">
                    {p.models?.length ?? 0} {p.models?.length === 1 ? 'versión' : 'versiones'}
                  </p>
                  <Link
                    href={`/automoviles/ficha/${p.slug}`}
                    className="font-mono text-[10px] uppercase tracking-widest-2 text-[color:var(--ink-secondary)] transition-colors hover:text-[color:var(--ink-primary)]"
                  >
                    Ficha técnica ↓
                  </Link>
                </div>
              </MotionCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="mt-10 text-body-md text-[color:var(--ink-decoration)]">
          {brandName} no tiene modelos en este segmento por el momento.
        </p>
      )}
    </div>
  )
}
