# Game Designer Contribution — Wings Global Trade

## Framing Principle

Gamification on Wings is not about points, badges, or leaderboards. The buyer is a purchasing manager or trading company director. They have a container load to price, a finance team to satisfy, and a supplier to replace. The platform's job is to make the path to a CIF estimate feel effortless, intelligent, and professionally satisfying — not cute.

Every mechanic here passes a single test: would this feel at home in a Bloomberg terminal, a customs brokerage dashboard, or a professional procurement tool? If yes, it's in. If not, it's out.

The north star is not engagement time. It is inquiry conversion rate.

---

## The Core Loop

### First-Visit Loop (The One That Matters for MVP)

```
Arrive → Discover entry point → Engage AI or browse catalog → See value (estimate or specs) → Submit inquiry
```

Wings has no reason to engineer habit loops in v1. The buyer is not here daily. They are here when they need to source a product — which means once per import cycle. The loop to design for is completion on the first visit.

**What creates urgency within the loop:**
- The CIF estimate as a tangible deliverable (something to take to their finance team)
- The TPR Sheet as a growing document (visible proof that work is accumulating)
- The reference number at submission (turns an inquiry into a real file)

### Repeat Use Loop (v2 Foundation)

```
Return for new category → Recall previous estimate → Add to comparison → Submit second inquiry
```

Repeat use is built on professional utility, not gamification. The buyer returns because Wings gave them a useful estimate last time and they want to price another product. Session persistence (even shallow `sessionStorage`) is the primary lever here, not any UI mechanic.

---

## Gamification Opportunities — Accio Engine TPR Flow

### 1. The TPR Sheet as a Live Dossier (Primary Mechanic)

The TPR Sheet is not a form. It is a dossier being assembled in real time. This framing changes the visual and behavioral design.

**Implementation logic:**

The sheet header carries a field-count indicator in DM Mono: `6 / 10 campos`. Not a progress bar. Not a percentage. A precise count, like a document checklist. This language belongs to the trade world — it reads like "6 of 10 line items confirmed."

Each field in the TprSheet component passes through three states:

**State 1 — Empty (session start)**
- All 10 fields show a dash or blank value
- Status indicator: small grey circle
- Label in muted warm-white / 60% opacity
- Sheet header: "Requisito técnico" in DM Mono, neutral

**State 2 — Minimum (6 of 10 fields captured)**
- At least these fields are filled: product description, HS code, quantity, target price, destination market, source market preference
- Status indicator for captured fields: gold dot (the TprField `captured` state already specifies this in component-architecture.md — this is the animation that carries the emotional weight)
- Sheet header transitions to: "Listo para estimar" in DM Mono gold
- The CIF estimate card slot appears below the field list — visually gated, navy background, showing "Calculando estimado CIF..." as a placeholder or idle state
- The "Enviar consulta" button becomes active

**State 3 — Complete (8+ of 10 fields, or all required + at least 2 optional)**
- Sheet header: "Requisito completo" in DM Mono gold
- Field count: `10 / 10 campos`
- All status dots gold
- Subtle: the entire TPR Sheet border changes from muted to full gold (1px border, not dramatic)
- CIF estimate card fully populated

The transition from State 1 to State 2 is the key moment. It should feel like a document being signed off — not a game being won.

### 2. The Completeness Meter — The One Mechanic That Unlocks Everything

**This is the single mechanic that makes the platform 10x more engaging.**

The completeness meter is the mechanism by which the CIF estimate is gated and progressively revealed. It works as follows:

**Gate logic:**
- Below minimum completeness: "Para calcular tu estimado CIF necesito: [list of missing required fields]." The estimate card in the TPR Sheet shows an empty state with the specific blockers listed, not a generic lock icon.
- At minimum completeness: CIF estimate is calculated immediately and revealed in the TPR Sheet. The reveal is the reward.
- At full completeness: estimate confidence indicator shows "Alta precisión" vs. "Estimado preliminar" at minimum state.

**Why this works for B2B:**
- The buyer is not being rewarded with a badge. They are being rewarded with actionable commercial data — a number they can put in a spreadsheet.
- The gate is not arbitrary. It is logically tied to what is actually needed for the calculation. The AI tells them exactly what is missing. This feels like a smart tool, not a game.
- The progressive reveal gives Wings a reason to ask for more fields (better estimate precision) after the minimum is met. Post-minimum engagement: "Con el plazo de entrega y las certificaciones requeridas puedo ajustar el estimado de flete. ¿Quieres añadirlos?"

### 3. Momentum Mechanics in the Chat Flow

The Accio chat must maintain forward momentum. These are the micro-mechanics that keep the conversation moving:

**Affirmation without flattery.** Each time the AI captures a field, it reflects the value back precisely before asking the next question. "Entendido — 50 unidades de tractor agrícola con motor diésel de 90 HP. ¿Cuál es tu precio objetivo por unidad en USD?" This is not praise. It is confirmation. For a B2B buyer who is paranoid about miscommunication, this is deeply satisfying.

**One question per turn, always.** No multi-question turns. The cognitive load of a chat asking three things simultaneously is high. One question keeps the session moving without friction. The AI should be architected to never ask more than one question per response.

**Turn count awareness.** The AI should know, at turn 7 of 10 questions, that it is close to completion. At that point: "Tengo casi todo lo que necesito para tu estimado. Solo me faltan dos datos más." This is a verbal completeness indicator — the buyer knows they are close to the reward.

**Typing indicator as anticipation.** The typing indicator (three dots while AI responds) must be present and fast. Latency above 800ms without a typing indicator reads as broken. With a typing indicator it reads as "thinking." This is the difference between a tool that feels live and one that feels broken.

---

## Variable Reward Opportunities

### Primary Reward: The CIF Estimate

The CIF estimate is the prize. It is not just a number — it is the output that the buyer takes to their finance team, their import agent, their partner. Wings should treat the estimate reveal with appropriate visual weight.

**The reveal sequence:**
1. AI announces: "Tu estimado CIF está listo. Revísalo en el panel derecho."
2. The CIF estimate card slides up in the TPR Sheet (y 16→0, opacity 0→1, 0.5s — as specified in animation spec)
3. The line items populate sequentially: FOB → Flete → Seguro → ─── → CIF Total
4. The CIF Total value counts up from 0 to its value in 800ms, ease-out, in gold DM Mono
5. Below: the free zone savings percentage appears last, also counting up: "Ahorro estimado vía zona franca: 18.5%"

The count-up animation is not decorative. It communicates: this is a real calculation, just computed. It is the same pattern used by financial terminals and customs duty calculators worldwide.

**Variable element:** The savings percentage is the variable reward. It differs by product, source market, destination country, and HS code. Buyers who have used the tool before may see a different savings figure. This creates genuine curiosity. "I wonder what the free zone savings would be on buses vs. trucks."

### Secondary Reward: The Reference Number at Submission

After submission, the success state shows a real reference number (the Supabase lead ID formatted as `WGT-[year]-[sequence]`). For example: `WGT-2026-0047`.

This is not a cosmetic detail. A reference number signals:
- This is a real company with a real tracking system
- This inquiry has an identity, not just an email in someone's inbox
- The buyer has something to follow up with: "I'm calling about WGT-2026-0047"

**Specificity in the timestamp:** "El equipo Wings te contactará antes de [current date + 24h formatted as: martes 18 de junio, 18:00]." Not "en las próximas 24 horas." A specific time creates accountability and reads as a professional commitment.

### Tertiary Reward: Source Market Discovery (Catalog Flow)

Product cards in the catalog reveal source market details on hover — the flag abbreviation, the market badge, the port of origin. For a buyer who has been working with an opaque supplier, seeing "Origen: Japón — puerto de Yokohama" is a small but genuine discovery.

This is not implemented as animation for its own sake — it is information revealed at the right moment (when the buyer is evaluating the product, not before).

---

## Engagement Drop-Off Risks and Prevention

### Risk 1: Accio Chat Abandonment Before Minimum Completeness

**Trigger:** Buyer engages 4–5 turns of chat, then leaves without reaching the estimate.

**Why it happens:** The reward (CIF estimate) is not visible enough early in the flow. The buyer does not know how far they are from it.

**Prevention:**
- Show the TPR Sheet field count from the first message. `0 / 10 campos` on session start makes the completion state visible immediately.
- At 3 fields remaining: AI inserts a natural milestone marker: "Estoy a tres preguntas de poder calcular tu estimado CIF."
- At 2 fields remaining: "Con tu precio objetivo y el mercado de destino podré darte el estimado."
- Never let the buyer be more than 2 questions from the estimate without knowing it.

**On mobile:** The TPR Sheet is hidden in a drawer. The drawer toggle button must always show a field count badge: "Ver resumen · 5/10". This keeps the progress visible even when the panel is collapsed.

### Risk 2: Chat Fatigue (Too Many Turns, Same Energy)

**Trigger:** The AI asks questions with the same structure and tone for 10 consecutive turns. The buyer disengages.

**Why it happens:** LLM-generated conversation without tonal variation reads as robotic after 5 turns.

**Prevention:** The AI system prompt should vary the question framing across the conversation arc:
- Turns 1–3: open, exploratory ("Cuéntame sobre el producto")
- Turns 4–6: precise, confirmatory ("¿El peso por unidad está entre 800 y 1200 kg?")
- Turns 7–8: closing, momentum ("Casi listos. ¿Cuál sería el plazo de entrega ideal?")
- Turns 9–10: wrap-up ("Con eso tengo todo. Calculando tu estimado.")

The arc should feel like a structured conversation with a trade specialist, not a form.

### Risk 3: Catalog Inquiry Form Abandonment

**Trigger:** Buyer reads product specs, clicks "Solicitar cotización," begins the InquiryForm, then abandons mid-fill.

**Why it happens:** The form is long (7 fields). After the specs table, a long form reads as a second investment the buyer was not expecting.

**Prevention:**
- Show the InquiryForm with the minimum visible fields upfront (name, email, phone, quantity). "Additional details" collapses to an optional section.
- Field validation on blur, not on submit. Immediate inline feedback prevents the frustration of submitting and seeing a list of errors.
- The sticky CTA on mobile ("Solicitar cotización") must appear only after the buyer has scrolled past the spec table — signaling that they have evaluated the product before being asked to act.

### Risk 4: Mobile TPR Invisibility

**Trigger:** On mobile, the TPR Sheet is in a bottom drawer. The buyer completes 8 turns of chat and does not know the TPR is being populated. They feel like nothing is happening.

**Prevention:**
- The "Ver resumen TPR" button is always visible at the bottom of the chat on mobile, above the input field.
- The button carries a live field count badge in DM Mono: `Ver resumen · 6/10`. This badge updates after every AI turn that captures a field.
- When minimum completeness is reached, the button label changes: "Ver estimado CIF" with a gold accent — pulling the buyer to open the drawer and see the reward.

### Risk 5: Submit-Gate Frustration

**Trigger:** Buyer sees the "Enviar consulta" button but it is disabled. They click it. Nothing happens. They do not know why.

**Prevention:**
- The button is never disabled without explanation. Below the disabled button: "Necesito: [list of missing required fields]" — always specific, always actionable.
- When minimum completeness is reached, the button does not just become active — it transitions in visually (opacity 0→1, 0.3s) so the buyer registers the change.

---

## Professional Restraint Guidelines

These mechanics are explicitly excluded as too juvenile for the audience:

- No progress bars with percentage fills (too gamified for trade professionals)
- No confetti or celebration animations on submission
- No sound effects
- No level-up language ("You've unlocked the estimate")
- No streak mechanics
- No points or scores visible to the buyer
- No social proof tickers ("47 importers are using Accio right now")

The design language for all mechanics is: financial terminal, customs dashboard, procurement tool. Every interaction should feel like it belongs in a B2B SaaS tool used by serious operators.

---

## Summary: The Engagement Stack

| Layer | Mechanic | Impact |
|---|---|---|
| PRIMARY | TPR completeness as CIF estimate gate | Drives all 10 fields being answered |
| PRIMARY | CIF estimate as counted-up financial reveal | Makes the reward feel real and earned |
| SECONDARY | Turn-count awareness in AI conversation arc | Prevents mid-flow fatigue |
| SECONDARY | "3 campos restantes" proximity cues | Prevents abandonment near completion |
| SECONDARY | Mobile field count badge on drawer button | Maintains progress visibility on small screens |
| TERTIARY | Real reference number at submission | Builds trust, closes the loop |
| TERTIARY | Specific 24h follow-up timestamp | Creates accountability, not just acknowledgment |
| FOUNDATION | Session persistence via sessionStorage | Removes loss-aversion as abandon trigger |
| FOUNDATION | Post-minimum upsell for higher estimate precision | Drives completeness past minimum toward full |
