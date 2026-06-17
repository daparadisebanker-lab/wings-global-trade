// src/components/features/catalog/ProductModelSelector.tsx
'use client'

import type { ProductModel } from '@/types/database'
import { cn } from '@/lib/utils'

interface ProductModelSelectorProps {
  models: ProductModel[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function ProductModelSelector({ models, activeIndex, onSelect }: ProductModelSelectorProps) {
  if (!models || models.length === 0) return null

  return (
    <div className="mb-6">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest-2 text-text-muted">Modelo</p>
      <div className="flex flex-wrap gap-2">
        {models.map((m, i) => (
          <button
            key={m.name}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              'rounded-wings border px-4 py-2 font-body text-sm transition-colors',
              i === activeIndex
                ? 'border-gold bg-gold text-navy'
                : 'border-border-default bg-white text-navy hover:border-gold',
            )}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  )
}
