// src/lib/actions/represented-brands-logic.ts
// Pure, dependency-free logic for the Represented-Brands console (RB Console
// Wave 1, Ch 01). Split out of represented-brands.ts for the same reason as
// admin-logic.ts: a 'use server' file may only export async functions, and these
// load-bearing rules (the 8-state retire machine, RB/xx code minting, the --rb-*
// kit contrast/hue/tint validators, capability derivation) are exactly what a
// reviewer needs covered by tests — none touch Supabase.
import { z } from 'zod'
import { nextLaneCode } from './admin-logic'

// ── RB roles (3, deliberately fewer than the 5 lane roles) ───────────────────
export const RB_ROLES = ['BRAND_MANAGER', 'BRAND_OPS', 'BRAND_VIEWER'] as const
export type RbRole = (typeof RB_ROLES)[number]
export function isRbRole(v: string): v is RbRole {
  return (RB_ROLES as readonly string[]).includes(v)
}

// ── RB status (the shipped 8-state enum; retire, never delete) ────────────────
export const RB_STATUSES = [
  'PROSPECT',
  'NEGOTIATION',
  'SIGNED',
  'ONBOARDING',
  'BRAND_REVIEW',
  'LIVE',
  'PAUSED',
  'ENDED',
] as const
export type RbStatus = (typeof RB_STATUSES)[number]

// The linear onboarding path; PAUSED/ENDED sit off it.
const LINE: RbStatus[] = ['PROSPECT', 'NEGOTIATION', 'SIGNED', 'ONBOARDING', 'BRAND_REVIEW', 'LIVE']

/**
 * Legal status flips (Ch 01 §Server actions). Forward-only along the onboarding
 * line; the kit gate blocks any move to BRAND_REVIEW or beyond unless the kit is
 * complete (so BRAND_REVIEW never holds an unvalidated kit, and LIVE never ships
 * one). PAUSED↔LIVE is the reinstatable retire pair; ENDED is terminal. No-ops
 * rejected (so the action never writes an empty audit row).
 */
export function canTransitionRbStatus(
  from: RbStatus,
  to: RbStatus,
  opts: { kitComplete: boolean },
): boolean {
  if (from === to) return false
  if (from === 'ENDED') return false
  if (to === 'ENDED') return true // retire terminal from anywhere non-ended
  if (from === 'LIVE' && to === 'PAUSED') return true
  if (from === 'PAUSED' && to === 'LIVE') return opts.kitComplete // reinstate needs a valid kit

  const fi = LINE.indexOf(from)
  const ti = LINE.indexOf(to)
  if (fi === -1 || ti === -1) return false
  if (ti <= fi) return false // forward only
  if (ti >= LINE.indexOf('BRAND_REVIEW') && !opts.kitComplete) return false // kit gate
  return true
}

/** The status flips offered in the UI for a brand currently at `from`. */
export function nextRbStatuses(from: RbStatus, kitComplete: boolean): RbStatus[] {
  return RB_STATUSES.filter((s) => canTransitionRbStatus(from, s, { kitComplete }))
}

/** Next append-only RB/xx code — the shipped minter with the 'RB' prefix. */
export function nextRbCode(existingCodes: string[]): string {
  return nextLaneCode(existingCodes, 'RB')
}

// ── The --rb-* token contract (Zod) ──────────────────────────────────────────
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/)
const source = z.enum(['brand_supplied', 'wings_studio'])
const image = z.object({ path: z.string().min(1), source })
const doc = z.object({ path: z.string().min(1), publicCopy: z.boolean() })

export const rbKitSchema = z.object({
  tokens: z.object({
    accent: hex,
    'accent-ink': hex,
    'accent-2': hex,
    ink: hex,
    'surface-tint': hex,
  }),
  logo: z.object({
    isologo: z.string().min(1),
    positivo: z.string().min(1),
    isotipo: z.string().min(1),
    sello: z.string().min(1),
  }),
  photography: z.object({
    hero: z.array(image).min(3),
    about: z.array(image).min(2),
  }),
  docs: z.object({
    mandateLetter: doc,
    usageManual: doc,
  }),
})
export type RbKit = z.infer<typeof rbKitSchema>

// ── Colour math (WCAG contrast + hue separation + tint strength) ─────────────
function toRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function channel(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}
function luminance(h: string): number {
  const [r, g, b] = toRgb(h)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio between two hex colours (1..21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** Hue (0..360) of a hex colour. */
export function hueOf(h: string): number {
  const [r, g, b] = toRgb(h).map((c) => c / 255) as [number, number, number]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0
  let hue: number
  if (max === r) hue = ((g - b) / d) % 6
  else if (max === g) hue = (b - r) / d + 2
  else hue = (r - g) / d + 4
  hue *= 60
  return hue < 0 ? hue + 360 : hue
}

/** Smallest angular separation (0..180) between two hues. */
export function hueSeparation(a: string, b: string): number {
  const diff = Math.abs(hueOf(a) - hueOf(b)) % 360
  return diff > 180 ? 360 - diff : diff
}

/** Tint strength of a near-white surface colour: how far its darkest channel is
 *  from white, as a fraction (0 = pure white). The brands-ground rule caps it ≤4%. */
export function tintStrength(h: string): number {
  const [r, g, b] = toRgb(h)
  return (255 - Math.min(r, g, b)) / 255
}

export const RB_KIT_LIMITS = {
  minContrast: 4.5, // accent-ink on accent (WCAG AA body text)
  minHueSeparation: 30, // accent vs existing lane/brand accents (root Phase-2 rule 4)
  maxTintStrength: 0.04, // surface-tint ≤ 4% over the white ground
}

export interface KitValidation {
  ok: boolean
  kitComplete: boolean
  errors: string[]
}

/**
 * The numeric publish gates that decide whether kit_complete may be set. Zod
 * (rbKitSchema) covers shape/tags/minimums; this runs the colour gates:
 * accent-ink legibility on accent, surface-tint restraint, and hue separation
 * against any provided existing accents (lane + other brands, from the registry).
 */
export function validateKit(kit: RbKit, existingAccents: string[] = []): KitValidation {
  const errors: string[] = []
  const { accent, 'accent-ink': accentInk, 'surface-tint': tint } = kit.tokens

  const contrast = contrastRatio(accent, accentInk)
  if (contrast < RB_KIT_LIMITS.minContrast) {
    errors.push(`accent-ink no alcanza 4.5:1 sobre accent (${contrast.toFixed(2)}:1)`)
  }
  if (tintStrength(tint) > RB_KIT_LIMITS.maxTintStrength) {
    errors.push('surface-tint supera 4% sobre el fondo blanco')
  }
  for (const other of existingAccents) {
    if (hueSeparation(accent, other) < RB_KIT_LIMITS.minHueSeparation) {
      errors.push(`accent a menos de 30° de un accent existente (${other})`)
      break
    }
  }
  return { ok: errors.length === 0, kitComplete: errors.length === 0, errors }
}

// ── Membership grid diff (brand-keyed) ───────────────────────────────────────
export interface RbMembershipKey {
  brandId: string
  role: RbRole
}
function keyOf(k: RbMembershipKey): string {
  return `${k.brandId}::${k.role}`
}
/** Minimal add/remove set between a user's current RB memberships and the grid. */
export function rbDiffMemberships(
  current: RbMembershipKey[],
  desired: RbMembershipKey[],
): { toAdd: RbMembershipKey[]; toRemove: RbMembershipKey[] } {
  const cur = new Map(current.map((k) => [keyOf(k), k]))
  const des = new Map(desired.map((k) => [keyOf(k), k]))
  const toAdd: RbMembershipKey[] = []
  for (const [key, k] of des) if (!cur.has(key)) toAdd.push(k)
  const toRemove: RbMembershipKey[] = []
  for (const [key, k] of cur) if (!des.has(key)) toRemove.push(k)
  return { toAdd, toRemove }
}

// ── Capability derivation (hide-not-enforce) ─────────────────────────────────
export interface RbCapabilities {
  canEdit: boolean
  canManageContainers: boolean
  canPublishBrand: boolean
}
/** UI-hiding only — the DB (column revoke + RLS + validators) is the real gate. */
export function computeRbCapabilities(
  roles: RbRole[],
  isGroupAdmin: boolean,
  kitComplete: boolean,
): RbCapabilities {
  const isManager = isGroupAdmin || roles.includes('BRAND_MANAGER')
  const isOps = isManager || roles.includes('BRAND_OPS')
  return {
    canEdit: isManager,
    canManageContainers: isOps,
    canPublishBrand: isGroupAdmin || (roles.includes('BRAND_MANAGER') && kitComplete),
  }
}
