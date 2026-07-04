# Euro Global — Platform Application Plan
*Brand system → full platform. Wings UI/UX → every screen.*

---

## Corrected Platform Identity

**The product catalog reveals the real business model.** The current homepage describes a "European B2B machinery marketplace with 28 countries." The actual catalog is 86 new tractors — YTO, SinoHarvest (Chinese), John Deere 5E/6B/3B series (China-manufactured), Massey Ferguson (China), and Kubota (Asia). Zero European used machinery. Zero prices. Zero images.

This platform is a **B2B managed sourcing service for Latin American agricultural buyers** — helping companies in Colombia, Peru, Bolivia, Chile, Paraguay, Argentina, and Uruguay source new tractors from China and Asia with full landed-cost transparency, customs handling, and free-zone warehousing. The Wings Global Trade service is the delivery mechanism. The B2B AI Sourcing Platform is the concierge layer.

The "European marketplace" copy, brown/cream palette, and European country flags are all being replaced.

---

## The Three-Product Reality (Corrected)

| Product | Route | Audience | Status |
|---|---|---|---|
| **Euro Global — Machinery Catalog** | `/` (main app) | Latin American B2B buyers of Asian tractors | Built — needs full repositioning + rebrand |
| **Wings Global Trade** | `/importacion` (to add) | Same buyers — importation service landing | Landing page done |
| **B2B AI Sourcing Concierge** | `/sourcing` (new build) | Same buyers — AI-assisted product matching + quote | Architecture only |

The Wings visual language (navy + gold + Cormorant Garamond + Flexo) is the parent brand system. It applies to all three products. The brown/cream/Inter/Playfair stack is replaced entirely.

---

## Phase 0 — Design System Foundation
*Everything downstream depends on these files being correct first.*

### 0.1 Tailwind Config Migration (v3 → v4)

Delete `tailwind.config.ts` and `postcss.config.js`. Migrate to Tailwind v4's CSS-native config.

**Current `tailwind.config.ts` (delete):**
```ts
// brown/cream palette, Inter/Playfair fonts — all replaced
```

**New `src/app/globals.css` (full replacement):**
```css
/* Fonts first — before Tailwind inlines its rules */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&display=swap');
@import "tailwindcss";

/* Self-hosted Flexo */
@font-face { font-family:'Flexo'; src:url('/fonts/flexo/Flexo-Light.ttf') format('truetype'); font-weight:300; font-display:swap; }
@font-face { font-family:'Flexo'; src:url('/fonts/flexo/Flexo-Regular.ttf') format('truetype'); font-weight:400; font-display:swap; }
@font-face { font-family:'Flexo'; src:url('/fonts/flexo/Flexo-Medium.ttf') format('truetype'); font-weight:500; font-display:swap; }
@font-face { font-family:'Flexo'; src:url('/fonts/flexo/Flexo-Demi.ttf') format('truetype'); font-weight:600; font-display:swap; }
@font-face { font-family:'Flexo'; src:url('/fonts/flexo/Flexo-Bold.ttf') format('truetype'); font-weight:700; font-display:swap; }

@theme {
  /* Core palette */
  --color-navy:        #001E50;
  --color-navy-light:  #0A2D6E;
  --color-navy-deep:   #001240;
  --color-gold:        #C4933F;
  --color-gold-hover:  #D4A855;
  --color-gold-light:  #F0E4CC;
  --color-warm-white:  #F8F6F0;
  --color-warm-gray:   #E8E4DB;
  --color-mid-gray:    #6B6560;
  --color-charcoal:    #1C1A16;
  --color-white:       #FFFFFF;

  /* Typography */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'Flexo', system-ui, sans-serif;
}

html { scroll-behavior: smooth; }

body {
  background-color: #F8F6F0;
  color: #1C1A16;
  font-family: 'Flexo', system-ui, sans-serif;
}

/* Scroll animations */
.fade-up {
  opacity: 0; transform: translateY(28px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
.fade-up.visible { opacity: 1; transform: translateY(0); }

.stagger-item {
  opacity: 0; transform: translateY(22px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.stagger-item.visible { opacity: 1; transform: translateY(0); }
```

Copy the `fonts/` folder from `wings-global-trade/public/fonts/` into `public/fonts/`.

### 0.2 Copy Animation Hook

Copy `wings-global-trade/hooks/useFadeIn.ts` → `src/hooks/useFadeIn.ts` (identical file, different path).

### 0.3 Token Reference Map

Every time you see a legacy class, replace it:

| Legacy | Replacement | Notes |
|---|---|---|
| `bg-brown-900` | `bg-[#001E50]` (navy) | Dark backgrounds |
| `bg-brown-800` | `bg-[#001E50]` or `bg-[#1C1A16]` | Context-dependent |
| `bg-cream-50` | `bg-[#F8F6F0]` | Page background |
| `bg-white` | `bg-white` | Cards, forms |
| `text-brown-900` | `text-[#1C1A16]` | Body text |
| `text-brown-500` | `text-[#6B6560]` | Secondary text |
| `text-brown-300` | `text-white/60` | On dark bg |
| `text-cream-50` | `text-white` | On dark bg |
| `border-brown-200` | `border-[#E8E4DB]` | Card borders |
| `font-serif` | `style={{ fontFamily: "var(--font-display)" }}` | Display headings |
| `font-sans` | `style={{ fontFamily: "var(--font-body)" }}` | Body / UI |
| `btn-primary` | Gold rounded-full button (see component library) | |
| `btn-secondary` | White outlined rounded-full button | |
| `section-label` | Gold uppercase eyebrow (see component library) | |

---

## Phase 1 — Layout Shell
*Header and Footer touch every page. Finish these before any other screen.*

### 1.1 Header (`src/components/layout/Header.tsx`)

**What changes:**
- Background: `bg-white border-b border-[#E8E4DB]` → `bg-[#001E50]`
- Top bar: Remove entirely (the "topBar" i18n strip). The navy header itself is the premium signal.
- Logo: Replace text lockup with `<img src="/wings-logo2-v2.svg">` (h-8, white version — use CSS filter or a white SVG variant)
- Nav links: `text-white/70 hover:text-white` (Flexo, text-sm, tracking-wide)
- Right CTAs:
  - Language/Currency switchers: Keep, restyle to `text-white/60 hover:text-white`
  - Sign In: `border border-white/20 text-white rounded-full px-5 py-2 text-sm hover:bg-white/8`
  - Post Listing: `bg-[#C4933F] hover:bg-[#D4A855] text-white rounded-full px-5 py-2 text-sm`
- Sticky behavior: Add `backdrop-blur-md bg-[#001E50]/95` when scrolled (use IntersectionObserver on a sentinel div)
- Add "Importación" nav link → `/importacion`

**Logo note:** Create `public/wings-logo2-white.svg` — same SVG as `wings-logo2-v2.svg` but all fills replaced with `#FFFFFF`. Or use CSS: `filter: brightness(0) invert(1)` on the existing dark logo.

### 1.2 Footer (`src/components/layout/Footer.tsx`)

**What changes:**
- Background: stays `bg-[#001E50]` (already dark)
- Brand block: Replace text lockup with `<img src="/wings-logo2-v2.svg">` (h-8, white filter)
- Tagline: `text-white/40 text-sm` — keep existing copy
- Link headings: `text-[#C4933F] text-[10px] font-semibold tracking-[0.15em] uppercase`
- Links: `text-white/50 hover:text-white text-sm`
- Country flags strip: Replace `DE FR PL UK NL IT` text → actual market countries: `CO PE BO CL PY AR UY` OR keep both sets in a "Markets" section
- Bottom bar: `border-t border-white/8` with `text-white/25` text
- Add Wings Global Trade and Managed Sourcing as footer link groups

### 1.3 Mobile Menu (`src/components/layout/MobileMenu.tsx`)

- Background: `bg-[#001E50]`
- Links: same white/70 → white treatment
- Hamburger icon: white strokes

### 1.4 Category Mega Menu (`src/components/layout/CategoryMegaMenu.tsx`)

- Dropdown panel: `bg-[#001E50] border border-white/10 shadow-2xl`
- Category groups: gold eyebrow labels, white item labels
- Active state: `text-[#C4933F]`

---

## Phase 2 — Homepage (`src/app/page.tsx`)

The homepage is the highest-traffic page. Every section needs to earn its place.

### 2.1 Hero

**Current:** Cream overlay on landscape photo, brown text, square search bar.

**New:**
```
Background: full-bleed aerial machinery/port photo
Overlay: bg-[#001E50]/55 + gold radial accent at 60% 30%
Bottom fade: from-[#F8F6F0] via transparent (transition to page bg)

Eyebrow pill: bg-white/8 border border-white/10 rounded-full
  → "Agricultural · Trucks · Buses · Industrial · Spare Parts"

H1 (Cormorant Garamond, 88px lg, semibold, tracking-tight):
  "Europe's Leading B2B Machinery Marketplace."

Sub (Flexo 300, text-white/60, italic):
  "52,000+ verified listings from 3,800 dealers across 28 countries."

Search bar:
  bg-white/8 backdrop-blur border border-white/15 rounded-2xl
  Inputs: text-white, placeholders white/40
  Button: bg-[#C4933F] hover:bg-[#D4A855] text-white rounded-xl

Popular searches: gold underline links

Trust strip (below search, 4 cols):
  Each: bg-white/6 rounded-xl p-5 text-left
  Title: Cormorant 18px white
  Body: Flexo text-white/50 text-xs
```

### 2.2 Featured Listings

**Current:** Dark photo bg at 85%, brown overlay.
**New:** `bg-[#1C1A16]` solid — cleaner. Or keep the photo at 85% overlay — fine. Gold eyebrow, Cormorant h2.

### 2.3 Stats Bar

**Current:** `bg-brown-900` with brown-700 left border accents.
**New:** `bg-[#001E50]` with `border-l-2 border-[#C4933F]` accents. Numbers in Cormorant gold.

### 2.4 Machinery Types Grid

**Current:** 6-col photo grid with brown-900/60 overlay.
**New:** Same structure. Update overlay to `bg-[#001E50]/55`. Labels in Cormorant. Hover darkens to `bg-[#001E50]/75`. Gold "Browse →" text on hover.

### 2.5 Testimonials

**Current:** `bg-white border border-brown-200`.
**New:** `bg-white border border-[#E8E4DB]`. Name in Cormorant, location in gold uppercase Flexo, quote in Flexo 300 italic `text-[#6B6560]`.

### 2.6 Brands Section

**Current:** Grid of brand names on `bg-cream-100`.
**New:** `bg-[#F8F6F0]` background. Cells `bg-white border border-[#E8E4DB]`. On hover: `bg-[#001E50]` with white text. Brand names in Cormorant.

### 2.7 Numbered Benefits

**Current:** `bg-white` with large grey numbers, brown text.
**New:** Same layout. Numbers in Cormorant `text-[#C4933F]/20` (gold ghost). Section labels gold uppercase Flexo. Body text `text-[#6B6560]`.

### 2.8 Seller CTA

**Current:** Photo bg at 85%, brown overlay.
**New:** `bg-[#001E50]` with the same gold radial gradient accent from Hero. H2 in Cormorant white. CTA: gold primary + white/15 outlined secondary, both rounded-full.

---

## Phase 3 — Listing Infrastructure

### 3.1 Listing Card (`src/components/listings/TractorCard.tsx`)

**Replace:**
- `className="card group flex flex-col overflow-hidden bg-white"` → add `rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)]`
- Remove `rounded-none` from all buttons and conditions badges (use `rounded-full` for badges, `rounded-full` for CTA button)
- Condition badge: `absolute left-0 top-4 px-3 py-1` → `absolute left-3 top-3 px-3 py-1 rounded-full text-[10px] font-semibold`
  - `new`: `bg-[#001E50] text-white`
  - `used`: `bg-[#C4933F] text-white`
  - `refurbished`: `bg-[#E8E4DB] text-[#1C1A16]`
- Brand label: gold `text-[#C4933F]` uppercase Flexo
- Model h3: Cormorant `text-[#1C1A16] text-xl font-semibold`
- Price: `text-[#001E50] text-xl font-bold` (Flexo)
- Spec grid: `border-t border-[#E8E4DB]`, labels `text-[#6B6560]`, values `text-[#1C1A16] font-medium`
- CTA button: `bg-[#C4933F] hover:bg-[#D4A855] text-white rounded-full w-full py-3 text-sm font-semibold` (remove btn-primary class)

### 3.2 Category Hub Page (`src/components/listings/CategoryHubPage.tsx`)

**Page header:**
- `bg-white border-b border-[#E8E4DB]` → `bg-[#001E50] py-16`
- Eyebrow in gold, H1 in Cormorant white, description in `text-white/60`

**Active subtype cards:**
- Icon variant: `border border-[#E8E4DB] hover:border-[#C4933F] hover:shadow-[0_4px_24px_rgba(196,147,63,0.12)]` rounded-2xl
- Photo variant: overlay `bg-[#001E50]/55 hover:bg-[#001E50]/70`
- Label in Cormorant, count in gold Flexo

**Trust strip:** `bg-[#F8F6F0] rounded-2xl border border-[#E8E4DB]` with gold dividers.

### 3.3 Filter Panel (`src/components/listings/FilterPanel.tsx`)

- Background: `bg-white border border-[#E8E4DB] rounded-2xl`
- Filter labels: gold uppercase Flexo
- Inputs/selects: `border-[#E8E4DB] rounded-xl focus:border-[#C4933F] focus:ring-[#C4933F]/10`
- Apply button: gold rounded-full

### 3.4 Horizontal Subtype Switcher (`src/components/listings/HorizontalSubtypeSwitcher.tsx`)

- Tab track: `bg-[#F8F6F0] rounded-full p-1`
- Active tab: `bg-[#001E50] text-white rounded-full`
- Inactive: `text-[#6B6560] hover:text-[#1C1A16]`

### 3.5 Featured Carousel (`src/components/listings/FeaturedCarousel.tsx`)

- Nav arrows: `bg-[#C4933F] text-white rounded-full w-10 h-10`
- Dots: active `bg-[#C4933F]`, inactive `bg-white/30`

---

## Phase 4 — Static Pages

All static pages share the same layout pattern:

```
Page header: bg-[#001E50], gold eyebrow, Cormorant H1 white, subtext white/60
Body: bg-[#F8F6F0], max-w-7xl mx-auto px-6
Cards/sections: bg-white rounded-2xl shadow-sm border border-[#E8E4DB]
```

### 4.1 About (`src/app/about/page.tsx`)

Sections: Story, Mission, Team, Values. Each uses the fade-up + stagger pattern from Wings. No changes to copy — only visual language.

### 4.2 Contact (`src/app/contact/page.tsx`)

Reuse the `LeadForm` pattern from Wings Global Trade. 3-field form (Name, Company, Contact). Trust column left, form right. Gold CTA button.

### 4.3 Careers + Press (`src/app/careers/`, `/press/`)

Standard page header + content cards. No structural changes needed, only color/font rebrand.

### 4.4 Sign-In (`src/app/sign-in/page.tsx`)

```
Full-page: left half bg-[#001E50] with logo + tagline + gold bullet points
Right half: bg-white rounded-2xl p-10 with form
Form: email + password + "Forgot password" link in gold
Button: gold rounded-full "Sign in"
Below: "Don't have an account?" → /sellers/dealer-accounts
```

### 4.5 Seller Pages (`src/app/sellers/`)

**Post Listing:** Multi-step form. Progress indicator uses gold dots. Each step in a `bg-white rounded-2xl p-8` card.

**Dealer Accounts:** Feature comparison table. Headers in Cormorant. Gold checkmarks for premium tier. CTA row: gold button.

**Pricing:** Pricing cards. Free tier: `border border-[#E8E4DB]`. Pro tier: `bg-[#001E50] border-[#001E50]` with gold badge. Feature list: `text-[#6B6560]` with gold checkmarks.

**Resources:** Article cards. Tags in gold pills. Read more arrows in gold.

### 4.6 Admin (`src/app/admin/`)

**Layout (`src/app/admin/layout.tsx`):**
```
Sidebar: bg-[#1C1A16] w-64 min-h-screen
Logo at top: wings-logo2-v2.svg white
Nav items: text-white/60 hover:text-white hover:bg-white/5 rounded-lg px-4 py-2.5
Active item: bg-[#C4933F]/15 text-[#C4933F]
Top bar: bg-white border-b border-[#E8E4DB] h-16
```

**Admin Dashboard:** Stats cards `bg-white rounded-2xl shadow-sm`. Metrics in Cormorant gold. Tables with `text-[#6B6560]` rows, hover `bg-[#F8F6F0]`.

---

## Phase 5 — Wings Global Trade Integration

### 5.1 Route

Create `src/app/importacion/page.tsx` that renders the Wings landing page as a route within the platform.

Strategy options (pick one):
- **Embedded:** Import all Wings components (`Hero`, `HowItWorks`, `FreeZone`, `Categories`, `LeadForm`) into a single page. Requires copying components from `wings-global-trade/components/` into `src/components/wings/`.
- **Iframe:** Simpler short-term — `<iframe src="http://localhost:3001" className="w-full min-h-screen border-0" />`. Not recommended for production.

**Recommended: Embedded approach.**

```
src/components/wings/
  WingsHero.tsx
  WingsHowItWorks.tsx  
  WingsFreeZone.tsx
  WingsCategories.tsx
  WingsLeadForm.tsx
```

These are copies of the Wings landing page components, adjusted to not require their own `globals.css` (since the parent platform now shares the same font/color system).

### 5.2 Navigation Link

In `Header.tsx`, add after the "Industrial" nav entry:
```tsx
<Link href="/importacion"
  className="text-sm font-medium tracking-wide text-[#C4933F] hover:text-[#D4A855] border-b border-[#C4933F]/40">
  Importación Asia
</Link>
```

Gold text to visually signal "this is a premium service" distinct from the machinery browsing links.

### 5.3 Homepage Crosslink

Add a section before the Seller CTA on the homepage:

```
bg-[#001E50] py-20
Eyebrow: "Importación desde Asia"
H2 (Cormorant, white): "¿Tu empresa en Latinoamérica? Importa con precio final."
Body (Flexo 300, white/60): Wings value proposition in 2 sentences.
CTA: gold rounded-full → /importacion
Secondary: white/8 outlined → #contacto within Wings form
```

---

## Phase 6 — B2B Managed Sourcing Platform (New Build)

This is the highest-value product. Build it as a separate sub-application under `/sourcing`.

### 6.1 Route Structure

```
src/app/sourcing/
  layout.tsx           — dedicated layout (no main Header/Footer — full-screen app)
  page.tsx             — marketing/landing for the sourcing service
  dashboard/
    page.tsx           — project list view (authenticated)
  project/
    [id]/
      page.tsx         — project detail + AI chat
      proposal/
        page.tsx       — supplier shortlist view
      quote/
        page.tsx       — landed cost breakdown
  onboarding/
    page.tsx           — company profile setup
```

### 6.2 Sourcing Layout (`src/app/sourcing/layout.tsx`)

Full-screen app layout — no platform header/footer:

```
bg-[#F8F6F0] min-h-screen
Left sidebar (64px collapsed, 240px expanded): bg-[#001E50]
  Logo: Wings mark only (wings-logo1.svg h-8)
  Nav icons: Projects, Chat, Suppliers, Documents, Settings
  Active: gold icon + gold left border
Top bar: bg-white border-b border-[#E8E4DB] h-14
  Project name (Cormorant)
  Milestone stepper (see 6.4)
  User avatar + notifications
```

### 6.3 Project Dashboard (`/sourcing/dashboard`)

```
Page title: "Mis Proyectos" (Cormorant, 48px, #1C1A16)
New project CTA: gold pill button top right

Project cards (3-col grid, bg-white rounded-2xl shadow-sm):
  Status chip: 
    "Inducción" → bg-[#C4933F]/10 text-[#C4933F]
    "Sourcing"  → bg-[#001E50]/10 text-[#001E50]
    "En revisión" → bg-amber-100 text-amber-700
    "Entregado"   → bg-emerald-100 text-emerald-700
  Product name: Cormorant 22px
  Supplier count: "3 opciones" in mid-gray Flexo
  Last updated: text-[#6B6560] text-xs
  "Ver proyecto →" gold link
```

### 6.4 Milestone Stepper Component

Appears in every project — horizontal timeline:

```
[Inducción] → [Sourcing] → [Propuesta] → [Asesor WhatsApp] → [Producción] → [Embarque] → [Aduana] → [Entregado]

Active step: gold filled circle, gold text
Completed: navy filled circle, checkmark, white/60 text
Pending: white circle border-[#E8E4DB], text-[#6B6560]
Connector lines: completed → bg-[#C4933F], pending → bg-[#E8E4DB]
```

### 6.5 AI Induction Screen (`/sourcing/project/[id]`)

The flagship screen. Split-screen:

```
LEFT PANEL (40%): bg-white border-r border-[#E8E4DB]
  Chat area:
    AI messages: bg-[#F8F6F0] rounded-2xl rounded-tl-sm px-5 py-4 text-[#1C1A16]
    User messages: bg-[#001E50] text-white rounded-2xl rounded-tr-sm px-5 py-4
    AI avatar: wings mark in gold circle, w-8 h-8
    Timestamp: text-[#6B6560] text-[10px]

  Dynamic input zone (switches based on AI instruction type):
    text_input → Field component (same as Wings LeadForm)
    multi_select → Gold checkbox pills
    file_upload → Dashed border drag-zone bg-[#F8F6F0] rounded-2xl
    select → Styled dropdown

  Send button: gold rounded-full

RIGHT PANEL (60%): bg-[#F8F6F0]
  "Ficha Técnica del Proyecto" header (Cormorant 28px, navy)
  Live-updating spec canvas:
    Each completed field: bg-white rounded-xl px-5 py-3 shadow-sm
    Label: gold uppercase Flexo 10px
    Value: Cormorant 18px #1C1A16
    Empty field: dashed border-[#E8E4DB] placeholder text-[#6B6560]/40
  Completion progress bar: gold fill, navy track bg
  "Completado X/Y campos" in mid-gray
```

### 6.6 Supplier Shortlist (`/sourcing/project/[id]/proposal`)

```
Page header: "Opciones Preseleccionadas" (Cormorant 40px)
Supplier count: "3 proveedores seleccionados de X analizados"

Supplier cards (full width, stacked):
  Left: Supplier badge "SUPP-CN-SZ-99" in monospace gold pill
  Score: circular progress ring (gold fill, 4.9/5.0)
  Metrics row: Years, Response rate, Capacity, Audit status
    Each metric: gold icon + value in Cormorant + label in Flexo gray
  Specs table: clean 2-col grid border-[#E8E4DB]
  Pricing tier table: MOQ / Unit price / Landed cost
    Landed cost column: highlighted bg-[#C4933F]/8 text-[#C4933F] font-bold
  "Seleccionar esta opción" → gold button
  "Ver más detalles" → navy text link

Bottom CTA strip (sticky):
  "¿Listo para cotizar?" bg-[#001E50] rounded-2xl p-6
  WhatsApp button: green (#25D366) rounded-full
  Calendly button: navy outlined rounded-full
```

### 6.7 Landed Cost Breakdown (`/sourcing/project/[id]/quote`)

```
Two-column layout:
  LEFT: Interactive calculator
    Inputs: Quantity, Shipping method (Sea/Air/Express), Destination
    All inputs: Wings LeadForm style (bg-[#F8F6F0] border-[#E8E4DB] rounded-xl)
    Recalculate button: gold

  RIGHT: Cost breakdown card bg-white rounded-2xl shadow-md
    "Costo Total Landed" header (Cormorant 28px navy)
    Line items:
      Precio de fábrica (× qty): text-[#1C1A16] 
      Flete marítimo estimado: text-[#6B6560]
      Aranceles e impuestos: text-[#6B6560]
      Fee del servicio: text-[#6B6560]
      Divider
      TOTAL por unidad: Cormorant 40px gold font-bold
      TOTAL del pedido: Cormorant 52px navy font-bold
    
    Note: "Precio final confirmado por tu asesor" — Flexo 300 italic gray
    
    Handoff CTA:
      "Solicitar Cotización Final" → gold rounded-full (full width)
      Below: WhatsApp deep link → opens Consultant Brief template
```

### 6.8 WhatsApp Handoff Trigger

When user clicks "Solicitar Cotización Final":

1. System generates Project Brief JSON
2. Displays success modal:
   ```
   bg-[#001E50] rounded-2xl p-8 max-w-lg mx-auto
   Gold checkmark circle (same as Wings LeadForm SuccessState)
   "Tu proyecto está listo para revisión experta"
   Two buttons:
     WhatsApp: green pill → pre-filled message with project brief link
     Calendly: navy outlined pill → 30-min call booking
   ```

---

## Phase 7 — Database & Backend

### 7.1 Supabase Tables (new migrations)

```sql
-- Sourcing projects
CREATE TABLE sourcing_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'induction', -- induction | sourcing | proposal | handoff | production | shipping | customs | delivered
  project_brief JSONB,             -- Induction schema from Accio_Functionality doc
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages per project
CREATE TABLE project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES sourcing_projects(id),
  role TEXT, -- 'ai' | 'user'
  content TEXT,
  metadata JSONB,  -- instruction_type, field updates, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- White-labeled supplier listings
CREATE TABLE platform_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_sku TEXT UNIQUE,
  internal_supplier_id TEXT,
  display_info JSONB,
  vetting_scorecard JSONB,
  pricing_engine JSONB,
  logistics_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier shortlists per project
CREATE TABLE project_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES sourcing_projects(id),
  product_ids UUID[],
  selected_product_id UUID,
  landed_cost_quote JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.2 API Routes (new)

```
src/app/api/
  sourcing/
    projects/
      route.ts          — GET list, POST create
      [id]/
        route.ts        — GET, PATCH
        messages/
          route.ts      — GET history, POST new message → Accio AI
        proposal/
          route.ts      — GET shortlist, POST select supplier
        quote/
          route.ts      — GET, POST recalculate landed cost
        handoff/
          route.ts      — POST → generate brief + trigger WhatsApp
```

### 7.3 AI Integration (`src/app/api/sourcing/projects/[id]/messages/route.ts`)

```ts
// POST handler
// 1. Receive user message + current project state
// 2. Call Accio API (or Claude with tools) with:
//    - System prompt: Induction schema + current TPR progress
//    - User message
// 3. Parse response: { next_question, instruction_type, field_updates, actions }
// 4. Apply field_updates to sourcing_projects.project_brief (JSONB patch)
// 5. Store both messages in project_messages
// 6. Return structured response to client
// 7. If action === 'trigger_sourcing': kick off async supplier search
```

---

## Phase 8 — Catalog Readiness (86 Listings → Display-Ready)

The catalog has 86 tractors, no images, one price, no location data. This phase makes every listing usable before launch.

### 8.1 The Catalog Reality Check

| Field | Current state | Target state |
|---|---|---|
| Images | 0 / 86 | 1–4 images per listing |
| Price | 1 / 86 | Removed — quote-only flow |
| Location/Country | 0 / 86 | "China" as origin (or blank — irrelevant for new stock) |
| Condition | All "new" | Correct — keep |
| Year | All null | Null is fine for new stock — remove from display |

### 8.2 Image Strategy

**Do not leave listings imageless.** A catalog with no photos is not a catalog — it is a spreadsheet.

Three-tier image solution, in order of quality:

**Tier 1 — Manufacturer press images (best):**
- YTO: `ytotractor.com` and `en.ytotractor.com` — press gallery with high-res model photos
- SinoHarvest: manufacturer product images available by model code
- John Deere 5E/6B series: `deere.com` has product photography — these are globally documented machines
- Massey Ferguson MF1004–1204: standard MF press imagery
- Kubota M series: `kubota.com` press gallery

**Action:** Build a Python script (`infrastructure/scripts/fetch-manufacturer-images.py`) that:
1. For each listing, constructs a manufacturer image URL or scrapes the model page
2. Downloads and saves to `public/images/tractors/[brand]-[model].jpg`
3. Updates `product-catalog.json` with the local image paths
4. Runs `generate-sql-seed.py` to push to Supabase

**Tier 2 — Freepik/AI generated reference images (fallback):**
For models where manufacturer images cannot be sourced cleanly, generate one reference photo per brand-HP-tier combination (not per model):
- 6 YTO archetypes (compact/mid/high HP)
- 6 SinoHarvest archetypes
- JD/MF/Kubota use real manufacturer photos (always available)

**Freepik prompts by tier:**
```
Compact tractor (40-60hp, YTO/SinoHarvest):
"Professional product photography of a compact Chinese agricultural tractor, 
yellow-orange livery, 4WD, white background, studio lighting, 
commercial catalog shot, high-detail, photorealistic, 
no text, no watermarks, front 3/4 angle"

Mid-range tractor (80-130hp):
"Professional product photography of a mid-range Chinese 4WD agricultural 
tractor, clean modern design, blue or red livery, white studio background,
commercial catalog photography, front 3/4 angle, photorealistic"

High-power tractor (150-210hp):
"Professional product photography of a large high-horsepower Chinese 
agricultural tractor, green or red livery, ROPS cab, 4WD dual rear wheels,
white studio background, commercial catalog shot, front 3/4 angle"
```

**Tier 3 — Unsplash placeholder (temporary):**
Map HP ranges to Unsplash IDs already used in the platform as temporary display while real images are sourced. Remove at launch.

### 8.3 Pricing Model: Quote-Only Flow

Do not show prices on the catalog. This is architecturally correct for this business:

- Factory prices are negotiated (MOQ-dependent)
- Landed cost varies by destination country, quantity, shipping method
- Showing "$15,000" (the one Kubota price in the catalog) creates false anchoring

**What to show instead of price:**

```
On listing card:
  "Precio a consultar"  (Cormorant italic, text-[#6B6560])
  [Solicitar cotización →]  (gold pill button)

On listing detail page (right rail):
  Large label: "Precio landed estimado"
  Sub-label: "Calculado por destino, cantidad y modalidad de flete"
  [Calcular mi cotización]  →  opens inline quote form (3 fields)
  
  Below: "O habla con un asesor ahora"  →  WhatsApp deep link
```

### 8.4 Per-Listing Quote Form (inline, no route change)

When buyer clicks "Calcular mi cotización" on any listing:

```tsx
// QuoteForm component — appears inline in listing right rail
// 3 fields:
//   1. País de destino (select: Colombia, Perú, Bolivia, Chile, Paraguay, Argentina, Uruguay)
//   2. Cantidad de unidades (number input, min 1)
//   3. WhatsApp o email (text input)
// On submit:
//   POST /api/contact with { model, brand, hp, pais_destino, cantidad, contacto }
//   Show SuccessState: "Tu solicitud fue enviada" + WhatsApp button + Calendly
```

This is the exact Wings LeadForm pattern — 3 fields, gold button, success state with two CTAs.

### 8.5 Listing Copy Rewrite

The current descriptions are AI-generated and formulaic ("The SinoHarvest SH504 is a professional-grade agricultural tractor designed for modern farming operations..."). Every description opens identically. This signals low effort to B2B buyers.

**Rewrite approach:**
- Group by brand (5 groups) and HP range (6 tiers)
- Write one distinctive opening sentence per group that leads with the buyer-relevant fact
- Let the spec grid carry the detail — the description handles context and use case

**Example rewrites:**

*SinoHarvest 50-70hp (compact work tractors):*
`"Diseñado para operaciones de campo intensivo en terrenos medianos, el [MODEL] entrega [HP]hp con transmisión [TRANS] y toma de fuerza trasera para trabajo con implementos de siembra, fumigación y labranza ligera. Importado con garantía del fabricante y soporte técnico en destino."`

*YTO 100-130hp (mid-range workhorse):*
`"El [MODEL] de YTO es el tractor más vendido de la línea media de la marca — un estándar del sector agrícola en más de 100 países. Con [HP]hp y tracción 4x4, cubre operaciones de labranza profunda, transporte de carga y cosecha con equipos de alta demanda hidráulica."`

*John Deere 5E series:*
`"La serie 5E de John Deere es la línea de tractores fabricados en China para mercados emergentes — misma ingeniería de la marca, optimizada para costos de operación agrícola. [HP]hp, [TRANS], compatible con toda la gama de implementos John Deere y de terceros."`

### 8.6 Catalog Filtering: Corrected for Actual Data

Current filter panel exposes "country", "condition", "year range", "price range" — none of which are meaningful for this catalog (all new, all no price, all no year, all no country).

**Replace with filters that match the actual data:**

```
Filter panel (left rail):
  Marca (Brand):
    □ YTO (31)
    □ SinoHarvest (28)
    □ John Deere (16)
    □ Massey Ferguson (6)
    □ Kubota (5)

  Potencia (Horsepower):
    □ 40–60 hp (13 modelos)
    □ 60–80 hp (15 modelos)
    □ 80–100 hp (20 modelos)
    □ 100–130 hp (19 modelos)
    □ 130–160 hp (11 modelos)
    □ 160–210 hp (8 modelos)

  Tracción:
    □ 4WD (77)
    □ Otra (9)

  (Remove: País, Condición, Año, Precio)
```

### 8.7 Category Structure Simplification

The current nav has: Agricultural → Tractors, Harvesters, Balers, Plows, Mowers, Grain Carts, Seeders, Sprayers / Trucks / Buses / Industrial / Spare Parts.

**The actual catalog only has tractors.** The rest is UI scaffolding with no data behind it.

Two options — choose one:

**Option A — Honest MVP (recommended):**
Keep only what has data. Single `/tractors` route. Remove Trucks, Buses, Industrial, Spare Parts from nav. Add "Próximamente" placeholder sections. Ship faster.

**Option B — Future-ready shell:**
Keep the nav structure but mark all non-tractor categories as "Próximamente" with a lead capture form ("Notifícame cuando esté disponible"). This builds an email list for expansion categories.

Option B costs 2-3 days of work and generates business value (waitlist). Recommended for launch.

### 8.8 Supabase Seed Update

After images are sourced and descriptions rewritten, run the catalog → Supabase pipeline:

```bash
# 1. Update descriptions in product-catalog.json
# 2. Add image paths
# 3. Run:
python infrastructure/scripts/generate-sql-seed.py
# 4. Apply in Supabase SQL editor:
# infrastructure/supabase/seed-catalog.sql
```

Add a new migration that drops the `price`, `year`, `country`, `location` columns from the listings display query (keep in DB for admin) and adds `image_alt` TEXT.

---

## Phase 9 — Homepage Repositioning

The homepage currently says "Europe's Leading B2B Machinery Marketplace" and lists European country codes. Every word of this copy is wrong for the actual product.

### 9.1 Corrected Hero Copy

```
Eyebrow pill: "Colombia · Perú · Bolivia · Chile · Paraguay · Argentina · Uruguay"
  (identical pattern to Wings Global Trade hero eyebrow)

H1 (Cormorant Garamond, 88px):
  "Maquinaria agrícola de Asia con precio landed y asesoría experta."

Sub (Flexo 300, italic, white/60):
  "86 tractores nuevos de YTO, SinoHarvest, John Deere y Massey Ferguson —
   cotizados con flete, aranceles y entrega hasta tu campo."

CTAs:
  Primary (gold): "Ver catálogo completo" → /agricultural/tractors
  Secondary (white/8): "Solicitar cotización" → #cotizacion

Stats (4-col, below search):
  86 modelos  |  40–210 hp  |  5 marcas  |  7 países atendidos
  (Replace: 52,000 listings / 3,800 dealers / 28 countries / 1.2M sold)
```

### 9.2 Corrected Search Bar

Replace the current "select category + keyword search" with a **HP range finder** — the primary decision variable for tractor buyers:

```
"¿Cuántas hectáreas trabajas?" selector:
  Menos de 20 ha → 40–70 hp
  20–100 ha      → 70–120 hp
  100–500 ha     → 120–160 hp
  Más de 500 ha  → 160–210 hp

Brand filter: All / YTO / SinoHarvest / John Deere / MF / Kubota

[Ver modelos disponibles →] (gold button) → /tractors?hpMin=X&hpMax=Y&brand=Z
```

This replaces a generic keyword search (useless for a 86-model catalog with structured specs) with a guided selector that matches buyers to relevant models in one click.

### 9.3 Corrected Trust Badges

Replace:
- "Certified Inspection" / "Secure Transaction" / "Farm Delivery" / "Registration Support"

With:
- "Precio Landed Total" — Flete, aranceles y entrega incluidos en tu cotización
- "Sin intermediarios" — Acceso directo a fabricantes verificados en China
- "Entrega en 7 países" — Colombia, Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay
- "Asesoría en español" — Un consultor real, no un bot

### 9.4 Corrected Stats Bar

Remove the fictional "52,000+ listings / 3,800 dealers / 28 countries / 1.2M sold" stats.

Replace with real, defensible numbers from the catalog and Wings business:
```
86 modelos   |   40–210 hp   |   5 marcas   |   48 h cotización
```
(Same 4-stat pattern, same navy bg, same gold Cormorant numbers — only the values change)

---

## Phase 10 — i18n & Currency

The platform already has i18n infrastructure. The rebrand changes the target language direction:

- Remove `en_EU` as primary. Switch to `es` (Spanish) as default — this is a Spanish-language service.
- Keep `en` as secondary for international buyers.
- Currency: remove EUR as primary. Add `USD` (most Chinese machinery is quoted in USD), then `COP`, `PEN`, `BOB`, `CLP`, `PYG`, `ARS`, `UYU` for destination market display.

---

## Implementation Sequence (Updated)

```
Week 1 — Foundation:
  [ ] Phase 0.1 — globals.css migration, Tailwind v4 setup
  [ ] Phase 0.2 — copy useFadeIn hook + fonts
  [ ] Phase 1.1 — Header rebrand (navy, Wings logo, Spanish nav)
  [ ] Phase 1.2 — Footer rebrand
  [ ] Phase 1.3 — Mobile menu

Week 2 — Homepage + Core Copy:
  [ ] Phase 9.1–9.4 — Full homepage repositioning (copy + stats + search)
  [ ] Phase 2       — Homepage visual rebrand (brand tokens applied)
  [ ] Phase 8.6     — Filter panel corrections (brand + HP filters)
  [ ] Phase 8.7     — Nav simplification (Option B with waitlist)

Week 3 — Catalog Display:
  [ ] Phase 8.1–8.2 — Image sourcing (manufacturer press images + scripts)
  [ ] Phase 8.3–8.4 — Quote-only flow + per-listing QuoteForm component
  [ ] Phase 8.5     — Description rewrites (by brand/HP group)
  [ ] Phase 3.1     — TractorCard rebrand (with quote CTA, no price)
  [ ] Phase 3.2–3.3 — CategoryHubPage + FilterPanel rebrand

Week 4 — Listing Detail + Static Pages:
  [ ] Phase 8.8     — Supabase seed update
  [ ] Phase 4.1–4.4 — About, Contact, Sign-in, Seller pages
  [ ] Phase 8 (old) — Inquiry system rebrand

Week 5 — Wings Integration:
  [ ] Phase 5 — /importacion route (embed Wings landing page)

Week 6–7 — AI Sourcing Platform (MVP):
  [ ] Phase 6.1–6.4 — Sourcing layout, dashboard, milestone stepper
  [ ] Phase 6.5      — AI Induction split-screen
  [ ] Phase 7        — Supabase tables + API routes

Week 8 — AI Sourcing Platform (Full):
  [ ] Phase 6.6–6.8 — Proposal, landed cost, WhatsApp handoff
  [ ] Phase 10       — Spanish i18n + USD/LatAm currency defaults
```

---

## Design Principles (from WINGS_BRAND_SYSTEM.md)

All decisions across all phases are governed by these:

1. **Navy is the environment, gold is the signal.** Use navy for structure; gold only for actions and emphasis.
2. **Cormorant for weight, Flexo for clarity.** Display headings are serif. All UI text is sans.
3. **Round beats square.** Buttons, cards, badges, and inputs are all rounded. Sharp corners are not part of this brand.
4. **Overlays at 55–60%, never more.** Photos must breathe under navy overlays.
5. **Three fields maximum on any form.** More fields = fewer completions.
6. **Stagger every card grid.** No grid appears at once. 90–120ms delay between cards.
7. **One CTA per screen.** If a screen has two CTAs, one is primary (gold), one is ghost (white/8 on navy, outlined on white).
8. **The word "premium" is never used.** The design shows it; the copy doesn't say it.
9. **No exclamation marks. Anywhere. Ever.**
10. **Mobile is designed first.** Every component is checked at 390px before desktop.

---

## Files to Create / Modify (Summary)

```
── MODIFY (existing files, rebrand/rewrite):
src/app/globals.css                         Phase 0.1 — full replacement
src/app/layout.tsx                          Phase 0.1 — metadata rewrite (Spanish, LatAm)
src/app/page.tsx                            Phase 2 + 9 — full homepage rewrite
src/components/layout/Header.tsx            Phase 1.1
src/components/layout/Footer.tsx            Phase 1.2
src/components/layout/MobileMenu.tsx        Phase 1.3
src/components/layout/CategoryMegaMenu.tsx  Phase 1.4
src/components/listings/TractorCard.tsx     Phase 3.1 — remove price, add quote CTA
src/components/listings/CategoryHubPage.tsx Phase 3.2
src/components/listings/FilterPanel.tsx     Phase 3.3 + 8.6 — brand+HP filters only
src/components/listings/HorizontalSubtypeSwitcher.tsx Phase 3.4
src/components/listings/FeaturedCarousel.tsx Phase 3.5
src/components/inquiries/InquiryForm.tsx    Phase 8 — Wings LeadForm pattern

── CREATE (new files):
src/hooks/useFadeIn.ts                      (copy from wings-global-trade)

src/components/listings/QuoteForm.tsx       Phase 8.4 — 3-field quote form per listing
src/components/listings/HpFinder.tsx        Phase 9.2 — hectares → HP range selector

src/components/wings/WingsHero.tsx          Phase 5
src/components/wings/WingsHowItWorks.tsx    Phase 5
src/components/wings/WingsFreeZone.tsx      Phase 5
src/components/wings/WingsCategories.tsx    Phase 5
src/components/wings/WingsLeadForm.tsx      Phase 5

src/components/sourcing/MilestoneStepper.tsx  Phase 6.4
src/components/sourcing/ProjectCard.tsx       Phase 6.3
src/components/sourcing/ChatBubble.tsx        Phase 6.5
src/components/sourcing/SpecCanvas.tsx        Phase 6.5
src/components/sourcing/SupplierCard.tsx      Phase 6.6
src/components/sourcing/LandedCostCalc.tsx    Phase 6.7
src/components/sourcing/HandoffModal.tsx      Phase 6.8

src/app/importacion/page.tsx                Phase 5
src/app/sourcing/layout.tsx                 Phase 6.2
src/app/sourcing/page.tsx                   Phase 6.1
src/app/sourcing/dashboard/page.tsx         Phase 6.3
src/app/sourcing/project/[id]/page.tsx      Phase 6.5
src/app/sourcing/project/[id]/proposal/page.tsx Phase 6.6
src/app/sourcing/project/[id]/quote/page.tsx    Phase 6.7
src/app/sourcing/onboarding/page.tsx        Phase 6.1

src/app/api/sourcing/projects/route.ts              Phase 7.2
src/app/api/sourcing/projects/[id]/route.ts         Phase 7.2
src/app/api/sourcing/projects/[id]/messages/route.ts Phase 7.3
src/app/api/sourcing/projects/[id]/proposal/route.ts Phase 7.2
src/app/api/sourcing/projects/[id]/quote/route.ts    Phase 7.2
src/app/api/sourcing/projects/[id]/handoff/route.ts  Phase 7.2

── PUBLIC ASSETS:
public/fonts/                               (copy from wings-global-trade/public/fonts/)
public/wings-logo2-white.svg               (white variant — CSS filter or separate SVG)
public/images/tractors/                    (86 model images, Phase 8.2)

── INFRASTRUCTURE:
infrastructure/scripts/fetch-manufacturer-images.py  Phase 8.2
infrastructure/supabase/migrations/001_sourcing_projects.sql  Phase 7.1
infrastructure/supabase/migrations/002_platform_products.sql  Phase 7.1

── DELETE:
tailwind.config.ts                          Phase 0.1 — replaced by CSS @theme
postcss.config.js                           Phase 0.1 — not needed in Tailwind v4
```

---

## The One-Sentence Summary of Each Phase

| Phase | What it does |
|---|---|
| 0 | Replaces the design token foundation — fonts, colors, animations |
| 1 | Rebrands the shell every user sees on every page |
| 2 | Rewrites the homepage visually in the Wings brand |
| 3 | Rebrands listing cards and category navigation |
| 4 | Rebrands static informational pages |
| 5 | Integrates the Wings landing page as `/importacion` |
| 6 | Builds the AI sourcing concierge as a sub-application |
| 7 | Builds the backend for sourcing projects |
| 8 | Makes all 86 catalog listings actually usable (images, quotes, copy) |
| 9 | Rewrites homepage copy for the correct audience (Latin American buyers, not Europeans) |
| 10 | Switches language defaults and currencies to match the real market |

---

*Start at Phase 0.1. The globals.css migration is 30 minutes of work that unblocks everything else. Nothing can look right until the tokens are in place.*
