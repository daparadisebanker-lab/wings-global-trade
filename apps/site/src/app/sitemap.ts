import type { MetadataRoute } from 'next'
import { getCategories, getProducts } from '@/lib/catalog-data'

const BASE = 'https://wingsglobaltrade.com'
const buildDate = new Date().toISOString().split('T')[0]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories()
  const { products } = await getProducts({ limit: 500 })
  const categoryBySlugId = new Map(categories.map((c) => [c.id, c.slug]))

  // Static routes with priority and changeFrequency per seo-agent.md spec
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      priority: 1.0,
      changeFrequency: 'weekly',
      lastModified: buildDate,
    },
    {
      url: `${BASE}/mister`,
      priority: 0.9,
      changeFrequency: 'monthly',
      lastModified: buildDate,
    },
    {
      url: `${BASE}/nosotros`,
      priority: 0.5,
      changeFrequency: 'monthly',
      lastModified: buildDate,
    },
    {
      url: `${BASE}/contacto`,
      priority: 0.5,
      changeFrequency: 'monthly',
      lastModified: buildDate,
    },
  ]

  // Category pages with priority 0.8 and weekly change frequency
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/catalogo/${c.slug}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
    lastModified: buildDate,
  }))

  // Product detail pages with priority 0.7 and monthly change frequency
  // Products are already filtered by is_active: true in getProducts()
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/catalogo/${categoryBySlugId.get(p.category_id) ?? 'maquinaria-agricola'}/${p.slug}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
    lastModified: p.updated_at ? p.updated_at.split('T')[0] : buildDate,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
