// src/app/catalogo/[category]/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategoryBySlug, getProductBySlug, getProducts } from '@/lib/catalog-data'
import { PageHero } from '@/components/features/shared/PageHero'
import { ProductDetail } from '@/components/features/catalog/ProductDetail'
import { ProductCard } from '@/components/features/catalog/ProductCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { productSchema, breadcrumbSchema } from '@/lib/schema'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, category } = await params
  const product = await getProductBySlug(slug)

  if (!product) return { title: 'Producto no encontrado' }

  const cat = await getCategoryBySlug(category)

  const title =
    product.meta_title_es ||
    `${product.name_es} — ${cat?.name_es ?? 'Catálogo'} | Wings`

  const description =
    product.meta_desc_es ||
    `${product.name_es} de origen ${product.source_markets?.[0] ?? 'internacional'}. Ficha técnica completa. Solicita consulta de importación vía zona franca. Respuesta en 24 horas.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: 'es_PE',
      type: 'website',
      url: `https://wingsglobaltrade.com/catalogo/${category}/${slug}`,
      ...(product.images?.[0] && { images: [{ url: product.images[0], width: 1200, height: 630 }] }),
    },
    alternates: {
      canonical: `https://wingsglobaltrade.com/catalogo/${category}/${slug}`,
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { category, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const cat = await getCategoryBySlug(category)

  const heroSubtitle = `${cat?.name_es ?? 'Catálogo'} · Origen: ${product.source_markets.join(', ')} · Disponible vía ZOFRATACNA / ZOFRI`

  // Breadcrumb schema
  const breadcrumbs = [
    { name: 'Inicio', url: 'https://wingsglobaltrade.com' },
    { name: 'Catálogo', url: 'https://wingsglobaltrade.com/catalogo' },
    { name: cat?.name_es ?? 'Catálogo', url: `https://wingsglobaltrade.com/catalogo/${category}` },
    { name: product.name_es, url: `https://wingsglobaltrade.com/catalogo/${category}/${slug}` },
  ]

  // Product.brand does not exist on the Product type — use source market as brand proxy
  const productSchemaData = productSchema({
    name: product.name_es,
    description: product.description_es,
    image: product.images?.[0],
    sku: product.slug,
    brand: product.source_markets?.[0] ?? 'Wings Global Trade',
    sourceMarket: product.source_markets?.[0] ?? 'China',
    category: cat?.name_es,
    specs: product.specs as Record<string, string>,
  })

  // Related products — same category, 3 items
  const { products: relatedProducts } = await getProducts({ category })
  const related = relatedProducts.filter((p) => p.slug !== slug).slice(0, 3)

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd data={productSchemaData} />

      <PageHero
        eyebrow={cat?.name_es ?? 'Catálogo'}
        title={product.name_es}
        subtitle={heroSubtitle}
      />
      <ProductDetail product={product} />

      {/* Related products */}
      {related.length > 0 && cat && (
        <section className="bg-warm-white px-6 py-16 md:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest-2 text-gold">
              Productos relacionados
            </p>
            <h2 className="mb-8 font-display text-display-sm font-semibold text-navy">
              Más modelos de {cat.name_es}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product → /accio CTA */}
      <section className="bg-navy px-6 py-16 md:px-10">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest-2 text-gold">
            Motor Accio
          </p>
          <h2 className="mt-2 font-display text-display-md font-semibold text-warm-white">
            ¿Importación a volumen o con especificaciones particulares?
          </h2>
          <p className="mx-auto mt-3 max-w-lg font-body text-lg text-text-muted-inverse">
            El Motor Accio calcula un estimado CIF real antes de la primera llamada — vía
            ZOFRATACNA (Tacna, Perú) o ZOFRI (Iquique, Chile).
          </p>
          <div className="mt-8">
            <Link href="/accio">
              <Button size="lg">Calcular mi importación</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
