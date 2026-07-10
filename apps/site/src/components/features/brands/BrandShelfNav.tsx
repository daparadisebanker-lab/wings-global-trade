// src/components/features/brands/BrandShelfNav.tsx
// Shelf-local section nav: About · Productos · Comprar en contenedor.
// Sits under the Wings chrome; themes via --rb-* tokens only.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Props {
  brand: { slug: string; name: string; code: string }
}

export function BrandShelfNav({ brand }: Props) {
  const pathname = usePathname()
  const base = `/marcas/${brand.slug}`
  const tabs = [
    { href: base, label: 'La marca' },
    { href: `${base}/productos`, label: 'Productos' },
    { href: `${base}/contenedor`, label: 'Comprar en contenedor' },
  ]

  return (
    <nav
      aria-label={`Secciones de ${brand.name}`}
      className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-5 md:px-8">
        <Link
          href="/marcas"
          className="mr-3 shrink-0 py-4 font-mono text-[11px] uppercase tracking-widest-2 text-neutral-400 transition-colors hover:text-neutral-700"
        >
          ← Marcas
        </Link>
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'shrink-0 border-b-2 px-4 py-4 text-label-md font-medium transition-colors',
                active
                  ? 'border-[var(--rb-accent)] text-[var(--rb-accent-ink)]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
        <span className="ml-auto hidden shrink-0 font-mono text-[11px] uppercase tracking-widest-2 text-neutral-400 md:block">
          {brand.code}
        </span>
      </div>
    </nav>
  )
}
