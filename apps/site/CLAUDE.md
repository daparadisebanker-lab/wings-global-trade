# apps/site — Wings Global Trade (the live site)

The Wings Global Trade B2B trade-intelligence site: the live app of the ecosystem
monorepo. Not yet split into lanes — see the root `CLAUDE.md` (ecosystem law) for the
family-wide framework, token tiers, and repository map. This file is the site-specific
law that extends it. Production, with real users.

Two flows, no cart / checkout / payment / accounts — the platform converts visitors
into documented leads delivered to Wings ops via WhatsApp + email:

1. **Catalog** — browse curated inventory, submit an inquiry (RFQFlow). Conversion = form submission.
2. **Mister (v2)** — AI trade-intelligence layer. Inducts to one of 5 archetypes, guides discovery → consideration → pre_qualification → support, teaches landed-cost STRUCTURE via indexed ranges (base 100). **Never shows an absolute price, availability, or lead time.** Conversion = quotation / WhatsApp handoff / document download.

## Commands (from the monorepo root)
- `pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint` — proxy to `--filter site`.
- `pnpm swap-test` — asserts the shared packages import nothing from `apps/*`.
- Product seed pipeline is Python: `python infrastructure/scripts/generate-sql-seed.py` (reads root `data/`).

## Stack
Next.js 15 App Router · TypeScript everywhere · Tailwind (reads CSS custom
properties) · Supabase (Postgres + Storage) · Anthropic `claude-sonnet-4-6` (Mister
SSE) · Resend · Twilio WhatsApp · Vercel · pnpm. No auth.

## Conventions
- TypeScript only. `pnpm` only. Functional components + hooks. Tailwind utilities only, no inline styles.
- Absolute imports via `@/` (resolves within `apps/site/src`).
- Supabase service-role key only in server code (`apps/site/src/app/api/**`). Anon client reads only `categories` + `products`. RLS on every table.
- All Claude API calls server-side only; key never in the client bundle.
- Async errors always handled, never silently swallowed. Secrets only in `apps/site/.env.local` (git-ignored).

## Shared organs & tokens (post-migration)
- UI primitives (`Input`/`Textarea`/`Select`/`Button`/Toast) live in `@wings/trade-ui`; `components/ui/*` re-export them. Organs `SpecSheet`, `TrustFooter`, `RFQFlow` also come from `@wings/trade-ui`. Don't re-implement — theme via tokens or extend the organ's props.
- The Mister client contract + `useMisterStream` live in `@wings/mister`; `@/types/mister` and `@/hooks/useMisterStream` are re-export seams — import through them, unchanged.
- Design tokens: Tier-1 `packages/ui/tokens/skeleton.css` (frozen) + Wings `packages/liveries/wings/livery.css` (Tier-2), consumed by `src/app/globals.css`. Brand `:root` vars reference `var(--livery-*)`. Never hardcode a brand hex in a new component.

## Copy rules
Spanish, no exclamation marks, specific over generic, tone technical/direct/trustworthy.

## Brand & type
Navy `#001E50` · Gold `#C4933F` · Warm-white `#F8F6F0`. Section alternation navy ↔
warm-white, never two same-color sections adjacent, footer always navy. Fonts
(self-hosted in `apps/site/public/fonts/`, no Google Fonts): NissanOpti display
(weight 400 only — never 300), Flexo body (100–900), Teko labels. Variables
`--font-display`/`--font-body`/`--font-mono` set in `globals.css :root`.

## Mister — how it works (v2) · DANGER ZONE
1. `/mister` (embedded) or the floating launcher. First induction message renders immediately.
2. User types → POST `/api/mister` (SSE). Server validates, sanitizes (injection guard), IP rate-limits, atomic `in_flight` burst guard, pre-resolves context, calls the model with a cached static system prompt + per-turn `<<MISTER_CONTEXT>>`.
3. Model emits visible text + ONE fenced ` ```mister ` control block: `{ quick_actions[3], surfaces[], state{archetype,stage}, collected{patch} }`.
4. **HOLD-BACK guardrail**: the full response is buffered and `validateOutput()`-scanned (EN+ES price + availability) BEFORE any token emits — a price can never reach the client. On violation the turn is replaced with a routing message.
5. Server streams validated `token` events, then `surface`/`actions`/`state`/`done`. Surfaces render via `SurfaceRenderer`.
6. State persists to `mister_projects` (archetype, archetype_history, stage, collected, history[≤50], turn_count, flags). `collected` comes from the control block only — no second model call.
7. Escalation: quotation form (`/api/mister/quote` → prefill token), WhatsApp (+50760250735), or human contact card. A5 (wholesale) is always human-mediated at pre-qual.

**Hard rules — never change without asking:** no absolute price / availability /
lead-time ever; indexed ranges only (paired `indexLow`/`indexHigh` + required
`disclaimerId`, total is a computed band, never a scalar); no
`fetchPrice`/`getLeadTime`/`fetchStock`/`getAvailability` tool exists; route when
uncertain. System prompt: `src/lib/mister/systemPrompt.ts`. Server/guardrail code
(`app/api/mister/*`, `lib/mister/{guardrails,systemPrompt,tools,client,stage,…}`)
stays in `apps/site` — it was NOT moved to `@wings/mister` (client surface only).

## CIF / pricing — removed from Mister
The old absolute-USD CIF flow is retired. Mister teaches cost STRUCTURE only via
`LandedCostWaterfall` with indexed ranges on base 100 — no code path renders an
absolute currency value (enforced at the type level in the `@wings/mister`
`WaterfallSegment` type). `duty-rates.ts` is reference data only, never an absolute figure.

## Notification flow
1. API route receives valid submission. 2. Insert to Supabase (service role) — MUST
succeed first. 3. `sendWhatsAppNotification` (fire-and-forget, errors logged not
thrown). 4. `sendEmailNotification` (same). 5. Return 201. In non-prod
(`VERCEL_ENV !== 'production'`): log payload to console, skip Twilio/Resend.

## API error pattern
Zod-validate; on `ZodError` → 400 `{ error:'Datos inválidos', code:'VALIDATION_ERROR', details }`;
else `console.error('[route-name]', error)` → 500 `{ error:'Error interno del servidor', code:'INTERNAL_ERROR' }`.
Never expose raw errors, Supabase errors, or stack traces to the client.

## Database
Supabase Postgres. Tables: `categories`, `products`, `leads`, `mister_projects`,
`mister_contacts`, `mister_documents`, `mister_quote_tokens`, `notification_log`.
Full schema/RLS/types: `spec/data-model.md`. Never touch `supabase/migrations/`, any
`mister_*` table, or Mister guardrail/hold-back code paths without asking.

## Verification
`pnpm build` green from root; then drive the real flow: load `/`, a category grid, a
product detail; run a full Mister conversation (SSE stream → control block → surfaces
→ quotation prefill, price always "A cotizar"); submit one catalog inquiry + one
contact lead (non-prod payloads log to the server console). `spec/` outranks `docs/`;
`docs/build-history/` is superseded (the Accio absolute-price CIF flow is retired).
