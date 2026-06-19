// src/components/features/catalog/CellularAutomaton.tsx
'use client'

// CELLULAR LIFE FROM SPECS — the product grows its own organism.
//
// GVW and HP seed a 32×8 Conway-like grid via an LCG. The initial colony is
// fully determined by the machine, so two products side by side run
// fundamentally different lifeforms in a thin decorative strip. Toroidal wrap
// keeps the colony from dying at the edges; a light reseed every few hundred
// generations keeps it from settling into a still life.

import { useEffect, useRef } from 'react'

interface CellularAutomatonProps {
  gvw?: number
  hp?: number
  className?: string
}

const COLS = 32
const ROWS = 8
const TICK_MS = 600
const GOLD = '#C4933F'

/** Linear congruential generator — deterministic from the spec seed. */
function makeLcg(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function seedGrid(gvw: number, hp: number): Uint8Array {
  const seed = ((gvw || 3000) * 31 + (hp || 50) * 17) >>> 0
  const rand = makeLcg(seed)
  const grid = new Uint8Array(COLS * ROWS)
  // Density also rides on the seed so heavier/stronger machines start busier.
  const density = 0.28 + (rand() * 0.22)
  for (let i = 0; i < grid.length; i++) grid[i] = rand() < density ? 1 : 0
  return grid
}

function nextGen(grid: Uint8Array): Uint8Array {
  const out = new Uint8Array(grid.length)
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let n = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          const nx = (x + dx + COLS) % COLS
          const ny = (y + dy + ROWS) % ROWS
          n += grid[ny * COLS + nx]
        }
      }
      const alive = grid[y * COLS + x] === 1
      out[y * COLS + x] = alive ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0
    }
  }
  return out
}

export function CellularAutomaton({ gvw = 3000, hp = 50, className }: CellularAutomatonProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    let width = 0
    const HEIGHT = 32
    let dpr = 1
    let cellW = 0
    const cellH = HEIGHT / ROWS

    let grid = seedGrid(gvw, hp)
    let prev = grid // for the one-frame "dying" trail
    let generations = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(HEIGHT * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cellW = width / COLS
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, HEIGHT)
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const idx = y * COLS + x
          const alive = grid[idx] === 1
          const dying = !alive && prev[idx] === 1
          if (!alive && !dying) continue
          ctx.globalAlpha = alive ? 0.8 : 0.2
          ctx.fillStyle = GOLD
          // Inset by 1px so cells read as a colony, not a solid bar.
          ctx.fillRect(x * cellW + 0.5, y * cellH + 0.5, cellW - 1, cellH - 1)
        }
      }
      ctx.globalAlpha = 1
    }

    resize()
    draw()

    let interval: ReturnType<typeof setInterval> | undefined
    if (!reduceMotion) {
      interval = setInterval(() => {
        prev = grid
        grid = nextGen(grid)
        generations++
        // Periodic gentle reseed so the organism never fully stalls.
        if (generations % 240 === 0) {
          const reborn = seedGrid(gvw + generations, hp)
          for (let i = 0; i < grid.length; i++) grid[i] = grid[i] || reborn[i]
        }
        draw()
      }, TICK_MS)
    }

    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    ro.observe(canvas)

    return () => {
      if (interval) clearInterval(interval)
      ro.disconnect()
    }
  }, [gvw, hp])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: 32 }}
      aria-hidden="true"
      role="presentation"
    />
  )
}
