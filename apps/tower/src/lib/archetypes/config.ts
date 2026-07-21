import { archetypeConfigSchema, type Archetype, type ArchetypeConfig } from './types'

/**
 * THE source of truth for all six archetypes. Downstream code (PipelineBoard
 * columns, RFQ line units, schema-driven SpecForm) reads from here — it never
 * hardcodes a stage list or a unit. Stage sets derive from PRODUCT_BRIEF
 * "archetype-native pipelines"; units from root CLAUDE.md §3.
 *
 * Each config is parsed through `archetypeConfigSchema` at module load, so an
 * invalid stage id or a defaultUnitId that isn't in `units` fails fast at boot.
 */
const RAW: Record<Archetype, ArchetypeConfig> = {
  // Buyer buys specified units + after-sale confidence. Catalog by function →
  // spec sheet → unit RFQ; the "confidence" tail is commissioning/handover.
  EQUIPMENT: {
    code: 'EQUIPMENT',
    label: { es: 'Equipamiento', en: 'Equipment' },
    buyerBuys: {
      es: 'Unidades especificadas + confianza posventa',
      en: 'Specified units + after-sale confidence',
    },
    iaPattern: 'Catalog by function → spec sheet → unit RFQ',
    stages: [
      { id: 'inquiry', label: { es: 'Consulta', en: 'Inquiry' }, terminal: false },
      { id: 'specification', label: { es: 'Especificación', en: 'Specification' }, terminal: false },
      { id: 'quote', label: { es: 'Cotización', en: 'Quote' }, terminal: false },
      { id: 'contract', label: { es: 'Contrato', en: 'Contract' }, terminal: false },
      { id: 'production', label: { es: 'Producción', en: 'Production' }, terminal: false },
      { id: 'shipment', label: { es: 'Embarque', en: 'Shipment' }, terminal: false },
      { id: 'commissioning', label: { es: 'Puesta en marcha', en: 'Commissioning' }, terminal: true },
    ],
    unitMath: {
      units: [
        { id: 'per_unit', label: { es: 'por unidad', en: 'per unit' }, abbr: 'u', cbmBearing: false },
        { id: 'per_crate_cbm', label: { es: 'por CBM de caja', en: 'per crate CBM' }, abbr: 'CBM', cbmBearing: true },
      ],
      defaultUnitId: 'per_unit',
    },
    specSchema: { defaultSchemaKey: 'equipment.default', allowLaneOverride: true },
  },

  // Buyer buys a scoped delivery tied to milestones. Stages per PRODUCT_BRIEF.
  PROJECT: {
    code: 'PROJECT',
    label: { es: 'Proyecto', en: 'Project' },
    buyerBuys: {
      es: 'Una entrega delimitada atada a hitos',
      en: 'A scoped delivery tied to milestones',
    },
    iaPattern: 'Dual taxonomy (discipline + space) → spec sheet → project RFQ',
    stages: [
      { id: 'brief', label: { es: 'Brief', en: 'Brief' }, terminal: false },
      { id: 'spec', label: { es: 'Especificación', en: 'Spec' }, terminal: false },
      { id: 'quote', label: { es: 'Cotización', en: 'Quote' }, terminal: false },
      { id: 'contract', label: { es: 'Contrato', en: 'Contract' }, terminal: false },
      { id: 'production', label: { es: 'Producción', en: 'Production' }, terminal: false },
      { id: 'shipment', label: { es: 'Embarque', en: 'Shipment' }, terminal: false },
      { id: 'installation', label: { es: 'Instalación', en: 'Installation' }, terminal: true },
    ],
    unitMath: {
      units: [
        { id: 'per_key', label: { es: 'por llave', en: 'per key' }, abbr: 'key', cbmBearing: false },
        { id: 'per_room', label: { es: 'por habitación', en: 'per room' }, abbr: 'rm', cbmBearing: false },
        { id: 'per_m2', label: { es: 'por m²', en: 'per m²' }, abbr: 'm²', cbmBearing: false },
      ],
      defaultUnitId: 'per_key',
    },
    specSchema: { defaultSchemaKey: 'project.default', allowLaneOverride: true },
  },

  // Buyer buys volume at grade + price window. Stages per PRODUCT_BRIEF.
  COMMODITY: {
    code: 'COMMODITY',
    label: { es: 'Commodity', en: 'Commodity' },
    buyerBuys: {
      es: 'Volumen a grado + ventana de precio',
      en: 'Volume at grade + price window',
    },
    iaPattern: 'Commodity table (grades, seasons, availability) → contract RFQ',
    stages: [
      { id: 'inquiry', label: { es: 'Consulta', en: 'Inquiry' }, terminal: false },
      { id: 'offer', label: { es: 'Oferta', en: 'Offer' }, terminal: false },
      { id: 'contract', label: { es: 'Contrato', en: 'Contract' }, terminal: false },
      { id: 'booking', label: { es: 'Reserva', en: 'Booking' }, terminal: false },
      { id: 'shipment', label: { es: 'Embarque', en: 'Shipment' }, terminal: true },
    ],
    unitMath: {
      units: [
        { id: 'per_mt', label: { es: 'por TM', en: 'per MT' }, abbr: 'MT', cbmBearing: false },
        { id: 'per_pallet', label: { es: 'por pallet', en: 'per pallet' }, abbr: 'plt', cbmBearing: true },
        { id: 'per_container', label: { es: 'por contenedor', en: 'per container' }, abbr: 'CTNR', cbmBearing: true },
      ],
      defaultUnitId: 'per_mt',
    },
    specSchema: { defaultSchemaKey: 'commodity.default', allowLaneOverride: true },
  },

  // Buyer buys repeating SKU assortments. Assortment builder → program RFQ; the
  // tail is replenishment (the repeat).
  PROGRAM: {
    code: 'PROGRAM',
    label: { es: 'Programa', en: 'Program' },
    buyerBuys: {
      es: 'Surtidos de SKU repetibles',
      en: 'Repeating SKU assortments',
    },
    iaPattern: 'Assortment builder → program RFQ',
    stages: [
      { id: 'inquiry', label: { es: 'Consulta', en: 'Inquiry' }, terminal: false },
      { id: 'assortment', label: { es: 'Surtido', en: 'Assortment' }, terminal: false },
      { id: 'quote', label: { es: 'Cotización', en: 'Quote' }, terminal: false },
      { id: 'contract', label: { es: 'Contrato', en: 'Contract' }, terminal: false },
      { id: 'production', label: { es: 'Producción', en: 'Production' }, terminal: false },
      { id: 'shipment', label: { es: 'Embarque', en: 'Shipment' }, terminal: false },
      { id: 'replenishment', label: { es: 'Reposición', en: 'Replenishment' }, terminal: true },
    ],
    unitMath: {
      units: [
        { id: 'per_sku_program', label: { es: 'por programa de SKU', en: 'per SKU program' }, abbr: 'pgm', cbmBearing: false },
        { id: 'per_carton_run', label: { es: 'por tirada de cartón', en: 'per carton run' }, abbr: 'run', cbmBearing: true },
      ],
      defaultUnitId: 'per_sku_program',
    },
    specSchema: { defaultSchemaKey: 'program.default', allowLaneOverride: true },
  },

  // Buyer buys access + legitimacy (a mandate). Roster → credential page →
  // mandate inquiry. No production/shipment tail — the deliverable is a mandate.
  CREDENTIAL: {
    code: 'CREDENTIAL',
    label: { es: 'Representación', en: 'Credential' },
    buyerBuys: {
      es: 'Acceso + legitimidad (un mandato)',
      en: 'Access + legitimacy (a mandate)',
    },
    iaPattern: 'Roster → credential page → mandate inquiry',
    stages: [
      { id: 'inquiry', label: { es: 'Consulta', en: 'Inquiry' }, terminal: false },
      { id: 'qualification', label: { es: 'Calificación', en: 'Qualification' }, terminal: false },
      { id: 'proposal', label: { es: 'Propuesta', en: 'Proposal' }, terminal: false },
      { id: 'mandate', label: { es: 'Mandato', en: 'Mandate' }, terminal: false },
      { id: 'activation', label: { es: 'Activación', en: 'Activation' }, terminal: true },
    ],
    unitMath: {
      units: [
        { id: 'per_territory', label: { es: 'por territorio', en: 'per territory' }, abbr: 'terr', cbmBearing: false },
        { id: 'per_scope', label: { es: 'por alcance', en: 'per scope' }, abbr: 'scope', cbmBearing: false },
      ],
      defaultUnitId: 'per_territory',
    },
    specSchema: { defaultSchemaKey: 'credential.default', allowLaneOverride: true },
  },

  // Buyer buys provenance + documentation outbound. Origin catalog + seasonality
  // → export RFQ; documentation is a first-class stage.
  ORIGIN: {
    code: 'ORIGIN',
    label: { es: 'Exportación', en: 'Origin' },
    buyerBuys: {
      es: 'Procedencia + documentación de exportación',
      en: 'Provenance + documentation outbound',
    },
    iaPattern: 'Origin catalog + seasonality → export RFQ',
    stages: [
      { id: 'inquiry', label: { es: 'Consulta', en: 'Inquiry' }, terminal: false },
      { id: 'offer', label: { es: 'Oferta', en: 'Offer' }, terminal: false },
      { id: 'contract', label: { es: 'Contrato', en: 'Contract' }, terminal: false },
      { id: 'documentation', label: { es: 'Documentación', en: 'Documentation' }, terminal: false },
      { id: 'booking', label: { es: 'Reserva', en: 'Booking' }, terminal: false },
      { id: 'shipment', label: { es: 'Embarque', en: 'Shipment' }, terminal: true },
    ],
    unitMath: {
      units: [
        { id: 'per_container', label: { es: 'por contenedor', en: 'per container' }, abbr: 'CTNR', cbmBearing: true },
        { id: 'per_certificate', label: { es: 'por certificado', en: 'per certificate' }, abbr: 'cert', cbmBearing: false },
      ],
      defaultUnitId: 'per_container',
    },
    specSchema: { defaultSchemaKey: 'origin.default', allowLaneOverride: true },
  },

  // Buyer buys a share of a planned container of a represented brand (root
  // CLAUDE.md §3 · §5-bis). Brand shelf → brand catalog → container allocation
  // instrument; quantity↔slot conversion + packing math are server-side only.
  // RB has no lane, so no lane override on the spec schema (allowLaneOverride:
  // false) — the ALLOCATION default row (lane_id = null) is the only schema.
  ALLOCATION: {
    code: 'ALLOCATION',
    label: { es: 'Asignación', en: 'Allocation' },
    buyerBuys: {
      es: 'Una parte de un contenedor planificado de una marca representada',
      en: 'A share of a planned container of a represented brand',
    },
    iaPattern: 'Brand shelf → brand catalog → container allocation instrument',
    stages: [
      { id: 'inquiry', label: { es: 'Consulta', en: 'Inquiry' }, terminal: false },
      { id: 'reservation', label: { es: 'Reserva', en: 'Reservation' }, terminal: false },
      { id: 'contract', label: { es: 'Contrato', en: 'Contract' }, terminal: false },
      { id: 'consolidation', label: { es: 'Consolidación', en: 'Consolidation' }, terminal: false },
      { id: 'shipment', label: { es: 'Embarque', en: 'Shipment' }, terminal: true },
    ],
    unitMath: {
      units: [
        { id: 'per_slot', label: { es: 'por slot', en: 'per slot' }, abbr: 'slot', cbmBearing: false },
        { id: 'per_container', label: { es: 'por contenedor', en: 'per container' }, abbr: 'CTNR', cbmBearing: true },
      ],
      defaultUnitId: 'per_slot',
    },
    specSchema: { defaultSchemaKey: 'allocation.default', allowLaneOverride: false },
  },
}

/**
 * Validated registry. `.parse` guarantees every config is well-formed (stage ids
 * snake_case, defaultUnitId ∈ units) before any consumer reads it.
 */
export const ARCHETYPES: Record<Archetype, ArchetypeConfig> = Object.fromEntries(
  (Object.entries(RAW) as [Archetype, ArchetypeConfig][]).map(([code, cfg]) => [
    code,
    archetypeConfigSchema.parse(cfg),
  ]),
) as Record<Archetype, ArchetypeConfig>
