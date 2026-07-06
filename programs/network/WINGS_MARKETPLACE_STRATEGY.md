# WINGS NETWORK
## The Marketplace Ecosystem of Wings Global Trade
### Full-Depth Strategy — Layered for Phased Execution

**Document status:** Master strategy v1.0
**Owner:** Muaaz / Wings Global Trade
**Prepared:** July 2026
**Execution model:** This document is the complete map. Phases are executed sequentially against the gates defined in Layer 11. Nothing in Layers 4–8 is built until Layer 11's Phase 0 and Phase 1 gates are passed.

---

# TABLE OF LAYERS

| Layer | Domain | What it answers |
|-------|--------|-----------------|
| **0** | Thesis & Strategic Foundation | Why this exists and why Wings wins |
| **1** | Brand Architecture | How the marketplace lives inside the Wings universe |
| **2** | Marketplace Economics | Cold start, liquidity, disintermediation defense |
| **3** | Revenue Architecture | Subscription (Alibaba logic) + Commission (Amazon logic) |
| **4** | Product Architecture | Buyer side, supplier side, the container primitive |
| **5** | Mister AI Integration | The matching engine and scenario routing |
| **6** | Trust, Verification & Governance | Wings Verified — the trust product |
| **7** | Operations & Automation Stack | n8n + Supabase + Notion as the marketplace OS |
| **8** | Technical Architecture | Data model, schema, system design |
| **9** | Go-To-Market & Supplier Acquisition | How supply gets recruited |
| **10** | Legal, Compliance & Risk Structure | Peru, ZOFRATACNA/ZOFRI, marketplace liability |
| **11** | Phased Execution Roadmap | Phase 0 → 4 with hard gates |
| **12** | KPIs & Unit Economics | The numbers that decide everything |
| **13** | Risk Register & Kill Criteria | What kills this, and when to stop |
| **A** | Appendices | Data model, tier matrix, Mister routing spec, naming shortlist |

---

# LAYER 0 — THESIS & STRATEGIC FOUNDATION

## 0.1 The One-Sentence Thesis

> **Wings Global Trade controls a physical import corridor (Tacna/ZOFRATACNA, Iquique/ZOFRI) and a demand-qualification engine (Mister AI). The marketplace monetizes that control by letting third-party suppliers rent access to Wings' buyers and Wings' containers — paying subscription for presence and commission for movement.**

Every strategic decision in this document flows from one asymmetry: **most marketplaces own software; Wings owns the corridor.** Alibaba cannot stop a buyer and supplier from closing on WeChat. Amazon fights leakage with policy. Wings doesn't need policy — if the goods move through a Wings-consolidated container, the commission is captured at the logistics layer, physically, before anyone can route around it.

## 0.2 The Problem Being Solved (Per Actor)

**For the buyer (already Wings' customer):**
- Wings' first-party catalog cannot cover every need. Today, when a buyer's need falls outside the catalog, the conversation dead-ends. That is demand Wings has already paid to acquire, evaporating.
- Buyers in the corridor want *one trusted counterpart* for import complexity — not five suppliers, five negotiations, five customs headaches.

**For the supplier (the new customer):**
- Brands and manufacturers (Chinese exporters, regional distributors, Peruvian/Chilean brands wanting corridor reach) have no efficient way to access the Tacna/Iquique buyer base. They either build their own presence (expensive, slow) or sell through opaque intermediaries (no data, no brand).
- They cannot solve the last mile of trust: a Bolivian or southern-Peruvian machinery buyer will not wire money to an unknown foreign supplier. They *will* buy through Wings.

**For Wings:**
- First-party sourcing caps revenue at working capital × inventory turns. Marketplace revenue has no inventory cost. It converts Wings' two real assets — buyer trust and corridor logistics — into margin that scales without capital.
- Every third-party product listed makes Mister smarter, every supplier fills containers faster, and every filled container makes the fill-meter (the hero visual of the entire brand) more alive. **The marketplace is Section 11 of the marketing strategy — the network-effect endgame of "Trae tu grupo" — expressed as a business model.**

## 0.3 What This Is NOT

Explicit exclusions, to protect scope forever:

- **Not a general-purpose Alibaba clone.** Wings Network is corridor-specific: goods that move through Tacna/Iquique to the markets Wings already serves. Category and geography discipline is the moat.
- **Not a listings site.** A listing without a path to a container slot is worthless. The unit of value is not the SKU page — it is the consolidated shipment.
- **Not a payments company (initially).** Escrow/payments infrastructure is a Phase 3+ question. Early phases run on Wings' existing invoicing and the physical control of goods as the trust mechanism.
- **Not open self-serve at launch.** Supply is curated, hand-picked, and concierge-managed until unit economics are proven (Layer 11).

## 0.4 The Strategic Logic Chain

```
Wings owns buyers          →  Buyers generate demand beyond Wings' catalog
Demand beyond catalog      →  Suppliers will pay to access it
Suppliers need trust       →  Wings Verified becomes a product
Suppliers need logistics   →  The Wings container becomes the transaction rail
Container as rail          →  Commission is physically uncircumventable
More suppliers             →  Containers fill faster ("Trae tu grupo" at industrial scale)
Faster fills               →  Better buyer economics → more buyers → more demand
                              ↺ FLYWHEEL CLOSES
```

## 0.5 The Founding Constraint (Read Before Every Phase)

**The shared-container feature ships first. Section 11 of the marketing strategy completes first.** The marketplace is built *on top of* the container primitive, not beside it. Any week spent building supplier dashboards before the container feature is live in production is a week spent building the second floor of a house with no foundation. This constraint is repeated at Layer 11 as Gate 0.

---

# LAYER 1 — BRAND ARCHITECTURE: THE WINGS UNIVERSE

## 1.1 The Architecture Model: Branded House with a Tiered Trust System

Wings does not launch a separate marketplace brand. It extends the Wings universe with a **second tier of supply**, made legible through a naming and badge system. The model is Amazon's ("Ships from and sold by Amazon" vs. "Sold by X, Fulfilled by Amazon") — but expressed with Wings' voice and the corridor's culture.

```
WINGS GLOBAL TRADE  ──────────────  The universe. The corridor. The trust.
│
├── WINGS DIRECT                    First-party. Sourced, stocked, guaranteed by Wings.
│                                   The flagship tier. Never diluted.
│
├── WINGS NETWORK                   The marketplace ecosystem. Third-party suppliers,
│   │                               Wings-facilitated trust and logistics.
│   │
│   ├── WINGS VERIFIED              The supplier trust badge (Layer 6).
│   │                               Earned, auditable, revocable.
│   │
│   └── VENDE CON WINGS             The supplier-facing acquisition brand.
│                                   Sister phrase to "Trae tu grupo" —
│                                   buyers bring their group; suppliers bring their catalog.
│
└── MISTER                          The intelligence layer that spans both tiers.
                                    "Oiga, Mister" works identically whether the answer
                                    is Wings Direct or Wings Network.
```

## 1.2 Why Branded House (Not a Separate Brand)

1. **Trust is the entire product.** A new brand starts at zero trust; the marketplace's only reason to exist is that Wings' trust is transferable. Separating them destroys the asset being monetized.
2. **The fill-meter is shared.** The hero visual — the container filling in real time — is the same object whether a slot is filled by Wings Direct inventory or a Network supplier's pallets. One visual, one story, two revenue lines.
3. **Mister must be one voice.** Buyers talk to Mister, not to a tier. The tier is resolved behind the scenes (Layer 5).
4. **Operational reality:** one website, one design system, one Next.js codebase, one Supabase. A second brand doubles every surface for zero trust gain.

## 1.3 The Naming Decision

**Recommended: "Wings Network"** for the ecosystem, **"Vende con Wings"** for supplier acquisition.

Rationale:
- *Network* says exactly what the strategic thesis says: this is the network-effects layer of the brand. It also scales — Wings Network can later contain services (financing, inspection, warehousing) without renaming.
- *Vende con Wings* mirrors the grammatical DNA of the two canonical campaign phrases. "Trae tu grupo" is the buyer-side network call; "Vende con Wings" is the supplier-side one. The campaign system stays one family.
- Alternatives evaluated in Appendix D (e.g., Wings Marketplace, Wings Partners, Wings Abierto). "Marketplace" is generic and claims no point of view. "Partners" is corporate and cold. "Network" carries the thesis.

## 1.4 Voice & Expression Rules for the Second Tier

- **Wings Direct never loses top billing.** In any mixed result set (site, Mister, spec sheets), Direct products render first within relevance ties, and carry the strongest visual weight. The flagship funds the trust; the network rents it.
- **Third-party is never disguised as first-party.** Every Network listing states the supplier name and the Wings Verified status plainly. Amazon's dark pattern of blurring the line erodes exactly the trust Wings sells. Clarity *is* the premium.
- **The badge is quiet, the standard is loud.** Wings Verified renders as a small, consistent mark — but the verification criteria are published publicly (Layer 6.4). The confidence comes from the audit, not the ornament.
- **Corridor voice everywhere.** The supplier side speaks the same direct, commercially warm Spanish as the buyer side. Supplier onboarding emails, dashboard microcopy, and rejection letters are brand surfaces, not admin exhaust.

## 1.5 Channel Conflict Doctrine (The Rule Decided Now)

The moment third-party suppliers exist in categories Wings Direct sells, Wings competes with its own paying customers. The doctrine:

1. **Core lines are reserved.** Wings Direct holds exclusive position in its core machinery lines (the defined flagship catalog). Network suppliers cannot list direct substitutes in reserved lines during Phases 0–2.
2. **Adjacent categories open first.** Spare parts, consumables, complementary equipment, adjacent verticals (e.g., categories buyers ask Mister about that Wings doesn't stock). This is where the marketplace earns its keep without cannibalizing.
3. **Data firewall pledge.** Wings will not use individual Network suppliers' sales data to launch competing Direct products. (Amazon's most reputationally expensive sin — and in a trust-based corridor business, a fatal one.) This pledge is written into the supplier agreement.
4. **Review at Phase 3.** Once marketplace GMV is material, reserved lines can be revisited category by category — deliberately, with data, never by drift.

---

# LAYER 2 — MARKETPLACE ECONOMICS: COLD START, LIQUIDITY, AND THE LEAKAGE PROBLEM

## 2.1 The Cold Start Position (Why Wings Starts Warm)

Marketplaces die in the cold start because they must build two sides at once. Wings starts with one side already built:

| Side | Status | Evidence |
|------|--------|----------|
| **Demand** | OWNED | Existing buyer base, Mister-qualified leads across five archetype lanes, WhatsApp handoff pipeline, container waitlists |
| **Supply** | TO RECRUIT | Zero — but recruitable with proof of demand |

The consequence: **supply is recruited with demand receipts, not promises.** The supplier pitch is not "join our platform" — it is "here are N qualified buyer requests in your category from the last 90 days that we could not serve. Do you want them?" (Layer 9 operationalizes this.)

## 2.2 Liquidity Strategy: Constrain Until Dense

The single most common marketplace failure after cold start: spreading thin. Ten categories with two suppliers each = zero liquidity everywhere. The doctrine:

- **Launch with 2–3 categories maximum**, chosen by one criterion: *highest frequency of unserved Mister/buyer requests* (the demand-gap report, Layer 7.4, produces this ranking automatically).
- **A category is "open" only when it has ≥3 verified suppliers and ≥1 container-lane fit.** Below that, buyer requests in the category route to concierge sourcing (Wings manually brokers), which doubles as supplier discovery.
- **Geographic discipline:** the corridor only. A supplier who can't get goods into the Tacna/Iquique consolidation flow is not a supplier, whatever their catalog looks like.

## 2.3 The Disintermediation (Leakage) Defense — The Core Economic Design

Every B2B marketplace bleeds through the same wound: buyer meets supplier on-platform, closes off-platform. The defense stack, strongest first:

**Defense 1 — The Container Rail (structural, uncircumventable).**
Commission is charged on *logistics consolidation*, not on the introduction. A Network supplier's goods reach corridor buyers through Wings-consolidated containers via ZOFRATACNA/ZOFRI. Even if buyer and supplier negotiate privately, the physical goods still move through Wings' consolidation — and the fee is collected there. Leakage would require the supplier to build independent corridor logistics, which is exactly the fixed cost they joined to avoid.

**Defense 2 — The Trust Wrapper (economic).**
Corridor buyers transact through Wings because Wings absorbs counterparty risk (inspection, dispute handling, the Verified standard). Going direct means the buyer gives up the protection. Trust-as-a-service makes staying on-rail cheaper than leaving even before logistics.

**Defense 3 — Subscription decouples revenue from any single transaction (financial).**
Because presence itself is billed (Layer 3), a leaked transaction is margin lost, not existence threatened. Alibaba survives massive leakage on this exact logic.

**Defense 4 — Mister as ongoing value (behavioral).**
Suppliers who transact on-rail keep receiving Mister-routed qualified leads. Leakage quietly downgrades routing priority. The carrot is the stick.

**What Wings deliberately does NOT do:** contact-information gating, message scanning, punitive anti-circumvention clauses. These poison trust and don't work. The rail defends itself.

## 2.4 Take-Rate Philosophy

- Take rate is set per category by **value added**, not by greed: consolidation + customs handling + trust + lead generation justify a real fee; a bare listing does not.
- Benchmark bands (to be validated in Phase 1 concierge deals): **8–15% effective take** on consolidated shipment value in machinery-adjacent categories, blending consolidation fee + commission. High-value/low-touch goods sit at the low end; high-touch categories at the high end.
- **The fee is presented as landed-cost math, never as platform tax.** The supplier pitch: "Your alternative is building corridor logistics + trust from zero. Our take is a fraction of that fixed cost, variable-ized."

## 2.5 The Flywheel, Quantified Later

Layer 12 defines the exact metrics, but the causal loop to instrument from day one:

```
Supplier joins → category depth ↑ → Mister answers more requests →
buyer request success rate ↑ → buyer retention & referral ("Trae tu grupo") ↑ →
demand volume ↑ → container fill velocity ↑ → supplier ROI story ↑ →
supplier acquisition cost ↓ → supplier joins ↺
```

The one number that proves the flywheel is turning: **container fill time** (days from container open to fill). It should fall as Network supply grows. It is also — not coincidentally — the hero visual of the brand. The marketing asset and the economic health metric are the same object.

---

# LAYER 3 — REVENUE ARCHITECTURE: SUBSCRIPTION × COMMISSION

## 3.1 The Dual-Engine Model

Two engines, deliberately independent, so each can be tuned without breaking the other:

| Engine | Logic | Charges for | Analogy |
|--------|-------|-------------|---------|
| **Presence** | Subscription | Access to Wings' buyers, brand, and intelligence | Alibaba Gold Supplier |
| **Movement** | Commission + consolidation fee | Goods physically moving through the rail | Amazon referral fee + FBA |

A supplier can theoretically subscribe and never ship (paying for lead visibility), or ship ad hoc at a higher non-member commission. The economics push everyone toward doing both.

## 3.2 The Subscription Ladder (Presence Engine)

Four tiers. Names are working titles — final naming passes through the brand system in Phase 1.

### TIER 0 — LISTED (Free)
*The top of the supplier funnel. Exists to make saying yes effortless.*
- Company profile + up to 5 product listings in open categories
- No Wings Verified badge — profile carries a neutral "Unverified supplier" state
- No Mister routing. No buyer lead access. Discoverable by browse only
- Non-member commission rate on any consolidated shipment (highest band)
- **Purpose:** pipeline capture, catalog data acquisition, upgrade pressure

### TIER 1 — VERIFIED (Entry subscription)
*The real starting line. The badge is the product.*
- Full Wings Verified audit (Layer 6) — documentation, factory/warehouse validation, reference checks
- Badge on all listings + published verification date
- Up to 30 listings, full spec-sheet formatting (extending the existing blueprint spec-sheet system)
- Standard commission band on consolidated shipments
- Quarterly demand-gap report for their categories (what buyers asked for that nobody served)

### TIER 2 — NETWORK (Growth subscription)
*Where Mister starts working for them.*
- Everything in Verified, plus:
- **Mister routing eligibility:** when a buyer's diagnosed need matches their catalog and Wings Direct doesn't cover it, Mister can present them (Layer 5 rules)
- Qualified lead delivery via WhatsApp deep-link handoff (the existing pipeline, extended to route to supplier reps with Wings CC'd)
- Priority container-slot booking windows
- Reduced commission band
- Monthly performance dashboard (leads received, conversion, shipment volume)

### TIER 3 — CORRIDOR PARTNER (Flagship subscription, invite/apply)
*The tier that behaves like a strategic alliance.*
- Everything in Network, plus:
- Category prominence placement (clearly labeled as partner placement — never disguised organic ranking)
- Co-marketing inside the Wings campaign system (featured in fill-meter content, campaign inclusion)
- Dedicated account management; input into category roadmap
- Lowest commission band; annual commit with volume rebates
- Early access to future rail services (Layer 3.5)

### Pricing posture (numbers set in Phase 1, structure set now)
- Tier 1 priced as *no-brainer vs. the audit's standalone value* — the verification alone should be worth the fee.
- Tier 2 priced against *cost of one qualified corridor lead* × expected monthly routed leads. If Mister routes them 8 qualified leads/month, the subscription must be obviously cheaper than acquiring 8 corridor leads any other way.
- Tier 3 priced as a business development line item, not a SaaS line item. Annual only.
- **All Phase 1 concierge suppliers get founder pricing locked for 24 months** — the reward for being supply-side pioneers, and the testimonial engine for Phase 2.

## 3.3 The Movement Engine (Commission + Consolidation)

The transaction stack on every Network shipment:

```
Supplier goods → Wings consolidation point (Tacna/Iquique) →
Wings-consolidated container → corridor buyer

Fees captured at the rail:
1. CONSOLIDATION FEE      — per slot/volume (CBM or pallet), the "Trae tu grupo"
                            shared-container pricing, same rate card as buyer side
2. NETWORK COMMISSION     — % of declared shipment value, banded by tier
                            (non-member > Verified > Network > Corridor Partner)
3. VALUE-ADDED SERVICES   — inspection, repacking, labeling, documentation,
                            spec-sheet production (à la carte)
```

Design rules:
- **One invoice.** The supplier sees a single landed-cost breakdown, not a fee salad. The financial-dashboard standard applies: exact decimal handling, currency clarity (USD primary; PEN/CLP where legally required), no floating-point money anywhere in the stack.
- **Commission on declared value requires a verification mechanism** — under-declaration is the obvious gaming vector. Mitigation: consolidation fee (volume-based, ungameable) carries the fixed economics; commission is the upside layer. Persistent under-declarers lose tier status (and customs declarations create a paper trail that disciplines this naturally).
- **Buyer-side pricing does not change.** Buyers already pay for container slots. The Network commission is a supplier-side cost. Buyers experiencing the marketplace as "more selection, same trusted process, same pricing logic" is non-negotiable.

## 3.4 Revenue Mix Evolution (Planning Assumption)

| Phase | Dominant revenue | Why |
|-------|-----------------|-----|
| Phase 1 | Commission/consolidation (concierge deals) | Proves the movement engine with real shipments before selling subscriptions at scale |
| Phase 2 | Subscription growth on proven ROI stories | Founder-supplier case studies convert the waitlist |
| Phase 3+ | Balanced, plus services | Rail services (3.5) begin compounding |

Rule: **never sell Tier 2+ subscriptions before at least three concierge suppliers have a documented ROI story.** Selling promises before proof is how marketplaces churn their founding supply and salt the earth.

## 3.5 Future Rail Services (Parked — FUTURE ring, do not touch)

Named now so the architecture leaves room; explicitly not designed yet:
- **Wings Capital** — inventory/shipment financing against consolidated goods (the rail sees the collateral)
- **Wings Escrow** — payment holding for high-value first transactions
- **Wings Fulfillment** — corridor-side warehousing and last-mile for Network goods
- **Wings Data** — anonymized corridor demand intelligence as a supplier product (already embryonic in the demand-gap report)

Each becomes viable only at Phase 3+ volumes. Each is listed in the risk register (Layer 13) as a scope-creep hazard until then.

---

# LAYER 4 — PRODUCT ARCHITECTURE

## 4.1 The System Map

```
                        ┌────────────────────────────┐
                        │   wingsglobaltrade.com     │
                        │   (one site, one universe) │
                        └────────────┬───────────────┘
             ┌───────────────────────┼───────────────────────────┐
             ▼                       ▼                           ▼
     BUYER EXPERIENCE          MISTER AI                 SUPPLIER EXPERIENCE
     /  (existing site,        (existing agent,          /red  or  /vende
        extended)              extended w/ routing)      (new surface)
             │                       │                           │
   ┌─────────┴─────────┐   ┌─────────┴────────┐        ┌────────┴─────────┐
   │ Catalog (Direct + │   │ Needs diagnosis  │        │ Vende con Wings  │
   │ Network, badged)  │   │ 5 archetype lanes│        │ landing (Ph. 0)  │
   │ Container fill-   │   │ + routing matrix │        │ Application flow │
   │ meter (hero)      │   │ (Layer 5)        │        │ Supplier portal  │
   │ Spec sheets       │   │ WhatsApp handoff │        │ (Ph. 2): listings│
   │ Request-a-product │   │ (Direct or       │        │ leads, shipments,│
   │ (demand capture)  │   │  Network path)   │        │ container slots, │
   └───────────────────┘   └──────────────────┘        │ billing          │
                                                        └──────────────────┘
                                     │
                        ┌────────────┴────────────┐
                        │      THE RAIL           │
                        │ Container consolidation │
                        │ ZOFRATACNA / ZOFRI      │
                        │ Fill-meter = live state │
                        └─────────────────────────┘
```

## 4.2 The Container as Transaction Primitive

The deepest product decision in this document: **the marketplace's atomic unit is the container slot, not the product listing.**

Consequences:
- Every Network listing carries **container-lane metadata**: which consolidation point, typical CBM/weight per unit, incoterm at handoff, lead time to consolidation point. A listing without lane data cannot be published.
- The fill-meter becomes a **two-sided object**: buyers see "this container is 68% full — trae tu grupo"; suppliers see "this lane fills every N days — book your slot." Same visual, two calls to action. One component in the design system, two contexts.
- Checkout (Phase 2+) is not "buy product" — it is **"reserve slot(s) in container C for goods G."** Order state machine follows the container lifecycle: `open → filling → cutoff → consolidating → in transit → corridor arrival → delivered`.
- **Shared-container group mechanics extend to supply:** just as buyers bring their group, small suppliers can share a slot (co-loading). "Trae tu grupo" becomes literal on both sides of the market.

## 4.3 Buyer-Side Product (Extensions to the Existing Site)

Priority-ordered:

1. **Badged catalog integration.** Network products appear in the existing catalog with the tier-clear treatment (Layer 1.4). Filters: Wings Direct only / All verified / Category / Lane.
2. **Request-a-product.** The single most important new buyer feature and the marketplace's demand sensor. A structured "couldn't find it? tell Mister" flow. Every submission writes to the demand-gap dataset (Layer 7.4) that drives category opening and supplier recruitment. This ships in Phase 0 — it costs almost nothing and starts compounding data immediately.
3. **Spec-sheet parity.** Network products get the same blueprint spec-sheet treatment as Direct products (the existing system, templatized for supplier data). Spec sheets are the corridor's trust currency; the marketplace inherits the format.
4. **Unified order tracking** keyed to container state, regardless of tier.

## 4.4 Supplier-Side Product (New Surface)

Phase-gated ruthlessly:

**Phase 0 — the landing page.** "Vende con Wings": the value proposition, demand receipts (anonymized request volume by category), founder-supplier offer, application form. Built in the existing Next.js repo. Nothing else.

**Phase 1 — no portal.** Concierge suppliers are managed entirely through Notion + WhatsApp + email. Their "dashboard" is a monthly PDF/Notion report assembled via n8n. This is deliberate: the portal's requirements are discovered by doing the work manually, not guessed.

**Phase 2 — the portal (MVP scope, fixed):**
- Listing manager (create/edit; publish requires lane data + passes verification state checks)
- Lead inbox (Mister-routed leads with archetype context; respond via WhatsApp deep-link, Wings CC'd)
- Container booking (see open lanes, reserve slots, track shipment state)
- Billing (subscription status, commission statements, single-invoice history)
- Performance (leads → conversations → shipments funnel; fill-participation stats)

Anything not on this list — messaging systems, RFQ engines, storefront customization, analytics suites — is FUTURE ring by default.

## 4.5 Design System Notes

- The supplier surface uses the existing Wings design system — same typography, same fill-meter component, same motion language (GSAP/Lenis stack where it earns its place). A supplier should *feel* they are entering the same world buyers trust, because that feeling is what they're paying for.
- The scoped-experience principle applies: the supplier portal is a distinct functional mode inside the universe — denser, more data-forward (financial-dashboard standards for money surfaces) — without bleeding utilitarian chrome back into the brand-forward buyer experience.

---

# LAYER 5 — MISTER AI: FROM SALES AGENT TO MATCHING ENGINE

## 5.1 The Upgrade in One Line

> Mister today: a commercial advisor that diagnoses a buyer's need and closes toward Wings' catalog.
> Mister after: the same advisor — who now **never dead-ends**, because behind the catalog sits the Network.

The buyer-facing experience barely changes. "Oiga, Mister" stays one voice, one personality, one WhatsApp handoff pattern. What changes is the resolution logic behind the answer.

## 5.2 The Routing Matrix (The Core Spec)

After needs diagnosis (the existing five-archetype-lane flow), Mister resolves supply in strict precedence:

```
DIAGNOSED NEED
     │
     ▼
[1] WINGS DIRECT match? ──────────── yes ──► Present Direct. (Flagship always first.)
     │ no
     ▼
[2] NETWORK match (Tier 2+, verified,
    in-category, lane-compatible)? ── yes ──► Present as "from our verified network,"
     │ no                                     supplier named, badge shown.
     ▼                                        Log routed_lead event (billable/attributable).
[3] NETWORK partial match
    (adjacent spec / longer lead)? ── yes ──► Present transparently as near-match
     │ no                                     with tradeoffs stated.
     ▼
[4] NO MATCH ───────────────────────────────► Capture as demand-gap record:
                                              structured need + archetype + volume signal.
                                              Tell the buyer honestly: "Not yet — but this
                                              is exactly what we're expanding. We'll come
                                              back to you." → feeds supplier recruitment.
```

Hard rules encoded in the system prompt and enforced in the tool layer:
1. **Direct always outranks Network** when both genuinely fit. Ties break to Direct. Period. (This is the channel-conflict doctrine, enforced in code.)
2. **Mister never invents supply.** If the catalog + network data returns nothing, the answer is the honest step [4] — never a confident hallucinated "we can get that." Wrong domain answers are worse than no answer; in a trust business they are fatal.
3. **Routing eligibility is data-driven, not prompt-driven.** Tier status, verification state, category, and lane compatibility are filters applied in the retrieval/tool layer *before* the model sees candidates. The model chooses among pre-qualified options; it cannot promote an ineligible supplier because it never sees one.
4. **Every route is an event.** `routed_lead {buyer_context, archetype_lane, need_summary, supplier_id, tier, timestamp}` — the attribution spine for supplier billing, performance dashboards, and Tier-2 ROI stories.

## 5.3 Scenario Behavior (The "Depending on the Scenario" Design)

The archetype lanes now modulate *how* Network options are presented, not just how needs are diagnosed:

| Scenario (lane character) | Mister's Network behavior |
|---------------------------|---------------------------|
| Price-driven / group buyer | Leads with shared-container economics; surfaces co-load options; Network alternatives framed by landed-cost math |
| Spec-driven / technical buyer | Leads with spec-sheet comparison (Direct vs Network side-by-side, blueprint format); tradeoffs explicit |
| Urgency-driven buyer | Filters by lane cutoff dates — "this container closes in 4 days" — fill-meter state injected into context |
| Relationship / repeat buyer | References order history; Network suggestions framed as "expanding what we can do for you" |
| Exploratory / new buyer | Conservative: Direct-first, Network only on explicit gap, education about the Verified standard |

Implementation: lane-conditional instruction blocks + the same tool-filtered candidate set. Context injected per message: current fill-meter states for relevant lanes, buyer history summary, live tier/category availability.

## 5.4 Mister on the Supplier Side (Phase 2+, scoped now)

A second Mister context — same brain, supplier-facing instance inside the portal:
- Onboarding copilot: walks suppliers through verification requirements, lane data entry, spec-sheet formatting
- Demand interpreter: "what are buyers in my category asking for?" answered from the demand-gap dataset (aggregated/anonymized only — the data firewall applies to the AI too)
- Never exposes individual buyer identity or Direct sales data

This is EXPLICITLY Phase 2+. Named here so the architecture (shared domain knowledge base, separate context/permission scopes) is designed once.

## 5.5 Technical Notes (AI System Standards)

- Candidate retrieval as tool calls against Supabase (`match_supply(need_vector, category, lane, min_tier)`), not context-stuffed catalogs — the catalog will outgrow any context window.
- Structured outputs schema-validated before any lead event is written; malformed extraction retries or degrades to human handoff, never writes garbage into attribution data.
- Conversation history trimming, streaming responses, server-side keys, rate limiting: the standing production rules, inherited from the existing Mister deployment.
- **Evaluation set before Phase 2 routing goes live:** a scenario suite (per lane × per routing branch) run against every prompt/system change. Routing errors are billing errors — this gets regression-tested like payments code, because it is payments code.

---

# LAYER 6 — TRUST, VERIFICATION & GOVERNANCE: "WINGS VERIFIED" AS A PRODUCT

## 6.1 The Premise

Buyers don't trust platforms; they trust counterparties. Wings Verified converts Wings' counterparty trust into a **transferable, auditable, revocable credential**. It is not a marketing badge — it is the marketplace's actual product, and it must be run with the discipline of a certification body, at corridor scale.

## 6.2 The Verification Stack

**Level 1 — Documentary (all Verified suppliers):**
- Legal entity validation (registration, tax status, legal representative)
- Export/commercial history evidence (references, shipping records, bank reference where obtainable)
- Product documentation: certifications relevant to category (safety, origin), catalog accuracy attestation

**Level 2 — Physical (Tier 2+, and any supplier in high-risk categories):**
- Factory/warehouse validation — in person where feasible, video-audit protocol otherwise
- Sample or first-shipment inspection at the consolidation point (the rail makes this cheap: goods pass through Wings' hands anyway — inspection is a checkpoint, not a trip)

**Level 3 — Behavioral (continuous, automatic):**
- On-rail performance: shipment accuracy, documentation quality, dispute rate, lead responsiveness
- Scored continuously from operational data (Layer 7). Verification is not a moment; it is a state that decays without maintenance.

## 6.3 Governance Rules

- **Annual re-verification** for Tiers 1–2; continuous for Tier 3 via account management.
- **Suspension triggers** (auto-flag, human decision): confirmed misdeclaration, dispute rate above threshold, document expiry, unreachable > N days with open orders.
- **Revocation is public-facing:** the profile shows "verification suspended," listings unpublish, Mister routing stops instantly (tier filter does this automatically — one row update, no deploy).
- **The dispute ladder:** buyer↔supplier issue → Wings mediates (leverage: goods on the rail, future routing, tier status) → Wings makes the buyer whole first and settles with the supplier second in genuine-fault cases. *Buyer trust is never collateral in a supplier dispute.* This is expensive and correct — it is also exactly what Alibaba's Trade Assurance monetizes; Wings does it with physical custody instead of escrow float.

## 6.4 Publish the Standard

The verification criteria are published openly on the site — what is checked, how often, what triggers loss. Rationale: (a) it converts the badge from ornament to audit; (b) it disciplines Wings internally; (c) it is content with real SEO/AEO gravity — "how Wings verifies suppliers" is exactly the query a cautious corridor buyer or a prospective supplier asks an AI assistant. The trust system doubles as the content moat.

---

# LAYER 7 — OPERATIONS & AUTOMATION: THE MARKETPLACE OS

## 7.1 Principle: Extend the Machine, Don't Build a Second One

The operational backbone already exists: **n8n production engine (seven workflows) → Supabase (wings project `pyznlglvwihosemqkhtq`) → Notion (three databases)**. The marketplace adds databases, workflows, and views to this machine. No new tools enter the stack in Phases 0–2.

## 7.2 Notion Layer (Human Operations & Project Management)

New databases, joining the existing three:

**DB: Suppliers (the supplier CRM)**
- Properties: company, contacts, country, categories (multi), tier, verification state + expiry, lane compatibility, pipeline stage (`lead → applied → vetting → verified → active → suspended/churned`), founder-cohort flag, account owner, agreement links
- Views: pipeline board (by stage), verification-expiry calendar, tier roster, category coverage matrix

**DB: Supplier Onboarding Projects**
- One project page per supplier moving through vetting → listing → first container. Template with the full checklist (docs, audit, spec sheets, lane data, agreement, founder pricing). This plugs directly into the existing project-management system — supplier onboarding becomes a first-class project type alongside build projects.

**DB: Demand-Gap Log** (mirror of the Supabase table, for human review)
- Weekly triage view: unserved requests ranked by frequency × estimated value → drives category-opening decisions and the supplier recruitment hit list.

**DB: Network Shipments** (Phase 1)
- Concierge-phase shipment tracker keyed to container lifecycle states; graduates to Supabase-primary in Phase 2 with Notion as the ops view.

## 7.3 Supabase Layer (System of Record)

Marketplace schema summary (full DDL sketch in Appendix A):

```
suppliers            — identity, tier, verification_state, scores
supplier_contacts    — people, roles, whatsapp/email
listings             — products, category, spec data, lane metadata, publish state
categories           — open/closed state, reserved-line flags, supplier density
lanes                — consolidation point, route, schedule template
containers           — lane_id, state machine, capacity, fill % (feeds the fill-meter)
slots                — container_id, holder (buyer|supplier), volume, goods ref, state
routed_leads         — the Mister attribution spine (5.2 rule 4)
demand_gaps          — structured unserved requests (archetype, category, volume signal)
shipments            — supplier goods through the rail; links slots ↔ invoices
invoices / fees      — consolidation fee, commission, services; decimal-exact money types
verification_events  — audit trail per supplier (what, when, who, evidence link)
performance_scores   — behavioral trust metrics (Layer 6, Level 3)
```

Design rules: money as `numeric`, never floats; every state machine transition logged with actor + timestamp; RLS from day one — supplier-scoped rows readable only by that supplier's future portal identity (cheap now, painful to retrofit).

## 7.4 n8n Layer (The New Workflows)

Additions to the production engine, in build order:

| # | Workflow | Trigger | Action |
|---|----------|---------|--------|
| W-M1 | **Supplier application intake** | Vende con Wings form submit | Create Supabase row + Notion CRM entry + onboarding project from template; notify account owner (WhatsApp/email) |
| W-M2 | **Demand-gap capture** | Request-a-product submit / Mister `no_match` event | Write `demand_gaps`; weekly digest → Notion triage view |
| W-M3 | **Verification lifecycle** | Expiry dates, state changes | Reminders at T-30/T-7; auto-suspend on expiry (tier filter update → Mister routing stops); revocation checklist task |
| W-M4 | **Routed-lead delivery** | Mister `routed_lead` event | Log attribution; WhatsApp deep-link package to supplier rep (Wings CC'd); SLA timer; non-response escalation |
| W-M5 | **Container lifecycle sync** | Container state transitions | Update fill-meter data; notify slot-holders (both sides); cutoff countdown messages ("closes in 4 days — trae tu grupo") |
| W-M6 | **Monthly supplier report** | Cron | Assemble leads/conversion/shipment/fees per supplier → PDF/Notion page → send. (This IS the Phase 1 "dashboard.") |
| W-M7 | **Billing run** | Cron + shipment completion | Subscription invoicing; per-shipment fee statements; overdue flags |
| W-M8 | **Performance scoring** | Shipment/dispute/lead events | Recompute behavioral scores; threshold breach → human review task |

Doctrine: **in Phase 1, workflows W-M1/2/3/6 do 90% of the work and the "portal" is a report.** Automation replaces the portal until the portal earns its build.

## 7.5 The Ops Team Reality Check

Someone must run verification audits, mediate disputes, and manage founding suppliers. In Phase 1 that someone is Muaaz + existing Wings ops capacity — which is precisely why Phase 1 caps at 5–10 suppliers. The scaling trigger for the first marketplace-ops hire is defined in Layer 12 (KPI: active suppliers per ops FTE). The automation stack exists to push that trigger as far out as possible, not to pretend humans aren't needed.

---

# LAYER 8 — TECHNICAL ARCHITECTURE

## 8.1 Stack Decision: Extend the Monorepo

The marketplace lives inside the existing Next.js app (`daparadisebanker-lab/wings-global-trade`), deployed on the existing Vercel pipeline. Not a separate app. Reasons: shared design system, shared auth (Phase 2), shared fill-meter components, one deploy surface, one SEO domain authority. Route groups:

```
app/
├── (buyer)/            existing site — catalog, fill-meter, spec sheets
│   └── red/…           badged Network catalog integration + request-a-product
├── vende/              Phase 0 supplier landing + application
├── portal/             Phase 2 supplier portal (auth-gated route group)
└── api/
    ├── mister/         existing agent endpoints + routing tools
    ├── marketplace/    listings, slots, leads (Phase 2)
    └── webhooks/n8n/   workflow event ingress/egress
```

## 8.2 System Integration Diagram

```
  Next.js (Vercel)                    Supabase (wings project)
 ┌───────────────────┐   read/write  ┌──────────────────────────┐
 │ Buyer surface     │◄─────────────►│ marketplace schema (7.3) │
 │ Vende landing     │               │ RLS per supplier         │
 │ Supplier portal   │               │ pgvector: listing +      │
 │ Mister endpoints ─┼── tool calls ─┤ demand embeddings        │
 └────────┬──────────┘               └───────────┬──────────────┘
          │ events (webhooks)                    │ triggers/queries
          ▼                                      ▼
  n8n production engine  ◄──────────────────────►  Notion (ops databases)
  (W-M1 … W-M8 + existing seven workflows)         (CRM, projects, triage)
          │
          ▼
  WhatsApp deep-link pipeline (existing) — buyer & supplier handoffs
```

## 8.3 Key Technical Decisions (ADR-style, one line each)

1. **Auth (Phase 2):** Supabase Auth for supplier identities; magic-link primary (corridor-supplier-friendly), RLS as the authorization layer. *Rejected:* separate auth service — needless surface.
2. **Search/matching:** pgvector embeddings over listings + demand-gap text for Mister's `match_supply` tool; SQL filters (tier/category/lane) applied before vector ranking. *Rejected:* external search service at this scale.
3. **Money:** all fee computation server-side, `numeric` end-to-end, currency-tagged; statements generated from immutable fee events, never recomputed from mutable state.
4. **Fill-meter data:** `containers.fill_pct` maintained by trigger on `slots`; the public site reads a cached view — the hero visual must never wait on a join.
5. **Feature flags** per marketplace surface (Network catalog visibility, routing on/off per category) — category opening becomes a config change, not a deploy.
6. **The portal ships behind the flag** to founder suppliers first; general availability only after the Phase 2 gate (Layer 11).

## 8.4 Build-System Fit

The build itself runs through the established machine: agent council for architecture/design/copy passes, wave-based multi-terminal protocol for implementation, the skill library (ui-excellence, financial-dashboard-engineer for money surfaces, ai-support-engine for routing, n8n-orchestrator for workflows) as the quality gates. The marketplace is a proving run for the whole DA LAB production system on a revenue-critical build — worth documenting as a case study for exactly the portfolio narrative the Global Talent / Innovator Founder applications want (execution evidence of a scalable, innovative venture).

---

# LAYER 9 — GO-TO-MARKET & SUPPLIER ACQUISITION

## 9.1 The Pitch Architecture: Demand Receipts

The supplier pitch is never "join our marketplace." It is evidence-first:

> *"In the last 90 days, buyers in the Tacna–Iquique corridor asked us for [category] N times. We couldn't serve them — yet. Here is the anonymized request log. Here is the container lane that already runs. Do you want these buyers?"*

This is only possible because **request-a-product and Mister's `no_match` logging ship in Phase 0** — the demand-gap dataset is the sales deck. GTM is therefore sequenced backwards from data: capture gaps → rank categories → recruit named suppliers against named demand.

## 9.2 Supplier Segments (Priority Order)

1. **Suppliers Wings already knows** — existing sourcing relationships, factories Wings buys from, brands encountered in operations. Warmest, fastest to verify, most forgiving of concierge roughness. Founder cohort comes from here.
2. **Adjacent-category regional players** — Peruvian/Chilean distributors and brands wanting corridor reach without building Tacna/Iquique presence.
3. **Export-side manufacturers (China and beyond)** — already export-capable, seeking a trusted corridor entry. Highest volume potential, highest verification cost; scale segment for Phase 2+.
4. **The long tail** — inbound from Vende con Wings. Free-tier capture, upgrade nurture.

## 9.3 Channel Plan

- **Direct founder outreach (Phase 1):** 20–30 hand-picked targets from segments 1–2, personal outreach with the demand-receipt pitch. Goal: 5–10 signed founder suppliers. No ads. No scale tooling. Deals close on WhatsApp and in person — this is the corridor.
- **Vende con Wings landing (Phase 0):** always-on capture. SEO/AEO targeting the queries suppliers actually ask ("cómo vender en Perú desde ZOFRI", "distribución Tacna maquinaria", "how Wings verifies suppliers"). The published verification standard (6.4) and demand-gap teasers are the content spine.
- **The fill-meter as proof-of-demand content (Phase 2):** the campaign system's hero visual, repurposed supplier-side — "this container filled in 6 days" is the most persuasive supplier ad Wings can run. The existing Meta ad automation stack (Higgsfield + Meta Ads MCP + Recraft/Figma Weave asset layer) extends to a supplier-side campaign lane with near-zero new infrastructure.
- **Founder-supplier case studies (Phase 2 gate asset):** the three documented ROI stories (3.4) become the conversion engine for the waitlist.

## 9.4 Launch Narrative

One story, two audiences, one campaign system:

- Buyer-side: **"El catálogo creció."** Same Wings, same trust, more answers. Mister never says no anymore — he says "give me a moment."
- Supplier-side: **"Vende con Wings."** The corridor's buyers, Wings' trust, one container away.
- Shared visual: the fill-meter, now fed from both sides. The campaign phrases form a family: *Trae tu grupo* (demand) / *Vende con Wings* (supply) / *Oiga, Mister* (the intelligence that binds them).

---

# LAYER 10 — LEGAL, COMPLIANCE & RISK STRUCTURE

*(Structural map for counsel — this layer defines what must be answered, not legal advice. Peruvian/Chilean counsel engaged at Phase 1 gate.)*

## 10.1 The Core Structural Question

Wings' marketplace role must be legally defined per transaction type: **importer of record vs. logistics consolidator vs. commercial intermediary.** Each carries different customs liability, tax treatment, and consumer/commercial protection exposure in Peru and Chile. Phase 1 concierge deals should deliberately test the cleanest structure (likely: Wings as consolidator + commission agent, supplier retains title until buyer sale) before terms are standardized.

## 10.2 The Checklist for Counsel

- **Free-zone compliance:** ZOFRATACNA and ZOFRI regimes — what third-party consolidation/re-expedition activity is permitted under Wings' current registrations; whether marketplace activity changes Wings' zone user classification
- **Customs & declared value:** liability allocation when a Network supplier misdeclares; Wings' inspection rights and duties as consolidator
- **Tax:** IGV/VAT treatment of commission vs. consolidation fee vs. subscription (three revenue types, likely three treatments); invoicing requirements per revenue line; cross-border service invoicing to foreign suppliers
- **Supplier agreement:** the master document — tier terms, commission bands, verification consent, data firewall pledge (1.5), dispute ladder (6.3), suspension/revocation mechanics, founder pricing lock
- **Buyer protection posture:** what Wings warrants on Network goods vs. Direct goods; the make-the-buyer-whole policy (6.3) formalized with clear limits
- **Product liability & prohibited categories:** category-level exclusion list (regulated goods, certification-mandatory equipment without papers)
- **Data:** supplier and buyer data handling under Peruvian data protection law; the anonymization standard for demand-gap sharing

## 10.3 Risk Posture

Phase 1 runs on bilateral concierge agreements (bespoke, low volume, high learning). The standardized master agreement is a **Phase 2 gate requirement** — no self-serve supplier signs up on improvised terms.

---

# LAYER 11 — PHASED EXECUTION ROADMAP

*Every phase has an entry gate (must be true to start) and an exit gate (must be proven to proceed). Gates are pass/fail. The roadmap is a ratchet, not a calendar.*

## PHASE 0 — DEMAND SENSING & FOUNDATION *(now; runs alongside container-feature launch)*

**Entry gate:** none — starts immediately, but see the founding constraint (0.5).

**Scope (CORE only):**
1. Ship the shared-container feature + complete Section 11 of the marketing strategy *(prerequisite work, already in motion — everything below is designed to not compete with it)*
2. **Vende con Wings landing page** + application form → W-M1 intake workflow
3. **Request-a-product** on the buyer site + Mister `no_match` logging → W-M2 demand-gap capture
4. Notion: Suppliers CRM + Onboarding Project template + Demand-Gap triage view
5. Supabase: `suppliers`, `demand_gaps`, application tables (thin slice of the Appendix A schema)

**Explicitly NOT in Phase 0:** listings, portal, subscriptions, billing, Mister routing, any supplier-facing product beyond the landing page.

**Exit gate (all must be true):**
- Container feature live in production; Section 11 complete
- ≥ 25 supplier applications OR ≥ 15 warm targets identified from segment 1
- Demand-gap log shows ≥ 2 categories with repeatable unserved demand (≥ 10 qualified requests each)
- **If the demand-gap log is thin after 60–90 days of capture: stop. The marketplace thesis says buyers want more than the catalog. If the data says otherwise, the honest move is to not build Phase 1.** (Kill criterion #1, Layer 13.)

## PHASE 1 — CONCIERGE MARKETPLACE *(the proving ground)*

**Scope:**
1. Recruit and verify **5–10 founder suppliers** (segments 1–2, demand-receipt pitch, founder pricing locked 24 months)
2. Run **real consolidated shipments** — supplier goods in Wings containers, fees invoiced per the 3.3 stack — managed entirely via Notion + n8n (W-M3, W-M6 minimum) + WhatsApp
3. Network listings appear on the buyer site as a *curated, badged section* (static/CMS-level; no portal, no self-serve)
4. Legal: counsel engaged (10.2 checklist); concierge agreements per deal; master agreement drafted
5. Verification playbook v1 executed manually and documented (it becomes the Layer 6 SOP)

**Success criteria / exit gate:**
- ≥ 3 suppliers with a completed shipment cycle AND a documented ROI story
- Effective take rate validated within the 2.4 band on real deals; unit economics positive per shipment
- Container fill time on marketplace-participating lanes **flat or improving** (the flywheel's first pulse)
- Zero buyer-trust incidents unresolved by the dispute ladder
- Master supplier agreement executed with at least the founder cohort
- **Kill criterion #2:** if after two full quarters suppliers won't pay real fees, or leakage exceeds the rail's capture on concierge deals — stop and restructure before building software.

## PHASE 2 — PRODUCTIZED MARKETPLACE *(build the machine that's now proven)*

**Scope:**
1. Supplier portal MVP (the fixed 4.4 list — nothing more)
2. Subscription tiers live; billing via W-M7; founder cohort migrated at locked pricing
3. **Mister routing live** (the 5.2 matrix), behind per-category feature flags, with the evaluation suite (5.5) as a release gate
4. Container booking productized (slots reservable in-portal; fill-meter two-sided)
5. Supplier-side campaign lane on the existing ad automation stack
6. First marketplace-ops hire when the 12.3 trigger fires

**Exit gate:** ≥ 25 active paying suppliers · ≥ 2 categories at full liquidity (2.2 definition) · routed-lead → shipment conversion above floor (set from Phase 1 data) · subscription revenue covering marketplace fixed ops cost.

## PHASE 3 — NETWORK EFFECTS & DEPTH

**Scope:** category expansion by demand-gap ranking · reserved-lines review (1.5.4) · Corridor Partner tier activated · supplier-side Mister (5.4) · co-load slot sharing productized · first rail-service pilot (3.5 — one, not four).

## PHASE 4 — PLATFORM HORIZON *(FUTURE ring; direction, not commitment)*

Rail services at scale (Capital/Escrow/Fulfillment/Data) · additional corridor lanes · the honest question of whether Wings Network becomes the corridor's operating system. Not designed until Phase 3 metrics demand it.

---

# LAYER 12 — KPIs & UNIT ECONOMICS

## 12.1 The One Metric That Rules

**Container fill time** (median days, container open → cutoff-full, per lane). It is simultaneously: the flywheel's health signal, the buyer value proposition, the supplier ROI driver, and the brand's hero visual. If marketplace growth doesn't move this number, the marketplace is decoration.

## 12.2 The Scorecard by Phase

**Phase 0 (sensing):**
- Demand-gap requests / week, by category (target: ranking stability — the same 2–3 categories keep winning)
- Supplier applications; % from warm segments
- Request-a-product usage rate (% of buyer sessions engaging)

**Phase 1 (proof):**
- Founder suppliers signed / verified / shipped (funnel)
- Effective take rate per shipment (target: within the 8–15% band, positive contribution per shipment after inspection + ops time)
- ROI stories documented (target: ≥ 3)
- Fill-time delta on participating lanes vs. control lanes
- Dispute count and resolution time (target: 100% resolved within ladder, zero buyer losses)

**Phase 2 (machine):**
- MRR (subscriptions) vs. marketplace fixed ops cost (crossover is the exit gate)
- GMV through the rail; commission revenue; blended take
- Routed leads → conversation → shipment conversion by archetype lane (Mister's report card)
- Supplier NRR (retention + tier upgrades − churn/downgrades)
- Liquidity per category: suppliers ≥ 3, request-serve rate ≥ 70%
- Leakage proxy: % of routed leads with no rail shipment in 90 days (watch, don't police)

**Ops trigger (12.3):** first dedicated marketplace-ops hire when active suppliers > 15 per available ops FTE-equivalent, or verification backlog > 21 days.

## 12.3 Unit Economics Templates (to be filled with Phase 1 actuals)

**Per shipment:**
```
Revenue:   consolidation fee + commission + services
Costs:     inspection time + docs/ops time + dispute reserve (x% of GMV)
                + payment/FX friction
Target:    contribution margin > 0 on every founder deal;
           > 40% at Phase 2 standard rates (rail costs are mostly sunk —
           containers run anyway; marketplace goods are marginal volume
           on an existing cost base. This is the structural margin story.)
```

**Per supplier (Tier 2):**
```
LTV  =  subscription months × fee  +  expected shipments × contribution
CAC  =  outreach + verification cost (audit hours, travel amortized)
Target: LTV:CAC > 4 (warm segments should clear this easily;
        if segment-3 CAC breaks it, stay in warm segments longer)
```

---

# LAYER 13 — RISK REGISTER & KILL CRITERIA

## 13.1 Register (probability × impact, mitigations in-document)

| # | Risk | P | I | Mitigation |
|---|------|---|---|------------|
| 1 | Demand-gap is thin — buyers don't actually want beyond-catalog supply | M | FATAL | Phase 0 measures before anything is built; kill criterion #1 |
| 2 | Founder suppliers won't pay real fees | M | FATAL | Concierge proof before software; kill criterion #2 |
| 3 | Leakage exceeds rail capture | L–M | H | Defense stack 2.3; leakage proxy metric; consolidation fee carries fixed economics |
| 4 | Channel conflict sours Direct buyers or suppliers | M | H | Reserved lines + data firewall + Direct-first routing, decided now (1.5) |
| 5 | A bad Network shipment burns buyer trust (the brand's core asset) | M | VERY H | Verification stack + inspection at the rail + make-buyer-whole policy; curated supply only until Phase 3 |
| 6 | Regulatory/zone surprise (ZOFRATACNA/ZOFRI classification) | M | H | Counsel at Phase 1 gate; cleanest structure tested on concierge deals first |
| 7 | Founder bandwidth — marketplace competes with container launch, Áladín, relocation timeline | **H** | H | The founding constraint (0.5); Phase 0 scoped to ~2 build items; concierge cap at 10; automation-first ops |
| 8 | Scope creep toward rail services / portal features before gates | H | M | FUTURE-ring discipline; fixed MVP lists; this document as the contract |
| 9 | Mister routing errors → billing/attribution disputes | L | M | Tool-layer filtering, schema validation, evaluation suite as release gate (5.5) |
| 10 | Under-declaration gaming of commission | M | M | Volume-based consolidation fee as floor; customs paper trail; tier penalties |

## 13.2 Kill / Restructure Criteria (pre-committed, so the decision is data's, not mood's)

1. **Kill at Phase 0 exit** if demand-gap capture over 60–90 days shows no category with repeatable unserved demand.
2. **Kill/restructure at Phase 1 exit** if suppliers won't pay, unit economics negative on well-run concierge deals, or any unresolvable buyer-trust failure pattern.
3. **Pause trigger any time:** if marketplace work delays the container feature launch or Section 11 by more than two weeks, marketplace work stops until they ship. The foundation outranks the floor above it.

---

# APPENDIX A — SUPABASE SCHEMA SKETCH (Phase 0 slice marked ●)

```sql
● suppliers(id, name, legal_name, country, segment, tier, verification_state,
            verification_expiry, founder_cohort bool, created_at)
● supplier_contacts(id, supplier_id, name, role, whatsapp, email)
● demand_gaps(id, source ∈ {request_form, mister_no_match}, category_guess,
              need_text, need_embedding vector, archetype_lane, volume_signal,
              buyer_ref, created_at)
● applications(id, supplier_id, categories[], catalog_url, message, status)
  categories(id, name, state ∈ {closed, concierge, open}, reserved_line bool)
  lanes(id, consolidation_point ∈ {tacna, iquique}, route, schedule)
  containers(id, lane_id, state, capacity_cbm, fill_pct, cutoff_date)
  slots(id, container_id, holder_type ∈ {buyer, supplier}, holder_id,
        volume_cbm, goods_ref, state)
  listings(id, supplier_id, category_id, title, spec jsonb, lane_ids[],
           unit_cbm, lead_time_days, publish_state, embedding vector)
  routed_leads(id, buyer_ctx jsonb, archetype_lane, need_summary,
               supplier_id, tier_at_route, outcome, created_at)
  shipments(id, supplier_id, slot_ids[], declared_value numeric,
            state, inspection_result)
  fee_events(id, shipment_id?, supplier_id, type ∈ {consolidation, commission,
             subscription, service}, amount numeric, currency, created_at)
  verification_events(id, supplier_id, level, result, evidence_url, actor, at)
  performance_scores(supplier_id, dispute_rate, lead_response_hrs,
                     doc_quality, updated_at)
```

# APPENDIX B — SUPPLIER TIER MATRIX (one-glance)

| Capability | T0 Listed | T1 Verified | T2 Network | T3 Corridor Partner |
|---|---|---|---|---|
| Listings | 5 | 30 | Unlimited* | Unlimited* |
| Wings Verified badge | — | ✔ | ✔ | ✔ |
| Mister routing | — | — | ✔ | ✔ priority |
| Lead delivery (WhatsApp) | — | — | ✔ | ✔ |
| Container booking | ad hoc | standard | priority window | first window |
| Commission band | highest | standard | reduced | lowest + rebates |
| Demand-gap report | — | quarterly | monthly | live + roadmap input |
| Co-marketing / campaign | — | — | — | ✔ |
| Account management | — | — | pooled | dedicated |

*subject to category rules and lane data completeness.*

# APPENDIX C — MISTER ROUTING EVENT SPEC (v0)

```json
{
  "event": "routed_lead",
  "buyer_context": {"session_ref": "…", "archetype_lane": "price_group",
                     "history_summary": "…"},
  "need": {"summary": "…", "category_id": "…", "volume_signal": "…",
            "urgency": "container_cutoff|standard"},
  "resolution": {"branch": 1|2|3|4, "supplier_id": "…|null",
                  "tier_at_route": "…", "candidates_considered": ["…"]},
  "handoff": {"channel": "whatsapp_deeplink", "wings_cc": true},
  "ts": "ISO-8601"
}
```
Validation: JSON schema enforced before write; branch 4 events fork to `demand_gaps`.

# APPENDIX D — NAMING SHORTLIST (decision record)

| Candidate | Verdict |
|---|---|
| **Wings Network** | ✔ Selected — carries the thesis, scales to services |
| Vende con Wings | ✔ Selected as supplier-acquisition brand — campaign-family grammar |
| Wings Marketplace | ✘ Generic, no point of view |
| Wings Partners | ✘ Corporate, cold, says nothing about buyers |
| Wings Abierto | ~ Warm, but implies uncurated openness — contradicts the Verified doctrine |
| Red Wings / La Red | ✘ Trademark noise; ambiguity in English contexts |

---

# CLOSING NOTE — THE DOCTRINE IN FIVE LINES

1. **The container is the business.** Everything else rents space on it.
2. **Trust is the product.** Verification is run like certification, not marketing.
3. **Demand receipts recruit supply.** Never pitch a promise when you can show a log.
4. **Gates, not dates.** Each phase earns the next; kill criteria are pre-signed.
5. **The flagship funds the network.** Wings Direct is never diluted to feed the marketplace that depends on its trust.

*Execute Phase 0. Everything else waits its turn.*
