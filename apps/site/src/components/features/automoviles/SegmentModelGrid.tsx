// src/components/features/automoviles/SegmentModelGrid.tsx
//
// The segment page's cross-brand model grid — "same card system as brand
// pages, filterable by brand instead" (rebuild brief §3). Mirrors
// BrandModelGrid's shape (shared VehicleCard, shared FilterBar, same
// AnimatePresence settle) with the filter axis flipped: brand instead of
// body type, since a segment page already fixes the body type.
'use client'

import { Suspense, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Product } from '@/types/database'
import { getOemBrand, getOemBrandByName } from '@/lib/automoviles/oem-brands'
import { segmentSlug as toSegmentSlug } from '@/lib/automoviles/segments'
import { pluralizeCount } from '@/lib/pluralize'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { VehicleSegmentSlug } from './VehicleTypeIcon'
import { VehicleCard } from './VehicleCard'
import { FilterBar, useFilterParam } from './FilterBar'

const EASE_SETTLE = [0.22, 1, 0.36, 1] as const

interface SegmentModelGridProps {
  products: Product[]
  segmentSlugValue: VehicleSegmentSlug
}

function SegmentModelGridInner({ products, segmentSlugValue }: SegmentModelGridProps) {
  const activeBrand = useFilterParam('marca')
  const reduced = useReducedMotion()

  const brandCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) {
      const raw = p.filter_attrs?.brand
      const brandName = typeof raw === 'string' ? raw : undefined
      const oem = brandName ? getOemBrandByName(brandName) : undefined
      if (oem) counts.set(oem.slug, (counts.get(oem.slug) ?? 0) + 1)
    }
    return counts
  }, [products])

  const filtered = activeBrand
    ? products.filter((p) => {
        const raw = p.filter_attrs?.brand
        const brandName = typeof raw === 'string' ? raw : undefined
        return brandName ? getOemBrandByName(brandName)?.slug === activeBrand : false
      })
    : products

  return (
    <div>
      {brandCounts.size > 1 && (
        <div className="sticky top-[6.5rem] z-10 -mx-5 border-b border-[color:var(--ink-decoration)] bg-[color:var(--surface-0)]/95 px-5 py-4 backdrop-blur md:top-[7rem] md:-mx-8 md:px-8">
          <FilterBar
            ariaLabel="Filtrar por marca"
            paramName="marca"
            totalLabel="Todas"
            totalCount={products.length}
            options={[...brandCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([slug, count]) => ({ slug, label: getOemBrand(slug)?.name ?? slug, count }))}
          />
        </div>
      )}

      <motion.div layout className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((p, i) => {
            const rawBrand = p.filter_attrs?.brand
            const brandName = typeof rawBrand === 'string' ? rawBrand : undefined
            const oem = brandName ? getOemBrandByName(brandName) : undefined
            return (
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
                  dataOem={oem?.slug}
                  segment={segmentSlugValue}
                  brandLabel={oem?.name ?? brandName}
                  title={oem ? p.name_es.replace(`${oem.name} `, '') : p.name_es}
                  priority={i === 0}
                  specs={(['Motor', 'Transmisión', 'Plazas'] as const)
                    .filter((key) => p.specs?.[key])
                    .map((key) => ({ label: key, value: p.specs[key] }))}
                  versionsLabel={pluralizeCount(p.models?.length ?? 0, 'versión', 'versiones')}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="mt-10 text-body-md text-[color:var(--ink-decoration)]">
          Ninguna marca activa en este segmento con ese filtro por el momento.
        </p>
      )}
    </div>
  )
}

export function SegmentModelGrid(props: SegmentModelGridProps) {
  return (
    <Suspense fallback={<div className="mt-8 min-h-[400px]" aria-hidden />}>
      <SegmentModelGridInner {...props} />
    </Suspense>
  )
}
