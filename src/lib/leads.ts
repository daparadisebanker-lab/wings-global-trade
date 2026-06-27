// src/lib/leads.ts
// Server-side lead persistence helpers. Inserts via service role key.
// When Supabase is unconfigured, returns a synthetic id so dev flows work.

import { createServiceClient } from '@/lib/supabase/server'
import type { LeadFlow } from '@/types/database'

export interface LeadInsert {
  flow: LeadFlow
  full_name: string
  company?: string | null
  email: string
  phone: string
  destination_country: string
  product_id?: string | null
  product_name_snapshot?: string | null
  quantity?: string | null
  message?: string | null
  mister_project_id?: string | null
  source_url?: string | null
  user_agent?: string | null
  ip_country?: string | null
}

/** Insert a lead. Throws on real DB errors so the route returns 500. */
export async function insertLead(input: LeadInsert): Promise<string> {
  const supabase = createServiceClient()
  if (!supabase) {
    // Dev fallback — no DB configured.
    const id = crypto.randomUUID()
    console.info('[leads] (dev — no Supabase) lead would be inserted:', { id, ...input })
    return id
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({
      flow: input.flow,
      full_name: input.full_name,
      company: input.company ?? null,
      email: input.email,
      phone: input.phone,
      destination_country: input.destination_country,
      product_id: input.product_id ?? null,
      product_name_snapshot: input.product_name_snapshot ?? null,
      quantity: input.quantity ?? null,
      message: input.message ?? null,
      mister_project_id: input.mister_project_id ?? null,
      source_url: input.source_url ?? null,
      user_agent: input.user_agent ?? null,
      ip_country: input.ip_country ?? null,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(`Lead insert failed: ${error?.message ?? 'unknown'}`)
  }
  return data.id as string
}
