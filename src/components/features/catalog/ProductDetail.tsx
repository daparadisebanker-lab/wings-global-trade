// src/components/features/catalog/ProductDetail.tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { ProductGallery } from '@/components/features/catalog/ProductGallery'
import { ProductSpecTable } from '@/components/features/catalog/ProductSpecTable'
import { ProductModelSelector } from '@/components/features/catalog/ProductModelSelector'
import { InquiryForm } from '@/components/features/catalog/InquiryForm'
import { ProductHpMeter } from '@/components/features/catalog/ProductHpMeter'
import { ProductPassport } from '@/components/features/catalog/ProductPassport'
import { UseCaseStrip } from '@/components/features/catalog/UseCaseStrip'

interface ImplementLink {
  label: string
  href: string
}

const IMPLEMENT_LINKS: ImplementLink[] = [
  {
    label: 'Equipo de Labranza',
    href: '/catalogo/maquinaria-agricola?sub=labranza',
  },
  {
    label: 'Siembra y Trasplante',
    href: '/catalogo/maquinaria-agricola?sub=siembra',
  },
  {
    label: 'Protección de Cultivos',
    href: '/catalogo/maquinaria-agricola?sub=proteccion-cultivos',
  },
]

interface ProductDetailProps {
  product: Product
  /** Category slug — used to conditionally show ag-specific sections */
  categorySlug?: string
}

export function ProductDetail({ product, categorySlug }: ProductDetailProps) {
  const [modelIndex, setModelIndex] = useState(0)

  const effectiveSpecs = useMemo(() => {
    const override = product.models?.[modelIndex]?.specs_override ?? {}
    return { ...product.specs, ...override }
  }, [product.specs, product.models, modelIndex])

  const showImplements = categorySlug === 'maquinaria-agricola'

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
            <h2 className="mb-3 font-display text-display-sm font-light text-navy">Descripción</h2>
            <p className="font-body text-base leading-relaxed text-text-mono">
              {product.description_es}
            </p>
          </div>

          <ProductHpMeter specs={effectiveSpecs} categorySlug={categorySlug} />

          <ProductSpecTable specs={effectiveSpecs} />

          <UseCaseStrip specs={effectiveSpecs} filterAttrs={product.filter_attrs} />

          {/* Implementos compatibles — only for maquinaria-agricola */}
          {showImplements && (
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                Implementos compatibles
              </p>
              <h3 className="mb-4 font-display text-display-sm font-light text-navy">
                Equipos que operan con este tractor
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row">
                {IMPLEMENT_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex flex-1 items-center justify-between rounded-[4px] border border-gold/20 px-4 py-3 transition-all duration-200 hover:border-gold/60 hover:text-gold"
                  >
                    <span className="font-display text-base font-light text-navy transition-colors group-hover:text-gold">
                      {item.label}
                    </span>
                    <span className="ml-3 font-mono text-xs text-gold/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gold">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — sticky on desktop */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <ProductPassport product={product} />
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
