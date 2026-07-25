import type { Metadata, Viewport } from 'next'
import { RecordProvider } from '@/lib/record'
import './globals.css'

export const metadata: Metadata = {
  title: 'La Escalera — Catálogo de azulejos',
  description:
    'Catálogo de azulejos por gestos: desliza, guarda tu muestrario y envía la solicitud con las cajas, los kilos y los pallets ya calculados.',
}

export const viewport: Viewport = {
  // The deck is a thumb surface: no accidental zoom mid-swipe, and the browser
  // chrome takes the deck's ground so the card reads edge-to-edge.
  themeColor: '#0e0f12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <RecordProvider>{children}</RecordProvider>
      </body>
    </html>
  )
}
