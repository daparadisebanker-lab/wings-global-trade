# Peru Costing — Phase-0 Technical Gates G1 & G2

> Decision memo. Written 2026-07-20. Grounded in the ported engine, the parity
> oracle, and TOWER money law. Not active law until Muaaz signs off.

---

## G1 · `decimal.js` as the costing numeric core

**Gate.** Does the SUNAT engine keep `decimal.js` as its numeric core and convert
to integer minor units only at the persistence boundary, or is the whole chain
reimplemented in integer minor units + bps?

**Options.**
- **(A) Keep `decimal.js`** in `lib/costing/engine.ts`; inputs/outputs cross the
  persistence boundary as integer minor units + bps (SPEC §2.1).
- **(B) Reimplement** the ~27 rounding points in integer minor units, validated to
  the same `fixtures.json`.

**Evidence.**
- Directive 3's actual target is *stored* money: "Any float touching money is a
  bug" (`programs/tower/CLAUDE.md:11`). `money.ts:6` scopes it precisely — "never
  let a float touch a **stored** amount." The engine is transient compute, not
  storage; SPEC §4 already lands every persisted figure as `bigint … _minor`.
- `decimal.js` is **arbitrary-precision decimal, not IEEE float**
  (`engine.ts:20`, `precision: 28, ROUND_HALF_UP`). It is not the thing Directive
  3 forbids — it is the correct tool for exact base-10 rounding.
- The load-bearing round-trip is real: `dutiableBaseSoles = r2((cif+adVal+isc)×TC)`
  **rounded in soles**, then `igvImportacion = r2(dutiableBaseSoles×igv÷TC)`
  **rounded again in USD** (`engine.ts:100-101`; `EXCEL_PARITY.md:79-80`). Two
  distinct 2-dp roundings across a ÷TC hop.
- Two concrete integer-path hazards, each a divergence against a 185-row oracle at
  `|Δ| ≤ 0.005`:
  1. **Half-up on negatives.** The engine rounds `ROUND_HALF_UP` everywhere
     (`engine.ts:26`). `margenNetoCaja` is normally **negative**
     (`engine.ts:150`; `EXCEL_PARITY.md:112`). TOWER's integer helper uses
     `Math.round` (`money.ts:38,44`), which rounds half **toward +∞**:
     `Math.round(-2.5) = -2` vs decimal.js `-3`. Every negative rounding point
     needs a custom half-away-from-zero primitive.
  2. **Rate granularity.** `marginRate` is rounded to **6 dp** (`r6`,
     `engine.ts:29,127`). Integer **bps resolves only to 1e-4** (`money.ts:3`) —
     it structurally cannot hold a 6-dp rate. A finer fixed-point scale would have
     to be introduced just for this field.
- The ~27 rounding points (`EXCEL_PARITY.md:70-103`) and the deliberately-unrounded
  values (`marginRate`, `margenNetoCajaPct`) each map 1:1 to an `r2`/`r6` call.
  Option B re-litigates all 27 by hand for byte-parity.

**Trade-offs.** (A) adds one dependency to TOWER and one conversion seam
(engine ⇄ minor-unit action layer) that must be tested. (B) adds no dependency but
multiplies the surface for silent drift by ~27, delivers identical output, and buys
nothing Directive 3 actually asks for.

**Recommendation — (A). Keep `decimal.js` as the sanctioned engine core; convert to
integer minor units + bps at the persistence boundary; `fixtures.json` gates every
change.** This is what the already-ported `engine.ts` does. Concrete risk of (B):
byte-parity failure on negative `margenNetoCaja` (`Math.round` vs `ROUND_HALF_UP`)
and loss of 6-dp `marginRate` precision under bps — a from-scratch rebuild of proven
math, at real regression risk, for zero benefit to stored-money integrity.

**Muaaz must confirm:** that `decimal.js` may live in the TOWER dependency tree as a
compute-only core, given that no float ever reaches a persisted amount (all storage
is integer minor units per SPEC §4).

---

## G2 · Costing = Container-Desk module vs. a 7th archetype

**Gate.** Is Peru costing a new purchase-logic archetype, or a cross-cutting
financial capability keyed to shipments regardless of archetype?

**Options.**
- **(A) 7th archetype** — add `COSTING` to `ARCHETYPE_CODES`.
- **(B) Cross-cutting module** on the Container Desk, keyed to containers/orders,
  config-driven.

**Evidence.**
- An archetype is defined by a **buyer + purchase logic**: the decision tree opens
  "Is the buyer distinct AND the purchase logic distinct?" (root `CLAUDE.md` §3).
  Costing has **no buyer** — it is a computation run *after* a buyer has bought,
  over a shipment every existing archetype already produces.
- An `ArchetypeConfig` must supply `buyerBuys`, `iaPattern`, `stages` (pipeline),
  `unitMath` (RFQ negotiating unit), and `specSchema`
  (`archetypes/types.ts:98-110`). Costing has none: no RFQ unit, no pipeline
  stages, no spec schema of its own. It would be a malformed archetype.
- `ARCHETYPE_CODES` is a frozen 6-tuple (`archetypes/types.ts:9-16`); the registry
  is deliberately data-driven with "no `switch (archetype)` anywhere"
  (`resolve.ts:13-17`). A new code is a framework amendment, and §3's tree routes
  a genuinely-new archetype to *Muaaz for approval*, not to a build task.
- The ISC inputs `fuelType`/`engineCC` (`engine.ts:41-45`) are **product-spec
  fields**, resolved through the per-archetype spec schema
  (`resolveSpecSchema`, `resolve.ts:104-123`). Costing **reads** archetype-resolved
  specs — it does not define an archetype.
- The persistence model already keys costing to shipments, not to a buyer type:
  `cost_calculations` carries nullable `container_id`, `order_id`, `product_id`
  FKs (SPEC §4, `cost_calculations`); `prorrateo_runs` keys to `container_id`.

**Trade-offs.** (A) pollutes the frozen archetype registry with a bufferless entry,
forces `switch`-style special-casing back into a deliberately branch-free system,
and mis-signals that costing has a buyer. (B) attaches costing as a capability to
the container/order every archetype produces — EQUIPMENT machinery, COMMODITY
drums, and ORIGIN exports all get landed by the same module.

**Recommendation — (B). A Costing module on the Container Desk, not a 7th
archetype.** Key it **primarily to `containers`, secondarily to `orders`, with a
standalone calculator mode** (product_id-only / `DEFAULT_INPUTS`, `engine.ts:183`)
for ad-hoc quoting before a container exists. It reads product-spec fields (ISC)
through the existing archetype spec resolver; it never enters `ARCHETYPE_CODES`.

**Muaaz must confirm:** that costing attaches to containers/orders as a cross-cutting
financial capability (with a standalone calculator), and `ARCHETYPE_CODES` stays the
frozen six.
