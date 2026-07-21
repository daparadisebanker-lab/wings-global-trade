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
