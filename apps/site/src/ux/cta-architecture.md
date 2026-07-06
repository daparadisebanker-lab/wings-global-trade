# CTA Architecture — Wings Product Detail Page

---

## CTA Inventory

### PRIMARY: "Enviar solicitud de consulta"
**Component:** `InquiryForm.tsx:181`
**Type:** Form submit button (lg, full-width)
**Destination:** POST `/api/leads/catalog` → success state renders `InquirySuccess`
**Buyer Expectation:** "I will submit my contact information and requirements; Wings will respond within 24 hours"
**Conversion Impact:** This is the terminal conversion action. Every other CTA on the page exists to either increase confidence before this point or recover failed conversions after.

**Current Placement Grade: B**
- Correct position: sticky right column, always visible on desktop
- Problem: No pre-commit ceremony. The button is visually identical whether the form is empty or fully valid. No behavioral distinction between "not ready to submit" and "ready to submit."
- Problem: Trust signal is at top of form, not at button proximity
- Problem: No field-level progress feedback leading toward this button

**Recommended Improvement:**
- Gold border trace animation when all required fields valid (implemented)
- Trust line "Respuesta en 24 horas · Sin compromiso de compra" directly above (implemented)
- Stamp animation on success (implemented)
- Grade after fix: A

---

### SECONDARY: "Hablar con Mister" (bottom section CTA)
**Component:** `page.tsx:149`
**Type:** `<Button size="lg">` inside navy section
**Destination:** `/mister` (Accio Engine)
**Buyer Expectation:** "This takes me to an AI assistant that will help me with a custom import inquiry"
**Conversion Impact:** This is a conversion recovery CTA for buyers who are interested but not ready to commit via the catalog form — typically: volume buyers, buyers with non-standard specs, buyers who want interactive guidance.

**Current Placement Grade: A-**
- Position is correct: after the product detail, before the footer — catches buyers who completed the page without submitting
- Copy is clear: "¿Necesitas importarlo desde China a volumen?" qualifies the segment
- The supporting paragraph explains the value proposition adequately
- Minor issue: "Hablar con Mister" implies a chat session that requires effort investment. For buyers who just abandoned the inquiry form, re-commitment threshold may be too high.

**Recommended Improvement:**
- Add a secondary line: "o usa el formulario de arriba para una consulta rápida" with an anchor link back to `#inquiry-form` — gives buyers the choice at the recovery point without making them scroll
- Grade after fix: A

---

### TERTIARY: Implementos Compatibles links (3 links, agricultural category only)
**Component:** `ProductDetail.tsx:107-132`
**Type:** Navigation links styled as bordered tiles
**Destination:** `/catalogo/maquinaria-agricola?sub=[subcategory]`
**Buyer Expectation:** "This takes me to compatible implements for this tractor"
**Conversion Impact:** These are cross-sell navigation CTAs. They are positive for session depth but present a momentum risk: a buyer who clicks one of these before submitting the inquiry form leaves the conversion funnel.

**Current Placement Grade: C**
- Position: below the spec table in the left column — appears BEFORE the buyer reaches the inquiry form on mobile (single-column layout)
- These links can divert a buyer who was building toward conversion
- No session continuity — no "come back to this inquiry" mechanism if buyer explores implements

**Recommended Improvement:**
- Move implements section below the right-column form on mobile (CSS order manipulation)
- Or: render these links only after the form — use a CSS `order` class to push them below the sticky form container on mobile
- Add saved inquiry state (implemented) so buyers who do explore can return without loss
- Grade after fix: B+

---

### AMBIENT: WhatsApp Button (InquirySuccess state)
**Component:** `InquirySuccess.tsx:34-38`
**Type:** `WhatsAppButton` component
**Destination:** WhatsApp deep link with pre-filled message
**Buyer Expectation:** "I can follow up on my submission immediately via WhatsApp"
**Conversion Impact:** This is a post-conversion accelerator — not a primary CTA. It appears only after a successful form submission. Correct placement.

**Current Placement Grade: A**
- Only surfaces after conversion — no distraction risk
- Pre-filled message reduces effort
- "Si tu requerimiento es urgente, escríbenos directamente." — good framing, positions WhatsApp as the high-urgency channel

**Recommended Improvement:** None required.

---

### AMBIENT: Breadcrumb navigation links
**Component:** `page.tsx:96-106` — `Breadcrumb` component
**Type:** `<Link>` elements (Inicio / Catálogo / [Category] / [Product])
**Destination:** Parent pages in hierarchy
**Buyer Expectation:** Standard navigation affordance
**Conversion Impact:** Minimal — breadcrumbs are expected, do not trigger active engagement

**Current Placement Grade: A**
- Placed below hero in warm-white bar — correct and unobtrusive
- Does not compete visually with product content or CTAs

**Recommended Improvement:** None required.

---

### AMBIENT: "También en esta categoría" product cards
**Component:** `page.tsx:111-133`
**Type:** `ProductCard` links
**Destination:** Sibling product pages
**Buyer Expectation:** "These are similar products I can evaluate"
**Conversion Impact:** Dual nature — positive for session quality (buyer finds the right product), negative if it pulls a buyer away mid-inquiry. B2B procurement involves comparison; this section is expected.

**Current Placement Grade: B+**
- Placed AFTER the Mister CTA section — buyer has passed the primary and recovery conversion points before reaching here
- No friction risk at this position
- Minor issue: "También en esta categoría" label is typeset small (10px mono, `text-text-muted`). Buyers skimming the page may miss this section entirely.

**Recommended Improvement:**
- Increase label visibility slightly — it is currently at minimum viable visibility
- Grade after fix: A-

---

## CTA Sequence Assessment

The overall CTA sequence from top to bottom:

1. **PageHero** — no CTA (correct: orientation phase)
2. **Breadcrumb** — navigation only (correct)
3. **ProductDetail left column** — spec evaluation, no CTA (correct)
4. **ProductDetail right column** — `InquiryForm` (primary conversion) — always visible on desktop
5. **ProductDetail right column** — `ProductPassport` above form — trust signal (correct)
6. **Implementos links** — cross-sell navigation (risk zone on mobile)
7. **Mister CTA section** — recovery CTA (correct position)
8. **Related products** — comparison navigation (correct position, post-recovery)

**Critical gap:** On mobile (single-column), the full left column renders before the right column. The `InquiryForm` is not visible until the buyer has scrolled through: gallery → description → HP meter → variant table → spec table → use cases → implements → THEN reaches the form. This is 6+ scroll-screens of content before the primary conversion CTA. A sticky bottom inquiry CTA for mobile is the highest-impact unimplemented intervention.

**CTA hierarchy is architecturally sound on desktop.** The two-column sticky layout is the correct solution for a product detail page with this information density. The primary failure mode is mobile.

---

## Conversion Impact Ranking (by estimated lead generation delta)

| CTA / Fix | Est. Impact |
|---|---|
| Mobile sticky inquiry CTA | +15–25% mobile conversion rate |
| localStorage form save | +8–12% return-session completion rate |
| Trust signal at submit + completion animation | +5–8% submit-click-to-lead rate |
| Field validity pulse (Goal Gradient) | +3–5% form completion rate |
| Mister recovery CTA with form anchor | +2–4% session recovery rate |
| Implements link position fix on mobile | +1–3% (friction reduction) |
