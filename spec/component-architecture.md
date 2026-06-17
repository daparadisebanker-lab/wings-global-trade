# Wings Global Trade — Component Architecture

## Structure Overview

```
src/
  app/
    layout.tsx                      # Root layout: fonts, global nav, footer
    page.tsx                        # Homepage — unified entry point
    catalogo/
      page.tsx                      # All categories overview (redirect to first category)
      [category]/
        page.tsx                    # Category product grid
        [slug]/
          page.tsx                  # Product detail
    accio/
      page.tsx                      # Accio Engine split-screen
    nosotros/
      page.tsx                      # About Wings
    contacto/
      page.tsx                      # Contact page
    api/
      categories/route.ts
      products/route.ts
      products/[slug]/route.ts
      leads/catalog/route.ts
      leads/contact/route.ts
      accio/chat/route.ts
      accio/estimate/route.ts
      accio/submit/route.ts

  components/
    ui/                             # Primitive, unstyled-logic, Wings-styled
      button.tsx
      input.tsx
      textarea.tsx
      select.tsx
      badge.tsx
      card.tsx
      skeleton.tsx
      toast.tsx
      separator.tsx
    features/
      homepage/
        CategoryGrid.tsx
        SearchBar.tsx
        HeroSection.tsx
        TrustBar.tsx
        MarketMap.tsx
      catalog/
        ProductCard.tsx
        ProductGrid.tsx
        CategoryNav.tsx
        ProductSpecTable.tsx
        ProductGallery.tsx
        ProductModelSelector.tsx
        InquiryForm.tsx
        InquirySuccess.tsx
      accio/
        AccioChat.tsx
        AccioMessage.tsx
        AccioInput.tsx
        TprSheet.tsx
        TprField.tsx
        CifEstimateCard.tsx
        AccioSubmitForm.tsx
        AccioSuccess.tsx
      navigation/
        SiteNav.tsx
        MobileMenu.tsx
        NavCategoryDropdown.tsx
      notifications/
        ToastProvider.tsx
      shared/
        PageHero.tsx
        SectionBlock.tsx
        WhatsAppButton.tsx
        LoadingSkeleton.tsx

  hooks/
    useAccioChat.ts
    useTprState.ts
    useCifEstimate.ts
    useInquiryForm.ts
    useCategories.ts
    useProducts.ts

  lib/
    supabase/
      client.ts                     # Browser client (anon key)
      server.ts                     # Server client (service role key)
    notifications/
      whatsapp.ts
      email.ts
    claude.ts                       # Claude API client + Accio system prompt
    cif-calculator.ts
    duty-rates.ts
    routing.ts                      # Search intent detection logic
    utils.ts

  types/
    database.ts
    accio.ts
    api.ts
```

---

## Root Layout

### `app/layout.tsx`

```typescript
// Responsibilities:
// - Load fonts: Cormorant Garamond (Google Fonts), Flexo (local), DM Mono (Google Fonts)
// - Render <SiteNav /> above page content
// - Render <Footer /> below page content
// - Render <ToastProvider /> for global notifications
// - Set default metadata (Spanish, Wings SEO)

// Font loading:
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-display',
})
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
})
// Flexo loaded via @font-face in globals.css (self-hosted)
```

---

## Homepage Components

### `app/page.tsx`

Composition:
```
<HeroSection />
<CategoryGrid />          ← primary entry point
<SearchBar />             ← secondary, overlaid on or below hero
<TrustBar />
<MarketMap />
<Footer />
```

### `features/homepage/HeroSection.tsx`

- Full-viewport section, navy background (`#001E50`)
- Headline in Cormorant Garamond display weight, warm white
- Tagline: "Precisión. Proximidad. Confianza."
- Subheadline: "Maquinaria, vehículos y equipos industriales. Importación directa con gestión en zona franca."
- Fade-up animation on mount (Framer Motion, `initial: { opacity: 0, y: 24 }`, `animate: { opacity: 1, y: 0 }`, `duration: 0.6`)
- SearchBar embedded at bottom of HeroSection

### `features/homepage/SearchBar.tsx`

```typescript
// Props: none
// State: query (string), isLoading (boolean)
// Behavior:
//   - On submit: call detectSearchIntent(query)
//   - If intent === 'catalog' + category: router.push(`/catalogo/${category}?q=${query}`)
//   - If intent === 'accio': router.push(`/accio?context=${encodeURIComponent(query)}`)
//   - If intent === 'ambiguous': router.push(`/catalogo?q=${query}`)
// Placeholder: "Busca maquinaria, camiones, equipos industriales..."
// UI: full-width pill input with search icon, warm white on navy background
```

**`lib/routing.ts` — `detectSearchIntent`:**
```typescript
type SearchIntent = {
  type: 'catalog'
  category: string | null
} | {
  type: 'accio'
} | {
  type: 'ambiguous'
}

function detectSearchIntent(query: string): SearchIntent {
  const q = query.toLowerCase().trim()

  // Catalog keywords
  const CATALOG_KEYWORDS: Record<string, string> = {
    'tractor': 'maquinaria-agricola',
    'cosechadora': 'maquinaria-agricola',
    'arado': 'maquinaria-agricola',
    'sembradora': 'maquinaria-agricola',
    'camión': 'camiones',
    'camion': 'camiones',
    'volquete': 'camiones',
    'furgón': 'camiones',
    'bus': 'buses',
    'minibús': 'buses',
    'generador': 'equipo-industrial',
    'compresor': 'equipo-industrial',
    'montacargas': 'equipo-industrial',
    'repuesto': 'repuestos',
    'filtro': 'repuestos',
  }

  // Accio keywords
  const ACCIO_KEYWORDS = [
    'importar', 'importación', 'contenedor', 'contenedores',
    'certificación', 'certificacion', 'lote', 'volumen',
    'personalizado', 'específico', 'especifico', 'granel',
    'hs', 'arancel', 'zona franca', 'zofratacna', 'zofri',
  ]

  for (const [keyword, category] of Object.entries(CATALOG_KEYWORDS)) {
    if (q.includes(keyword)) return { type: 'catalog', category }
  }

  for (const keyword of ACCIO_KEYWORDS) {
    if (q.includes(keyword)) return { type: 'accio' }
  }

  // HS code pattern (4-8 digits)
  if (/^\d{4,8}$/.test(q)) return { type: 'accio' }

  return { type: 'ambiguous' }
}
```

### `features/homepage/CategoryGrid.tsx`

```typescript
// Props: categories: Category[]
// Renders a responsive grid of category tiles
// Each tile: icon (SVG), name in Cormorant Garamond, subtle hover state
// Special tile at end: "Importación Personalizada" → routes to /accio
// Staggered entrance animation: each tile fades in with 80ms delay between cards
// Mobile: 2 columns. Tablet: 3 columns. Desktop: 3 columns (6 tiles total: 5 categories + 1 accio)
// Tile aspect ratio: square (padding-bottom: 100%)
```

### `features/homepage/TrustBar.tsx`

- Three columns on desktop, stacked on mobile
- Col 1: "Zonas Francas" — ZOFRATACNA (Tacna, Perú) + ZOFRI (Iquique, Chile)
- Col 2: "Mercados de origen" — China · Tailandia · Japón · Dubai
- Col 3: "Mercados atendidos" — Perú · Chile · Colombia · Panamá · Costa Rica · Bolivia · R. Dominicana
- Warm white background, navy text, DM Mono for labels

### `features/homepage/MarketMap.tsx`

- SVG map of Latin America with destination country pins
- Static SVG — not interactive in MVP
- Navy background, gold pins (`#C4933F`) for active markets

---

## Catalog Components

### `app/catalogo/[category]/page.tsx`

Data fetching (Server Component):
```typescript
// Fetch category by slug (validate exists)
// Fetch products for category (pass ?category=slug to /api/products)
// Pass to <ProductGrid />
// Metadata: dynamic title and description from category
```

### `features/catalog/ProductGrid.tsx`

```typescript
// Props: products: Product[], isLoading?: boolean
// Renders 3-column desktop grid of ProductCard components
// Empty state: message + Accio Engine CTA
// Loading: 6 ProductCard skeletons
```

### `features/catalog/ProductCard.tsx`

```typescript
// Props: product: Product
// Contents:
//   - Image (Next.js Image, aspect-ratio: 4/3, object-fit: cover)
//   - Product name (Cormorant Garamond, 20px)
//   - Source market badge(s)
//   - 2–3 key specs from product.specs (first 2-3 keys)
//   - "Ver detalles" link → /catalogo/[category]/[slug]
// Hover: subtle lift (transform: translateY(-2px), shadow increase)
// Navy badge for source market (e.g. "China", "Japón")
```

### `app/catalogo/[category]/[slug]/page.tsx`

Data fetching (Server Component):
```typescript
// Fetch product by slug
// If not found: notFound()
// Structured data: JSON-LD Product schema
// Metadata: product name + category in title
```

Layout:
```
<PageHero title={product.name_es} subtitle={category.name_es} />
<div grid>
  <div col-left>
    <ProductGallery images={product.images} />
    <ProductSpecTable specs={product.specs} />
  </div>
  <div col-right sticky>
    <ProductModelSelector models={product.models} />
    <InquiryForm product={product} />
  </div>
</div>
```

### `features/catalog/ProductSpecTable.tsx`

```typescript
// Props: specs: Record<string, string>
// Renders a two-column table
// Label in DM Mono (left), value in DM Sans (right)
// Alternating row background: warm white / light cream
// No borders — padding and background differentiate rows
```

### `features/catalog/InquiryForm.tsx`

```typescript
// Props: product: Product
// State managed by useInquiryForm hook
// Fields: full_name, company, email, phone, destination_country (dropdown), quantity, message
// destination_country options: Peru, Chile, Colombia, Panama, Costa Rica, Bolivia, Dominican Republic, Otro
// On submit: POST /api/leads/catalog
// Shows InquirySuccess component on success (replaces form in-place)
// Loading state: button shows spinner, all fields disabled
// Error state: toast notification
```

### `features/catalog/InquirySuccess.tsx`

```typescript
// Props: productName: string, whatsappNumber: string
// Shows:
//   - Check mark (SVG, gold color)
//   - "Tu consulta fue recibida."
//   - "El equipo de Wings se comunicará contigo en las próximas 24 horas."
//   - WhatsApp direct contact button
// No redirect, no page refresh
```

---

## Accio Engine Components

### `app/accio/page.tsx`

```typescript
// Server component wrapper
// Reads ?context= query param (from search intent routing)
// Passes initialContext to AccioChat
```

Layout (Client Component):
```
<div class="h-screen flex overflow-hidden">
  <div class="flex-1 flex flex-col">    ← Chat panel
    <AccioChatHeader />
    <AccioChat initialContext={context} />
    <AccioInput />
  </div>
  <div class="w-96 hidden lg:block border-l">  ← TPR Sheet (desktop only)
    <TprSheet />
  </div>
</div>
```

Mobile: Full-screen chat. "Ver resumen TPR" button at bottom opens TprSheet as a bottom drawer.

### `features/accio/AccioChat.tsx`

```typescript
// Props: initialContext?: string
// Uses useAccioChat hook for all state
// Renders list of AccioMessage components
// Auto-scrolls to bottom on new messages
// Shows typing indicator when waiting for AI response
// Triggers useCifEstimate when TPR hits 'minimum' completeness
```

### `hooks/useAccioChat.ts`

```typescript
// State:
//   messages: ConversationTurn[]
//   tprState: Partial<AccioProject>
//   completeness: TprCompleteness
//   isLoading: boolean
//   sessionId: string (generated once on mount via crypto.randomUUID())

// Actions:
//   sendMessage(content: string): void
//     → POST to /api/accio/chat (streaming)
//     → Parse SSE stream
//     → Update messages[] with assistant response
//     → Update tprState with tpr_update events
//     → Update completeness from done event

// Initial message:
//   On mount, if no messages exist, send the AI greeting as first assistant message
//   (hardcoded, not an API call — avoids cold start delay)
```

### `features/accio/AccioMessage.tsx`

```typescript
// Props: message: ConversationTurn, isStreaming?: boolean
// User messages: right-aligned, gold accent left border
// Assistant messages: left-aligned, warm white background, navy text
// Streaming: shows cursor (blinking underscore) while isStreaming
// Timestamp: DM Mono, small, below message
```

### `features/accio/TprSheet.tsx`

```typescript
// Props: tprState: Partial<AccioProject>, onEditField: (field: string) => void
// Renders list of TprField components
// Groups fields: Basic Info / Technical Specs / Commercial Terms / Certifications
// "Enviar consulta" button — active when completeness === 'minimum' or 'complete'
// Button triggers AccioSubmitForm modal/drawer
```

### `features/accio/TprField.tsx`

```typescript
// Props: label: string, value: any, status: 'captured' | 'pending', onEdit?: () => void
// Captured: shows value in DM Mono, gold dot indicator, optional edit button
// Pending: shows "Pendiente" in muted color, grey dot indicator
```

### `features/accio/CifEstimateCard.tsx`

```typescript
// Props: estimate: CIFEstimate
// Rendered inside TprSheet when estimate is available
// Shows:
//   FOB estimado:      $45,000 USD
//   Flete:             $3,200 USD
//   Seguro:            $726 USD
//   ─────────────────────────────
//   CIF total:         $48,926 USD
//   Arancel (6%):      $2,936 USD
//   Vía zona franca:   ZOFRATACNA — ahorro estimado 18.5%
// All monetary values in DM Mono
// Disclaimer in small italic below the card
// Background: navy (#001E50), text: warm white + gold for CIF total
```

### `features/accio/AccioSubmitForm.tsx`

```typescript
// Rendered as a bottom drawer or modal when "Enviar consulta" is clicked
// Fields: full_name, company, email, phone
// Pre-fills nothing (contact info not collected during chat)
// On submit: POST /api/accio/submit with full tprState + contact + estimate + conversation_snapshot
// On success: renders AccioSuccess
```

---

## Navigation Components

### `features/navigation/SiteNav.tsx`

```typescript
// Fixed top navigation
// Left: Wings logo (SVG wordmark)
// Center (desktop): Inicio · Catálogo (dropdown) · Accio Engine · Nosotros
// Right: WhatsApp button (gold, pill shape) · Contacto (text link)
// Scrolled state: adds backdrop blur + slight navy background opacity
// Mobile: shows logo + hamburger → MobileMenu
```

### `features/navigation/NavCategoryDropdown.tsx`

```typescript
// Triggered by "Catálogo" nav item hover/focus
// Shows 5 category links with icons
// Bottom of dropdown: "¿No encuentras lo que buscas? → Accio Engine" CTA
```

---

## Shared Components

### `features/shared/SectionBlock.tsx`

```typescript
// Props: theme: 'navy' | 'warm-white', children: ReactNode
// Handles the navy ↔ warm-white alternation pattern
// Enforces consistent vertical padding (py-20 md:py-28)
// Navy: text warm white. Warm white: text navy.
```

### `features/shared/WhatsAppButton.tsx`

```typescript
// Props: phoneNumber: string, message?: string, label?: string
// Renders a WhatsApp deep link: https://wa.me/{phoneNumber}?text={message}
// Gold background, navy text
// Opens in new tab
```

### `ui/toast.tsx`

```typescript
// Global toast notification system
// Position: bottom-right
// Types: success (green), error (red), info (gold)
// Duration: 4000ms auto-dismiss
// Used for: form errors, submission confirmations, AI errors
```

---

## Animation Specifications

All animations use Framer Motion.

| Element | Animation | Values |
|---------|-----------|--------|
| Section headers | Fade up | opacity 0→1, y 24→0, duration 0.5s |
| Category tiles | Staggered fade in | opacity 0→1, stagger 80ms between tiles |
| Product cards | Staggered fade in | opacity 0→1, stagger 60ms between cards |
| AccioMessage (new) | Fade in | opacity 0→1, duration 0.3s |
| TprField (captured) | Color transition | grey → gold indicator, 0.4s |
| CIF estimate card | Slide up | y 16→0, opacity 0→1, duration 0.5s |
| Mobile menu | Slide from top | y -100%→0, duration 0.3s |

No bounce. No scale. No spring physics on UI elements. Motion is editorial, not playful.

---

## Page Metadata Strategy

```typescript
// All pages use Next.js 15 Metadata API
// Default: src/app/layout.tsx exports metadata with Wings brand defaults
// Override per page via generateMetadata()

// Homepage:
export const metadata: Metadata = {
  title: 'Wings Global Trade — Importación Industrial para América Latina',
  description: 'Maquinaria agrícola, camiones, buses y equipo industrial. Importación directa desde China, Japón y Tailandia con gestión en zona franca ZOFRATACNA y ZOFRI.',
  openGraph: {
    title: 'Wings Global Trade',
    description: 'Precisión. Proximidad. Confianza.',
    locale: 'es_PE',
    type: 'website',
  }
}
```
