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
import { segmentSlug as toSegmentSlug } from './segments'

export interface FichaSpecRow {
  label: string
  value: string
}

export interface FichaSpecGroup {
  label: string
  rows: FichaSpecRow[]
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
  /** Canonical taxonomy slug for segmentLabel (lane.config.ts), when the
   *  label maps to one — drives the VehicleTypeIcon anchor on the document. */
  segmentSlug: string | null
  descriptionEs: string | null
  /** Flat list — kept for the print document (ficha-document.css's table)
   *  and as the per-trim "applies to every version" row set (SpecTable's
   *  TrimTable). */
  specs: FichaSpecRow[]
  /** The same specs, grouped for the on-screen SpecTable. Two groups only —
   *  General and Motor y transmisión — because those are the only real
   *  buckets this catalog's five spec keys map to; no Dimensiones or
   *  Equipamiento group exists because no such data exists per nameplate
   *  (never fabricated to fill out a four-group template). */
  specGroups: FichaSpecGroup[]
  trims: string[]
  sourceMarkets: string[]
}

const GROUPS: { label: string; keys: readonly string[] }[] = [
  { label: 'General', keys: ['Segmento', 'Plazas'] },
  { label: 'Motor y transmisión', keys: ['Motor', 'Transmisión', 'Tracción'] },
]
const SPEC_ORDER = GROUPS.flatMap((g) => g.keys)
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

  const specGroups: FichaSpecGroup[] = GROUPS.map((g) => ({
    label: g.label,
    rows: g.keys.filter((key) => product.specs?.[key]).map((key) => ({ label: key, value: product.specs[key] })),
  }))

  // Any additional spec keys the fixed groups didn't cover (future-proofing
  // — never silently drops a spec the catalog data actually carries).
  const extras: FichaSpecRow[] = []
  for (const [label, value] of Object.entries(product.specs ?? {})) {
    if (SPEC_EXCLUDE.has(label) || (SPEC_ORDER as readonly string[]).includes(label)) continue
    specs.push({ label, value })
    extras.push({ label, value })
  }
  if (extras.length > 0) specGroups.push({ label: 'Otros', rows: extras })

  return {
    productId: product.id,
    slug: product.slug,
    reference: buildReference(product.slug),
    nameEs: brand ? product.name_es.replace(`${brand.name} `, '') : product.name_es,
    brand,
    segmentLabel: typeof product.specs?.['Segmento'] === 'string' ? product.specs['Segmento'] : null,
    segmentSlug:
      typeof product.specs?.['Segmento'] === 'string' ? (toSegmentSlug(product.specs['Segmento']) ?? null) : null,
    descriptionEs: product.description_es || null,
    specs,
    specGroups,
    trims: (product.models ?? []).map((m) => m.name),
    sourceMarkets: product.source_markets ?? [],
  }
}
