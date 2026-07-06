# WINGS NETWORK — INTERACTIVE TOOLS STACK
### Prototype Artifacts → Embedded Marketing Instruments
*Companion to WINGS_MARKETPLACE_STRATEGY.md and the programs/network build package.*

---

# PART 1 — THE TWO-RUNTIME ARCHITECTURE

Every tool in this document lives twice. Same component logic, two runtimes:

```
RUNTIME A — ARTIFACT (Claude artifacts)          RUNTIME B — REPO (wings-global-trade)
─────────────────────────────────────           ─────────────────────────────────────
Purpose: prototype feel, test math,             Purpose: production embed — marketing
pressure-test copy, demo to founders/           pages, /tools/* lead magnets, portal,
suppliers in a WhatsApp screen-share            buyer site, campaign share cards

React 18 · shadcn/ui · recharts · d3           Next.js 15 RSC · Wings tokens · GSAP/
lucide-react · mathjs · in-memory state         Lenis · Supabase (live data + Realtime)
window.storage for session persistence          Server Actions capture · PostHog · OG
Anthropic API (sonnet-4-6) for AI tools         image pipeline · WhatsApp share layer
Fixture data (JSON, mirrors schema)             Live data via typed db helpers
rAF/CSS spring tweens (no GSAP here)            GSAP timeline tweens (DESIGN_SYSTEM spec)
```

## The Graduation Contract (how an artifact enters the repo unchanged in spirit)

Each tool is built against a **shared data contract** — a Zod schema that exists identically in the artifact fixtures and in `src/lib/schemas/`. Graduation = swap the data source and the tween engine; the component tree, math, and copy move verbatim.

| Concern | Artifact | Repo | Contract |
|---|---|---|---|
| Data | JSON fixtures | Supabase queries/Realtime | Same Zod schema both sides |
| Motion | rAF spring / CSS transition | GSAP timeline | Same durations/easings, named in tokens (`--tween-fill: 600ms ease-out`) |
| Money | Integer cents + formatter | `lib/money` (Big.js) | Same formatter signatures; floats never touch money in either runtime |
| Capture CTA | Logs to console/storage | Server Action (`createDemandRequest` / `createApplication`) | Same payload schema |
| AI calls | `api.anthropic.com` direct (keyless artifact runtime) | `/api/mister/*` server-side | Same tool/output JSON schemas |
| Analytics | Stub `track()` | PostHog | Same event taxonomy (Part 4) |

## The Doctrine: Every Tool Is a Demand Sensor

These are not widgets; they are **precision lead magnets** (specificity converts; the tool must solve one urgent, expensive question in under 3 minutes). Two laws applied everywhere:

1. **Pre-sell effect** — each tool reveals the insight ("you'd save X sharing a container" / "your leads are worth Y") whose *implementation* is the Wings offer.
2. **Capture at the moment of insight** — every tool ends in exactly one CTA, wired to the demand-gap or application funnel. A calculator result nobody captured is marketing spend with no receipt.

---

# PART 2 — THE THREE NAMED ARTIFACTS (FULL STACK)

## 2.1 FillMeter Prototype

**Purpose:** lock the tween feel, both variants, and the share-card render before Wave 3 builds it in GSAP. The hero object of the entire brand gets prototyped like a hero object.

**Stack (artifact):** React + shadcn/ui shell · custom rAF spring for the fill tween (stiffness/damping exposed as sliders in a dev panel) · lucide icons · `window.storage` to persist tuning values between sessions · fixture: `containers_fill_view` rows as JSON.

**Component anatomy:**
```
<FillMeter variant="buyer|supplier" data={FillState} mode="live|static">
  ├── LaneLabel            (consolidation point + route)
  ├── CapacityBar          (tweened width; delta animates from previous value —
  │                         never jump-cuts; reduced-motion → instant + fade)
  ├── FillReadout          (mono, tabular numerals, % + CBM)
  ├── CutoffCountdown      (--net-cutoff color when < 7 days)
  └── CTASlot              buyer: "Trae tu grupo — reserva tu espacio"
                           supplier: "Este lane llena cada N días — reserva tu slot"
```
**Prototype-only extras:** simulation controls (inject random slot events to watch the tween under realistic churn) · tuning panel (duration, easing, overshoot) · `mode="static"` render for the share-card frame (Part 3.5 consumes this).

**Graduation:** rAF spring → GSAP tween with the tuned values written into DESIGN_SYSTEM tokens; fixture → Supabase Realtime channel; CTA → slot flow. The tuning panel's final values are the deliverable.

## 2.2 Tier Pricing Calculator

**Purpose:** internal stress-test of the Layer 3 pricing structure — and the engine that later powers its public-facing sibling (the Supplier ROI calculator, 3.3). One math core, two skins.

**Stack:** React + shadcn/ui forms · recharts (sensitivity curves) · integer-cents math via a tiny decimal helper (mathjs for elasticity curves only — never for money totals) · `window.storage` to save named scenarios · no AI needed.

**Model inputs → outputs:**
```
INPUTS  tier fees (T1–T3, monthly/annual) · expected Mister-routed leads/mo by tier
        lead→conversation→shipment conversion (from Phase 1 actuals; sliders until then)
        avg shipment value · commission bands by tier · consolidation fee/CBM
        supplier's alternative CAC per corridor lead (the anchor)
OUTPUTS per-tier: supplier ROI multiple · breakeven leads/mo · Wings revenue/supplier
        (subscription + expected commission) · LTV:CAC vs the >4 target
        SENSITIVITY: fee × conversion heat grid — where the "no-brainer" zone lives
        RULE CHECKS (from strategy, rendered as pass/fail):
        · T2 fee < cost of routed leads delivered? (Layer 3.2 pricing posture)
        · MRR-vs-ops crossover at N suppliers? (Phase 2 exit gate)
```
**Graduation:** the math core (`lib/pricing-engine.ts`) ships to the repo; internal skin stays an ops page; public skin becomes /tools/roi-proveedor (3.3).

## 2.3 Mister Routing Simulator (AI-powered artifact)

**Purpose:** feel branch 1–4 behavior and lane-conditioning conversationally before Wave 5 exists — and author the eval-suite fixtures while doing it. Every simulator session that produces a wrong-feeling route becomes an eval case.

**Stack:** React chat UI (streaming) · Anthropic API from the artifact runtime (`claude-sonnet-4-6`, keyless) · full conversation history resent each turn (artifact statelessness rule) · fixture pack mirroring the schema: Direct catalog (12 SKUs), Network suppliers (8, mixed tiers/verification incl. traps: an unverified supplier, a reserved-line listing, a T1 without routing rights), categories, lanes, live-ish fill states.

**The critical design decision — filters in code, exactly like production:** the model never receives the raw supplier pool. A JS `matchSupply()` replicates the SQL RPC (tier ≥ network, verified, category open, non-reserved, lane-compatible) and only qualified candidates enter the prompt. The simulator proves the *architecture*, not just the prose.

```
Per turn:
1. UI collects buyer message + selected archetype lane (or "auto-detect")
2. JS pre-filter builds candidates: searchDirect() → matchSupply() → nearMatch()
3. System prompt = Mister persona + lane-conditioned block + routing precedence
   + ONLY the pre-qualified candidates + current fill states
4. Model must return: reply_es + RoutedLeadEvent JSON (the exact API_MAP schema)
5. UI validates the event (Zod-equivalent), renders a ROUTING TRACE panel:
   branch chosen · candidates considered · why each was in/out · tie-break shown
6. [Export as eval case] button → downloads the turn as a fixture file
   for evals/mister/ (input, expected branch, expected supplier set)
```
**Adversarial mode:** one click injects the trap prompts (reserved-line probe, "just give me any supplier" bait, hallucinated-supply pressure) — the simulator is the eval suite's authoring environment.

**Graduation:** prompts + lane blocks + the trace format move into `src/lib/mister/`; exported cases seed `evals/mister/`. The simulator itself stays alive as an internal QA artifact forever.

---

# PART 3 — THE EMBEDDED MARKETING TOOL CATALOG

Each entry: the urgent question it answers · runtime path · capture wiring. All Spanish-first, WhatsApp-shareable, mobile-first (corridor reality: these get used on phones, in warehouses).

## 3.1 Calculadora "Trae tu grupo" — Shared-Container Savings *(buyer hero tool)*
- **Question:** "¿Cuánto ahorro compartiendo contenedor vs. importar solo?"
- **Math:** solo-import fixed costs vs. pro-rated shared-container slot cost at current fill levels; pulls live fill % in repo runtime so the answer references a *real* container ("El contenedor de Iquique está al 68% — tu slot costaría…").
- **Stack:** calculator core (integer cents) + FillMeter(static) inline + recharts savings bar.
- **Capture:** result → "Reserva tu espacio" → WhatsApp deep-link with the result pre-filled + `demand_gaps` write. **This is the marketing strategy's Section 11 mechanic as software** — the shareable savings result is the viral unit.

## 3.2 Costo Puesto en Destino — Landed-Cost Calculator
- **Question:** "¿Cuánto me cuesta realmente traer esto por Tacna/Iquique?" (the most-Googled question in the category — SEO/AEO anchor tool)
- **Math:** FOB value + freight + consolidation + zone handling + duties/IGV bands per category + last-mile = landed unit cost. Category presets from `categories`. Disclaimered as estimate; counsel-reviewed bands.
- **Capture:** "Mister te confirma el cálculo exacto" → WhatsApp handoff with inputs attached (a perfectly qualified lead, self-diagnosed).

## 3.3 ROI Proveedor — Vende con Wings Calculator *(public skin of 2.2)*
- **Question:** "¿Qué valen los compradores del corredor para mí?"
- Inputs simplified to five fields; output: ROI multiple + breakeven leads + founder-pricing banner. Lives on /vende as the landing's proof engine.
- **Capture:** result → application form pre-filled with category + volume expectations.

## 3.4 Estimador de Slots (CBM Calculator)
- **Question:** "¿Cuántos slots necesita mi mercadería?" — dimensions/pallets → CBM → slots → cost at current rate card. Embedded in /vende, the portal SlotPicker, and the buyer container page. The quiet workhorse that removes the #1 friction question before every reservation.

## 3.5 Generador de Share-Cards del Fill-Meter
- **Purpose:** turn every container milestone into a campaign asset. FillMeter `mode="static"` → branded card (fill %, lane, cutoff, savings line) → OG image endpoint + downloadable PNG → WhatsApp Status / Meta placements. n8n W-M5 auto-generates cards on state transitions and feeds the existing Meta ad automation stack. **The economic health metric literally renders itself into ads.**

## 3.6 Autoevaluación Wings Verified — Supplier Readiness Quiz
- **Question:** "¿Calificaría mi empresa?" — 8–10 questions mirroring the Level 1–2 verification stack → readiness score + gap list + "what to prepare."
- **Identity-signal magnet:** completing it is a self-selection act; the gap list pre-sells the audit (Tier 1's product). Capture: score → application with answers attached (vetting starts pre-filled — the quiz IS intake).

## 3.7 Generador de Fichas Técnicas — AI Spec-Sheet Generator *(AI-powered)*
- **Question (supplier):** "¿Cómo se vería mi producto en formato Wings?"
- Paste rough product info / upload a PDF → sonnet-4-6 extracts to the `listings.spec` JSON schema (validated) → renders the blueprint SpecSheet live → watermark "Vista previa — Wings Network."
- **Pre-sell at maximum power:** the supplier sees their product already living in Wings' trust format; publishing it requires Tier 1. Capture: "Publícala en Wings" → application with the generated spec attached (listing onboarding starts done).

## 3.8 Radar de Demanda — Demand Receipts Board
- Anonymized, aggregated `demand_gaps` as a live heat view (category × week × volume signal). The Layer 9 "demand receipts" pitch as a self-serve, always-current instrument on /vende — proof nobody in the corridor can fake. Strict aggregation floor (no cell renders below k requests; the data firewall applies to marketing too).

## 3.9 Countdown de Cierre — Cutoff Widget
- Minimal embeddable: lane, fill %, days-to-cutoff. Iframe/snippet for partner sites and email signatures; the urgency mechanic distilled to its atom. Feeds the urgency archetype lane's context too.

---

# PART 4 — THE EMBED & DISTRIBUTION SYSTEM (repo runtime)

```
app/tools/[tool]/page.tsx      standalone pages — SEO/AEO targets, es-first,
                               OG image per tool, JSON-LD, shareable results URLs
                               (?r=encoded-inputs → server-rendered result state)
app/embed/[tool]/page.tsx      chrome-less iframe variant · postMessage auto-resize
                               · theme param (light/dark) · snippet generator on the
                               tool page ("<iframe src=…") for partners
app/api/og/[tool]/route.tsx    @vercel/og share cards (FillMeter static frames,
                               calculator results) — WhatsApp-preview-first sizing
```

**Event taxonomy (PostHog, identical stub in artifacts):**
`tool_opened {tool, source}` · `tool_completed {tool, result_bucket}` · `capture_submitted {tool, funnel: demand_gap|application}` · `share_generated {tool, channel}` · `embed_loaded {tool, host}`

**Funnel wiring:** every capture flows through the two existing Server Actions — no tool grows its own backend. Weekly n8n digest (extend W-M2) reports tool→capture conversion per tool; tools that don't capture get rebuilt or killed.

**Security/perf floor:** rate-limited actions · no PII in share URLs · embeds sandboxed, no third-party cookies · each tool ≤ 60KB JS island (calculators are islands in RSC pages) · Lighthouse ≥ 90 on every /tools page.

---

# PART 5 — BUILD ORDER

| # | Tool | Runtime path | Effort | Phase fit |
|---|------|--------------|--------|-----------|
| 1 | FillMeter prototype | Artifact → Wave 3 | S | Now (tunes the hero) |
| 2 | Mister routing simulator | Artifact (stays internal) | M | Now (authors Wave 5 evals) |
| 3 | Tier pricing calculator | Artifact → ops page | S | Now (prices Phase 1 deals) |
| 4 | Trae tu grupo calculator | Artifact copy-test → /tools | M | Phase 0/1 (Section 11 mechanic) |
| 5 | ROI Proveedor | Reuses #3 engine → /vende | S | Phase 0 landing |
| 6 | Readiness quiz | /vende | S | Phase 0/1 (intake accelerator) |
| 7 | Landed-cost calculator | /tools | M | Phase 1 (SEO anchor; counsel-reviewed bands) |
| 8 | Slot estimator | /vende + portal | S | Phase 1–2 |
| 9 | Share-card generator | OG pipeline + n8n W-M5 | M | Phase 2 (campaign engine) |
| 10 | Spec-sheet generator | /vende (AI) | M | Phase 2 |
| 11 | Demand radar | /vende | S–M | Phase 2 (needs data density) |
| 12 | Cutoff widget | /embed | XS | Phase 2 |

**Rule of the catalog:** tools 1–3 are prototyping instruments — build immediately, they de-risk the repo build. Tools 4–6 ship with Phase 0/1 because they *are* the funnel. Everything else earns its slot by the funnel report, not by enthusiasm.
