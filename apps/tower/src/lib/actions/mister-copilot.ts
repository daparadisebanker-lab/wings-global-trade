'use server'

// Mister copilot server action — the one mutation-law-shaped entry the dock
// calls. auth → validate → compute. It never writes state (container-fit is
// read/compute only), so there's no draft and no RLS write; the auth gate is
// just "is there a session". Errors degrade to a graceful text reply so the
// dock always renders a bubble rather than surfacing a raw failure.

import { createServerSupabase } from '@/lib/supabase/server'
import { getIntelligenceClient } from '@/lib/ai/client'
import { routeAndRun } from '@/lib/copilot/router'
import { textResult, type CopilotResult } from '@/lib/copilot/types'
import { ok, fail, type ActionResult } from './result'

export async function askMister(text: string): Promise<ActionResult<CopilotResult>> {
  const trimmed = (text ?? '').trim()
  if (!trimmed) return fail('VALIDATION', 'Escribe algo / Type something')
  if (trimmed.length > 2000) return fail('VALIDATION', 'Mensaje demasiado largo / Message too long')

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
    return ok(await routeAndRun(client, trimmed))
  } catch (err) {
    console.error('[mister:askMister]', err)
    return ok(textResult('No pude procesarlo ahora — intenta de nuevo. / Could not process that — try again.'))
  }
}
