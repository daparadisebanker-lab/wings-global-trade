# TOWER — What's Left (next-step tracks)

## How to resume

Working branch: **`claude/wings-quotation-intelligence-cqpfjn`**. Open the next
session pointed at this branch (the doc + all the work live here; a fresh session
on `main` won't have them until this branch merges). Paste this to pick up:

> Read `programs/tower/REMAINING.md`. We're continuing TOWER work on branch
> `claude/wings-quotation-intelligence-cqpfjn`. Everything from the last session
> (quotation intelligence, costing, RB console, container promotion with the
> brand-aligned share card) is committed there but **not yet deployed**. Start
> with **Track ① (deploy + verification pass)**: confirm which of migrations
> `tower_22 → tower_33` are applied to prod (`pyznlglvwihosemqkhtq`), then walk me
> through applying the rest, setting `JOURNEY_SIGNING_SECRET` +
> `NEXT_PUBLIC_SITE_URL`, and bootstrapping the first group admin. Then drive the
> flows end to end.

To redirect, just name the track: **② MediaManager upload pipeline** or
**③ finish the promotion feature**.

---

Status snapshot after the container-promotion + quotation-intelligence work on
branch `claude/wings-quotation-intelligence-cqpfjn`. Everything built this cycle
is committed as migration files + code — **none of it is live until deployed**
(migrations apply at deploy; prod is never touched from the branch).

> **Progress update (2026-07-21, branch `claude/start-j44jj2`, based on the
> quotation branch).** Track **②** (media signed-upload pipeline + brand-kit
> asset slots + saved-asset thumbnails) and Track **③** (public share OG image +
> activation analytics) are **SHIPPED**, plus two backlog items — the **RB
> allocation status machine** (`tower_36`) and the **Wave 4 site brand-token
> injection**. All committed; verified by typecheck + 324 tests + `next build`
> on both apps. Still **not deployed** — Track ① now covers `tower_22 → tower_36`.
> Live/browser verification of every one of these is still pending the deploy.

The three recommended next-step tracks, in priority order.

---

## ① Deploy + verification pass  ·  *do this first*

Nothing we built is live until this is done. A browser pass will also surface
anything real before we build further.

- Apply migrations **`tower_22 → tower_36`** to the prod Supabase project
  (`pyznlglvwihosemqkhtq`). New this cycle: `tower_34` provisions the media
  storage buckets (Track ②) and `tower_36` adds the RB allocation status machine
  (guard trigger + expiry-release job + `pg_cron` hourly). There is no
  `tower_35` (the promo activation event needed no schema change).
- Set env: **`JOURNEY_SIGNING_SECRET`** (import-journey HMAC) and
  **`NEXT_PUBLIC_SITE_URL`** (promo listing URLs).
- Bootstrap the **first group admin by email** (one-time SQL noted in `tower_32`);
  the UserManager toggle handles the rest of the 5-person team afterward.
- Drive the real flows end to end: quote → PDF · costing → cost sheet · activate
  a container → author copy → download PNG → public active-container page.

**Why first:** everything else is dark until this lands.

---

## ② MediaManager signed-upload pipeline  ·  *SHIPPED (on `claude/start-j44jj2`)*

Done this cycle:

- **Buckets provisioned** — `tower_34` creates the private `product-media` and
  `brand-kits` buckets (size + mime limits). This was the missing piece: the
  catalog `media.ts` pipeline was already coded but had no bucket to write to.
- **Access model** — private buckets, **no `authenticated` storage.objects
  policy**. Both `createMediaUploadUrl` (catalog) and the new
  `createRbAssetUploadUrl` (brand kits) authorize the caller against the shipped
  predicates (RLS product read / `has_rb_role` + `BRAND_MANAGER`) and then mint
  the signed URL with the **service role**. Mirrors the RB console's
  authorize-in-action pattern; the boundary lives in tested TS, not an untested
  object-path RLS predicate. `media.ts` upload + storage-cleanup now go through
  the service-role client.
- **Brand-kit asset slots wired** — `BrandKitPanel` uploads logos (×4),
  photography (hero ×3 / about ×2) and the mandate/usage PDFs to
  `rb/{slug}/{slot}/…` via `represented-brands-media.ts`
  (`buildRbAssetStoragePath`, unit-tested). The kit JSON stores the returned
  storage paths; a completeness meter gates save. **Finishes RB Console Wave 1b.**
- **Catalog product images** — already implemented (`media.ts` / `MediaManager`);
  now actually functional because the bucket exists.

- **Saved-asset thumbnails** — `BrandKitPanel` now previews already-saved kit
  assets too: each seeded image slot fetches a short-lived signed URL via
  `createRbAssetDownloadUrl` (brand-prefix guarded) and renders a thumbnail;
  PDFs show a chip; fresh uploads still preview from the local `File`.

Still open (deliberately):

- **Variant generation** (resized/optimized derivatives) stays n8n's job per
  ARCHITECTURE — `MediaManager`/`BrandKitPanel` upload the original only.

**Note:** `tower_34` must be applied at the next deploy (folds into Track ①), and
`SUPABASE_SERVICE_ROLE_KEY` must be set (already required elsewhere) for uploads
to work.

---

## ③ Round out the promotion feature  ·  *SHIPPED*

- **Public share OG image** — DONE. `opengraph-image.tsx` on the public promoted-
  container page (`/marcas/[brand]/contenedor/[code]`) rasterises
  `buildPromoCardSvg` → resvg → 1080×1080 PNG, sourced only from the shipped
  `public.rb_active_containers` view (promo_active + OPEN/FILLING + LIVE brand);
  no promoted container → 404, so nothing private unfurls. `apps/site/next.config`
  gained `serverExternalPackages: ['@resvg/resvg-js']` + font tracing for the route.
- **Activation analytics** — DONE. `setContainerPromoActive` now emits a
  `container_promoted` event into `tower.events` (dimensions: `brand_slug` +
  `lane_slug='representation'`, meta `{code, phase, archetype:'ALLOCATION'}`, NO
  PII) via a new `emitServerEvent` helper. No migration needed — `tower.events.event`
  is free-text.

Still open (optional): the brand **accent** is absent from the public
`rb_active_containers` contract, so the OG card uses rb-core's Wings-gold default
rather than the brand accent — surfacing the accent would need a view/migration
change, deferred deliberately.

---

## Full remaining backlog (context)

Beyond the three tracks above, these were always queued (not regressions):

- **NEW (2026-07-21, Muaaz) · Doc generators — Ficha técnica + Proforma.** Add two
  document templates to the TOWER doc generators, extending the shipped quotation
  generator (`apps/tower/src/lib/quotation/document.ts`, tower_22) and reusing its
  company/RUC/tax/terms layer:
  - **Ficha técnica** — technical spec sheet (per product / represented-brand
    container); numbers exhibited as brand assets (CBM/MOQ/HS/packing, tabular mono).
  - **Proforma** — proforma invoice; money in integer minor units + currency code,
    es-PE formatting, wholesale (never a cart).
  Reference layouts to match are saved at `programs/tower/doc-templates/`
  (`ficha_tecnica.pdf`, `proforma.pdf`, + README). Bilingual ES/EN,
  `@react-pdf/renderer` server routes, Wings brand.
- **NEW (2026-07-21, Muaaz) · Container-listing promotion — two-audience share.**
  On a container listing that's ready to promote (the shipped Track ③
  `container-promo` feature), expose the **already-defined ad script** via two
  buttons, reusing the same copy-generation logic — they differ only in audience +
  the appended end-text:
  - **Compartir con equipo de marketing** (share with marketing team) — runs the
    defined ad-script logic → the marketing-facing brief/output (internal handoff
    for ad production).
  - **Compartir con leads y clientes** (share with leads & clients) — same logic,
    but generates a **specific closing/end-text tailored for leads & clients**
    (client-facing CTA/close), appended to the shared copy.
  Wire into the existing promotion surface (`container-promo`, `buildPromoCardSvg`,
  the promo copy in `@wings/rb-core`); WhatsApp/share deep-links per audience.

- ~~**RB allocation status machine**~~ — **SHIPPED** (`tower_36`): the
  `RESERVED → CONFIRMED → LOADED → RELEASED` transitions now have an RLS UPDATE
  policy (brand resolved through `rb_containers`, `BRAND_MANAGER`/`BRAND_OPS`
  only), a `status`-only column grant, a `rb_alloc_status_guard` BEFORE-UPDATE
  trigger enforcing legal jumps, an idempotent `rb_release_expired_allocations()`
  job (hourly `pg_cron`) + `public.` wrapper, and the `advanceRbAllocationStatus`
  server action. Pure `canTransitionAllocationStatus` + tests mirror the DB guard.
- **RB product management per brand** — add/remove products + specs per brand and
  the `/marcas/[brand]/productos` editor (Wave 2, `tower_26`) — SQL-seed-only today.
- **Brand PDF quote + technical spreadsheet** ("regardless of category") — the
  `tower_22` quotation engine isn't adapted to represented-brand containers yet
  (Wave 5 · `techSheetSections` in `@wings/rb-core`).
- ~~**Site brand-layout `--rb-*` token injection**~~ — **SHIPPED** (Wave 4): the
  `(brands)` layout now injects a live brand's `--rb-*` tokens via
  `getRbLiveBrandBySlug` + `rbTokenStyle` (`apps/site/src/lib/rb/tokens.ts`),
  applied as inline style on `[data-brand]`, falling back to the Áladín fixture
  CSS when no live brand/tokens exist. Content (story/hero/products) still comes
  from fixtures — this is the token surface only; live-DB path unverified until
  deploy.
- **Rep cross-category catalog browse UX** — read policy (`tower_31`) is live; a
  dedicated browse view for a pure rep with no editable lane is unbuilt.
- **Import-journey milestone automation** — ops bar + client tracker exist;
  automated phase advancement (n8n) does not.

_Migrations `tower_26–29` are reserved-but-unbuilt per
`programs/represented-brands-console/SPEC.md`._

## Document grid — conformance follow-up (Wave 1 / Stage 4)

The shared pt grid landed: `lib/quotation/grid.ts` (token source, tested),
`components/pipeline/document-grid.css` (the one `@page`, 29.5pt margin via
padding-inset — deterministic across browser print + headless PDF), composed
into all four document roots (`.pdoc/.qdoc/.fdoc/.rbq` + `doc-grid`). Verified by
fixture render of the proforma (full tagline, 29.5pt margins, money figures
stacked on the 565.6pt right rail).

Deferred (not blocking Wave 4):
- **Interior column snap.** The proforma line-item columns (Cant. / Precio unit. /
  Precio total) are right-aligned and the last column lands on the 565.6pt rail,
  but the exact interior edges (`grid.ts` `extras.proforma` = 313.1 / 397.8 /
  535.5) are not yet pinned; cotización/ficha/RB interior tables likewise use
  their existing widths. Snap each to the grid lines.
- **Live-route visual pass.** The composition was verified via a static fixture
  (the TOWER `/proforma/[id]/document` route needs a running app + data to render).
  Do a browser `window.print()` smoke of all four routes once the app is up.
- **@react-pdf StyleSheet.** Wave 6 canonical PDF reads the same `docGridCssVars()`
  object so both renderers stay in lockstep.

## Quotation-document intelligence — deferred follow-ups (Waves 0–4 + Anexo shipped)

The five-stage intelligence layer landed on `claude/branded-proforma-pricing-0jyzbx`
(spine → issuer parity → capture bridge → shared grid → anexo). Persistence is
`tower_56` (`issuing_entities`, applied to prod, entities seeded). What remains,
each pointing at the pattern it copies:

- **(a) Wave 5 — document window + editors.** A `QuotationsWindow` (⌘K "Generar
  documento" affordance) listing quotes and deep-linking their four document
  routes, plus per-document `saveDocumentDetails` editors exposing the intelligence
  variables (issuer/entity override, destination port/country, banking toggle,
  locale) the way `QuoteSavePanel` already does for the copilot proposal. Pattern
  to copy: `components/shell/QuoteSavePanel.tsx` (issuer chip/override + snapshot
  freeze) and the Stage-2 entity-aware actions.
- **(b) Torre `parse-spec` destination mouth.** Wire the Torre spec-parse capture
  so an extracted destination (port/country) flows into `composeQuote({issuerId,
  portOfDestination})` exactly as the Mister capture path does. Mirror Stage 3
  (`lib/actions/mister-quote.ts` → `composeQuote`); no new resolution logic, just
  a second mouth onto the same bridge. Approved earlier as a later stage.
- **(c) Wave 6 — canonical @react-pdf server route + distribution.** A server PDF
  renderer that consumes the same `lib/quotation/grid.ts` `docGridCssVars()` tokens
  so browser-print and server-PDF stay in lockstep, plus n8n/WhatsApp distribution.
  Biggest remaining lift (new dependency + renderer); deliberately NOT bolted onto
  this branch.
- **(d) Proforma interior column snap + live-route print pass.** Pin the proforma
  line-item interior edges to `grid.ts` `extras.proforma` (313.1 / 397.8 / 535.5)
  and do a browser `window.print()` smoke of all four routes once the app is up.
  (Also tracked under "Document grid — conformance follow-up" above.)
- **(e) ~~Prod drift: `tower_55_team_space`~~ — RESOLVED.** Recovered verbatim
  into `supabase/migrations/20260724160000_tower_55_team_space.sql` (byte-identical
  to prod); the missing `audit_trigger()` on its two tables was then closed forward
  by `tower_57` (applied to prod, triggers verified live). See the drift section.
- **(f) `org_rules.ports_default` wiring + entity `validityText` from
  `validity_days`.** The a-ruling: derive an issuer's default destination ports
  from `tower.org_rules.ports_default` and compute `validityText` from the entity's
  `validity_days` rather than a stored string, so policy and identity stay their
  separate axes.

## ~~Drift: tower_55_team_space applied to prod, file absent from repo~~ — RESOLVED
This branch recovered `supabase/migrations/20260724160000_tower_55_team_space.sql`
verbatim from the prod ledger (`schema_migrations.statements[1]`, ledger md5
`026a3e7cf572c438132f2bbe2023e469`). Independently, **`master` also recovered the
same migration** (the WS8 workstream) with the same version and identical DDL but
richer inline comments — an add/add conflict reconciled in the PR #35 merge by
**taking master's documented version** (DDL is the same schema prod already has;
comments are additive, and version `20260724160000` is already in the ledger so it
never re-runs). Repo and prod are in sync. General law still stands: cross-check
`list_migrations` against `ls supabase/migrations` before every new migration.

**~~Follow-up (Directive 4 gap)~~ — CLOSED (`tower_57`).** The recovered migration
did not attach `audit_trigger()` to its two mutating tables (`tower.team_notes`,
`tower.team_note_mentions`) — it was applied that way before the file existed, and
was recovered *as applied* (recovery must not diverge from prod). Closed **forward**
by `supabase/migrations/20260725120000_tower_57_team_space_audit.sql` (attaches the
shared generic trigger to both tables; idempotent), **applied to prod** — ledger
recorded at the exact version `20260725120000`; both triggers verified live
(`AFTER INSERT/UPDATE/DELETE`). The recovered `tower_55` file was left untouched.
