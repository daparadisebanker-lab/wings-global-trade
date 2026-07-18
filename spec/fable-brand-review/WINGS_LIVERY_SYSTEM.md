# Wings Livery System — umbrella branding law

**Status: PROPOSED (2026-07-11).** The canonical livery specification for the whole
house: WGT lanes, represented brands, endorsed brands. It refines root `CLAUDE.md`
§Phase-2 into a deterministic, testable procedure and applies it to the lane and
archetype proposals in the ecosystem development map. Root `CLAUDE.md` remains
supreme; where this spec quantifies a gate that §Phase-2 states qualitatively, the
quantification is proposed law pending §7 ratification — until then it is the
working standard every new livery proposal is written against. Companion:
`spec/WINGS_MOTION_AND_DRAFTING_SYSTEM.md` (motion + drafting; same tier logic).

Sources of truth this spec is grounded in, not a restatement of:
`packages/ui/tokens/skeleton.css` (Tier 1) · `packages/liveries/wings/livery.css`
(Tier 2 house) · `packages/liveries/registry.md` (the ledger) ·
`apps/site/src/app/(brands)/rb-canvas.css` (the `--rb-*` contract) · root
`CLAUDE.md` §2/§3/§5/§5-bis/Phase-2.

---

## 1 · The three-tier token architecture (law)

| Tier | Lives in | Contains | May vary? |
|---|---|---|---|
| **Tier 1 — frozen skeleton** | `packages/ui/tokens/skeleton.css` | Spacing, type scale, grid, radii (0 structural / ≤2px card), the two eases + `--lane-switch-duration`, tabular numerals | **Never**, for lanes and represented brands. Endorsed brands may redefine only the enumerated expressive choices (§4). Byte-stable file — a lane need is a Tier-2/3 problem by definition. |
| **Tier 2 — semantic interface** | `packages/liveries/wings/livery.css` (house) + the shared contracts: `--rb-*` (§5-bis), `--draft-*` / `--flood-*` (motion spec) | The names components reference: `--livery-navy`, `--livery-gold*`, `--livery-warm-white`, `--livery-font-{display,body,mono}`, plus the **reserved semantic hues**: `--error #A61B3A` (~347°, D-3 ratified) and the Mister scarcity ramp `--ramp-hot #B93400` (~17°) | The **names** are the contract and do not vary. The **values** are what a livery overrides. |
| **Tier 3 — livery** | `packages/liveries/{slug}/livery.css` under `[data-lane="{slug}"]` · brand tokens under `[data-brand="{slug}"]` | Ground, ink, accent (+ ink-pair), texture, type posture — Tier-2 value overrides only | Per lane / per brand, **derived by §2, never invented**. |

Laws that hang off the tiers:

- **Components consume semantic tokens only.** Never a raw hex, never a raw px
  outside the primitive scale. Compliant pattern:
  `ContainerSliceDiagram`'s local-custom-property-with-fallback contract.
  Anti-pattern: `PackingDiagram`'s direct `--rb-*` reads (flagged for refactor in
  the motion spec §1).
- **Alpha variants ship as rgba literals** in the livery file
  (`--livery-gold-subtle`, `--rb-accent-soft` precedents) — Tailwind slash-opacity
  cannot modify `var()` colors.
- **Current-state honesty:** the house livery is defined at `:root`, not
  `[data-lane="wings"]` (`livery.css` header note). Re-scoping it is part of the
  lane split and changes zero computed values.
- The scratchpad renderings of the identity system (Flexo Heavy display, DM Mono
  data) were **stand-ins**. The law is `apps/site/CLAUDE.md`: NissanOpti display
  (weight 400 only) · Flexo body · Teko labels/mono, self-hosted. No new
  typefaces, at any tier, ever — postures, not faces.

---

## 2 · The derivation algorithm — deterministic, gated

Run in order. Every computed value is recorded in the registry row (§6). A step
without its gate passed does not proceed.

**Step 0 — Is it a lane at all?** Run the root §3 decision tree first. A
sub-taxonomy, a CREDENTIAL roster entry, or an ALLOCATION instrument gets **no
livery**. Most "new categories" die here (see §3-C).

**Step 1 — Ground** = the environment the cargo lives in (steel shop → cold blue;
timber/stone → bone; grain → kraft; clinic → clinical cool white; ocean → document
cream). Archetype hint: PROJECT/ORIGIN lean light-editorial; EQUIPMENT/CREDENTIAL
may go dark. *New, testable clause:* **a lane ground is never pure `#FFFFFF`** —
pure white is reserved to the §5-bis represented-brand canvas; the closest a lane
may sit is a tinted cool white (e.g. `#F4F7F8`). Why: the white canvas is a
structural category marker, not a color choice; a pure-white lane would erase it.

**Step 2 — Ink** = derived from ground temperature. Warm ground → warm ink, never
pure `#000` on warm grounds. Cool grounds take cool near-blacks.

**Step 3 — Accent** = the cargo's most premium material signal. Compute and
record three numbers: **hue angle (H°), lightness (L\*), chroma (C\*)**.

**Step 4 — Separation gate** (the refined law; §Phase-2 step 4 made testable):

1. **Co-render scoping.** Separation is checked against everything the accent
   actually shares a viewport with: a **lane** accent checks against the house
   row + every lane row (lanes co-render on the Manifest). An **RB** accent
   checks against the house row + every RB row (brands co-render on the
   `/marcas` roster) — lane↔RB adjacency is advisory only, because RB accents
   never touch lane chrome (registry law).
2. **Hard gate:** ≥30° hue separation from every row in the co-render set, OR —
3. **Value-register clause, quantified:** ΔL\* ≥ 20 against the colliding row,
   recorded in the ledger, and **at most one clause-pair per 30° hue band**. A
   band cannot hold three accents no matter how the registers stack.
4. **Neutral exemption:** an accent with C\* < 15 reads as neutral — hue is
   imperceptible at that chroma — and is exempt from the hue gate. It must ship
   an ink pair and carry differentiation in ground + texture + posture instead.
5. **Reserved semantic hues:** every accent keeps ≥20° from `--error` (~347°)
   and `--ramp-hot` (~17°) regardless of register — failure and scarcity are
   meanings, not aesthetics, and an accent that neighbors them teaches buyers
   the wrong reflex.

**Step 5 — Contrast gate:** accent passes 4.5:1 on its ground for text, or ships
an `--accent-ink` pair (precedent: Áladín `#5E8A16` at 4.10:1 large-only +
`#4C7012` ink pair at 5.78:1). Dark-ground lanes almost always need the pair —
record it, don't discover it in QA.

**Step 6 — Texture:** exactly one, from the library (`blueprint-grid`,
`linen-paper`, `kraft`, `document-grain`, `none/high-key`;
`container-corrugation` ratified 2026-07-09 but scoped to RB shelves until its
formal library entry). Sharing a texture between lanes is legal; a new texture
requires founder approval.

**Step 7 — Type posture:** one of four — `compressed-caps` (EQUIPMENT),
`editorial-light` (PROJECT/ORIGIN), `warm-mid` (COMMODITY/PROGRAM),
`formal-smallcaps` (CREDENTIAL).

**Step 8 — Output + proof:** `livery.css` overriding Tier-2 semantic tokens only
under `[data-lane="{slug}"]`; renders every shared organ with zero
component-level overrides; swap test both directions.

---

## 3 · Applied: the ecosystem-map proposals, refined

The development map proposed accent hexes for the six WGT lanes and four
candidate categories. Run through §2 against the **real registry** (house gold
`#C4933F` ~38° L\*≈64 · RB/01 Áladín `#5E8A16` ~83°), the proposals collide more
than they pass. The honest sort follows. All L\*/contrast figures are estimates
to be verified at admission (§6); hue angles are computed from the hexes.

### 3-A · The six WGT lanes (registry-extension candidates)

| Code | Lane | Ground | Ink | Accent (derived) | H° · L\* | Gate result | Texture · Posture |
|---|---|---|---|---|---|---|---|
| WGT/01 | Machinery | Cold steel dark (`#0F1C26`-register) | Cool | Machined steel blue `#2F82C4` | 207° · ≈52 | **PASS clean** vs house (169°) | blueprint-grid · compressed-caps · needs light ink-pair on dark ground |
| WGT/02 | Interiors | Bone (timber/stone) | Warm near-black | Brass, darkened `#7C572A` (map's `#9A6B3F` sat 9° from gold at ΔL\* only ≈18 — insufficient) | 33° · ≈40 | **REGISTER CLAUSE** vs house gold: 5° hue, ΔL\*≈24. Consumes the warm-metal band's one clause slot | linen-paper · editorial-light |
| WGT/03 | Provisions | Kraft (grain) | Warm | Map proposed "harvest" `#C9862B` — **REJECTED: 3° from house gold, same register. The house already owns harvest gold.** Re-derived: olive-leaf `#5F6B1E` (oils, pulses, greens) | 69° · ≈43 | **PASS** vs house (31°) and all lanes. Advisory note: 14° from RB/01 Áladín — legal (never co-rendered in chrome) but ledger the adjacency | kraft · warm-mid |
| WGT/04 | Living | Warm linen paper | Warm | Verdigris `#4E8A72` (aged copper; map's `#3E7C6F` nudged +11° to clear Export) | 156° · ≈50 | **PASS** — 31° from Export as refined | linen-paper · warm-mid |
| WGT/05 | Representation | Deep navy (the house's own dark) | Warm-white | **No new accent — recommended ledgered exception: the credential lane wears the house gold `#C4933F`.** The mandate lane is the house speaking; a different metal would undercut the credential. The mechanical alternative (sealing-wax oxblood ~347°) collides with the reserved `--error` hue and is rejected | 38° · 64 | **EXCEPTION — founder decision required** | document-grain · formal-smallcaps |
| WGT/06 | Export | Document cream (ocean) | Warm-dark | Deep pacific `#12525E` (map's `#147A82` deepened to buy register distance) | 190° · ≈32 | **REGISTER CLAUSE** vs Machinery: 17° hue, ΔL\*≈21. Consumes the blue band's one clause slot | document-grain · editorial-light |

Score: two clean passes as proposed (Machinery, Living-after-nudge), two
register-clause admissions (Interiors, Export), one rejection re-derived
(Provisions), one recommended exception (Representation).

### 3-B · Candidate new lanes from the map

| Candidate | Archetype | Derivation | Verdict |
|---|---|---|---|
| **Solar & Energy** | EQUIPMENT | Ground: silicon anthracite (panel-dark). Accent: photovoltaic violet-blue `#5B4FC0` (246° · ≈42) — the mono-crystalline shimmer, cargo-true. 39° from Machinery, clear of everything. Ships a light ink-pair on the dark ground. blueprint-grid · compressed-caps | **Cleanest new derivation in the set.** Lane when commercially ready. |
| **Medical & Clinical** | EQUIPMENT | Ground: clinical cool white `#F4F7F8` (**never pure white** — Step 1 reservation; this lane sits closest to the RB canvas and the tint is what keeps the §5-bis marker legible). Accent: the truthful signal — surgical teal (~170°) — is **blocked**: 14° from Living, 20° from Export, and the teal band's clause slot is spent. Derived instead: surgical steel `#6C8794` (199° · C\*<15 → **neutral exemption**) + strong cool ink pair. Differentiation shifts to the ground and posture — which is clinically correct: the one lane that must not be colorful | Lane, via neutral exemption. Watch: sanitary-registered devices cross into REGULATED (3-C). |
| **Construction & Materials** | COMMODITY | Ground: raw concrete `#E8E6E1`. Truthful accents all collide: corten/red-oxide (~11–24°) sits on the scarcity ramp and the house metal band; safety yellow (~46°) is 8° from gold. Derived: zinc slate `#46586A` (210° · C\*<15 → **neutral exemption**) + ink pair. kraft texture · warm-mid | Lane, weakest derivation in the set — acceptable **because COMMODITY is table-led**: the ManifestTable is the hero and the livery carries less identity load. |
| **Packaging & Industrial Consumables** | PROGRAM | Ground: kraft — the cargo *is* corrugated board. Accent: carton stencil ink `#1F1B16` (near-black, **neutral exemption**) — the shipping-mark voice, cargo-true and unclaimable by any other lane. kraft texture · warm-mid | Lane. The most self-evident livery in the candidate set: kraft + stencil is the packaging trade's own drawing. |

### 3-C · Not lanes — no livery (the decision tree catches them)

Per root §3 and the brief's own discipline — do not invent liveries for
non-lanes:

- **Textiles & Apparel (raw)** — sub-taxonomy of WGT/03 or WGT/04 depending on
  buyer; extend that lane's taxonomy. No code, no accent.
- **Foreign brand wanting LatAm reach** — CREDENTIAL roster entry on WGT/05, or
  RB/xx if sold container-only. Uses the host surface's livery law.
- **REPLENISHMENT** — a PROGRAM mode + a subscription object in TOWER, as the
  map itself concludes. Not an archetype, not a lane.
- **CAPACITY (freight itself)** — already ALLOCATION + Network. Flagged so no
  one re-invents it as a lane.

### 3-D · Proposed archetypes: REGULATED · PERISHABLE

**Archetypes do not own accents — lanes do.** The map's archetype cards carry
livery implications; keep them at the hint level, exactly as §Phase-2 does for
the existing six. No registry row exists until a lane instantiates the
archetype, and a new archetype is a framework amendment ratified *before* any
livery derivation begins.

- **REGULATED (proposed 08):** hints — document-led ground (dossier white/cool),
  `formal-smallcaps` posture (the credential family; the buyer is buying
  clearance, not cargo). New Tier-2 need: a **compliance-state vocabulary**
  (cleared / pending / restricted) as semantic tokens. Law: "pending" and
  "restricted" must NOT reuse `--error` — a dossier in process is not a failure,
  and teaching buyers that it is would poison the lane's core surface.
- **PERISHABLE / COLD-CHAIN (proposed 09):** hints — high-key fresh ground,
  `warm-mid` or `editorial-light` posture per instantiation. Its clock UI
  (shelf-life window against a reefer slot) **lawfully reuses the Mister
  scarcity ramp** — a closing harvest window is genuine scarcity, the one place
  the ramp's meaning and the lane's business coincide. No new urgency hue.

---

## 4 · Per-category livery treatment (the three structural categories)

| | **WGT lanes** | **Represented brands (RB/xx)** | **Endorsed brands** |
|---|---|---|---|
| Scope attr | `[data-lane="{slug}"]` | `[data-brand="{slug}"]` inside `[data-canvas="brand"]` | Own site — no Wings scope |
| Ground | Derived (§2 Step 1), never pure white | **Pure white, by law** (§5-bis) — the category marker | Theirs |
| Identity enters via | Full Tier-3 livery: ground + ink + accent + texture + posture | **Fixed `--rb-*` contract only**: accent (+ink pair), accent-2, ink, surface-tint ≤4%, logo, photography. Values derived from the brand's usage manual, never sampled from their site | Their own token system on `@wings/trade-ui` |
| Tier-1 freedom | None | None — Wings type, radii, motion throughout | May redefine the enumerated expressive set only: display typeface, radii feel, texture library. **Not** component structure, RFQ logic, wholesale directives — and not motion (motion spec §4) |
| Registry check | Hard vs house + all lanes | Hard vs house + all RB rows (the `/marcas` roster co-renders them); advisory vs lanes | Not registered — but the Verified seal placement is (§5) |
| Wings presence | Total — the lane *is* Wings | Chrome + mandate block only; Wings navy/gold never inside the brand canvas otherwise | Colophon credit + Verified seal, **never the hero** |
| Equity direction | Inherited in full | Borrowed laterally | Deposited, not shown |
| Advisor | Mister | Mister (pack `rb-{slug}`) | Own named persona on the white-label engine |

Áladín's dual status (endorsed standalone + RB/01 hosted) is the proof the tiers
are a dial, not a box — the same partner shows a different amount of Wings on
each surface, and both follow this table without exception.

---

## 5 · Wings Verified — the cross-category constant

The one mark every tier carries; the house's most portable equity. Status:
**proposed asset, not yet built** — design once, at the LaneStamp level of care.
The built RB seal (`kit/seal/rb-seal.svg`, «Representación oficial») is its
nearest sibling and stays distinct: a mandate is not a verification; conflating
the two marks would dilute both.

Token and placement law:

1. **The seal renders only in house navy + gold.** Never re-tinted by a lane
   accent or `--rb-*` value — a Verified seal in a partner's color is a forged
   signature. This is the single deliberate exception to "everything themes by
   token" and is scoped to this one asset.
2. Placement per tier: lanes — on verified products and spec sheets; represented
   — on the `/marcas` shelf beside the mandate block (consistent with §5-bis:
   the mandate block is already the one place Wings navy/gold enters the
   canvas); endorsed — the **only** Wings element the brand carries; Network —
   tiered by supplier verification state (the seal *is* the product suppliers
   pay for).
3. It states verification state, never decoration: struck check = verified;
   absence is information. No hover flourish, no ambient motion beyond a Settle
   on entry (motion spec §2).

---

## 6 · Governance — how a livery is admitted

Ordered; each gate blocks the next. This extends the registry's append-only law
— it never replaces it.

1. **Decision tree** (root §3): lane / sub-taxonomy / roster entry / RB. Only
   lanes and RBs proceed.
2. **Phase-0 interview** answered and stored in `lane.config.ts` (root §Phase-0)
   or the RB kit manifest.
3. **Derivation record**: §2 executed, all computed values written into the
   proposed registry row — accent hex, H°, L\*, C\*, ink-pair, clause claimed
   (none / register / neutral / exception), texture, posture.
4. **Contrast audit** (Step 5) with measured ratios, not estimates.
5. **Separation check** against the full co-render set, clause budget verified
   (one register-pair per band).
6. **Swap test, both directions** (root §Phase-6.6 / RB SPEC §2.5): the
   candidate livery on an existing lane's pages, and an existing livery on the
   candidate's — zero component-level overrides either way.
7. **Equity-Transfer Test** (motion spec §5.3): the surface visibly routes trust
   to the house; with the Wings name removed the buyer still knows the house;
   the tier shows exactly as much Wings as the relationship warrants.
8. **Founder sign-off**, then the row is **appended** to
   `packages/liveries/registry.md`. Rows are never edited or reordered; codes
   never reshuffle; a paused lane keeps its row and its code.

Registry upgrade this spec requires (proposed in §7): columns for L\*, C\*, and
clause; plus two **reserved-semantics rows** so future derivations check against
`--error` and `--ramp-hot` without archaeology in `livery.css` comments.

---

## 7 · Proposed law amendments (for founder ratification)

**`packages/liveries/registry.md`** — proposed extension (appended, never
edited; all rows PROPOSED until their lane/asset is ratified):

```diff
  | Code | Slug | Name | Ground | Accent | Accent hue | Texture | Status |
  |------|------|------|--------|--------|-----------|---------|--------|
  | —    | wings | Wings Global Trade (house) | `#001E50` navy | `#C4933F` harvest gold | ~38° | none/high-key | HOUSE (pre-onboarding) |
+ | —    | (reserved) | Error semantic — `--error` (D-3) | — | `#A61B3A` | ~347° | — | RESERVED — accents keep ≥20° |
+ | —    | (reserved) | Scarcity ramp — `--ramp-hot` (Mister) | — | `#B93400` | ~17° | — | RESERVED — accents keep ≥20° |
+ | WGT/01 | machinery | Machinery & Equipment | steel dark | `#2F82C4` steel blue | ~207° · L*≈52 | blueprint-grid | PROPOSED |
+ | WGT/02 | interiors | Interiors & Projects | bone | `#7C572A` brass | ~33° · L*≈40 · REGISTER-CLAUSE vs house (ΔL*≈24) | linen-paper | PROPOSED |
+ | WGT/03 | provisions | Provisions | kraft | `#5F6B1E` olive-leaf | ~69° · L*≈43 (map's harvest `#C9862B` REJECTED — 3° from house) | kraft | PROPOSED |
+ | WGT/04 | living | Living & Home | linen | `#4E8A72` verdigris | ~156° · L*≈50 | linen-paper | PROPOSED |
+ | WGT/05 | representation | Representation | deep navy | = house `#C4933F` — LEDGERED EXCEPTION (credential lane wears the house metal) | ~38° | document-grain | PROPOSED — needs founder ratification of the exception |
+ | WGT/06 | export | Export & Origin | document cream | `#12525E` deep pacific | ~190° · L*≈32 · REGISTER-CLAUSE vs WGT/01 (ΔL*≈21) | document-grain | PROPOSED |
+ | WGT/xx | solar | Solar & Energy (candidate) | silicon dark | `#5B4FC0` photovoltaic violet | ~246° · L*≈42 | blueprint-grid | CANDIDATE |
+ | WGT/xx | medical | Medical & Clinical (candidate) | cool white `#F4F7F8` | `#6C8794` surgical steel | ~199° · C*<15 NEUTRAL-EXEMPT | none/high-key | CANDIDATE |
+ | WGT/xx | construction | Construction & Materials (candidate) | concrete | `#46586A` zinc slate | ~210° · C*<15 NEUTRAL-EXEMPT | kraft | CANDIDATE |
+ | WGT/xx | packaging | Packaging & Consumables (candidate) | kraft | `#1F1B16` stencil ink | neutral · NEUTRAL-EXEMPT | kraft | CANDIDATE |
```

(Candidate rows carry no WGT number — codes are assigned at onboarding, in
order, and never reserved speculatively.)

**Root `CLAUDE.md` §Phase-2, step 4** — quantify the separation law (replaces
the current step-4 sentence; everything else in Phase-2 stands):

```diff
- 4. **Hue separation:** a new accent must sit ≥30° in hue OR a clearly distinct value register from every existing lane accent. Check against the registry in `packages/liveries/registry.md`.
+ 4. **Hue separation:** a new accent must sit ≥30° in hue from every row it co-renders with (lanes check house + lanes; RBs check house + RBs; lane↔RB is advisory), OR claim the value-register clause: ΔL* ≥ 20, recorded in the registry row, at most one clause-pair per 30° hue band. Accents with C* < 15 are neutral-exempt (ink pair mandatory; differentiation moves to ground/texture/posture). All accents keep ≥20° from the reserved semantic hues (`--error` ~347°, `--ramp-hot` ~17°). Full procedure: `spec/WINGS_LIVERY_SYSTEM.md`.
```

**Root `CLAUDE.md` §Phase-2, step 1** — one added clause:

```diff
  1. **Ground** = the environment the cargo lives in (steel shop → cold blue; timber/stone → bone; grain → kraft; clinic → clinical cool white; ocean → document cream). Light or dark ground is an archetype hint: PROJECT/ORIGIN lean light-editorial; EQUIPMENT/CREDENTIAL may go dark.
+    A lane ground is never pure `#FFFFFF` — pure white is reserved to the §5-bis represented-brand canvas as a structural category marker.
```

### Decisions the founder must make, in priority order

1. **The WGT/05 exception.** Does the Representation lane wear the house gold
   (recommended — the mandate lane is the house speaking; every mechanical
   alternative either collides with the reserved error hue or is
   cargo-untruthful), or must it derive a distinct accent like every other lane?
   This is the one row that cannot be resolved by algorithm.
2. **Ratify the quantified gates** (ΔL\* ≥ 20 register clause, one clause-pair
   per band, C\* < 15 neutral exemption, reserved-hue buffer). They are what
   turns §Phase-2 from judgment into procedure — and they are also what forced
   the honest finding that the warm-metal band (20–50°) is effectively **house
   property**: Interiors' brass consumes its only clause slot, which is why
   Provisions was re-derived to olive and Construction to a neutral.
3. **Provisions loses "harvest."** The map's most natural-looking assignment
   (harvest gold for the food lane) is the one the registry already forbids —
   the house took that accent at founding. Confirm olive-leaf `#5F6B1E`, or
   choose to re-derive; what is not available is the status quo proposal.
4. **Wings Verified commissioning** — design-once at LaneStamp level, navy+gold
   only, before Network needs it as a product. It is named in three scratchpad
   documents and exists in none.
