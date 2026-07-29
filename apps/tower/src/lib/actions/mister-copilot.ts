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
import { classifyError, resilient, type CallOutcome, type FailureClass } from '@/lib/ai/resilience'
import { textResult, type Attachment, type CanvasContext, type CopilotResult } from '@/lib/copilot/types'
import { ok, fail, type ActionResult } from './result'

/** The whole ask's budget, shared across its model calls. Under the dock's 45s
 *  client watchdog so the SERVER gives up first and the operator gets a real
 *  message instead of the generic client-side timeout. */
const ASK_BUDGET_MS = 38_000

/** What the operator reads when an ask fails, by cause. A rate limit is transient
 *  and worth retrying; a bad payload is not, and telling someone to "try again"
 *  when it cannot work wastes their time and our capacity. */
function operatorMessageFor(failure: FailureClass): string {
  switch (failure) {
    case 'rate_limit':
    case 'overloaded':
      return 'Mister está saturado en este momento — espera unos segundos y vuelve a intentar. / Mister is at capacity — wait a few seconds and try again.'
    case 'timeout':
      return 'Tardó demasiado. Prueba con un mensaje más corto o una captura más pequeña. / That took too long. Try a shorter message or a smaller screenshot.'
    case 'auth':
    case 'bad_request':
      return 'No pude procesarlo — hay un problema de configuración, avisa al equipo. / Could not process that — a configuration problem; tell the team.'
    default:
      return 'No pude procesarlo ahora — intenta de nuevo. / Could not process that — try again.'
  }
}

/** One structured line per ask. Aggregatable in the platform's log explorer:
 *  failure class, model-call count, retries, and wall time — the numbers you need
 *  to see saturation coming instead of hearing about it from an operator. */
function logAsk(entry: {
  ok: boolean
  started: number
  calls: CallOutcome[]
  hasImage: boolean
  renderer?: string
  failure?: FailureClass
}): void {
  const attempts = entry.calls.reduce((sum, c) => sum + c.attempts, 0)
  console.log(
    JSON.stringify({
      evt: 'mister.ask',
      ok: entry.ok,
      ms: Date.now() - entry.started,
      modelCalls: entry.calls.length,
      // > modelCalls means the wrapper absorbed a rate limit the operator never saw.
      attempts,
      retries: attempts - entry.calls.length,
      image: entry.hasImage,
      ...(entry.renderer ? { renderer: entry.renderer } : {}),
      ...(entry.failure ? { failure: entry.failure } : {}),
    }),
  )
}

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

  // ONE budget for the whole ask, shared by its (up to two) model calls. Each
  // used to get a fresh 40s behind a 45s client watchdog, so a slow pair could
  // burn 80s of server capacity producing an answer nobody was waiting for —
  // wasting exactly what is scarce under load. Sized just under the watchdog so
  // the server gives up first and returns a real message.
  const deadlineAt = Date.now() + ASK_BUDGET_MS
  const started = Date.now()
  const calls: CallOutcome[] = []
  const guarded = resilient(client, { deadlineAt, onOutcome: (o) => calls.push(o) })

  try {
    // Client-supplied context + conversation: validate at the trust boundary. The
    // context seeds a compute (numeric guards); the history only ever lands in a
    // prompt, so it is capped in shape and size (sanitizeHistory).
    const result = await routeAndRun(
      guarded,
      trimmed,
      attachment,
      sanitizeCanvasContext(context),
      sanitizeHistory(history),
    )
    logAsk({ ok: true, renderer: result.renderer, started, calls, hasImage: Boolean(attachment) })
    return ok(result)
  } catch (err) {
    const failure = classifyError(err)
    // Structured, aggregatable — `console.error(err)` could not tell a rate limit
    // from a timeout from a bad payload, which is precisely what you need to know
    // when the main workflow starts failing under load.
    logAsk({ ok: false, failure, started, calls, hasImage: Boolean(attachment) })
    return ok(textResult(operatorMessageFor(failure)))
  }
}
