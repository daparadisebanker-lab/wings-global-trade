'use client'

import { useEffect, useRef } from 'react'

const FREQUENCIES = [0.015, 0.025, 0.04]
const PHASE_OFFSETS = [0, Math.PI / 3, (2 * Math.PI) / 3]
const BASE_AMPLITUDE = 8
const COLOR_IDLE = 'rgba(196,147,63,0.22)'
const COLOR_ACTIVE = 'rgba(196,147,63,0.70)'
const LINE_WIDTH = 1.5

export function useMisterWaveform(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isStreaming: boolean,
) {
  const isStreamingRef = useRef(isStreaming)
  const amplitudeRef = useRef(0.35)
  const colorRef = useRef(COLOR_IDLE)
  const rafRef = useRef<number | null>(null)
  const timeRef = useRef(0)

  // Keep ref in sync without restarting the RAF loop
  useEffect(() => {
    isStreamingRef.current = isStreaming
  }, [isStreaming])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1

    function applySize() {
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      // setTransform instead of scale to avoid accumulation on repeated resize
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    applySize()

    const ro = new ResizeObserver(applySize)
    ro.observe(canvas)

    if (prefersReduced) {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.strokeStyle = COLOR_IDLE
      ctx.lineWidth = LINE_WIDTH
      ctx.beginPath()
      ctx.moveTo(0, h / 2)
      ctx.lineTo(w, h / 2)
      ctx.stroke()
      ro.disconnect()
      return
    }

    let paused = document.hidden

    function onVisibility() {
      paused = document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)

    function draw() {
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      ctx!.clearRect(0, 0, w, h)

      const midY = h / 2
      const amp = amplitudeRef.current * BASE_AMPLITUDE

      ctx!.strokeStyle = colorRef.current
      ctx!.lineWidth = LINE_WIDTH

      for (let wi = 0; wi < FREQUENCIES.length; wi++) {
        ctx!.beginPath()
        for (let x = 0; x <= w; x++) {
          const y =
            midY + amp * Math.sin(FREQUENCIES[wi] * x + timeRef.current + PHASE_OFFSETS[wi])
          if (x === 0) ctx!.moveTo(x, y)
          else ctx!.lineTo(x, y)
        }
        ctx!.stroke()
      }
    }

    function loop() {
      if (!paused) {
        // Thinking/streaming: full amplitude amber. Idle: subtle ambient.
        const targetAmp = isStreamingRef.current ? 1.0 : 0.35
        const factor = isStreamingRef.current ? 0.08 : 0.12
        amplitudeRef.current += (targetAmp - amplitudeRef.current) * factor
        colorRef.current = isStreamingRef.current ? COLOR_ACTIVE : COLOR_IDLE
        timeRef.current += isStreamingRef.current ? 0.022 : 0.012
        draw()
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      document.removeEventListener('visibilitychange', onVisibility)
      ro.disconnect()
    }
  }, [canvasRef])
}
