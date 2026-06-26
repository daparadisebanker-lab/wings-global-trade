'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Category } from '@/types/database'

// ---------------------------------------------------------------------------
// Per-category photography map — mobile and desktop variants
// ---------------------------------------------------------------------------

const CATEGORY_IMAGES: Record<string, { mobile: string; desktop: string }> = {
  'maquinaria-agricola': {
    mobile:  '/images/categories/agricola.png',
    desktop: '/images/categories/agricola-desktop.png',
  },
  camiones: {
    mobile:  '/images/categories/camiones.png',
    desktop: '/images/categories/camiones-desktop.png',
  },
  buses: {
    mobile:  '/images/categories/buses.png',
    desktop: '/images/categories/buses-desktop.png',
  },
  'equipo-industrial': {
    mobile:  '/images/categories/industrial.png',
    desktop: '/images/categories/industrial-desktop.png',
  },
  repuestos: {
    mobile:  '/images/categories/repuestos.png',
    desktop: '/images/categories/repuestos-desktop.png',
  },
}

// Display order: agricola is always hero (row 1 wide card)
const ORDERED_SLUGS = [
  'maquinaria-agricola',
  'camiones',
  'automoviles',
  'buses',
  'equipo-industrial',
  'repuestos',
]

// ---------------------------------------------------------------------------
// Individual category card
// ---------------------------------------------------------------------------

interface CardProps {
  category: Category
  index: number
  isHero?: boolean
  priority?: boolean
  sizes: string
}

function CategoryCard({ category, index, isHero, priority, sizes }: CardProps) {
  const imgs = CATEGORY_IMAGES[category.slug]
  const num  = String(index + 1).padStart(2, '0')

  return (
    <Link href={`/catalogo/${category.slug}`} className="block h-full">
      <motion.article
        whileHover="hover"
        className="group relative h-full overflow-hidden cursor-pointer"
      >
        {/* Photography — mobile */}
        {imgs && (
          <Image
            src={imgs.mobile}
            alt={category.name_es}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] md:hidden"
            priority={priority}
          />
        )}
        {/* Photography — desktop */}
        {imgs && (
          <Image
            src={imgs.desktop}
            alt={category.name_es}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] hidden md:block"
            priority={priority}
          />
        )}
        {/* Fallback when no image */}
        {!imgs && (
          <div className="absolute inset-0 bg-navy-dark" />
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
          {/* Gold rule — extends on hover */}
          <motion.div
            className="mb-3 h-px w-5 bg-gold"
            style={{ originX: 0 }}
            variants={{ hover: { scaleX: 2.8 } }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Category name */}
          <h3 className={`font-display text-warm-white leading-tight ${isHero ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
            {category.name_es}
          </h3>
          {/* CTA hint */}
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
// Main grid export
// ---------------------------------------------------------------------------

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Sort to match editorial layout order; append unknown slugs at end
  const sorted = ORDERED_SLUGS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean) as Category[]
  const rest = categories.filter((c) => !ORDERED_SLUGS.includes(c.slug))
  const all  = [...sorted, ...rest]

  const [cat0, cat1, cat2, cat3, cat4, cat5] = all

  const EASE = [0.16, 1, 0.3, 1] as const
  const ENTER = (delay = 0) => ({
    initial:    { opacity: 0, y: 28 },
    whileInView:{ opacity: 1, y: 0 },
    viewport:   { once: true, margin: '-60px' },
    transition: { duration: 0.65, ease: EASE, delay },
  })

  return (
    <div className="py-20 md:py-28 lg:py-32">

      {/* Section header */}
      <div className="mb-10 md:mb-14">
        <div className="wings-rule mb-6" />
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-3">
          Catálogo
        </p>
        <h2 className="font-display text-display-md text-navy leading-tight">
          Equipamiento para el trabajo real.
        </h2>
      </div>

      {/* ── Editorial grid ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">

        {/* Row 1 — hero (2 cols) + camiones (1 col) */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {/* Agrícola — hero card, double width */}
          {cat0 && (
            <motion.div
              {...ENTER(0)}
              className="h-[80vw] md:col-span-2 md:h-[50vw] md:max-h-[600px]"
            >
              <CategoryCard
                category={cat0}
                index={0}
                isHero
                priority
                sizes="(min-width: 768px) 66vw, 100vw"
              />
            </motion.div>
          )}
          {/* Camiones */}
          {cat1 && (
            <motion.div
              {...ENTER(0.07)}
              className="h-[80vw] md:h-[50vw] md:max-h-[600px]"
            >
              <CategoryCard
                category={cat1}
                index={1}
                priority
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </motion.div>
          )}
        </div>

        {/* Row 2 — automoviles · buses · industrial · repuestos (equal quarters) */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4">
          {([cat2, cat3, cat4, cat5] as (Category | undefined)[]).map((cat, i) =>
            cat ? (
              <motion.div
                key={cat.id}
                {...ENTER(i * 0.07)}
                className="h-[52vw] md:h-[48vw] md:max-h-[460px] lg:h-[30vw] lg:max-h-[420px]"
              >
                <CategoryCard
                  category={cat}
                  index={i + 2}
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                />
              </motion.div>
            ) : null
          )}
        </div>

        {/* Mister — Importación Personalizada (full-width strip) */}
        <motion.div {...ENTER(0.18)}>
          <Link href="/mister">
            <motion.article
              whileHover="hover"
              className="group relative overflow-hidden bg-[#000C1F] cursor-pointer"
            >
              {/* Top rule */}
              <div className="absolute top-0 left-0 right-0 h-px bg-warm-white/[0.08]" />

              <div className="flex items-center justify-between px-6 py-8 md:px-8 md:py-10">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold/40 mb-2">
                    Mister · Asistente IA
                  </p>
                  <h3 className="font-display text-xl font-light text-warm-white md:text-2xl">
                    Importación Personalizada
                  </h3>
                </div>
                <motion.span
                  className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white/30 shrink-0 ml-8"
                  variants={{ hover: { x: 6, color: 'rgba(196,147,63,0.9)' } }}
                  transition={{ duration: 0.22 }}
                >
                  <span className="h-px w-4 bg-current shrink-0" aria-hidden />
                  Consultar
                </motion.span>
              </div>

              {/* Gold bottom rule — slides in on hover */}
              <motion.div
                className="absolute bottom-0 left-0 h-px w-full bg-gold/35 origin-left"
                variants={{ hover: { scaleX: 1, opacity: 1 } }}
                initial={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.45 }}
              />
            </motion.article>
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
