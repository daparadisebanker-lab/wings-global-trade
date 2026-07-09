# Represented Brands — Partner Brand Shelves, Container-Only Commerce

> **Status: QUEUED spec — not active law.** Engineering + design considerations to
> settle before any code. Entry point for the build when Muaaz activates it.
> Written 2026-07-09. First partner brand: TBD (pending Muaaz).

---

## 0 · What this is

Wings becomes the **official commercial partner** of external brands whose
categories may extend beyond the current lanes. For these brands:

- Wings sells **solely by full container or shared container** — never by unit.
- Wings **manages the brand's inventory itself** (TOWER is the system of record).
- Each brand gets a **branded section within the Wings site** — a hosted
  storefront, not a standalone site.
- Mister must ingest every brand added and its container specs automatically
  (the data loop), so it can converse about any represented brand without a
  manual pack-writing session.

This is a third structural category in the ecosystem, distinct from the two
that exist:

| | Lanes (WGT/01–06) | Endorsed brands (§5, e.g. Áladín) | **Represented brands (this program)** |
|---|---|---|---|
| Lives where | Wings site, Wings livery | Own standalone site, own identity | **Wings site, brand identity inside Wings chrome** |
| Identity | Derived livery, rules not taste | Full own token system | **Constrained brand canvas (see §3)** |
| Advisor | Mister | Own persona, never Mister | **Mister, fed by the brand data loop** |
| Purchase logic | Per archetype | Their own | **Container allocation only (slots or quantity)** |
| Inventory | Supplier-side | Their own | **Wings-managed in TOWER** |

### Framework amendments this program requires (Muaaz ratifies before build)

1. **New purchase-logic archetype — proposed name `ALLOCATION`.**
   Buyer buys: *a share of a specific planned container of a represented brand*.
   Unit math: *per slot / per quantity-within-container (server-converted to slots)*.
   IA pattern: *brand shelf → brand catalog → container allocation instrument*.
   Per root `CLAUDE.md` §3, a new archetype is a framework amendment, not a build
   task — this spec is the proposal. The alternative (forcing it into CREDENTIAL
   or PROGRAM) breaks both archetypes' RFQ math and is rejected here.
2. **Root `CLAUDE.md` gains a §5-bis** ("Represented Brands — hosted") mirroring
   the endorsed-brands section, encoding the table above.
3. **White-canvas exception (Tier-2, scoped).** The represented-brands section
   uses a **pure white ground** — a deliberate exception to both the Wings
   warm-white (`#F8F6F0`) and the navy↔warm-white section alternation. Rationale
   (the one-line why that prevents a future "fix"): *multiple partner brands with
   arbitrary palettes must coexist; only a neutral white ground lets every
   brand's color system breathe without Wings' warm cast tinting it.* The
   exception is scoped to the `(brands)` route group only — the global chrome
   (nav, footer, home) never changes ground.

---

## 1 · Reference patterns (what the platforms already solved)

Studied for the hosted-brand-storefront problem; the extractions below are the
design law for §3.

**Amazon Brand Stores** — the canonical "store within a store":
- Host chrome is constant (nav, search, cart, trust); the brand owns a bounded
  canvas below it. The buyer never doubts whose platform they're on.
- Brand pages are **assembled from a fixed module library** (hero, tile grid,
  product rail, video, about), not free-form HTML. Variety comes from content
  and palette, never from structure. This is exactly the "same box, different
  livery" directive applied to third parties.
- Neutral white ground beneath every store — the same reasoning as our §0.3.
- One canonical URL per brand (`amazon.com/stores/{brand}`), sub-pages for
  catalog depth.

**Alibaba flagship / verified-supplier storefronts** — the B2B overlay:
- Trust artifacts are structural, not decorative: verification badges,
  years-on-platform, response rate, factory audit reports pinned above the fold.
  Translation for Wings: the **mandate** ("Official commercial partner —
  representación oficial para {territorio}") is a first-class UI element with
  its own verifiable document, not a logo in a footer.
- Commerce vocabulary is MOQ/lead-time/incoterm, not price-per-unit retail —
  confirms our wholesale-language lint applies unchanged inside brand shelves.

**Faire (wholesale marketplace)** — brand-forward wholesale:
- Brand page = story block + values/certifications + catalog with wholesale
  terms. The *about* section carries real conversion weight in B2B — buyers are
  underwriting a brand relationship, not picking a SKU. Our brand About section
  is therefore a spec'd module, not marketing filler.

**Costco Business Center / pallet commerce** — quantity-tier honesty:
- Sell in logistics units (case, pallet) with the composition always visible
  ("1 pallet = 48 cases = 1,152 units"). The buy instrument in §4 must always
  show the full unit cascade for whatever slot/quantity is selected — numbers
  exhibited, not hidden (Prime Directive 5).

**What we deliberately do NOT copy:** marketplace self-service. Brands do not
log in and edit their own shelf (Amazon Sellers do; our partners don't).
Wings ops curates everything through TOWER. This keeps quality control, keeps
the wholesale-language lint enforceable, and matches the reality that Wings
manages the inventory.

---

## 2 · Site — surface architecture (`apps/site`)

### 2.1 Home introduction
One new section on `/` — inside the existing navy↔warm-white alternation (the
white canvas does NOT start here). Content: program statement ("Representación
oficial de marcas internacionales — venta exclusivamente por contenedor"),
logo strip of live brands, one CTA → `/marcas`. Placement: after the category
architecture, before proof. One primary action (root law §Phase-3).

### 2.2 Navigation
- Add `{ href: '/marcas', label: 'Marcas' }` to `LINKS` in
  `SiteNav.tsx` (and `MobileMenu`, `Footer`, `sitemap.ts`, analytics dimension —
  same registration checklist as a lane; a brand program is not real until it
  appears in all five).
- When ≥3 brands are live, `/marcas` gains a MegaMenu panel listing brands
  (reuse the existing catalog MegaMenu organ, themed by tokens — never forked).

### 2.3 `/marcas` — the program sub-home (white canvas begins here)
Route group `apps/site/src/app/(brands)/marcas/` with a layout that sets
`data-canvas="brand"` → white ground tokens. Sections:
1. Program header — what official representation means; the mandate concept.
2. Brand roster — grid of brand tiles (logo on white, accent underline from the
   brand's token set, category scope, territory of mandate, status stamp
   `REPRESENTADA DESDE {year}`).
3. How container purchase works — the 3-step explainer (elegir marca →
   configurar contenedor → asegurar cupos), FillMeter as the visual anchor.
4. Mister + contact. No RFQ here; the RFQ lives on brand pages.

### 2.4 `/marcas/{brand}` — the brand shelf
Three spec'd sections in fixed order (module library, Amazon-store style —
structure frozen, content and palette per brand):

1. **About** (`/marcas/{brand}` hero + story): brand hero (photography per
   brand standard), mandate block (official-partner statement + verifiable
   scope + territory), brand story, certifications. This section carries the
   Faire-style conversion weight — spec it, don't decorate it.
2. **Products** (`/marcas/{brand}/productos` + detail pages): catalog scoped
   to the brand, spec-sheet-led (reuse `SpecSheet` organ). **No unit
   purchasing anywhere** — every product page's single action is "Ver
   disponibilidad en contenedor" → deep-links into the buy instrument with
   that product pre-selected. Product data comes from `tower.products`
   filtered by the represented brand (see §5.1).
3. **Buy in container** (`/marcas/{brand}/contenedor`): the allocation
   instrument — §4.

### 2.5 Brand identity system — the constrained canvas
Per-brand identity enters through a **fixed token contract only**, set by the
brand's TOWER record and applied via `[data-brand="{slug}"]`:

```
--rb-accent          brand primary (must pass 4.5:1 on white, or ships with --rb-accent-ink)
--rb-accent-2        optional secondary
--rb-ink             text ink on white (brand-tinted near-black allowed)
--rb-surface-tint    ≤4% tint for cards/bands (the only relief from pure white)
+ logo (SVG, light-ground variant mandatory) + photography set
```

What brands do NOT get: typefaces (Wings type system throughout — NissanOpti /
Flexo / Teko; this is what keeps shelf N+1 cheap and the site coherent — the
Amazon lesson), radii (Tier-1 frozen, 0–2px), motion (Tier-1 eases), layout
(module library only). Wings navy/gold never appears inside the brand canvas
except in the persistent site chrome and the mandate block's Wings seal.

**QA gate (swap test, brand edition):** render brand A's shelf with brand B's
tokens — structure must hold perfectly. Identical logic to root law §Phase-6.6.

### 2.6 Interaction layer — the Odd Ritual grammar (template decision)
**Decision:** `~/projects/Clones/odd-ritual-clone` is the go-to interaction
template for every represented-brand shelf — adopted as **grammar, not stack**.
The clone is static HTML + vanilla JS (GSAP 3.12.7 · ScrollTrigger · Lenis
1.2.3 · Barba 2.10.3, data-attribute driven); brand shelves live inside
`apps/site` (Next.js App Router, TypeScript). Shipping the clone as-is would
mean untyped pages outside the monorepo with no Mister, no TOWER data, and no
shared organs — rejected. Instead, **one port, reused by every brand**:

- The clone's **data-attribute choreography system** (`data-anim`,
  `data-anim-group`, namespace-scoped section patterns) ports to typed React
  components using `useGSAP` — the attribute grammar is kept verbatim so the
  clone remains the living reference document for every pattern.
- **GSAP + ScrollTrigger** become pnpm workspace deps (same majors as the
  clone vendors). **Lenis** smooth scroll is instantiated in the `(brands)`
  layout only — created on mount, destroyed on unmount, never global; the rest
  of the site keeps native scroll.
- **Barba curtain transitions do not port** (Barba is an MPA fetch technique;
  App Router is client-routed). Equivalent: a GSAP curtain wipe on route
  transitions *within* `(brands)` — the curtain flood uses `--rb-accent`, so
  moving between a brand's pages is a brand-colored moment. Entering/leaving
  `(brands)` from the main site uses the standard transition — the brand world
  has a doorway.
- **Motion law:** all timing/easing map to Tier-1 tokens (`--ease-gantry`
  structural, `--ease-settle` reveals); `prefers-reduced-motion` collapses
  everything to crossfade and disables Lenis (native scroll) — full parity,
  root law §Phase-6.5.
- **Section pattern inventory ported** (clone page → shelf use): home hero
  auto-slider → BrandHero · marquee → BrandMarquee · draggable gallery →
  BrandGallery · about scrubbed story text → BrandStory · featured grid
  reveal → product grid stagger · dark story block → mandate/quote band.

Components live in `apps/site/src/components/features/brands/` (kebab-case
files, PascalCase components) — app-local first, per the QuotationForm
precedent (MIGRATION_DECISIONS D-10/D-11); an organ is promoted to
`@wings/trade-ui` only when a second consumer exists.

### 2.7 Interactive branded components — mockups + technical contracts
Every component below is structure-frozen and brand-themed exclusively through
the §2.5 token contract. Numerals always tabular mono (Prime Directive 5).

**① BrandHero** — clone home-hero pattern: full-bleed auto-slider, brand
photography, oversized brand name, mandate stamp.

```
┌────────────────────────────────────────────────────────┐
│  [WINGS CHROME NAV — unchanged, warm-white]            │
├────────────────────────────────────────────────────────┤
│                                                        │
│   {BRAND LOGO}                          ● REPRESENTADA │
│                                           DESDE 2026   │
│   B R A N D   N A M E                                  │
│   ────────────────────  ← --rb-accent rule             │
│   Categoría · Territorio del mandato                   │
│                                                        │
│   [slide dots ○ ● ○]      photography, auto-advance    │
└────────────────────────────────────────────────────────┘
```
*Technical:* props `{ brand: RbPublicBrand }`; slides from `identity.media[]`;
GSAP timeline crossfade 6s/slide, pauses on hover/focus; reduced-motion →
static first frame. LCP-critical: first slide is a priority `next/image`,
slider hydrates after.

**② MandateSeal** — the Alibaba-style trust artifact, interactive:

```
┌──────────────────────────────────────────────┐
│  ◈ SOCIO COMERCIAL OFICIAL                   │
│  Wings Global Trade × {Brand}                │
│  Alcance: {scope} · Territorio: {territory}  │
│  ▸ Ver carta de representación (PDF)         │
└──────────────────────────────────────────────┘
```
*Technical:* hover/tap expands (GSAP height + `--ease-settle`) to show scope
detail + document link from `mandate.document_refs` (public copy only, served
from Storage through the public view). The Wings seal here is the ONLY Wings
navy/gold inside the brand canvas.

**③ PackingCascade** — the Costco honesty rule as a live instrument; the
signature interactive of the program:

```
   CUPOS   ◂ ▮▮▮░░░░░░░ ▸   3 / 10
   ─────────────────────────────────────
   3 cupos = 45 cajas = 1.080 unidades
           = 10,2 m³ · 2.340 kg
   ─────────────────────────────────────    numbers animate
   Restante en contenedor: 7 cupos          (GSAP textContent
                                             tween, tabular mono)
```
*Technical:* pure client component `{ template: RbContainerTemplate, slots }`;
cascade math derived from `packages_per_slot`/`units_per_slot` — display only,
**never authoritative** (server re-validates on reserve). Count-up tweens
0.4s `--ease-settle`; reduced-motion → instant swap.

**④ SlotGrid + FillMeter interaction states** — the shared FillMeter organ
gains a hover/selection layer on brand shelves:

```
   ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐
   │█│█│█│▨│▨│□│□│□│□│□│   █ vendido ▨ reservado □ disponible
   └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
        ▲ hover: tooltip «Cupo 6 · 15 cajas · 360 uds · 3,4 m³»
        click: toggles selection → feeds PackingCascade
```
*Technical:* selection state lifts to the instrument (§4); available cells
tint `--rb-accent` on select; fill state from `rb_public_containers`
(revalidate ≤60s — the shared-container staleness rule: a stale «quedan 3»
destroys the trust the page exists to build).

**⑤ ContainerConfigurator** — the §4 instrument as one orchestrated screen:

```
┌ ZONE 1 ─ contenedores activos ──────────────────────────┐
│ ▸ 40HC · Qingdao→Callao · cierra 28 AGO   [FillMeter]   │
│   20GP · Qingdao→Callao · cierra 15 SEP   [FillMeter]   │
│   CONTENEDOR COMPLETO (40HC · 76 m³)      [outline]     │
├ ZONE 2 ─ asignación ────────────────────────────────────┤
│  ( POR CUPOS | por cantidad )   ← mode toggle           │
│  [SlotGrid]  +  [PackingCascade]                        │
│  por cantidad: [ 1.000 ] uds → 3 cupos · sobran 80 uds  │
├ ZONE 3 ─ compromiso ────────────────────────────────────┤
│  Resumen · datos de contacto · [ RESERVAR CUPOS ]       │
│  Sin pago en línea — reserva documentada, 72 h          │
└─────────────────────────────────────────────────────────┘
```
*Technical:* state machine `selecting_container → allocating → committing →
reserved | waitlisted`. Zone transitions are GSAP curtain-lite wipes in
`--rb-surface-tint`. Endpoints:
`GET /api/rb/containers?brand={slug}` (public fill state) ·
`POST /api/rb/convert` `{template_id, quantity, level}` → `{slots, remainder,
cascade}` (server-side packing math — same functions TOWER uses) ·
`POST /api/rb/reserve` → row-locked allocation insert + lead + notification
(insert-first, fire-and-forget notify — the existing site notification law).
409 on lost race → waitlist path renders in place, never a dead end.

**⑥ BrandStory / BrandGallery / BrandMarquee** — direct ports of the clone's
scrubbed story text (About), draggable gallery (drag-to-explore product/brand
imagery, `Draggable` + inertia), and marquee (brand vocabulary strip at
`--rb-accent`). *Technical:* all three are presentational, content from
`represented_brands.content`; scrub/drag disabled under reduced-motion
(gallery falls back to a scroll-snap row).

**Mockup production (design-phase deliverable, Phase 2 gate):** before shelf
code, each component above ships as a high-fidelity mockup on the white canvas
with brand #1's real tokens AND a deliberately clashing fictitious brand
(stress-testing the token contract) — produced as claude.ai/design components
(the existing Wings design-sync pipeline) so review happens on rendered
components, not static images. The ASCII frames above are the structural
contract; the mockups are the visual one.

**Kit assets:** the brand-agnostic asset system these components consume
(parametric container SVGs, RB seal, packing-diagram generator, route map,
stencil treatment, icon set, OG generator, motion signatures) is cataloged in
`EXPERIENCE-KIT.md`; built files live in `kit/`. Kit pieces obey the same
token contract and swap test as everything else in §2.

---

## 3 · TOWER — workflows and data model (`tower` schema)

### 3.0 Naming decision (required, blocking)
`tower.brands` already exists and means **operating tenant** (wings, aladin).
The partner entity is **`tower.represented_brands`** — never overload
`tower.brands`. All new tables prefix `rb_` where ambiguity is possible.

### 3.1 Workflow 1 — Brand registration: code first, then the identity kit
New TOWER module "Marcas Representadas". **Nothing about a brand is wired —
no products, no templates, no shelf, no Mister pack — until the brand has a
code and a complete, validated identity kit.** This is the internal workflow
that makes brand N+1 mechanical.

**(a) The brand code.** Minted at registration, before any other work:

- Format **`RB/01`, `RB/02`, …** — next integer, **append-only, never reused
  or reordered** (identical law to lane codes: RB/03 stays RB/03 even if that
  brand ends — infrastructure numbering never reshuffles).
- The code is the spine every artifact hangs off: Storage paths, Mister pack
  key (`rb-{slug}`, registered against the code), TOWER pipeline ids,
  analytics dimension, container codes (`RB03-40HC-001`), and the shelf's
  colophon stamp (`RB/03 · REPRESENTADA DESDE 2026`).
- Registered in `packages/liveries/registry.md` under a new
  `## Represented brands` section (same append-only file that guards lane
  codes and accents — one ledger for every identity in the ecosystem, and the
  place hue-adjacency with lane accents gets eyeballed).

**(b) Identity kit intake.** A TOWER checklist tab («Kit de marca») on the
brand record, with a completeness meter. Required before status can leave
`ONBOARDING`:

| Slot | Requirement | Validation (automated where possible) |
|---|---|---|
| **Logos** | Primary SVG (light-ground variant mandatory), monochrome variant, square icon mark | SVG parses; light-ground variant legible on pure white |
| **Colors** | The §2.5 `--rb-*` token values, derived from the brand's usage manual (§8.2), never sampled from their site | `--rb-accent` ≥4.5:1 on white or ships `--rb-accent-ink`; `--rb-surface-tint` ≤4% |
| **Imagery** | Hero set (≥3), about set (≥2), per-product photography | Every entry `source`-tagged per §8.7 (`brand_supplied` \| `wings_studio`); no untagged media renders |
| **Icons** | Brand icon mark for tiles/favicons/OG images | Icons are **content, never chrome** — Wings UI iconography is Tier-1; a brand icon never replaces a system icon |
| **Docs** | Mandate letter, brand usage manual (the source for the color row) | Stored; public-copy flag per document |

Storage convention: `rb/{code}/` in Supabase Storage —
`logos/ · colors.json · imagery/{hero,about,products}/ · icons/ · docs/`.
The `identity` jsonb on the brand row holds the manifest (paths + token values
+ validation results); the site and the Mister pack compiler read the
manifest, never raw Storage listings.

**(c) Wiring gate.** Products, packing profiles, container templates, shelf
publish, and pack compilation all FK/key off the brand code and are blocked in
TOWER UI while the kit meter is incomplete or any validation fails. The gate
is structural, not procedural — the "publish" actions literally don't enable.

**(d) AI-assisted registration — the almost-automatic path.** Manual kit
assembly is the fallback, not the workflow. The normal flow rides TOWER's
existing AI-drafts system (`tower.ai_drafts` — reviewable drafts, confidence
required, `DRAFT` by default, **nothing auto-commits**, per TOWER Directive 7):

1. **Ops seeds three things:** brand name · website URL · an upload drop
   (usage-manual PDF + whatever asset dump the brand sent). That is the entire
   manual input.
2. **Code mints itself** — deterministic `max + 1` at record creation. No AI,
   no human choice, no skipped numbers. The registry.md line is emitted by the
   same job (a PR-able one-liner, since the repo file can't be written from
   TOWER — ops pastes/merges it; the DB `unique` constraint is the real guard).
3. **The kit compiler runs** (server job, new draft kind `RB_KIT` added to the
   `ai_drafts.kind` enum) and proposes every slot of the §3.1b table in one
   draft payload, per-slot confidence:
   - **Colors** — extracted from the usage-manual PDF (vision pass), each
     proposed `--rb-*` value carrying its manual page reference; the contrast
     validator runs against the proposal immediately, so ops sees pass/fail
     before approving. Never sampled from the website when a manual exists
     (§8.2 law); website extraction is the flagged low-confidence fallback.
   - **Logos & icons** — uploaded vectors detected and classified
     (primary / monochrome / icon mark), light-ground legibility checked,
     missing variants flagged as named gaps («falta variante monocroma»).
   - **Imagery** — uploads auto-classified into `hero / about / products` with
     *proposed* source tags. The source tag itself is an authenticity
     attestation (§8.7) — AI proposes, **a human must confirm each one**; this
     is the one slot that never auto-fills.
   - **Content** — about/story blocks drafted ES/EN from the brand materials,
     wholesale-language lint pre-run on the draft.
   - **Packing seeds** — if spec sheets are in the drop, product + packing-
     profile drafts are emitted through the existing `SPEC_EXTRACT` kind,
     queued behind the wiring gate.
4. **Review = the kit tab, pre-filled.** Ops approves slot-by-slot (or all);
   approval writes the manifest into `identity`, the validator recomputes
   `kit_complete`. Low-confidence slots render amber and demand explicit
   confirmation. Rejected slots fall back to manual entry for that slot only.
5. **Downstream stays automatic:** kit approval + status transitions fire the
   §5 Mister pack compiler and shelf staging preview (for `BRAND_REVIEW`)
   without further ops action.

Schema note for the build: `ai_drafts.brand_id` references `tower.brands`
(the *tenant*) — `RB_KIT` drafts are filed under tenant `wings` with
`ref_table = 'represented_brands'`, `ref_id = {rb id}`. Do not add a second
drafts table and do not point `brand_id` at the new entity.

Net effect: registering brand N is **one upload + one review pass** — the
human acts as approver of a prepared kit, never as its assembler. What stays
irreducibly human: the mandate terms, source-tag attestations, and the
approve button.

```sql
create table tower.represented_brands (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                -- RB/01, RB/02… append-only, never reused
  slug text unique not null,                -- site path segment
  name text not null,
  status text not null default 'PROSPECT'
    check (status in ('PROSPECT','NEGOTIATION','SIGNED','ONBOARDING','BRAND_REVIEW','LIVE','PAUSED','ENDED')),
  mandate jsonb not null default '{}',      -- territory, scope, exclusivity, start/end, document refs
  identity jsonb not null default '{}',     -- kit manifest: token values, asset paths, validation results
  kit_complete boolean not null default false,  -- set by the kit validator, never by hand
  content jsonb not null default '{}',      -- about/story blocks, ES/EN
  categories text[] default '{}',           -- may extend beyond current lanes — free taxonomy
  created_at timestamptz default now()
);
```

Status pipeline is the workflow: a brand cannot go `LIVE` until it has a signed
mandate document, `kit_complete = true` (the §3.1b validator), ≥1 published
container template (§3.2), brand sign-off recorded (`BRAND_REVIEW`, §8.2), and
a passing Mister pack (§6). TOWER UI enforces the gates as a checklist on the
brand record — same pattern as the lane Definition-of-Done.

Products: reuse `tower.products` (catalog module) with a nullable
`represented_brand_id` FK — one PIM, two ownership modes. Represented-brand
products additionally require a **packing profile** (§3.2) before they can
enter a template.

### 3.2 Workflow 2 — Container designation (the packing calculus)
Two layers, deliberately separate:

**(a) Packing profile — per product.** The logistics atoms:

```sql
create table tower.rb_packing_profiles (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references tower.products(id),
  package_kind text not null,               -- 'box' | 'packet' | 'carton' | 'pallet' | 'drum' | 'crate' | ...
  units_per_package int not null,
  package_cbm numeric(8,4) not null,
  package_kg numeric(8,2) not null,
  stackable boolean default true,
  notes text
);
```

**(b) Container template — per brand × container kind.** How a 20ft / 40ft
fills with this brand's cargo. Container kinds reuse the existing
`tower.containers` vocabulary (`20GP`,`40GP`,`40HC`,`REEFER`).
⚠ Correction encoded here: containers are 20/40 **feet**, not tons. Reference
capacities: 20GP ≈ 33 CBM / ~28,200 kg payload · 40GP ≈ 67 CBM · 40HC ≈ 76 CBM
/ ~28,500 kg. **Capacity is `min(CBM bound, weight bound)`** — dense cargo
weighs out before it cubes out; the template computes both and stores which
bound governs.

```sql
create table tower.rb_container_templates (
  id uuid primary key default gen_random_uuid(),
  represented_brand_id uuid not null references tower.represented_brands(id),
  kind text not null check (kind in ('20GP','40GP','40HC','REEFER')),
  composition jsonb not null,   -- [{product_id, packing_profile_id, packages}] the planned mix
  max_packages int not null,    -- computed: min(cbm-bound, kg-bound), utilization factor applied
  governing_bound text not null check (governing_bound in ('CBM','KG')),
  utilization_factor numeric(3,2) not null default 0.85,  -- real-world stuffing loss
  total_slots int not null,     -- the marketing/allocation unit
  packages_per_slot int not null,
  units_per_slot int not null,  -- derived; denormalized for site/Mister display
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED','RETIRED')),
  created_at timestamptz default now()
);
```

TOWER UI: a designation worksheet — pick products, enter package counts, the
sheet live-computes CBM total, weight total, which bound governs, remaining
capacity, and renders the FillMeter as ops sees what buyers will see.

### 3.3 Workflow 3 — Slot allocation by subtraction
Instantiating a template creates a real `tower.containers` row (existing
table; `mode` = `DEDICATED` for a full-container sale, `SHARED` for slotted)
plus an allocation ledger:

```sql
create table tower.rb_slot_allocations (
  id uuid primary key default gen_random_uuid(),
  container_id uuid not null references tower.containers(id) on delete cascade,
  account_id uuid references tower.accounts(id),
  order_id uuid references tower.orders(id),
  slots int not null check (slots > 0),
  quantity_units int not null,              -- the quantity designated for this allocation
  status text not null default 'RESERVED'
    check (status in ('RESERVED','CONFIRMED','LOADED','RELEASED')),
  created_at timestamptz default now()
);
```

**The subtraction rule is server-side law:** `slots_remaining = total_slots −
Σ(allocations where status ≠ RELEASED)`, computed in one place (a Postgres
function/view), never client-side — identical to the shared-container spec's
"never compute allocation client-side" rule and its row-lock concurrency
pattern for the last slot. TOWER UI shows the container as a slot grid: select
slots → assign to account/order → enter or accept the quantity (defaults to
`units_per_slot × slots`, editable within the packing math) → remaining
recomputes. `tower.container_commitments` (CBM-denominated) stays untouched
for the existing flows; a DB trigger mirrors `rb_slot_allocations` into a
commitment row so downstream ERP (POs, landed costs, documents) works
unchanged.

### 3.4 Publishing loop
TOWER → site is one-directional publish: brand `LIVE` + template `PUBLISHED` +
container `OPEN/FILLING` with `public_fill_visible = true` is exactly what the
site may render. The site reads through views (`rb_public_brands`,
`rb_public_containers`) exposing only public fields — never base tables.

---

## 4 · The buy-in-container instrument (`/marcas/{brand}/contenedor`)

The dynamic instrument, one screen, three zones:

1. **Container selector** — live containers for this brand (route, kind,
   closing date) + "contenedor completo" (full 20ft/40ft from any published
   template). FillMeter renders current fill state; claimed solid / reserved
   hatched / open outline — the same organ, same grammar as shared-container.
2. **Allocation mode toggle — by slots or by quantity** (the two entries to
   the same math):
   - *Por cupos:* stepper over `slots_remaining`; instrument shows the cascade
     per Costco honesty rule: `3 cupos = 45 cajas = 1.080 unidades = 10,2 m³`.
   - *Por cantidad:* buyer enters units (or boxes/packets — any packing level);
     server converts up the packing profile to the minimum slot count that
     holds it, shows the rounding remainder explicitly («1.000 unidades →
     3 cupos; sobran 80 unidades de capacidad — puede completarlas o dejarlas»).
     Conversion is a server endpoint (the same subtraction/packing functions
     TOWER uses) — one math, two consumers.
3. **Commitment** — no cart, no checkout (site law). The action produces a
   **documented reservation lead**: allocation intent written as
   `rb_slot_allocations(status='RESERVED')` + lead row + WhatsApp/email
   notification (existing notification flow, insert-first). Reservations
   expire untouched after N days (TOWER cron releases them — subtraction
   self-heals). Deposits, if introduced, arrive with shared-container Phase 2
   and reuse its mechanism — decision deferred there, not duplicated here.

Pricing display: per-slot all-in price MAY be published (precedent:
shared-container slot landings publish `slot_price_usd`). **Per-unit prices
never appear** — the wholesale-language lint runs on brand shelves too.
Whether brand #1 launches with published slot prices or "a cotizar" is a
Muaaz decision (§7.G3).

Concurrency: last-slot races resolve server-side with row locks; loser gets a
waitlist path (both patterns lifted verbatim from the shared-container spec).

---

## 5 · Mister — the brand data loop

Mister must know every represented brand and its container math with **zero
manual pack-writing per brand**. The loop:

```
TOWER: brand → LIVE, or template/container published/changed
  → trigger (Supabase webhook / n8n)
  → pack compiler (server job) reads represented_brands + templates + public containers
  → writes/updates Mister knowledge pack  key = rb-{slug}
  → Mister per-turn context pre-resolution picks it up on the next conversation
```

Pack contents (compiled, not hand-written): `vocabulary` (brand terms, ES/EN),
`unit_math` (units_per_slot per container kind, packing cascade, CBM/kg
bounds), `availability_shape` (which containers exist and their fill state —
**as structure, never as promises**), `diagnosis_set` (brand-scoped
qualification questions layered on the ALLOCATION archetype engine),
`handoff` (WhatsApp + TOWER pipeline id), `forbidden` (inherits every existing
guardrail: no absolute unit prices, no lead-time promises, no availability
guarantees — slot counts render through the `ContainerOfferCard` surface,
which already exists, not through prose).

Mister conversation additions: the ALLOCATION archetype gets an induction lane
(«¿Le interesa una marca que representamos?» → brand → container kind →
slots-vs-quantity → `ContainerOfferCard` → reservation handoff into §4's
instrument with state pre-filled). The hold-back guardrail and control-block
contract are untouched — this is a knowledge pack + archetype addition, not an
engine change.

---

## 6 · Build phases (each gated, in order)

**Phase 0 — Ratification (Muaaz, no code).** Decisions in §7. Amend root
`CLAUDE.md` (§5-bis + ALLOCATION archetype row). Brand #1 qualification
interview (root-law Phase-0 questions adapted: mandate scope, packing data
availability, photography feasibility, one shippable container composition).

**Phase 1 — TOWER foundation.** Migrations `tower_22+` (§3 tables, `RB_KIT`
enum extension on `ai_drafts.kind`, subtraction functions, mirror trigger,
public views, RLS on every table). TOWER UI: brand registration (auto-minted
code + AI kit compiler → pre-filled kit review, validators, the structural
wiring gate), designation worksheet, slot-allocation grid.
Gate: ops registers brand #1 from one upload drop to an approved kit in a
single review session (manual entry only for rejected slots); publish actions
are provably disabled while the kit is incomplete; source tags demonstrably
require human confirmation; the subtraction math survives a
concurrent-allocation test.

**Phase 2 — Site shelf + interaction layer.** `(brands)` route group +
white-canvas tokens + brand token contract; **Odd Ritual grammar port**
(§2.6: data-attribute system → useGSAP components, scoped Lenis, route-curtain
in `--rb-accent`); §2.7 mockups approved on claude.ai/design (brand #1 tokens
+ clashing stress-test brand) **before** shelf code; `/marcas` sub-home;
`/marcas/{brand}` About + Products with BrandHero/MandateSeal/BrandStory/
BrandGallery/BrandMarquee live. Gate: brand swap test passes; wholesale-
language lint green; white canvas provably scoped (global chrome
pixel-identical outside `(brands)`); reduced-motion parity; LCP < 2s on 4G
with the full interaction layer loaded (GSAP lazy where possible).

**Phase 3 — The instrument.** §4 ContainerConfigurator on top of Phase-1
endpoints (SlotGrid + PackingCascade + FillMeter wired to live fill state,
`/api/rb/convert` + `/api/rb/reserve`); reservation → lead → notification
flow; expiry cron. Gate: full reservation round-trip lands in TOWER with
correct subtraction; race test passes (409 → waitlist renders); by-quantity
conversion matches TOWER's math exactly on a property-based test set.

**Phase 4 — Mister loop.** Pack compiler + trigger; ALLOCATION induction lane;
`ContainerOfferCard` wiring; test transcripts against brand #1's diagnosis set.
Gate: add a fictitious brand in TOWER → Mister answers correctly about it with
no human pack edit; guardrail suite still green.

**Phase 5 — Launch brand #1.** Content gate (flagship container composition
fully specified, ES/EN, photography or typography-led interim), all root-law
QA gates, status `LIVE`. Payoff rule applies: **brand N+1 must cost a fraction
of brand N** — anything hand-built for brand #1 that isn't template/token/data
is architecturally wrong.

### Workstream topology — this is a multi-end program

Represented-brands is not one build line. It has four ends with independent
growth paths; only one of them is coupled to TOWER. **The program's home is
`programs/represented-brands/` on `master`** — spec evolution never rides
another program's feature branch.

| Workstream | Covers | Lives in | Branch/merge target | Coupled to |
|---|---|---|---|---|
| **WS-DOC** — the program | this spec, decisions, gates | `programs/represented-brands/` | `master`, directly | nothing |
| **WS-TOWER** — registration + designation + allocation | Phase 1; server math of Phase 3 | `tower` schema (migrations 22+) + `apps/tower` | the TOWER line (`feature/tower-wave1` until merged/deployed) | TOWER deployment |
| **WS-SITE** — shelves + instrument UI | Phases 2–3 (site side) | `apps/site` `(brands)` route group | `feature/rb-shelf-*` off `master` (post tower-wave1 merge) | not TOWER UI — see fixture rule |
| **WS-MISTER** — the brand data loop | Phase 4 | pack compiler + `apps/site` Mister | `feature/rb-mister` off `master` | WS-TOWER's public views in prod only |

**Fixture rule (what lets the ends grow apart):** a dev-only seed migration
ships `rb_public_brands` / `rb_public_containers` fixtures (one fictitious
brand, full kit manifest, two containers mid-fill). WS-SITE and WS-MISTER
develop and pass their gates against the fixtures; they bind to real TOWER
data at integration, not during development. The public views are therefore
the **only contract between the ends** — schema changes to them require
touching every workstream and are flagged accordingly.

Cross-program: reuses shared-container's slot/FillMeter substrate; does not
block or modify Network. Note: `master` currently predates the monorepo
migration (all of it sits unmerged on `feature/tower-wave1`); WS-SITE and
WS-MISTER branch from `master` only after that merge lands — until then their
work would have no `apps/site` to land in.

---

## 7 · Open decisions for Muaaz (Phase-0 gate)

- **G1 · Archetype:** ratify `ALLOCATION` as archetype #7 (recommended), or
  direct otherwise. A new archetype is a framework amendment — this spec only
  proposes it.
- **G2 · Route name:** `/marcas` (recommended — ES-first, matches site voice)
  vs `/marcas-representadas` vs English.
- **G3 · Price display at launch:** published all-in slot prices (shared-
  container precedent, stronger conversion) vs "a cotizar" (Mister-consistent,
  safer with a new mandate). Recommendation: a cotizar for brand #1, publish
  prices once landed-cost data has one real container behind it.
- **G4 · Relationship to WGT/05 Representation:** brand shelves also appear as
  credential pages on WGT/05 when lanes split (recommended: yes, one-line
  cross-link, no duplication), or `/marcas` fully replaces that part of WGT/05.
- **G5 · Brand #1:** identity, mandate scope, packing data. The spec is
  brand-agnostic by design; Phase 0 cannot close without it.
- **G6 · Template adoption mode:** ratify §2.6 — the Odd Ritual clone as
  interaction *grammar* ported into `apps/site` (recommended; one port serves
  every brand, keeps Mister/TOWER/TypeScript law intact). The alternative —
  standalone vanilla-JS microsites per brand from the clone — is rejected in
  this spec: that is the *endorsed-brand* path (§5 root law, own site, own
  advisor), not representation. If a flagship brand ever warrants a standalone
  immersive site, it graduates to endorsed status; the shelf remains.
- **G7–G10** live in §8 (capital model · brand approval loop · regulatory
  screen · slot-vocabulary collision) — same Phase-0 gate, decision-shaping.

---

## 8 · Second-order considerations (identified 2026-07-09, pre-ratification)

Things the happy path above doesn't cover. Each either gets a decision at
Phase 0 or an explicit deferral written here — none may be discovered mid-build.

### 8.1 Capital model — who owns the goods (decision-shaping, G7)
"Wings manages the inventory" has two very different shapes: **consignment**
(brand owns stock until allocation; Wings margin = commission) vs **purchase**
(Wings buys the container; full working-capital exposure). This changes the
TOWER data model (whose asset appears in `landed_costs`), the P&L, and risk.
Directly coupled: **the fill-threshold rule** — a PO against the brand is
issued only when ≥X% of slots are `CONFIRMED`; below threshold at deadline,
the `fallback_policy` fires (mirror the shared-container field: extend once /
convert to smaller kind / release with notice — the rb tables currently lack
it; add `fallback_policy` + `fill_threshold_pct` to `rb_container_templates`).
Never order a container against unfunded reservations.

### 8.2 Brand approval loop (G8)
Official partners will contractually retain approval rights over how their
identity is used. The onboarding pipeline (§3.1) gains a state:
`SIGNED → ONBOARDING → BRAND_REVIEW → LIVE` — a shareable staging preview of
the shelf goes to the brand, sign-off is recorded on the brand record
(document ref in `mandate`). The §2.5 token contract must be *derived from the
brand's own usage manual*, not sampled from their website. MAP/pricing-display
constraints from the brand's side feed G3 per brand, not globally.

### 8.3 Regulatory screen per category (G9)
"Categories that extend beyond our lanes" is exactly where import compliance
bites: food/supplements (DIGESA), electronics (homologation), toys, chemicals.
Phase-0 brand interview gains mandatory questions: HS codes per product,
permits required, importer-of-record obligations, labeling law (Spanish
labeling for consumer goods). A brand whose category needs a permit Wings
doesn't hold cannot pass `ONBOARDING`. Store per-product `hs_code` +
`regulatory jsonb` on the packing profile — TOWER's trade-documents module
consumes it.

### 8.4 Two slot systems in public (G10)
After launch, the site sells "cupos" in two places: Contenedor Compartido
(buyer's own goods, group coordination) and brand containers (Wings' curated
cargo). Same word, same FillMeter, different products — real confusion risk,
especially inside Mister. Decision: one public vocabulary («cupos») with an
explicit disambiguation rule in Mister's induction («¿cupos para tu propia
mercadería, o cupos de una marca que representamos?»), and brand containers
MAY appear on the public slot marketplace shelf as a distinct card type
(recommended: yes — shared demand pool), but a shared-container group can
never mix third-party goods into a brand container.

### 8.5 Buyer identity + post-reservation lifecycle
The site has no auth; a reservation that expires in 72h needs a way for the
buyer to see/extend/confirm it. Phase 1 answer (deliberate, cheap): the
reservation is WhatsApp-mediated — confirmation, extension, and milestone
updates run through ops + the existing notification flow; the buyer-facing
status page reuses the shared-container magic-link workspace **when
shared-container Phase 2 ships it** — do not build a parallel account system.
In-transit milestone tracking for brand containers reuses the same workspace
pattern (route, ETA, customs, deconsolidation, pickup/delivery at Callao).
After-sales is part of the mandate: warranty/defect handling terms are a
required `mandate` field — an official partner cannot answer «eso se arregla
con la marca».

### 8.6 SEO — the shelves are the acquisition engine
«{Marca} Perú distribuidor oficial» is the highest-intent query this program
can own, and brand shelves are the only pages on the site with brand-name
search volume attached. Requirements: server-rendered shelf content (the
interaction layer hydrates on top — never client-only content), `Organization`
+ `Product` structured data (Offers **without** unit price), hreflang ES/EN,
and the brand roster in `sitemap.ts` from the public view. Landing the mandate
statement above the fold is both trust design and the featured-snippet target.

### 8.7 Asset integrity
Brand product imagery must be brand-supplied or Wings-shot. The existing
image-generation law extends here verbatim: *scenario may be generated;
evidence may not* — a generated image of a real branded product is
misrepresentation of an official partner. `identity.media[]` entries carry a
`source` field (`brand_supplied` | `wings_studio` | `generated_scenario`);
product pages may only render the first two.

### 8.8 Analytics — slot economics per brand
Per-brand funnel from day one: shelf visit → configurator open → mode chosen →
reservation → confirmation, plus fill-rate and days-to-fill per container and
CAC per slot when campaigns start (the deleted meta-ads program's replacement
should treat brand-container closings as perishable campaigns, same anatomy as
shared-container slot campaigns). These numbers are what a brand renewal
negotiation runs on — they are a commercial asset, not telemetry.

### 8.9 Costing dependency (build-order warning)
Landed-cost-per-slot pricing (G3's "publish prices" branch) depends on a
costing engine TOWER does not yet have — the same missing Peru costing engine
that blocks the wings-operations decommission. G3's recommendation («a
cotizar» at launch) stands precisely because of this; publishing prices is
gated on that engine existing, whichever program builds it first.
