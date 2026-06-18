// src/lib/routing.ts
// Search intent detection for the homepage unified search bar.
// Mirrors logic in /spec/component-architecture.md.

export type SearchIntent =
  | { type: 'catalog'; category: string | null }
  | { type: 'accio' }
  | { type: 'ambiguous' }

const CATALOG_KEYWORDS: Record<string, string> = {
  tractor: 'maquinaria-agricola',
  cosechadora: 'maquinaria-agricola',
  arado: 'maquinaria-agricola',
  sembradora: 'maquinaria-agricola',
  labranza: 'maquinaria-agricola',
  agricola: 'maquinaria-agricola',
  'agrícola': 'maquinaria-agricola',
  camion: 'camiones',
  'camión': 'camiones',
  volquete: 'camiones',
  furgon: 'camiones',
  'furgón': 'camiones',
  bus: 'buses',
  buses: 'buses',
  minibus: 'buses',
  'minibús': 'buses',
  generador: 'equipo-industrial',
  compresor: 'equipo-industrial',
  montacargas: 'equipo-industrial',
  industrial: 'equipo-industrial',
  repuesto: 'repuestos',
  repuestos: 'repuestos',
  filtro: 'repuestos',
  neumatico: 'repuestos',
  'neumático': 'repuestos',
}

const ACCIO_KEYWORDS = [
  'importar',
  'importacion',
  'importación',
  'contenedor',
  'contenedores',
  'certificacion',
  'certificación',
  'lote',
  'volumen',
  'personalizado',
  'especifico',
  'específico',
  'granel',
  'hs',
  'arancel',
  'zona franca',
  'zofratacna',
  'zofri',
]

export function detectSearchIntent(query: string): SearchIntent {
  const q = query.toLowerCase().trim()
  if (!q) return { type: 'ambiguous' }

  // HS code pattern (4-8 digits) routes to Accio.
  if (/^\d{4,8}$/.test(q)) return { type: 'accio' }

  for (const [keyword, category] of Object.entries(CATALOG_KEYWORDS)) {
    if (q.includes(keyword)) return { type: 'catalog', category }
  }

  for (const keyword of ACCIO_KEYWORDS) {
    if (q.includes(keyword)) return { type: 'accio' }
  }

  return { type: 'ambiguous' }
}

/** Resolve a SearchIntent + raw query into a destination URL. */
export function resolveSearchUrl(query: string): string {
  const q = query.trim()
  const intent = detectSearchIntent(q)
  const encoded = encodeURIComponent(q)

  switch (intent.type) {
    case 'catalog':
      return intent.category
        ? `/catalogo/${intent.category}?q=${encoded}`
        : `/catalogo?q=${encoded}`
    case 'accio':
      return `/mister?context=${encoded}`
    case 'ambiguous':
    default:
      return `/catalogo?q=${encoded}`
  }
}
