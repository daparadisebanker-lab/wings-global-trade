// src/app/layout.tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Mono } from 'next/font/google'
import './globals.css'

import { getCategories } from '@/lib/catalog-data'
import { SiteNav } from '@/components/features/navigation/SiteNav'
import { Footer } from '@/components/features/navigation/Footer'
import { ToastProvider } from '@/components/ui/toast'
import { WINGS_TAGLINE } from '@/lib/constants'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationSchema } from '@/lib/schema'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
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
    <html lang="es" className={`${cormorant.variable} ${dmMono.variable}`}>
      <head>
        <JsonLd data={organizationSchema()} />
      </head>
      <body className="font-body antialiased">
        <ToastProvider>
          <SiteNav categories={categories} />
          <main className="min-h-screen">{children}</main>
          <Footer categories={categories} />
        </ToastProvider>
      </body>
    </html>
  )
}
