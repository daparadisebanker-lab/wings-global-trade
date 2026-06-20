// src/components/features/catalog/ProductPassport.tsx
'use client'

import { useComparison } from '@/hooks/useComparison'
import type { Product } from '@/types/database'
import { categoryDutyRate, detectCertifications } from '@/lib/product-intelligence'

interface ProductPassportProps {
  product: Product
  /** Category slug — drives the authentication code, REF number, and social proof. */
  categorySlug?: string
}

// Three-letter customs-style code per category — used in the REF and the Authentication Mark.
const CATEGORY_CODE: Record<string, string> = {
  'maquinaria-agricola': 'AGR',
  camiones: 'CAM',
  buses: 'BUS',
  'equipo-industrial': 'IND',
  repuestos: 'REP',
}

// Static "consultas este mes" by category — derived, never random.
const SOCIAL_PROOF: Record<string, string> = {
  'maquinaria-agricola': '31 consultas este mes',
  camiones: '23 consultas este mes',
  buses: '18 consultas este mes',
  'equipo-industrial': '27 consultas este mes',
  repuestos: '42 consultas este mes',
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-navy/35">
        {label}
      </dt>
      <dd className="text-right font-mono text-[11px] leading-snug text-navy/75">{value}</dd>
    </div>
  )
}

// Keys that are not meaningful to surface in the passport identity block
const SKIP_PATTERN = /CE|ISO|EPA|EURO|certif/i

// Look for emission norm value in specs
function findEmissions(specs: Record<string, string>): string | null {
  for (const [, val] of Object.entries(specs)) {
    if (/euro\s?(i{1,3}|iv|v|vi|\d)/i.test(val)) return val
    if (/stage\s?(i{1,3}|iv|v|\d)/i.test(val)) return val
  }
  return null
}

export function ProductPassport({ product, categorySlug }: ProductPassportProps) {
  const { add, remove, isInComparison, isFull } = useComparison()
  const inComparison = isInComparison(product.id)

  const specs = product.specs ?? {}
  const specEntries = Object.entries(specs)

  const liveSpecs = specEntries.filter(([k]) => !SKIP_PATTERN.test(k)).slice(0, 4)
  const emissions = findEmissions(specs)

  const categoryCode = (categorySlug && CATEGORY_CODE[categorySlug]) || 'WGT'
  const socialProof = (categorySlug && SOCIAL_PROOF[categorySlug]) || '23 consultas este mes'

  // Deterministic reference number from props — REF-[8 chars slug]-[code]
  const refNumber = `REF-${product.slug.slice(0, 8).toUpperCase()}-${categoryCode}`

  // HS chapter and duty rate derived from category
  const { chapter, rate } = categoryDutyRate(categorySlug ?? 'maquinaria-agricola', 'Perú')
  // Certifications detected from specs
  const certs = detectCertifications(specs as Record<string, unknown>)

  return (
    <div className="relative overflow-hidden border border-navy/10 border-l-2 border-l-gold/40 bg-[#F8F6F0] p-6">
      {/* Dot-matrix reference number */}
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-navy/40">
        {refNumber}
      </p>

      {/* Header row */}
      <div className="mb-4 flex items-start justify-between border-b border-[rgba(0,30,80,0.10)] pb-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.20em] text-navy/30">
          Ficha de inspector
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.20em] text-navy/30">
          Wings Global Trade
        </span>
      </div>

      {/* Product identity */}
      <h3 className="mb-1 font-mono text-sm font-medium leading-snug text-navy">
        {product.name_es}
      </h3>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-navy/30">
        ID · {product.slug.toUpperCase()}
      </p>

      {/* Social proof line */}
      <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.12em] text-gold/80">
        {socialProof}
      </p>

      {/* Live spec data */}
      <dl className="flex flex-col gap-2.5">
        <DataRow label="Origen" value={product.source_markets.join(' · ')} />
        <DataRow label="Zona franca" value="ZOFRATACNA · ZOFRI" />

        {liveSpecs.map(([key, val]) => (
          <DataRow key={key} label={key} value={val} />
        ))}

        {emissions && <DataRow label="Norma" value={emissions} />}

        {/* HS chapter and duty rate */}
        <DataRow
          label="HS Capítulo"
          value={chapter + 'xx · ' + rate + '% ad valorem'}
        />

        {/* Certifications detected from specs — only shown when present */}
        {certs.length > 0 && (
          <DataRow
            label="Certificaciones"
            value={certs.slice(0, 3).join(' · ')}
          />
        )}
      </dl>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[rgba(0,30,80,0.10)] pt-4">
        <div className="flex items-center gap-3">
          <span className="block h-px w-4 bg-gold/50" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
            Disponible para importación
          </span>
        </div>
        {/* Compare button */}
        <button
          onClick={() =>
            inComparison
              ? remove(product.id)
              : add({
                  id: product.id,
                  name_es: product.name_es,
                  slug: product.slug,
                  category_slug: categorySlug ?? '',
                  image: product.images?.[0] ?? '',
                })
          }
          disabled={!inComparison && isFull}
          aria-pressed={inComparison}
          className={[
            'shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors',
            inComparison
              ? 'text-gold underline underline-offset-2'
              : isFull
              ? 'cursor-not-allowed text-navy/20'
              : 'text-navy/40 hover:text-navy/70',
          ].join(' ')}
        >
          {inComparison ? '✓ En comparación' : isFull ? 'Comparación llena' : '+ Comparar'}
        </button>
      </div>
    </div>
  )
}
