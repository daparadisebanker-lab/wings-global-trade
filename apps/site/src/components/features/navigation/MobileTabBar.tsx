// src/components/features/navigation/MobileTabBar.tsx
// Persistent mobile thumb-zone navigation (UX audit 2026-07-20, roadmap #1).
// Puts the four primary paths — browse, quote, Mister, WhatsApp — one thumb-tap
// away at all times, so conversion actions survive the header's scroll-away
// auto-hide. Mobile only (lg:hidden); desktop keeps the header + Mister door.
//
// Reconciled with the other bottom-fixed controls: the Mister floating button
// is hidden < lg (folded into the Mister tab here), and the catalog Compare/
// Multi-inquiry FABs are lifted above this bar on mobile.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buildWhatsAppLink, cn } from '@/lib/utils'
import { WINGS_PUBLIC_WHATSAPP } from '@/lib/constants'

const WHATSAPP_HREF = buildWhatsAppLink(
  WINGS_PUBLIC_WHATSAPP,
  'Hola, estoy revisando Wings Global Trade y me gustaría más información.',
)

interface TabIconProps {
  className?: string
}

function CatalogIcon({ className }: TabIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function QuoteIcon({ className }: TabIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4M9 12h6M9 16h6" />
    </svg>
  )
}

function MisterIcon({ className }: TabIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: TabIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3z" />
      <path d="M8.5 8.5c-.3 1 .2 2.4 1.4 3.6s2.6 1.7 3.6 1.4c.5-.15.9-.7.9-1.2 0-.3-.2-.5-.5-.7l-1-.5c-.3-.15-.6-.05-.8.2l-.3.4c-.7-.3-1.4-1-1.7-1.7l.4-.3c.25-.2.35-.5.2-.8l-.5-1c-.15-.3-.4-.5-.7-.5-.5 0-1.05.4-1.2.9z" />
    </svg>
  )
}

export function MobileTabBar() {
  const pathname = usePathname()

  // /mister is a fullscreen world takeover — the bar would break its boundary
  // (same rule as SiteNav).
  if (pathname === '/mister') return null

  const tabs = [
    {
      key: 'catalogo',
      href: '/catalogo',
      label: 'Catálogo',
      Icon: CatalogIcon,
      active: pathname?.startsWith('/catalogo') ?? false,
      external: false,
    },
    {
      key: 'cotizar',
      href: '/cotizar',
      label: 'Cotizar',
      Icon: QuoteIcon,
      active: pathname?.startsWith('/cotizar') ?? false,
      external: false,
    },
    {
      key: 'mister',
      href: '/mister',
      label: 'Mister',
      Icon: MisterIcon,
      active: false,
      external: false,
    },
    {
      key: 'whatsapp',
      href: WHATSAPP_HREF,
      label: 'WhatsApp',
      Icon: WhatsAppIcon,
      active: false,
      external: true,
    },
  ]

  return (
    <nav
      aria-label="Navegación principal móvil"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(196,147,63,0.14)] bg-[#000C1F]/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch">
        {tabs.map(({ key, href, label, Icon, active, external }) => {
          const className = cn(
            'flex h-14 w-full flex-col items-center justify-center gap-1 transition-colors',
            active ? 'text-gold' : 'text-warm-white/60 active:text-warm-white',
          )
          const inner = (
            <>
              <Icon className="h-5 w-5" />
              <span className="font-mono text-[9px] uppercase tracking-[0.10em]">{label}</span>
            </>
          )
          return (
            <li key={key} className="flex-1">
              {external ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={className}
                >
                  {inner}
                </a>
              ) : (
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={className}
                >
                  {inner}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
