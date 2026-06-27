// src/app/mister/page.tsx
import type { Metadata } from 'next'
import { MisterChat } from '@/components/features/mister/MisterChat'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema, WINGS_FAQS } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Mister — Tu asistente de importación desde China | Wings',
  description:
    'Mister es el asistente IA de Wings Global Trade. Te ayuda a importar desde China y a nacionalizar en destino — cotización CIF, aranceles, zona franca y más. Sin llamadas previas.',
  openGraph: {
    title: 'Mister — Tu asistente de importación desde China | Wings',
    description:
      'Mister es el asistente IA de Wings Global Trade. Te ayuda a importar desde China y a nacionalizar en destino — cotización CIF, aranceles, zona franca y más. Sin llamadas previas.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/mister',
  },
  alternates: {
    canonical: 'https://wingsglobaltrade.com/mister',
  },
}

export default async function MisterPage({
  searchParams,
}: {
  searchParams: Promise<{ context?: string }>
}) {
  const { context } = await searchParams
  return (
    <div className="bg-[#000C1F] min-h-screen">
      <JsonLd data={faqSchema(WINGS_FAQS)} />
      <MisterChat initialContext={context} />
    </div>
  )
}
