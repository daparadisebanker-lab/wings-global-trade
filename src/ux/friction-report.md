# Friction Report — Wings Product Detail Page
## Conversion Funnel Audit

**Standard:** Would this outperform the top 1% of B2B trade platforms for Latin American importers?

---

## Stage 1: ARRIVE — Understand Product Identity

### What Works
- `PageHero` renders product name, category, and source market immediately — identity is unambiguous within the first viewport
- Breadcrumb below hero gives spatial orientation without requiring scrolling
- `ProductPassport` in the sticky right column provides at-a-glance trade credentials (HS code, source market, free zone eligibility)

### What Creates Friction
- **Hero is content-free above the fold on mobile.** `PageHero` renders a full-height navy section with eyebrow + title + subtitle. On a 390px viewport, the hero alone takes ~100vh. The product gallery — the primary trust artifact — is not visible until the user scrolls. A procurement manager landing from a Google search sees branding, not evidence.
- **`ProductDetail` (`ProductDetail.tsx:58`) opens at `py-12` on warm-white with no visual anchor.** The transition from navy hero to warm-white content is abrupt. There is no orienting moment.
- **Source market badges (`ProductDetail.tsx:64-68`) are below the gallery on the left column.** The buyer's first qualifying question — "Is this Chinese origin?" — is answered only after they scroll past the gallery. This is a B2B decision signal buried.

### What Breaks Momentum
- None at this stage — the page loads server-side rendered, no skeleton-to-content flash.

### Recommended Fixes
1. On mobile: reduce `PageHero` height, surface the primary product image as the first visible element below the nav.
2. Move source market badges to the `PageHero` subtitle line (already partially addressed with "Origen: X" in `heroSubtitle` — but it needs stronger visual treatment).
3. Inject a one-line trust stamp below the breadcrumb: "Disponible vía ZOFRATACNA · Importación con despacho en 45–60 días" — Fogg: perceived capability confirmation before evaluation begins.

---

## Stage 2: EVALUATE SPECS — Build Confidence

### What Works
- `ProductSpecTable` renders all specs clearly. Data density is appropriate for a procurement professional.
- `ProductHpMeter` provides a visual power-class indicator — differentiates the product in a category grid context.
- `ProductPassport` in the sticky right column keeps HS code, free zone, and trade context visible while the user scans specs. This is the right call architecturally.

### What Creates Friction
- **`ProductSpecTable` and `VariantTable` are both in the LEFT column (`ProductDetail.tsx:82-102`), which is not sticky.** The procurement manager reading specs must scroll up to recheck the variant they selected, or down to the form. There is no persistent association between "I'm looking at model X specs" and "I'm about to inquire about model X."
- **`ProductSpecTable` (`ProductDetail.tsx:102`) renders below the `VariantTable`.** The correct sequence for a spec-evaluating buyer is: variant selection → specs update → inquiry. Currently: description → HP meter → variant table → spec table → use cases → implements → then inquiry. This is 5 content blocks between variant selection and the inquiry form. Hick's Law: each intermediate block is a decision point that taxes the buyer's attention.
- **No "spec completeness" signal.** There is no indicator that the buyer has seen the full specification. On high-consideration B2B purchases, buyers need to feel they have done due diligence. The spec table ends and the page continues — no sense of closure or progression.
- **`UseCaseStrip` (`ProductDetail.tsx:104`) appears after specs.** This is correct information architecture. But on mobile, the buyer has already scrolled 3–4 full screens before reaching the form.

### What Breaks Momentum
- **`VariantTable` → `ProductSpecTable` gap on mobile.** The spec table refreshes via `effectiveSpecs` (`ProductDetail.tsx:50-53`) based on `modelIndex`, not `selectedVariant`. There is a mismatch: `VariantTable` (`ProductDetail.tsx:94-99`) sets `selectedVariant` (string), while `ProductModelSelector` (`ProductDetail.tsx:138-142`) and the `effectiveSpecs` useMemo use `modelIndex` (integer). These are two parallel variant selection systems with no synchronization. A buyer who selects a variant in `VariantTable` will not see specs update — the spec table still reflects the default `modelIndex`. This is a direct momentum break.

### Recommended Fixes
1. Synchronize `VariantTable` selection with `modelIndex` so spec updates respond to variant clicks.
2. After the spec table, add a micro-element: "Fichas completas para {n} modelos disponibles" with a secondary CTA to scroll to the inquiry form. Goal Gradient: the buyer is close to conversion — acknowledge their progress.
3. On mobile, consider an anchor CTA ("Solicitar cotización →") that appears as a sticky bottom bar after the user has scrolled past the spec table.

---

## Stage 3: SELECT VARIANT — Commit to Configuration

### What Works
- `VariantTable` visually highlights the selected row and allows single-click selection.
- The `selectedVariant` state propagates to `InquiryForm` — the selected model appears in the "Producto de interés" field and the variant badge.

### What Creates Friction
- **`ProductModelSelector` and `VariantTable` are two separate variant selection mechanisms** on the same page, in different columns (model selector in right column via `ProductDetail.tsx:138-142`, variant table in left column via `ProductDetail.tsx:82-99`). A buyer who uses one does not see the other update. No visual confirmation that the form has registered their selection.
- **The variant badge in `InquiryForm.tsx:161-166` is the only feedback that a variant was captured.** It is inside the form, below a read-only input. A buyer who selects a variant and does not scroll to the form receives no confirmation. No micro-copy, no toast, no animation.
- **`ProductModelSelector` models list (`product.models`) and `VariantTable` variants list (`product.variants`) may be the same data represented differently.** This duplication creates cognitive overhead: "Which one do I use? What's the difference between 'models' and 'variants'?"

### Recommended Fixes
1. When a variant is selected in `VariantTable`, trigger a brief animation on the inquiry form scroll anchor — pulse the form border in gold for 400ms. This closes the feedback loop across the two-column split.
2. Add micro-copy above the variant badge: "Tu selección fue registrada en la consulta abajo." One sentence, small, in DM Mono.
3. Audit whether `product.models` and `product.variants` can be unified — if not, document the distinction clearly in product data.

---

## Stage 4: OPEN FORM — Express Intent

### What Works
- `InquiryForm` is visible in the sticky right column on desktop without requiring a click to reveal. This eliminates a full conversion step — no drawer, no modal, no CTA-to-form friction.
- The form heading "Solicitar este modelo" is direct and action-framed.
- "Consulta sin compromiso. Sin cuenta requerida." — correct trust signal, positioned above the form.

### What Creates Friction
- **The trust signal (`InquiryForm.tsx:57-60`) is at the TOP of the form, before any fields.** Behaviorally, trust signals work best at the moment of maximum resistance — just before the commitment action (submit). Fogg's model: motivation must be highest when ability demand is highest. The buyer is most resistant at the submit button. The current placement dissipates the trust signal before it is needed.
- **No saved state.** If the buyer fills 4 fields, navigates away (to compare another product), and returns — the form is empty. On B2B procurement, comparison shopping is standard behavior. Losing form state destroys accumulated commitment and requires the buyer to restart, which dramatically reduces the likelihood they complete the second attempt.
- **No field completion feedback.** The buyer fills `full_name`, tabs to `company` — no visual acknowledgment that `full_name` is valid. The form is silent until error states appear on submit. Silent progress is slower progress.
- **Auto-focus is absent.** On desktop, when the form scrolls into view (or when the user first sees it in the sticky column), no field is focused. The buyer must click to begin. Each required click is a friction point — Fogg: reduce ability demand.

### Recommended Fixes
1. Move "Consulta sin compromiso" from form header to just above the submit button (implemented below).
2. Implement localStorage save with 800ms debounce (implemented below).
3. Add per-field validity pulse on successful blur (implemented below).
4. Auto-focus `full_name` on desktop (implemented below).

---

## Stage 5: SUBMIT — Become a Lead

### What Works
- `InquirySuccess` (`InquirySuccess.tsx`) provides clear confirmation with product name and 24-hour response commitment.
- WhatsApp escalation CTA in the success state is excellent — gives impatient buyers an immediate action.
- The `SLIDE_UP` animation on success state is contextually appropriate — a sense of completion.

### What Creates Friction
- **The submit button (`InquiryForm.tsx:181-183`) provides no pre-submit confidence signal.** A B2B buyer about to commit their contact information to an unknown trade platform needs reassurance in the final moment. The button just says "Enviar solicitud de consulta" with a loading spinner — there is no ceremony indicating "you have done everything right, this will work."
- **Form completeness is invisible.** The buyer cannot tell if all required fields are valid until they submit and see error states. The form rewards completion only through absence-of-errors, not through presence-of-progress. Goal Gradient effect: buyers accelerate toward a visible finish line. Make the finish line visible.
- **Error recovery (`InquiryForm.tsx:35-38`) uses a toast.** Toasts are ephemeral. A B2B buyer who misses the error toast and sees nothing has no recovery path except waiting and retrying. Consider a persistent inline error state.

### Recommended Fixes
1. Add gold border trace animation on submit button when all required fields are valid (implemented below).
2. Add stamp animation on successful submit — proprioceptive confirmation (implemented below).
3. Trust signal line above submit: "Respuesta en 24 horas · Sin compromiso de compra" in DM Mono (implemented below).

---

## Behavioral Framework Summary

**Fogg Behavior Model (B = MAP):**
- Motivation is present (professional procurement need) — the platform does not need to generate it
- Ability gaps: two-column layout on mobile collapses into single column, burying the form; no saved state; no form progress
- Prompt gaps: no progress indicator, no mid-scroll CTA, no variant-to-form feedback loop

**Hick's Law (decision time increases with choices):**
- Two variant selection mechanisms (ModelSelector + VariantTable) double the cognitive load at Stage 3
- 5 content blocks between variant selection and inquiry form on desktop increases decision paralysis risk

**Goal Gradient Effect (effort increases near the finish line):**
- No visible progress toward form completion
- No completion ceremony before submit
- No trust signal at maximum-resistance moment (submit button)

---

## Priority Matrix

| Fix | Effort | Impact | Priority |
|-----|--------|--------|----------|
| Trust signal above submit | XS | High | P0 |
| localStorage save on field change | S | High | P0 |
| Field validity pulse on blur | S | Medium | P1 |
| Auto-focus first field | XS | Medium | P1 |
| Submit button completion animation | M | High | P0 |
| Move trust signal to pre-submit position | XS | High | P0 |
| Sync VariantTable ↔ modelIndex | S | High | P1 |
| Mobile sticky inquiry CTA | M | High | P2 |
| Fogg mid-page anchor CTA | S | Medium | P2 |
