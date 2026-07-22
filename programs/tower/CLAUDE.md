# CLAUDE.md — TOWER (apps/tower)
Project brain for agents building or extending TOWER. Read the ecosystem CLAUDE.md first; its Prime Directives apply here in full. This file adds TOWER-specific law.

## What this app is
Internal CRM + ERP + PIM + analytics for Wings Global Trade and endorsed-brand tenants (Áladín). Spec package: PRODUCT_BRIEF · ARCHITECTURE · DATABASE_SCHEMA.sql · COMPONENT_TREE · API_MAP · DESIGN_SYSTEM, all in this folder. Build order lives in BUILD_PROMPT.md.

## Directives (TOWER-specific, never violate)

1. **RLS is the permission system.** Never gate access in React or in server-action logic alone. If a permission question arises, the answer is a policy on `lane_memberships`, not an `if` statement. UI hides what RLS forbids — it never enforces.
2. **Archetype drives structure.** Pipeline stages, RFQ unit math, spec schemas, container logic all derive from the lane's archetype (`EQUIPMENT | PROJECT | COMMODITY | PROGRAM | CREDENTIAL | ORIGIN`). Never hardcode a stage list or unit into a component — read it from the archetype config. A new lane must light up in TOWER with **zero code changes** (one `lanes` row + memberships).
3. **Money is integer minor units + currency code.** All arithmetic server-side. Percentages in basis points. Any float touching money is a bug.
4. **Append-only worlds:** lane codes, container codes, `product_versions`, `audit_log`, `events`. Retire, never delete. Every mutating table gets the audit trigger before it gets a UI.
5. **The public site is a read model.** Sites consume `product_versions` snapshots and `/api/public/fill`. TOWER never fetches *from* the sites. Publishing = state flip + snapshot + revalidation webhook.
6. **Events carry no PII.** `session_hash` only; identity joins only at RFQ conversion. Reject email/phone-shaped payloads at ingest.
7. **Intelligence proposes, humans dispose.** Every AI output (triage, spec extraction, scores, pack edits) lands as a reviewable draft with confidence shown. No AI action auto-commits to published state, quotes, or knowledge packs.
8. **Wholesale directives hold internally too:** quote flows, never carts; the vocabulary lint applies to TOWER copy.

## Stack & conventions
Next.js App Router + TS · Supabase (`tower` schema on the wings-global-trade project, `pyznlglvwihosemqkhtq` — NOT dalab-intelligence) · server actions for all mutations (auth → Zod → RLS query) · TanStack Table/Query · Recharts · Claude API (haiku = classify, sonnet = extract/brief, stream >2s) · n8n for WhatsApp/doc-gen/digests/partition-and-rollup crons · pnpm · `@wings/trade-ui` organs reused (`ManifestTable`, `LaneStamp`, `FillMeter`, `SpecSheet`).

```
apps/tower/app/(shell)/{catalog,pipeline,containers,signals,intelligence,admin}
apps/tower/lib/{actions,schemas,archetypes,ai,ingest}
packages/ui            ← organs (frozen; changes require the swap test)
```

- All validation Zod; spec schemas exported to JSON-Schema for the schema-driven `SpecForm`.
- Every list view: server pagination, virtualized >100 rows, p95 <400ms; dashboards query rollups, never raw `events`.
- Errors: typed codes from API_MAP; global boundary; raw errors never rendered.
- Styling: DESIGN_SYSTEM.md tokens only; active-lane accent via `--lane-accent`, surfaces never change.

## Migration numbering & application (append-only law — never violate)
Files: `supabase/migrations/YYYYMMDDHHMMSS_tower_NN_short_name.sql`. The `tower_NN` number is **append-only**: never reused, never reordered, same law as lane/container codes (Directive 4). One concern per file; every mutating table gets `audit_trigger()` in the same migration.

**Before you add ANY migration in a new batch — do this first, or you WILL collide:**
1. `git fetch origin && git checkout <your-branch> && git merge origin/master` (or rebase). A long-lived branch that hasn't taken `master` is the #1 source of number collisions.
2. Find the current max: `ls supabase/migrations | grep -oE 'tower_[0-9]+' | sort -t_ -k2 -n | tail -1`. **Take the next integer above the max. Never backfill a gap** — a gap may be a reservation.
3. Timestamp prefix strictly increasing (they apply in timestamp order).

> **Why this rule is law (2026-07-21):** two workstreams both branched off the same base and independently grabbed `tower_39–42` for *different* migrations (a rep-identity session + PR #4's audit hash-chain). Reconciling cost a full renumber (40/41/42 → 44/45/46). Merge `master` **before** numbering, every time.

**High-water mark (update when you add migrations):** max used = **`tower_46`** · next free = **`tower_47`**. Reserved-but-unbuilt: `tower_27–29` (RB console), `tower_37` (journey-automation slot). Known artifact: two files share timestamp `20260721180000` (`tower_39_rep_profiles` + `tower_39_status_transition_guards`) — both applied to prod; harmless, left as-is.

**Applying to prod** (`pyznlglvwihosemqkhtq`): via Supabase MCP `execute_sql` or the SQL Editor. **Record the ledger row `supabase_migrations.schema_migrations` at the file's EXACT timestamp version** — do not let `apply_migration` auto-timestamp diverge from the filename, or `supabase db push` will try to re-run it. Every prod schema change has a committed migration file — no manual prod SQL that isn't captured as a migration (root law).

**View changes:** `CREATE OR REPLACE VIEW` may only *append* columns. Adding a column mid-list (or reordering) requires `DROP VIEW IF EXISTS` + `CREATE VIEW` (atomic inside the migration's transaction — no reader downtime) and re-issuing the grants.

## Definition of done (any TOWER feature)
- [ ] RLS policy written and tested with a non-admin membership fixture
- [ ] Zod schema on every input; audit trigger verified in the change
- [ ] Works for at least two archetypes without branching code (or is honestly archetype-config)
- [ ] Áladín tenant isolation verified (wings user cannot see aladin rows, and vice versa)
- [ ] Keyboard + ⌘K reachable; status readable without color
- [ ] Rollups, not raw events, behind any chart
- [ ] Copy passes wholesale-language lint, ES/EN

## Absorption: wings-operations (decided by Muaaz 2026-07-06)
TOWER absorbs the deployed internal ops app at `~/projects/wings-operations` (standalone Next.js app on its own Supabase project `rsstxmptehndaipscaou`). Rules:

1. **wings-operations is feature-frozen.** Bugfixes only; no new capability lands there. Anything ops asks for gets built in TOWER.
2. **Parity map** (each module must reach parity before its wave closes):
   - catalog CRUD → Catalog Studio (Wave 2) · bulk/xlsx import → catalog import tooling (Wave 2)
   - container tracking + prorrateo (CBM-proportional cost allocation) + financial views → Container Desk + CostSheet (Wave 3)
   - parse-pdf + ai-support endpoints → Intelligence draft flows (Wave 4)
   - dashboard + history → Signal Deck + AuditExplorer (Waves 4–5)
3. **Data migration (Wave 1):** idempotent import scripts move its data from `rsstxmptehndaipscaou` into schema `tower` on the wings project. wings-operations stores money as decimals (decimal.js) — convert to integer minor units at import and reconcile totals before/after in the migration log.
4. **Decommission gate (Wave 5):** every wings-operations workflow demonstrably runs in TOWER and ops signs off; then archive the repo and pause its Vercel + Supabase projects. Until that gate passes, wings-operations stays live as the operational fallback — never turn it off mid-migration.

## Known upgrade paths (documented, not built)
Events → Tinybird/ClickHouse past ~5M/mo · search → Typesense · accounting export → ledger integration · customs/EDI APIs · Áladín schema consolidation post-agreement.
