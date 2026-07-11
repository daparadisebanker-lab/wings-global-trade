# The Áladín Doctrine — rolling the RB practices across the platform

> Written 2026-07-11 after RB/01 shipped end-to-end in one day. The shelf
> proved seven practices; this doc names them and assigns where each lands
> next. Status: PROPOSED sequencing — Muaaz orders the waves.

## The seven practices the shelf proved

1. **One data contract per entity.** Everything a surface renders — hero
   frames, vocabulary, manifesto, packing geometry, pallet spec, icons —
   lives in one typed contract; pages are renderers. Entity N+1 is data
   entry, not a build.
2. **Logistics truth is drawn, not described.** Parametric technical SVGs
   generated at runtime from real codification data, true proportions,
   blueprint conventions. Prime Directive 5, made visual.
3. **Purchase instruments are honest calculators.** Server-side math, the
   full unit cascade always exhibited, remainders shown, availability never
   promised in prose.
4. **Public views are the only site↔data contract.** Atomic writes (row
   locks), insert-first leads, self-healing holds, RLS everywhere,
   service-role-only grants.
5. **Motion is an attribute grammar.** One choreographer + one SVG drafting
   animator (`data-anim` / `data-td-*`); entry moments; reduced-motion =
   finished state, full parity.
6. **AI is compiled from the same data the pages read.** Mister packs are
   built from the public views — the advisor and the site can never
   disagree. Zero hand-written packs.
7. **Every wave ships verified.** Build green → browser-drive the real flow
   → prod spot-check → mobile measured at 390px. No claims, only captures.

## Where each practice lands (by payoff × effort)

### Wave A — quick wins, existing engines ✅ SHIPPED 2026-07-11 (6b979a8)
- **Contenedor compartido got the instruments**: `ContainerSliceDiagram`
  (the RB cupo container generalized into `features/shared/`, token-only
  theming via `--csd-*` with Wings livery fallbacks) on `/contenedor/[id]`
  workspaces and `/g/[token]` invites; RB configurator refactored onto the
  same organ — extended, not forked. §8.4 disambiguation copy untouched.
- **TechDraw moved to `features/shared/`.** The `/proceso` GRANO figures
  were already animated by their own session (framer-motion, reduced-motion
  aware) — wrapping them would double-animate; resolved as N/A.
- Deferred within A: `PackingCascade` for member cargo CBM (shared-container
  cargo is heterogeneous CBM, not a packing profile — an honest cascade
  needs member volume data, revisit with shared-container Phase 2).

### Wave B — catalog technical fiches (the EQUIPMENT translation)
- Product pages get the RB fiche treatment: spec icons, mono-md values, and
  a **CubicajeDiagram** — the unit drawn to true proportion inside its
  container/crate, with «cuántas unidades por 40HC» computed from dims.
  Data check (2026-07-11): 26+ products already carry Longitud/Ancho/Altura,
  30 carry Peso operativo — start with the flagship dozen, enrich the rest
  via TOWER. This is the EQUIPMENT archetype's version of packing literacy:
  the buyer's real question is always "how does it ship".
- Promote `lib/rb/iso.ts`, `TechDraw`, `SpecIcons` to `@wings/trade-ui`
  the moment the catalog consumes them (second-consumer rule, D-10/D-11).

### Wave C — Mister compiled, not written
- `WINGS_CATALOG_TEXT` in the system prompt is a static string — replace
  with a compiled catalog pack from the products DB (same pattern as
  `misterPack.ts`, same 60s cache, same failure-degrades-to-nothing rule).
  Guardrails and hold-back untouched, as always.

### Wave D — the structural moves
- **Lane split rehearsal is over**: `(brands)` is a working prototype of
  `(lanes)` — route group, token contract, registry, swap test all proven.
  When Muaaz calls the WGT/01–06 split, it reuses this architecture
  literally.
- **TOWER designation worksheet** renders the same `PackingDiagram` /
  `CupoContainerDiagram` from the same views — ops sees exactly what buyers
  see (RB SPEC §3.2 already demands this).
- **Wholesale-language lint becomes a script** (repo grep in CI, both
  locales) instead of a manual check; the deploy-watch verification loop
  becomes the standard for every push.

## Rules that keep the rollout cheap
- Nothing is drawn from invented numbers — a diagram without codification
  data behind it doesn't ship (asset-integrity law extends to geometry).
- Every new surface enters through a typed contract; if a page needs a
  hardcoded value, the contract grows instead.
- Engines are extended, never forked: one iso engine, one animator, one
  packing math, one pack compiler pattern.
