// src/lib/promo/erp-container-promo.ts
// ERP container → ContainerPromo adapter (shell IA/UI Phase D). An ERP
// (`containers`) container is CBM-based and multi-commitment — no single product,
// brand, or price — so this maps its facts into the promo shape for a LIGHTWEIGHT
// Wings status/share card (distinct from the rich represented-brand slot promo,
// which stays on the marcas surfaces). CBM stands in for slots, container status
// maps to shipping phase, and the required product/listing fields are synthesized.
// Pure and in-memory: no server call, no RB tables — safe to run client-side.
import type { ContainerPromo, ShippingPhase } from '@wings/rb-core'
import type { ContainerRow } from '@/lib/actions/containers-types'

/** Public display URL shown on the card. Overridable via NEXT_PUBLIC_SITE_URL. */
const SITE_DISPLAY_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'wingsglobaltrade.com'

/** Container lifecycle status → shipping phase for the card. */
function phaseFor(status: ContainerRow['status']): ShippingPhase {
  switch (status) {
    case 'IN_TRANSIT':
      return 'EN_TRANSITO'
    case 'ARRIVED':
      return 'ARRIBADO'
    case 'CLEARED':
    case 'CLOSED':
      return 'NACIONALIZADO'
    // OPEN · FILLING · BOOKED (and any future pre-departure status)
    default:
      return 'EN_ORIGEN'
  }
}

/** Build a Wings container status/share promo from an ERP container row. */
export function containerRowToPromo(row: ContainerRow): ContainerPromo {
  const total = Math.max(0, Math.round(row.capacityCbm))
  const committed = Math.max(0, Math.round(row.committedCbm))
  const available = Math.max(0, total - committed)
  const route = [row.route.origin, row.route.destination].filter(Boolean)
  return {
    productName: 'Carga consolidada',
    ownerLabel: 'Wings Global Trade',
    containerCode: row.code,
    slotsTotal: total,
    slotsAvailable: available,
    slotsCommitted: committed,
    unitLabel: 'CBM',
    routeLabel: route.length ? route.join(' → ') : undefined,
    phase: phaseFor(row.status),
    listingUrl: SITE_DISPLAY_URL,
    // accent omitted → the generator defaults to Wings gold.
  }
}
