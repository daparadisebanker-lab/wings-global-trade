# Mister Campaign — Strategy

**Level: Mister AI as the hero product.** Not "we have a chatbot" — the campaign sells **the experience of being diagnosed by a senior trade specialist who happens to be available at 2 a.m.**
**Conversion event:** completed diagnosis → WhatsApp handoff (`mister_prequal_reached` → `mister_whatsapp_handoff` / `Lead`; see measurement plan §2).

---

## 1. What we are actually selling

Mister's product truth, from the implementation itself:

- It **diagnoses before it recommends**: a 3–5 question induction that "must read like a senior trade specialist sizing up a new contact — not a form" (brief §D1) resolves one of five buyer archetypes and adapts everything after.
- It **refuses to do the thing every buyer expects a bot to do**: it will never quote a price, availability, or lead time. Architecturally — no price tool exists; a hold-back guardrail scans every response before a single token is shown. It teaches the cost STRUCTURE (landed-cost waterfall, indexed base 100, disclaimered) and routes real figures to humans in 24h.
- It **ends in a person**: prefilled quotation, WhatsApp +50760250735 with session summary, or a specialist contact card. The AI's job is to make the first human conversation start at question eight instead of question one.

**The strategic idea (one sentence):**
> **Mister is the first commercial advisor in the machinery trade with no incentive to rush you — because it cannot quote you.**

**Campaign platform / working title: «Información antes de precio»** — already the brand's own phrasing (nosotros: "Mister — información antes de precio"; CTA section: "La primera conversación es técnica. Sin precio adjunto.").

**The anti-gimmick rule.** No robot iconography, no sparkles, no "IA revolucionaria", no chat-bubble clichés. Mister is presented as a *colleague*: the interface shown is real (the actual Mister window, the waterfall surface, the quick actions), demoed in screen-capture, not dramatized. The proof of intelligence is the quality of its questions — so **the ads quote Mister's real questions** from the lane question banks.

---

## 2. Audience logic

Mister is the only campaign that speaks to **all five archetypes** — and the only channel that serves A3 (logistics) and pre-qualifies A5 (wholesale) at all.

| Cell | Audience | Creative angle |
|---|---|---|
| M-A1 «Confianza» | A1 interests (agro + trucks union), broad Peru | Being guided without pressure; the no-price guarantee as buyer protection |
| M-A3 «Corredor» | Comercio internacional + Logística + Aduana interests; Lima/Tacna + Bolivia & N. Chile geo cells | Trade-shorthand creative: Incoterms, contenedores, doc packs, ZOFRATACNA/ZOFRI mechanics |
| M-A4 «Canal» | Wholesale/commerce interests | MOQ/margin diagnosis before the channel team |
| M-RT | Retargeting layers R1/R2 (foundation §3) | R1: "la ficha no responde todo"; R2: resume-your-session |

A2 is reached inside M-A1 (creative self-selection via spec-language variants) and through category campaigns' Mister-routed concepts (AG2 card 6, CM4).

**Geo note:** the Bolivia/N. Chile test cells live in THIS campaign (M-A3) — cross-border corridor users are Mister's natural constituency; the catalog campaigns stay Peru-only.

---

## 3. Funnel design

1. Ad → `/mister` (embedded mode; first induction message renders immediately — zero-friction start, no signup, es-PE).
2. `mister_open` → induction (2–3 questions) → `mister_induction_complete` (archetype resolved).
3. Discovery/consideration with surfaces (product cards, waterfall, MOQ, comparisons).
4. `mister_prequal_reached` — **the "completed diagnosis." Campaign optimizes here at launch** (volume sufficient to exit learning), migrating to `Lead` at ≥50/week.
5. Handoff: prefilled quotation form or WhatsApp with session summary → ops (24h documented quote).

Drop-off recovery is structural: R2 retargeting (conversation abandoners) belongs to this campaign's budget, with stage-aware creative.

## 4. Claims discipline (extends Mister's hard rules into paid media)

| Never in ads | Because | Say instead |
|---|---|---|
| "Cotiza al instante con IA" | Mister cannot quote — architecturally | "Entiende la estructura del costo hoy. La cotización documentada llega en 24 horas hábiles." |
| "Consulta stock/disponibilidad" | Hard rule 2 | "Especificaciones verificadas por modelo" |
| Any % savings figure, any USD figure | Hard rule 1 + indexed-only doctrine | Indexed structure language with the site's own micro-disclaimer: "rango ilustrativo — no es cotización" |
| "Chatbot" | Register kill — Mister is a specialist, not a widget | "Inteligencia comercial" / "asesor técnico" (site vocabulary) |

## 5. Success definition
- Primary: cost per completed diagnosis (`mister_prequal_reached`), diagnosis→handoff rate ≥ 50% (KPI tree).
- Quality loop: archetype mix per ad (from `mister_projects.archetype` joined on UTM) — if an ad produces 80% `unresolved`, the hook is attracting curiosity, not intent: kill it.
- Mister-page paid ICR target ≥ 8% cold (vs spec's 15% blended).
