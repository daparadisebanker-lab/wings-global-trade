// src/app/cubicaje/page.tsx
// CUBICAJE — the standalone container-fit tool. A contained blueprint room
// (scoped-experience law: structural containment via its own route; the
// clean catalog pages carry only a door here). Prefills from ?producto=
// but works for any cargo dims typed by hand.
import type { Metadata } from 'next'
import { getProductBySlug, getCategories } from '@/lib/catalog-data'
import { dimsFromSpecs } from '@/lib/cubicaje/fit'
import { CubicajeTool } from '@/components/features/cubicaje/CubicajeTool'

export const metadata: Metadata = {
  title: 'Cubicaje — ¿cuántas unidades entran en un contenedor?',
  description:
    'Herramienta de cubicaje de Wings Global Trade: ingrese las dimensiones de su carga y visualice cuántas unidades entran en un contenedor 20GP, 40GP o 40HC.',
}

// searchParams-driven prefill → rendered per request
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ producto?: string }>
}

export default async function CubicajePage({ searchParams }: PageProps) {
  const { producto } = await searchParams

  let initialDims = null
  let productName: string | null = null
  let productHref: string | null = null
  if (producto) {
    const product = await getProductBySlug(producto)
    if (product) {
      initialDims = dimsFromSpecs(product.specs as Record<string, string> | null)
      productName = product.name_es
      const categories = await getCategories()
      const cat = categories.find((c) => c.id === product.category_id)
      productHref = cat ? `/catalogo/${cat.slug}/${product.slug}` : null
    }
  }

  return (
    <div
      className="min-h-screen bg-navy-950 pb-24 pt-28 md:pt-32"
      style={{
        backgroundImage:
          'linear-gradient(rgba(196,147,63,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(196,147,63,0.055) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-widest-3 text-gold">
            Herramienta técnica · estimación de carga
          </p>
          <h1 className="mt-3 font-display text-display-lg text-warm-white">Cubicaje</h1>
          <p className="mt-4 text-body-lg text-warm-white/60">
            ¿Cuántas unidades entran en un contenedor? Ingrese las dimensiones de su
            carga — o llegue desde cualquier producto del catálogo — y véalo dibujado
            a proporción real.
          </p>
        </header>

        <CubicajeTool initialDims={initialDims} productName={productName} productHref={productHref} />
      </div>
    </div>
  )
}
