// src/lib/actions/share-recipients-logic.ts
// Pure logic for the WhatsApp marketing share (root CLAUDE.md §5-bis, WS5). The
// promo share button (ContainerPromoPanel) lets a rep target a REAL client
// contact: we address a wa.me deep-link to that contact's WhatsApp so the rep's
// own WhatsApp opens the chat with the copy pre-filled — they hit send. This is
// the rep's own workflow (D2): NO Meta/Cloud API, no broadcast, no server send.
//
// Kept out of the 'use server' file so it can be unit-tested and imported by the
// client picker: the recipient shape, the RLS-join row mapper, the reachability
// test (a contact is a target only when it has a usable WhatsApp number), the
// search filter, and the greeting personalization.
import type { Locale } from '@/lib/i18n'

/** A reachable share recipient — a client contact with a WhatsApp number. */
export interface ShareRecipient {
  /** Contact id (tower.contacts.id) — the option key; never shown. */
  id: string
  /** The person to greet ("Hola {name},"). */
  contactName: string
  /** The client account this contact belongs to (the "who" the rep recognizes). */
  accountName: string
  /** The brand the account is filed under, when known. */
  brandName: string | null
  /** Raw WhatsApp as stored (E.164-ish); waMeUrl strips it to digits. */
  whatsapp: string
}

// ── Raw RLS-join shape (contacts → account → brand) ──────────────────────────
type Nested<T> = T | T[] | null
interface RawBrand {
  name: string | null
}
interface RawAccount {
  name: string | null
  brands: Nested<RawBrand>
}
export interface RawContactRow {
  id: string
  full_name: string | null
  whatsapp: string | null
  accounts: Nested<RawAccount>
}

export const SHARE_CONTACT_SELECT = 'id,full_name,whatsapp,accounts(name,brands(name))'

/** First element of a possibly-array nested relation, or null. */
function one<T>(v: Nested<T>): T | null {
  if (Array.isArray(v)) return v.length > 0 ? v[0] : null
  return v ?? null
}

/** Digits of a WhatsApp/phone string (drops +, spaces, dashes, parens). A
 *  reachable number needs at least a country + subscriber run; we require ≥8
 *  digits to reject obvious junk ("n/a", "123"). Pure, matches waMeUrl's strip. */
export function whatsappDigits(raw: string | null | undefined): string {
  return (raw ?? '').replace(/\D/g, '')
}

/** A contact is a share target only when it has a usable WhatsApp number. */
export function isReachable(raw: string | null | undefined): boolean {
  return whatsappDigits(raw).length >= 8
}

/** PURE: raw joined contact row → a recipient, or null when unreachable / nameless.
 *  A contact with no WhatsApp is not a WhatsApp target, so it is dropped here (the
 *  picker only ever lists people the rep can actually reach). */
export function mapRecipientRow(row: RawContactRow): ShareRecipient | null {
  if (!isReachable(row.whatsapp)) return null
  const account = one(row.accounts)
  const contactName = (row.full_name ?? '').trim()
  const accountName = (account?.name ?? '').trim()
  // Without at least an account name the option is unidentifiable — drop it.
  if (!accountName) return null
  return {
    id: row.id,
    contactName: contactName || accountName,
    accountName,
    brandName: one(account?.brands ?? null)?.name ?? null,
    whatsapp: (row.whatsapp ?? '').trim(),
  }
}

/** PURE: map + drop unreachable rows + sort by account then contact (A→Z, locale
 *  insensitive enough for a picker). The one place the raw list becomes options. */
export function toRecipients(rows: RawContactRow[]): ShareRecipient[] {
  const out: ShareRecipient[] = []
  for (const r of rows) {
    const m = mapRecipientRow(r)
    if (m) out.push(m)
  }
  return out.sort((a, b) => a.accountName.localeCompare(b.accountName) || a.contactName.localeCompare(b.contactName))
}

/** PURE: case/diacritic-insensitive substring filter over account + contact name.
 *  Empty query → the list unchanged. */
export function filterRecipients(list: ShareRecipient[], query: string): ShareRecipient[] {
  const q = fold(query)
  if (!q) return list
  return list.filter((r) => fold(r.accountName).includes(q) || fold(r.contactName).includes(q))
}

function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** PURE: prefix a client-facing greeting when a recipient is targeted. The base
 *  copy already carries the offer; we only add "Hola {first name}," on top so the
 *  message reads as sent to that person. No name → the base text unchanged. */
export function personalizedShareText(baseText: string, contactName: string | null, locale: Locale): string {
  const name = (contactName ?? '').trim().split(/\s+/)[0] ?? ''
  if (!name) return baseText
  const hola = locale === 'en' ? `Hi ${name},` : `Hola ${name},`
  return `${hola}\n\n${baseText}`
}
