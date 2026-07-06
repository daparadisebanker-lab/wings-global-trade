# WINGS GLOBAL TRADE — Umbrella Ecosystem & Multi-Division Design System
### Brand architecture, site architecture, token system, Mister integration, and Awwwards-level execution spec
Version 1.0 — July 2026

---

## 0 · The Thesis: Same Box, Different Livery

The strongest conceptual foundation for this ecosystem is already sitting in your industry.

Look at any port. Maersk, ONE, Evergreen, Hapag-Lloyd — every shipping line uses the **exact same steel box**. Identical dimensions, identical corner castings, identical door mechanisms. What distinguishes them is the **livery**: the paint, the mark, the typography stenciled on the corrugation. The box is the system. The livery is the identity.

This is Wings Global Trade's design system in one sentence:

> **One skeleton, many liveries. Every division is the same container, painted differently.**

This is not a metaphor bolted onto the brand — it *is* the business. You move containers. Your divisions are trade lanes. Your family identity comes from the structure (grid, motion, components, Mister, the fill-meter); your division identities come from the livery (color temperature, texture, photography, display type treatment).

This thesis passes the D&AD test because it is **inevitable, not decorative**. No competitor in LatAm wholesale importing can claim it more legitimately than the company that actually runs consolidated containers through Tacna and Iquique.

---

## 1 · Brand Architecture: The Branded House

**Recommendation: Branded House with coded divisions ("Trade Lanes"), not a house of brands.**

Why: Wings' core asset is *trust infrastructure* — free-zone operations, container logistics, verified supplier networks, Mister. That trust must compound across divisions, not fragment across six separate brands you'd have to build from zero. A hotel developer who discovers Wings Interiors should instantly inherit the credibility Wings Machinery has already earned, and vice versa.

### The Lane System

Each division gets a **lane code** — a stencil-stamped identifier borrowed from container marking conventions (the same visual logic as BIC codes and ISO 6346 markings). The code appears on every page header, spec sheet, quote document, and container graphic.

| Code | Lane | Scope | Livery temperature |
|------|------|-------|-------------------|
| **WGT/01** | Machinery & Automotive | Current site — machinery, equipment, automotive sourcing | Cold — steel blue, signal cyan (existing) |
| **WGT/02** | Interiors | FF&E, OS&E, hard finishes, textiles, lighting — hospitality & residential projects | Warm — bone, walnut, brass |
| **WGT/03** | Provisions | Dry fruits, dry goods, food wholesale by container | Earth — harvest gold, date brown, kraft |
| **WGT/04** | Living | Houseware & kitchenware wholesale distribution | Fresh — porcelain, slate, verdigris |
| **WGT/05** | Representation | Official LatAm representation of foreign brands | Formal — charcoal, ivory, seal gold |
| **WGT/06** | Export | Outbound — Peruvian goods to world markets | Pacific — deep teal, document cream |

Naming stays functional and stamped: **WINGS GLOBAL TRADE / INTERIORS**, **WINGS GLOBAL TRADE / PROVISIONS**. The lockup is always Group → Lane. No cute sub-brand names — the codes *are* the branding, and they age like infrastructure, not like marketing.

**Open decision (flagged, not decided here):** whether WGT/06 Export absorbs or cross-links Áladín Exports. Two clean options: (a) Áladín remains a standalone endorsed brand ("Áladín — a Wings Global Trade company") preserving its European B2B equity, or (b) Áladín's operations fold under WGT/06 and the Áladín name retires to a product line. This deserves its own session — it affects Brücke-era corporate structure too.

### One important distinction inside the taxonomy

**WGT/02 Interiors** and **WGT/04 Living** overlap on paper (both touch kitchenware, accessories) but serve **different buyers with different purchase logic**:

- Interiors sells **projects** — a 120-key hotel opening, an FF&E budget per key, a delivery schedule tied to construction milestones. The buyer is a developer, procurement firm, or interior design studio.
- Living sells **distribution** — repeat container programs of houseware SKUs to retailers, distributors, and horeca supply houses. The buyer is a merchant.

Same factory sometimes; entirely different site architecture, Mister lane, and quote flow. Keep them separate.

---

## 2 · Domain & Technical Architecture

**Recommendation: one domain, path-based lanes, one Next.js codebase.**

```
wingsglobaltrade.com            → The Manifest (group umbrella)
wingsglobaltrade.com/machinery  → WGT/01 (current site migrates here)
wingsglobaltrade.com/interiors  → WGT/02
wingsglobaltrade.com/provisions → WGT/03
wingsglobaltrade.com/living     → WGT/04
wingsglobaltrade.com/representation → WGT/05
wingsglobaltrade.com/export     → WGT/06
```

Why paths over subdomains:

1. **SEO consolidation.** Every lane's content authority compounds into one domain. For B2B procurement queries ("importador FF&E hoteles Perú", "mayorista menaje contenedor") this matters enormously — you're building one moat, not six.
2. **One codebase, one component library, six themes.** Next.js route groups + a theme provider give each lane its own livery while sharing every structural component. Subdomains would fragment deployment, analytics, and Mister session context.
3. **The lane-switch becomes a designed moment** (Section 6) instead of a jarring cross-domain jump.

Implementation shape (fits your existing repo `daparadisebanker-lab/wings-global-trade`):

```
app/
  (manifest)/            → group homepage, about, infrastructure, contact
  (lanes)/
    machinery/
    interiors/
    provisions/
    living/
    representation/
    export/
packages/
  ui/                    → shared skeleton components
  liveries/              → per-lane token files
  mister/                → shared Mister client, lane-aware
```

Each lane layout sets `<body data-lane="interiors">` and the entire livery cascades from tokens. Zero component forking.

---

## 3 · The Token Architecture: Three Tiers

This is the mechanical heart of "same box, different livery." Three tiers, strict discipline about what lives where.

### Tier 1 — Primitives (immutable, family-wide)

These never change per lane. They ARE the family resemblance.

- **Spacing:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 (8-point grid, non-negotiable)
- **Type scale:** one modular scale (e.g., 1.25 ratio: 14 / 17.5 / 22 / 27 / 34 / 42 / 53 / 66 / 83)
- **Grid:** 12-column, same gutters, same max-widths, same breakpoints
- **Radii:** near-zero. Containers don't have rounded corners. 0–2px on cards, 0 on structural elements. This alone will distinguish the family from every soft-SaaS template on the internet.
- **Motion curves:** one easing vocabulary shared across all lanes (e.g., `--ease-gantry: cubic-bezier(0.83, 0, 0.17, 1)` for structural moves, `--ease-settle: cubic-bezier(0.22, 1, 0.36, 1)` for reveals)
- **Iconography:** one stroke weight, one geometric grammar
- **The stamp:** the lane-code stencil component — same construction everywhere

### Tier 2 — Semantic tokens (the interface contract)

Components only ever reference these. Never raw values.

```css
--surface-0        /* page ground */
--surface-1        /* raised panel */
--ink-primary      /* main text */
--ink-secondary
--accent           /* the lane's signal color */
--accent-ink       /* text on accent */
--line             /* rules, borders, manifest table lines */
--stamp            /* the stencil/stamp color */
--cargo            /* container visualizer fill color */
```

### Tier 3 — Liveries (per-lane overrides)

```css
[data-lane="machinery"] {
  --surface-0: #0B1220;      /* existing cold system */
  --accent: #38BDF8;
  --stamp: #7DD3FC;
  --texture: url(blueprint-grid);
}

[data-lane="interiors"] {
  --surface-0: #F5F1E8;      /* bone */
  --ink-primary: #2A2118;    /* walnut ink */
  --accent: #9A6B3F;         /* brass — or oxblood #6B2A2A */
  --stamp: #2A2118;
  --texture: url(linen-paper);
}

[data-lane="provisions"] {
  --surface-0: #F3EBDD;
  --ink-primary: #3B2E1E;
  --accent: #C9862B;         /* harvest gold */
  --texture: url(kraft);
}

/* living: porcelain #FAFAF7, slate ink, verdigris #3E7C6F accent
   representation: charcoal #1C1B19 ground, ivory ink, seal gold #B8963E
   export: document cream ground, pacific teal #145C63 accent */
```

The result: the same `<ManifestTable>`, `<SpecSheet>`, `<FillMeter>`, `<QuoteFlow>` render on every lane and feel native to each — because color, texture, and photography carry the emotional register while structure carries the family.

### Typography strategy

Recommended: **one shared UI grotesque** (labels, tables, navigation, Mister — the "infrastructure voice") + **one variable display family used differently per lane**. Machinery sets display in compressed caps, tracking tight. Interiors sets it light, large, generous leading — editorial. Provisions mid-weight, warm. Representation small caps, formal. Same DNA, different posture. This keeps the family unmistakable while letting Interiors feel like a design journal and Machinery feel like a workshop manual.

(Alternative if you want harder differentiation: allow Interiors alone a serif display face — the "guest of honor" exception. Decide during the Interiors design sprint.)

### Photography & texture per livery

- **Machinery:** cold industrial light, technical isolation, blueprint grid backgrounds (exists)
- **Interiors:** natural light editorial, materials shot like still life — marble edge, velvet grain, brass patina. Kinfolk rigor, procurement precision. This lane's photography is the single biggest lever for the "high-end tasteful sourcing" positioning.
- **Provisions:** macro produce, kraft and burlap, sun-warm grading
- **Living:** catalog-clean, high-key, product-forward
- **Representation:** portraiture of principals, brand marks treated like credentials, embassy formality
- **Export:** origin storytelling — Peruvian landscapes graded to the document-cream palette, export paperwork as graphic material

---

## 4 · Site Architecture

### 4.1 The Manifest — wingsglobaltrade.com (group homepage)

The umbrella site's job is **orientation and credibility transfer**, not selling any single lane. Its concept: a living trade desk.

Section order:

1. **Hero — The Lane Map.** A drawn-line world map animating trade lanes: Asia and Europe flowing into Callao / Tacna / Iquique (and outbound for WGT/06). Each lane is selectable; hovering reveals its lane code and livery color flooding a swatch. One primary CTA: *Enter a lane*.
2. **The Lane Index.** Six manifest-table rows (not cards — rows, like a shipping manifest): code, lane name, scope line, status stamp. Hover: the row floods with that lane's livery. This is the navigation and the brand statement simultaneously.
3. **The Shared-Container Program.** The fill-meter as group-level hero — "Trae tu grupo" extended beyond machinery (see 5.2). Live fill states if available.
4. **Infrastructure.** The trust layer: ZOFRATACNA, ZOFRI, incoterms handled, QC process, lead-time logic. Written like operations, not marketing.
5. **Mister dock.** One entry point; Mister asks which lane before diagnosis (see Section 5.1).
6. **Footer manifest.** Ports, entities, contact, the six lane codes repeated as a colophon.

### 4.2 Lane template (shared skeleton, every lane)

Every lane follows the same page-job sequence, per the buyer's decision order:

1. **Lane header** — stamp, lane code, one-line scope, livery flood
2. **Capability statement** — what this lane sources, from where, for whom (wholesale-only stated explicitly, always)
3. **Category architecture** — the browse layer (varies per lane, below)
4. **Container logic** — MOQ math, CBM calculator, shared-container availability
5. **Proof** — projects shipped, supplier network, certifications
6. **Mister + RFQ** — one primary action per page: *start a quote conversation*. No carts, ever. The absence of a cart is a positioning statement; design the RFQ flow to feel more premium than any checkout.

### 4.3 WGT/02 Interiors — dual taxonomy (the key IA decision)

Your product list maps to a procurement taxonomy, but your two buyer types navigate differently:

**Browse by discipline** (for procurement professionals and design firms):

```
FF&E
  ├─ Casegoods & Furniture   (headboards, nightstands, credenzas, desks, wardrobes…)
  ├─ Seating & Upholstery    (lounge, sofas, dining, outdoor…)
  ├─ Decorative Lighting     (chandeliers, pendants, sconces, lamps…)
  └─ Décor & Accessories     (art, mirrors, objects, rugs…)
Window Treatments             (blackout, sheers, motorized tracks, blinds)
Hard Finishes
  ├─ Stone & Tile            (marble, porcelain, sintered, mosaics, terrazzo…)
  ├─ Glass                   (enclosures, balustrades, partitions…)
  └─ Wallcoverings & Panels  (Type II vinyl, textile, acoustic, veneer…)
Architectural Lighting        (downlights, track, linear, cove, facade, emergency)
Textiles                      (upholstery, leather, drapery, bedding, towels, mattresses)
OS&E
  ├─ Tableware & F&B         (porcelain, glassware, flatware, buffet, barware…)
  └─ Guestroom & Bath        (kettles, safes, hairdryers, amenities…)
```

**Browse by space** (for developers and owners): Guestroom · Lobby & Public Areas · F&B · Spa & Wellness · Pool & Exterior · Back of House. Each space page cross-references the disciplines it draws from.

Both taxonomies resolve to the same product spec pages. Discipline is the canonical URL structure; space is a curated overlay. This dual entry is what separates a procurement platform from a furniture catalog — and it mirrors how FF&E budgets are actually written (per key, per space).

**The blueprint spec sheet** (your existing Mister spec-sheet system) becomes the Interiors lane's signature scoped experience: page stays editorial-clean; opening a spec sheet transitions into full technical-document mode — dimensions, materials, finishes, CBM per unit, units per container, lead time, QC checkpoints. The door opens, the door closes; the host page never carries the weight.

### 4.4 WGT/05 Representation — the credential site

Different job entirely: this lane sells *legitimacy to foreign principals* and *access to LatAm buyers*. Architecture: represented-brand roster (each brand a credential page with territory, scope of mandate, contact protocol), the "become represented" pathway for foreign brands, and the buyer-facing catalog per represented brand. Livery leans formal — this is the embassy of the ecosystem.

---

## 5 · The Shared Organs

### 5.1 Mister — one brain, six lanes

The system logic you've built (five buyer-archetype lanes, needs-diagnosis flow, WhatsApp deep-link handoff, blueprint spec output, Supabase + n8n backend) stays **singular**. What changes per lane:

| Layer | Shared | Per-lane |
|-------|--------|----------|
| Diagnosis engine & archetype logic | ✔ | — |
| WhatsApp handoff + CRM pipeline | ✔ | — |
| Supabase intelligence backend | ✔ | `lane` context field on every session |
| System prompt | core persona | + lane knowledge pack |
| Domain vocabulary | — | FF&E-per-key math (Interiors), container/pallet commodity math (Provisions), SKU program math (Living)… |
| Visual chrome | component | livery tokens (Mister inherits `--accent`, `--surface-1`) |
| Register | same character | Machinery Mister: workshop-pragmatic. Interiors Mister: design-fluent procurement consultant. Provisions Mister: quantities-and-incoterms broker. |

Technically: one `mister` package, one API, `data-lane` passed as context, per-lane prompt fragments stored in Supabase so you can iterate knowledge packs without redeploying. Mister is the same person walking through six warehouses — he changes his vocabulary, never his character.

### 5.2 The Container Visualizer — the family crest in motion

This is the ecosystem's signature interactive and the one component worth real WebGL investment. One 3D container, six cargo sets:

- Machinery: equipment crates and machines (exists — the fill-meter hero)
- Interiors: furniture crates, slab A-frames, rolled carpets — **and this unlocks a genuinely new product: shared FF&E containers for boutique hotels**, small properties consolidating orders the way "Trae tu grupo" works for machinery. That's not just a visual — it's a revenue mechanic no FF&E competitor in the region offers.
- Provisions: palletized sacks and cartons
- Living: carton stacks by SKU program

Shared component, livery-colored cargo, same fill-meter grammar, same CBM math engine underneath. When a jury member sees the same container fill with velvet lounge chairs on a bone-white page and with machinery on a steel-blue page, the entire brand thesis lands in two seconds without a word of copy.

### 5.3 The manifest-table, the stamp, the RFQ flow

Three more shared organs to build once:

- **ManifestTable** — the family's data voice. Thin rules, mono numerals, hover-flood rows. Used for lane index, product lists, quote line items, container programs.
- **LaneStamp** — the stencil code component with a satisfying "stamp-settle" micro-animation on page load (one frame of overshoot, like a customs stamp landing).
- **RFQFlow** — the wholesale answer to a cart: multi-line quote builder → CBM/MOQ validation → Mister-assisted refinement → WhatsApp/email handoff. Identical flow every lane, livery-skinned.

---

## 6 · Awwwards-Level Execution Notes

**The lane-switch transition.** Moving between lanes is the moment to design like a Site of the Day: a full-viewport livery flood (accent color sweeps with `--ease-gantry`), the outgoing lane code slides out like a container leaving a berth, the incoming stamp lands. 600–800ms, interruptible, `prefers-reduced-motion` collapses it to a crossfade. This single transition teaches the entire brand architecture to every visitor.

**Loading = customs.** Page loads use the stamp-settle: content appears already-laid-out (no skeleton shimmer — this is infrastructure, not an app), the lane stamp lands last.

**Tension per lane, same grammar.** The moment of deliberate tension shifts by livery: Machinery's is the technical blueprint reveal; Interiors' is a single oversized material macro (2-meter-wide marble vein) against disciplined manifest tables; Provisions' is the pallet-count numeral set enormous. Same rule — one loud moment per view — expressed in each lane's voice.

**Numerals are a brand asset.** CBM, MOQ, lead times, HS codes, container counts — set them in a tabular mono, treat them with reverence. Wholesale trade *is* numbers; most B2B sites hide them. You should exhibit them.

**Performance budget.** The visualizer lazy-loads; liveries are pure CSS custom properties (zero JS theming cost); target LCP < 2s on 4G for every lane — procurement buyers in the region are often on mid-tier connections, and Awwwards juries score performance now too.

**What the family refuses:** rounded-soft SaaS aesthetics, carts, retail language ("shop", "buy now"), stock photography, gradient meshes. The refusals are as identity-defining as the choices.

---

## 7 · Rollout Sequence

**Phase 1 — The skeleton + The Manifest.** Extract the shared component library and token architecture from the current site; migrate machinery to `/machinery` under `data-lane="machinery"` (visually near-identical to today — the migration is structural); launch the group homepage with the lane index (lanes 02–06 shown as "OPENING" stamps — announced, not empty).

**Phase 2 — WGT/02 Interiors.** The flagship for the premium positioning and the biggest design lift (photography system, dual taxonomy, spec-sheet mode, Interiors Mister knowledge pack). Launch with a curated first collection rather than the full 100+ product taxonomy — depth over breadth signals taste.

**Phase 3 — WGT/03 Provisions + shared-container extension.** Commodity logic, pallet visualizer cargo set.

**Phase 4 — WGT/04 Living, WGT/05 Representation, WGT/06 Export** — sequenced by commercial readiness; each is now a livery file + content + a Mister knowledge pack, because the skeleton already exists. That's the payoff of the architecture: lane four costs a fraction of lane one.

---

## 8 · Decisions Needed From You

1. **Áladín ↔ WGT/06:** endorsed standalone brand or folded lane? (Affects corporate structure and the UK visa narrative — worth its own session.)
2. **Interiors accent:** brass (#9A6B3F) or oxblood (#6B2A2A)? Both tested against bone ground in the design sprint.
3. **Interiors display type:** shared variable family in "editorial posture," or the serif exception?
4. **Lane naming language:** English lane names site-wide with Spanish content, or bilingual lane names? (Your buyers span LatAm Spanish and international English; recommend English codes/names + full ES/EN content i18n, consistent with the Áladín next-intl pattern.)
5. **Representation roster:** which foreign principals are contractually confirmed enough to publish at launch?

---

*One skeleton. Six liveries. Every lane the same box, painted for its cargo — and every lane compounding trust into the same house.*
