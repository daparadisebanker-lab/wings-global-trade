import type { Metadata, Viewport } from 'next'
import { RecordProvider } from '@/lib/record'
import './globals.css'

export const metadata: Metadata = {
  title: 'El Pasillo — catálogo de azulejos',
  description:
    'El catálogo del proveedor como un pasillo: recorre las series, guarda las que sirven y sal con un muestrario que ya sabe cuántas cajas, cuántos kilos y cuánto contenedor.',
}

export const viewport: Viewport = {
  // The lane recedes; the browser chrome takes its ground.
  themeColor: '#0d0d0d',
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
