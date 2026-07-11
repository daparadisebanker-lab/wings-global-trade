// src/components/features/brands/BrandGallery.tsx
// Drag-to-explore imagery row (SPEC §2.7⑥ — the clone's draggable gallery).
// framer-motion drag carries the inertia (site idiom, no Club plugins);
// reduced-motion falls back to a native scroll-snap row — full parity.
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface GalleryItem {
  src: string
  alt: string
  caption: string
}

export function BrandGallery({ items }: { items: GalleryItem[] }) {
  const reduced = useReducedMotion()
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragLimit, setDragLimit] = useState(0)

  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current
      const track = trackRef.current
      if (!viewport || !track) return
      setDragLimit(Math.max(0, track.scrollWidth - viewport.clientWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [items.length])

  if (items.length === 0) return null

  const cards = items.map((item) => (
    <figure
      key={item.src}
      className="w-64 shrink-0 snap-start md:w-80"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--rb-surface-tint)]">
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(min-width: 768px) 320px, 256px"
          className="object-cover"
          draggable={false}
        />
      </div>
      <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
        {item.caption}
      </figcaption>
    </figure>
  ))

  if (reduced) {
    return (
      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">{cards}</div>
    )
  }

  return (
    <div ref={viewportRef} className="overflow-hidden">
      <motion.div
        ref={trackRef}
        drag="x"
        dragConstraints={{ left: -dragLimit, right: 0 }}
        dragTransition={{ power: 0.4, timeConstant: 220 }}
        className="flex cursor-grab gap-5 active:cursor-grabbing"
      >
        {cards}
      </motion.div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-widest-2 text-neutral-400">
        Arrastra para explorar →
      </p>
    </div>
  )
}
