// src/components/features/catalog/ProductDetail.tsx
'use client'

import { useMemo, useState } from 'react'
import type { Product } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { ProductGallery } from '@/components/features/catalog/ProductGallery'
import { ProductSpecTable } from '@/components/features/catalog/ProductSpecTable'
import { ProductModelSelector } from '@/components/features/catalog/ProductModelSelector'
import { InquiryForm } from '@/components/features/catalog/InquiryForm'

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [modelIndex, setModelIndex] = useState(0)

  const effectiveSpecs = useMemo(() => {
    const override = product.models?.[modelIndex]?.specs_override ?? {}
    return { ...product.specs, ...override }
  }, [product.specs, product.models, modelIndex])

  return (
    <div className="bg-warm-white px-6 py-12 md:px-10">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-8">
          <ProductGallery images={product.images} alt={product.name_es} />

          <div className="flex flex-wrap gap-1.5">
            {product.source_markets.map((m) => (
              <Badge key={m} variant="source">
                Origen: {m}
              </Badge>
            ))}
          </div>

          <div>
            <h2 className="mb-3 font-display text-display-sm font-semibold text-navy">Descripción</h2>
            <p className="font-body text-base leading-relaxed text-text-mono">
              {product.description_es}
            </p>
          </div>

          <ProductSpecTable specs={effectiveSpecs} />
        </div>

        {/* Right column — sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductModelSelector
            models={product.models ?? []}
            activeIndex={modelIndex}
            onSelect={setModelIndex}
          />
          <InquiryForm product={product} />
        </div>
      </div>
    </div>
  )
}
