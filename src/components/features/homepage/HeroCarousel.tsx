'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const SLIDE_MS = 6000

const SLIDES = [
  {
    id: 'importacion',
    image: '/Importacion/home-carousel/hero-container-crane.png',
    overline: 'Importación técnica · Wings Global Trade',
    headline: ['Importación técnica', 'para el mercado', 'latinoamericano.'],
    body: 'Fabricante certificado. Precio CIF desglosado. Zona franca incluida.',
    cta: { label: 'Consulta técnica', href: '/mister' },
    gold: true,
  },
  {
    id: 'catalogo',
    image: null,
    overline: 'Catálogo activo · Wings Global Trade',
    headline: ['Más de 50 modelos.', 'Precio CIF sin', 'intermediarios.'],
    body: 'New Holland · John Deere · Massey Ferguson · Kubota · KAMA.',
    cta: { label: 'Explorar catálogo', href: '/catalogo/maquinaria-agricola' },
    gold: false,
  },
] as const

const SPRING = [0.16, 1, 0.3, 1] as [number, number, number, number]
const EASE_OUT = [0, 0, 0.2, 1] as [number, number, number, number]

export function HeroCarousel() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const reduce = useReducedMotion()
  const startRef = useRef(Date.now())
  const rafRef = useRef<number | null>(null)

  const goTo = useCallback((idx: number) => {
    setActive(idx)
    setProgress(0)
    startRef.current = Date.now()
  }, [])

  // rAF-based progress so the progress bar is smooth
  useEffect(() => {
    if (reduce) return
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(elapsed / SLIDE_MS, 1)
      setProgress(pct)
      if (elapsed >= SLIDE_MS) {
        const next = (active + 1) % SLIDES.length
        setActive(next)
        startRef.current = Date.now()
        setProgress(0)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [active, reduce])

  const slide = SLIDES[active]

  return (
    <section className="relative h-screen min-h-[620px] overflow-hidden bg-[#000C1F]">

      {/* Background layer — crossfade between slides */}
      <AnimatePresence mode="sync" initial={false}>
        {slide.image && (
          <motion.div
            key={slide.id + '-bg'}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: EASE_OUT }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
            />
            {/* Left-heavy scrim: text is always on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#000C1F]/92 via-[#000C1F]/65 to-[#000C1F]/25" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grain texture — always present (for navy slide too) */}
      <div className="hero-grain pointer-events-none absolute inset-0" />

      {/* Nav spacer */}
      <div className="h-16 md:h-[72px]" />

      {/* Text content — per slide */}
      <div className="relative z-10 flex h-[calc(100%-64px)] flex-col justify-center px-6 md:h-[calc(100%-72px)] md:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8, transition: { duration: 0.25, ease: EASE_OUT } }}
            >
              {/* Gold rule */}
              <motion.div
                className="mb-7 h-px w-10 bg-gold"
                style={{ originX: 0 }}
                variants={{
                  hidden: { scaleX: 0 },
                  visible: { scaleX: 1, transition: { duration: 0.7, ease: SPRING } },
                }}
              />

              {/* Overline */}
              <motion.p
                className="mb-8 font-mono text-[10px] uppercase tracking-[0.18em] text-warm-white/35"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.5, delay: 0.1, ease: SPRING } },
                }}
              >
                {slide.overline}
              </motion.p>

              {/* Headline — line-by-line mask reveal */}
              <div aria-label={slide.headline.join(' ')}>
                {slide.headline.map((line, i) => (
                  <div key={i} className="overflow-hidden">
                    <motion.span
                      className="block font-display font-light text-warm-white leading-[0.97] tracking-[-0.03em]"
                      style={{ fontSize: 'clamp(2.25rem, 6.5vw, 7.5rem)' }}
                      variants={{
                        hidden: { y: '110%' },
                        visible: {
                          y: '0%',
                          transition: { duration: 0.85, ease: SPRING, delay: 0.2 + i * 0.1 },
                        },
                      }}
                    >
                      {line}
                    </motion.span>
                  </div>
                ))}
              </div>

              {/* Body */}
              <motion.p
                className="mt-8 max-w-sm font-body text-body-md text-warm-white/40"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1, y: 0,
                    transition: { duration: 0.55, ease: EASE_OUT, delay: 0.55 },
                  },
                }}
              >
                {slide.body}
              </motion.p>

              {/* CTA */}
              <motion.div
                className="mt-10"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1, y: 0,
                    transition: { duration: 0.55, ease: EASE_OUT, delay: 0.65 },
                  },
                }}
              >
                <Link
                  href={slide.cta.href}
                  className={
                    slide.gold
                      ? 'inline-flex items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover'
                      : 'inline-flex items-center gap-3 border border-warm-white/25 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white transition-all duration-200 hover:border-gold/50 hover:text-gold'
                  }
                >
                  <span className="h-px w-6 bg-current" aria-hidden />
                  {slide.cta.label}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide indicators — thin gold progress bars, bottom-left */}
      <div className="absolute bottom-8 left-6 z-20 flex items-center gap-3 md:left-10">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className="relative h-[2px] w-14 bg-warm-white/12 transition-colors hover:bg-warm-white/25"
          >
            {i === active && (
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 bg-gold"
                style={{ width: `${progress * 100}%` }}
              />
            )}
            {i < active && (
              <span aria-hidden className="absolute inset-y-0 left-0 right-0 bg-gold/40" />
            )}
          </button>
        ))}
        <span className="ml-1 font-mono text-[9px] tracking-[0.18em] text-warm-white/20">
          0{active + 1} / 0{SLIDES.length}
        </span>
      </div>

    </section>
  )
}
