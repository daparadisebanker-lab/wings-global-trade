// src/app/catalogo/page.tsx
// Catalog index. With ?q= performs a global search; otherwise renders the
// category GATEWAY — a landing grid of every category. It no longer auto-jumps
// to the first category (which sent every "Catálogo" click into Agricultural);
// selecting a category is now a deliberate choice that leads into that
// category's own branded space (subcategory nav → spec sheets → RFQ / Mister).
import Link from 'next/link'
import { getNavCategories, getProducts } from '@/lib/catalog-data'
import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'
import { getCategoryIdentity } from '@/lib/category-identity'
import { ProductGrid } from '@/components/features/catalog/ProductGrid'
import { CategoryNav } from '@/components/features/catalog/CategoryNav'
import { PageHero } from '@/components/features/shared/PageHero'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Catálogo — Wings Global Trade',
  description:
    'Catálogo de maquinaria agrícola, camiones, buses y equipamiento industrial para importación con gestión en zona franca ZOFRATACNA y ZOFRI.',
}

export default async function CatalogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const categories = await getNavCategories()

  // ── Search view (unchanged) ───────────────────────────────────────────────
  if (q) {
    const { products } = await getProducts({ q })
    const categoryById = new Map(categories.map((c) => [c.id, c]))

    return (
      <>
        <PageHero
          eyebrow="Búsqueda"
          title={`Resultados para "${q}"`}
          subtitle={`${products.length} producto(s) encontrados.`}
        />

        <div className="bg-warm-white px-6 py-12 md:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-8">
              <CategoryNav categories={categories} activeSlug="" />
            </div>

            <div className="mb-8 flex flex-col items-start gap-4 rounded-wings-card border border-gold/40 bg-gold/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-body text-sm text-navy">
                {products.length === 0
                  ? `No encontramos productos para esa búsqueda. Habla con Mister — te ayuda a importar cualquier producto desde China.`
                  : '¿Volumen mayor o especificaciones particulares? Mister te ayuda a importar y nacionalizar desde China.'}
              </p>
              <Link href={`/mister?context=${encodeURIComponent(q)}`}>
                <Button size="sm">Hablar con Mister</Button>
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
                      <h3 className="font-display text-xl font-light text-navy">{p.name_es}</h3>
                      <p className="mt-1 line-clamp-2 font-body text-sm text-text-muted">
                        {p.description_es}
                      </p>
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

  // ── Gateway view — the category landing ───────────────────────────────────
  // Per-category model counts (exact, cheap — limit 1, read the total).
  const counts = await Promise.all(
    categories.map((c) =>
      getProducts({ category: c.slug, limit: 1 }).then((r) => r.total).catch(() => 0),
    ),
  )

  return (
    <>
      {/* Editorial hero — matches the per-category hero grammar */}
      <header className="hero-mesh hero-grain relative overflow-hidden px-6 pb-20 pt-36 text-warm-white md:px-10 md:pb-28 md:pt-48">
        <div className="relative z-[1] mx-auto w-full max-w-6xl">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest-3 text-gold/80">
            CATÁLOGO · WINGS GLOBAL TRADE
          </p>
          <h1 className="font-display text-display-lg font-light">Catálogo</h1>
          <p className="mt-5 max-w-2xl font-body text-body-lg text-warm-white/55">
            {categories.length} categorías de importación. Selecciona una categoría para ver sus
            subcategorías, modelos y especificaciones. Consulta técnica sin cuenta requerida.
          </p>
        </div>
      </header>

      {/* Category gateway grid */}
      <div className="bg-warm-white px-6 py-12 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => {
              const identity = getCategoryIdentity(c)
              return (
                <Link
                  key={c.id}
                  href={`/catalogo/${c.slug}`}
                  className="group flex flex-col justify-between border border-[rgba(0,30,80,0.09)] bg-white p-6 transition-colors duration-200 hover:border-navy hover:bg-navy"
                >
                  <div>
                    <div className="mb-6 flex items-start justify-between">
                      <CategoryIcon
                        iconKey={identity.iconKey}
                        className="h-8 w-8 text-navy/40 transition-colors duration-200 group-hover:text-gold"
                      />
                      <span className="font-mono text-[10px] uppercase tracking-widest-2 tabular-nums text-navy/30 transition-colors duration-200 group-hover:text-warm-white/40">
                        {counts[i]} modelos
                      </span>
                    </div>
                    <h2 className="font-display text-2xl font-light text-navy transition-colors duration-200 group-hover:text-warm-white">
                      {c.name_es}
                    </h2>
                    <p className="mt-2 max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-[0.10em] text-navy/40 transition-colors duration-200 group-hover:text-warm-white/50">
                      {identity.tagline}
                    </p>
                  </div>
                  <span className="mt-6 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest-2 text-gold/50 transition-colors duration-200 group-hover:text-gold">
                    <span className="h-px w-4 bg-current" aria-hidden />
                    Ver categoría
                  </span>
                </Link>
              )
            })}

            {/* Mister card — the "anything else" dead-end, consistent with CategoryNav */}
            <Link
              href="/mister"
              className="group flex flex-col justify-between border border-navy bg-navy p-6 transition-colors duration-200 hover:bg-[#002266]"
            >
              <div>
                <div className="mb-6 flex items-start justify-between">
                  <CategoryIcon iconKey="mister" className="h-8 w-8 text-gold" />
                </div>
                <h2 className="font-display text-2xl font-light text-warm-white">
                  Importación personalizada
                </h2>
                <p className="mt-2 max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-[0.10em] text-warm-white/50">
                  ¿No está en el catálogo? Mister importa cualquier producto desde China.
                </p>
              </div>
              <span className="mt-6 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest-2 text-gold">
                <span className="h-px w-4 bg-current" aria-hidden />
                Hablar con Mister
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
