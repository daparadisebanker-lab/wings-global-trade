# Pricing notes — Toyota Hilux costeo (Wings Global Trade)

Standing knowledge base for the SUNAT import-cost engine inputs used across
Hilux cotizaciones in `deliverables/`. Ported from
`apps/tower/src/lib/costing/engine.ts` (`computeImportCost`) in Python with
`decimal.Decimal` + `ROUND_HALF_UP`. See any `cotizacion-*/build_cotizacion.py`
for the full per-unit derivation (CIF → landed cost → margin → sale price).

## Shared cost inputs (all Hilux Travo/Full Manual/Básica Manual quotes)

| Input | Value |
|---|---|
| Flete internacional | USD 5,250 / unidad |
| Origen | Tailandia |
| Puerto de llegada | Iquique, Chile |
| Condición del precio | Nacionalizado, incluye IGV — puesto en Zofratacna, Tacna |
| Flete Zofratacna | USD 500 |
| Gastos portuarios | USD 375 |
| Agencia de aduana | USD 300 |
| Manipuleo y estiba | USD 0 |
| Ad Valorem | 0% (TLC Perú–Tailandia, sujeto a confirmación por partida arancelaria) |
| ISC | 0% (motor diésel) |
| Seguro | 1.5% |
| IGV | 18% |
| Percepción | 3.5% |
| Tipo de cambio | S/ 3.70 por USD |
| Margen de utilidad | 10% |

## FOB per unit by model (user-specified)

| Model (client-facing name) | Trim code | FOB/unit (USD) | Sale price/unit, sin IGV (USD) | Precio total/unit, con IGV (USD) |
|---|---|---|---|---|
| Toyota Hilux Travo Overland Plus | — | 43,000.00 | 55,211.87¹ | 65,150.01¹ |
| Toyota Hilux Full Manual 4x4 | 2.8 4x4 V M/T | 44,205.00 | 56,509.01 | 66,680.63 |
| Toyota Hilux Básica Manual 4x4 | 2.8 4x4 E M/T | 36,000.00 | 47,348.13 | 55,870.79 |

¹ Overland Plus carries a +48.24/unit commercial rounding adjustment on top
of the 10% margin, added 2026-08-27 at the client's request to land a
2-unit, IGV-included total on an exact round number (USD 130,300.02). This
adjustment is a one-off commercial rounding for that specific deal, not a
standing cost component — it is **not** applied to Full Manual 4x4 or
Básica Manual 4x4, whose sale prices above are the engine's raw 10%-margin
output. Raw (unrounded) Overland Plus sale price/unit without the
adjustment: 55,163.63 (precio total 65,093.08) — the adjusted figure
(55,211.87 / 65,150.01) is what appears on all delivered Overland Plus
cotizaciones and should keep being reused for that model unless told
otherwise.

## Fichas técnicas cross-reference

- Toyota Hilux Full Manual 4x4 → `ficha-tecnica-hilux-2.8-4x4-v-mt/` (doc FT-WGT-2026-0907)
- Toyota Hilux Básica Manual 4x4 → `ficha-tecnica-hilux-basica-manual-4x4/` (doc FT-WGT-2026-0908)
- Toyota Hilux Travo Overland Plus → `ficha-tecnica-hilux-travo-overland-plus/`

Last updated: 2026-09-14.
