# Camiones — Category Campaign Strategy

**Status at launch: BROKEN OUT.** The volume story of the whole platform: **KAMA — 97 modelos, 12 series** (W, X, V, S, M1, M3, M6, K, GM, EW/EV, ES/ESP, EX/EM — `src/data/kama-trucks.json`), plus heavy units (Volquete HOWO 8x4, Camión de Carga 6x4 Euro V, Furgón Refrigerado -18 °C — `seed.json`). The homepage already leads with it: **"97 modelos. Precio CIF sin intermediarios."** (hero slide 2, verbatim).

## Archetype mapping

| Archetype | Role | Entry |
|---|---|---|
| A1 Lead/End Buyer | **Primary.** Transportista dueño-operador; flota de 1–5 unidades; compra la siguiente unidad con capital propio | `/catalogo/camiones` |
| A2 Project Manager | **Primary.** Minería/construcción (volquetes), agroexport (cadena de frío), renovación de flota corporativa | Product detail (volquete / furgón) |
| A3 Logistics Manager | Secondary. Operador logístico ampliando flota propia — reached mainly via Mister campaign | `/mister` |
| A4 Reseller | Secondary. Dealer de vehículos comerciales evaluando línea KAMA | `/mister` |

## Pain points & hook angles

1. **"Sin intermediarios" (A1)** — the buyer knows the same Chinese truck passes through two or three hands before reaching him. The hero line is the claim; the free-zone position is the proof. This is the lead hook of the category.
2. **Range certainty (A1/A4)** — 97 models / 12 series means the buyer configures instead of settling. Range = seriousness signal in a market of single-container importers.
3. **Duty mechanics (A1/A2)** — trucks carry meaningful tariff+IGV exposure at nationalization; "el costo de internación es diferente desde dentro" lands hardest here. Educational hook → Mister waterfall (structure, never figures).
4. **Spec-severity for mining (A2)** — volquete HOWO: 8x4, 400 HP, tolva 30 m³, 40 t. Mining procurement responds to spec density and Euro-norm compliance, not adjectives.
5. **Cold chain (A2)** — furgón -18 °C, 34 m³: agroexport and food distribution have compliance-driven cold-chain needs; a niche nobody addresses in Spanish-language Meta ads in Peru.

## Targeting
- **A1 cell:** interests Camión + Transporte por carretera + Transporte de mercancías + Logística; geo national with weight on freight corridors (Lima, Arequipa, La Libertad, Piura, Junín, Puno/Juliaca). Age 25–55.
- **A2 cell (minería/obra):** Minería + Construcción + Ingeniería interests, page-admin behavior; geo Arequipa, Moquegua, Cajamarca, Áncash, La Libertad (mining depts).
- **A2 cold-chain micro-cell:** Agroindustria + Exportación interests, geo Ica/La Libertad/Lima; small budget, document-style creative.
- Retargeting: R1 on `/catalogo/camiones/*` with KAMA-series creative.

## Conversion & destination
- Optimization: `Lead`. KAMA range creative → `/catalogo/camiones`; heavy-unit spec creative → product detail; duty-education creative → `/mister`.

## Compliance guardrail
Never state a CIF figure, availability, or delivery time in ad copy. "Precio CIF sin intermediarios" (site-verbatim) describes the QUOTE STRUCTURE (direct CIF quotation, no middlemen margin) — keep that exact phrasing; do not extend it to "precios bajos" or any number.
