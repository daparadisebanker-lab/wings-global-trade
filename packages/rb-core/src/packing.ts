// @wings/rb-core · packing.ts
// ALLOCATION archetype packing math — the ONE implementation, lifted verbatim
// from apps/site/src/lib/rb/packing.ts (RB Console Wave 0, SPEC R6). Pure,
// server-safe, framework-agnostic; consumed by apps/site (via a re-export shim)
// and, in later waves, apps/tower. Root law §5-bis: slot subtraction + packing
// math are server-side; anything a client renders is display, revalidated on
// reserve. Behaviour is byte-identical to the source — types are defined here
// (structural subsets of the site's fixtures types) so the package owns no app
// imports.

/** Minimal structural shape the cascade math needs from a container template. */
export interface RbContainerTemplate {
  packagesPerSlot: number
  packetsPerPackage: number
  unitsPerPackage: number
  packageKg: number
}

/** Minimal structural shape slotsRemaining needs from a public container. */
export interface RbPublicContainer {
  slots: { total: number; committed: number; reserved: number }
}

/** The packing profile TOWER's tech-sheet + quote path consume (SPEC R18/R6).
 *  Not used by the lifted functions below; defined here for later waves. */
export interface RbPackingProfile {
  packageKind: string
  unitsPerPackage: number
  packageCbm: number
  packageKg: number
  gtin?: string | null
  unitNamePlural?: string
}

export interface PackingCascade {
  slots: number
  packages: number
  packets: number
  units: number
  kg: number
}

export function cascadeForSlots(template: RbContainerTemplate, slots: number): PackingCascade {
  const packages = slots * template.packagesPerSlot
  return {
    slots,
    packages,
    packets: packages * template.packetsPerPackage,
    units: packages * template.unitsPerPackage,
    kg: Math.round(packages * template.packageKg),
  }
}

export interface QuantityConversion extends PackingCascade {
  /** Units of capacity left unused inside the last slot («sobran N unidades»). */
  remainderUnits: number
}

/** Convert a requested quantity (units / packets / packages) up the packing
 *  profile to the minimum slot count that holds it — Costco honesty rule:
 *  the remainder is shown, never hidden. */
export function slotsForQuantity(
  template: RbContainerTemplate,
  quantity: number,
  level: 'units' | 'packets' | 'packages',
): QuantityConversion {
  const unitsPerPacket = template.unitsPerPackage / template.packetsPerPackage
  const requestedUnits =
    level === 'units' ? quantity : level === 'packets' ? quantity * unitsPerPacket : quantity * template.unitsPerPackage
  const unitsPerSlot = template.packagesPerSlot * template.unitsPerPackage
  const slots = Math.max(1, Math.ceil(requestedUnits / unitsPerSlot))
  const cascade = cascadeForSlots(template, slots)
  return { ...cascade, remainderUnits: cascade.units - requestedUnits }
}

export function slotsRemaining(container: RbPublicContainer): number {
  return Math.max(0, container.slots.total - container.slots.committed - container.slots.reserved)
}

/** es-PE display formatting: 1.000 separators, no decimals. */
export function fmt(n: number): string {
  return new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 }).format(n)
}
