# Wings document grid system — proforma · cotización · ficha técnica · anexo

Official grid overlays provided by Muaaz (2026-07-24) for the three shipped
document types, plus the **anexo** (landed-cost annex) grid derived here on the
same skeleton. These are the layout law the TOWER document generators
(`@react-pdf/renderer` / print CSS, reusing `apps/tower/src/lib/quotation/`) must
lock to. Files in this folder:

| File | Doc | Source |
|------|-----|--------|
| `proforma-grid.pdf` | Proforma | official (Muaaz) |
| `cotizacion-grid.pdf` | Cotización | official (Muaaz) |
| `ficha-tecnica-grid.pdf` | Ficha técnica | official (Muaaz) |
| `anexo-grid.pdf` | **Anexo** | derived (`build_anexo_grid.py`) |

All measurements below are **extracted from the vector geometry** of the official
overlays (pdfplumber), in PostScript **points (pt)** — the print source of truth —
with millimetres alongside. 1 pt = 0.3528 mm.

## 1. Shared skeleton (identical in all four documents)

| Parameter | pt | mm |
|-----------|----|----|
| Page (A4 portrait) | 595.28 × 841.89 | 210 × 297 |
| Margin (all four sides) | 29.5 | 10.4 |
| Content box | 536.3 × 782.8 | 189.2 × 276.2 |
| Content left / right edge | 29.3 / 565.6 | 10.3 / 199.6 |
| Content top / bottom edge | 29.5 / 812.3 | 10.4 / 286.6 |
| **Baseline grid** (green) | **19.9** | **7.0** |
| **Column gutter** (primary, pink) | **17.4** | **6.1** |

The vertical rhythm is a strict **19.9 pt baseline** (measured 29.5 → 149.0 over 6
steps). Every text row, table row, and section bar snaps to it. ~39 baseline
rows fit the content height.

### Vertical grid lines (the column skeleton, shared)
Ten lines define a **left rail + four content fields** separated by 17.4 pt gutters:

| Line | pt | mm | Role |
|------|----|----|------|
| 1 | 29.3 | 10.3 | content left / rail start |
| 2 | 70.7 | 24.9 | rail end |
| 3 | 84.6 | 29.9 | field A start (rail gutter = 13.9 pt) |
| 4 | 154.6 | 54.6 | field A end |
| 5 | 172.1 | 60.7 | field B start |
| 6 | 288.7 | 101.9 | field B end |
| 7 | 306.1 | 108.0 | field C start |
| 8 | 422.8 | 149.2 | field C end |
| 9 | 440.2 | 155.3 | field D start |
| 10 | 565.6 | 199.6 | field D end / content right |

| Zone | span (pt) | width pt | width mm |
|------|-----------|----------|----------|
| Rail (labels) | 29.3–70.7 | 41.4 | 14.6 |
| Field A | 84.6–154.6 | 70.0 | 24.7 |
| Field B | 172.1–288.7 | 116.6 | 41.1 |
| Field C | 306.1–422.8 | 116.7 | 41.2 |
| Field D | 440.2–565.6 | 125.4 | 44.2 |

Gutters: rail→A = 13.9 pt; A→B, B→C, C→D = 17.4 pt (primary gutter).

> Relationship to the frozen Tier-1 screen scale (root `CLAUDE.md` §2): this is
> the **print** grid in points; it does not replace the 4/8/12/16/24 px screen
> spacing. For reference the gutter ≈ 23 px (near the 24 token), baseline ≈ 26.5
> px, margin ≈ 39 px. Generators target the pt values above, not the px scale.

## 2. Per-document column subdivisions

Each document keeps the shared skeleton and adds only the extra vertical lines its
own table needs.

- **Cotización** — the base case: uses the ten shared lines with **no extra
  subdivisions**. Rail = labels, fields A–D = the two label→value pairs.
- **Proforma** — adds three lines inside fields C/D for the line-item numeric
  columns: **313.1, 397.8, 535.5 pt** (Cant. / Precio unit. / Precio total splits).
- **Ficha técnica** — adds a narrow paired split around field B/C: **297.4 pt**
  (between 288.7 and 306.1), giving the spec-pair (label ↔ value) column at
  ~8.7 pt offsets.

## 3. Anexo (landed-cost annex) — derived parameters

The anexo maps onto the shared skeleton with **no new lines** — it is a two-field
document:

| Anexo element | Grid span | pt | mm |
|---------------|-----------|----|----|
| Header (title + logo) | rail→field D, top band | — | — |
| Dateline | content left → right, on baseline | 29.3–565.6 | — |
| Section bars | content left → right | 29.3–565.6 | — |
| **Cost table · Detalle** | field A start → field C end | 84.6–422.8 | 29.9–149.2 (w 119.3) |
| gutter | | 17.4 | 6.1 |
| **Cost table · Monto** | field D | 440.2–565.6 | 155.3–199.6 (w 44.2) |
| **Totales · value column** | field D (right-aligned) | 440.2–565.6 | 155.3–199.6 |
| Totales · label | field C | 306.1–422.8 | 108.0–149.2 |

Key alignment law: the **Monto** column, the **Totales** value column, and (when
present) the proforma's Precio-total column **all right-align on line 10
(565.6 pt)** and share the left edge of field D (440.2 pt) — so every currency
figure stacks on the same rail across the proforma → anexo pair.

Regenerate the overlay with `python3 build_anexo_grid.py`.

## 4. Conformance note (current deliverable)

The hand-built deliverable (`deliverables/proforma-saad-muhammad/`) uses the pdoc
print CSS with ~40 pt side padding, **not** the 29.5 pt grid margin, and its table
splits are percentage-based rather than snapped to the lines above. Fitting the
generators to this grid (margins, field edges, 19.9 pt baseline) is a follow-up
task tracked in `../../REMAINING.md`; these parameters are the target.
