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
import type { Role } from '@/lib/rbac'
import { SEVERITIES, WATCH_RULE_IDS, type Severity, type WatchRuleId, type WatchSignal } from './watch'
import { isApprovable, type TorreArtifactKind, type TorreArtifactPayload } from './artifacts'
import type { TorreDraftRecord } from './drafts'
import type { PendingDraft } from './brief'

// ── Role resolution ──────────────────────────────────────────────────────────
// Widest-first: the Brief filters signals per role, so an operator who holds several roles
// should see the UNION of what each is responsible for. We approximate that by the most
// privileged role (director covers all rules); a group admin gets the director Brief.
const ROLE_RANK: Record<Role, number> = {
  LANE_DIRECTOR: 5,
  TRADE_OPS: 4,
  SALES: 3,
  CATALOG_EDITOR: 2,
  VIEWER: 1,
}

/** PURE: the single Role the Brief renders for. Group admin → LANE_DIRECTOR (sees everything). */
export function resolveBriefRole(roles: Role[], isGroupAdmin: boolean): Role {
  if (isGroupAdmin) return 'LANE_DIRECTOR'
  if (roles.length === 0) return 'VIEWER' // no lane role → read-only, sees all (VIEWER semantics)
  return roles.reduce((best, r) => (ROLE_RANK[r] > ROLE_RANK[best] ? r : best), roles[0])
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
/** PURE: a human display title for a draft, per kind (COTIZACION/COMUNICACION carry no `title`). */
export function draftTitle(payload: TorreArtifactPayload): string {
  switch (payload.kind) {
    case 'COTIZACION':
      return payload.clientName ?? payload.machine.productName ?? 'Cotización'
    case 'COMUNICACION':
      return payload.subject ?? `Comunicación · ${payload.channel}`
    default:
      return payload.title
  }
}

/** PURE: a Torre draft record → the Brief's PendingDraft (honest `approvable`). */
export function pendingDraftFrom(record: TorreDraftRecord): PendingDraft {
  return {
    id: record.id,
    kind: record.kind as TorreArtifactKind,
    title: draftTitle(record.payload),
    approvable: isApprovable(record.payload),
  }
}

// ── Presentation helpers ─────────────────────────────────────────────────────
/** PURE: the hours-returned number as the Brief renders it (one decimal, e.g. "4.2 h"). */
export function formatHoursReturned(hours: number): string {
  return `${hours.toFixed(1)} h`
}
