# DECISIONS.md — WINGS Homepage Build

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
