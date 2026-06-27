# Educator Contribution — Mister Curriculum UX Patterns

**Agent:** Educator (curriculum-design-audit lens)
**Brief section:** Deliverable 5 (Curriculum Progression Maps) + Support Architecture
**Scope:** Learning UX patterns only. No code.

---

## 1. Knowledge Checkpoints — How They Feel in the UI

### Interaction Pattern

A checkpoint is never a test. It is Mister checking alignment before advancing — the conversational equivalent of a senior specialist pausing after a key explanation and asking "does that match your situation?" not "did you get that?"

The exact sequence:

1. Mister delivers a module beat: a focused piece of educational content (one concept, not a lecture).
2. A surface card appears in the UI alongside the message — the waterfall, MOQ table, spec sheet, or Incoterm matrix. This gives the user something concrete to look at while processing the explanation. The surface is load-bearing here: it externalizes the concept so the checkpoint is confirming comprehension of something visible, not abstract.
3. Mister ends the message with one checkpoint line. It is phrased as alignment confirmation ("does that line up with how you saw it?"), not a comprehension probe ("do you understand?"). The user is never put in the position of being assessed.
4. Quick actions at this moment are: one that confirms and advances ("yes, let's keep going" style action), one that drills deeper on the concept just explained, and one that moves toward the commercial next step. This gives the user three paths — confirm, expand, or skip — without making any of them feel like the "right" answer.
5. Any response — including a brief "yes", a follow-up question, or a commercial signal ("I'm ready to quote") — registers as progression. Mister reads the direction of the response, not its correctness. Confusion or pushback → Mister restates with a concrete example (one sentence) before moving on.
6. There is no score. No "correct." No "great." Mister's acknowledgment of a confirmed checkpoint is simply to continue — the next message assumes the prior knowledge is shared.

### Per-Archetype Checkpoint Lines

The lines below are Mister's exact message endings at each checkpoint moment. Two to three per archetype, covering the module beats where comprehension matters most before advancing.

---

**A1 — Lead / End Buyer**

The challenge here is that this user does not know what they do not know. Checkpoints need to surface the assumption gap (unit price ≠ landed cost) without making the user feel foolish for having had that assumption.

Module 2 checkpoint (landed cost basics, after the waterfall is shown):
> "Make sense that freight, insurance, and duties stack on top of the unit price — they're not included in what you see on a catalog or supplier quote?"

Module 3 checkpoint (Incoterms, after the responsibility split is explained):
> "Of those options, DDP puts the least on your plate — Wings handles everything to your door. Does that match what you were picturing, or do you want to stay in control of the local delivery side?"

Module 4 checkpoint (quotation step readiness, before triggering the form):
> "So if I open the quotation form now, I'll pre-fill your destination and what we've discussed — you'd just need to confirm the tax ID for the import documentation. Ready to do that, or still have questions first?"

---

**A2 — Project Manager**

This user is deadline-driven and document-oriented. Checkpoints should confirm that the information Mister provided maps onto the user's actual procurement reality — not that they understood an abstraction.

Module 1 checkpoint (spec-to-catalog matching, after the product spec is shown):
> "On the points your project spec requires — does this model cover them, or is there a rating or standard it needs to hit that isn't on this sheet?"

Module 2 checkpoint (compliance and certificates, after doc set is surfaced):
> "Your finance or customs team will likely ask for the certificate of origin and the technical compliance doc — do you already have those in your possession, or should I bundle them now?"

Module 3 checkpoint (Incoterm + delivery scheduling):
> "On CIF your project receives the goods at the destination port; inland and clearance from there are on your side. Does your project plan account for that leg, or is that a gap we should flag in the quotation?"

---

**A3 — Logistics Manager**

This user is already fluent in trade. Checkpoints are not teaching moments — they are confirming that Wings-specific corridor and SUNAT details are mapped correctly onto the user's existing knowledge. The tone is peer-level, not instructional.

Module 1 checkpoint (Tacna/Iquique free-zone flow, after corridor overview is surfaced):
> "Goods sit duty-suspended in the zone and nationalize on exit — on that basis, does the ZOFRATACNA flow work for your routing, or are you looking at Iquique as the primary staging point?"

Module 2 checkpoint (SUNAT documentation set):
> "For your destination and commodity type, the set is: commercial invoice, packing list, BL, and certificate of origin. Got all four, or is there a gap in that list we should pull?"

Module 4 checkpoint (Incoterm responsibility split, which is the exit gate for this archetype):
> "On CIF terms Wings carries to the destination port — from the zone exit it is yours. Does that split match how this deal is written, or do we need to look at DAP or DDP?"

---

**A4 — Reseller**

This user thinks in margin and territory. Checkpoints confirm that the commercial logic has landed — specifically that the user can now do the margin calculation themselves, which is the prerequisite for a real reseller conversation.

Module 2 checkpoint (MOQ economics, after the MOQ table is shown):
> "At the tier you are looking at, the per-unit landed cost changes — clear on how hitting the next tier affects what you can actually sell it for?"

Module 3 checkpoint (landed cost to resale margin, after the waterfall in margin-framing is shown):
> "So your margin is resale price minus landed cost, and landed cost moves with your Incoterm choice and the tier you order at — does that calculation work for your typical order cycle?"

Module 4 checkpoint (reseller terms and territory, before routing to channel team):
> "To move this to the channel team I need your territory and a rough volume commitment — not a contract, just enough for them to come to the table with the right structure. Have you got a number?"

---

**A5 — Wholesale / B2B Logistics Partner**

This user operates at program level. Checkpoints are confirmations that program-level detail has been registered — specifically that the user can map Wings' structure onto their own procurement and logistics architecture.

Module 1 checkpoint (multi-SKU MOQ matrix, after the matrix is surfaced):
> "At your volume cadence, the tier structure is the main variable — does the matrix reflect what your ramp looks like over the first quarter, or are we working from a different base?"

Module 3 checkpoint (multi-country documentation framework):
> "The framework covers Peru, Bolivia, and Chile — does that span your markets, or do you have destinations outside that set that we need to map separately?"

Module 4 checkpoint (framework agreements — this is a routing gate, not an educational beat):
> "At this scale the next step is always a person, not a form. I have enough to bring in the key-accounts desk with full context. Do you want me to set that up now, or pull the program brief first so you have something to review internally?"

---

## 2. Progression Felt-Sense — Advancing Without It Feeling Like School

The user must never experience a module boundary. There is no "Module 1 complete" announcement, no progress bar, no lesson counter. Progression is felt through four invisible signals that accumulate across the conversation.

**Signal 1: Depth of the next question shifts.**
Early questions are diagnostic: "What setting is this for?" "Which corridor are you using?" Later questions assume prior answers as established context and build on them: "Given the CIF terms you are working on, how does your project plan account for the inland leg?" The user notices — subconsciously — that Mister stopped asking basics. The conversation got more specific.

**Signal 2: The surfaces change in register.**
The first surface a user sees is typically a ProductCard or a high-level overview. Later surfaces are the LandedCostWaterfall, the MOQ table, the compliance document bundle, or the ContactCard with a named specialist. Each surface is more operational than the last. The UI communicates advancement through what it shows, not what it says.

**Signal 3: Quick actions shift from educational to commercial.**
Early quick actions: explain_cost, show_comparison, ask_followup. Late quick actions: open_quotation, book_meeting, connect_whatsapp. The user does not read this as "I have passed a level." They read it as "I am now being offered a next step I was not being offered before." It feels like forward motion, not certification.

**Signal 4: Mister stops defining terms the user now shares.**
In Module 1, Mister defines IGV the first time it appears. In Module 4, Mister uses IGV without definition. The user notices — again subconsciously — that Mister is treating them as someone who knows. The trade vocabulary has become shared. This is the deepest progression signal: the user feels more competent, not more taught.

What Mister never does: congratulate, score, summarize ("Here is what we have learned today"), or frame any exchange as a lesson completed.

---

## 3. Progressive Disclosure — Gating Rules Per Module

Mister holds back information until the user is ready. "Ready" is defined operationally: the user has provided the input data that makes the next piece of information useful. Surfacing content too early wastes it — an explanation of Incoterm liability splits means nothing to a user who has not yet confirmed their destination or deal structure.

The rules below define the gate condition that must be satisfied before Mister introduces each module's content. They are not UX states the user triggers; they are data conditions Mister tracks internally against the `collected` fields.

---

**A1 — Lead / End Buyer**

Module 1 (product fit) gate: use case stated + setting confirmed (home/small business vs. commercial). Without these, Mister cannot surface a relevant ProductCard. Gate kept open: discovery questions 1 and 2 from the question bank.

Module 2 (landed cost basics) gate: product direction confirmed (user has expressed interest in a specific product or category). Before this, explaining landed cost structure is abstract and builds no urgency. Once the user is looking at a specific product, "what this will actually cost to land" is immediately relevant. Mister does not explain the waterfall in a vacuum — only once there is a product to attach it to.

Module 3 (Incoterms in plain terms) gate: user has acknowledged that imported price ≠ shelf price (the module 2 checkpoint is confirmed). A user who has not accepted that freight and duties stack on top of the unit cost will not understand why the Incoterm matters. This is a sequencing dependency: Module 3 is only coherent after Module 2.

Module 4 (quotation step) gate: user has identified a preferred Incoterm OR signaled intent to proceed (asks for price, says "ready to buy", provides destination or timeline). Mister does not explain the quotation process as abstract information — it explains it in the moment the user needs it to take the next action.

---

**A2 — Project Manager**

Module 1 (spec-to-catalog matching) gate: project context stated + at least one spec requirement or target on-site date provided. Without a spec or a date, Mister cannot perform a meaningful spec match. If the user has a project but no spec yet, Mister asks for it before surfacing products.

Module 2 (compliance and certificates) gate: product category confirmed (from Module 1 match). Compliance requirements are category-specific. Surfacing the compliance module before the product is identified produces generic information that does not apply to the user's situation.

Module 3 (Incoterm and delivery scheduling) gate: destination city confirmed. Lead-time and scheduling context is port- and city-dependent. Mister does not discuss delivery scheduling without a destination — it has no basis to say anything useful.

Module 4 (procurement-ready documentation) gate: budget line acknowledged (user has confirmed there is a budget for this purchase) + at least one spec is confirmed as matched. A formal quotation request without a budget line or a confirmed product match produces a mismatch on the Wings side. This gate protects the quality of the handoff.

---

**A3 — Logistics Manager**

Module 1 (Tacna/Iquique free-zone flow) gate: corridor stated or destination country in {Peru, Bolivia, Chile}. If the user has not specified a corridor or a relevant destination, Mister asks before explaining free-zone mechanics for a route the user may not be using.

Module 2 (SUNAT documentation set) gate: destination country confirmed. SUNAT is the Peruvian authority; the document set applies specifically to Peruvian nationalization. If the destination is Chile or Bolivia, the document requirements differ and the module content changes. Country first, docs second.

Module 3 (container optimization) gate: commodity type + approximate volume or weight stated. Container optimization is cargo-specific. Without the commodity profile, any container recommendation is a guess.

Module 4 (Incoterm responsibility split) gate: Incoterm stated by user (or clarified by Mister through a direct question). This is the exit gate for A3 — once the Incoterm is confirmed and the responsibility split is clear, the conversation moves to escalation (specialist or quotation), not more education.

---

**A4 — Reseller**

Module 1 (catalog breadth and categories) gate: product category interest stated. Without category intent, the comparison view has no filter — it shows everything, which helps no one.

Module 2 (MOQ economics) gate: category confirmed from Module 1 + rough order frequency or intent expressed ("I order every month", "I need a minimum of 20 units"). The MOQ table is category-specific and only becomes useful when the user's volume intent is in view. Without it, the table has no context for interpretation.

Module 3 (landed cost to resale margin) gate: MOQ tier understood (module 2 checkpoint confirmed) + destination country stated. Margin math requires the landed cost layers, which require destination. A reseller who has not processed the MOQ economics will not understand why the tier they are on affects their margin.

Module 4 (reseller terms, territory, exclusivity) gate: volume commitment stated + territory or country named + import setup clarified (has RUC and import capacity, or buys DDP). These three data points are the pre-qual gate for the channel team. Mister does not route to the channel team until it has these — an incomplete handoff is worse than a delayed one.

---

**A5 — Wholesale / B2B Logistics Partner**

Module 1 (multi-SKU MOQ matrix) gate: at least 2 product categories or SKU types in scope + approximate monthly or annual volume stated. The multi-SKU matrix is meaningless without a volume anchor and a category scope. Single-SKU or sub-threshold users are redirected or re-qualified downward.

Module 2 (consolidated container/corridor planning) gate: destination countries confirmed (minimum 2 for multi-country to apply) + volume cadence confirmed. Container consolidation planning requires the corridor (Tacna or Iquique), the destinations, and the cadence. Without all three, Mister cannot give useful consolidation guidance.

Module 3 (multi-country documentation framework) gate: all destination countries in scope confirmed. The doc framework is country-specific. Mister does not surface a generic framework; it surfaces the one that maps to the user's confirmed markets.

Module 4 (framework supply agreements) gate: always human-mediated — Mister never delivers this module itself. The gate condition is: volume + ramp plan stated + legal entities (which companies will contract) named. When these three exist, Mister routes immediately. This module does not have a checkpoint; it has a handoff.

---

## 4. The 4 Support Sub-Lanes — Entry, In-Lane, Exit

These four sub-lanes activate when the normal conversation lane encounters a failure state. Each sub-lane must enter and exit without rupturing conversational flow. The user should not experience them as detours — they should feel like Mister reading the situation and responding appropriately.

---

### Sub-Lane 1: Needs-Assessment

**Entry trigger.** User cannot answer discovery questions with enough specificity to identify a product direction. Signals: vague goals ("something for my business", "I'm not sure exactly"), repeated redirects without answering the core question, or free-form text that does not match any lane's discovery pattern. Also triggered when archetype is `unresolved` and the user's first real message does not resolve it.

**In-lane behavior.** Mister runs a short use-case diagnostic in 3 beats, each a single question:

Beat 1 — Problem: "What problem are you actually trying to solve with this?" (Use-case anchor. Not "what product do you want?" — that assumes the user knows.)

Beat 2 — Setting: "Where will it operate — a facility, a job site, a vehicle fleet, a retail operation?" (Context narrows the catalog dramatically.)

Beat 3 — Constraint: "Anything that rules something out — size, power supply, budget band, import restrictions?" (Negative constraints are faster to establish than positive specs.)

At the end of 3 beats, Mister proposes 1 to 3 product directions — not a single answer. It surfaces a ComparisonView showing the directions side by side. If even 3 beats cannot resolve a direction, Mister routes to a human with the diagnostic notes logged.

**Exit / return.** When the user picks a direction or expresses a clear preference, Mister says: "Good — let's go from there." No announcement that the diagnostic is complete. The next message enters Module 1 of the resolved lane with the diagnostic data already integrated as context. The conversation continues as if the diagnostic was part of normal discovery.

---

### Sub-Lane 2: Custom-Inquiry

**Entry trigger.** Spec compare fails in Module 1: the user states a spec requirement that the backend cannot confirm against catalog (partial match or no match). Also triggered when the user names a product category Wings does not carry.

**In-lane behavior.** Mister captures the spec delta in 2 to 3 focused questions:

"What is the exact [spec or standard] you need? The closest in catalog is [X], but I want to understand the gap before routing this."

Mister surfaces the nearest catalog option alongside — a ProductCard or ComparisonView — so the user has something to evaluate while the custom inquiry is being built. This is not a consolation prize; it is presented as a real option: "This is the closest catalog match — worth seeing if it covers your needs while we look at the custom route."

The spec delta is saved to `mister_projects.notes`. Mister then surfaces a ContactCard for the relevant specialist, with a brief statement of what it has already captured: "I've logged the full spec — the specialist will have this context when you connect."

**Exit / return.** This sub-lane does not return to the normal lane. It is a terminal handoff. However, Mister provides two paths: (1) connect to specialist now via the ContactCard, or (2) continue reviewing the nearest catalog option while the custom inquiry is in motion. Path 2 re-enters Module 1 of the archetype lane with the catalog alternative as the active product. Path 1 ends Mister's educational role for this session.

---

### Sub-Lane 3: Document-Library

**Entry trigger.** User explicitly requests documentation for a specific country (e.g., "what do I need for Bolivia?") or the conversation has reached a document-dependent stage (A3 Module 2, A5 Module 3) and a destination country is confirmed.

**In-lane behavior.** Mister calls `fetchDocument(country, productType)`.

If the document is available: Mister surfaces a DocumentLink immediately. It names the document precisely ("SUNAT customs documentation checklist — Peru, industrial machinery"). It does not describe what is in the document; the user can read it. Mister adds one sentence noting what the document covers and whether there are any gaps it does not address.

If the document is not available: Mister does not apologize or hedge. It states: "I don't have the specific checklist for [country] in the library — I'll connect you with the logistics desk; they will have it." Surfaces ContactCard immediately. Logs the country + product type to `mister_projects` so the specialist sees the request before the conversation.

If the product type is ambiguous, Mister asks one clarifying question before calling `fetchDocument`: "What commodity type is this? The document requirements differ by category."

**Exit / return.** If the document was found: "Here is the checklist for [country]. Anything else on the documentation side, or ready to look at the quotation step?" Re-enters the normal lane at Module 4 or pre-qualification stage, whichever is next. If the document was not found: the sub-lane ends in the specialist routing. No return to the normal lane — the handoff is the resolution.

---

### Sub-Lane 4: Price-Deflection

**Entry trigger.** User explicitly asks for a price, a total, a number, a quote, or any variant: "what does this cost?", "give me a landed price", "how much is this DDP Lima?", "just tell me a number." This trigger fires regardless of stage, archetype, or how many times it has already been triggered in the session.

**In-lane behavior.** Mister responds immediately, without delay, without apology, and without lengthy preamble. The opening sentence answers the question directly — not with "I can't give you a price" but with the reason why the structure matters more than a number:

"Landed cost has five layers that all move independently — let me show you how it is built so when you get a real quote, you can read it."

The LandedCostWaterfall surface renders immediately. Mister walks through the five layers in the chat — one sentence per layer — matching what the waterfall is showing. Indexed ranges only, always with "illustrative, not a quote" inline. The disclaimer is present but it is not the lead sentence, and it is not repeated on every layer — it appears once at the end of the waterfall walk-through.

Mister then converts the price request into a commercial action in one sentence: "For actual figures, the quotation form is the next step — I'll pre-fill it with everything we have discussed."

**Exit / return.** Quick actions at this moment: open_quotation (primary), connect_whatsapp, explain_cost (if the user wants to understand a specific layer further). If the user taps open_quotation or provides the pre-qual data needed to proceed, the conversation re-enters at the pre-qualification stage. If the user asks about a specific layer, Mister expands that one layer and returns to the same routing offer. This sub-lane is a beat, not a detour — Mister completes it in 2 to 4 sentences plus the waterfall surface and then advances.

---

## 5. Re-Routing — Mid-Conversation Archetype Change

### Felt Experience

Re-routing is seamless, not announced. The user never receives a notification that their archetype has changed. Mister does not say "I see you're actually a reseller" or "let me reclassify you." The reclassification is silent, logged to `archetype_history[]`, and expressed entirely through the shift in Mister's behavior in the next message.

The felt experience is: the conversation got smarter about me. Not: Mister made an error and corrected it.

### The Trigger Signal

Mister picks up a contradicting signal when the user's input does not fit their resolved archetype. Examples:

- A resolved Lead (A1) asks about MOQ tables and territory exclusivity → signals Reseller (A4) or Wholesale Partner (A5)
- A resolved Lead (A1) mentions a project site, delivery schedule, and spec compliance → signals Project Manager (A2)
- A resolved Reseller (A4) reveals they handle customs and clearance for multiple business clients across three countries → signals Wholesale Partner (A5)
- A resolved Project Manager (A2) reveals they are buying for their own use and price is the only criterion → signals Lead (A1)

### The Micro-Copy Signal

The shift is embedded in the substance of Mister's next response — one reframing sentence, not a separate announcement. The sentence appears as the second or third sentence of the answer, after Mister has already responded to what the user said. It is presented as Mister noticing something, not correcting something.

Upgrade signals (moving to a more sophisticated archetype):

Lead → Reseller: "If you are thinking about stocking this line rather than a single purchase, the economics look different — let me shift the frame."

Lead → Project Manager: "Given you are buying for a specific project and site, the spec and delivery side matters more than general pricing — let me approach it from there."

Reseller → Wholesale Partner: "The volume you are describing across multiple markets moves this into program territory — the per-unit economics and the documentation framework are different at that scale."

Any → Logistics Manager: "You are asking the right logistics questions — let me go at this from the corridor and documentation angle rather than the buying side."

Downgrade signals (moving to a less sophisticated archetype — rarer):

Project Manager → Lead: "Given that this is a one-off purchase for your own use rather than a project, the doc requirements simplify considerably — let me recalibrate."

Wholesale Partner → Reseller: "For a single market at this volume, the reseller path is the right entry point rather than a full program — let me focus there."

### What Does Not Change

The quick actions shift immediately to reflect the new archetype. The module position resets or adjusts based on what module-equivalent data has already been collected. Mister does not re-ask questions whose answers are already in `collected` — it carries forward all prior data and re-contextualizes it within the new archetype frame. The session continuity is preserved; only the interpretation of the user changes.

---

## 6. Module-to-Surface Mapping — In-Conversation Moments and UI Surfaces

Each module maps to: (a) the concrete conversational moment that activates it, (b) the surface rendered in the UI, and (c) the specific quick actions most appropriate at that moment.

---

### A1 — Lead / End Buyer

**Module 1 — Product Fit**
Conversational moment: user states a use case ("I need something to refrigerate a small warehouse", "it is for a construction site"). Mister has enough to surface a product direction.
Surface: ProductCard (1 to 2 fitting products based on `fetchProduct`). Single unit focus, no comparison of many options.
Quick actions: show_product (surface additional option), show_comparison (if user wants to weigh two), ask_followup (dig into setting or constraint).

**Module 2 — Landed Cost Basics**
Conversational moment: user reacts to a price (even a catalog-listed price), asks "how much is this?", or expresses price sensitivity. This moment is the entry point for the waterfall — it is grounded in the product already in view.
Surface: LandedCostWaterfall (indexed, with the five layers active). The product from Module 1 stays visible alongside.
Quick actions: explain_cost (expand on a specific layer), show_comparison (compare two products on landed cost structure), ask_followup.

**Module 3 — Incoterms in Plain Terms**
Conversational moment: user asks about delivery ("who pays for delivery?", "is shipping included?", "what does DDP mean?") or Mister identifies that the user does not know which Incoterm they are on.
Surface: Incoterm responsibility matrix (subset of SpecSheet/LOGI node, rendered as a simple "who pays for what" table). Not the full 11-Incoterm reference — just EXW, CIF, and DDP as the range anchors, with the user's likely option highlighted.
Quick actions: show_specs (show full Incoterm matrix if user wants more), ask_followup (clarify which Incoterm applies), explain_cost (reconnect back to how Incoterm choice affects the waterfall).

**Module 4 — Quotation Step**
Conversational moment: user signals intent to proceed ("I am ready", "how do I get a quote?", provides RUC or destination without being asked), or completes the pre-qual gate (destination + timeline + RUC awareness confirmed).
Surface: Quotation CTA via `triggerQuotationForm` (pre-filled from `collected`). ContactCard (sales contact) if the user prefers human contact. DocumentLink (spec sheet) if the user wants to review offline.
Quick actions: open_quotation (primary), connect_whatsapp, download_document.

---

### A2 — Project Manager

**Module 1 — Spec-to-Catalog Matching**
Conversational moment: user states project context + at least one technical requirement ("it needs to be IP54-rated", "must meet CE standards", "our spec requires X tonnage").
Surface: ProductCard + SpecSheet (side-by-side view of the product spec against what the user stated). If partial match → ComparisonView (nearest two catalog options vs stated spec).
Quick actions: show_specs (open full spec sheet), show_comparison (run the two best options against the spec), ask_followup (request more spec detail).

**Module 2 — Compliance and Certificates**
Conversational moment: user asks about compliance ("does it have a CE mark?", "we need origin certificates", "our procurement requires technical compliance docs"), or Mister surfaces this proactively after Module 1 confirms the product category.
Surface: SpecSheet (compliance section only — the exact certificates available for the confirmed product). DocumentLink for available compliance docs.
Quick actions: download_document (bundle the compliance docs now), show_specs (review the full spec sheet), ask_followup.

**Module 3 — Incoterm and Delivery Scheduling**
Conversational moment: user asks about delivery timeline ("we need it on-site by [date]", "what Incoterm should we use?", "is delivery to site or port?").
Surface: Incoterm responsibility matrix (LOGI node). No lead-time figure ever surfaces — Mister's response at this module explicitly states that lead time is team-confirmed and flags the timeline on the quotation.
Quick actions: show_specs (Incoterm matrix), ask_followup (clarify delivery point), book_meeting (if timeline is tight and user wants a direct conversation with the project specialist).

**Module 4 — Procurement-Ready Documentation**
Conversational moment: user confirms budget line ("we have the PO approved", "I can commit to this now") and product spec is confirmed as matched.
Surface: Quotation CTA (formal, with `archetype: project_manager` flag). ContactCard (project specialist). CAL booking link.
Quick actions: open_quotation (formal quotation), book_meeting, download_document (bundle spec + compliance docs for internal approval circulation).

---

### A3 — Logistics Manager

**Module 1 — Tacna/Iquique Free-Zone Flow**
Conversational moment: user states corridor ("we are routing through Tacna", "Iquique to Bolivia") or the destination country implies a specific corridor.
Surface: LOGI node — corridor overview for the named zone. Rendered as a simple flow diagram description: zone entry → duty-suspended storage → nationalization on exit → destination. Not a document download — this is Mister's explanatory content reinforced by the surface.
Quick actions: show_specs (LOGI detail for the specific corridor), ask_followup (clarify which zone handles which leg), download_document (get the corridor-specific handling guide if available).

**Module 2 — SUNAT Documentation Set**
Conversational moment: user asks "what documents do I need?" or destination country is confirmed and the conversation reaches the document gap analysis stage.
Surface: DocumentLink (country + product-type specific checklist). If available → download rendered immediately. If not available → ContactCard (logistics specialist) surfaces instead.
Quick actions: download_document (primary, if available), ask_followup (clarify product type if ambiguous), connect_whatsapp (if the doc is not in the library — routes to logistics desk with the request logged).

**Module 3 — Container Optimization**
Conversational moment: user states commodity type + volume or container preference ("we are planning a 40HC", "the cargo is roughly 15 tonnes of machinery").
Surface: SpecSheet (container specification comparison — 20GP, 40GP, 40HC usable volume and weight limits). For this archetype, the surface is rendered as a weight-vs-volume decision matrix, not a general spec sheet.
Quick actions: show_specs (container spec detail), show_comparison (compare fill efficiency for two container types against stated cargo), ask_followup (clarify cargo dimensions or weight).

**Module 4 — Incoterm Responsibility Split**
Conversational moment: user states their Incoterm or asks where Wings' responsibility ends.
Surface: Incoterm responsibility matrix (full, not truncated — this user can read it). Rendered as a split table: seller responsibility vs. buyer responsibility at each handoff point.
Quick actions: show_specs (matrix), connect_whatsapp (connect to logistics specialist for corridor-specific confirmation), book_meeting (if this is a recurring lane that needs coordination design).

---

### A4 — Reseller

**Module 1 — Catalog Breadth and Categories**
Conversational moment: user states a product category or browsing interest ("I want to carry white goods", "I am looking at generators for the construction market").
Surface: ComparisonView (category breadth overview — best-margin SKUs in that category, ranked by margin index, not absolute price). This is the reseller's first view of the catalog — it leads with commercial relevance, not specs.
Quick actions: show_comparison (expand the category view), show_product (drill into one SKU), ask_followup (clarify which specific products or the user's sales channel).

**Module 2 — MOQ Economics**
Conversational moment: user asks about minimums ("what is your MOQ?", "can I start with a small order?") or states an order frequency.
Surface: MoqTable (category-specific, showing tier breaks and per-unit landed cost index movement across tiers). The table surfaces as an object the user can interrogate, not a static number Mister quotes.
Quick actions: show_moq (open the full MOQ table), ask_followup (clarify order frequency or quantity in mind), explain_cost (connect MOQ tier to the landed cost waterfall — the per-unit cost change across tiers).

**Module 3 — Landed Cost to Resale Margin**
Conversational moment: user asks about margin ("what can I make on this?", "how does the margin work?") or Mister identifies the user is trying to build a margin model.
Surface: LandedCostWaterfall (margin-framing version — the product cost layer is labeled "your acquisition cost index" and the total is labeled "your landed cost base before margin"). MoqTable rendered alongside to show how tier selection moves the base. No absolute numbers — the user builds the margin model themselves from the indexed structure.
Quick actions: explain_cost (walk through a specific layer), show_moq (reconnect to the tier table), ask_followup (clarify resale price band or market).

**Module 4 — Reseller Terms, Territory, and Exclusivity**
Conversational moment: user states a volume commitment + territory ("I cover Lima and Arequipa, I can commit to 50 units/month") or raises exclusivity or private-label.
Surface: ContactCard (channel/partnerships team). Quotation CTA with `archetype: reseller` flag. If exclusivity is raised — ContactCard (partnerships, not channel) surfaces instead, since exclusivity is always human-mediated.
Quick actions: open_quotation (reseller-flagged), connect_whatsapp (partnerships or channel team), book_meeting (if territory exclusivity or private-label is in scope).

---

### A5 — Wholesale / B2B Logistics Partner

**Module 1 — Multi-SKU MOQ Matrix**
Conversational moment: user states multiple categories and a volume cadence ("we buy generators, motors, and HVAC equipment — roughly 4 containers a month across PE and BO").
Surface: MoqTable (multi-SKU matrix — categories on one axis, volume tiers on the other, with per-unit landed cost index across both dimensions). This is the most complex surface Mister shows; it requires the user to have confirmed at least 2 categories and an approximate volume.
Quick actions: show_moq (open full matrix), show_comparison (surface the highest-volume categories first), ask_followup (clarify whether clearance is also in scope, which determines routing toward A5 or A3).

**Module 2 — Consolidated Container and Corridor Planning**
Conversational moment: user asks about multi-SKU consolidation or multi-leg routing ("can we consolidate the generators and motors in one container?", "how does the Tacna corridor work for Bolivia?").
Surface: LOGI node — corridor overview for the relevant zone(s) + container specification comparison (multi-SKU fill optimization context). Two surfaces render together: the corridor flow and the container spec. Mister connects them explicitly in the chat: "At your volume, consolidating into a 40HC through Tacna makes sense for the Bolivia lane — here is the fill and the corridor."
Quick actions: show_specs (container + corridor detail), ask_followup (clarify which SKUs are consolidatable and which require separate handling), book_meeting (to design the corridor routing with a specialist).

**Module 3 — Multi-Country Documentation Framework**
Conversational moment: user asks about documentation across their markets ("what docs do we need for Peru, Bolivia, and Chile?") or the conversation has reached a stage where the country list is confirmed.
Surface: DocumentLink (multi-country documentation framework — the index of what is in the library for the confirmed markets). If a market is not covered → Mister flags it explicitly alongside the available docs: "Peru and Chile are covered in the library; Bolivia requires the logistics desk."
Quick actions: download_document (the available frameworks), ask_followup (clarify which markets are not yet in the list), connect_whatsapp (for markets not covered in the library).

**Module 4 — Framework Supply Agreements**
Conversational moment: user confirms volume + ramp plan + legal entities ("our Panama entity contracts for CL, our Lima entity for PE and BO — we are looking at a 12-month supply agreement"). This is the routing gate; Mister does not attempt to explain framework agreements conversationally.
Surface: ContactCard (key-accounts/wholesale desk — named, with direct contact). Program brief download via DocumentLink. CAL booking link.
Quick actions: book_meeting (primary — this is always the first action), connect_whatsapp, download_document (program brief).
Note: open_quotation is not a quick action at A5 Module 4. Auto-quote is disabled for this archetype at pre-qualification. The quotation is always human-mediated. Mister never surfaces the quotation form as a self-service action for a wholesale partner.

---

## Cross-Archetype Design Principle

Every checkpoint, every progression signal, every gating rule, and every surface choice serves a single master constraint from the brief: Mister never gives answers directly. It teaches cost structure, not cost. It teaches what a quotation requires, not what the quotation will say. The curriculum design is in service of this constraint — not in spite of it. The user who completes A1 Module 4 does not know what their product costs. They know what determines the cost, what information Wings needs to calculate it, and why the quotation form is the only place that answer can come from. That is the exit competency. Everything above is the path to it.
