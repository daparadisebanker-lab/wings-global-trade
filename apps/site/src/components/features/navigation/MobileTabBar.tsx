// src/components/features/navigation/MobileTabBar.tsx
// Persistent mobile thumb-zone navigation (UX audit 2026-07-20, roadmap #1;
// visual redesign 2026-07-20).
//
// Design thesis — "instrument rail, not app tabs": one coherent geometric icon
// family drawn on a 24-grid at an optically-corrected 1.6 stroke, and the
// active tab lights up with the Wings GOLD cap-rule on its top edge — the same
// signature device as SiteNav's scroll-progress line and BrandShelfNav's accent
// line — so the bar reads as part of the system, not a generic template strip.
//
// Puts the four primary paths — browse, quote, Mister, WhatsApp — one thumb-tap
// away at all times, surviving the header's scroll-away auto-hide. Mobile only
// (lg:hidden); desktop keeps the header + Mister door. Reconciled with the other
// bottom-fixed controls (Mister button hidden < lg; catalog FABs lifted above).
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buildWhatsAppLink, cn } from '@/lib/utils'
import { WINGS_PUBLIC_WHATSAPP } from '@/lib/constants'

const WHATSAPP_HREF = buildWhatsAppLink(
  WINGS_PUBLIC_WHATSAPP,
  'Hola, estoy revisando Wings Global Trade y me gustaría más información.',
)

// ---------------------------------------------------------------------------
// Icon family — 24-grid, stroke 1.6, round caps. One optical weight, one
// geometric language (echoes the CategoryIcon industrial line-art, inked up for
// legibility at rail scale).
// ---------------------------------------------------------------------------

interface IconProps {
  className?: string
}

function svgProps(className?: string) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  }
}

// Catálogo — 2×2 module grid, deliberately mirroring the category gateway's
// own grid-of-categories layout.
function CatalogIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  )
}

// Cotizar — a quote/manifest sheet with a folded corner and ruled lines.
function QuoteIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M6 2.75h7.5L18.25 7.5V21.25H6z" />
      <path d="M13.5 2.75V7.5h4.75" />
      <path d="M9 12h6M9 15.5h6" />
    </svg>
  )
}

// Mister — the four-point spark (Mister's motif across the site), sharpened.
function MisterIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M12 3l1.7 6.3L20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7z" />
    </svg>
  )
}

// WhatsApp — bubble with tail + handset curve.
function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M20 11.6a8 8 0 0 1-11.7 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.6z" />
      <path d="M9.1 9.2c-.2.9.35 2.1 1.35 3.1s2.2 1.55 3.1 1.35c.5-.1.85-.65.85-1.15 0-.3-.2-.55-.5-.65l-.95-.4c-.3-.15-.6 0-.75.25l-.2.35c-.65-.3-1.2-.85-1.5-1.5l.35-.2c.25-.15.4-.45.25-.75l-.4-.95c-.1-.3-.35-.5-.65-.5-.5 0-.95.4-1.15.9z" />
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(196,147,63,0.16)] bg-[#000814]/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch">
        {tabs.map(({ key, href, label, Icon, active, external }) => {
          const inner = (
            <>
              {/* Active cap-rule — the Wings gold signature device */}
              <span
                aria-hidden
                className={cn(
                  'absolute inset-x-3 top-0 h-[2px] origin-center rounded-full bg-gold transition-transform duration-300',
                  active ? 'scale-x-100' : 'scale-x-0',
                )}
              />
              <Icon
                className={cn(
                  'h-[22px] w-[22px] transition-colors duration-200',
                  active ? 'text-gold' : 'text-warm-white/55 group-active:text-warm-white',
                )}
              />
              <span
                className={cn(
                  'font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors duration-200',
                  active ? 'text-warm-white' : 'text-warm-white/45 group-active:text-warm-white/80',
                )}
              >
                {label}
              </span>
            </>
          )
          const className =
            'group relative flex h-16 w-full flex-col items-center justify-center gap-1.5 transition-transform duration-100 active:scale-[0.96]'
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
