// src/lib/ingest/hmac.ts
// Per-brand HMAC verification for POST /api/ingest (API_MAP: "X-Wings-Signature
// (HMAC-SHA256 of body, per-brand key)"; ARCHITECTURE ADR-5). Each site signs
// its events with ITS OWN key — `INGEST_HMAC_KEY_WINGS` / `INGEST_HMAC_KEY_ALADIN`
// — so a compromised Wings key can never forge Áladín events (brand isolation,
// ecosystem CLAUDE.md §5.5 "Data separation").
//
// Reuses `verifyRevalidateSignature` (lib/revalidate.ts) — the codebase's stable
// constant-time `sha256=<hex>`-over-raw-body HMAC helper — one per brand key.
// The signature is verified BEFORE the body is parsed (the route calls this on
// the raw text), so an unsigned/forged request is rejected before any work.
import { verifyRevalidateSignature } from '@/lib/revalidate'
import { INGEST_BRANDS, type IngestBrand } from './schema'

/** Env var holding each brand's ingest signing secret. */
function brandKeyEnv(brand: IngestBrand): string {
  return `INGEST_HMAC_KEY_${brand.toUpperCase()}`
}

function brandSecret(brand: IngestBrand): string | undefined {
  // BOM guard mirrors lib/supabase/server.ts — PowerShell pipe encoding can
  // prepend U+FEFF to an env var and silently break every signature.
  const raw = process.env[brandKeyEnv(brand)]
  if (!raw) return undefined
  return raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
}

export type IngestAuthOutcome =
  | { ok: true; brand: IngestBrand }
  | { ok: false }

/**
 * Verify the `X-Wings-Signature` header against the raw body under EVERY
 * configured brand key, returning which brand's key matched. Trying all keys
 * lets the route authenticate before parsing the body (the brand claim inside
 * the body isn't trusted yet); the route then asserts the parsed `brand` equals
 * the brand whose key actually verified, closing the cross-brand gap.
 *
 * Fails closed: no configured keys, no header, or no match → { ok: false }.
 * Constant-time per key (delegated to verifyRevalidateSignature).
 */
export function verifyIngestSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
): IngestAuthOutcome {
  if (!signatureHeader) return { ok: false }
  for (const brand of INGEST_BRANDS) {
    const secret = brandSecret(brand)
    if (!secret) continue
    if (verifyRevalidateSignature(rawBody, signatureHeader, secret)) {
      return { ok: true, brand }
    }
  }
  return { ok: false }
}
