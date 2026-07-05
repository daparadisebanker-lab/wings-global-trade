// src/lib/mister/rehydration.ts
// Server-side helpers for the session rehydration secret (audit review M2).
// The client holds a 32-byte random token; the DB stores only its SHA-256.
// Server-side only — imports node:crypto.

import { createHash, timingSafeEqual } from 'node:crypto'

/** 32 random bytes, hex-encoded by the client. */
export const REHYDRATION_TOKEN_PATTERN = /^[a-f0-9]{64}$/

/** SHA-256 hex digest of a client-held rehydration token. */
export function hashRehydrationToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

/**
 * Constant-time comparison of a presented token against the stored hash.
 * Returns false for malformed inputs rather than throwing.
 */
export function verifyRehydrationToken(
  token: string,
  storedHash: string | null | undefined,
): boolean {
  if (!storedHash || !REHYDRATION_TOKEN_PATTERN.test(token)) return false
  try {
    const presented = Buffer.from(hashRehydrationToken(token), 'hex')
    const stored = Buffer.from(storedHash, 'hex')
    if (presented.length !== stored.length) return false
    return timingSafeEqual(presented, stored)
  } catch {
    return false
  }
}
