// src/components/features/catalog/ProductGallery.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { NoiseField } from './NoiseField'

interface ProductGalleryProps {
  images: string[]
  alt: string
  /** Engine power in HP — seeds the ambient noise field behind the gallery. */
  hp?: number
}

export function ProductGallery({ images, alt, hp = 50 }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const hasImages = images.length > 0
  const hasMultiple = images.length > 1
  const current = hasImages ? images[active] : null

  const openLightbox = useCallback(() => {
    if (hasImages) setLightboxOpen(true)
  }, [hasImages])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  const goNext = useCallback(() => {
    setActive((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    setActive((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight' && hasMultiple) goNext()
      if (e.key === 'ArrowLeft' && hasMultiple) goPrev()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, hasMultiple, closeLightbox, goNext, goPrev])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

  const sharedLayoutId = 'product-gallery-main'

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  return (
    <>
      {/* Main gallery */}
      <div>
        {/* Main image — cursor-zoom-in signals clickability; click opens lightbox */}
        <motion.div
          layoutId={prefersReducedMotion ? undefined : sharedLayoutId}
          className={cn(
            'relative aspect-[4/3] w-full overflow-hidden rounded-wings-card border border-border-default bg-[#EDEAE1]',
            hasImages && 'cursor-zoom-in',
          )}
          onClick={hasImages ? openLightbox : undefined}
          title={hasImages ? 'Ver en pantalla completa' : undefined}
          role={hasImages ? 'button' : undefined}
          tabIndex={hasImages ? 0 : undefined}
          onKeyDown={
            hasImages
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openLightbox()
                  }
                }
              : undefined
          }
          aria-label={hasImages ? `Ver imagen en pantalla completa: ${alt}` : undefined}
        >
          {/* Generative noise field backdrop — the machine's HP as ambient movement */}
          <NoiseField hp={hp} className="absolute inset-0 h-full w-full pointer-events-none" />

          {current ? (
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_center,black_60%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_70%_70%_at_center,black_60%,transparent_100%)]">
              <Image
                src={current}
                alt={alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-sm text-text-muted">
              Sin imagen disponible
            </div>
          )}
        </motion.div>

        {/* Thumbnails — clicking only changes active image, does NOT open lightbox */}
        {hasMultiple && (
          <div className="mt-3 flex gap-2">
            {images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver imagen ${i + 1}`}
                className={cn(
                  'relative h-16 w-20 overflow-hidden rounded-wings border-2 transition-colors',
                  i === active ? 'border-gold' : 'border-border-default',
                )}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — full-screen overlay with shared-element fly animation */}
      <AnimatePresence>
        {lightboxOpen && current && (
          <motion.div
            key="lightbox-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#000C1F]/92 backdrop-blur-md"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
            onClick={closeLightbox}
            aria-modal="true"
            role="dialog"
            aria-label={`Imagen ampliada: ${alt}`}
          >
            {/* Close button — top-right */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-5 top-5 z-10 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white/60 transition-colors hover:text-warm-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label="Cerrar lightbox"
            >
              Cerrar ×
            </button>

            {/* Left arrow */}
            {hasMultiple && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 font-display text-5xl leading-none text-warm-white/40 transition-colors hover:text-warm-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label="Imagen anterior"
              >
                ‹
              </button>
            )}

            {/* Right arrow */}
            {hasMultiple && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 font-display text-5xl leading-none text-warm-white/40 transition-colors hover:text-warm-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label="Imagen siguiente"
              >
                ›
              </button>
            )}

            {/* Enlarged image — shares layoutId with the main gallery image */}
            <motion.div
              layoutId={prefersReducedMotion ? undefined : sharedLayoutId}
              className="relative max-h-[85vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
              style={{ touchAction: 'pinch-zoom' }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 300, damping: 30 }
              }
            >
              <Image
                src={current}
                alt={alt}
                width={1600}
                height={1200}
                className="max-h-[85vh] max-w-[90vw] rounded-wings object-contain"
                sizes="90vw"
                priority
              />
            </motion.div>

            {/* Image counter — bottom-center, only when multiple images */}
            {hasMultiple && (
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white/50"
              >
                {active + 1} / {images.length}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
