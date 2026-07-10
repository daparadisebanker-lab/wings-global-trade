// src/components/features/brands/BrandHero.tsx
// BrandHero slider (SPEC §2.7① — the Odd Ritual home-hero pattern as
// grammar): auto-advancing crossfade, ~6 s per frame, pauses on hover/focus,
// dots; reduced-motion renders the first frame statically. Only §8.7-attested
// imagery renders (guarded at the data layer); non-image frames are
// typographic so the slider works before photography clears.
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { RbHeroSlide, RbPublicBrand } from '@/lib/rb/fixtures'

const SLIDE_MS = 6000

interface Props {
  brand: Pick<RbPublicBrand, 'name' | 'claim' | 'logo' | 'heroSlides'>
}

export function BrandHero({ brand }: Props) {
  const reduced = useReducedMotion()
  // §8.7: an untagged image never renders — filter is structural, not advisory.
  const slides = brand.heroSlides.filter(
    (s) => s.kind !== 'image' || (s.src && (s.source === 'brand_supplied' || s.source === 'wings_studio')),
  )
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduced || paused || slides.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS)
    return () => clearInterval(t)
  }, [reduced, paused, slides.length])

  if (slides.length === 0) return null
  const active = reduced ? slides[0] : slides[index]

  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--rb-surface-tint)] md:aspect-auto md:h-full md:min-h-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="group"
      aria-roledescription="carrusel"
      aria-label={`Imágenes de ${brand.name}`}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={reduced ? 'static' : index}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <Slide slide={active} brand={brand} priority={index === 0} />
        </motion.div>
      </AnimatePresence>

      {!reduced && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a la imagen ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={
                i === index
                  ? 'h-2 w-6 rounded-full bg-[var(--rb-accent-ink)] transition-all'
                  : 'h-2 w-2 rounded-full bg-neutral-300 transition-all hover:bg-[var(--rb-accent)]'
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Slide({
  slide,
  brand,
  priority,
}: {
  slide: RbHeroSlide
  brand: Pick<RbPublicBrand, 'name' | 'claim' | 'logo'>
  priority: boolean
}) {
  if (slide.kind === 'image' && slide.src) {
    return (
      <Image
        src={slide.src}
        alt={slide.alt ?? brand.name}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-cover"
      />
    )
  }
  if (slide.kind === 'seal') {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <Image src={brand.logo.sello} alt="" aria-hidden width={230} height={230} className="h-48 w-48 md:h-60 md:w-60" />
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
      <Image src={brand.logo.positivo} alt="" aria-hidden width={220} height={80} className="h-16 w-auto md:h-20" />
      <p className="font-display text-display-sm text-[var(--rb-accent-ink)]">{brand.claim}</p>
      <p className="font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
        Fibra 100% virgen de bambú
      </p>
    </div>
  )
}
