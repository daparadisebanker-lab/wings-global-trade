// Pure logic for the Clients window — the display type, the join-row shape, and
// the row mapper. Split from clients.ts because a 'use server' file may only
// export async functions (mirrors pipeline.ts / quotations.ts). Unit-tested.

export interface ClientListItem {
  id: string
  name: string
  brandName: string | null
  country: string | null
  region: string | null
  /** CRM lead score 0–100. */
  score: number
  createdAt: string
}

// ── Raw join shape (Supabase returns a nested relation as object|array) ──────
export type Nested<T> = T | T[] | null
interface RawBrandJoin {
  name: string | null
}
export interface RawClientRow {
  id: string
  name: string
  country: string | null
  region: string | null
  score: number | string | null
  created_at: string
  brands: Nested<RawBrandJoin>
}

/** First element of a possibly-array nested relation, or null. */
export function one<T>(v: Nested<T>): T | null {
  if (Array.isArray(v)) return v.length > 0 ? v[0] : null
  return v ?? null
}

/** PURE: raw joined row → the flat display item. */
export function mapClientRow(row: RawClientRow): ClientListItem {
  const brand = one(row.brands)
  const score = typeof row.score === 'string' ? Number(row.score) : row.score ?? 0
  return {
    id: row.id,
    name: row.name,
    brandName: brand?.name ?? null,
    country: row.country,
    region: row.region,
    score: Number.isFinite(score) ? (score as number) : 0,
    createdAt: row.created_at,
  }
}

export const CLIENT_SELECT = 'id,name,country,region,score,created_at,brands(name)'
