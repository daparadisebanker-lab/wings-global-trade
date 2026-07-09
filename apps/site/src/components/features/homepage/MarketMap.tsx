'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { FADE_UP, FADE_UP_TRANSITION, VIEWPORT_ONCE } from '@/lib/motion'

/*
  SVG overlay coordinate space: viewBox="0 0 100 125" (matches image 1000:1250 aspect ratio)

  The map SVG (viewBox 2752×1537, landscape) renders inside a 1000×1250 portrait container.
  With preserveAspectRatio="xMidYMid meet", the map content occupies only:
    - y=346 to y=904 in the 1250px rendered image (a 558px band, centered)
    - In overlay units: y ≈ 34.6 to y ≈ 90.4

  Pin positions derived from actual SVG coordinate math:
    x_overlay = x_svg / 2752 × 100
    y_overlay = 34.6 + (y_svg / 1537) × 55.8

  Chile lies at y_svg ≈ 2450, which is outside the viewBox — it is placed in the
  dead space below the map (overlay cy ≈ 110) with a connector line to the map edge.

  CSS filter: invert(1) grayscale(1) + mix-blend-mode: screen
    After invert+grayscale:
      - SVG background (#f5f9f9) → near-black (L ≈ 0.024)  → barely brightens navy ✓
      - Country fills  (#37abc8) → medium grey (L ≈ 0.417) → visibly brightens navy ✓
    Result: country shapes glow as subtle blue-grey on the dark navy background.
*/

const DESTINATION_PINS = [
  { label: 'Panamá',   flag: '🇵🇦', cx: 39.5, cy: 36.5, lDx:  3, lDy: -3.5, extended: false },
  { label: 'Colombia', flag: '🇨🇴', cx: 51,   cy: 43,   lDx:  3, lDy: -3.5, extended: false },
  { label: 'Perú',     flag: '🇵🇪', cx: 49,   cy: 63,   lDx:  3, lDy: -3.5, extended: false },
  { label: 'Bolivia',  flag: '🇧🇴', cx: 63,   cy: 60,   lDx:  3, lDy: -3.5, extended: false },
  { label: 'Chile',    flag: '🇨🇱', cx: 52,   cy: 110,  lDx:  3, lDy: -3.5, extended: true  },
]

// Quadratic bezier arcs. Pacific routes curve LEFT (negative x control point).
// Dubai/Indian Ocean route curves RIGHT (x > 100 control point).
const FREIGHT_ARCS = [
  { id: 'cn-pa',  d: 'M 2 44 Q -30 37 39.5 36.5', w: 0.32, opacity: 0.55, dash: '2 1.8',  delay: 0    },
  { id: 'jp-co',  d: 'M 2 47 Q -28 43 51 43',      w: 0.30, opacity: 0.45, dash: '2 1.8',  delay: 0.18 },
  { id: 'th-pe',  d: 'M 2 51 Q -34 60 49 63',      w: 0.30, opacity: 0.40, dash: '2 1.8',  delay: 0.34 },
  { id: 'cn-bo',  d: 'M 2 51 Q -30 59 63 60',      w: 0.22, opacity: 0.28, dash: '1.5 2',  delay: 0.50 },
  { id: 'dxb-co', d: 'M 98 43 Q 114 47 51 43',     w: 0.22, opacity: 0.25, dash: '1.5 2',  delay: 0.65 },
]

const PACIFIC_SOURCES = [
  { code: 'CN', cy: 44 },
  { code: 'JP', cy: 47 },
  { code: 'TH', cy: 51 },
]

const SOURCE_MARKETS = [
  { code: 'CN', label: 'China' },
  { code: 'JP', label: 'Japón' },
  { code: 'TH', label: 'Tailandia' },
  { code: 'DXB', label: 'Dubai' },
]

export function MarketMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  // Observe the map container — more reliable than per-path whileInView on SVG elements
  // whose bounding boxes extend into negative-x territory (outside the clipped viewport)
  const isInView = useInView(mapRef, { once: true, margin: '0px 0px -60px 0px' })

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

        {/* Left — copy */}
        <motion.div
          variants={FADE_UP} initial="initial" whileInView="animate"
          viewport={VIEWPORT_ONCE} transition={FADE_UP_TRANSITION}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-widest-2 text-gold">
            Presencia regional
          </p>
          <h2 className="font-display text-display-md font-light text-warm-white">
            Cuatro orígenes. Cinco mercados. Una operación.
          </h2>
          <p className="mt-4 max-w-md font-body text-base text-warm-white/50">
            Corredores de importación desde Asia y Medio Oriente hacia los principales
            mercados de América Latina, vía ZOFRATACNA y ZOFRI.
          </p>

          <div className="mt-8 border-t border-warm-white/10" />

          {/* Orígenes */}
          <div className="mt-6">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-warm-white/30">
              Orígenes
            </p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {SOURCE_MARKETS.map((m) => (
                <li key={m.code} className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] font-medium text-gold tabular-nums">{m.code}</span>
                  <span className="font-body text-sm text-warm-white/70">{m.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinos */}
          <div className="mt-6">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-warm-white/30">
              Destinos
            </p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
              {DESTINATION_PINS.map((p) => (
                <li key={p.label} className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{p.flag}</span>
                  <span className="font-body text-base text-warm-white/80">{p.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Right — map */}
        <motion.div
          variants={FADE_UP} initial="initial" whileInView="animate"
          viewport={VIEWPORT_ONCE} transition={{ ...FADE_UP_TRANSITION, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          {/* Route header */}
          <div className="mb-2 w-full max-w-sm flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-warm-white/20">
            <span>Origen</span>
            <span>Destino</span>
          </div>

          {/* Map container — image + SVG overlay share the same 4:5 aspect ratio */}
          {/* overflow-hidden clips SVG overflow: visible bleed that causes horizontal scroll on mobile */}
          <div ref={mapRef} className="relative w-full max-w-sm overflow-hidden">

            {/* Continent silhouette
                filter: invert(1) grayscale(1) → background becomes near-black, countries become medium-grey
                mix-blend-mode: screen on navy → countries glow, background stays dark */}
            <Image
              src="/images/latin-america-map.svg"
              alt="Mapa América Latina"
              width={1000}
              height={1250}
              className="w-full h-auto"
              style={{
                filter: 'invert(1) grayscale(1)',
                opacity: 0.38,
                mixBlendMode: 'screen',
              }}
              unoptimized
            />

            {/* Overlay SVG — viewBox 0 0 100 125 matches the 1000:1250 image aspect */}
            <svg
              viewBox="0 0 100 125"
              className="absolute inset-0 w-full h-full"
              style={{ overflow: 'visible' }}
            >
              {/* Pacific source nodes — left edge */}
              {PACIFIC_SOURCES.map((src) => (
                <g key={src.code}>
                  <circle cx={2} cy={src.cy} r={0.8} fill="#C4933F" fillOpacity={0.55} />
                  <text
                    x={4.2} y={src.cy + 0.8}
                    fontFamily="monospace" fontSize="3" fill="#C4933F" fillOpacity={0.45}
                  >
                    {src.code}
                  </text>
                </g>
              ))}

              {/* Dubai source node — right edge */}
              <circle cx={98} cy={43} r={0.8} fill="#C4933F" fillOpacity={0.4} />
              <text
                x={91.5} y={43.8}
                fontFamily="monospace" fontSize="3" fill="#C4933F" fillOpacity={0.35}
              >
                DXB
              </text>

              {/* Freight arcs — draw-on triggered when map container enters viewport */}
              {FREIGHT_ARCS.map((arc) => (
                <motion.path
                  key={arc.id}
                  d={arc.d}
                  fill="none"
                  stroke="#C4933F"
                  strokeWidth={arc.w}
                  strokeDasharray={arc.dash}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: arc.opacity } : { pathLength: 0, opacity: 0 }}
                  transition={{
                    pathLength: { duration: 2.6, delay: arc.delay, ease: [0.16, 1, 0.3, 1] },
                    opacity:    { duration: 0.4, delay: arc.delay },
                  }}
                />
              ))}

              {/* Chile extension line — south of the visible map area */}
              <motion.line
                x1={52} y1={90} x2={52} y2={107.5}
                stroke="#C4933F" strokeWidth={0.18} strokeDasharray="1 1.8" strokeOpacity={0.22}
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Destination pins */}
              {DESTINATION_PINS.map((pin, i) => (
                <g key={pin.label}>
                  {/* Pulse ring */}
                  <motion.circle
                    cx={pin.cx} cy={pin.cy} r={2.6}
                    fill="none" stroke="#C4933F" strokeWidth={0.35}
                    animate={{ scale: [1, 1.9, 1], opacity: [0.35, 0, 0.35] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.8,
                      ease: 'easeInOut',
                      delay: i * 0.45,
                    }}
                  />
                  {/* Dot */}
                  <circle
                    cx={pin.cx} cy={pin.cy} r={1.4}
                    fill="#C4933F"
                    fillOpacity={pin.extended ? 0.5 : 1}
                  />
                  {/* Label */}
                  <text
                    x={pin.cx + pin.lDx}
                    y={pin.cy + pin.lDy}
                    fontFamily="monospace"
                    fontSize="3.3"
                    fill="#F8F6F0"
                    fillOpacity={pin.extended ? 0.35 : 0.7}
                    letterSpacing="0.04em"
                  >
                    {pin.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
