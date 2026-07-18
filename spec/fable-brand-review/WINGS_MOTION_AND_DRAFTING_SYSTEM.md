# Wings Motion & Drafting System — umbrella promotion spec

**Status: PROPOSED (2026-07-11).** Critical review of the motion and SVG
technical-drawing systems built for RB/01 Áladín, promoting what is family-grade
into ecosystem law. This file documents and proposes only — no component has been
refactored, no law edited. Root `CLAUDE.md` amendments sit at the end, awaiting
founder ratification. Until ratified, `EXPERIENCE-KIT.md` §9 remains the operative
signature law for RB shelves.

**Headline verdict:** the system is further along than "promotion candidate"
suggests. `TechDraw`, the `iso` library, and `ContainerSliceDiagram` already serve
house surfaces (`contenedor/[id]`, `g/[token]`, `CubicajeTool`) — the umbrella is
consuming them today, un-ledgered. What blocks formal promotion is small and
specific: two coupled scope-reads, one token contract that assumes a white ground,
one keyboard gap, and three duplicated copies of the ease constants.

---

## 1 · Review verdict per primitive

| Primitive | Verdict | Evidence (real code) | To generalize |
|---|---|---|---|
| `--ease-gantry` / `--ease-settle` | **Tier-1 FROZEN** (already law, `packages/ui/tokens/skeleton.css:50-51`) | Duplicated as string constants ×3: `TechDraw.tsx:23-24`, `BrandChoreography.tsx:26-27`, `BrandReveal.tsx:23-24` | Extract one `eases.ts`. GSAP cannot read a CSS custom property as an ease curve — that is *why* a TS mirror exists; `skeleton.css` stays the source of truth, the mirror is byte-bound to it. |
| Parity law — "hidden states are armed by JS only; reduced-motion never waits" | **Tier-1 FROZEN** | `BrandChoreography.tsx:75` (reduce → no init at all), `TechDraw.tsx:42-45` (reduce → finished drawing, exploded), `BrandReveal.tsx:36-39` (reduce → overlay never mounts). No-JS documents are complete because initial states come from `gsap.set`/`fromTo`, never CSS | None — codify as written law + QA test (§5). |
| Split-restore law | **Tier-1 FROZEN** | `ORIGINAL_KEY` record/restore, `BrandChoreography.tsx:35-67` — innerHTML splits restored before the next route's children reconcile (the `/marcas` NotFoundError incident, fixed 2026-07-11) | None; travels with the component. Any future text-splitting device must obey it. |
| Scroll grammar `data-split` / `data-split-words` / `data-reveal` | **Tier-1 FROZEN** grammar | Parameters at `BrandChoreography.tsx:82-121`: masked lines `yPercent 110→0`, 1s, stagger .08, settle · fade-up `y 30→0`, .9s, settle · word scrub opacity .22→1, linear, scroll-bound. Zero `--rb-*` reads inside — verified brand-clean | Rename `BrandChoreography` → `Choreography`, move to the package. No code change beyond name/home. |
| `BrandCurtain` (route flood) | **Tier-1 FROZEN** behavior · **Tier-2 LIVERY** color/mark | Resolves at transition time from the *arriving* scope: `document.querySelector('[data-brand]')` → `--rb-accent` + `dataset.brandIsotipo` (`BrandChoreography.tsx:169-183`); falls back `--livery-navy`, mark-less. `yPercent 0→-101`, 0.8s gantry | Generalize the two coupled reads: scope query becomes `[data-lane], [data-brand]`; color/mark become a canonical `--flood-accent` + `data-flood-mark` defined per scope (§3). Consume `--lane-switch-duration` (700ms token) instead of the hardcoded 0.8s — legal within the 600–800ms law today, but unbound to the token that owns it. Invariant to document: at most one identity scope per page (the query takes the first match). |
| `TechDraw` + `data-td-*` grammar | **Tier-1 FROZEN** | Already brand-agnostic and already multi-surface: `CubicajeTool.tsx:156`, `contenedor/[id]/page.tsx:88`, `g/[token]/page.tsx:84` — house surfaces, not brand ones. Sequence fade→draw→pop→slab→late; `once: true` (no persistent triggers) | Move verbatim. Nothing to refactor — this is the cleanest asset in the set. |
| `lib/rb/iso.ts` | **Tier-1 FROZEN** | Pure projection math (`ISO_COS .866 / ISO_SIN .5`), zero RB references despite the `rb/` path | Move verbatim to `drafting/`. |
| `ContainerSliceDiagram` | **Tier-2 LIVERY**, near-clean | Token-only via `--csd-*` with `--livery-*` fallbacks (lines 33-37); real ISO dims table (lines 23-28); cabinet projection 0.42/0.24 | (a) Rename the contract `--draft-*`, family-wide (§3). (b) **Add `--draft-paper`**: three hardcoded `#ffffff` — open-slot fill (:82), hatch base (:158), committed numeral (:135) — break on dark grounds; blocks dark EQUIPMENT/CREDENTIAL liveries. (c) **Keyboard gap**: clickable slices are `role="button"` with `onClick` only (:98-104) — no `tabIndex`, no keydown. Fails QA gate 5. Fix blocks promotion. |
| `PackingDiagram` | **Tier-2 LIVERY** after refactor | The true-proportions engine (mm-driven vertices) — but it reimplements the iso projection inline (:25-46) instead of importing `iso.ts`, reads `--rb-*` directly (:163-191) so it cannot render outside a brand canvas, and applies a `.rb-dim` class (:122) that is defined nowhere — vestigial | Port to the `iso` lib; swap to `--draft-*`; drop or define `.rb-dim`. |
| `ExplodedDiagram` / `PalletDiagram` | **Tier-2 LIVERY** after token swap | Consume `iso.ts` correctly; honor the TechDraw contract (`data-td-slab` + `data-td-dx/dy`, `ExplodedDiagram.tsx:89`); `--rb-*` direct | `--draft-*` swap only. `PalletDiagram`'s `skip` honesty (5 boxes rendered as 3×2−1 with a dashed empty cell) and the «esquema» labeling are the partial-data honesty precedent — promote as law (§5). |
| `BrandReveal` (genie preloader) | Grammar **Tier-1** · composition **SCOPE-LOCAL** | Portal-on-body + hidden in-tree token probe (:40-48) is *the* canonical pattern for an overlay that must escape its token scope without hardcoding a hex. Count-up → clip-rise mark → double curtain lift (white then accent, gantry) | Promote the pattern as documentation + the count-up hook. The composition (the genie isotipo rising) is Áladín's and stays. A house or lane threshold reveal is a new *variant* of the same signature — built fresh, not copied. |
| `BrandShelfNav` | Devices **Tier-1** · component **SCOPE-LOCAL** | The pulse line is the SiteNav gold-rule device re-themed (its own comment, :24-25) — ref-driven `scaleX`, no re-render per scrolled pixel | Component stays app-local: routes and sticky offsets (`top-16 / md:top-18`) are coupled to the site header. The pulse-line device needs no promotion — it originated in house chrome. |
| `BrandMarquee` | **Tier-2 LIVERY** with a contrast hole | Structure generic (`xPercent -50` loop, 28s linear, static under reduce). But `text-white` is hardcoded on `--rb-accent` (:39): white on `#5E8A16` ≈ 4.1:1 — large-type only at 13px; a lighter brand accent fails outright | Before brand #2 ships it: add an on-accent ink to the token contract (`--rb-accent-contrast`) or gate accent luminance in kit validation. The registry validates accent-on-white; nothing validates white-on-accent today. |
| `BrandHero` | **SCOPE-LOCAL** | Framer crossfade; the §8.7 attested-imagery filter (:24-26) is structural, not advisory. Drift: `SLIDE_MS = 4500` vs its own "~6 s" comment vs SPEC §2.7①'s "6s/slide" — pick one and align | Pattern documented; component stays. Its `easeOut` crossfade sits in the ambient register (§2). |
| `PackingCascade` / `useCountUp` | Hook **Tier-1** · component **SCOPE-LOCAL** | rAF count-up, 400ms cubic ease-out, self-described "--ease-settle approximation" (:29). `BrandReveal` carries a *second* count-up (gsap, `power2.out`, 1.6s) — two implementations of one device | Extract `useCountUp`; both consumers converge on it. Component stays (its math shape is `RbContainerTemplate`). |
| `rb-canvas.css` — white ground + `--rb-*` contract | **SCOPE-LOCAL by law** | §5-bis: the pure-white ground is a deliberate, route-group-scoped Tier-2 exception | None. Never promote the white ground. The alpha-variant precedent (`--rb-accent-soft` as rgba because Tailwind slash-opacity cannot modify `var()` colors) *is* worth carrying into the `--draft-*` contract. |
| `FillMeter` (existing organ) | **Tier-1 FROZEN** (already in `@wings/trade-ui`) | Sequential fill ~400ms, ease `[0,0,0.2,1]`; the OG-image render reimplements its look — "this component is the DOM source of that truth" | None. Named here because it is the Draft signature's oldest house instance (§2) and the OG-source-of-truth pattern extends to every drafting component. |

---

## 2 · The signature law — three signatures, umbrella-wide

The house and RB never had different motion ideas — they had different *names* for
the same three moves. Reconciliation:

| Existing named moment | Where | Canonical signature |
|---|---|---|
| Lane-switch transition (livery flood + stamp-settle, 600–800ms) | Root law §2 (specified, unbuilt — site not yet split into lanes) | **FLOOD** — its canonical instance; the LaneStamp rides the flood |
| Curtain flood | `BrandCurtain`, built | **FLOOD** |
| Door-opening reveal | EXPERIENCE-KIT §9.1 (READY, unbuilt) | **FLOOD** — the plane is the container door-end instead of a color field |
| Genie preloader | `BrandReveal`, built | **FLOOD** — threshold variant; its finale is literally two curtain lifts |
| Stamp-settle · "loading = customs" | House | **SETTLE** |
| Arrival settle ("set down by a crane") | EXPERIENCE-KIT §9.2 | **SETTLE** |
| Scroll reveals (`data-split` / `data-reveal` / word scrub) | `Choreography`, built | **SETTLE** vocabulary |
| Self-drafting drawings (fade→draw→pop→slab→late) | `TechDraw`, built | **DRAFT** |
| FillMeter sequential fill | `@wings/trade-ui`, shipped | **DRAFT** |
| Honesty-cascade count-up | `PackingCascade`, built | **DRAFT** |

The canonical set — exactly three, family-wide:

1. **THE FLOOD** — identity handover at a threshold. A plane in the *arriving*
   identity's accent floods the viewport carrying that identity's mark
   (LaneStamp, isotipo, house seal), then lifts on `--ease-gantry` within
   `--lane-switch-duration` (600–800ms), interruptible. Color and mark resolve
   at transition time from the arriving scope — never a static lookup (the
   navy-fallback bug, caught 2026-07-11, is why this clause exists).
2. **THE SETTLE** — cargo set down. Content arrives with a short translate,
   clip, or mask resolved by `--ease-settle`. Never bouncy, never springy: the
   metaphor is a crane, not a toy.
3. **THE DRAFT** — the instrument shows its work. Numbers count, strokes
   line-draw, slots fill, slabs fly to their exploded stations — always a
   visible derivation from real data, never decoration on top of it.

**The rule (testable):** every motion moment on every surface names its
signature — or the ambient register below — at review. If it cannot, it does not
ship. New motion is a variant of one of the three, never a fourth idea. This
supersedes EXPERIENCE-KIT §9's RB-scoped "only three."

**The ambient register (not a signature):** linear transform loops and plain
opacity crossfades — `BrandMarquee` (28s linear), `BrandHero` and
`PageTransition` crossfades, the `surface.ts` card slide. Bounded: no easing
personality, transform/opacity only, static or instant under reduced motion.

**The ease-register law (state it honestly or it will be "fixed"):** the claim
"two eases, nothing else" is true of *positional and structural* motion only.
The built inventory also contains: scrub-bound and loop motion at `linear`
(correct — scrubs track the scroll, loops have no arrival); numeric count-ups
and opacity crossfades in an ease-out register that approximates settle
(`PackingCascade` cubic-out, `BrandReveal` counter `power2.out`, `FillMeter`
`[0,0,0.2,1]`); and `@wings/trade-ui` `motion/surface.ts` at `[0.2,0,0,1]` — a
**ledgered byte-stability exemption** whose own header forbids harmonizing.
Law: gantry/settle for anything that moves position or structure; linear for
scrub and loops; the ease-out register for counters and crossfades; `surface.ts`
untouched. Do not "harmonize" the exemptions — that silently changes shipped
behavior for zero visible gain.

---

## 3 · Packaging plan

**Recommendation: extend `@wings/trade-ui`. Do not create `@wings/motion`.**
Ecosystem law already decides this: an organ promotes into `@wings/trade-ui`
when a second consumer exists (MIGRATION_DECISIONS D-10/D-11, restated in RB
SPEC §2.6) — and second consumers exist *now* (`CubicajeTool`,
`contenedor/[id]`, `g/[token]`). The package already houses motion
(`src/motion/surface.ts`) and `useReducedMotion`. A separate package would put
`TechDraw` and the organs it wraps (`ContainerSliceDiagram`, SpecSheet
blueprint mode) on opposite sides of a version seam for no benefit.

New layout inside `packages/ui/src`:

```
motion/
  eases.ts            EASE_GANTRY · EASE_SETTLE — the GSAP-facing mirror of
                      tokens/skeleton.css §Motion; byte-bound, single source
  Choreography.tsx    from BrandChoreography (grammar + split-restore law)
  Flood.tsx           from BrandCurtain, generalized (scope + token, below)
  TechDraw.tsx        verbatim
  useCountUp.ts       from PackingCascade
drafting/
  iso.ts              verbatim from apps/site src/lib/rb/iso.ts
  ContainerSliceDiagram.tsx    --draft-* + paper token + keyboard fix
  PackingDiagram.tsx           iso-lib port + --draft-*
  ExplodedDiagram.tsx          --draft-* swap
  PalletDiagram.tsx            --draft-* swap
```

- **Dependencies:** `gsap` + `@gsap/react` enter as **peerDependencies** with
  subpath exports (`@wings/trade-ui/motion`, `@wings/trade-ui/drafting`) so
  framer-only consumers never pull GSAP.
- **Consumption contract (the package's one rule):** tokens + data-attributes +
  primitive/plain-data props only — the `FillMeter` precedent ("props are
  primitives so the package imports nothing from `apps/*`"). `pnpm swap-test`
  enforces it mechanically.
- **`apps/site` keeps re-export seams** (`@/components/features/shared/TechDraw`
  re-exports the package), per the `@wings/mister` `@/types` / `@/hooks`
  precedent — call sites don't churn.
- **Stays app-local:** `BrandReveal`, `BrandShelfNav`, `BrandHero`,
  `PackingCascade` (SCOPE-LOCAL verdicts, §1).

**The `--draft-*` token contract** (generalizing `--csd-*`, which is named for
one component and missing a ground):

```
--draft-ink          edges                    fallback var(--livery-navy)
--draft-accent       fills / hatch            fallback var(--livery-gold)
--draft-accent-ink   labels, selection        fallback var(--livery-gold-active)
--draft-soft         selection fill           fallback var(--livery-gold-subtle)
--draft-tint         top-face tint            fallback var(--livery-warm-white)
--draft-paper        open fill / hatch base   fallback #ffffff  ← NEW
```

Each identity scope maps the contract **once**: `rb-canvas.css` maps
`--draft-* ← --rb-*` under `[data-brand]` (retiring the per-callsite inline
mapping at `ContainerConfigurator.tsx:327-331`); each lane's `livery.css` maps
it under `[data-lane]`. Alpha variants ship as rgba per the `--rb-accent-soft`
precedent (Tailwind slash-opacity cannot modify `var()` colors).

**The Flood contract:** the generalized `Flood` queries
`[data-lane], [data-brand]` (first match; invariant: at most one identity scope
per page) and reads `--flood-accent` (fallback `--livery-navy`) +
`data-flood-mark` from that scope. `rb-canvas.css` sets
`--flood-accent: var(--rb-accent)`; brand layouts rename `data-brand-isotipo` →
`data-flood-mark`; lane liveries set their accent. The frozen skeleton is not
touched — `skeleton.css` already owns the eases and `--lane-switch-duration`.

---

## 4 · Reuse map — one engine, extended not forked

| Surface | Consumes | How |
|---|---|---|
| House Manifest | `Choreography`, `Flood` | Reveal grammar on manifesto blocks; the lane-switch transition (§2 skeleton, unbuilt) is the generalized `Flood` with LaneStamp as `data-flood-mark` — its reference implementation already ships in `/marcas` |
| EQUIPMENT (WGT/01) | `TechDraw` + `PackingDiagram` engine, `ContainerSliceDiagram` | SpecSheet blueprint mode wraps its figures in `TechDraw` (blueprint-grid + `data-td-draw` dims); crate diagrams extend `PackingSpec.detail` with a `'crate'` variant — same engine, new detail vocab |
| PROJECT (WGT/02) | `ExplodedDiagram` grammar | Per-key FF&E kits as assembly drawings — layers fly on `data-td-slab` |
| COMMODITY (WGT/03) | `PalletDiagram`, `useCountUp` | Pallet/MT builds with the `skip` honesty rule; ManifestTable totals count up in the Draft register |
| PROGRAM (WGT/04) | `PackingDiagram`, `useCountUp` | Carton assortment diagrams; program totals |
| CREDENTIAL (WGT/05) | Settle only | Formal register — stamp-settle on credential seals; no Draft instruments needed |
| ORIGIN (WGT/06) | `TechDraw` + route arc (kit §5) | The great-circle route line-draws via `data-td-draw` |
| Shared-container (live) | Already consuming | `contenedor/[id]` + `g/[token]` ship `TechDraw` + `ContainerSliceDiagram` today — the proof the promotion works |
| Cubicaje tool (live) | Already consuming | `TechDraw` |
| Mister surfaces | Drafting components server-rendered | `ContainerOfferCard` embeds the packing diagram (EXPERIENCE-KIT §4); surfaces keep the `surface.ts` register, not the signatures |
| OG images | Drafting components as DOM source of truth | The `FillMeter` precedent: Satori re-renders reimplement the look; the component is the truth |
| Endorsed brands (Áladín standalone) | Everything, via their own tokens | §5 lets endorsed brands redefine display typeface, radii feel, texture — **motion is not on that list**. The two eases, the three signatures, and the parity laws bind endorsed brands too (proposed as an explicit line, §7). |
| FillMeter ↔ ContainerSliceDiagram | One engine | FillMeter stays the compact meter; CSD is the instrument/elevation view. Any future "detailed FillMeter" request routes to CSD — the meter never grows its own drawing. |

---

## 5 · Governance — gates every promoted asset must pass

1. **Swap test, motion edition.** Render lane A's pages with lane B's livery and
   brand A's shelf with brand B's tokens: every flood, diagram, and reveal must
   re-theme with zero component-level overrides, and the `Flood` must resolve
   the *arriving* scope's accent + mark. Run against ≥2 scopes per the root §6
   shared-organ rule.
2. **Parity law (testable, both halves).** JS disabled → every page is a
   complete document (no element pre-hidden by CSS awaiting motion).
   `prefers-reduced-motion` → content visible instantly; `TechDraw` shows the
   finished drawing with slabs at exploded positions; overlays (`BrandReveal`)
   never mount. Hidden initial states are armed by JS only — this is the law
   that makes both halves true at once.
3. **Equity-Transfer Test** (proposed with this spec; ratification pending).
   The swap test guards structure; nothing yet guards equity. Three checks for
   any promoted asset or new surface: (a) does it visibly route trust back to
   the house — seal, Manifest lockup, or Mister — rather than merely sharing a
   grid? (b) with the Wings name removed, would the buyer still know whose
   house they are in? (c) does the partner tier show exactly as much Wings as
   its relationship warrants — full for lanes, borrowed for represented,
   seal-only for endorsed? The drafting voice itself is a house asset: like the
   stencil treatment (EXPERIENCE-KIT §6), it is the *container's* voice, shared
   by every tenant — a unifying thread no single brand owns.
4. **True-proportions rule.** Every technical figure is generated at runtime
   from real dimensions — ISO container tables, packing profiles in mm, slot
   counts. Never an illustration. When data is partial, draw the honesty in:
   `PalletDiagram`'s dashed `skip` cells and «esquema» labeling are the
   precedent.
5. **Performance.** SVG over WebGL — the vector system covers hero, OG, and
   diagram needs while holding LCP < 2s; `TechDraw` triggers are `once: true`;
   ambient motion is transform/opacity only. **Sound and WebGL stay deferred**
   (EXPERIENCE-KIT §10), now umbrella-wide: revisit sound only after brand #3,
   WebGL only for a flagship campaign as a lazy island.
6. **Keyboard parity.** Promotion of `ContainerSliceDiagram` blocks on making
   its clickable slices keyboard-operable (§1). Interactive SVG elements carry
   `tabIndex` + key handlers or they are not interactive.

---

## 6 · Promotion checklist (ordered; each step gates the next)

1. Create `packages/ui/src/motion/` + `packages/ui/src/drafting/`; add
   `gsap` / `@gsap/react` as peerDependencies with subpath exports.
2. Extract `motion/eases.ts`; delete the three duplicated constant pairs.
3. Move `TechDraw.tsx` and `iso.ts` verbatim.
4. Generalize `ContainerSliceDiagram`: `--csd-*` → `--draft-*`, add
   `--draft-paper`, fix keyboard operability.
5. Port `PackingDiagram` to the `iso` lib; swap `PackingDiagram` /
   `ExplodedDiagram` / `PalletDiagram` to `--draft-*`; drop `.rb-dim`.
6. Move `BrandChoreography` → `motion/Choreography.tsx` (rename only).
7. Generalize `BrandCurtain` → `motion/Flood.tsx`: scope query
   `[data-lane], [data-brand]`; `--flood-accent` + `data-flood-mark`; consume
   `--lane-switch-duration`. Map both in `rb-canvas.css` / brand layout.
8. Extract `motion/useCountUp.ts`; converge `PackingCascade` and
   `BrandReveal`'s counter on it.
9. Re-point `apps/site` through re-export seams; `BrandReveal`, `BrandShelfNav`,
   `BrandHero`, `PackingCascade` stay app-local.
10. Run the gates: `pnpm swap-test`, swap test ×2 scopes, both parity halves,
    keyboard pass, `pnpm build` green.
11. Ledger the promotion as a decision entry (D-12 candidate) in
    `programs/ecosystem/MIGRATION_DECISIONS.md`; log the marquee on-accent
    contrast gap and the BrandHero 4500ms/6s drift as follow-ups.
12. Founder ratifies §7; only then edit `CLAUDE.md` and `EXPERIENCE-KIT.md`.

---

## 7 · Proposed law amendments (for founder ratification)

**Root `CLAUDE.md` §2 — The Frozen Skeleton.** Extend the motion line and add
two lines; fold the lane-switch bullet into the signature law so the fact lives
in one place:

```diff
- - Motion: `--ease-gantry: cubic-bezier(0.83,0,0.17,1)` (structural moves) · `--ease-settle: cubic-bezier(0.22,1,0.36,1)` (reveals) · reduced-motion always collapses to crossfade
+ - Motion: `--ease-gantry: cubic-bezier(0.83,0,0.17,1)` (structural moves) · `--ease-settle: cubic-bezier(0.22,1,0.36,1)` (reveals) · scrub-bound and ambient loops are linear · reduced-motion always collapses to crossfade, and hidden initial states are set by JS only (no-JS = complete document)
+ - Motion signatures: exactly three, family-wide — the Flood (identity handover: lane-switch livery flood + stamp-settle, brand curtain, threshold reveal; 600–800ms, interruptible), the Settle (arrival of content), the Draft (instruments drawing themselves from real data). New motion is a variant of one of these, never a fourth idea. Registers, exemptions, and grammar: `spec/WINGS_MOTION_AND_DRAFTING_SYSTEM.md`.
+ - Drafting grammar: `TechDraw` + `data-td-*` and the `--draft-*` token contract (`@wings/trade-ui`); every technical figure is generated from real dimensions — never an illustration.
  - Shared organs: `ManifestTable` · `LaneStamp` · `FillMeter` (container visualizer) · `RFQFlow` · `SpecSheet` (scoped blueprint mode) · `MisterDock` · `TrustFooter`
- - The lane-switch transition (livery flood + stamp-settle, 600–800ms, interruptible)
```

**Root `CLAUDE.md` §5 — Endorsed Brands, rule 1.** One clarifying line to
prevent a future "fix" (motion is absent from the redefinable list; make that
deliberate):

```diff
  1. The skeleton ships as `@wings/trade-ui` — brand-agnostic. Endorsed brands consume the same components with **their own token system**, and (unlike lanes) they MAY redefine Tier-1 expressive choices: display typeface, radii feel, texture library. They may NOT change component structure, RFQ logic, or the wholesale directives.
+    Motion is not on the redefinable list: the two eases, the three signatures, and the reduced-motion parity law bind endorsed brands too.
```

**`programs/represented-brands/EXPERIENCE-KIT.md` §9.** The RB signatures stop
defining the set and become variants of it:

```diff
- ## 9 · Motion Signatures — **READY** (binds to the Odd Ritual grammar port, §2.6)
-
- Three named, reusable moments — the only three; restraint is the brand:
+ ## 9 · Motion Signatures — **PROMOTED** to ecosystem law
+
+ The signature set is defined family-wide in `spec/WINGS_MOTION_AND_DRAFTING_SYSTEM.md`
+ (Flood · Settle · Draft — the only three). The RB moments below are that law's
+ variants, not a separate set:
- 1. **Door-opening reveal** — entering `/marcas/{brand}/contenedor`: the
+ 1. **Door-opening reveal** (Flood variant) — entering `/marcas/{brand}/contenedor`: the
     door-end SVG's leaves swing (perspective transform, `--ease-gantry`,
     ~700ms) revealing the configurator. Reduced-motion: crossfade.
- 2. **Arrival settle** — brand tiles / container cards enter with a short
+ 2. **Arrival settle** (Settle variant) — brand tiles / container cards enter with a short
     translate + `--ease-settle`, like a container set down by a crane; the
     ground-shadow ellipse compresses 2px. Subtle, physical, never bouncy.
- 3. **Curtain flood** — already spec'd (§2.6): route transitions inside the
+ 3. **Curtain flood** (Flood variant) — already spec'd (§2.6): route transitions inside the
     brand world flood in `--rb-accent`.
```

Ratification decisions the founder actually has to make, in priority order:

1. **The signature names and count.** Flood / Settle / Draft as the canonical
   three — including folding the lane-switch transition into the Flood as its
   canonical instance. Once named in §2 this is frozen skeleton; renaming later
   is a framework amendment.
2. **Package boundary.** Extend `@wings/trade-ui` (recommended, per D-10/D-11)
   vs. a new `@wings/motion`. The recommendation costs nothing to reverse
   before step 1 of the checklist; after it, the seam is set.
3. **The ease-register codification.** Ratifying §2's honest register (linear
   scrubs, ease-out counters/crossfades, the `surface.ts` exemption) means the
   built code is already law-compliant. Rejecting it means a refactor pass
   across `FillMeter`, `PackingCascade`, `BrandReveal`, and `BrandHero` to
   force literal gantry/settle — visible behavior change on shipped surfaces,
   not recommended.
