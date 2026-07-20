// src/lib/category-identity.ts
// -----------------------------------------------------------------------------
// Category identity layer — the per-category "branded space" content contract.
//
// Governance (root CLAUDE.md §1 "same box, different livery"; site decision
// 2026-07-20 "icon + texture, keep Wings gold"): categories do NOT introduce a
// new accent hue. The Wings gold accent is family-wide and frozen here. A
// category's identity is expressed through three derived-by-rule signals only:
//   1. its SVG icon motif (Category.icon_key → CategoryIcon)
//   2. its subheader copy (tagline + register)
//   3. its texture selection (from the existing hero utility set)
// Structure is identical in every category, so the swap test (root §4 QA-6)
// passes trivially — only content and the icon differ.
//
// This map is keyed by slug for authored copy, but getCategoryIdentity() always
// falls back to the live Category row (name_es, description_es, icon_key) so an
// unauthored/new category still renders the full branded structure.
// -----------------------------------------------------------------------------

import type { Category } from '@/types/database'

/** Free zone through which the category's cargo is nationalised. */
export type FreeZone = 'ZOFRATACNA' | 'ZOFRI'

/** Texture posture — restricted to the existing hero utility set (no new CSS). */
export type CategoryTexture = 'mesh' | 'grain' | 'mesh-grain'

export interface CategoryIdentity {
  /** SVG motif key resolved against CategoryIcon. */
  iconKey: string
  /** Subheader line under the H1 — one sentence, technical, no exclamation. */
  tagline: string
  /**
   * The category's purchase logic in one line — what the buyer negotiates in.
   * Exhibited in the intelligence block. Never a price, availability or lead time.
   */
  register: string
  /** Typical source markets, display-only (mirrors CATEGORY_SEO markets). */
  markets: string
  /** Free zone used for nationalisation. */
  freeZone: FreeZone
  /** Hero texture posture. */
  texture: CategoryTexture
}

/**
 * Authored identities. Keys cover the union of the seed set, migration 0006,
 * and the mega-menu references so "all categories" holds regardless of which
 * set the live DB returns.
 */
const IDENTITIES: Record<string, CategoryIdentity> = {
  'maquinaria-agricola': {
    iconKey: 'tractor',
    tagline: 'Tractores, cosechadoras y equipo de labranza de origen chino, tailandés y japonés.',
    register: 'Se importa por unidad: el CBM de cada máquina define el llenado del contenedor.',
    markets: 'China, Tailandia y Japón',
    freeZone: 'ZOFRATACNA',
    texture: 'mesh-grain',
  },
  camiones: {
    iconKey: 'truck',
    tagline: 'Camiones ligeros y pesados de origen chino y japonés para operación comercial.',
    register: 'Se importa por unidad; el tonelaje y la configuración de cabina definen la carga.',
    markets: 'China y Japón',
    freeZone: 'ZOFRATACNA',
    texture: 'mesh-grain',
  },
  buses: {
    iconKey: 'bus',
    tagline: 'Buses escolares, urbanos e interurbanos para operadores de transporte de pasajeros.',
    register: 'Se importa por unidad o por flota; la propulsión define el perfil de operación.',
    markets: 'China y Japón',
    freeZone: 'ZOFRATACNA',
    texture: 'mesh-grain',
  },
  'buses-y-transporte': {
    iconKey: 'bus',
    tagline: 'Buses urbanos, interurbanos, escolares y minibuses para transporte masivo.',
    register: 'Se importa por unidad o por flota; la propulsión define el perfil de operación.',
    markets: 'China y Japón',
    freeZone: 'ZOFRATACNA',
    texture: 'mesh-grain',
  },
  'equipo-industrial': {
    iconKey: 'industrial',
    tagline: 'Montacargas, compactadores, generadores y equipos de bombeo de origen chino y de Dubái.',
    register: 'Se importa por unidad; la capacidad nominal define la especificación del equipo.',
    markets: 'China y Dubái',
    freeZone: 'ZOFRI',
    texture: 'mesh-grain',
  },
  motocicletas: {
    iconKey: 'motorcycle',
    tagline: 'Motos de trabajo, mototaxis de tres ruedas, motocultores y cuatrimotos ATV.',
    register: 'Se importa por lote; el volumen por unidad define la densidad del contenedor.',
    markets: 'China e India',
    freeZone: 'ZOFRATACNA',
    texture: 'mesh-grain',
  },
  automoviles: {
    iconKey: 'car',
    tagline: 'Automóviles y utilitarios de marcas asiáticas para distribución e importación directa.',
    register: 'Se importa por unidad o por contenedor según la mezcla de modelos.',
    markets: 'China, Japón y Corea',
    freeZone: 'ZOFRATACNA',
    texture: 'mesh-grain',
  },
  repuestos: {
    iconKey: 'parts',
    tagline: 'Repuestos, consumibles y lubricantes para maquinaria, camiones y equipo industrial.',
    register: 'Se importa por volumen de referencia; el código y la compatibilidad definen el pedido.',
    markets: 'China, Tailandia y Dubái',
    freeZone: 'ZOFRATACNA',
    texture: 'mesh-grain',
  },
  utv: {
    iconKey: 'utv',
    tagline: 'Vehículos utilitarios todo terreno (UTV / side-by-side) y cuatrimotos para trabajo y off-road.',
    register: 'Se importa por unidad o por lote; el volumen por unidad define la densidad del contenedor.',
    markets: 'China',
    freeZone: 'ZOFRATACNA',
    texture: 'mesh-grain',
  },
}

/** Sensible defaults when a category has no authored identity yet. */
const FALLBACK: Omit<CategoryIdentity, 'iconKey' | 'tagline'> = {
  register: 'Consulta técnica sin registro; Mister recopila los requisitos para importar.',
  markets: 'China, Japón y Tailandia',
  freeZone: 'ZOFRATACNA',
  texture: 'mesh-grain',
}

/**
 * Resolve a category's identity, always returning a complete object. Authored
 * copy wins; anything missing is derived from the live Category row so the
 * branded structure never renders empty.
 */
export function getCategoryIdentity(category: Category): CategoryIdentity {
  const authored = IDENTITIES[category.slug]
  if (authored) return authored

  return {
    iconKey: category.icon_key ?? 'gear',
    tagline:
      category.description_es ??
      `Catálogo de ${category.name_es.toLowerCase()} para importación con gestión en zona franca.`,
    ...FALLBACK,
  }
}
