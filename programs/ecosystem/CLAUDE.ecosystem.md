# CLAUDE.md — Wings Global Trade Ecosystem
## The Lane Intelligence Layer

This file is the operating brain for the Wings Global Trade multi-lane platform. Any agent working in this repo reads this first. Its purpose: make onboarding a **new lane** (division/category) a deterministic process — whether the lane is furniture, food, chemicals, medical equipment, or something that doesn't exist yet. The framework does not care what the cargo is. It cares what the *buyer logic* is.

---

## 1 · Prime Directives (never violate)

1. **Same box, different livery.** Structure is family-wide and frozen. Identity is per-lane and derived by rule. No lane ever forks a shared component; it themes it.
2. **Wholesale only.** No carts, no prices-per-unit-retail, no "shop/buy now/add to cart" language anywhere, in any locale. The primary action of every lane is always: *start a quote conversation* (RFQ or Mister).
3. **Components consume semantic tokens only.** Never a raw hex, never a raw px outside the primitive scale. If a design need can't be expressed in tokens, the token system gets extended at Tier 2 — the component never gets a hardcoded value.
4. **One brain, many mouths.** Mister is a single engine. Lanes get knowledge packs and livery chrome, never a separate bot.
5. **Numbers are exhibited, not hidden.** CBM, MOQ, lead times, HS codes, pallet counts — tabular mono, treated as brand assets.
6. **The refusals are law:** no rounded-soft SaaS aesthetics (radius 0–2px only), no stock photography, no gradient meshes, no retail vocabulary, no lane without a stamp.

---

## 2 · The Frozen Skeleton (Tier 1 — identical in every lane, forever)

- Spacing: `4 8 12 16 24 32 48 64 96 128`
- Type scale: 1.25 modular — `14 / 17.5 / 22 / 27 / 34 / 42 / 53 / 66 / 83`
- Grid: 12-col, shared gutters/max-widths/breakpoints
- Radii: 0 structural, ≤2px cards
- Motion: `--ease-gantry: cubic-bezier(0.83,0,0.17,1)` (structural moves) · `--ease-settle: cubic-bezier(0.22,1,0.36,1)` (reveals) · reduced-motion always collapses to crossfade
- UI typeface: the shared grotesque (labels, tables, nav, Mister) + tabular mono for all numerals
- Shared organs: `ManifestTable` · `LaneStamp` · `FillMeter` (container visualizer) · `RFQFlow` · `SpecSheet` (scoped blueprint mode) · `MisterDock` · `TrustFooter`
- The lane-switch transition (livery flood + stamp-settle, 600–800ms, interruptible)

If a new lane "needs" to change any of the above, the answer is no. That need is a livery problem or a content problem, never a skeleton problem.

---

## 3 · Purchase-Logic Archetypes (the actual intelligence)

Every lane — current or future — maps to exactly one archetype. The archetype determines IA pattern, RFQ math, Mister vocabulary, and visualizer cargo logic. **This is what makes the framework category-agnostic: you never design for the product, you design for how it is bought.**

| Archetype | Buyer buys… | Unit math | IA pattern | Current examples |
|-----------|-------------|-----------|------------|------------------|
| **EQUIPMENT** | Specified units + after-sale confidence | per unit / per crate CBM | Catalog by function → spec sheet | WGT/01 Machinery |
| **PROJECT** | A scoped delivery tied to milestones | per key / per room / per m² | **Dual taxonomy** (discipline + space) → spec sheet → project RFQ | WGT/02 Interiors |
| **COMMODITY** | Volume at grade + price window | per pallet / per container / per MT | Commodity table (grades, seasons, availability) → contract RFQ | WGT/03 Provisions |
| **PROGRAM** | Repeating SKU assortments | per SKU program / per carton run | Assortment builder → program RFQ | WGT/04 Living |
| **CREDENTIAL** | Access + legitimacy (a mandate) | per territory / per scope | Roster → credential page → mandate inquiry | WGT/05 Representation |
| **ORIGIN** | Provenance + documentation outbound | per container / per certificate | Origin catalog + seasonality → export RFQ | WGT/06 Export |

**Decision tree — new category arrives:**

```
Is the buyer distinct AND the purchase logic distinct from every existing lane?
├─ NO  → it is a sub-category of an existing lane. Extend that lane's taxonomy. Stop.
└─ YES → it is a new lane.
    ├─ Does it map to one of the six archetypes?
    │   ├─ YES → run the Onboarding Protocol (§4) with that archetype's templates.
    │   └─ NO  → STOP. Do not improvise. Propose a new archetype to Muaaz with:
    │            buyer definition, unit math, IA pattern, RFQ shape.
    │            A new archetype is a framework amendment, not a build task.
```

Examples of the test: *medical equipment* → EQUIPMENT (new lane, existing archetype). *Bar stools* → sub-category of WGT/02. *Construction chemicals in drums* → COMMODITY. *A European lighting brand wanting LatAm distribution* → CREDENTIAL roster entry, not a lane.

---

## 4 · Lane Onboarding Protocol

Run these phases in order. Each phase has a gate; do not proceed past an unmet gate.

### Phase 0 — Qualification interview (with Muaaz, one question at a time)

Answers required before any code:

1. Buyer: who signs the PO? (role, region, sophistication)
2. Archetype: which of the six? (confirm with the decision tree)
3. Unit math: what number does the buyer negotiate in?
4. Taxonomy: top-level categories (≤8 at launch)
5. Photography feasibility: can the livery's photo standard be met at launch? If not, launch is typography-and-spec-led until it can.
6. Lane knowledge sources for Mister (supplier docs, spec sheets, incoterm defaults)
7. Commercial readiness: is there at least one shippable program/product today?

**Gate:** all seven answered. Write them into the lane config (Phase 1).

### Phase 1 — Lane registration

Create `packages/liveries/{slug}/lane.config.ts`:

```ts
export const lane = {
  code: "WGT/07",            // next integer; codes are NEVER reused or reordered
  slug: "medical",           // path segment
  name: "Medical & Clinical",
  scope: "One-line scope statement, ES + EN",
  archetype: "EQUIPMENT",
  buyer: ["clinic groups", "hospital procurement", "distributors"],
  unitMath: "per unit CBM",
  cargoSet: "medical-crates",  // FillMeter asset set id
  misterPack: "wgt-07-medical",// Supabase knowledge pack key
  status: "OPENING",           // OPENING → ACTIVE → (never deleted; ARCHIVED at most)
}
```

Register the lane in: The Manifest lane index, the hero lane map, the footer colophon, `sitemap.ts`, and analytics lane dimension. A lane is not real until it appears on The Manifest — even as an `OPENING` stamp.

### Phase 2 — Livery derivation (rules, not taste)

Derive, don't invent:

1. **Ground** = the environment the cargo lives in (steel shop → cold blue; timber/stone → bone; grain → kraft; clinic → clinical cool white; ocean → document cream). Light or dark ground is an archetype hint: PROJECT/ORIGIN lean light-editorial; EQUIPMENT/CREDENTIAL may go dark.
2. **Ink** = derived from ground temperature (warm ground → warm ink, never pure #000 on warm grounds).
3. **Accent** = the cargo's most premium material signal (brass, harvest gold, verdigris, seal gold, surgical teal…). Must pass 4.5:1 on ground for text, or ship with an `--accent-ink` pair.
4. **Hue separation:** a new accent must sit ≥30° in hue OR a clearly distinct value register from every existing lane accent. Check against the registry in `packages/liveries/registry.md`.
5. **Texture:** exactly one, from the library (`blueprint-grid`, `linen-paper`, `kraft`, `document-grain`, `none/high-key`). New textures require approval.
6. **Type posture:** one of — `compressed-caps` (EQUIPMENT), `editorial-light` (PROJECT/ORIGIN), `warm-mid` (COMMODITY/PROGRAM), `formal-smallcaps` (CREDENTIAL). Same variable family, different posture. No new typefaces.
7. Output: `livery.css` overriding **Tier 2 semantic tokens only** under `[data-lane="{slug}"]`.

**Gate:** livery passes contrast audit + hue-separation check + renders all shared organs without a single component-level override.

### Phase 3 — IA generation (from archetype template)

- EQUIPMENT → function-first catalog → spec sheets → unit RFQ
- PROJECT → dual taxonomy (canonical discipline URLs + curated space overlay) → spec sheets → project RFQ with per-key math
- COMMODITY → grade/season availability table (the ManifestTable is the hero) → contract RFQ
- PROGRAM → assortment/SKU program builder → program RFQ
- CREDENTIAL → roster → credential pages → mandate inquiry
- ORIGIN → origin catalog + seasonality layer → export RFQ

Every lane page keeps the shared skeleton order: Lane header → capability statement → category architecture → container logic (FillMeter + CBM/MOQ math) → proof → Mister + RFQ. One primary action per page.

### Phase 4 — Shared organ wiring

- **FillMeter:** commission the lane cargo set (crates/pallets/cartons modeled to the shared container grammar); cargo tints from `--cargo`.
- **Mister knowledge pack** (Supabase, key = `misterPack`):
  - `vocabulary`: lane terms in ES/EN
  - `unit_math`: formulas + defaults (e.g., FF&E per key; MT per container by product density)
  - `diagnosis_set`: 5–9 lane-specific qualification questions layered onto the shared archetype engine
  - `handoff`: WhatsApp line + CRM pipeline id
  - `register`: one paragraph describing Mister's posture in this lane (character never changes; vocabulary and pace do)
  - `forbidden`: claims Mister may never make in this lane (pricing guarantees, regulatory claims, etc.)
- **RFQFlow:** configure line-item shape to the lane's unit math. The flow itself is untouched.
- **n8n:** clone the lane pipeline template; set lane dimension on every event into the wings Supabase project (`pyznlglvwihosemqkhtq`).

### Phase 5 — Content launch gate

A lane goes `ACTIVE` only when it has: ≥1 fully specified flagship program/collection (depth over breadth — a curated 12 beats a thin 100), photography meeting the livery standard **or** an explicit typography-led interim design, full ES/EN content, and its Mister pack answering the diagnosis set correctly in test transcripts.

### Phase 6 — QA gates (all must pass)

1. **Awwwards test:** one deliberate moment of tension per key view; would a jury stop scrolling?
2. **Token lint:** zero raw values in lane code.
3. **Wholesale-language lint:** scan all locales for the forbidden retail vocabulary.
4. **Performance:** LCP < 2s on 4G; FillMeter lazy-loaded; livery = pure CSS custom properties.
5. **Reduced motion + keyboard:** full parity.
6. **The swap test:** put another lane's livery on this lane's pages — structure must still work perfectly. If it breaks, someone forked the skeleton. Fix that.

---

## 5 · Endorsed Brands & White-Label Mode

Some businesses in the ecosystem are **not lanes** — they are standalone brands with their own identity, where Wings acts as representative or trade backbone (first case: **Áladín**). Rules:

1. The skeleton ships as `@wings/trade-ui` — brand-agnostic. Endorsed brands consume the same components with **their own token system**, and (unlike lanes) they MAY redefine Tier-1 expressive choices: display typeface, radii feel, texture library. They may NOT change component structure, RFQ logic, or the wholesale directives.
2. Endorsed brands do **not** use Mister. Mister is Wings IP. They get their own named advisor persona running on the same white-label engine (shared diagnosis architecture, separate persona, separate knowledge base, separate WhatsApp/CRM lanes).
3. Endorsement lockup: the Wings credit appears in the colophon/footer and on trade documents ("Represented by Wings Global Trade") — never in the hero. A standalone brand must stand alone.
4. On the Wings side, the endorsed brand appears as a **credential page** on WGT/05 Representation (and, where relevant, as a flagship client of WGT/06 Export).
5. Data separation: separate Supabase schema per endorsed brand; shared n8n instance, separate pipelines; cross-reporting only at the group analytics layer.

---

## 6 · Repo Conventions

```
app/(manifest)/           group pages
app/(lanes)/{slug}/       lane routes — layout sets data-lane
packages/ui/              @wings/trade-ui — the skeleton (frozen organs)
packages/liveries/{slug}/ lane.config.ts + livery.css + textures
packages/liveries/registry.md   ← lane codes, accents, hue registry (append-only)
packages/mister/          engine client; packs live in Supabase
content/{slug}/           lane content, ES/EN, spec data
```

- Stack: Next.js App Router · TypeScript · Tailwind reading CSS custom properties · Supabase (wings project `pyznlglvwihosemqkhtq` — the single Supabase project for the entire ecosystem, incl. TOWER) · n8n · Vercel.
- Commits touching shared organs require the swap test (§4 QA-6) run against at least two lanes.
- Lane codes are append-only. WGT/03 stays WGT/03 even if Provisions ever pauses — infrastructure numbering never reshuffles.

---

## 7 · Definition of Done — new lane

- [ ] Phase 0 interview answered & stored in `lane.config.ts`
- [ ] Archetype confirmed via decision tree (or amendment proposed, approved)
- [ ] Lane registered on The Manifest (index, map, colophon, sitemap, analytics)
- [ ] Livery derived by §Phase-2 rules; contrast + hue registry pass
- [ ] IA generated from archetype template; one primary action per page
- [ ] FillMeter cargo set live; Mister pack tested; RFQ math correct; n8n pipeline firing
- [ ] Content launch gate met (flagship depth, ES/EN, photo standard)
- [ ] All six QA gates green
- [ ] Status flipped `OPENING → ACTIVE`

The payoff this file protects: **lane N+1 must always cost a fraction of lane N.** Any change that makes the next lane more expensive to open is architecturally wrong, no matter how good it looks.
