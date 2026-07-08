import { TrustFooter } from '@wings/trade-ui'

// TrustFooter is a server organ with no framer-motion — no capture patch needed.
// It ships its own dark ground (#000C1F) + warm-white ink, so cells render it
// full-bleed. Content is ported from the site's Wings Footer adapter; renderLink
// uses a plain anchor here (the app injects next/link).
const renderLink = (href: string, className: string, children: React.ReactNode) => (
  <a href={href} className={className}>
    {children}
  </a>
)

const CATEGORIES = [
  { id: '1', slug: 'maquinaria', name: 'Maquinaria' },
  { id: '2', slug: 'buses-transporte', name: 'Buses y transporte' },
  { id: '3', slug: 'equipos-industriales', name: 'Equipos industriales' },
  { id: '4', slug: 'agroindustria', name: 'Agroindustria' },
]

const SERVICES = [
  { href: '/cotizar', label: 'Solicitar cotización' },
  { href: '/proceso', label: 'Cómo importar' },
  { href: '/mister', label: 'Mister IA' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

const ZONES = [
  { name: 'ZOFRATACNA', location: 'Tacna, Perú' },
  { name: 'ZOFRI', location: 'Iquique, Chile' },
]

const MARKETS = ['Perú', 'Chile', 'Colombia', 'Panamá', 'Costa Rica', 'Bolivia', 'R. Dominicana']

const LABELS = {
  catalog: 'Catálogo',
  services: 'Servicios',
  operations: 'Operaciones',
  markets: 'Mercados',
  contact: 'Contacto',
}

export function PieCompleto() {
  return (
    <TrustFooter
      renderLink={renderLink}
      logoSrc="/Wings-logo-imagotipo-color.svg"
      logoAlt="Wings Global Trade"
      tagline="Importación técnica para el mercado latinoamericano. Zonas francas. Sin intermediarios."
      categories={CATEGORIES}
      catalogAllHref="/catalogo"
      catalogAllLabel="Todo el catálogo"
      catalogHref={(slug) => `/catalogo/${slug}`}
      services={SERVICES}
      zones={ZONES}
      marketsLabel="Mercados"
      markets={MARKETS}
      email="comercial@wingsglobaltrade.com"
      whatsappHref="https://wa.me/50760250735"
      whatsappLabel="WhatsApp"
      quoteHref="/cotizar"
      quoteLabel="Solicitar cotización"
      originLabel="Origen"
      origins="China · Tailandia · Japón · Dubai"
      colophon={
        <>
          © 2026 Wings Global Trade
          <span className="mx-2 text-gold/20">·</span>
          Importación industrial para América Latina
        </>
      }
      labels={LABELS}
    />
  )
}

// Payload-driven: a leaner lane feeds fewer categories/markets through the same
// organ with no structural change — the swap-test invariant made visible.
export function PieLaneCompacto() {
  return (
    <TrustFooter
      renderLink={renderLink}
      logoSrc="/Wings-logo-imagotipo-color.svg"
      logoAlt="Wings Global Trade"
      tagline="Origen agrícola documentado para compradores mayoristas de América Latina."
      categories={[
        { id: '1', slug: 'granos', name: 'Granos' },
        { id: '2', slug: 'cafe-cacao', name: 'Café y cacao' },
      ]}
      catalogAllHref="/catalogo"
      catalogAllLabel="Todo el catálogo"
      catalogHref={(slug) => `/catalogo/${slug}`}
      services={[
        { href: '/cotizar', label: 'Solicitar cotización' },
        { href: '/proceso', label: 'Cómo exportar' },
        { href: '/contacto', label: 'Contacto' },
      ]}
      zones={[{ name: 'Callao', location: 'Lima, Perú' }]}
      marketsLabel="Destinos"
      markets={['Países Bajos', 'España', 'Alemania']}
      email="export@wingsglobaltrade.com"
      whatsappHref="https://wa.me/50760250735"
      whatsappLabel="WhatsApp"
      quoteHref="/cotizar"
      quoteLabel="Solicitar cotización"
      originLabel="Origen"
      origins="Perú · Ecuador · Colombia"
      colophon={<>© 2026 Wings Global Trade · Casa de origen</>}
      labels={{
        catalog: 'Catálogo',
        services: 'Servicios',
        operations: 'Operaciones',
        markets: 'Destinos',
        contact: 'Contacto',
      }}
    />
  )
}
