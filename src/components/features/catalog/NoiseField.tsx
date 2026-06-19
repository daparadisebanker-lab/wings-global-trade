// src/components/features/catalog/NoiseField.tsx
'use client'

// NOISE FIELD SEEDED BY HP — the machine's power expressed as ambient movement.
//
// One algorithm, many personalities. A sine-based vector field steers short line
// segments; HP sets the tempo and density. A 50 HP tractor drifts slow, sparse,
// barely-there. A 400 HP truck churns fast and dense. The field never resolves —
// it's atmosphere behind the gallery, not a chart.
//
// angle(x,y,t) = sin(x*0.15 + seed*0.01) * cos(y*0.15 + t*speed)

import { useEffect, useRef } from 'react'

interface NoiseFieldProps {
  hp?: number
  className?: string
}

const GOLD = '196,147,63' // #C4933F
const WARM = '248,246,240' // #F8F6F0

/** Map HP (≈18–400) to flow personality. */
function personality(hp: number) {
  const t = Math.max(0, Math.min(1, (hp - 18) / (400 - 18)))
  return {
    speed: 0.3 + t * 0.9, // 0.3 → 1.2
    segments: Math.round(50 + t * 150), // 50 → 200
    opacity: 0.04 + t * 0.04, // 0.04 → 0.08
    seed: hp,
  }
}

export function NoiseField({ hp = 50, className }: NoiseFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { speed, segments, opacity, seed } = personality(hp)

    let raf = 0
    let t = 0
    let width = 0
    let height = 0
    let dpr = 1

    type P = { x: number; y: number }
    let particles: P[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Seed particles deterministically from HP so the layout is stable.
      let s = (seed * 2654435761) >>> 0
      const rand = () => {
        s = (s + 0x6d2b79f5) >>> 0
        let x = Math.imul(s ^ (s >>> 15), 1 | s)
        x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296
      }
      particles = Array.from({ length: segments }, () => ({
        x: rand() * width,
        y: rand() * height,
      }))
      ctx.clearRect(0, 0, width, height)
    }

    const angle = (x: number, y: number) =>
      Math.sin(x * 0.015 + seed * 0.01) * Math.cos(y * 0.015 + t * speed)

    const step = () => {
      // Fade the previous frame instead of clearing — leaves soft flow trails.
      ctx.fillStyle = 'rgba(0,30,80,0.05)'
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'source-over'

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const a = angle(p.x, p.y) * Math.PI * 2
        const nx = p.x + Math.cos(a) * (1 + speed)
        const ny = p.y + Math.sin(a) * (1 + speed)

        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(nx, ny)
        ctx.strokeStyle = `rgba(${i % 2 === 0 ? GOLD : WARM},${opacity})`
        ctx.lineWidth = 1
        ctx.stroke()

        p.x = nx
        p.y = ny
        // Wrap around edges so the field stays populated.
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0
      }

      t += 0.01
      raf = requestAnimationFrame(step)
    }

    resize()
    if (reduceMotion) {
      // Draw a single static frame, then stop.
      for (let k = 0; k < 12; k++) step()
      cancelAnimationFrame(raf)
    } else {
      raf = requestAnimationFrame(step)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [hp])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      role="presentation"
    />
  )
}
