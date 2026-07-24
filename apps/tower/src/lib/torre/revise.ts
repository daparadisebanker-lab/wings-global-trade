// src/lib/torre/revise.ts
// Mister Torre — artifact revision + semantic diff (Loop L1, Cotizar polish). PURE +
// unit-tested. Two capabilities the review UI wires:
//   · diffTorreArtifact(old, new) → a human-readable, field-level change list (old→new),
//     money-aware, so a reviewer sees EXACTLY what a revision changed (not a text blob).
//   · reviseTorreArtifact(old, edited) → the versioned successor: bumps `version`,
//     re-validates against the schema, and returns the diff. This is the spine of both
//     inline edit and comment-to-revise (the model proposes `edited`; a human approves).
//
// Governance: a revision is still a DRAFT (nothing here persists or sends — the caller
// writes it as ai_drafts DRAFT). estimados/blockers ride along in the payload unchanged;
// approvability is still decided by isApprovable (blockers present → unapprovable).
import {
  torreArtifactPayloadSchema,
  type CotizacionPayload,
  type ComunicacionPayload,
  type HojaCostosPayload,
  type TorreArtifactPayload,
} from './artifacts'

/** One reviewer-facing fact extracted from a payload (a keyed, labelled display value). */
export interface Fact {
  key: string
  label: { es: string; en: string }
  value: string
}

/** One field-level change between two artifact versions. */
export interface ArtifactChange {
  key: string
  label: { es: string; en: string }
  /** null = the field did not exist before (added). */
  before: string | null
  /** null = the field no longer exists (removed). */
  after: string | null
  kind: 'added' | 'removed' | 'changed'
}

function fmtMinor(m: number | null): string {
  return m === null ? '—' : (m / 100).toFixed(2)
}
function fmtPct(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`
}

// ── Fact builders per kind (the fields a reviewer cares about) ───────────────

function cotizacionFacts(p: CotizacionPayload): Fact[] {
  const f: Fact[] = [
    { key: 'client', label: { es: 'Cliente', en: 'Client' }, value: p.clientName ?? '—' },
    { key: 'lane', label: { es: 'Lane', en: 'Lane' }, value: p.laneCode ?? '—' },
    { key: 'language', label: { es: 'Idioma', en: 'Language' }, value: p.language },
    { key: 'currency', label: { es: 'Moneda', en: 'Currency' }, value: p.currency },
    { key: 'quantity', label: { es: 'Cantidad', en: 'Quantity' }, value: String(p.quantity) },
    { key: 'validityUntil', label: { es: 'Válida hasta', en: 'Valid until' }, value: p.validityUntil },
    { key: 'product', label: { es: 'Producto', en: 'Product' }, value: p.machine.productName },
  ]
  for (const s of p.scenarios) {
    f.push({ key: `scenario.${s.incoterm}.landed`, label: { es: `Costo puesto ${s.incoterm}`, en: `Landed ${s.incoterm}` }, value: fmtMinor(s.landedCostMinor) })
    f.push({ key: `scenario.${s.incoterm}.unit`, label: { es: `Precio unit. ${s.incoterm}`, en: `Unit price ${s.incoterm}` }, value: fmtMinor(s.unitPriceMinor) })
    f.push({ key: `scenario.${s.incoterm}.confidence`, label: { es: `Confianza ${s.incoterm}`, en: `Confidence ${s.incoterm}` }, value: s.confidence })
  }
  p.terms.forEach((t, i) => f.push({ key: `term.${i}`, label: { es: `Término ${i + 1}`, en: `Term ${i + 1}` }, value: t }))
  for (const b of p.blockers) f.push({ key: `blocker.${b.id}`, label: { es: `Bloqueo ${b.id}`, en: `Blocker ${b.id}` }, value: b.reason.es })
  return f
}

function comunicacionFacts(p: ComunicacionPayload): Fact[] {
  return [
    { key: 'channel', label: { es: 'Canal', en: 'Channel' }, value: p.channel },
    { key: 'audience', label: { es: 'Audiencia', en: 'Audience' }, value: p.audience },
    { key: 'language', label: { es: 'Idioma', en: 'Language' }, value: p.language },
    { key: 'to', label: { es: 'Para', en: 'To' }, value: p.to ?? '—' },
    { key: 'subject', label: { es: 'Asunto', en: 'Subject' }, value: p.subject ?? '—' },
    { key: 'body', label: { es: 'Cuerpo', en: 'Body' }, value: p.body },
  ]
}

function hojaCostosFacts(p: HojaCostosPayload): Fact[] {
  const f: Fact[] = [
    { key: 'title', label: { es: 'Título', en: 'Title' }, value: p.title },
    { key: 'product', label: { es: 'Producto', en: 'Product' }, value: p.machine.productName },
    { key: 'exchangeRate', label: { es: 'Tipo de cambio', en: 'Exchange rate' }, value: p.exchangeRate.toFixed(4) },
    { key: 'marginPercent', label: { es: 'Margen', en: 'Margin' }, value: fmtPct(p.marginPercent) },
  ]
  const landed = (p.result as { landedCost?: unknown }).landedCost
  if (typeof landed === 'number') {
    f.push({ key: 'landedCost', label: { es: 'Costo puesto', en: 'Landed cost' }, value: landed.toFixed(2) })
  }
  for (const b of p.blockers) f.push({ key: `blocker.${b.id}`, label: { es: `Bloqueo ${b.id}`, en: `Blocker ${b.id}` }, value: b.reason.es })
  return f
}

function factsFor(p: TorreArtifactPayload): Fact[] {
  switch (p.kind) {
    case 'COTIZACION':
      return cotizacionFacts(p)
    case 'COMUNICACION':
      return comunicacionFacts(p)
    case 'HOJA_COSTOS':
      return hojaCostosFacts(p)
  }
}

/** PURE: diff two fact lists into keyed changes (added / removed / changed). Order: by key. */
export function diffFacts(before: Fact[], after: Fact[]): ArtifactChange[] {
  const beforeByKey = new Map(before.map((f) => [f.key, f]))
  const afterByKey = new Map(after.map((f) => [f.key, f]))
  const keys = [...new Set([...beforeByKey.keys(), ...afterByKey.keys()])].sort()
  const changes: ArtifactChange[] = []
  for (const key of keys) {
    const b = beforeByKey.get(key)
    const a = afterByKey.get(key)
    if (b && a) {
      if (b.value !== a.value) changes.push({ key, label: a.label, before: b.value, after: a.value, kind: 'changed' })
    } else if (a) {
      changes.push({ key, label: a.label, before: null, after: a.value, kind: 'added' })
    } else if (b) {
      changes.push({ key, label: b.label, before: b.value, after: null, kind: 'removed' })
    }
  }
  return changes
}

/**
 * PURE: the semantic change list between two versions of the SAME artifact kind.
 * Throws on a kind mismatch — you can only diff a cotización against a cotización.
 */
export function diffTorreArtifact(before: TorreArtifactPayload, after: TorreArtifactPayload): ArtifactChange[] {
  if (before.kind !== after.kind) {
    throw new Error(`diffTorreArtifact: kind mismatch (${before.kind} → ${after.kind})`)
  }
  return diffFacts(factsFor(before), factsFor(after))
}

export interface Revision {
  /** The versioned successor payload (validated; version bumped). */
  payload: TorreArtifactPayload
  /** What changed old→new (empty if the edit was a no-op). */
  diff: ArtifactChange[]
}

/**
 * PURE: produce the versioned successor of an artifact from an edited payload. Bumps
 * `version` past the original, re-validates against the schema (a malformed edit throws),
 * and returns the diff. The successor is still a DRAFT — the caller persists it.
 */
export function reviseTorreArtifact(original: TorreArtifactPayload, edited: TorreArtifactPayload): Revision {
  if (original.kind !== edited.kind) {
    throw new Error(`reviseTorreArtifact: kind mismatch (${original.kind} → ${edited.kind})`)
  }
  const bumped = { ...edited, version: (original.version ?? 1) + 1 }
  const parsed = torreArtifactPayloadSchema.safeParse(bumped)
  if (!parsed.success) {
    throw new Error(`reviseTorreArtifact: edited payload is invalid — ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`)
  }
  return { payload: parsed.data, diff: diffTorreArtifact(original, parsed.data) }
}
