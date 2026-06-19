// src/components/features/catalog/TradeRouteAnimation.tsx
'use client'

// TRADE ROUTE ANIMATION — the import journey as ambient motion.
//
// Particles flow along a bezier from the China coast, across the Pacific, to
// ZOFRATACNA in Peru. Weight seeds the system: heavier machines send more,
// slower particles — freight you can feel. Canvas 2D, ~subtle, ~10kb. Three
// waypoints in a 500×180 stage.

import { useEffect, useRef } from 'react'

interface TradeRouteAnimationProps {
  weight?: number
  className?: string
}

const GOLD = '196,147,63'
const WARM = '248,246,240'

const VW = 500
const VH = 180

// Three waypoints (canvas coords): China coast → Pacific midpoint → ZOFRATACNA.
const ORIGIN = { x: 70, y: 58 }
const PACIFIC = { x: 250, y: 150 }
const DEST = { x: 440, y: 96 }

/** Quadratic bezier through the Pacific control point. */
function bezier(t: number) {
  const mt = 1 - t
  const x = mt * mt * ORIGIN.x + 2 * mt * t * PACIFIC.x + t * t * DEST.x
  const y = mt * mt * ORIGIN.y + 2 * mt * t * PACIFIC.y + t * t * DEST.y
  return { x, y }
}

export function TradeRouteAnimation({ weight = 3000, className }: TradeRouteAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const count = 5 + Math.floor((weight ?? 3000) / 500)
    const speed = 0.8 - Math.min(0.6, (weight ?? 3000) / 20000)

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = VW * dpr
    canvas.height = VH * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Stagger particles evenly along the route.
    const particles = Array.from({ length: count }, (_, i) => ({
      t: i / count,
      r: 2 + ((i * 7) % 2), // 2–3px
    }))

    const drawRoute = () => {
      ctx.clearRect(0, 0, VW, VH)

      // Faint dashed waypoint line — the route scaffold.
      ctx.beginPath()
      ctx.moveTo(ORIGIN.x, ORIGIN.y)
      ctx.quadraticCurveTo(PACIFIC.x, PACIFIC.y, DEST.x, DEST.y)
      ctx.setLineDash([3, 6])
      ctx.strokeStyle = `rgba(${WARM},0.2)`
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.setLineDash([])

      // Waypoint nodes.
      for (const wp of [ORIGIN, DEST]) {
        ctx.beginPath()
        ctx.arc(wp.x, wp.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${WARM},0.35)`
        ctx.fill()
      }

      // Particles in transit.
      for (const p of particles) {
        const pos = bezier(p.t)
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, p.r, 0, Math.PI * 2)
        const fade = Math.sin(p.t * Math.PI) // dim near the ports, bright mid-ocean
        ctx.fillStyle = `rgba(${GOLD},${0.35 + fade * 0.45})`
        ctx.fill()
      }
    }

    let raf = 0
    const step = () => {
      for (const p of particles) {
        p.t += speed * 0.0025
        if (p.t > 1) p.t -= 1
      }
      drawRoute()
      raf = requestAnimationFrame(step)
    }

    if (reduceMotion) {
      drawRoute()
    } else {
      raf = requestAnimationFrame(step)
    }

    return () => cancelAnimationFrame(raf)
  }, [weight])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', aspectRatio: `${VW} / ${VH}` }}
      aria-hidden="true"
      role="presentation"
    />
  )
}
