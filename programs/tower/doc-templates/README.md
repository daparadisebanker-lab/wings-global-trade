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
| _(anexo)_ | **Anexo** — landed-cost annex | New doc type. Separate branded annex to a proforma: approximate logistics handling costs to the port of destination (flete, gastos de puerto, CBM) + the proforma sale → landed cost. Referential, never a factura. First reference: `deliverables/proforma-saad-muhammad/anexo.pdf`. |

Both format references are backlog items — see `../REMAINING.md` → "Full remaining backlog".
Bilingual (ES primary / EN), wholesale-language lint applies.

## Grid system (layout law)

`grids/` holds the **official grid overlays** (Muaaz, 2026-07-24) that fix the
layout for each document, plus the derived anexo grid. **`grids/GRID_SYSTEM.md`**
codifies every parameter — A4, 29.5 pt margins, left rail, 17.4 pt gutters, a
19.9 pt baseline, and the four content fields — measured from the vector geometry
and mapped per document (incl. the anexo). Generators must lock to these values;
the money columns of the proforma and anexo right-align on the same grid line.
