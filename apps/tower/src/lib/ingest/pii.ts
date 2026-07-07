// src/lib/ingest/pii.ts
// The PII-shape guard for POST /api/ingest (root CLAUDE.md Directive 6 /
// TOWER #6: "Events carry no PII... Reject email/phone-shaped payloads at
// ingest"). This is a SHAPE detector, not a validator — it fails closed on the
// faintest whiff of contact data anywhere in the payload, including inside
// `meta`. The ingest route scans the RAW request body string with this before
// the event is ever written, so PII smuggled into an unexpected field is still
// caught.
//
// Precision over recall is deliberate: a false positive rejects one event; a
// false negative permanently writes an email into an append-only anonymous
// store. When unsure, reject.

// An email: something@something.tld. Kept simple and broad on purpose.
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/

// A phone number: an optional +, then 7+ digits that may be broken up by
// spaces, dashes, dots, or parens. Matches "+51 987 654 321", "(305) 555-0142",
// "987654321" — but not a short id or a 4-digit year in isolation. `session_hash`
// is excluded from this scan (it's hash-alphabet only and can be long-numeric).
const PHONE_RE = /\+?\d[\d\s().-]{6,}\d/

export type PiiKind = 'email' | 'phone'

/**
 * Scan an arbitrary string for email/phone shapes. Returns the first kind
 * found, or null. Used on the raw request body (minus the session_hash value,
 * which the caller strips) so no field can hide contact data.
 */
export function detectPiiShape(text: string): PiiKind | null {
  if (EMAIL_RE.test(text)) return 'email'
  if (PHONE_RE.test(text)) return 'phone'
  return null
}

/**
 * Whole-payload guard. `sessionHash` (if known) is blanked out of the scanned
 * text first: it's a legitimately long, possibly all-numeric token that the
 * phone heuristic would otherwise flag. Everything else in the raw body is fair
 * game — a `meta.phone` or an email in `path` trips this.
 */
export function bodyHasPiiShape(rawBody: string, sessionHash?: string): PiiKind | null {
  let scanned = rawBody
  if (sessionHash) {
    // Remove every occurrence of the exact session_hash token before scanning.
    scanned = scanned.split(sessionHash).join('')
  }
  return detectPiiShape(scanned)
}
