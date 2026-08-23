# Automóviles — scope & perspective (car-first direction)

**Status: PHASE-0 TACTICAL BUILD SHIPPED · strategic pivot PROPOSAL, pending Muaaz**

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

## 3 · Where this sits in the framework — honestly

Automóviles is **not** onboarded through the §4 protocol as a numbered lane.
It is one of the site's five pre-lane categories (`maquinaria-agricola`,
`camiones`, `buses`, `equipo-industrial`, `repuestos`, now `automoviles`),
the same pre-lane single-site form the root `CLAUDE.md` §0 describes for
everything `apps/site` hasn't split yet. Promoting it to first position in
the nav is a **prominence decision**, not a lane-onboarding decision, and the
two shouldn't be conflated:

- If automóviles stays a category, today's build is the complete Phase-0
  answer — no further ceremony required, and this is the cheaper path.
- If "car-first" means automóviles becomes a proper coded lane (own livery,
  own Mister knowledge pack, its own archetype-driven IA depth per §3), that
  is a **framework amendment-free but protocol-required** move: it maps
  cleanly to **EQUIPMENT** (buyer buys a specified unit + after-sale
  confidence; unit math per unit / per crate CBM — the same archetype WGT/01
  machinery already uses), so no new archetype is needed, but Phase 0's seven
  questions (buyer, archetype, unit math, taxonomy, photography feasibility,
  Mister knowledge sources, commercial readiness) still have to be answered
  with Muaaz before a `lane.config.ts` gets written. This program proposes
  running that interview next; it does not pre-empt it.

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

1. **Verify the shipped build in a real browser** — desktop nav, mobile
   drawer, `/catalogo/automoviles` filtered by brand and by fuel, one product
   detail page, one catalog-inquiry submission (non-prod, so it logs to
   console rather than sending WhatsApp/email).
2. **Decide, with Muaaz, whether "car-first" means prominence (done) or lane
   status (Phase 0 interview, §3 above).** This single decision determines
   whether the next work is content depth on the existing category or a
   `packages/liveries/automoviles/` livery + `lane.config.ts`.
3. **Commission photography** per nameplate, or confirm the interim
   typography-led launch is acceptable for longer — same choice Interiores
   made and logged.
4. **Sync to Supabase deliberately** (`seed-supabase.ts` or equivalent), once
   someone has reviewed the 31 rows against Rowe and is ready for
   `/catalogo/automoviles` to carry real inventory in production.
5. **Add the `segment` facet** to `FilterSidebar`/`filter_attrs` so the
   dubicars-style body-type browse (§2) becomes a real filter, not just a
   spec-table row.
6. If the pivot proceeds toward homepage-level "car-first" (hero imagery,
   homepage copy, header art), scope that as its own follow-up — this
   program covers the catalog and navigation only, and a homepage rewrite
   touches shared chrome that other categories depend on too (swap-test
   applies, §4 Phase 2 gate).
