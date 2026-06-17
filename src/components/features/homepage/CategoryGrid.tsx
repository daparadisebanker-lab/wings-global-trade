// src/components/features/homepage/CategoryGrid.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Category } from '@/types/database'
import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'
import { STAGGER_CONTAINER, STAGGER_ITEM, VIEWPORT_ONCE } from '@/lib/motion'

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div>
      <div className="mb-12 max-w-2xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest-2 text-gold">Catálogo</p>
        <h2 className="font-display text-display-md font-semibold text-navy">
          Elige una categoría o describe tu importación
        </h2>
      </div>

      <motion.div
        variants={STAGGER_CONTAINER}
        initial="initial"
        whileInView="animate"
        viewport={VIEWPORT_ONCE}
        className="grid grid-cols-2 gap-4 md:grid-cols-3"
      >
        {categories.map((c) => (
          <motion.div key={c.id} variants={STAGGER_ITEM}>
            <Link
              href={`/catalogo/${c.slug}`}
              className="group flex aspect-square flex-col justify-between rounded-wings-card border border-border-default border-t-2 border-t-transparent bg-surface-card p-6 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-t-gold hover:shadow-card-hover"
            >
              <CategoryIcon iconKey={c.icon_key} className="h-10 w-10 text-navy transition-colors group-hover:text-gold" />
              <div>
                <h3 className="font-display text-2xl font-semibold text-navy">{c.name_es}</h3>
                {c.description_es && (
                  <p className="mt-1 line-clamp-2 font-body text-sm text-text-muted">
                    {c.description_es}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Accio special tile — gold border always visible, gold top on hover */}
        <motion.div variants={STAGGER_ITEM}>
          <Link
            href="/accio"
            className="group flex aspect-square flex-col justify-between rounded-wings-card border border-gold border-t-2 border-t-transparent bg-navy p-6 text-warm-white shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-t-gold hover:shadow-card-hover"
          >
            <CategoryIcon iconKey="accio" className="h-10 w-10 text-gold" />
            <div>
              <h3 className="font-display text-2xl font-semibold">Importación Personalizada</h3>
              <p className="mt-1 font-body text-sm text-text-muted-inverse">
                Calcular mi importación
              </p>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
