# TOWER · HANDOVER.md

Ops sign-off handover for TOWER (`apps/tower`), the internal CRM+ERP+PIM+analytics
app on the Wings Global Trade monorepo. Drafted at base `8ace280` (Wave 4) by the
W5.C QA agent; updated by the Conductor at Wave 5 synthesis (2026-07-07, all five
waves complete). Companion docs: `WAVE5_QA_FINDINGS.md` (QA sweep + Conductor
resolutions), `PARITY_MAP.md` (wings-operations parity).

Deployment target: `tower.wingsglobaltrade.com` — separate Vercel app, same
Supabase project `pyznlglvwihosemqkhtq`, schema `tower`.

---

## 1 · What shipped, per wave

From `DECISIONS.log.md` (D-01…D-26) and git history
(`e39311f`→`99fd27a`→`aba3ff7`→`380daf1`→`8ace280`):

**Wave 1 — Foundation (`e39311f`).**
Schema `tower` applied to prod; audit trigger + monthly `events` partitions +
rollup-refresh cron; RLS on all domain tables (products template mapped per role);
RLS test harness green (`migration/rls_test.sql`, D-08); grants added as migration 11
(D-06); analytics tables service-role-only (D-04); append-only enforced (D-05);
`apps/tower` scaffold (App Router, Supabase auth, TowerShell + LaneSwitcher + NavRail
+ ⌘K + notifications stub); `lib/archetypes` config module (all six archetypes);
catalog import — 99 `public.products` → `tower.products`, reconciled exactly (D-09).

**Wave 2 — Catalog Studio (`99fd27a`).**
Schema-driven SpecForm (Zod→JSON-Schema), ProductTable/Editor, MediaManager (signed
uploads), VersionHistory + rollback, PublishBar (DRAFT→IN_REVIEW→PUBLISHED),
publish→`product_versions` snapshot + Vercel revalidation webhook,
`/api/public/catalog/*`. 6 archetype spec schemas + private `product-media` bucket
seeded (D-12). 93 tests green (D-14).

**Wave 3 — Pipeline + Container Desk (`380daf1`, money helper `aba3ff7`).**
PipelineBoard (archetype stage columns), RFQ detail + LineItems (lane unit math),
ConversationPane (Mister + WhatsApp merged), QuoteComposer (server-computed integer
totals), convertToOrder; Container Desk (ContainerBoard, atomic `commit_container_cbm`
= migration 14, POPanel + QC, DocumentVault w/ signed URLs, CostSheet),
`/api/public/fill/*`; hooks `/api/hooks/{mister,whatsapp}` (+ `whatsapp_messages` =
migration 15). 163 tests green; over-commit rejection proven (D-19).

**Wave 4 — Signals + Intelligence (`8ace280`).**
`/api/ingest` (HMAC → shape → PII-reject → rate-limit); Signal Deck (rollup-only:
LanePulse/Funnel/Leaderboard/FillWatch/SourceSplit) + group cross-lane view;
Intelligence `/api/ai/{triage,score,spec-extract,brief}` producing reviewable
`ai_drafts` (= migration 16, D-22) + review UIs; weekly-brief n8n workflow
(`automation/tower/`). Fixed a latent public-read schema-scoping bug (D-23). 212
tests green (D-26).

**Wave 5 — Admin + hardening (complete).**
UserManager (invite + memberships matrix), LaneRegistry (append-only codes,
forward-only status), BrandManager (retire/reinstate via `brands.status` =
migration 18), AuditExplorer (cursor-paginated, virtualized, old/new diff),
WebhookHealth (`webhook_deliveries` = migration 20, service-role insert only) +
`POST /api/hooks/revalidate-callback` (HMAC, reuses `REVALIDATE_SECRET`); admin
⌘K/NavRail wiring. Hardening: QA sweep (WAVE5_QA_FINDINGS.md incl. Conductor
resolutions) + parity map (PARITY_MAP.md); advisor warnings fixed (migration 17);
applied migrations 01–20 exported to `supabase/migrations/`; BUILD_PROMPT demo
seed applied (migration 19). 258 tests green.

---

## 2 · Seeds — present vs. expected

BUILD_PROMPT seed spec: brands (wings, aladin) · lanes WGT/01–06 with archetypes ·
3 demo products per active lane · one SHARED container on WGT/01 with two commitments
· one demo RFQ per archetype.

All verified against the DB and completed by the Conductor on 2026-07-07
(missing rows seeded via migration 19 `tower_19_seed_demo`, idempotent, all
`DEMO`-prefixed; demo container coded `WGT/01-DEMO1` to stay outside the real
append-only C-number sequence):

| Seed | Evidence | Status |
|---|---|---|
| Brand `wings` | migration 12; count verified | Present |
| Brand `aladin` | migration 12; count verified | Present |
| Lanes WGT/01–06 + archetypes | migration 12; count verified (6) | Present |
| 99 real products on WGT/01 | D-09 (reconciled 99=99) | Present |
| 3 demo products per lane WGT/02–06 | migration 19; 15 rows verified | Present |
| 6 archetype spec schemas | D-12; count verified | Present |
| SHARED container on WGT/01 + 2 commitments | migration 19; verified | Present |
| 1 demo RFQ per archetype (+ line, real stage ids) | migration 19; 6+6 verified | Present |

---

## 3 · Complete environment variable list

Union of BUILD_PROMPT §Env, D-13, D-20, D-26, and the n8n README. Set on Vercel
(TOWER project) unless marked n8n. Never commit any of these; secrets server-side only.

### App runtime (Vercel — TOWER project)

| Var | Where used | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/{server,client}.ts` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/{server,client}.ts` | public; RLS-scoped client |
| `SUPABASE_SERVICE_ROLE_KEY` | `createServiceClient()` — ingest, public read model, signals, hooks, conversations | **server only**, bypasses RLS |
| `ANTHROPIC_API_KEY` | `lib/ai/client.ts` (triage/score/spec-extract/brief) | server only |
| `INGEST_HMAC_KEY_WINGS` | `lib/ingest/hmac.ts` (per-brand ingest signature) | server only |
| `INGEST_HMAC_KEY_ALADIN` | `lib/ingest/hmac.ts` | server only |
| `REVALIDATE_SECRET` | `lib/revalidate.ts` (publish → Vercel revalidation webhook) | server only |
| `MISTER_HOOK_SECRET` | `api/hooks/mister/route.ts` (HMAC verify) — **D-20** | server only |
| `WHATSAPP_HOOK_SECRET` | `api/hooks/whatsapp/route.ts` (HMAC verify) — **D-20** | server only |
| `N8N_WEBHOOK_BASE` | doc-gen / digest / partition crons (BUILD_PROMPT) | server only |

### n8n instance (shared ecosystem n8n — TOWER pipeline group) — D-26 + README

| Var | Where used |
|---|---|
| `TOWER_BASE_URL` | weekly-lane-brief workflow → `POST {}/api/ai/brief` |
| `TOWER_SERVICE_TOKEN` | Bearer for the server-to-server brief call |
| `TOWER_BRIEF_LANES` | comma-separated lane slugs to brief (append a slug to add a lane, no workflow edit) |
| `TOWER_BRIEF_REVIEW_WEBHOOK` | receives each DRAFT brief for human review before send |

> `ANTHROPIC_API_KEY` is required for both parse (spec-extract) and the weekly brief.
> `INGEST_HMAC_KEY_*` are per-brand — each site signs its events with its own key and
> the ingest route rejects a valid signature that claims the wrong brand
> (`api/ingest/route.ts:63`).

---

## 4 · Deployment prerequisites (in order)

1. **Expose `tower` to PostgREST (BLOCKING — D-13).** Dashboard → Settings → API →
   Exposed schemas → add `tower` (canonical, additive; keep `public`, `storage`,
   `graphql_public`). SQL alternative only after reading the current list:
   `alter role authenticator set pgrst.db_schemas = 'public, storage, graphql_public, tower'; notify pgrst, 'reload config';`
   Until this is done the app returns empty from every `.schema('tower')` read —
   TOWER is non-functional. (See WAVE5_QA_FINDINGS H-3.)
2. **Set all env vars** from §3 on the TOWER Vercel project.
3. **Storage RLS follow-up (D-13.3).** `product-media` and `trade-documents` are
   private buckets; signed-URL upload/read via service role works today. Direct
   `authenticated` object access needs `storage.objects` policies — outstanding
   follow-up (see `components/catalog/README.md`, `components/containers/README.md`).
4. **Import the n8n workflow.** n8n → Workflows → Import from File →
   `automation/tower/weekly-lane-brief.workflow.json`; set the four n8n vars (§3);
   confirm the Schedule node timezone; Save; toggle Active (ships `active:false`
   deliberately). Point `TOWER_BRIEF_REVIEW_WEBHOOK` at the review inbox that fronts
   the WhatsApp/email digest send.
5. ~~Commit the applied `tower` migrations (H-2)~~ **DONE 2026-07-07** — all 20
   applied migrations exported to `supabase/migrations/` with DB-matched versions;
   the `tower` schema is now rebuildable from the repo.
6. ~~Run `get_advisors`~~ **DONE 2026-07-07** — security: zero new criticals
   (the `tower.events_*` no-policy INFOs are the deliberate D-04 deny-all pattern);
   performance: zero criticals, all 6 `auth_rls_initplan` warnings fixed via
   migration 17 and isolation re-proven with the RLS fixture. Remaining INFOs
   (unused indexes, unindexed FKs) are pre-traffic noise — revisit under real load.
   Two pre-existing dashboard-level WARNs are out of TOWER scope:
   `public.set_updated_at` mutable search_path (live-site function) and Auth
   leaked-password protection disabled (enable in Dashboard → Auth settings).

---

## 5 · Open items

- ~~H-1 (QA)~~ **RESOLVED** — `lanes_read` RLS is membership-scoped; fixture test
  extended with lane-enumeration assertions, green. No code change needed.
- ~~H-2 (QA)~~ **RESOLVED** — migrations 01–20 exported and committed.
- **M-1 (QA):** make publish+snapshot (and the other multi-step writes) atomic RPCs.
- **M-2 (QA):** correct stale `wave3/wave4` migration references in code comments
  (point at the now-committed `supabase/migrations/` files).
- **M-3 (QA):** ⌘K palette record-jumps and run-actions are dead stubs — admin
  destinations were wired in Wave 5, but product/account/container jumps and
  "publish…/new RFQ…" actions remain.
- ~~M-4 (QA)~~ **RESOLVED** — Admin module shipped this wave (all five components).
- **Parity (see PARITY_MAP):** financial/landed-cost engine (Peru SUNAT), prorrateo,
  bulk import + PDF/XLSX export, container stowage simulator, and history/audit view
  are MISSING or PARTIAL — build programs, not hardening fixes.
- Seeds per §2; end-to-end acceptance run behind the Verifier's browser gate.

---

## 6 · wings-operations decommission checklist

> **CRITICAL CORRECTION (per D-02) — read before touching any infrastructure.**
> The Supabase project **`rsstxmptehndaipscaou` is the UNRELATED "Euro Global"
> project. Do NOT pause, restore, or touch it.** wings-operations' data already
> lives inside **`pyznlglvwihosemqkhtq`** (the wings project) — the dashboard even
> *names* that project "wings-operations". There is **no separate wings-operations
> Supabase project to pause.** The Absorption section of `programs/tower/CLAUDE.md`
> and BUILD_PROMPT both still say to "pause Vercel + Supabase `rsstxmptehndaipscaou`"
> — **that instruction is STALE and wrong; ignore it.** Decommissioning
> wings-operations means archiving its **git repo** and retiring its **Vercel
> deployment** only. Pausing `rsstxmptehndaipscaou` would take down an unrelated
> business's database.

**Gate (must ALL be true before starting) — currently NOT met (see PARITY_MAP):**
- [ ] Financial/landed-cost engine (SUNAT: incoterm CIF, Ad Valorem, ISC, IGV
      importación, percepción, recoverable-tax margins) runs in TOWER. *(MISSING)*
- [ ] Prorrateo (multi-item cost allocation) runs in TOWER. *(MISSING)*
- [ ] Bulk import + PDF/XLSX export restored in TOWER. *(PARTIAL)*
- [ ] Container stowage simulation confirmed needed-or-not-needed by ops. *(PARTIAL)*
- [ ] History/audit of past calculations available. *(AuditExplorer BUILT this wave;
      re-opening/re-exporting past cost calculations still depends on the missing
      financial engine)*
- [ ] Catalog CRUD parity. *(MET — row 1)*
- [ ] Ops runs each of their real workflows in TOWER end-to-end and **signs off**.

**Decommission steps (only after the gate passes and ops signs off):**
1. Final data check: confirm nothing operational still writes only to
   wings-operations paths inside `pyznlglvwihosemqkhtq` that TOWER doesn't own.
2. Archive the `wings-operations` **git repository** (make read-only / archived).
3. Retire the wings-operations **Vercel deployment** (remove production domain,
   then delete or disable the project).
4. **Do NOT** pause, delete, or restore any Supabase project. Specifically, leave
   `rsstxmptehndaipscaou` ("Euro Global") entirely alone, and leave
   `pyznlglvwihosemqkhtq` running (it hosts TOWER and the live site).
5. Record the decommission date + ops sign-off here.

**Until the gate passes, wings-operations stays live as the operational fallback —
never turn it off mid-migration** (Absorption section, still correct on this point).
