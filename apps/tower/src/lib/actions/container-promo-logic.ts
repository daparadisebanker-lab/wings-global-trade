// src/lib/actions/container-promo-logic.ts
// Pure logic for the container-promotion feature (root CLAUDE.md §5-bis). Kept
// out of the 'use server' file so it can be unit-tested and imported by client
// components: the promo_copy schema, the live slot-taken derivation (the same
// rule as tower.rb_slots_taken — the two must never drift), and the mapper that
// turns a container row + the rep's copy into @wings/rb-core's ContainerPromo.
import { z } from 'zod'
import type { ContainerPromo, ContainerPromoSpec } from '@wings/rb-core'

/** The rep-authored overrides stored in rb_containers.promo_copy. Every field is
 *  optional — an empty object means "use the derived defaults". */
export const promoCopySchema = z.object({
  headline: z.string().trim().max(80).optional(),
  priceNote: z.string().trim().max(80).optional(),
  routeLabel: z.string().trim().max(60).optional(),
  unitLabel: z.string().trim().max(24).optional(),
  specs: z
    .array(z.object({ label: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(60) }))
    .max(6)
    .optional(),
})
export type PromoCopy = z.infer<typeof promoCopySchema>

const DEFAULT_SITE_BASE = 'https://wingsglobaltrade.com'

/** Canonical public URL for a promoted container's listing page. */
export function containerListingUrl(brandSlug: string, code: string, siteBase?: string): string {
  const base = (siteBase && siteBase.trim() ? siteBase : DEFAULT_SITE_BASE).replace(/\/+$/, '')
  return `${base}/marcas/${brandSlug}/contenedor/${code}`
}

interface AllocationRow {
  slots: number
  status: 'RESERVED' | 'CONFIRMED' | 'LOADED' | 'RELEASED'
  expires_at: string | null
}

/** Slots taken = CONFIRMED/LOADED + unexpired RESERVED — byte-for-byte the SQL
 *  tower.rb_slots_taken filter (rb_wave1). `now` is injectable for tests. */
export function computeSlotsTaken(allocations: AllocationRow[], now: Date = new Date()): number {
  return allocations.reduce((sum, a) => {
    const counts =
      a.status === 'CONFIRMED' ||
      a.status === 'LOADED' ||
      (a.status === 'RESERVED' && (!a.expires_at || new Date(a.expires_at) > now))
    return counts ? sum + a.slots : sum
  }, 0)
}

export interface ProductFacts {
  packetsPerPackage?: number
  unitsPerPackage?: number
  unitNamePlural?: string
  packageKg?: number | string
  packageCbm?: number | string
  gtin?: string | null
  packagesPerSlot?: number
}

/** Default exhibited specs, derived from the packing profile when the rep has
 *  not authored their own. Numbers are brand assets (CLAUDE.md §1.5). */
export function defaultSpecs(facts: ProductFacts): ContainerPromoSpec[] {
  const out: ContainerPromoSpec[] = []
  const unit = facts.unitNamePlural ?? 'unidades'
  if (facts.packagesPerSlot && facts.unitsPerPackage) {
    out.push({ label: 'Cupo', value: `${facts.packagesPerSlot} cajas · ${facts.packagesPerSlot * facts.unitsPerPackage} ${unit}` })
  } else if (facts.unitsPerPackage) {
    out.push({ label: 'Caja', value: `${facts.unitsPerPackage} ${unit}` })
  }
  if (facts.packetsPerPackage) out.push({ label: 'Empaques por caja', value: String(facts.packetsPerPackage) })
  if (facts.packageKg != null) out.push({ label: 'Peso por caja', value: `${Number(facts.packageKg)} kg` })
  if (facts.gtin) out.push({ label: 'GTIN', value: facts.gtin })
  return out
}

export interface PromoContainerInput {
  code: string
  brandSlug: string
  brandName: string
  productName: string
  slotsTotal: number
  slotsAvailable: number
  route: { origin?: string; destination?: string } | null
  facts: ProductFacts
  copy: PromoCopy
  siteBase?: string
}

/** Build the rb-core ContainerPromo. Rep copy wins; derived defaults fill gaps. */
export function toContainerPromo(input: PromoContainerInput): ContainerPromo {
  const { copy, route } = input
  const routeLabel =
    copy.routeLabel ??
    (route?.origin || route?.destination
      ? `${route?.origin ?? '—'} → ${route?.destination ?? 'Callao'}`
      : undefined)
  const specs = copy.specs && copy.specs.length ? copy.specs : defaultSpecs(input.facts)
  return {
    productName: copy.headline?.trim() || input.productName,
    ownerLabel: input.brandName,
    containerCode: input.code,
    slotsTotal: input.slotsTotal,
    slotsAvailable: input.slotsAvailable,
    unitLabel: copy.unitLabel?.trim() || 'cupos',
    priceNote: copy.priceNote?.trim() || undefined,
    specs,
    listingUrl: containerListingUrl(input.brandSlug, input.code, input.siteBase),
    routeLabel,
  }
}
