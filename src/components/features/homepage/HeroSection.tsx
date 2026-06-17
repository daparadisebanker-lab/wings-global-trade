// src/components/features/homepage/HeroSection.tsx
'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { SearchBar } from '@/components/features/homepage/SearchBar'

const HEADLINE = 'Importación técnica para el mercado latinoamericano.'

// Word-by-word stagger: each word enters with opacity 0→1 + letterSpacing compression.
// Stagger 60ms, duration 0.4s per word, ease interaction [0.25, 0.1, 0.25, 1.0].

const WORD_CONTAINER_VARIANTS = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

function buildWordVariants(reduce: boolean) {
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.01 } },
    }
  }
  return {
    initial: { opacity: 0, letterSpacing: '0.08em' },
    animate: {
      opacity: 1,
      letterSpacing: '0em',
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number] },
    },
  }
}

function buildTaglineVariants(reduce: boolean, wordCount: number) {
  // Tagline enters after all words complete: stagger(wordCount-1) * 60ms + 400ms word duration + 200ms gap
  const delay = reduce ? 0 : (wordCount - 1) * 0.06 + 0.4 + 0.2
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.01, delay: 0 } },
    }
  }
  return {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] as [number, number, number, number], delay },
    },
  }
}

function buildSearchVariants(reduce: boolean, wordCount: number) {
  // SearchBar enters after tagline: tagline delay + 500ms tagline duration + 100ms gap
  const taglineDelay = reduce ? 0 : (wordCount - 1) * 0.06 + 0.4 + 0.2
  const delay = reduce ? 0 : taglineDelay + 0.5 + 0.1
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.01, delay: 0 } },
    }
  }
  return {
    initial: { opacity: 0, y: 16 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] as [number, number, number, number], delay },
    },
  }
}

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()
  const words = HEADLINE.split(' ')

  const wordVariants = buildWordVariants(!!shouldReduceMotion)
  const taglineVariants = buildTaglineVariants(!!shouldReduceMotion, words.length)
  const searchVariants = buildSearchVariants(!!shouldReduceMotion, words.length)

  return (
    <section className="hero-mesh hero-grain hero-gold-rule relative flex min-h-[88vh] flex-col justify-center overflow-hidden px-6 pb-20 pt-32 text-warm-white md:px-10">
      <div className="relative z-[1] mx-auto w-full max-w-4xl">

        {/* Overline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.01 }
              : { duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] }
          }
          className="mb-5 font-mono text-label-sm uppercase tracking-widest-2 text-gold"
        >
          Precisión · Proximidad · Confianza
        </motion.p>

        {/* Headline — word-by-word stagger */}
        <motion.h1
          variants={WORD_CONTAINER_VARIANTS}
          initial="initial"
          animate="animate"
          className="font-display text-display-xl font-semibold leading-[1.05]"
          aria-label={HEADLINE}
        >
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              variants={wordVariants}
              className="mr-[0.25em] inline-block"
              aria-hidden={i > 0}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/*
          Tagline — "Precisión." in gold, remainder in warm-white/60.
          Enters as single unit after all headline words complete.
        */}
        <motion.p
          initial={taglineVariants.initial}
          animate={taglineVariants.animate}
          className="mt-6 font-body text-body-lg"
        >
          <span style={{ color: '#C4933F' }}>Precisión.</span>
          <span className="text-warm-white/60"> Proximidad. Confianza.</span>
        </motion.p>

        {/* SearchBar + CTAs — enter last */}
        <motion.div
          initial={searchVariants.initial}
          animate={searchVariants.animate}
          className="mt-10"
        >
          <SearchBar onNavy />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/catalogo/maquinaria-agricola"
              className="rounded-wings border border-gold/40 px-4 py-2 font-body text-sm text-warm-white transition-colors hover:border-gold hover:text-gold"
            >
              Explorar catálogo
            </Link>
            <Link
              href="/accio"
              className="rounded-wings bg-gold px-4 py-2 font-body text-sm font-medium text-navy transition-colors hover:bg-gold-hover"
            >
              Iniciar consulta técnica
            </Link>
          </div>
          <p className="mt-3 font-body text-body-sm text-text-muted-inverse">
            Busca un producto del catálogo o describe una importación a medida.
          </p>
        </motion.div>

      </div>
    </section>
  )
}
