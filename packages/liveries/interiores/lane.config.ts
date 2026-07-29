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

  // SAYS WHAT SHIPS, and stops. The scope used to list six disciplines — FF&E,
  // lighting, textiles, bath, OS&E — of which exactly one has a catalogue a
  // buyer can order from. Naming the other five in the first sentence a buyer
  // reads is a claim about depth the lane cannot honour, on a page whose whole
  // argument is that it declares only what it has. When a second discipline
  // ships, it earns its way back into this line.
  scope: {
    es: 'Acabados duros cerámicos para proyectos de hospitalidad y residenciales: cobertura en m², cajas y peso declarados antes de cotizar.',
    en: 'Ceramic hard finishes for hospitality and residential projects: coverage in m², cartons and weight declared before pricing.',
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
   *
   * URL POLICY, ratified with this lane so catalogue #2 is not improvised:
   *
   *   · A catalogue mounts FLAT at /interiores/{catalogue-slug}.
   *   · A discipline earns its own URL, /interiores/{discipline-slug}, only once
   *     it holds ≥2 catalogues or ≥2 disciplines are ACTIVE. Until then a
   *     discipline page is a corridor with one door.
   *   · Catalogue slugs are checked against discipline slugs at registration;
   *     a collision is a registration error, not a runtime surprise.
   *
   * This is why /interiores/azulejos is flat and stays flat: lane slugs are
   * append-only and permanent, and breaking a live URL to satisfy a template
   * diagram is not a trade worth making.
   *
   * An OPENING entry must NEVER be rendered as a link before its catalogue
   * exists. It is a stamp, not a door — that is the whole reason showing five of
   * them is honest rather than a promise the lane cannot keep.
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

  /**
   * The space overlay — curated, not canonical, and deliberately empty.
   *
   * One catalogue cannot populate a space view: a "Baño" page showing only tiles
   * is a filter pretending to be a place. The data cannot support it either —
   * `application` is null throughout, because the supplier does not print it.
   *
   * BUILD TRIGGERS, both required, so this is a gate rather than a someday:
   *   1. a second discipline reaches ACTIVE with ≥1 shippable catalogue, so a
   *      space can compose ACROSS disciplines — the overlay's only reason to exist;
   *   2. per-series application/space data exists from a printed or
   *      supplier-confirmed source.
   * When triggered, reuse the site's existing curated-overlay pattern at
   * /catalogo/[category]/aplicacion/[useCase] — do not invent a second one.
   */
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
