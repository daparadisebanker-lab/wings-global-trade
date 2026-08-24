# Automóviles — scope & perspective (car-first direction)

**Status: WGT/07 — Phase 0, 1, 2 COMPLETE. Phase 2 re-derived 2026-08-24
(showroom pivot). Phase 3 (IA / route migration) now PARTIALLY LIVE: new
`(lanes)/automoviles/` routes exist and stamp `[data-lane="automoviles"]`
for real (lane root, brand roster, per-brand pages) — `/catalogo/automoviles`
still exists in parallel and is not yet redirected.**

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
