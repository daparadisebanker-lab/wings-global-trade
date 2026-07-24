// src/lib/torre/brief-view.ts
// Mister Torre — the Morning Brief VIEW layer (L5 UI). PURE + unit-tested: the mapping and
// presentation logic behind the Brief screen, so the .tsx stays a thin renderer (house rule).
//   · resolveBriefRole  — one operator can hold many lane roles; the Brief scopes to ONE, so
//     pick the widest they hold (a group admin / any-lane director sees the director Brief).
//   · watchSignalFromRow — a persisted tower.watch_signals row → the WatchSignal the engine
//     speaks, defensively (a row with an unknown rule/severity is dropped, never rendered raw).
//   · pendingDraftFrom / draftTitle — a Torre draft record → the Brief's PendingDraft, with a
//     human title per kind and the honest `approvable` (isApprovable, incl. the derived checklist blocker).
//   · formatHoursReturned — the telemetry number as the Brief shows it.
import type { Locale, Localized } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import type { Role } from '@/lib/rbac'
import { SEVERITIES, WATCH_RULE_IDS, type Severity, type WatchRuleId, type WatchSignal } from './watch'
import { isApprovable, type TorreArtifactKind, type TorreArtifactPayload } from './artifacts'
import type { TorreDraftRecord } from './drafts'
import { RULE_ROLES, type PendingDraft, type TimeSavedEvent } from './brief'

// ── Role resolution ──────────────────────────────────────────────────────────
// The Brief filters signals per ONE role, but an operator can hold several across lanes and
// must see EVERYTHING they're responsible for — the UNION of their roles' rules. A rank-of-
// privilege heuristic is wrong twice: it hides a SALES lane's commercial signals from a
// TRADE_OPS+SALES operator, and it can pick a role with FEWER rules than one they also hold
// (CATALOG_EDITOR covers zero; VIEWER sees all). So we compute coverage honestly.

/** The watch rules a role is responsible for. VIEWER sees ALL (read-only), matching the Brief. */
function rulesForRole(role: Role): Set<WatchRuleId> {
  if (role === 'VIEWER') return new Set(WATCH_RULE_IDS)
  return new Set(WATCH_RULE_IDS.filter((rule) => RULE_ROLES[rule].includes(role)))
}

/**
 * PURE: the single Role whose signal-visibility ⊇ everything the operator's roles cover.
 * Group admin → LANE_DIRECTOR (sees all + the director extras). If no single held role covers
 * the union of their responsibilities (e.g. TRADE_OPS + SALES), escalate to LANE_DIRECTOR
 * (the only single role that covers all eight rules) — never silently hiding a signal they own.
 */
export function resolveBriefRole(roles: Role[], isGroupAdmin: boolean): Role {
  if (isGroupAdmin) return 'LANE_DIRECTOR'
  if (roles.length === 0) return 'VIEWER' // no lane role → read-only, sees all (VIEWER semantics)
  const needed = new Set<WatchRuleId>()
  for (const role of roles) for (const rule of rulesForRole(role)) needed.add(rule)
  const covering = roles.find((role) => {
    const cov = rulesForRole(role)
    return [...needed].every((rule) => cov.has(rule))
  })
  return covering ?? 'LANE_DIRECTOR'
}

// ── Dates (the operator's calendar, not UTC's) ───────────────────────────────
/**
 * PURE: the America/Lima calendar day for an epoch (Peru is UTC-5 year-round, no DST). Using
 * UTC would roll the Brief's date over at 19:00 Lima and skew the telemetry window by 5h.
 */
export function limaDayString(epochMs: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date(epochMs))
}

// ── watch_signals row → WatchSignal ──────────────────────────────────────────
/** The raw tower.watch_signals row shape (snake_case JSONB, as PostgREST returns it). */
export interface RawWatchSignalRow {
  rule: string
  severity: string
  import_ref: string
  title: unknown
  detail: unknown
  suggested_draft: string | null
}

const SUGGESTED_DRAFTS = new Set(['COMUNICACION', 'REPORTE_ESTADO', 'CHECKLIST_DOCS'])

function localized(v: unknown): { es: string; en: string } | null {
  if (v && typeof v === 'object' && 'es' in v && 'en' in v) {
    const o = v as { es: unknown; en: unknown }
    if (typeof o.es === 'string' && typeof o.en === 'string') return { es: o.es, en: o.en }
  }
  return null
}

/**
 * PURE: a persisted watch_signals row → a WatchSignal, or null when the row is malformed
 * (unknown rule/severity, non-localized title/detail). A bad row is dropped, never rendered.
 */
export function watchSignalFromRow(row: RawWatchSignalRow): WatchSignal | null {
  if (!(WATCH_RULE_IDS as readonly string[]).includes(row.rule)) return null
  if (!(SEVERITIES as readonly string[]).includes(row.severity)) return null
  const title = localized(row.title)
  const detail = localized(row.detail)
  if (!title || !detail || !row.import_ref) return null
  const signal: WatchSignal = {
    rule: row.rule as WatchRuleId,
    severity: row.severity as Severity,
    importRef: row.import_ref,
    title,
    detail,
  }
  if (row.suggested_draft && SUGGESTED_DRAFTS.has(row.suggested_draft)) {
    signal.suggestedDraft = row.suggested_draft as WatchSignal['suggestedDraft']
  }
  return signal
}

// ── Torre draft record → PendingDraft ────────────────────────────────────────
/**
 * PURE: a human display title for a draft, per kind. COTIZACION/COMUNICACION carry no `title`
 * (clientName/subject stand in); the ONLY synthesized fallback (a comunicación with no subject)
 * is localized, so the title honours the t()-law the day EN ships. A cotización always has a
 * client name or a (non-null) product name — no synthesized fallback is reachable there.
 */
export function draftTitle(payload: TorreArtifactPayload, locale: Locale): string {
  switch (payload.kind) {
    case 'COTIZACION':
      return payload.clientName ?? payload.machine.productName
    case 'COMUNICACION':
      return payload.subject ?? t({ es: `Comunicación · ${payload.channel}`, en: `Message · ${payload.channel}` }, locale)
    default:
      return payload.title
  }
}

/** PURE: a Torre draft record → the Brief's PendingDraft (honest `approvable`), titled in `locale`. */
export function pendingDraftFrom(record: TorreDraftRecord, locale: Locale): PendingDraft {
  return {
    id: record.id,
    kind: record.kind as TorreArtifactKind,
    title: draftTitle(record.payload, locale),
    approvable: isApprovable(record.payload),
  }
}

// ── Label dictionaries (exhaustive — a new kind/severity/event won't compile until named) ────
export const SEVERITY_LABEL: Record<Severity, Localized> = {
  inmediato: { es: 'Inmediato', en: 'Immediate' },
  alto: { es: 'Alto', en: 'High' },
  medio: { es: 'Medio', en: 'Medium' },
  bajo: { es: 'Bajo', en: 'Low' },
}

export const KIND_LABEL: Record<TorreArtifactKind, Localized> = {
  HOJA_COSTOS: { es: 'Hoja de costos', en: 'Cost sheet' },
  COTIZACION: { es: 'Cotización', en: 'Quote' },
  COMUNICACION: { es: 'Comunicación', en: 'Message' },
  REPORTE_ESTADO: { es: 'Reporte de estado', en: 'Status report' },
  CHECKLIST_DOCS: { es: 'Checklist de documentos', en: 'Document checklist' },
  ACTA: { es: 'Acta', en: 'Minutes' },
  SOP: { es: 'Procedimiento', en: 'SOP' },
}

/** Names the telemetry-basis event kinds (exhaustive over TimeSavedEvent['kind']). */
export const TIME_SAVED_KIND_LABEL: Record<TimeSavedEvent['kind'], Localized> = {
  quote_run: { es: 'cotización', en: 'quote' },
  draft_approved: { es: 'borrador', en: 'draft' },
  doc_generated: { es: 'documento', en: 'document' },
  signal_resolved: { es: 'señal', en: 'signal' },
}

// ── Presentation helpers ─────────────────────────────────────────────────────
/** PURE: the hours-returned number as the Brief renders it (one decimal, e.g. "4.2 h"). */
export function formatHoursReturned(hours: number): string {
  return `${hours.toFixed(1)} h`
}
