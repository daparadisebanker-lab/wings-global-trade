// src/app/accio/page.tsx
import type { Metadata } from 'next'
import { AccioChat } from '@/components/features/accio/AccioChat'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema, WINGS_FAQS } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Motor Accio — Importación Gestionada Zona Franca | Wings',
  description:
    'Describe tu producto. El Motor Accio calcula el costo CIF vía ZOFRATACNA o ZOFRI y genera tu requisito técnico. Sin llamadas previas.',
  openGraph: {
    title: 'Motor Accio — Importación Gestionada Zona Franca | Wings',
    description:
      'Describe tu producto. El Motor Accio calcula el costo CIF vía ZOFRATACNA o ZOFRI y genera tu requisito técnico. Sin llamadas previas.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/accio',
  },
  alternates: {
    canonical: 'https://wingsglobaltrade.com/accio',
  },
}

export default async function AccioPage({
  searchParams,
}: {
  searchParams: Promise<{ context?: string }>
}) {
  const { context } = await searchParams
  return (
    <>
      <JsonLd data={faqSchema(WINGS_FAQS)} />
      <AccioChat initialContext={context} />
    </>
  )
}
