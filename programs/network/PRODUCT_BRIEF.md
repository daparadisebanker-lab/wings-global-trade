# Wings Network — Product Brief

## The Idea
Wings Global Trade owns two assets no software competitor has: corridor buyers' trust and physical container consolidation through ZOFRATACNA/ZOFRI. Wings Network monetizes both — third-party suppliers subscribe for presence (Alibaba logic) and pay commission where goods physically move through Wings containers (Amazon logic, uncircumventable because the rail is physical).

## The Atomic Unit
The container slot — not the product listing. Every listing carries lane metadata; every order is a slot reservation; the fill-meter is the shared hero object (buyer CTA: "68% full — trae tu grupo" / supplier CTA: "this lane fills every 9 days — book your slot").

## The Core Loop
1. Buyer asks Mister for something ("Oiga, Mister") or browses the catalog
2. Mister diagnoses need via the five archetype lanes → resolves supply: **Direct → Network(verified) → near-match → demand-gap capture** (never dead-ends, never invents)
3. Network match → lead routed to supplier via WhatsApp deep-link (Wings CC'd), `routed_lead` event logged for attribution
4. Deal forms → supplier reserves container slot(s) → goods hit the consolidation point → inspection checkpoint → container fills (fill-meter moves publicly)
5. Fees captured at the rail: consolidation fee (volume) + commission (value, tier-banded) — one invoice
6. No match → demand-gap record → weekly triage → supplier recruitment with demand receipts → category opens → loop widens

## User Roles
### Buyer (existing Wings customer)
- Corridor importers; five Mister archetype lanes (price/group, spec/technical, urgency, relationship/repeat, exploratory)
- Success: more of their needs answered by one trusted counterpart, same pricing logic, faster-filling containers
- **Buyer-side pricing never changes. Buyer trust is never collateral in a supplier dispute.**

### Supplier (the new customer)
- Segments: (1) Wings' existing sourcing relationships, (2) regional distributors/brands wanting corridor reach, (3) export manufacturers, (4) inbound long tail
- Success: qualified corridor leads + container access without building logistics/trust from zero
- Tiers: T0 Listed (free) → T1 Verified → T2 Network (Mister routing) → T3 Corridor Partner

### Wings Ops (internal)
- Runs verification, dispute ladder, concierge shipments; lives in Notion + n8n reports; portal admin views Phase 2+

## Key Features — Build Now (Phase 0 surfaces LIVE)
- **Vende con Wings** landing: value prop, anonymized demand receipts, founder-supplier offer, application form → W-M1 intake
- **Request-a-product**: structured "couldn't find it? tell Mister" flow → `demand_gaps` (the marketplace's demand sensor and the supplier sales deck)
- Mister `no_match` logging (branch 4) wired into the same table
- Supabase Phase-0 slice: suppliers, contacts, applications, demand_gaps (+ full schema migrated but dormant)

## Build Now, Ship DARK (Phase 2 surfaces, feature-flagged off)
- Badged Network catalog integration + filters (Direct only / All verified / category / lane)
- Supplier portal MVP: listings manager, lead inbox, container slot booking, billing statements, performance funnel
- Mister routing matrix live per-category flags + eval suite
- Stripe subscription billing; fee_events statement generation
- Two-sided fill-meter component

## Explicitly NOT Built (FUTURE ring — do not scaffold)
- Escrow/payments custody, financing, fulfillment, data products
- In-app messaging, RFQ engine, storefront customization, analytics suites
- Supplier-side Mister instance (architected for in prompts/permissions, not implemented)

## Success Metrics
- **Container fill time** (median days open→full, per lane) — the one metric; must flatten or fall as Network supply grows
- Phase 0: demand-gap requests/week by category (ranking stability); ≥25 applications
- Phase 2: routed lead → shipment conversion; supplier NRR; MRR ≥ marketplace fixed ops cost; request-serve rate ≥70% in open categories

## Constraints
- Extends live production repo `daparadisebanker-lab/wings-global-trade` — zero regression tolerance on existing buyer surfaces
- One design language (Wings tokens); supplier portal is denser/data-forward but same world
- Spanish-first UI (buyer + Vende surfaces), English secondary; portal bilingual via existing next-intl pattern
- Channel-conflict doctrine in code: reserved-line categories block Network listings; Direct outranks in ties; supplier sales data never feeds Direct sourcing decisions
