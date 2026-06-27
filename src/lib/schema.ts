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

export function misterSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Mister',
    alternateName: 'Mister by Wings Global Trade',
    description:
      'Plataforma IA de inteligencia comercial de pre-calificación para importadores B2B. Ayuda a los importadores a entender la estructura del costo de internación y auto-calificarse antes de una cotización formal.',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'B2B Trade Intelligence',
    operatingSystem: 'Web',
    url: 'https://wingsglobaltrade.com/mister',
    author: {
      '@type': 'Organization',
      name: 'Wings Global Trade',
      url: 'https://wingsglobaltrade.com',
      logo: 'https://wingsglobaltrade.com/brand/wings-isotipo-bg.svg',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '0',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: 127,
    },
    screenshot: 'https://wingsglobaltrade.com/mister-screenshot.png',
    softwareVersion: '2.0',
    releaseDate: '2026-06-01',
    featureList: [
      'Clasificación de comprador en 5 arquetipos',
      'Cascada de costo de internación indexada',
      'Biblioteca de documentos SUNAT/aduanales',
      'Matriz de responsabilidad Incoterm',
      'Mapeo de corredor Tacna/Iquique',
      'Calculadora MOQ',
      'Enrutamiento de cotización prefillada',
    ],
    inLanguage: ['es', 'en'],
  }
}

// AEO-specific FAQs for Mister — 8 questions per seo-agent.md spec
export const MISTER_FAQS = [
  {
    q: '¿Qué es el costo de internación y cómo está estructurado?',
    a: 'El costo de internación es el gasto total de importar mercancías, apilado en capas: costo del producto + flete marítimo + seguro + aranceles/impuestos aduanales SUNAT + entrega última milla. Mister desglosa cada capa usando rangos indexados, para que entiendas la estructura antes de solicitar una cotización formal.',
  },
  {
    q: '¿Cuál es la diferencia entre ZOFRATACNA e Iquique?',
    a: 'ZOFRATACNA (Perú) y ZOFRI (Chile) son zonas de libre comercio donde las mercancías se pueden almacenar suspensión de impuestos. Tacna es óptima para importación hacia Perú y Bolivia. Iquique sirve a Chile, Colombia y Panamá. Ambas pueden nacionalizar mercancías en Perú vía SUNAT. Elige según tu mercado de destino y tipo de producto.',
  },
  {
    q: '¿Qué significa CIF y quién paga qué?',
    a: 'CIF (Costo, Seguro y Flete) significa que Wings cubre el costo de la mercancía, el seguro de carga y el flete marítimo hasta tu puerto de destino. A partir de ese puerto, tú (el comprador) controlas el despacho aduanal y la entrega última milla. Tu elección de Incoterm determina dónde termina la responsabilidad de Wings y comienza la tuya.',
  },
  {
    q: '¿Qué documentos necesito para importar maquinaria al Perú?',
    a: 'La importación estándar de maquinaria al Perú vía ZOFRATACNA requiere: factura comercial, lista de empaque, conocimiento de embarque (BL) / carta de porte aéreo, certificado de origen y clasificación HS para SUNAT. Mister muestra la lista completa según tu país de destino y tipo de mercancía. Puedes descargarla y compartir con tu agente aduanal.',
  },
  {
    q: '¿Por qué Mister no me da una cotización de precio?',
    a: 'Porque una cotización de precio demasiado temprano — antes de que entiendas la estructura del costo de internación y tus necesidades exactas estén definidas — quiebra la confianza cuando llega la cotización real. Mister te muestra CÓMO se construye el costo (cascada indexada), para que cuando recibas una cotización formal, el número tenga sentido y no te sorprenda.',
  },
  {
    q: '¿Qué es MOQ y cómo afecta mi importación?',
    a: 'MOQ (Cantidad Mínima de Pedido) es la cantidad más pequeña que puedes pedir de Wings para un producto. Un MOQ más alto desbloquea descuentos por volumen. Tu costo de internación por unidad baja. Mister te muestra la tabla MOQ para tu categoría, para que modeles el impacto en margen antes de comprometerte.',
  },
  {
    q: '¿Cómo sé cuál es mi arquetipo?',
    a: 'Mister hace 3-4 preguntas simples en lenguaje natural: ¿Compras para tu propia operación o para revender? ¿Es una compra única o parte de un proyecto más grande? ¿Te importa más el costo más bajo o las especificaciones y certeza de entrega? Tus respuestas resuelven tu arquetipo: Comprador Principal, Gerente de Proyectos, Gerente de Logística, Revendedor o Socio Mayorista. Entonces Mister personaliza toda la inteligencia siguiente a tu perfil específico.',
  },
  {
    q: '¿Qué pasa después de completar la conversación con Mister?',
    a: 'Cuando has reunido suficiente inteligencia y alcanzas la puerta de pre-calificación (destino, plazo, volumen aproximado), haces clic en "Enviar consulta." Mister prefilla un formulario de cotización con todo lo que te ha preguntado — tu arquetipo, intereses de producto, preferencias de estructura de costo — luego te enruta al equipo Wings apropiado (ventas, proyectos, logística, alianzas). El formulario y tu resumen de sesión se envían directamente a operaciones vía WhatsApp y email.',
  },
]

// Legacy FAQs for general pages — kept for backwards compatibility
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
