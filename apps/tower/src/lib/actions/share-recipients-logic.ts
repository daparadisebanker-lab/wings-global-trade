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
import { t, type Locale } from '@/lib/i18n'

/** A reachable share recipient — a client contact with a WhatsApp number. */
export interface ShareRecipient {
  /** Contact id (tower.contacts.id) — the option key; never shown. */
  id: string
  /** Display label for the option — the person, or the account when the contact
   *  is unnamed. Shown in the picker; NOT used to greet (that would address a
   *  company as a person). */
  contactName: string
  /** The person's name to greet ("Hola {name},"), or null when the contact has no
   *  name — then the share copy goes out ungreeted rather than "Hola {company}". */
  greetName: string | null
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

/** Digits of a WhatsApp/phone string (drops +, spaces, dashes, parens). Pure,
 *  matches waMeUrl's strip. */
export function whatsappDigits(raw: string | null | undefined): string {
  return (raw ?? '').replace(/\D/g, '')
}

/** A contact is a share target only when it has a WhatsApp number wa.me can dial.
 *  wa.me needs the FULL international number (country code + subscriber) — a bare
 *  local number (e.g. Peru "987 654 321", 9 digits) deep-links to WhatsApp's
 *  "invalid number" page, a dead end. So: an explicit "+"-prefixed value (E.164
 *  as stored) is trusted at ≥8 digits; anything else must carry ≥11 digits so a
 *  country code is actually present, not just a 9–10-digit local run. */
export function isReachable(raw: string | null | undefined): boolean {
  const s = (raw ?? '').trim()
  const digits = whatsappDigits(s)
  return s.startsWith('+') ? digits.length >= 8 : digits.length >= 11
}

/** PURE: raw joined contact row → a recipient, or null when unreachable / nameless.
 *  A contact with no WhatsApp is not a WhatsApp target, so it is dropped here (the
 *  picker only ever lists people the rep can actually reach). */
export function mapRecipientRow(row: RawContactRow): ShareRecipient | null {
  if (!isReachable(row.whatsapp)) return null
  const account = one(row.accounts)
  const personName = (row.full_name ?? '').trim()
  const accountName = (account?.name ?? '').trim()
  // Without at least an account name the option is unidentifiable — drop it.
  if (!accountName) return null
  return {
    id: row.id,
    contactName: personName || accountName,
    // Greet the person only; a nameless contact's copy goes out ungreeted (never
    // "Hola {company}") — the display label still falls back to the account name.
    greetName: personName || null,
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

/** PURE: prefix a client-facing greeting when a NAMED recipient is targeted. The
 *  base copy already carries the offer; we only add "Hola {first name}," on top so
 *  the message reads as sent to that person. No name (null/blank — e.g. a nameless
 *  contact) → the base text unchanged, never "Hola {company}". */
export function personalizedShareText(baseText: string, greetName: string | null, locale: Locale): string {
  const name = (greetName ?? '').trim().split(/\s+/)[0] ?? ''
  if (!name) return baseText
  return `${t({ es: 'Hola', en: 'Hi' }, locale)} ${name},\n\n${baseText}`
}
