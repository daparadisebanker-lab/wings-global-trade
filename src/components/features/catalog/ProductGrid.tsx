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
