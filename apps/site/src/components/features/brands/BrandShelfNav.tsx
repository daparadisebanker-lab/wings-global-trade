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
      // Sticks below the fixed site header (h-16 / md:h-18), never under it.
      // The ::before mask fills the header-height strip above the tabs so
      // content never peeks through when the header auto-hides on scroll.
      className="sticky top-16 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur before:absolute before:inset-x-0 before:-top-16 before:h-16 before:bg-white before:content-[''] md:top-18 md:before:-top-18 md:before:h-18"
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
