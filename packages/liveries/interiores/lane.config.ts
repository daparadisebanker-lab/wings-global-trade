/**
 * WGT/02 — Interiores.
 *
 * The second lane to open, and the first one onboarded through the ecosystem
 * §4 protocol rather than inherited from the pre-monorepo site. Phase 0 was
 * answered 2026-07-28; every field below is one of those answers, not a guess.
 *
 * Lane codes are append-only and permanent. WGT/02 stays WGT/02.
 */

export const lane = {
  code: 'WGT/02',
  slug: 'interiores',
  name: 'Interiores',

  scope: {
    es: 'FF&E, OS&E, acabados duros, textiles e iluminación para proyectos de hospitalidad y residenciales.',
    en: 'FF&E, OS&E, hard finishes, textiles and lighting for hospitality and residential projects.',
  },

  // §3 decision tree: the buyer (procurement / construction) and the unit math
  // (per key, per m²) are both distinct from WGT/01's per-unit equipment logic,
  // so this is a lane rather than a sub-category — and it maps cleanly onto an
  // existing archetype, so no framework amendment was required.
  archetype: 'PROJECT',

  // Phase 0 · Q1. Deliberately NOT hotel developers or design studios at launch:
  // both were considered and neither is the party that signs today. The two
  // below buy against someone else's spec and negotiate in landed quantity,
  // which is exactly what the tile catalogue already states.
  buyer: ['procurement firms', 'builders', 'general contractors'],

  // Phase 0 · Q3. Both bases are real and the lane must hold them at once: a
  // procurement firm costs an opening per key, a contractor orders coverage in
  // m². The RFQ resolves either to whole cartons before anything else.
  unitMath: 'per m² coverage · per key (FF&E)',

  cargoSet: 'tile-cartons',
  misterPack: 'wgt-02-interiores',

  /**
   * Phase 0 · Q4 — the discipline axis, registered whole so the IA is never
   * re-cut. Only `acabados-duros` has shippable depth today; the rest carry an
   * OPENING stamp, which the ecosystem explicitly permits (a lane is real when
   * it appears on the Manifest, even as OPENING).
   *
   * The PROJECT archetype's second axis (space) is an overlay on these
   * canonical discipline URLs, never a competing URL set.
   */
  taxonomy: [
    {
      slug: 'acabados-duros',
      name: { es: 'Acabados duros', en: 'Hard finishes' },
      status: 'ACTIVE',
      catalogues: ['azulejos'],
    },
    { slug: 'mobiliario', name: { es: 'Mobiliario', en: 'Furniture (FF&E)' }, status: 'OPENING', catalogues: [] },
    { slug: 'iluminacion', name: { es: 'Iluminación', en: 'Lighting' }, status: 'OPENING', catalogues: [] },
    { slug: 'textiles', name: { es: 'Textiles', en: 'Textiles' }, status: 'OPENING', catalogues: [] },
    { slug: 'bano-griferia', name: { es: 'Baño y grifería', en: 'Bath & fittings' }, status: 'OPENING', catalogues: [] },
    { slug: 'os-e', name: { es: 'OS&E', en: 'OS&E' }, status: 'OPENING', catalogues: [] },
  ],

  /** The space overlay — curated, not canonical. Deferred until a second
   *  discipline has depth; one catalogue cannot populate a space view. */
  spaces: [],

  /**
   * Phase 0 · Q5 — photography feasibility.
   * Tile faces exist (extracted from the supplier catalogues, 512px WebP).
   * Room renders do not: no supplier AMBIENTE material is bound to a series,
   * and inventing one would put a fired-clay colour on a screen no buyer could
   * hold us to. The lane therefore launches typography-and-spec-led, which the
   * protocol permits explicitly, and the interim is recorded rather than
   * silently absorbed.
   */
  photography: 'INTERIM_TYPOGRAPHIC',

  status: 'OPENING',
} as const

export type InteriorsLane = typeof lane
