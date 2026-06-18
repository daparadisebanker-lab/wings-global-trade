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
    <header className="hero-mesh hero-grain relative overflow-hidden px-6 pb-20 pt-36 text-warm-white md:px-10 md:pb-28 md:pt-48">
      <motion.div
        variants={FADE_UP}
        initial="initial"
        animate="animate"
        transition={FADE_UP_TRANSITION}
        className="relative z-[1] mx-auto w-full max-w-6xl"
      >
        {eyebrow && (
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest-3 text-gold/80">{eyebrow}</p>
        )}
        <h1 className="font-display text-display-lg font-light">{title}</h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl font-body text-body-lg text-warm-white/55">{subtitle}</p>
        )}
      </motion.div>
    </header>
  )
}
