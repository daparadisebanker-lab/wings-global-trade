# WhatsApp Business AI — knowledge base document stack

This folder is a ready-to-upload document stack for training an AI assistant
that answers customers on WhatsApp Business, built from Wings Global Trade's
real business rules and — as of this revision — a real transcript export
of the actual human-staffed WhatsApp sales line. It is not generic filler:
every category, discovery question, and escalation rule here is either
sourced from the live codebase (Mister's guardrails, the lane registry, the
published `/proceso` page) or from real proven conversation patterns.

## PDF versions

WhatsApp-facing upload tools in this deployment accept PDF only. Every file
below has a matching PDF in `pdf/` (same number prefix, same filename minus
`.md`/`.csv`). The `.md`/`.csv` sources stay in git as the source of truth —
regenerate the PDFs from them (see "Regenerating the PDFs" below) rather
than hand-editing a PDF directly.

## An important correction from the real transcript

Earlier drafts of this stack ported Mister's site-widget rule — "never
state a price, ever" — onto this WhatsApp line as if it were the same
product. It isn't. Mister is a public, unmanned chat widget with a
structural hold-back guardrail; this WhatsApp line is a **human-assisted
sales channel**, and the real transcripts in `08-ejemplos-reales.md` show
the team routinely discusses budget and does send real quotes over
WhatsApp — always *after* a discovery step, never in the first message.
`04-reglas-y-escalamiento.md` and `03-faq.md` now reflect that distinction.
Get this wrong in either direction and the assistant either stonewalls a
buyer who expects a normal sales conversation, or invents a number nobody
confirmed — both are real failure modes, not a formality.

## File stack

1. `01-empresa-overview.md` — who Wings is, markets, the wholesale-only rule.
2. `02-lineas-y-categorias.md` — lane status, plus the categories confirmed by real WhatsApp traffic (vehicles, minibuses, motorcycles, dealer/volume tier) that predate the lane framework.
3. `03-faq.md` — buyer-facing Q&A pairs, corrected against real transcripts (single-unit vehicle purchases are normal; pricing is discovery-gated, not banned).
4. `04-reglas-y-escalamiento.md` — hard rules (no fabricated numbers, no legal overreach) and when to actually hand off to a human, revised to match observed real behavior instead of Mister's stricter site-widget rule.
5. `05-interiores-azulejos.md` — the Interiores lane's product knowledge (WGT/02), unit math and vocabulary.
6. `06-proceso-de-importacion.md` — the import process end to end, sourced from the live `/proceso` page, with a caveat on published timeline ranges vs. personalized delivery promises.
7. `07-guion-de-descubrimiento.md` — the actual discovery-question playbook per product category (vehicles, minibuses, tractors, motorcycles, dealer escalation), extracted from real transcripts. This is the core training material for tone and structure.
8. `08-ejemplos-reales.md` — the real conversation transcripts themselves, PII-redacted (see below), so the assistant can be trained on genuine phrasing rather than paraphrase.
9. `faq-estructurado.csv` — the same FAQ set as a structured table.

## PII redaction — read before uploading anywhere external

The source transcript this revision is built from contained a client's full
name, tax/billing details, and several real phone numbers. None of that
appears in `08-ejemplos-reales.md` or anywhere else in this stack — only the
conversation pattern and the real message text were kept. If you regenerate
this stack from a fresh transcript export, redact identifying details the
same way before the file leaves this repo, especially before it's uploaded
to any third-party training platform (a data processor outside this
company).

## Which formats to use where (background — the PDFs above are the actual deliverable)

| Target platform | Upload this |
|---|---|
| Meta's native **Business Agent** — trains from linked website, FAQs list, and Commerce Catalog, not raw file upload | `03-faq.md` / `pdf/03-faq.pdf` content, plus keep the live site pages this doc summarizes accurate |
| Third-party WhatsApp Business API chatbot builders, or any tool requiring PDF | `pdf/*.pdf`, uploaded individually — one file = one topic, not concatenated |
| A platform asking for a "structured" source | `faq-estructurado.csv` / `pdf/faq-estructurado.pdf` |

## Regenerating the PDFs

After editing any `.md`/`.csv` source, re-run the conversion script rather
than hand-editing a PDF:

```
python3 scripts/render_pdfs.py
```

(Script lives at `docs/whatsapp-business-ai/scripts/render_pdfs.py` —
reportlab-based, no external binary dependency.)

## Source of truth — this stack drifts if you don't watch it

Nothing here is auto-compiled the way Mister's own packs are (root
`CLAUDE.md` §1.4 "one brain, many mouths" — Mister never forks, but a
WhatsApp-native tool is a second, separate assistant with no access to
Mister's live context). Re-derive it from:

- `apps/site/src/lib/mister/guardrails.ts` — Mister's own forbidden claims (stricter than this WhatsApp line's rules — see the correction above)
- `packages/liveries/registry.md` — lane codes and status
- `apps/site/src/lib/lanes/interioresMisterPack.ts` — Interiores/Azulejos facts
- `apps/site/src/lib/rb/misterPack.ts` — represented-brand facts
- `spec/vision.md` — company positioning and markets
- `apps/site/src/app/proceso/page.tsx` — the published import process
- A fresh, PII-redacted export of real WhatsApp transcripts — the single best source for tone and discovery-question ordering; re-derive `07`/`08` from it whenever the sales team's real patterns shift

Treat a stale WhatsApp AI knowledge base the same way the codebase treats a
stale carton count: a wrong answer here reaches a buyer directly, with no
guardrail scanning it first the way Mister's hold-back guardrail does.
