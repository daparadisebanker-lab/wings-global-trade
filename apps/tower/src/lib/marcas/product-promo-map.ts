// src/lib/marcas/product-promo-map.ts
// Pure mapper: a catalog ProductRow → a rb-core ProductPromo for the marketing
// studio's "Catálogo" source. The product's `specs` jsonb is a free-form bag, so
// we exhibit only its PRIMITIVE entries (string/number/boolean) as spec rows —
// skipping the ficha's reserved structured keys — plus the HS code. No price
// exists on a product (confirmed: "no money on a ficha"), so a price is the rep's
// optional free-typed note; no per-product listing page exists for the lane
// catalog, so listingUrl is intentionally omitted (no fabricated link).
import type { ProductRow } from '@/lib/actions/catalog'
import type { ProductPromo, ProductPromoSpec } from '@wings/rb-core'
import type { Locale } from '@/lib/i18n'

// Reserved ficha keys carry structured objects/arrays, not scalar spec values.
const RESERVED_SPEC_KEYS = new Set(['highlights', 'dimensions', 'packing'])

/** "unitsPerCarton" / "peso_neto" → "units per carton" / "peso neto". */
export function humanizeKey(k: string): string {
  return k
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** PURE: exhibit the scalar spec entries as label/value rows, capped. */
export function primitiveSpecs(specs: Record<string, unknown> | null | undefined, cap = 6): ProductPromoSpec[] {
  const out: ProductPromoSpec[] = []
  for (const [k, v] of Object.entries(specs ?? {})) {
    if (RESERVED_SPEC_KEYS.has(k)) continue
    if (v == null || typeof v === 'object') continue
    const value = String(v).trim()
    if (!value) continue
    out.push({ label: humanizeKey(k), value })
    if (out.length >= cap) break
  }
  return out
}

/** PURE: a published product row → the promo subject. `extra` carries the rep's
 *  optional overrides (a price note, a brand accent, an owner label). */
export function productRowToPromo(
  row: ProductRow,
  locale: Locale,
  extra?: { priceNote?: string; accent?: string; ownerLabel?: string },
): ProductPromo {
  const name = (row.name?.[locale] || row.name?.es || row.name?.en || '').trim()
  const specs = primitiveSpecs(row.specs, 6)
  if (row.hsCode && specs.length < 6) specs.push({ label: 'HS', value: row.hsCode })
  return {
    productName: name || 'Producto',
    ownerLabel: extra?.ownerLabel,
    category: row.categoryPath?.[0],
    specs,
    moq: row.moq != null ? String(row.moq) : undefined,
    priceNote: extra?.priceNote?.trim() || undefined,
    accent: extra?.accent,
    // listingUrl intentionally omitted — no live per-product lane-catalog page.
  }
}
