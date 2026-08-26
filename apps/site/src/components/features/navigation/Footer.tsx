// src/components/features/navigation/Footer.tsx
//
// Wings adapter over the shared @wings/trade-ui TrustFooter. The organ owns the
// markup and the accordion; this file owns the content.
//
// THE DIVISIONS SECTION IS DERIVED, not typed. It reads the same lane configs
// the routes and the Mister packs read, so opening WGT/03 puts it in the footer
// with its code and its status automatically — and an OPENING division renders
// as a stamp rather than a link, because there is no page behind it yet. That is
// the whole point of building this as a hub: lane N+1 costs nothing here.

import Link from 'next/link'
import type { Category } from '@/types/database'
import {
  FREE_ZONES,
  MARKETS_SERVED,
  WINGS_PUBLIC_EMAIL,
  WINGS_PUBLIC_WHATSAPP,
} from '@/lib/constants'
import { buildWhatsAppLink } from '@/lib/utils'
import { LANES } from '@/lib/lanes/registry'
import { categoryHref } from '@/lib/category-href'
import { TrustFooter, type FooterSection } from '@wings/trade-ui'

interface FooterProps {
  categories: Category[]
}

// TAILWIND CANNOT APPLY AN OPACITY MODIFIER TO AN ARBITRARY var() COLOUR:
// `text-[color:var(--chrome-ink,#F8F6F0)]/35` emits NO RULE AT ALL, so the
// element silently inherits and only looks right while the inherited ink
// happens to be near-white. color-mix() survives compilation, and Tailwind's
// scanner only sees string literals, so the ladder lives here.
const INK_50 = 'text-[color:color-mix(in_srgb,var(--chrome-ink,#F8F6F0)_50%,transparent)]'
const INK_30 = 'text-[color:color-mix(in_srgb,var(--chrome-ink,#F8F6F0)_30%,transparent)]'
const INK_20 = 'text-[color:color-mix(in_srgb,var(--chrome-ink,#F8F6F0)_20%,transparent)]'

const SERVICES = [
  { href: '/cotizar', label: 'Solicitar cotización' },
  { href: '/proceso', label: 'Cómo importar' },
  { href: '/marcas', label: 'Marcas representadas' },
  { href: '/mister', label: 'Mister IA' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

/**
 * The six coded divisions. Those with a registered lane config resolve to their
 * real route and status; the rest are declared here so the footer states the
 * whole architecture from day one — the same argument the lane page makes for
 * showing six disciplines with one open.
 */
const DIVISIONS: { code: string; slug: string; label: string; href?: string }[] = [
  { code: 'WGT/01', slug: 'catalogo', label: 'Maquinaria y automotriz' },
  { code: 'WGT/02', slug: 'interiores', label: 'Interiores' },
  { code: 'WGT/03', slug: 'provisiones', label: 'Provisiones' },
  { code: 'WGT/04', slug: 'living', label: 'Living' },
  { code: 'WGT/05', slug: 'representacion', label: 'Representación' },
  { code: 'WGT/06', slug: 'exportacion', label: 'Exportación' },
  // WGT/07 registered 2026-08-23, route migration landed 2026-08-24 — the
  // generic `/${slug}` build below now resolves correctly to the real live
  // /automoviles route, so no href override is needed (it was pinned to
  // /catalogo/automoviles here for one commit while that migration was
  // pending).
  { code: 'WGT/07', slug: 'automoviles', label: 'Automóviles' },
]

export function Footer({ categories }: FooterProps) {
  // Widened deliberately: LANES is `as const`, so its slugs narrow to a union
  // and a lookup by an arbitrary string would not type-check. The registry is
  // the source of truth for WHICH lanes exist, not for which slugs are legal.
  const registered = new Map<string, { status: string }>(
    LANES.map((l) => [l.slug as string, { status: l.status as string }]),
  )

  const divisions = DIVISIONS.map((d) => {
    // WGT/01 has no lane config yet — it is the pre-lane catalogue and its route
    // is live, so it is ACTIVE by virtue of existing rather than by registration.
    const lane = registered.get(d.slug)
    const isLive = d.slug === 'catalogo' || lane?.status === 'ACTIVE' || lane?.status === 'OPENING'
    return {
      href: d.href ?? (isLive ? `/${d.slug}` : '#'),
      label: d.label,
      code: d.code,
      status: (isLive ? 'ACTIVE' : 'OPENING') as 'ACTIVE' | 'OPENING',
    }
  })

  const sections: FooterSection[] = [
    { id: 'divisiones', label: 'Divisiones', links: divisions },
    {
      id: 'catalogo',
      label: 'Catálogo',
      links: [
        { href: '/catalogo', label: 'Todo el catálogo' },
        ...categories.map((c) => ({ href: categoryHref(c.slug), label: c.name_es })),
      ],
    },
    { id: 'servicios', label: 'Servicios', links: SERVICES },
    {
      id: 'operaciones',
      label: 'Operaciones',
      body: (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {FREE_ZONES.map((z) => (
              <li key={z.name} className="flex flex-col gap-0.5">
                <span className={`font-mono text-[11px] ${INK_50}`}>
                  {z.name}
                </span>
                <span className={`font-mono text-[10px] ${INK_30}`}>
                  {z.location}
                </span>
              </li>
            ))}
          </ul>
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--chrome-label,rgba(196,147,63,0.35))]">
              Mercados
            </p>
            <p className={`font-mono text-[10px] leading-loose ${INK_30}`}>
              {MARKETS_SERVED.join(' · ')}
            </p>
          </div>
          <div>
            <p className={`mb-2 font-mono text-[10px] uppercase tracking-[0.12em] ${INK_20}`}>
              Origen
            </p>
            <p className={`font-mono text-[10px] leading-loose ${INK_30}`}>
              China · Tailandia · Japón · Dubai
            </p>
          </div>
          <a
            href={`mailto:${WINGS_PUBLIC_EMAIL}`}
            className={`font-mono text-[11px] ${INK_50} transition-colors duration-150 hover:text-[color:var(--chrome-ink,#F8F6F0)]`}
          >
            {WINGS_PUBLIC_EMAIL}
          </a>
        </div>
      ),
    },
  ]

  return (
    <TrustFooter
      renderLink={(href, className, children) => (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
      logoSrc="/Wings-logo-imagotipo-color.svg"
      logoAlt="Wings Global Trade"
      tagline="Importación técnica para el mercado latinoamericano. Zonas francas. Sin intermediarios."
      sections={sections}
      whatsappHref={buildWhatsAppLink(
        WINGS_PUBLIC_WHATSAPP,
        'Hola, me interesa importar equipamiento a través de Wings Global Trade.',
      )}
      whatsappLabel="WhatsApp"
      quoteHref="/cotizar"
      quoteLabel="Solicitar cotización"
      colophon={
        <>
          © {new Date().getFullYear()} Wings Global Trade
          <span className="mx-2 opacity-30">·</span>
          Importación industrial para América Latina
        </>
      }
    />
  )
}
