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

The three recommended next-step tracks, in priority order.

---

## ① Deploy + verification pass  ·  *do this first*

Nothing we built is live until this is done. A browser pass will also surface
anything real before we build further.

- Apply migrations **`tower_22 → tower_33`** to the prod Supabase project
  (`pyznlglvwihosemqkhtq`).
- Set env: **`JOURNEY_SIGNING_SECRET`** (import-journey HMAC) and
  **`NEXT_PUBLIC_SITE_URL`** (promo listing URLs).
- Bootstrap the **first group admin by email** (one-time SQL noted in `tower_32`);
  the UserManager toggle handles the rest of the 5-person team afterward.
- Drive the real flows end to end: quote → PDF · costing → cost sheet · activate
  a container → author copy → download PNG → public active-container page.

**Why first:** everything else is dark until this lands.

---

## ② MediaManager signed-upload pipeline  ·  *unblocks the most downstream work*

`components/catalog/media-manager/MediaManager.tsx` is a **stub** — the
`upload → signed-URL → variant → kind-tagging` pipeline to Supabase Storage is
not wired.

- Real signed-upload flow to Supabase Storage.
- Wire brand-kit asset slots (`BrandKitPanel`) to `rb/{code}/…` (finishes RB
  Console Wave 1b).
- Wire catalog product images.

**Why second:** it blocks brand kits, product images, and spec visuals — the
most downstream dependencies. Highest leverage after go-live.

---

## ③ Round out the promotion feature  ·  *finish what we're in*

- **Public active-container OG image** — so the WhatsApp/share link unfurls with
  the brand share card (reuse `buildPromoCardSvg` → resvg).
- **Promotion analytics / n8n** — emit an event on container activation (lane
  dimension into the wings Supabase project); today activation is untracked.

**Why third:** self-contained polish on the feature just shipped; valuable but
not blocking.

---

## Full remaining backlog (context)

Beyond the three tracks above, these were always queued (not regressions):

- **RB allocation status machine** — reserve exists (`public.rb_reserve`); the
  `RESERVED → CONFIRMED → LOADED → RELEASED` transitions + RLS UPDATE policy are
  deferred to RB Console Wave 3, and there's no job to flip expired reservations
  to `RELEASED` for the ledger.
- **RB product management per brand** — add/remove products + specs per brand and
  the `/marcas/[brand]/productos` editor (Wave 2, `tower_26`) — SQL-seed-only today.
- **Brand PDF quote + technical spreadsheet** ("regardless of category") — the
  `tower_22` quotation engine isn't adapted to represented-brand containers yet
  (Wave 5 · `techSheetSections` in `@wings/rb-core`).
- **Site brand-layout `--rb-*` token injection** — `getRbLiveBrandBySlug` exists;
  the brand layout still runs on Áladín fixtures (Wave 4).
- **Rep cross-category catalog browse UX** — read policy (`tower_31`) is live; a
  dedicated browse view for a pure rep with no editable lane is unbuilt.
- **Import-journey milestone automation** — ops bar + client tracker exist;
  automated phase advancement (n8n) does not.

_Migrations `tower_26–29` are reserved-but-unbuilt per
`programs/represented-brands-console/SPEC.md`._
