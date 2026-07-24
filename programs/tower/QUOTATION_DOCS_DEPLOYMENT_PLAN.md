# Deployment plan — Multi-entity document generation in TOWER

> Scope: make the issuer-intelligence layer + the four documents (proforma,
> cotización, ficha técnica, **anexo**) first-class, operator- and Mister-driven
> features in TOWER, on the official grid system. Grounded in the repo as of
> branch `claude/branded-proforma-pricing-0jyzbx` (2026-07-24). Obeys
> `programs/tower/CLAUDE.md` (RLS, integer money, append-only migrations,
> archetype-agnostic, propose-then-dispose, wholesale lint).

## 0. Where we are (the seams, verified)

| Piece | State today | File(s) |
|---|---|---|
| Issuer registry + resolver | **Built.** `WINGS_PE` + `SHINING_STAR_CL`, `resolveIssuer(destination)`, `issuerById` | `apps/tower/src/lib/quotation/issuers.ts` (+ test) |
| Proforma render | **Entity-aware** (resolves at render from `terms.portOfDestination` / buyer country) | `lib/actions/proforma.ts`, `components/pipeline/proforma-document/*` |
| Cotización / ficha / RB render | **Single-issuer** (`WINGS_ISSUER` hardcoded) | `lib/actions/quotation.ts:188`, `ficha.ts`, `rb-quotation.ts:419` |
| Mister → quote creation | **Entity-blind:** `currency:'USD'` hardcoded, no destination/issuer captured | `capabilities/quote-build.ts`, `actions/mister-quote.ts`, `pipeline.ts#createRFQ/composeQuote` |
| Persisted issuer/destination | **None.** No `quotes.issuer_id`; destination only optionally in `terms` jsonb | `supabase/migrations/…tower_22…` |
| Document editor | `saveQuotationDetails` (billTo/tax/terms/observations only); no issuer/dest/ports/banking/locale; mounted only in `QuoteComposer` | `lib/actions/quotation.ts:277-340`, `components/pipeline/quotation-document/QuotationDetailsEditor.tsx` |
| Generation launcher | **None.** Quote creation is Mister-only; QuotationsWindow is read-only list; `/documents` is a Drive hub | `components/quotations/QuotationsWindow.tsx`, `app/(shell)/documents/` |
| Document rendering | Browser `window.print()`; ad-hoc **px** CSS; no baseline grid, no shared token layer | `components/pipeline/*/*.css`, `app/*/document/PrintBar.tsx` |
| Grid system | **Spec'd, not applied** (29.5pt margins, 19.9pt baseline, 4 fields) | `programs/tower/doc-templates/grids/GRID_SYSTEM.md` |
| Anexo (landed-cost annex) | **Does not exist** as a TOWER doc; only a deliverable script | `deliverables/proforma-saad-muhammad/build_anexo.py` |
| Landed-cost engine | **Built** — `computeImportCost` (SUNAT chain), consumed by Mister landed-cost/reverse-quote capabilities | `lib/costing/engine.ts`, `capabilities/landed-cost.ts` |

**The core mismatch:** issuer is chosen at *render* time, after the fact, never persisted, never chosen by a human or Mister. Everything below closes that loop and generalizes it.

## 1. Keystone decisions (resolve before building)

- **D1 · Renderer strategy (canonical PDF).** Today = browser `window.print()` of React DOM + scoped px CSS. The grid is specified in **points** and we need **server-generated** PDFs (so Mister/n8n can attach a proforma to WhatsApp/email without a browser). **Recommendation:** converge documents onto **`@react-pdf/renderer` server routes** (pt-native, serverless-friendly, matches the stated architecture in `doc-templates/README.md`), keeping the existing DOM components only as an on-screen preview during migration. Fallback if the rewrite is too costly: a headless-Chromium print service (reuses the current DOM + grid CSS, heavier runtime) — this is exactly how the deliverable PDFs are produced today. **Pick one before Wave 1.**
- **D2 · Persist vs resolve the issuer.** Add `quotes.issuer_id` (explicit choice wins) **and** keep `resolveIssuer(destination)` as the default suggestion. Precedence: `issuerById(row.issuer_id) ?? resolveIssuer({port,country}) ?? DEFAULT`. `issuers.ts` already anticipates this.
- **D3 · The anexo is costing-derived, not hardcoded.** It reads the quote total + a destination handling-tariff set from `lib/costing` (`computeImportCost` / the linked cost-sheet), so a price change flows into it automatically. No copied numbers (the bug the 0.35→0.40 change exposed).
- **D4 · Mister captures destination at proposal time.** `quote-build` extracts `destinationCountry`/`port` (the *site* Mister already collects these); it threads through the SavePanel and `saveMisterQuoteDraft` into `quotes.terms.portOfDestination` (+ `issuer_id` once persisted). Currency derives from the resolved entity, not hardcoded USD.
- **D5 · One shared document-grid layer.** A new `pt`-based stylesheet (or `@react-pdf` StyleSheet) encoding margins/baseline/fields, composed by every document root — never per-file px padding again.

## 2. Delivery waves (dependency-ordered)

Each wave ends at TOWER's Definition of Done (RLS tested with a non-admin fixture · Zod on inputs · audit trigger on new mutating tables · two-archetype safe · Áladín isolation · ⌘K reachable · wholesale-lint ES/EN).

### Wave 0 — Feed the stack + persistence spine
> **Torre reconciliation (Fable review, 2026-07-24):** master shipped the Mister
> Torre quote-run (`tower_48–54`). Deltas folded in: (1) migration renumbers to
> **`tower_55`** (high-water was tower_54); (2) issuer = identity axis, `org_rules`
> = policy axis — derive `validityText` from `org_rules.validity_days` at render
> where a brand exists, entity text is the fallback; (3) the two cotización layers
> complement — the proforma/anexo build on the `tower.quotes` render path, never
> Torre's `ai_drafts` cards; (4) Wave 5 drops the new shell tool — **extend
> `QuotationsWindow` + a ⌘K action** instead; (5) Wave 2 adds the approval→issuance
> bridge (persist `issuer_id` + `portOfDestination` when a Torre COTIZACION becomes
> a quote); (6) Wave 4 sources freight/insurance via `resolveFreightRate` over
> `rate_tables`, local lines from the cost sheet. **VERDICT: green light.**

- **Migration `tower_55`** (`supabase/migrations/20260724160000_tower_55_issuing_entities.sql`) — *merge `master` and re-check the high-water mark first (CLAUDE.md law; verified next free = tower_55)*:
  - `tower.issuing_entities` (id text PK, key, country, tax_id_label, doc_prefix, issuer jsonb, exporter jsonb, banking jsonb null, terms jsonb, default_incoterm, tax_label, tax_bps, default_issue_city, locale, footer_shows_address, serves jsonb) + audit trigger + RLS (read: any authed group member; write: `is_group_admin()`).
  - `alter table tower.quotes add column issuer_id text references tower.issuing_entities(id)`, `add column locale text` (per-doc override).
  - Seed the two entities from `issuers.ts` (idempotent upsert).
- **`issuers.ts`** becomes the typed seed + fallback; `getProformaDocument` gains `issuerById(row.issuer_id) ?? resolveIssuer(...)`.
- **Feed the knowledge base:** append `D-xx` to `programs/tower/DECISIONS.log.md`; add the schema to `programs/tower/DATABASE_SCHEMA.sql`; add backlog items to `REMAINING.md`; link `docs/quotation-intelligence.md` + this plan from `ARCHITECTURE.md`.
- **Housekeeping:** remove the stray `deliverables/**/v{1,2,3}.png`.
- Tests: migration up/down; `issuerById` precedence; RLS read/write fixture.

### Wave 1 — Shared document grid layer
- New `components/pipeline/_document-grid.(css|ts)` encoding `--doc-margin: 29.5pt`, `--doc-baseline: 19.9pt`, the field edges (84.6/154.6/…/565.6 pt), `@page { size:A4; margin:29.5pt }`.
- Compose it into each document root class (`.pdoc/.qdoc/.fdoc/.rbqdoc/.csheet`), replacing per-file px padding. Money columns of proforma + anexo right-align on line 10 (565.6pt) — the alignment law from `GRID_SYSTEM.md`.
- If D1 = `@react-pdf`: express the same as a shared `StyleSheet`.
- QA: overlay each rendered doc against `doc-templates/grids/*.pdf` (pixel-diff within tolerance).

### Wave 2 — Issuer parity across all documents
- Make **cotización** (`quotation.ts` + `document.ts`) and **ficha** (`ficha.ts`) and **RB** (`rb-quotation.ts`) issuer-aware via the same `issuers.ts` seam already proven in `proforma.ts` (exporter/issuer/banking/terms/tax/locale/issue-city from the resolved entity).
- Unify the doc-number series to read `entity.docPrefix` (today shared `WGT`); leave `mint_quote_no` shared unless per-entity numbering is wanted.
- Swap test: render one quote as PE vs CL — structure identical, identity/tax/locale switch.

### Wave 3 — Mister captures destination (the copilot half)
- **`quote-build.ts`:** add `destinationCountry` + `port` to the extraction prompt and `QuoteProposalData`; derive `currency`/`incoterm` from the resolved entity (drop the USD default).
- **`QuoteProposalArtifact` SavePanel:** show the resolved issuer chip ("Emite: Shining Star · CL") from `resolveIssuer(destination)`, with a manual override dropdown seeded from `ISSUER_REGISTRY`.
- **`saveMisterQuoteDraft` + `createRFQ`:** accept + persist destination (`quotes.terms.portOfDestination`) and `issuer_id`; currency from entity. (Directive 7: still lands as DRAFT — propose, then dispose.)
- Add an "Abrir anexo" deep-link next to the existing "Imprimir proforma" link once Wave 4 lands.
- Tests: quote-build extraction fixtures (CL/Bolivia → Shining Star); save persists destination+issuer.

### Wave 4 — The Anexo document (net-new, costing-derived)
- **Model:** `lib/quotation/anexo.ts` (`AnexoDocument`: header, CBM, logistics lines, logistics subtotal, proforma sale = quote total, landed total; all integer minor units). No money math of its own — reuse `computeQuotationTotals` + read `computeImportCost`/cost-sheet for the handling lines (D3).
- **Action:** `lib/actions/anexo.ts#getAnexoDocument(quoteId)` — reads the quote total + linked logistics inputs; resolves the issuer (same seam).
- **Route + renderer:** `app/anexo/[id]/document/page.tsx` + `components/pipeline/anexo-document/*` on the shared grid (Detalle 84.6–422.8 / Monto 440.2–565.6).
- **Mister capability (optional):** a `landed-cost`→`anexo` bridge so "ármame el anexo de este contenedor" renders + offers save, reusing the existing `landed-cost` engine output.
- Register the anexo document type (already noted in `doc-templates/README.md`).
- Tests: landed total = logistics subtotal + quote total; price change on the quote flows into the anexo (no copied number).

### Wave 5 — The document-generation window (the operator half)
- **New shell tool** `id: 'generar'` (or extend `/documents`): `TOOLS` row in `shell/navigation/registry.ts` + icon key in `nav-icons.tsx` + `app/(shell)/generar/page.tsx`. Surfaces in rail/dock/⌘K with no other edits.
- **⌘K action:** add `act-new-doc → /generar` to `EVERYONE_ACTIONS` (data-only; no palette-component change).
- **The window:** pick document type (proforma/cotización/ficha/anexo) → pick quote/source → **destination + issuer selector** (default from `resolveIssuer`, override from `ISSUER_REGISTRY`) → banking/locale toggles (entity defaults) → preview → issue. Reuses `IssueButton` semantics for minting.
- **Per-document editors:** generalize `saveQuotationDetails` into a `saveDocumentDetails` that also accepts `issuerId`, `portOfDestination`, `banking` visibility, `locale`; add `saveProformaDetails`. Extend the editable Zod schemas accordingly.
- Add a "Generar documento" affordance to `QuotationsWindow` header (currently text-only).
- Tests: window RLS; selector default + override persists; issue mints once (idempotent).

### Wave 6 — Canonical PDF + distribution + QA gates
- Land D1 (server PDF route) as the canonical artifact; wire n8n doc-gen so Mister/WhatsApp/email can attach the PDF (TOWER stack already lists n8n doc-gen crons).
- Full QA: grid overlay diff (all four docs), wholesale-language lint (all locales), money reconciliation (subtotal/tax/total = Σ, integer minor), reduced-motion/print parity, Áladín isolation, LCP budget on the window.

## 3. Cross-cutting law (applies every wave)
- **RLS is the boundary** — `issuing_entities` read/write policies; document actions stay RLS-scoped reads. No React/logic gating.
- **Money** — integer minor units + bps everywhere; the anexo never re-derives a float; display-format es-PE only at the edge.
- **Propose-then-dispose** — any Mister write stays a DRAFT / `ai_draft`; issuing is the human-gated act (`issueQuotation`).
- **Archetype-agnostic** — the document/issuer layer must not branch on archetype; entity + destination are orthogonal to lane archetype.
- **Wholesale lint + ES/EN** — every string; the anexo is "referencial, no constituye factura".
- **Áladín isolation** — issuing entities and documents respect tenant scoping.

## 4. Risks & sequencing
- **Migration collisions** (CLAUDE.md's #1 hazard): merge `master`, re-read high-water, take the next integer, never backfill. Wave 0 gates everything.
- **D1 is the biggest lift** — decide early; if `@react-pdf`, budget the per-document rewrite; if headless-Chromium, budget runtime/infra.
- **Double source of truth** — persisting `issuer_id` while also resolving means precedence must be explicit and tested (Wave 0).
- **Sequencing:** 0 → 1 → 2 in order (spine, grid, parity). 3 (Mister) and 5 (window) can run in parallel once 2 lands. 4 (anexo) needs 1 (grid) + the costing link. 6 last.

## 5. What's already done (credit against this plan)
- Issuer registry + resolver + both entities' data (`issuers.ts`, tested).
- Proforma render fully entity-aware (Wave-2 pattern proven).
- The grid system extracted + codified + anexo grid derived (`doc-templates/grids/`).
- The anexo document exists as a working deliverable (the layout + numbers to port into Wave 4).

## 6. First concrete step
Wave 0, task 1 (**DONE** on branch, migration awaiting prod apply): merged `master`, confirmed `tower_55` free, wrote `tower_55_issuing_entities.sql` + the `quotes.issuer_id/locale` columns, seeded from `issuers.ts`, and flipped `getProformaDocument` to `issuerById(...) ?? resolveIssuer(...)`. Everything else builds on that column.
