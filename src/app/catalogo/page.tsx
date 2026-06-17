// src/app/catalogo/page.tsx
// Catalog index. With ?q= performs a global search; otherwise redirects to the
// first category. Renders an ambiguous-search results view with an Accio CTA.
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCategories, getProducts } from '@/lib/catalog-data'
import { PageHero } from '@/components/features/shared/PageHero'
import { CategoryNav } from '@/components/features/catalog/CategoryNav'
import { ProductGrid } from '@/components/features/catalog/ProductGrid'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Catálogo — Wings Global Trade',
  description: 'Catálogo de maquinaria agrícola, camiones, buses y equipamiento industrial para importación con gestión en zona franca ZOFRATACNA y ZOFRI.',
}

export default async function CatalogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const categories = await getCategories()

  if (!q) {
    redirect(`/catalogo/${categories[0]?.slug ?? 'maquinaria-agricola'}`)
  }

  const { products } = await getProducts({ q })
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  return (
    <>
      <PageHero eyebrow="Búsqueda" title={`Resultados para "${q}"`} subtitle={`${products.length} producto(s) encontrados.`} />

      <div className="bg-warm-white px-6 py-12 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8">
            <CategoryNav categories={categories} activeSlug="" />
          </div>

          {/* Accio CTA for ambiguous search — per ENRICHED_SPEC §3.6 empty state copy */}
          <div className="mb-8 flex flex-col items-start gap-4 rounded-wings-card border border-gold/40 bg-gold/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-body text-sm text-navy">
              {products.length === 0
                ? `No encontramos productos para esa búsqueda. Prueba con otra categoría o inicia una consulta técnica con el Motor Accio.`
                : '¿Necesitas un volumen mayor o especificaciones personalizadas? El Motor Accio calcula tu estimado CIF.'}
            </p>
            {/* Per ENRICHED_SPEC §0 — "Motor Accio" not "Accio Engine" */}
            <Link href={`/accio?context=${encodeURIComponent(q)}`}>
              <Button size="sm">Calcular mi importación</Button>
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const cat = categoryById.get(p.category_id) ?? categories[0]
                return (
                  <Link
                    key={p.id}
                    href={`/catalogo/${cat.slug}/${p.slug}`}
                    className="group block overflow-hidden rounded-wings-card border border-border-default bg-surface-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
                  >
                    <h3 className="font-display text-xl font-semibold text-navy">{p.name_es}</h3>
                    <p className="mt-1 line-clamp-2 font-body text-sm text-text-muted">{p.description_es}</p>
                    <span className="mt-3 inline-block font-body text-sm font-medium text-gold">
                      Ver especificaciones →
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <ProductGrid products={[]} category={categories[0]} />
          )}
        </div>
      </div>
    </>
  )
}
