# TOWER doc-generator reference templates

Reference PDFs (provided by Muaaz, 2026-07-21) that the TOWER document generators
must reproduce. These are **format references only** — the layouts to match; the
generators are built with `@react-pdf/renderer` server routes, on the Wings brand
system, reusing the company / RUC / tax / terms layer already in
`apps/tower/src/lib/quotation/` (the shipped quotation-document generator, tower_22).

| File | Document | Notes |
|------|----------|-------|
| `ficha_tecnica.pdf` | **Ficha técnica** — technical spec sheet | Per product / represented-brand container. Exhibits the numbers (CBM, MOQ, HS, pallet/packing) as brand assets, tabular mono. |
| `proforma.pdf` | **Proforma** — proforma invoice | Preliminary invoice. Money in integer minor units + currency code; es-PE formatting; never a retail cart. |

Both are backlog items — see `../REMAINING.md` → "Full remaining backlog".
Bilingual (ES primary / EN), wholesale-language lint applies.
