'use client'

// src/components/features/catalog/SubcategoryGateway.tsx
// Icon card grid for subcategories not yet in the DB.
// Each card routes to /mister?context=[pre-composed Spanish message].

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'
import { SUBCATEGORY_CATALOG } from '@/lib/subcategory-catalog'

// ---------------------------------------------------------------------------
// Motion system
// ---------------------------------------------------------------------------

const ENTER: [number, number, number, number] = [0.0, 0.0, 0.2, 1.0]

// Cards: staggered entrance via custom delay + hover y-lift
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

// Icon: scale up on parent hover
const iconVariants: Variants = {
  hover: { scale: 1.12, transition: { duration: 0.2, ease: ENTER } },
}

// CTA text: slide right on parent hover — reinforces directional intent
const ctaVariants: Variants = {
  hover: { x: 3, transition: { duration: 0.15 } },
}

// Framer Motion-enhanced Link
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
          {/* Gold rule — draws in from left after header arrives */}
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

      {/* Card grid — staggered entrance via custom delay index */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
      >
        {inactiveEntries.map((entry, i) => (
          <MotionLink
            key={entry.slug}
            href={`/mister?context=${encodeURIComponent(entry.misterContext)}`}
            variants={cardVariants}
            custom={i}
            whileHover="hover"
            className="group flex flex-col items-center gap-3 border border-[rgba(0,30,80,0.09)] px-4 pb-5 pt-6 text-center transition-colors duration-200 hover:border-navy hover:bg-navy"
          >
            {/* Icon — scales up on hover */}
            <motion.div variants={iconVariants}>
              <CategoryIcon
                iconKey={entry.iconKey}
                className="h-6 w-6 shrink-0 text-navy/40 transition-colors duration-200 group-hover:text-gold"
              />
            </motion.div>

            <span className="font-mono text-[10px] uppercase leading-snug tracking-[0.10em] text-navy/60 transition-colors duration-200 group-hover:text-warm-white">
              {entry.name_es}
            </span>

            {/* CTA — slides right on hover to reinforce directional intent */}
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

      {/* Footnote — fades in after last card */}
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
