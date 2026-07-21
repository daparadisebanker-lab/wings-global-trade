import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { RbProductShelf } from '@/components/marcas/RbProductShelf'
import { listRepresentedBrands } from '@/lib/actions/represented-brands'
import { getRbProductCapabilities, listRbProducts } from '@/lib/actions/rb-catalog'
import { getSpecSchema } from '@/lib/schemas/spec'

// Marcas Representadas · productos (RB Console Wave 2, Ch 02) — the internal
// write-side product editor for one represented brand (RB/xx). The `brand` route
// segment is the brand SLUG (RB/xx codes carry a slash, not URL-safe). Brand is
// resolved through the RLS-scoped listRepresentedBrands, so a rep only ever
// reaches a brand they hold an rb_membership on; a group admin reaches all.
export default async function RbProductosPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = await params

  const brandsResult = await listRepresentedBrands()
  if (brandsResult.error) {
    return (
      <EmptyState
        tag="MRC · Productos"
        title={{ es: 'Marca no disponible', en: 'Brand unavailable' }}
        description={{ es: 'No se pudieron cargar las marcas.', en: 'Could not load brands.' }}
      />
    )
  }

  const brand = brandsResult.data.find((b) => b.slug === brandSlug)
  if (!brand) {
    return (
      <EmptyState
        tag="MRC · Productos"
        title={{ es: 'Marca no encontrada', en: 'Brand not found' }}
        description={{
          es: 'No existe o no tienes acceso a esta marca.',
          en: 'It does not exist or you have no access to this brand.',
        }}
      />
    )
  }

  const [productsResult, capsResult] = await Promise.all([
    listRbProducts(brand.id),
    getRbProductCapabilities(brand.id),
  ])

  if (productsResult.error || capsResult.error) {
    return (
      <EmptyState
        tag="MRC · Productos"
        title={{ es: 'No se pudieron cargar los productos', en: 'Could not load products' }}
        description={{ es: 'Intenta de nuevo.', en: 'Please try again.' }}
      />
    )
  }

  const specSchema = getSpecSchema('ALLOCATION')

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
            MRC · {brand.code} · Productos
          </span>
          <h1 className="font-display text-t2 text-ink-primary">{brand.name}</h1>
        </div>
        <Link
          href="/marcas"
          className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent"
        >
          ← Marcas
        </Link>
      </header>

      <RbProductShelf
        brandId={brand.id}
        brandCode={brand.code}
        brandName={brand.name}
        specSchema={specSchema}
        capabilities={capsResult.data}
        initialProducts={productsResult.data}
      />
    </div>
  )
}
