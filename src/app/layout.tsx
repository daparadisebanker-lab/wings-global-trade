// src/app/layout.tsx
import type { Metadata } from 'next'
import { IBM_Plex_Serif, DM_Mono } from 'next/font/google'
import './globals.css'

import { getCategories } from '@/lib/catalog-data'
import { SiteNav } from '@/components/features/navigation/SiteNav'
import { Footer } from '@/components/features/navigation/Footer'
import { ToastProvider } from '@/components/ui/toast'
import { CompareBar } from '@/components/features/catalog/CompareBar'
import { MultiInquiryPanel } from '@/components/features/catalog/MultiInquiryPanel'
import { ComparisonProvider } from '@/contexts/comparison-context'
import { WINGS_TAGLINE } from '@/lib/constants'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationSchema } from '@/lib/schema'

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://wingsglobaltrade.com'),
  title: {
    default: 'Wings Global Trade — Importación B2B para LATAM',
    template: '%s — Wings Global Trade',
  },
  description:
    'Maquinaria agrícola, camiones, buses y equipo industrial. Importación directa con gestión en zona franca ZOFRATACNA y ZOFRI. Consulta sin registro.',
  openGraph: {
    title: 'Wings Global Trade — Importación B2B para LATAM',
    description:
      'Maquinaria agrícola, camiones, buses y equipo industrial. Importación directa con gestión en zona franca ZOFRATACNA y ZOFRI. Consulta sin registro.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com',
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories()

  return (
    <html lang="es" className={`${ibmPlexSerif.variable} ${dmMono.variable}`}>
      <head>
        <JsonLd data={organizationSchema()} />
      </head>
      <body className="font-body antialiased">
        <ToastProvider>
          <ComparisonProvider>
            <SiteNav categories={categories} />
            <main className="min-h-screen overflow-x-clip">{children}</main>
            <Footer categories={categories} />
            <CompareBar />
            <MultiInquiryPanel />
          </ComparisonProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
