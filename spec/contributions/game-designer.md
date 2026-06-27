# Mister — Engagement Design
**Role:** Game Designer / Behavioral Engagement Designer
**Lens:** Behavioral loops for serious B2B trade buyers. Not arcade. Not consumer. The standard is a Bloomberg terminal or a well-run procurement briefing — information density, professional recognition, progressive clarity.

---

## 1. Core Engagement Loop

**What keeps a senior trade buyer in a Mister conversation is the experience of fog burning away, turn by turn.**

A buyer arrives with a cloud of unknowns: Will Wings actually supply what I need? What will this land at? Is this worth my time or am I going to end up with a generic quote in three days? The intrinsic reward of each Mister turn is not entertainment — it is *precision arriving where ambiguity was*.

The moment-to-moment loop:

```
1. Buyer inputs a question, need, or signal
2. Mister responds in the voice of a peer who understood — not a helpdesk that parsed keywords
3. A new piece of structured information materializes (a surface renders, a field in the session
   brief populates, a document becomes available)
4. A specific, tightly scoped next question appears — one that would only be asked by someone
   who retained everything said before
5. The buyer answers because the question is relevant, not because they feel obligated
6. Repeat — with each turn, the session brief fills in and the conversation moves forward
```

The reward is recognizable to a trade specialist: the same satisfaction as a well-run supplier briefing, where by the end of 20 minutes the other person clearly has everything they need. The buyer is not playing a game. They are being professionally onboarded.

**What breaks the loop (avoid these):**
- A response that ignores something the buyer already stated (breaks recognition)
- A generic question that could have been asked before anything was gathered (signals Mister wasn't listening)
- A stall — "I'll need more information to help you" without a specific question (removes forward motion)
- A visible inability to handle trade vocabulary (breaks peer-register; the buyer stops treating Mister as a specialist and reverts to treating it as a chatbot)

---

## 2. The ONE Mechanic: The Live Session Brief

**The single mechanic that would make Mister 10x more engaging for B2B buyers is the real-time accumulation of a professional session brief — visible alongside the conversation, building itself turn by turn.**

Not a progress bar. Not a percentage. Not a checklist with green ticks. A structured document that looks like the notes a senior specialist takes during a supplier briefing.

**What it contains (for a sample A3 — Logistics Manager session):**

```
SESSION BRIEF — Mister / Wings Global Trade
─────────────────────────────────────────────
Archetype:        Logistics Manager
Corridor:         Tacna (ZOFRATACNA)
Commodity:        Industrial HVAC units — HS 8415
Container:        40'HC
Incoterm:         CIF
Destination:      [empty]
Documents held:   Commercial invoice, packing list
Documents needed: BL, certificate of origin, SUNAT checklist
RUC / Tax ID:     [empty]
Next step:        Confirm destination → generate doc checklist
─────────────────────────────────────────────
```

**Why this mechanic works for B2B buyers specifically:**

A trade specialist's primary anxiety in any supplier conversation is "Am I being heard, or am I going to have to repeat all of this?" The live session brief answers that anxiety structurally, not verbally. The buyer watches their requirements accumulate in real time. They do not have to trust that Mister will remember — they can see that it has.

The gaps in the brief are the signal to continue. The buyer sees that Destination is empty, or that two documents are still outstanding, and continues answering questions not out of gamified obligation but because they want their own brief to be complete. This is the correct B2B motivation: the brief becomes *their* artifact, not Mister's.

The brief also functions as a pre-work document. When the buyer hands off to WhatsApp or shares the quotation request with their team, the brief IS the summary. It was built during the conversation but it looks like a professional intake form they would have filled out anyway.

**Tone calibration for the brief by archetype:**

- A1 (Lead / End Buyer): fewer technical fields, more plain-language labels. "Delivery city" not "destination port."
- A2 (Project Manager): adds "On-site date," "Approver name," "Budget line status."
- A3 (Logistics Manager): full trade vocabulary. HS code, corridor, Incoterm, container type, doc checklist.
- A4 (Reseller): adds "Territory," "Estimated monthly volume," "Exclusivity interest."
- A5 (Wholesale Partner): adds "Markets," "SKU count," "Ramp timeline," "Legal entities."

The brief renders in a sidebar panel (desktop) or collapsible drawer (mobile) — persistent, never obtrusive. It does not announce when a field populates. It just fills in.

---

## 3. Progress Signal

**Do not show a percentage. Do not show "60% to quotation." The dignified form of progress is the session brief itself — what is filled, what is empty, and what the next open field is.**

The buyer can read progress from the brief without being told it. Empty fields communicate what remains. A trade specialist reads an intake form and knows immediately what's missing. Mister should trust the buyer to do the same.

**The secondary progress signal: CTA state.**

The "Get your pre-filled quotation" button (or "Connect me to the Wings team" for A5) renders as inactive — present but clearly unavailable — until the minimum pre-qualification conditions for the archetype are met. It then activates without announcement. The buyer notices the change. This is meaningful signal.

For A1: activates when destination + product interest are collected.
For A2: activates when spec confirmed + destination + budget line status given.
For A3: activates when corridor + commodity + destination confirmed.
For A4: activates when volume estimate + territory + product category given.
For A5: CTA routes to human (not form) — activates as soon as volume and market scope are stated.

**What to avoid:**
- Progress bars with percentages (arcade register)
- "You're almost there!" copy (consumer register)
- Step indicators ("Step 2 of 5") — implies a form, not a conversation
- Blocking gates that require completion before Mister continues ("Answer this to proceed") — paternalistic; the buyer controls the pace

---

## 4. Variable Reward

For B2B buyers, "surprise" is not novelty — it is *unexpected precision* or *unexpected value delivered before the buyer knew to ask for it.* These are the moments where Mister earns the "senior specialist" register.

**Four designed surprise moments:**

**4.1 — The forward-looking surface**
When a buyer asks whether a product meets their spec, Mister confirms AND surfaces an adjacent comparison — unprompted — that shows a model landing at a materially different index point at their volume tier. The buyer didn't ask for a comparison. It appeared because Mister thought ahead. That is the surprise: the system doing work the buyer hadn't commissioned yet.

**4.2 — The document anticipation**
When a buyer is navigating corridor logistics but has not yet asked about documentation, Mister offers the relevant SUNAT/destination checklist before the question arrives: "You'll need this at nationalization — want it now or at the end of the conversation?" A trade specialist always has the checklist ready before the client asks. Mister should too.

**4.3 — The index delta call-out**
When the LandedCostWaterfall renders for the first time, if the buyer's Incoterm or destination makes one particular layer the dominant variable, Mister names it immediately and specifically: "On these terms, freight is your largest driver — container optimization on this lane typically moves the index 6–9 points. Your destination port matters here." The buyer receives insight they could not have gotten from reading the waterfall header. Specificity is the surprise.

**4.4 — Silent archetype correction**
If a buyer who resolved as A1 (Lead / End Buyer) begins asking about MOQs and territory, Mister silently re-resolves to A4 (Reseller) and the tone and depth of the next response shift accordingly — no announcement, no "I see you're actually a reseller." The buyer experiences this as Mister becoming sharper. The session brief updates silently. The buyer's reaction: "This thing is actually reading what I'm saying." That is the reward.

---

## 5. Re-engagement: Session Continuity and Save-State

**On return (same session, browser re-open, or WhatsApp-to-web link):**

Mister opens with a professional brief acknowledgment — the opener a trade specialist uses when a client reconnects after a break, not a consumer app welcoming a churned user back.

Exact register:

> "Welcome back. When we last spoke we were working through [commodity] via [corridor] for [destination]. [Field X] and [Field Y] are still open in your brief. Shall we continue from there?"

The session brief renders immediately in its current state. The buyer sees what was captured, sees the gaps, and resumes. No re-introduction. No re-induction (unless the session is old enough that archetype confidence is low, in which case Mister re-confirms with one targeted question rather than running full induction again).

**WhatsApp continuity:**

When the buyer accepts a WhatsApp handoff, the session brief is passed to the ops team via the notification payload. The ops team can reference it. If the buyer returns to the web chat after a WhatsApp exchange, the chat UI shows a system message (styled differently from Mister's messages):

> "Your inquiry has been received by the Wings team. A specialist will follow up via WhatsApp."

This closes the loop and prevents the buyer from treating the web chat and WhatsApp as disconnected channels.

**Abandon detection — non-intrusive save offer:**

If the session has been idle for 3+ minutes and the conversation has progressed past induction (meaning real data was collected), Mister sends one final message — calm, factual, not needy:

> "I've saved your session brief. Return here to continue, or pick this up on WhatsApp — the brief travels with you."

No pop-up. No "Don't go!" modal. One message that makes the brief's persistence explicit, then silence.

**Session expiry protocol:**

Sessions are persistent for 30 days (or per the rate-limiting window design). After expiry, Mister opens clean but offers: "I have a previous brief from [date]. Want to start fresh or review what we had?" Two options, no judgment on either choice.

---

## 6. Conversation Milestone Moments

These are the phase transitions in the Mister conversation — moments that matter and that deserve to be marked. The register for each is not celebration; it is *tonal shift and depth increase.* The milestone is communicated through what Mister does next, not through what Mister says about the milestone.

**6.1 — Archetype resolved**

Mister does not announce it. No "Great, I've identified you as a Project Manager." The acknowledgment is entirely implicit: the very next response is noticeably more targeted. Questions become more specific. Technical vocabulary calibrates to the archetype. Product surfaces and documents offered shift to the archetype's lane.

The buyer's read: "Mister suddenly got smarter." That is the moment landing correctly.

**6.2 — First product surfaced**

A ProductCard or SpecSheet renders alongside Mister's message. Mister does not lead with "Here's a product you might like." It leads with the answer to what was asked, and the surface renders as evidence: "Based on the specs you've described, this model meets your requirements on [specific point]. Before I confirm the full fit — [follow-up question]."

The milestone is the information arriving, not the announcement that it arrived. The surface's presence IS the acknowledgment.

**6.3 — First LandedCostWaterfall shown**

This is the most significant visual moment in the conversation — the first time the indexed cost structure becomes visible. The framing line from Mister:

> "Here's how the cost layers structure for this order — illustrative only, not a quotation."

Then immediately: an insight that only someone reading the buyer's specific situation would offer. Not a generic waterfall explanation — a specific call-out about the buyer's dominant cost driver given their corridor, Incoterm, and container type. The waterfall renders; the conversation deepens. The buyer is not congratulated on reaching the cost structure phase. They are handed a sharper tool.

**6.4 — Quotation triggered**

The CTA activates. The buyer clicks it. Mister's final message before the form opens:

> "I've pre-filled what we've covered. The team will receive your details and brief — add anything else directly in the form if needed."

Two sentences. No "Congratulations." No enthusiasm. A clean, professional handoff. The pre-filled form is the reward — they built it during the conversation and it arrived ready to submit.

**6.5 — Human handoff (WhatsApp / specialist contact)**

A ContactCard renders. The specialist's name, role, and WhatsApp link appear. Mister's closing line:

> "[Name] handles [category] for [corridor]. Your session brief is attached to this handoff — they'll have the full picture before you speak."

This is not a goodbye. It's a warm introduction between two professionals, with the context fully transmitted. The buyer leaves the conversation knowing that Wings received everything, not wondering whether they'll have to repeat it.

---

## Design Calibration Notes for the Council

**What this engagement design is not:**
- Points, badges, levels, streaks, or any visible reward currency
- Progress percentages or step counters
- "Congratulations" moments or celebration copy
- Urgency manufacture ("Only 2 left in stock" — Mister cannot and must not do this)
- Retention-bait ("Come back tomorrow for more") — there is no "tomorrow" mechanic; the buyer is here to complete a trade inquiry

**What this engagement design is:**
- Professional recognition (the buyer feels understood by a peer)
- Structural trust (the session brief shows the conversation is being retained)
- Efficient forward motion (every turn moves the brief closer to completion)
- Unexpected value (surfaces and insights that arrive ahead of the question)
- Clean closure (the handoff is as professional as the conversation)

The underlying behavioral principle: B2B buyers do not stay because the experience is fun. They stay because the experience is *efficient and accurate and respects their expertise.* Every design decision here should pass the test: "Would a senior trade specialist find this useful, or find it condescending?"

---

*Contribution by: Game Designer / Engagement Designer*
*Date: 2026-06-27*
*Scope: Engagement behavioral layer for Mister — Wings Global Trade*
