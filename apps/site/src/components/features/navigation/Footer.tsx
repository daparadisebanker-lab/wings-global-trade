// src/components/features/navigation/Footer.tsx
// Wings adapter over the shared @wings/trade-ui TrustFooter (M3). Markup lives in
// the organ; this file supplies Wings-specific content only. Output is identical
// to the pre-extraction Footer.
import Link from 'next/link'
import type { Category } from '@/types/database'
import {
  FREE_ZONES,
  MARKETS_SERVED,
  WINGS_PUBLIC_EMAIL,
  WINGS_PUBLIC_WHATSAPP,
} from '@/lib/constants'
import { buildWhatsAppLink } from '@/lib/utils'
import { TrustFooter } from '@wings/trade-ui'

interface FooterProps {
  categories: Category[]
}

const NAV_SERVICES = [
  { href: '/cotizar', label: 'Solicitar cotización' },
  { href: '/proceso', label: 'Cómo importar' },
  { href: '/mister', label: 'Mister IA' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export function Footer({ categories }: FooterProps) {
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
      categories={categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name_es }))}
      catalogAllHref="/catalogo"
      catalogAllLabel="Todo el catálogo"
      catalogHref={(slug) => `/catalogo/${slug}`}
      services={NAV_SERVICES}
      zones={FREE_ZONES.map((z) => ({ name: z.name, location: z.location }))}
      marketsLabel="Mercados"
      markets={MARKETS_SERVED}
      email={WINGS_PUBLIC_EMAIL}
      whatsappHref={buildWhatsAppLink(
        WINGS_PUBLIC_WHATSAPP,
        'Hola, me interesa importar equipamiento a través de Wings Global Trade.',
      )}
      whatsappLabel="WhatsApp"
      quoteHref="/cotizar"
      quoteLabel="Solicitar cotización"
      originLabel="Origen"
      origins="China · Tailandia · Japón · Dubai"
      colophon={
        <>
          © {new Date().getFullYear()} Wings Global Trade
          <span className="mx-2 text-gold/20">·</span>
          Importación industrial para América Latina
        </>
      }
      labels={{
        catalog: 'Catálogo',
        services: 'Servicios',
        operations: 'Operaciones',
        markets: 'Mercados',
        contact: 'Contacto',
      }}
    />
  )
}
