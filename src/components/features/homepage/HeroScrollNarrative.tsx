'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Isomorphic layout effect — avoids SSR warning, runs synchronously before paint on client
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const HERO = {
  image: '/Importacion/home-carousel/hero-container-wings.png',
  objectPosition: 'center center',
  overline: 'Wings Global Trade',
  headline: 'Importación técnica para el mercado latinoamericano.',
  cta: { label: 'Consulta técnica', href: '/mister' },
} as const

export function HeroScrollNarrative() {
  const sectionRef     = useRef<HTMLElement>(null)
  const imageWrapRef   = useRef<HTMLDivElement>(null)
  const overlineRef    = useRef<HTMLParagraphElement>(null)
  const headlineRef    = useRef<HTMLHeadingElement>(null)
  const ctaRef         = useRef<HTMLDivElement>(null)
  const scrollIndRef   = useRef<HTMLDivElement>(null)
  const ruleRef        = useRef<HTMLDivElement>(null)

  // Set initial invisible states synchronously before first paint on desktop —
  // prevents a flash of visible content before GSAP takes over.
  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 768) return

    if (overlineRef.current) overlineRef.current.style.opacity = '0'
    if (ctaRef.current)      ctaRef.current.style.opacity      = '0'
    if (ruleRef.current)     ruleRef.current.style.transform   = 'scaleX(0)'
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      if (!headlineRef.current) return

      // Split headline into words for scroll-scrubbed stagger
      const split = new SplitText(headlineRef.current, { type: 'words' })

      // Words start invisible — GSAP reveals them
      gsap.set(split.words, { opacity: 0, y: 20 })

      // Rule origin from left
      if (ruleRef.current) {
        ruleRef.current.style.transformOrigin = 'left center'
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=100%',        // pin for exactly one viewport of scroll
          pin: true,
          scrub: 1.5,           // slight lag — silky with Lenis
          anticipatePin: 1,     // pre-applies will-change before pin kicks in
          invalidateOnRefresh: true,
        },
      })

      tl
        // ── 0–5%: scroll indicator fades out immediately
        .to(scrollIndRef.current, { opacity: 0, duration: 0.05, ease: 'none' }, 0)

        // ── 0–12%: image begins its parallax journey
        .to(imageWrapRef.current, { y: 70, ease: 'none', duration: 1 }, 0)

        // ── 4–18%: gold rule draws left to right
        .to(ruleRef.current, {
          scaleX: 1,
          duration: 0.14,
          ease: 'power2.inOut',
        }, 0.04)

        // ── 5–20%: overline fades up
        .to(overlineRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.15,
          ease: 'power2.out',
        }, 0.05)

        // ── 15–68%: headline words stagger in one by one
        .to(split.words, {
          opacity: 1,
          y: 0,
          stagger: 0.53 / Math.max(split.words.length, 1),
          duration: 0.22,
          ease: 'power2.out',
        }, 0.15)

        // ── 72–86%: CTA arrives
        .to(ctaRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.14,
          ease: 'power2.out',
        }, 0.72)

      return () => {
        split.revert()
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#000C1F] overflow-hidden"
      style={{ height: '100dvh', minHeight: 600 }}
      aria-label="Wings Global Trade — Importación B2B"
    >
      {/* Nav spacer — mobile only, keeps content below fixed header */}
      <div className="h-16 md:hidden" />

      {/* ── Background image ─────────────────────────────────────── */}
      <div
        ref={imageWrapRef}
        className="absolute inset-0"
        style={{ willChange: 'transform' }}
      >
        <Image
          src={HERO.image}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: HERO.objectPosition }}
          sizes="100vw"
          priority
        />

        {/* Desktop gradient — image bleeds into dark bottom */}
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[#000C1F]/85 via-[#000C1F]/20 to-transparent md:block" />

        {/* Mobile gradient — bleeds into StatBar navy */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#001E50] to-transparent md:hidden" />
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-14 md:px-14 md:pb-20">
        <div className="max-w-4xl">

          {/* Gold rule — reveals via scaleX on desktop */}
          <div
            ref={ruleRef}
            className="mb-6 h-px w-14 bg-gold"
            style={{ transformOrigin: 'left center' }}
          />

          {/* Overline */}
          <p
            ref={overlineRef}
            className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-warm-white/40"
          >
            {HERO.overline}
          </p>

          {/* Headline — SplitText targets this on desktop */}
          <h1
            ref={headlineRef}
            className="font-display font-light text-warm-white tracking-[-0.02em] leading-[1.0]"
            style={{ fontSize: 'clamp(2.2rem, 5.4vw, 5.4rem)' }}
          >
            {HERO.headline}
          </h1>

          {/* CTA */}
          <div ref={ctaRef} className="mt-10">
            <Link
              href={HERO.cta.href}
              className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover"
            >
              <span className="h-px w-6 bg-current" aria-hidden />
              {HERO.cta.label}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator — desktop only ─────────────────────── */}
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
