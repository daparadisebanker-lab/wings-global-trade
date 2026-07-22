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
// Applies the resolved theme before first paint (no flash). An explicit stored
// choice always wins; absent one, it honors the OS `prefers-color-scheme` (P5 —
// safe to enable now that dark is escapable on BOTH surfaces: the desktop TopBar
// toggle and the mobile Control Center toggle).
const THEME_BOOTSTRAP = `try{var t=localStorage.getItem('tower-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}`

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
