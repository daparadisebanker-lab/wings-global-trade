// Screenshot intake sizing — the math, kept pure so it is unit-tested without a
// browser (the canvas work that uses it lives in the conversation component).
//
// WHY THIS EXISTS: a pasted screenshot used to travel at full resolution as
// base64 inside the server-action payload, and three different ceilings sat in
// the path, none of them agreeing:
//
//   · Next's server-action body limit — 1 MB by DEFAULT, and no override was set
//   · the app's own validator — advertised ~3.5 MB to the operator
//   · Vercel's serverless request-body cap — 4.5 MB, a platform hard limit
//
// So a phone screenshot over roughly 750 KB was rejected by the framework BEFORE
// askMister ran. The action never executed, its graceful catch never fired, and
// the operator got the dock's generic client-side failure — indistinguishable
// from a model error, and unfixable by retrying.
//
// Downscaling on the way in is the fix that removes the class rather than moving
// the ceiling: the vision model reads a 1,600px screenshot as well as a 3,000px
// one, the payload lands far inside every limit, and the call is faster and
// cheaper. The limits below are still aligned as defence in depth.

/** Longest edge, in px, a screenshot is downscaled to before sending. Comfortably
 *  above what the model needs to read WhatsApp/Alibaba text, far below what a
 *  modern phone captures. */
export const MAX_IMAGE_EDGE_PX = 1600

/** JPEG quality for the re-encode. Screenshots are text on flat colour; 0.85 is
 *  visually lossless at this scale and a fraction of a PNG's size. */
export const IMAGE_QUALITY = 0.85

/** What a downscaled screenshot is re-encoded as — one type, so the wire format
 *  is predictable and always in the vision API's accepted set. */
export const DOWNSCALED_MEDIA_TYPE = 'image/jpeg'

/**
 * Fit (width, height) inside a square of `maxEdge`, preserving aspect ratio.
 * An image already inside the box is returned unchanged — never upscale, that
 * would add bytes and no detail. Dimensions are rounded to whole pixels and
 * never below 1 (a canvas of 0 throws).
 */
export function fitWithin(
  width: number,
  height: number,
  maxEdge: number = MAX_IMAGE_EDGE_PX,
): { width: number; height: number; scaled: boolean } {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { width: 1, height: 1, scaled: false }
  }
  const longest = Math.max(width, height)
  if (longest <= maxEdge) return { width: Math.round(width), height: Math.round(height), scaled: false }
  const ratio = maxEdge / longest
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
    scaled: true,
  }
}

/** Decoded byte length of a base64 string (padding-aware) — what the size guards
 *  actually care about, since base64 inflates by 4/3. */
export function base64Bytes(base64: string): number {
  const len = base64.length
  if (len === 0) return 0
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.max(0, (len * 3) / 4 - padding)
}
