// src/components/features/catalog/TradeRouteAnimation.tsx
'use client'

// TRADE ROUTE ANIMATION — SVG + GSAP MotionPath + DrawSVG
//
// The import journey visualised as scroll-driven motion:
//   DrawSVG draws the gold route as the section enters the viewport.
//   Each particle follows the exact SVG path via MotionPathPlugin.
//   Staggered per-particle ScrollTriggers create a convoy in transit —
//   the user scrolls to "advance the shipment" from China to ZOFRATACNA.
//
// Cargo weight seeds the system: heavier loads spawn more, larger particles.

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ORIGIN_PORTS, inferContainerType, freightRangeDisplay } from '@/lib/product-intelligence'

gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin, ScrollTrigger)

export interface TradeRouteAnimationProps {
  weight?: number
  className?: string
  sourceMarket?: string
  categorySlug?: string
}

// ── Route geometry (viewBox 500×180) ─────────────────────────────────────────
// Three waypoints: China coast → Pacific arc → ZOFRATACNA, Peru
const VW = 500
const VH = 180
const O  = { x: 70,  y: 58  }   // Origin
const C  = { x: 255, y: 152 }   // Pacific control point
const D  = { x: 440, y: 96  }   // Destination

// Quadratic bezier: M origin Q control destination
const PATH_D = `M ${O.x},${O.y} Q ${C.x},${C.y} ${D.x},${D.y}`

export function TradeRouteAnimation({
  weight = 3000,
  className,
  sourceMarket = 'China',
}: TradeRouteAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Cargo weight determines fleet size and particle radius
  const count  = Math.min(9, 3 + Math.floor(weight / 1800))
  const radius = weight > 8000 ? 3.5 : 2.5

  const originLabel   = ORIGIN_PORTS[sourceMarket]?.name?.split('·')[0]?.trim() ?? sourceMarket
  const containerType = inferContainerType(weight)
  const freightRange  = freightRangeDisplay(sourceMarket)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {

      if (reduced) {
        // Reduced motion: show fully-drawn static state immediately
        gsap.set('#tra-path', { drawSVG: '100%' })
        return
      }

      // ── 1. Background scaffold fades in first ─────────────────────────────
      // The ghost dashed line signals the route exists before it activates.
      gsap.from('#tra-scaffold', {
        opacity: 0,
        duration: 0.5,
        scrollTrigger: {
          trigger: svgRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })

      // ── 2. DrawSVG: gold route draws left → right on scroll ───────────────
      gsap.from('#tra-path', {
        drawSVG: '0%',
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: svgRef.current,
          start: 'top 78%',
          end: 'top 28%',
          scrub: 1.3,
        },
      })

      // ── 3. Waypoint nodes scale in with path ──────────────────────────────
      gsap.from('#tra-origin-ring, #tra-dest-ring', {
        scale: 0,
        opacity: 0,
        transformOrigin: 'center center',
        stagger: 0.15,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: svgRef.current,
          start: 'top 75%',
          end: 'top 55%',
          scrub: 1,
        },
      })

      // ── 4. Particles follow the path — staggered per-particle scrub ───────
      // Each particle receives a slightly earlier scroll range so they appear
      // at evenly-spaced positions along the route at any given scroll depth.
      // Convoy framing: particle 0 is furthest ahead, last particle is still
      // loading at the origin port.
      for (let i = 0; i < count; i++) {
        const lag = (i / count) * 30 // spread start across 30% of viewport height

        gsap.fromTo(
          `#tra-particle-${i}`,
          { opacity: 0 },
          {
            opacity: 1,
            motionPath: {
              path: '#tra-path',
              align: '#tra-path',
              autoRotate: false,
              alignOrigin: [0.5, 0.5],
            },
            ease: 'none',
            scrollTrigger: {
              trigger: svgRef.current,
              start: `top ${76 - lag}%`,
              end:   `top ${18 - lag}%`,
              scrub: 1.3,
            },
          }
        )
      }

      // ── 5. Labels + metadata strip fade in once path is visible ───────────
      gsap.from('.tra-label', {
        opacity: 0,
        y: 4,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: svgRef.current,
          start: 'top 65%',
          end: 'top 42%',
          scrub: 1,
        },
      })

    }, svgRef)

    return () => ctx.revert()
  }, [count, sourceMarket, weight])

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      className={className}
      style={{ width: '100%', aspectRatio: `${VW} / ${VH}` }}
      aria-label={`Ruta de importación desde ${originLabel} hasta ZOFRATACNA, Perú`}
      role="img"
    >
      <defs>
        {/* Particle soft glow — adds depth mid-ocean */}
        <filter id="tra-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Particle fade: dim near ports, bright mid-ocean */}
        <radialGradient id="tra-particle-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C4933F" stopOpacity="1" />
          <stop offset="100%" stopColor="#C4933F" stopOpacity="0.4" />
        </radialGradient>
      </defs>

      {/* ── Ghost scaffold — faint dashed route that pre-exists the animation ── */}
      <path
        id="tra-scaffold"
        d={PATH_D}
        stroke="rgba(248,246,240,0.08)"
        strokeWidth="1"
        strokeDasharray="2 6"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Animated gold route — DrawSVG targets this ───────────────────── */}
      <path
        id="tra-path"
        d={PATH_D}
        stroke="rgba(196,147,63,0.5)"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Origin waypoint ───────────────────────────────────────────────── */}
      <g id="tra-origin-ring">
        <circle cx={O.x} cy={O.y} r={4.5} fill="none" stroke="rgba(248,246,240,0.15)" strokeWidth="0.7" />
        <circle cx={O.x} cy={O.y} r={2}   fill="rgba(248,246,240,0.35)" />
      </g>

      {/* ── Destination waypoint — gold, more prominent ───────────────────── */}
      <g id="tra-dest-ring">
        <circle cx={D.x} cy={D.y} r={5}   fill="none" stroke="rgba(196,147,63,0.4)" strokeWidth="0.8" />
        <circle cx={D.x} cy={D.y} r={2.2} fill="#C4933F" />
      </g>

      {/* ── Particles — each gets a unique id for per-particle GSAP targeting ── */}
      {Array.from({ length: count }, (_, i) => {
        // Alternate opacity slightly for visual depth in the convoy
        const op = 0.5 + (i % 3) * 0.12
        return (
          <circle
            key={i}
            id={`tra-particle-${i}`}
            r={radius}
            cx={O.x}
            cy={O.y}
            fill={`rgba(196,147,63,${op})`}
            filter="url(#tra-glow)"
          />
        )
      })}

      {/* ── Labels ───────────────────────────────────────────────────────── */}
      <text
        className="tra-label"
        x={O.x}
        y={O.y - 11}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="8.5"
        fill="rgba(248,246,240,0.45)"
        letterSpacing="0.04em"
      >
        {originLabel}
      </text>
      <text
        className="tra-label"
        x={D.x}
        y={D.y - 12}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="8.5"
        fill="rgba(248,246,240,0.7)"
        letterSpacing="0.05em"
      >
        ZOFRATACNA
      </text>

      {/* ── Metadata strip — bottom edge ──────────────────────────────────── */}
      <text
        className="tra-label"
        x={8}
        y={VH - 7}
        fontFamily="monospace"
        fontSize="7.5"
        fill="rgba(196,147,63,0.85)"
        letterSpacing="0.03em"
      >
        {containerType}
      </text>
      <text
        className="tra-label"
        x={VW - 8}
        y={VH - 7}
        textAnchor="end"
        fontFamily="monospace"
        fontSize="7.5"
        fill="rgba(248,246,240,0.35)"
        letterSpacing="0.02em"
      >
        {freightRange}
      </text>
    </svg>
  )
}
