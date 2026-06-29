'use client'

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// ── Shared data ─────────────────────────────────────────────────────────────
const SLIDE_MS        = 6000
const SWIPE_THRESHOLD = 50
const SPRING          = [0.16, 1, 0.3, 1]  as [number, number, number, number]
const EASE_OUT        = [0, 0, 0.2, 1]     as [number, number, number, number]

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

// ── SVG arrows (mobile carousel only) ─────────────────────────────────────
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

// ── Mobile-only: Framer Motion slide content ─────────────────────────────
function SlideContent({
  slide, align, index, total, showCounter = false,
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
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT, delay: 0.05 } } }}
          >
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </motion.p>
        )}
        <motion.div
          className={`mb-5 h-px w-14 bg-warm-white ${right ? 'ml-auto' : ''}`}
          style={{ originX: right ? 1 : 0 }}
          variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.6, ease: SPRING } } }}
        />
        <div aria-label={slide.headlineLines.join(' ')}>
          {slide.headlineLines.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.span
                className="block font-display font-light text-warm-white tracking-[-0.02em]"
                style={{ fontSize: 'clamp(2rem, 3.6vw, 3.5rem)', lineHeight: 1.05 }}
                variants={{ hidden: { y: '110%' }, visible: { y: '0%', transition: { duration: 0.8, ease: SPRING, delay: 0.15 + i * 0.1 } } }}
              >
                {line}
              </motion.span>
            </div>
          ))}
        </div>
        <motion.div
          className={`mt-7 flex ${right ? 'justify-end' : 'justify-start'}`}
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT, delay: 0.55 } } }}
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

// ── Shared gradient overlay ─────────────────────────────────────────────────
function Gradient() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: 'linear-gradient(to top, rgba(0,12,31,0.85) 0%, rgba(0,12,31,0.22) 45%, transparent 100%)' }}
    />
  )
}

// ── Main export ─────────────────────────────────────────────────────────────
export function HeroNarrativeCarousel() {
  // Tracks the visible slide for the dot indicator (desktop) and carousel (mobile)
  const [activeSlide, setActiveSlide] = useState(0)
  // Whether we're rendering the mobile carousel path
  const [isMobile, setIsMobile] = useState(false)
  const reduce = useReducedMotion()

  // ── Desktop GSAP refs ───────────────────────────────────────────────────
  const sectionRef    = useRef<HTMLElement>(null)
  // Image layers (stacked, opacity-controlled)
  const img0Ref       = useRef<HTMLDivElement>(null)
  const img1Ref       = useRef<HTMLDivElement>(null)
  const img2Ref       = useRef<HTMLDivElement>(null)
  // Content panels (x-translated to slide in/out)
  const slide0Ref     = useRef<HTMLDivElement>(null)
  const slide1Ref     = useRef<HTMLDivElement>(null)
  const slide2Ref     = useRef<HTMLDivElement>(null)
  // Narrative-specific elements (inside slide0)
  const ruleRef       = useRef<HTMLDivElement>(null)
  const overlineRef   = useRef<HTMLParagraphElement>(null)
  const headlineRef   = useRef<HTMLHeadingElement>(null)
  const ctaRef        = useRef<HTMLDivElement>(null)
  const scrollIndRef  = useRef<HTMLDivElement>(null)

  // ── Mobile carousel refs ───────────────────────────────────────────────
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX   = useRef<number | null>(null)

  // ── Detect mobile & set initial GSAP states (before first paint) ────────
  useLayoutEffect(() => {
    const mobile = window.innerWidth < 768 || !!reduce
    setIsMobile(mobile)
    if (mobile) return

    // Desktop initial states — GSAP will animate these in
    gsap.set(overlineRef.current,  { opacity: 0, y: 10 })
    gsap.set(ctaRef.current,       { opacity: 0, y: 10 })
    gsap.set(ruleRef.current,      { scaleX: 0, transformOrigin: 'left center' })
    // Slides 1 & 2 content panels start off-screen right — scroll will wipe them in
    gsap.set([slide1Ref.current, slide2Ref.current], { xPercent: 100 })
    // Slides 1 & 2 images start invisible
    gsap.set([img1Ref.current, img2Ref.current], { opacity: 0 })
  }, [reduce])

  // ── Desktop: single GSAP ScrollTrigger timeline driving everything ───────
  useEffect(() => {
    if (isMobile || reduce) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      if (!headlineRef.current) return

      // Split narrative headline into words for scroll-scrubbed stagger
      const split = new SplitText(headlineRef.current, { type: 'words' })
      gsap.set(split.words, { opacity: 0, y: 18 })

      // ── Timeline layout (total = 10 "units" = 300% of viewport scroll) ──
      //
      //  0.0 – 3.3  │ Narrative: word stagger scrub (≈ 1 viewport of scroll)
      //  3.3 – 5.0  │ Slide 0 → 1: horizontal wipe + image crossfade
      //  5.0 – 6.5  │ Dwell on Slide 1
      //  6.5 – 8.3  │ Slide 1 → 2: horizontal wipe + image crossfade
      //  8.3 – 10.0 │ Dwell on Slide 2, pin releases
      //
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%',          // 3 full viewports of scroll for the complete arc
          pin: true,
          scrub: 1.5,             // weighted lag — animations trail scroll for cinematic feel
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
            // Update dot indicator
            if      (self.progress < 0.38) setActiveSlide(0)
            else if (self.progress < 0.73) setActiveSlide(1)
            else                            setActiveSlide(2)
          },
        },
      })

      tl
        // ── Narrative (0 → 3.3) ─────────────────────────────────────────
        // Scroll indicator out immediately
        .to(scrollIndRef.current, { opacity: 0, duration: 0.15, ease: 'none' }, 0)

        // Subtle image parallax throughout narrative
        .to(img0Ref.current, { y: 50, ease: 'none', duration: 3.3 }, 0)

        // Gold rule draws left → right
        .to(ruleRef.current, { scaleX: 1, duration: 0.35, ease: 'power2.inOut' }, 0.1)

        // Overline fades up
        .to(overlineRef.current, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.18)

        // Headline words stagger in with scroll — the core narrative moment
        .to(split.words, {
          opacity: 1,
          y: 0,
          stagger: 1.6 / Math.max(split.words.length, 1),
          duration: 0.5,
          ease: 'power2.out',
        }, 0.42)

        // CTA arrives near the end of narrative
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 2.5)

        // ── Slide 0 → 1 wipe (3.3 → 5.0) ───────────────────────────────
        // Slide 0 content exits left, Slide 1 enters from right (horizontal wipe)
        .to(slide0Ref.current, { xPercent: -100, duration: 1.7, ease: 'power2.inOut' }, 3.3)
        .to(slide1Ref.current, { xPercent: 0,    duration: 1.7, ease: 'power2.inOut' }, 3.3)
        // Images crossfade: Slide 0 out → Slide 1 in (staggered for depth)
        .to(img0Ref.current,   { opacity: 0,     duration: 0.9, ease: 'power1.out'  }, 3.4)
        .to(img1Ref.current,   { opacity: 1,     duration: 0.9, ease: 'power1.in'   }, 4.1)

        // ── Dwell on Slide 1 (5.0 → 6.5) — nothing changes ────────────

        // ── Slide 1 → 2 wipe (6.5 → 8.3) ───────────────────────────────
        .to(slide1Ref.current, { xPercent: -100, duration: 1.8, ease: 'power2.inOut' }, 6.5)
        .to(slide2Ref.current, { xPercent: 0,    duration: 1.8, ease: 'power2.inOut' }, 6.5)
        .to(img1Ref.current,   { opacity: 0,     duration: 0.9, ease: 'power1.out'  }, 6.6)
        .to(img2Ref.current,   { opacity: 1,     duration: 0.9, ease: 'power1.in'   }, 7.4)

        // ── Dwell on Slide 2 (8.3 → 10) — pin releases at 10 ──────────

      return () => {
        split.revert()
      }
    })

    return () => mm.revert()
  }, [isMobile, reduce])

  // ── Mobile carousel: auto-advance ──────────────────────────────────────
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

  // ── Dot indicator (shared between desktop + mobile) ────────────────────
  const dots = (
    <div className="flex items-center gap-2">
      {SLIDES.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => isMobile ? goTo(i) : undefined}
          aria-label={`Slide ${i + 1}`}
          className={`h-[2px] transition-all duration-300 ${
            i === activeSlide ? 'w-8 bg-gold' : 'w-4 bg-warm-white/25 hover:bg-warm-white/50'
          }`}
        />
      ))}
    </div>
  )

  // ── Render: mobile carousel ─────────────────────────────────────────────
  if (isMobile) {
    const slide = SLIDES[activeSlide]
    return (
      <section
        className="relative bg-[#000C1F]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Wings Global Trade"
      >
        <div className="h-16 md:hidden" />
        <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-auto md:h-[min(100dvh,_820px)] md:min-h-[600px]">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={slide.id + '-bg'}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: EASE_OUT }}
            >
              <Image src={slide.image} alt="" fill className="object-cover" style={{ objectPosition: slide.objectPosition }} sizes="100vw" priority={activeSlide === 0} />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#001E50] to-transparent md:hidden" />
          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[#000C1F]/75 via-[#000C1F]/20 to-transparent md:block" />
          <button type="button" onClick={prev} aria-label="Slide anterior" className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#000C1F]/35 text-warm-white/75 transition-all duration-200 hover:bg-[#000C1F]/55 hover:text-warm-white md:left-5 md:rounded-none md:bg-transparent md:text-warm-white/50">
            <ChevronLeft />
          </button>
          <button type="button" onClick={next} aria-label="Siguiente slide" className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#000C1F]/35 text-warm-white/75 transition-all duration-200 hover:bg-[#000C1F]/55 hover:text-warm-white md:right-5 md:rounded-none md:bg-transparent md:text-warm-white/50">
            <ChevronRight />
          </button>
          <div className="absolute bottom-12 right-6 z-10 hidden max-w-[42%] md:block md:bottom-16 md:right-14">
            <SlideContent slide={slide} align="right" index={activeSlide} total={SLIDES.length} />
          </div>
          <div className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 md:flex">{dots}</div>
        </div>
        <div className="bg-[#001E50] px-6 pb-8 pt-6 md:hidden">
          <SlideContent slide={slide} align="left" index={activeSlide} total={SLIDES.length} showCounter />
        </div>
      </section>
    )
  }

  // ── Render: desktop scroll-driven ──────────────────────────────────────
  // 3 images stacked (GSAP controls opacity)
  // 3 content panels stacked (GSAP controls xPercent)
  // One ScrollTrigger timeline drives all of it
  const contentClass = 'absolute inset-0 flex flex-col justify-end px-6 pb-14 md:px-14 md:pb-20'
  const headingStyle = { fontSize: 'clamp(2.2rem, 5.4vw, 5.4rem)', lineHeight: 1.0 }

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#000C1F] overflow-hidden"
      style={{ height: '100dvh', minHeight: 600 }}
      aria-label="Wings Global Trade"
    >
      {/* ── Image layers (stacked, GSAP crossfades opacity) ─────────────── */}
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

      {/* ── Slide 0: narrative (scroll scrubs words in) ──────────────────── */}
      <div ref={slide0Ref} className={contentClass}>
        <div className="max-w-4xl">
          <div
            ref={ruleRef}
            className="mb-6 h-px w-14 bg-gold"
          />
          <p
            ref={overlineRef}
            className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-warm-white/40"
          >
            {SLIDES[0].overline}
          </p>
          <h1
            ref={headlineRef}
            className="font-display font-light text-warm-white tracking-[-0.02em]"
            style={headingStyle}
          >
            {SLIDES[0].headline}
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

      {/* ── Slide 1: camiones (wipes in from right on scroll) ───────────── */}
      <div ref={slide1Ref} className={contentClass}>
        <div className="max-w-4xl">
          <div className="mb-6 h-px w-14 bg-warm-white/60" />
          <h2
            className="font-display font-light text-warm-white tracking-[-0.02em]"
            style={headingStyle}
          >
            {SLIDES[1].headline}
          </h2>
          <div className="mt-10">
            <Link
              href={SLIDES[1].cta.href}
              className="inline-flex items-center gap-3 border border-warm-white/30 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white transition-all duration-200 hover:border-gold/50 hover:text-gold"
            >
              <span className="h-px w-6 bg-current" aria-hidden />
              {SLIDES[1].cta.label}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Slide 2: agrícola (wipes in from right on scroll) ────────────── */}
      <div ref={slide2Ref} className={contentClass}>
        <div className="max-w-4xl">
          <div className="mb-6 h-px w-14 bg-warm-white/60" />
          <h2
            className="font-display font-light text-warm-white tracking-[-0.02em]"
            style={headingStyle}
          >
            {SLIDES[2].headline}
          </h2>
          <div className="mt-10">
            <Link
              href={SLIDES[2].cta.href}
              className="inline-flex items-center gap-3 border border-warm-white/30 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white transition-all duration-200 hover:border-gold/50 hover:text-gold"
            >
              <span className="h-px w-6 bg-current" aria-hidden />
              {SLIDES[2].cta.label}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Dot indicator ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
        {dots}
      </div>

      {/* ── Scroll indicator — fades out on first scroll ─────────────────── */}
      <div
        ref={scrollIndRef}
        className="absolute bottom-10 right-10 z-10 flex flex-col items-center gap-3"
        aria-hidden
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-warm-white/25">Scroll</span>
        <div className="h-10 w-px bg-warm-white/15" />
      </div>
    </section>
  )
}
