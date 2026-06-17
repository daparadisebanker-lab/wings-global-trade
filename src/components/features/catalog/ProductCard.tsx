// src/components/features/catalog/ProductCard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Product, Category } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { STAGGER_ITEM } from '@/lib/motion'

interface ProductCardProps {
  product: Product
  category: Category
}

export function ProductCard({ product, category }: ProductCardProps) {
  const specEntries = Object.entries(product.specs).slice(0, 3)
  const image = product.images[0]

  return (
    <motion.article variants={STAGGER_ITEM}>
      <Link
        href={`/catalogo/${category.slug}/${product.slug}`}
        className="group block overflow-hidden rounded-wings-card border border-border-default border-t-2 border-t-transparent bg-surface-card shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-t-gold hover:shadow-card-hover"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EDEAE1]">
          {image ? (
            <Image
              src={image}
              alt={product.name_es}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-sm text-text-muted">
              Sin imagen
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {product.source_markets.map((m) => (
              <Badge key={m} variant="source">
                {m}
              </Badge>
            ))}
          </div>
          <h3 className="font-display text-display-sm font-semibold text-navy line-clamp-2">
            {product.name_es}
          </h3>

          <dl className="mt-3 space-y-1">
            {specEntries.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 font-mono text-mono-sm">
                <dt className="text-text-muted">{k}</dt>
                <dd className="text-text-mono">{v}</dd>
              </div>
            ))}
          </dl>

          <span className="mt-4 inline-block font-body text-sm font-medium text-gold transition-colors group-hover:text-gold-hover">
            Ver especificaciones →
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
