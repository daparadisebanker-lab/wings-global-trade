// src/lib/routing.ts
// Search intent detection for the homepage unified search bar.
// Mirrors logic in /spec/component-architecture.md.

import { CATALOGUE_CODES } from '@/pasillo/data/codeIndex'
import { PASILLO_ROUTES, LANE_BASE } from '@/pasillo/lib/routes'

export type SearchIntent =
  | { type: 'catalog'; category: string | null }
  | { type: 'mister' }
  /** A WGT lane surface. `href` is resolved from the lane's own route contract. */
  | { type: 'lane'; href: string }
  | { type: 'ambiguous' }

/** Discipline and product vocabulary for WGT/02 Interiores. */
const LANE_KEYWORDS: Record<string, string> = {
  azulejo: PASILLO_ROUTES.lane,
  azulejos: PASILLO_ROUTES.lane,
  ceramica: PASILLO_ROUTES.lane,
  'cerámica': PASILLO_ROUTES.lane,
  ceramico: PASILLO_ROUTES.lane,
  'cerámico': PASILLO_ROUTES.lane,
  baldosa: PASILLO_ROUTES.lane,
  baldosas: PASILLO_ROUTES.lane,
  porcelanato: PASILLO_ROUTES.lane,
  mayolica: PASILLO_ROUTES.lane,
  'mayólica': PASILLO_ROUTES.lane,
  revestimiento: PASILLO_ROUTES.lane,
  enchape: PASILLO_ROUTES.lane,
  piso: PASILLO_ROUTES.lane,
  pisos: PASILLO_ROUTES.lane,
  interiores: LANE_BASE,
  acabados: LANE_BASE,
  mobiliario: LANE_BASE,
  'iluminación': LANE_BASE,
  iluminacion: LANE_BASE,
  textiles: LANE_BASE,
  griferia: LANE_BASE,
  'grifería': LANE_BASE,
  'ff&e': LANE_BASE,
  'os&e': LANE_BASE,
}

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

const MISTER_KEYWORDS = [
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

  // A printed SKU code wins over every heuristic below, and MUST be tested
  // before the HS-code rule: the Azulejos catalogue carries bare numeric codes
  // (1500084 …) that the 4–8 digit pattern swallows whole, so a buyer pasting a
  // real code off a WhatsApp thread was being delivered to the AI advisor
  // instead of to the tile. Exact set membership, not a prefix guess.
  const code = query.trim().toUpperCase()
  if (CATALOGUE_CODES.has(code)) {
    return { type: 'lane', href: `${PASILLO_ROUTES.lane}?sku=${encodeURIComponent(code)}` }
  }

  // HS code pattern (4-8 digits) routes to Mister.
  if (/^\d{4,8}$/.test(q)) return { type: 'mister' }

  for (const [keyword, href] of Object.entries(LANE_KEYWORDS)) {
    if (q.includes(keyword)) return { type: 'lane', href }
  }

  for (const [keyword, category] of Object.entries(CATALOG_KEYWORDS)) {
    if (q.includes(keyword)) return { type: 'catalog', category }
  }

  for (const keyword of MISTER_KEYWORDS) {
    if (q.includes(keyword)) return { type: 'mister' }
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
    case 'lane':
      // Already a resolved route from the lane's own contract — no literal here.
      return intent.href
    case 'mister':
      return `/mister?context=${encoded}`
    case 'ambiguous':
    default:
      return `/catalogo?q=${encoded}`
  }
}
