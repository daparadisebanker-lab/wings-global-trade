// src/components/features/catalog/ProductGrid.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Product, Category } from '@/types/database'
import { ProductCard } from '@/components/features/catalog/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { STAGGER_CONTAINER_FAST, VIEWPORT_ONCE } from '@/lib/motion'

interface ProductGridProps {
  products: Product[]
  category: Category
  isLoading?: boolean
}

const BRAND_ORDER = ['New Holland', 'John Deere', 'Massey Ferguson', 'Kubota', 'KAMA']

function getBrand(slug: string): string {
  if (slug.startsWith('new-holland-')) return 'New Holland'
  if (slug.startsWith('john-deere-')) return 'John Deere'
  if (slug.startsWith('massey-ferguson-')) return 'Massey Ferguson'
  if (slug.startsWith('kubota-')) return 'Kubota'
  if (slug.startsWith('kama-')) return 'KAMA'
  return ''
}

function groupByBrand(products: Product[]): Map<string, Product[]> | null {
  const brands = new Set(products.map((p) => getBrand(p.slug)).filter(Boolean))
  if (brands.size < 2) return null
  const map = new Map<string, Product[]>()
  for (const p of products) {
    const brand = getBrand(p.slug) || 'Otros'
    if (!map.has(brand)) map.set(brand, [])
    map.get(brand)!.push(p)
  }
  return map
}

export function ProductGrid({ products, category, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-wings-card border border-border-default">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-2 p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="rounded-wings-card border border-border-default bg-surface-card p-10 text-center">
        <p className="font-display text-2xl text-navy">
          No tenemos productos en esta categoría todavía.
        </p>
        <p className="mt-2 font-body text-base text-text-muted">
          ¿Tienes algo específico en mente? Habla con Mister — importa cualquier producto desde China.
        </p>
        <Link href="/mister" className="mt-6 inline-block">
          <Button>Hablar con Mister</Button>
        </Link>
      </div>
    )
  }

  const grouped = groupByBrand(products)

  if (!grouped) {
    return (
      <motion.div
        variants={STAGGER_CONTAINER_FAST}
        initial="initial"
        whileInView="animate"
        viewport={VIEWPORT_ONCE}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} category={category} />
        ))}
      </motion.div>
    )
  }

  const sortedBrands = [...grouped.keys()].sort((a, b) => {
    const ai = BRAND_ORDER.indexOf(a)
    const bi = BRAND_ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return (
    <div className="space-y-14">
      {sortedBrands.map((brand) => {
        const brandProducts = grouped.get(brand)!
        return (
          <section key={brand}>
            <div className="mb-6 flex items-baseline gap-3 border-b border-border-default pb-3">
              <h2 className="font-display text-display-sm font-semibold text-navy">{brand}</h2>
              <span className="font-mono text-xs text-text-muted">{brandProducts.length} modelos</span>
            </div>
            <motion.div
              variants={STAGGER_CONTAINER_FAST}
              initial="initial"
              whileInView="animate"
              viewport={VIEWPORT_ONCE}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {brandProducts.map((p) => (
                <ProductCard key={p.id} product={p} category={category} />
              ))}
            </motion.div>
          </section>
        )
      })}
    </div>
  )
}
