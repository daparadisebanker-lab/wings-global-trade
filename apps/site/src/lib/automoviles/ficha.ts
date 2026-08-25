// src/lib/automoviles/ficha.ts
// WGT/07's "ficha técnica" — the printable technical spec sheet, one per
// nameplate. Mirrors the pattern already proven in TOWER
// (apps/tower/src/lib/quotation/ficha.ts + .../actions/ficha.ts): a pure
// document model built from catalog facts, rendered by a presentational
// component, downloaded via window.print() rather than a server-generated
// PDF. Not a cross-app import — apps/site and apps/tower are separate Next
// apps with no shared import path (apps/site's own CLAUDE.md: packages/ is
// the only shared layer) — this re-derives the same disciplined pattern
// with the site's own public Product shape instead of TOWER's authenticated
// tower.products schema, which apps/site has no access to and shouldn't.
//
// No money on a ficha (same law as TOWER's): this is a spec artifact, never
// a price artifact — root CLAUDE.md §1.2, wholesale-only, no absolute price
// anywhere on the site.
import type { Product } from '@/types/database'
import { getOemBrandByName, type OemBrand } from './oem-brands'

export interface FichaSpecRow {
  label: string
  value: string
}

export interface FichaDocument {
  productId: string
  slug: string
  /** Deterministic reference, e.g. "FT-WGT07-TOYOTA-CAMRY" — not a minted
   *  sequential number (this is an unauthenticated public site; there is no
   *  registry to mint against, unlike TOWER's tower.mint_ficha_no). Stable
   *  for the life of the slug, never re-derived differently on reload. */
  reference: string
  nameEs: string
  brand: OemBrand | null
  segmentLabel: string | null
  descriptionEs: string | null
  specs: FichaSpecRow[]
  trims: string[]
  sourceMarkets: string[]
}

const SPEC_ORDER = ['Segmento', 'Motor', 'Transmisión', 'Tracción', 'Plazas'] as const
// Shown as the dedicated trims list instead, not duplicated in the spec table.
const SPEC_EXCLUDE = new Set(['Versiones disponibles'])

function buildReference(slug: string): string {
  return `FT-WGT07-${slug.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`
}

export function buildFichaDocument(product: Product): FichaDocument {
  const rawBrand = product.filter_attrs?.brand
  const brandName = typeof rawBrand === 'string' ? rawBrand : undefined
  const brand = brandName ? (getOemBrandByName(brandName) ?? null) : null

  const specs: FichaSpecRow[] = SPEC_ORDER.filter((key) => product.specs?.[key]).map((key) => ({
    label: key,
    value: product.specs[key],
  }))
  // Any additional spec keys the fixed order didn't cover (future-proofing —
  // never silently drops a spec the catalog data actually carries).
  for (const [label, value] of Object.entries(product.specs ?? {})) {
    if (SPEC_EXCLUDE.has(label) || (SPEC_ORDER as readonly string[]).includes(label)) continue
    specs.push({ label, value })
  }

  return {
    productId: product.id,
    slug: product.slug,
    reference: buildReference(product.slug),
    nameEs: brand ? product.name_es.replace(`${brand.name} `, '') : product.name_es,
    brand,
    segmentLabel: typeof product.specs?.['Segmento'] === 'string' ? product.specs['Segmento'] : null,
    descriptionEs: product.description_es || null,
    specs,
    trims: (product.models ?? []).map((m) => m.name),
    sourceMarkets: product.source_markets ?? [],
  }
}
