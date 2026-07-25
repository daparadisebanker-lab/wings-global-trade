// Pure logic for the Clients CRM — the display type, the join-row shape, the row
// mapper, and the shared option vocabularies (source · stage · buyer archetype).
// Split from clients.ts because a 'use server' file may only export async
// functions (mirrors pipeline.ts / quotations.ts). Unit-tested.

import { parseMediaArray, type ClientMediaItem } from './client-media-logic'
export type { ClientMediaItem } from './client-media-logic'

export type ClientSource =
  | 'mister'
  | 'whatsapp'
  | 'referral'
  | 'web'
  | 'trade_fair'
  | 'cold_outreach'
  | 'network'
  | 'other'

export type ClientStage = 'lead' | 'qualified' | 'quoted' | 'negotiating' | 'won' | 'dormant'

/** The ecosystem's 7 purchase-logic archetypes (root CLAUDE.md §3). */
export type BuyerArchetype =
  | 'EQUIPMENT'
  | 'PROJECT'
  | 'COMMODITY'
  | 'PROGRAM'
  | 'CREDENTIAL'
  | 'ORIGIN'
  | 'ALLOCATION'

export interface ClientContact {
  name: string
  whatsapp: string | null
  email: string | null
  role: string | null
}

export interface ClientListItem {
  id: string
  name: string
  brandName: string | null
  source: ClientSource | null
  category: string | null
  archetype: BuyerArchetype | null
  demand: string | null
  stage: ClientStage
  country: string | null
  region: string | null
  city: string | null
  currency: string
  ownerId: string | null
  notes: string | null
  /** CRM lead score 0–100. */
  score: number
  primaryContact: ClientContact | null
  /** Attachments from a WhatsApp import (images/audio), stored in client-media. */
  media: ClientMediaItem[]
  createdAt: string
}

// ── Shared vocabularies (used by the form + the list, ES/EN) ─────────────────
export const SOURCE_OPTIONS: { id: ClientSource; es: string; en: string }[] = [
  { id: 'mister', es: 'Mister', en: 'Mister' },
  { id: 'whatsapp', es: 'WhatsApp', en: 'WhatsApp' },
  { id: 'referral', es: 'Referido', en: 'Referral' },
  { id: 'web', es: 'Web', en: 'Web' },
  { id: 'trade_fair', es: 'Feria', en: 'Trade fair' },
  { id: 'cold_outreach', es: 'Prospección', en: 'Outreach' },
  { id: 'network', es: 'Red', en: 'Network' },
  { id: 'other', es: 'Otro', en: 'Other' },
]

export const STAGE_OPTIONS: { id: ClientStage; es: string; en: string }[] = [
  { id: 'lead', es: 'Lead', en: 'Lead' },
  { id: 'qualified', es: 'Calificado', en: 'Qualified' },
  { id: 'quoted', es: 'Cotizado', en: 'Quoted' },
  { id: 'negotiating', es: 'Negociando', en: 'Negotiating' },
  { id: 'won', es: 'Ganado', en: 'Won' },
  { id: 'dormant', es: 'Dormido', en: 'Dormant' },
]

export const ARCHETYPE_OPTIONS: { id: BuyerArchetype; es: string; en: string }[] = [
  { id: 'EQUIPMENT', es: 'Equipos', en: 'Equipment' },
  { id: 'PROJECT', es: 'Proyecto', en: 'Project' },
  { id: 'COMMODITY', es: 'Commodity', en: 'Commodity' },
  { id: 'PROGRAM', es: 'Programa', en: 'Program' },
  { id: 'CREDENTIAL', es: 'Credencial', en: 'Credential' },
  { id: 'ORIGIN', es: 'Origen', en: 'Origin' },
  { id: 'ALLOCATION', es: 'Asignación', en: 'Allocation' },
]

function label(
  options: { id: string; es: string; en: string }[],
  id: string | null,
  locale: 'es' | 'en',
): string | null {
  if (!id) return null
  const o = options.find((x) => x.id === id)
  return o ? o[locale] : id
}
export const sourceLabel = (id: string | null, locale: 'es' | 'en') => label(SOURCE_OPTIONS, id, locale)
export const stageLabel = (id: string | null, locale: 'es' | 'en') => label(STAGE_OPTIONS, id, locale)
export const archetypeLabel = (id: string | null, locale: 'es' | 'en') => label(ARCHETYPE_OPTIONS, id, locale)

// ── Raw join shape (Supabase returns a nested relation as object|array) ──────
export type Nested<T> = T | T[] | null
interface RawBrandJoin {
  name: string | null
}
interface RawContactJoin {
  full_name: string | null
  whatsapp: string | null
  email: string | null
  role: string | null
  is_primary: boolean | null
}
export interface RawClientRow {
  id: string
  name: string
  country: string | null
  region: string | null
  city: string | null
  source: string | null
  category: string | null
  archetype_profile: string | null
  demand: string | null
  stage: string | null
  currency: string | null
  owner_id: string | null
  notes: string | null
  score: number | string | null
  media: unknown
  created_at: string
  brands: Nested<RawBrandJoin>
  contacts: RawContactJoin[] | RawContactJoin | null
}

/** First element of a possibly-array nested relation, or null. */
export function one<T>(v: Nested<T>): T | null {
  if (Array.isArray(v)) return v.length > 0 ? v[0] : null
  return v ?? null
}

/** Pick the primary contact from an account's contacts (else null). */
export function pickPrimaryContact(contacts: RawClientRow['contacts']): ClientContact | null {
  const list = Array.isArray(contacts) ? contacts : contacts ? [contacts] : []
  const primary = list.find((c) => c?.is_primary) ?? null
  if (!primary || !primary.full_name) return null
  return {
    name: primary.full_name,
    whatsapp: primary.whatsapp ?? null,
    email: primary.email ?? null,
    role: primary.role ?? null,
  }
}

const STAGES: ReadonlySet<string> = new Set(STAGE_OPTIONS.map((s) => s.id))
const SOURCES: ReadonlySet<string> = new Set(SOURCE_OPTIONS.map((s) => s.id))
const ARCHETYPES: ReadonlySet<string> = new Set(ARCHETYPE_OPTIONS.map((a) => a.id))

/** PURE: raw joined row → the flat display item. */
export function mapClientRow(row: RawClientRow): ClientListItem {
  const brand = one(row.brands)
  const score = typeof row.score === 'string' ? Number(row.score) : row.score ?? 0
  return {
    id: row.id,
    name: row.name,
    brandName: brand?.name ?? null,
    source: row.source && SOURCES.has(row.source) ? (row.source as ClientSource) : null,
    category: row.category,
    archetype:
      row.archetype_profile && ARCHETYPES.has(row.archetype_profile)
        ? (row.archetype_profile as BuyerArchetype)
        : null,
    demand: row.demand,
    stage: row.stage && STAGES.has(row.stage) ? (row.stage as ClientStage) : 'lead',
    country: row.country,
    region: row.region,
    city: row.city,
    currency: row.currency ?? 'USD',
    ownerId: row.owner_id,
    notes: row.notes,
    score: Number.isFinite(score) ? (score as number) : 0,
    primaryContact: pickPrimaryContact(row.contacts),
    media: parseMediaArray(row.media),
    createdAt: row.created_at,
  }
}

export const CLIENT_SELECT =
  'id,name,country,region,city,source,category,archetype_profile,demand,stage,currency,owner_id,notes,score,media,created_at,brands(name),contacts(full_name,whatsapp,email,role,is_primary)'

// ── Pipeline board grouping ──────────────────────────────────────────────────
export interface StageColumn {
  stage: ClientStage
  items: ClientListItem[]
}

/** PURE: bucket clients into the fixed stage order (empty columns kept), so the
 *  board always shows every lane of the pipeline. Within a column, input order is
 *  preserved (the caller sorts — e.g. score desc). */
export function groupClientsByStage(items: ClientListItem[]): StageColumn[] {
  const buckets = new Map<ClientStage, ClientListItem[]>(STAGE_OPTIONS.map((s) => [s.id, []]))
  for (const c of items) (buckets.get(c.stage) ?? buckets.get('lead'))!.push(c)
  return STAGE_OPTIONS.map((s) => ({ stage: s.id, items: buckets.get(s.id) ?? [] }))
}
