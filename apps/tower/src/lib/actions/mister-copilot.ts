'use server'

// Mister copilot server action — the one mutation-law-shaped entry the dock
// calls. auth → validate → compute. It never writes state (container-fit is
// read/compute only), so there's no draft and no RLS write; the auth gate is
// just "is there a session". Errors degrade to a graceful text reply so the
// dock always renders a bubble rather than surfacing a raw failure.

import { createServerSupabase } from '@/lib/supabase/server'
import { getIntelligenceClient } from '@/lib/ai/client'
import { routeAndRun } from '@/lib/copilot/router'
import { textResult, type Attachment, type CanvasContext, type CopilotResult } from '@/lib/copilot/types'
import { ok, fail, type ActionResult } from './result'

// Vision guardrails: accepted image types and a cap on the decoded payload so a
// pasted screenshot can't balloon the request. 5 MB of base64 ≈ 3.75 MB image.
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_IMAGE_BASE64 = 5_000_000

export async function askMister(
  text: string,
  attachment?: Attachment,
  context?: CanvasContext,
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
      return fail('VALIDATION', 'Imagen demasiado grande / Image too large (máx. ~3.5 MB)')
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
    return ok(await routeAndRun(client, trimmed, attachment, context))
  } catch (err) {
    console.error('[mister:askMister]', err)
    return ok(textResult('No pude procesarlo ahora — intenta de nuevo. / Could not process that — try again.'))
  }
}
