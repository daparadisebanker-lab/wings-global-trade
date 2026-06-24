// src/components/features/homepage/MarketMap.tsx
'use client'

import { motion } from 'framer-motion'
import { FADE_UP, FADE_UP_TRANSITION, VIEWPORT_ONCE } from '@/lib/motion'

// Destination market pins — positioned in viewBox 0 0 400 600
const DESTINATION_PINS = [
  { label: 'Colombia', x: 138, y: 185 },
  { label: 'Panamá', x: 115, y: 160 },
  { label: 'Perú', x: 148, y: 290 },
  { label: 'Bolivia', x: 182, y: 328 },
  { label: 'Chile', x: 158, y: 415 },
]

// Source market labels rendered above the SVG
const SOURCE_LABELS = ['China', 'Japón', 'Tailandia', 'Dubai']

// Freight corridor arcs: quadratic bezier paths
// Control point is placed offshore (to the left / above the Pacific) for a natural arc
const FREIGHT_ARCS = [
  {
    // China → Callao (Lima/Peru): arc originates from left-edge label area
    id: 'arc-china-callao',
    d: 'M 20 120 Q -60 240 148 290',
    strokeWidth: 1.5,
    opacity: 0.45,
    dashArray: '6 4',
  },
  {
    // China → Valparaíso (Chile)
    id: 'arc-china-chile',
    d: 'M 20 120 Q -80 300 158 415',
    strokeWidth: 1.5,
    opacity: 0.4,
    dashArray: '6 4',
  },
  {
    // Japan → Callao
    id: 'arc-japan-callao',
    d: 'M 20 90 Q -50 200 148 290',
    strokeWidth: 1.5,
    opacity: 0.38,
    dashArray: '6 4',
  },
  {
    // Thailand → Callao
    id: 'arc-thailand-callao',
    d: 'M 20 105 Q -55 220 148 290',
    strokeWidth: 1.2,
    opacity: 0.35,
    dashArray: '5 5',
  },
  {
    // Dubai → Callao (lighter, longer arc from right side)
    id: 'arc-dubai-callao',
    d: 'M 380 80 Q 460 220 148 290',
    strokeWidth: 1,
    opacity: 0.3,
    dashArray: '4 6',
  },
]

export function MarketMap() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left column — copy */}
        <motion.div
          variants={FADE_UP}
          initial="initial"
          whileInView="animate"
          viewport={VIEWPORT_ONCE}
          transition={FADE_UP_TRANSITION}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-widest-2 text-gold">
            Presencia regional
          </p>
          <h2 className="font-display text-display-md font-light text-navy">
            Siete mercados, dos zonas francas, una operación
          </h2>
          <p className="mt-4 max-w-md font-body text-base text-text-muted">
            Operamos corredores de importación hacia los principales mercados de América Latina,
            con gestión documental y logística desde ZOFRATACNA y ZOFRI.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-2">
            {DESTINATION_PINS.map((p) => (
              <li key={p.label} className="flex items-center gap-2 font-mono text-sm text-navy">
                <span className="h-2 w-2 rounded-full bg-gold" />
                {p.label}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right column — SVG map */}
        <motion.div
          variants={FADE_UP}
          initial="initial"
          whileInView="animate"
          viewport={VIEWPORT_ONCE}
          transition={{ ...FADE_UP_TRANSITION, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          {/* Source market labels — DM Mono, 10px, gray */}
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] text-navy/40">
            {SOURCE_LABELS.map((src, i) => (
              <span key={src}>
                {src}
                {i < SOURCE_LABELS.length - 1 && (
                  <span className="ml-3 opacity-40">·</span>
                )}
              </span>
            ))}
          </div>

          {/*
            SVG: viewBox 0 0 400 600
            Left edge (x≈20) represents Asian/Middle East source origin anchors.
            Right edge (x≈380) represents Dubai anchor.
            The LATAM continental shape occupies roughly x:90–240, y:80–520.
          */}
          <svg
            viewBox="0 0 400 600"
            className="h-auto w-full max-w-sm"
            role="img"
            aria-labelledby="market-map-title"
            aria-describedby="market-map-desc"
          >
            <title id="market-map-title">Mapa de cobertura de mercados — Wings Global Trade</title>
            <desc id="market-map-desc">
              Mapa mostrando corredores de importación desde Asia y Medio Oriente hacia zonas francas
              en Perú y Chile, con destinos activos en América Latina.
            </desc>

            {/*
              Simplified LATAM continental outline.
              Covers: Panama (north) down through Colombia, Ecuador/Peru, Bolivia, Chile (south).
              This is a minimal stylized path — not a GeoJSON projection.
            */}
            <path
              d="
                M 115 155
                L 130 148
                L 148 150
                L 162 158
                L 172 172
                L 175 185
                L 168 200
                L 175 215
                L 180 230
                L 175 250
                L 168 265
                L 172 280
                L 175 295
                L 178 315
                L 185 330
                L 188 350
                L 183 370
                L 175 390
                L 168 410
                L 162 430
                L 155 455
                L 148 480
                L 142 500
                L 136 480
                L 130 455
                L 125 430
                L 120 408
                L 115 390
                L 110 370
                L 108 350
                L 112 330
                L 118 310
                L 122 292
                L 118 275
                L 112 258
                L 108 242
                L 110 225
                L 115 210
                L 112 195
                L 108 180
                L 110 165
                Z
              "
              fill="#001E50"
              fillOpacity="0.08"
            />

            {/* Source market anchor marks — small navy squares at left/right edges */}
            <rect x="10" y="85" width="5" height="5" fill="#001E50" fillOpacity="0.5" />
            <text x="18" y="91" fontFamily="DM Mono, monospace" fontSize="8" fill="#001E50" fillOpacity="0.4">
              JP
            </text>
            <rect x="10" y="100" width="5" height="5" fill="#001E50" fillOpacity="0.5" />
            <text x="18" y="106" fontFamily="DM Mono, monospace" fontSize="8" fill="#001E50" fillOpacity="0.4">
              TH
            </text>
            <rect x="10" y="115" width="5" height="5" fill="#001E50" fillOpacity="0.5" />
            <text x="18" y="121" fontFamily="DM Mono, monospace" fontSize="8" fill="#001E50" fillOpacity="0.4">
              CN
            </text>
            <rect x="375" y="75" width="5" height="5" fill="#001E50" fillOpacity="0.5" />
            <text x="340" y="71" fontFamily="DM Mono, monospace" fontSize="8" fill="#001E50" fillOpacity="0.4">
              DXB
            </text>

            {/* Freight corridor arcs — Framer Motion pathLength draw-in on scroll entry */}
            {FREIGHT_ARCS.map((arc, index) => (
              <motion.path
                key={arc.id}
                id={arc.id}
                d={arc.d}
                fill="none"
                stroke="#C4933F"
                strokeWidth={arc.strokeWidth}
                strokeDasharray={arc.dashArray}
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: arc.opacity }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  pathLength: { duration: 1.8, delay: index * 0.25, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.3, delay: index * 0.25 },
                }}
              />
            ))}

            {/* Destination pins — ambient pulse rings active from mount, stable core dots */}
            {DESTINATION_PINS.map((pin, pinIndex) => (
              <g key={pin.label}>
                {/* Outer pulse ring — always animating from mount, not gated by scroll */}
                <motion.circle
                  cx={pin.x}
                  cy={pin.y}
                  r={6}
                  fill="#C4933F"
                  fillOpacity={0}
                  stroke="#C4933F"
                  strokeWidth={1}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'easeInOut',
                    delay: pinIndex * 0.3,
                  }}
                />
                {/* Core pin — stable, no animation */}
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r="4"
                  fill="#C4933F"
                  stroke="#001E50"
                  strokeWidth="1.5"
                />
                {/* Pin label */}
                <text
                  x={pin.x + 8}
                  y={pin.y + 4}
                  fontFamily="DM Mono, monospace"
                  fontSize="9"
                  fill="#001E50"
                  fillOpacity="0.7"
                >
                  {pin.label}
                </text>
              </g>
            ))}
          </svg>
        </motion.div>
      </div>
    </section>
  )
}
