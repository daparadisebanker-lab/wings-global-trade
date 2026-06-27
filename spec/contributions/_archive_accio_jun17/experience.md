# Experience Contribution — Wings Global Trade

## North Star Conversion Metric

Inquiry conversion rate = qualified submissions / unique visitors.
Every UX decision optimizes for this. A visitor who reads specs but doesn't submit is not a conversion.
Target: < 4 minutes from landing to qualified submission.

---

## Complete User Journey — Both Flows

### Flow 1: Catalog Buyer

```
1. LANDING
   → Arrives on homepage (direct, Google search, referral)
   → Sees: Hero (trust signal), Category Grid (route selector), Trust Bar (credentials)
   → Decision point: recognizes their category

2. CATEGORY SELECTION
   → Clicks category tile (Maquinaria Agrícola, Camiones, etc.)
   → Lands on /catalogo/[category]
   → Sees: PageHero with category name, product grid, category nav

3. PRODUCT DISCOVERY
   → Scans product cards (image, name, source market, key spec)
   → Clicks product of interest
   → Lands on /catalogo/[category]/[slug]

4. PRODUCT EVALUATION
   → Reads: full specs table, source market, model variants, gallery
   → Trust check: sees origin badge, spec precision, category context
   → Decides to inquire

5. INQUIRY SUBMISSION (CONVERSION MOMENT)
   → Clicks "Solicitar este modelo"
   → Form slides into view below product (or modal on mobile)
   → Fills: name, company, email, phone, destination country, quantity, notes
   → Submits → Success state + WhatsApp CTA

6. POST-SUBMISSION
   → Confirmation message: "Solicitud enviada. En menos de 24 horas."
   → Optional: "¿Necesitas más unidades o categorías distintas? Inicia una consulta con el Motor Accio."
```

### Flow 2: Free Zone Reseller (Accio Engine)

```
1. LANDING
   → Arrives at homepage OR directly to /accio
   → If homepage: sees "Importación Personalizada" Accio tile → clicks

2. ACCIO ENGINE ENTRY
   → Lands on /accio
   → Sees: split screen (chat left, TPR Sheet right on desktop)
   → First AI message is immediate (hardcoded, no API latency)
   → Message explains the process, asks for product category

3. TPR COLLECTION (7–10 turns)
   → Each AI turn: one focused question
   → TPR Sheet fills in real-time as fields are captured
   → Gold indicator lights up for each captured field
   → Progress visible without explicit progress bar (field count sufficient)

4. MINIMUM COMPLETENESS REACHED
   → "Ver mi estimado CIF" button appears (animated in)
   → CIF Estimate Card renders below/alongside conversation

5. CIF REVIEW
   → User reads: FOB, freight, insurance, CIF total, duty rate, free zone selected
   → Trust check: breakdown is specific, free zone is named
   → Decision: ready to proceed

6. CONTACT SUBMISSION (CONVERSION MOMENT)
   → AccioSubmitForm appears below CIF card
   → Collects: name, company, email, phone
   → Submits → Success state

7. POST-SUBMISSION
   → Confirmation: "Consulta técnica enviada. Análisis completo en menos de 24 horas."
   → Wings ops receive WhatsApp + email with full TPR
```

---

## Page-by-Page Information Sequence

### Homepage — Information Sequence

| Order | Element | Purpose |
|---|---|---|
| 1 | Tagline overline | Orient: this is a trade platform |
| 2 | Hero headline | State: what Wings does in 10 words |
| 3 | Hero subheadline | Detail: categories + free zone mention |
| 4 | Hero CTA | Route: primary action (explore catalog) |
| 5 | Category Grid | Route: choose your flow |
| 6 | Accio tile (special) | Route: free zone flow (separate visual treatment) |
| 7 | TrustBar | Credentialize: markets, free zones, years |
| 8 | MarketMap | Visualize: geographic reach |
| 9 | Footer | Support: WhatsApp, email, legal |

**The homepage must never require scrolling to find the entry point.** Category grid should be visible above the fold on desktop.

### Product Detail — Information Sequence

| Order | Element | Purpose |
|---|---|---|
| 1 | Product name (display-lg) | Identity |
| 2 | Source market badge | Credentialize immediately |
| 3 | Product gallery (4:3 images) | Evaluate visually |
| 4 | Key specs summary (3-4 lines, DM Mono) | Quick read |
| 5 | Inquiry form / CTA | Conversion anchor |
| 6 | Full specs table | Deep evaluation |
| 7 | Model variants selector | Complete the picture |
| 8 | "Solicitar via Motor Accio" CTA | Alternative path |

---

## CTA Architecture — Complete Map

| Page | Primary CTA | Secondary CTA | Tertiary |
|---|---|---|---|
| Homepage | "Explorar catálogo" | "Iniciar consulta técnica" (Accio) | WhatsApp (nav) |
| Category | "Ver especificaciones" (per card) | "Importación personalizada →" | — |
| Product detail | "Solicitar este modelo" | "Calcular importación vía Accio" | WhatsApp |
| Accio | Send button (chat) | "Ver mi estimado CIF" | — |
| Accio post-estimate | "Enviar consulta técnica" | Download TPR (v2) | WhatsApp |
| Nosotros | "Ver catálogo" | "Consultar por WhatsApp" | — |
| Contacto | "Enviar mensaje" | WhatsApp | — |

---

## Trust Architecture

Trust is earned in sequence. Don't front-load all credentials — place them at each decision point.

| Decision Point | Trust Signal | Placement |
|---|---|---|
| Initial landing | "ZOFRATACNA · ZOFRI" in hero subheadline | Hero section |
| Category evaluation | Source market badges on every product card | Product cards |
| Before inquiry | "Consulta sin compromiso. Sin cuenta requerida." | Above form submit |
| After inquiry | Specific confirmation with 24h SLA | Success state |
| Accio entry | Named free zones + immediate AI response (no wait) | Accio hero + first message |
| CIF review | Breakdown specificity (not a rounded estimate) | CIF card labels |

**Never put trust claims where decisions aren't being made.** A trust section in the footer doesn't convert. Trust at the inquiry form does.

---

## Friction Audit — Every Abandonment Point

| Abandonment Risk | Cause | Solution |
|---|---|---|
| Homepage — unclear routing | User doesn't know if catalog or Accio is right for them | Accio tile copy: "¿Importación a volumen o personalizada?" vs category tiles for standard catalog |
| Product detail — no specs | Product has insufficient specification data | Spec table must be complete. Empty rows display "A confirmar con el equipo" not blank |
| Inquiry form — too many fields | Long form = low completion | 6 fields max in initial form. Notes field is optional. |
| Accio — too many turns before CIF | 10 turns feels long | Show TPR progress visually. Name fields appear as captured. Minimum completeness at 6 fields, not 10. |
| Accio — API latency | Waiting for Claude response = abandon | Typing indicator within 200ms. Streaming response. First message hardcoded. |
| Post-form — uncertainty | "Did it actually send?" | Immediate success state. No page reload — inline confirmation. |
| Mobile Accio | TPR sheet hidden | Bottom drawer pattern. "Ver mi requisito técnico" button fixed at bottom. |

---

## The Single Most Important Conversion Moment

**The Accio "Ver mi estimado CIF" button appearing after minimum TPR completeness.**

This is the moment where an abstract conversation becomes a concrete number. The button must:
1. Animate in (not just appear) — opacity + translateY, 0.4s
2. Be gold background, full-width on mobile
3. Text: "Ver mi estimado CIF" — not "Calculate" or "Estimate"
4. Trigger a loading state (skeleton) then the CIF card sliding into view
5. The CIF card must feel like a document, not a widget

The experience from button click to CIF card visible should take 1.5–3 seconds. Fast enough to feel instant; slow enough to feel like real calculation.

---

## Mobile Interaction Patterns

### Accio on Mobile (< 1024px)
- Full-screen chat, no split layout
- TPR Sheet: bottom drawer (slides up from bottom edge)
- Trigger: floating button "Ver mi RTP" with field count badge
- CIF estimate: inline below the conversation after minimum completeness
- Input: fixed at bottom, above keyboard

### Category Grid on Mobile
- 2-column grid, 1-column for Accio tile (full width)
- Category tiles: image + name only (no description) at mobile sizes
- Tap → navigate immediately (no hover state needed)

### Product Gallery on Mobile
- Horizontal scroll, snap-to-card
- Aspect-ratio: 4/3 maintained
- Swipe gesture with dot indicators
