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
    headline: ['Importación técnica', 'para el mercado', 'latinoamericano.'],
    cta: { label: 'Consulta técnica', href: '/mister' },
    gold: true,
  },
  {
    id: 'catalogo',
    image: null,
    headline: ['97 modelos.', 'Precio CIF sin', 'intermediarios.'],
    cta: { label: 'Explorar catálogo', href: '/catalogo/maquinaria-agricola' },
    gold: false,
  },
] as const

const SPRING = [0.16, 1, 0.3, 1] as [number, number, number, number]
const EASE_OUT = [0, 0, 0.2, 1] as [number, number, number, number]

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HeroCarousel() {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const startRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback((idx: number) => {
    setActive(idx)
    startRef.current = Date.now()
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const prev = useCallback(() => {
    goTo((active - 1 + SLIDES.length) % SLIDES.length)
  }, [active, goTo])

  const next = useCallback(() => {
    goTo((active + 1) % SLIDES.length)
  }, [active, goTo])

  // Auto-advance
  useEffect(() => {
    if (reduce) return
    timerRef.current = setTimeout(() => {
      setActive((a) => (a + 1) % SLIDES.length)
      startRef.current = Date.now()
    }, SLIDE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [active, reduce])

  const slide = SLIDES[active]

  return (
    <section className="relative h-[100dvh] min-h-[600px] overflow-hidden bg-[#000C1F]">

      {/* Full-bleed background */}
      <AnimatePresence mode="sync" initial={false}>
        {slide.image && (
          <motion.div
            key={slide.id + '-bg'}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: EASE_OUT }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              className="object-cover object-[center_20%] md:object-center"
              sizes="100vw"
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient — text legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#000C1F]/75 via-[#000C1F]/20 to-transparent" />

      {/* Nav spacer */}
      <div className="h-16 md:h-[72px]" />

      {/* Prev arrow */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center text-warm-white/50 transition-all duration-200 hover:text-warm-white md:left-5"
      >
        <ChevronLeft />
      </button>

      {/* Next arrow */}
      <button
        type="button"
        onClick={next}
        aria-label="Siguiente slide"
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center text-warm-white/50 transition-all duration-200 hover:text-warm-white md:right-5"
      >
        <ChevronRight />
      </button>

      {/* Text block — bottom right */}
      <div className="absolute bottom-12 right-6 z-10 max-w-[78%] text-right md:bottom-16 md:right-14 md:max-w-[42%]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.id}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
          >
            {/* White rule — right-aligned */}
            <motion.div
              className="mb-5 ml-auto h-px w-14 bg-warm-white"
              style={{ originX: 1 }}
              variants={{
                hidden: { scaleX: 0 },
                visible: { scaleX: 1, transition: { duration: 0.6, ease: SPRING } },
              }}
            />

            {/* Headline */}
            <div aria-label={slide.headline.join(' ')}>
              {slide.headline.map((line, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.span
                    className="block font-display font-light text-warm-white tracking-[-0.02em]"
                    style={{ fontSize: 'clamp(1.75rem, 3.6vw, 3.5rem)', lineHeight: 1.05 }}
                    variants={{
                      hidden: { y: '110%' },
                      visible: {
                        y: '0%',
                        transition: { duration: 0.8, ease: SPRING, delay: 0.15 + i * 0.1 },
                      },
                    }}
                  >
                    {line}
                  </motion.span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              className="mt-7 flex justify-end"
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: {
                  opacity: 1, y: 0,
                  transition: { duration: 0.5, ease: EASE_OUT, delay: 0.55 },
                },
              }}
            >
              <Link
                href={slide.cta.href}
                className={
                  slide.gold
                    ? 'inline-flex items-center gap-3 bg-gold px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover'
                    : 'inline-flex items-center gap-3 border border-warm-white/30 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white transition-all duration-200 hover:border-gold/50 hover:text-gold'
                }
              >
                <span className="h-px w-5 bg-current" aria-hidden />
                {slide.cta.label}
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide dots — bottom center */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-[2px] transition-all duration-300 ${
              i === active ? 'w-8 bg-gold' : 'w-4 bg-warm-white/25 hover:bg-warm-white/50'
            }`}
          />
        ))}
      </div>

    </section>
  )
}
