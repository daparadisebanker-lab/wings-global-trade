// src/app/mister/page.tsx
// Mister v2 — embedded consultation surface.
// Replaced old MisterChat (TPR/CIF flow) with MisterEmbedded (v2 session flow).
import type { Metadata } from 'next'
import { MisterEmbedded } from '@/components/features/mister/MisterEmbedded'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema, misterSoftwareApplicationSchema, MISTER_FAQS } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Mister — Inteligencia de Pre-Calificación de Importación',
  description:
    'Plataforma IA de inteligencia comercial para importadores B2B. Autocalifica tu importación, entiende la estructura del costo de internación, y accede al siguiente paso correcto — sin adivinanzas de precios.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Mister — Inteligencia de Pre-Calificación',
    description:
      'Resuelve tu perfil de importación, entiende la estructura del costo, y pre-califica — antes de ser cotizado.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/mister',
    siteName: 'Wings Global Trade',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mister — Inteligencia de Pre-Calificación',
    description: 'Plataforma IA para importadores. Pre-califica antes de cotización.',
  },
  alternates: {
    canonical: 'https://wingsglobaltrade.com/mister',
    languages: {
      'es-PE': 'https://wingsglobaltrade.com/mister',
      'en': 'https://wingsglobaltrade.com/en/mister',
    },
  },
}

export default function MisterPage() {
  return (
    // SiteNav hides itself on /mister, so full 100dvh is available with no offset.
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <JsonLd data={misterSoftwareApplicationSchema()} />
      <JsonLd data={faqSchema(MISTER_FAQS)} />
      <MisterEmbedded currentPage="/mister" />
    </div>
  )
}
