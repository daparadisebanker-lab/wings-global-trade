'use client'

// src/components/features/navigation/MobileMenu.tsx
//
// The phone's primary navigation — and therefore CHROME, which means it reads
// --chrome-* like the header and the footer do, never a brand literal. It was
// the last piece of the header system still painting machinery navy and gold,
// so on /interiores the bar went walnut and the menu behind it did not.
// Every fallback carries the house value, so navy surfaces are unchanged.
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { Category } from '@/types/database'
import { WINGS_PUBLIC_EMAIL } from '@/lib/constants'
import { SearchBar } from '@/components/features/homepage/SearchBar'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  categories: Category[]
}

// TAILWIND CANNOT APPLY AN OPACITY MODIFIER TO AN ARBITRARY var() COLOUR:
// `text-[color:var(--chrome-ink,#F8F6F0)]/35` emits NO RULE AT ALL, so the
// element silently inherits and only looks right while the inherited ink
// happens to be near-white. color-mix() survives compilation, and Tailwind's
// scanner only sees string literals, so the ladder lives here.
const INK_35 = 'text-[color:color-mix(in_srgb,var(--chrome-ink,#F8F6F0)_35%,transparent)]'
const INK_20 = 'text-[color:color-mix(in_srgb,var(--chrome-ink,#F8F6F0)_20%,transparent)]'
const RULE_8 = 'border-[color:color-mix(in_srgb,var(--chrome-ink,#F8F6F0)_8%,transparent)]'

const PRIMARY_NAV = [
  { href: '/catalogo',   label: 'Catálogo',       num: '01' },
  // WGT/02. This entry is not optional: the Azulejos catalogue inside this lane
  // is built thumb-first — swipe grammar, every control in the bottom 60%, one
  // hand across ten booths — and it shipped unreachable from the phone's own
  // primary navigation, findable only through the footer.
  { href: '/interiores', label: 'Interiores',      num: '02' },
  { href: '/repuestos',  label: 'Motores',        num: '03' },
  { href: '/marcas',     label: 'Marcas',          num: '04' },
  { href: '/cotizar',    label: 'Cotizar',         num: '05' },
  { href: '/proceso',    label: 'Cómo importar',   num: '06' },
  { href: '/mister',     label: 'Mister IA',       num: '07' },
  { href: '/nosotros',   label: 'Nosotros',        num: '08' },
  { href: '/contacto',   label: 'Contacto',        num: '09' },
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
          className="fixed inset-0 z-40 overflow-y-auto bg-[var(--chrome-ground,#000C1F)] hero-grain lg:hidden"
        >
          {/* Left-edge accent line */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[var(--chrome-accent-line,rgba(196,147,63,0.20))] to-transparent"
            aria-hidden
          />

          <div className="flex min-h-full flex-col px-8 pb-12 pt-24">

            {/* Search — near the top so it's the first action available */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.05 } }}
              className="mb-8"
            >
              <SearchBar
                onNavy
                placeholder="Buscar modelo, categoría o código HS"
                onNavigate={onClose}
              />
            </motion.div>

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
                  className="border-b border-[var(--chrome-hairline,rgba(248,246,240,0.06))] last:border-0"
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="group flex items-baseline gap-5 py-5"
                  >
                    <span className="w-6 font-mono text-[9px] tracking-[0.18em] text-[var(--chrome-label,rgba(196,147,63,0.30))] transition-colors group-hover:text-[var(--chrome-accent,var(--color-gold))]">
                      {link.num}
                    </span>
                    <span className="font-display text-[2rem] font-light leading-none tracking-[-0.02em] text-[color:var(--chrome-ink,#F8F6F0)] transition-colors duration-150 group-hover:text-[var(--chrome-accent,var(--color-gold))]">
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
              <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--chrome-label,rgba(196,147,63,0.30))]">
                Categorías
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/catalogo/${c.slug}`}
                    onClick={onClose}
                    className={`border ${RULE_8} px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.10em] ${INK_35} transition-colors duration-150 hover:border-[var(--chrome-accent,var(--color-gold))] hover:text-[var(--chrome-accent,var(--color-gold))]`}
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
              <div className="mb-6 h-px w-full bg-[var(--chrome-hairline,rgba(248,246,240,0.05))]" />

              <Link
                href="/cotizar"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-3 bg-[var(--chrome-accent,var(--color-gold))] py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--chrome-accent-ink,var(--color-navy))]"
              >
                <span className="h-px w-5 bg-current" aria-hidden />
                Solicitar cotización
              </Link>

              <div className="mt-6 flex items-center justify-between">
                <p className={`font-mono text-[9px] uppercase tracking-[0.15em] ${INK_20}`}>
                  Contacto directo
                </p>
                <a
                  href={`mailto:${WINGS_PUBLIC_EMAIL}`}
                  className={`font-mono text-[10px] ${INK_35} transition-colors hover:text-[color:var(--chrome-ink,#F8F6F0)]`}
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
