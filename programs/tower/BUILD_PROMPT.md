# TOWER · BUILD_PROMPT.md
Paste the block below into Claude Code from the monorepo root with this spec folder present. Recommended: run as an overnight wave with your existing multi-terminal protocol — Wave boundaries are marked.

---

You are building **TOWER**, the internal CRM+ERP+PIM+analytics app for the Wings Global Trade monorepo, at `apps/tower`. Read, in order: `programs/tower/CLAUDE.md`, the ecosystem root `CLAUDE.md`, then `PRODUCT_BRIEF.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.sql`, `COMPONENT_TREE.md`, `API_MAP.md`, `DESIGN_SYSTEM.md`. Every directive in the two CLAUDE.md files is law. Do not ask questions; resolve ambiguity per the spec and log the decision in `programs/tower/DECISIONS.log.md`.

**WAVE 1 — Foundation (blocking):**
1. Apply `DATABASE_SCHEMA.sql` as Supabase migrations against schema `tower` (use apply_migration; one migration per section). Add the generic audit trigger function and attach it to every mutating table. Add monthly partition + rollup-refresh crons.
2. Write RLS policies for ALL domain tables following the pattern in the schema file (products is the template; map roles per PRODUCT_BRIEF role table). Write pgTAP-style or script-based RLS tests: fixtures for group admin, a WGT/01 CATALOG_EDITOR, a WGT/02 LANE_DIRECTOR, an Áladín SALES user — assert cross-lane and cross-brand isolation.
3. Scaffold `apps/tower`: Next.js App Router + TS + Tailwind reading DESIGN_SYSTEM tokens; Supabase auth (magic link + Google); TowerShell with LaneSwitcher (memberships-driven), NavRail, CommandPalette (cmdk), notifications stub.
4. Implement `lib/archetypes/` — the archetype config module: stage sets, unit math, spec-schema resolution for all six archetypes. Everything downstream reads from this module.
5. Write idempotent import scripts (`programs/tower/migration/`) that migrate wings-operations data (Supabase project `rsstxmptehndaipscaou`: catalog, containers, financial/prorrateo history) into schema `tower`, converting decimal money to integer minor units. Reconcile row counts and totals before/after; record results in the migration log. Do NOT modify or shut down wings-operations itself — it stays live until the Wave 5 decommission gate.

**WAVE 2 — Catalog Studio:** ProductTable → ProductEditor with schema-driven SpecForm (JSON-Schema → form renderer with typed fields + ES/EN locale tabs), MediaManager (signed uploads, kind tagging), VersionHistory + rollback, PublishBar with the full DRAFT→IN_REVIEW→PUBLISHED flow, publish snapshot to `product_versions`, and the Vercel revalidation webhook + `/api/public/catalog/*` read endpoints. Seed spec schemas: EQUIPMENT and PROJECT defaults from the field lists in the ecosystem docs; COMMODITY with grade/harvest fields.

**WAVE 3 — Pipeline + Container Desk:** PipelineBoard with archetype stage columns; RFQ detail with LineItems (lane unit math), ConversationPane (render mister session + WhatsApp thread from hooks tables), QuoteComposer (server-computed totals, integer money); convertToOrder. Container Desk: ContainerBoard, container detail with CommitmentsTable (atomic CBM capacity check in SQL), POPanel + QC tracker, DocumentVault (private bucket, signed URLs), CostSheet (server-side landed-cost computation), `/api/public/fill/*`. Hooks: `/api/hooks/mister`, `/api/hooks/whatsapp` per API_MAP.

**WAVE 4 — Signals + Intelligence:** `/api/ingest` with HMAC verification, PII-shape rejection, rate limiting; Signal Deck (LanePulse, FunnelChart, ProductLeaderboard, FillWatch, SourceSplit) reading ONLY rollups; group cross-lane view. Intelligence endpoints per API_MAP (haiku triage + score, sonnet spec-extract streamed + weekly brief), TriageQueue and SpecExtract review UIs where every AI output is a draft requiring approval. Wire weekly brief scheduling as an n8n workflow JSON exported to `automation/tower/`.

**WAVE 5 — Admin + hardening:** UserManager with the memberships matrix, LaneRegistry (append-only codes), BrandManager, AuditExplorer, WebhookHealth. Then the full Definition-of-Done sweep from `programs/tower/CLAUDE.md` on every module, run `get_advisors` (security + performance) on the Supabase project and fix all criticals, verify keyboard/⌘K coverage, run the wings-operations parity map from `programs/tower/CLAUDE.md` (every workflow — catalog, bulk import, containers, prorrateo, financial, PDF parsing — demonstrably works in TOWER), and produce `programs/tower/HANDOVER.md` summarizing what shipped, seeds, env vars needed, open items, and the wings-operations decommission checklist (archive repo, pause Vercel + Supabase `rsstxmptehndaipscaou`) for ops sign-off.

Seed data: brands (wings, aladin), lanes WGT/01–06 with archetypes per the ecosystem doc, 3 demo products per active lane, one SHARED container on WGT/01 with two commitments, one demo RFQ per archetype. Never commit service keys; env via Vercel. All money integer minor units. All copy ES/EN.

Definition of overall done: a WGT/02 CATALOG_EDITOR fixture can draft → submit a product; the WGT/02 LANE_DIRECTOR publishes it; the public catalog endpoint serves the snapshot; an ingested `product_view` event appears in the Signal Deck rollup; a Mister hook creates an RFQ that converts to an order committed onto a container whose fill endpoint reflects the new CBM — end to end, with all RLS tests green.

---

## Env vars required
`NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` (server only) · `ANTHROPIC_API_KEY` · `INGEST_HMAC_KEY_WINGS` · `INGEST_HMAC_KEY_ALADIN` · `REVALIDATE_SECRET` · `N8N_WEBHOOK_BASE`
