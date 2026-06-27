# MISTER — ENRICHED MASTER SPEC (Builder's single source of truth)

**Synthesized by the Conductor from 12 council contributions + MISTER_MASTER_BRIEF.md**
**Session:** mister-v2-20260627 · **Decision:** A — REPLACE (the indexed-range trade-intelligence Mister supersedes the CIF-estimate calculator)
**Status:** Build authoritative. Where this doc and a contribution disagree, THIS doc wins. Where this doc is silent, the named contribution is authoritative.

> Authoritative source files (read directly when building the relevant area):
> - Visual: `spec/contributions/designer.md`
> - Copy: `spec/contributions/copywriter.md`
> - UX: `spec/contributions/experience.md`
> - Motion: `spec/contributions/animator.md`
> - IA / state machine: `spec/contributions/ia-architect.md`
> - AI architecture: `spec/contributions/ai-engineer.md`
> - Financial display: `spec/contributions/finance.md`
> - Learning UX: `spec/contributions/educator.md`
> - Engagement: `spec/contributions/game-designer.md`
> - SEO/AEO: `spec/contributions/seo-agent.md`
> - Brand: `spec/contributions/brand-strategist.md`
> - Campaign: `spec/contributions/campaigner.md`
> - Product brief: `spec/MISTER_MASTER_BRIEF.md`

---

## 1. BUILD CONTEXT

### 1.1 What exists (live, on Vercel)
The deployed Mister at `/mister` is a **TPR → CIF-estimate** flow (the OLD product):
- `src/components/features/mister/`: `MisterChat.tsx`, `MisterCanvas.tsx`, `MisterWaveform.tsx`, `MisterInput.tsx`, `MisterMessage.tsx`, `MisterSubmitForm.tsx`; `src/components/features/shared/MisterDeadEnd.tsx`
- `src/hooks/useMisterChat.ts`, `useMisterWaveform.ts` (+ `useTprState`, `useCifEstimate` referenced in CLAUDE.md)
- `src/app/api/mister/chat/route.ts`, `estimate/route.ts`, `submit/route.ts`
- `src/lib/mister-knowledge.ts`, `src/lib/cif-calculator.ts`, `src/lib/duty-rates.ts`, `src/lib/claude.ts` (`MISTER_SYSTEM_PROMPT`)
- `src/types/mister.ts`
- Model: `claude-haiku-4-5` (chat) + `claude-sonnet-4-6` (estimate)
- DB: `mister_projects` (formerly `accio_projects`), `leads`, `categories`, `products`, `notification_log`

### 1.2 Decision A — what changes
The new Mister is the **indexed-range trade-intelligence layer** from `MISTER_MASTER_BRIEF.md`. It **NEVER renders an absolute price** — only indexed ranges on base 100. Therefore:
- **RETIRE from the Mister surface:** `CifEstimateCard`, `src/lib/cif-calculator.ts`, `useCifEstimate`, `/api/mister/estimate`. (Removing absolute-USD output is the entire point of decision A.) Mark deprecated/removed; do not leave them wired into any Mister path. `duty-rates.ts` may remain only as reference data for indexed duty ranges, but no code path may produce an absolute duty figure.
- **REBUILD** the component tree and API per the brief (Deliverable 7) and the contributions.
- **MODEL:** `claude-sonnet-4-6` for the conversation (the brief mandates it). No second pricing/estimation model call.

### 1.3 Hard, non-negotiable constraints (enforced at type + prompt + server level)
1. No absolute price/total/FOB/CIF/DDP figure, ever. Indexed ranges only, always `[low, high]`, always with a disclaimer.
2. No availability/lead-time speculation. Route to human.
3. Route when uncertain. Ambiguity = escalation, not invention.
4. No tool exists that returns a quotable number (`fetchPrice`/`getLeadTime`/`fetchStock`/`getAvailability` are deliberately absent — architectural anti-price guarantee).
5. One resolved `archetype` per session; tone/content adapt to it.

### 1.4 Conventions (project CLAUDE.md — non-negotiable)
TypeScript strict everywhere · pnpm only · functional components · Tailwind utilities only (CSS vars for tokens; no inline styles) · `@/` absolute imports · 2-space · camelCase/PascalCase/kebab-case · async errors always handled · secrets only in `.env.local` · Supabase service-role key server-side only · RLS on every table · Claude key server-side only · UI copy es-PE primary (EN parity strings provided) · no exclamation marks · no emojis.

### 1.5 RESOLVED font decision (was a 3-way conflict)
Mister inherits the **live repo font variables**: `--font-display` (NissanOpti, weight 400 only), `--font-body` (Flexo, full range), `--font-mono` (Teko, condensed, 300–700). **No new `next/font` imports. Never use `--font-playfair` (dead).** Ignore the global CLAUDE.md Cormorant/DM Sans stack and the IBM Plex Serif spec-doc stack — the live globals.css is the truth. The existing `.mister` Teko legibility-floor override in globals.css is correct; do not alter it.

---

## 2. VISUAL SYSTEM (designer + brand-strategist — authoritative: designer.md)

### 2.1 Visual thesis
**"A certified trade document that happens to respond in real time."** Brand thesis: every pixel Mister owns is indistinguishable from a certified trade document in the hands of a very senior specialist. This is testable: screenshot a MisterMessage, print it — does it read as a certified trade document? If no, it's wrong.

### 2.2 Killed (chatbot conventions — do not build any of these)
Rounded bubble messages · AI avatar · ellipsis typing indicator · pastel quick-action chips · any "friendly chatbot" element · gradients/glow inside the window · emoji.

### 2.3 The single distinctive decision — Document Entry Format
Every assistant message carries a two-digit **turn index** ("01","02"…) in a fixed 32px left-margin column (Teko 300 11px, `--mister-text-ghost`), with a 2px vertical gold rule (`--mister-rule-assistant`) running the message height at x=24px. The transcript reads as a numbered consultation record. User messages are warm-paper right-aligned rectangular blocks (max 72% width). No avatars, no name labels — the left-rule + warm paper ARE the identity signals.

### 2.4 Color tokens — paste into `:root` in `src/styles/globals.css` after existing Phase 2A tokens
```css
/* Mister Design Tokens — extend Wings Phase 2A · source: spec/contributions/designer.md */
:root {
  /* Window structure */
  --mister-bg-window:#000C1F; --mister-bg-header:#001E50; --mister-bg-composer:#000C1F;
  --mister-bg-inset:#040F22; --mister-bg-message-user:#F0EDE6; --mister-bg-hover-subtle:rgba(248,246,240,0.03);
  /* Text — dark */
  --mister-text-primary:#F8F6F0; --mister-text-secondary:rgba(248,246,240,0.60);
  --mister-text-muted:rgba(248,246,240,0.35); --mister-text-ghost:rgba(248,246,240,0.15);
  /* Text — warm paper */
  --mister-text-user:#001E50; --mister-text-user-muted:rgba(0,30,80,0.35);
  /* Gold — semantic */
  --mister-gold:#C4933F; --mister-gold-annotation:rgba(196,147,63,0.75);
  --mister-gold-rule:rgba(196,147,63,0.15); --mister-gold-rule-strong:rgba(196,147,63,0.30);
  --mister-gold-fill:rgba(196,147,63,0.06); --mister-gold-fill-active:rgba(196,147,63,0.10);
  --mister-gold-duties:rgba(196,147,63,0.08);
  /* Borders */
  --mister-border-window:rgba(196,147,63,0.15); --mister-border-surface:rgba(248,246,240,0.10);
  --mister-border-row:rgba(248,246,240,0.06); --mister-border-input:rgba(248,246,240,0.12);
  --mister-border-focus:rgba(196,147,63,0.50);
  /* Message left rules */
  --mister-rule-assistant:rgba(196,147,63,0.18); --mister-rule-assistant-hover:rgba(196,147,63,0.40);
  /* Quick actions */
  --mister-qa-border:rgba(196,147,63,0.22); --mister-qa-border-hover:rgba(196,147,63,0.55);
  --mister-qa-bg-hover:rgba(196,147,63,0.06);
  /* LandedCostWaterfall */
  --mister-wf-bg:#001040; --mister-wf-strip-product:rgba(248,246,240,0.08);
  --mister-wf-strip-freight:rgba(248,246,240,0.06); --mister-wf-strip-insurance:rgba(248,246,240,0.04);
  --mister-wf-strip-duties:rgba(196,147,63,0.08); --mister-wf-strip-lastmile:rgba(248,246,240,0.04);
  --mister-wf-separator:rgba(196,147,63,0.12); --mister-wf-base:#C4933F; --mister-wf-value:#F8F6F0;
  --mister-wf-total-separator:rgba(196,147,63,0.30);
  /* Launcher */
  --mister-launcher-bg:#001040; --mister-launcher-border:rgba(196,147,63,0.22);
  --mister-launcher-border-hover:rgba(196,147,63,0.55);
  /* Status */
  --mister-status-unresolved:rgba(248,246,240,0.25); --mister-status-resolved:#C4933F; --mister-status-captured:#C4933F;
  /* Elevation */
  --mister-shadow-window:0 8px 48px rgba(0,0,0,0.40),0 0 0 1px rgba(196,147,63,0.12);
  --mister-shadow-surface:0 2px 12px rgba(0,0,0,0.24);
  /* Spacing */
  --mister-space-xs:4px; --mister-space-sm:8px; --mister-space-md:16px; --mister-space-lg:20px;
  --mister-space-xl:28px; --mister-space-message-group:20px; --mister-space-message-internal:8px; --mister-space-same-role:4px;
  /* Window dims */
  --mister-window-width:420px; --mister-window-height:680px; --mister-window-header-height:48px;
  --mister-window-composer-height:56px; --mister-launcher-width:96px; --mister-launcher-height:36px; --mister-margin-column:32px;
}
```

### 2.5 Typography (full scale in designer.md §3)
- **NissanOpti** (`--font-display`, weight 400 only): product-name headers inside surfaces ONLY (ProductCard 18px, SpecSheet title 20px, ComparisonView col header 15px). Not the window title, not CTAs.
- **Flexo** (`--font-body`): all conversational/human text — assistant msg 14px/1.65, user msg 14px/1.50, quick-action label 12px/500, CTA label 13px/600 navy-on-gold, tooltips 11px/300.
- **Teko** (`--font-mono`, tabular-nums always): all numbers/codes/labels — window title "MISTER" 13px/500/0.12em upper, turn index 11px/300, waterfall values 16px/500, waterfall total 20px/700, HS/Incoterm inline 13px, eyebrows 10px/500 upper.

### 2.6 Component aesthetic (full detail designer.md §4 — build to these)
- **MisterLauncher:** 96×36px rectangular tab (NOT a circle/pill), bottom-right 24px, navy-dark bg, 1px gold border, "MISTER" Teko upper. 4px gold square corner-marker appears once archetype resolved. radius 2px. Only border-color transitions.
- **MisterWindow:** floating 420×680 (mobile: full-width − 16px gutters, full-height − 80px) / embedded full-width natural height. bg `--mister-bg-window`, 1px `--mister-border-window`, **radius 0**, shadow only floating. No backdrop blur. Structure: Header | MessageList | QuickActions(floated bottom of list) | Composer.
- **MisterHeader:** 48px, navy bg, 1px gold bottom rule. Left: "MISTER" + "by Wings Global Trade" (10px muted). Right: session ref "WGT-XXXX" (ghost→gold on resolve) + 4px gold square + minimize (−) + close (×), 1px strokes, no fill. No logo mark.
- **MisterMessage assistant:** 32px left-margin column with turn index + 2px gold left-rule; transparent bg; Flexo 14px/1.65; inline numbers switch to Teko 13px; trade terms first-use get gold underline; timestamp Teko 9px ghost bottom-right; no avatar/name.
- **MisterMessage user:** right-aligned, max 72%, warm-paper `#F0EDE6` bg, navy text, radius 0, no border.
- **MisterQuickActions:** 3 transparent tags, 28px tall, 1px gold border, radius 2, Flexo 12px/500, no icons. Hover bg+border gold. Aligned to message content (offset past margin column).
- **MisterComposer:** 56px, top 1px gold rule (→ strong on focus), bg flush with window, bare input (no element border), bare "→" send (Teko 16px, muted→gold when text present).
- **ProductCard / ComparisonView / SpecSheet / MoqTable / ContactCard / DocumentLink / QuotationForm CTA:** document-grammar surfaces, `--mister-bg-inset`, 1px surface borders, radius 0, header bands navy + gold rule. ContactCard gets 3px gold left accent (it IS the handoff). QuotationForm CTA: pre-fill summary strip (Teko collected fields) + full-width 44px gold button navy text "Generar cotización prefilled" + "<24h" subline. Full specs designer.md §4.
- **LandedCostWaterfall (signature):** see §8.

### 2.7 Grid/spacing — designer.md §5
Window h-padding 20px; left margin column 32px; content width = window − 20 − 32 = 368px floating. Spacing tokens above.

---

## 3. COMPLETE COPY (copywriter — authoritative: copywriter.md; financial copy reconciled with finance.md)

All user-facing strings exist es-PE (primary) + EN in copywriter.md. Builder lifts strings from there. Key indexed items:
- **Q0 opening** (induction): elevated version in copywriter.md (canonical verb "route"). EN + es-PE.
- **20 CTAs** (5 archetypes × 4 stages) with firing conditions — copywriter.md.
- **60 quick-action labels** (3 × 4 stages × 5 archetypes) as lift-ready string tables — copywriter.md. These feed both the model's `quick_actions` and the 25-set fallback (§7.4).
- **Empty/error/placeholder states** including the guardrail-deflection message ("I don't generate prices — that's by design, not a limitation" + Schwartz-style benefit close) — copywriter.md.
- **Financial copy:** waterfall header/footer/segment labels/tooltips/micro-disclaimer + the 5 DisclaimerId strings. CANONICAL strings live in finance.md §2/§11 and `WATERFALL_COPY`; copywriter.md improved `duties`/`handoff` wording — use the finance.md `DISCLAIMERS` record values (already incorporate the HS/SUNAT + active-construction improvements). es-PE display strings from copywriter.md.
- **Voice rules:** 5 ALWAYS / 5 NEVER (paste into system-prompt annotation + QA rubric) — copywriter.md.
- Copy rules: es-PE default, no exclamation marks, no emoji, lead with the answer.

---

## 4. UX FLOWS (experience — authoritative: experience.md; journeys also in ia-architect.md)

- **5 archetype journeys** mapped beat-by-beat (entry → induction → discovery → consideration → pre-qual gate → escalation/handoff) in experience.md. A5 is ALWAYS human-mediated at pre-qual (no auto-quote path).
- **Floating vs embedded:** embedded pre-binds `current_product`, compresses induction to one product-anchored question, skips induction for returning sessions; floating runs full induction from zero context.
- **Mobile:** drawer opens upward from bottom; keyboard active suppresses swipe-to-close; quick actions pinned above composer at bottom of scrollable transcript; narrow screens scroll the action row horizontally (do not wrap). Build on existing repo mobile keyboard/drawer/dvh fixes.
- **Trust architecture:** six sequential mechanisms (expertise-before-answer induction Q; precise follow-ups proving retention; externalized session memory; price-refusal+waterfall converting disappointment to understanding; naming limits to build credibility; pre-filled handoff proving the session's value). experience.md.
- **Friction audit:** 9 abandonment points + design response. Highest risk: (a) price refusal and (b) handoff-feels-like-a-drop — BOTH require response + recovery in the SAME turn (waterfall appears WITH the refusal; system message appears WITH the WhatsApp link).
- **THE single most important moment:** the first `LandedCostWaterfall` render in response to a price question. It must arrive as the same SSE surface event that closes the streaming reply (no extra turn), Mister must name the user's dominant cost driver (specific to `collected`, not generic), and the 3 quick actions are `explain_cost`, `open_quotation`, `connect_whatsapp` in that order.

---

## 5. MOTION SYSTEM (animator — authoritative: animator.md; variants exported to `src/lib/mister/motion.ts`)

- **Personality:** Deliberate. Weighted. Final. Banned: overshoot, spring, bounce, hover-scale. Test: would a senior specialist find this appropriate laying a document on a desk?
- **Easings (7):** message-appear `cubic-bezier(0.20,0,0,1)` … window-close `cubic-bezier(0.55,0,1,0.45)` (full set animator.md).
- **Durations (8):** instant 80ms → waterfall 480ms; nothing exceeds 480ms.
- **Typing indicator: eliminated.** The existing `MisterWaveform` (canvas sine) is the sole ambient processing signal; amplitude lerps to ~0 during streaming. Streaming uses a CSS-only gold blinking cursor that disappears on completion.
- **LandedCostWaterfall signature build:** 5 strip segments animate `scaleX` from `originX:0`, 45% overlap stagger, ~1.54s total; breakdown rows enter in sync with their bars; total band appears only after all 5 rows; duties segment fires ONE opacity pulse `[0.08,0.20,0.08]` at ~1.3s (the only secondary animation in the system).
- **prefers-reduced-motion:** every variant exposes a reduced path (translate→0, duration 0–80ms); waveform draws static line. A `useReducedMotion` hook wraps Framer's detection. CSS transitions stay at 0.15s ease (per designer), never converted to Framer.
- All Framer Motion variant objects are in animator.md — implement them verbatim into `src/lib/mister/motion.ts`.

---

## 6. IA & STATE MACHINE (ia-architect — authoritative: ia-architect.md)

- **Two dimensions:** 5 archetypes × 4 stages (+ unresolved archetype, + greeting/induction pre-stage). 25 archetype×stage combos fully mapped.
- **Stage machine:** greeting/induction → discovery → consideration → pre_qualification → support/handoff, with explicit transition conditions (discovery exits on intent+constraint clear; consideration exits on education-complete or escalation-trigger; pre-qual exits on minimum fields per archetype; escalation can bypass remaining stages). **Stage is model-declared in the control block (§7), server-validated** — not pure heuristic.
- **Information node taxonomy (8):** PRODUCT, SPEC, COMPARE, LOGI, MOQ, QUOTE, CONTACT, CAL — each with archetype+stage access rules, render component, required disclaimers, surfacing rules (MOQ only A4/A5 at consideration+; QUOTE only at pre-qual or escalation).
- **Quick-action selection:** rank 3 from the 10-action library per archetype×stage (firing-condition table in ia-architect.md). The model proposes 3 in the control block; server validates against the table and falls back to the 25-set map if missing/invalid.
- **Archetype resolution:** deterministic Q0–Q3 tree (brief Deliverable 1) resolves ~99% in 2–3 turns; strong-signal fast-paths ("I move freight" → A3); model-assisted fallback for >3-turn low-confidence; silent re-classification on contradictory signals, logged to `archetype_history[]`.
- **Escalation routing matrix:** 10 trigger types × archetype × stage → destination (sales / project specialist / logistics broker / partnerships / key-accounts / quotation / document / meeting). A5 always escalates to a human at pre-qual. Full matrix in ia-architect.md.

---

## 7. AI ARCHITECTURE (ai-engineer — authoritative: ai-engineer.md; CONDUCTOR RATIFICATIONS below override where they conflict)

Implement the brief Deliverable 7 + ai-engineer.md, with these **ratified decisions (LAW):**

### 7.1 The Mister Control Block (resolves tool-model + stage + collected, risks #1/#5/#6)
The model emits ONE fenced JSON control block at the END of every turn:
```
```mister
{
  "quick_actions": [ {"label":"…","action":"<action_id>"}, …3 ],
  "surfaces":      [ {"type":"product|comparison|specs|moq|waterfall|document|contact","ref":"<id-or-key>"} ],
  "state":         {"archetype":"…","stage":"…"},
  "collected":     { /* patch of newly learned MisterCollected fields */ }
}
```
```
Server flow per turn: validate session → atomic burst-guard (§7.7) → load `mister_projects` → **server-side pre-resolve likely nodes** (current product, archetype contacts, MOQ if A4/A5, etc.) into `<<MISTER_CONTEXT>>` → call `claude-sonnet-4-6` (system cached + context uncached) → stream tokens with hold-back guardrail scan (§7.5) → at stream end parse the `mister` control block → resolve `surfaces[].ref` to payloads via tools (server-side) → emit `surface` events, then `actions`, then `state`, then `done` → persist turn + merge `collected` patch + apply archetype/stage + `archetype_history` on change. No second Anthropic call for extraction. Tools run server-side only; NO price/availability tool exists.

### 7.2 SSE event format (brief 7.2)
`event: token {"delta":"…"}` · `event: surface {"type":"…","payload":{…}}` · `event: actions {"quickActions":[…3]}` · `event: state {"archetype":"…","stage":"…"}` · `event: done {"messageId":"…"}` · `event: error {"code":"…","message":"…"}`. The `mister` control fence is stripped from the streamed visible text (hold-back buffer prevents it leaking to UI).

### 7.3 History trim (risk #2)
Send last **15 turns** to the model; **store last 50 turns** in `mister_projects.history` (hard cap); older context collapses into `collected`. `trimHistory(messages, 15)` per ai-engineer.md.

### 7.4 Quick-action fallback (risk #3)
Complete **25-set** fallback map (5 archetypes × 5 stages incl. unresolved) in `src/lib/mister/fallback-actions.ts`, populated from copywriter.md's 60 labels + unresolved set. If the control block omits/invalidates `quick_actions`, server injects the fallback for the current archetype×stage. Missing even one set is a build-blocker.

### 7.5 Guardrails — hold-back scan (risk #4; NOT stream-then-replace)
`src/lib/mister/guardrails.ts`. Stream tokens through a **hold-back buffer**: only flush text confirmed clean; withhold any trailing partial that could be forming a currency/number/lead-time token until the next token disambiguates. Patterns (EN+ES):
- Price: `/\b(US?\$|S\/\.?|USD|PEN|EUR)\s?\d/i`, `/\d[\d.,]*\s?(soles|dólares|euros)\b/i`
- Lead-time/availability: `/(en|in)\s+\d+\s+(días|semanas|days|weeks)/i`, `/(en stock|in stock|disponibles?\s+(ahora|hoy))/i`
On match mid-stream: stop flushing, discard the violating span, regenerate once with a corrective instruction; if it matches again, replace the turn with the routing message + `open_quotation`/`connect_whatsapp` surface. Log to `mister_projects.flags[]`. A price must never reach the client even briefly. Indexed `[low,high]` patterns are explicitly allowed (scope the regex to currency symbols/words, not bare bracketed indices — the waterfall must not trip the scan).

### 7.6 Prompt caching
`system: [ {type:'text', text: STATIC_SYSTEM_PROMPT, cache_control:{type:'ephemeral'}}, {type:'text', text: renderContextBlock(ctx)} ]`. Static = brief Deliverable 3 verbatim (in `src/lib/mister/systemPrompt.ts`); dynamic = `<<MISTER_CONTEXT>>` (uncached).

### 7.7 Burst guard + rate limit (risk #7)
Atomic: `UPDATE mister_projects SET in_flight=true WHERE id=$1 AND in_flight=false RETURNING id` — no row → 409. Clear `in_flight` in a `finally`. Per-session 40 turns (soft nudge at 30). Per-IP via Upstash/Vercel KV: 20/min, 300/hr, key `mister:rl:ip:{ip}` → 429 with polite SSE error. `src/lib/mister/rateLimit.ts`.

### 7.8 Supabase schema (ai-engineer.md has full DDL — apply via migration)
`mister_projects`: `id uuid pk`, `session_id uuid unique`, `archetype text`, `archetype_history jsonb default '[]'`, `stage text`, `locale text default 'es-PE'`, `collected jsonb default '{}'`, `history jsonb default '[]'` (≤50 turns), `turn_count int default 0`, `in_flight boolean default false`, `flags jsonb default '[]'`, `current_product_id text null`, `created_at/updated_at timestamptz`. Reuse existing `products`/`categories` for content; add doc/contact/moq tables if needed. RLS ON all; service-role-only writes; anon may read only `categories`/`products`. `lead_flow` enum: add `'mister'` value in a standalone migration deployed atomically with code (risk #8 — document in runbook).

### 7.9 Env vars (`.env.local`)
`ANTHROPIC_API_KEY`, `MISTER_MODEL=claude-sonnet-4-6`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (or Vercel KV), `RESEND_API_KEY`, `TWILIO_*`, `TWILIO_WHATSAPP_TO=+50760250735`. Full template in ai-engineer.md; never commit; `.gitignore` already covers `.env.local`.

### 7.10 Tools (brief 7.4 — server-side, NO price tools)
`fetchProduct`, `preloadComparison`, `triggerQuotationForm` (returns formUrl + prefillToken, never a price), `fetchContact`, `fetchDocument` (`available:false` → escalate). In `src/lib/mister/tools.ts`.

### 7.11 Error handling
Every async failure has a user-facing SSE `error` event with a copywriter.md string (rate-limited, connection-lost, no-product, internal). Never leak Supabase/stack traces. `extractCollected` is eliminated (collected now comes from the control block) — no silent-stale failure mode.

---

## 8. FINANCIAL DISPLAY (finance — authoritative: finance.md; types in `src/types/mister.ts`, data in `src/lib/mister/waterfall-segments.ts`)

The structural anti-price guarantee is the brand made code:
- `WaterfallSegment` requires BOTH `indexLow` AND `indexHigh` (no single-value field) AND a required `disclaimerId`. Constructing a point estimate or an undisclaimed segment is a **compile error**.
- `LandedCostWaterfall` total is **computed** `[Σlow, Σhigh]` and rendered as a band. No scalar `total`/`totalCif`/`priceInUsd` prop exists.
- `DISCLAIMERS: Record<DisclaimerId,string>` is the single source of truth (5 ids: illustrative/range/duties/fx/handoff) — use the exact strings in finance.md §8.
- 5 segment constants (PRODUCT 100–100, FREIGHT 8–15, INSURANCE 1–3, DUTIES 12–28 gold-tinted, LASTMILE 2–6) with Bloomberg-precise labels + teacher tooltips + driverNotes — finance.md §4.
- `COST_DRIVERS[]` (5: volume/incoterm/destination_port/container_type/currency) with impact + explanation — finance.md §6.
- `IndexComparisonView` (exactly 2 scenarios + delta callout naming the primary driver, never a currency delta) — finance.md §7.
- Per-archetype FRAMING (narrative only, never a number) — finance.md §10.
- Full type block + component API + validation rules — finance.md §8/§9/§13. Render visual per designer.md §4 (two-part: 24px indexed strip + breakdown table, gold only on BASE 100, stronger rule above the always-a-band total).
- **QA gate:** there must be no code path that renders an absolute currency value; verify at compile time and with a render test.

---

## 9. LEARNING UX (educator — authoritative: educator.md)

- **Checkpoints** are Mister's closing confirmation sentence beside a rendered surface ("¿eso calza con tu situación?") — never a quiz. 2–3 exact lines per archetype in educator.md.
- **Progression is invisible:** signaled by deeper questions, surfaces escalating in register (ProductCard→Waterfall→ContactCard), quick actions shifting educational→commercial (explain_cost→open_quotation), and Mister ceasing to define vocabulary the user now shares. No progress bars, no module announcements.
- **Progressive disclosure** = data-gate conditions on `collected` fields per module (gates listed in educator.md). A5 Module 4 is a human-routing gate, not an educational one — `open_quotation` is NEVER an A5 quick action.
- **4 support sub-lanes** (needs-assessment / custom-inquiry / document-library / price-deflection) each have exact entry trigger, in-lane behavior, exit/return — educator.md. Price-deflection = 2–4 sentences, render waterfall, state disclaimer once, convert to `open_quotation`.
- **Re-routing** is seamless and unannounced — one embedded reframing sentence; all `collected` carries forward; no question re-asked. Exact micro-copy per directional shift in educator.md.

---

## 10. ENGAGEMENT (game-designer — authoritative: game-designer.md)

- **Core loop:** progressive clarity (fog burning away) — each turn delivers recognition + specificity + forward motion. Dignified B2B; NO badges/points/confetti/celebration copy.
- **The ONE mechanic — the Live Session Brief:** a structured panel accumulating what Mister has learned (archetype, corridor, HS, Incoterm, docs held/needed, open fields) in professional intake format. Not a progress bar; the empty fields are the pull; the completed brief IS the handoff document. (Repurpose the existing `TprSheet` UI slot as the `SessionBrief` — do NOT resurrect TPR/CIF semantics.)
- **Progress signal:** lives in the brief's open fields and the CTA activation state (CTA inactive until per-archetype minimum pre-qual met, then activates without announcement). No percentages.
- **Variable reward = unexpected precision:** unprompted comparison surface; a document offered before asked; a targeted cost-driver call-out when the waterfall first renders; silent archetype re-resolution.
- **Re-engagement:** session continuity / save-state / WhatsApp continuity for returning abandoners.
- **Milestones** acknowledged by tonal shift + depth, never celebration: archetype resolved (sharper next message), first product (renders as evidence), first waterfall (renders with a specific insight), quotation (pre-filled form + 2-sentence handoff), human handoff (ContactCard + "they'll have the full picture before you speak").

---

## 11. SEO / AEO (seo-agent — authoritative: seo-agent.md)

- **Conversations: `noindex`** (ephemeral, personal). SEO value flows from published thought leadership + schema, not transcripts.
- `/mister` landing page: **indexed**, with metadata (EN + es-PE/hreflang), OG/Twitter, canonical. JSON-LD: `SoftwareApplication` + `FAQPage` (8 questions) on the landing page. Blocks ready in seo-agent.md.
- **AEO:** 19 keyword targets (es-PE + EN) + answer snippets to earn ChatGPT/Perplexity/Claude citations for landed-cost/Incoterm/SUNAT/corridor questions; 4-article blog roadmap (FAQPage schema each). Implement schema/metadata now; content is a roadmap.
- Session URL state (if any `?session=`): `noindex` meta. `robots.txt` allows `/mister` + `/blog`, blocks `/api`. Sitemap entries for `/mister` (0.9). All in seo-agent.md.

---

## 12. CAMPAIGN CONTEXT (campaigner — authoritative: campaigner.md)

- **Territory: "La Estructura"** — for the first time an importer walks into a quote already knowing what it should look like. The waterfall diagram is the creative hero.
- **Positioning line:** not "we built a chatbot" — "we made the structure of cost visible before anyone quotes you."
- **Moat:** Mister is architecturally prohibited from quoting (no `fetchPrice` function) — no competitor can say their tool is designed to educate rather than quote.
- Launch one-liners (EN + es-PE), 3 LinkedIn posts, full concept in campaigner.md. (Informs landing-page hero copy + meta description.)

---

## 13. BUILD PLAN (Phase 2) & QUALITY GATES

### Component tree to build (brief 7.1) under `src/components/features/mister/`
`MisterProvider` · `MisterLauncher` · `MisterWindow` (+`MisterHeader`) · `MisterMessageList` (+`MisterMessage`, `MisterStreamingMessage`) · `MisterQuickActions` · `MisterComposer` · `MisterEmbedded` · surfaces: `ProductCard`, `ComparisonView`, `SpecSheet`, `MoqTable`, `LandedCostWaterfall`, `IndexComparison`, `DocumentLink`, `ContactCard`, `QuotationFormCTA`, `SessionBrief`. Hooks: `useMister`, `useMisterStream`. Lib: `client.ts`, `tools.ts`, `guardrails.ts`, `archetype.ts`, `stage.ts`, `systemPrompt.ts`, `buildContext.ts`, `rateLimit.ts`, `fallback-actions.ts`, `waterfall-segments.ts`, `motion.ts`. API: `app/api/mister/route.ts` (new streaming endpoint). Retire old chat/estimate Mister paths; refactor `submit` to the new quotation/lead flow without CIF.

### Quality gates (ALL must pass before deploy)
- [ ] `pnpm build`: zero TS errors, zero `any`, zero `ts-ignore`
- [ ] All 5 tools implemented + typed; NO price/availability tool exists
- [ ] All 5 archetypes handled in system prompt (brief D3 verbatim)
- [ ] `LandedCostWaterfall`: no absolute-number code path (compile-time + render test)
- [ ] Rate limiting active on `/api/mister`; atomic burst guard
- [ ] `validateOutput()` covers price AND availability (EN+ES); hold-back scan; indexed brackets pass
- [ ] All copywriter strings in place (es-PE + EN)
- [ ] All animator animations implemented + reduced-motion fallbacks
- [ ] `CifEstimateCard` + `cif-calculator.ts` removed from the Mister surface (no Mister path imports them)

### Deployment
Stage on `feature/mister-v2`, build green, **then HOLD for user confirmation before production deploy** (replacing a live conversion feature is irreversible — conductor will not auto-fire prod). On user GO: `pnpm build` → Vercel production → `SHIPPING_REPORT.md` → commit `feat(mister): v1 — council build`.

*End ENRICHED_SPEC.md*
