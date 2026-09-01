# Automóviles — scope & perspective (car-first direction)

**Status: WGT/07 — Phase 0, 1, 2 COMPLETE. Phase 2 re-derived 2026-08-24
(showroom pivot). Phase 3 (IA / route migration) COMPLETE: both taxonomy
axes are real pages (5 segment drill-downs + 11 brand pages), a persistent
in-lane nav, a comprehensive landing page, and `/catalogo/automoviles` now
308-redirects to `/automoviles` (verified live — every first-party link on
the site points directly at the new URL; only external/indexed links to the
old one round-trip through the redirect).**

## 0m · First real photography lands + 4 new nameplates (2026-08-31)

The account owner supplied a zip of 24 PNGs ("Autos para web"), two per
model — a white-background studio hero and a transparent-background cutout
— for 12 nameplates. This is the first real photography this lane has ever
had; every gap logged in §0j/§4·1 about `images: []` and no asset folder
existing is now partially closed.

**Mapping, not assumed 1:1.** 7 of the 12 photographed nameplates matched
existing catalog entries exactly (Toyota Camry, RAV4, Prado, Corolla —
photographed as "Corolla Hybrid XLE" but wired to the general Corolla
nameplate, no separate hybrid-trim product exists — Jetour X70L, X70Plus,
Traveler). The Jetour Traveler pair had two source sets, "T1 Jetour" and
"Jetour Traveller T2" (real Changan-family trim/generation naming); T2 was
used as the canonical pair (newer generation), T1's originals are unused —
worth a five-second confirmation with the account owner if T1 was meant to
be the primary instead. One filename gotcha caught, not assumed: "Jetour
Traveller T2.png" had no "FONDO"/"SIN FONDO" suffix at all; confirmed via
`sharp` alpha-channel inspection (opaque white corners = hero, transparent
corners = cutout) rather than guessed from the name.

**4 of the 12 had no catalog entry at all**: Changan New CS75 Plus, Changan
CS75 Pro, Changan X5 Plus, Hyundai Sonata (2024, red unit photographed).
Flagged to the account owner rather than silently fabricated or silently
dropped — confirmed to research real specs and add them. Sourced from
official importer/manufacturer material, not invented: Changan Perú's own
site (changan.com.pe) for New CS75 Plus (exact trim names, engine, power)
and confirmed X5 Plus and CS75 Pro are NOT in that importer's lineup —
X5 Plus is China-domestic-only (AutoCango spec listings), and CS75 Pro's
export nameplate very plausibly corresponds to Changan Perú's own "X7
Plus" (same 1.5T/185HP/300Nm, same 6MT/7DCT options, same 3-row 7-seat
body) — flagged inline in that product's description as needing Rowe
confirmation rather than asserted as certain. Hyundai Sonata sourced from
Beijing-Hyundai's 11th-gen China launch (1.5T/2.0T, 8AT); exact trim names
weren't findable, so trim strings follow this catalog's existing
Beijing-Hyundai GLX/Elite/Premium convention and are flagged as
approximate — same discipline already applied to Audi E5/E7X's fuel-label
uncertainty.

**Processing.** Originals were 2732×2050 PNGs, ~1–1.8MB each (33MB total).
Resized/compressed with `sharp` (already a repo dependency): hero → max
2000px edge, high-quality PNG (~250–390KB); card cutout → max 900px edge,
palette-quantized PNG with alpha preserved (~60–90KB) — verified
programmatically post-compression that palette quantization didn't
flatten the transparency (`ensureAlpha().raw()`, corner alpha still 0).
Stored at `apps/site/public/images/listings/{slug}/{hero,card}.png`,
matching the folder-per-slug convention the maquinaria-agricola listings
already established (not a new pattern).

**A real architectural gap this surfaced, fixed, not worked around.**
`MotionCard`'s card-breakout treatment (§0j) and every other `images`
consumer (`ProductGallery`'s hero, `ProductCard`, the OG image, the
comparison tool, Mister's tool cards — all grep'd, all confirmed) both
read `images[0]`, which cannot simultaneously be a white-background hero
and a transparent cutout. Fixed by convention, not a schema change: index
0 stays the hero (every non-automóviles consumer is untouched), index 1 is
the transparent cutout — only `MotionCard`'s two callers
(`BrandModelGrid.tsx`, `(lanes)/automoviles/[segment]/page.tsx`) changed,
from `p.images?.[0]` to `p.images?.[1]`. Documented inline in
`MotionCard.tsx`'s own comment so the next photography drop doesn't
silently regress it.

**Data written to all three places this lane's data already lived in
parallel** (the §1 "gotcha" about the two seed.json files drifting is a
known risk, not a surprise): `apps/site/src/data/seed.json` (the file the
app actually imports), root `data/seed.json` (the infra-pipeline source),
and `data/automoviles-catalog.ts` (documentation-only, confirmed via grep
not imported by any app code, but kept accurate per root CLAUDE.md's
"a stale line is worse than a missing one"). The 4 new products used the
same UUIDs across all three plus Supabase, rather than three different ids
for the same car.

**Production write, done with explicit go-ahead, not bundled silently.**
Consistent with this file's own earlier note (§4·2) that pushing rows into
the shared, live Supabase project needs an explicit go-ahead: asked before
writing anything. Confirmed, then ran a scoped `UPDATE ... WHERE slug = …`
per existing row for the 7 image pairs (`public.products`, explicitly
schema-qualified — `information_schema.columns` showed a same-named
`tower.products` table with a materially different shape, brand_id/lane_id/
status/spec_schema_id/etc., confirming CLAUDE.md's danger-zone warning
about that schema is real and not theoretical), then an explicit-column
`INSERT` for the 4 new nameplates (sort_order 32–35, appended after Wuling
rather than renumbering existing rows to preserve brand-adjacent
ordering). All 11 rows re-queried post-write to confirm, not assumed.

**Verified.** `pnpm --filter site typecheck` and `pnpm build` both green
(all `/automoviles/marcas/[oem]` and `/automoviles/[segment]` SSG params
rebuilt). Rebuilding was required for the second, live-Supabase-backed
verification pass — these routes are SSG (`generateStaticParams`), so a
`pnpm start` from a build taken before the Supabase writes still served
stale (imageless) HTML even though the database was already correct; this
cost one extra build/restart cycle before the served HTML actually showed
the new `/images/listings/...` paths. Confirmed via direct image inspection
(`sharp`, corner-alpha check) that cutouts are genuinely transparent, not
just visually appearing so in a preview tool that composites onto white.

**Not done, on purpose:** the 8 remaining photographed-but-still-uncataloged
nameplates from the original 31 (everything outside Toyota/Jetour/the 4 new
Changan+Hyundai entries) still ship `images: []` — no photography exists
for them yet. The unused "T1 Jetour" pair is not deleted, just unwired.
No deploy to the live Vercel production URL was triggered by this session —
verification ran against a local `pnpm build && pnpm start` pointed at the
real Supabase project; the next `git push`/deploy will pick up the code
changes (image-index convention, seed.json) automatically, and the
Supabase data change is already live regardless of deploy state.

## 0e · Redirect (2026-08-24, same day)

`next.config.mjs` now 308-redirects `/catalogo/automoviles` → `/automoviles`,
including 11 brand-specific `?brand=X` redirects to the real brand pages
(matched by exact `has` query value, checked before the bare fallback since
Next.js resolves `redirects()` in array order) and a `?fuel=hibrido`
fallback to the lane root (no dedicated hybrid view exists yet — MegaMenu's
own "Híbridos" link carries the identical honest caveat). Individual
product-detail pages (`/catalogo/automoviles/{slug}`) are **deliberately
NOT redirected** — the new lane has no per-model detail route yet (brand
pages show a card grid, not a drill-down), and the old generic
`/catalogo/[category]/[slug]` page still renders full, correct specs;
redirecting those would have traded a working page for a worse one.

All nine first-party call sites that built `/catalogo/${slug}` inline
(SiteNav, MegaMenu ×2, MobileMenu, Footer ×2, CategoryGrid, CategoryNav,
NavCategoryDropdown — the last unused in production, fixed anyway since it
cost one line) now route through one helper, `@/lib/category-href.ts`,
rather than duplicating the automóviles special-case nine times. `sitemap.ts`
gained entries for `/automoviles`, the 5 segment pages and 11 brand pages,
and its generic category loop excludes automóviles (already listed with its
own priority) so the redirect's origin URL never appears in the sitemap.
`catalogo/page.tsx`'s bare-`/catalogo` redirect goes straight to
`/automoviles` now too, avoiding a double-hop through the new redirect.

**A real, verified-not-assumed finding:** the brand-specific redirects
forward their query string by default (documented Next.js behavior — a
`has` match on a literal value, not a named capture group, doesn't get
"consumed"), so `?brand=Toyota` lands as `/automoviles/marcas/toyota
?brand=Toyota`, not a clean URL. Confirmed live with `curl -L`, not assumed.
Fixed with `alternates.canonical` on the lane root, roster, segment and
brand pages, so search engines treat the query-string variant as the same
page rather than flagging duplicate content — also confirmed live, the
canonical tag renders correctly stripped.

**A second, genuinely positive side effect, also verified:** adding
automóviles to `@/lib/lanes/registry.ts`'s `LANES` array — done in the
earlier navigation pass, before this route existed — was inert until this
redirect shipped. Now that `/automoviles` is a real top-level route,
`laneFromPath()` resolves it and the existing `LaneScope` mechanism (root
`<html data-lane="...">`, the same one Interiores already uses) themes the
*global* SiteNav and Footer chrome — not just the lane's own content — on
every automóviles page. This was always the intended behavior once the
migration landed; it needed no additional code, just the route to exist.

## 0d · In-lane navigation + segment IA (2026-08-24, same day)

Run through `/information-architecture-audit` at the account owner's
request ("navigation system for it to be a proper site in itself... the
comprehensive landing page"). The core finding: the dual taxonomy
lane.config.ts declares (segment canonical, brand overlay) was only half
real — 11 brand pages existed, zero segment pages did, so the "canonical"
axis was decorative cards with no destination. Fixed:

- **`AutoLaneNav`** (`components/features/automoviles/AutoLaneNav.tsx`) —
  one persistent sticky bar, mounted once in the lane layout, self-detecting
  its mode from the URL rather than requiring every page to prop-drill a
  brand down from the layout (which doesn't have easy access to the nested
  `[oem]` param). Default mode: segment links + Marcas + Cotizar, in the
  lane's own ion-blue. Brand mode (on `/automoviles/marcas/{oem}`):
  collapses to a breadcrumb in the brand's own `--oem-accent`, so the
  curtain flood's color carries through into persistent chrome instead of
  fading after the arrival animation. Replaces the brand sub-page's earlier
  standalone sticky header — two stacked sticky bars under the site header
  was real, avoidable mobile clutter.
- **Five segment drill-down pages** (`(lanes)/automoviles/[segment]/`,
  `generateStaticParams` over `lane.taxonomy`) — cross-brand by design (one
  segment, all 11 brands), the natural place the "multiple brand colors"
  brief actually shows up in one grid: each card is individually
  `data-oem`-scoped to its own brand's accent, not a single lane color.
  Reverse brand lookup (`getOemBrandByName`) added to `oem-brands.ts` for
  this — the forward lookup (`getOemBrand`, slug→brand) already existed,
  the reverse (plain filter_attrs.brand name → OEM record) didn't.
- **Brand pages now cross-link back to their segment** — a real gap the
  audit named specifically ("brand pages have no cross-links to segments"),
  fixed with one `<Link>` per card's Segmento field.
  `segments.ts`'s explicit map was already built for the lane-root count
  fix; reused here rather than duplicating segment-name logic.
- **Lane root rebuilt comprehensively**: segment cards are now real links
  (previously informational only); added a "Cómo se compra" section
  explaining the dual unit math (`lane.unitMath` from Phase 0 — per unit
  vs. per container — was declared in the config but never surfaced in any
  UI copy until now); the brand strip expanded from a 6-brand preview to
  all 11 with real per-brand counts.

**A real bug caught by screenshot comparison, not assumed correct:**
`oem-canvas.css`'s selectors were written as compound
(`[data-lane='automoviles'][data-oem='toyota']`, both attributes on the
SAME element) but the actual DOM has `data-lane` on the layout's wrapper
and `data-oem` on a nested descendant — never the same element. The rules
silently matched nothing. Caught by comparing Audi's expected pure-black
accent against a screenshot rendering it grey instead; fixed by changing
every rule to a descendant combinator (a space). Documented in
`oem-canvas.css` itself so the mistake doesn't recur.

**Still not done — the honest remainder:** `/catalogo/automoviles` is not
yet redirected to `/automoviles` (both live in parallel; nothing indexed
against the old URL breaks, but nothing forces traffic to the new one
either). No OEM logo/photo assets exist anywhere in this repo — every page
in this section is still typography-and-spec-led. The roster page's
"cotizar" flow and the segment/brand pages all point at the same generic
`/cotizar` form, not a lane-aware or brand-aware prefill.

## 0c · Showroom pivot (2026-08-24) — Phase 2 re-derived, Phase 3 begun

The account owner reviewed the dark asphalt/ion-blue direction and redirected
it: WGT/07 is a **multi-brand showroom** (11 OEM factories under one desk),
not a single-vendor EQUIPMENT lane, and a single dark identity fights the
thing it needs to showcase — eleven brands' own colors. Run through
`/visual-audit`, `/creativity-engineer` and `/engineering-quality-audit`
explicitly at the account owner's request; findings and the resulting build:

- **Ground flipped to white** (`#FFFFFF`), superseding the dark asphalt
  derivation — not deleted, amended in place in `packages/liveries/
  registry.md` (append-only discipline: the old derivation table stays
  readable, a new one explains what changed and why). Same argument RB's
  `(brands)` white canvas already uses: multiple palettes need a neutral
  ground.
- **The lane's own ion-blue accent stays**, but its role shrank: it's now
  the *lane's* quiet signature (roster page, segment browsing, focus rings,
  the lane stamp) rather than the dominant color of every product. It also
  needed a genuine re-derivation once the ground flipped — full ion-blue on
  white measures only 3.08:1 (fails text contrast), so it split into
  `--accent` (decorative/large-graphics, ≥3:1) and `--accent-ink` (a deeper
  cobalt in the same hue family, 6.10:1, text-safe) — the exact pattern
  RB's Áladín green already uses for the identical reason.
- **11 OEM brands got their own researched, sourced accent colors** —
  `packages/liveries/automoviles/oem-canvas.css`, `[data-oem="{slug}"]`,
  compound-scoped under `[data-lane="automoviles"]` so it can never collide
  with RB's own `[data-brand]` namespace (flagged in §3 below since before
  this build existed). Sourced where an official hex exists (Toyota,
  KIA, Audi, BMW, Hyundai, MG, Wuling all confirmed); flagged honestly as
  approximate where it doesn't (Changan's exact blue, and Star 5 — a
  Changan-family nameplate with no independently published palette). All 11
  clear 4.5:1 on white directly — none needed the ink-split ion-blue did.
  Deliberately **not** hue-separated from each other the way WGT lane
  accents are against the registry: several are authentically red or
  authentically blue in real life, and logo + name label — not hue —
  disambiguate a real showroom floor.
- **Reused RB's motion machinery rather than forking it** (prime directive
  #1): `BrandChoreography` (scroll reveals) is fully brand-agnostic already
  and reused verbatim, zero changes. `BrandCurtain` (the route-entry color
  flood — the actual "one thing," the moment a buyer knows which brand's
  world they just entered) was generalized with additive, default-preserving
  props (`scopeSelector`, `accentVar`, `markDataKey`, `fallbackColor`) so
  Áladín's live page needed zero changes and carries zero risk — verified
  by re-typechecking and re-screenshotting `/marcas/aladin` after the change,
  not just asserted. `BrandHero` and `BrandShelfNav` were **not** forced into
  reuse: both are tightly coupled to RB's brand-kit data shape (hero
  slides, isologo, claim copy) that doesn't exist for OEM car brands — no
  logo or photo assets exist in this repo for any of the 11, same gap
  already logged for car photography. Building lightweight,
  automóviles-specific headers instead of fabricating placeholder brand
  story content was the honest call.
- **New routes, real data, no fabricated content:** `(lanes)/automoviles/
  page.tsx` (segment-led lane root), `.../marcas/page.tsx` (the 11-brand
  roster), `.../marcas/[oem]/page.tsx` (per-brand catalog, generated
  statically for all 11 slugs). Brand pages show the real fleet catalog
  (segment, engine, transmission, trims from `data/seed.json`) rather than
  invented "about the brand" marketing copy — a buyer wants the model
  lineup, not fabricated brand mythology Wings has no source for.
- **Convention fixes caught by self-review, not assumed clean:**
  `SiteNav`'s `forceSolid` list was missing `/automoviles` — the
  transparent-over-hero nav default would have been illegible over the new
  white-ground pages, the exact failure mode Interiores' own code comments
  warn about. Fixed. The first draft of the three new pages also used
  inline `style={{}}` props for dynamic token colors — `apps/site/CLAUDE.md`
  explicitly forbids inline styles ("Tailwind utilities only") — rewritten
  to Tailwind arbitrary-value bracket syntax (`text-[color:var(--ink-primary)]`)
  throughout before this was called done.

## 0b · Phase 2 — livery derivation (closed 2026-08-23, same day)

Full measured derivation lives in `packages/liveries/registry.md` (candidate
table + rationale) and the token file itself is
`packages/liveries/automoviles/livery.css`. Short form:

- **Ground** `#15161B` asphalt — the environment the cargo lives in (Phase-2
  step 1), distinct from house navy rather than a reuse of it.
- **Ink** `#EEF0F3` cool white, matching the ground's cool temperature (step
  2). 15.82:1 on ground, checked against both surfaces the lane uses.
- **Accent** `#5590FF` ion blue — the material signal every trim in the
  catalogue shares regardless of brand (LED DRL / xenon HID glow), not a
  paint colour (step 3). 178.8° from house gold, well past every other
  registered lane accent (step 4). A first-pass `#3D7FFF` cleared the base
  ground at 4.88:1 but fell to 4.45:1 on the raised card — rejected on that
  technicality and re-derived with margin (5.87:1 / 5.34:1) rather than
  shipped short, the same "measure every ground it renders on" discipline
  WGT/02's ink-secondary note sets.
- **Texture** `blueprint-grid` (step 5) — faint accent-hue grid lines,
  literally an engineering-drawing motif.
- **Type posture** `compressed-caps` (step 6) — EQUIPMENT's fixed posture,
  not chosen freely.

**What Phase 2 does NOT do:** wire the route. The livery file exists and is
verified against the shared `LaneStamp` organ's actual token reads (confirmed
by grep — `--lane-type-stamp`, `--lane-label-tracking`, `--ink-secondary`,
the `.lane-stamp`/`.lane-stamp-check` classes are all covered), but no page
in the app sets `data-lane="automoviles"` yet, so nothing visibly changes on
the live site from this commit alone. That's Phase 3.

## 0 · Phase 0 — qualification interview (run 2026-08-23)

Run one question at a time per §4, after the tactical catalog build (§1
below) had already shipped and after redirecting first into broader
competitive research (§2) rather than answering from assumption. Answers,
verbatim in substance:

1. **Buyer** — mixed; no single dominant profile. Car dealers/lots, fleet
   and corporate buyers, and independent resellers/importers all plausible,
   none ruled out at this stage.
2. **Archetype** — EQUIPMENT, confirmed explicitly against the decision
   tree (not defaulted to). Same archetype as the not-yet-onboarded WGT/01
   Machinery; see §3 below for why that didn't collapse this into a
   sub-category instead of a new lane.
3. **Unit math** — per unit (configured trim) **and** per container/fleet
   slot — a fleet buyer orders N of one trim, which is a different RFQ shape
   than a single dealer unit. Dual math, not per-unit-only.
4. **Taxonomy** — dual, confirmed explicitly. Segment is canonical (≤8 rule,
   five stable entries); brand is the curated overlay (11 today, will grow
   past what ≤8 canonical URLs could hold). Detail in `lane.config.ts`.
5. **Photography feasibility** — not ready (established in the tactical
   build, §4 below). Typography-and-spec-led launch, `INTERIM_TYPOGRAPHIC`.
6. **Mister knowledge source** — the Rowe fleet sheet is the durable source
   of truth for the `wgt-07-automoviles` pack, once built (not yet built).
7. **Commercial readiness** — yes. 76 trims across 11 brands are already
   costed in Rowe today; this lane opens on real inventory, not a promise.

**Lane-vs-category fork, run explicitly rather than assumed:** because
automóviles shares its archetype and unit math with WGT/01 Machinery
(not yet onboarded, but already covering camiones/buses/equipo-industrial/
maquinaria-agrícola in the pre-lane catalog), the decision tree's default
answer is "sub-category of WGT/01," not a new lane. Offered as an explicit
choice; the account owner chose **own new code (WGT/07)** — the car-first
prominence direction outweighs the cheaper "fold into Machinery" path. Codes
01 and 03–06 stay reserved for the archetype table's named six; WGT/07 is a
deliberate seventh, not a gap-filler.

**Gate met.** `packages/liveries/automoviles/lane.config.ts` now carries all
seven answers. `packages/liveries/registry.md` carries the WGT/07 row
(Phase 1 facts only — code/slug/name/status; livery columns explicitly
blank pending Phase 2, not backfilled with an undeliberated color).

**Registration checklist (§4 Phase 1) — status per this codebase's actual
structure, not the spec's idealized one:** this site has no literal
"Manifest lane index" page; the equivalent surfaces are the homepage
`CategoryGrid` (leads with automóviles — done, §1), the footer colophon and
`sitemap.ts` (both DB-driven off `categories`, automóviles included and
first — done, §1). Analytics lane dimension not yet wired — flagged as
outstanding in §6.

**What Phase 1 deliberately does NOT include yet:** the lane still renders
on `/catalogo/automoviles` under the shared house chrome (navy/gold), not a
dedicated `/automoviles` route with its own livery. That's Phase 2 (livery
derivation) and Phase 3 (IA — route migration) — both real, undone work, not
implied by "lane code assigned." See §5 for the proposed next steps.

---

This is the scope log requested when the automobiles catalog was populated and
promoted to the front of the site (2026-08-23). It records what shipped, what
it's built on, what it deliberately does not do yet, and the decisions that
have to be made before "car-first" becomes more than a promoted category.
Follow the root `CLAUDE.md` §4 Lane Onboarding Protocol framing throughout —
this program is written against it, not instead of it.

## 1 · What shipped this session

- **Catalog data** — `data/automoviles-catalog.ts`: 31 model lines / 76 trims
  across 11 brands (Audi, BMW, Changan, Hyundai, Jetour, KIA, Mercedes-Benz,
  MG, Star 5, Toyota, Wuling), parsed from the fleet costing sheet
  (`wingscosteoflota20260814_4.xlsx`, "CST · Costeo SUNAT", 2026-08-14 —
  76 modelo(s) · 11 marca(s)). Trims were grouped into nameplates (e.g. nine
  Audi cost rows → seven nameplates: A3 Sportback, A5L, A7L, E5 Sportback,
  E7X, Q3, Q5) so the site reads as a buyer browses, not as the sheet is
  keyed.
- **No pricing carried over, by design.** The sheet's FOB, flete, CIF, ISC,
  landed cost, margin and IGV columns were intentionally never touched — that
  math already lives in Rowe. The `Product` schema has no price field at all,
  so this isn't a suppressed column, it's a category that structurally cannot
  render one, same as every other category on the site (prime directive #2 —
  wholesale only, RFQ is the only primary action).
- **Basic specs researched per nameplate** — segment, engine/displacement,
  transmission, drivetrain, seat count — from the sheet's own fuel/CC columns
  plus targeted research for nameplates outside common knowledge (China-market
  JV cars: Audi A5L/A7L/E5/E7X, BMW 325Li, Hyundai ix35, Jetour Dasheng/
  Traveler, Changan M60, KIA KX1, Wuling Hongguang V, Star 5). Flagged inline
  in the data file where the sheet's own fuel label looks inconsistent with
  public spec sheets (Audi E5/E7X logged as gasoline in the cost sheet; public
  sources describe the E-series as Audi China's EV line) — worth a one-line
  confirmation against the supplier docs, not something to silently resolve
  either way.
- **Wired into the existing catalog, not a new page.** `data/seed.json` got
  an `automoviles` category (id `…106`, `sort_order: 1`) and 31 product rows,
  one per nameplate, `specs` + `filter_attrs` (brand/fuel/transmission/
  traction) populated, `images: []`. This reuses `ProductGrid`,
  `ProductDetail`, `FilterSidebar`, the RFQ flow, SEO/JSON-LD and the sitemap
  for free — prime directive #1 (same box, different livery: theme or feed
  the shared organ, never fork it).
- **Navigation promoted, not rebuilt.** Automóviles now leads: first
  `SiteNav` link (ahead of the Catálogo trigger itself), first `MegaMenu`
  column, first `MobileMenu` world (as a direct link, one catalogue deep —
  same pattern Interiores uses), first `CategoryGrid` tile on the homepage,
  and — because `/catalogo` redirects to `categories[0].slug` — the bare
  `/catalogo` URL now lands on `/catalogo/automoviles`.
- **Verification run:** `pnpm --filter site typecheck` and `pnpm --filter
  site lint` clean; `pnpm build` (production) exits 0. A local `next start`
  smoke test confirmed `/` renders "Automóviles" as the lead nav item,
  `/catalogo` redirects to `/catalogo/automoviles` (200), the category page
  lists all 11 brands with specs and zero price strings, and
  `/catalogo/automoviles/toyota-camry` renders the full trim/spec table.
  Not yet done: a real RFQ submission click-through, and mobile-viewport
  verification of the drawer.
- **Gotcha worth flagging for whoever touches this next:** the repo carries
  **two** `seed.json` files — root `data/seed.json` (the infra-pipeline
  source, generated/consumed by `infrastructure/scripts/*`) and
  `apps/site/src/data/seed.json` (the actual dev/local-fallback fixture the
  app imports via `@/data/seed.json`, per `CLAUDE.md`'s `@/` → `apps/site/src`
  alias). They are **not** kept in sync automatically — the app-local copy
  had 16 products where root had 38. This build updates both with the same
  automoviles category + 31 products (same IDs in both), but a first pass
  only touched the root file and shipped a silent 404 on
  `/catalogo/automoviles` until caught by a smoke test. Anything added to
  root `data/seed.json` going forward needs the same manual mirror into
  `apps/site/src/data/seed.json`, or the two files will drift again.

## 2 · dubicars.com — what it does and what we took

Researched via web search (no scrape of the live UI). Their structure:

- **Browse by make → model → trim**, with a live count next to each trim
  ("Toyota Camry XLE · 42 listings") — browsing converts into a number before
  the buyer commits to a click.
- **Secondary browse by vehicle type** (Sedan / SUV·Crossover / Hatchback /
  Van / Bus…) as an alternate entry axis, not a replacement for make→model.
- Search-as-you-type resolves straight to trims across makes.

What that implies here, and what's deferred:

- **Taken now:** brand → nameplate → trim is exactly the shape
  `data/automoviles-catalog.ts` and the new product rows already carry
  (`models[]` on each product *is* the trim list). The MegaMenu's automóviles
  column is dubicars' make-first entry, scaled to a wholesale five-brand
  shortlist (Toyota, Jetour, KIA, Audi, Híbridos) rather than all eleven —
  a mega-menu column isn't the place for eleven rows; `/catalogo/automoviles`
  is, via the brand filter.
- **Deferred, not forgotten:** a body-type facet (Sedán/SUV/MPV/Van) is real
  data we already have (`specs.Segmento` on every product) but isn't wired as
  a filter yet — `FilterSidebar`/`filter_attrs` would need a `segment` key
  added the same way `traction`/`transmission` already work. Trim-level
  listing counts don't apply here the way they do on a live marketplace —
  Wings sells against Rowe's landed fleet, not an open listings pool — so a
  "42 listings" badge would overstate what's true; a "Versiones disponibles"
  count on the spec table is the honest equivalent, already shipped.
- **Not taken:** dubicars is consumer-facing with visible pricing, financing
  and individual VIN listings. None of that applies here — wholesale-only
  holds, and a car-first Wings is still B2B, not a marketplace.

## 2b · Broader comparable set — what actually decided the archetype

dubicars is a UAE consumer resale marketplace — not the same shape as a
factory-to-distributor catalog. Asked to broaden before answering the
archetype question (Phase 0 · Q2, §0), which surfaced two genuinely distinct
shapes and clarified where Wings actually sits:

- **Shape A — China export marketplaces** (AutoCango, AutoFromChina,
  BeForward, SBT Japan): huge multi-brand inventory, filterable by
  brand/model/year/**price**, unit-level VIN listings, price shown openly,
  buyer ranges from an individual to a small reseller. AutoCango in
  particular is close in *content* shape — multilingual spec database across
  Chinese OEMs including several brands Wings also carries (Changan, Audi,
  BYD, Toyota) — but sells on visible price, which the wholesale-only
  directive rules out here.
- **Shape B — OEM international/export sites** (Chery International, Jetour
  International): single-brand, model lineup organized by segment, **no
  price shown anywhere**, spec-sheet led, drives to "find a distributor /
  contact us," buyer is a wholesale/distributor prospect.

Wings' build (no price, RFQ-only, spec-led) is architecturally shape B — but
its *content* has shape A's breadth: eleven brands under one roof, which
neither comparable set actually does (an OEM export site is one brand by
definition; a China export marketplace doesn't withhold price). That
combination is what "one storefront, eleven factories" in the lane's scope
line is naming on purpose, not defaulting into. It's also what confirmed
EQUIPMENT over folding into WGT/01 or reaching for a COMMODITY/PROGRAM
read: every one of these comparables, on both sides of the shape divide,
sells a *specified configured unit*, never a fungible grade or a recurring
assortment.

## 3 · Where this sits in the framework — resolved

**Superseded by §0 above — kept for the record of how the question was
originally framed, before the interview closed it.** Automóviles is now
onboarded through the §4 protocol as **WGT/07**, a numbered lane, not a
pre-lane category — the account owner chose that explicitly over the
cheaper "stay a category" or "fold into WGT/01 Machinery" paths (§0). What
follows is what that resolution does and does not change:

- The lane code, archetype (EQUIPMENT), unit math (dual), and taxonomy
  (segment-canonical, brand-overlay) are now fixed in
  `packages/liveries/automoviles/lane.config.ts` — Phase 0 and Phase 1 are
  done.
- The **rendering** hasn't caught up yet: `/catalogo/automoviles` still
  serves the page today, on shared house chrome, because Phase 2 (livery)
  and Phase 3 (IA / route migration to `/automoviles`) are separate,
  undone gates — see §5.

**One naming collision to flag before it becomes a redirect problem:**
`/marcas` is already live and means something specific — RB/xx Represented
Brands (§5-bis, hosted brand shelves, ALLOCATION archetype, white canvas).
Automóviles brand pages must **not** be built at `/marcas/{brand}` or
described as "marcas" in nav copy beyond the plain adjective — they're a
`brand` filter on one category, not a hosted brand shelf. The `SiteNav`
"Marcas" link stays pointed at Represented Brands; this build never touched
it. Keep car brands living under `/catalogo/automoviles?brand=…` (or, if the
category earns dedicated URLs later, `/catalogo/automoviles/{brand}` —
**not** `/marcas/{brand}`) so the two concepts don't collide in a buyer's
address bar.

## 4 · Gaps, honestly

1. **Photography.** `apps/site/public/images/listings/automoviles/` does not
   exist. The prior `data/automoviles-catalog.ts` (4 brands, orphaned, never
   imported anywhere in the app) pointed at image paths that were never
   delivered either. This build ships every model with `images: []` —
   typography-and-spec-led, the exact interim mode `CLAUDE.md` §4 Phase 0·Q5
   explicitly permits and that Interiores (WGT/02) already proved out. It is
   not a placeholder photo, a stock image, or a render — those are the
   refused options. Sourcing real photography per nameplate (or per trim,
   where trims differ visibly) is the single highest-leverage next step if
   "car-first" is meant to compete visually with dubicars-style marketplaces.
2. **Supabase not touched.** `data/seed.json` is the dev/local fallback
   (`getCategories`/`getProducts` read it directly when `createServiceClient()`
   has no config) — in production, the live Supabase `categories`/`products`
   tables are the source of truth. This build did **not** run
   `infrastructure/scripts/seed-supabase.ts` or any migration against the
   production project (`pyznlglvwihosemqkhtq`) — pushing 32 new rows into a
   shared, live database with real users is exactly the kind of action that
   needs an explicit go-ahead rather than being bundled into a data-file
   edit. **`/catalogo/automoviles` will not show live inventory in
   production until someone runs that sync deliberately.**
3. **Fuel-label discrepancy on four Audi nameplates** (§1, above) — sheet
   says gasoline, public spec sheets for the E-series say EV. Worth a
   one-line check against the original supplier PDF before a buyer catches it.
4. **Two duplicate rows folded silently.** The sheet lists "Jetour X70L 1.5
   7DCT Comfort 7 seats" and "…(2)" as separate rows (same for Luxury); both
   pairs were deduplicated to one trim each rather than shown as four. If
   "(2)" actually meant a second distinct configuration (different colour
   allocation, different container slot) rather than a duplicate cost-sheet
   entry, that's lost information — confirm against Rowe.
5. **Mister has no automóviles knowledge pack yet.** The archetype engine
   (discovery → consideration → pre-qualification) has nothing lane-specific
   to say about cars today; it will route generically. Not a blocker for the
   catalog page itself, but a gap the moment "car-first" implies Mister
   should be the primary car-buying conversation too.

## 5 · Recommended next steps, in order

1. ~~**Phase 2 — derive the livery.**~~ **DONE, §0b.**
2. **Phase 3 — IA / route migration.** Move the lane off `/catalogo/
   automoviles` onto its own `/automoviles` route (`src/app/(lanes)/
   automoviles/`, matching Interiores), with the five segment slugs as the
   canonical taxonomy and brand as a `?brand=` overlay carried forward from
   today's build. Needs 301s from every `/catalogo/automoviles*` URL already
   indexed/linked (MegaMenu, SiteNav, MobileMenu, sitemap all point there
   today) — a real migration, not a rename.
3. **Commission photography** per nameplate, or confirm the interim
   typography-led launch is acceptable for longer — same choice Interiores
   made and logged.
4. **Sync to Supabase deliberately** (`seed-supabase.ts` or equivalent), once
   someone has reviewed the 31 rows against Rowe and is ready for the lane
   to carry real inventory in production.
5. **Build the `wgt-07-automoviles` Mister pack** from the Rowe fleet sheet
   (Phase 0 · Q6) — vocabulary, unit-math formulas for both the per-unit and
   per-container paths, diagnosis set, handoff, register, forbidden claims.
6. **Add the `segment` facet** to `FilterSidebar`/`filter_attrs` so the
   dubicars-style body-type browse (§2) becomes a real filter, not just a
   spec-table row — and becomes the canonical taxonomy's filter once §5.2 ships.
7. **Wire the analytics lane dimension** (§0 registration checklist) — not
   done in this pass, flagged rather than skipped silently.
8. If the pivot proceeds toward homepage-level "car-first" (hero imagery,
   homepage copy, header art), scope that as its own follow-up — swap-test
   applies (§4 Phase 2 gate) since a homepage rewrite touches shared chrome
   every other category still depends on.

## 0f · UI direction study + "Ficha Técnica" implementation (2026-08-25)

The lane read as flat once the showroom pivot (§0c) was live — real content,
but every control was the same weight. Rather than iterate blind, three
distinct button/type/spacing systems were built as a comparison artifact
(real content, real OEM hex values, no lorem) and reviewed before touching
code: **A "Ficha Técnica"** (document-forward, restrained, structural),
**B "Vitrina"** (macOS-material showroom — spends the root CLAUDE.md's
2026-07-22 radii/blur amendment nothing in this lane used yet), **C
"Cotización Directa"** (Stripe/Linear confidence, one CTA per view). Chosen:
**A**.

**What A actually fixed, not just restyled.** Building the buttons surfaced
a real bug: every on-page CTA (`Solicitar cotización`, `Ver las 11 marcas`,
the closing-band CTAs) was styled with `--chrome-accent`/`--chrome-accent-ink`
— tokens this livery defines for a control sitting *on* the dark overlay
chrome (SiteNav's hero state, `WhatsAppButton`; those tokens are white-fill/
asphalt-text by design). On the lane's actual page ground (`--surface-0`,
white) that rendered a **white button on a white card** — legible only via
the hover-opacity dim, never as a filled shape. That is very plausibly the
"flat" the visual complaint was naming, not just an absence of shadow/radius.

Fixed with a new button-token pair in `livery.css` (`--btn-primary-bg` =
`--ink-primary`, `--btn-primary-bg-hover` = `#2c2d33`, `--btn-primary-ink` =
white; `--btn-outline-ink`/`--btn-outline-border` = `--accent-ink`,
`--btn-outline-bg-hover` = `--accent-soft`) — the chrome pair is untouched
and stays reserved for controls literally on the dark nav overlay.

**Also fixed while in there:** the lane-root hero had `Ver las 11 marcas`
as the visually primary (filled) button and `Solicitar cotización` as the
outline — backwards against root CLAUDE.md §1.2 ("the primary action of
every lane is always: start a quote conversation"). Swapped the *fill*,
kept browse-first reading order (quote is still second in the DOM, first
in weight is what the directive actually asks for).

**Typography:** product/model names on cards (`[segment]`, `[oem]` pages,
the brand roster tiles) now render in `.font-display` (NissanOpti — the
existing house display face, not a new import; `<h1>`–`<h4>` already got
it for free via the base layer, `<p>`-tag model names didn't). Buttons and
CTAs moved to `font-mono` (Teko, already the lane's label face throughout)
uppercase, replacing unstyled Flexo body weight — this is reuse of tokens
already in the codebase, not a new typeface.

**Radius:** Direction A's mockup used a bespoke 4px; the frozen Tier-1
scale (`packages/ui/tokens/skeleton.css`) only offers `0` (structural) or
`8px` (`--radius-control`) at that end. Buttons take `--radius-control`;
document surfaces (model cards, flow blocks) stay `0` — closer to the
mockup's own "estructural" thesis than inventing an off-scale value would
have been.

**`[segment]` page cards** (the one view that mixes brands, so the one
place a "brandline" device earns its place) gained: a small brand-accent
swatch dot before the Teko brand label, and a hairline-rule + "N versiones"
footer matching the pattern the `[oem]` page already had (`p.models?.length`
— real trim counts already available, not fabricated).

Verified: `pnpm typecheck` and `pnpm build` both green across every
automóviles route (static + the 5 segment + 11 brand SSG params);
Playwright screenshots of the hero, the Sedán cross-brand grid, and the
Toyota brand page confirm the fill/outline swap, the multi-brand dot+footer
pattern, and the display-face model names render as intended. Not
attempted: B or C's patterns, or a hybrid — A was the direction chosen, not
a blend.

## 0g · Engineering-quality pass — overflow/overlap audit (2026-08-25)

Ran a real responsive sweep (Playwright, 4 pages × 4 breakpoints: 375 / 768
/ 1440 / 1920) with an in-page `scrollWidth > innerWidth` detector, not just
eyeballed screenshots. Result: **zero horizontal-overflow offenders** across
all 16 combinations, both before and after the fix below.

**What looked like an overlap and wasn't.** Full-page Playwright screenshots
showed the floating Mister launcher pill sitting on top of hero buttons and
mid-page cards. Traced with `getBoundingClientRect()` on the live, scrolled
page: the launcher is `position: fixed`, pinned bottom-right with a genuine
gap above whatever content is in view — the appearance of overlap is a
known Playwright quirk (a `fullPage` capture temporarily resizes the
viewport to document height, and a fixed element renders relative to *that*
tall viewport, landing "mid-page" in the flattened image). Confirmed with a
real-scroll, viewport-only screenshot: no overlap. No fix needed here —
logged so the next person doesn't re-diagnose it.

**What was real.** `AutoLaneNav`'s segment-tab row (`overflow-x-auto`, every
tab `shrink-0`) had `Cotizar →` as the last flex child *inside* the
scrollable row. At 768px the row doesn't fit, so `Cotizar` — the row's one
conversion action — was the item that scrolled off-screen, rendering as a
clipped "COT" at the viewport edge with no visual hint the row scrolls at
all. Same clipping, smaller stakes, on mobile (a segment label mid-word).

Fixed in `AutoLaneNav.tsx`: `Cotizar` now sits *outside* the scrollable
zone (`shrink-0`, always fully visible); the scrollable zone gets a
`pointer-events-none` right-edge fade (`bg-gradient-to-l from-surface-0 to-
transparent`) so a still-scrollable row reads as one instead of looking cut
off. At desktop widths where nothing overflows, the fade sits over empty
space and is invisible — no regression there.

Verified via a second Playwright pass at 375px/768px (both the default and
brand-breadcrumb nav modes) after a rebuild: `Cotizar` is fully visible at
both widths, the fade renders correctly, breadcrumb mode (3 short segments,
never overflows in practice) is unaffected. One real gotcha hit along the
way: `pnpm start -p 3100` failed silently with `EADDRINUSE` after a stale
server from before the edit was left running — the first two "verification"
screenshots were unknowingly taken against the *old* build and came back
completely unstyled (stale server, rebuilt static-asset hashes mismatched).
Caught by checking `ps`/`ss` rather than trusting the screenshot; worth
remembering that a silent restart failure looks like a real CSS bug until
you check the process actually changed.

## 0h · Explorar — vertical discovery feed (2026-08-25)

Requested as a TikTok/Reels-style scroll-snap browsing mode. Scoped via a
short interview (product-spec-engine's rapid mode, adapted — its generic
8-file greenfield package doesn't fit an existing, heavily-governed
codebase, so the output here is this log entry plus the build itself, not
a separate spec folder) before writing any code:

1. **Alongside the grid, not replacing it.** New route `/automoviles/
   explorar`. The roster/segment/brand pages are unchanged — this is a
   second entry point, not a migration. No swap-test surface, no IA risk.
2. **Card = nameplate, not trim (31 cards, not 76).** Each `Product` row
   already models one nameplate with its trims nested in `models[]` — no
   data reshaping needed, and it avoids swiping past 5 near-identical
   trims of the same car in a row.
3. **Inline quote CTA per card.** `Solicitar cotización — {model}` sits on
   the card itself (root CLAUDE.md §1.2 — quote is always the primary
   action), oem-accent filled, plus a secondary `Ver ficha de {marca} →`
   to the existing brand page. Both link exactly like every other CTA in
   this lane (`/cotizar`, no prefill plumbing — none exists elsewhere in
   the lane either, so this doesn't invent a one-off pattern).
4. **Built now, typography-led**, same interim mode as the rest of the
   lane — swapping in real photography later is a styling change to one
   card component, not a rebuild.

**Mechanics.** `ExplorarFeed.tsx` (client) owns its own scroll region
(`h-[calc(100svh-8rem)]`, `snap-y snap-proximity`) below the persistent
SiteNav/AutoLaneNav — this is *not* the pasillo pattern (dropping site
chrome); chrome stays exactly where it is on every other lane page, the
feed just gets its own scrollable box beneath it. `IntersectionObserver`
(the same pattern `JumpNavigation.tsx` already uses elsewhere in the
codebase) drives a `01 / 31` position register — reusing the house's own
existing "document position" idiom rather than inventing a dot-rail. Entry
point is a promotional banner on the lane root page (between segments and
"Cómo se compra"), deliberately *not* another `AutoLaneNav` tab — that row
was just fixed for overflow in §0g and adding an item risked reintroducing
exactly that.

**Three real bugs found and fixed during build, not just claimed fixed:**

1. **Footer bleed on keyboard nav.** `target.scrollIntoView()` walks up
   *every* scrollable ancestor to bring the target into view — including
   the outer page — which nudged the whole document down and bled the
   site footer into frame beneath the second card. Fixed by scrolling the
   container directly (`scroller.scrollTo({ top: target.offsetTop })`)
   instead, which never touches anything outside the feed.
2. **Rapid keyboard presses silently stalled.** First fix attempt (a ref
   tracking the "last requested index" so fast presses chain correctly)
   didn't address the actual cause: repeatedly retargeting
   `scroller.scrollTo({behavior:'smooth'})` while a previous call is still
   animating fights the container's own `scroll-snap-mandatory` — verified
   by reading `scrollTop` directly after a rapid-press burst: it had
   genuinely stopped advancing, not just lagging on-screen. Real fix is a
   550ms debounce lock: a press mid-transition is ignored rather than
   queued or raced. Verified two ways — 30 presses at a deliberate pace
   (650ms apart) reach card 31/31 cleanly; a rapid 32-press burst at
   120ms intervals is correctly rate-limited (~1 advance per lock window)
   rather than getting stuck, which is also just the right feel for a
   paginated feed, not merely a workaround.
3. **`snap-mandatory` → `snap-proximity`.** While investigating the above,
   tested real mouse-wheel scrolling and could not get it to register in
   this sandboxed Playwright/headless-Chromium environment — but isolated
   this precisely: plain document scroll (`window.scrollY`) responds
   correctly to the same synthetic wheel events (0 → 2264px), while the
   identical events over the feed's nested `overflow-y-auto` container
   produce zero movement, with computed CSS and programmatic `scrollTo`
   both verified correct. This matches a well-documented Playwright
   limitation (synthetic wheel events don't reliably reach nested scroll
   containers in headless mode) rather than a component bug — but since it
   couldn't be *proven* safe in a real browser here, and `mandatory`
   snapping is independently a known friction point against discrete
   mouse-wheel ticks (vs. a continuous trackpad gesture) even outside any
   testing artifact, switched to `proximity`: strictly more forgiving,
   still snaps cleanly on settle, no downside identified.

**Verified:** `pnpm typecheck` + `pnpm build` green; a full 3-breakpoint ×
overflow/footer-bleed sweep (mobile/tablet/desktop) after every change,
clean throughout; keyboard navigation confirmed correct at both a
deliberate pace and under stress; screenshots of cards 1, 2, 3, 10, and 12
confirm brand accent, segment badge, spec grid, trim chips, and the
register counter all update correctly card-to-card.

**Not verified — flagged, not silently assumed:** real mouse-wheel/
trackpad scroll behavior in an actual browser, for the reason in bug #3
above. Everything else (keyboard, the underlying scroll-snap mechanics
that wheel/touch would also drive, touch-simulated direct scroll
manipulation) works correctly, and `proximity` is the safer default either
way — but this is the one thing in this feature that should get a real
five-second sanity check on an actual trackpad/mouse before calling it
fully shipped.

## 0i · Motion pass + downloadable ficha técnica (2026-08-25)

Two requests handled together: run motion-and-soul over the lane's
navigation/browsing, and add a professional, downloadable technical spec
sheet reusing "the mechanism already used for TOWER."

**The TOWER mechanism, actually investigated, not assumed.** Read
`apps/tower/src/lib/quotation/ficha.ts` + `.../actions/ficha.ts` +
`.../components/pipeline/ficha-document` + `.../app/ficha/[id]/document`.
The real mechanism: no PDF library — a pure document model, a
presentational renderer, and `window.print()` on a dedicated print-only
route with `[data-print-hidden]` hiding the toolbar and an `@media print`
`@page` block. **Not imported directly** — apps/site and apps/tower are
separate Next apps with no shared import path (apps/site's own CLAUDE.md:
`packages/` is the only shared layer), and TOWER's ficha reads an
authenticated `tower.products` schema this public, no-auth site has no
business touching. Re-derived the same disciplined pattern instead, sized
to this site's actual public `Product` shape:

- `src/lib/automoviles/ficha.ts` — pure `FichaDocument` builder from a
  catalog `Product` (specs, trims, source markets). No sequential mint
  (TOWER's `mint_ficha_no` RPC has no equivalent here — no registry, no
  auth); the reference is a deterministic `FT-WGT07-{SLUG}` instead,
  stable for the product's life without inventing a fake persisted number.
- `/automoviles/ficha/[slug]` — new route, SSG over all 31 nameplates.
  `FichaAutomovilDocument.tsx` (presentational) + `PrintBar.tsx` (client
  island, `window.print()`) + `ficha-document.css` (A4, Teko/NissanOpti,
  the lane's own ink/accent hex copied at authoring time — same reasoning
  TOWER's own ficha CSS gives for not reading tokens live in a print
  stylesheet). `data-oem` on the document root reuses the *existing*
  `[data-lane='automoviles'] [data-oem]` mechanism (oem-canvas.css) for
  the brand accent dot/rule — not a parallel token system.
- **A real gap found and closed**: this route is nested under the lane
  (so `--oem-accent` keeps resolving), which meant it also inherited the
  global SiteNav, AutoLaneNav, site Footer, and the Mister launcher — none
  of which belong on a printed document, and apps/site has no chrome-drop
  mechanism outside `src/pasillo` (apps/site/CLAUDE.md) to fall back on.
  Hid exactly four elements via precise selectors scoped to `@media
  print` only (verified via print-media emulation, not assumed): the
  SiteNav header (`header.fixed.top-0.z-50`), AutoLaneNav (its own
  `aria-label`), the site footer (`footer[class*='chrome-ground']`, since
  the document's own `<footer class="fdoc-footer">` must NOT match), and
  the Mister launcher (`button[aria-label*='Mister']`). First screenshot
  attempt caught the footer and launcher still bleeding into the printed
  page below the sheet — fixed, then re-verified clean.
- "Ficha técnica ↓" wired into every place a model already appears: the
  `[segment]` cross-brand cards, the `[oem]` brand page cards, and each
  Explorar card (replacing its "Ver ficha de {brand}" link, since the
  ficha itself now links back to the brand page — one action, not two
  overlapping ones).

**Motion (motion-and-soul, BUILD mode).** No separate in-repo animation
package existed beyond what's already installed (`gsap`, `framer-motion`,
`lenis` — all in `apps/site/package.json` and `packages/ui`); the "package
in the repo" was this existing dependency set plus the site's own
established idioms (`BrandCurtain`/`BrandChoreography`'s GSAP
ScrollTrigger reveals, `MotionLink = motion(Link)` in
`SubcategoryGateway.tsx`), not a separate library to fetch.

- `MotionCard.tsx` — one shared hover-lift primitive (`whileHover={{y:
  -4}}`, `--ease-settle`'s cubic-bezier — root CLAUDE.md §2's frozen
  "reveals" curve, the semantically correct one for a hover micro-
  interaction) instead of four copies of the same block. Applied to every
  model/segment/brand tile across the lane root, `[segment]`, `[oem]`,
  and the `marcas` roster.
- `AutoLaneNav` — the active segment tab's static `border-b-2` swap
  became a `layoutId` shared-element underline that slides between tabs
  (Linear/Vercel-style premium tab pattern). Uses a real spring
  (`stiffness:380, damping:32`), not a bezier tween — a `layoutId`
  animation tracks a variable slide distance, which a fixed-duration
  curve handles poorly; a spring is the primitive the frozen token names
  (`--spring-snappy` etc.) were approximating in the first place.
  `useReducedMotion` collapses it to `{duration:0}`.
- `ExplorarFeed` — the active card's content block now emphasizes itself
  (`opacity`/`scale` tied to `activeIndex === i`) instead of every card
  looking identical regardless of focus; the register counter
  (`01 / 31`) crossfades on change via `AnimatePresence` instead of an
  instant text swap. Both skip their animated variant under
  `useReducedMotion`.

**A real risk checked, not assumed safe.** `MotionCard` and GSAP's
`data-reveal` scroll-fade-up (`BrandChoreography.tsx`) both write to the
same element's `transform`/`opacity` — GSAP owns the one-time scroll
reveal, Framer Motion owns hover-only. Traced through: GSAP's reveal
settles on mount/scroll before any hover is likely, and Framer Motion
only writes a transform when `whileHover` is actively engaged, so there's
no persistent competing state at rest. Confirmed empirically with a
scroll-then-hover screenshot (`[segment]` page, Camry card) — reveal
settled correctly, hover lift + border-color engaged correctly, no
flicker or stuck state.

Verified: `pnpm typecheck` + `pnpm build` green (31 ficha pages built via
`generateStaticParams`, alongside every existing route); a full overflow
sweep (mobile/desktop × 5 URLs including the new ficha and explorar
routes) came back clean; screenshots confirm the sliding nav underline
actually slides, card hover engages the right brand color, the register
counter crossfades, and the print output — re-checked after the
chrome-hiding fix — renders as a single clean A4 sheet with no site
chrome anywhere in it.

## 0j · Model-card image treatment — prepped ahead of photography (2026-08-25)

Client sent a reference (a Toyota configurator card): the vehicle cutout
breaks out over the card's top edge, drop-shadowed, rather than sitting
boxed inside the padding. Confirmed with the client first — the incoming
photography will be transparent-background cutouts, the format this
treatment actually needs (a rectangular photo can't "break the frame"
the same way; that would have meant a different treatment entirely).

Built the mechanics into `MotionCard` now, dormant until real assets
land, rather than waiting:

- New optional `imageUrl`/`imageAlt` props. Absolutely positioned
  (`-top-6`, i.e. 24px above the card's own border) so it never affects
  the card's own grid-track height — only the caller's row gap needs to
  give it clearance from the row above.
- Wired to `p.images?.[0]` on the `[segment]` and `[oem]` model cards
  (the two true "one card = one vehicle" views — brand/segment tiles on
  the roster and lane root don't represent a specific model, so they
  don't get this prop). Every product's `images` array is empty today
  (§4·1), so this is a no-op in production right now — confirmed via
  screenshot that the grid renders byte-for-byte the same as before this
  change.
- Bumped both grids from `gap-4` to `gap-x-4 gap-y-8` — the breakout
  needs more vertical clearance between rows than the original 16px gave;
  32px comfortably clears a 24px breakout with margin to spare.
- **Verified the mechanics with a placeholder, not fabricated product
  photography**: temporarily patched one product's `images[0]` in the
  local dev copy of `seed.json` to a plain "TEST PLACEHOLDER" dashed-box
  SVG data URI (never a fake car image — root CLAUDE.md's refusal on
  stock/fabricated photography applies here too), screenshotted the real
  grid to confirm no clipping, no cross-row overlap, and that surrounding
  imageless cards render untouched, then reverted `seed.json` to its
  original state (`git diff` confirms zero net change there).

Not done, on purpose: no placeholder styling for a *missing* image once
real photography exists for *some* but not all nameplates (a mixed state
this catalog will likely pass through tomorrow) — worth a quick look once
the real files arrive, since a card with no image should probably keep
today's typography-only layout rather than reserve dead space for one
that never comes.

## 0l · Buyer-list reconciliation (2026-08-31)

`lane.config.ts`'s Phase 0 answer to "who is the buyer" (§0, item 1) recorded
three trade buyers — car dealers/lots, fleet and corporate buyers,
independent resellers/importers — from the 2026-08-23 interview. It never
listed an individual/personal buyer.

Separately, in a later session (audit-and-scope work on this category, not
a lane-protocol interview), the account owner stated directly that
personal buyers are real here too. A dual-buyer RFQ toggle
(`buyer_type: 'personal' | 'empresa'`, `RFQFlow`'s `showBuyerType` prop,
gated to `automoviles` via `InquiryForm`'s `DUAL_BUYER_CATEGORIES`) shipped
on that basis — before this file or `lane.config.ts` were updated to match.
That left the lane's own documented buyer research inconsistent with its
shipped behavior: the config said "trade buyers only," the product said
otherwise.

**Fixed:** `lane.config.ts`'s `buyer` array now includes
`'individual / personal use'` as a fourth entry, dated and reasoned in
place (append-only discipline, same as every other amendment in this
file). Not treated as a case for the original note's "revisit once real
RFQ volume shows which is converting" — that note was about ranking the
three trade buyers against each other, not about whether a fourth buyer
type exists at all. Direct confirmation from the account owner settles
existence; volume can still decide ranking later.

**Not done, on purpose:** no change to `misterPack`/diagnosis-set content
(still not built, §4), no change to the segment/brand taxonomy (buyer type
and vehicle taxonomy are independent axes), no lead-data backfill (leads
captured before this session simply have `buyer_type: null`, same as any
other newly-added optional field).

## 0k · Vehicle-type icon system + brand-page filtration (2026-08-26)

Client asked for an SVG "vehicle type selection engine" in the vein of
dubicars' body-type picker — bi-color icons, anchored across product
pages, with a filtration animation, responsive nav, and trims/specs kept
intact. Built rather than borrowed: no stock/photographic icon set (same
refusal §0j already applied to photography), a hand-authored family
instead.

**`VehicleTypeIcon`** (`src/components/features/automoviles/
VehicleTypeIcon.tsx`) — one component, five silhouettes, one per
`lane.config.ts` taxonomy entry (sedán, SUV compacto, SUV mediano y
grande, SUV todoterreno, MPV/furgoneta). Shared 120×48 grid, shared
construction rule: body is a stroke only (matches the lane's
blueprint-grid texture), glass + wheels are filled in a second color —
bi-color by construction, not by accident. Differentiated by roofline
height, greenhouse length and wheel size, tuned to read at 32px rather
than survive close inspection. `bodyColor`/`accentColor` props default
to the lane's own ink/accent tokens but are meant to be overridden with
`--oem-accent` wherever an icon sits inside a `[data-oem]` scope — the
same "brand takes over the accent role" pattern every other card in this
lane already uses, not a parallel one.

Anchored in five places:
- **Lane root** (`/automoviles`) — the primary showcase. "Por segmento"
  retitled "Por tipo de carrocería"; each of the 5 segment cards now
  leads with its icon above the name/count.
- **Segment pages** (`/automoviles/[segment]`) — icon beside the H1.
- **Brand pages** (`/automoviles/marcas/[oem]`) — new filter chip bar
  (see below), one icon per chip.
- **Explorar feed** (`ExplorarFeed.tsx`) — small icon in the per-card
  segment badge, between the brand dot and the segment link.
- **Ficha técnica** (`FichaAutomovilDocument.tsx`) — icon in the header
  logo block, above the Wings logo; new `segmentSlug` field threaded
  through `ficha.ts`'s `buildFichaDocument()` (reuses the existing
  `segmentSlug()` mapping table, not a new one). Verified in both screen
  and print-media emulation — the icon survives the print stylesheet's
  chrome-hiding rules untouched.

**Filtration** — extracted the brand page's model grid into a new client
component, `BrandModelGrid.tsx` (the `[oem]/page.tsx` server component
now just fetches and passes `products`/`brandName`). Filter bar renders
only when a brand actually carries more than one segment (`segmentCounts.
size > 1` — a single-segment brand shows no filter UI, never a dead
control). One chip per segment the brand actually has stock in, plus a
"Todos (N)" reset — no chip for a segment with zero matches. Grid
transitions on `motion.div layout` + `AnimatePresence mode="popLayout"`,
matching the fade/scale-settle convention `MotionCard` already uses
elsewhere in this lane (`--ease-settle`), `useReducedMotion`-gated.
Verified concretely on Audi (7 models: 5 sedán + 1 SUV compacto + 1 SUV
mediano y grande) — clicking "Sedán (5)" correctly narrows the grid to
exactly those 5 cards with a clean settle, no layout artifacts.

**Verified**: `pnpm --filter site typecheck` clean, full `pnpm build`
green across all affected routes (`/marcas/[oem]` bundle grew 732B →
2.38kB, expected from the new client-side filter/animation code).
Playwright pass across lane root, segment header, Audi desktop (all +
filtered), Audi mobile (375px — chips wrap cleanly into two rows, full
labels retained, no overflow), Explorar feed, and the ficha document
(screen + print) — zero horizontal overflow anywhere, zero clipping.

Not done, on purpose: the five reference vehicle photos the client
uploaded (Changan CS75 PRO, two Jetour SUVs, Hyundai Sonata N Line,
Toyota Camry) and the linked Google Drive folder — the client
redirected to this icon/filtration work before either was addressed;
still pending, picked up next if they redirect back to it. The Drive
folder is shared "anyone with the link → reader" only, which does not
grant this session's connected account list/download rights even though
direct-by-ID metadata lookup succeeds (confirmed via
`get_file_permissions`) — resolving it needs either a direct share to
the connected account or a manual upload.
