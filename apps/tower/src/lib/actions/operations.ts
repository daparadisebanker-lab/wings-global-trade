'use server'

// Operations snapshot — exact point-in-time operational state for the cockpit.
// Every field is a `count: 'exact', head: true` on an existing tower.* table via
// the RLS-scoped authenticated client (same client + guarantee as the catalog
// reads and the containers exact-count): RLS is the scope boundary, so a plain
// count already means "across everything this operator may see". No sums, no
// joins, no migration.
//
// Point-in-time STATE → deliberately NO deltas: there is no prior-window baseline
// table for these counts, and a synthesized delta would be a fabricated number. A
// genuine 0 is real information and is shown honestly.
//
// Predicates verified against the live CHECK constraints / status validators:
//   containers.status  ∈ OPEN|FILLING|BOOKED|IN_TRANSIT|ARRIVED|CLEARED|CLOSED
//   quotes.status      ∈ DRAFT|SENT|ACCEPTED|REJECTED|EXPIRED
//   products.status    ∈ DRAFT|IN_REVIEW|PUBLISHED|RETIRED (we count PUBLISHED)
//   ai_drafts.status   ∈ DRAFT|APPROVED|REJECTED ; kind ∈ …|TRIAGE
//   rb_slot_allocations.status  ∈ RESERVED|CONFIRMED|LOADED|RELEASED
//   represented_brands.status   ∈ PROSPECT|NEGOTIATION|SIGNED|ONBOARDING|BRAND_REVIEW|LIVE
//   rb_containers.shipping_phase ∈ EN_ORIGEN|…|EN_TRANSITO|…
// rfqs.stage is bare, archetype-specific text (no universal "open" cut exists) →
// counted as a total, labelled as such — never a guessed stage slice.
import { createServerSupabase } from '@/lib/supabase/server'

// A count is `number` when the query resolved (a genuine 0 included), or `null`
// when the query itself failed — rendered as "—", never as a false exact 0.
export interface OperationsSnapshot {
  // Lane tenancy (RLS via has_lane_role)
  containersInTransit: number | null
  containersFilling: number | null
  quotesAwaiting: number | null
  rfqsTotal: number | null
  productsPublished: number | null
  triageBacklog: number | null
  clientsTotal: number | null
  // Represented-brand tenancy (RLS via has_rb_role); null when not queried
  rbContainersInTransit: number | null
  rbReservationsLive: number | null
  rbBrandsLive: number | null
}

export type OperationsSnapshotResult =
  | { ok: true; snapshot: OperationsSnapshot }
  | { ok: false; reason: 'UNAVAILABLE' }

type CountResult = { count: number | null; error: unknown }

/** `includeRb` toggles the 3 represented-brand counts. The home passes `true` (it
 *  can't cheaply know RB membership inside its Promise.all wave); the counts are
 *  RLS-scoped to 0 for non-RB operators and the band only renders RB tiles when
 *  `marcas` is visible, so the extra head-counts are harmless. */
export async function getOperationsSnapshot(
  opts: { includeRb?: boolean } = {},
): Promise<OperationsSnapshotResult> {
  const base = await createServerSupabase()
  if (!base) return { ok: false, reason: 'UNAVAILABLE' }
  const {
    data: { user },
  } = await base.auth.getUser()
  if (!user) return { ok: false, reason: 'UNAVAILABLE' }
  const db = base.schema('tower')

  // A head:true exact count — no rows returned, just the RLS-scoped total.
  const count = (table: string) => db.from(table).select('*', { count: 'exact', head: true })
  // A failed query resolves to null (rendered "—"), NEVER 0 — a false exact 0 is
  // as dishonest as a fabricated number. An RLS-scoped empty result is a real 0.
  const n = (r: CountResult | undefined): number | null => (!r || r.error ? null : r.count ?? 0)

  const nowIso = new Date().toISOString()
  const laneQueries = [
    count('containers').eq('status', 'IN_TRANSIT'),
    count('containers').in('status', ['OPEN', 'FILLING']),
    count('quotes').eq('status', 'SENT'),
    count('rfqs'),
    count('products').eq('status', 'PUBLISHED'),
    count('ai_drafts').eq('status', 'DRAFT').eq('kind', 'TRIAGE'),
    count('accounts'),
  ]

  // RB reservations = the canonical tower.rb_slots_taken math (rb_wave1): count
  // CONFIRMED/LOADED unconditionally, and RESERVED only while unexpired. Confirmed
  // rows keep their original expires_at, so guarding all three would under-count.
  const rbQueries = opts.includeRb
    ? [
        count('rb_containers').eq('shipping_phase', 'EN_TRANSITO'),
        count('rb_slot_allocations').or(
          `status.in.(CONFIRMED,LOADED),and(status.eq.RESERVED,or(expires_at.is.null,expires_at.gt.${nowIso}))`,
        ),
        count('represented_brands').eq('status', 'LIVE'),
      ]
    : []

  const results = (await Promise.all([...laneQueries, ...rbQueries])) as CountResult[]
  const [inTransit, filling, quotes, rfqs, products, triage, clients] = results
  const rb = opts.includeRb ? results.slice(7) : []

  return {
    ok: true,
    snapshot: {
      containersInTransit: n(inTransit),
      containersFilling: n(filling),
      quotesAwaiting: n(quotes),
      rfqsTotal: n(rfqs),
      productsPublished: n(products),
      triageBacklog: n(triage),
      clientsTotal: n(clients),
      rbContainersInTransit: n(rb[0]),
      rbReservationsLive: n(rb[1]),
      rbBrandsLive: n(rb[2]),
    },
  }
}
