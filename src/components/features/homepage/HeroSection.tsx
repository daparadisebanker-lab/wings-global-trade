'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { SearchBar } from '@/components/features/homepage/SearchBar'
import { CountUpStat } from '@/components/features/homepage/CountUpStat'
import { MagneticWrapper } from '@/components/ui/MagneticWrapper'
import { LINE_REVEAL, COUNT_UP } from '@/lib/motion'

const HEADLINE_LINES = [
  'Importación técnica',
  'para el mercado',
  'latinoamericano.',
]

const STATS = [
  { value: '32', label: 'Modelos disponibles' },
  { value: '5',  label: 'Fabricantes verificados' },
  { value: '2',  label: 'Zonas francas' },
  { value: '24h', label: 'Respuesta garantizada' },
]

const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function HeroSection() {
  const reduce = useReducedMotion()

  return (
    <section
      className="hero-grain relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-24 pt-36 md:px-10 md:pt-44"
      style={{ backgroundColor: '#000C1F' }}
    >
      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl">

        {/* Gold rule — enters first */}
        <motion.div
          className="mb-7 h-px w-10 bg-gold"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{ originX: 0 }}
          transition={{ duration: 0.7, ease: SPRING }}
        />

        {/* Overline */}
        <motion.p
          className="mb-8 font-mono text-[10px] uppercase tracking-widest-3 text-warm-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: SPRING }}
        >
          Wings Global Trade · Importador B2B · LATAM
        </motion.p>

        {/* Headline — line-by-line mask reveal */}
        <div aria-label={HEADLINE_LINES.join(' ')}>
          {HEADLINE_LINES.map((line, i) => (
            <div key={line} className="overflow-hidden">
              <motion.span
                variants={LINE_REVEAL}
                custom={i}
                initial={reduce ? { opacity: 0 } : 'hidden'}
                animate={reduce ? { opacity: 1 } : 'visible'}
                className="block font-display text-display-xl font-light text-warm-white leading-[0.95] tracking-[-0.03em]"
                style={{ fontSize: 'clamp(2.25rem, 6.5vw, 7.5rem)', lineHeight: 1.0 }}
              >
                {line}
              </motion.span>
            </div>
          ))}
        </div>

        {/* Data intelligence strip — staggered COUNT_UP */}
        <motion.div
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 border-t border-[rgba(248,246,240,0.07)] pt-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={COUNT_UP}
              custom={i}
              className="md:border-r border-[rgba(248,246,240,0.07)] last:border-r-0 md:px-8 first:pl-0"
            >
              <CountUpStat value={s.value} label={s.label} />
            </motion.div>
          ))}
        </motion.div>

        {/* Search + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: SPRING, delay: reduce ? 0 : 0.55 }}
          className="mt-12 flex flex-wrap gap-4 flex-col"
        >
          <SearchBar onNavy />

          <div className="flex flex-wrap items-center gap-3">
            <MagneticWrapper>
              <Link
                href="/catalogo/maquinaria-agricola"
                className="inline-flex items-center gap-2 border border-warm-white/[0.15] px-6 py-3 font-mono text-[11px] uppercase tracking-nav text-warm-white/55 transition-all duration-200 hover:border-gold/40 hover:text-gold"
              >
                Explorar catálogo
              </Link>
            </MagneticWrapper>
            <MagneticWrapper>
              <Link
                href="/mister"
                className="inline-flex items-center gap-2 bg-gold px-6 py-3 font-mono text-[11px] uppercase tracking-nav text-navy transition-colors hover:bg-gold-hover"
              >
                Consulta técnica
              </Link>
            </MagneticWrapper>
          </div>

          <p className="font-mono text-[9px] text-warm-white/20">
            Busca un producto del catálogo o describe una importación a medida.
          </p>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 1.4, duration: 0.6 }}
        aria-hidden
      >
        <p className="font-mono text-[8px] uppercase tracking-widest-3 text-warm-white/20">Scroll</p>
        <motion.div
          className="h-7 w-px bg-warm-white/20"
          animate={{ scaleY: [1, 0.25, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
        />
      </motion.div>

    </section>
  )
}
