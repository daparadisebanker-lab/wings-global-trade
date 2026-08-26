// /automoviles/ficha/[slug] — the ficha técnica as a print-ready page.
// Mirrors TOWER's /ficha/[id]/document exactly in mechanism (window.print(),
// [data-print-hidden] toolbar, A4 @page) — see apps/site/src/lib/automoviles/
// ficha.ts for why this is a re-derivation, not a cross-app import. Public,
// unauthenticated (this lane has no auth), so no RLS boundary to cross —
// getProductBySlug already reads the same public catalog every other
// automóviles page reads.
import type { Metadata } from 'next'
import { getCategoryBySlug, getProductBySlug, getProducts } from '@/lib/catalog-data'
import { buildFichaDocument } from '@/lib/automoviles/ficha'
import { FichaAutomovilDocument } from './FichaAutomovilDocument'
import { PrintBar } from './PrintBar'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { products } = await getProducts({ category: 'automoviles', limit: 100 })
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: `Ficha técnica — ${product.name_es} | Wings Global Trade`,
    description: `Especificaciones técnicas de ${product.name_es}: ${product.description_es ?? 'catálogo directo de fábrica'}.`,
    robots: { index: false, follow: true }, // a reference document, not a landing page
  }
}

export default async function FichaAutomovilPage({ params }: PageProps) {
  const { slug } = await params
  const [product, category] = await Promise.all([getProductBySlug(slug), getCategoryBySlug('automoviles')])
  const isAutomovil = product && category && product.category_id === category.id

  if (!product || !isAutomovil) {
    return (
      <div className="fdoc-page">
        <div className="fdoc-error">
          <p>No se pudo cargar la ficha técnica.</p>
          <p className="fdoc-error-sub">El modelo no existe o ya no está en catálogo.</p>
        </div>
      </div>
    )
  }

  const doc = buildFichaDocument(product)
  const backHref = doc.brand ? `/automoviles/marcas/${doc.brand.slug}` : '/automoviles/marcas'

  return (
    <div className="fdoc-page">
      <PrintBar reference={doc.reference} backHref={backHref} />
      <FichaAutomovilDocument doc={doc} />
    </div>
  )
}
