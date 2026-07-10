'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { EASE_OUT } from '@/lib/motion'

/**
 * «Trae tu grupo» ESQUEMA figure (GRANO register — wgt-grano spec/09).
 * Opacity is meaning: solid slot = cupo ocupado, ghost slot = cupo libre.
 * The atmosphere plate is pre-graded to dissolve into the #000C1F section;
 * the container itself is live vector so slot states can become dynamic later.
 */

const SLOTS = [true, true, false, true, true, false] // true = ocupado

const BOX = { x: 30, y: 84, w: 380, h: 104 }
const GAP = 5

export function SharedContainerFigure() {
  const shouldReduceMotion = useReducedMotion()
  const slotW = (BOX.w - GAP * (SLOTS.length + 1)) / SLOTS.length
  const groundY = BOX.y + BOX.h
  const dimY = groundY + 26

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      className="relative mx-auto w-full max-w-[580px]"
    >
      {/* Atmosphere plate — graded to the section navy; edges dissolve, no frame */}
      <Image
        src="/proceso/grano/container-field.webp"
        alt=""
        fill
        aria-hidden
        className="object-cover"
        sizes="(min-width: 1024px) 580px, 100vw"
      />

      <svg
        viewBox="0 0 440 260"
        role="img"
        aria-label="Contenedor compartido de 40 pies con seis cupos: cuatro ocupados en sólido y dos libres en fantasma"
        className="relative block w-full"
      >
        {/* header labels */}
        <text
          x={BOX.x}
          y={BOX.y - 22}
          className="fill-current font-mono text-[10px] uppercase tracking-[0.18em] text-warm-white/45"
        >
          Contenedor 40 HQ
        </text>
        <text
          x={BOX.x + BOX.w}
          y={BOX.y - 22}
          textAnchor="end"
          className="fill-current font-mono text-[10px] uppercase tracking-[0.18em] text-warm-white/45"
        >
          {SLOTS.length} cupos
        </text>

        {/* container shell — meaning edge: hard hairline */}
        <rect
          x={BOX.x}
          y={BOX.y}
          width={BOX.w}
          height={BOX.h}
          fill="none"
          strokeWidth="1"
          className="stroke-current text-warm-white/70"
        />
        {/* corner castings */}
        {[
          [BOX.x, BOX.y],
          [BOX.x + BOX.w - 6, BOX.y],
          [BOX.x, BOX.y + BOX.h - 6],
          [BOX.x + BOX.w - 6, BOX.y + BOX.h - 6],
        ].map(([cx, cy]) => (
          <rect
            key={`${cx}-${cy}`}
            x={cx}
            y={cy}
            width="6"
            height="6"
            className="fill-current text-warm-white/70"
          />
        ))}

        {/* slots — solid = ocupado · ghost 25–30% = libre */}
        {SLOTS.map((occupied, i) => {
          const x = BOX.x + GAP + i * (slotW + GAP)
          return occupied ? (
            <rect
              key={i}
              x={x}
              y={BOX.y + GAP}
              width={slotW}
              height={BOX.h - GAP * 2}
              className="fill-current text-warm-white/85"
            />
          ) : (
            <g key={i}>
              <rect
                x={x}
                y={BOX.y + GAP}
                width={slotW}
                height={BOX.h - GAP * 2}
                className="fill-current text-warm-white/10"
              />
              <rect
                x={x}
                y={BOX.y + GAP}
                width={slotW}
                height={BOX.h - GAP * 2}
                fill="none"
                strokeWidth="1"
                className="stroke-current text-warm-white/30"
              />
            </g>
          )
        })}

        {/* ground line — Tier-1 ground truth */}
        <line
          x1={BOX.x - 10}
          y1={groundY + 8}
          x2={BOX.x + BOX.w + 10}
          y2={groundY + 8}
          strokeWidth="1"
          className="stroke-current text-warm-white/15"
        />

        {/* dimension line — gold is numerals and dimension lines only */}
        <g className="text-gold/80">
          <line x1={BOX.x} y1={dimY} x2={BOX.x + BOX.w} y2={dimY} strokeWidth="0.75" className="stroke-current" />
          <line x1={BOX.x} y1={dimY - 5} x2={BOX.x} y2={dimY + 5} strokeWidth="0.75" className="stroke-current" />
          <line x1={BOX.x + BOX.w} y1={dimY - 5} x2={BOX.x + BOX.w} y2={dimY + 5} strokeWidth="0.75" className="stroke-current" />
          <text
            x={BOX.x + BOX.w / 2}
            y={dimY - 7}
            textAnchor="middle"
            className="fill-current font-mono text-[11px] tracking-[0.12em]"
          >
            12.03 M
          </text>
        </g>
      </svg>

      {/* legend */}
      <div className="relative flex items-center gap-6 pb-5 pl-[6.8%]">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/40">
          <span aria-hidden className="inline-block h-2.5 w-2.5 bg-warm-white/85" />
          Ocupado
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/40">
          <span aria-hidden className="inline-block h-2.5 w-2.5 border border-warm-white/25 bg-warm-white/10" />
          Cupo libre
        </span>
      </div>
    </motion.div>
  )
}
