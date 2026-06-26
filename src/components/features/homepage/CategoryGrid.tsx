'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Category } from '@/types/database'

// ---------------------------------------------------------------------------
// Per-category image map — SVG variants for mobile and desktop
// ---------------------------------------------------------------------------

const CATEGORY_IMAGES: Record<string, { mobile: string; desktop: string; objectPosition?: string }> = {
  'maquinaria-agricola': {
    mobile:  '/images/categories/agricola-mobile.svg',
    desktop: '/images/categories/agricola-desktop.svg',
  },
  buses: {
    mobile:  '/images/categories/buses-mobile.svg',
    desktop: '/images/categories/buses-desktop.svg',
  },
  'equipo-industrial': {
    mobile:  '/images/categories/industrial-mobile.svg',
    desktop: '/images/categories/industrial-desktop.svg',
  },
  camiones: {
    mobile:  '/images/categories/camiones-mobile.svg',
    desktop: '/images/categories/camiones-desktop.svg',
  },
  utv: {
    mobile:  '/images/categories/utv-mobile.svg',
    desktop: '/images/categories/utv-desktop.svg',
  },
  automoviles: {
    mobile:  '/images/categories/automoviles-mobile.svg',
    desktop: '/images/categories/automoviles-desktop.svg',
  },
  repuestos: {
    mobile:  '/images/categories/repuestos-mobile.svg',
    desktop: '/images/categories/repuestos-desktop.svg',
  },
}

// Grid order — 7 categories fill positions 1-7, Mister fills position 8
// Mobile (2-col):  row1: agricola·buses  row2: industrial·camiones
//                  row3: utv·automoviles  row4: repuestos·Mister
// Desktop (4-col): row1: agricola·buses·industrial·camiones
//                  row2: utv·automoviles·repuestos·Mister
const ORDERED_SLUGS = [
  'maquinaria-agricola',
  'buses',
  'equipo-industrial',
  'camiones',
  'utv',
  'automoviles',
  'repuestos',
]

// ---------------------------------------------------------------------------
// Individual category card
// ---------------------------------------------------------------------------

interface CardProps {
  category: Category
  index: number
  priority?: boolean
  sizes: string
}

function CategoryCard({ category, index, priority, sizes }: CardProps) {
  const imgs = CATEGORY_IMAGES[category.slug]
  const num  = String(index + 1).padStart(2, '0')
  const isSvg = imgs?.mobile.endsWith('.svg')

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
            unoptimized={isSvg}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] md:hidden"
            style={{ objectPosition: imgs.objectPosition ?? 'center' }}
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
            unoptimized={isSvg}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] hidden md:block"
            style={{ objectPosition: imgs.objectPosition ?? 'center' }}
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
          <motion.div
            className="mb-3 h-px w-5 bg-gold"
            style={{ originX: 0 }}
            variants={{ hover: { scaleX: 2.8 } }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
// Mister card — position 8, uses its own SVG illustration
// ---------------------------------------------------------------------------

function MisterCard({ index }: { index: number }) {
  const num = String(index + 1).padStart(2, '0')

  return (
    <Link href="/mister" className="block h-full">
      <motion.article
        whileHover="hover"
        className="group relative h-full overflow-hidden cursor-pointer bg-[#000C1F]"
      >
        {/* SVG illustration — mobile */}
        <Image
          src="/images/categories/mister-mobile.svg"
          alt="Mister — Importación Personalizada"
          fill
          unoptimized
          sizes="50vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] md:hidden"
        />
        {/* SVG illustration — desktop */}
        <Image
          src="/images/categories/mister-desktop.svg"
          alt="Mister — Importación Personalizada"
          fill
          unoptimized
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] hidden md:block"
        />

        {/* Bottom gradient — darker for legibility over illustration */}
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
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
  const all = ORDERED_SLUGS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean) as Category[]

  const EASE = [0.16, 1, 0.3, 1] as const
  const ENTER = (delay = 0) => ({
    initial:    { opacity: 0, y: 28 },
    whileInView:{ opacity: 1, y: 0 },
    viewport:   { once: true, margin: '-60px' },
    transition: { duration: 0.65, ease: EASE, delay },
  })

  const CARD_SIZES = '(min-width: 768px) 25vw, 50vw'
  const CARD_H     = 'h-[52vw] md:h-[28vw] md:max-h-[380px]'

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

      {/* ── 4 × 2 uniform grid — all 8 cards equal ─────────────────────────── */}
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
