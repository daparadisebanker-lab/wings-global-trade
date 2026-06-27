// src/lib/schema.ts
// JSON-LD schema factory functions for SEO/AEO

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Wings Global Trade',
    url: 'https://wingsglobaltrade.com',
    logo: 'https://wingsglobaltrade.com/brand/wings-isotipo-bg.svg',
    description:
      'Plataforma B2B de importación de maquinaria, vehículos y equipo industrial para América Latina. Gestión en zona franca ZOFRATACNA (Tacna, Perú) y ZOFRI (Iquique, Chile).',
    slogan: 'Precisión. Proximidad. Confianza.',
    foundingLocation: {
      '@type': 'Place',
      addressCountry: 'PE',
    },
    areaServed: [
      { '@type': 'Country', name: 'Peru' },
      { '@type': 'Country', name: 'Chile' },
      { '@type': 'Country', name: 'Colombia' },
      { '@type': 'Country', name: 'Panama' },
      { '@type': 'Country', name: 'Bolivia' },
      { '@type': 'Country', name: 'Costa Rica' },
      { '@type': 'Country', name: 'Dominican Republic' },
    ],
    knowsAbout: [
      'Importación de maquinaria agrícola',
      'Zona Franca ZOFRATACNA',
      'Zona Franca ZOFRI',
      'Comercio internacional B2B',
      'Logística de importación CIF',
      'Camiones y vehículos comerciales importados',
      'Equipo industrial de origen chino',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      availableLanguage: {
        '@type': 'Language',
        name: 'Spanish',
      },
    },
    sameAs: [],
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Wings Global Trade',
    url: 'https://wingsglobaltrade.com',
    inLanguage: 'es',
    description:
      'Catálogo B2B de maquinaria, vehículos y equipo industrial para importadores latinoamericanos.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://wingsglobaltrade.com/catalogo?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function productSchema(product: {
  name: string
  description: string
  image?: string
  sku?: string
  brand: string
  sourceMarket: string
  category?: string
  specs?: Record<string, string>
}) {
  const additionalProperty = product.specs
    ? Object.entries(product.specs).map(([name, value]) => ({
        '@type': 'PropertyValue',
        name,
        value: String(value),
      }))
    : []

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    countryOfOrigin: product.sourceMarket,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Wings Global Trade',
        url: 'https://wingsglobaltrade.com',
      },
    },
  }

  if (product.image) schema.image = product.image
  if (product.sku) schema.sku = product.sku
  if (product.category) schema.category = product.category
  if (additionalProperty.length > 0) schema.additionalProperty = additionalProperty

  return schema
}

export function faqSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }
}

// AEO-specific FAQs for Mister and Nosotros pages
export const WINGS_FAQS = [
  {
    q: '¿Qué es la zona franca ZOFRATACNA?',
    a: 'ZOFRATACNA es la Zona Franca de Tacna, ubicada en el extremo sur del Perú. Permite importar mercancías con beneficios arancelarios para su distribución en el mercado peruano y boliviano. Wings Global Trade opera con infraestructura activa en ZOFRATACNA para gestionar importaciones de maquinaria, vehículos y equipo industrial.',
  },
  {
    q: '¿Qué es ZOFRI y para qué sirve?',
    a: 'ZOFRI es la Zona Franca de Iquique, en el norte de Chile. Es el principal hub de importación con beneficios arancelarios para distribución en Chile, Colombia y Panamá. Wings Global Trade gestiona importaciones de maquinaria y equipo industrial a través de ZOFRI para clientes en el Cono Sur y la región andina.',
  },
  {
    q: '¿Qué incluye el costo CIF en una importación?',
    a: 'CIF significa Costo, Seguro y Flete (Cost, Insurance, Freight). Incluye el precio FOB del producto en el puerto de origen, más el flete marítimo internacional y el seguro de la carga hasta el puerto de destino. Es la base de cálculo para determinar el arancel de importación en la mayoría de los países latinoamericanos. Mister, el asistente IA de Wings, calcula un estimado CIF antes de cualquier llamada.',
  },
  {
    q: '¿Cuánto tiempo tarda Wings en responder una consulta?',
    a: 'El equipo de Wings responde en menos de 24 horas hábiles para todas las consultas del catálogo y de Mister. Para consultas urgentes, se puede contactar directamente vía WhatsApp.',
  },
  {
    q: '¿Cuánto se puede ahorrar importando a través de zona franca?',
    a: 'Importar a través de zona franca puede reducir el costo de internación entre un 15% y un 40% en comparación con la importación directa sin zona franca, dependiendo del producto, el país de destino y la clasificación arancelaria aplicable.',
  },
  {
    q: '¿Desde qué países importa Wings Global Trade?',
    a: 'Wings Global Trade importa desde China, Japón, Tailandia y Dubai (Emiratos Árabes Unidos). China y Tailandia son los mercados principales para maquinaria agrícola. China y Japón para camiones y buses. China y Dubai para equipo industrial y repuestos.',
  },
]
