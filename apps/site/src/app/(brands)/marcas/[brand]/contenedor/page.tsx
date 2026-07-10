// src/app/(brands)/marcas/[brand]/contenedor/page.tsx
// The buy-in-container instrument (SPEC §4). Server component reads live
// fill state from the rb_public_* views (fixture fallback without env) and
// hands serializable props to the client configurator.
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getBrand, ALADIN_PRODUCTS } from '@/lib/rb/fixtures'
import { getRbContainers, getRbTemplateForBrand } from '@/lib/rb/data'
import { ContainerConfigurator } from '@/components/features/brands/ContainerConfigurator'

// Fill-state staleness rule (SPEC §2.7④): a stale «quedan 3» destroys the
// trust the page exists to build — revalidate at most every 60 s.
export const revalidate = 60

interface PageProps {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: slug } = await params
  const brand = getBrand(slug)
  if (!brand) return {}
  return {
    title: `Comprar ${brand.name} por contenedor — cupos y contenedor completo`,
    description: `Configure su participación en un contenedor de ${brand.name}: por cupos o por cantidad, con la equivalencia exacta en cajas, unidades y kilos. Reserva documentada, sin pago en línea.`,
  }
}

export default async function BrandContainerPage({ params }: PageProps) {
  const { brand: slug } = await params
  const brand = getBrand(slug)
  if (!brand) notFound()

  const [containers, template] = await Promise.all([
    getRbContainers(brand.slug),
    getRbTemplateForBrand(brand.slug),
  ])
  if (!template) notFound()

  // The ?producto= deep link is read client-side (page stays ISR-cacheable).
  const productNames = Object.fromEntries(ALADIN_PRODUCTS.map((p) => [p.slug, p.name]))

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <header className="max-w-2xl">
        <h1 className="font-display text-display-md text-neutral-900">
          Comprar en contenedor
        </h1>
        <p className="mt-4 text-body-md text-neutral-600">
          Cada contenedor de {brand.name} se divide en cupos con equivalencia exacta.
          Configure por cupos o por cantidad; la reserva es documentada, sin pago en
          línea, y un asesor confirma condiciones dentro de las 72 horas.
        </p>
      </header>

      <div className="mt-12">
        {/* useSearchParams inside requires a Suspense boundary under SSG */}
        <Suspense fallback={null}>
          <ContainerConfigurator
            brand={{ code: brand.code, slug: brand.slug, name: brand.name }}
            containers={containers}
            template={template}
            productNames={productNames}
          />
        </Suspense>
      </div>
    </div>
  )
}
