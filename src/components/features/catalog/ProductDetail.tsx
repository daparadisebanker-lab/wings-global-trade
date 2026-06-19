// src/components/features/catalog/ProductDetail.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useInView } from 'framer-motion'
import type { Product } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { ProductGallery } from '@/components/features/catalog/ProductGallery'
import { ProductSpecTable } from '@/components/features/catalog/ProductSpecTable'
import { ProductModelSelector } from '@/components/features/catalog/ProductModelSelector'
import { InquiryForm } from '@/components/features/catalog/InquiryForm'
import { ProductHpMeter } from '@/components/features/catalog/ProductHpMeter'
import { ProductPassport } from '@/components/features/catalog/ProductPassport'
import { UseCaseStrip } from '@/components/features/catalog/UseCaseStrip'
import { VariantTable } from '@/components/features/catalog/VariantTable'
import { VariantCeremonyProvider, useVariantCeremony } from '@/components/features/catalog/VariantCeremony'
import { ProvenanceRibbon } from '@/components/features/catalog/ProvenanceRibbon'
import { TradeIntelligenceLine } from '@/components/features/catalog/TradeIntelligenceLine'
import { BlueprintModeToggle } from '@/components/features/catalog/BlueprintModeToggle'
import ReasonChips from '@/components/features/catalog/ReasonChips'
import { WaveformOverlay } from '@/components/features/catalog/WaveformOverlay'
import { CellularAutomaton } from '@/components/features/catalog/CellularAutomaton'
import { TradeRouteAnimation } from '@/components/features/catalog/TradeRouteAnimation'
import EnvironmentalContextLayer from '@/components/features/catalog/EnvironmentalContextLayer'
import TechnicalSilhouette from '@/components/features/catalog/TechnicalSilhouette'
import JumpNavigation from '@/components/features/catalog/JumpNavigation'
import FieldReport from '@/components/features/catalog/FieldReport'
import ImportReadinessMeter from '@/components/features/catalog/ImportReadinessMeter'
import SavedInquiryBanner from '@/components/features/catalog/SavedInquiryBanner'
import CatalogProgress from '@/components/features/catalog/CatalogProgress'
import { SpecScannerLine } from '@/components/features/catalog/SpecScannerLine'
import { MagneticButton } from '@/components/features/catalog/MagneticButton'
import { extractNum } from '@/lib/spec-normalize'

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
  /** Total products in the current category (for CatalogProgress) */
  totalInCategory?: number
}

function ProductDetailInner({ product, categorySlug, totalInCategory = 1 }: ProductDetailProps) {
  const category = categorySlug ?? ''
  const { triggerCeremony } = useVariantCeremony()

  // Single source of truth for variant selection — VariantTable reads and writes through here
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    () => product.variants?.[0]?.model,
  )
  const [modelIndex, setModelIndex] = useState(0)
  const hasVariants = (product.variants?.length ?? 0) > 0

  // Import readiness step (1–5)
  const [readinessStep, setReadinessStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  const specSectionRef = useRef<HTMLDivElement>(null)
  const inquiryRef = useRef<HTMLDivElement>(null)

  const specInView = useInView(specSectionRef, { once: true, margin: '-100px' })
  const inquiryInView = useInView(inquiryRef, { once: true, margin: '-80px' })

  // Step 2: spec section scrolled into view
  useEffect(() => {
    if (specInView && readinessStep < 2) setReadinessStep(2)
  }, [specInView, readinessStep])

  // Step 4: inquiry area scrolled into view
  useEffect(() => {
    if (inquiryInView && readinessStep < 4) setReadinessStep(4)
  }, [inquiryInView, readinessStep])

  const effectiveSpecs = useMemo(() => {
    const override = product.models?.[modelIndex]?.specs_override ?? {}
    return { ...product.specs, ...override }
  }, [product.specs, product.models, modelIndex])

  const showImplements = category === 'maquinaria-agricola'

  function handleSelectVariant(model: string) {
    setSelectedVariant(model)
    const variant = product.variants?.find((v) => v.model === model)
    if (variant) {
      triggerCeremony(
        {
          payload_kg: variant.payload_t * 1000,
          gvw_kg: variant.gvw_kg,
          fuel_type: variant.fuel_type,
        } as Record<string, unknown>,
        `variant-${model}`,
      )
    }
    if (readinessStep < 3) setReadinessStep(3)
  }

  function handleFormSuccess() {
    setReadinessStep(5)
  }

  function handleRestoreSaved(variantSlug: string, _formData: Record<string, string>) {
    setSelectedVariant(variantSlug)
  }

  // Extract numeric spec values for Canvas/SVG components
  const specNum = (key: string): number | undefined => {
    const v = effectiveSpecs[key as keyof typeof effectiveSpecs]
    return typeof v === 'number' ? (v as number) : undefined
  }
  const hp = specNum('hp')
  const torque = specNum('torque')
  const rpm = specNum('rpm')
  const gvw = specNum('gvw_kg') ?? specNum('gvw')
  const weight = specNum('weight') ?? gvw

  const specRowCount = Object.keys(effectiveSpecs).length

  return (
    <div className="relative bg-warm-white">
      {/* Fixed ambient SVG texture — z-behind, pointer-events-none */}
      <EnvironmentalContextLayer categorySlug={category} />

      {/* Sticky document-index nav */}
      <JumpNavigation />

      {/* Provenance ribbon — supply chain SVG band */}
      {product.source_markets[0] && (
        <ProvenanceRibbon sourceMarket={product.source_markets[0]} />
      )}

      <div className="px-6 py-12 md:px-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-8">
            {/* Product header — name, trade intelligence line, blueprint toggle */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <h1 className="font-display text-display-sm font-light text-navy">
                  {product.name_es}
                </h1>
                <TradeIntelligenceLine
                  slug={product.slug}
                  categorySlug={category}
                  sourceMarket={product.source_markets[0] ?? ''}
                />
              </div>
              <div className="shrink-0 pt-1">
                <BlueprintModeToggle />
              </div>
            </div>

            <ProductGallery images={product.images} alt={product.name_es} hp={extractNum(product.specs as Record<string, unknown>, 'hp', 'potencia_hp', 'power_hp') ?? undefined} />

            {/* Engineering reference drawing */}
            <TechnicalSilhouette categorySlug={category} />

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

            {/* Trade route animation — ambient particles along China → ZOFRATACNA */}
            <TradeRouteAnimation weight={weight} />

            <ProductHpMeter specs={effectiveSpecs} categorySlug={categorySlug} />

            {/* Oscilloscope waveform strip */}
            <WaveformOverlay hp={hp} torque={torque} rpm={rpm} />

            {/* Variant table — single source of truth via handleSelectVariant */}
            {hasVariants && product.variants && (
              <div id="variantes">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-navy/30">
                      Comparar variantes
                    </p>
                    <h3 className="font-display text-display-sm font-light text-navy">
                      {product.variants.length} modelos disponibles
                    </h3>
                  </div>
                </div>
                {/* Self-identification chips — above the table */}
                <div className="mb-4">
                  <ReasonChips
                    specs={product.specs as Record<string, unknown>}
                    categorySlug={category}
                  />
                </div>
                <VariantTable
                  variants={product.variants}
                  selectedModel={selectedVariant}
                  onSelectVariant={handleSelectVariant}
                />
              </div>
            )}

            {/* Spec table with gold scan line overlay */}
            <div id="especificaciones" ref={specSectionRef} className="relative">
              <SpecScannerLine rowCount={specRowCount} isVisible={specInView} />
              <ProductSpecTable specs={effectiveSpecs} />
            </div>

            {/* Conway cellular automaton — thin 32px decorative strip */}
            <CellularAutomaton gvw={gvw} hp={hp} />

            <div id="usos">
              <UseCaseStrip specs={effectiveSpecs} filterAttrs={product.filter_attrs} />
            </div>

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

            {/* Collapsible operational field report */}
            <FieldReport categorySlug={category} />
          </div>

          {/* Right column — sticky on desktop */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <ProductPassport product={product} categorySlug={categorySlug} />

            {/* Import readiness meter — rendered below passport, tracks buyer journey */}
            <ImportReadinessMeter step={readinessStep} />

            <ProductModelSelector
              models={product.models ?? []}
              activeIndex={modelIndex}
              onSelect={setModelIndex}
            />

            <div id="consultar" ref={inquiryRef}>
              <SavedInquiryBanner
                productSlug={product.slug}
                onRestore={handleRestoreSaved}
              />
              <div className="mt-3" id="inquiry-form">
                <InquiryForm
                  product={product}
                  selectedVariant={selectedVariant}
                  onSuccess={handleFormSuccess}
                />
              </div>
            </div>

            <div className="px-1">
              <CatalogProgress
                categorySlug={category}
                totalInCategory={totalInCategory}
                currentSlug={product.slug}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductDetail(props: ProductDetailProps) {
  return (
    <VariantCeremonyProvider>
      <ProductDetailInner {...props} />
    </VariantCeremonyProvider>
  )
}
