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
    headline: ['Más de 97 modelos.', 'Precio CIF sin', 'intermediarios.'],
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
    <section className="relative h-[100dvh] min-h-[620px] overflow-hidden bg-[#000C1F]">

      {/* Layer 1 — background image */}
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
              className="object-cover object-[center_20%] md:object-center"
              sizes="100vw"
              priority
            />
            {/* Mobile: uniform dark overlay — desktop uses SVG panel */}
            <div className="absolute inset-0 bg-[#000C1F]/72 md:hidden" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 2 — navy left panel + diagonal white border (desktop only) */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        {/* Navy panel: 46% wide at top, 40% wide at bottom */}
        <polygon points="0,0 460,0 400,1000 0,1000" fill="#001E50" />
        {/* Diagonal white accent line */}
        <line
          x1="460" y1="0" x2="400" y2="1000"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Layer 3 — grain texture */}
      <div className="hero-grain pointer-events-none absolute inset-0" />

      {/* Nav spacer */}
      <div className="h-16 md:h-[72px]" />

      {/* Layer 4 — text content */}
      <div className="relative z-10 flex h-[calc(100dvh-64px)] flex-col justify-center px-6 pb-24 md:h-[calc(100dvh-72px)] md:px-10 md:pb-28">
        <div className="mx-auto w-full max-w-6xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -6, transition: { duration: 0.22, ease: EASE_OUT } }}
              className="md:max-w-[42%]"
            >
              {/* Gold rule */}
              <motion.div
                className="mb-6 h-px w-8 bg-gold"
                style={{ originX: 0 }}
                variants={{
                  hidden: { scaleX: 0 },
                  visible: { scaleX: 1, transition: { duration: 0.6, ease: SPRING } },
                }}
              />

              {/* Overline */}
              <motion.p
                className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-warm-white/40"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.45, delay: 0.08, ease: SPRING } },
                }}
              >
                {slide.overline}
              </motion.p>

              {/* Headline — line-by-line mask reveal */}
              <div aria-label={slide.headline.join(' ')}>
                {slide.headline.map((line, i) => (
                  <div key={i} className="overflow-hidden">
                    <motion.span
                      className="block font-display font-light text-warm-white leading-[0.97] tracking-[-0.02em]"
                      style={{ fontSize: 'clamp(1.875rem, 3.4vw, 3.2rem)' }}
                      variants={{
                        hidden: { y: '110%' },
                        visible: {
                          y: '0%',
                          transition: { duration: 0.82, ease: SPRING, delay: 0.18 + i * 0.1 },
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
                className="mt-7 font-body text-body-md leading-relaxed text-warm-white/40"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1, y: 0,
                    transition: { duration: 0.5, ease: EASE_OUT, delay: 0.52 },
                  },
                }}
              >
                {slide.body}
              </motion.p>

              {/* CTA */}
              <motion.div
                className="mt-9"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1, y: 0,
                    transition: { duration: 0.5, ease: EASE_OUT, delay: 0.62 },
                  },
                }}
              >
                <Link
                  href={slide.cta.href}
                  className={
                    slide.gold
                      ? 'inline-flex items-center gap-3 bg-gold px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover'
                      : 'inline-flex items-center gap-3 border border-warm-white/25 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white transition-all duration-200 hover:border-gold/50 hover:text-gold'
                  }
                >
                  <span className="h-px w-5 bg-current" aria-hidden />
                  {slide.cta.label}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Layer 5 — slide indicators, absolute bottom-left, clear of CTA */}
      <div className="absolute bottom-7 left-6 z-20 flex items-center gap-3 md:left-10">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className="relative h-[2px] w-12 bg-warm-white/12 transition-colors hover:bg-warm-white/25"
          >
            {i === active && (
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 bg-gold"
                style={{ width: `${progress * 100}%` }}
              />
            )}
            {i < active && (
              <span aria-hidden className="absolute inset-y-0 left-0 right-0 bg-gold/35" />
            )}
          </button>
        ))}
        <span className="font-mono text-[9px] tracking-[0.18em] text-warm-white/22">
          0{active + 1} / 0{SLIDES.length}
        </span>
      </div>

    </section>
  )
}
