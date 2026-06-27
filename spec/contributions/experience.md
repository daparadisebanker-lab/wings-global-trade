# Mister — Experience Architecture Contribution
**Role:** Experience Architect
**Lens:** Conversion and UX architecture — decision pathways, trust sequencing, momentum
**Standard:** Top 1% B2B conversational commerce — the bar is Bloomberg Terminal, not Intercom
**Date:** June 2026
**Status:** Load-bearing decisions. No decoration. Every call here is a conversion architecture decision.

---

## OPERATING PREMISE

Mister has one conversion goal: transform an anonymous, uncertain visitor into a documented, qualified lead who is delivered to the Wings team with enough context to skip introductions. Every UX decision below is tested against this goal. The question is never "does this feel nice?" The question is "does this keep the user in motion toward the handoff, and does it earn that motion?"

Trust must precede commitment. Commitment must feel like the user's idea. Momentum, once established, must never be broken without offering an immediate recovery path.

---

## 1. FIVE ARCHETYPE JOURNEY MAPS

Each journey is documented as a sequence of decision beats, not steps in a linear funnel. Beats are moments where the conversation direction is determined. Every beat has an optimal path and a recovery path.

---

### A1 — THE LEAD / END BUYER

**User model.** Buying equipment for their own operation. They have a product in mind but their expectation is that the price they see is roughly the price they pay. They have not thought about Incoterms, duties, or corridor routing. Their default anxiety: "Am I going to end up paying far more than what I saw online?"

**Entry beat.**
The user arrives either (a) via the homepage category grid — having clicked a product category — or (b) via a product detail page with the MisterEmbedded widget visible. In embedded mode, the product is already in frame; the entry question can skip category-level induction.

In floating mode, entry is the MisterLauncher at the bottom-right corner of any page. The tab reads "MISTER" and nothing else. It does not say "Chat with us" or "Need help?" It signals access to an intelligence layer, not a help function. The user who clicks it is self-selecting as someone with a real trade question.

**Induction beat (Q0 + Q1).**
The opening message arrives in under 400ms of window open. It is hardcoded, not an API call. It reads as the entry from a senior specialist who has already oriented himself to the situation. The Q1 framing — "are you buying for your own operation, or moving/reselling to someone else?" — resolves in one of two directions. An A1 user answers with some variant of "for myself" or "for my company." This signal is strong and immediate.

The user's answer to Q1 displays as a warm-paper rectangular block, right-aligned, in the message stream. There is no loading spinner between the user's answer and Mister's next question. The response begins streaming immediately. If the user has already been pre-classified (embedded mode, prior session), Q1 is skipped and Mister opens directly into discovery-stage questions calibrated for the Lead archetype.

**Discovery beats (turns 2–4).**
Mister is learning: what does the equipment need to do, what setting is it for, has this user imported before, what budget band are they working in. The questions arrive one at a time. Each question is specific to what was just said. An A1 who says "I need a refrigeration unit for my small food business" gets a question calibrated to commercial refrigeration, not generic equipment. The specificity signals that Mister retained the prior answer.

At turn 3 or 4, the session brief on the right (desktop) or the collapsible panel at the top of the drawer (mobile) shows the first field populated: either a product category or a stated use case. The user sees their own words reflected back as structured data. This is the first trust beat: Mister is keeping a record.

**Consideration beats (turns 5–7).**
Two paths are common for A1. The first is immediate price concern: the user asks "how much does this cost?" or reacts to a listed price with hesitation. This triggers the price-deflection sub-lane immediately. Mister's response leads with the reason the structure matters more than a number, then renders the LandedCostWaterfall. The waterfall is the single most persuasive educational moment available to an A1. If it lands correctly — if the user understands that freight, insurance, duties, and last-mile stack on top of a unit price they may have already seen — the price anxiety converts into informed anticipation. The user stops fearing the number and starts understanding what will determine it.

The second path is product comparison: the user wants to see options. Mister surfaces one or two ProductCards from the catalog and, if two are surfaced, a ComparisonView. The comparison is never framed as "pick the right one" — it is framed as "here is how these differ on the points that matter for your use case." This removes the paralysis of side-by-side choice and keeps the conversation moving toward a preference, not a decision.

**Pre-qualification beat (turns 8–10).**
The conversation shifts from education to qualification. Mister needs three things: destination city, RUC (tax ID) or at least an awareness of it, and a decision timeline. It collects these one at a time, embedded in natural conversational prompts. "Where will the delivery go?" is not a form field — it is the next question in a professional briefing. Each answer populates the session brief.

The quotation CTA activates when destination and product intent are both collected. The activation is silent — the button goes from a visually subdued state to a fully legible gold state. There is no announcement ("You're almost there!"). The user notices the change because they were watching the brief fill in.

**Escalation and handoff beat.**
The primary escalation for A1 is the pre-filled quotation form. Mister's closing line before the form opens: "I've pre-filled your destination and what we've covered. The team will receive your brief and respond." The form opens with the collected data already in it. The user does not need to re-enter their use case, destination, or product interest. The brief becomes the form.

The secondary escalation is WhatsApp — offered when the user expresses price frustration, asks about availability, or signals they prefer a direct conversation. The WhatsApp CTA carries the session brief as context. The Wings team receives it before they say hello.

**Recovery paths.**
Silence after a consideration-stage turn: Mister does not immediately escalate. It sends one follow-up question, framed as an offer rather than a prompt. If silence persists past 3 minutes, the save-state message appears: "I've saved your session brief. Return here to continue, or pick this up on WhatsApp." This is not a retention plea. It is a practical statement of what is available.

---

### A2 — THE PROJECT MANAGER

**User model.** Procurement function inside a larger organization. They have a project spec, a site date, an approval chain, and compliance requirements. Their default anxiety: "Will this actually meet our spec, and will it arrive before the project deadline?" They are not price-sensitive in the same way as A1 — they are deadline-sensitive and documentation-sensitive. A wrong spec or a late delivery costs them more than a higher price.

**Entry beat.**
A2 users frequently arrive via a search for a specific product category combined with technical attributes ("industrial compressor IP54 Peru import" or similar). They may land directly on a product detail page. In embedded mode, the product is pre-bound and Mister can skip category-level induction.

A2 is one of the faster archetypes to resolve. The signal is almost always in the first message: mention of a project, a site, a spec requirement, or a delivery date. If the user says "I need this for a mining site in Arequipa — we need CE certification," Mister resolves to A2 before Q2A.

**Induction beat.**
If the A2 signal is strong (project context + spec or date), Mister resolves immediately after Q1. The Q2A question — "is this for a project or a build-out?" — confirms it. If the user answers with a site, a deadline, or a spec requirement, the archetype locks and the lane opens. The session brief shows "Archetype: Project Manager" in its Teko archetype indicator row.

**Discovery beats (turns 2–4).**
Mister needs: what is the project, what is the spec or standard the equipment must meet, what is the on-site date, and where is the delivery destination. These are collected in 2–3 turns. An A2 user is efficient and precise; they will answer these questions quickly. Mister mirrors this efficiency — no warm-up, no broad exploratory questions, straight to the technical.

At the point where the spec requirement is stated, Mister does something distinctive: it immediately surfaces a ProductCard plus a SpecSheet showing the relevant technical rows against what the user stated. Not "here is our product catalog" — "here is how this model maps to what you just described, on the three points that matter for your spec." If the match is partial, Mister names the gap explicitly and offers two paths: the nearest catalog option and the custom-inquiry route.

**Consideration beats (turns 5–8).**
The compliance module is central for A2. After spec matching, the conversation moves to certificates and documentation. "Your finance or customs team will likely ask for the certificate of origin and the technical compliance doc — do you already have those, or should I bundle them now?" This is a knowledge checkpoint embedded as a natural question. It is not a quiz.

Lead time is a critical pressure point for A2. When the user mentions a deadline, Mister cannot promise a delivery date. It handles this with exact precision: "Lead time is team-confirmed — I'll flag your on-site date on the quotation so procurement sees it up front." The session brief shows the on-site date in a dedicated field. The user sees that the date has been captured, even though no commitment has been made.

The Incoterm module arrives here. An A2 is more likely to have an opinion on Incoterm or to have a project standard that specifies it. Mister confirms which Incoterm is in use, explains the responsibility split at their destination port, and flags any gap between where Wings' responsibility ends and where the project's site is.

**Pre-qualification beat (turns 9–11).**
Mister needs: budget line status (is the purchase approved?), who the approver is (for pre-filling the quotation), whether the user needs a formal quotation or budgetary numbers first, and what documentation the finance/customs team requires. The distinction between a formal quotation and a budgetary quotation is critical for A2 — the form opens in the appropriate mode based on the user's answer.

The CTA activates when spec is confirmed and budget line is acknowledged. For A2, the CTA is "Generar cotización formal con especificaciones y fecha de entrega" — not a generic "get quote" button. The label carries the value: the spec and the date are in the quotation.

**Escalation and handoff beat.**
The primary escalation for A2 is the formal quotation plus a meeting booking link. These are surfaced together. The user who has a tight project timeline will book the call; the user who has time will submit the form and wait. Both paths are offered simultaneously as the two quick actions after the primary CTA.

The secondary escalation is the project specialist on WhatsApp — offered when the spec does not match catalog (custom inquiry) or when the compliance question is outside what the document library covers. In these cases, Mister names the specialist by function ("the Wings project specialist handles this directly") and pre-loads the session brief into the handoff.

---

### A3 — THE LOGISTICS MANAGER

**User model.** Freight coordinator, customs broker, or operations director with freight responsibility. They are fluent in trade vocabulary — they know what an Incoterm is, they know the difference between SUNAT and a customs agent, they understand free-zone mechanics in principle. What they need from Wings is corridor-specific intelligence: ZOFRATACNA vs Iquique handling, document requirements for their specific country and commodity, container optimization for their cargo profile, and where Wings' responsibility ends on their deal terms.

**Entry beat.**
A3 users frequently arrive with a specific operational question in the first message. They do not need a lot of product education. The tone calibration shifts immediately on A3 resolution: Mister drops the educational framing and switches to peer-register — the tone of a logistics specialist speaking to another logistics specialist.

**Induction beat.**
A3 is the fastest-resolving archetype. "I move freight / handle the logistics side" is a strong signal that triggers A3 resolution directly from Q1. The Q-LOGI confirmation question — "are you coordinating customs and the corridor, or sourcing the goods too?" — confirms whether this is A3 or A5. If the user says they handle customs and clearance for clients, A5 is the more accurate archetype. The distinction matters because A5 always routes to human at pre-qualification, while A3 may route to a document download first.

**Discovery beats (turns 2–4).**
Mister needs: corridor (Tacna or Iquique), origin and destination, commodity type, container type, and Incoterm. An A3 provides all of these quickly. The conversation is efficient because both parties are fluent. Mister does not define "Incoterm" or "FCL" for an A3. It uses the vocabulary without explanation.

At the corridor question, Mister surfaces the relevant LOGI node — a corridor overview for ZOFRATACNA or Iquique — as the companion surface to its explanation. This is not a document download yet; it is an explanatory surface showing the duty-suspension and nationalization flow for the named corridor.

**Consideration beats (turns 5–8).**
The document gap analysis is the core A3 consideration module. Mister calls `fetchDocument(country, productType)`. If the document is available, a DocumentLink renders immediately alongside Mister's message. The A3 user knows exactly what to do with a SUNAT checklist — no explanation needed.

If the document is not available for the user's country/product combination, Mister does not hedge. It states the gap and routes: "I don't have the specific checklist for [country] in the library — I'll connect you with the logistics desk; they'll have it." The ContactCard surfaces immediately.

Container optimization is surfaced when the user provides commodity type and volume. The SpecSheet renders in a weight-vs-volume decision matrix format for A3 — not a standard product spec sheet. The emphasis is on usable volume and weight limits for the stated cargo.

**Pre-qualification beat (turns 9–11).**
For A3, pre-qualification is about lane commitment, volume classification, and clearance coordination. The critical branch is whether the user needs Wings to coordinate customs clearance, or whether they are supply-only. Supply-only routes to the quotation form. Clearance coordination routes to the broker desk via WhatsApp.

If the A3 is moving recurring volume on a consistent lane, Mister offers the meeting booking as the primary escalation. A recurring corridor design is too complex for a form — it needs a specialist. The session brief shows the corridor, commodity, container type, and Incoterm as the pre-loaded context for the meeting.

**Escalation and handoff beat.**
The primary escalation is document download plus logistics specialist contact. The handoff is specific: the specialist is named by function ("logistics desk"), the WhatsApp link routes to the ops number (+50760250735), and the session brief carries the corridor, commodity, and document gap into the handoff message.

---

### A4 — THE RESELLER

**User model.** A buyer who intends to resell the goods to their own customers. Their mental model is commercial, not operational. They think in margin, MOQ, catalog breadth, and territory. Their default anxiety: "Can I actually make money on this, and can I protect my territory?" They need to understand how landed cost compresses their resale margin before they can evaluate whether the line is worth carrying.

**Entry beat.**
A4 users often arrive browsing the catalog by category, looking for lines they can add to their portfolio. They are evaluating Wings as a supplier, not looking for a single product. The resale signal often arrives early: "I'm looking for something I can sell to my clients" or "do you have exclusive distribution options?"

**Induction beat.**
The resale signal in Q1 routes to Q2B. "Are you selling to end customers or supplying other businesses in volume?" resolves A4 vs A5. A4 resolution is confirmed at Q3B: "What matters most — margin and MOQ, or exclusivity and catalog range?" Both answers land at A4. The distinction is only between Reseller and Wholesale Partner.

**Discovery beats (turns 2–4).**
Mister needs: what market and customers does the user sell into, which product categories are they looking to carry, what is their sales channel (online, physical, both), and what is their typical order frequency. These populate the session brief under fields labeled "Territory," "Category interest," and "Order frequency." The ComparisonView for A4 at this stage is not a spec comparison — it is a catalog breadth view, showing the top-margin SKUs in the user's category of interest, ranked commercially.

**Consideration beats (turns 5–8).**
The MOQ table is the central A4 surface. When the user asks about minimums, a MoqTable renders showing tier breaks and the per-unit landed cost index movement across tiers. Mister makes the insight explicit: "At tier 2 your per-unit landed cost drops by an illustrative 7 points — that movement is the margin lever." This is not a number the user can quote to their customers; it is the structural intelligence they need to evaluate the line.

The margin literacy module connects the MOQ table to the LandedCostWaterfall. The waterfall for A4 is framed differently than for A1: the product cost layer is "your acquisition cost index" and the total is "your landed cost base before margin." Mister does not tell the reseller what their margin will be. It shows them the structure from which they can calculate it themselves. The insight that lands correctly: margin is resale price minus landed cost, and landed cost moves with both MOQ tier and Incoterm choice.

Exclusivity requests trigger an immediate escalation. Mister does not try to handle territory exclusivity conversationally. "That's partnership territory — I'll bring in the right team." The ContactCard for the partnerships team surfaces. The user who asked about exclusivity is a qualified reseller lead; the handoff should be fast.

**Pre-qualification beat (turns 9–11).**
Mister needs: volume commitment, territory specification, and import setup (does the user have RUC and import capacity, or do they buy DDP?). These three form the pre-qual gate for the channel team. If any of them is missing, the handoff lands incomplete. Mister is specific about what it needs and why: "I need your territory and a volume number so the channel team can come to the table with the right structure."

**Escalation and handoff beat.**
Primary escalation: reseller-flagged quotation plus a connection to the channel team. The quotation form for A4 carries the "reseller" flag so the Wings team knows the context before they open it. The meeting booking is offered for users with exclusivity or private-label interest.

If the user is sub-MOQ (cannot commit to the minimum), Mister offers a recovery path: route to the standard buyer flow (A1) for the immediate purchase, with a note that the reseller conversation remains available when volume thresholds are reachable.

---

### A5 — THE WHOLESALE / B2B LOGISTICS PARTNER

**User model.** The most sophisticated archetype. They think at program level — multi-SKU, multi-country, multi-container, multi-entity. Their questions are about framework agreements, clearance coordination, volume-tier structure across categories, and multi-country documentation. Their default posture: "I need to know if Wings can actually handle my volume and complexity before I invest time in this."

**Entry beat.**
A5 users signal themselves immediately. "We move four containers a month across Peru and Bolivia" or "we need consolidated shipments across three categories" or "we handle clearance for our clients in three countries." These are strong signals that appear in the first or second message.

**Induction beat.**
Q2B routes A5 from "I'm reselling" when the user says "to other businesses, in volume" or "I handle customs clearance for clients too." Q-LOGI also reaches A5 when an A3 signal is followed by "we also source the goods." The A5 archetype is the most likely to arrive pre-resolved from prior session data or page context (a user who visited the wholesale section and opened Mister).

For A5, Mister adjusts its register before the first discovery question. The opening after archetype resolution is program-level: not "what are you looking for" but "which markets, how many categories, and what volume cadence are we working from?"

**Discovery beats (turns 2–4).**
Mister needs: countries supplied, SKU count, monthly or annual volume, clearance scope (do they handle their own customs or need Wings to?), and whether this is a spot buy or an ongoing supply relationship. The multi-SKU MOQ matrix renders as soon as two or more categories are confirmed alongside a volume figure. This is the most complex surface in Mister — a two-axis matrix of categories against volume tiers with indexed cost ranges at each intersection.

**Consideration beats (turns 5–8).**
For A5, the consideration stage is constrained: Mister provides program-level education (indexed volume-tier structure, multi-country documentation framework, corridor capacity overview) but NEVER auto-quotes, never generates program pricing as a number, and routes to human at the first sign that the user is ready to commit. The escalation trigger for A5 is not a price question — it is any signal of readiness: "Can you supply at this volume?" or "Let's talk terms."

Multi-country documentation is surfaced via DocumentLink for covered countries. For any country not in the library, Mister names the gap and routes to the logistics desk. A5 users appreciate precision about what is and is not covered — generic "we'll figure it out" is worse than admitting a library gap.

**Pre-qualification beat.**
A5 has no form-based pre-qualification path. The moment the user reaches pre-qual signals (volume commitment + entity structure + ramp plan), Mister routes directly to human. The session brief carries everything: countries, SKU count, volume cadence, clearance scope, and any documents already requested. The key-accounts desk receives this brief before the call.

**Escalation and handoff beat.**
The primary escalation for A5 is always a meeting booking plus a key-accounts contact card. The program brief download is offered as a companion — "something to review internally before the call." The WhatsApp link is offered as an immediate bridge to the key-accounts team. The quotation form is not the primary action for A5; it appears only as a program-flagged request that accompanies the human escalation, not as a self-service path.

---

## 2. FLOATING MODE VS EMBEDDED MODE: INTERACTION DIFFERENCES

### Floating Mode

The floating launcher exists on every page of the Wings site. It is globally available, context-independent at entry. The user who opens Mister from the floating launcher arrives with `current_product: null` unless they are on a product detail page, in which case the product is inferred from `currentProductId` on the page.

In floating mode, Mister begins without product context. The induction runs in full. Discovery questions are open. The session brief starts empty and builds from zero.

The floating mode window is positioned at bottom-right, 24px from both edges, sitting above the launcher with an 8px gap. It does not cover the entire viewport on desktop. The user can still read page content while Mister is open. This is intentional: the user may want to cross-reference product information on the page while answering Mister's questions.

On mobile, floating mode occupies full viewport width minus 16px gutters, and full viewport height minus 80px (the launcher and bottom bar remain visible). This is a drawer pattern. More on this in Section 3.

### Embedded Mode

The embedded Mister instance mounts inline on product detail pages, below the product hero or in a dedicated sidebar. The primary difference from floating mode is `current_product` is pre-bound on session initialization. The context injection sends the product record to every turn without the user needing to identify it.

In embedded mode, induction behavior changes meaningfully. If the session has no prior archetype, the induction still runs — but Q1 is framed with product context. "I see you're looking at the [product name] — are you buying this for your own operation, or moving/reselling it?" This one sentence change does three things: confirms Mister has seen what the user is looking at, validates the user's presence on this page, and asks the induction question without interrupting the flow.

If the archetype is already resolved from a prior session (stored in `mister_projects`), the embedded instance skips induction entirely and opens into the consideration stage with the pre-bound product already in frame. "Last time we covered [topic]. You're on [product name] now — want to see how it maps to your [archetype-specific frame]?" This is a re-engagement pattern that respects the prior conversation.

The embedded mode has no minimize or close button visible by default. It is part of the page layout. It does not float. It does not have a launcher. The window frame has no shadow. The border is the same gold-rule border but it integrates with the page grid rather than floating above it.

**The key behavioral difference between modes is initiation context.** Floating mode: Mister meets the user at zero context. Embedded mode: Mister meets the user at maximum product context. The induction shortening in embedded mode is not cosmetic — it removes a barrier to entry that would feel repetitive for a user who just spent 30 seconds reading a product detail page.

---

## 3. MOBILE INTERACTION PATTERNS

### The Mobile Context

Mobile interaction with Mister happens in two distinct situations. First: a user browsing the Wings catalog on mobile encounters Mister either as the floating launcher tab at the bottom-right or as the embedded section below a product. Second: a returning user who received a WhatsApp link with a session token and is continuing the conversation on their phone.

The repo already has mobile keyboard/dvh fixes in place. These decisions build on them.

### Drawer Behavior

In floating mode on mobile, Mister opens as a bottom sheet drawer rather than a positioned overlay. The drawer occupies `calc(100dvh - 80px)` of screen height, anchoring to the bottom of the viewport. The 80px reserved at the top shows enough of the page behind Mister to confirm that the user's context is preserved and that they can close the drawer by swiping down.

The drawer opens with a brief upward translation (200ms ease-out, 20px displacement). This is not animation for its own sake — it signals that the interface has arrived from below, not appeared from the center (which is a modal register, not a drawer register). The opening is confident, not tentative.

Closing the drawer requires either a deliberate swipe down (drag handle at the top of the header is implied by the 48px header height — no separate handle element needed, the header is the handle) or tapping the minimize icon. There is no backdrop. The drawer does not darken the background. It is a context extension, not an interruption.

**Swipe-to-close threshold:** 80px of downward displacement before the swipe commits to close. Below that threshold, the drawer returns to its open position with a spring-back animation (same 200ms, ease-in). If the user is mid-composition (cursor in the composer), swipe-to-close is suppressed — a swipe that begins inside the composer input does not dismiss the drawer.

### Keyboard Handling

When the mobile keyboard opens (user taps the composer), the drawer does not resize. The viewport shifts; the drawer shifts with it. `window.scrollY` and `visualViewport` events handle this in the existing mobile fix. The composer stays pinned to the top of the keyboard. The message list compresses but remains scrollable above the composer.

The critical UX decision: the quick action buttons must remain visible when the keyboard is open. They render directly above the composer's top border, inside the scrollable message list at the bottom of the current transcript. They do not float over the composer. When the keyboard is open, the quick actions are the last visible element above the composer — the user can tap a quick action without dismissing the keyboard.

If the quick actions would be hidden by the keyboard (on very small viewports), they collapse to a horizontal scroll row with 8px item gap rather than wrapping to a second row. The row is 44px tall including touch targets. The user scrolls horizontally to see all three. This is preferable to wrapping (which increases the visible height of the action row and pushes the composer up) or hiding actions (which removes the primary navigation surface when it is most needed — mid-conversation).

### Touch Target Sizing

All interactive elements in the mobile Mister interface have minimum 44px touch targets, regardless of their visual size. The quick action buttons are visually 28px tall but their touch target is the full 44px of the action row height. The send arrow's touch target is the full 56px composer height. The minimize and close icons in the header each have a 44px × 44px touch target within the 48px header.

The session brief panel on mobile is a collapsible drawer that appears at the top of the Mister drawer, below the header. It is closed by default on first turn. On the first field population (first data captured by Mister), the panel performs a single brief pulse — a momentary 3px gold rule brightening at the panel's top edge — to signal that data was captured. This is the only active animation tied to session state change. The user can open the panel by tapping a small "SESSION BRIEF" label in Teko at the top of the message list.

The brief panel when open pushes the message list down. It does not overlay it. The user sees the brief above the conversation. Closing it is a tap on the same label. This design avoids the problem of a brief panel that overlays messages — which on a small screen creates a situation where the user cannot read both simultaneously.

### Quick Actions on Small Screens

On screens narrower than 390px (smallest common iOS viewport), the three quick-action labels may truncate. The truncation rule: labels shorten to their first verb phrase plus an ellipsis ("Download the SUNAT…") rather than clipping mid-word. The full label is accessible via a press-and-hold tooltip — a native long-press behavior that shows the full label in a small tooltip above the button.

On very short screens (phone in landscape), the action row may reduce to two visible actions with a "···" third button that expands a small action picker. The expanded picker shows the third action as a full-width button that appears above the row. This ensures all three actions are always reachable without requiring vertical space that is not available in landscape.

---

## 4. TRUST ARCHITECTURE

Trust is not built in a single moment. It is accumulated across the conversation through six mechanisms. Each one addresses a specific doubt that a B2B trade buyer carries into any commercial conversation.

### Mechanism 1: The Induction as Demonstration of Intelligence

The opening question is the first trust beat. "Are you buying for your own operation, or moving/reselling to someone else?" is not a form field. It is a question a knowledgeable person asks. The formulation itself signals trade expertise: it immediately distinguishes the two most fundamental commercial positions — buyer and reseller. A buyer who has dealt with generic chatbots encounters this and understands: this is not a chatbot. The induction is where Mister's intelligence makes its first impression.

Trust at this point: zero to baseline positive. The user is willing to engage.

### Mechanism 2: The Precision of the Next Question

After Q1, Mister's follow-up question is not generic. It is specific to the user's answer. "Got it. Is this a one-off purchase, or part of a bigger project or build-out?" This specificity — asking the next logically necessary question rather than a generic "tell me more" — signals that Mister is operating from a mental model of the user's situation. The user feels assessed, not helped. That is the right register for a trade context. Buyers do not want to feel assisted; they want to feel understood.

Trust at this point: baseline to earned attention. The user expects something useful.

### Mechanism 3: The Session Brief as Structural Proof

When the first field populates in the session brief, the trust mechanism is structural rather than conversational. The user sees their own words transformed into structured data. "Use case: commercial refrigeration" or "Archetype: Logistics Manager." The brief is the proof that Mister is not going to lose the context. It externalizes the memory function of the conversation, making it visible and verifiable. The user no longer has to hope Mister will remember what they said. They can see it.

Trust at this point: earned attention to qualified confidence. The user begins to invest in the session.

### Mechanism 4: The Refusal to Quote as a Trust Signal

When the user asks for a price and Mister declines to give one — and does so without apology, with a clear explanation of why structure matters more — this is where Mister either wins or loses the sophisticated buyer. A buyer who has been burned by a broker giving them a number that was 20% off when the quote came back will recognize immediately what Mister is doing and why. The refusal is not a weakness; it is the signal that Mister will not set false expectations.

The LandedCostWaterfall that appears in response to the price question is the physical expression of this trust mechanism. Five layers, indexed, every one disclaimed. The buyer learns more from the waterfall than from any single number they could have been given. And they learn it in a way they can verify — the structure is logical, the drivers are named, the ranges make sense.

Trust at this point: qualified confidence to credibility. The user starts treating Mister as a specialist rather than a tool.

### Mechanism 5: Naming What Mister Cannot Do

Mister's credibility is reinforced every time it routes rather than speculates. "Lead time must be confirmed by the team" — stated directly, without apology, with an immediate offer of the path to confirmation. "I don't have the document for that country — the logistics desk will have it." These statements increase trust precisely because they demonstrate that Mister knows its own limits. A tool that knows what it does not know is more trustworthy than one that answers everything.

Trust at this point: credibility to authority. The user believes what Mister tells them because they have seen what Mister will not tell them.

### Mechanism 6: The Pre-Filled Handoff as Proof of Retention

The final trust beat is the handoff itself. When the quotation form opens pre-filled with everything the user has said — destination, product interest, Incoterm, timeline, budget band, on-site date — the user experiences the proof that everything they said was worth saying. The brief becomes the form. The conversation was not a detour; it was the form-filling, done conversationally.

This is the highest-trust moment in the Mister experience. If this moment lands correctly, the user submits the form without hesitation. They have not been sold to. They have been served.

---

## 5. FRICTION AUDIT

Every moment where a user might abandon, and the exact design response.

### Friction Point 1: The Blank Open

**When it happens.** The user opens the floating Mister window and sees the empty state before the first message loads.

**The risk.** A blank or generic empty state breaks the expectation set by the launcher. The launcher said "MISTER" with authority. If the response is a chat bubble with "Hi there, how can I help you today?", the user closes it.

**The design response.** The first message is hardcoded, not API-called. It loads in under 400ms. The empty state between window open and first message is not a spinner, not a loading bar, not an ellipsis. It is the single-line text "Loading relevant context." in Flexo at `--mister-text-muted`. This string, from the copywriter's contribution, is a factual statement rather than a placeholder. It implies that Mister is loading something specific to the user's context. The blank lasts under 400ms; the hardcoded first message replaces it.

### Friction Point 2: The Question That Feels Like a Form

**When it happens.** Any induction question can feel like a form field if it is phrased as one.

**The risk.** "Please select your buyer type: (A) I am buying for my own use (B) I am a reseller (C) I am a logistics professional" is a form. It reads as a drop-down wearing a chatbot costume. The user who encounters it does not feel addressed; they feel processed.

**The design response.** The induction question is conversational prose. Tap-selectable options appear below the question as quick-action buttons — 3 visible options that cover the most common answers. But free text is equally valid and equally classified. The user who types "I handle logistics for my clients" without tapping a button gets exactly the same archetype resolution as one who taps the logistics option. The buttons accelerate; they do not gate. This is the most important UX principle for the induction: the path of least resistance must be the correct path, but no path must feel like the only path.

### Friction Point 3: The Price Refusal

**When it happens.** The user asks for a price and Mister declines to give one.

**The risk.** If the refusal feels like a limitation, the user leaves. "I can't give you a price" with a redirect to a form is exactly the experience that makes buyers hate chatbots.

**The design response.** The refusal is architectural and it is framed as a feature. The copywriter's guardrail deflection string — "I don't generate prices — that's by design, not a limitation. What I can show you is how the cost is built." — does not apologize. It reframes the refusal as the value. The LandedCostWaterfall renders immediately as the demonstration of what Mister CAN do. The user's attention is redirected from what they asked for to something more valuable. If the waterfall is well-designed (and per the designer and finance contributions, it is), the user who asked for a number leaves with something better: an understanding of what will determine the number.

The critical UX timing: the waterfall must appear in the same turn as the price deflection. Not in a follow-up turn. Not after an acknowledgment. Immediately. The user who gets a refusal and a waterfall in the same breath has less opportunity to decide to leave than the user who gets a refusal and then waits for the waterfall.

### Friction Point 4: The Induction Refusal

**When it happens.** The user says "I just want to look" or "skip the questions" or provides no useful signal in the first two turns.

**The risk.** Forcing the induction on a user who resists it produces the worst possible opening: a bot that ignores the user's request and repeats the question.

**The design response.** If the user signals resistance, Mister drops to observe mode. Archetype = `unresolved`. Mister says "Understood — take a look. Ask me anything when you're ready." One sentence, no follow-up questions. The session brief shows "Archetype: resolving." The user browses. If they ask a subsequent question with a strong signal ("what's the MOQ for this?"), Mister silently resolves to the nearest archetype and continues as if the induction had been completed. The user never encounters the induction as a gate.

### Friction Point 5: The Spec Mismatch

**When it happens.** A2 users state a technical requirement that the catalog cannot meet.

**The risk.** "Sorry, we don't carry that" is a dead end. The user has just told Mister the most specific thing about their situation — their spec — and the response is a rejection. They leave.

**The design response.** Mister does two things simultaneously. First, it surfaces the nearest catalog option that partially meets the spec, framed not as "this is close enough" but as "here is the catalog option on the same spec axis — here is where it aligns and here is the gap." Second, it opens the custom-inquiry route: "I've noted the spec delta. The project specialist will have this context when you connect." The user has two live paths: evaluate the catalog alternative, or route to the specialist with the spec gap already documented. Neither path is an end.

### Friction Point 6: The Document Library Gap

**When it happens.** An A3 or A5 user requests a customs document for a country not in the Wings document library.

**The risk.** "We don't have that" with no path forward is a trust failure. The A3 user came for operational intelligence. If Mister can't provide it, they need to know who can, immediately.

**The design response.** Mister states the gap without hedging, then routes in the same turn. "I don't have the specific checklist for [country] in the library. I'll connect you with the logistics desk — they'll have it." The ContactCard renders in the same message. The user has the logistics team's WhatsApp before they have finished reading Mister's response. The gap costs Mister zero trust because the routing is so fast and specific.

### Friction Point 7: The Abandonment Between Stages

**When it happens.** The user goes silent between the consideration stage and the pre-qualification stage — the moment where the conversation transitions from educational to commercial.

**The risk.** This transition is the highest-friction point in the journey. The user has learned what they came to learn. They may not feel ready to commit to providing their tax ID, destination, and timeline. The conversation stalls.

**The design response.** Mister does not push at this moment. It offers, not demands. The pre-qualification questions are phrased as enabling steps, not data-collection exercises. "Where will the delivery go?" is not "Please provide your destination for the quotation." The session brief is visible, showing what has been captured and what remains. The quotation CTA is visible but inactive — the user can see what they would unlock by continuing.

If silence persists for 3 minutes past the last exchange, the save-state message appears: "I've saved your session brief. Return here to continue, or pick this up on WhatsApp — the brief travels with you." This message offers two valid exit paths (neither of which is "abandon") and makes the brief's persistence explicit. The user who was not ready to continue now knows they can leave without losing the work.

### Friction Point 8: The Mobile Keyboard-and-Quick-Actions Collision

**When it happens.** On mobile, the keyboard opens and the quick action buttons disappear behind it.

**The risk.** The user who tapped the composer now cannot see the quick actions. If they do not know what to type, they have no affordance to reach the options. They close the keyboard, which closes their intent to respond.

**The design response.** As described in Section 3: quick actions remain above the composer's top border within the scroll-compressed message list. When the keyboard is open, the last visible element is the quick action row. The user can tap a quick action without dismissing the keyboard. The layout uses `visualViewport` and `dvh` units to ensure the quick actions are always above the keyboard fold.

### Friction Point 9: The Handoff That Feels Like a Drop

**When it happens.** The user is routed to WhatsApp or the quotation form, the Mister window closes or becomes inactive, and the user does not know what happens next.

**The risk.** A handoff without continuity is a cold lead. The user wonders whether anyone actually received their information. The Wings team receives a form submission with no context. The first call starts with the buyer re-explaining everything.

**The design response.** The handoff UX is designed for continuity, not closure. When the WhatsApp button is tapped, a system message appears in the Mister thread (styled distinctly from Mister's messages — lower opacity, no left-rule, centered text): "Your inquiry has been received by the Wings team. A specialist will follow up via WhatsApp." The Mister window does not close. It displays the final state of the session brief alongside this system message. The user has confirmation, and Mister stays available for follow-up questions while they wait.

When the quotation form is triggered, it opens as an overlay or a new page — not by closing Mister. The pre-fill token has already been generated; the form opens with every collected field pre-populated. The user sees their own session brief rendered as a form. They did not "go to a form" — their session became the form.

---

## 6. INDUCTION FLOW UX — HOW THE 4-QUESTION BRANCH FEELS

The induction is Mister's audition. In 2–4 turns, it must establish: expertise, relevance, peer-register, and forward motion. The user must feel interviewed by a specialist, not surveyed by a system.

### Timing and Latency

The Q0+Q1 combined opening message is hardcoded. It loads in under 400ms from window open. This is the most important latency constraint in the entire Mister experience. A user who waits more than one second for Mister's first response has already formed a negative impression. The hardcoded opening eliminates this risk entirely.

Subsequent turns in the induction begin streaming within 800ms of the user's answer. The streaming starts before the full response is generated — the user sees the first word of Mister's next question appear while the rest is being composed. This streaming behavior is not an animation trick; it is a deliberate signal that Mister is generating a response in real time, not retrieving a pre-written template. It feels alive.

### How Tapped Answers Display

When the user taps a quick-action button to answer an induction question (rather than typing), the following sequence occurs:

1. The tapped button flashes to its active state (background `--mister-gold-fill-active`) for 80ms.
2. The user's answer appears immediately in the message stream as a warm-paper rectangular block, right-aligned. The label from the quick-action button becomes the message text. This is critical: the user must see their tap translated into their own words in the conversation. It confirms the selection was registered and creates the conversational record.
3. The quick-action row disappears from below Mister's previous message. It has been consumed by the selection.
4. Mister's streaming response begins within 800ms.

The result is a 4-beat rhythm: tap, see your answer appear, see Mister begin responding, read the next question. Each beat takes under one second. The conversation feels fast because each action has immediate visible consequence.

### How Typed Answers Display

When the user types a free-text answer, the display behavior is identical to a tapped answer — the typed text appears as a warm-paper block right-aligned, Mister begins streaming. The difference is internal: the model classifies the free text into the nearest decision branch. The user never sees the classification. They see Mister ask a question that is exactly appropriate for what they typed, which confirms the classification was correct.

### Transitions Between Questions

Between induction questions, there are no page transitions, no stage announcements, no progress indicators. The conversation simply continues. The session brief updates silently. The user who is on Q3 of the induction does not know they are on Q3 — they are in a conversation with a trade specialist who is asking pointed questions.

When the archetype resolves, two things happen visually and simultaneously. The session reference "WGT-XXXX" in the header transitions from `--mister-text-ghost` to a subtle gold — the document gets filed. The session brief's archetype field populates with the resolved archetype label in Teko uppercase. These happen in the same frame, requiring no animation, no fanfare. The document has been filed. The specialist knows who they are talking to.

The first message in the A-type lane — the first question calibrated to the resolved archetype — is noticeably different in register from the induction questions. It is more specific, uses more technical vocabulary calibrated to the archetype, and references something the user said during induction. This is the moment the user understands that the conversation has gotten sharper. The archetype resolution happened; its effect is felt in the next sentence.

### The Resist-and-Observe Path

When the user declines to engage with the induction, the UX response is immediate disengagement from the induction, not persistence. Mister says one sentence and stops asking. The session brief shows "Archetype: resolving." The quick actions shift to surface-level product exploration actions rather than induction-progression actions. The user is in control.

The recovery is invisible. If the user asks any question with an archetype signal — "what's the MOQ?", "do you do CIF to Lima?", "I'm looking for something for my food storage facility" — Mister classifies it and continues from the nearest archetype without announcing the classification. The induction is effectively completed by the user's natural use of the interface, not by their answers to explicit questions.

---

## 7. QUICK ACTION SURFACE UX

Three buttons per turn. These are the navigational skeleton of the Mister conversation. They must be designed with the precision of a physical tool interface — a user who is in a B2B conversation does not have patience for ambiguous or generic options.

### Rendering

Quick actions render directly below the assistant message content, in the 32px-offset zone (aligned with message text, not the left margin column). They appear as a horizontal flex row with 8px gap. Each button is a rectangular outline tag — 28px tall, auto-width, 2px border radius, transparent background with a gold-tinted border.

The buttons do not appear all at once. They arrive with the last token of the assistant message — they appear as the streaming response completes. This timing is intentional: the user reads the message first, then encounters the actions. The actions are a natural continuation of the message, not a navigation element that appeared in the UI while they were reading.

### Rendering order matters

The three quick actions are ordered by immediacy of intent, not alphabetically. Rank 1 is the action that advances the conversation on the path of least friction. Rank 2 is an adjacent path. Rank 3 is a safety valve — either a deepening action (if the user wants more detail) or an escalation shortcut (if the user wants to skip ahead). The user reading left to right naturally encounters the most useful action first.

### Label Specificity

Labels are imperative and specific. "Download the SUNAT document checklist for my destination" not "Download document." "Show how this cost is structured" not "Learn more." The specificity serves two purposes: the user knows exactly what will happen when they tap, and the label itself is educational — it tells the user that such a thing as a "SUNAT document checklist" exists and that Mister can provide it. The quick actions are also a vocabulary lesson in trade terms.

### Animation on Intent Signal

When a user places their thumb over a quick action button on mobile, the border brightens to `--mister-qa-border-hover` immediately — no delay, no easing. This is the intent signal. On actual tap, the background fills to `--mister-gold-fill-active` for 80ms (the press confirmation), then the button disappears as the tap action processes. The disappearance is the confirmation that the selection was taken.

On desktop, hover produces the border and background transition at 0.15s ease. The cursor should be `pointer`. The label does not change on hover. The button does not animate in position or scale.

### The Quick Actions Are Not CTAs

This distinction is critical. CTAs (the quotation trigger, the WhatsApp button, the meeting booking) are full-width or near-full-width elements with a solid gold background, navy text, and higher visual weight. Quick actions are secondary — they surface the next conversational move, not the conversion action. This visual hierarchy must be maintained even when the quick actions include things like `open_quotation`. In that context, the quick action version of "open quotation" is the lightweight tag; the full CTA with the pre-fill summary strip is a separate, higher-weight element that renders when Mister formally offers the quotation at the handoff stage.

### Disappearance on Selection

When a quick action is tapped, the entire quick action row disappears from below the previous assistant message. The user's selection appears as their message (warm-paper block, right-aligned). The next Mister response appears with a new set of three quick actions. This prevents the conversation from accumulating abandoned quick action rows as the user progresses — the thread stays clean. Each set of quick actions belongs to the turn they were attached to; once a turn is answered, its options are consumed.

---

## 8. ESCALATION UX — HANDOFF TO WHATSAPP OR QUOTATION FORM

The escalation is the conversion moment. Everything before it was building toward it. Everything about the escalation UX must reinforce the feeling that the conversation was worth having.

### Escalation Trigger Visibility

The user must see the handoff coming. Not as a warning, but as a natural progression signal. Two things make this visible before the escalation turn:

First, the session brief's pre-qualification fields have been populating across the prior 3–5 turns. The user can see the brief filling in. When the minimum pre-qual conditions are met, the quotation CTA transitions from subdued to active. The user can see that something is now available that was not available before.

Second, the final pre-qualification question from Mister signals the approaching handoff explicitly: "So if I open the quotation form now, I'll pre-fill your destination and what we've discussed — ready to do that, or still have questions first?" The user chooses the handoff. This is the Fogg model in action: motivation (they came to get a quotation), ability (all the data is collected), and a prompt (the explicit offer). The escalation is not pushed on the user; it is offered at the exact moment they are most ready to receive it.

### What Carries Over to WhatsApp

When the WhatsApp escalation is triggered (via the `connect_whatsapp` action or the ContactCard), the session brief is converted to a structured text and appended to the WhatsApp message as the opening payload. The Wings ops team receives a message in the format:

"New inquiry from Mister [WGT-XXXX] — [Archetype] — [Summary of collected fields]" followed by the specific fields: destination, product interest, Incoterm, volume, timeline, and any specialist notes from the session. The user does not write this message. Mister composes it from the `collected` fields and sends it with the WhatsApp link pre-populated.

On the Mister side, a system message appears in the thread: "Your inquiry has been received by the Wings team. A specialist will follow up via WhatsApp." The Wings phone number (+50760250735) is displayed as a tap-to-chat link in the ContactCard. The user can initiate the WhatsApp conversation directly from the Mister thread without leaving the Wings site.

### What Carries Over to the Quotation Form

The `triggerQuotationForm` action returns a `formUrl` with a `prefillToken`. When the user taps the quotation CTA, the form opens (new tab or overlay, based on implementation choice — overlay is preferred to maintain context) with every collected field pre-populated.

The pre-fill summary strip that appears above the CTA button shows the collected fields inline before the user taps: "DESTINO: Lima, PE · PRODUCTO: [name] · INCOTERM: CIF · TIMELINE: Q3 2026." The user sees exactly what will be in the form before they open it. This removes the uncertainty of "will I have to re-enter everything?" that makes users avoid forms. They can see the answer before they ask.

The archetype flag is embedded in the `prefillToken`. The Wings team who receives the quotation sees the archetype label at the top of the submission — "Archetype: Project Manager" — which tells them exactly how to approach the response. An A2 quotation response looks different from an A4 one; the flag enables the Wings team to calibrate before they call.

### The Continuity of the Thread

After escalation, the Mister thread remains open. The user can continue asking questions. If they submitted the quotation form and have a follow-up question, Mister is still available. This is critical for A2 users who may realize they forgot to flag something in the form — they can tell Mister, who adds it to the session notes.

For users who escalated to WhatsApp and then return to the website, the Mister thread shows the system message confirming the handoff, and the session brief shows the escalation type and timestamp. The user can see the full history of what was captured and where it went.

---

## 9. THE SINGLE MOST IMPORTANT MOMENT IN THE MISTER UX

**It is the first LandedCostWaterfall render, when it arrives in response to a price question.**

This is the moment where Mister's entire value proposition becomes physically visible. Everything before this moment has been building credibility. This moment is the delivery.

A buyer has asked for a price. In every other context they have operated in — a broker, a marketplace, a supplier's quote form — they would receive a number. Sometimes that number is accurate. Often it is not. The number sets an expectation, and when the real quote comes in higher, the relationship starts with disappointment.

Mister does not give a number. Instead, within the same response, the waterfall renders: five segments, indexed from base 100, every segment labeled with Bloomberg-precision, every value in Teko's instrument register, the duties segment gold-tinted to flag SUNAT's authority over that layer, the total shown as a band [115, 149] with "ÍNDICE TOTAL ESTIMADO" above it and the handoff disclaimer below it.

The conversation note above the waterfall — from the game designer's contribution: "when the LandedCostWaterfall renders for the first time, if the buyer's Incoterm or destination makes one particular layer the dominant variable, Mister names it immediately and specifically" — is the UX direction that elevates this moment from informational to insightful. Mister does not just show the waterfall. It tells the user which layer is their biggest driver given what has been collected so far. "On these terms, freight is your largest variable — container optimization on this lane typically moves the index 6–9 points. Your destination port matters here."

**The exact design of this moment:**

The message arrives streaming, the waterfall component renders immediately after the last streaming token, and there is no delay between the message end and the waterfall appearance. The component has already been constructed server-side and the surface event arrives via the SSE stream. The user reads Mister's message and the waterfall is already there when they finish.

The waterfall renders with the product segment anchored at BASE 100 in gold — the only gold value in the entire component. Every other layer is warm white, indexed. The insight sentence sits above the waterfall component as text, naming the dominant driver. Below the waterfall, the quick actions are: `explain_cost` for the user who wants to dig into a specific layer, `open_quotation` for the user who is now ready to commit, and `connect_whatsapp` for the user who wants to ask a follow-up question to a human.

**Why this moment is the most important:**

It is the moment that either justifies or destroys the promise of the entire Mister experience. A buyer who asked for a price and received the waterfall either understands immediately that they got something more valuable — or they feel stonewalled and leave. The design of this moment determines which outcome occurs.

The design decisions that tip it toward "more valuable":

The specificity of Mister's insight note. A generic "here is how landed cost is structured" sends the user to the waterfall without direction. The specific "freight is your largest driver on this lane — container type moves the index 6–9 points" tells the user where to look and what to think about. The waterfall stops being an abstract explanation and becomes a tool the user can immediately use.

The visual authority of the waterfall itself. If the component looks like a calculator widget or a colored bar chart, the buyer reads it as an estimate tool and is disappointed it has no number. If it looks like a cost apportionment schedule from a trade document — which, per the designer's specification, it does — the buyer reads it as the structural intelligence it is.

The routing offer at the end. The turn that includes the waterfall ends with one clear sentence: "For actual figures, the quotation form is the next step — I'll pre-fill it with everything we've covered." The waterfall is not a dead end. It is the middle of the journey. The buyer who understands the waterfall is more qualified to commission a real quotation than the buyer who received a number. Mister makes this explicit in the routing sentence.

**If this moment works as designed, the buyer who walked in asking "what does this cost?" walks out understanding why that question can only be answered by a quotation, why the quotation will say what it will say, and why asking for a real quotation is the correct next step. That is the conversion, and it happened through education, not pressure.**

---

## CROSS-CUTTING UX PRINCIPLES

**One primary job per turn.** Every Mister turn has one central purpose: ask a question, surface a piece of information, or offer a handoff. Turns that try to do all three create cognitive overhead. The quick actions supplement the turn's primary job — they do not expand it.

**Recovery before abandon.** Every potential exit has a designed recovery path before it becomes an exit. A price question recovers via the waterfall. A spec mismatch recovers via the nearest catalog option plus custom inquiry. A document gap recovers via the logistics specialist contact. No path through Mister ends at a dead end.

**The brief is the proof.** The session brief is not a secondary feature. It is the trust infrastructure of the entire experience. Every design decision that serves the brief — the turn-by-turn data collection, the field population signals, the handoff via prefill token — serves the conversion goal. The brief is why Mister is better than a form: the form collects the same data, but the brief builds it through a conversation that simultaneously educates and qualifies.

**Momentum is the product.** The buyer who is in forward motion — accumulating understanding, watching the brief fill, approaching the pre-qual gate — will convert. The buyer who stalls, repeats themselves, or hits a dead end will not. Every friction point identified in Section 5 is a momentum break. The design responses are momentum restoration mechanisms. Forward motion is the UX deliverable.

---

*Experience Architect Contribution · Mister · Wings Global Trade*
*Prepared for conductor synthesis · June 2026*
*No code. UX decisions only. Every call here is a conversion architecture decision.*
*Archive note: All files in spec/contributions/_archive_accio_jun17/ are stale and must not be referenced.*
