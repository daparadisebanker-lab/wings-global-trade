// src/components/features/shared/PageHero.tsx
'use client'

import { motion } from 'framer-motion'
import { FADE_UP, FADE_UP_TRANSITION } from '@/lib/motion'

interface PageHeroProps {
  title: string
  subtitle?: string
  eyebrow?: string
}

/** Navy hero band used at the top of interior pages. */
export function PageHero({ title, subtitle, eyebrow }: PageHeroProps) {
  return (
    <header className="bg-navy px-6 pb-16 pt-32 text-warm-white md:px-10 md:pb-20 md:pt-40">
      <motion.div
        variants={FADE_UP}
        initial="initial"
        animate="animate"
        transition={FADE_UP_TRANSITION}
        className="mx-auto w-full max-w-6xl"
      >
        {eyebrow && (
          <p className="mb-3 font-mono text-xs uppercase tracking-widest-2 text-gold">{eyebrow}</p>
        )}
        <h1 className="font-display text-display-lg font-semibold">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl font-body text-lg text-text-muted-inverse">{subtitle}</p>
        )}
      </motion.div>
    </header>
  )
}
