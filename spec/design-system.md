# Wings Global Trade — Design System

## Reference

This spec extends the Wings Brand System established in `WINGS_BRAND_SYSTEM.md`. All core brand decisions (color, typography, tone) are authoritative there. This document specifies the application-layer extensions: component-level tokens, interactive states, data display patterns specific to the catalog and Accio Engine interfaces.

---

## Color Tokens

### Core Brand Colors (from WINGS_BRAND_SYSTEM.md)

```css
--color-navy:       #001E50;   /* Primary background, headers, nav */
--color-gold:       #C4933F;   /* Accent, CTAs, captured TPR indicators */
--color-warm-white: #F8F6F0;   /* Page background, alternate sections */
```

### Application-Layer Extensions

```css
/* Surfaces */
--color-surface-navy:         #001E50;
--color-surface-warm:         #F8F6F0;
--color-surface-card:         #FFFFFF;      /* Product cards on warm-white bg */
--color-surface-card-navy:    #002266;      /* Cards on navy sections */
--color-surface-chat-user:    #F0EDE6;      /* User chat bubble */
--color-surface-chat-ai:      #FFFFFF;      /* AI chat bubble */
--color-surface-tpr-captured: #F8F6F0;      /* TPR field: captured */
--color-surface-tpr-pending:  #F3F3F3;      /* TPR field: pending */

/* Text */
--color-text-primary:         #001E50;      /* On warm-white backgrounds */
--color-text-inverse:         #F8F6F0;      /* On navy backgrounds */
--color-text-muted:           #6B7280;      /* Secondary text, labels */
--color-text-muted-inverse:   #94A3B8;      /* Secondary text on navy */
--color-text-mono:            #374151;      /* DM Mono data values */

/* States */
--color-status-new:           #C4933F;      /* Gold — new lead */
--color-status-contacted:     #2563EB;      /* Blue */
--color-status-qualified:     #16A34A;      /* Green */
--color-status-closed-won:    #15803D;      /* Dark green */
--color-status-closed-lost:   #6B7280;      /* Grey */

/* Indicators */
--color-indicator-captured:   #C4933F;      /* TPR field captured — gold */
--color-indicator-pending:    #D1D5DB;      /* TPR field pending — light grey */
--color-indicator-minimum:    #F59E0B;      /* TPR at minimum — amber */
--color-indicator-complete:   #16A34A;      /* TPR complete — green */

/* Borders */
--color-border-default:       #E5E7EB;
--color-border-navy:          rgba(248, 246, 240, 0.12);   /* On navy sections */
--color-border-gold:          #C4933F;
```

---

## Typography

### Font Stack

```css
/* Display / Headings */
--font-display: 'Cormorant Garamond', Georgia, serif;

/* Body / UI Labels */
--font-body: 'Flexo', system-ui, -apple-system, sans-serif;

/* Data / Code / Mono */
--font-mono: 'DM Mono', 'Courier New', monospace;
```

### Type Scale

```css
/* Display — hero headlines, product names */
--text-display-xl:    clamp(3rem, 5vw, 5rem);        /* 48–80px */
--text-display-lg:    clamp(2.25rem, 4vw, 3.75rem);  /* 36–60px */
--text-display-md:    clamp(1.875rem, 3vw, 2.5rem);  /* 30–40px */
--text-display-sm:    clamp(1.5rem, 2.5vw, 2rem);    /* 24–32px */

/* Body */
--text-body-lg:       1.125rem;    /* 18px — primary reading */
--text-body-md:       1rem;        /* 16px — standard */
--text-body-sm:       0.875rem;    /* 14px — secondary */

/* Mono / Data */
--text-mono-lg:       1rem;        /* 16px — CIF values, spec data */
--text-mono-md:       0.875rem;    /* 14px — labels, timestamps */
--text-mono-sm:       0.75rem;     /* 12px — fine print, disclaimers */

/* UI Labels */
--text-label-lg:      0.875rem;    /* 14px — nav, button text */
--text-label-md:      0.8125rem;   /* 13px — badge text */
--text-label-sm:      0.75rem;     /* 12px — captions */
```

### Font Weights

```css
/* Cormorant Garamond */
--weight-display-light:   300;    /* Taglines, secondary headings */
--weight-display-regular: 400;    /* Standard display */
--weight-display-semibold: 600;   /* Hero headlines, product names */

/* Flexo */
--weight-body-regular: 400;
--weight-body-medium:  500;
--weight-body-bold:    700;

/* DM Mono */
--weight-mono-light:   300;    /* TPR pending fields */
--weight-mono-regular: 400;    /* Standard data */
--weight-mono-medium:  500;    /* CIF total, emphasis values */
```

---

## Spacing Scale

4px base unit. All spacing is a multiple of 4.

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-28: 112px;
```

Section vertical padding: `py-20 md:py-28` (80px mobile → 112px desktop)

---

## Component Specifications

### Button

Three variants:

**Primary (gold)**
```
background: #C4933F
text: #001E50
font: Flexo 500, 14px
padding: 12px 24px
border-radius: 2px       ← intentionally very slight, not pill
border: none
hover: background #B8842E (10% darker)
active: background #A6751A
transition: background 0.15s ease
```

**Secondary (outline)**
```
background: transparent
text: current context (navy on light, warm-white on dark)
border: 1px solid current text color
font: Flexo 500, 14px
padding: 11px 23px
border-radius: 2px
hover: background rgba(current, 0.06)
```

**Ghost (text-only with hover)**
```
background: transparent
text: #C4933F
font: Flexo 500, 14px
padding: 12px 0
no border
hover: text #B8842E, underline
```

WhatsApp CTA button: same as Primary but uses WhatsApp green (#25D366) on dark backgrounds, gold on light.

### Input / Textarea

```
background: #FFFFFF (on warm-white) | rgba(255,255,255,0.06) (on navy)
border: 1px solid #E5E7EB (light) | rgba(248,246,240,0.2) (dark)
border-radius: 2px
padding: 12px 16px
font: Flexo 400, 16px
color: #001E50 (light) | #F8F6F0 (dark)
placeholder color: #9CA3AF (light) | #6B7280 (dark)

focus:
  outline: none
  border-color: #C4933F
  box-shadow: 0 0 0 3px rgba(196, 147, 63, 0.15)

error:
  border-color: #DC2626
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1)
```

### Select (Country Dropdown)

Same visual spec as Input. Custom chevron (SVG, navy or warm-white). Native select element for MVP — no custom dropdown library.

### Card (Product Card)

```
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 4px
overflow: hidden
box-shadow: 0 1px 3px rgba(0,0,32,0.06)

hover:
  box-shadow: 0 4px 12px rgba(0,0,32,0.10)
  transform: translateY(-2px)
  transition: all 0.2s ease
```

Product image: `aspect-ratio: 4/3`, `object-fit: cover`, `width: 100%`

### Badge (Source Market / Status)

```
Source market badge:
  background: #001E50
  text: #F8F6F0
  font: DM Mono 400, 12px
  padding: 3px 8px
  border-radius: 2px

Status badge (lead status):
  background: var(--color-status-{status}) at 12% opacity
  text: var(--color-status-{status})
  font: Flexo 500, 12px
  padding: 3px 8px
  border-radius: 2px
```

### Chat Bubbles (Accio Engine)

**User bubble:**
```
background: #F0EDE6
text: #001E50
border-radius: 4px 4px 0 4px      ← top-right square corner
max-width: 80%
padding: 12px 16px
font: Flexo 400, 16px
margin-left: auto                  ← right-aligned
border-left: 3px solid #C4933F    ← gold accent
```

**AI bubble:**
```
background: #FFFFFF
text: #001E50
border-radius: 4px 4px 4px 0      ← bottom-left square corner
max-width: 80%
padding: 12px 16px
font: Flexo 400, 16px
margin-right: auto                 ← left-aligned
border: 1px solid #E5E7EB
```

**Typing indicator:**
Three dots, navy color, 600ms staggered opacity pulse animation.

### TPR Sheet (Accio Engine)

```
Panel background: #F8F6F0
Border-left: 1px solid #E5E7EB
Width: 384px (w-96)
Overflow-y: scroll

Section header:
  font: Flexo 500, 12px
  text: #6B7280 (muted)
  text-transform: uppercase
  letter-spacing: 0.08em
  padding-bottom: 8px
  border-bottom: 1px solid #E5E7EB
  margin-bottom: 12px
```

**TPR Field Row:**
```
Captured:
  label: Flexo 500, 13px, #6B7280
  value: DM Mono 400, 14px, #001E50
  indicator: 8px circle, #C4933F (gold)

Pending:
  label: Flexo 400, 13px, #9CA3AF
  value: "Pendiente"
  indicator: 8px circle, #D1D5DB (grey)
  font: Flexo 400 italic

Edit button: ghost variant, 12px, visible on row hover only
```

### CIF Estimate Card

```
background: #001E50 (navy)
border-radius: 4px
padding: 24px
font family: DM Mono for all values

Row format:
  label: DM Mono 300, 13px, #94A3B8 (muted inverse)
  value: DM Mono 400, 14px, #F8F6F0

Separator line before CIF total:
  border-top: 1px solid rgba(248, 246, 240, 0.2)
  margin: 12px 0

CIF total row:
  label: DM Mono 500, 14px, #F8F6F0
  value: DM Mono 500, 18px, #C4933F (gold — emphasis)

Free zone row:
  background: rgba(196, 147, 63, 0.12)
  border-radius: 2px
  padding: 8px 12px
  text: DM Mono 400, 13px, #C4933F

Disclaimer:
  font: Flexo 400 italic, 12px, #6B7280
  margin-top: 16px
```

---

## Section Alternation Pattern

All long-form pages alternate between navy and warm-white sections.

```
Page order:
  1. Hero: navy
  2. First content section: warm-white
  3. Second content section: navy
  4. Third content section: warm-white
  5. Footer: navy

Homepage:
  HeroSection:    navy
  CategoryGrid:   warm-white
  TrustBar:       navy
  MarketMap:      warm-white
  (CTA section):  navy
  Footer:         navy (merged with last navy section if adjacent)
```

Never two navy sections adjacent. Never two warm-white sections adjacent. Footer is always navy.

---

## Navigation Specification

```
Height: 64px (desktop), 56px (mobile)
Position: fixed top-0, z-50
Background: transparent initially; on scroll > 20px: navy + backdrop-blur-sm
Transition: background 0.2s ease

Logo: SVG wordmark, warm-white on navy, navy on transparent-over-light
NavLinks: Flexo 400, 14px, warm-white
Active link: gold underline (2px, offset 4px)

WhatsApp CTA button:
  background: #25D366 (WhatsApp green) initially
  Switches to gold (#C4933F) when nav turns navy
  border-radius: 2px
  padding: 8px 16px
  font: Flexo 500, 14px
```

---

## Motion Design Tokens

```typescript
// src/lib/motion.ts

export const FADE_UP = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }
}

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

export const STAGGER_CONTAINER = {
  animate: { transition: { staggerChildren: 0.08 } }
}

export const STAGGER_ITEM = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }
}

export const SLIDE_UP = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }
}
```

No spring physics. No bounce. Easing is always `[0.25, 0.1, 0.25, 1.0]` (standard ease) or `easeOut`. Duration: 0.3–0.6s. Nothing longer.

---

## Responsive Breakpoints

```css
/* Tailwind defaults — no custom breakpoints */
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

The Accio Engine split-screen collapses the TPR sheet at < 1024px (lg breakpoint). Below lg, TPR sheet is accessible via bottom drawer only.

---

## Accessibility

- All interactive elements have visible focus states (gold `outline: 3px solid #C4933F`, `outline-offset: 2px`)
- Color contrast: all text/background pairs meet WCAG 2.1 AA minimum (4.5:1 normal text, 3:1 large text)
- Navy `#001E50` on warm-white `#F8F6F0`: contrast ratio 13.4:1 — passes AAA
- Gold `#C4933F` on navy `#001E50`: contrast ratio 3.8:1 — passes AA for large text / UI components
- All form inputs have associated `<label>` elements (not placeholder-only)
- Chat messages have `role="log"` on the container and `aria-live="polite"` for new messages
- Images have descriptive alt text in Spanish

---

## Tailwind Config Extensions

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:       '#001E50',
        gold:       '#C4933F',
        'warm-white': '#F8F6F0',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'Courier New', 'monospace'],
      },
      letterSpacing: {
        'widest-2': '0.08em',
      },
    },
  },
  plugins: [],
}

export default config
```
