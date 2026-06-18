// src/components/features/catalog/ProductPassport.tsx
// Server component — no 'use client' directive

import type { Product } from '@/types/database'

interface ProductPassportProps {
  product: Product
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-6 justify-between">
      <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35 shrink-0">{label}</dt>
      <dd className="font-mono text-[11px] text-navy/70 text-right">{value}</dd>
    </div>
  )
}

export function ProductPassport({ product }: ProductPassportProps) {
  const certKeys = Object.keys(product.specs).filter((k) => /CE|ISO|EPA|EURO/i.test(k))
  const certValues = certKeys.map((k) => `${k}: ${product.specs[k]}`).join(' · ')

  return (
    <div className="border border-[rgba(0,30,80,0.10)] bg-surface-card p-5 sm:p-6">
      {/* Header row */}
      <div className="flex items-start justify-between border-b border-[rgba(0,30,80,0.06)] pb-4 mb-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.20em] text-navy/25">Ficha técnica</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.20em] text-navy/25">Wings Global Trade</span>
      </div>

      {/* Product identity */}
      <h3 className="font-display text-xl font-light text-navy leading-tight mb-3">{product.name_es}</h3>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-navy/40 mb-4">
        REF: {product.slug.toUpperCase()}
      </p>

      {/* Data rows */}
      <dl className="flex flex-col gap-2">
        <DataRow label="Origen" value={product.source_markets.join(' · ')} />
        <DataRow label="Zona franca" value="ZOFRATACNA · ZOFRI" />
        {certValues && <DataRow label="Certificaciones" value={certValues} />}
      </dl>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-[rgba(0,30,80,0.06)] flex items-center gap-3">
        <span className="block h-px w-4 bg-gold/50" />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
          Disponible para importación
        </span>
      </div>
    </div>
  )
}
