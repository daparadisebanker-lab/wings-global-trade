'use client'

import { useState } from 'react'
import Image from 'next/image'

const BRANDS = [
  { name: 'New Holland',      src: '/logos/New_Holland-logo-horizontal.svg' },
  { name: 'John Deere',       src: '/logos/John_Deere-logo-horizontal.svg' },
  { name: 'Massey Ferguson',  src: '/logos/Massey_Ferguson-logo-horizontal.svg' },
  { name: 'Kubota',           src: '/logos/Kubota-logo-horizontal_v1.svg' },
  { name: 'Deutz',            src: '/logos/Deutz-logo-horizontal.svg' },
  { name: 'KAMA',             src: '/logos/Kama-logo-horizontal.svg' },
]

export function BrandMarquee() {
  // Triplicate for seamless loop at any viewport width
  const items = [...BRANDS, ...BRANDS, ...BRANDS]
  const [paused, setPaused] = useState(false)

  return (
    <div
      className="mb-16 -mx-6 md:-mx-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Eyebrow */}
      <p className="mb-5 px-6 md:px-10 font-mono text-[9px] uppercase tracking-widest-3 text-warm-white/25">
        Fabricantes verificados
      </p>

      {/* Track */}
      <div className="relative overflow-hidden border-t border-b border-warm-white/[0.06] py-5 brand-marquee-wrap">
        {/* Left fade */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20"
          style={{ background: 'linear-gradient(to right, #000C1F, transparent)' }}
          aria-hidden
        />
        {/* Right fade */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20"
          style={{ background: 'linear-gradient(to left, #000C1F, transparent)' }}
          aria-hidden
        />

        <div
          className="brand-marquee flex items-center w-max"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
        >
          {items.map((brand, i) => (
            <span key={`${brand.name}-${i}`} className="flex items-center shrink-0">
              <Image
                src={brand.src}
                alt={brand.name}
                width={96}
                height={26}
                draggable={false}
                className="h-[26px] w-auto max-w-[96px] object-contain select-none"
                style={{ filter: 'brightness(0) invert(1)', opacity: 0.45 }}
                unoptimized
              />
              <span
                className="mx-10 h-1 w-1 rounded-full shrink-0"
                style={{ backgroundColor: 'rgba(196, 147, 63, 0.3)' }}
                aria-hidden
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
