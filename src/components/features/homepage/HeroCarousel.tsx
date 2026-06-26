'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const SLIDE_MS         = 6000
const SWIPE_THRESHOLD  = 50

const SLIDES = [
  {
    id: 'importacion',
    image: '/Importacion/home-carousel/hero-container-crane.png',
    objectPosition: 'center 20%',
    headline: ['Importación técnica', 'para el mercado', 'latinoamericano.'],
    cta: { label: 'Consulta técnica', href: '/mister' },
    gold: true,
  },
  {
    id: 'catalogo',
    image: '/Importacion/home-carousel/hero-vehicles.png',
    objectPosition: 'center center',
    headline: ['97 modelos.', 'Precio CIF sin', 'intermediarios.'],
    cta: { label: 'Explorar catálogo', href: '/catalogo/maquinaria-agricola' },
    gold: false,
  },
] as const

const SPRING   = [0.16, 1, 0.3, 1] as [number, number, number, number]
const EASE_OUT = [0, 0, 0.2, 1]    as [number, number, number, number]

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

// ---------------------------------------------------------------------------
// Shared slide content — renders on desktop (right-aligned overlay) and
// mobile (left-aligned panel). showCounter only on mobile.
// ---------------------------------------------------------------------------
function SlideContent({
  slide,
  align,
  index,
  total,
  showCounter = false,
}: {
  slide: (typeof SLIDES)[number]
  align: 'left' | 'right'
  index: number
  total: number
  showCounter?: boolean
}) {
  const right = align === 'right'

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={slide.id}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
        className={right ? 'text-right' : 'text-left'}
      >
        {/* Slide counter — mobile panel only */}
        {showCounter && (
          <motion.p
            className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-warm-white/30"
            variants={{
              hidden:  { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT, delay: 0.05 } },
            }}
          >
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </motion.p>
        )}

        {/* White rule */}
        <motion.div
          className={`mb-5 h-px w-14 bg-warm-white ${right ? 'ml-auto' : ''}`}
          style={{ originX: right ? 1 : 0 }}
          variants={{
            hidden:  { scaleX: 0 },
            visible: { scaleX: 1, transition: { duration: 0.6, ease: SPRING } },
          }}
        />

        {/* Headline */}
        <div aria-label={slide.headline.join(' ')}>
          {slide.headline.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.span
                className="block font-display font-light text-warm-white tracking-[-0.02em]"
                style={{ fontSize: 'clamp(2rem, 3.6vw, 3.5rem)', lineHeight: 1.05 }}
                variants={{
                  hidden:  { y: '110%' },
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
          className={`mt-7 flex ${right ? 'justify-end' : 'justify-start'}`}
          variants={{
            hidden:  { opacity: 0, y: 8 },
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
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function HeroCarousel() {
  const [active, setActive] = useState(0)
  const reduce       = useReducedMotion()
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX  = useRef<number | null>(null)

  const goTo = useCallback((idx: number) => {
    setActive(idx)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const prev = useCallback(() => goTo((active - 1 + SLIDES.length) % SLIDES.length), [active, goTo])
  const next = useCallback(() => goTo((active + 1) % SLIDES.length),                 [active, goTo])

  // Auto-advance
  useEffect(() => {
    if (reduce) return
    timerRef.current = setTimeout(() => setActive((a) => (a + 1) % SLIDES.length), SLIDE_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [active, reduce])

  // Swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > SWIPE_THRESHOLD) delta < 0 ? next() : prev()
    touchStartX.current = null
  }, [next, prev])

  const slide = SLIDES[active]
  const total = SLIDES.length

  const dots = (
    <div className="flex items-center gap-2">
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
  )

  return (
    <section className="relative bg-[#000C1F]">

      {/* Mobile nav spacer — keeps image below fixed header */}
      <div className="h-16 md:hidden" />

      {/* ── Image area — 16:9 on mobile / full-vh on desktop ──────── */}
      <div
        className="relative aspect-[16/9] w-full overflow-hidden md:aspect-auto md:h-[100dvh] md:min-h-[600px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background crossfade */}
        <AnimatePresence mode="sync" initial={false}>
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
              className="object-cover"
              style={{ objectPosition: slide.objectPosition }}
              sizes="100vw"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Mobile: bottom gradient bleeds image into content panel */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#001E50] to-transparent md:hidden" />

        {/* Desktop: full overlay gradient for text legibility */}
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[#000C1F]/75 via-[#000C1F]/20 to-transparent md:block" />

        {/* Prev arrow */}
        <button
          type="button"
          onClick={prev}
          aria-label="Slide anterior"
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#000C1F]/35 text-warm-white/75 transition-all duration-200 hover:bg-[#000C1F]/55 hover:text-warm-white md:left-5 md:rounded-none md:bg-transparent md:text-warm-white/50"
        >
          <ChevronLeft />
        </button>

        {/* Next arrow */}
        <button
          type="button"
          onClick={next}
          aria-label="Siguiente slide"
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#000C1F]/35 text-warm-white/75 transition-all duration-200 hover:bg-[#000C1F]/55 hover:text-warm-white md:right-5 md:rounded-none md:bg-transparent md:text-warm-white/50"
        >
          <ChevronRight />
        </button>

        {/* Desktop text — bottom right overlay */}
        <div className="absolute bottom-12 right-6 z-10 hidden max-w-[42%] md:block md:bottom-16 md:right-14">
          <SlideContent slide={slide} align="right" index={active} total={total} />
        </div>

        {/* Desktop dots — bottom center */}
        <div className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 md:flex">
          {dots}
        </div>
      </div>

      {/* ── Mobile content panel — below image, never overlaid ─────── */}
      <div className="bg-[#001E50] px-6 pb-8 pt-6 md:hidden">
        <SlideContent slide={slide} align="left" index={active} total={total} showCounter />
        <div className="mt-6">{dots}</div>
      </div>

    </section>
  )
}
