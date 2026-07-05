# Measurement Plan — Wings Global Trade Meta Ads

**Status:** the site currently has NO Meta Pixel, no CAPI, no product analytics (only Vercel Analytics — confirmed by code search, `spec/success-metrics.md`). Workstream 0 below is a hard prerequisite: nothing launches until the event layer exists.

---

## 0. Prerequisite workstream — instrumentation (dev task, ~1–2 days)

**Do not modify Mister logic — only observe it.** All hooks below are additive.

1. **Meta Pixel** via a `<Script>` in `src/app/layout.tsx` (or Google Tag Manager if preferred). Respect a basic consent state; Peru's LPDP (Ley 29733) requires notice.
2. **Conversions API (server-side)** — the decisive piece, because the real conversions are already server-side API routes:
   - `POST /api/leads/catalog` 201 → CAPI `Lead` (content_category = category slug)
   - `POST /api/leads/contact` 201 → CAPI `Contact`
   - `POST /api/leads/multi` 201 → CAPI `Lead` (multi-inquiry)
   - `POST /api/mister/submit` 201 → CAPI `Lead` (source = mister)
   - Send `event_id` from client + server for deduplication. Hash email/phone (SHA-256) from the submission for match quality — these forms collect both (`MisterLeadSubmitRequest`, contact forms).
3. **Custom client events** (browser pixel), named to mirror the Mister state machine so Meta data and `mister_projects` rows reconcile:

| Event | Fired when | Source in code |
|---|---|---|
| `mister_open` | Mister window/page opened | `MisterProvider` / `/mister` page view |
| `mister_message_sent` | first user message in session | `useMisterStream` first POST |
| `mister_induction_complete` | `state.archetype` leaves `unresolved` (SSE `state` event) | archetype param attached |
| `mister_stage_advance` | SSE `state.stage` changes | param: stage |
| `mister_prequal_reached` | stage = `pre_qualification` | **the "completed diagnosis" event — Mister campaign's optimization target** |
| `mister_quote_opened` | `open_quotation` action / quote form surfaced | |
| `mister_whatsapp_handoff` | `connect_whatsapp` action clicked inside Mister | |
| `wa_click` | any `WhatsAppButton` / wa.me deep link click site-wide | `components/features/shared/WhatsAppButton.tsx` |
| `catalog_inquiry_start` | first field focus on inquiry form | matches funnel Stage 4 "Intent" in `spec/success-metrics.md` |
| `compare_add` | product added to comparison | `useComparison` |

4. **Domain verification + aggregated events config** in Business Manager; prioritize `Lead` > `mister_prequal_reached` > `wa_click`.
5. **UTM discipline:** `utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}` — persisted to the lead row (add a `source` JSONB to lead inserts if not present) so ops can see which ad produced which WhatsApp conversation.

---

## 1. KPI Tree

North Star (from `spec/success-metrics.md`): **Inquiry Conversion Rate ≥ 3%** and ≥ 10 leads/week by day 60. The ads program adopts the spec's targets and adds paid-specific layers:

```
Business
└─ Qualified leads/week (≥10 by day 60; spec) · Cost per qualified lead (CPL) {{TARGET_CPL}}
   ├─ PAID VOLUME
   │   ├─ CPM (Peru B2B baseline; watch by placement)
   │   ├─ CTR (link) ≥ 1.0% prospecting / ≥ 1.8% retargeting
   │   ├─ CPC (link) — diagnostic only
   │   └─ Landing rate (LP views / clicks) ≥ 80% — mobile perf is a real risk;
   │        spec CWV target LCP < 2.5s applies to ad landing pages
   ├─ SITE CONVERSION (paid traffic segment)
   │   ├─ Catalog ICR ≥ 4% warm / ≥ 1.5% cold paid
   │   ├─ Mister-page ICR ≥ 15% (spec) — paid target ≥ 8% cold
   │   └─ Mobile/desktop conversion parity ≥ 0.7 (spec)
   ├─ MISTER FUNNEL (paid segment)
   │   ├─ mister_open → mister_message_sent ≥ 60%
   │   ├─ message → induction_complete ≥ 70% (2–3 questions; brief §D1)
   │   ├─ induction → prequal_reached ≥ 25%
   │   └─ prequal → Lead/WhatsApp handoff ≥ 50%
   └─ LEAD QUALITY (ops feedback loop, weekly)
       ├─ % leads answering ops WhatsApp within 48h
       ├─ Archetype mix per campaign (from mister_projects.archetype)
       └─ Ops-rated quality (1–3 scale, manual, weekly WGT-ref sample)
```

CPL placeholders until budget known: seed with {{TARGET_CPL_CATALOG}} and {{TARGET_CPL_MISTER}}; calibrate after week 2. Machinery tickets (a tractor or truck is a US$15k–80k+ decision) tolerate CPLs far above e-commerce norms — judge CPL against ops-rated quality, not against generic benchmarks.

---

## 2. Conversion event → campaign mapping

| Campaign | Optimization event | Why |
|---|---|---|
| Brand umbrella (02) | ThruPlay / Reach | Awareness layer; no conversion pressure |
| Category campaigns (03) | `Lead` (CAPI, deduped) | The real business event; catalog + Mister submits both count |
| Mister campaign (04) | `mister_prequal_reached` at launch → `Lead` once ≥ 50/week | Completed diagnosis → WhatsApp handoff is the specified conversion; prequal fires often enough to exit learning phase sooner |
| Retargeting R1/R2 | `Lead` | |
| Retargeting R3 (WhatsApp non-closer) | Click-to-WhatsApp (conversations) | Meta-native CTWA; requires WABA on +50760250735 |

---

## 3. Testing cadence

**Weekly rhythm (every Monday, 30 min):**
- Kill: any ad > 2× target CPL with ≥ 1.5× breakeven spend and ≥ 2,000 impressions.
- Scale: +20% budget on ad sets ≤ 0.8× target CPL for 7 consecutive days (never >20%/step — resets learning).
- Log every decision in a running `05-execution/decisions-log.md` (create at launch).

**Structured tests (one variable at a time, 2-week windows):**

| Window | Test | Hypothesis |
|---|---|---|
| Weeks 1–2 | Hook framing per archetype: fear-of-being-burned vs corridor-position vs spec-pride (3 creative angles, same audience) | The "documento, no marketplace" trust angle beats price-adjacent angles for A1 |
| Weeks 3–4 | Destination: category LP vs product detail vs /mister direct (A1 agro cell) | LP-first beats Mister-first for A1 cold; Mister-first wins for A3/A4 |
| Weeks 5–6 | Format: spec-carousel vs 9:16 Reel vs static document-ad | Carousel = ficha técnica is the native B2B format |
| Weeks 7–8 | Geo cells: Bolivia (Santa Cruz/La Paz) + N. Chile vs Peru-only benchmarks | Bolivia CPL ≤ 1.5× Peru CPL justifies permanent cell |
| Weeks 9–12 | LAL (lead seed) vs interest stacks; CTWA vs form for R3 | |

**Creative refresh:** every 3 weeks per ad set or at frequency > 3.5, whichever first. The asset queue (`05-execution/asset-production-queue.md`) stays 2 weeks ahead.

---

## 4. 90-Day Roadmap

Aligned to the platform's own 30/60/90 plan in `spec/success-metrics.md`.

### Days 0–14 — Instrument & prove signal
- Workstream 0 complete (pixel + CAPI + custom events verified in Events Manager test tool).
- Meta Business setup: page, IG, domain verification, WABA check on +50760250735.
- Launch: Mister campaign (small), camiones + maquinaria-agricola category campaigns, R1 retargeting shell (fills as traffic arrives).
- Success: events flowing, ≥ 5 paid leads, zero broken landing paths.

### Days 15–45 — Learn & concentrate
- All three retargeting layers live. Brand umbrella launches (10% budget).
- First hook + destination tests concluded; kill losers.
- Lookalike Seed 0 (ops WhatsApp export) live; begin archetype mix reporting from `mister_projects`.
- Success (mirrors spec day-60): ≥ 20 cumulative paid-attributed leads, ICR on paid traffic measurable ≥ 2%, one category proven at ≤ {{TARGET_CPL_CATALOG}}.

### Days 46–90 — Scale what earned it
- Apply the breakout rule (`02-brand-campaign/strategy.md` §4): promote/demote categories between umbrella and standalone.
- LAL Seed 1 (≥100 leads) replaces weakest interest stacks. Geo cells decision (Bolivia/N. Chile permanent or cut).
- Mister campaign switches optimization to `Lead` if volume allows.
- Success: ≥ 10 leads/week total (spec day-60 target, paid contributing ≥ 60%), CPL stable ±20% over 3 consecutive weeks, ops quality rating ≥ 2.0/3 average.

---

## 5. Reporting

Weekly one-pager (can be a Supabase query + spreadsheet until dashboards exist): spend, leads by campaign, CPL, Mister funnel rates, archetype mix, ops quality sample, decisions taken. Monthly: cohort view — % of paid leads that reached a formal quotation (ops manual tag), the only number that ultimately matters.
