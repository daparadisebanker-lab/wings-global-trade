# BUILD PROMPT — Wings Network
*Paste into Claude Code at the root of `wings-global-trade`. Spec folder must sit at `./programs/network/`. Waves are sequential; each ends with its gate green before the next begins.*

---

You are building **Wings Network**, the marketplace layer of Wings Global Trade, inside this existing production repo. Read, in order: `programs/network/CLAUDE.md`, `PRODUCT_BRIEF.md`, `ARCHITECTURE.md`, `API_MAP.md`, `COMPONENT_TREE.md`, `DESIGN_SYSTEM.md`. Merge CLAUDE.md's rules into the repo's CLAUDE.md (Non-Negotiables win all conflicts). Then execute:

## WAVE 1 — Foundation (schema, tokens, flags)
1. Split `DATABASE_SCHEMA.sql` into ordered migrations under `supabase/migrations/`; apply to a branch database first; generate TypeScript types.
2. Write `pnpm test:rls`: as supplier A's JWT, attempt reads on supplier B's listings/leads/fees — all must fail; anon can read published listings + fill view only; `fee_events` rejects UPDATE/DELETE for every role.
3. Extract design tokens per DESIGN_SYSTEM.md Step 1 into `tokens.css` + Tailwind theme. Build `lib/money` (Big.js, formatters, tests incl. rounding edges). Build `lib/flags.ts` (edge-cached reads).
**GATE: migrations apply clean · RLS tests green · `pnpm build` green · zero diffs on existing routes' rendered output.**

## WAVE 2 — Phase 0 surfaces (ship LIVE)
1. `/vende` landing + `/vende/aplicar` (ApplicationForm → `createApplication` → n8n W-M1 webhook out, HMAC-signed). Brand-forward per DESIGN_SYSTEM; Spanish-first; demand-receipt section reads aggregated `demand_gaps` counts (safe empty state pre-data).
2. `/solicita` Request-a-product (DemandRequestForm → `createDemandRequest`; async embedding via haiku pipeline).
3. Wire Mister branch-4: `log_demand_gap` tool added to the existing agent with schema validation.
4. Rate limits (Upstash) on both anon actions; Sentry + PostHog events (`application_submitted`, `demand_request_created`).
**GATE: Playwright e2e (apply + request happy/error paths) green · Lighthouse ≥ 90 perf/a11y on /vende · deploy to production.**

## WAVE 3 — Catalog + FillMeter (ship DARK behind `network_catalog`)
1. FillMeter component (full DESIGN_SYSTEM spec: realtime channel, GSAP tween, reduced-motion, static render mode) + `/api/marketplace/fill-meter`.
2. `/red` catalog: badged grid, filters (Direct-only/verified/category/lane), listing detail + SpecSheet from `listings.spec`; tie-order Direct-first implemented in the query layer with a test proving it.
**GATE: flag off = zero footprint on prod · flag on (preview) = full flows green · visual review artifact (screenshots) committed.**

## WAVE 4 — Portal MVP (ship DARK behind `portal`)
1. Supabase Auth magic-link flow → `supplier_contacts.auth_user_id` link; PortalShell.
2. Listings manager (PublishChecklist surfaces the DB guard reasons in plain Spanish) · LeadInbox (`respondToLead`, SLA timer, WhatsApp deep-link w/ Wings CC) · Containers (LaneBoard, SlotPicker → `reserveSlot` with transactional capacity check + test for oversell race) · Billing (StatementTable projecting `fee_events`) · Overview funnel.
3. `/api/webhooks/n8n/*` inbound handlers (container-state, shipment-state, fee-batch) with HMAC verification tests.
**GATE: `pnpm test` + RLS + e2e portal suite green · a race-condition test on slot capacity passes · flag off = invisible.**

## WAVE 5 — Mister routing (DARK per-category flags) + evals
1. Implement tools per API_MAP (`match_supply` RPC call, `search_direct`, `get_fill_state`, `log_routed_lead`); orchestration enforces precedence direct→network→near_match→no_match in code; lane-conditioned instruction blocks per PRODUCT_BRIEF scenarios.
2. Build `evals/mister/`: 5 lanes × 4 branches + adversarial set (reserved-line probe, unverified bait, hallucinated-supply trap, tie-break test). `pnpm eval:mister` runs the matrix against fixtures; CI-gated.
3. W-M4 outbound webhook on `routed_lead(branch=network)`.
**GATE: eval suite ≥ threshold on every branch · zero eval case where an ineligible supplier is surfaced · routing flag off in prod.**

## WAVE 6 — Billing + hardening
1. Stripe subscriptions behind `stripe_billing` (webhook → tier mapping, idempotent) · subscription fee_events.
2. Security pass: CI grep for service-key leakage · webhook signature tests · rate-limit coverage report · Sentry PII scrub check · a11y CI (token contrast, axe on key pages).
3. README-DEPLOY.md: flags runbook (how to open a category, suspend a supplier, launch the portal) — operations as one-row changes, documented.
**FINAL GATE: full CI green · production deploy · Phase 0 live, Phases 2 surfaces dark and one flag away.**

Throughout: conventional commits per feature · never leave a TODO unflagged · `pnpm build && pnpm test` before declaring anything done · if an instruction conflicts with production reality in the existing repo, prefer the repo's pattern and log the deviation in `programs/network/DEVIATIONS.md`.
