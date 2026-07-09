'use client'

// src/components/features/catalog/SubcategoryGateway.tsx
// Icon card grid for subcategories not yet in the DB.
// Mobile: horizontal scroll strip with peek (scroll-snap, 2.5 cards visible).
// Desktop (sm+): 3/4-col stagger grid.
// Each card routes to /mister?context=[pre-composed Spanish message].

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'
import { SUBCATEGORY_CATALOG } from '@/lib/subcategory-catalog'

// ---------------------------------------------------------------------------
// Motion constants
// ---------------------------------------------------------------------------

const ENTER: [number, number, number, number] = [0.0, 0.0, 0.2, 1.0]
const TAP = { scale: 0.96, transition: { duration: 0.08 } }

// Desktop grid: staggered entrance + y-lift on hover
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: ENTER, delay: i * 0.055 },
  }),
  hover: {
    y: -3,
    transition: { duration: 0.2, ease: ENTER },
  },
}

const iconVariants: Variants = {
  hover: { scale: 1.12, transition: { duration: 0.2, ease: ENTER } },
}

const ctaVariants: Variants = {
  hover: { x: 3, transition: { duration: 0.15 } },
}

const MotionLink = motion(Link)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SubcategoryGatewayProps {
  categorySlug: string
  categoryName: string
  activeSubSlugs: string[]
  productCount: number
}

export function SubcategoryGateway({
  categorySlug,
  categoryName,
  activeSubSlugs,
  productCount,
}: SubcategoryGatewayProps) {
  const allEntries = SUBCATEGORY_CATALOG[categorySlug]
  if (!allEntries || allEntries.length === 0) return null

  const inactiveEntries = allEntries.filter(
    (entry) => !activeSubSlugs.includes(entry.slug),
  )
  if (inactiveEntries.length === 0) return null

  const hasCatalogAbove = productCount > 0

  return (
    <section
      aria-label={`Equipamiento de ${categoryName} en desarrollo`}
      className="mt-16 border-t border-[rgba(0,30,80,0.06)] pt-16"
    >
      {/* Section header — slides up on scroll entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: ENTER }}
        className="mb-10"
      >
        <div className="mb-6 flex items-center gap-4">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: ENTER, delay: 0.15 }}
            style={{ originX: 0 }}
            className="wings-rule"
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/35">
            Próximamente
          </p>
        </div>

        <h2 className="font-display text-xl text-navy leading-tight">
          {hasCatalogAbove
            ? `Más ${categoryName.toLowerCase()} en camino.`
            : `Catálogo de ${categoryName.toLowerCase()} en desarrollo.`}
        </h2>

        <p className="mt-3 max-w-xl font-mono text-[10px] uppercase tracking-[0.12em] leading-relaxed text-navy/40">
          Consulta cualquier equipo directamente con Mister — cotización técnica y precio CIF en minutos, sin esperas.
        </p>
      </motion.div>

      {/* ── Mobile: horizontal scroll strip (sm:hidden) ─────────────────── */}
      {/* 2.5 cards visible at 390px → peek signals "scroll right"          */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: ENTER, delay: 0.15 }}
        className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto pl-6 pb-2 sm:hidden"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {inactiveEntries.map((entry) => (
          <MotionLink
            key={`mob-${entry.slug}`}
            href={`/mister?context=${encodeURIComponent(entry.misterContext)}`}
            whileTap={TAP}
            style={{ scrollSnapAlign: 'start' }}
            className="group flex w-36 shrink-0 flex-col items-center gap-3 border border-[rgba(0,30,80,0.09)] px-3 pb-5 pt-6 text-center transition-colors duration-150 active:border-navy active:bg-navy"
          >
            <CategoryIcon
              iconKey={entry.iconKey}
              className="h-6 w-6 shrink-0 text-navy/40 transition-colors duration-150 group-active:text-gold"
            />
            <span className="font-mono text-[10px] uppercase leading-snug tracking-[0.10em] text-navy/60 transition-colors duration-150 group-active:text-warm-white">
              {entry.name_es}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-gold/50 transition-colors duration-150 group-active:text-gold/90">
              <span className="h-px w-2 bg-current shrink-0" aria-hidden />
              Consultar
            </span>
          </MotionLink>
        ))}
        {/* Trailing spacer: gives last card right breathing room */}
        <div className="w-4 shrink-0" aria-hidden />
      </motion.div>

      {/* ── Desktop: staggered 3/4-col grid (hidden on mobile) ──────────── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="hidden sm:grid sm:grid-cols-3 sm:gap-2 lg:grid-cols-4"
      >
        {inactiveEntries.map((entry, i) => (
          <MotionLink
            key={`desk-${entry.slug}`}
            href={`/mister?context=${encodeURIComponent(entry.misterContext)}`}
            variants={cardVariants}
            custom={i}
            whileHover="hover"
            whileTap={TAP}
            className="group flex flex-col items-center gap-3 border border-[rgba(0,30,80,0.09)] px-4 pb-5 pt-6 text-center transition-colors duration-200 hover:border-navy hover:bg-navy"
          >
            <motion.div variants={iconVariants}>
              <CategoryIcon
                iconKey={entry.iconKey}
                className="h-6 w-6 shrink-0 text-navy/40 transition-colors duration-200 group-hover:text-gold"
              />
            </motion.div>
            <span className="font-mono text-[10px] uppercase leading-snug tracking-[0.10em] text-navy/60 transition-colors duration-200 group-hover:text-warm-white">
              {entry.name_es}
            </span>
            <motion.span
              variants={ctaVariants}
              className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-gold/40 transition-colors duration-200 group-hover:text-gold/80"
            >
              <span className="h-px w-2 bg-current shrink-0" aria-hidden />
              Consultar
            </motion.span>
          </MotionLink>
        ))}
      </motion.div>

      {/* Footnote — delayed fade after cards settle */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-5 font-mono text-[9px] uppercase tracking-[0.12em] text-navy/30"
      >
        Mister te asistirá y recopilará los requisitos técnicos para iniciar tu importación.
      </motion.p>
    </section>
  )
}
