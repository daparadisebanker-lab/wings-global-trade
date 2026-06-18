// src/components/features/navigation/MobileMenu.tsx
'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { Category } from '@/types/database'
import { MENU_SLIDE } from '@/lib/motion'
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
          variants={MENU_SLIDE}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-40 flex flex-col bg-navy px-6 pb-10 pt-24 text-warm-white lg:hidden"
        >
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="border-b border-[rgba(248,246,240,0.12)] py-4 font-display text-2xl"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="mt-8 font-mono text-xs uppercase tracking-widest-2 text-gold">Catálogo</p>
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
            {/* Per ENRICHED_SPEC §3.4 — footer WhatsApp exact string */}
            <WhatsAppButton label="Abrir conversación en WhatsApp" className="w-full justify-center" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
