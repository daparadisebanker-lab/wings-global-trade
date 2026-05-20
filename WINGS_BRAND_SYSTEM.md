# Wings Global Trade — Brand & Design System

> Single source of truth for all platform UI. Every new screen, component, or feature must be buildable from this document without referencing the landing page code.

---

## 1. Brand Voice

**Three words:** Precision. Proximity. Trust.

Wings is not a freight forwarder. It is a managed import desk — the expert partner that stands between a Latin American business and the complexity of Asian sourcing. Every UI decision should communicate: *we have done this before and we will handle it for you.*

**Tone rules:**
- Spanish-first. Never translate when the Spanish is clearer.
- Direct over warm. Say "48 h" not "¡En solo 2 días!".
- Specific over generic. "ZOFRI Iquique, Chile" not "nuestras instalaciones".
- No exclamation marks in interface copy. They signal insecurity.

---

## 2. Color System

### Palette

| Token | Hex | Usage |
|---|---|---|
| `navy` | `#001E50` | Primary brand. Dark section backgrounds. Navbar. Footer. |
| `navy-light` | `#0A2D6E` | Hover state for navy elements. |
| `gold` | `#C4933F` | CTAs. Accent lines. Icons. Active states. Eyebrow labels. |
| `gold-hover` | `#D4A855` | Hover state for gold elements. |
| `warm-white` | `#F8F6F0` | Page background. Light section backgrounds. Form field fills. |
| `charcoal` | `#1C1A16` | Primary body text. Headings on light backgrounds. |
| `mid-gray` | `#6B6560` | Secondary text. Descriptions. Metadata. |
| `warm-gray` | `#E8E4DB` | Borders. Dividers. Subtle separators. |
| `white` | `#FFFFFF` | Card backgrounds on light sections. |

### Semantic rules

```
Light section background  →  #F8F6F0
Dark section background   →  #001E50
Card on light bg          →  #FFFFFF  (shadow: 0 2px 20px rgba(0,0,0,0.07))
Card on dark bg           →  rgba(255,255,255,0.05)  border: rgba(255,255,255,0.10)
Primary text on light     →  #1C1A16
Secondary text on light   →  #6B6560
Primary text on dark      →  #FFFFFF
Secondary text on dark     →  rgba(255,255,255,0.65)
Muted text on dark        →  rgba(255,255,255,0.35)
```

### Never use
- Pure `#000000` black — always charcoal.
- Pure `#FFFFFF` as a page background — always warm white.
- Any color outside this palette without explicit reason.

---

## 3. Typography

### Font families

| Role | Family | Fallback | Usage |
|---|---|---|---|
| Display | Cormorant Garamond | Georgia, serif | All headings (H1–H3). Section titles. Large display numbers. |
| Body | Flexo | system-ui, sans-serif | All body text. Labels. Buttons. Form elements. Nav links. |

**Loading:**
- Cormorant Garamond: Google Fonts CDN — weights 500, 600, 700 + italic 600
- Flexo: Self-hosted in `/public/fonts/flexo/` — weights 300, 400, 400i, 500, 600, 700, 800

**CSS variables:**
```css
--font-display: 'Cormorant Garamond', Georgia, serif;
--font-body:    'Flexo', system-ui, sans-serif;
```

**In components:**
```jsx
style={{ fontFamily: "var(--font-display)" }}  /* headings */
style={{ fontFamily: "var(--font-body)" }}      /* everything else */
```

### Type scale

| Role | Size | Weight | Tracking | Line Height | Font |
|---|---|---|---|---|---|
| Hero H1 | 88px (lg) / 60px (md) / 48px | 600 | tight (−0.02em) | 1.05 | Display |
| Section H2 | 64px (lg) / 48px (md) / 36px | 600 | tight | 1.08 | Display |
| Card H3 | 28–32px | 600 | normal | 1.2 | Display |
| Small H3 | 20–24px | 600 | normal | 1.3 | Display |
| Body large | 20px | 400 | normal | relaxed (1.6) | Body |
| Body base | 16px | 400 | normal | relaxed | Body |
| Body small | 14px | 400 | normal | relaxed | Body |
| Label/eyebrow | 12–14px | 500 | 0.12em | normal | Body (uppercase) |
| Micro/meta | 10–11px | 500 | 0.12–0.18em | normal | Body (uppercase) |
| Monospace data | inherited | 400 | normal | normal | font-mono |

### Eyebrow pattern
Every section opens with a gold eyebrow label. It must communicate something the headline does NOT repeat.

```jsx
<p
  className="text-[#C4933F] text-sm font-medium tracking-[0.12em] uppercase mb-5"
  style={{ fontFamily: "var(--font-body)" }}
>
  Label that adds information, not repeats the heading
</p>
```

---

## 4. Spacing & Layout

### Container
```jsx
<div className="max-w-7xl mx-auto px-6">
```
Max content width: 1280px (`max-w-7xl`). Horizontal padding: 24px (`px-6`).

### Section padding
| Section type | Padding |
|---|---|
| Hero | `py-28 md:py-36` (plus `min-h-screen`) |
| Standard sections | `py-24 md:py-32` |
| Footer | `pt-16 pb-10` |

Sections alternate backgrounds: warm-white → navy → warm-white → navy.

### Grid patterns

| Use case | Classes |
|---|---|
| 2-column equal | `grid grid-cols-1 md:grid-cols-2 gap-5` |
| 3-column cards | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` |
| Form layout (trust + form) | `grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8` |
| 4-column stats | `grid grid-cols-2 sm:grid-cols-4 gap-8` |

### Card padding
| Card size | Padding |
|---|---|
| Large (hub cards, step cards) | `p-8` |
| Standard | `p-6` or `p-7` |
| Small (benefit items) | `p-5` |

---

## 5. Component Library

### Buttons

**Primary (gold — main CTA):**
```jsx
<button className="bg-[#C4933F] hover:bg-[#D4A855] text-white font-semibold px-8 py-3.5 rounded-full text-base transition-colors duration-200"
  style={{ fontFamily: "var(--font-body)" }}>
  Acción →
</button>
```

**Secondary (ghost on dark background):**
```jsx
<button className="bg-white/8 hover:bg-white/12 border border-white/15 text-white font-medium px-8 py-3.5 rounded-full text-base transition-colors duration-200"
  style={{ fontFamily: "var(--font-body)" }}>
  Acción secundaria
</button>
```

**Outline (gold border — used in success states):**
```jsx
<button className="border-2 border-[#C4933F] hover:bg-[#C4933F]/5 text-[#C4933F] font-semibold px-8 py-3.5 rounded-full text-sm transition-colors duration-200"
  style={{ fontFamily: "var(--font-body)" }}>
  Acción terciaria
</button>
```

**Destructive / danger:** Same shape as primary, background `#DC2626`.

### Cards

**Card on light background:**
```jsx
<div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.07)] p-8">
```

**Card on light background (smaller shadow):**
```jsx
<div className="bg-white rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5">
```

**Card on dark background:**
```jsx
<div className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-2xl p-7 transition-colors duration-200">
```

**Card with top accent bar (feature/hub cards):**
```jsx
<div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.07)] overflow-hidden">
  <div className="h-1 bg-[#C4933F]" />
  <div className="p-8">...</div>
</div>
```

### Icon containers

```jsx
/* Large — section cards */
<div className="w-11 h-11 rounded-xl bg-[#C4933F]/15 flex items-center justify-center text-[#C4933F]">
  <Icon width={22} height={22} />
</div>

/* Medium — trust column */
<div className="w-9 h-9 rounded-xl bg-[#C4933F]/10 flex items-center justify-center text-[#C4933F]">
  <Icon width={17} height={17} />
</div>

/* Small — step cards */
<div className="w-10 h-10 rounded-xl bg-[#C4933F]/10 flex items-center justify-center text-[#C4933F]">
  <Icon width={18} height={18} />
</div>
```

**Icon style:** HeroIcons outline. `strokeWidth={1.5}`. Never filled icons in the main UI.

### Form fields

**Text input:**
```jsx
<input
  className="w-full bg-[#F8F6F0] border border-[#E8E4DB] rounded-xl px-4 py-3 text-sm text-[#1C1A16] placeholder-[#6B6560]/50 focus:outline-none focus:border-[#C4933F] focus:ring-2 focus:ring-[#C4933F]/10 transition-all duration-200"
  style={{ fontFamily: "var(--font-body)" }}
/>
```

**Select:**
Same classes as input + `appearance-none`.

**Field label:**
```jsx
<label className="block text-[#1C1A16] text-xs font-semibold tracking-[0.08em] uppercase mb-2"
  style={{ fontFamily: "var(--font-body)" }}>
  Label
</label>
```

**Validation error:**
```jsx
<p className="text-red-500 text-sm" style={{ fontFamily: "var(--font-body)" }}>
  Mensaje de error
</p>
```

### Badges & pills

**Gold accent pill (market tags, status):**
```jsx
<span className="text-xs bg-[#C4933F]/10 text-[#C4933F] font-medium px-3 py-1.5 rounded-full"
  style={{ fontFamily: "var(--font-body)" }}>
  Colombia
</span>
```

**Navy pill (on dark, for labels):**
```jsx
<span className="bg-[#C4933F]/15 text-[#C4933F] text-xs font-semibold tracking-[0.12em] uppercase rounded-full px-3 py-1.5"
  style={{ fontFamily: "var(--font-body)" }}>
  Estado
</span>
```

**Eyebrow pill (hero):**
```jsx
<div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5">
  <div className="w-1.5 h-1.5 rounded-full bg-[#C4933F]" />
  <p className="text-white/70 text-xs font-medium tracking-[0.12em] uppercase"
    style={{ fontFamily: "var(--font-body)" }}>
    Label
  </p>
</div>
```

### Dividers & accents
```jsx
/* Subtle horizontal rule */
<div className="border-t border-[#F0EDE6]" />

/* On dark background */
<div className="border-t border-white/8" />

/* Gold top accent on card */
<div className="h-1 bg-[#C4933F]" />

/* Bullet point (list items) */
<div className="w-1 h-1 rounded-full bg-[#C4933F] flex-shrink-0" />
```

### Navbar
- Fixed. `bg-[#001E50]/70 backdrop-blur-2xl`. Height `h-14` (56px).
- Logo: `wings-logo2.svg` at `h-9 w-auto brightness-0 invert`.
- Nav links: `text-white/65 hover:text-white text-sm font-medium`.
- CTA: Primary gold button, `rounded-full`, compact `px-5 py-2`.

### Footer
- Background: `bg-[#001E50]`. Padding: `pt-16 pb-10`.
- Logo: `wings-logo1.svg` at `h-16 w-auto brightness-0 invert`.
- Link color: `text-white/50 hover:text-white`.
- Section labels: `text-white/30 text-xs tracking-[0.18em] uppercase`.

---

## 6. Logos

| File | Variant | Background | Treatment |
|---|---|---|---|
| `wings-logo2.svg` | Horizontal (mark + wordmark) | Dark (navy, black) | `brightness-0 invert` → white |
| `wings-logo1.svg` | Stacked (mark above wordmark) | Dark (navy, black) | `brightness-0 invert` → white |
| `wings-logo2-v2.svg` | Horizontal | Light (warm white, white) | No filter — shows navy |
| `wings-logo1-v2.svg` | Stacked | Favicon only | No filter |

**Sizes in context:**
- Navbar: `h-9 w-auto` (horizontal logo2)
- Footer: `h-16 w-auto` (stacked logo1)
- Trust column / in-page: `h-10 w-auto` (horizontal logo2-v2)

**Never** place a logo on a colored background (gold, gray). Navy or white only.
**Never** stretch, recolor, or apply opacity to a logo.

---

## 7. Motion System

### Scroll fade-in (section headers)
```css
.fade-up {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```
Triggered by IntersectionObserver at `threshold: 0.08`.
Apply to: section header wrappers (eyebrow + h2 + subtext as a unit).

### Staggered card reveal
```css
.stagger-item {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.stagger-item.visible {
  opacity: 1;
  transform: translateY(0);
}
```
Delay per card: 90–120ms. Observer fires on parent grid container.
Apply to: individual cards inside any grid.

### Hover transitions
All interactive elements use `transition-colors duration-200`.
Cards with background hover use `transition-colors duration-200`.
No `transform` on hover (no scale, no lift) — restraint is the signal.

### Pattern per section
```
1. Section enters viewport
2. Header div (eyebrow + h2 + subtext) → .fade-up fires
3. ~100ms later (via stagger hook): cards[0] → cards[n] each add .visible
```

---

## 8. Photography

### Style
- Aerial or wide-angle editorial. No lifestyle. No people unless operational context.
- Golden hour preferred: warm amber light against deep shadows.
- Subject matter: container ports, warehouses, cargo, shipping infrastructure.
- Color mood: warm amber + deep navy. Avoid cool-toned or gray images.

### Hero treatment
```jsx
<img src="/hero-bg.png" className="w-full h-full object-cover object-center" />
<div className="absolute inset-0 bg-[#001E50]/58" />
<div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_60%_30%,rgba(196,147,63,0.10),transparent)]" />
```
Overlay: navy at 55–60% opacity. Never above 65% (hides photo) or below 50% (compromises text contrast).

### In-section images
```jsx
<div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden">
  <img src="/image.png" className="w-full h-full object-cover object-center" />
  <div className="absolute inset-0 bg-gradient-to-r from-[#001E50]/60 via-transparent to-[#001E50]/30" />
  {/* Optional caption overlay */}
  <div className="absolute bottom-6 left-8">
    <p className="text-white/50 text-xs font-medium tracking-[0.18em] uppercase">
      Location label
    </p>
  </div>
</div>
```

---

## 9. Section Architecture

Every section follows this structure. Vary the content pattern — never vary the shell.

```jsx
<section id="anchor" className="bg-[#F8F6F0] py-24 md:py-32">   {/* or bg-[#001E50] */}
  <div className="max-w-7xl mx-auto px-6">

    {/* 1. Header — always fade-up as a unit */}
    <div ref={headerRef} className="fade-up text-center mb-16">
      <p className="text-[#C4933F] text-sm font-medium tracking-[0.12em] uppercase mb-5"
        style={{ fontFamily: "var(--font-body)" }}>
        Eyebrow that adds information the heading does not repeat
      </p>
      <h2 className="text-[#1C1A16] text-4xl md:text-5xl lg:text-[64px] font-semibold tracking-tight max-w-3xl mx-auto leading-[1.08]"
        style={{ fontFamily: "var(--font-display)" }}>
        Heading with a period. Always.
      </h2>
      <p className="text-[#6B6560] text-lg mt-5 max-w-xl mx-auto leading-relaxed"
        style={{ fontFamily: "var(--font-body)" }}>
        Supporting subtext. One or two sentences maximum.
      </p>
    </div>

    {/* 2. Content — stagger-item on each card */}
    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map(item => (
        <div key={item.id} className="stagger-item bg-white rounded-2xl ...">
          ...
        </div>
      ))}
    </div>

  </div>
</section>
```

### Background alternation rule
```
Hero           → navy   (#001E50)
HowItWorks     → warm white
FreeZone       → warm white
Categories     → navy
LeadForm       → warm white
Footer         → navy
```
For new platform sections: maintain the alternating rhythm.

---

## 10. Application to Platform Screens

When building new screens (dashboard, shipment tracker, supplier directory, etc.), apply these rules:

| Element | Rule |
|---|---|
| **App background** | `#F8F6F0` warm white (not white) |
| **Sidebar/nav** | `#001E50` navy with white text |
| **Active nav item** | Gold left border + white text |
| **Data tables** | White background, warm-gray dividers, Flexo text, mono for numbers |
| **Status badges** | Same pill pattern — gold for active, gray for inactive, red for error |
| **Modals/sheets** | White bg, `rounded-2xl`, `shadow-[0_8px_40px_rgba(0,0,0,0.12)]` |
| **Empty states** | Centered icon (gold, low opacity), Cormorant heading, Flexo subtext |
| **Loading states** | Skeleton shimmer in `#E8E4DB` on `#F8F6F0` |
| **Success states** | Gold checkmark icon, Cormorant heading, Flexo subtext + CTAs |
| **Form pages** | White card on warm-white background, same field styles as landing |
| **Charts/graphs** | Navy + gold as primary data colors, mid-gray for secondary |

---

## 11. Design Principles (applied, not theoretical)

1. **Restraint over decoration.** If an element doesn't carry information, remove it.
2. **Specific over generic.** "ZOFRI Iquique" beats "our facilities" every time.
3. **Serif for impact, sans for function.** Cormorant for headings. Flexo for everything you interact with.
4. **Gold is a signal, not a color.** It means: action, accent, active. Use it sparingly so it retains meaning.
5. **Sections breathe.** `py-24 md:py-32` is the minimum. Never compress a section to save space.
6. **Motion reveals, it does not decorate.** Stagger shows hierarchy. Fade-up shows arrival. Nothing bounces.
7. **Text contrast is non-negotiable.** White text on navy ≥ 4.5:1. Charcoal on warm-white ≥ 7:1.
8. **Headings end with a period.** It's a stylistic choice that signals confidence and finality.
9. **No exclamation marks.** Anywhere. Ever.
10. **One primary CTA per view.** Gold button is the only primary. Everything else is secondary.
