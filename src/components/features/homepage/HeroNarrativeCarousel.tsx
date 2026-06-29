'use client'

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// ── Constants ──────────────────────────────────────────────────────────────
const SLIDE_MS        = 6000
const SWIPE_THRESHOLD = 50
const SPRING          = [0.16, 1, 0.3, 1]  as [number, number, number, number]
const EASE_OUT        = [0, 0, 0.2, 1]     as [number, number, number, number]
const NARRATIVE_ID    = 'hero-narrative-st'

const SLIDES = [
  {
    id: 'importacion',
    image: '/Importacion/home-carousel/hero-container-wings.png',
    objectPosition: 'center center',
    headline: ['Importación técnica', 'para el mercado', 'latinoamericano.'],
    cta: { label: 'Consulta técnica', href: '/mister' },
    gold: true,
  },
  {
    id: 'camiones',
    image: '/Importacion/home-carousel/hero-vehicles.png',
    objectPosition: 'center center',
    headline: ['97 modelos.', 'Precio CIF sin', 'intermediarios.'],
    cta: { label: 'Ver camiones KAMA', href: '/catalogo/camiones' },
    gold: false,
  },
  {
    id: 'agricola',
    image: '/Importacion/home-carousel/hero-tractor.png',
    objectPosition: 'center 55%',
    headline: ['Maquinaria agrícola', 'de origen verificado', 'para el agro.'],
    cta: { label: 'Ver maquinaria agrícola', href: '/catalogo/maquinaria-agricola' },
    gold: false,
  },
] as const

type Phase = 'narrative' | 'carousel'

// ── SVG arrows ─────────────────────────────────────────────────────────────
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

// ── Carousel slide content (Framer Motion) ─────────────────────────────────
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

        <motion.div
          className={`mb-5 h-px w-14 bg-warm-white ${right ? 'ml-auto' : ''}`}
          style={{ originX: right ? 1 : 0 }}
          variants={{
            hidden:  { scaleX: 0 },
            visible: { scaleX: 1, transition: { duration: 0.6, ease: SPRING } },
          }}
        />

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

        <motion.div
          className={`mt-7 flex ${right ? 'justify-end' : 'justify-start'}`}
          variants={{
            hidden:  { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT, delay: 0.55 } },
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

// ── Main export ─────────────────────────────────────────────────────────────
export function HeroNarrativeCarousel() {
  const [phase, setPhase]   = useState<Phase>('narrative')
  const [active, setActive] = useState(0)
  const reduce              = useReducedMotion()

  // Narrative GSAP refs
  const sectionRef   = useRef<HTMLElement>(null)
  const imageWrapRef = useRef<HTMLDivElement>(null)
  const overlineRef  = useRef<HTMLParagraphElement>(null)
  const headlineRef  = useRef<HTMLHeadingElement>(null)
  const ctaRef       = useRef<HTMLDivElement>(null)
  const scrollIndRef = useRef<HTMLDivElement>(null)
  const ruleRef      = useRef<HTMLDivElement>(null)

  // Carousel refs
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef<number | null>(null)

  // ── Mobile / reduced-motion: skip narrative, go straight to carousel
  // useLayoutEffect runs synchronously before paint, preventing any flash
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('carousel')
      return
    }
    if (window.innerWidth < 768) {
      setPhase('carousel')
      return
    }
    // Desktop, full-motion: hide elements GSAP will animate in
    if (overlineRef.current) overlineRef.current.style.opacity = '0'
    if (ctaRef.current)      ctaRef.current.style.opacity      = '0'
    if (ruleRef.current)     ruleRef.current.style.transform   = 'scaleX(0)'
  }, [])

  // ── Narrative GSAP (desktop only) ─────────────────────────────────────
  useEffect(() => {
    if (reduce) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      if (!headlineRef.current) return

      const split = new SplitText(headlineRef.current, { type: 'words' })
      gsap.set(split.words, { opacity: 0, y: 20 })
      if (ruleRef.current) ruleRef.current.style.transformOrigin = 'left center'

      const tl = gsap.timeline({
        scrollTrigger: {
          id: NARRATIVE_ID,
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onLeave: () => {
            // Kill pin, then hand off to carousel
            ScrollTrigger.getById(NARRATIVE_ID)?.kill()
            setPhase('carousel')
          },
        },
      })

      tl
        // Image parallax throughout the pin
        .to(imageWrapRef.current, { y: 70, ease: 'none', duration: 1 }, 0)

        // Scroll indicator out immediately
        .to(scrollIndRef.current, { opacity: 0, duration: 0.05, ease: 'none' }, 0)

        // Gold rule draws left → right
        .to(ruleRef.current, { scaleX: 1, duration: 0.14, ease: 'power2.inOut' }, 0.04)

        // Overline fades up
        .to(overlineRef.current, { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' }, 0.05)

        // Words stagger in with scroll — 15% → 68%
        .to(split.words, {
          opacity: 1,
          y: 0,
          stagger: 0.53 / Math.max(split.words.length, 1),
          duration: 0.22,
          ease: 'power2.out',
        }, 0.15)

        // CTA arrives at ~72%
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.72)

      return () => {
        split.revert()
      }
    })

    return () => mm.revert()
  }, [reduce])

  // ── Carousel: auto-advance ─────────────────────────────────────────────
  const goTo = useCallback((idx: number) => {
    setActive(idx)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const prev = useCallback(() => goTo((active - 1 + SLIDES.length) % SLIDES.length), [active, goTo])
  const next = useCallback(() => goTo((active + 1) % SLIDES.length), [active, goTo])

  useEffect(() => {
    if (phase !== 'carousel' || reduce) return
    timerRef.current = setTimeout(() => setActive(a => (a + 1) % SLIDES.length), SLIDE_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [phase, active, reduce])

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

  // ── Phase: narrative ────────────────────────────────────────────────────
  if (phase === 'narrative') {
    return (
      <section
        ref={sectionRef}
        className="relative bg-[#000C1F] overflow-hidden"
        style={{ height: '100dvh', minHeight: 600 }}
        aria-label="Wings Global Trade"
      >
        {/* Nav spacer — mobile only */}
        <div className="h-16 md:hidden" />

        {/* Background image — GSAP parallaxes this */}
        <div
          ref={imageWrapRef}
          className="absolute inset-0"
          style={{ willChange: 'transform' }}
        >
          <Image
            src={SLIDES[0].image}
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: SLIDES[0].objectPosition }}
            sizes="100vw"
            priority
          />
          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[#000C1F]/85 via-[#000C1F]/20 to-transparent md:block" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#001E50] to-transparent md:hidden" />
        </div>

        {/* Narrative content */}
        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-14 md:px-14 md:pb-20">
          <div className="max-w-4xl">
            <div
              ref={ruleRef}
              className="mb-6 h-px w-14 bg-gold"
              style={{ transformOrigin: 'left center' }}
            />
            <p
              ref={overlineRef}
              className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-warm-white/40"
            >
              Wings Global Trade
            </p>
            <h1
              ref={headlineRef}
              className="font-display font-light text-warm-white tracking-[-0.02em] leading-[1.0]"
              style={{ fontSize: 'clamp(2.2rem, 5.4vw, 5.4rem)' }}
            >
              {SLIDES[0].headline.join(' ')}
            </h1>
            <div ref={ctaRef} className="mt-10">
              <Link
                href={SLIDES[0].cta.href}
                className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover"
              >
                <span className="h-px w-6 bg-current" aria-hidden />
                {SLIDES[0].cta.label}
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndRef}
          className="absolute bottom-10 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
          aria-hidden
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-warm-white/25">Scroll</span>
          <div className="h-10 w-px bg-warm-white/15" />
        </div>
      </section>
    )
  }

  // ── Phase: carousel ─────────────────────────────────────────────────────
  return (
    <section
      className="relative bg-[#000C1F]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Wings Global Trade — Catálogo"
    >
      <div className="h-16 md:hidden" />

      <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-auto md:h-[min(100dvh,_820px)] md:min-h-[600px]">

        {/* Background crossfade — initial={false} skips fade-in on first mount */}
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
              priority={active === 0}
            />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#001E50] to-transparent md:hidden" />
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

      {/* Mobile content panel */}
      <div className="bg-[#001E50] px-6 pb-8 pt-6 md:hidden">
        <SlideContent slide={slide} align="left" index={active} total={total} showCounter />
      </div>
    </section>
  )
}
