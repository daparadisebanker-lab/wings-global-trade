// src/lib/torre/artifacts.ts
// Mister Torre — the artifact type system (spec-torre/03, docked onto tower.ai_drafts).
//
// An artifact is a schema-validated, versioned, reviewable document produced by
// Mister and OWNED BY A HUMAN. This file is the buildable contract for the three
// flagship-quote-run artifact types — hoja_costos (internal), cotizacion
// (client-ready) and comunicacion (cover message) — plus the typed-confidence and
// blocker vocabulary the reviewer sees.
//
// Governance encoded in the TYPES, not just the runtime (CLAUDE.md / spec-torre/03):
//  · Every numeric claim carries a ConfidenceState (verified | estimado |
//    requiere_verificacion). estimados render distinctly; requiere_verificacion
//    slots become blockers.
//  · A payload with open blockers is NOT approvable (isApprovable === false).
//  · Rates/tariffs never come from model memory — they carry a SourceRef with a
//    validity date, so a stale rate is visible, not silent.
//  · No number here is produced by a model: the money fields are copied verbatim
//    from computeImportCost (the parity-validated SUNAT engine) in quote-run.ts.
import { z } from 'zod'

// ── Typed confidence (spec-torre/03 · UI-PRIMITIVES §3) ──────────────────────

/** The three confidence states a value can carry. `requiere_verificacion` is a blocker. */
export const CONFIDENCE_STATES = ['verified', 'estimado', 'requiere_verificacion'] as const
export type ConfidenceState = (typeof CONFIDENCE_STATES)[number]

/** Bilingual label for a confidence state (rendered next to the value). */
export const CONFIDENCE_LABEL: Record<ConfidenceState, { es: string; en: string }> = {
  verified: { es: 'verificado', en: 'verified' },
  estimado: { es: 'estimado', en: 'estimated' },
  requiere_verificacion: { es: 'requiere verificación', en: 'needs verification' },
}

/** Where a fact came from — always clickable to its source (interaction law 3). */
export const SOURCE_KINDS = [
  'engine', // the deterministic SUNAT calculator
  'rate_table', // freight/insurance rate table (carries validity)
  'tariff_position', // HS position with duty/IVA (carries verified_at)
  'org_rule', // margin rule / incoterm default
  'precedent', // a past artifact from the corpus
  'operator', // a value the operator stated
] as const
export type SourceKind = (typeof SOURCE_KINDS)[number]

export interface SourceRef {
  kind: SourceKind
  /** Short human label, e.g. 'Motor SUNAT' or 'Tarifa flete SH→CLL 40HC'. */
  label: string
  /** Optional pointer (table id, HS code, artifact id) for the click-through. */
  ref?: string
  /** ISO date the source is valid until — a lapsed date is a rate-expiry signal. */
  validUntil?: string
}

/** A tariff (HS) candidate presented on an ambiguous-position blocker. */
export interface TariffCandidateRef {
  hsCode: string
  description: string
  /** Duty as a fraction, e.g. 0.06. */
  dutyPct: number
}

/** An open blocker makes an artifact unapprovable until a human resolves it. */
export interface Blocker {
  /** Stable id, e.g. 'fob-missing' or 'tariff-ambiguous'. */
  id: string
  /** The field/slot the blocker sits on, e.g. 'fob' or 'hs_code'. */
  field: string
  /** Bilingual reason shown as the blocker chip's tooltip. */
  reason: { es: string; en: string }
  /** The one-tap verification task title this blocker would create. */
  task: { es: string; en: string }
  /** For 'tariff-ambiguous': the candidate positions the reviewer must choose between. */
  candidates?: TariffCandidateRef[]
}

export const sourceRefSchema = z.object({
  kind: z.enum(SOURCE_KINDS),
  label: z.string().min(1),
  ref: z.string().optional(),
  validUntil: z.string().optional(),
})

export const blockerSchema = z.object({
  id: z.string().min(1),
  field: z.string().min(1),
  reason: z.object({ es: z.string(), en: z.string() }),
  task: z.object({ es: z.string(), en: z.string() }),
  candidates: z
    .array(z.object({ hsCode: z.string(), description: z.string(), dutyPct: z.number() }))
    .optional(),
})

// ── The Torre artifact kinds (join tower.ai_drafts.kind via migration tower_48) ─

export const TORRE_ARTIFACT_KINDS = [
  'HOJA_COSTOS',
  'COTIZACION',
  'COMUNICACION',
  // L3 · Documentar — the operational document family
  'REPORTE_ESTADO',
  'CHECKLIST_DOCS',
  'ACTA',
  'SOP',
] as const
export type TorreArtifactKind = (typeof TORRE_ARTIFACT_KINDS)[number]

// ── Shared machine identity block ────────────────────────────────────────────
export const machineSchema = z.object({
  productName: z.string(),
  brand: z.string(),
  model: z.string(),
  fuelType: z.enum(['hybrid', 'gasoline', 'diesel', 'electric']),
  engineCC: z.number(),
  incoterm: z.enum(['EXW', 'FOB', 'CFR', 'CIF']),
  origin: z.enum(['china', 'other']),
})
export type Machine = z.infer<typeof machineSchema>

// ── (1) hoja_costos — internal cost sheet with the full math trace ───────────

/** One ± sensitivity leg (spec-torre/03: ±flete, ±TRM). */
export const sensitivityLegSchema = z.object({
  label: z.string(), // e.g. 'Flete +10%'
  /** Landed cost (major units, USD) under this perturbation. */
  landedCost: z.number(),
  /** Signed delta vs. the base landed cost, major units. */
  deltaLanded: z.number(),
})

export const hojaCostosPayloadSchema = z.object({
  kind: z.literal('HOJA_COSTOS'),
  version: z.number().int().positive().default(1),
  title: z.string(),
  machine: machineSchema,
  /** The exact engine inputs — the audit trace (money in USD major units). */
  inputs: z.record(z.string(), z.unknown()),
  /** The exact engine output — every number the reviewer sees comes from here. */
  result: z.record(z.string(), z.unknown()),
  currency: z.string().default('USD'),
  exchangeRate: z.number(),
  marginPercent: z.number(),
  sources: z.array(sourceRefSchema),
  sensitivity: z.array(sensitivityLegSchema),
  /** Human-facing cautions surfaced from the numbers (e.g. negative cash margin). */
  cautions: z.array(z.object({ es: z.string(), en: z.string() })),
  blockers: z.array(blockerSchema),
})
export type HojaCostosPayload = z.infer<typeof hojaCostosPayloadSchema>

// ── (2) cotizacion — the client-ready quote ──────────────────────────────────

export const quoteScenarioSchema = z.object({
  incoterm: z.enum(['EXW', 'FOB', 'CFR', 'CIF']),
  /** Landed cost, integer minor units (money layer's law). null = blocked → renders '—'. */
  landedCostMinor: z.number().int().nullable(),
  /** Unit sale price (incl. IGV ventas), integer minor units. null = blocked → renders '—'. */
  unitPriceMinor: z.number().int().nullable(),
  confidence: z.enum(CONFIDENCE_STATES),
})

export const cotizacionPayloadSchema = z.object({
  kind: z.literal('COTIZACION'),
  version: z.number().int().positive().default(1),
  clientName: z.string().nullable(),
  laneCode: z.string().nullable(),
  language: z.string().default('es'), // client's language
  machine: machineSchema,
  currency: z.string().default('USD'),
  scenarios: z.array(quoteScenarioSchema).min(1),
  quantity: z.number().positive().default(1),
  validityUntil: z.string(), // ISO date
  terms: z.array(z.string()),
  sources: z.array(sourceRefSchema),
  blockers: z.array(blockerSchema),
  /** Set at persistence — the linked hoja_costos draft id (the pair). */
  hojaCostosRef: z.string().nullable().default(null),
})
export type CotizacionPayload = z.infer<typeof cotizacionPayloadSchema>

// ── (3) comunicacion — the cover message (email/WhatsApp) ────────────────────

export const comunicacionPayloadSchema = z.object({
  kind: z.literal('COMUNICACION'),
  version: z.number().int().positive().default(1),
  channel: z.enum(['email', 'whatsapp']),
  audience: z.enum(['client', 'supplier', 'agent']),
  language: z.string().default('es'),
  to: z.string().nullable().default(null),
  subject: z.string().nullable().default(null),
  body: z.string(),
  /** The EXACT side effect the approve control must name (constitution). */
  sideEffect: z.object({ es: z.string(), en: z.string() }),
  blockers: z.array(blockerSchema),
  /** Set at persistence — the cotizacion this message covers. */
  cotizacionRef: z.string().nullable().default(null),
})
export type ComunicacionPayload = z.infer<typeof comunicacionPayloadSchema>

// ── (4-7) L3 · Documentar — operational documents ────────────────────────────
// Each is a schema-validated, versioned, human-approved document. They share the blocker
// vocabulary (so isApprovable gates them identically) and carry sources for provenance.

/** (4) reporte_estado — an import status report (per-import health snapshot). */
export const reporteEstadoPayloadSchema = z.object({
  kind: z.literal('REPORTE_ESTADO'),
  version: z.number().int().positive().default(1),
  title: z.string(),
  importRef: z.string(),
  status: z.string(),
  asOf: z.string(), // ISO date the snapshot reflects
  summary: z.string(),
  milestones: z.array(z.object({ label: z.string(), date: z.string().nullable(), done: z.boolean() })),
  risks: z.array(z.object({ severity: z.enum(['alta', 'media', 'baja']), note: z.string() })),
  nextActions: z.array(z.string()),
  sources: z.array(sourceRefSchema),
  blockers: z.array(blockerSchema),
})
export type ReporteEstadoPayload = z.infer<typeof reporteEstadoPayloadSchema>

/** (5) checklist_docs — required documents for an import stage, with presence status. */
export const checklistDocsPayloadSchema = z.object({
  kind: z.literal('CHECKLIST_DOCS'),
  version: z.number().int().positive().default(1),
  title: z.string(),
  importRef: z.string(),
  stage: z.string(),
  items: z.array(
    z.object({
      doc: z.string(),
      required: z.boolean(),
      status: z.enum(['presente', 'faltante', 'vencido']),
      note: z.string().optional(),
    }),
  ),
  blockers: z.array(blockerSchema),
})
export type ChecklistDocsPayload = z.infer<typeof checklistDocsPayloadSchema>

/** (6) acta — meeting minutes / decision record. */
export const actaPayloadSchema = z.object({
  kind: z.literal('ACTA'),
  version: z.number().int().positive().default(1),
  title: z.string(),
  date: z.string(),
  attendees: z.array(z.string()),
  decisions: z.array(z.object({ topic: z.string(), decision: z.string(), owner: z.string().nullable().default(null) })),
  actionItems: z.array(z.object({ task: z.string(), owner: z.string(), due: z.string().nullable().default(null) })),
  blockers: z.array(blockerSchema),
})
export type ActaPayload = z.infer<typeof actaPayloadSchema>

/** (7) sop — standard operating procedure. */
export const sopPayloadSchema = z.object({
  kind: z.literal('SOP'),
  version: z.number().int().positive().default(1),
  title: z.string(),
  scope: z.string(),
  steps: z.array(z.object({ n: z.number().int().positive(), action: z.string(), owner: z.string().nullable().default(null), note: z.string().optional() })),
  blockers: z.array(blockerSchema),
})
export type SopPayload = z.infer<typeof sopPayloadSchema>

// ── The discriminated union + approvability law ──────────────────────────────

export type TorreArtifactPayload =
  | HojaCostosPayload
  | CotizacionPayload
  | ComunicacionPayload
  | ReporteEstadoPayload
  | ChecklistDocsPayload
  | ActaPayload
  | SopPayload

export const torreArtifactPayloadSchema = z.discriminatedUnion('kind', [
  hojaCostosPayloadSchema,
  cotizacionPayloadSchema,
  comunicacionPayloadSchema,
  reporteEstadoPayloadSchema,
  checklistDocsPayloadSchema,
  actaPayloadSchema,
  sopPayloadSchema,
])

/** Payload → its ai_drafts.kind. */
export function kindOf(p: TorreArtifactPayload): TorreArtifactKind {
  return p.kind
}

/** Every blocker on a payload (empty when there are none). */
export function blockersOf(p: { blockers?: Blocker[] }): Blocker[] {
  return p.blockers ?? []
}

/**
 * The approvability law (spec-torre/03, constitutional): a payload with ANY open
 * blocker cannot be approved. This is what makes "estimados never silently enter
 * a client-facing artifact" enforceable — a requiere_verificacion slot is emitted
 * as a blocker upstream (quote-run.ts), so it lands here as a hard stop.
 */
export function isApprovable(p: { blockers?: Blocker[] }): boolean {
  return blockersOf(p).length === 0
}

/** Validate an unknown JSONB payload from the DB into a typed Torre artifact. */
export function parseTorreArtifact(raw: unknown): TorreArtifactPayload | null {
  const r = torreArtifactPayloadSchema.safeParse(raw)
  return r.success ? r.data : null
}
