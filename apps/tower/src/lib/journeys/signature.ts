// src/lib/journeys/signature.ts
// The committing rep's digital signature over the CIF snapshot (G1: the client
// sees the REAL number, signed by the rep who committed the quote from TOWER).
// HMAC-SHA256 over a canonical (rep, cif, currency, signed_at) string with a
// server secret — unforgeable without the secret, attributable to the rep, and
// tamper-evident (a changed figure fails verification). Not full PKI, but a real
// TOWER-side attestation. Server-only (node:crypto); secret injected so it tests.
import { createHmac, timingSafeEqual } from 'node:crypto'

export interface CommitmentPayload {
  signedBy: string // rep profile id (auth.uid)
  cifMinor: number // the signed figure, integer minor units
  currency: string
  signedAt: string // ISO timestamp
}

export interface Commitment extends CommitmentPayload {
  alg: 'HMAC-SHA256'
  sig: string // hex
}

function canonical(p: CommitmentPayload): string {
  // Stable field order; integer + ISO string only — no float, no locale.
  return `v1|${p.signedBy}|${p.cifMinor}|${p.currency}|${p.signedAt}`
}

export function signCommitment(payload: CommitmentPayload, secret: string): Commitment {
  const sig = createHmac('sha256', secret).update(canonical(payload)).digest('hex')
  return { ...payload, alg: 'HMAC-SHA256', sig }
}

/** Constant-time verify that a stored commitment matches its signed figure. */
export function verifyCommitment(commitment: Commitment, secret: string): boolean {
  const expected = createHmac('sha256', secret)
    .update(canonical(commitment))
    .digest('hex')
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(commitment.sig ?? '', 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}
