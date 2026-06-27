// src/components/features/mister/MisterCanvas.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { createNoise2D } from 'simplex-noise'

interface CategoryProfile {
  count: number
  size: number
  noiseScale: number
  speedMult: number
}

interface MisterCanvasProps {
  isLoading: boolean
  messageCount: number
  category?: string
}

const CATEGORY_PROFILES: Record<string, CategoryProfile> = {
  'maquinaria-agricola': { count: 45, size: 2.0, noiseScale: 0.002, speedMult: 0.8 },
  'camiones':            { count: 55, size: 1.5, noiseScale: 0.004, speedMult: 1.2 },
  'buses':               { count: 50, size: 1.5, noiseScale: 0.004, speedMult: 1.1 },
  'equipo-industrial':   { count: 65, size: 1.2, noiseScale: 0.005, speedMult: 0.9 },
  'repuestos':           { count: 80, size: 1.0, noiseScale: 0.006, speedMult: 1.0 },
}
const DEFAULT_PROFILE: CategoryProfile = { count: 60, size: 1.5, noiseScale: 0.003, speedMult: 1.0 }

export function MisterCanvas({ isLoading, messageCount, category }: MisterCanvasProps) {
  const shouldReduceMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canRender, setCanRender] = useState(true)

  // Refs let the RAF loop read current values without restarting
  const isLoadingRef = useRef(isLoading)
  const messageCountRef = useRef(messageCount)
  useEffect(() => { isLoadingRef.current = isLoading }, [isLoading])
  useEffect(() => { messageCountRef.current = messageCount }, [messageCount])

  useEffect(() => {
    if (navigator.hardwareConcurrency <= 2) {
      setCanRender(false)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const profile = category ? (CATEGORY_PROFILES[category] ?? DEFAULT_PROFILE) : DEFAULT_PROFILE
    const isMobile = window.innerWidth < 768
    const particleCount = isMobile ? Math.min(profile.count, 20) : profile.count

    const noise2D = createNoise2D()

    const particles: Array<{ x: number; y: number }> = []
    const dims = { w: 0, h: 0 }
    let time = 0
    let rafId: number

    function initParticles() {
      particles.length = 0
      for (let i = 0; i < particleCount; i++) {
        particles.push({ x: Math.random() * dims.w, y: Math.random() * dims.h })
      }
    }

    function setupCanvas() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas!.getBoundingClientRect()
      canvas!.width = rect.width * dpr
      canvas!.height = rect.height * dpr
      ctx!.scale(dpr, dpr)
      dims.w = rect.width
      dims.h = rect.height
      initParticles()
    }

    function tick() {
      const speed =
        (0.25 + (isLoadingRef.current ? 0.55 : 0) + Math.min(messageCountRef.current * 0.06, 0.8)) *
        profile.speedMult

      ctx!.clearRect(0, 0, dims.w, dims.h)
      ctx!.fillStyle = '#C4933F'
      ctx!.globalAlpha = 0.55

      for (const p of particles) {
        const angle =
          noise2D(p.x * profile.noiseScale + time, p.y * profile.noiseScale) * Math.PI * 2
        p.x += Math.cos(angle) * speed
        p.y += Math.sin(angle) * speed

        if (p.x < 0) p.x = dims.w
        if (p.x > dims.w) p.x = 0
        if (p.y < 0) p.y = dims.h
        if (p.y > dims.h) p.y = 0

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, profile.size, 0, Math.PI * 2)
        ctx!.fill()
      }

      time += 0.0008
      rafId = requestAnimationFrame(tick)
    }

    setupCanvas()
    tick()

    const ro = new ResizeObserver(() => {
      setupCanvas()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, []) // category/profile are URL-derived and stable for component lifetime

  if (shouldReduceMotion || !canRender) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full pointer-events-none opacity-[0.06]"
      aria-hidden
    />
  )
}
