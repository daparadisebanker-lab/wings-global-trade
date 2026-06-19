// src/app/catalogo/[category]/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategoryBySlug, getProductBySlug, getRelatedProducts } from '@/lib/catalog-data'
import { PageHero } from '@/components/features/shared/PageHero'
import { ProductDetail } from '@/components/features/catalog/ProductDetail'
import { ProductCard } from '@/components/features/catalog/ProductCard'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { productSchema, breadcrumbSchema } from '@/lib/schema'
import { Button } from '@/components/ui/button'
import { MagneticButton } from '@/components/features/catalog/MagneticButton'

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

  // Breadcrumb schema (JSON-LD)
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

  // Related products — same category, excludes current product, limit 4
  const related = await getRelatedProducts(product.id, product.category_id, 4)

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd data={productSchemaData} />

      <PageHero
        eyebrow={cat?.name_es ?? 'Catálogo'}
        title={product.name_es}
        subtitle={heroSubtitle}
      />

      {/* Visual breadcrumb — rendered below hero */}
      <div className="bg-warm-white px-6 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <Breadcrumb
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Catálogo', href: '/catalogo' },
              { label: cat?.name_es ?? 'Catálogo', href: `/catalogo/${category}` },
              { label: product.name_es },
            ]}
          />
        </div>
      </div>

      <ProductDetail product={product} categorySlug={category} totalInCategory={related.length + 1} />

      {/* "También podría interesarte" strip — same category, up to 4 products */}
      {related.length > 0 && cat && (
        <section className="bg-warm-white px-6 py-16 md:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
              También en esta categoría
            </p>
            {/* Responsive grid — 1 col mobile, 2 on sm, up to 4 on xl */}
            <div
              className={`grid gap-5 ${
                related.length === 1
                  ? 'grid-cols-1 max-w-xs'
                  : related.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
              }`}
            >
              {related.map((p) => (
                <ProductCard key={p.id} product={p} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product → /mister CTA */}
      <section className="bg-navy px-6 py-16 md:px-10">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest-2 text-gold">
            Mister · Asistente IA
          </p>
          <h2 className="mt-2 font-display text-display-md font-semibold text-warm-white">
            ¿Necesitas importarlo desde China a volumen?
          </h2>
          <p className="mx-auto mt-3 max-w-lg font-body text-lg text-text-muted-inverse">
            Mister te acompaña en todo el proceso — desde la cotización CIF hasta la
            nacionalización en destino, vía ZOFRATACNA o ZOFRI.
          </p>
          <div className="mt-8">
            <MagneticButton className="inline-block">
              <Link href="/mister">
                <Button size="lg">Hablar con Mister</Button>
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>
    </>
  )
}
