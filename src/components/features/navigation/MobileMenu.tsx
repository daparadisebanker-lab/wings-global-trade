// src/components/features/navigation/MobileMenu.tsx
'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { Category } from '@/types/database'
import { WhatsAppButton } from '@/components/features/shared/WhatsAppButton'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  categories: Category[]
}

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/mister', label: 'Mister' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export function MobileMenu({ open, onClose, categories }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-40 flex flex-col bg-[#000C1F] px-8 pb-10 pt-20 text-warm-white lg:hidden overflow-y-auto"
        >
          {/* Brand mark in mobile menu */}
          <Link href="/" onClick={onClose} className="mb-8 block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wings-logo.svg"
              alt="Wings Global Trade"
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>

          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="border-b border-[rgba(248,246,240,0.12)] py-4 font-display text-3xl font-light tracking-tight block"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="mt-8 mb-3 h-px w-6 bg-gold/40" />
          <p className="font-mono text-xs uppercase tracking-widest-2 text-gold">Catálogo</p>
          <nav className="mt-3 flex flex-col gap-1">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/catalogo/${c.slug}`}
                onClick={onClose}
                className="py-2 font-body text-base text-text-muted-inverse"
              >
                {c.name_es}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-8">
            <div className="h-px w-full bg-warm-white/[0.06] mb-6" />
            {/* Per ENRICHED_SPEC §3.4 — footer WhatsApp exact string */}
            <WhatsAppButton label="Abrir conversación en WhatsApp" className="w-full justify-center" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
