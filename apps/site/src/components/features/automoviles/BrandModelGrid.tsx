// src/components/features/automoviles/BrandModelGrid.tsx
//
// The brand page's model grid — the vehicle-type filter bar (now the shared
// FilterBar: real tablist ARIA, arrow-key nav, URL-synced so a filtered
// view is shareable) plus the shared VehicleCard, two per row on desktop
// (2026-09 toyota.com-benchmark rebuild — fewer, larger cards read as a
// showroom; three-per-row read as a parts catalogue). Client island so it
// can own the filter's interactive state; the data fetch stays server-side
// in the page, which only ever hands this component products it's already
// allowed to show.
'use client'

import { Suspense, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Product } from '@/types/database'
import { lane } from '@wings/liveries/automoviles/lane.config'
import { segmentSlug } from '@/lib/automoviles/segments'
import { pluralizeCount } from '@/lib/pluralize'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { VehicleTypeIcon, type VehicleSegmentSlug } from './VehicleTypeIcon'
import { VehicleCard } from './VehicleCard'
import { FilterBar, useFilterParam } from './FilterBar'

const EASE_SETTLE = [0.22, 1, 0.36, 1] as const
const SEGMENT_LABEL = new Map<string, string>(lane.taxonomy.map((s) => [s.slug, s.name.es]))

interface BrandModelGridProps {
  products: Product[]
  brandName: string
}

function BrandModelGridInner({ products, brandName }: BrandModelGridProps) {
  const activeSegment = useFilterParam('segmento')
  const reduced = useReducedMotion()

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
      {segmentCounts.size > 1 && (
        <div className="sticky top-[6.5rem] z-10 -mx-5 border-b border-[color:var(--ink-decoration)] bg-[color:var(--surface-0)]/95 px-5 py-4 backdrop-blur md:top-[7rem] md:-mx-8 md:px-8">
          <FilterBar
            ariaLabel="Filtrar por tipo de carrocería"
            paramName="segmento"
            totalLabel="Todos"
            totalCount={products.length}
            options={[...segmentCounts.entries()].map(([slug, count]) => ({
              slug,
              label: SEGMENT_LABEL.get(slug) ?? slug,
              count,
              icon: (
                <VehicleTypeIcon
                  segment={slug as VehicleSegmentSlug}
                  bodyColor="currentColor"
                  accentColor="var(--oem-accent,_var(--accent-ink))"
                  className="h-6 w-10 shrink-0"
                />
              ),
            }))}
          />
        </div>
      )}

      <motion.div layout className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={reduced ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: EASE_SETTLE }}
            >
              <VehicleCard
                href={`/automoviles/ficha/${p.slug}`}
                imageUrl={p.images?.[0]}
                imageAlt={`${p.name_es} — ${p.specs?.['Segmento'] ? `${p.specs['Segmento']}, ` : ''}vista tres cuartos`}
                segment={(p.specs?.['Segmento'] ? segmentSlug(p.specs['Segmento']) : undefined) as
                  | VehicleSegmentSlug
                  | undefined}
                title={p.name_es.replace(`${brandName} `, '')}
                priority={i === 0}
                specs={(['Segmento', 'Motor', 'Transmisión', 'Plazas'] as const)
                  .filter((key) => p.specs?.[key])
                  .map((key) => ({ label: key, value: p.specs[key] }))}
                versionsLabel={pluralizeCount(p.models?.length ?? 0, 'versión', 'versiones')}
              />
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

export function BrandModelGrid(props: BrandModelGridProps) {
  // useSearchParams (inside FilterBar/useFilterParam) requires a Suspense
  // boundary in the App Router — this is that boundary, one per grid
  // instance rather than pushed up to the page.
  return (
    <Suspense fallback={<div className="mt-8 min-h-[400px]" aria-hidden />}>
      <BrandModelGridInner {...props} />
    </Suspense>
  )
}
