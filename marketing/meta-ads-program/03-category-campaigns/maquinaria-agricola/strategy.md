# Maquinaria Agrícola — Category Campaign Strategy

**Status at launch: BROKEN OUT (standalone conversion campaign).** Deepest inventory: 31 tractors across 5 brands (SNH 50–135 HP, John Deere 5B/5E/6B/6E, Massey Ferguson, Kubota, New Holland — `data/product-catalog.json`), cosechadora 4LZ, plus 6 subcategories and 4 purpose-built application landing pages (`src/lib/catalog-applications.ts`) that function as ready-made ad destinations.

## Archetype mapping (from audience-architecture matrix)

| Archetype | Role | Entry |
|---|---|---|
| A1 Lead/End Buyer | **Primary.** Agricultor/fundo comprando su primer tractor importado o renovando uno nacionalizado caro | Application LP (`/catalogo/maquinaria-agricola/aplicacion/{uso}`) |
| A2 Project Manager | **Primary.** Agroindustria (arándanos, espárragos, caña, arroz a escala) equipando campaña o proyecto | Product detail with spec table |
| A4 Reseller | Secondary. Distribuidor regional de maquinaria buscando línea de origen directo | Mister (MOQ/margen conversation) |

## Pain points & hook angles (traceable to project data)

1. **"El tractor correcto para MI suelo"** — the application pages already segment by use: arrozal (4WD alta flotación, barro), frutales (compacto entre hileras), cultivos en surco (80–200 HP), ganadería (multiusos). Hook = the use case, not the machine. *This is the sharpest asset in the whole catalog: nobody else in the Peru feed advertises "tractores para arrozal".*
2. **HP ladder confidence** — the SNH range runs 50→135 HP in even steps; the buyer's real anxiety is "¿qué potencia necesito?" — a diagnostic question, which routes naturally to Mister.
3. **Brand trust bridging** — Wings carries John Deere / Massey Ferguson / Kubota / New Holland alongside SNH: familiar names de-risk the channel, SNH carries the value story. Ads may pair them ("las marcas que conoces, el canal que no conocías").
4. **Channel fear (A1)** — nationalization horror stories; answered with the documented-quote promise and free-zone position, never with price claims.
5. **Campaign timing (A2)** — la campaña agrícola has fixed dates; frame planning discipline ("tu campaña tiene fecha"), NEVER delivery promises (Mister hard rule 2 extends to ads: no lead-time claims).

## Targeting
- **A1 cell:** interests Agricultura + Tractor + {John Deere, Massey Ferguson, Kubota, New Holland}; geo weighted Piura, Lambayeque, La Libertad, San Martín (arroz), Ica (frutales/agroexport), Junín/Cajamarca (sierra ganadera). Advantage+ ON.
- **A2 cell:** Agroindustria + Gestión de proyectos + Cadena de suministro interests, page-admin behavior, geo Lima + Ica + La Libertad (agroexport clusters).
- **A4:** no dedicated cold cell — reseller hooks run as 20% creative share inside A1 cell (broad reach finds them; Mister classifies them).
- Retargeting: R1 segmented on `/catalogo/maquinaria-agricola/*`, R2/R3 per foundation doc.

## Conversion & destination logic
- Optimization event: `Lead` (CAPI).
- Use-case creative → application LP. Spec creative → product detail. Diagnostic creative ("¿qué potencia?") → `/mister`.

## Seasonality note
Rice campaña grande planting (Sep–Dec coast/selva) and sierra planting (Oct–Nov) pull purchase decisions into Jul–Oct; agroexport procurement is year-round. Weight budget up from July onward — which is now (program start 2026-07).
