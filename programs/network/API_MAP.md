# Wings Network — API Map

Server Actions carry authenticated portal/site mutations; HTTP routes exist only where external systems (n8n, Stripe, Mister clients) need them. Every payload validates through `src/lib/schemas/` Zod schemas — the schemas below are the contract.

## Server Actions (`src/actions/`)

| Action | Auth | Input (Zod) | Effect |
|---|---|---|---|
| `createApplication` | anon + rate-limit | `ApplicationSchema {companyName, contactName, email, whatsapp?, country?, categoriesText[], catalogUrl?, message?}` | insert `applications` → fires n8n W-M1 |
| `createDemandRequest` | anon + rate-limit | `DemandRequestSchema {needText(10–1000), categoryGuess?, volumeSignal?, buyerRef?}` | insert `demand_gaps(source='request_form')` + embed async → W-M2 |
| `upsertListing` | supplier | `ListingSchema {title, categoryId, spec, laneIds[], unitCbm, leadTimeDays, publishState}` | RLS-scoped upsert; publish guarded by DB trigger |
| `reserveSlot` | supplier (flag: portal) | `SlotReservationSchema {containerId, volumeCbm, goodsRef}` | capacity check in tx → insert `slots` → W-M5 notify |
| `respondToLead` | supplier | `{leadId, action: 'contacted'\|'declined'}` | update `routed_leads.outcome` (RLS-scoped) |
| `updateApplicationStatus` / `setVerification` / `setTier` | ops (service role via admin UI) | — | state changes → audit triggers → W-M3 |

## HTTP Routes

### Mister (`/api/mister/*`)
```
POST /api/mister/chat            existing endpoint, extended
  Streaming (SSE). Tools available to the model:
    match_supply(category_id, lane_id?, min_tier)   → RPC (SQL filters first)
    search_direct(query)                            → existing Direct catalog
    get_fill_state(lane_id?)                        → containers_fill_view
    log_routed_lead(RoutedLeadEvent)                → validated write
    log_demand_gap(DemandGapEvent)                  → branch-4 capture
  Routing precedence enforced in orchestration code, not prompt alone:
  direct → network → near_match → no_match. Direct wins ties.
```

**RoutedLeadEvent (the attribution spine — schema-validated, retry-once, else human handoff):**
```json
{
  "buyer_context": {"session_ref":"str","archetype_lane":"price_group|spec_technical|urgency|relationship_repeat|exploratory","history_summary":"str"},
  "need": {"summary":"str","category_id":"uuid","volume_signal":"str?","urgency":"container_cutoff|standard"},
  "resolution": {"branch":"direct|network|near_match|no_match","supplier_id":"uuid|null","tier_at_route":"str|null","candidates_considered":["uuid"]},
  "handoff": {"channel":"whatsapp_deeplink","wings_cc":true}
}
```

### Marketplace (`/api/marketplace/*`) — portal backend, flag-gated
```
GET  /api/marketplace/fill-meter?lane=…     public, cached 30s, reads fill view
GET  /api/marketplace/statements/:period    supplier-auth; projection over fee_events
GET  /api/marketplace/performance           supplier-auth; funnel from routed_leads+shipments
```

### Webhooks — n8n (`/api/webhooks/n8n/*`) — HMAC `x-wings-signature` on every call
```
INBOUND  (n8n → app):
POST /container-state      {containerId, toState}          → guarded transition
POST /shipment-state       {shipmentId, toState, inspection?}
POST /fee-batch            {supplierId, fees:[{type,amount,currency,shipmentId?,memo}]}
                            → append-only fee_events (server recomputes nothing)
OUTBOUND (app → n8n, fired by actions/DB webhooks):
application.created → W-M1 · demand_gap.created → W-M2 ·
verification.changed → W-M3 · routed_lead.created(branch=network) → W-M4 ·
container.state_changed / slot.created → W-M5 · cron → W-M6/7/8
```

### Stripe (`/api/webhooks/stripe`) — flag: stripe_billing
`customer.subscription.{created,updated,deleted}` → map price→tier → `setTier` + subscription `fee_events`. Signature verified; idempotency by event id.

## Error Contract
All routes: `{error: {code, message_es, message_en}}`, HTTP-correct status, Sentry capture with request id; raw provider errors never pass through. Rate limits: 429 + `Retry-After`.
