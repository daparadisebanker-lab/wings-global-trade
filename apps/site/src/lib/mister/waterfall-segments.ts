// src/lib/mister/waterfall-segments.ts
// Five waterfall segment constants + COST_DRIVERS.
// Authoritative: spec/contributions/finance.md §4 / §6
// Server-side safe. No absolute currency values. No computed totals.

import type { WaterfallSegment, CostDriver } from '@/types/mister'

// ─────────────────────────────────────────────────────────────
// Layer 1: Product Cost (Base 100)
// ─────────────────────────────────────────────────────────────
export const PRODUCT_SEGMENT: WaterfallSegment = {
  key: 'product',
  label: 'Product cost (base 100)',
  indexLow: 100,
  indexHigh: 100,
  driverNote: 'The ex-works value of the goods themselves.',
  tooltip:
    'This is the base unit cost as quoted by the supplier, ex-works (seller\'s door). Everything else in this waterfall stacks on top of this.',
  disclaimerId: 'illustrative',
}

// ─────────────────────────────────────────────────────────────
// Layer 2: Ocean / Inland Freight
// ─────────────────────────────────────────────────────────────
export const FREIGHT_SEGMENT: WaterfallSegment = {
  key: 'freight',
  label: 'Ocean / inland freight',
  indexLow: 8,
  indexHigh: 15,
  driverNote: 'Lane, container type, fill efficiency.',
  tooltip:
    "Transporting the container from origin port to your destination. Changes with the shipping lane (origin–destination), container type (20', 40', 40'HC, reefer, or LCL), and how efficiently the container is filled. A full 40'HC to nearby Peru is cheaper per unit than a light LCL to distant markets.",
  disclaimerId: 'range',
}

// ─────────────────────────────────────────────────────────────
// Layer 3: Cargo Insurance
// ─────────────────────────────────────────────────────────────
export const INSURANCE_SEGMENT: WaterfallSegment = {
  key: 'insurance',
  label: 'Cargo insurance',
  indexLow: 1,
  indexHigh: 3,
  driverNote: 'Incoterm requirement; applied to FOB + freight total.',
  tooltip:
    "Covers the goods in transit against loss or damage. Required under CIF terms (seller pays); recommended on FOB and CFR even though it's the buyer's cost. Typically 1.5% of (product cost + freight), which works out to 1–3 index points on the base.",
  disclaimerId: 'range',
}

// ─────────────────────────────────────────────────────────────
// Layer 4: Customs Duties & Taxes (SUNAT)
// ─────────────────────────────────────────────────────────────
export const DUTIES_SEGMENT: WaterfallSegment = {
  key: 'duties',
  label: 'Customs duties & taxes (SUNAT)',
  indexLow: 12,
  indexHigh: 28,
  driverNote: 'HS classification, destination country, tariff rules.',
  tooltip:
    "Duty rate plus IGV (Peru's VAT, currently 18%) applied on nationalization. The duty rate is set by SUNAT based on the HS code classification and destination country, not by Wings. Different product categories carry different rates: machinery (5–10%), parts (0–15%), vehicles (25–35%), agricultural equipment (varies). This range reflects typical imports into Peru; your actual duty depends on what you're importing. IGV is a flat 18% on the CIF total. We never guarantee a duty rate — SUNAT makes that call.",
  disclaimerId: 'duties',
}

// ─────────────────────────────────────────────────────────────
// Layer 5: Last-Mile Delivery
// ─────────────────────────────────────────────────────────────
export const LASTMILE_SEGMENT: WaterfallSegment = {
  key: 'lastmile',
  label: 'Last-mile delivery',
  indexLow: 2,
  indexHigh: 6,
  driverNote: 'Distance from port to destination, handling, infrastructure.',
  tooltip:
    'Transport from the destination port or free zone to your final site. Driven by distance, road conditions, equipment needs (crane, forklift, etc.), and whether the site is accessible by standard truck. A 50 km drive with unloading is cheaper than 500 km over mountain roads with specialized equipment.',
  disclaimerId: 'range',
}

/** Default five-segment waterfall for a standard import scenario. */
export const DEFAULT_SEGMENTS: WaterfallSegment[] = [
  PRODUCT_SEGMENT,
  FREIGHT_SEGMENT,
  INSURANCE_SEGMENT,
  DUTIES_SEGMENT,
  LASTMILE_SEGMENT,
]

// ─────────────────────────────────────────────────────────────
// Cost drivers — finance.md §6
// ─────────────────────────────────────────────────────────────
export const COST_DRIVERS: CostDriver[] = [
  {
    id: 'volume',
    label: 'Volume (units ordered)',
    explanation:
      'Higher volume spreads the fixed freight charge thinner across more units. Buy 10 units instead of 1, and your per-unit landed cost usually drops. Hit the next MOQ tier and you may unlock better freight or duty rates too.',
    impact: 'high',
  },
  {
    id: 'incoterm',
    label: 'Incoterm (who bears which cost)',
    explanation:
      "Your Incoterm decides where Wings' responsibility stops and yours begins — it doesn't lower total cost, but it shifts which segments you pay for. EXW puts everything on you; CIF puts almost everything on Wings. Choose the term that fits your cash flow and risk tolerance.",
    impact: 'high',
  },
  {
    id: 'destination_port',
    label: 'Destination port or city',
    explanation:
      'A port closer to your final site trims both the ocean freight (shorter lane) and the last-mile (less inland distance). Importing to Lima is cheaper than to Puerto Maldonado in the Amazon.',
    impact: 'medium',
  },
  {
    id: 'container_type',
    label: 'Container type & fill efficiency',
    explanation:
      "Right-sizing the container — and filling it — is the cleanest way to cut the freight index. A full 40'HC costs less per unit than a half-empty 40'GP. LCL (consolidated) is pricier but works for small volumes.",
    impact: 'high',
  },
  {
    id: 'currency',
    label: 'Currency & exchange rate',
    explanation:
      "Most trade settles in USD. Your local-currency landed cost moves with the exchange rate, independent of the goods themselves. A weak Sol makes everything more expensive in PEN terms, even though the USD cost hasn't changed.",
    impact: 'medium',
  },
]
