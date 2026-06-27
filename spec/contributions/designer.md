# Mister — Designer Contribution
**Role:** Designer
**Standard:** Awwwards Site of the Year
**Date:** June 2026
**Status:** Load-bearing decisions only. No decoration. No hedging.

---

## FONT DISCREPANCY — FLAGGED BEFORE ANYTHING ELSE

Three layers of type specification exist in this repo and they contradict each other. The builder must resolve this before implementing a single component.

**Layer 1 — Global CLAUDE.md (user-level config):**
Cormorant Garamond (display), DM Sans (body), DM Mono (data). This is the personal default for Paradise Education Group / DA LAB projects. It has **zero application to Wings Global Trade.**

**Layer 2 — WINGS_BRAND_SYSTEM.md + brand-strategist.md (spec documents):**
IBM Plex Serif (display), Flexo (body), DM Mono (data/mono). The brand-strategist contribution, written June 2026, references this stack. It is coherent and designed.

**Layer 3 — Live globals.css + project CLAUDE.md (what actually runs):**
NissanOpti (display), Flexo (body), Teko (condensed labels/mono). The font-face declarations are in globals.css. The `--font-display` variable resolves to NissanOpti. The `--font-mono` variable resolves to Teko. IBM Plex Serif and DM Mono are **not loaded** in the live codebase.

**My resolution:** This document is designed against **Layer 3 — the live implementation.** NissanOpti carries the display role. Teko carries the data/mono role. All `--mister-*` token references in the CSS block below use these variables.

**Conductor action required:** Decide whether to (a) align WINGS_BRAND_SYSTEM.md to the live code (NissanOpti + Teko), or (b) implement IBM Plex Serif + DM Mono via next/font to match the spec. Either is defensible. The brand-strategist's IBM Plex Serif choice has stronger authority-document pedigree than NissanOpti. But NissanOpti is already loaded, licensed, and in production. This is a brand decision, not a design decision, and must be made before the builder touches MisterHeader.

**Dead variable:** `--font-playfair` must never be used. It is a ghost from an earlier pass. The memory file confirms this.

---

## 1. Visual Thesis — Mister-Specific Execution

> **"A certified trade document that happens to respond in real time."**

The brand-strategist's thesis — "every pixel Mister owns should be indistinguishable from a certified trade document in the hands of a very senior specialist" — is correct and load-bearing. The designer's job is to make it formally specific for a conversational interface.

What a certified trade document actually looks like as a digital interface:
- A numbered transcript. Every formal document has paragraph numbers, line items, article references. So does Mister. Each assistant response carries a turn index in the left margin — "01", "02", "03" — in the same typographic register as HS codes and reference numbers.
- Warm paper for the incoming document, dark authority surface for the institutional response. A customs form is warm paper. The customs officer's stamp is on the dark institutional surface. Mister is the institution. The buyer is filling in the form.
- Typography that signals measurement. Every number in Teko (the mono face) signals: this is a precise reading from an instrument, not an approximation.
- No interface chrome beyond what a document has: a header band with the issuing authority, a footer band for the signature area (the composer), and the body for the record.

**What this kills in the Mister interface:**
- Rounded bubble messages: dead
- Avatar representing the AI: dead
- Ellipsis typing indicator: dead (stream or silence — no theater)
- Soft pastel quick-action chips: dead
- Any element that communicates "friendly chatbot": dead
- Gradient or glow anywhere in the window: dead

---

## 2. Color Token System

Every token below is a CSS custom property on the `:root` of `.mister` (or the global `:root` for tokens that extend Wings). Semantic name, hex or rgba, usage rule, and property name.

### Foundation (Wing tokens Mister directly inherits — do not redefine)

| Semantic Name | Value | Usage |
|---|---|---|
| Navy (authority surface) | `#001E50` | MisterHeader bg, window frame reference |
| Navy-dark (deep document) | `#001040` | LandedCostWaterfall bg, MisterLauncher bg |
| Navy-900 (window ground) | `#000C1F` | MisterWindow bg, MisterComposer bg |
| Gold (precision annotation) | `#C4933F` | Waterfall base anchor, captured data indicator, CTA bg |
| Warm White (paper) | `#F8F6F0` | Primary text on dark surfaces, user message bg reference |
| Chat-user (warm paper) | `#F0EDE6` | User message block background |

### Mister Extension Tokens — add these to `:root`

**Window Structure**

| Property | Value | Usage Rule |
|---|---|---|
| `--mister-bg-window` | `#000C1F` | MisterWindow interior. Never pure black. Navy-900. |
| `--mister-bg-header` | `#001E50` | MisterHeader band. Distinguished from window by 1px gold rule. |
| `--mister-bg-composer` | `#000C1F` | Composer section. Flush with window bg — the top rule alone separates it. |
| `--mister-bg-inset` | `#040F22` | ProductCard, ComparisonView, SpecSheet, MoqTable inset surfaces. Fractional lift from window bg. |
| `--mister-bg-message-user` | `#F0EDE6` | User message rectangular block. The warm paper side. |
| `--mister-bg-hover-subtle` | `rgba(248, 246, 240, 0.03)` | Hover state on dark surfaces. Near-invisible. |

**Text — Dark Surfaces**

| Property | Value | Usage Rule |
|---|---|---|
| `--mister-text-primary` | `#F8F6F0` | All assistant message body text. Never pure white. |
| `--mister-text-secondary` | `rgba(248, 246, 240, 0.60)` | Driver notes in waterfall, card sub-labels, secondary body. |
| `--mister-text-muted` | `rgba(248, 246, 240, 0.35)` | Timestamps. Composer placeholder. Waterfall per-segment disclaimer. |
| `--mister-text-ghost` | `rgba(248, 246, 240, 0.15)` | Turn numbers in left margin. Watermark annotation. |

**Text — Warm Paper Surface (user messages)**

| Property | Value | Usage Rule |
|---|---|---|
| `--mister-text-user` | `#001E50` | User message body. Navy on warm paper. Full contrast. |
| `--mister-text-user-muted` | `rgba(0, 30, 80, 0.35)` | Timestamp on user message block. |

**Gold — Semantic Mister Applications**

| Property | Value | Usage Rule |
|---|---|---|
| `--mister-gold` | `#C4933F` | Resolved archetype indicator. Waterfall base-100 anchor value. Captured-data dot. |
| `--mister-gold-annotation` | `rgba(196, 147, 63, 0.75)` | Trade-term first-use underline within message text. |
| `--mister-gold-rule` | `rgba(196, 147, 63, 0.15)` | 1px horizontal rules. MisterHeader bottom. Waterfall segment separators. Composer top. |
| `--mister-gold-rule-strong` | `rgba(196, 147, 63, 0.30)` | Active-state rules. Focus state. Waterfall total separator. |
| `--mister-gold-fill` | `rgba(196, 147, 63, 0.06)` | Quick-action hover bg. Inset surface hover. |
| `--mister-gold-fill-active` | `rgba(196, 147, 63, 0.10)` | Quick-action pressed state. |
| `--mister-gold-duties` | `rgba(196, 147, 63, 0.08)` | Duties segment in waterfall strip. Visually flags the SUNAT-variable layer. |

**Borders**

| Property | Value | Usage Rule |
|---|---|---|
| `--mister-border-window` | `rgba(196, 147, 63, 0.15)` | MisterWindow outer frame. All four sides. |
| `--mister-border-surface` | `rgba(248, 246, 240, 0.10)` | Surface card outer borders on dark bg. |
| `--mister-border-row` | `rgba(248, 246, 240, 0.06)` | Row separators in SpecSheet, MoqTable, waterfall rows. |
| `--mister-border-input` | `rgba(248, 246, 240, 0.12)` | Composer input border at rest. |
| `--mister-border-focus` | `rgba(196, 147, 63, 0.50)` | Composer input on focus. Gold. |

**Message Rules (left-side document accents)**

| Property | Value | Usage Rule |
|---|---|---|
| `--mister-rule-assistant` | `rgba(196, 147, 63, 0.18)` | 2px left border on every assistant message. The institutional stamp. |
| `--mister-rule-assistant-hover` | `rgba(196, 147, 63, 0.40)` | Same rule on message hover. |

**Quick Actions**

| Property | Value | Usage Rule |
|---|---|---|
| `--mister-qa-border` | `rgba(196, 147, 63, 0.22)` | Quick-action button border at rest. |
| `--mister-qa-border-hover` | `rgba(196, 147, 63, 0.55)` | On hover. |
| `--mister-qa-bg-hover` | `rgba(196, 147, 63, 0.06)` | On hover bg fill. |

**LandedCostWaterfall Specific**

| Property | Value | Usage Rule |
|---|---|---|
| `--mister-wf-bg` | `#001040` | Navy-dark. Waterfall card bg. Most authoritative surface in the UI. |
| `--mister-wf-strip-product` | `rgba(248, 246, 240, 0.08)` | Product cost segment in the horizontal strip. |
| `--mister-wf-strip-freight` | `rgba(248, 246, 240, 0.06)` | Freight segment. |
| `--mister-wf-strip-insurance` | `rgba(248, 246, 240, 0.04)` | Insurance. |
| `--mister-wf-strip-duties` | `rgba(196, 147, 63, 0.08)` | Duties. Gold-tinted. SUNAT = gold. |
| `--mister-wf-strip-lastmile` | `rgba(248, 246, 240, 0.04)` | Last-mile. |
| `--mister-wf-separator` | `rgba(196, 147, 63, 0.12)` | 1px vertical lines between strip segments. |
| `--mister-wf-base` | `#C4933F` | The base-100 anchor value. Only value in gold. |
| `--mister-wf-value` | `#F8F6F0` | All non-base index values. |
| `--mister-wf-total-separator` | `rgba(196, 147, 63, 0.30)` | 1px rule above the total band. Stronger than segment separators. |

**Launcher**

| Property | Value | Usage Rule |
|---|---|---|
| `--mister-launcher-bg` | `#001040` | Tab background. |
| `--mister-launcher-border` | `rgba(196, 147, 63, 0.22)` | All-side border at rest. |
| `--mister-launcher-border-hover` | `rgba(196, 147, 63, 0.55)` | On hover. |

**Elevation**

| Property | Value | Usage Rule |
|---|---|---|
| `--mister-shadow-window` | `0 8px 48px rgba(0,0,0,0.40), 0 0 0 1px rgba(196,147,63,0.12)` | MisterWindow floating mode. The outer glow doubles as the border. |
| `--mister-shadow-surface` | `0 2px 12px rgba(0,0,0,0.24)` | Surface cards inside the window. |

---

## 3. Typography System

All sizes are for the Mister window context. Awwwards-level precision: every scale level has its exact property.

### NissanOpti — `var(--font-display)` — Authority Headers

NissanOpti is used in Mister only for product-name headers within rendered surfaces. It is NOT used for the window title, NOT for headlines, NOT for CTAs. This maintains the document metaphor: the product name is the formal name on a filing, not a page headline.

| Context | Size | Weight | Line Height | Tracking | Color |
|---|---|---|---|---|---|
| ProductCard product name | 18px | 400 | 1.20 | -0.01em | `--mister-text-primary` |
| SpecSheet title | 20px | 400 | 1.10 | -0.01em | `--mister-text-primary` |
| ComparisonView column header | 15px | 400 | 1.20 | 0 | `--mister-text-primary` |

NissanOpti has only weight 400. Do not attempt any other weight.

### Flexo — `var(--font-body)` — Conversational Voice

Flexo carries all human-facing text in the window: the conversation, the CTAs, the contact details. It is the "voice" of the interface, warmer than Teko's instrument-register.

| Context | Size | Weight | Line Height | Tracking | Color |
|---|---|---|---|---|---|
| Assistant message body | 14px | 400 | 1.65 | 0 | `--mister-text-primary` |
| User message body | 14px | 400 | 1.50 | 0 | `--mister-text-user` |
| Quick-action label | 12px | 500 | 1 | 0.01em | `--mister-text-primary` |
| Composer input | 14px | 400 | 1.40 | 0 | `--mister-text-primary` |
| Composer placeholder | 14px | 300 | 1.40 | 0 | `--mister-text-muted` |
| ContactCard name | 14px | 600 | 1.20 | 0 | `--mister-text-primary` |
| ContactCard role | 12px | 400 | 1.30 | 0 | `--mister-text-secondary` |
| DocumentLink title | 13px | 400 | 1.40 | 0 | `--mister-text-primary` |
| CTA button label | 13px | 600 | 1 | 0.01em | `#001E50` (navy text on gold bg) |
| Header sub-endorsement "by Wings Global Trade" | 10px | 300 | 1 | 0.02em | `--mister-text-muted` |
| Waterfall tooltip / driver note | 11px | 300 | 1.50 | 0 | `--mister-text-secondary` |
| Trade-term first-use (inline) | 14px | 400 | 1.65 | 0 | `--mister-text-primary` + `border-bottom: 1px solid var(--mister-gold-annotation)` |

### Teko — `var(--font-mono)` — Instrument Data

Teko carries all numeric values, identifiers, codes, and institutional labels. Every number in Teko says: "this is a reading from an instrument." Always tabular-nums. The condensed form creates vertical space efficiency — more data, less visual noise.

| Context | Size | Weight | Line Height | Tracking | Case | Color |
|---|---|---|---|---|---|---|
| Window title "MISTER" | 13px | 500 | 1 | 0.12em | UPPER | `--mister-text-primary` |
| Session ref "WGT-XXXX" | 11px | 400 | 1 | 0.08em | UPPER | `--mister-text-ghost` → gold once archetype resolved |
| Turn index in margin "01" | 11px | 300 | 1 | 0.06em | — | `--mister-text-ghost` |
| Timestamp | 9px | 300 | 1 | 0.04em | — | `--mister-text-ghost` |
| Section eyebrow / label | 10px | 500 | 1 | 0.12em | UPPER | `--mister-text-muted` |
| Archetype indicator label | 10px | 500 | 1 | 0.10em | UPPER | `--mister-text-muted` |
| Waterfall base value "BASE 100" | 16px | 500 | 1 | 0.02em | UPPER | `--mister-wf-base` (gold) |
| Waterfall segment index range "+8 – 15" | 16px | 500 | 1 | 0.02em | — | `--mister-wf-value` |
| Waterfall "PTS" unit | 9px | 300 | 1 | 0.08em | UPPER | `--mister-text-muted` |
| Waterfall total range "115 – 130" | 20px | 700 | 1 | 0.02em | — | `--mister-text-primary` |
| SpecSheet label column | 11px | 300 | 1.40 | 0.06em | — | `--mister-text-secondary` |
| SpecSheet value column | 13px | 500 | 1.40 | 0 | — | `--mister-text-primary` |
| MoqTable column header | 10px | 500 | 1 | 0.10em | UPPER | `--mister-text-muted` |
| MoqTable row values | 13px | 400 | 1.40 | 0 | — | `--mister-text-primary` |
| HS code (inline) | 13px | 400 | 1 | 0.04em | — | `--mister-text-primary` |
| Incoterm label (inline or badge) | 13px | 500 | 1 | 0.04em | UPPER | `--mister-text-primary` |
| Category / source badge | 10px | 500 | 1 | 0.12em | UPPER | `--mister-text-primary` |
| Certificate badge | 10px | 400 | 1 | 0.08em | UPPER | `--mister-text-primary` |
| DocumentLink file type "PDF" | 10px | 400 | 1 | 0.08em | UPPER | `--mister-text-secondary` |

Teko legibility floor: The globals.css already enforces a 15px floor for `.font-mono` at small sizes on standard surfaces. The `.mister` override block in globals.css already exempts Mister from this floor, allowing the 9–11px micro-typography that makes the document metaphor work. This is correct. Do not alter it.

---

## 4. Component Aesthetic Direction

### MisterLauncher

**The anti-bubble.** The launcher refuses the floating chat-bubble convention. It is a narrow rectangular manifold tab — the visual metaphor is a document tab protruding from a file, or a terminal access port at the edge of a desk.

- Dimensions: 96px wide × 36px tall. Fixed. No pill. No circle.
- Position: bottom-right, 24px from bottom, 24px from right edge.
- Background: `--mister-launcher-bg` (`#001040`)
- Border: 1px solid `--mister-launcher-border` on all sides
- Content: "MISTER" in Teko 500 13px 0.12em tracking uppercase, `--mister-text-primary`
- Hover: border shifts to `--mister-launcher-border-hover`, top border brightens to `--mister-gold-rule-strong`
- State indicator: a 4px × 4px square (not dot — document corner marker) in `--mister-gold` appears at top-right corner once the archetype has been resolved. Before resolution: `--mister-status-unresolved` (rgba(248,246,240,0.25)). This is the only animated element on the launcher.
- Transition: border-color 0.15s ease. Nothing else moves.
- Border-radius: 2px — aligned with Wings `border-radius: wings` token.

### MisterWindow (both modes share this shell)

The window is a document, not a dialog. Zero decorative chrome.

- Floating mode: 420px wide, 680px tall. Right-anchored, sitting above the launcher with 8px gap. On mobile: full-width minus 16px gutters, full-height minus 80px.
- Embedded mode: full-width of parent, natural height (no fixed max in embedded).
- Background: `--mister-bg-window` (`#000C1F`)
- Border: 1px solid `--mister-border-window` all sides
- Box-shadow: `--mister-shadow-window` (floating mode only; embedded has none)
- Border-radius: 0px everywhere. Document corners are square.
- No backdrop blur, no frosted glass. This is a document, not an iOS modal.
- Structure (top to bottom): MisterHeader | MisterMessageList | MisterQuickActions (floated at bottom of list) | MisterComposer

### MisterHeader

The issuing-authority band. Every certified document has one.

- Height: 48px fixed
- Background: `--mister-bg-header` (`#001E50`)
- Bottom border: 1px solid `--mister-gold-rule` — the gold rule that makes the header read as a document header, not a nav bar
- Left content:
  - "MISTER" — Teko 500 13px 0.12em tracking uppercase, `--mister-text-primary`
  - "by Wings Global Trade" — Flexo 300 10px, `--mister-text-muted` — the endorsement, directly below or inline after "MISTER"
- Right content:
  - Session reference "WGT-XXXX" — Teko 400 11px 0.08em tracking uppercase, `--mister-text-ghost`. Transitions to `--mister-gold` opacity 0.50 once archetype is resolved (the document gets filed)
  - Archetype resolved indicator: 4px square (matches launcher indicator) in `--mister-gold` — appears on resolution, never before
  - Minimize icon: 16px, 1px warm-white stroke, no fill. A horizontal line (−), not a chevron
  - Close icon: 16px, 1px warm-white stroke. An × made of two lines
- Padding: 0 16px
- Do not add any logo mark, product illustration, or Wings eagle to the header. The name is sufficient.

### MisterMessage — Assistant

The institution speaks. Full-width. Document register.

**The left margin structure (the distinctive visual decision — see Section 7):**
- Every assistant message has a 32px left margin column
- In that column: the turn index "01" in Teko 300 11px, `--mister-text-ghost`, top-aligned
- The message content begins at 32px from the window edge (i.e., after the margin column)
- A 2px vertical rule in `--mister-rule-assistant` runs the full height of the message, at x=24px (the midpoint of the margin column). This is the institutional stamp — the left-rule that says "Mister authored this."

**Message content:**
- Background: transparent (inherits `--mister-bg-window`)
- Text: Flexo 400 14px 1.65 leading, `--mister-text-primary`
- Padding: 16px 20px 12px 0 (the 32px left margin handles left spacing)
- Inline data values (numbers, codes): switch to Teko 500 13px within the prose — font-family switch only, same size. The number looks like an instrument reading embedded in a sentence.
- Trade terms (first use): Flexo 400 14px + `border-bottom: 1px solid var(--mister-gold-annotation)` — like a defined term in a legal document. On hover: the underline brightens to full `--mister-gold`.
- Timestamp: Teko 300 9px, `--mister-text-ghost`, bottom-right of the message block, after a 4px bottom margin from the content
- On message hover: `--mister-rule-assistant` transitions to `--mister-rule-assistant-hover` (0.15s ease)
- **No avatar. No "Mister" name label above each message. The left-rule and the turn index ARE the identity signal.**

Vertical rhythm: 20px between complete turns (user message + assistant response pair). 8px between an assistant message and its quick-action row.

### MisterMessage — User

The buyer fills in the form. Warm paper side.

- Layout: right-aligned block. NOT full-width. Max-width: 72% of the message list width.
- Background: `--mister-bg-message-user` (`#F0EDE6`)
- Text: Flexo 400 14px 1.50 leading, `--mister-text-user` (`#001E50`)
- Padding: 10px 16px
- Border-radius: 0px. Rectangular. Document entry, not speech bubble.
- Border: none. The warm paper against the dark window provides sufficient contrast.
- Timestamp: Teko 300 9px, `--mister-text-user-muted`, bottom-right within the block.
- No name label, no avatar. The warm paper IS the user's signal.
- Margin: 4px left auto (pushes the block right), 16px top margin from the preceding assistant message.

### MisterQuickActions

Three document-action tags, not chips.

- Layout: flex row, 8px gap, rendered directly below the assistant message content in the 32px-offset zone (i.e., aligned with the message content, not the left margin column)
- Button dimensions: auto-width (shrink-wrap to label), height 28px
- Background: transparent
- Border: 1px solid `--mister-qa-border`
- Border-radius: 2px (Wings standard)
- Padding: 0 10px
- Label: Flexo 500 12px, `--mister-text-primary`
- Hover: background `--mister-qa-bg-hover`, border `--mister-qa-border-hover`, color stays
- Active/pressed: background `--mister-gold-fill-active`
- Transition: border-color 0.15s ease, background 0.15s ease
- **No icons inside the buttons.** The label is the action. "Ver estructura de costo." "Descargar ficha técnica." "Conectar con el equipo." These read as document actions.

### MisterComposer

The signature line at the bottom of the document.

- Full width of the window. Height: 56px (including the 1px top rule).
- Top border: 1px solid `--mister-gold-rule` — the rule that separates the document body from the signature area. On input focus: transitions to `--mister-gold-rule-strong`.
- Background: `--mister-bg-composer` (`#000C1F`) — flush with the window.
- Input: full-width minus 48px right margin for the send trigger. Flexo 400 14px, `--mister-text-primary`. Placeholder: Flexo 300 14px, `--mister-text-muted`. No border on the input element itself — the section top rule is the structural boundary.
- Send trigger: right-aligned, 48px wide column. The trigger is the text "→" (U+2192) in Teko 500 16px, `--mister-text-muted`. On input containing text: transitions to `--mister-gold`. On click/hover: `--mister-gold` at full opacity.
- The "→" is not in a button element with border — it sits bare in the composer footer bar. Senior trade specialists use arrow keys.
- Transition: composer top-border 0.15s ease (on focus), send arrow color 0.15s ease.

### ProductCard

A manifest entry, not a product card from a marketplace.

- Background: `--mister-bg-inset` (`#040F22`)
- Border: 1px solid `--mister-border-surface`
- Border-radius: 0px
- Box-shadow: `--mister-shadow-surface`
- Structure:
  - **Header band** (40px): background `#001E50`, product name in NissanOpti 400 18px `--mister-text-primary`, category badge (Teko 500 10px uppercase on navy-900 bg with 1px rgba(248,246,240,0.12) border) right-aligned
  - **Separator**: 1px solid `--mister-gold-rule`
  - **Spec grid**: 2-column grid. Left: spec label in Teko 300 11px 0.06em tracking, `--mister-text-secondary`. Right: spec value in Teko 500 13px, `--mister-text-primary`. Row separator: 1px `--mister-border-row`. Show 4–6 rows maximum in the chat context.
  - **Footer** (36px): background transparent, top border `--mister-border-row`. Left: source market badge (Teko 500 10px uppercase, navy bg, warm-white text). Right: "Ver ficha completa →" in Flexo 400 12px `--mister-gold`.
- Padding: 0 (bands handle internal padding). Spec grid: 12px 16px per row.

### ComparisonView

A formal comparison table, not two floating cards.

- Single unified table structure. Never two side-by-side cards — they would add too much layout complexity in the chat context.
- Background: `--mister-bg-inset`
- Border: 1px solid `--mister-border-surface`
- **Column headers**: product names in NissanOpti 400 15px, `--mister-text-primary`, in a top header band (48px) with background `#001E50` and 1px `--mister-gold-rule` bottom border. "OPCIÓN A" and "OPCIÓN B" as Teko 500 10px uppercase secondary labels above the names.
- **Row structure**: each spec row is Teko 300 11px label (full width, header of a section group) + two value cells (Teko 500 13px). Row separator: 1px `--mister-border-row`.
- **Delta annotation**: when one option leads on a spec axis, that value cell gets a 3px left border in `--mister-gold` (not a background fill — a structural mark like a document annotation tick). Never use background colors to signal a winner.
- **Delta summary row** (at bottom, above footer): "Opción B — +6 puntos de índice sobre Opción A" in Teko 400 12px, `--mister-text-secondary`. This row has a top border `--mister-wf-total-separator`.

### LandedCostWaterfall — The Signature Component

This is the most important component in the Mister design system. It must be designed as if it were the first UI element of its kind — because it is, in the LatAm B2B trade context. It does not look like a bar chart. It does not look like a calculator. It looks like a cost apportionment schedule from a Lloyd's cargo certificate.

**Two-part structure:**

**Part A — The Indexed Strip** (visual encoding):
- A single horizontal strip, 24px tall, full width of the component interior
- Divided into 5 segments by 1px vertical rules in `--mister-wf-separator`
- Each segment width is proportional to the midpoint of its index range (e.g., freight 8–15 pts → width proportional to 11.5 pts)
- Fill colors: `--mister-wf-strip-product`, `--mister-wf-strip-freight`, `--mister-wf-strip-insurance`, `--mister-wf-strip-duties`, `--mister-wf-strip-lastmile` (gold-tinted for duties)
- Below each segment in the strip: a segment label in Teko 300 9px uppercase `--mister-text-ghost` — truncated single-word label ("PRODUCTO", "FLETE", "SEGURO", "ADUANAS", "ÚLTIMA MILLA")
- The strip does NOT have rounded ends. Square. Document precision.
- Below the strip: a 1px `--mister-border-row` separator, then Part B.

**Part B — The Breakdown Table** (informational):
- Background: `--mister-wf-bg` (`#001040`)
- Border: 1px solid `--mister-border-surface`
- **Component header**:
  - "CÓMO SE CONSTRUYE TU COSTO" — Teko 500 11px 0.12em tracking uppercase, `--mister-text-secondary`
  - "Estructura indexada · base 100 · no es cotización" — Flexo 300 10px, `--mister-text-muted`
  - Separated from the rows by 1px `--mister-gold-rule`
- **Each segment row** (5 rows total):
  - Left 65%: segment label in Flexo 500 13px `--mister-text-primary` + driver note in Flexo 300 11px `--mister-text-secondary` below it
  - Right 35%: index value display
    - For the product/base row: "BASE 100" in Teko 500 16px, `--mister-wf-base` (gold). This is the ONLY gold value. One rule: one anchor.
    - For all other rows: the range e.g. "+8 – 15" in Teko 500 16px, `--mister-wf-value` (warm white). "PTS" in Teko 300 9px uppercase, `--mister-text-muted` directly below.
  - Row separator: 1px `--mister-border-row`
  - Row height: 56px (label + driver note need vertical breathing room)
- **Total band**:
  - Top border: 1px `--mister-wf-total-separator` (stronger than row separators)
  - Left: "ÍNDICE TOTAL ESTIMADO" Teko 500 10px uppercase, `--mister-text-secondary`
  - Right: the total range e.g. "115 – 130" in Teko 700 20px, `--mister-text-primary`. "PTS" in Teko 300 9px. The range is ALWAYS two numbers. There is no display path for a single total.
  - Row height: 52px
- **Disclaimer footer**:
  - Full-width, bottom of the component
  - Top border: 1px `--mister-border-row`
  - "Rangos indexados · ilustran estructura, no precio · no son cotización" — Flexo 300 10px, `--mister-text-muted`, centered
  - Padding: 10px 16px
- Component-level padding: 20px 20px 0 20px (the footer handles its own padding)

**Why this wins on Awwwards:** No other interface has codified a financial restraint architecturally. The visual form of the Waterfall IS the brand promise made visible. Every design decision in it — the indexed range instead of a currency total, the gold anchor on base-100 instead of a final cost, the word "ilustran" over "calculan" in the disclaimer — reinforces that promise at the level of typography and layout.

### MoqTable

A data table from a trade directory, not a pricing grid.

- Full-width within the inset card bg (`--mister-bg-inset`)
- Header row: Teko 500 10px 0.10em tracking uppercase, `--mister-text-muted`. Columns: "SKU", "CATEGORÍA", "MOQ MÍNIMO", "ÍNDICE/UNIDAD". No outer border on the header row — a 1px `--mister-gold-rule` bottom border only.
- Data rows: Teko 400 13px, `--mister-text-primary`. Tabular-nums. Right-align all numeric columns.
- Row separator: 1px `--mister-border-row`
- Tier-boundary MOQ value: `--mister-gold` color (not bold — color signals the tier threshold)
- No zebra stripes. Row separators do the work.
- Cell padding: 10px 12px

### SpecSheet

A printed technical specification page.

- Title bar (NissanOpti 400 20px, `--mister-text-primary`) + subtitle row (Teko 400 12px 0.06em, `--mister-text-muted` — "[CATEGORIA] · HS XXXX · ZOFRATACNA") with 1px `--mister-gold-rule` below
- Two-column spec grid: label column (Teko 300 11px 0.06em, `--mister-text-secondary`) / value column (Teko 500 13px, `--mister-text-primary`). Row separator 1px `--mister-border-row`.
- Certificate badges (if applicable): Teko 400 10px uppercase, background `rgba(196,147,63,0.06)`, border 1px `rgba(196,147,63,0.20)`, border-radius 2px. Arranged in a horizontal flow row below the spec grid with 8px gap.
- Export action at bottom: "↓ Exportar ficha técnica" in Flexo 400 12px `--mister-gold`

### QuotationForm CTA

The conversion moment. Designed as a document action, not a marketing button.

- Pre-fill summary strip above the button:
  - Background `rgba(248,246,240,0.04)`, border-bottom 1px `--mister-border-row`
  - Collected fields displayed inline in Teko 400 11px, `--mister-text-secondary`: "DESTINO: Lima, PE · PRODUCTO: [name] · INCOTERM: CIF"
  - Each collected field label: Teko 300 9px uppercase, `--mister-text-ghost`
  - Height: 36px
- Primary CTA button:
  - Full-width, height 44px
  - Background: `#C4933F` (gold)
  - Text: "Generar cotización prefilled" — Flexo 600 13px `#001E50` (navy on gold)
  - Border-radius: 2px
  - Hover: background `#D4A84F`, transition 0.15s ease
  - No icon. No arrow. The label is complete.
- Below the button: "La cotización se envía directamente al equipo Wings · Respuesta < 24h" — Flexo 300 10px, `--mister-text-muted`, centered

### ContactCard

A business card entry from a trade directory.

- Background: `--mister-bg-inset`
- Border: 1px solid `--mister-border-surface`
- Left accent: 3px solid `--mister-gold` left border on the card — the card IS the handoff, so it gets the gold left rule (stronger than the 2px assistant message rule)
- Layout: padding 14px 16px
- "WINGS GLOBAL TRADE" — Teko 500 10px 0.12em uppercase, color `rgba(196,147,63,0.60)` — the issuing authority label
- Contact name — Flexo 600 14px, `--mister-text-primary`
- Role — Teko 400 12px 0.04em, `--mister-text-secondary` (e.g. "Especialista en proyectos")
- WhatsApp action: "→ WhatsApp +50760250735" — Flexo 400 13px, `--mister-gold`. On hover: underline.
- Email action (if present): "→ [email]" — Flexo 400 12px, `--mister-text-secondary`. On hover: `--mister-gold`.
- No avatar, no photo, no circular placeholder. The data fields are the identity.

### DocumentLink

A document entry in a file index.

- Inline within message stream: not a card. A single-row item.
- Layout: flex row, 12px gap, vertically centered
- Document icon: 14px × 16px geometric rectangle (2px stroke, warm white, zero fill, 0px radius corner fold in top-right) — a stylized blank document shape, not a complex icon
- Document title: Flexo 400 13px, `--mister-text-primary`
- File type badge: "PDF" Teko 400 10px uppercase, on `rgba(196,147,63,0.08)` bg, 1px `rgba(196,147,63,0.20)` border, 2px radius, padding 2px 6px
- Download trigger: "↓ Descargar" — Flexo 400 12px `--mister-gold`, right-aligned with left margin auto

---

## 5. Grid and Spacing Scale — Mister Context

### Window internal grid

- Horizontal padding (window content): 20px left and right
- Left margin column for turn indices: 32px (fixed, outside the 20px window padding)
- Effective message content width: window-width − 20px (right) − 32px (left margin) = 368px in floating mode
- Surface cards (ProductCard, Waterfall, etc.): full-width within the message content zone, i.e., 368px max in floating mode

### Spacing tokens (Mister-specific, extending Wings)

| Token | Value | Usage |
|---|---|---|
| `--mister-space-xs` | `4px` | Badge padding, micro-gaps between inline elements |
| `--mister-space-sm` | `8px` | Gap between quick-action buttons, row internal padding |
| `--mister-space-md` | `16px` | Message internal top/bottom padding, composer horizontal padding |
| `--mister-space-lg` | `20px` | Window horizontal padding, turn-to-turn gap |
| `--mister-space-xl` | `28px` | Card section vertical padding, waterfall header padding |
| `--mister-space-message-group` | `20px` | Vertical gap between complete turns (user+assistant pairs) |
| `--mister-space-message-internal` | `8px` | Gap between assistant message and its quick-action row |
| `--mister-space-same-role` | `4px` | Consecutive messages from same role (rare in Mister's one-to-one format) |

### Window sizing

| Token | Value | Usage |
|---|---|---|
| `--mister-window-width` | `420px` | Floating mode |
| `--mister-window-height` | `680px` | Floating mode |
| `--mister-window-header-height` | `48px` | MisterHeader |
| `--mister-window-composer-height` | `56px` | MisterComposer |
| `--mister-launcher-width` | `96px` | MisterLauncher |
| `--mister-launcher-height` | `36px` | MisterLauncher |
| `--mister-margin-column` | `32px` | Left turn-index margin column |

---

## 6. The Single Visual Decision That Makes Mister Unmistakably Distinctive

**The Document Entry Format: numbered turn indices in the left margin.**

Every assistant response carries a two-digit turn index — "01", "02", "03" — in the fixed 32px left margin, in Teko 300 11px at `rgba(248,246,240,0.15)`. A 2px vertical rule in `--mister-rule-assistant` runs the full height of the message, at 24px from the left edge of the window, within this margin column.

The cumulative effect: Mister's conversation transcript reads as a formally documented consultation record. Turn 01 is the induction question. By turn 04, the archetype resolves and the session reference "WGT-XXXX" transitions from ghost opacity to a subtle gold. The buyer can see — visually — that they are building a document, not having a chat.

No other interface does this. No chatbot. No B2B platform. No trade tool. The conventions of numbered paragraphs come from legal documents, customs declarations, and certified reports — exactly the category this product claims to own.

The visual decision costs nothing to implement and delivers everything in terms of differentiation. It also reinforces the brand's structural promise: every turn is on the record. Mister is accountable for what it says because what it says is numbered.

Secondary effect: the left-margin column creates a consistent rhythmic structure that makes surface cards (ProductCard, Waterfall, ComparisonView) — which appear full-width — feel like they are being formally introduced within the document, not randomly inserted into a chat feed.

---

## 7. Full CSS Custom Property Token List

Paste the block below into `:root` in globals.css, after the existing Phase 2A tokens. The `.mister` class override block is separate and placed after `:root`.

```css
/* ============================================================
   Mister Design Tokens — extend Wings Phase 2A
   Source: spec/contributions/designer.md
   ============================================================ */
:root {
  /* --- Window structure --- */
  --mister-bg-window:              #000C1F;
  --mister-bg-header:              #001E50;
  --mister-bg-composer:            #000C1F;
  --mister-bg-inset:               #040F22;
  --mister-bg-message-user:        #F0EDE6;
  --mister-bg-hover-subtle:        rgba(248, 246, 240, 0.03);

  /* --- Text — dark surfaces --- */
  --mister-text-primary:           #F8F6F0;
  --mister-text-secondary:         rgba(248, 246, 240, 0.60);
  --mister-text-muted:             rgba(248, 246, 240, 0.35);
  --mister-text-ghost:             rgba(248, 246, 240, 0.15);

  /* --- Text — warm paper surface --- */
  --mister-text-user:              #001E50;
  --mister-text-user-muted:        rgba(0, 30, 80, 0.35);

  /* --- Gold — semantic --- */
  --mister-gold:                   #C4933F;
  --mister-gold-annotation:        rgba(196, 147, 63, 0.75);
  --mister-gold-rule:              rgba(196, 147, 63, 0.15);
  --mister-gold-rule-strong:       rgba(196, 147, 63, 0.30);
  --mister-gold-fill:              rgba(196, 147, 63, 0.06);
  --mister-gold-fill-active:       rgba(196, 147, 63, 0.10);
  --mister-gold-duties:            rgba(196, 147, 63, 0.08);

  /* --- Borders --- */
  --mister-border-window:          rgba(196, 147, 63, 0.15);
  --mister-border-surface:         rgba(248, 246, 240, 0.10);
  --mister-border-row:             rgba(248, 246, 240, 0.06);
  --mister-border-input:           rgba(248, 246, 240, 0.12);
  --mister-border-focus:           rgba(196, 147, 63, 0.50);

  /* --- Message left rules --- */
  --mister-rule-assistant:         rgba(196, 147, 63, 0.18);
  --mister-rule-assistant-hover:   rgba(196, 147, 63, 0.40);

  /* --- Quick actions --- */
  --mister-qa-border:              rgba(196, 147, 63, 0.22);
  --mister-qa-border-hover:        rgba(196, 147, 63, 0.55);
  --mister-qa-bg-hover:            rgba(196, 147, 63, 0.06);

  /* --- LandedCostWaterfall --- */
  --mister-wf-bg:                  #001040;
  --mister-wf-strip-product:       rgba(248, 246, 240, 0.08);
  --mister-wf-strip-freight:       rgba(248, 246, 240, 0.06);
  --mister-wf-strip-insurance:     rgba(248, 246, 240, 0.04);
  --mister-wf-strip-duties:        rgba(196, 147, 63, 0.08);
  --mister-wf-strip-lastmile:      rgba(248, 246, 240, 0.04);
  --mister-wf-separator:           rgba(196, 147, 63, 0.12);
  --mister-wf-base:                #C4933F;
  --mister-wf-value:               #F8F6F0;
  --mister-wf-total-separator:     rgba(196, 147, 63, 0.30);

  /* --- Launcher --- */
  --mister-launcher-bg:            #001040;
  --mister-launcher-border:        rgba(196, 147, 63, 0.22);
  --mister-launcher-border-hover:  rgba(196, 147, 63, 0.55);

  /* --- Status indicators --- */
  --mister-status-unresolved:      rgba(248, 246, 240, 0.25);
  --mister-status-resolved:        #C4933F;
  --mister-status-captured:        #C4933F;

  /* --- Elevation --- */
  --mister-shadow-window:
    0 8px 48px rgba(0, 0, 0, 0.40),
    0 0 0 1px rgba(196, 147, 63, 0.12);
  --mister-shadow-surface:         0 2px 12px rgba(0, 0, 0, 0.24);

  /* --- Spacing --- */
  --mister-space-xs:               4px;
  --mister-space-sm:               8px;
  --mister-space-md:               16px;
  --mister-space-lg:               20px;
  --mister-space-xl:               28px;
  --mister-space-message-group:    20px;
  --mister-space-message-internal: 8px;
  --mister-space-same-role:        4px;

  /* --- Window dimensions --- */
  --mister-window-width:           420px;
  --mister-window-height:          680px;
  --mister-window-header-height:   48px;
  --mister-window-composer-height: 56px;
  --mister-launcher-width:         96px;
  --mister-launcher-height:        36px;
  --mister-margin-column:          32px;
}
```

---

## 8. What Awwwards Would Judge This On — And Why It Passes

**Originality:** The Document Entry format with numbered turn indices is a genuinely new interface pattern. No precedent in AI chat UI.

**Design craft:** The three-layer typographic hierarchy (NissanOpti for product authority, Flexo for human voice, Teko for instrument data) is executed consistently at every level — down to choosing between Flexo and Teko for a single inline data value. The LandedCostWaterfall is the first component in LatAm B2B that makes a brand restraint (refusing to quote) into a designed object.

**Concept:** The thesis is not a mood — it is testable. If you screenshot MisterMessage output and print it, does it look like a certified trade document? The answer, with this system, is yes. That is the test, and this design passes it.

**Usability:** The left-margin turn numbering is also a navigation system — you can scan the consultation at a glance. The quick-action buttons are specific enough to be predictive. The composer is so minimal that the input is the focus.

**No padding:** Every token has a semantic reason. No gradient. No decorative border. No ambient particle effect. The design earns its Awwwards entry by refusing, not adding.

---

*Designer Contribution · Mister · Wings Global Trade*
*Prepared for conductor synthesis · June 2026*
*Flag: font discrepancy between spec documents and live globals.css requires conductor resolution before MisterHeader is built.*
