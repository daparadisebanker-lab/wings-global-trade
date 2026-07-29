# DECISIONS.md — WINGS Homepage Build

## Lane-aware site chrome, and the aisle's way back — 2026-07-29

From device testing on a real phone, plus an adversarial review of the previous
pass (all 12 claims verified PASS; its findings are folded in below).

- **The header and footer stayed machinery navy on a bone lane.** They are
  SIBLINGS of the lane wrapper in the root layout, so they never saw
  `[data-lane]` through the cascade. `LaneScope` now stamps the lane on `<html>`,
  and `SiteNav` + `TrustFooter` read a `--chrome-*` contract whose fallbacks are
  the current navy/gold — every non-lane route is byte-identical. §1.1 forbids
  forking a shared component per lane; this themes them instead.
- **Walnut, not bone.** The Wings logo is a white mark with no dark variant, so a
  bone header would erase it. Walnut `#2A2118` is the lane's own inverse ground,
  is unmistakably the brown side of the palette, and carries the white logo at
  15.8:1. The footer CTA is bone-on-walnut (14.02:1), **not** oxblood: oxblood on
  walnut is 1.50:1. It now matches the lane page's own closing action.
- **The footer's column labels were gold at 2.30:1** on navy — a pre-existing
  contrast failure inherited from the house. They read `--chrome-label`, which on
  this lane composites to 4.82:1.
- **A Tailwind trap, twice now:** `bg-[var(--x,#hex)]/95` silently emits nothing,
  because an opacity modifier cannot apply to an arbitrary `var()` whose fallback
  contains a comma. The header rendered fully transparent. Alpha now lives inside
  the token (`--chrome-nav-bg`). Same class of bug as the `<alpha-value>` issue
  that forced the channel-triplet tokens.
- **Lane routes force the solid nav.** A transparent nav over bone needs a scrim,
  and the navy scrim on bone read as grey mud.
- **The lane header stamp cluster** was three marks crammed on one line, the
  plate clipping at the container edge and colliding with the display type. Mark
  and status now stack as one block with the h1 a full step away.
- **The Lista header collapsed under the fixed density switch** — the
  availability note truncated mid-word beneath it. The switch owns the top-right
  band exclusively; the note moved down to sit with the rows it describes.
- **The aisle had no visible way back.** The edge scrubber can reach any booth,
  but it is a 3px rail of unlabelled ticks — not an answer for a buyer who just
  passed a series by mistake on a phone. A named "← Serie anterior" now sits in
  the thumb zone (hidden at the first booth rather than disabled: a dead control
  a buyer can press is worse than one that is not there), and the rail names
  itself on touch.
- **The on-screen decimal convention was split** (review finding): the Lane's
  spec bar printed `0.99 M²/CTN` with a dot while the Lista showed `0,99` one
  view away — the exact ambiguity the export rule exists to kill, live on
  adjacent screens. Every on-screen figure now goes through the es-ES formatter;
  `toFixed` is gone from all display code.
- **The Lista checkbox was 32px butted against a larger sheet-opening button**
  (review's most serious finding), on the view this lane's own law calls the
  accessibility floor — a miss opened the sheet. 32px visual, 44px target.

**Left alone, deliberately:** the Mister launcher keeps its own `--mister-*`
colour. Mister is a distinct identity with a ratified colour law, not machinery
chrome; repainting it per lane is a bigger decision than the header and footer
and is not mine to take silently.

## WGT/02 enhancement pass — identity, UI, IA, copy — 2026-07-29

Four parallel audits (brand-universe · ui-excellence · information-architecture ·
copy-messaging) against the shipped lane. Every claim was re-verified before
implementation; the arithmetic ones were recomputed. What they found and what
was decided:

- **The sheet-dock was broken in production.** `vaul` portals to `<body>`, outside
  the `[data-app="pasillo"]` wrapper, so every `--pas-*` token, every scoped
  selector and both self-hosted faces failed inside it: transparent background,
  site body face, **SKU codes not in mono** — on the one surface where a buyer
  studies the code. Introduced by the mount. It only looked plausible on the dark
  Lane, where white-on-blur reads by accident, which is why the first
  verification pass missed it. Fixed by stamping `data-app` on both portal
  children; the ground moved to a `data-app-root` variant so the token layer no
  longer paints (stamping it on the scrim had turned a 55% dark overlay into an
  opaque sheet of paper).
- **The lane was unreachable on a phone.** `SiteNav` and the footer carried
  Interiores; `MobileMenu` never did — on a lane whose catalogue is built
  thumb-first. Added.
- **Site search delivered real tile codes to the AI advisor.** `routing.ts` routed
  any 4–8 digit query to Mister as an HS code, and 14 SKUs in this catalogue are
  bare numerics (`1500084`…). Now an exact code index emitted by the pipeline is
  tested BEFORE the HS heuristic, with tile vocabulary added. A genuine HS
  heading (6907) still reaches Mister — that is a test.
- **The outbound RFQ mixed three number conventions.** `25.000 kg` (es-ES
  thousands) reads as twenty-five kilos in Foshan, beside `56,70` comma-decimals
  and `8.10` dot-decimals. Everything upstream is decimal-exact and it was being
  lost in transmission. The export now uses one convention — decimal comma,
  space thousands, no dot in any number — enforced by test. It also hardcoded
  "(FOB y CIF)" while printing the buyer's own selected incoterm two lines above;
  the request now derives from the selection. And it never asked for the fields
  the UI honestly marks *pendiente* (PEI, absorption, slip) — it does now, and it
  carries the `PM3001` review flag to the supplier instead of hiding it.
- **The focus ring was invisible on the dark aisle** — `#141414` on `#0D0D0D`,
  1.05:1, an outright WCAG failure on the primary view. Now `currentColor`:
  achromatic by construction, correct on both grounds, no second token.
- **The aisle had no exit.** `PASILLO_ROUTES.parent` was defined at mount and
  never wired. A buyer arriving on a shared link — the tool's own export channel
  — landed on a dark viewport with no Wings mark and no way up. One stamp now
  carries identity, location and exit; the site header stays dropped, because a
  fixed header would take the muestrario tab's bar and fight the drag loop.

**Decided against the obvious:**

- **Brass is still refused**, now with its usage law written down. The accent
  constitution (registry.md) is exhaustive about where oxblood may and may not
  appear — an accent without one becomes wallpaper in three sprints.
- **`/interiores/azulejos` stays flat.** The PROJECT template wants canonical
  discipline URLs; interposing `/acabados-duros/` today would be a corridor with
  one door, at the cost of breaking a permanent URL. The rule for when a
  discipline earns a URL is ratified instead (≥2 catalogues or ≥2 ACTIVE).
- **All six disciplines stay visible.** They render as non-link `<li>` stamps, so
  there is no dead end to fall into, and a lane showing only tiles disqualifies
  itself from FF&E conversations. Never make an OPENING entry an `<a>`.
- **The space overlay stays unbuilt**, with both build triggers now written into
  the config rather than left as a someday.
- **El umbral does not block navigation.** As specified it delayed the route by
  700ms to play the drain. A procurement tool does not tax a click for an
  animation: the route is issued immediately and the drain plays on the outgoing
  page. If the route wins the race, the moment is simply not seen.

**Tier 1 amended, additively.** `skeleton.css` still shipped `radius 0 / 2px` and
no spring set while claiming byte-stability against §2, which was amended and
ratified 2026-07-22. The macOS scale enters under FRESH names
(`--radius-control/card-lg/panel/dock/pill`) rather than redefining
`--radius-card`, which `apps/tower` binds to a Tailwind key — the same collision
tower had already resolved the same way. The springs collapse under
`prefers-reduced-motion`. No existing value changed, so no rendered surface moved.

**`LaneStamp` now exists as a shared organ** (§2 has always named it). It renders
the ISO 6346 unit number with a **computed** check digit — `WGTU 000002` → `0`,
because 1473 mod 11 = 10 and the standard stamps zero there. Verified against the
standard's own worked example (`CSQU3054383` → 3). No lane types its own digit.

**Verified, not asserted:** swap test structurally identical under the house
navy/gold livery (including the new stamp and check-digit cell); keyboard grammar
→ ← ↑↓ with the passed state now legible; reduced motion clean; LCP on 4G lane
1424ms · aisle 1488ms · lista 1344ms · mesa 1244ms; 66 tests green (was 41);
FillMeter unchanged at `rgb(196,147,63)` wherever no `--cargo` is set.

## WGT/02 Interiores opened; Azulejos is its first catalogue — 2026-07-29

- **Decision:** the tile catalogue built as `apps/escalera` is **not a standalone
  product**. It is the first catalogue of **WGT/02 Interiores**, the second lane
  and the first onboarded through the ecosystem §4 protocol rather than
  inherited. `apps/escalera` was deleted; the code moved to
  `apps/site/src/pasillo/` so the work ships on the existing
  `wings-global-trade` Vercel project — the one serving the production domain,
  whose root directory therefore could not be repointed.
- **Route + name:** `/interiores` (lane) → `/interiores/azulejos` (catalogue).
  The buyer-facing name is **Azulejos**; "El Pasillo" is the interaction and
  stays in the spec and the code. Spanish slug, consistent with every existing
  route and with `lang="es-PE"` — this diverges from the umbrella program doc's
  English `/interiors`, deliberately and on the record, because the site is
  Spanish-facing and lane slugs are permanent.
- **Phase 0 answered** (stored in `packages/liveries/interiores/lane.config.ts`):
  buyer = procurement firms + builders/contractors (explicitly NOT hotel
  developers or design studios — neither signs today); archetype PROJECT; unit
  math m² coverage + per key; taxonomy = the full six-discipline axis registered
  at once with only `acabados-duros` ACTIVE; photography `INTERIM_TYPOGRAPHIC`
  (tile faces exist, no supplier room render is bound to a series); Mister pack
  compiled from the catalogue, existing WhatsApp + CRM handoff.
- **Accent derived, not chosen — brass rejected.** The umbrella doc offered
  "brass — or oxblood". Brass `#9A6B3F` fails BOTH Phase-2 gates: 8.9° from the
  house harvest gold (needs ≥30°) and 4.10:1 on the bone ground (needs 4.5:1).
  Terracotta fails the hue gate at 23.5°. **Oxblood `#6B2A2A`** passes both
  (37.9°, 9.36:1) and is registered. Brass is the intuitive interiors signal and
  is exactly what the hue rule exists to stop — at 8.9° it reads as a warmer
  Wings, not as a lane. Full table in `packages/liveries/registry.md`.
- **`--ink-tertiary` renamed `--ink-decoration` and barred from text.** No alpha
  reads as a third step below secondary and still clears 4.5:1 on bone (0.42
  lands at 2.48:1). A "quiet" token that silently carries body copy is how a lane
  ships unreadable text, so the OPENING state takes the secondary ink (5.18:1)
  and the decoration token is hairlines only.
- **Achromatic exception, registered:** the Azulejos subtree suppresses its own
  lane's accent and takes a colour-neutral ground. When the product IS colour, a
  lane accent vanishes on some tiles and falsifies others, and a warm ground
  shifts perceived hue on a purchase buyers reject over colour variance. Same
  argument and same scoping root §5-bis grants the `(brands)` group.
- **Chrome gated, not removed** — `SiteFrame.tsx` drops SiteNav/Footer/CompareBar/
  MultiInquiryPanel/Mister launcher/Lenis/PageTransition on the aisle only.
  Following the existing precedent in this file ("Legacy chrome gated, not
  removed"): parallel root layouts would mean relocating ~70 routes to suppress a
  header on four.
- **`FillMeter` made themeable rather than forked** — it hardcoded `--color-gold`
  on every fill, so a lane could not theme it, which root §1.1 forbids. Now reads
  `var(--cargo, var(--color-gold))`; existing pages define no `--cargo` and render
  byte-identically.
- **Site-wide safety:** every El Pasillo Tailwind key and CSS token is namespaced
  (`pas-*` / `--pas-*`). The Tier-1 spacing scale diverges from Tailwind's default
  at 5 and above, so spacing utilities were renamed rather than the site's scale
  overridden — the alternative silently re-spaces every existing route.
- **Deferred, on the record:** the lane's space overlay (the PROJECT dual
  taxonomy's second axis) — one catalogue cannot populate a space view; the
  Mister pack is compiled in-process rather than stored in Supabase (no
  knowledge-pack table exists and inventing schema was out of scope); a
  weight-limited FillMeter variant for PROJECT lanes (the shipped organ models
  slots, which is ALLOCATION math).

## Mister Torre adopted — 2026-07-23 (internal AI operator, flagship quote run)

- **Decision:** the `mister-tower-scope` package is adopted as an **experience/
  productivity layer over the EXISTING internal Mister** (the `MisterCockpit` +
  `lib/copilot/` engine), not a new bot. Docs land at
  `spec/contributions/mister-torre/`. This entry is the explicit instruction that
  authorizes building from it (root law otherwise treats `programs/` as queued).
- **Docked onto (never forked):** `tower.ai_drafts` (kind vocabulary extended
  additively in `tower_48`), the SUNAT costing engine (`lib/costing/engine.ts`
  `computeImportCost` — the ONLY place money math happens), the RLS role matrix,
  the hash-chained audit log, and the DB status-transition guards (which already
  enforce the "no autonomous side effects" constitution). New code lives under
  `apps/tower/src/lib/torre/*` + `apps/tower/evals/*`.
- **Flagship shipped this pass:** the quote run — a pure, unit-tested builder
  (`lib/torre/quote-run.ts`) that produces the linked **hoja_costos + cotización**
  artifact pair (with typed confidence `verified|estimado|requiere_verificación`,
  blockers that make an artifact unapprovable, ±flete/±TRM sensitivity, dated
  sources) plus a cover **comunicación** — reproducing the engine **to the cent**.
  Eval suites `evals/quoting.jsonl` (≥90%) + `evals/honesty.jsonl` (100%,
  never invents a rate/tariff) gate it.
- **Where the scope was corrected to repo law:** no parallel "Constellation" visual
  system (merges into the existing Mister expressive layer + the ratified World-B
  navy artifact exemption); DDP dropped (engine models EXW/FOB/CFR/CIF only);
  Peru-first tax model (IGV/percepción/ISC), not Colombia/TRM.
- **Owner-authorized deviation:** the Tower UI/display/mono font is swapped from
  **Inter → Space Grotesk** (self-hosted, OFL; `--font-ui/--font-display/--font-mono`
  repointed with tabular figures on). This touches all host chrome, not just Mister
  — a deliberate, one-token-repoint choice recorded here for reversibility.

## macOS material adoption — ratified 2026-07-22 (ecosystem-wide)

- **Decision:** the frozen-skeleton refusals of rounded radii and soft/gradient
  materials (root `CLAUDE.md` §1.6, §2) are **lifted for the whole ecosystem**
  (Option C of the material ruling). TOWER migrates to the macOS-grade shell in
  `TOWER-REDESIGN.md`; the lanes and `@wings/trade-ui` may adopt the same material
  language. Radius scale is now control 8 / card 12 / panel 16 / dock 20 / pill 999px;
  translucent blur “materials”, elevation, spring motion, and a deep-blue accent are
  permitted. Structural 0 stays available for hard edges.
- **Rationale:** TOWER needs a spatial operating-environment identity; the user
  elected to move the entire ecosystem rather than carve out a TOWER-only exemption.
- **Scope of the migration:** additive only — wrap, don’t rewrite. Zero feature
  regression. Delivered in waves per the merged plan (Path to 100 × macOS Shell).
  Progress + visual notes logged in `REDESIGN-NOTES.md`.
- **What did NOT change:** the spacing grid, the modular type scale, tabular
  numerals, the wholesale directives, token-only discipline, and the remaining
  refusals (no stock photography, no retail vocabulary, no lane without a stamp).


## Monorepo migration — COMPLETE (waves M0–M4, 2026-07)

- The repo is now the ecosystem monorepo: `apps/site` (the live site) + `packages/*`
  (`@wings/trade-ui`, `@wings/mister`, `packages/liveries/wings`). Zero user-visible
  change — verified per wave against the M0 baseline (routes, full Mister SSE flow with
  the price hold-back intact, both lead submissions).
- The ecosystem law (`programs/ecosystem/CLAUDE.ecosystem.md`) is now the root
  `CLAUDE.md`; the distilled site law lives in `apps/site/CLAUDE.md`.
- Full rationale and every judgment call: `programs/ecosystem/MIGRATION_DECISIONS.md`
  (D-01…D-11). Deliberate app-local exceptions: `QuotationForm` (a distinct future
  `QuoteBuilder`, not RFQFlow) and the `MisterDock` shell (kept next to the guardrail
  flow it can't be safely separated from yet).
- Supabase untouched (zero new migrations, zero schema changes). Git history shows the
  app moves as renames.

## Revision 4 — coverage band, platform-consistent type/color, navy-adaptive chrome

- **Tractor crossing retired → CoverageBand** — bold-typography statement of geographic scope: "TODA LATINOAMÉRICA" headline + two oversized country rows (South America solid navy, Central America outlined) counter-scrubbing horizontally. Coverage expanded from 6 to 12 countries (added GT, SV, HN, NI, CR, PA — also in the org schema areaServed and the homepage stats).
- **Homepage typography = site typography** — Archivo/Inter/IBM Plex Mono removed (files deleted); the homepage now inherits Flexo + DM Mono from :root. `.wings-display` = Flexo Heavy (800), -0.02em.
- **Accent unified on brand gold** — `--color-oxide` re-pointed `#BD4F12 → #C4933F`; CTA, active states, container, and focus ring now match the platform's gold. Token name kept to avoid a mass rename; recorded as alias.
- **Bottom bar: navy-adaptive, not ink** (user direction superseding rev-3 ink glass) — brand navy by default; when the sampled background behind it is blue-family (elementFromPoint + computed-background walk, rAF-throttled), it inverts to warm-white with navy icons; pressed/active state is gold. Works on every route with no page markup.
- **Inner Header: navy glass** — the requested "ink-glass carry-over" was reinterpreted after the bar feedback: same glass treatment (blur, hairline, scroll densification 0.80→0.95) in brand navy instead of black; mega-menu/mobile-menu panels follow in deep-navy glass.
- **Conversion journey pass: partial** — /categories copy aligned (12 países, 24h promise, landed-price restated); detail/cotizar pages pending (sub-agents were cut off by session limits).

## Revision 3 — navigation restoration + chrome unification (4-skill BUILD pass, 2 parallel agents)

- **Bottom menu site-wide again, ink glass** — MobileBottomBar now renders on every route including `/` (moved outside the LegacyChrome gate). Background changed from solid navy to rgba-ink @ 94% + 12px blur + top hairline: legible over navy, white, and photography — the navy-on-navy failure can't recur. Gained a 4th item (Cotizar), 1px vertical dividers between items (30px fixed — % heights collapse in auto-height flex), gold active-route bar + aria-current, 48px tap targets.
- **Custom icon set** (`components/icons/`) — 24-grid, 1.5px stroke, currentColor, machinery/trade vocabulary (module-grid catalog, crane-and-container import, signed-document quote). WhatsApp keeps the official glyph + a 6px #25D366 status dot — the only echo of the retired green bubble.
- **WhatsAppButton deleted** — redundant with the bar's WhatsApp item; floating bubble competed with the fixed CTA.
- **Side drawer restored** (`chrome/SideDrawer.tsx`) — homepage header gains a Menú trigger (asymmetric two-line mark); panel slides from the right (420px, ink, 420ms standard ease), carries the five real categories in the CategoryWindows row language, secondary links, and a pinned oxide Cotizar + WhatsApp block. Body scroll lock, Escape/scrim close, focus capture/return; rendered as a sibling of the header so its z-index isn't capped by the header's stacking context.
- **Header logo 36 → 48px, header 64 → 80px** — legibility; the hero FLIP re-measures the target so the handoff adapts automatically.
- **Tractor: full-page crossing** — band 80vh, cutout up to 88vw/880px; enters fully off-screen right, exits fully off-screen left ("disappears" by leaving), scrubbed across the band's entire viewport traversal (`top bottom → bottom top`). Reduced motion parks it centered via a scoped CSS rule.
- **FixedBar desktop-only** — below md the site-wide bottom menu is the single bottom layer; two stacked bars would be hostile. Homepage wrapper padding made responsive accordingly.
- **Footer collapsible** — compact always-visible band (logo, descriptor, phone/email, ©, "Más información" toggle); the long link grid expands via the grid-template-rows 0fr→1fr transition (no max-height hacks). No links removed.

## Revision 2 — de-wireframing merge (visual-audit COMBINED pass)

- **Real logo recollected** — the typed Archivo "WINGS" wordmark is replaced by the actual lockup (`/wings-logo-complete.svg`, single-fill navy) in the hero, header, FixedBar, and container stencil; white variant via `brightness(0) invert(1)`, navy restored over light header theme. The FLIP handoff mechanics are unchanged — only the node carrying the mark changed.
- **Harbor token re-pointed to brand navy `#004389`** — one brand blue across logo, photography (New Holland machines are this blue), and panels; the desaturated `#16344F` created a second, unowned blue.
- **Photography replaces wireframe constructions** — hero uses `splah-hero.png` (golden-hour tractor) under an ink scrim; ContainerReveal sits on `hero-bg.png` (container port) at graphite 78% tint; TransitionBand's line-art tractor is replaced by the real SNH704 side-profile cutout (faces left, its direction of travel; wheel-rotation detail retired with the illustration).
- **Categories are now the site's real catalog** — Agrícola/Camiones/Buses/Industrial/Repuestos with working routes and the production imagery set; the spec's abstract labels (pesca/minería) had no catalog behind them. Preview label links to the category route.
- **Commercial content restored** — FeaturedMachinery (6 live listings, photography-first) and TrustSection (live model/brand counts, 3 verified-buyer quotes, factory-brand grid) re-add the previous homepage's proof layer, recast in the new token/type system.
- **Grid formalized** — `.wings-container` (1400px max, fluid margins) + `.wings-grid` (12 col / 24px gutter) govern all content sections.
- **`bg-white` allowed inside product cards only** — the catalog plates are shot on white; the image area matches the plate. Not a token, recorded as a deliberate exception.
- **Pinned-scroll budget unchanged** — hero 100 + container 200 + logistics 100 = 400vh.

Judgment calls made outside the explicit text of `WINGS_HOME_SPEC.md` (§1
requires every such call recorded here with a one-line rationale).

## Architecture & integration

- **`src/` prefix** — spec's file tree shows `app/`, `components/`, `lib/`, `hooks/` at root; this project uses `src/`, so all paths gained the `src/` prefix.
- **Scoped token system instead of global `:root` font overrides** — the live site's inner pages (catalog, detail, brands, admin) run on the Flexo/navy/gold brandbook with `--font-display/--font-body/--font-data` already defined at `:root`. Color/type/motion tokens went to `:root` (new names, no collisions); the three font tokens are re-declared inside `[data-page="wings-home"]` so inner pages are untouched.
- **`lib/home/` namespace** — `src/lib/categories.ts` already exists for the catalog nav; new homepage data modules live at `src/lib/home/{categories,logistics-steps,animation,fonts}.ts` to avoid clobbering it.
- **Legacy chrome gated, not removed** — root layout wraps Header/Footer/WhatsApp/MobileBottomBar in a client `LegacyChrome` gate that returns null on `/`. Inner pages keep the existing chrome; rewriting the root layout per-route-group would have meant relocating ~70 routes.
- **MobileSplash kept on the homepage** — the user explicitly iterated on the splash twice this sprint; it unmounts after 3.4s and doesn't interfere with the hero pin. Flagged for review: its navy is outside the homepage token set.
- **Homepage metadata refreshed, root metadata untouched** — `/` gets a title/description matching the new positioning ("importación desde zona franca"); site-wide defaults stay as-is for the inner pages.
- **`lang="es-PE"`** — set on `<html>` globally (spec §3); the whole site is Peruvian-Spanish, so no per-page split needed.

## Fonts

- **Archivo Expanded via variable-font `wdth` axis** — next/font/google self-hosts `Archivo` with `axes: ["wdth"]`; `.wings-display` applies `font-stretch: 125%`. Google ships no standalone "Archivo Expanded" static family.
- **Font variable names** — `--font-archivo`, `--font-inter`, `--font-ibm-plex-mono` (matching the pre-existing `font-*-v2` Tailwind mappings) instead of the spec's `--font-archivo-expanded`; `--font-display` indirection in the scope preserves the spec's token API.
- **Fonts loaded only on the homepage** — the three families are initialized in `lib/home/fonts.ts` and their variables applied on the homepage root, so inner pages don't pay the font weight.

## Visual system

- **Tailwind maps tokens via `var()`** — v2 palette entries reference the CSS custom properties (spec §3). Consequence: Tailwind alpha modifiers (`bg-ink/60`) can't be used on these colors; every translucent use (header @92%, scrim @60%, corrugation tints) is a named utility in `globals.css`.
- **Watermark as fixed-attachment section backgrounds, not a `z:-1` element** — every section paints an opaque token background, which would fully occlude a negative-z fixed layer; `background-attachment: fixed` tiling (`.wings-wm-dark/.wings-wm-light`) produces the intended fixed texture above section color and below content. `chrome/Watermark.tsx` therefore doesn't exist; the tile data-URIs live in `globals.css` (also keeps hex out of component files). iOS ignores `background-attachment: fixed` and falls back to scroll-attached tiling — acceptable for a 4–6% texture.
- **Tiled wordmark textures use a system-font SVG data-URI** — web fonts can't render inside `background-image` SVGs; a heavy generic sans outline at 4–12% opacity is indistinguishable at texture scale.
- **Corrugation/stencil approach (§6.4 asked for the call)** — the corrugation is a `repeating-linear-gradient` overlay (4px rhythm of ink shadow + paper highlight) layered *above* the paper wordmark, so ridges visibly interrupt the letterforms without SVG masks or blend modes (cheaper to composite, identical read).
- **Oxide hover darken via `brightness(0.92)`** — avoids introducing a seventh color value for the CTA hover state.
- **Cap heights approximated by measured FLIP** — header wordmark set at 38px font-size (≈28px Archivo cap height) and FixedBar at 22px (≈16px); the hero handoff pixel-matches against the *measured* header rect, so exactness doesn't depend on the cap-height estimate.
- **Focus ring uses oxide** — §4's "three contexts" discipline vs. §9's required oxide focus ring resolved in favor of §9 (accessibility criterion is explicit).

## Behavior

- **Header always `position: fixed`, visually empty until handoff** — reads identically to "locks when TransitionBand enters" (the hero pin ends at the same scroll position) and guarantees a stable FLIP measurement target.
- **Reduced-motion hero/header duplicate** — with no pin, the header wordmark appears via IntersectionObserver once the hero leaves the viewport (an observer, not an animation), avoiding a doubled wordmark while the hero is on screen.
- **Category previews are §8 placeholder gradients** — no photography exists yet, so `Category.image` paths are declared for the future and panels render harbor/graphite gradients; image preloading (§6.3) becomes applicable when real images land.
- **Category stub routes redirect** — `/cotizacion → /cotizar` and `/categorias → /categories`: working flows already exist, so redirects beat dead placeholder pages.
- **Logistics progress maps "active" as cumulative** — indices ≤ current scrub position render oxide (a filled pipeline read), not only the single nearest card.
- **Auto-advance ticks every 500ms against timestamps** — single interval honoring both the 5s idle advance and the 10s interaction suspension without timer juggling; paused while `document.hidden`.
