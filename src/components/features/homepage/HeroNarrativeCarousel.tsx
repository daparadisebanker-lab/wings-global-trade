'use client'

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Constants ────────────────────────────────────────────────────────────────
const SLIDE_MS        = 6000
const SWIPE_THRESHOLD = 50
const SPRING          = [0.16, 1, 0.3, 1] as [number, number, number, number]
const EASE_OUT        = [0, 0, 0.2, 1]   as [number, number, number, number]

// ── Slide data ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 'importacion',
    image: '/Importacion/home-carousel/hero-container-wings.png',
    objectPosition: 'center center',
    headline: 'Importación técnica para el mercado latinoamericano.',
    headlineLines: ['Importación técnica', 'para el mercado', 'latinoamericano.'],
    overline: 'Wings Global Trade',
    cta: { label: 'Consulta técnica', href: '/mister' },
    gold: true,
  },
  {
    id: 'camiones',
    image: '/Importacion/home-carousel/hero-vehicles.png',
    objectPosition: 'center center',
    headline: '97 modelos. Precio CIF sin intermediarios.',
    headlineLines: ['97 modelos.', 'Precio CIF sin', 'intermediarios.'],
    overline: null,
    cta: { label: 'Ver camiones KAMA', href: '/catalogo/camiones' },
    gold: false,
  },
  {
    id: 'agricola',
    image: '/Importacion/home-carousel/hero-tractor.png',
    objectPosition: 'center 55%',
    headline: 'Maquinaria agrícola de origen verificado para el agro.',
    headlineLines: ['Maquinaria agrícola', 'de origen verificado', 'para el agro.'],
    overline: null,
    cta: { label: 'Ver maquinaria agrícola', href: '/catalogo/maquinaria-agricola' },
    gold: false,
  },
] as const

// ── Ken Burns — each slide has its own motion personality ────────────────────
// Communicates: containers drift to reveal depth, trucks pull back to show scale,
// tractor zooms in with agricultural intimacy.
const KEN_BURNS = [
  { initial: { scale: 1.0,  x: '0%',    y: '0%'  }, animate: { scale: 1.045, x: '-1.5%', y: '-0.5%' } },
  { initial: { scale: 1.06, x: '0%',    y: '0%'  }, animate: { scale: 1.0,   x: '0%',    y: '0%'    } },
  { initial: { scale: 1.0,  x: '0%',    y: '0%'  }, animate: { scale: 1.06,  x: '0%',    y: '-1%'   } },
] as const

// ── Mobile image with scale-crossfade + Ken Burns dwell ─────────────────────
function MobileImage({ slide, index, priority }: {
  slide: (typeof SLIDES)[number]
  index: number
  priority: boolean
}) {
  const kb = KEN_BURNS[index]
  return (
    // Outer — scale crossfade: arrives small (0.97), departs large (1.06), creates depth
    <motion.div
      key={slide.id}
      className="absolute inset-0"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.85, ease: EASE_OUT }}
    >
      {/* Inner — Ken Burns: slow drift throughout the dwell period */}
      <motion.div
        key={slide.id + '-kb'}
        className="absolute inset-0"
        initial={kb.initial}
        animate={kb.animate}
        transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
      >
        <Image
          src={slide.image}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: slide.objectPosition }}
          sizes="100vw"
          priority={priority}
        />
      </motion.div>
    </motion.div>
  )
}

// ── Progress bar — depletes left-to-right over SLIDE_MS, resets on advance ──
function ProgressBar({ active, paused }: { active: number; paused: boolean }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 h-[1.5px] bg-warm-white/10">
      <motion.div
        key={active}
        className="h-full origin-left bg-gold"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: paused ? undefined : 1 }}
        transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
      />
    </div>
  )
}

// ── Mobile slide content (text below image) ──────────────────────────────────
function SlideContent({
  slide, align,
}: {
  slide: (typeof SLIDES)[number]
  align: 'left' | 'right'
}) {
  const right = align === 'right'
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={slide.id}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, transition: { duration: 0.18, ease: EASE_OUT } }}
        className={right ? 'text-right' : 'text-left'}
      >
        {/* Rule draws in first */}
        <motion.div
          className={`mb-5 h-px w-14 bg-warm-white ${right ? 'ml-auto' : ''}`}
          style={{ originX: right ? 1 : 0 }}
          variants={{
            hidden: { scaleX: 0 },
            visible: { scaleX: 1, transition: { duration: 0.45, ease: SPRING } },
          }}
        />
        {/* Headline lines clip up — staggered 80ms each */}
        <div aria-label={slide.headlineLines.join(' ')}>
          {slide.headlineLines.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.span
                className="block font-display font-light text-warm-white tracking-[-0.02em]"
                style={{ fontSize: 'clamp(2rem, 8vw, 2.6rem)', lineHeight: 1.05 }}
                variants={{
                  hidden: { y: '110%' },
                  visible: { y: '0%', transition: { duration: 0.7, ease: SPRING, delay: 0.08 + i * 0.08 } },
                }}
              >
                {line}
              </motion.span>
            </div>
          ))}
        </div>
        {/* CTA arrives after text lands */}
        <motion.div
          className={`mt-7 flex ${right ? 'justify-end' : 'justify-start'}`}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay: 0.42 } },
          }}
        >
          <Link
            href={slide.cta.href}
            className={slide.gold
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

// ── SVG arrows ───────────────────────────────────────────────────────────────
function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Shared gradient overlay ───────────────────────────────────────────────────
function Gradient() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: 'linear-gradient(to top, rgba(0,12,31,0.85) 0%, rgba(0,12,31,0.22) 45%, transparent 100%)' }}
    />
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function HeroNarrativeCarousel() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isMobile, setIsMobile]       = useState(false)
  const reduce = useReducedMotion()

  // ── Desktop GSAP refs ─────────────────────────────────────────────────────
  const sectionRef   = useRef<HTMLElement>(null)
  const img0Ref      = useRef<HTMLDivElement>(null)
  const img1Ref      = useRef<HTMLDivElement>(null)
  const img2Ref      = useRef<HTMLDivElement>(null)
  const slide0Ref    = useRef<HTMLDivElement>(null)
  const slide1Ref    = useRef<HTMLDivElement>(null)
  const slide2Ref    = useRef<HTMLDivElement>(null)
  const ruleRef      = useRef<HTMLDivElement>(null)
  const overlineRef  = useRef<HTMLParagraphElement>(null)
  const headlineRef  = useRef<HTMLHeadingElement>(null)
  const ctaRef       = useRef<HTMLDivElement>(null)
  const scrollIndRef = useRef<HTMLDivElement>(null)

  // ── Mobile refs ───────────────────────────────────────────────────────────
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef<number | null>(null)

  // ── Detect mobile & set initial GSAP states synchronously ─────────────────
  useLayoutEffect(() => {
    const mobile = window.innerWidth < 768 || !!reduce
    setIsMobile(mobile)
    if (mobile) return

    gsap.set(overlineRef.current,  { opacity: 0, y: 10 })
    gsap.set(headlineRef.current,  { opacity: 0, y: 18 })
    gsap.set(ctaRef.current,       { opacity: 0, y: 10 })
    gsap.set(ruleRef.current,      { scaleX: 0, transformOrigin: 'left center' })
    gsap.set([slide1Ref.current, slide2Ref.current], { xPercent: 100 })
    gsap.set([img1Ref.current, img2Ref.current], { opacity: 0 })
  }, [reduce])

  // ── Desktop: single pinned ScrollTrigger timeline ─────────────────────────
  useEffect(() => {
    if (isMobile || reduce) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      if (!headlineRef.current) return

      // ── Timeline layout (10 units = 300vh of scroll) ──────────────────
      //  0.0 – 3.3  │ Narrative: headline fade-in scrub
      //  3.3 – 5.0  │ Slide 0 → 1 horizontal wipe + image crossfade
      //  5.0 – 6.5  │ Dwell on Slide 1
      //  6.5 – 8.3  │ Slide 1 → 2 horizontal wipe + image crossfade
      //  8.3 – 10.0 │ Dwell on Slide 2, pin releases
      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'hero-narrative-pin',
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Narrative scrubs freely; snap only kicks in once past the narrative zone
          // so each scroll impulse advances exactly one slide chapter
          snap: {
            snapTo: (raw) => {
              if (raw < 0.28) return raw
              const pts = [1 / 3, 2 / 3, 1] as const
              return pts.reduce((a, b) => (Math.abs(b - raw) < Math.abs(a - raw) ? b : a))
            },
            duration: { min: 0.25, max: 0.55 },
            delay: 0.08,
            ease: 'power2.inOut',
          },
          onUpdate: (self) => {
            if      (self.progress < 0.38) setActiveSlide(0)
            else if (self.progress < 0.73) setActiveSlide(1)
            else                            setActiveSlide(2)
          },
        },
      })

      tl
        .to(scrollIndRef.current, { opacity: 0, duration: 0.15, ease: 'none' }, 0)
        .to(img0Ref.current,      { y: 50, ease: 'none', duration: 3.3 }, 0)
        .to(ruleRef.current,      { scaleX: 1, duration: 0.35, ease: 'power2.inOut' }, 0.1)
        .to(overlineRef.current,  { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.18)
        .to(headlineRef.current, { opacity: 1, y: 0, duration: 2.5, ease: 'power2.out' }, 0.42)
        .to(ctaRef.current,    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 2.5)
        // ── Slide 0 → 1 ─────────────────────────────────────────────────
        .to(slide0Ref.current, { xPercent: -100, duration: 1.7, ease: 'power2.inOut' }, 3.3)
        .to(slide1Ref.current, { xPercent: 0,    duration: 1.7, ease: 'power2.inOut' }, 3.3)
        .to(img0Ref.current,   { opacity: 0,     duration: 0.9, ease: 'power1.out'  }, 3.4)
        .to(img1Ref.current,   { opacity: 1,     duration: 0.9, ease: 'power1.in'   }, 4.1)
        // ── Slide 1 → 2 ─────────────────────────────────────────────────
        .to(slide1Ref.current, { xPercent: -100, duration: 1.8, ease: 'power2.inOut' }, 6.5)
        .to(slide2Ref.current, { xPercent: 0,    duration: 1.8, ease: 'power2.inOut' }, 6.5)
        .to(img1Ref.current,   { opacity: 0,     duration: 0.9, ease: 'power1.out'  }, 6.6)
        .to(img2Ref.current,   { opacity: 1,     duration: 0.9, ease: 'power1.in'   }, 7.4)

    })

    return () => {
      // Kill the pinned ScrollTrigger first so it releases the section from its
      // spacer wrapper before React's reconciler tries removeChild on the section.
      // Without this, the pin moves the element out of its React-expected parent
      // and navigation triggers an Uncaught NotFoundError.
      ScrollTrigger.getById('hero-narrative-pin')?.kill()
      mm.revert()
    }
  }, [isMobile, reduce])

  // ── Mobile: auto-advance ──────────────────────────────────────────────────
  const goTo = useCallback((idx: number) => {
    setActiveSlide(idx)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])
  const prev = useCallback(() => goTo((activeSlide - 1 + SLIDES.length) % SLIDES.length), [activeSlide, goTo])
  const next = useCallback(() => goTo((activeSlide + 1) % SLIDES.length), [activeSlide, goTo])

  useEffect(() => {
    if (!isMobile || reduce) return
    timerRef.current = setTimeout(() => setActiveSlide(a => (a + 1) % SLIDES.length), SLIDE_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isMobile, activeSlide, reduce])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > SWIPE_THRESHOLD) delta < 0 ? next() : prev()
    touchStartX.current = null
  }, [next, prev])

  // ── Desktop dot indicator ─────────────────────────────────────────────────
  const desktopDots = (
    <div className="flex items-center gap-2">
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          aria-hidden
          className={`h-[2px] transition-all duration-300 ${
            i === activeSlide ? 'w-8 bg-gold' : 'w-4 bg-warm-white/25'
          }`}
        />
      ))}
    </div>
  )

  // ── Render: mobile ────────────────────────────────────────────────────────
  if (isMobile) {
    const slide = SLIDES[activeSlide]
    return (
      <section
        className="relative bg-[#000C1F]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Wings Global Trade"
      >
        {/* Nav spacer */}
        <div className="h-16" />

        {/* Image area */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <AnimatePresence mode="sync" initial={false}>
            <MobileImage
              key={slide.id}
              slide={slide}
              index={activeSlide}
              priority={activeSlide === 0}
            />
          </AnimatePresence>

          {/* Gradient into content below */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#001E50] to-transparent" />

          {/* Prev / next — minimal, no background circle */}
          <button
            type="button"
            onClick={prev}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 p-2 text-warm-white/60 transition-colors hover:text-warm-white"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente slide"
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 p-2 text-warm-white/60 transition-colors hover:text-warm-white"
          >
            <ChevronRight />
          </button>

          {/* Progress bar — replaces dots, depletes over SLIDE_MS then resets */}
          <ProgressBar active={activeSlide} paused={!!reduce} />
        </div>

        {/* Text content below image — min-h prevents layout shift when slides change height */}
        <div className="bg-[#001E50] px-6 pb-8 pt-7 min-h-[300px]">
          <SlideContent slide={slide} align="left" />
        </div>
      </section>
    )
  }

  // ── Render: desktop scroll-driven ─────────────────────────────────────────
  const contentClass = 'absolute inset-0 flex flex-col justify-end px-6 pb-14 md:px-14 md:pb-20'
  const headingStyle = { fontSize: 'clamp(2.2rem, 5.4vw, 5.4rem)', lineHeight: 1.0 }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#000C1F]"
      style={{ height: '100dvh', minHeight: 600 }}
      aria-label="Wings Global Trade"
    >
      {/* Image layers — GSAP controls opacity */}
      <div ref={img0Ref} className="absolute inset-0" style={{ willChange: 'transform' }}>
        <Image src={SLIDES[0].image} alt="" fill className="object-cover" style={{ objectPosition: SLIDES[0].objectPosition }} sizes="100vw" priority />
        <Gradient />
      </div>
      <div ref={img1Ref} className="absolute inset-0">
        <Image src={SLIDES[1].image} alt="" fill className="object-cover" style={{ objectPosition: SLIDES[1].objectPosition }} sizes="100vw" />
        <Gradient />
      </div>
      <div ref={img2Ref} className="absolute inset-0">
        <Image src={SLIDES[2].image} alt="" fill className="object-cover" style={{ objectPosition: SLIDES[2].objectPosition }} sizes="100vw" />
        <Gradient />
      </div>

      {/* Slide 0: narrative */}
      <div ref={slide0Ref} className={contentClass}>
        <div className="max-w-4xl">
          <div ref={ruleRef} className="mb-6 h-px w-14 bg-gold" />
          <p ref={overlineRef} className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-warm-white/40">
            {SLIDES[0].overline}
          </p>
          <h1 ref={headlineRef} className="font-display font-light tracking-[-0.02em] text-warm-white" style={headingStyle}>
            {SLIDES[0].headline}
          </h1>
          <div ref={ctaRef} className="mt-10">
            <Link href={SLIDES[0].cta.href} className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover">
              <span className="h-px w-6 bg-current" aria-hidden />
              {SLIDES[0].cta.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide 1: camiones */}
      <div ref={slide1Ref} className={contentClass}>
        <div className="max-w-4xl">
          <div className="mb-6 h-px w-14 bg-warm-white/60" />
          <h2 className="font-display font-light tracking-[-0.02em] text-warm-white" style={headingStyle}>
            {SLIDES[1].headline}
          </h2>
          <div className="mt-10">
            <Link href={SLIDES[1].cta.href} className="inline-flex items-center gap-3 border border-warm-white/30 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white transition-all duration-200 hover:border-gold/50 hover:text-gold">
              <span className="h-px w-6 bg-current" aria-hidden />
              {SLIDES[1].cta.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide 2: agrícola */}
      <div ref={slide2Ref} className={contentClass}>
        <div className="max-w-4xl">
          <div className="mb-6 h-px w-14 bg-warm-white/60" />
          <h2 className="font-display font-light tracking-[-0.02em] text-warm-white" style={headingStyle}>
            {SLIDES[2].headline}
          </h2>
          <div className="mt-10">
            <Link href={SLIDES[2].cta.href} className="inline-flex items-center gap-3 border border-warm-white/30 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white transition-all duration-200 hover:border-gold/50 hover:text-gold">
              <span className="h-px w-6 bg-current" aria-hidden />
              {SLIDES[2].cta.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop dot indicator */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
        {desktopDots}
      </div>

      {/* Scroll indicator */}
      <div ref={scrollIndRef} className="absolute bottom-10 right-10 z-10 flex flex-col items-center gap-3" aria-hidden>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-warm-white/25">Scroll</span>
        <div className="h-10 w-px bg-warm-white/15" />
      </div>
    </section>
  )
}
