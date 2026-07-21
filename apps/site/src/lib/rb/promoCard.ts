// src/lib/rb/promoCard.ts
// Map a public RbActiveContainer (src/lib/rb/data.ts, from
// public.rb_active_containers) into @wings/rb-core's ContainerPromo — the shape
// buildPromoCardSvg rasterizes into the 1080×1080 share card. Kept separate from
// data.ts so the rb-core dependency stays with the card, not the data reads.
//
// The derivation mirrors apps/tower's toContainerPromo/defaultSpecs so the card
// that unfurls on the public page is byte-for-byte the one a rep previews in
// TOWER. Numbers are brand assets (root CLAUDE.md §1.5).
import type { ContainerPromo, ContainerPromoSpec } from '@wings/rb-core'
import type { RbActiveContainer } from '@/lib/rb/data'

const DEFAULT_SITE_BASE = 'https://wingsglobaltrade.com'

function siteBase(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL
  return (base && base.trim() ? base : DEFAULT_SITE_BASE).replace(/\/+$/, '')
}

/** Origin → destination label, straight from the container route (never copy). */
function routeLabelOf(route: { origin?: string; destination?: string }): string | undefined {
  if (!route.origin && !route.destination) return undefined
  return `${route.origin ?? '—'} → ${route.destination ?? 'Callao'}`
}

/** Default exhibited specs from the packing profile (mirror of tower's rule). */
function defaultSpecs(f: RbActiveContainer['productFacts']): ContainerPromoSpec[] {
  const out: ContainerPromoSpec[] = []
  const unit = f.unitNamePlural ?? 'unidades'
  if (f.packagesPerSlot && f.unitsPerPackage) {
    out.push({ label: 'Cupo', value: `${f.packagesPerSlot} cajas · ${f.packagesPerSlot * f.unitsPerPackage} ${unit}` })
  } else if (f.unitsPerPackage) {
    out.push({ label: 'Caja', value: `${f.unitsPerPackage} ${unit}` })
  }
  if (f.packetsPerPackage) out.push({ label: 'Empaques por caja', value: String(f.packetsPerPackage) })
  if (f.packageKg != null) out.push({ label: 'Peso por caja', value: `${f.packageKg} kg` })
  if (f.gtin) out.push({ label: 'GTIN', value: f.gtin })
  return out
}

/** Build the rb-core ContainerPromo for the share card. */
export function activeContainerToPromo(c: RbActiveContainer): ContainerPromo {
  const copy = c.copy
  const specs = copy.specs && copy.specs.length ? copy.specs : defaultSpecs(c.productFacts)
  return {
    productName: copy.headline?.trim() || c.productName,
    ownerLabel: c.brandName,
    containerCode: c.code,
    slotsTotal: c.slots.total,
    slotsAvailable: c.slots.available,
    slotsCommitted: c.slots.committed,
    slotsReserved: c.slots.reserved,
    unitLabel: copy.unitLabel?.trim() || 'cupos',
    priceNote: copy.priceNote?.trim() || undefined,
    specs,
    listingUrl: `${siteBase()}/marcas/${c.brandSlug}/contenedor/${c.code}`,
    routeLabel: routeLabelOf(c.route),
    phase: c.shippingPhase,
    // The public view omits the brand accent; rb-core defaults the container
    // fill to Wings gold on the Wings ground.
  }
}
