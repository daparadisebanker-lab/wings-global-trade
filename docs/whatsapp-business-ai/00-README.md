# WhatsApp Business AI — knowledge base document stack

This folder is a ready-to-upload document stack for training an AI assistant
that answers customers on WhatsApp Business, built from Wings Global Trade's
real business rules (not generic filler). It exists because Mister's own
knowledge packs (`packages/mister`, `apps/site/src/lib/mister/*`,
`apps/site/src/lib/lanes/interioresMisterPack.ts`) are TypeScript, injected
server-side into Mister's own model calls — they are not a file a WhatsApp
Business AI tool can ingest. This stack is the exported, upload-ready form of
the same facts, so a WhatsApp-native or third-party assistant says the same
things Mister does.

## Which formats to use where

| Target platform | Upload this |
|---|---|
| Meta's native **Business Agent** (WhatsApp/Instagram/Messenger) — trains from linked website, FAQs list, and Commerce Catalog, not raw file upload | `03-faq.md` content pasted into its FAQ field; keep the live site pages this doc summarizes accurate, since the agent also scrapes the site directly |
| Third-party WhatsApp Business API chatbot builders (BotPenguin, WhatChimp, Robylon, GuruSup, etc.) — accept direct file upload | Every `.md` file in this folder, uploaded individually (one file = one topic = one training source, not concatenated into a single mega-doc) |
| Any platform asking for a "structured" source | `faq-estructurado.csv` |

`.md` is used instead of `.docx`/`.pdf` because every platform surveyed accepts
plain text/Markdown, it costs nothing to keep in git next to the source files
it is derived from, and it carries zero layout noise for the ingestion parser
to strip back out. If a specific tool insists on `.docx` or `.pdf`, convert at
upload time (`pandoc 0X-file.md -o 0X-file.pdf`) — do not maintain a second
copy by hand.

## File stack

1. `01-empresa-overview.md` — who Wings is, markets, the wholesale-only rule.
2. `02-lineas-y-categorias.md` — the lane system and what is actually live vs. queued, so the AI never claims a lane exists before it does.
3. `03-faq.md` — buyer-facing Q&A pairs (FAQ mode is the token-efficient, higher-accuracy structure over raw-response mode on every platform surveyed).
4. `04-reglas-y-escalamiento.md` — the forbidden claims and the exact escalation script, ported from Mister's live guardrails so a second AI can't contradict the first one.
5. `05-interiores-azulejos.md` — the one active lane's product knowledge (WGT/02), unit math and vocabulary.
6. `06-proceso-de-importacion.md` — the import process end to end (origin verification, CIF breakdown, free zone, documentation, delivery, shared container), sourced from the live `/proceso` page.
7. `faq-estructurado.csv` — the same FAQ set as a structured table, for platforms that want tabular training data.

## Source of truth — this stack drifts if you don't watch it

Nothing here is auto-compiled the way Mister's own packs are (root
`CLAUDE.md` §1.4 "one brain, many mouths" — Mister never forks, but a
WhatsApp-native tool is a second, separate assistant with no access to
Mister's live context). That means this stack **will** go stale the moment
any of its sources change. Re-derive it from:

- `apps/site/src/lib/mister/guardrails.ts` — forbidden claims + escalation copy
- `packages/liveries/registry.md` — lane codes and status
- `apps/site/src/lib/lanes/interioresMisterPack.ts` — Interiores/Azulejos facts
- `apps/site/src/lib/rb/misterPack.ts` — represented-brand facts
- `spec/vision.md` — company positioning and markets
- `apps/site/src/app/proceso/page.tsx` — the published import process (phases, CIF breakdown, free zones, documentation, timeline ranges)

Treat a stale WhatsApp AI knowledge base the same way the codebase treats a
stale carton count: a wrong answer here reaches a buyer directly, with no
guardrail scanning it first the way Mister's hold-back guardrail does.
