import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Admin Portal — Wings Global Trade',
  description: 'Portal administrativo de Wings Global Trade. Interno, nunca público.',
}

/**
 * Root layout. `data-app="tower"` on <html> cascades the control-room livery
 * tokens (globals.css) across the whole app, including the login route. Spanish
 * is the default locale (Wings is Spanish-first).
 */
// Applies a persisted theme before first paint (no flash). Only an explicit
// stored choice flips to dark — no data-theme means Daylight (light), so partial
// dark never ships to live users before the component sweep completes. The theme
// toggle that writes this key mounts with the macOS shell (P2), not before, so we
// never expose a control that has nothing to theme yet.
const THEME_BOOTSTRAP = `try{var t=localStorage.getItem('tower-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-app="tower" suppressHydrationWarning>
      <body className="bg-surface-0 font-ui text-ink-primary antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        {children}
      </body>
    </html>
  )
}
