import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TOWER — Wings Global Trade',
  description: 'The control tower behind The Manifest. Internal, never public.',
}

/**
 * Root layout. `data-app="tower"` on <html> cascades the control-room livery
 * tokens (globals.css) across the whole app, including the login route. Spanish
 * is the default locale (Wings is Spanish-first).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-app="tower">
      <body className="bg-surface-0 font-ui text-ink-primary antialiased">{children}</body>
    </html>
  )
}
