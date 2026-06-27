# MISTER INFORMATION ARCHITECTURE

**Architect:** IA Architect Council  
**Subject:** The complete information structure, taxonomy, and interaction model for Mister (Deliverables 1, 2, 5, 7 from MISTER_MASTER_BRIEF.md)  
**Scope:** Conversation IA, information node taxonomy, archetype resolution algorithm, stage state machine, escalation routing, and surface rendering logic.

---

## 1. CONVERSATION INFORMATION ARCHITECTURE

Mister's conversation operates across two dimensions:

### 1.1 The Five-Lane Model (Archetype Dimension)

Each archetype represents a distinct user mental model and a separate information flow:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MISTER FIVE-LANE ARCHITECTURE                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  A1: Lead / End Buyer                  ← Individual, price-led  │
│  ├─ Mind: "I want equipment for my use. What will it actually  │
│  │  cost to put in my place?"                                   │
│  ├─ Content pathways: education (landed cost) → product         │
│  │  confirmation → pre-qual → quotation                          │
│  └─ Escalation: quotation form OR WhatsApp on frustration       │
│                                                                  │
│  A2: Project Manager                   ← Part of larger ops     │
│  ├─ Mind: "This must meet spec X, arrive by date Y, ship to     │
│  │  location Z. I need compliance docs."                        │
│  ├─ Content pathways: spec match → docs → timeline → approval   │
│  │  chain → procurement                                          │
│  └─ Escalation: formal quotation + specialist call              │
│                                                                  │
│  A3: Logistics Manager                 ← Freight-focused        │
│  ├─ Mind: "How do I move this through Tacna/Iquique? What       │
│  │  customs docs do I need? What's my Incoterm split?"          │
│  ├─ Content pathways: corridor routing → doc gap analysis →     │
│  │  container fit → specialist                                   │
│  └─ Escalation: doc download OR specialist (clearance)          │
│                                                                  │
│  A4: Reseller                          ← Margin-driven          │
│  ├─ Mind: "What's my MOQ? Can I hit margins? Do I get           │
│  │  exclusivity? What's the breadth of catalog?"                │
│  ├─ Content pathways: catalog breadth → MOQ table →             │
│  │  margin literacy → territory negotiation                      │
│  └─ Escalation: reseller quotation + partnerships team          │
│                                                                  │
│  A5: Wholesale / B2B Partner           ← Volume + integration   │
│  ├─ Mind: "Can you consolidate multi-SKU shipments? Do you      │
│  │  handle clearance across 3+ countries? What's the            │
│  │  framework agreement?"                                        │
│  ├─ Content pathways: volume matrix → multi-country doc         │
│  │  framework → key-accounts negotiation                        │
│  └─ Escalation: ALWAYS human (key-accounts desk) at pre-qual    │
│                                                                  │
│  UNRESOLVED                            ← Default on entry       │
│  ├─ Behavior: neutral tone, ask Q1 inline, infer from context   │
│  └─ Transition: once signal received, auto-resolve to A1–A5     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 The Four-Stage Journey (Temporal Dimension)

Each user progresses through standardized conversation states:

```
┌──────────────────────────────────────────────────────────────┐
│              MISTER CONVERSATION STAGE MACHINE               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  STAGE 1: DISCOVERY                                         │
│  ├─ Purpose: Uncover user intent, constraints, baseline     │
│  ├─ Information collected: use case, setting, budget,       │
│  │  timeline, geography, product interest                    │
│  ├─ Mister tone: warm, exploratory, educational            │
│  ├─ Expected duration: 2–4 turns                            │
│  ├─ Exit condition: user intent + primary constraint clear  │
│  └─ Escalation from here: rare (only on "I just want to    │
│     browse" → drop to unresolved, observe mode)             │
│                                                              │
│  ↓                                                           │
│                                                              │
│  STAGE 2: CONSIDERATION                                     │
│  ├─ Purpose: Educate on structure, surface options,         │
│  │  build confidence in the next step                        │
│  ├─ Information surfaces: product options, comparison,       │
│  │  cost structure, compliance, container fit, MOQ           │
│  ├─ Mister tone: expert, detail-oriented, educational       │
│  ├─ Expected duration: 3–5 turns                            │
│  ├─ Exit condition: user educated + ready to decide OR      │
│  │  frustrated/uncertain                                     │
│  └─ Escalation from here: spec mismatch, doc unavailable,   │
│     availability question, price frustration                │
│                                                              │
│  ↓                                                           │
│                                                              │
│  STAGE 3: PRE-QUALIFICATION                                 │
│  ├─ Purpose: Collect hard data needed for quotation         │
│  │  (destination, tax ID, volume, timeline, approval flow)  │
│  ├─ Information collected: RUC/tax ID, destination,         │
│  │  volume commit, approval signers, decision timeline       │
│  ├─ Mister tone: direct, qualification-focused              │
│  ├─ Expected duration: 2–3 turns                            │
│  ├─ Exit condition: minimum fields filled → escalate OR     │
│  │  user abandons                                            │
│  └─ Escalation from here: ALWAYS — this is the handoff      │
│     point to quotation form or human                         │
│                                                              │
│  ↓                                                           │
│                                                              │
│  STAGE 4: SUPPORT                                           │
│  ├─ Purpose: Handoff to human, document delivery,           │
│  │  booking, or WhatsApp continuity                          │
│  ├─ Information surfaces: doc downloads, contact details,   │
│  │  meeting booking link, WhatsApp handoff                   │
│  ├─ Mister tone: confirmatory, facilitating                 │
│  ├─ Expected duration: 1 turn (escalation happens)           │
│  └─ Escalation: always to human, form, or download           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 1.3 Conversation Matrix: Archetype × Stage

Each combination defines the expected question set and information surfaces:

| Stage | A1 (Lead/Buyer) | A2 (Project Mgr) | A3 (Logistics) | A4 (Reseller) | A5 (Wholesale) |
|-------|---|---|---|---|---|
| **Discovery** | Use case, setting, budget, comparison intent | Project context, spec/standard, on-site date, delivery location | Corridor, origin/destination, commodity, container, Incoterm | Market, category interest, channel, order frequency | Countries, SKU count, volume, clearance scope |
| **Consideration** | Cost waterfall, comparison, Incoterm explanation, TCO | Spec match, compliance certs, delivery schedule, staging | Incoterm split, container optimization, doc gaps, corridor handling | MOQ table, margin literacy, catalog breadth, exclusivity | Volume tiers, multi-SKU consolidation, multi-country docs, program structure |
| **Pre-qualification** | Destination, tax ID, decision timeline, purchaser | Budget line, approver info, formal vs. budgetary, destination | Lane commitment, volume classification, recurring?, clearance coordination | Volume commit, territory, import setup readiness | Volume commitment, entity structure, ramp plan, framework need |
| **Support** | Spec download, cost breakdown, WhatsApp save, quotation form | Spec pack + compliance bundle, meeting booking, quotation | Doc downloads, logistics specialist contact, meeting, Incoterm matrix | Reseller catalog, margin explainer, channel contact | Program brief, multi-country framework, key-accounts intro |

---

## 2. INFORMATION NODE TAXONOMY

### 2.1 Node Classification System

All content Mister can retrieve from the backend is classified into 8 mutually exclusive types:

```
PRODUCT (PROD)
├─ Product record: SKU, name, category, summary, specs, image URL, MOQ reference
├─ Archetype visibility: A1 (base), A2 (spec-focused), A3 (specs + weights), A4 (category), A5 (catalog range)
├─ Backend source: products table; cached queries on category/spec
└─ Rendering: ProductCard component (image + key specs + CTA)

SPECIFICATION SHEET (SPEC)
├─ Technical data: dimensions, weight, power, certifications, material, capacity, compliance
├─ Archetype visibility: A2 (mandatory), A3 (weights/dims), A1 (optional), A4 (feature comparison)
├─ Backend source: spec_sheets table or documents storage; pdf download link
└─ Rendering: SpecSheet component (tabular + downloadable PDF)

COMPARISON TABLE (COMPARE)
├─ Side-by-side: 2–3 products on key axes (price band, MOQ, lead-category, compliance)
├─ Archetype visibility: A1 (optional, "want to see alternatives?"), A2 (spec-driven), A4 (margin-ranked)
├─ Backend source: comparison_matrices table; generated on-demand from product specs
└─ Rendering: ComparisonView component (column headers + rows, delta callouts)

LOGISTICS DOCUMENT (LOGI)
├─ Purpose: Incoterm matrix, container specs, free-zone flow, country-specific customs checklist, HS classification guidance, corridor overview
├─ Archetype visibility: A3 (primary), A2 (compliance-focused), A5 (multi-country framework)
├─ Backend source: documents storage (PDFs by country + product type + Incoterm); static content (Incoterm matrix)
└─ Rendering: DocumentLink component (+ download CTA) OR static LandedCostWaterfall

MINIMUM ORDER QUANTITY TABLE (MOQ)
├─ Content: SKU × volume tier → unit cost, landed-cost index, resale pricing guidance
├─ Archetype visibility: A4 (primary), A5 (multi-SKU matrix), A1 (single-unit confirmation)
├─ Backend source: moq_tables table; indexed ranges only (no absolute prices)
└─ Rendering: MoqTable component (volume bands × price indexes; tooltips on economics)

QUOTATION (QUOTE)
├─ Purpose: Pre-filled quotation form entry point; NOT a price, but a formal request workflow
├─ Archetype visibility: A1 (on "ready to buy"), A2 (formal + budgetary variants), A4 (reseller-flagged), A5 (program-flagged)
├─ Backend source: quotation form service (Supabase form table or external form engine)
└─ Rendering: open_quotation action (link to form URL with prefill token)

CONTACT RECORD (CONTACT)
├─ Purpose: Connect to human — sales, project specialist, logistics broker, partnerships, key-accounts
├─ Archetype visibility: all when escalation triggered
├─ Backend source: contacts table; keyed by archetype + category
└─ Rendering: ContactCard component (name, role, WhatsApp, email) + connect_whatsapp action

CALENDAR / MEETING BOOKING (CAL)
├─ Purpose: Schedule a call with specialist (Calendly or equivalent)
├─ Archetype visibility: A2 (tight timeline), A3 (complex coordination), A4 (exclusivity), A5 (always)
├─ Backend source: calendar integration (Calendly link or backend scheduler)
└─ Rendering: book_meeting action (link to booking page, pre-context passed)

FINANCIAL LITERACY NODE (WATERFALL)
├─ Purpose: Educate on landed-cost structure (product → freight → insurance → duties → last-mile) using indexed ranges only
├─ Archetype visibility: A1 (primary education), A2 (project budget context), A4 (margin modeling), A5 (program-level tiers)
├─ Backend source: static content (component logic); dynamic data from collected context (destination, container, Incoterm)
└─ Rendering: LandedCostWaterfall component (5-segment horizontal stack; indexed ranges; disclaimers on every segment)
```

### 2.2 Content Retrieval Rules: When to Surface Each Node Type

```
DISCOVERY STAGE
├─ Surface PRODUCT: always, when current_page is product OR user mentions use case
├─ Surface SPEC: only if archetype = A2 or A3; optional for A1
├─ Surface WATERFALL: only if user asks "why is it expensive?" or "what's the real cost?"
└─ Never surface: QUOTE, CONTACT, CAL, MOQ, COMPARE, LOGI (too early)

CONSIDERATION STAGE
├─ Surface SPEC: if archetype = A2 (mandatory); if A1 (on request)
├─ Surface COMPARE: if archetype = A1 or A4 (on "show me alternatives"); if A2 (spec-driven)
├─ Surface WATERFALL: if user asks price/cost structure; mandatory if A4 (margin education)
├─ Surface LOGI: if archetype = A3 or A2 (compliance); optional if A5 (overview)
├─ Surface MOQ: if archetype = A4 or A5; if A1 (single-unit confirmation only)
├─ Surface CONTACT: only if doc unavailable (specialist to confirm)
└─ Never surface: QUOTE, CAL (too early)

PRE-QUALIFICATION STAGE
├─ Surface QUOTE: always, as the action to trigger
├─ Surface CAL: if archetype = A2, A3, A4, or A5
├─ Surface CONTACT: if user opts for WhatsApp instead of form
├─ Surface LOGI / MOQ: only if user explicitly asks for docs before form
└─ Never surface: PRODUCT, COMPARE, WATERFALL (decision made)

SUPPORT STAGE
├─ Surface CONTACT: mandatory (handoff)
├─ Surface CAL: mandatory (for meeting booking)
├─ Surface LOGI / SPEC / MOQ: on request (document downloads)
├─ Surface QUOTE: as alternative if user hesitates on form
└─ Never re-surface: PRODUCT, COMPARE (flow complete)
```

### 2.3 Node Metadata: Archetype, Accessibility, and Disclaimers

Each node carries metadata that governs when and how it renders:

```typescript
// Pseudo-schema for an information node
interface InformationNode {
  id: string;                          // unique node identifier
  type: NodeType;                      // PROD | SPEC | COMPARE | LOGI | MOQ | QUOTE | CONTACT | CAL
  
  // Access control
  archetypeAccess: MisterArchetype[];  // who can see this node
  stageAccess: MisterStage[];          // in which stages is it surfaceable
  
  // Content
  label: string;                       // "Show me product specs"
  payload: unknown;                    // node-specific data shape
  
  // Rendering
  componentType: string;               // ProductCard | SpecSheet | etc.
  
  // Guardrails
  disclaimers: DisclaimerId[];         // which disclaimer(s) must accompany this node
  hasAbsolutePrice: boolean;           // if true, node fails guardrail check
  requiresHumanReview: boolean;        // if true, log to flags[]
}

// Example: MOQ table for A4 reseller
const nodeMoq: InformationNode = {
  id: 'moq-solar-panels-2024',
  type: 'MOQ',
  archetypeAccess: ['reseller', 'wholesale_partner'],
  stageAccess: ['consideration', 'pre_qualification'],
  label: 'Volume pricing tiers for Solar Panels (Category)',
  payload: {
    rows: [
      { min: 1, max: 10, indexLow: 100, indexHigh: 102, driverNote: 'unit retail' },
      { min: 11, max: 50, indexLow: 92, indexHigh: 96, driverNote: 'bulk discount' },
      { min: 51, max: 200, indexLow: 85, indexHigh: 90, driverNote: 'container load' },
    ]
  },
  componentType: 'MoqTable',
  disclaimers: ['range', 'illustrative'],
  hasAbsolutePrice: false,
  requiresHumanReview: false
};
```

---

## 3. ARCHETYPE RESOLUTION ALGORITHM

### 3.1 The Induction Decision Tree (Q0–Q-LOGI)

The system resolves archetype in 2–4 turns maximum using the tree in MISTER_MASTER_BRIEF Deliverable 1:

```
ENTRY: Unresolved (default)
│
├─ Mister asks: "Are you buying for your own operation, or moving/reselling to someone else?"
│
├─ PATH 1: "For my own use / my company will use it"
│  ├─ Q2A: "One-off, or part of a project/build-out?"
│  │  ├─ "One-off" → Q3A: "Price or specs?" → [A1 or A2]
│  │  ├─ "Part of project" → RESOLVE → A2 (Project Manager)
│  │  └─ "Regular operations" → Q3A
│  │
│  └─ Q3A: "Price or specs?"
│     ├─ "Price / best deal" → RESOLVE → A1 (Lead / End Buyer)
│     └─ "Specs, timeline, docs" → RESOLVE → A2 (Project Manager)
│
├─ PATH 2: "I'm reselling / have customers for it"
│  ├─ Q2B: "End customers or B2B in volume?"
│  │  ├─ "End customers" → Q3B: "Margin/MOQ or exclusivity?" → [A4]
│  │  ├─ "B2B volume" → RESOLVE → A5 (Wholesale Partner)
│  │  └─ "Handle customs too" → RESOLVE → A5
│  │
│  └─ Q3B: "What matters most?"
│     ├─ "Margins / MOQ" → RESOLVE → A4 (Reseller)
│     ├─ "Exclusivity / breadth" → RESOLVE → A4
│     └─ "Volume pricing / multi-market" → RESOLVE → A5
│
├─ PATH 3: "I move freight / handle logistics"
│  └─ RESOLVE → A3 (Logistics Manager) [strong signal]
│     ├─ Optional Q-LOGI confirm: "Customs/corridor or sourcing too?"
│     │  ├─ "Customs/corridor" → CONFIRM → A3
│     │  └─ "Sourcing too" → RE-RESOLVE → A5
│
└─ PATH 4: User resists / unclear
   └─ Mark as: UNRESOLVED (unresolved)
      └─ Behavior: neutral tone, observe from first real question + page context
         → If next question has high signal (e.g., "what's my margin?"), re-run Q1 inline
         → If no signal after 2 turns, default to A1 (lead buyer)
```

### 3.2 Archetype Re-Classification Rules

Archetype is sticky but not locked. Re-classification occurs when:

```
Condition 1: User gives contradictory signals
├─ Example: User resolved to A1 (Lead) asks "what's the MOQ for bulk?" + "can I get territory exclusivity?"
├─ Action: Log the contradiction, silently re-classify to A4 (Reseller)
└─ Implementation: run the decision tree logic on new signals, update archetype_history[]

Condition 2: User changes their stated use case mid-conversation
├─ Example: User resolved to A2 (Project) says "actually we're thinking of reselling this"
├─ Action: Re-run Q2B, re-classify to A4 or A5
└─ Implementation: log change, continue with new lane content

Condition 3: Archetype-specific escalation reveals a different primary need
├─ Example: User resolved to A1, but on pre-qual they mention "we operate across 5 countries"
├─ Action: Check if A5 signals are present; if so, re-classify and escalate to key-accounts
└─ Implementation: detect multi-country mention, check archetype fit, update

Condition 4: Model-assisted classification (if enabled)
├─ Trigger: after 3 turns, archetype still unresolved OR strong contradictory signals
├─ Method: pass conversation history to Claude with a specialized prompt: "Classify this user's archetype based on their language, intent, and constraints. Return: archetype + confidence score + reason."
├─ Action: if confidence > 0.85, auto-classify; if < 0.75, mark as UNRESOLVED (observe mode)
└─ Implementation: optional feature; requires separate model call
```

### 3.3 Signal Scoring (Deterministic Classifier)

For high-confidence, fast-path classification without model calls:

```
Signal Strength Scoring
├─ STRONG signals (single signal can trigger full archetype):
│  ├─ "I move freight" / "logistics" / "clearance" → A3 (Logistics Manager) [always]
│  ├─ "I buy for my own operation" (alone) → lean toward A1
│  ├─ "I'm reselling / have customers" (alone) → lean toward A4
│  ├─ "We handle customs across countries" → A5 (Wholesale Partner)
│  └─ "Multi-SKU / consolidated shipments / 6 containers a month" → A5
│
├─ MEDIUM signals (combine 2 to resolve):
│  ├─ "We buy regularly" + "specs matter" → A2
│  ├─ "I sell to retail" + "margins matter" → A4
│  ├─ "Volume pricing" + "multiple markets" → A5
│  └─ "Project site" + "deadline" → A2
│
├─ WEAK signals (cannot resolve alone; ask follow-up):
│  ├─ "I want to buy equipment"
│  ├─ "What's the price?"
│  ├─ "Tell me about your products"
│  └─ Free text with no clear intent marker
│
└─ Application: on each user message, scan for keywords/phrases → sum signal strengths → if confident, resolve; else ask Q-N
```

---

## 4. STAGE STATE MACHINE & TRANSITION RULES

### 4.1 Formal State Diagram

```
╔════════════════════════════════════════════════════════════════╗
║         MISTER STAGE TRANSITION STATE MACHINE                  ║
╚════════════════════════════════════════════════════════════════╝

                          [ENTRY: Unresolved]
                                   ↓
                    ┌──────────────────────────────┐
                    │ Run Induction (Q0–Q3)        │
                    │ → Resolve archetype          │
                    │ → Write to mister_projects   │
                    │ → Auto-advance to DISCOVERY  │
                    └──────────────────────────────┘
                                   ↓
            ╔═══════════════════════════════════════════╗
            ║      STAGE: DISCOVERY                     ║
            ║  Duration: 2–4 turns (questions 1–5)     ║
            ║  Goal: Understand user intent            ║
            ╚═══════════════════════════════════════════╝
                    ↑                            ↓
         [User browses / asks                [User has stated
          generic questions]              intent + constraint]
                    │                            │
                    ↓                            ↓
            (Stay in DISCOVERY)      Advance to CONSIDERATION
            Loop Q's 1–5 as needed


            ╔═══════════════════════════════════════════╗
            ║      STAGE: CONSIDERATION                 ║
            ║  Duration: 3–5 turns (questions 6–10)    ║
            ║  Goal: Educate, surface options           ║
            ╚═══════════════════════════════════════════╝
                    ↑                            ↓
         [User asks for more                [User says "yes,
          info / compares]              ready to proceed" OR
                    │                   frustration signal]
                    ↓                            │
            (Surface nodes: PROD,              ↓
             SPEC, COMPARE, WATERFALL,   → Escalation trigger
             MOQ, LOGI as needed)           (see 5.1)
                    │
                    ├─ If escalation → SKIP pre-qual, go SUPPORT
                    │
                    └─ Else → Advance to PRE-QUALIFICATION


            ╔═══════════════════════════════════════════╗
            ║      STAGE: PRE-QUALIFICATION             ║
            ║  Duration: 2–3 turns (questions 11–15)   ║
            ║  Goal: Collect hard data for quotation    ║
            ╚═══════════════════════════════════════════╝
                    ↑                            ↓
         [User gives incomplete              [Minimum fields
          data / hesitates]               collected: destination,
                    │                    volume/timeline]
                    ↓                            │
            (Retry specific question)          ↓
             or recovery flow           ESCALATE TO SUPPORT
                    │                  (open quotation form
                    │                   OR human contact)
                    │
                    └─ Once QUOTE triggered → advance SUPPORT


            ╔═══════════════════════════════════════════╗
            ║      STAGE: SUPPORT                       ║
            ║  Duration: 1 turn (handoff)               ║
            ║  Goal: Complete escalation                ║
            ╚═══════════════════════════════════════════╝
                    ↓
         [Render escalation surface
          (QUOTE form, CONTACT card,
           CAL booking, DOC download)]
                    ↓
         ┌──────────────────────────────┐
         │ User leaves chat / completes │
         │ Mister no longer active      │
         └──────────────────────────────┘
```

### 4.2 Transition Conditions (Explicit)

```
DISCOVERY → CONSIDERATION
├─ Condition: User has answered Q2/Q3 (primary intent clear)
├─ Signals:
│  ├─ "Yes, I want equipment for my operation" (intent) + "One-off" / "Project" / "Regular" (constraint)
│  ├─ "I'm reselling" (intent) + channel specified
│  └─ Any path resolution reached in induction
├─ Action: Advance stage = CONSIDERATION; begin Q6 (consideration questions)
└─ Timing: immediate, no user confirmation needed

CONSIDERATION → PRE-QUALIFICATION
├─ Condition: User is educated and ready to provide data OR escalation is unavoidable
├─ Signals:
│  ├─ Positive: "Yes, I'm ready to get a quote" / "Let's move forward" / "Send me the form"
│  ├─ Negative: frustration ("Too expensive!") / spec mismatch / doc unavailable / availability Q
│  │  → these trigger ESCALATION, which SKIPS pre-qual and goes straight to SUPPORT
│  └─ Passive: silence after 3 consideration turns → soft prompt to SUPPORT
├─ Action (positive path): Advance stage = PRE-QUALIFICATION; begin Q11 (pre-qual questions)
└─ Action (negative/escalation): Advance stage = SUPPORT; trigger escalation (see 5.1)

PRE-QUALIFICATION → SUPPORT
├─ Condition: Minimum fields collected OR user explicitly ready OR user abandons
├─ Signals (minimum fields):
│  ├─ A1: destination_city + ruc + timeline
│  ├─ A2: destination_city + spec_confirmed + budget_line + approver
│  ├─ A3: destination_country + volume_classification + Incoterm
│  ├─ A4: territory + volume_commit + import_setup
│  └─ A5: volume_commit + entity_structure + ramp_plan
├─ Action: Advance stage = SUPPORT; trigger escalation
└─ Handoff: open_quotation OR connect_whatsapp (per archetype)

ANY STAGE → SUPPORT (Escalation Bypass)
├─ Condition: Escalation trigger detected (see 5.1)
├─ Action: Skip remaining pre-qual questions; jump directly to SUPPORT
└─ Example: User in CONSIDERATION asks "Is this available now?" → ESCALATE-HUMAN → SUPPORT
```

---

## 5. QUICK ACTION SELECTION ALGORITHM

### 5.1 Quick Action Library (Complete)

```
ask_followup
├─ Use: When Mister has more to learn before recommending
├─ Label examples: "What's your delivery destination?", "Tell me more about your timeline"
├─ Stage use: primarily DISCOVERY, CONSIDERATION
└─ Never: All stages; always available as fallback

show_product
├─ Use: When a specific product from catalog fits the stated need
├─ Label examples: "See the Solar Panel Model X-2000", "Show me our truck lineup in this capacity"
├─ Archetype use: A1, A2, A4, A5
├─ Triggered by: user mentions category OR product keyword
└─ Never: if current_product already shown; if archetype = A3 (logistics focus)

show_comparison
├─ Use: When user asks for alternatives OR multiple options apply
├─ Label examples: "Compare the three best-fit models", "See how Option B compares on price vs specs"
├─ Archetype use: A1 (optional), A2 (spec-driven), A4 (margin-ranked)
├─ Triggered by: user says "show me alternatives" OR Mister suggests comparison
└─ Never: if only one product relevant; if archetype = A3

show_specs
├─ Use: When technical details matter for decision
├─ Label examples: "Download the spec sheet", "See the full technical breakdown"
├─ Archetype use: A2 (mandatory), A3 (dimensions + weights), A1 (optional)
├─ Triggered by: stage = CONSIDERATION, archetype requests detail
└─ Never: DISCOVERY stage (too early)

show_moq
├─ Use: When volume breaks or tier pricing matter
├─ Label examples: "Open the MOQ table for bulk pricing", "See how your volume tier affects cost"
├─ Archetype use: A4 (primary), A5 (multi-SKU matrix), A1 (single-unit confirmation only)
├─ Triggered by: archetype = A4/A5 OR user asks about volume pricing
└─ Never: if user is A1 and single unit (confusing)

download_document
├─ Use: Deliver a document (spec sheet, customs checklist, Incoterm matrix, country framework)
├─ Label examples: "Download the SUNAT checklist for Peru", "Get the Incoterm responsibility matrix"
├─ Archetype use: A2 (compliance docs), A3 (logistics docs), A5 (multi-country framework)
├─ Triggered by: stage ≥ CONSIDERATION, user requests doc OR escalation trigger
└─ Never: DISCOVERY (premature)

open_quotation
├─ Use: Open the quotation form with pre-filled data
├─ Label examples: "Get your quotation started", "Open the quote form"
├─ Archetype use: all (but different form variants per archetype)
├─ Triggered by: stage = PRE-QUALIFICATION OR user ready to commit
└─ Never: DISCOVERY (too early)

book_meeting
├─ Use: Schedule a call with specialist
├─ Label examples: "Book a call with our project specialist", "Schedule a session with the logistics team"
├─ Archetype use: A2 (timeline pressure), A3 (complex coordination), A4 (exclusivity), A5 (always)
├─ Triggered by: stage ≥ CONSIDERATION if complex need; MANDATORY at PRE-QUAL for A2/A3/A5
└─ Never: A1 in DISCOVERY (save for later)

connect_whatsapp
├─ Use: Bypass form, go directly to human via WhatsApp
├─ Label examples: "Chat with us on WhatsApp", "Message the team directly"
├─ Archetype use: all (but primary for A1, A3, A5)
├─ Triggered by: user prefers human contact OR escalation without form
└─ Never: DISCOVERY (user not ready)

explain_cost
├─ Use: Launch the LandedCostWaterfall education node
├─ Label examples: "See how your cost breaks down", "Understand the cost layers (indexed)"
├─ Archetype use: A1 (primary), A4 (margin modeling), A5 (program-level tiers)
├─ Triggered by: user asks "why is it expensive?" OR stage = CONSIDERATION + cost education needed
└─ Never: if user already saw waterfall in this session
```

### 5.2 Selection Rules: 3 Actions Per Turn

**Algorithm: Pick the 3 most contextually relevant actions from the library, ranked by archetype + stage + user signal.**

```
DISCOVERY STAGE
│
├─ A1 (Lead / End Buyer)
│  └─ Rank 1: ask_followup ("What's your deployment location?")
│     Rank 2: show_product (if category hinted)
│     Rank 3: explain_cost (if price concern mentioned)
│
├─ A2 (Project Manager)
│  └─ Rank 1: ask_followup ("What's your spec standard?")
│     Rank 2: show_specs (technical detail)
│     Rank 3: book_meeting (if timeline mentioned)
│
├─ A3 (Logistics Manager)
│  └─ Rank 1: ask_followup ("Which corridor are you using?")
│     Rank 2: show_specs (weights/dims for container planning)
│     Rank 3: download_document (Incoterm matrix)
│
├─ A4 (Reseller)
│  └─ Rank 1: ask_followup ("What market are you targeting?")
│     Rank 2: show_product (category range)
│     Rank 3: show_moq (volume tiers)
│
└─ A5 (Wholesale Partner)
   └─ Rank 1: ask_followup ("How many countries / SKUs?")
      Rank 2: show_moq (multi-SKU matrix)
      Rank 3: book_meeting (high-touch)

CONSIDERATION STAGE
│
├─ A1 (Lead / End Buyer)
│  └─ Rank 1: explain_cost (education)
│     Rank 2: show_comparison (if browsing)
│     Rank 3: open_quotation (when ready)
│
├─ A2 (Project Manager)
│  └─ Rank 1: show_specs (compliance focus)
│     Rank 2: download_document (bundle)
│     Rank 3: book_meeting (schedule call)
│
├─ A3 (Logistics Manager)
│  └─ Rank 1: download_document (country checklist)
│     Rank 2: show_specs (container fit)
│     Rank 3: connect_whatsapp (specialist Q)
│
├─ A4 (Reseller)
│  └─ Rank 1: show_moq (margin analysis)
│     Rank 2: explain_cost (resale modeling)
│     Rank 3: show_comparison (best-margin SKUs)
│
└─ A5 (Wholesale Partner)
   └─ Rank 1: show_moq (volume tiers)
      Rank 2: download_document (multi-country framework)
      Rank 3: book_meeting (strategy session)

PRE-QUALIFICATION STAGE
│
├─ A1 (Lead / End Buyer)
│  └─ Rank 1: open_quotation (form)
│     Rank 2: connect_whatsapp (alternative)
│     Rank 3: ask_followup (collect missing data)
│
├─ A2 (Project Manager)
│  └─ Rank 1: open_quotation (formal)
│     Rank 2: book_meeting (confirm details)
│     Rank 3: download_document (pack)
│
├─ A3 (Logistics Manager)
│  └─ Rank 1: connect_whatsapp (specialist)
│     Rank 2: download_document (doc checklist)
│     Rank 3: book_meeting (coordination)
│
├─ A4 (Reseller)
│  └─ Rank 1: open_quotation (reseller terms)
│     Rank 2: book_meeting (partnership team)
│     Rank 3: connect_whatsapp (negotiation)
│
└─ A5 (Wholesale Partner)
   └─ Rank 1: book_meeting (MANDATORY)
      Rank 2: connect_whatsapp (key-accounts intro)
      Rank 3: open_quotation (program request)

SUPPORT STAGE
│
├─ All archetypes
│  └─ Rank 1: connect_whatsapp (handoff to human)
│     Rank 2: book_meeting (if not already booked)
│     Rank 3: download_document (supporting materials)
```

---

## 6. ESCALATION ROUTING MATRIX

### 6.1 Escalation Triggers (Comprehensive)

```
TRIGGER TYPE 1: PRICE / COST REQUEST
├─ User asks: "How much is this?" / "What's the total cost?" / "Quote me"
├─ Mister behavior: educate with indexed waterfall + disclaimer
├─ Then escalate: open_quotation form (with archetype flag)
└─ Action: trigger → QUOTE form OR connect_whatsapp

TRIGGER TYPE 2: AVAILABILITY / LEAD TIME QUERY
├─ User asks: "When can you ship?" / "Is this in stock?" / "How long to deliver?"
├─ Mister behavior: NEVER speculate; state "must be confirmed by team"
├─ Then escalate: connect_whatsapp to human OR open_quotation with note
└─ Action: trigger → CONTACT (logistics specialist) OR connect_whatsapp

TRIGGER TYPE 3: SPEC MISMATCH / CUSTOM REQUEST
├─ User spec: doesn't match any catalog product OR is partially matched
├─ Mister behavior: surface nearest catalog item, acknowledge delta
├─ Then escalate: connect_whatsapp to project specialist (document the gap)
└─ Action: trigger → CONTACT (project specialist)

TRIGGER TYPE 4: DOC UNAVAILABLE
├─ User requests: country-specific customs checklist, compliance doc, or HS guidance
├─ Backend: document doesn't exist for country + product type
├─ Mister behavior: "That doc isn't in our library yet; let me connect you to our logistics team"
├─ Then escalate: connect_whatsapp to logistics specialist
└─ Action: trigger → CONTACT (logistics specialist)

TRIGGER TYPE 5: FRUSTRATION / PRICE OBJECTION
├─ User sentiment: "This is too expensive!" / "Can you negotiate?" / expressions of doubt
├─ Mister behavior: empathize, re-explain cost structure, offer alternatives
├─ Then escalate (if repeated): connect_whatsapp to sales
└─ Action: trigger → CONTACT (sales) OR offer_recovery (show comparison)

TRIGGER TYPE 6: EXCLUSIVITY / TERRITORY / PRIVATE-LABEL REQUEST
├─ User asks: "Can I be the exclusive distributor?" / "Private-label options?" / "Territory deal?"
├─ Mister behavior: "That's partnership territory; let me bring in the right team"
├─ Then escalate: connect_whatsapp to partnerships team
└─ Action: trigger → CONTACT (partnerships / channel)

TRIGGER TYPE 7: MULTI-COUNTRY / MULTI-SKU / PROGRAM SCOPE
├─ User signals: "We operate in 3 countries" / "6 containers/month" / "Multi-SKU consolidation"
├─ Archetype check: likely A5; if not, re-classify to A5
├─ Mister behavior: "This is program scope; I'll bring in the key-accounts desk"
├─ Then escalate: ALWAYS human for A5 at any pre-qual signal
└─ Action: trigger → CONTACT (key-accounts) OR book_meeting

TRIGGER TYPE 8: CLEARANCE COORDINATION NEEDED
├─ User asks: "Can you handle customs clearance?" / "Multi-country doc coordination?"
├─ Mister behavior: confirm Wings can offer it, route to logistics specialist
├─ Then escalate: connect_whatsapp to broker desk
└─ Action: trigger → CONTACT (logistics / broker desk)

TRIGGER TYPE 9: TURN LIMIT EXCEEDED
├─ Condition: mister_projects.turn_count reaches 40
├─ Mister behavior: "We've been chatting for a while; let's get a specialist involved"
├─ Then escalate: offer human handoff + WhatsApp
└─ Action: trigger → CONTACT + suggest_whatsapp_save

TRIGGER TYPE 10: UNCERTAINTY / BLUFF RISK
├─ Condition: Mister cannot confidently answer; archetype-specific data missing
├─ Mister behavior: "I can't confirm that; our team will review it with you"
├─ Then escalate: connect_whatsapp
└─ Action: trigger → CONTACT (general sales / specialist per archetype)
```

### 6.2 Routing Matrix: Archetype × Stage × Trigger → Escalation Type

```
┌────────────┬──────────┬────────────────────────┬──────────────────────┐
│ Archetype  │ Stage    │ Trigger                │ Escalation Route     │
├────────────┼──────────┼────────────────────────┼──────────────────────┤
│ A1 (Lead)  │ Discover │ "just browsing"        │ (no escalation)      │
│            │          │ price question         │ → explain_cost       │
│            │          │ availability question  │ → connect_whatsapp   │
│            │          │ spec mismatch          │ → contact (sales)    │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Consider │ "ready to buy" signal  │ → open_quotation     │
│            │          │ frustration ("too $")  │ → connect_whatsapp   │
│            │          │ show_comparison loop   │ (stay in stage)      │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Pre-qual │ fields collected       │ → open_quotation     │
│            │          │ hesitation/abandonment │ → connect_whatsapp   │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Support  │ (all)                  │ → quotation form     │
│            │          │                        │    + WhatsApp option  │
├────────────┼──────────┼────────────────────────┼──────────────────────┤
│ A2 (Proj)  │ Discover │ "just looking"         │ (no escalation)      │
│            │          │ spec / standard Q      │ ask_followup         │
│            │          │ timeline mentioned     │ book_meeting hint    │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Consider │ spec confirmed         │ download_document    │
│            │          │ compliance Q           │ (bundle + specialist)│
│            │          │ spec mismatch          │ → contact (project)  │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Pre-qual │ budget + approver OK   │ → open_quotation     │
│            │          │                        │    (formal)          │
│            │          │ tight timeline         │ → book_meeting       │
│            │          │ doc gaps               │ → contact (project)  │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Support  │ (all)                  │ → contact +          │
│            │          │                        │    meeting +         │
│            │          │                        │    doc bundle        │
├────────────┼──────────┼────────────────────────┼──────────────────────┤
│ A3 (Logi)  │ Discover │ corridor / route Q     │ ask_followup         │
│            │          │ container / commodity  │ (stay in stage)      │
│            │          │ Incoterm question      │ show_specs (weights) │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Consider │ doc checklist request  │ download_document    │
│            │          │ doc unavailable        │ → contact (logistics)│
│            │          │ hazmat / special       │ → contact (logistics)│
│            │          │ reefer / oversize      │ → contact (specialist│
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Pre-qual │ supply-only confirmed  │ → open_quotation     │
│            │          │ clearance coordination │ → contact (broker)   │
│            │          │ recurring lane         │ → book_meeting       │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Support  │ (all)                  │ → contact (logistics)│
│            │          │                        │    + doc downloads   │
│            │          │                        │    + meeting option  │
├────────────┼──────────┼────────────────────────┼──────────────────────┤
│ A4 (Resell)│ Discover │ category / channel Q   │ ask_followup         │
│            │          │ market interest        │ show_product         │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Consider │ MOQ table request      │ show_moq             │
│            │          │ margin/landed cost     │ explain_cost         │
│            │          │ "what's my margin?"    │ (edu redirect)       │
│            │          │ category not carried   │ → contact (partners) │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Pre-qual │ volume + territory OK  │ → open_quotation     │
│            │          │                        │    (reseller-flagged)│
│            │          │ sub-MOQ / exclusivity  │ → contact (partners) │
│            │          │ import setup confirm   │ ask_followup         │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Support  │ (all)                  │ → contact (channel)  │
│            │          │                        │    + reseller pack   │
│            │          │                        │    + meeting         │
├────────────┼──────────┼────────────────────────┼──────────────────────┤
│ A5 (Whole) │ Discover │ countries / volume /   │ ask_followup         │
│            │          │ clearance scope Q      │ show_moq (multi-SKU) │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Consider │ volume tiers           │ show_moq             │
│            │          │ multi-country docs     │ download_document    │
│            │          │ program pricing Q      │ explain_cost (edu)   │
│            │          │ (no auto-quote)        │ then escalate        │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Pre-qual │ [ALWAYS AUTO-ESCALATE] │ → contact            │
│            │          │ volume commit + entity │    (key-accounts)    │
│            │          │ clearance + framework  │ → book_meeting       │
│            │          │ (NO auto-quote)        │ → open_quotation     │
│            │          │                        │    (program-flagged) │
│            ├──────────┼────────────────────────┼──────────────────────┤
│            │ Support  │ (all)                  │ → contact (key-acct) │
│            │          │                        │    + meeting +       │
│            │          │                        │    program brief     │
└────────────┴──────────┴────────────────────────┴──────────────────────┘
```

### 6.3 Contact Directory

```
SALES (general)
├─ Name: Wings Sales Team
├─ Role: First contact for A1 price/frustration, general inquiries
├─ WhatsApp: +50760250735
└─ Use when: escalation has no archetype-specific handler

PROJECT SPECIALIST
├─ Name: Projects & Procurement
├─ Role: A2 (Project Manager) spec match, compliance, procurement docs, timeline
├─ Category: A2 specialists (by spec type if available)
└─ Use when: A2 spec question, custom inquiry, doc bundle needed

LOGISTICS SPECIALIST / BROKER DESK
├─ Name: Logistics & Customs
├─ Role: A3 (Logistics Manager) corridor routing, Incoterm splits, SUNAT docs, clearance coordination
├─ Category: A3 specialists (Tacna/Iquique/Peru/Chile experts)
└─ Use when: A3 doc gap, clearance coordination, container optimization, lead-time Q

CHANNEL / PARTNERSHIPS TEAM
├─ Name: Channel & Partnerships
├─ Role: A4 (Reseller) MOQ negotiation, exclusivity, private-label, territory negotiation
├─ Category: A4 channel managers
└─ Use when: A4 exclusivity, private-label, sub-MOQ, territory deal

KEY ACCOUNTS / WHOLESALE DESK
├─ Name: Key Accounts & Wholesale
├─ Role: A5 (Wholesale / B2B Partner) program-level design, multi-country, framework agreements, volume tiers
├─ Category: A5 program managers
└─ Use when: A5 reaches pre-qual, framework needed, multi-country coordination

[Fallback]
└─ If contact not found: default to sales + WhatsApp +50760250735
```

---

## 7. SURFACE CARD RENDERING LOGIC

### 7.1 When Each Surface Renders (Decision Tree)

```
User message arrives
├─ Check: does message trigger escalation? (see 5.1 list)
│  ├─ YES → render escalation surface (CONTACT + optional CAL + optional QUOTE)
│  └─ NO → check content requirement
│
└─ Check: does message request specific content?
   ├─ "show me the product" / product name mentioned
   │  ├─ YES → surface PRODUCT card
   │  └─ render: ProductCard (image + key specs + MOQ link + CTA)
   │
   ├─ "what about specs?" / "technical details?" / "see the data sheet"
   │  ├─ Stage check: if DISCOVERY → skip (too early)
   │  ├─ Archetype check: if A2 → always surface
   │  ├─ YES → surface SPEC sheet
   │  └─ render: SpecSheet (tabular data + download link)
   │
   ├─ "compare with..." / "show alternatives" / "which is best?"
   │  ├─ Stage check: if DISCOVERY → skip
   │  ├─ Archetype check: if A1/A2/A4 → surface COMPARE
   │  ├─ YES → surface COMPARISON
   │  └─ render: ComparisonView (side-by-side, delta highlights)
   │
   ├─ "how much does it cost?" / "total cost?" / "price"
   │  ├─ Stage check: always allow (education-focused)
   │  ├─ Archetype check: always allow
   │  ├─ YES → surface WATERFALL (indexed, never absolute)
   │  └─ render: LandedCostWaterfall (5 segments + disclaimers)
   │
   ├─ "what about volume?" / "bulk pricing?" / "MOQ"
   │  ├─ Archetype check: if A4/A5 → surface MOQ
   │  ├─ Stage check: if CONSIDERATION+ → surface MOQ
   │  ├─ YES → surface MOQ TABLE
   │  └─ render: MoqTable (volume bands, indexed ranges, tooltips)
   │
   ├─ "document" / "checklist" / "HS code" / "SUNAT" / "Incoterm matrix"
   │  ├─ Archetype check: if A3/A2 → prioritize
   │  ├─ Stage check: if CONSIDERATION+ and doc exists in backend
   │  ├─ YES → surface DOCUMENT
   │  ├─ render: DocumentLink (title + download CTA)
   │  └─ NO (doc doesn't exist) → escalate to specialist (trigger TYPE 4)
   │
   └─ Default: NO surface (just answer text)
      └─ keep conversation flowing; surface will be suggested via quick_actions
```

### 7.2 Surface Rendering Constraints (Never render together)

```
Rule 1: One primary surface per turn
├─ Render ONE main content surface (PRODUCT, SPEC, COMPARE, WATERFALL, MOQ, or DOCUMENT)
├─ Additional surfaces only if they directly support the primary (e.g., SPEC + download link)
└─ Rationale: prevent cognitive overload; one decision per turn

Rule 2: No surface in DISCOVERY stage (except on explicit request)
├─ Exception: if user asks "show me specs" in DISCOVERY, show SPEC
├─ Exception: if user asks "what's the cost structure", show WATERFALL
├─ Default: ask questions first, surfaces only after intent is clear

Rule 3: QUOTE and CONTACT surfaces render only on escalation
├─ Never render QUOTE form or CONTACT card in CONSIDERATION
├─ Only render when stage = PRE-QUALIFICATION or SUPPORT, OR escalation triggered
└─ Rationale: route to decision, not decision-forcing

Rule 4: WATERFALL (cost education) never claims absolute numbers
├─ Every segment must carry an index-range pair (low, high)
├─ Every segment must display a disclaimer ID
├─ Component will throw an error at dev time if missing
└─ Rationale: architectural enforcement of no-price guarantee

Rule 5: COMPARE surfaces only if 2+ products are relevant
├─ Never show comparison with single product (confusing)
├─ Always surface ≥2 products, or surface none
└─ Rationale: comparison requires choice

Rule 6: CONTACT surface shows 1 contact per escalation
├─ Resolve the correct contact from contact directory
├─ Show name + role + WhatsApp only (no email for simplicity)
├─ If contact not found, default to sales + ops WhatsApp
└─ Rationale: eliminate choice paralysis; one path to human
```

---

## 8. INFORMATION MODEL: Complete Taxonomy Map

### 8.1 Entity Relationships (Conceptual)

```
User / Session
├─ 1–many: Conversation turns (transcript)
├─ 1–one: Mister archetype (sticky, re-classifiable)
├─ 1–one: Mister stage (journey progression)
├─ 1–one: Collected data (destination, volume, timeline, RUC, etc.)
└─ 1–many: Escalations (if user re-engages after form submit)

Archetype
├─ 1–many: Question banks (by stage)
├─ 1–many: Information nodes (content pathways)
├─ 1–one: Escalation strategy (who to route to, when)
└─ 1–many: Quick actions (context-specific CTAs)

Stage
├─ 1–many: Conversation turns (typical range per stage)
├─ 1–many: Questions (question bank for this stage)
├─ 1–many: Escalation triggers (conditions that advance stage)
└─ 1–one: Minimum data required (to advance to next stage)

Information Node
├─ 1–one: Content payload (product data, spec sheet, doc URL, MOQ table)
├─ 1–many: Access rules (archetype + stage visibility)
├─ 1–many: Disclaimers (required per node type)
├─ 1–one: Rendering component (ProductCard, SpecSheet, etc.)
└─ 1–one: Backend source (products table, documents storage, etc.)

Escalation
├─ 1–one: Trigger (price Q, spec mismatch, availability, doc gap, frustration, etc.)
├─ 1–one: Route type (quote form, contact, document, meeting, WhatsApp)
├─ 1–one: Destination contact (sales, project, logistics, partnerships, key-accounts)
└─ 1–many: Quick actions (what to show to user on escalation)
```

### 8.2 Content Type Decision Matrix (What Goes Into Backend vs Prompt)

```
STATIC (lives in prompt, never changes at runtime)
├─ System prompt (Mister voice, hard rules)
├─ Question banks (discovery → support)
├─ Induction decision tree
├─ Financial literacy microcopy (disclaimers, explanations)
├─ CTA library (20 CTAs by archetype × stage)
├─ Curriculum progression (modules by archetype)
└─ Quick action mapping rules

DYNAMIC (lives in Supabase or external service, changes per business need)
├─ Products (catalog inventory)
├─ Product specs (technical data sheets)
├─ MOQ tables (volume-tier pricing)
├─ Logistics documents (country checklists, Incoterm matrices, corridor guides)
├─ Contact directory (sales, project, logistics, partnerships, key-accounts)
├─ Comparison matrices (pre-computed or on-demand)
├─ Quotation form (form URL + prefill endpoint)
└─ Meeting booking (Calendly or equivalent)

EPHEMERAL (lives in session, per-conversation)
├─ Archetype (resolved from induction)
├─ Stage (discovery → consideration → pre-qual → support)
├─ Collected data (destination, volume, RUC, timeline, approver, etc.)
├─ Conversation history (full transcript, trimmed before model call)
└─ Escalation state (what was triggered, what surface to render)
```

---

## 9. KNOWLEDGE GRAPH: Information Flows

### 9.1 Discovery-to-Escalation Flow Map

```
ENTRY: User lands on /mister
├─ Session created, mister_projects row inserted
├─ Archetype = unresolved, stage = discovery
└─ Mister greeting rendered (hardcoded first message, no API call)

TURN 1: User says anything
├─ Parse for induction signal (Q0–Q3 decision tree)
├─ If strong signal detected → resolve archetype
├─ Write archetype + signal_log to mister_projects
├─ Advance stage = discovery
└─ Ask follow-up question (Q1–Q5 per lane)

TURN 2–3: Discovery questions
├─ Collect: use case, setting, budget, geography, timeline, product interest
├─ Surface: ask_followup (keep collecting data)
├─ Check exit condition: is primary intent + constraint clear?
│  ├─ YES → advance to stage = consideration
│  └─ NO → ask next discovery Q
└─ Data written to collected jsonb

TURN 4–8: Consideration questions
├─ Surface content based on archetype:
│  ├─ A1: show product + explain cost structure
│  ├─ A2: show specs + compliance docs
│  ├─ A3: show container specs + Incoterm matrix
│  ├─ A4: show MOQ table + margin model
│  └─ A5: show volume tiers + multi-country framework
├─ Check escalation triggers:
│  ├─ Price Q → explain_cost + route to quotation
│  ├─ Availability Q → route to specialist
│  ├─ Spec mismatch → route to project specialist
│  ├─ Doc gap → route to logistics specialist
│  ├─ Frustration → offer comparison or human
│  └─ None → continue consideration
└─ If escalation detected → skip to SUPPORT

TURN 9–11: Pre-qualification questions
├─ Collect hard data (destination, RUC, volume, timeline, approver, import setup)
├─ Check if minimum fields met per archetype
├─ Surface: ask_followup (data collection) + optional book_meeting
└─ When minimum fields gathered → advance to stage = support

TURN 12: Support (Escalation)
├─ Check escalation type:
│  ├─ Quote form → surface open_quotation (prefilled)
│  ├─ Meeting → surface book_meeting (Calendly link)
│  ├─ Document → surface download_document
│  └─ Human contact → surface connect_whatsapp (+ contact card)
├─ Write escalation_type + escalation_at to mister_projects
├─ Render escalation surface + quick actions
└─ Mister no longer active; conversation ends

[END]
└─ Either: user submits form / books meeting / downloads doc / WhatsApp
   → Separate flow creates lead + sends notifications
```

### 9.2 Archetype-Specific Content Pathways

```
A1 — LEAD / END BUYER

Entry question → "I want to buy this for myself"
│
├─ Discovery (2–4 turns)
│  └─ Collect: use case, setting, budget, destination, comparison intent
│     Surfaces: ask_followup
│
├─ Consideration (3–5 turns)
│  ├─ Route 1: "Tell me how cost works" → explain_cost (WATERFALL)
│  │  └─ Education on layers: product → freight → insurance → duties → last-mile
│  ├─ Route 2: "Show alternatives" → show_comparison
│  │  └─ Compare 2–3 products side-by-side
│  ├─ Route 3: "Is it available?" → escalate (CONTACT specialist)
│  │  └─ Trigger: availability Q (TYPE 2)
│  └─ Route 4: "I'm ready to buy" → advance to pre-qual
│
├─ Pre-qualification (2–3 turns)
│  └─ Collect: destination_city, ruc, decision_timeline
│     When complete → escalate (QUOTE form)
│
└─ Support (1 turn)
   └─ Surface: open_quotation + connect_whatsapp option

---

A2 — PROJECT MANAGER

Entry question → "This is for a project / site with specs and deadlines"
│
├─ Discovery (2–4 turns)
│  └─ Collect: project_context, spec_standard, on_site_date, destination, single_or_multiple
│     Surfaces: ask_followup
│
├─ Consideration (3–5 turns)
│  ├─ Route 1: "Does it match my spec?" → show_specs + show_comparison
│  │  └─ Spec-driven comparison against user's standard
│  ├─ Route 2: "What about compliance?" → download_document (spec pack + certs)
│  │  └─ Bundle: spec sheet + certificates + compliance docs
│  ├─ Route 3: "Spec doesn't match" → escalate (CONTACT project specialist)
│  │  └─ Trigger: spec mismatch (TYPE 3)
│  └─ Route 4: "Ready to proceed" → book_meeting (confirm details)
│
├─ Pre-qualification (2–3 turns)
│  └─ Collect: budget_line, approver_name, formal_vs_budgetary, destination_final
│     When complete + budget_line confirmed → escalate
│
└─ Support (1 turn)
   └─ Surface: open_quotation (formal) + book_meeting + download_document (pack)

---

A3 — LOGISTICS MANAGER

Entry question → "I handle freight / customs / corridor logistics"
│
├─ Discovery (2–4 turns)
│  └─ Collect: corridor (Tacna/Iquique), origin_country, destination_country, commodity, container_type, incoterm
│     Surfaces: ask_followup
│
├─ Consideration (3–5 turns)
│  ├─ Route 1: "Incoterm split?" → download_document (Incoterm matrix)
│  │  └─ Show responsibility split (who pays what segment)
│  ├─ Route 2: "Container fit?" → show_specs (weights + dimensions)
│  │  └─ Help optimize container fill
│  ├─ Route 3: "Customs docs?" → download_document (country checklist)
│  │  └─ If doc exists → download; if not → escalate
│  │     Trigger: doc unavailable (TYPE 4) → CONTACT logistics specialist
│  ├─ Route 4: "Hazmat / reefer / oversize?" → escalate (CONTACT logistics specialist)
│  │  └─ Trigger: special commodity (TYPE 4) → specialist
│  └─ Route 5: "Ready to move forward" → ask about volume + recurring
│
├─ Pre-qualification (2–3 turns)
│  └─ Collect: lane_commitment (recurring?), volume_classification, clearance_needed
│     If clearance → escalate (CONTACT broker desk)
│     If supply-only → continue to support
│
└─ Support (1 turn)
   └─ Surface: download_document (all docs) + connect_whatsapp (specialist) + book_meeting (coordination)

---

A4 — RESELLER

Entry question → "I'm reselling this to my customers / territory"
│
├─ Discovery (2–4 turns)
│  └─ Collect: market, category_interest, channel (online/retail/both), order_frequency
│     Surfaces: ask_followup, show_product (category range)
│
├─ Consideration (3–5 turns)
│  ├─ Route 1: "What's the MOQ?" → show_moq (volume tiers)
│  │  └─ Show volume breaks with indexed cost (not absolute prices)
│  ├─ Route 2: "What's my margin?" → explain_cost (WATERFALL, resale-framed)
│  │  └─ Show how landed-cost affects resale margin formula
│  ├─ Route 3: "Best-margin SKUs?" → show_comparison (margin-ranked)
│  │  └─ Highlight highest-margin options in category
│  ├─ Route 4: "Exclusivity?" → escalate (CONTACT partnerships)
│  │  └─ Trigger: exclusivity request (TYPE 6) → partnerships team
│  └─ Route 5: "Ready to proceed" → ask about volume + territory
│
├─ Pre-qualification (2–3 turns)
│  └─ Collect: volume_commit, territory, import_setup_ready
│     When complete → escalate
│
└─ Support (1 turn)
   └─ Surface: open_quotation (reseller-flagged) + book_meeting (partnerships) + download_document (reseller pack)

---

A5 — WHOLESALE / B2B LOGISTICS PARTNER

Entry question → "We supply multiple countries / handle multi-SKU / volume + integration"
│
├─ Discovery (2–4 turns)
│  └─ Collect: countries_supplied, sku_count, monthly_volume, clearance_scope, recurring_or_spot
│     Surfaces: ask_followup, show_moq (multi-SKU matrix)
│
├─ Consideration (3–5 turns)
│  ├─ Route 1: "Multi-SKU consolidation?" → show_moq (volume tiers + multi-SKU)
│  │  └─ Show how volume is calculated across categories
│  ├─ Route 2: "Multi-country docs?" → download_document (framework)
│  │  └─ Multi-country documentation template / guide
│  ├─ Route 3: "Program-level pricing?" → explain_cost (program tiers, indexed)
│  │  └─ Show volume-tier indexes at program level (NOT auto-quote)
│  ├─ Route 4: "Clearance across borders?" → escalate (CONTACT broker desk + logistics)
│  │  └─ Trigger: clearance coordination (TYPE 8)
│  └─ Route 5: "Framework agreement?" → book_meeting + escalate (CONTACT key-accounts)
│
├─ Pre-qualification (2–3 turns)
│  └─ ALWAYS ESCALATE AT PRE-QUAL (A5 is always human-mediated)
│     Collect: volume_commit, ramp_plan, entity_structure, framework_needed
│     → CONTACT key-accounts desk + book_meeting + program quotation request
│
└─ Support (1 turn)
   └─ Surface: connect_whatsapp (key-accounts) + book_meeting + download_document (program brief)
```

---

## 10. IMPLEMENTATION CHECKLIST

### 10.1 Backend Build Sequence

- [ ] Implement `MisterContext` type (archetype, stage, collected, history, etc.)
- [ ] Implement `InformationNode` type and registry
- [ ] Implement induction decision tree logic (Q0–Q3, auto-resolve)
- [ ] Implement archetype re-classification rules
- [ ] Implement stage transition logic (discovery → consideration → pre-qual → support)
- [ ] Implement quick-action selection algorithm (archetype × stage → 3 actions)
- [ ] Implement escalation trigger detection (10 trigger types)
- [ ] Implement escalation routing matrix (archetype × stage × trigger → contact/form/doc)
- [ ] Implement surface rendering decision tree (when to show PROD/SPEC/COMPARE/etc.)
- [ ] Implement contact directory resolution
- [ ] Implement turn-counting + rate limiting
- [ ] Implement guardrail enforcement (4-layer defense)
- [ ] Implement LandedCostWaterfall component (indexed-only, disclaimer-enforced)

### 10.2 Prompt/Conversation Engine Sequence

- [ ] Load system prompt (from Deliverable 3)
- [ ] Load question banks (5 archetypes × 4 stages = 20 question sets)
- [ ] Load induction logic (decision tree as pseudo-code in prompt)
- [ ] Load financial literacy content (waterfall explanations, cost-driver copy)
- [ ] Load CTA library (20 CTAs, with firing conditions)
- [ ] Load voice/tone calibration (per-archetype examples)
- [ ] Load curriculum progression (education checkpoints per archetype)

### 10.3 Testing Checklist

- [ ] Test induction: verify all 11 decision-tree paths resolve correctly
- [ ] Test archetype re-classification: verify contradictory signals trigger re-resolve
- [ ] Test stage transitions: verify conditions for each → are enforced
- [ ] Test quick-actions: verify 3 relevant actions selected per (archetype, stage)
- [ ] Test escalation: verify all 10 trigger types route correctly
- [ ] Test guardrails: verify no price numbers, availability promises, or absolute figures leak through
- [ ] Test surfaces: verify content only renders when archetype + stage permit it
- [ ] Test waterfall: verify component throws error if disclaimer missing
- [ ] Test turn trim: verify history is trimmed to last 15 turns before model call
- [ ] Test rate limiting: verify 40-turn session limit + IP limits work

---

## END OF IA SPECIFICATION

**This document defines the complete information structure for Mister.** It maps user archetypes to conversation stages, information nodes to content retrieval rules, and escalation triggers to routing destinations. Implement per the checklist above; test per the validation suite. The result is a conversational system that scales to 10× content volume without restructuring — because the taxonomy is built on user mental models and exhaustive decision rules, not on specific products or document counts.
