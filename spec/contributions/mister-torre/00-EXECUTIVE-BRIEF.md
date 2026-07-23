# 00 — Executive Brief: Mister Torre

## Mission

The client-facing Mister makes importing feel clear. **Mister Torre makes Wings itself faster.** He is the intelligence inside the management tower: a senior operations partner who already read every file, drafted the document you were about to write, and flags the problem before the client calls.

## The productivity thesis

Wings' internal work is dominated by five repeating loops:

1. **Cotizar** — assemble costs (FOB, flete, seguro, aranceles, márgenes) into a client-ready quote.
2. **Comunicar** — status emails/WhatsApps to clients, requests to suppliers and agents, in two or three languages.
3. **Vigilar** — watch every active import for slippage: vessel delays, doc deadlines, demurrage risk, payment milestones.
4. **Documentar** — checklists, registros de importación, SOPs, meeting notes, handoffs.
5. **Reportar** — weekly ops summaries, pipeline reviews, margin analysis for dirección.

Every loop ends in an **artifact**. Therefore Mister Torre's unit of value is not the answer — it is the *reviewed, approved, sent* artifact. The assistant that talks is a toy; the colleague that ships drafts is a hire.

> **North-star metric: operator-hours returned per week.**
> Supporting KPIs: time-to-quote (target: 45 min → under 10), artifacts accepted without edits (>60%), exceptions caught by Mister before a human noticed (count/week), weekly brief read-rate.

## Personas (design for these four, in this order)

| Persona | Their day | What Mister Torre does for them |
|---------|-----------|--------------------------------|
| **Ops coordinator** | 15 active imports, 40 messages, 3 fires | The Watch (05), doc checklists, drafted client updates, demurrage countdowns |
| **Comercial** | leads, quotes, follow-ups | 10-minute quotes (03), comparison sheets, follow-up drafts with full account memory |
| **Finanzas/Admin** | payments, margins, invoices | cost reconciliation sheets, payment-milestone alerts, margin deltas explained |
| **Dirección (Muaaz)** | everything at once | the Morning Brief, pipeline & margin reports, "¿qué se está quemando?" answered in one screen |

## What "much more intelligent" means (precisely)

1. **Tools, not just words** — Mister Torre reads and writes tower data through typed tools (quotes, imports, contacts, documents, tariff tables).
2. **Company memory** — RAG over Wings' own corpus: past quotes, tariff resolutions, supplier history, SOPs, templates, negotiated rates.
3. **Multi-step reasoning** — a quote request triggers a plan: fetch rates → check tariff position → compute landed cost → apply margin rules → render artifact → cite sources.
4. **Proactivity inside guardrails** — he drafts and flags on his own; he **sends nothing** without a human approval, ever (05).
5. **Self-accounting** — every artifact and alert logs model, sources, confidence, and time-saved estimate; productivity is measured, not vibes (07).

## Non-goals (protect the scope)

- Not a general chat tool; every capability maps to the five loops.
- Not an autonomous emailer — approval gates are constitutional, not configurable v1.
- Not a BI platform — reports are generated artifacts, not a dashboard builder.
- No client-facing surface here; that is the sibling package.

## The internal feel

Same world ("deep water, clear signal"), different room: **the engine room.** Denser, quieter, more paper. The Constellation still lives here, smaller and stiller — a colleague at your desk, not a performance. The award this product wins is the team refusing to work without it.
