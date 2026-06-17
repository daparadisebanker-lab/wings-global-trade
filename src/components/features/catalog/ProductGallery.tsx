// src/components/features/catalog/ProductGallery.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const hasImages = images.length > 0
  const current = hasImages ? images[active] : null

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-wings-card border border-border-default bg-[#EDEAE1]">
        {current ? (
          <Image src={current} alt={alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-sm text-text-muted">
            Sin imagen disponible
          </div>
        )}
      </div>

      {images.length > 1 && (
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
  )
}
