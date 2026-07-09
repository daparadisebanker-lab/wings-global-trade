// src/app/api/container/invite-event/route.ts
// Attribution beacon for the invite funnel (spec §5.4 viral coefficient).
// Called by the invite landing's client CTA (sendBeacon) with 'wa_started',
// and reusable for other client-side funnel events. Server-authoritative
// events (account_created, slot_reserved) are recorded inside the Mister
// onboarding flow, not here.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { recordInviteEvent } from '@/lib/container/access'

// Only client-observable funnel events may be posted from the browser.
const EventSchema = z.object({
  inviteId: z.string().uuid(),
  event: z.enum(['opened', 'wa_started']),
  meta: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = EventSchema.parse(body)
    await recordInviteEvent(data.inviteId, data.event, { meta: data.meta })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
    }
    console.error('[container/invite-event] failed', err)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
