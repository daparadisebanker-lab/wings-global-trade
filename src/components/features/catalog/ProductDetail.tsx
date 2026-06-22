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
import { UseCaseStrip } from '@/components/features/catalog/UseCaseStrip'
import { VariantTable } from '@/components/features/catalog/VariantTable'
import SavedInquiryBanner from '@/components/features/catalog/SavedInquiryBanner'
import JumpNavigation from '@/components/features/catalog/JumpNavigation'
import { KeySpecsRibbon } from '@/components/features/catalog/KeySpecsRibbon'
import { ProductPassport } from '@/components/features/catalog/ProductPassport'

interface ImplementLink {
  label: string
  href: string
}

const IMPLEMENT_LINKS: ImplementLink[] = [
  { label: 'Equipo de Labranza', href: '/catalogo/maquinaria-agricola?sub=labranza' },
  { label: 'Siembra y Trasplante', href: '/catalogo/maquinaria-agricola?sub=siembra' },
  { label: 'Protección de Cultivos', href: '/catalogo/maquinaria-agricola?sub=proteccion-cultivos' },
]

interface ProductDetailProps {
  product: Product
  categorySlug?: string
  totalInCategory?: number
}

export function ProductDetail({ product, categorySlug }: ProductDetailProps) {
  const category = categorySlug ?? ''

  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    () => product.variants?.[0]?.model,
  )
  const [modelIndex, setModelIndex] = useState(0)
  const hasVariants = (product.variants?.length ?? 0) > 0

  const effectiveSpecs = useMemo(() => {
    const override = product.models?.[modelIndex]?.specs_override ?? {}
    return { ...product.specs, ...override }
  }, [product.specs, product.models, modelIndex])

  const showImplements = category === 'maquinaria-agricola'

  function handleSelectVariant(model: string) {
    setSelectedVariant(model)
  }

  function handleRestoreSaved(variantSlug: string, _formData: Record<string, string>) {
    setSelectedVariant(variantSlug)
  }

  return (
    <div className="relative bg-warm-white">
      <JumpNavigation
        variantCount={product.variants?.length ?? 0}
        specCount={Object.keys(effectiveSpecs).length}
      />

      <div className="px-6 py-12 md:px-10">
        <div className="mx-auto w-full max-w-6xl">

          {/* ── Two-column grid spans ALL content so the right column stays sticky
               through specs/variants/use-cases, releasing at #tambien below ── */}
          <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-[1fr_380px]">

            {/* ── LEFT: all scrollable content ── */}
            <div className="space-y-12">

              {/* Header, gallery, description */}
              <div className="space-y-8">
                <h1 className="font-display text-display-md font-light text-navy">
                  {product.name_es}
                </h1>

                <KeySpecsRibbon specs={effectiveSpecs} />

                <ProductGallery images={product.images} alt={product.name_es} />

                <div className="flex flex-wrap gap-1.5">
                  {product.source_markets.map((m) => (
                    <Badge key={m} variant="source">
                      Origen: {m}
                    </Badge>
                  ))}
                </div>

                <div>
                  <h2 className="mb-3 font-body text-sm font-medium tracking-tight text-navy">
                    Descripción
                  </h2>
                  <p className="font-body text-base leading-relaxed text-text-mono">
                    {product.description_es}
                  </p>
                </div>
              </div>

              {/* Variant comparison table */}
              {hasVariants && product.variants && (
                <div id="variantes">
                  <div className="mb-5">
                    <p className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-navy/30">
                      Comparar variantes
                    </p>
                    <h3 className="font-body text-sm font-medium tracking-tight text-navy">
                      {product.variants.length} modelos disponibles
                    </h3>
                  </div>
                  <VariantTable
                    variants={product.variants}
                    selectedModel={selectedVariant}
                    onSelectVariant={handleSelectVariant}
                  />
                </div>
              )}

              {/* Technical specifications */}
              <div id="especificaciones">
                <ProductSpecTable specs={effectiveSpecs} />
              </div>

              {/* Use cases */}
              <div id="aplicaciones">
                <UseCaseStrip specs={effectiveSpecs} filterAttrs={product.filter_attrs} />
              </div>

              {/* Compatible implements (ag only) */}
              {showImplements && (
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    Implementos compatibles
                  </p>
                  <h3 className="mb-4 font-body text-sm font-medium tracking-tight text-navy">
                    Equipos que operan con este tractor
                  </h3>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {IMPLEMENT_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex flex-1 items-center justify-between rounded-[4px] border border-gold/20 px-4 py-3 transition-all duration-200 hover:border-gold/60"
                      >
                        <span className="font-body text-sm font-medium text-navy transition-colors group-hover:text-gold">
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

            {/* ── RIGHT: outer cell stretches full row height; inner div is sticky ── */}
            <div id="consultar">
              <div className="space-y-4 lg:sticky lg:top-24">
                <ProductPassport product={product} categorySlug={category} />
                <ProductModelSelector
                  models={product.models ?? []}
                  activeIndex={modelIndex}
                  onSelect={setModelIndex}
                />
                <SavedInquiryBanner productSlug={product.slug} onRestore={handleRestoreSaved} />
                <div id="inquiry-form">
                  <InquiryForm
                    product={product}
                    selectedVariant={selectedVariant}
                    onSuccess={() => {}}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
