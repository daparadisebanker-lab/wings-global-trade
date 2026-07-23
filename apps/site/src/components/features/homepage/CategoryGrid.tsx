'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Category } from '@/types/database'
import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'

// Hero images per category slug (real assets). A category without an entry
// falls back to a branded icon card — the grid itself is DB-driven (it renders
// whatever categories the page passes, in DB order), so a new category always
// appears without editing this file.
const CATEGORY_IMAGES: Record<string, { src: string; objectPosition?: string }> = {
  'maquinaria-agricola': { src: '/images/categories/agricola-desktop.png' },
  buses:                 { src: '/images/categories/buses-desktop.png' },
  'equipo-industrial':   { src: '/images/categories/industrial-desktop.png' },
  camiones:              { src: '/images/categories/camiones-desktop.png' },
  utv:                   { src: '/images/categories/utv.png' },
  automoviles:           { src: '/images/categories/automoviles.png' },
  repuestos:             { src: '/images/categories/repuestos-desktop.png' },
}

// ---------------------------------------------------------------------------
// Individual category card
// ---------------------------------------------------------------------------

interface CardProps {
  category: Category
  index: number
  priority?: boolean
  sizes: string
}

const HOVER_TRANSITION = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
const EASE = [0.16, 1, 0.3, 1] as const

function CategoryCard({ category, index, priority, sizes }: CardProps) {
  const imgs = CATEGORY_IMAGES[category.slug]
  const num  = String(index + 1).padStart(2, '0')

  return (
    <Link href={`/catalogo/${category.slug}`} className="block h-full">
      <motion.article
        whileHover="hover"
        className="group relative h-full overflow-hidden cursor-pointer"
      >
        {imgs ? (
          <motion.div
            className="absolute inset-0"
            variants={{ hover: { scale: 1.05 } }}
            transition={HOVER_TRANSITION}
          >
            <Image
              src={imgs.src}
              alt={category.name_es}
              fill
              sizes={sizes}
              className="object-cover"
              style={{ objectPosition: imgs.objectPosition ?? 'center' }}
              priority={priority}
            />
          </motion.div>
        ) : (
          // Branded fallback for a category without a hero image.
          <div className="absolute inset-0 flex items-center justify-center bg-[#000C1F]">
            <CategoryIcon iconKey={category.icon_key} className="h-16 w-16 text-gold/20" />
          </div>
        )}

        {/* Persistent bottom gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,12,31,0.78) 0%, rgba(0,12,31,0.22) 46%, rgba(0,12,31,0.04) 100%)',
          }}
        />

        {/* Editorial index — top right */}
        <span className="absolute right-4 top-4 font-mono text-[10px] tracking-widest-3 text-warm-white/25 select-none">
          {num}
        </span>

        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <motion.div
            className="mb-3 h-px w-5 bg-gold"
            style={{ originX: 0 }}
            variants={{ hover: { scaleX: 2.8 } }}
            transition={{ duration: 0.35, ease: EASE }}
          />
          <h3 className="font-display text-xl text-warm-white leading-tight md:text-2xl">
            {category.name_es}
          </h3>
          <motion.p
            className="mt-1.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-warm-white/35"
            variants={{ hover: { x: 4 } }}
            style={{ color: 'rgba(248,246,240,0.35)' }}
            transition={{ duration: 0.22 }}
          >
            <span className="h-px w-3 bg-current shrink-0" aria-hidden />
            Ver catálogo
          </motion.p>
        </div>
      </motion.article>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Mister card — position 8
// ---------------------------------------------------------------------------

function MisterCard({ index }: { index: number }) {
  const num = String(index + 1).padStart(2, '0')

  return (
    <Link href="/mister" className="block h-full">
      <motion.article
        whileHover="hover"
        className="group relative h-full overflow-hidden cursor-pointer bg-[#000C1F]"
      >
        <motion.div
          className="absolute inset-0"
          variants={{ hover: { scale: 1.05 } }}
          transition={HOVER_TRANSITION}
        >
          <Image
            src="/images/categories/mister.png"
            alt="Mister — Asesor de Importación IA"
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover"
          />
        </motion.div>

        {/* Bottom gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,12,31,0.88) 0%, rgba(0,12,31,0.30) 50%, rgba(0,12,31,0.06) 100%)',
          }}
        />

        {/* Ambient gold glow on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          variants={{ hover: { opacity: 1 } }}
          transition={{ duration: 0.5 }}
          style={{
            background:
              'radial-gradient(ellipse at 20% 85%, rgba(196,147,63,0.09) 0%, transparent 55%)',
          }}
        />

        {/* Editorial index */}
        <span className="absolute right-4 top-4 font-mono text-[10px] tracking-widest-3 text-[#F8F6F0]/20 select-none">
          {num}
        </span>

        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#C4933F]/60 mb-3">
            Asesor de Importación · IA
          </p>
          <motion.div
            className="mb-3 h-px w-5 bg-[#C4933F]"
            style={{ originX: 0 }}
            variants={{ hover: { scaleX: 2.8 } }}
            transition={{ duration: 0.35, ease: EASE }}
          />
          <h3 className="font-display text-xl text-[#F8F6F0] leading-tight md:text-2xl">
            Mister
          </h3>
          <motion.p
            className="mt-1.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[#F8F6F0]/35"
            variants={{ hover: { x: 4 } }}
            transition={{ duration: 0.22 }}
          >
            <span className="h-px w-3 bg-current shrink-0" aria-hidden />
            Consultar
          </motion.p>
        </div>
      </motion.article>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main grid export
// ---------------------------------------------------------------------------

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // DB-driven: render exactly the categories the page provides
  // (getNavCategories → active, non-empty, in DB sort_order).
  const all = categories

  const ENTER = (delay = 0) => ({
    initial:    { opacity: 0, y: 28 },
    whileInView:{ opacity: 1, y: 0 },
    viewport:   { once: true, margin: '-60px' },
    transition: { duration: 0.65, ease: EASE, delay },
  })

  const CARD_SIZES = '(min-width: 768px) 25vw, 50vw'
  const CARD_H     = 'h-[min(52vw,_220px)] md:h-[28vw] md:max-h-[380px]'

  return (
    <div>

      {/* Section header */}
      <div className="mb-10 md:mb-14">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="wings-rule" />
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40">
              Catálogo
            </p>
          </div>
          <Link
            href="/catalogo"
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-gold transition-colors hover:text-gold-hover shrink-0"
          >
            <span className="h-px w-3 bg-current" aria-hidden />
            Ver todo el catálogo
          </Link>
        </div>
        <h2 className="font-display text-display-md text-navy leading-tight">
          Equipamiento para el trabajo real.
        </h2>
      </div>

      {/* 4 × 2 uniform grid */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">

        {all.map((cat, i) => (
          <motion.div
            key={cat.id}
            {...ENTER(i * 0.06)}
            className={CARD_H}
          >
            <CategoryCard
              category={cat}
              index={i}
              priority={i < 4}
              sizes={CARD_SIZES}
            />
          </motion.div>
        ))}

        {/* Mister — position 8 */}
        <motion.div
          {...ENTER(all.length * 0.06)}
          className={CARD_H}
        >
          <MisterCard index={all.length} />
        </motion.div>

      </div>

    </div>
  )
}
