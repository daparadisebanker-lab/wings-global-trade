# Wings Global Trade — Component Design Decisions
# Audit output: Brand Universe AUDIT mode
# Date: 2026-06-19

This document records the design rationale for every audited component,
the gap between current state and award-level standard, and the
specific changes required. It is the companion to tokens.css.

---

## ProductPassport

### What it is
The "Ficha de inspector" — a product identity card styled as a customs
inspection document. Lives in the sticky right column on desktop.

### What is working
The conceptual frame is the strongest single brand idea in this codebase.
A customs inspection slip as the organizing metaphor for product information
is not what any competitor in the Latin American B2B trade category has
done. The dashed left edge (perforation), dot-matrix reference number,
"Ficha de inspector" / "Wings Global Trade" header split, and DM Mono
throughout — these collectively signal: this is a document, not a product
page. That is a significant brand idea.

The inline style approach (backgroundColor: '#F5F0E8', borderLeft: '2px
dashed rgba(0,30,80,0.3)') for the perforation is technically correct —
this is a case where the specificity of the artifact requires inline
precision beyond what Tailwind classes can cleanly express.

The AuthenticationMark (absolute bottom-right corner, pointer-events-none)
is the right gestural move — the stamp at the end of the document.

### What is broken
1. The social proof copy ("31 consultas este mes") is static and
   hardcoded per category. This reads as manufactured. The brand rule
   "specific over generic" applies equally to data — generic static
   counts destroy the credibility of the precision the system builds.
   Fix: either source from real Supabase aggregation, or remove entirely.
   A blank field is more credible than a false one.

2. The compare button at bottom renders a checkmark emoji "✓".
   Emojis in a technical document are a register break. Replace with
   a typographic mark: a plain "✓" via Unicode character &#x2713; or
   better, a small SVG checkmark at the same weight as the existing
   chevron in FieldReport.

3. The DataRow component uses font-mono text-[9px] and text-[11px].
   At these sizes, DM Mono needs letter-spacing: 0.06em minimum to
   maintain legibility. Currently it has tracking-[0.15em] on labels
   and nothing specified on values. Add tracking-[0.04em] to all
   mono values at this size range.

4. The backgroundImage pattern (horizontal rules) on the passport
   creates the visual impression of ledger paper. This is correct
   for the concept. However, the current 8px pitch is too tight and
   reads as a pattern rather than a document structure. Change pitch
   to 16px to read as discrete horizontal rules.

### Decision: keep the core metaphor, fix the execution details.

---

## TradeIntelligenceLine

### What it is
A single-line intelligence feed below the product name. Categorized
tags (TENDENCIA, DEMANDA, etc.) with an expandable analysis panel.

### What is working
The gold accent bar (left: 0, top: 1/2, h-[60%], w-[2px], bg-gold/70)
is a clean typographic device — the editorial left-rule. The tag/body/
period parsing creates a genuine data structure. The shimmer skeleton
is appropriately minimal.

The expand/collapse with "↓ ver análisis" / "↑ cerrar" arrow notation
in DM Mono at 9px is a nice micro-interaction — the document opening.

### What is broken
1. CRITICAL: The component uses extensive inline styles instead of
   Tailwind utility classes. This is a direct violation of the project's
   non-negotiable conventions. The component should be refactored to
   Tailwind classes that map to the token system.

2. The expand trigger "↓ ver análisis" uses a raw arrow glyph (↓).
   This is acceptable but the hover state (color: '#C4933F') is set
   via an onClick handler inline — it should be a CSS class transition.

3. When expanded, sentences are mapped with "· {s}" prefixed. The
   centered dot is a good typographic choice (interpunct, not bullet).
   Keep this. But the fontFamily is hardcoded as string 'DM Mono,
   monospace' not var(--font-mono) — use the CSS variable.

4. The fallback intelligence strings are generic. "Modelo con mayor
   rotación en operaciones de última milla, ZOFRATACNA 2023" is
   adequate but "2023" is now three years stale. If this is static
   content, date it accurately or remove the year.

### Decision: refactor inline styles to Tailwind, update copy freshness.

---

## BlueprintDataLayer

### What it is
A full-height slide-in panel (fixed, right edge) activated by the
BlueprintModeToggle. Dark navy background with gold drafting grid.
Contains the complete technical specification as a "Ficha Técnica"
with six sections, SpecFingerprint radar, and a print export.

### What is working
This is the most successful component in the system from a brand
standpoint. The concept — a "blueprint mode" where the page reveals
its full technical depth behind a layer — is genuinely novel in the
B2B product catalog category. The execution details are strong:
  - Drafting grid (major/minor grid at 32px/8px in gold tones)
  - Title-block border frame (1px gold at 14px inset)
  - Spring easing on entry (0.16, 1, 0.3, 1) — earned by the drama
  - Logo in panel header at 85% opacity
  - Section titles at 7px DM Mono with 0.2em tracking at gold/50
  - Certification checklist with filled/unfilled dot states
  - Print export button (window.print())

The animation is correctly weighted — fast compression spring for the
drawer, spring easing only used here, all other components use ease-out.

### What is broken
1. CRITICAL: The entire component is written in inline styles.
   Every style declaration is an inline style object. This must be
   refactored to Tailwind + CSS variables. It violates the project's
   stated non-negotiable architecture conventions.

2. The close button uses onMouseEnter/onMouseLeave to swap color.
   This is anti-pattern in React — it creates state that React doesn't
   track. Use CSS :hover via className instead.

3. The "✕ Salir del plano" close affordance is sticky at top of scroll.
   The ✕ character is correct but "Salir del plano" is a slightly
   awkward phrase — "plano" (blueprint/plane) works as a double meaning
   but may read as "floor plan" to some users. Alternative: "Cerrar ficha"
   is clearer while maintaining the document register.

4. The panel width `min(420px, 40vw)` collapses to 40vw on viewports
   below 1050px — making it 420px on screens below that. At tablet
   width this creates serious usability issues. The panel needs a
   defined minimum width of 320px and should transition to a full-
   screen drawer below 768px.

5. The SpecFingerprint inside `background: rgba(248,246,240,0.04)` is
   nearly invisible — 4% opacity of warm-white on navy is essentially
   nothing. Raise to rgba(248,246,240,0.08) for legibility.

### Decision: this is the brand's hero interaction — prioritize refactor.

---

## ImportReadinessMeter

### What it is
A 5-step progress bar tracking the buyer's journey (product viewed →
specs explored → variant selected → inquiry started → submitted).
5 horizontal segments + labels + contextual action prompt.

### What is working
The interaction model is correct — tracking progression through the
product detail as a journey metaphor creates appropriate tension and
forward momentum. The staggered segment delay (segmentIndex * 70ms)
is a subtle but effective micro-animation.

The concept of "the leading edge" (most recently filled segment) with
the import-meter-advance keyframe animation is elegant — the frontier
glows, settled territory goes quiet.

The decision segment (step 5) getting a gold box-shadow is the right
kind of hierarchy differentiation — the buyer at the threshold earns
visual emphasis.

### What is broken
1. The entire component is built in inline styles. Needs Tailwind.

2. The labels at 6px in DM Mono ("PRODUCTO", "EXPLORADO", etc.) are
   below accessible size. At 6px, DM Mono is illegible on any screen.
   Minimum readable size for this context is 9px. The label strip
   should either increase to 9px or be removed in favor of the action
   prompt alone (which is at an appropriate 9px).

3. The meter sits at maxWidth 200px. On the right column of a 2-column
   layout this reads as orphaned — a small, unanchored element in a
   wide container. Either fill the column width or visually integrate
   it as a document annotation at the right margin.

4. `role="progressbar"` with aria-valuenow/min/max is correct and
   should be kept. The animation keyframe name "import-meter-advance"
   is semantically clear — keep it.

### Decision: fix accessibility (label size), expand to column width.

---

## FieldReport

### What it is
A collapsible accordion component. Title "INFORME DE CAMPO" with
"REG · OPS" sub-label. Contains contextual regulatory and operational
intelligence per category.

### What is working
The 3px left gold border is the correct visual device for this type
of annotational content — it is the editorial "sidebar" convention
applied to operational intelligence. The AnimatePresence height:auto
animation is clean and appropriately fast (0.22s easeInOut).

The structured tag parsing ([ALTITUD], [REGULACIÓN] etc.) when a
dynamic report is available creates a genuine document-like information
architecture — the field report as form, not prose.

### What is broken
1. The static fallback body uses font: 'Flexo, sans-serif' hardcoded
   as a string in an inline style. Use font-family: var(--font-body).

2. The dynamic report renders content lines at font-size: 13px via
   inline style. This should be body-sm (0.875rem / 14px) via Tailwind
   class text-[13px] should be text-sm — and use Flexo, not the default.

3. The shimmer skeleton animation (keyframe name "shimmer") conflicts
   with any other shimmer animation in the codebase. Namespace it:
   "field-report-shimmer".

4. The expand chevron SVG uses strokeWidth="1.5" which is correct.
   But the transform: rotate(180deg) is controlled via inline style.
   This should be a Tailwind transition class: rotate-180.

5. When closed, the gold left border remains visible (always present
   on the container div). This is actually correct — it acts as a
   persistent visual indicator that this section contains additional
   content. Keep it.

### Decision: minor refactor, no conceptual changes needed.

---

## JumpNavigation

### What it is
A sticky document-index navigation bar that appears on scroll > 200px.
Shows "01 / 04" position counter and 4 section links. Active section
indicated by gold underline and gold text color.

### What is working
The document position counter ("01 / 04" with padStart formatting) is
the strongest single UX decision in this component. It frames the
product detail page explicitly as a multi-section document — aligning
with the brand metaphor of Wings as a "serious trade document" rather
than a product page. This is correct and should not change.

The 44px height is appropriate for a sticky navigation element —
compact enough to not obscure content, tall enough to be a deliberate
interaction target.

The opacity/translateY visibility toggle on scroll is handled via
inline style (no transition class conflict). The 200ms transition is
correctly weighted — snap to visible, don't float.

### What is broken
1. MINOR: The nav uses extensive inline styles. Partially acceptable
   here given the conditional visibility logic, but the static visual
   properties (font, tracking, color) should use Tailwind classes.

2. `aria-label="Índice del documento de producto"` is correct and
   should be kept exactly as written.

3. The section links use `aria-current={isActive ? 'true' : undefined}`.
   The value should be `"location"` for navigation links per ARIA spec:
   `aria-current="location"` when isActive, undefined otherwise.

4. On mobile (< 640px) the nav items with live counts ("Variantes (3)",
   "Specs (12)") can overflow the 44px container. The gap: 32px between
   items needs to reduce to 16px on mobile. Currently not responsive.

5. The position counter (01 / 04) should match the visible active
   section, not just the index. Currently `position` is based on
   activeIndex which is correct — but if no section is in view (e.g.
   top of page before any section), it shows "01 / 04" by default.
   This is a reasonable fallback. Keep it.

### Decision: fix aria-current value, add mobile gap responsiveness.

---

## Global Tokens (globals.css + tailwind.config.ts)

### What is working
1. The three-color system (Navy / Gold / Warm White) is correctly
   implemented and consistently applied through CSS variables and
   Tailwind tokens.

2. The Flexo self-hosted font gives Wings a proprietary typographic
   voice. The @font-face declarations with font-display: swap is correct.

3. The hero-mesh radial gradient system is elegant — two gradient
   sources at percentage coordinates creating light directionality.
   This is significantly above what most B2B platforms do with
   backgrounds. Keep and protect.

4. The hero-grain ::after pseudo-element (SVG feTurbulence, 4% opacity)
   is a paper-texture reference that connects digital to print artifact.
   The 4% opacity is correctly calibrated — present as materiality,
   invisible as noise.

5. The ::selection styling (gold bg, warm-white text) is an under-
   rated brand touchpoint. This is Hermès-level thinking applied to
   a B2B interface. Keep exactly as written.

6. The --easing-spring token is correctly reserved for the Blueprint
   panel only. No other component uses it. This is the right discipline.

### What is broken
1. CRITICAL: tailwind.config.ts has a duplicate `surface-card` key:
   - 'surface-card': '#FFFFFF'   (line ~34)
   - 'surface-card': '#FAF9F6'   (line ~44)
   The second value (#FAF9F6) wins. But the first definition creates
   confusion and will cause bugs in any editor with type-checking.
   Remove the first definition.

2. globals.css sets body { background-color: #000C1F } — the darkest
   navy value. But the product detail page uses bg-warm-white. These
   conflict: on navigation, the page flashes dark before the component
   background color renders. The body default should be #F8F6F0 (warm-
   white) for the catalog pages, or the product page wrapper needs an
   explicit background set before first paint.

3. The --color-text-muted value conflicts between files:
   - globals.css defines it as rgba(0,30,80,0.45) — CORRECT
   - spec/design-system.md defines it as #6B7280 — WRONG
   - tailwind.config.ts defines 'text-muted' as rgba(0,30,80,0.45) — CORRECT
   Purge the #6B7280 value from the spec and anywhere it may be
   applied. It breaks the warm-palette coherence.

4. The Flexo font files are referenced as .ttf in globals.css but
   the spec lists them as .woff2 in /public/fonts/. WOFF2 should be
   the primary format with .ttf as fallback. WOFF2 files are
   30-40% smaller and are supported by all modern browsers:
   src: url('/fonts/flexo-regular.woff2') format('woff2'),
        url('/fonts/flexo-regular.ttf') format('truetype');

5. The font-feature-settings in html { 'kern' 1, 'liga' 1, 'calt' 1 }
   is correct for Cormorant Garamond (contextual alternates are key
   to the font's character) but should also include 'onum' 1
   (oldstyle numerals) for display contexts — CG's oldstyle figures
   are one of its distinguishing qualities and will make product names
   with model numbers significantly more refined.

---

## Inline Styles — System-Level Issue

CRITICAL finding: BlueprintDataLayer, ImportReadinessMeter,
TradeIntelligenceLine, FieldReport (partially), and JumpNavigation
(partially) are built predominantly with inline style objects rather
than Tailwind utility classes.

This violates the project's declared non-negotiable convention
("Tailwind CSS utility classes only. No inline styles.") and — more
importantly for the brand audit — it means these components cannot
be systematically modified through the token system. If --color-gold
changes, the hardcoded '#C4933F' strings throughout these components
do not update.

The only acceptable inline styles are:
1. Dynamic values that cannot be expressed as static classes
   (e.g. transform: `rotate(${angle}deg)`, animation delays computed
   from data, canvas/SVG element positioning)
2. The ProductPassport perforation effect (background-image with
   gradient positioning — not expressible in standard Tailwind)

Every other inline style is a refactoring target.

Priority order for refactoring:
1. BlueprintDataLayer (highest brand value, most inline styles)
2. ImportReadinessMeter (6px labels are an accessibility issue)
3. TradeIntelligenceLine (user-facing, visible on load)
4. FieldReport (minor, mostly clean already)
5. JumpNavigation (partial — conditional styles are acceptable)
