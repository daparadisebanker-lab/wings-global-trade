# Designer Contribution — Wings Global Trade

## Visual Thesis

**Every screen must read like a trade document that has been designed.**

Not a startup landing page. Not a marketplace. A precision instrument. Clean vertical rhythm, generous whitespace, typographic hierarchy that lets the product specs speak. The navy/gold/warm-white palette enforces discipline — nothing decorative lives on these screens.

Awwwards standard: the detail work is what wins. Focus on: hover states, typography spacing, the exact border-radius on every element, shadow depth, transition timing. The spec already defines these — the gap in v1 is consistent application.

---

## Extended Color Token System

All tokens are defined in `tailwind.config.ts` and `globals.css`:

```css
/* Brand Core */
--color-navy:             #001E50;
--color-gold:             #C4933F;
--color-gold-hover:       #B8842E;
--color-gold-active:      #A6751A;
--color-warm-white:       #F8F6F0;

/* Surfaces */
--color-surface-card:         #FFFFFF;
--color-surface-card-navy:    #002266;
--color-surface-tpr:          #F8F6F0;
--color-surface-chat-user:    #F0EDE6;
--color-surface-overlay:      rgba(0, 30, 80, 0.72);

/* Text */
--color-text-primary:         #001E50;
--color-text-inverse:         #F8F6F0;
--color-text-muted:           #6B7280;
--color-text-muted-inverse:   #94A3B8;
--color-text-mono:            #374151;

/* Borders */
--color-border:               #E5E7EB;
--color-border-navy:          rgba(248, 246, 240, 0.12);
--color-border-gold:          #C4933F;
--color-border-focus:         rgba(196, 147, 63, 0.40);

/* Status */
--color-status-new:           #C4933F;
--color-status-qualified:     #16A34A;
--color-indicator-captured:   #C4933F;
--color-indicator-pending:    #D1D5DB;
--color-indicator-complete:   #16A34A;
```

Tailwind extensions needed in `tailwind.config.ts`:
```typescript
colors: {
  navy: { DEFAULT: '#001E50', light: '#002266', dark: '#001040' },
  gold: { DEFAULT: '#C4933F', hover: '#B8842E', active: '#A6751A', subtle: 'rgba(196,147,63,0.12)' },
  'warm-white': '#F8F6F0',
  'chat-user': '#F0EDE6',
}
```

---

## Typography System — Complete Scale

All sizes use `clamp()` for display, fixed `rem` for body/UI.

| Token | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| `display-xl` | Cormorant Garamond | clamp(3rem, 5vw, 5rem) | 600 | 1.05 | -0.02em | Hero headlines |
| `display-lg` | Cormorant Garamond | clamp(2.25rem, 4vw, 3.75rem) | 600 | 1.1 | -0.015em | Page heroes |
| `display-md` | Cormorant Garamond | clamp(1.875rem, 3vw, 2.5rem) | 400 | 1.15 | -0.01em | Section titles |
| `display-sm` | Cormorant Garamond | clamp(1.5rem, 2.5vw, 2rem) | 400 | 1.2 | 0 | Card titles, product names |
| `body-lg` | Flexo | 1.125rem (18px) | 400 | 1.6 | 0 | Lead copy, descriptions |
| `body-md` | Flexo | 1rem (16px) | 400 | 1.5 | 0 | Standard copy |
| `body-sm` | Flexo | 0.875rem (14px) | 400 | 1.45 | 0 | Secondary text |
| `label-lg` | Flexo | 0.875rem (14px) | 500 | 1 | 0.01em | Navigation, button text |
| `label-md` | Flexo | 0.8125rem (13px) | 500 | 1 | 0.01em | Form labels, badge text |
| `label-sm` | Flexo | 0.75rem (12px) | 500 | 1 | 0.08em | Overlines, category labels (uppercase) |
| `mono-lg` | DM Mono | 1rem (16px) | 500 | 1.3 | 0 | CIF total values |
| `mono-md` | DM Mono | 0.875rem (14px) | 400 | 1.4 | 0 | Data rows, spec values |
| `mono-sm` | DM Mono | 0.75rem (12px) | 300 | 1.4 | 0 | Fine print, timestamps, pending fields |

**Critical:** Category overlines (MAQUINARIA AGRÍCOLA, etc.) use `label-sm` + uppercase + 0.08em tracking. This is the typographic fingerprint of the platform.

---

## Component Visual Direction

### HeroSection
- Full viewport height (100svh) on mobile, 90vh on desktop
- Background: navy `#001E50`
- Headline: `display-xl`, Cormorant Garamond 600, warm-white, centered
- Subheadline: `body-lg`, Flexo 400, `text-muted-inverse` (`#94A3B8`), centered, max-width 600px
- Tagline above headline: `label-sm` + uppercase + gold + letter-spacing widest — "WINGS GLOBAL TRADE" or "PRECISIÓN · PROXIMIDAD · CONFIANZA"
- Single CTA: Primary gold button, centered
- No decorative images in hero — use CSS gradient `radial-gradient(ellipse at 30% 50%, rgba(196,147,63,0.08) 0%, transparent 60%)` for subtle warmth

### CategoryGrid
- Background: warm-white `#F8F6F0`
- 3-column grid desktop, 2-column tablet, 1-column mobile (with final Accio tile spanning full width on mobile)
- Category tile: white card, `border: 1px solid #E5E7EB`, `border-radius: 4px`, `padding: 32px 24px`
- Icon: 40×40px, navy line icon (SVG)
- Title: `display-sm` Cormorant, navy
- Description: `body-sm` Flexo, `text-muted`
- Hover: `box-shadow: 0 8px 24px rgba(0,30,80,0.10)`, `translateY(-3px)`, gold top-border `border-top: 2px solid #C4933F`
- Accio tile: navy background, gold text, special treatment — larger, spans 2 columns on desktop

### ProductCard
- White card, `border-radius: 4px`, `border: 1px solid #E5E7EB`
- Image: `aspect-ratio: 4/3`, `object-fit: cover`
- Source market badge: `SourceBadge` — navy bg, warm-white DM Mono text, 2px border-radius
- Product name: `display-sm` Cormorant, navy, 2-line clamp
- Spec summary: 2–3 lines of `mono-sm`, `text-muted`
- CTA: Ghost variant, "Ver especificaciones →"
- Hover: card rises 3px, shadow deepens

### InquiryForm / AccioSubmitForm
- Background: white card on warm-white section
- Field spacing: 24px between fields
- Submit button: full-width Primary gold, `font-size: 15px`, `padding: 14px 24px`
- All error states: red border + red helper text below field in `body-sm`
- Success state: replace form with green checkmark + confirmation message

### AccioChat
- Left panel: `min-width: 0`, `flex: 1`, navy background
- Chat area: `overflow-y: auto`, `padding: 24px`
- AI bubble: white, left-aligned, max-width 80%, `border-radius: 4px 4px 4px 0`
- User bubble: `#F0EDE6`, right-aligned, `border-radius: 4px 4px 0 4px`, `border-left: 3px solid #C4933F`
- Input area: fixed bottom, white bg, `border-top: 1px solid rgba(248,246,240,0.12)`
- Right panel (TPR Sheet): `width: 384px`, warm-white bg, `border-left: 1px solid #E5E7EB`

### CIF Estimate Card
- Navy bg, `border-radius: 4px`, `padding: 24px`
- All values in DM Mono
- CIF total: `mono-lg` (16px), `font-weight: 500`, gold `#C4933F`
- Free zone highlight row: `background: rgba(196,147,63,0.12)`, gold text
- Separator: `border-top: 1px solid rgba(248,246,240,0.2)`
- Disclaimer: Flexo italic 12px, `text-muted-inverse`

### SiteNav
- Height: 64px desktop / 56px mobile
- Position: fixed, `z-50`
- Initial state: transparent
- Scrolled (>20px): `background: #001E50`, `backdrop-filter: blur(8px)`
- Transition: `background 0.2s ease`
- Logo: SVG wordmark, white
- Nav links: Flexo 400 14px, warm-white, active = 2px gold underline offset 4px
- WhatsApp CTA: `#25D366` initial → gold when nav turns navy

---

## Grid System

- Max content width: `max-w-7xl` (1280px), `mx-auto`, `px-4 sm:px-6 lg:px-8`
- Product grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, `gap-6`
- Category grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, `gap-4`
- Section vertical padding: `py-20 md:py-28` (80px → 112px)

---

## The ONE Distinctive Visual Decision

**Gold top-border reveal on hover for every card.**

When any category tile, product card, or feature card is hovered, a 2px gold line appears at the top edge (`border-top: 2px solid #C4933F`, transitioned from 0 opacity). This single micro-decision creates visual consistency across the platform and makes the gold accent feel earned rather than decorative. It signals "this element is alive and actionable" without any additional UI chrome.

Implement as: `transition: border-top-color 0.15s ease` with initial `border-top: 2px solid transparent`.

---

## Photography and Imagery

- Use real machinery photography: combine harvesters, trucks, industrial equipment in use
- Never stock-photo aesthetics. Documentary style. Location: actual Latin American contexts (fields, ports, warehouses)
- Overlay: `mix-blend-mode: luminosity` + navy color wash `rgba(0,30,80,0.4)` for hero uses
- No people in hero. Equipment is the hero.
- Alt text: descriptive, Spanish, specific model when known ("Cosechadora de arroz CH7 en campo arrocero, Piura, Perú")

---

## Iconography

- Style: 1.5px stroke, rounded caps, no fill, 24×24px viewbox
- Source: Lucide icons (already typical with shadcn) — use consistently
- Category icons: custom SVGs at 40×40px, 1.5px stroke, navy `#001E50`
- Never mix icon styles on the same screen
