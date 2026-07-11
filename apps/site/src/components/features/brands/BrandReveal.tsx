// src/components/features/brands/BrandReveal.tsx
// The Odd Ritual preloader as the shelf's entry moment (clone grammar:
// count-up → mark reveal → inner lift → curtain lift). Áladín version: the
// genie isotipo rises out of a bottom clip — the mark IS the animation.
//
// Rendered through a portal on document.body: the root PageTransition
// animates opacity on <main>, and any in-tree overlay inherits that fade
// (navy body bleeds through) and sits under the fixed header. The portal
// escapes both — the reveal owns the full screen, like the clone's
// preloader. Plays on every hard load of a brand page; SPA navigation
// inside (brands) uses BrandCurtain instead. Reduced-motion never mounts
// the overlay at all.
'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const EASE_GANTRY = 'cubic-bezier(0.83,0,0.17,1)'
const EASE_SETTLE = 'cubic-bezier(0.22,1,0.36,1)'

interface BrandRevealProps {
  brand: { name: string; claim: string; isotipo: string }
}

export function BrandReveal({ brand }: BrandRevealProps) {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const probeRef = useRef<HTMLSpanElement>(null)
  const tokensRef = useRef<{ accent: string; accentInk: string }>({ accent: '', accentInk: '' })

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('done')
      return
    }
    // The portal target (body) sits outside [data-brand] — read the brand
    // tokens from the in-tree probe so no hex is ever hardcoded here.
    if (probeRef.current) {
      const style = getComputedStyle(probeRef.current)
      tokensRef.current = {
        accent: style.getPropertyValue('--rb-accent').trim(),
        accentInk: style.getPropertyValue('--rb-accent-ink').trim(),
      }
    }
    setPhase('playing')
  }, [])

  if (phase === 'done') return null
  return (
    <>
      <span ref={probeRef} hidden />
      {phase === 'playing' &&
        createPortal(
          <RevealOverlay brand={brand} tokens={tokensRef.current} onDone={() => setPhase('done')} />,
          document.body,
        )}
    </>
  )
}

function RevealOverlay({
  brand,
  tokens,
  onDone,
}: BrandRevealProps & { tokens: { accent: string; accentInk: string }; onDone: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const wrap = wrapRef.current
      if (!wrap) return

      // Scroll is held while the reveal owns the screen.
      document.documentElement.style.overflow = 'hidden'

      const counter = { value: 0 }
      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.style.overflow = ''
          onDone()
        },
      })

      tl.to(counter, {
        value: 100,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => {
          if (countRef.current) countRef.current.textContent = String(Math.round(counter.value))
        },
      })
        // The genie rises out of the clip — the brand reveal itself.
        .fromTo(
          '[data-reveal-mark]',
          { clipPath: 'inset(100% 0% 0% 0%)', y: 44, scale: 1.06 },
          { clipPath: 'inset(0% 0% 0% 0%)', y: 0, scale: 1, duration: 1.3, ease: EASE_SETTLE },
          0.15,
        )
        .fromTo(
          '[data-reveal-label]',
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE_SETTLE },
          0.9,
        )
        .to('[data-reveal-inner]', { yPercent: -28, autoAlpha: 0, duration: 0.5, ease: EASE_GANTRY }, '+=0.15')
        // White panel lifts first, exposing the brand-green flood for a
        // beat; the flood lifts right behind it — the curtain moment.
        .to('[data-reveal-white]', { yPercent: -101, duration: 0.9, ease: EASE_GANTRY }, '-=0.2')
        .to('[data-reveal-curtain]', { yPercent: -101, duration: 0.9, ease: EASE_GANTRY }, '-=0.62')

      return () => {
        document.documentElement.style.overflow = ''
      }
    },
    { scope: wrapRef },
  )

  return (
    <div ref={wrapRef} aria-hidden className="fixed inset-0 z-[100]">
      {/* Bottom layer: brand flood, revealed when the white lifts. Token
          values are read from the [data-brand] scope at mount — never
          hardcoded here. */}
      <div data-reveal-curtain className="absolute inset-0" style={{ background: tokens.accent }} />
      {/* White ground the reveal plays on */}
      <div data-reveal-white className="absolute inset-0 bg-white" />
      {/* Inner — mark, label, count */}
      <div
        data-reveal-inner
        className="absolute inset-0 flex flex-col items-center justify-center gap-5"
      >
        <div data-reveal-mark style={{ clipPath: 'inset(100% 0% 0% 0%)' }}>
          <Image
            src={brand.isotipo}
            alt=""
            width={200}
            height={200}
            priority
            className="h-36 w-auto md:h-44"
          />
        </div>
        <p
          data-reveal-label
          className="font-mono text-[11px] uppercase tracking-widest-3 text-neutral-500 opacity-0"
        >
          {brand.name} · {brand.claim}
        </p>
        <p ref={countRef} className="font-mono text-mono-lg tabular-nums" style={{ color: tokens.accentInk }}>
          0
        </p>
      </div>
    </div>
  )
}
