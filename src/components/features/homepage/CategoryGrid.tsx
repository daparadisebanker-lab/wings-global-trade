'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Category } from '@/types/database'
import { REVEAL } from '@/lib/motion'

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="py-20 md:py-28 lg:py-32">

      {/* Section header */}
      <div className="mb-12 md:mb-16">
        <div className="wings-rule mb-6" />
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-3">Catálogo</p>
        <h2 className="font-display text-display-md font-light text-navy leading-tight">
          Equipamiento para <em className="not-italic text-gold">el trabajo real</em>
        </h2>
      </div>

      {/* Card grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {categories.map((category) => (
          <motion.div key={category.id} variants={REVEAL}>
            <Link href={`/catalogo/${category.slug}`} className="block">
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="group relative overflow-hidden bg-surface-card border border-[rgba(0,30,80,0.07)] cursor-pointer"
              >
                {/* Image — 3:2 aspect */}
                <div className="relative aspect-[3/2] overflow-hidden bg-[rgba(0,30,80,0.04)]">
                  {category.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image_url}
                      alt={category.name_es}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-end justify-between p-5 bg-[rgba(0,30,80,0.03)] group-hover:bg-[rgba(0,30,80,0.05)] transition-colors duration-500">
                      {/* Large display initial — the signature no-image state */}
                      <span
                        className="font-display font-light text-navy/[0.07] leading-none select-none transition-all duration-500 group-hover:text-navy/[0.10]"
                        style={{ fontSize: 'clamp(4rem, 10vw, 7rem)' }}
                        aria-hidden
                      >
                        {category.name_es.charAt(0)}
                      </span>
                      {/* Subtle grid lines */}
                      <div className="flex flex-col items-end gap-1.5 pb-1" aria-hidden>
                        <div className="h-px w-12 bg-gold/20 group-hover:w-16 transition-all duration-500" />
                        <div className="h-px w-8 bg-navy/10 group-hover:w-10 transition-all duration-500" />
                        <div className="h-px w-5 bg-navy/[0.06]" />
                      </div>
                    </div>
                  )}
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,12,31,0.4)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]" />
                </div>

                {/* Content */}
                <div className="px-5 py-4 border-t border-[rgba(0,30,80,0.06)]">
                  <h3 className="font-display text-xl font-light text-navy">{category.name_es}</h3>
                  {/* Gold rule on hover */}
                  <div className="mt-2 h-px w-0 bg-gold transition-all duration-[400ms] group-hover:w-8" />
                </div>
              </motion.article>
            </Link>
          </motion.div>
        ))}

        {/* Mister — custom import card */}
        <motion.div variants={REVEAL}>
          <Link href="/mister" className="block">
            <motion.article
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden bg-navy border border-navy cursor-pointer"
            >
              {/* Placeholder area matching 3:2 */}
              <div className="relative aspect-[3/2] overflow-hidden bg-[rgba(196,147,63,0.08)] flex items-center justify-center">
                <span className="font-display text-display-sm font-light text-gold/30 select-none">M</span>
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,12,31,0.6)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]" />
              </div>

              {/* Content */}
              <div className="px-5 py-4 border-t border-[rgba(196,147,63,0.12)]">
                <h3 className="font-display text-xl font-light text-warm-white">Importación Personalizada</h3>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-gold/50">Mister · Asistente IA</p>
                <div className="mt-2 h-px w-0 bg-gold transition-all duration-[400ms] group-hover:w-8" />
              </div>
            </motion.article>
          </Link>
        </motion.div>
      </motion.div>

    </div>
  )
}
