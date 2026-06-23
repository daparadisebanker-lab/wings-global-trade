// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
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

export const viewport: Viewport = {
  themeColor: '#001E50',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://wingsglobaltrade.com'),
  applicationName: 'Wings Global Trade',
  title: {
    default: 'Wings Global Trade — Importación B2B para LATAM',
    template: '%s — Wings Global Trade',
  },
  description:
    'Maquinaria agrícola, camiones, buses y equipo industrial. Importación directa con gestión en zona franca ZOFRATACNA y ZOFRI. Consulta sin registro.',
  icons: {
    icon: [{ url: '/brand/wings-isotipo-bg.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/brand/wings-isotipo-bg.svg' }],
    shortcut: '/brand/wings-isotipo-bg.svg',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Wings Global Trade — Importación B2B para LATAM',
    description:
      'Maquinaria agrícola, camiones, buses y equipo industrial. Importación directa con gestión en zona franca ZOFRATACNA y ZOFRI. Consulta sin registro.',
    siteName: 'Wings Global Trade',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Wings Global Trade' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wings Global Trade — Importación B2B para LATAM',
    description:
      'Maquinaria agrícola, camiones, buses y equipo industrial. Importación directa con zona franca ZOFRATACNA y ZOFRI.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories()

  return (
    <html lang="es">
      <head>
        {/* Preload display font before first paint — eliminates FOUT flash on hero headlines */}
        <link rel="preload" href="/fonts/NissanOpti.otf" as="font" type="font/opentype" crossOrigin="anonymous" />
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
