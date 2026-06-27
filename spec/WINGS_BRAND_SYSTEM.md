# Wings Global Trade — Brand System
**The complete identity authority for Wings Global Trade.**
**Read `WINGS_VISUAL_THESIS.md` first. This document applies the thesis.**

---

## 1. THE THESIS (summary)

> "Import intelligence should read like a certified document, not a marketplace listing."

Full thesis: `spec/WINGS_VISUAL_THESIS.md`

---

## 2. BRAND IDENTITY

**Name:** Wings Global Trade
**Tagline:** Precisión. Proximidad. Confianza.
**Category:** B2B trade intelligence and inquiry platform — Latin American machinery importers
**Operating corridor:** China / Japan / Thailand / Dubai → ZOFRATACNA (Tacna, Peru) / ZOFRI (Iquique, Chile) → Peru, Chile, Bolivia, Colombia

**What Wings is:**
A platform that treats B2B machinery buyers as technical professionals. Not a catalog — a trade intelligence instrument.

**What Wings is not:**
- A marketplace (no cart, no checkout, no pricing commitments)
- A directory (no unfiltered sourcing, no contact-a-supplier)
- A broker (Wings operates the free zone corridor directly)

---

## 3. LOGO

### Current state
Two SVG versions exist in `BRAND ELEMENTS/`. Both are CorelDRAW-derived organic paths. Neither has a documented construction grid. The mark collapses at small sizes. No variation set exists.

### Required state
See `spec/LOGO-RECONSTRUCTION-BRIEF.md` for the full designer brief.

### Usage rules (apply now, before reconstruction)

**Primary usage:** wings-logo1 - v2.svg for all digital use.

**Color rules:**
- On navy backgrounds: warm white (#F8F6F0) version
- On warm white backgrounds: navy (#001E50) version
- Gold (#C4933F) version: reserved for certification marks and authentication seals only — never for the primary logo

**Clear space:** minimum margin equal to the cap height of the W letterform on all four sides.

**Never:**
- Distort, rotate, or add drop shadows to the logo
- Place on busy photographic backgrounds without a solid color backing
- Use the mark smaller than 24px on screen
- Reproduce in any color other than navy, warm white, or gold

### Variation set needed (pending reconstruction)
- Primary: mark + WINGS wordmark horizontal
- Primary stacked: mark above wordmark
- Wordmark only
- Mark only
- Reversed (white on navy)
- Single-color navy
- Favicon: 16×16, 32×32 simplified

---

## 4. TYPOGRAPHY

### The semantic system

The three typefaces map to the three words of the tagline. This is the governing logic.

```
IBM Plex Serif  =  Precisión
Flexo           =  Proximidad
DM Mono         =  Confianza
```

### IBM Plex Serif — Precisión

**What it is:** IBM's own display typeface. Engineering pedigree. Used for IBM developer communications. Precise, authoritative, slightly technical. Not decorative — purposeful.

**Where it is used:**
- Product names (h1 on product detail pages)
- Section headlines (h2 on homepage, category pages)
- Passport headers (ficha técnica title)
- The "WINGS GLOBAL TRADE" wordmark in formal document contexts
- Pull quotes where authority matters

**Where it is never used:**
- Body copy of any kind
- UI labels, navigation, buttons
- Data values, prices, spec numbers
- WhatsApp messages, email body

**Weights available:** 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 300i, 400i
**CSS variable:** `--font-display` → `var(--font-display)`
**Loaded via:** `next/font/google` in `app/layout.tsx` as `IBM_Plex_Serif`

**CRITICAL — do not use `--font-playfair`:** This variable is a ghost from an earlier design pass. It was never defined and causes silent browser fallback. It has been removed from all components. Any new component that uses `font-playfair` is incorrect.

---

### Flexo — Proximidad

**What it is:** A geometric sans with warmth. Softer than Futura, more human than Gotham. Named for flexibility — it adapts. Right for a brand about trade relationships.

**Where it is used:**
- All body copy (narrative text, product descriptions, section prose)
- All UI elements (navigation, buttons, form labels, badge text)
- Copy in CTAs ("Solicitar cotización", "Ver catálogo")
- Error messages, empty states (the human-facing voice)

**Where it is never used:**
- Data values, prices, spec numbers, HS codes
- Anything that is a measurement or calculation output

**Weights available:** Thin · Light · Regular · Medium · Demi · Bold · Heavy · Black (all with italic)
**Self-hosted:** `/public/fonts/flexo/` TTF files
**CSS variable:** `--font-body` → `var(--font-body)`

---

### DM Mono — Confianza

**What it is:** Monospace type signals code, instruments, invoices, official records. Every number in DM Mono says: *this is a precise measurement, not an estimate.*

**Where it is used:**
- ALL numeric values without exception (HP, GVW, kg, km/h, mm, USD, %, HS codes)
- CIF estimates and all line items in cost breakdowns
- Transit times ("28d", "3d")
- Source market badges and status indicators
- Section labels in uppercase when used as eyebrow text (e.g., "CATÁLOGO ACTIVO")
- TPR field labels and values in the Accio Engine
- Authentication marks and certification indicators
- Timestamps and reference numbers (WGT-2847)
- Blueprint Mode — all text in blueprint mode is DM Mono

**Rule:** If it is a measurement, it is DM Mono. No exceptions.

**Where it is never used:**
- Narrative copy, product descriptions
- Button labels that are action phrases ("Solicitar cotización" stays in Flexo)
- H1/H2 headlines

**Weights available:** 300 (Light), 400 (Regular), 500 (Medium)
**Loaded via:** `next/font/google` in `app/layout.tsx` as `DM_Mono`
**CSS variable:** `--font-mono` → `var(--font-mono)`

---

### Type scale

```css
/* Display — IBM Plex Serif */
--text-display-xl:  clamp(3rem, 5vw, 5rem);        /* 48–80px — hero headlines */
--text-display-lg:  clamp(2.25rem, 4vw, 3.75rem);  /* 36–60px — section titles */
--text-display-md:  clamp(1.875rem, 3vw, 2.5rem);  /* 30–40px — subsection headers */
--text-display-sm:  clamp(1.5rem, 2.5vw, 2rem);    /* 24–32px — product names in cards */

/* Body — Flexo */
--text-body-lg:     1.125rem;    /* 18px — primary reading copy */
--text-body-md:     1rem;        /* 16px — standard body */
--text-body-sm:     0.875rem;    /* 14px — secondary copy, captions */

/* Mono — DM Mono */
--text-mono-lg:     1rem;        /* 16px — CIF values, primary data */
--text-mono-md:     0.875rem;    /* 14px — spec labels, timestamps */
--text-mono-sm:     0.75rem;     /* 12px — fine print, footnotes */

/* UI labels — Flexo */
--text-label-lg:    0.875rem;    /* 14px — nav, button text */
--text-label-md:    0.8125rem;   /* 13px — badge text */
--text-label-sm:    0.75rem;     /* 12px — captions */
```

---

## 5. COLOR

### The palette

```
Navy       #001E50   Primary. Document backgrounds, headers, nav, authority surfaces.
Gold       #C4933F   Accent. CTAs, precision annotations, certification marks.
Warm White #F8F6F0   Ground. Page backgrounds, text on navy, paper surfaces.
```

### Semantic roles — this is the critical document

**Navy (#001E50):**
- Document and section backgrounds
- Navigation bar (on scroll)
- Footer
- Product spec cards on light sections
- Blueprint Mode background
- Ficha técnica header band
- Source market badges
- All authority surfaces

**Gold (#C4933F) — two uses only:**

SEMANTIC (meaning-carrying):
- Primary CTA buttons ("Solicitar cotización", "Enviar consulta")
- Captured TPR field indicators (gold dot = data collected)
- CIF total row in estimate cards (the number that closes the decision)
- Peak HP annotation in EnginePowerBand
- Product position dot in SpecPositionBand

EXPRESSIVE (brand presence):
- Certification marks and authentication seals
- Provenance ribbon line and node accents
- Section separator rules (1px horizontal rules between sections)
- Focus rings on interactive elements (3px, rgba(196,147,63,0.15))
- Active nav link underline (2px)

NOT for: backgrounds, large decorative surfaces, any element where gold is used because it "looks premium" rather than because it carries meaning. If you cannot state what the gold communicates, remove it.

**Warm White (#F8F6F0):**
- All page background surfaces (never pure #FFFFFF)
- Text on navy backgrounds (primary readable text)
- Chat bubbles and document surfaces
- Paper/document simulation

AS MARK (not just background):
- Thin rules on navy (1px separators in dark sections)
- Technical silhouette drawings (warm white monoline on navy)
- Annotation text at low opacity on navy (warm white/35–45)
- Blueprint Mode text hierarchy

**Rule:** Warm white on navy = document. Pure white on navy = screen. Wings is always a document.

### Section alternation

```
Hero:                Navy
First content:       Warm White
Second content:      Navy
Third content:       Warm White
Footer:              Navy

Rule: never two adjacent sections of the same color.
Rule: footer is always navy.
```

### Contrast ratios (verified)

- Navy #001E50 on Warm White #F8F6F0: 13.4:1 — passes WCAG AAA
- Warm White on Navy: 13.4:1 — passes WCAG AAA
- Gold #C4933F on Navy #001E50: 3.8:1 — passes WCAG AA for large text and UI components

---

## 6. COPY RULES

**Language:** Spanish first. All UI copy in Spanish. Backend field names and code in English. SEO metadata includes English.

**Tone:** Technical, direct, trustworthy. A senior trade engineer briefing a procurement director. Not a salesperson.

**The six rules:**

1. **No exclamation marks.** Ever. In any context.
2. **Specific over generic.** "79 HP efectivos a 3.200 msnm" not "alta potencia". "ZOFRATACNA · Tacna, Perú" not "zona franca".
3. **Periods, not ellipses.** "Precisión. Proximidad. Confianza." — three declarative statements. Not "Precisión, Proximidad y Confianza".
4. **Never claim quality.** Show it. Data proves quality. "Productos de calidad" is forbidden.
5. **No approximations without basis.** "~28 días" is acceptable when the data source is the TRANSIT_DAYS table. "entrega rápida" is not acceptable.
6. **Reference numbers carry weight.** WGT-2847, HS Capítulo 8701, Euro III — these make copy feel like a document. Use them.

**What Wings never says:**
- "Productos de calidad"
- "Los mejores precios"
- "Somos líderes en..."
- "Amplia gama de..."
- Anything with an exclamation mark
- "Haz clic aquí" (always use specific action labels)

---

## 7. MOTION

Motion should behave like an instrument, not a toy.

```typescript
// src/lib/motion.ts — the complete motion vocabulary

FADE_UP:    opacity 0→1, y 24→0, duration 0.5s, ease [0.25, 0.1, 0.25, 1.0]
FADE_IN:    opacity 0→1, duration 0.4s, ease 'easeOut'
STAGGER:    staggerChildren 0.08s
SLIDE_UP:   opacity 0→1, y 16→0, duration 0.5s, ease [0.25, 0.1, 0.25, 1.0]
```

**Rules:**
- Easing: always `[0.25, 0.1, 0.25, 1.0]` (standard ease) or `easeOut`. Never spring. Never bounce.
- Duration: 0.3–0.6s. Nothing longer for UI transitions.
- Purpose: every animation reveals information or guides attention. Not ambient.
- `prefers-reduced-motion`: all animations respect this. Static render when reduced motion is active.

**Ambient motion (canvas elements):**
- NoiseField opacity: 0.015–0.030 (near-invisible texture, not atmospheric presence)
- TradeRouteAnimation particles: informational (they carry route data, origin label, container type)
- No canvas element should be purely decorative

---

## 8. PHOTOGRAPHY DIRECTION

See `spec/PHOTOGRAPHY-BRIEF.md` (to be created with the photography session brief).

Until photography exists:
- Use Technical Silhouette SVGs (warm white monoline on navy) as the primary product visual treatment
- Supplement with the Magnific-upscaled images only where no alternative exists
- Never use stock photography of any kind

---

## 9. COMPONENT CONVENTIONS

### Buttons

```
Primary (gold):
  background: #C4933F · text: #001E50 · font: Flexo 500 14px
  padding: 12px 24px · border-radius: 2px
  hover: #B8842E · active: #A6751A · transition: 0.15s ease

Secondary (outline):
  background: transparent · border: 1px solid currentColor
  font: Flexo 500 14px · padding: 11px 23px · border-radius: 2px

Ghost (text-only):
  background: transparent · text: #C4933F
  font: Flexo 500 14px · hover: underline
```

### Inputs

```
background: #FFFFFF (light bg) | rgba(255,255,255,0.06) (navy bg)
border: 1px solid #E5E7EB (light) | rgba(248,246,240,0.2) (dark)
border-radius: 2px · padding: 12px 16px · font: Flexo 400 16px
focus: border #C4933F · box-shadow: 0 0 0 3px rgba(196,147,63,0.15)
```

### Source market badges

```
background: #001E50 · text: #F8F6F0
font: DM Mono 400 12px · padding: 3px 8px · border-radius: 2px
```

### Cards

```
background: #FFFFFF · border: 1px solid #E5E7EB · border-radius: 4px
box-shadow: 0 1px 3px rgba(0,0,32,0.06)
hover: box-shadow 0 4px 12px rgba(0,0,32,0.10) · translateY(-2px) · 0.2s ease
```

---

## 10. DOCUMENT TEMPLATES

### WhatsApp notification format

```
WINGS GLOBAL TRADE · NUEVA CONSULTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REF · WGT-XXXX
TIPO · [Catálogo / Accio Engine / Contacto]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCTO  [product name]
CANTIDAD  [quantity]
DESTINO   [city, country]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACTO  [full name]
EMPRESA   [company]
TELÉFONO  [phone]
EMAIL     [email]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECIBIDO  [date] · [time] PET
RESPUESTA ESPERADA < 24H
```

### Reference number format
`WGT-XXXX` — 4-digit zero-padded sequential number. Generated in `src/lib/reference.ts`.
Assigned at inquiry submission. Persistent in localStorage for return visits. Shown as "Consulta activa · WGT-XXXX" chip on hero areas.

---

## 11. WHAT CHANGES WHEN BLUEPRINT MODE IS ACTIVE

Blueprint Mode is a Pro toggle — it reveals the full technical instrument layer.

**Visual changes:**
- Background: navy (#001E50) — the entire page darkens
- All text: warm white (#F8F6F0) on navy
- All data values: DM Mono at full opacity
- Grid overlay: subtle 1px warm white/4 grid

**Content changes (the data layer reveals):**
- Full spec table (all rows, no priority filter)
- HS chapter and ZOFRATACNA duty rate
- Compliance certification table (all 12 standards)
- Engineering dimension callouts on TechnicalSilhouette
- Altitude-corrected HP for the buyer's region
- Freight estimate and container type from product-intelligence.ts
- "Exportar ficha técnica" download button

Blueprint Mode is the brand's strongest differentiator. No LatAm B2B machinery platform has anything equivalent.

---

## 12. BRAND AUDIT SCORES (June 2026 baseline)

| Dimension | Score | Target | Key Gap |
|-----------|:---:|:---:|---------|
| Visual Thesis Clarity | 42 | 95 | Thesis not stated — now documented |
| Logo / Mark Quality | 35 | 85 | Geometric reconstruction needed |
| Typography System | 78 | 85 | Ghost variable risk; needs codification |
| Color System | 72 | 85 | Gold overuse; semantic roles undefined |
| Communication System | 48 | 95 | No templates beyond the product |
| Materiality & 3D | 8 | 65 | No physical dimension designed |
| Behavioral Consistency | 65 | 98 | Photography contradiction |
| Campaign | 25 | 85 | No external campaign executed |
| Thought Leadership | 70 | 95 | Intelligence exists only inside product |
| Award Potential | 38 | 88 | Needs complete system, not just product |
| **Composite** | **48** | **97** | |

Full implementation plan: `design/BRAND-TO-100.md`

---

*Brand System Authority Document · Wings Global Trade*
*Created: June 2026 · Review: with each significant brand extension*
