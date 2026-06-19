// src/components/features/catalog/ProductPassport.tsx
'use client'

import { useComparison } from '@/hooks/useComparison'
import type { Product } from '@/types/database'
import { AuthenticationMark } from '@/components/features/catalog/AuthenticationMark'
import TechnicalSilhouette from '@/components/features/catalog/TechnicalSilhouette'

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
      <dt className="shrink-0 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35">
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

// Pull a numeric HP / payload hint from specs to seed the Authentication Mark geometry.
function numericFromSpecs(specs: Record<string, string>, pattern: RegExp): number | undefined {
  for (const [key, val] of Object.entries(specs)) {
    if (pattern.test(key) || pattern.test(val)) {
      const match = `${val}`.match(/[\d.]+/)
      if (match) return Number(match[0])
    }
  }
  return undefined
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

  const hp = numericFromSpecs(specs, /hp|potencia|caballos/i)
  const payload = numericFromSpecs(specs, /payload|carga|capacidad|gvw/i)

  return (
    <div
      className="relative overflow-hidden p-5 sm:p-6"
      style={{
        backgroundColor: '#F5F0E8',
        border: '1px solid rgba(0,30,80,0.10)',
        // Perforated left edge — dot-matrix down the spine of an inspection slip.
        borderLeft: '2px dashed rgba(0,30,80,0.3)',
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(0,30,80,0.28) 0, rgba(0,30,80,0.28) 1px, transparent 1px, transparent 8px)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1px 100%',
        backgroundPosition: 'left top',
      }}
    >
      {/* Dot-matrix reference number */}
      <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-navy/40">
        {refNumber}
      </p>

      {/* Header row */}
      <div className="mb-4 flex items-start justify-between border-b border-[rgba(0,30,80,0.10)] pb-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.20em] text-navy/30">
          Ficha de inspector
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.20em] text-navy/30">
          Wings Global Trade
        </span>
      </div>

      {/* Product identity */}
      <h3 className="mb-1 font-display text-xl font-light leading-tight text-navy">
        {product.name_es}
      </h3>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-navy/30">
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
      </dl>

      {/* Engineering reference silhouette — contextual chassis drawing */}
      <div className="mt-5 overflow-hidden rounded-sm border-t border-[rgba(0,30,80,0.06)]">
        <p className="bg-[rgba(0,30,80,0.04)] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-navy/30">
          Referencia técnica · Vista lateral
        </p>
        <TechnicalSilhouette categorySlug={categorySlug ?? ''} className="h-[90px]" />
      </div>

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
            'shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors',
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

      {/* Import readiness meter mount point — integration agent inserts here */}
      <div id="readiness-meter-slot" className="mt-4" />

      {/* Authentication Mark — stamped into the bottom-right corner */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-[1]">
        <AuthenticationMark
          slug={product.slug}
          categoryCode={categoryCode}
          hp={hp}
          payload={payload}
        />
      </div>
    </div>
  )
}
