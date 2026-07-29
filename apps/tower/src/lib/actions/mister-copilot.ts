'use server'

// Mister copilot server action — the one mutation-law-shaped entry the dock
// calls. auth → validate → compute. It never writes state (container-fit is
// read/compute only), so there's no draft and no RLS write; the auth gate is
// just "is there a session". Errors degrade to a graceful text reply so the
// dock always renders a bubble rather than surfacing a raw failure.

import { createServerSupabase } from '@/lib/supabase/server'
import { getIntelligenceClient } from '@/lib/ai/client'
import { routeAndRun } from '@/lib/copilot/router'
import { sanitizeCanvasContext } from '@/lib/copilot/context-guard'
import { sanitizeHistory, type Turn } from '@/lib/copilot/history'
import { textResult, type Attachment, type CanvasContext, type CopilotResult } from '@/lib/copilot/types'
import { ok, fail, type ActionResult } from './result'

// Vision guardrails: accepted image types and a cap on the decoded payload so a
// pasted screenshot can't balloon the request.
//
// This cap has to sit UNDER the server-action body limit (next.config.mjs, 4 MB),
// which itself sits under Vercel's 4.5 MB request-body cap — otherwise the
// framework rejects the request before this validator ever runs and the operator
// gets an opaque client-side failure instead of the clear message below. It used
// to be 5 MB of base64 against a 1 MB default limit, so the advertised maximum
// was a fiction. 3.5 M base64 chars ≈ 2.5 MB of image, leaving room for the
// text, the conversation and encoding overhead.
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_IMAGE_BASE64 = 3_500_000

export async function askMister(
  text: string,
  attachment?: Attachment,
  context?: CanvasContext,
  history?: Turn[],
): Promise<ActionResult<CopilotResult>> {
  const trimmed = (text ?? '').trim()
  // With an image, text is optional (the screenshot is the payload).
  if (!trimmed && !attachment) return fail('VALIDATION', 'Escribe algo / Type something')
  if (trimmed.length > 2000) return fail('VALIDATION', 'Mensaje demasiado largo / Message too long')

  if (attachment) {
    if (!ALLOWED_IMAGE_TYPES.includes(attachment.mediaType)) {
      return fail('VALIDATION', 'Formato de imagen no soportado / Unsupported image format')
    }
    if (
      typeof attachment.dataBase64 !== 'string' ||
      attachment.dataBase64.length === 0 ||
      attachment.dataBase64.length > MAX_IMAGE_BASE64
    ) {
      return fail('VALIDATION', 'Imagen demasiado grande / Image too large (máx. ~2.5 MB)')
    }
  }

  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')

  const client = getIntelligenceClient()
  if (!client) {
    return ok(
      textResult(
        'Mister aún no está conectado en este entorno. / Mister is not connected in this environment yet.',
      ),
    )
  }

  try {
    // Client-supplied context + conversation: validate at the trust boundary. The
    // context seeds a compute (numeric guards); the history only ever lands in a
    // prompt, so it is capped in shape and size (sanitizeHistory).
    return ok(
      await routeAndRun(client, trimmed, attachment, sanitizeCanvasContext(context), sanitizeHistory(history)),
    )
  } catch (err) {
    console.error('[mister:askMister]', err)
    return ok(textResult('No pude procesarlo ahora — intenta de nuevo. / Could not process that — try again.'))
  }
}
