# WINGS GLOBAL TRADE — BRAND TO 100/100
## Implementation Plan
**Baseline composite: 48/100 · Target: 100/100 · Date: June 2026**

---

## THE ARCHITECTURE

Ten dimensions. Seven workstreams. Four dependency layers.

```
LAYER 0 — Foundation (blocks everything)
  └── Visual thesis · Logo reconstruction · Brand standards

LAYER 1 — Digital product + Communication (run in parallel, no dependency on each other)
  ├── REBUILD-100 phases 0–8 (product page)
  ├── Document design (TPR ficha, email, WhatsApp)
  └── Cross-page intelligence system

LAYER 2 — Content + Physical (runs after Layer 1 data layer is live)
  ├── 6 commercial lead magnets
  ├── Photography brief + execution
  └── Physical brand (TPR print artifact, trade show)

LAYER 3 — Campaign (runs last, requires everything else to exist)
  └── Campaign concept → execution → cultural contribution
```

---

## LAYER 0 — FOUNDATION
**Blocks all other work. Do this first.**

---

### 0.1 — State the Visual Thesis

**Current score impact:** Visual Thesis Clarity: 42 → 80

**What to produce:** A single internal document (`WINGS_VISUAL_THESIS.md`) containing:

```
VISUAL THESIS:
"Import intelligence should read like a certified document, not a marketplace listing."

WHAT THIS MEANS FOR EVERY VISUAL DECISION:
- Typography: monospace for all data (invoices, not marketing copy)
- Color: navy = authority, gold = precision annotation, warm white = paper/document
- Layout: structured, information-dense, not atmospheric
- Imagery: operational context, not product photography
- Motion: instruments don't bounce — ease only, no spring, no bounce
- Language: specific over generic, periods not exclamations, declarative

THE TEST: Does this look like a certified document or a marketplace listing?
If marketplace listing: redesign or remove.
```

**Also define what Wings refuses:**
- Gradient backgrounds
- Stock photography of handshakes
- "Productos de calidad" generic copy
- Rounded-pill buttons
- Decorative animation that carries no data
- Anything that looks like Alibaba, Mercado Libre, or a typical LATAM B2B portal

**Effort:** 1 day · **Owner:** Muaaz · **Tool:** Write to `spec/WINGS_VISUAL_THESIS.md`

---

### 0.2 — Logo Geometric Reconstruction

**Current score impact:** Logo / Mark Quality: 35 → 85

The wings mark needs to be rebuilt from a grid, not from CorelDRAW organic paths. This requires a designer, not a developer. The brief:

**Brief for designer:**

```
WINGS GLOBAL TRADE — LOGO RECONSTRUCTION BRIEF

Current state: Organic CorelDRAW paths. No mathematical construction.
Collapses at small sizes. No documented proportional system.

Required output:
1. Primary mark — geometrically reconstructed
   - Every curve must have a defined radius
   - Every proportion must be derivable from a base unit (suggest: 8pt grid)
   - The wing silhouette must remain — it is the concept
   - May be simplified (fewer path segments) for cleaner small-scale behavior

2. Variation set (mandatory):
   a. Primary: mark + WINGS wordmark (horizontal)
   b. Primary stacked: mark above wordmark (vertical)
   c. Wordmark only: WINGS in Flexo medium, custom-spaced
   d. Mark only: isolated symbol
   e. Reversed: white on navy
   f. Single-color navy: all contexts where gold not available
   g. Favicon: 16×16, 32×32 simplified mark
   h. Minimum size: define at what pt size logo must switch to wordmark-only

3. Clear space rule: minimum margin = cap height of the W letterform

4. Delivery: SVG (not AI, not CorelDRAW) · Each variation as separate file

BRAND COLORS:
Navy: #001E50 · Gold: #C4933F · Warm White: #F8F6F0

DESIGN REFERENCES (spirit only, not copy):
- Lufthansa mark (geometric precision, aviation, authority)
- Maersk wordmark (global trade, direct, no decoration)
- Lloyd's of London certification marks (document, seal, authority)
```

**Effort:** 2–3 weeks designer time · **Cost:** External engagement · **Dependency:** Visual thesis must be documented first

---

### 0.3 — Brand Standards Document

**Current score impact:** Communication System: 48 → 65 · Behavioral Consistency: 65 → 80

**What to produce:** `WINGS_BRAND_SYSTEM.md` (extends existing spec) with:

**Section 1 — The thesis** (from 0.1)

**Section 2 — Logo usage** (from 0.2, once complete)

**Section 3 — Typography codified**

The three-typeface logic formalized:

```
IBM Plex Serif = Precisión
  Use for: product names, section headlines, passport headers, ficha técnica titles
  Never use for: body copy, UI labels, data values, buttons

Flexo = Proximidad
  Use for: all body copy, UI elements, navigation, buttons, form fields
  Never use for: data values, prices, spec numbers, HS codes

DM Mono = Confianza
  Use for: ALL numbers (prices, HP, specs, HS codes, CIF values, transit times)
  Never use for: narrative copy, headlines, CTAs
  Rule: if it's a measurement, it's DM Mono. No exceptions.
```

**Section 4 — Color semantic roles**

```
Navy #001E50:
  - Document backgrounds
  - Section headers
  - Navigation
  - Authority surfaces

Gold #C4933F — two uses ONLY:
  SEMANTIC: CTAs, captured-field indicators, key data highlights (CIF total, peak HP)
  EXPRESSIVE: Certification marks, gold rules, provenance ribbon

  NOT for: decorative use, backgrounds, large surfaces

Warm White #F8F6F0:
  - Page backgrounds
  - Text on navy
  - Paper/document surfaces
  ALSO as mark: thin rules on navy, annotation text at low opacity

  Rule: warm white on navy = document. Never use pure white on navy.
```

**Section 5 — Copy rules** (already documented in CLAUDE.md — move here as authority source)

**Section 6 — What Wings never says/shows**

**Effort:** 2 days · **Tool:** Write to `spec/WINGS_BRAND_SYSTEM.md`

---

## LAYER 1A — DIGITAL PRODUCT REBUILD
**Run in parallel with Layer 1B and 1C.**

This is fully documented in `Creative Intelligence - Wings/REBUILD-100.md`. Execute it exactly as specified.

**Summary of phases and score targets:**

| Phase | Work | Score Before | Score After | Effort |
|-------|------|:---:|:---:|:---:|
| Phase 0 | `product-intelligence.ts` + DB migration | 27 | 27 | 0.5d |
| Phase 1 | Replace CellularAutomaton + WaveformOverlay | 27 | 42 | 3d |
| Phase 2 | SpecFingerprint: values + comparison + percentiles | 42 | 56 | 2d |
| Phase 3 | Logistics intelligence: ProvenanceRibbon + TradeRouteAnimation | 56 | 68 | 3d |
| Phase 4 | TradeIntelligenceLine + FieldReport API | 68 | 78 | 4d |
| Phase 5 | Blueprint Mode as data layer | 78 | 88 | 3d |
| Phase 6 | Passport + AuthenticationMark + TechnicalSilhouette | 88 | 94 | 3d |
| Phase 7 | ImportReadinessMeter + NoiseField + JumpNavigation | 94 | 100 | 2d |
| Phase 8 | Verification pass | — | confirmed | 1d |

**Execution order:**
1. Phase 0 first (30 min — creates `product-intelligence.ts`)
2. Phases 1, 2, 3, 4, 6 in parallel (different files, no conflicts)
3. Phase 5 after Phase 0 + Phase 2 both done
4. Phase 7 after Phase 1 done
5. Phase 8 last

**Activation:** Copy each phase's activation prompt verbatim from `REBUILD-100.md` into a Claude Code session.

**Total estimated effort:** ~20 developer-days

---

## LAYER 1B — COMMUNICATION SYSTEM DESIGN
**Run in parallel with Layer 1A.**

**Score impact:** Communication System: 48 → 88

---

### 1B.1 — WhatsApp Notification Design

Every lead submission fires a WhatsApp message to Wings ops within 30 seconds. This is the highest-frequency brand touchpoint. Currently it's functional plain text. It needs to look like Wings.

**Define the notification format:**

```
WINGS GLOBAL TRADE · NUEVA CONSULTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REF · WGT-2847
TIPO · Catálogo / Accio Engine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCTO  John Deere 5E-1104
CANTIDAD  3 unidades
DESTINO   Arequipa, Perú
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACTO  Carlos Mendoza
EMPRESA   Agropecuaria del Sur SAC
TELÉFONO  +51 984 XXX XXX
EMAIL     c.mendoza@agrsur.pe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECIBIDO  2026-06-20 · 14:37 PET
RESPUESTA ESPERADA < 24H
```

Implement in `src/lib/notifications/whatsapp.ts` — replace raw string interpolation with the structured template above.

**Effort:** 2h · **File:** `src/lib/notifications/whatsapp.ts`

---

### 1B.2 — Email Notification Design

Same discipline applied to the email that fires alongside WhatsApp. The email is the formal record — it needs to look like a trade document.

**Design spec:**
- Header: navy (#001E50), WINGS wordmark in warm white, "NOTIFICACIÓN DE CONSULTA" in DM Mono 10px gold uppercase
- Body: warm white background, two-column data layout (label / value in DM Mono)
- Sections mirror the WhatsApp format but expanded: product specs, inquiry details, contact, timestamp, WGT reference
- Footer: navy, "Wings Global Trade · Precisión. Proximidad. Confianza." · thin gold rule above footer
- No decorative elements. No images except logo. No gradients.

Implement in `src/lib/notifications/email.ts` using the Resend HTML template.

**Effort:** 4h · **File:** `src/lib/notifications/email.ts`

---

### 1B.3 — The Ficha Técnica PDF (TPR Document)

The single highest-impact physical brand touchpoint. When Accio delivers a CIF estimate, the buyer can download a Ficha Técnica.

**Design spec:**

```
PAGE 1 — FICHA TÉCNICA

HEADER (navy band, full width):
  Left: WINGS logo mark (white)
  Center: "FICHA TÉCNICA DE IMPORTACIÓN" DM Mono 8px warm-white uppercase
  Right: "REF · WGT-2847" DM Mono 8px gold

DOCUMENT IDENTITY (perforated edge CSS at top, warm white background):
  Product name: IBM Plex Serif 24px navy
  Category badge: DM Mono 9px navy, bordered
  Authentication mark: top-right corner (certification seal SVG)
  "BORRADOR" watermark at 4% opacity (changes to "CONFIRMADO" when CIF confirmed)

PROVENANCE RIBBON: full-width SVG showing origin → port → ZOFRATACNA → destination
  Named ports + transit days per leg (from product-intelligence.ts)

SPECIFICATIONS TABLE: two-column DM Mono grid
  All specs, no filtering. Gold values for HP and GVW.

CIF ESTIMATE PANEL (navy background):
  All CIF rows in DM Mono: FOB · Flete · Seguro · CIF · Arancel
  CIF total in gold at 18px
  "ZONA FRANCA · ZOFRATACNA" row with gold background tint

FOOTER: thin gold rule + DM Mono 8px · "Referencia preliminar. Sujeto a confirmación. · Wings Global Trade · wingsglobaltrade.com"
```

Implement as a server-rendered HTML page with print CSS at `/api/accio/ficha?ref=WGT-2847`.

**Effort:** 3 days · **Files:** New API route + print CSS

---

### 1B.4 — Wings Data Strip Component

```typescript
// src/components/shared/WingsDataStrip.tsx
// Full-width 28px DM Mono ticker at 9px text-navy/20
// Content: CATÁLOGO ACTIVO · 50+ MODELOS · NH · JD · MF · KUBOTA · ZOFRATACNA · ZOFRI · RESPUESTA < 24H
// Static or very slow 40s horizontal scroll
// Placed before every major CTA section
```

**Effort:** 2h · Brand reassurance at every page transition.

---

### 1B.5 — LinkedIn Post Template

```
Visual format:
- Navy card background
- IBM Plex Serif headline (the insight)
- DM Mono data value (the number that makes the insight real)
- Thin gold rule separator
- Wings wordmark bottom-right
- No stock photos. If imagery: technical silhouette SVG or radar chart screenshot.

Copy format:
[Data point that surprises the reader.]
[What that means for an importer.]
[What to do about it.]
Wings Global Trade · wingsglobaltrade.com
```

**Effort:** 1 day (design template + first 3 posts)

---

## LAYER 1C — CROSS-PAGE INTELLIGENCE SYSTEM
**Run in parallel with Layer 1A and 1B.**

**Score impact:** Behavioral Consistency: 65 → 90 · Communication System: 88 → 95

---

### 1C.1 — Wings Reference Thread (WGT-####)

Every interaction generates a persistent reference number. A buyer who submits on Monday and returns on Friday sees: "Consulta activa · WGT-2847."

**Implementation:**

```typescript
// src/lib/reference.ts
// generateWGTRef(): string — produces WGT-XXXX (4-digit, zero-padded)
// Stored in localStorage + Supabase leads/accio_projects tables (already exist)
// Read on every page load from localStorage

// src/components/shared/ActiveReferenceChip.tsx
// Renders: "Consulta activa · WGT-2847" in top-right of hero areas
// Quiet — DM Mono 9px, navy/40, no emphasis
// Links to /contacto?ref=WGT-2847 for status follow-up
```

**Effort:** 1 day

---

### 1C.2 — Context Handoffs Between Pages

```
/proceso CTA → /cotizar?category=[last-scrolled-category]
/cotizar abandoned → /contacto?intent=specification
/contacto message with product name → Accio CTA shows ?context=[detected-product]
```

Wire in `src/lib/routing.ts` alongside the existing `detectSearchIntent()`.

**Effort:** 1 day

---

## LAYER 2A — COMMERCIAL ASSETS (6 LEAD MAGNETS)
**Starts after Phase 0 of REBUILD-100 is complete (product-intelligence.ts exists).**

All 6 lead magnets are fully specified with activation prompts in `Creative Intelligence - Wings/COMMERCIAL-ASSETS-LEAD-MAGNETS.md`. Execute in priority order:

| # | Asset | Activation | Effort | Funnel Position |
|---|-------|-----------|:---:|:---:|
| 1 | HP en Altitud Calculator | Paste Prompt 01 → new Claude session | 2h | Evaluation |
| 2 | Timeline China → ZOFRATACNA | Paste Prompt 05 → new Claude session | 1.5h | Planning |
| 3 | Checklist de Preparación | Paste Prompt 06 → new Claude session | 1h | Pre-conversion |
| 4 | Guía de Aranceles ZOFRATACNA | Paste Prompt 02 → new Claude session | 2h | Finance/CFO |
| 5 | Manual de Campo | Paste Prompt 04 → new Claude session | 4h | Post-inquiry |
| 6 | Radar de Comparación | Paste Prompt 03 → new Claude session | 3h | Comparison |

**Output directory:** `/lead-magnets/`

**Placement wiring** (after lead magnets are built):
- HP Calculator → product page below EnginePowerBand, maquinaria-agricola category banner
- Timeline → homepage trust bar, Accio Engine intro
- Checklist → exit-intent trigger, email retargeting
- Guía Aranceles → /contacto footer, Accio Engine completion screen, Google SEO
- Manual de Campo → post-inquiry email sequence (day 2)
- Radar Comparación → comparison bar, LinkedIn sponsored

**Score impact:** Campaign & Cultural Contribution: 25 → 60 · Thought Leadership: 70 → 85

---

## LAYER 2B — PHOTOGRAPHY BRIEF
**Can run in parallel with 2A.**

**Score impact:** Behavioral Consistency: 90 → 98 · Visual Thesis Clarity: 80 → 92

```
WINGS GLOBAL TRADE — PHOTOGRAPHY BRIEF

DIRECTION: Operational authority. A field inspector's camera, not a catalog photographer's.

WHAT WE SHOOT:
1. Machinery in Andean terrain
   - Tractors on highland agricultural land (Junín, Puno, Cajamarca)
   - Altitude visible: mountains in background, not studio walls
   - No perfect golden hour. Correct exposure. Real sky.
   - The machine is working, or about to work. Never posed.

2. Operators (human presence)
   - Agricultural workers, logistics managers, procurement directors
   - Shot from their level, not above
   - Working: reviewing a spec sheet, talking to a foreman, loading
   - No stock-photo handshakes. No suits in front of factories.

3. Technical details
   - Engine compartment, hydraulic connections, spec plates
   - Shot like product documentation: flat light, clean background, neutral
   - These are the images for product detail pages — reference, not marketing

4. Free zone infrastructure
   - ZOFRATACNA facility (if access available)
   - Containers, documentation, customs process

WHAT WE DO NOT SHOOT:
- White background product photography
- Composite/render/AI-generated images
- Generic "logistics" stock (people at laptops, generic ports, handshakes)
- Anything that could appear on any supplier's website

COLOR TREATMENT:
- No heavy grading. Accurate color rendering.
- Navy and warm-toned natural light where possible.
- If post-processing: subtle — increase contrast, reduce saturation slightly, never boost.

FORMAT:
- Primary: landscape 16:9 for hero sections
- Secondary: 4:3 for product cards
- Tall: 4:5 for LinkedIn / mobile hero

MINIMUM VIABLE PHOTOGRAPHY SESSION:
- 1 day in the field (Junín or Puno for altitude context)
- 3–5 machines photographed
- 2–3 operators photographed
- 20–30 usable selects
```

**Effort:** 1 photography day + 1 post-processing day · **When:** After logo reconstruction

---

## LAYER 2C — PHYSICAL BRAND
**Score impact:** Materiality & 3D Expression: 8 → 65

---

### 2C.1 — Ficha Técnica as Print Artifact

The PDF designed in 1B.3 becomes a print artifact. Spec:
- Paper: 100gsm matte stock (not glossy)
- Size: A4
- Print: two-color (navy + gold) or full-color on warm white stock
- Wings authentication mark stamped or foil-stamped on corner if budget allows
- Use: accompanying physical machinery shipments, sent to finance teams for approval

This requires only the PDF from 1B.3 and a print vendor relationship. No new design work.

---

### 2C.2 — Trade Show Concept

```
WINGS TRADE SHOW BOOTH BRIEF

CONCEPT: "The Technical Briefing Room"
Not a product display. A documentation environment.

SURFACES:
- Back wall (3m wide): navy, full-height print
  Left panel: Wings logo + "Importación de maquinaria vía ZOFRATACNA" in IBM Plex Serif
  Center panel: Technical Silhouette of a tractor at 2m height, warm-white monoline on navy
  Right panel: HP en Altitud table printed large — the data gift that earns attention

- Counter (1.2m): navy wrap, gold edge detail, DM Mono label "CONSULTAS TÉCNICAS"
  On counter: printed Ficha Técnicas for 6 key products, HP Calculator reference cards

- Screen (65" if available): product detail page running Blueprint Mode — live demo

MATERIALS:
- No vinyl banners. Fabric or dibond print only.
- Handout: A5 laminated reference card, HP altitude table one side, ZOFRATACNA timeline reverse

WHAT WINGS DOES NOT DO AT A TRADE SHOW:
- Branded pens, lanyards, tote bags
- Animated screens playing product videos
- Generic "meet us" signage
```

**Effort:** Brief takes 1 day. Execution: print vendor + 3 days design file preparation.

---

## LAYER 3 — CAMPAIGN
**Requires Layer 0, Layer 1A (rebuilt product page), Layer 2B (photography).**

**Score impact:** Campaign & Cultural Contribution: 25 → 85 · Overall Award Potential: 38 → 80

---

### 3.1 — Campaign Concept

**The campaign hook: Wings knows things your broker doesn't.**

This is not a tagline replacement — it's the campaign position that demonstrates the tagline. "Precisión" is the brand promise. This campaign is the proof.

**Campaign anchor: altitude HP correction**

```
CAMPAIGN CONCEPT: "Lo que su broker no le dice antes de comprar"

EXECUTIONS:

Execution 1 — LinkedIn sponsored post:
"Un tractor de 100 HP entregado en Lima llega con 79 HP efectivos en Puno.
Nadie se lo dijo antes de firmar.
Wings lo calcula antes de que usted cotice."
[Link to HP Calculator lead magnet]

Execution 2 — Trade press editorial (Agronoticias Peru, Minería Peruana):
Article: "La pérdida de potencia en altitud: el costo que nadie presupuesta"
Author: Wings Global Trade (thought leadership byline)
Content: the formula, a table, two real case scenarios, Wings as the platform that makes this visible

Execution 3 — Product page as campaign asset:
The Blueprint Mode toggle reveals altitude-corrected HP for the buyer's region.
"Haga clic en 'Modo Técnico' para ver la potencia real de este equipo en su región."
Works only after REBUILD-100 Phase 5 is complete.
```

---

### 3.2 — Thought Leadership Content Calendar

12 months of content, one piece per month. All sourced from data Wings already has:

| Month | Piece | Source Data | Format |
|-------|-------|-------------|--------|
| Jul | Altitude HP loss table for 10 top tractors | product-intelligence.ts | LinkedIn + PDF |
| Aug | ZOFRATACNA arancel guide 2026 | duty-rates.ts | PDF lead magnet |
| Sep | Transit time comparison: China vs. India vs. Thailand | TRANSIT_DAYS lookup | LinkedIn visual |
| Oct | Tractor radar comparison (top 8) | SpecFingerprint data | PDF lead magnet |
| Nov | What Euro II vs. Euro III means for Peru compliance | detectCertifications() | Editorial |
| Dec | Year in review: Wings ZOFRATACNA import data (aggregated) | Supabase accio_projects | Annual report |
| Jan | Container type guide: when to use 20ft vs 40ft HQ | inferContainerType() | LinkedIn |
| Feb | How to read a Bill of Lading: the 6 fields that matter | Accio Engine TPR | Editorial |
| Mar | HP requirements by application: sierra agriculture | altitude + spec data | Calculator |
| Apr | ZOFRI vs. ZOFRATACNA: which corridor for your destination | routing logic | Comparison guide |
| May | Top spec errors buyers make (based on aggregated TPR data) | Anonymized Supabase | Editorial |
| Jun | State of LatAm machinery imports (YOY data) | Aggregated Supabase | Annual intelligence report |

**Effort:** 4h per piece (most supported by existing data)

---

## SCORE PROJECTION BY WORKSTREAM COMPLETION

| Dimension | Baseline | After Layer 0 | After Layer 1 | After Layer 2 | After Layer 3 | Final |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| Visual Thesis | 42 | **80** | 80 | 92 | 95 | **95** |
| Logo | 35 | 35 | 35 | **85** | 85 | **85** |
| Typography | 78 | **85** | 85 | 85 | 85 | **85** |
| Color System | 72 | **80** | 80 | 85 | 85 | **85** |
| Communication | 48 | 55 | **90** | 95 | 95 | **95** |
| Materiality | 8 | 8 | 20 | **65** | 65 | **65** |
| Behavioral | 65 | **75** | 92 | **98** | 98 | **98** |
| Campaign | 25 | 25 | 30 | 50 | **85** | **85** |
| Thought Leadership | 70 | 70 | 80 | **90** | **95** | **95** |
| Award Potential | 38 | 45 | 65 | 75 | **88** | **88** |
| **Composite** | **48** | **56** | **76** | **87** | **97** | **97** |

*Note: 100/100 composite requires the logo reconstruction to reach 100. At 85 for logo, the weighted composite lands at 97. Logo is the hardest item — it requires external execution and time. 97 is achievable within 6 months. 100 requires the logo to be done.*

---

## EXECUTION TIMELINE

```
JUNE 2026 (this month)
  Week 3: Layer 0 complete (thesis + brand doc, 3 days)
           REBUILD-100 Phase 0 begins (product-intelligence.ts)

  Week 4: REBUILD-100 Phases 1–4 in parallel
           WhatsApp + email notification design (1B.1, 1B.2)

JULY 2026
  Week 1: REBUILD-100 Phases 5–8
           Ficha Técnica PDF design (1B.3)
           Wings Data Strip + Reference Thread (1B.4, 1C.1, 1C.2)

  Week 2: Lead magnets 1–3 built (HP Calculator, Timeline, Checklist)
           Photography brief finalized

  Week 3: Lead magnets 4–6 built
           Campaign concept finalized

  Week 4: Photography day (field session)
           Logo reconstruction brief sent to designer

AUGUST 2026
  Week 1–2: Post-processing photography
             LinkedIn template + first 3 posts live
             Thought leadership content calendar begins

  Week 3–4: Trade show concept designed (if EXPOALIMENTARIA target)
             Logo reconstruction in progress with designer

SEPTEMBER 2026
  Logo received from designer + reviewed
  Trade show materials finalized if needed

OCTOBER 2026
  Campaign live: altitude HP post series begins
  EXPOALIMENTARIA if attending
  Full brand review: score all 10 dimensions against targets
```

---

## WHAT TO DO TOMORROW

In order:

1. **Write `spec/WINGS_VISUAL_THESIS.md`** — 2 hours. This unblocks every downstream decision.
2. **Run REBUILD-100 Phase 0** — 30 minutes. Creates `product-intelligence.ts`. Unblocks Phases 1–4.
3. **Run REBUILD-100 Phases 1, 2, 3, 4 in parallel** — spin up 4 Claude Code sessions simultaneously, one per phase activation prompt.
4. **Write the WhatsApp notification template** — 2 hours. Highest-frequency touchpoint.
5. **Brief a designer on the logo** — 1 hour to write the brief. Longest lead time item — start it now.

Everything else follows from these five actions.

---

*Implementation Plan: Wings Global Trade · Brand to 100/100 · June 2026*
*References: brand-universe audit · REBUILD-100.md · IA-AUDIT-2026-06-19.md · COMMERCIAL-ASSETS-LEAD-MAGNETS.md*
