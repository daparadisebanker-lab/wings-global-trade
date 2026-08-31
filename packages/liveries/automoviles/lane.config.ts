/**
 * WGT/07 — Automóviles.
 *
 * Phase 0 answered 2026-08-23, in an interview with the account owner (the
 * root CLAUDE.md's "Muaaz" role) run one question at a time per the §4
 * protocol, after a tactical build (catalog data + nav promotion) had
 * already shipped. See programs/automobiles/SCOPE.md for the full session
 * log, including the dubicars.com / China-export-marketplace research that
 * grounded the archetype and taxonomy answers below.
 *
 * The decision tree (§3) was run explicitly rather than assumed: automóviles
 * shares its archetype (EQUIPMENT) and unit math with the not-yet-onboarded
 * WGT/01 Machinery, which is normally the tree's "sub-category, not a new
 * lane" branch. The account owner chose a new code anyway — the buyer is
 * judged distinct enough (car dealers/fleets/importers vs. heavy-equipment
 * buyers) to justify a separate identity, in service of the "car-first"
 * prominence direction. Recorded here as a deliberate call, not an oversight.
 *
 * Lane codes are append-only and permanent. WGT/07 stays WGT/07.
 */

export const lane = {
  code: 'WGT/07',
  slug: 'automoviles',
  name: 'Automóviles',

  // Phase 0 · Q7 (commercial readiness) folded into the scope line itself:
  // 76 trims across 11 brands are already costed in Rowe today — this is
  // not a lane opening on a promise.
  scope: {
    es: 'Autos de pasajeros 0 km importados desde China: sedanes, SUV, MPV e híbridos de 11 marcas, vendidos por unidad configurada o por contenedor.',
    en: 'New passenger cars imported from China: sedans, SUVs, MPVs and hybrids across 11 brands, sold as a configured unit or by container.',
  },

  // §3 decision tree, run explicitly (see file header) — EQUIPMENT confirmed
  // over folding into WGT/01 Machinery.
  archetype: 'EQUIPMENT',

  // Phase 0 · Q1. Deliberately NOT narrowed to one buyer type: the fleet
  // sheet's own breadth (11 brands, mixed segments) and the account owner's
  // own answer ("mixed — no single dominant buyer yet") argue against
  // pretending otherwise this early. Revisit once real RFQ volume shows
  // which of these four is actually converting.
  //
  // Amended 2026-08-31 — a fourth buyer added: individual / personal use.
  // The original Phase 0 interview (2026-08-23) recorded three trade
  // buyers only. The account owner separately confirmed, directly, that
  // personal buyers are real here too; RFQFlow already ships a
  // buyer_type selector (personal/empresa) on this category's product
  // pages on that basis (see programs/automobiles/SCOPE.md §0l). This
  // list was left inconsistent with that shipped behavior until now —
  // corrected rather than revisited later per the note above, since the
  // gap was closed by direct confirmation, not by waiting on RFQ data.
  buyer: [
    'individual / personal use',
    'car dealers / lots',
    'fleet and corporate buyers',
    'independent resellers / importers',
  ],

  // Phase 0 · Q3. Confirmed dual rather than per-unit-only: a fleet buyer
  // orders N repeats of one trim, which is container/slot math, not just a
  // single-unit RFQ line repeated by hand. RFQFlow line-item shape needs to
  // resolve both paths — this is real follow-up work, not yet built.
  unitMath: 'per unit (configured trim) · per container (fleet slot)',

  cargoSet: 'automoviles-units', // NOT YET COMMISSIONED — Phase 4, FillMeter asset set pending
  misterPack: 'wgt-07-automoviles', // NOT YET BUILT — Phase 4, Mister pack pending (source: Rowe fleet sheet, Phase 0 · Q6)

  /**
   * Phase 0 · Q4 — dual taxonomy, confirmed explicitly (not the
   * brand-first default the tactical build shipped with).
   *
   * SEGMENT is canonical: the §4 rule caps top-level categories at ≤8, and
   * brand count (11 today) already exceeds that and will only grow as more
   * OEM relationships are added. Segment is the small, stable axis (five
   * entries) and therefore owns the permanent URLs.
   *
   * BRAND is the curated overlay — real today (11 brands, unlike Interiores'
   * still-empty `spaces`), exposed via the existing `?brand=` filter rather
   * than its own URL tree, because the fleet sheet is genuinely keyed by
   * brand → trim and buyers who already have an OEM relationship expect to
   * filter by it.
   *
   * URL POLICY (mirrors Interiores' §, ratified here for this lane):
   *   · A segment earns /automoviles/{segment-slug} once the lane's routes
   *     move off /catalogo/automoviles (pending — see programs/automobiles/
   *     SCOPE.md §5, route migration is deliberately NOT part of this pass).
   *   · Brand stays a filter (?brand=), never a competing URL tree, until
   *     brand count or buyer behavior argues otherwise.
   */
  taxonomy: [
    { slug: 'sedan', name: { es: 'Sedán', en: 'Sedan' }, status: 'ACTIVE' },
    { slug: 'suv-compacto', name: { es: 'SUV compacto', en: 'Compact SUV' }, status: 'ACTIVE' },
    { slug: 'suv-mediano-grande', name: { es: 'SUV mediano y grande', en: 'Mid/full-size SUV' }, status: 'ACTIVE' },
    { slug: 'suv-todoterreno', name: { es: 'SUV todoterreno', en: 'Off-road SUV' }, status: 'ACTIVE' },
    { slug: 'mpv-furgoneta', name: { es: 'MPV y furgoneta', en: 'MPV & van' }, status: 'ACTIVE' },
  ],

  // The brand overlay — curated, not canonical (see taxonomy comment above).
  // Unlike Interiores' `spaces`, this is populated today: the fleet sheet
  // itself is brand-keyed, and it's real product data already shipped
  // (data/automoviles-catalog.ts, data/seed.json), not a future build
  // trigger. Kept here as the lane's own record of which brands are live.
  brands: [
    'Toyota', 'Jetour', 'KIA', 'Audi', 'BMW', 'Hyundai',
    'Mercedes-Benz', 'Star 5', 'MG', 'Changan', 'Wuling',
  ],

  // Phase 0 · Q5 — photography feasibility.
  // apps/site/public/images/listings/automoviles/ does not exist; no model
  // has a real photo today (see programs/automobiles/SCOPE.md §4). Launches
  // typography-and-spec-led, same interim mode Interiores (WGT/02) proved
  // out — not a placeholder photo, a stock image, or a render.
  photography: 'INTERIM_TYPOGRAPHIC',

  status: 'OPENING',
} as const

export type AutomovilesLane = typeof lane
