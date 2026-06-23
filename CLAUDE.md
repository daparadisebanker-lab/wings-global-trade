# Wings Global Trade — Project CLAUDE.md

## What You Are Building

Wings Global Trade is a B2B trade intelligence and inquiry platform for Latin American importers. It has two flows:

1. **Catalog Flow** — Browse curated inventory (agricultural machinery, trucks, buses, industrial equipment, spare parts). Submit an inquiry. Conversion = form submission.

2. **Accio Engine Flow** — AI chat collects a Technical Product Requirement (TPR) for custom/volume imports via free trade zones (ZOFRATACNA, Peru + ZOFRI, Chile). AI calculates CIF estimate. Conversion = TPR submission.

**There is no cart, no checkout, no payment, no user accounts.** The platform exists to convert visitors into documented leads delivered to Wings ops via WhatsApp + email.

---

## Stack

```
Framework:     Next.js 15 (App Router)
Language:      TypeScript — everywhere, no exceptions
Styling:       Tailwind CSS — no inline styles, no CSS modules
Database:      Supabase (Postgres + Storage)
Auth:          None — no user authentication in MVP
AI:            Anthropic Claude API (claude-haiku-4-5 for chat, claude-sonnet-4-6 for estimation)
Email:         Resend
WhatsApp:      Twilio WhatsApp API
Deployment:    Vercel
Package mgr:   pnpm — never npm or yarn
Animation:     Framer Motion
```

---

## Conventions — Non-Negotiable

- TypeScript everywhere. No `.js` files.
- `pnpm` only. Never `npm install` or `yarn`.
- Functional components with hooks. No class components.
- Tailwind CSS utility classes only. No inline styles.
- Absolute imports with `@/` prefix.
- 2-space indent, Prettier defaults.
- camelCase for variables/functions, PascalCase for components, kebab-case for files.
- Always handle async errors. No silent catches.
- Never hardcode secrets. Always `.env.local`. Always in `.gitignore`.
- Supabase service role key used ONLY in server-side code (`src/app/api/**`).
- RLS enabled on every Supabase table — no exceptions.
- All Claude API calls are server-side only. API key never in client bundle.

---

## Copy Rules

- All UI copy in Spanish
- No exclamation marks
- Specific over generic ("Maquinaria de origen chino certificada" not "Productos de calidad")
- Tagline: "Precisión. Proximidad. Confianza."
- Tone: technical, direct, trustworthy — like a serious trade partner

---

## Brand Colors

```
Navy:        #001E50   (primary background, headers)
Gold:        #C4933F   (accent, CTAs, captured TPR indicators)
Warm White:  #F8F6F0   (page background, alternate sections)
```

Section alternation: navy ↔ warm-white. Never two same-color sections adjacent. Footer always navy.

## Typography

```
Display/Headings: NissanOpti (self-hosted OTF) — Regular + Italic only
Body/UI:          Flexo (self-hosted TTF) — full 8-weight range (100–900)
Labels/Technical: Teko (self-hosted TTF) — condensed, 5 weights (300–700)
```

All fonts are in `public/fonts/`. No Google Fonts dependencies.
Font variables: `--font-display` (NissanOpti), `--font-body` (Flexo), `--font-mono` (Teko).
Set in `globals.css :root` — no next/font imports needed.

Tailwind utilities: `font-display`, `font-body`, `font-mono` map to these variables.
NissanOpti has only weight 400 — never apply font-weight: 300 to display elements.

---

## Project Structure

```
src/
  app/
    layout.tsx
    page.tsx                        # Homepage
    catalogo/[category]/page.tsx    # Category grid
    catalogo/[category]/[slug]/page.tsx  # Product detail
    accio/page.tsx                  # Accio Engine
    nosotros/page.tsx
    contacto/page.tsx
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
    ui/                             # button, input, textarea, select, badge, card, skeleton, toast
    features/
      homepage/                     # CategoryGrid, SearchBar, HeroSection, TrustBar, MarketMap
      catalog/                      # ProductCard, ProductGrid, ProductSpecTable, InquiryForm
      accio/                        # AccioChat, TprSheet, CifEstimateCard, AccioSubmitForm
      navigation/                   # SiteNav, MobileMenu
      shared/                       # PageHero, SectionBlock, WhatsAppButton
  hooks/
    useAccioChat.ts
    useTprState.ts
    useCifEstimate.ts
    useInquiryForm.ts
  lib/
    supabase/client.ts
    supabase/server.ts
    notifications/whatsapp.ts
    notifications/email.ts
    claude.ts
    cif-calculator.ts
    duty-rates.ts
    routing.ts
    utils.ts
  types/
    database.ts
    accio.ts
    api.ts
  styles/
    globals.css
public/
  fonts/
    flexo-regular.woff2
    flexo-medium.woff2
    flexo-bold.woff2
  images/
    logo.svg
    logo-dark.svg
```

---

## Database

Supabase Postgres. Tables: `categories`, `products`, `leads`, `accio_projects`, `notification_log`.

Read `/spec/data-model.md` for complete schema SQL, RLS policies, and TypeScript types.

Key rules:
- All inserts to `leads` and `accio_projects` happen via API routes using service role key
- Client code uses anon key and can only read `categories` and `products`
- `leads` table has no public read policy — ops-only via service role

---

## Homepage Routing Logic

The homepage has ONE unified entry: category grid + search bar.

```
Standard category tile clicked → /catalogo/[category-slug]
"Importación Personalizada" tile clicked → /accio
Search bar with catalog keyword → /catalogo/[matching-category]?q=[query]
Search bar with sourcing keyword → /accio?context=[query]
Search bar with HS code (4-8 digits) → /accio?context=[query]
Ambiguous search → /catalogo?q=[query] (with Accio CTA visible)
```

Routing logic lives in `src/lib/routing.ts` as `detectSearchIntent()`.

---

## Accio Engine — How It Works

1. User arrives at `/accio`
2. First AI message renders immediately (hardcoded, not API call — avoids latency)
3. User types a message → POST `/api/accio/chat` with full conversation history + current TPR state
4. API calls Claude API with system prompt that instructs it to:
   - Collect 10 TPR fields in natural conversation (one question per turn)
   - Embed JSON extraction blocks (`|||JSON_START|||...|||JSON_END|||`) in each response
5. Server parses JSON blocks, emits `tpr_update` SSE events to client
6. Client updates TprSheet in real-time
7. When `completeness` reaches `'minimum'`, client calls `/api/accio/estimate` for CIF calculation
8. User clicks "Enviar consulta" → AccioSubmitForm collects contact info → POST `/api/accio/submit`
9. Server creates `accio_projects` + `leads` records, fires notifications

Claude model: `claude-haiku-4-5` for chat turns. `claude-sonnet-4-6` for CIF estimation on unusual HS codes.

System prompt is in `src/lib/claude.ts` as `ACCIO_SYSTEM_PROMPT`.

---

## Notification Flow

Both flows fire WhatsApp + email notifications:

```
1. API route receives valid submission
2. Insert to Supabase (service role key) — MUST succeed before notifications
3. sendWhatsAppNotification(leadId, payload) — fire-and-forget, errors logged not thrown
4. sendEmailNotification(leadId, payload) — fire-and-forget, errors logged not thrown
5. Return 201 to client
```

In non-production environments (`process.env.VERCEL_ENV !== 'production'`): log notification payload to console, skip actual Twilio/Resend calls.

---

## CIF Calculation

Lives in `src/lib/cif-calculator.ts`. Deterministic for standard cases.

```
FOB = target_price_usd × quantity × (1 + sourcing_margin)
Sourcing margins: machinery 18%, vehicles 15%, parts 22%, equipment 20%

Freight = lookup by (source_market, destination_port, container_type)
Insurance = (FOB + Freight) × 0.015

CIF = FOB + Freight + Insurance
Duty = CIF × duty_rate / 100
Duty rates in: src/lib/duty-rates.ts (static table by destination_country × hs_chapter)
```

Free zone selection: Peru/Bolivia → ZOFRATACNA. Chile/Colombia/Panama → ZOFRI.

---

## API Error Handling

All API routes follow this pattern:

```typescript
try {
  // validate with Zod
  // do work
  return NextResponse.json(result, { status: 201 })
} catch (error) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: error.errors },
      { status: 400 }
    )
  }
  console.error('[route-name]', error)
  return NextResponse.json(
    { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}
```

Never expose raw error messages to client. Never leak Supabase errors or stack traces.

---

## Build Order Recommendation

Build in this order to unblock yourself at each step:

1. Project scaffolding + Supabase setup + environment variables
2. Database migrations (run all 5 migration files)
3. Supabase client utilities (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
4. TypeScript types (`types/database.ts`)
5. UI primitives (`components/ui/*`)
6. Root layout with nav and fonts
7. Homepage (static version, no API calls)
8. `/api/categories` + `/api/products` routes
9. Catalog pages (category grid, product detail)
10. Inquiry form + `/api/leads/catalog` route
11. Notification utilities (WhatsApp + email)
12. Accio Engine chat UI (static, no API)
13. `/api/accio/chat` route (Claude integration)
14. CIF calculator + `/api/accio/estimate`
15. Accio submit form + `/api/accio/submit`
16. Nosotros + Contacto pages
17. Search intent routing
18. Animations (Framer Motion passes)
19. SEO metadata + JSON-LD
20. Responsive polish + accessibility
21. Staging test → Production deploy

---

## Spec Files Reference

All spec files are in `/spec/`:

| File | Contents |
|------|---------|
| `vision.md` | Product vision, personas, business models |
| `user-stories.md` | All user stories with acceptance criteria |
| `data-model.md` | Full Supabase schema SQL + TypeScript types |
| `api-design.md` | All API routes with request/response shapes |
| `component-architecture.md` | Full component tree + hook specifications |
| `design-system.md` | All color tokens, typography, component specs |
| `deployment.md` | Vercel config, environment variables, DNS |
| `success-metrics.md` | KPIs, conversion funnel, 30/60/90 day targets |

When in doubt, read the relevant spec file before making a decision. The spec is authoritative. If something is genuinely ambiguous, resolve it in the direction of simplicity and note it in a code comment.
