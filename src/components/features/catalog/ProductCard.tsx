// src/components/features/catalog/ProductCard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Product, Category } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { STAGGER_ITEM } from '@/lib/motion'
import { useComparison } from '@/hooks/useComparison'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  category: Category
}

export function ProductCard({ product, category }: ProductCardProps) {
  const specEntries = Object.entries(product.specs).slice(0, 3)
  const image = product.images[0]

  const { add, remove, isInComparison, isFull } = useComparison()
  const inComparison = isInComparison(product.id)
  const isDisabled = isFull && !inComparison

  function handleCompareToggle(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    if (inComparison) {
      remove(product.id)
    } else if (!isFull) {
      add({
        id: product.id,
        name_es: product.name_es,
        slug: product.slug,
        category_slug: category.slug,
        image: product.images[0] ?? '',
        specs: product.specs as Record<string, unknown>,
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      variants={STAGGER_ITEM}
    >
      <Link href={`/catalogo/${category.slug}/${product.slug}`} className="block">
        <motion.article
          whileHover={{ y: -4, boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)' }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="group relative flex flex-col bg-white border border-[rgba(0,30,80,0.07)] overflow-hidden cursor-pointer"
        >
          {/* Image area */}
          <div className="relative aspect-[4/3] overflow-hidden bg-[#F8F6F0]">
            {image ? (
              <Image
                src={image}
                alt={product.name_es}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-sm text-text-muted">
                Sin imagen
              </div>
            )}

            {/* Source market badges — top-left */}
            {product.source_markets.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                {product.source_markets.map((m) => (
                  <Badge key={m} variant="source">
                    {m}
                  </Badge>
                ))}
              </div>
            )}

            {/* Compare indicator dot — top-right, shows when in comparison */}
            {inComparison && (
              <div className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gold">
                <span className="text-[10px] font-medium leading-none text-navy">✓</span>
              </div>
            )}
          </div>

          {/* Card body */}
          <div className="flex flex-1 flex-col p-5">
            {/* Brand line — read from specs if present */}
            {product.specs['Marca'] && (
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold/70 mb-2">
                {product.specs['Marca']}
              </p>
            )}

            {/* Product name */}
            <h3 className="font-display text-xl font-light text-navy leading-snug mb-3 group-hover:text-navy transition-colors line-clamp-2">
              {product.name_es}
            </h3>

            {/* Key specs */}
            {specEntries.length > 0 && (
              <dl className="mb-4 space-y-1">
                {specEntries.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 font-mono text-mono-sm">
                    <dt className="text-text-muted">{k}</dt>
                    <dd className="text-text-mono">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Gold rule — expands on hover */}
            <div className="h-px w-6 bg-gold/40 transition-all duration-300 group-hover:w-12 group-hover:bg-gold mb-4" />

            {/* Footer actions */}
            <div className="mt-auto flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-navy/40 transition-colors group-hover:text-gold/70">
                Ver ficha →
              </span>
              <button
                onClick={handleCompareToggle}
                disabled={isDisabled}
                aria-label={inComparison ? 'Quitar de comparación' : 'Agregar a comparación'}
                className={cn(
                  'font-mono text-[10px] uppercase tracking-[0.10em] transition-colors duration-150',
                  inComparison
                    ? 'text-gold'
                    : 'text-navy/30 hover:text-gold',
                  isDisabled && 'cursor-not-allowed opacity-30',
                )}
              >
                {inComparison ? '✓ Añadido' : '+ Comparar'}
              </button>
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  )
}
