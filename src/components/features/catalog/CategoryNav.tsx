// src/components/features/catalog/CategoryNav.tsx
import Link from 'next/link'
import type { Category } from '@/types/database'
import { cn } from '@/lib/utils'

interface CategoryNavProps {
  categories: Category[]
  activeSlug: string
}

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  return (
    <nav className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:px-0">
      {categories.map((c) => {
        const active = c.slug === activeSlug
        return (
          <Link
            key={c.id}
            href={`/catalogo/${c.slug}`}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-wings border px-4 py-2 font-body text-sm transition-colors',
              active
                ? 'border-gold bg-gold text-navy'
                : 'border-border-default bg-white text-navy hover:border-gold',
            )}
          >
            {c.name_es}
          </Link>
        )
      })}
      <Link
        href="/accio"
        className="shrink-0 rounded-wings border border-navy bg-navy px-4 py-2 font-body text-sm text-warm-white transition-colors hover:bg-[#002266]"
      >
        Importación personalizada
      </Link>
    </nav>
  )
}
