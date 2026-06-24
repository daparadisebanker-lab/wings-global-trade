'use client'

// src/components/features/navigation/MobileMenu.tsx
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { Category } from '@/types/database'
import { WINGS_PUBLIC_EMAIL } from '@/lib/constants'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  categories: Category[]
}

const PRIMARY_NAV = [
  { href: '/catalogo',  label: 'Catálogo',       num: '01' },
  { href: '/cotizar',   label: 'Cotizar',         num: '02' },
  { href: '/proceso',   label: 'Cómo importar',   num: '03' },
  { href: '/mister',    label: 'Mister IA',       num: '04' },
  { href: '/nosotros',  label: 'Nosotros',        num: '05' },
  { href: '/contacto',  label: 'Contacto',        num: '06' },
]

// Fix #14 — stagger container drives timing; items use shared variants
const NAV_CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

export function MobileMenu({ open, onClose, categories }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 overflow-y-auto bg-[#000C1F] hero-grain lg:hidden"
        >
          {/* Gold left-edge accent line */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" aria-hidden />

          <div className="flex min-h-full flex-col px-8 pb-12 pt-24">

            {/* Primary nav — numbered editorial style */}
            <motion.nav
              aria-label="Navegación principal"
              variants={NAV_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
            >
              {PRIMARY_NAV.map((link) => (
                <motion.div
                  key={link.href}
                  variants={ITEM_VARIANTS}
                  className="border-b border-warm-white/[0.06] last:border-0"
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="group flex items-baseline gap-5 py-5"
                  >
                    <span className="w-6 font-mono text-[9px] tracking-[0.18em] text-gold/30 transition-colors group-hover:text-gold/60">
                      {link.num}
                    </span>
                    <span className="font-display text-[2rem] font-light leading-none tracking-[-0.02em] text-warm-white transition-colors duration-150 group-hover:text-gold">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* Category chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.38 } }}
              className="mt-10"
            >
              <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-gold/30">
                Categorías
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/catalogo/${c.slug}`}
                    onClick={onClose}
                    className="border border-warm-white/[0.08] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-warm-white/35 transition-colors duration-150 hover:border-gold/30 hover:text-gold"
                  >
                    {c.name_es}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Footer actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.44 } }}
              className="mt-auto pt-10"
            >
              <div className="mb-6 h-px w-full bg-warm-white/[0.05]" />

              <Link
                href="/cotizar"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-3 bg-gold py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy"
              >
                <span className="h-px w-5 bg-current" aria-hidden />
                Solicitar cotización
              </Link>

              <div className="mt-6 flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-warm-white/20">
                  Contacto directo
                </p>
                <a
                  href={`mailto:${WINGS_PUBLIC_EMAIL}`}
                  className="font-mono text-[10px] text-warm-white/35 transition-colors hover:text-warm-white"
                >
                  {WINGS_PUBLIC_EMAIL}
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
