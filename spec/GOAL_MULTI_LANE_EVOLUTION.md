# GOAL — The Multi-Lane Evolution

**Status: NORTH-STAR (2026-07-11, refined same day — see Refinement log).** The
alignment goal for turning the live single-lane site into the multi-lane trade
house. It combines the two promotion specs — `spec/WINGS_MOTION_AND_DRAFTING_SYSTEM.md`
(Flood · Settle · Draft) and `spec/WINGS_LIVERY_SYSTEM.md` (the three-tier token /
derivation law) — into one architectural + UX decision set. Those two specs are the
**source of truth**; this file decides how the platform *moves* into them.

Root `CLAUDE.md` remains supreme. The Manifest/lane-template section orders cited
below live in the ecosystem umbrella program
(`programs/ecosystem/wings-global-trade-umbrella-ecosystem.md` §4.1/§4.2) — a
QUEUED program; executing Phase D of this goal is the explicit decision to start
that surface (root law: never build from `programs/` without that decision).

---

## 0 · The goal in one sentence

> Arriving at the domain orients you to **the Manifest**; entering a lane
> **floods** you into its livery; and from there every catalog, CTA, and
> instrument is the **same box re-painted** — navigation, footer, motion, and
> color all derived from one lane registry by rule, never forked.

The payoff this goal protects (root CLAUDE.md): **lane N+1 costs a fraction of
lane N.** Any evolution step that makes the next lane more expensive to open is
wrong, however good it looks.

---

## 1 · Where we are — the single-lane trap (audit)

The live site is an excellent machinery site and a structurally *un-multi-lane*
one. The debt is concentrated in exactly the two places the user named — the
header and the footer — plus the domain root.

| Symptom | Evidence (real code) | Why it blocks multi-lane |
|---|---|---|
| The domain root is a **machinery homepage**, not a Manifest | `app/page.tsx` (WGT/01 hero), `layout.tsx:33-34` metadata "Maquinaria agrícola, camiones, buses…" | A second lane has nowhere to arrive *to*; the house has no neutral orientation surface |
| The header is a **catalog bar for one lane** | `SiteNav.tsx:19-25` links (`Catálogo` mega-menu = machinery taxonomy, `Motores`); `MegaMenu categories={categories}` (:272) | The primary nav *is* WGT/01's taxonomy. A second lane cannot appear without forking the nav |
| The mega-menu content is hardcoded — **which is the right pattern in the wrong place** | `MegaMenu.tsx:30-85` static `COLUMNS` ("not DB-driven for performance") | The static-config-per-nav pattern is correct; it just belongs in WGT/01's lane nav config, not in house chrome |
| The footer is **one lane's columns** | `Footer.tsx:40-43` feeds `TrustFooter` machinery `categories` + services | No lane index, no colophon of codes — the footer cannot be the system map |
| Chrome takes `categories`, never a **lane** | `layout.tsx:65,78,80` passes one `getCategories()` to both `SiteNav` and `Footer` | There is no lane dimension anywhere in the global chrome |
| The **accent is hardcoded gold** and the solid bar a hardcoded hex | `SiteNav.tsx:304` (`bg-gold` rule), `:240` (`Cotizar` gold), `:124` (`bg-[#000C1F]/95`) | House accent baked into chrome instead of read from tokens |
| `forceSolid` is a **hand-enumerated route list** | `SiteNav.tsx:108-115` (`/catalogo`, `/repuestos`, `/g/`, `/contenedor`, `/marcas`) | Every new lane/surface means editing the list — the inverse of registry-driven |
| Dead legacy control | `NavCategoryDropdown.tsx` — zero importers | Delete in Phase C, before it survives the migration as a second catalog control |
| The target pattern **already ships, unadopted by the house** | `BrandShelfNav.tsx` (second sticky bar under the house header: accent pulse + identity band), `BrandCurtain` (Flood), `rb-canvas.css` (`--rb-*`) | The represented-brand shelves already run the full two-tier chrome model; the house just never generalized it upward |

**What is already right and must not regress:** one primary action per surface
(Cotizar / Mister, never a cart); the scroll-rule *device* (the pulse — it
generalizes, it doesn't get deleted); Mister as a fullscreen world takeover
(`SiteNav.tsx:106`); the `TrustFooter` organ boundary (content in the adapter,
markup in the organ — `TrustFooter.tsx` carries zero Wings hardcodes); the
`sticky top-16 md:top-18` two-bar stack `BrandShelfNav` proves.

### Current-state scorecard (multi-lane readiness, /100)

| # | Dimension | Now | Target | Gap |
|---|---|---|---|---|
| 1 | Arrival orientation (does landing say what the house is / where to go) | 35 | 95 | Root is a lane, not a Manifest |
| 2 | Lane discoverability / findability | 20 | 95 | Only `/marcas` hints at multiplicity |
| 3 | Navigation scalability (survives N lanes) | 15 | 95 | Nav hardcodes one lane's catalog |
| 4 | Taxonomy clarity & mutual exclusivity | 55 | 95 | One flat catalog; no lane→archetype→category spine |
| 5 | Cross-lane wayfinding (lane-switch legibility) | 25 | 95 | No lane switcher; no Flood at house level |
| 6 | Primary-action / conversion architecture | 80 | 95 | Strong today; must stay invariant per lane |
| 7 | Identity coherence across lanes (livery + motion) | 60 | 95 | Coherent within one lane; unproven across |
| 8 | Instrument/artifact functionality (drafting serves buyer logic) | 75 | 95 | Excellent; must generalize off `--rb-*` |
| 9 | Footer as system map (colophon / manifest) | 30 | 95 | Footer is a lane's columns, not the house index |
| 10 | Governance & scalability (cost to add a lane) | 25 | 95 | Adding a lane today = editing nav/footer by hand |
| | **Composite** | **42** | **95** | |

The site is a top-1% *single-lane* B2B experience trapped in an architecture that
cannot hold a second lane. Every point of the gap is structural, not cosmetic.

---

## 2 · The arrival model — from domain to lane

The whole evolution is decided at the moment of arrival. Two laws first, because
they resolve every row below:

1. **The FLOOD is a transition signature.** It fires only when the resolved
   identity scope changes between routes (`house ↔ lane`, `lane ↔ lane`,
   `house ↔ brand`, `brand ↔ brand`). Navigation **within** a scope — catalog
   pages, spec sheets, tabs inside one lane — is SETTLE only. (The built
   `BrandCurtain` currently floods on *every* route change inside a brand shelf,
   including tab-to-tab; acceptable on a 3-page shelf, unbearable on a 40-page
   lane catalog. Founder must either ratify the within-brand flood as an
   RB-scoped variance or align it to this law — see Refinement log.)
2. **Hard loads have no departing scope, so they never fire the transition
   Flood.** A hard arrival gets, at most, a **threshold reveal** (the Flood's
   preloader variant, e.g. `BrandReveal`) — reserved for identity-led surfaces
   (brand shelf home; optionally a lane home). Utility deep-links (`/g/{token}`,
   spec sheets, quote flows) get **no ceremony**: the buyer came for numbers, and
   a preloader there costs trust.

| Arrival | Surface | Chrome identity | Signature |
|---|---|---|---|
| **Cold at root** `/` | **The Manifest** (group home) | House — navy `#001E50` + gold `#C4933F`, mark-less | none (SETTLE on scroll) |
| **Into a lane** `/machinery`… (click or lane-switch) | Lane page | Lane livery (`data-lane`) — accent from registry | **FLOOD** carrying the LaneStamp (transition) · threshold reveal on hard load is optional, per-lane |
| **Into a brand shelf** `/marcas/{brand}` | Represented brand | White §5-bis canvas (`data-brand`) | **FLOOD** on transition (built) · `BrandReveal` threshold on hard load (built) |
| **Utility deep-link** `/g/{token}`, a spec URL | Already in-scope | The target scope's livery, resolved server-side | **SETTLE** only — no flood, no reveal |

**The rule:** the house ground never changes (root CLAUDE.md §5-bis is scoped to
the brand route group). Identity arrives by *token cascade at the scope boundary*,
announced by the FLOOD, and the FLOOD reads the **arriving** scope's accent + mark
at transition time — the navy-fallback bug fix is why this is law, not a lookup.

---

## 3 · The navigation evolution (the core deliverable)

Both header and footer move from *"one lane's catalog"* to *"a two-tier reading
of the lane registry."* Neither ever hardcodes a lane again. The single source
both read is the lane registry — `packages/liveries/registry.md` stays the
append-only **law**; chrome consumes its **typed mirror**
(`packages/liveries/lanes.ts` or equivalent), with a test asserting mirror↔ledger
parity so the two can never drift.

### 3.1 Header — the two-tier shelf (already shipped once)

**Tier B is not a new component.** The two-tier stack already ships on `/marcas`:
the solid house bar + `BrandShelfNav` sticky-stacked under it (`sticky top-16
md:top-18`), with the accent pulse on its top edge and the identity band that
holds the scope's mark when the house tier auto-hides. Phase C **generalizes
`BrandShelfNav` into one `ShelfNav`** with two thin adapters:

- **Brand adapter** = today's `BrandShelfNav` content (isologo band, La marca /
  Productos / Contenedor tabs, `--rb-accent` pulse, brand code right-aligned).
- **Lane adapter** = LaneStamp + lane code in the band, the lane's catalog nav in
  the tabs slot (today's machinery `MegaMenu` columns become WGT/01's instance of
  this slot, kept as static per-lane nav config — the existing
  "hardcoded-for-performance" pattern, relocated to `lane.config`), pulse in
  `var(--lane-accent)`.

The pulse/band devices are proven; the only new engineering in Tier B is the
lane adapter's mega-panel content.

**Tier A — House shelf (always present):**
- Logo → **the Manifest** (not the machinery home).
- **Lane switcher** — the new primary control (§3.3). This *absorbs* today's
  single "Catálogo" dropdown — Catálogo was WGT/01's lane switcher all along.
- **Mister** (house-global, lane-aware pack), **Cotizar** (house-global RFQ),
  search, WhatsApp, Contacto. Budget: ≤6 controls besides the logo — `Cómo
  importar` and `Nosotros` demote into the switcher panel's quick column and the
  footer to hold it.

**Tier A never re-themes.** Inside any scope (`data-lane` or `data-brand`) the
house bar is **always solid house navy** — exactly what `/marcas` ships today.
Transparency is a house-hero device only (the Manifest and house pages).
Consequences, replacing the current logic:

- `forceSolid`'s hand-enumerated route list (`SiteNav.tsx:108-115`) inverts:
  **solid is the default; transparent is opted into** by the routes that own a
  house-ground hero. No list to maintain, no per-lane legibility math — the
  "transparent nav must read the lane ground" problem is deleted rather than
  solved, because transparent-over-lane-ground never exists.
- The solid bar's `#000C1F` hex reads `var(--livery-navy-900)`; the pulse and
  active-link rules read `var(--lane-accent)` (house value = gold).

**Mobile (the `MobileMenu` restructure):** the lane switcher is the top-level
block — the numbered `PRIMARY_NAV` renders the lane index (codes + names + status
stamps from the registry) above the house-global actions (Mister, Cotizar,
Proceso, Nosotros, Contacto). The **active lane's catalog** nests under its own
lane entry, labeled with the lane code (today's flat "Categorías" chips become
that nested, lane-scoped block, rendered only in-scope). Selecting a different
lane fires the same Flood. The menu surface itself stays house navy — it is
Tier A.

**Behavioural invariants kept:** hide-on-scroll-down / reveal-on-up
(`SiteNav.tsx:52-57`); Mister returns `null` (world takeover, §3.3); the identity
band behind the auto-hiding header (the `BrandShelfNav` device) generalizes to
lanes so the scope survives when the house tier hides; the ≤8-node lane-nav
budget (root CLAUDE.md Phase-0 Q4) and ≤2 mega-panel depth (dual-taxonomy space
overlay is a curated second entry, not a third level — umbrella §4.3).

### 3.2 Footer — the footer manifest (honest structure: one footer, two inputs)

Not genuinely two-tier — calling it that overstates it. The structure is:
**the lane-index colophon always renders; the active lane's catalog column
renders contextually.**

- **The lane manifest (always):** every lane code + name + status stamp
  (`WGT/01 · WGT/02 · … · RB/01`), rendered from the registry mirror — the
  footer's new hero and the site's second navigation. Ports/zones, entities,
  markets, contact stay.
- **The lane column (in-scope only):** inside a lane, that lane's catalog column
  replaces today's machinery `categories`; on the Manifest and house pages the
  column is absent and the index carries the footer.
- The organ change is additive: `TrustFooter` accepts `lanes[]` alongside the
  existing `categories[]` (which becomes optional); the Wings adapter
  (`Footer.tsx`) feeds both from the registry mirror + the active lane config.
  The organ stays a Server Component and keeps importing nothing from `apps/*`
  — swap test holds.

### 3.3 The lane switcher (the riskiest new control, fully specified)

**One concept, two mounts.** The switcher panel and the Manifest's Lane Index
(umbrella §4.1 pt 2: manifest-table **rows**, not cards) are the same component
— `LaneIndex` — rendered compact in the Tier-A dropdown and full-surface on the
Manifest page. Hovering a row previews its accent (the row floods with the lane
livery — umbrella §4.1's own device); the panel closes with a "Ver el Manifest →"
link to the full page. The concept is never duplicated: the switcher is the
persistent control, the Manifest is the landing surface, both are `LaneIndex`
reading the registry.

- **Brands are not lanes:** the panel carries a visually separate "Marcas
  representadas" section linking the `/marcas` roster — the switcher teaches the
  three-category architecture instead of flattening it.
- **Selecting a lane always deep-links to the lane home.** No last-position
  restore: the control is navigation, not a tab switcher; the lane home is where
  the FLOOD → lane-header sequence teaches the lane, and restore-state would
  skip it and create ambiguity. (Personalized resume is a deferred feature, not
  chrome.)
- **Flood mechanics:** selection triggers the generalized `Flood` (motion spec
  §3) exactly when the scope changes (§2 law 1). The Flood is **interruptible**
  (frozen-skeleton law): a second selection mid-flood retargets the same curtain
  — never queues, never stacks. Keyboard: the switcher is a standard menu
  (trigger toggles, roving focus, Enter selects, Escape closes and returns focus
  — same contract the Catálogo trigger already implements at
  `SiteNav.tsx:75-103`). Rows are real links (`<a>`), so no-JS falls back to
  plain navigation. Reduced motion: the Flood collapses to crossfade (Tier-1
  law) and the hover-preview is a static accent swatch.
- **OPENING stamps ship early:** pre-split, the switcher renders whatever the
  registry holds — the house row plus `OPENING` lanes. That is root-law behavior
  ("a lane is not real until it appears on The Manifest — even as an OPENING
  stamp"), and it means Phase C can ship before Phases D/E make the rows live.

**Mister and lane context (the takeover has no chrome):** `SiteNav` returns
`null` on `/mister` — correct, the world takeover keeps its boundary, and the
switcher does not exist inside it. Lane context inside the Mister world is
**conversational, not chrome**:

1. Launched from inside a scope (widget or lane CTA), the session inherits the
   `lane` context field from the scope it was launched in — the pack is
   pre-resolved, no question asked.
2. Cold at `/mister`, the induction asks which lane (umbrella §4.1 pt 5 — "Mister
   asks which lane before diagnosis"), exactly as the v2 archetype induction
   already works. The brain **is** the switcher inside its own world.
3. Leaving Mister into a lane is a normal scope change — the Flood fires on
   arrival.

---

## 4 · CTA + artifact streaming logic (the "same logic" made concrete)

CTAs and artifacts are *streamed* — revealed and re-themed per lane — by the same
three signatures and the same token cascade. Nothing about the streaming logic is
per-lane code; only the tokens and the knowledge pack change.

**CTAs — one primary action, re-painted, never re-invented:**
- Every surface keeps exactly **one** primary action: *start a quote conversation*
  (Cotizar/RFQ or Mister). Invariant across all lanes and locales — no cart, no
  retail verb (root CLAUDE.md Prime Directive 2).
- The `Cotizar` control drops its hardcoded gold classes (`SiteNav.tsx:240`) and
  reads the lane token contract → per lane it re-themes to the lane accent
  automatically. The button structure never forks.
- CTAs **arrive on SETTLE** (short translate/mask on `--ease-settle`), never a
  spring — cargo set down, not a toy.
- **Mister is the cross-lane CTA**: `MisterSiteWidget` stays house-global and
  lane-aware — one brain, the `lane` context field on every session, the lane's
  knowledge pack. It is the one CTA that is deliberately *not* re-themed away from
  the house, because Mister is Wings IP (equity-transfer: the house voice).

**Artifacts — the drafting instruments, streamed per archetype:**
- The instruments (`FillMeter`, `ContainerSliceDiagram`, `PackingDiagram`,
  `ExplodedDiagram`, spec sheets) **render on DRAFT** — they draw themselves from
  real data (`TechDraw`), always a visible derivation, never decoration.
- **Which** instruments a surface streams is decided by the lane's archetype, per
  the motion spec §4 reuse map — EQUIPMENT streams SpecSheet-blueprint + slice;
  COMMODITY streams the ManifestTable + pallet + count-ups; PROJECT streams
  exploded assembly drawings; CREDENTIAL streams Settle only. Same engine,
  archetype selects the vocabulary.
- Every instrument reads the **`--draft-*`** contract (motion spec §3), so the same
  figure re-skins from `--rb-*` (brands) to the lane tokens with zero component
  overrides. The `--draft-paper` token is what lets the instruments live on dark
  EQUIPMENT/CREDENTIAL grounds instead of assuming white.

**The streaming sequence on any lane page** maps 1:1 onto the lane template's
six slots (root CLAUDE.md §4 Phase-3 / umbrella §4.2):

```
FLOOD    → slot 1  lane header (stamp, code, scope — the livery flood)
SETTLE   → slot 2  capability statement
SETTLE   → slot 3  category architecture (the browse layer)
DRAFT    → slot 4  container logic (FillMeter, CBM/MOQ math draw themselves)
SETTLE   → slot 5  proof
action   → slot 6  Mister + RFQ — the page's one primary action closes it
```

DRAFT is **not** the finale — proof follows it and the primary action closes the
page. (Shorthand "FLOOD → SETTLE → DRAFT → action" undersold slots 5–6; the
six-slot mapping is the law.)

---

## 5 · The spine that makes it deterministic

Three mechanisms carry the whole evolution; if these hold, adding a lane is a
config change, not an engineering project.

1. **`data-lane` at the lane layout** cascades the Tier-3 livery through a
   `--lane-*` token contract — the lane mirror of `--rb-*` (accent, accent-ink,
   ground, ink, surface-tint), with house-value fallbacks, populated from the
   registry-derived livery file. Chrome, CTAs, and instruments read semantic
   tokens (`--lane-*`, `--draft-*`, `--flood-*`) — re-painting a lane is a
   stylesheet.
2. **The generalized `Flood`** (`@wings/trade-ui/motion`, from `BrandCurtain`)
   queries `[data-lane], [data-brand]` and reads `--flood-accent` +
   `data-flood-mark` — one component serving lane-switch and brand-curtain,
   resolving the arriving scope, firing only on scope change (§2 law 1). The
   frozen skeleton already owns the eases and `--lane-switch-duration`.
3. **The lane registry is the single source of nav truth.** `registry.md` stays
   the append-only law; a typed mirror (`packages/liveries/lanes.ts`) feeds
   `LaneIndex`, `ShelfNav`, and `TrustFooter`, with a parity test against the
   ledger — so onboarding a lane lights up the switcher, the shelf, and the
   footer colophon with **zero chrome code changes** (the root CLAUDE.md
   §Phase-1 promise, made real in the chrome).

---

## 6 · The multi-lane taxonomy (IA)

**Top-level domains** — 3 structural categories, not a flat catalog:

```
wingsglobaltrade.com/
├─ (manifest)         The house — home, infrastructure, nosotros, contacto, proceso
├─ (lanes)/{slug}     WGT/01…06 + candidates — each a domain with its OWN
│                     archetype-shaped catalog taxonomy (root CLAUDE.md §3/§4)
│     └─ {archetype taxonomy} → spec sheet → RFQ  (EQUIPMENT: function→spec;
│                     PROJECT: dual discipline/space; COMMODITY: grade table; …)
└─ (brands)/marcas/{brand}   Represented brands — white canvas (built)
```

- **Mutual exclusivity:** a product belongs to exactly one lane. Cross-lane
  concepts (shared container / «Trae tu grupo» incl. `/g/{token}`, Mister,
  Cotizar) are **house-level**, reachable from every lane but owned by none.
- **Today's chrome links, sorted by that rule:** house-level — `proceso`,
  `marcas`, `mister`, `nosotros`, `contacto`, `cotizar`, `contenedor*`.
  Lane-level — the Catálogo mega-menu and `Motores` (`/repuestos`), which move
  into WGT/01's Tier-B shelf at the Phase-E split and leave the house chrome.
- **The overlap rule already decided** (root CLAUDE.md §3): Interiors (PROJECT)
  vs Living (PROGRAM) share cargo but split by buyer logic — the archetype, not
  the product, assigns the lane.
- **Scalability:** a new lane = one `lane.config.ts` + livery file + Mister pack
  + one registry row (+ mirror entry) + content. Nav switcher, lane shelf, and
  footer manifest auto-extend from the registry. Structural red line: **the
  chrome never enumerates lanes in code** — if a lane name appears in
  `SiteNav`/`Footer`/`MobileMenu`, the architecture has regressed.

---

## 7 · Implementation roadmap (ranked, effort × impact)

Ordered so each phase unblocks the next. Phases A–B are the two specs' own
checklists; C–F are this goal's chrome + IA work. Founder ratifications in Phase A
gate everything downstream.

| # | Phase | Work | Unblocks | Effort |
|---|---|---|---|---|
| 1 | **A · Ratify** | Founder decisions: the 3 signature names + ease-register (motion §7); the quantified livery gates + WGT/05 exception + Provisions→olive (livery §7); the Flood-boundary law + within-brand variance (§2); umbrella-program §4.1 activation (Phase D) | All token/motion law | Low (decisions) |
| 2 | **B · Promote motion+drafting** | Motion spec §6 checklist: `@wings/trade-ui/{motion,drafting}`, extract `eases.ts`, generalize `Flood` (scope-change trigger per §2 law 1), add `--draft-paper`, `--csd-*`→`--draft-*` | Lane-agnostic instruments + Flood | Med |
| 3 | **C · Lane-ify the chrome** | Generalize `BrandShelfNav` → `ShelfNav` (lane + brand adapters); build `LaneIndex` (switcher panel + Manifest mount) on the typed registry mirror; invert `forceSolid` (solid default, house-hero opt-in) + tokenize the bar; `TrustFooter` gains `lanes[]`; restructure `MobileMenu` (switcher top-level, lane catalog nested); define `--lane-*`; delete `NavCategoryDropdown` | The entire multi-lane nav | **Med-High** — reduced from High: Tier B and the two-bar stack are a parameterization of shipped code; the genuinely new parts are `LaneIndex` + the registry mirror |
| 4 | **D · Build the Manifest** | Group homepage per umbrella §4.1 (lane-map hero, `LaneIndex` full mount, shared-container, infrastructure, Mister dock, footer manifest); root stops being the machinery home; house metadata | Arrival orientation (dims 1,2,5) | High |
| 5 | **E · Split WGT/01** | Machinery → `/machinery` under `data-lane="machinery"` (steel-blue livery from livery §3); homepage content + mega-menu columns + `Motores` move into the lane's Tier-B shelf; **swap test** | Proof the box holds; lane #1 | Med |
| 6 | **F · Onboard WGT/02** | Interiors as lane #2 (dual taxonomy, brass livery, PROJECT instruments) — the proof lane N+1 is a fraction of lane N | The whole thesis, validated | Med (livery-only) |

Sequencing constraints (non-negotiable): **A before B** (law before code); **B
before C** (the generalized Flood must exist before the switcher uses it); **C
before D/E** (the chrome must be lane-aware before there is more than one lane to
switch between — and C can ship early because the switcher legally renders
`OPENING` stamps, §3.3); the represented-brand shelves ship *now* and are the
reference implementation the house copies in C.

---

## 8 · Definition of done & red lines

- [ ] `SiteNav`, `MobileMenu`, and `TrustFooter` render lanes from the registry
      mirror; **no lane name appears in chrome code** (grep-testable red line);
      the mirror↔`registry.md` parity test is green.
- [ ] Arriving at `/` renders the Manifest, not a lane; the house ground is
      unchanged navy/gold.
- [ ] Crossing a scope boundary triggers the FLOOD carrying that scope's mark;
      **navigating within a lane never fires it** (click any catalog link
      in-lane: no curtain); reduced-motion collapses to crossfade; the FLOOD
      reads the arriving scope; a mid-flood switch retargets, never queues.
- [ ] `/g/{token}` and spec deep-links render in-scope with SETTLE only — no
      flood, no threshold reveal.
- [ ] Tier A is solid house navy inside every scope; `forceSolid` contains **no
      route enumeration** (transparent is opted into by house-hero routes only).
- [ ] The lane switcher is fully keyboard-operable and its rows are real links
      (no-JS navigable); it is reachable at top level on mobile.
- [ ] Every CTA reads the lane token contract; every instrument reads
      `--draft-*`; zero hardcoded hex in chrome or artifacts (incl.
      `#000C1F` → `--livery-navy-900`).
- [ ] One primary action per surface; the wholesale-language lint passes in every
      locale; no cart anywhere.
- [ ] Swap test green across ≥2 lanes **and** with a brand's tokens on a lane
      shelf (the `ShelfNav` adapters prove the same organ serves both); parity
      (no-JS + reduced-motion) green; keyboard parity green.
- [ ] Equity-Transfer Test: with the Wings name removed, the buyer still knows
      whose house they are in (the seal, the Manifest lockup, or Mister carries it).
- [ ] `NavCategoryDropdown.tsx` deleted.

---

## 9 · Strategic answer

Against the top 1% of multi-brand B2B trade platforms, the **current** site
would *lose* on architecture (composite 42) despite *winning* on single-lane
craft — it cannot hold a second lane without a fork, which is disqualifying for a
house whose entire thesis is many lanes.

Executed to this goal, it **wins** — decisively, and on a dimension no competitor
holds: the same steel box, re-painted per cargo by rule, where the navigation
*teaches* the brand architecture (the Flood at every boundary), the numbers are
exhibited as instruments that draw themselves, and lane N+1 costs a fraction of
lane N. The moat is not the visual system alone; it is that the visual system,
the motion, and the information architecture are the **same derivation** — one
registry, read by the chrome, the color, and the motion at once. That coherence is
the thing juries stop scrolling for and competitors cannot retrofit.

**The one thing that decides it:** Phase C. The nav is where the thesis becomes
navigable or stays a deck. Everything else is ready or nearly so; the chrome is
the load-bearing wall — and it is a smaller wall than first drawn, because the
brand shelves already built half of it.

---

## Refinement log (Fable, 2026-07-11)

Decisions changed or sharpened in this pass; one line each.

1. **Tier B = `BrandShelfNav` generalized, not a new component.** The two-bar
   stack, pulse, and identity band already ship on `/marcas`; Phase C becomes a
   parameterization (`ShelfNav` + two adapters) and its effort drops
   High → Med-High.
2. **`forceSolid` inverted, not extended.** REVERSED from "extends to every lane
   path": Tier A is always solid house navy inside any scope (the `/marcas`
   precedent); transparency is a house-hero opt-in. This deletes the
   "transparent nav over lane grounds" legibility problem instead of solving it,
   and kills the hand-enumerated route list.
3. **Flood boundary defined as scope change.** Within-scope navigation is SETTLE
   only; hard loads never fire the transition Flood (threshold reveal is a
   separate, per-surface choice, denied to utility deep-links). Flagged: the
   built `BrandCurtain` floods within-brand tab moves — founder must ratify as
   RB-scoped variance or align.
4. **`/g/{token}` row corrected** from "SETTLE (no flood — you did not cross a
   threshold)" to the two-law model above — the old rationale was wrong for
   cold visitors (they *do* cross a threshold; the real reason is hard-load +
   utility surface).
5. **Switcher ↔ Manifest reconciled as one `LaneIndex`, two mounts** (compact
   panel / full page) — the concept is never duplicated. Brands appear as a
   separate roster section, not lane rows.
6. **Switcher always deep-links to the lane home** — no last-position restore
   (decided; resume is a deferred personalization feature).
7. **Mister lane context is conversational** — inherited from the launch scope
   or asked in induction; no switcher exists inside the takeover world.
8. **Footer restated honestly** as "lane-index colophon always + active lane
   column contextually" — not "two-tier mirroring the header."
9. **Registry mirror made explicit:** `registry.md` stays law; chrome reads a
   typed `lanes.ts` mirror with a parity test — markdown is a ledger, not a
   runtime data source.
10. **Streaming order re-mapped to all six lane-template slots** (root §4
    Phase-3 / umbrella §4.2): DRAFT sits at slot 4, proof follows, the primary
    action closes — the earlier shorthand implied DRAFT was the finale.
11. **Citations corrected:** Manifest/lane-template section orders live in
    `programs/ecosystem/wings-global-trade-umbrella-ecosystem.md` §4.1–4.3 (a
    QUEUED program — Phase D is its explicit activation), not root `CLAUDE.md`
    §4.2/§4.3; spec paths fixed to `spec/WINGS_*.md`.
12. **Audit additions:** dead `NavCategoryDropdown.tsx` (zero importers — delete
    in C); `MegaMenu`'s static `COLUMNS` recognized as the right per-lane
    nav-config pattern in the wrong (house) place; hardcoded `#000C1F` bar.
13. **Mobile model defined:** switcher top-level in `MobileMenu`, active lane's
    catalog nested under its lane entry, menu surface stays Tier-A navy.
