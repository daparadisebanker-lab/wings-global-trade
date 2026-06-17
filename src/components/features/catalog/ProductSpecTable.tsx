// src/components/features/catalog/ProductSpecTable.tsx
import { cn } from '@/lib/utils'

interface ProductSpecTableProps {
  specs: Record<string, string>
}

export function ProductSpecTable({ specs }: ProductSpecTableProps) {
  const entries = Object.entries(specs)
  if (entries.length === 0) return null

  return (
    <div>
      <h2 className="mb-4 font-display text-display-sm font-semibold text-navy">
        Especificaciones técnicas
      </h2>
      <dl className="overflow-hidden rounded-wings-card border border-border-default">
        {entries.map(([key, value], i) => (
          <div
            key={key}
            className={cn(
              'flex flex-col gap-1 px-5 py-3 sm:flex-row sm:justify-between sm:gap-6',
              i % 2 === 0 ? 'bg-white' : 'bg-warm-white',
            )}
          >
            <dt className="font-mono text-sm text-text-muted">{key}</dt>
            <dd className="font-body text-sm font-medium text-navy sm:text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
