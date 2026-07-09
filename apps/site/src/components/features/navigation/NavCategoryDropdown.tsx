// src/components/features/navigation/NavCategoryDropdown.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { Category } from '@/types/database'

interface NavCategoryDropdownProps {
  categories: Category[]
}

export function NavCategoryDropdown({ categories }: NavCategoryDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/catalogo"
        className="font-body text-sm text-warm-white transition-colors hover:text-gold"
        onFocus={() => setOpen(true)}
      >
        Catálogo
      </Link>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
            className="absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 rounded-wings-card border border-border-default bg-white p-2 shadow-card-hover"
          >
            <ul className="flex flex-col">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/catalogo/${c.slug}`}
                    className="block rounded-wings px-3 py-2 font-body text-sm text-navy transition-colors hover:bg-warm-white"
                  >
                    {c.name_es}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-1 border-t border-border-default px-3 pb-1 pt-2">
              <Link
                href="/mister"
                className="font-body text-sm text-gold transition-colors hover:text-gold-hover"
              >
                ¿No encuentras lo que buscas? Habla con Mister →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
