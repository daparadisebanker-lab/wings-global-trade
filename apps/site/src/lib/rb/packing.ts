// src/lib/rb/packing.ts
// ALLOCATION archetype packing math — ONE implementation, consumed by the
// /api/rb/* routes. Root law §5-bis: slot subtraction and packing math are
// server-side only; anything the client renders is display, revalidated here
// on reserve. Same functions TOWER will use (SPEC §3.2 / §4).

import type { RbContainerTemplate, RbPublicContainer } from '@/lib/rb/fixtures'

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
