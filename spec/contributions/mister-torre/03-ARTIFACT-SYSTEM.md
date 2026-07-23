# 03 — The Artifact System (the heart of Mister Torre)

An artifact is a **schema-validated, versioned, reviewable document** produced by Mister and owned by a human. Conversation is scaffolding; artifacts are the product.

## Artifact types (v1 — complete list)

| Type | Content | Export | Primary consumer |
|------|---------|--------|------------------|
| `cotizacion` | client-ready quote: machine, incoterm scenarios, landed-cost breakdown, validity, terms | PDF (branded) + tower record | client via comercial |
| `hoja_costos` | internal cost sheet: full math trace, rate sources, margin, sensitivity (±flete, ±TRM) | XLSX + tower record | comercial/finanzas |
| `comunicacion` | email or WhatsApp draft (client update, supplier request, agent instruction) — audience-aware tone + language | send-on-approve via connector | ops/comercial |
| `reporte_estado` | per-import status report: timeline, docs, costs-to-date, next steps | PDF + link | ops → client |
| `brief` | Morning Brief / Friday ops report / pipeline & margin report | in-tower + digest | whole team / dirección |
| `checklist_docs` | stage-aware document checklist w/ owners & due dates | tower record | ops |
| `acta` | meeting/call notes → decisions + tasks (from transcript or dictation) | tower record + tasks | whole team |
| `sop` | procedure doc drafted from how-we-did-it precedent | tower record (knowledge corpus) | whole team |

Every type has: JSON schema (`schemas/*.ts`, zod) · renderer (React, side panel + full page) · exporter (PDF via headless print CSS; XLSX via exceljs) · template with locked brand frame (tokens from the shared design system; logotipo, mono-data metadata strip: `MISTER · Q-2026-118 · v3 · 23 JUL 2026`).

## Lifecycle (constitutional)

```
draft (Mister) → review (human) → approved → [sent/exported/filed] → learned
        ↑            │ edit/comment │
        └── revise ←─┘   (Mister revises, versions++)
```

- **Nothing leaves the tower without `approved` by a permissioned human.** No exceptions in v1; the approve action names the exact side effect ("Aprobar y enviar a cliente@… por email").
- Every version is kept with a diff; artifact diffs are *semantic* (changed numbers highlighted with old→new, changed paragraphs marked) — review in seconds, not proofreading.
- **learned:** on approval, the artifact + human edits enter the knowledge corpus (02) — Mister studies the team's corrections; acceptance-without-edits is the quality KPI (00).

## Review UX (where productivity is won or lost)

- Artifact opens in the side panel as the rendered final document (not JSON, not markdown soup).
- **Confidence rendering:** verified figures normal ink; `estimado` in Horizon with dotted underline + source tooltip; `requiere_verificación` slots render as explicit blockers with a one-tap verification task. A quote with open blockers cannot be approved.
- Inline edit: click any text/number to edit directly; edits marked as human overrides (never silently re-lost on revise).
- Comment-to-revise: select → "dile a Mister" ("baja el margen a 12%", "tono más formal") → revision streams into a new version.
- Keyboard: `⌘↵` approve · `E` edit · `R` revise-with-comment · `J/K` next/prev pending artifact (the review queue is a first-class screen).

## Generation contract (per type, enforced)

1. Plan visible (side panel steps: "Consultando tarifas → Calculando CIF/DDP → Aplicando margen → Redactando").
2. All numbers from `compute_landed_cost` / rate tools — never model arithmetic (02).
3. Sources block always attached (rate table + validity, tariff position, precedent artifacts).
4. Language per audience: client artifacts in client's language; supplier comms default EN/ZH-simplified-courtesy-EN; internal docs ES.
5. Schema-validate → render; on validation failure retry once with the error, then surface honestly as a failed draft (never a broken render).

## The quote run (the flagship, fully specified)

Trigger: Cmd+K `cotizar…`, or inbound spec sheet dropped on the panel.
1. Extract machine spec (model, weight, dims, value, origin) from input/attachment; ghost-fill missing fields with `requiere_verificación`.
2. `get_tariff` → position + duty/IVA; ambiguous → present the 2 candidate positions with criteria, block approval until chosen.
3. `get_rates` → freight options (20GP/40HC/LCL/RORO as applicable) with validity dates.
4. `compute_landed_cost` per incoterm scenario (FOB/CIF/DDP) in USD + COP (TRM dated).
5. Margin per org rules (06) with override field.
6. Emit `hoja_costos` (internal, full trace) **and** `cotizacion` (client-ready) linked as a pair; `redactor` drafts the cover `comunicacion`.
7. Review queue. Target: trigger → approvable pair in <3 minutes of Mister-time.

## Anti-scope

No free-form document editor (edits happen on typed artifacts) · no artifact type without schema+renderer+exporter+eval · no "regenerate from scratch" button (revisions are conversational and versioned — regeneration roulette destroys trust).
