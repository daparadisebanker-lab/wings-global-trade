// src/lib/container/identity.ts
// Token identity for container members (decision 2026-07-06: no Supabase Auth).
// A member is an opaque `member_ref`. The signed token wrapping it is the
// "account" a browser presents to read its own workspace rows. HMAC-signed
// with CONTAINER_TOKEN_SECRET, verified in constant time — same trust model
// as the Mister rehydration secret, no new auth subsystem.

import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const SECRET =
  process.env.CONTAINER_TOKEN_SECRET ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? // dev fallback so the app boots without extra config
  'dev-insecure-container-secret'

interface TokenPayload {
  sub: string // member_ref
  cid: string // container_id (scopes the token to one container)
  iat: number
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

function sign(data: string): string {
  return b64url(createHmac('sha256', SECRET).update(data).digest())
}

/** Mint a member session token bound to one container. */
export function signMemberToken(memberRef: string, containerId: string): string {
  const payload: TokenPayload = { sub: memberRef, cid: containerId, iat: Date.now() }
  const body = b64url(Buffer.from(JSON.stringify(payload), 'utf8'))
  return `${body}.${sign(body)}`
}

/** Verify + decode a member token. Returns null on any tampering. */
export function verifyMemberToken(token: string | undefined | null): TokenPayload | null {
  if (!token || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null

  const expected = sign(body)
  const a = fromB64url(sig)
  const b = fromB64url(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(fromB64url(body).toString('utf8')) as TokenPayload
    if (!payload.sub || !payload.cid) return null
    return payload
  } catch {
    return null
  }
}

/** A fresh opaque member identity. */
export function newMemberRef(): string {
  return `m_${b64url(randomBytes(12))}`
}

/** Unguessable invite token for the /g/{token} share URL. */
export function newInviteToken(): string {
  return b64url(randomBytes(9)) // 12 url-safe chars
}

/**
 * Human short code for the wa.me text and ops references, e.g. "AQP-4417".
 * `hint` is an optional 2-4 letter geographic/route prefix.
 */
export function newShortCode(hint?: string): string {
  const prefix = (hint ?? 'WGT').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'WGT'
  const n = 1000 + Math.floor(Math.random() * 9000)
  return `${prefix}-${n}`
}
