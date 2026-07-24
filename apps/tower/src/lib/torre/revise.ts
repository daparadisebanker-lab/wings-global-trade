// src/lib/torre/revise.ts
// Mister Torre — artifact revision + semantic diff (Loop L1, Cotizar polish). PURE +
// unit-tested. Two capabilities the review UI wires:
//   · diffTorreArtifact(old, new) → a human-readable, field-level change list (old→new),
//     money-aware, so a reviewer sees EXACTLY what a revision changed (not a text blob).
//   · reviseTorreArtifact(old, edited) → the versioned successor: bumps `version`,
//     re-validates against the schema, DOWNGRADES a hand-edited price's confidence
//     (verified→estimado + operator source) so an edited number never looks verified, and
//     returns the diff. Spine of both inline edit and comment-to-revise.
//
// Governance (L1 review fixes): the diff surfaces blockers, sideEffect, the machine block
// and sources on every kind — a revision cannot silently launder a blocker, alter the
// named side effect, change the spec/provenance, or make an edited number read verified.
import {
  torreArtifactPayloadSchema,
  type Blocker,
  type CotizacionPayload,
  type ComunicacionPayload,
  type HojaCostosPayload,
  type Machine,
  type SourceRef,
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
  // Integer minor units → major with 2 decimals. USD/PEN/EUR are 2-decimal; a non-2-decimal
  // currency would need an exponent map (schema currently allows any string — noted).
  return m === null ? '—' : (m / 100).toFixed(2)
}
function fmtPct(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`
}
/** Stable stringify (sorted top-level keys) for a flat record — a change anywhere shows. */
function stableStringify(o: Record<string, unknown>): string {
  return JSON.stringify(o, Object.keys(o).sort())
}

// ── Shared fact fragments ────────────────────────────────────────────────────

function machineFacts(m: Machine): Fact[] {
  return [
    { key: 'machine.productName', label: { es: 'Producto', en: 'Product' }, value: m.productName },
    { key: 'machine.brand', label: { es: 'Marca', en: 'Brand' }, value: m.brand },
    { key: 'machine.model', label: { es: 'Modelo', en: 'Model' }, value: m.model },
    { key: 'machine.fuelType', label: { es: 'Combustible', en: 'Fuel' }, value: m.fuelType },
    { key: 'machine.engineCC', label: { es: 'Cilindrada', en: 'Engine CC' }, value: String(m.engineCC) },
    { key: 'machine.incoterm', label: { es: 'Incoterm (equipo)', en: 'Incoterm (unit)' }, value: m.incoterm },
    { key: 'machine.origin', label: { es: 'Origen', en: 'Origin' }, value: m.origin },
  ]
}

function sourceFacts(sources: SourceRef[]): Fact[] {
  return sources.map((s, i) => ({
    key: `source.${i}`,
    label: { es: `Fuente ${i + 1}`, en: `Source ${i + 1}` },
    value: `${s.kind}:${s.label}${s.ref ? ` (${s.ref})` : ''}${s.validUntil ? ` ≤${s.validUntil}` : ''}`,
  }))
}

function blockerFacts(blockers: Blocker[]): Fact[] {
  return blockers.map((b) => ({
    key: `blocker.${b.id}`,
    label: { es: `Bloqueo ${b.id}`, en: `Blocker ${b.id}` },
    value: b.reason.es,
  }))
}

// ── Fact builders per kind ───────────────────────────────────────────────────

function cotizacionFacts(p: CotizacionPayload): Fact[] {
  const f: Fact[] = [
    { key: 'client', label: { es: 'Cliente', en: 'Client' }, value: p.clientName ?? '—' },
    { key: 'lane', label: { es: 'Lane', en: 'Lane' }, value: p.laneCode ?? '—' },
    { key: 'language', label: { es: 'Idioma', en: 'Language' }, value: p.language },
    { key: 'currency', label: { es: 'Moneda', en: 'Currency' }, value: p.currency },
    { key: 'quantity', label: { es: 'Cantidad', en: 'Quantity' }, value: String(p.quantity) },
    { key: 'validityUntil', label: { es: 'Válida hasta', en: 'Valid until' }, value: p.validityUntil },
    ...machineFacts(p.machine),
  ]
  for (const s of p.scenarios) {
    f.push({ key: `scenario.${s.incoterm}.landed`, label: { es: `Costo puesto ${s.incoterm}`, en: `Landed ${s.incoterm}` }, value: fmtMinor(s.landedCostMinor) })
    f.push({ key: `scenario.${s.incoterm}.unit`, label: { es: `Precio unit. ${s.incoterm}`, en: `Unit price ${s.incoterm}` }, value: fmtMinor(s.unitPriceMinor) })
    f.push({ key: `scenario.${s.incoterm}.confidence`, label: { es: `Confianza ${s.incoterm}`, en: `Confidence ${s.incoterm}` }, value: s.confidence })
  }
  // terms keyed by CONTENT (reorder = no change; add/remove by text); dups → suffixed in diff
  for (const t of p.terms) f.push({ key: `term:${t}`, label: { es: 'Término', en: 'Term' }, value: t })
  return [...f, ...sourceFacts(p.sources), ...blockerFacts(p.blockers)]
}

function comunicacionFacts(p: ComunicacionPayload): Fact[] {
  return [
    { key: 'channel', label: { es: 'Canal', en: 'Channel' }, value: p.channel },
    { key: 'audience', label: { es: 'Audiencia', en: 'Audience' }, value: p.audience },
    { key: 'language', label: { es: 'Idioma', en: 'Language' }, value: p.language },
    { key: 'to', label: { es: 'Para', en: 'To' }, value: p.to ?? '—' },
    { key: 'subject', label: { es: 'Asunto', en: 'Subject' }, value: p.subject ?? '—' },
    { key: 'body', label: { es: 'Cuerpo', en: 'Body' }, value: p.body },
    { key: 'sideEffect', label: { es: 'Efecto al aprobar', en: 'Side effect' }, value: p.sideEffect.es },
    ...blockerFacts(p.blockers),
  ]
}

function hojaCostosFacts(p: HojaCostosPayload): Fact[] {
  const f: Fact[] = [
    { key: 'title', label: { es: 'Título', en: 'Title' }, value: p.title },
    ...machineFacts(p.machine),
    { key: 'exchangeRate', label: { es: 'Tipo de cambio', en: 'Exchange rate' }, value: p.exchangeRate.toFixed(4) },
    { key: 'marginPercent', label: { es: 'Margen', en: 'Margin' }, value: fmtPct(p.marginPercent) },
    // the full engine trace — a change anywhere (a hand-edited input or result) is visible
    { key: 'inputs', label: { es: 'Insumos (motor)', en: 'Inputs (engine)' }, value: stableStringify(p.inputs) },
    { key: 'result', label: { es: 'Resultado (motor)', en: 'Result (engine)' }, value: stableStringify(p.result) },
  ]
  return [...f, ...sourceFacts(p.sources), ...blockerFacts(p.blockers)]
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

/** Index facts by key, suffixing duplicate keys (#2, #3…) so a duplicate never collapses. */
function indexByKey(facts: Fact[]): Map<string, Fact> {
  const m = new Map<string, Fact>()
  const counts = new Map<string, number>()
  for (const f of facts) {
    const n = (counts.get(f.key) ?? 0) + 1
    counts.set(f.key, n)
    const key = n === 1 ? f.key : `${f.key}#${n}`
    m.set(key, { ...f, key })
  }
  return m
}

/** Natural-order key sort so `term.2` precedes `term.10` and grouped keys stay together. */
function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, 'en', { numeric: true })
}

/** PURE: diff two fact lists into keyed changes (added / removed / changed). */
export function diffFacts(before: Fact[], after: Fact[]): ArtifactChange[] {
  const beforeByKey = indexByKey(before)
  const afterByKey = indexByKey(after)
  const keys = [...new Set([...beforeByKey.keys(), ...afterByKey.keys()])].sort(naturalCompare)
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
  /** The versioned successor payload (validated; version bumped; honesty-adjusted). */
  payload: TorreArtifactPayload
  /** What changed old→new (empty if the edit was a no-op). */
  diff: ArtifactChange[]
  /** Reviewer-facing notes about automatic adjustments (e.g. a confidence downgrade). */
  warnings: string[]
}

/** If a cotización scenario's money was hand-edited, an engine 'verified' can no longer stand. */
function honestyAdjust(original: CotizacionPayload, edited: CotizacionPayload): { payload: CotizacionPayload; warnings: string[] } {
  const origByIncoterm = new Map(original.scenarios.map((s) => [s.incoterm, s]))
  let moneyEdited = false
  const scenarios = edited.scenarios.map((s) => {
    const o = origByIncoterm.get(s.incoterm)
    const changed = o != null && (o.landedCostMinor !== s.landedCostMinor || o.unitPriceMinor !== s.unitPriceMinor)
    if (!changed) return s
    moneyEdited = true
    // a number the human changed can't keep the engine's 'verified' stamp
    return s.confidence === 'verified' ? { ...s, confidence: 'estimado' as const } : s
  })
  if (!moneyEdited) return { payload: edited, warnings: [] }
  const hasOperatorSource = edited.sources.some((s) => s.kind === 'operator' && /manual/i.test(s.label))
  return {
    payload: {
      ...edited,
      scenarios,
      sources: hasOperatorSource ? edited.sources : [...edited.sources, { kind: 'operator', label: 'Editado manualmente' }],
    },
    warnings: ['Cifras editadas manualmente: la confianza de los escenarios afectados se degradó a estimado.'],
  }
}

/**
 * PURE: produce the versioned successor of an artifact from an edited payload. Bumps
 * `version` past the original, re-validates against the schema (a malformed edit throws),
 * rejects duplicate scenario incoterms, downgrades hand-edited prices from verified→estimado,
 * and returns the diff + any warnings. The successor is still a DRAFT — the caller persists it.
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

  let successor = parsed.data
  const warnings: string[] = []
  if (successor.kind === 'COTIZACION' && original.kind === 'COTIZACION') {
    // duplicate incoterms are a semantic error (they'd collide the reviewer's mental model)
    const incoterms = successor.scenarios.map((s) => s.incoterm)
    if (new Set(incoterms).size !== incoterms.length) {
      throw new Error('reviseTorreArtifact: duplicate scenario incoterms')
    }
    const adjusted = honestyAdjust(original, successor)
    successor = adjusted.payload
    warnings.push(...adjusted.warnings)
  }

  return { payload: successor, diff: diffTorreArtifact(original, successor), warnings }
}
