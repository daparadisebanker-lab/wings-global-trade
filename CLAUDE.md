# Wings Global Trade — Project CLAUDE.md

## What You Are Building

Wings Global Trade is a B2B trade intelligence and inquiry platform for Latin American importers. It has two flows:

1. **Catalog Flow** — Browse curated inventory (agricultural machinery, trucks, buses, industrial equipment, spare parts). Submit an inquiry. Conversion = form submission.

2. **Mister Flow (v2)** — Mister is an AI trade-intelligence layer. It runs a short induction to resolve one of 5 buyer archetypes (lead_buyer, project_manager, logistics_manager, reseller, wholesale_partner), guides the visitor through discovery -> consideration -> pre_qualification -> support, and educates on landed-cost STRUCTURE using indexed ranges (base 100). Mister NEVER shows an absolute price, availability, or lead time. Conversion = quotation request / WhatsApp handoff / document download.

**There is no cart, no checkout, no payment, no user accounts.** The platform exists to convert visitors into documented leads delivered to Wings ops via WhatsApp + email.

---

## Stack

```
Framework:     Next.js 15 (App Router)
Language:      TypeScript — everywhere, no exceptions
Styling:       Tailwind CSS — no inline styles, no CSS modules
Database:      Supabase (Postgres + Storage)
Auth:          None — no user authentication in MVP
AI:            Anthropic Claude API (claude-sonnet-4-6 — Mister conversation, streaming SSE)
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
    mister/page.tsx                 # Mister
    nosotros/page.tsx
    contacto/page.tsx
    api/
      categories/route.ts
      products/route.ts
      products/[slug]/route.ts
      leads/catalog/route.ts
      leads/contact/route.ts
      mister/route.ts             # v2 streaming SSE endpoint
      mister/quote/route.ts       # quotation prefill token (never a price)
      mister/submit/route.ts      # lead/quotation submission (no CIF)
      mister/chat/route.ts        # DEPRECATED (returns 410)
      mister/estimate/route.ts    # RETIRED (returns 410)
  components/
    ui/                             # button, input, textarea, select, badge, card, skeleton, toast
    features/
      homepage/                     # CategoryGrid, SearchBar, HeroSection, TrustBar, MarketMap
      catalog/                      # ProductCard, ProductGrid, ProductSpecTable, InquiryForm
      mister/                       # MisterProvider, MisterLauncher, MisterWindow(+Header), MisterMessageList, MisterMessage, MisterStreamingMessage, MisterComposer, MisterQuickActions, MisterEmbedded, MisterWaveform
      mister/surfaces/              # ProductCard, LandedCostWaterfall, ComparisonView, IndexComparison, MoqTable, SpecSheet, ContactCard, DocumentLink, QuotationFormCTA, SessionBrief, SurfaceRenderer
      navigation/                   # SiteNav, MobileMenu
      shared/                       # PageHero, SectionBlock, WhatsAppButton
  hooks/
    useMister.ts                    # consume MisterProvider context
    useMisterStream.ts              # SSE consumption + history trim
    useInquiryForm.ts
  lib/
    supabase/client.ts
    supabase/server.ts
    notifications/whatsapp.ts
    notifications/email.ts
    claude.ts
    mister/                         # systemPrompt, buildContext, tools, guardrails, rateLimit, stage, archetype, fallback-actions, waterfall-segments, motion, client
    routing.ts
    utils.ts
  types/
    database.ts
    mister.ts
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

Supabase Postgres. Tables: `categories`, `products`, `leads`, `mister_projects`, `mister_contacts`, `mister_documents`, `mister_quote_tokens`, `notification_log`.

Read `/spec/data-model.md` for complete schema SQL, RLS policies, and TypeScript types.

Key rules:
- All inserts to `leads` and `mister_projects` happen via API routes using service role key
- Client code uses anon key and can only read `categories` and `products`
- `leads` table has no public read policy — ops-only via service role

---

## Homepage Routing Logic

The homepage has ONE unified entry: category grid + search bar.

```
Standard category tile clicked → /catalogo/[category-slug]
"Importación Personalizada" tile clicked → /mister
Search bar with catalog keyword → /catalogo/[matching-category]?q=[query]
Search bar with sourcing keyword → /mister?context=[query]
Search bar with HS code (4-8 digits) → /mister?context=[query]
Ambiguous search → /catalogo?q=[query] (with Mister CTA visible)
```

Routing logic lives in `src/lib/routing.ts` as `detectSearchIntent()`.

---

## Mister — How It Works (v2)

Mister is the indexed-range trade-intelligence layer (it REPLACED the old TPR -> CIF-estimate flow).

1. User opens `/mister` (embedded mode) or the floating launcher (site-wide). First induction message renders immediately.
2. User types -> POST `/api/mister` (streaming SSE). Server: validates, sanitizes (injection guard), IP rate-limits, atomic `in_flight` burst guard, pre-resolves backend context, calls `claude-sonnet-4-6` with a cached static system prompt + per-turn `<<MISTER_CONTEXT>>`.
3. The model emits visible text plus ONE fenced ```mister``` control block: `{ quick_actions[3], surfaces[], state{archetype,stage}, collected{patch} }`.
4. HOLD-BACK guardrail: the full response is buffered and `validateOutput()`-scanned (EN+ES price + availability) BEFORE any token is emitted — a price can never reach the client. On violation, the turn is replaced with a routing message.
5. Server streams validated text as `token` events, then `surface` / `actions` / `state` / `done` events. Surfaces render via `SurfaceRenderer`.
6. State persists to `mister_projects` (archetype, archetype_history, stage, collected, history[<=50], turn_count, flags). `collected` comes from the control block only — no second model call.
7. Escalation: quotation form (`/api/mister/quote` -> prefill token), WhatsApp (+50760250735), or human contact card. A5 (wholesale) is always human-mediated at pre-qual.

Hard rules (enforced at prompt + tool-schema + type level): no absolute price/availability/lead-time ever; indexed ranges only (always [low, high] with a disclaimer); no `fetchPrice`/`getLeadTime`/`fetchStock`/`getAvailability` tool exists; route when uncertain.

System prompt: `src/lib/mister/systemPrompt.ts` (`MISTER_STATIC_PROMPT`, brief Deliverable 3 verbatim, sent as a cached block). Full spec: `spec/ENRICHED_SPEC.md`.


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

## CIF / Pricing — REMOVED from the Mister surface

The old `cif-calculator.ts` absolute-USD CIF flow has been retired from Mister (decision A — REPLACE). Mister now educates on cost STRUCTURE only, via `LandedCostWaterfall`, using indexed ranges on base 100 — there is no code path that renders an absolute currency value (enforced at the TypeScript type level in `src/types/mister.ts`: `WaterfallSegment` requires paired `indexLow`/`indexHigh` + a required `disclaimerId`; the total is a computed band, never a scalar prop). Indexed segment data lives in `src/lib/mister/waterfall-segments.ts`. `duty-rates.ts` may persist only as reference data for indexed duty ranges — never to produce an absolute figure.


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
