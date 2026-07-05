# Project Reconnaissance — Wings Global Trade Meta Ads Program

**Date:** 2026-07-05
**Sources:** Live code (`src/`), authoritative spec (`spec/`), seed data (`src/data/`), master catalog (`data/`).
Where spec and live code conflict, live code wins (noted below).

---

## 1. Product & Catalog Inventory

### The five real categories (`src/data/seed.json` → `categories`)

| # | Slug | Name (ES) | Site description (verbatim) |
|---|------|-----------|------------------------------|
| 1 | `maquinaria-agricola` | Maquinaria Agrícola | "Tractores, cosechadoras y equipos de labranza de origen certificado." |
| 2 | `camiones` | Camiones | "Camiones de carga, volquetes y furgones para transporte pesado." |
| 3 | `buses` | Buses | "Buses urbanos, interurbanos y minibuses para transporte de pasajeros." |
| 4 | `equipo-industrial` | Equipo Industrial | "Generadores, compresores, montacargas y maquinaria de planta." |
| 5 | `repuestos` | Repuestos | "Repuestos originales y compatibles para maquinaria y vehículos." |

### Category depth

**Maquinaria Agrícola** — deepest category.
- Seed products: Tractor SNH504 (50 HP 4WD), SNH704 (70 HP), John Deere 5E-1104 (110 HP), Cosechadora de Grano 4LZ (102 HP, flujo axial, arroz/trigo/maíz).
- Master catalog (`data/product-catalog.json`): 31 tractors — SNH series 50–135 HP, John Deere 5B/5E/6B/6E (70–140), Massey Ferguson MF1004–S1204-C, Kubota M704K–M1004Q, New Holland T1104.
- Subcategories (`src/lib/subcategory-catalog.ts`): tractores, cosechadoras, sembradoras, pulverizadoras, empacadoras, motocultores.
- **Application landing pages** (`src/lib/catalog-applications.ts`) — ready-made ad destinations with SEO copy:
  - `/catalogo/maquinaria-agricola/aplicacion/arrozal` — "Tractores para Arrozal", 4WD 50–100 HP, "alta flotación y tracción en barro"
  - `/aplicacion/frutales` — compactos baja altura para viñedos, citrus, paltos
  - `/aplicacion/cultivos-surco` — 80–200 HP para maíz, soja, girasol
  - `/aplicacion/ganaderia` — multiusos pasturas/forraje

**Camiones** — the volume story.
- Seed: Volquete HOWO 8x4 (400 HP, 30 m³, 40 t), Camión de Carga 6x4 (380 HP Euro V), Furgón Refrigerado 4x2 (-18 °C, cadena de frío).
- **KAMA brand catalog** (`src/data/kama-trucks.json`): Shandong KAMA, 12 series (W, X, V, S, M1, M3, M6, K, GM, EW/EV, ES/ESP, EX/EM). Homepage hero slide #2: **"97 modelos. Precio CIF sin intermediarios."** → CTA "Ver camiones KAMA".
- Subcategories: volteo, carga, cisterna, tractocamión, especial (grúa/mixer/plataforma).

**Buses** — Bus Urbano 12m (90 pasajeros, piso bajo, Euro V), Bus Interurbano 13m (49 asientos reclinables), Minibús 7m (25 pasajeros — transporte de personal y turismo). Subcategories: urbano, minibús, interurbano, escolar.

**Equipo Industrial** — Generador Diésel 250 kVA (transferencia automática, cabina insonorizada), Montacargas 3 t, Compresor de Tornillo 50 HP (8 bar, IP54).

**Repuestos** — Filtro de aceite (caja x 50 — sold by lot, B2B), Kit de embrague 70–120 HP, Neumático agrícola R1 18.4-30. Dedicated page `/repuestos` with headline **"Motores de origen japonés."** — "Catálogo directo de Japón."

### Specs language & quote logic
- Specs are always concrete and unit-bearing: "50 HP", "4WD", "8+2", "2370 kg", "Euro V", "-18 °C", "8 bar", "IP54". Numeric values render in the mono/label face. This is the register ads must match.
- **No prices anywhere on the site.** No cart, no checkout. Conversion = documented lead (catalog inquiry form, Mister quotation request, WhatsApp). "Cotización CIF documentada en 24 horas hábiles" is the promise (nosotros page) — the price comes from the human team, never from the site or Mister.
- Product comparison (`/catalogo/comparar`), multi-inquiry, Blueprint Mode (Pro data layer: HS chapter, ZOFRATACNA duty rate, altitude-corrected HP) all exist as differentiation surfaces.

---

## 2. Mister AI — Verbatim Architecture

Source: `spec/MISTER_MASTER_BRIEF.md` (production blueprint), `src/types/mister.ts`, `src/lib/mister/archetype.ts`.

### The five archetypes (verbatim, MISTER_MASTER_BRIEF.md §0)

| # | Archetype | Core driver | Primary need |
|---|-----------|-------------|--------------|
| A1 | The Lead / End Buyer | Buying for own use, price-sensitive | Education + confidence |
| A2 | The Project Manager | Procurement inside a larger operation | Specs + timelines + docs |
| A3 | The Logistics Manager | Moving goods compliantly | Customs docs, Incoterms, container specs, Tacna/Iquique corridor |
| A4 | The Reseller | Reselling for margin | Margins, MOQs, exclusivity, catalog breadth |
| A5 | The Wholesale / B2B Logistics Partner | Volume + integration | Multi-SKU, customs clearance, multi-country, long-term supply |

Type-level: `lead_buyer | project_manager | logistics_manager | reseller | wholesale_partner | unresolved` (`src/types/mister.ts`).

### Journey stages
`induction → discovery → consideration → pre_qualification → support` (type `MisterStage`). Brief states 4 post-induction stages.

### Induction (needs-diagnosis) flow
- 3–5 conversational questions resolving archetype; "must read like a senior trade specialist sizing up a new contact — not a form."
- Q0 opener (verbatim): *"I'm Mister — I run trade intelligence for Wings. Tell me what you're working on and I'll point you straight at what matters. To start: are you buying for your own operation, or moving/reselling these goods to someone else?"*
- Q1 own-use vs resale vs logistics → branch tree resolves A1–A5; refusal → `unresolved` observe mode. Archetype is sticky but re-resolvable (`archetype_history[]`).

### Keyword signals per archetype (`src/lib/mister/archetype.ts` — direct input for ad-copy language and interest targeting)
- **lead_buyer:** "para mi empresa/operación", "comprar", "quiero importar"
- **project_manager:** "proyecto", "especificación", "certificación", "cumplimiento", "obra", "sitio", "contrato", "procurement"
- **logistics_manager:** "logística", "corredor", "incoterm", "contenedor", "flete", "despacho", "aduanas"
- **reseller:** "revender", "distribuidor", "margen", "MOQ", "exclusividad", "mis clientes"
- **wholesale_partner:** "mayorista", "multi-país", "volumen", "acuerdo marco", "supply agreement"

### Hard rules (non-negotiable — ads must never contradict these)
1. Mister NEVER states a price, FOB/CIF/DDP figure, availability, or lead time. It teaches landed-cost STRUCTURE on indexed ranges (base 100) with mandatory disclaimers.
2. Structural anti-price guarantee: no `fetchPrice`/`getLeadTime`/`fetchStock` tool exists; `WaterfallSegment` requires paired `indexLow/indexHigh` + `disclaimerId` at the type level.
3. Routes when uncertain. A5 (wholesale) is ALWAYS human-mediated at pre-qualification — auto-quote disabled.
4. HOLD-BACK guardrail: full response buffered and price-scanned before any token reaches the client.

### Escalation / handoff (the ad conversion event)
- Quotation form (`/api/mister/quote` prefill token), **WhatsApp +50760250735** with session summary, or human contact card. Lead lands in `mister_projects` → ops WhatsApp + email (Resend/Twilio).
- Per-lane handoffs: A1 → prefilled quote or WhatsApp; A2 → formal quote + meeting + spec/compliance bundle; A3 → customs doc pack + logistics specialist; A4 → reseller pack + partnerships; A5 → wholesale desk + framework doc.

### Mister tone calibration (verbatim, brief §D3)
- lead_buyer: "warmer, educational, confidence-building. Explain jargon."
- project_manager: "precise, deadline-aware, document-oriented."
- logistics_manager: "technical, Incoterm-fluent... trade shorthand."
- reseller: "commercial, margin-aware, partnership-framed."
- wholesale_partner: "volume-fluent, integration-aware, long-term framed."

### Languages
`MisterLocale = 'es-PE' | 'en' | 'nl' | 'de'`. Site UI is Spanish-only; Mister mirrors user language.

---

## 3. Brand System (what ad creative must extend)

Sources: `spec/WINGS_BRAND_SYSTEM.md`, live `src/app/globals.css`, `CLAUDE.md`, live page copy.

### Thesis (verbatim)
> "Import intelligence should read like a certified document, not a marketplace listing."

### Color
- Navy `#001E50` (authority surfaces, backgrounds), Gold `#C4933F` (CTAs and meaning-carrying accents ONLY — "if you cannot state what the gold communicates, remove it"), Warm White `#F8F6F0` (never pure white — "Warm white on navy = document. Pure white on navy = screen.").
- Section alternation navy ↔ warm-white; never two same-color sections adjacent.

### Typography — LIVE SYSTEM (globals.css `:root`, confirms CLAUDE.md; supersedes WINGS_BRAND_SYSTEM.md §4 which still says IBM Plex Serif/DM Mono)
- **Display:** NissanOpti (weight 400 only, + italic) — headlines
- **Body/UI:** Flexo (8 weights) — narrative, buttons, labels
- **Mono/technical:** Teko (300–700, condensed) — ALL numeric values, eyebrow labels, reference numbers
- Rule carried over from the brand doc and enforced in components: **if it is a measurement, it is the mono face. No exceptions.**

### Copy rules (verbatim, brand system §6)
1. No exclamation marks. Ever.
2. Specific over generic — "79 HP efectivos a 3.200 msnm" not "alta potencia".
3. Periods, not ellipses — "Precisión. Proximidad. Confianza."
4. Never claim quality. Show it. "Productos de calidad" is forbidden.
5. No approximations without basis.
6. Reference numbers carry weight — WGT-2847, HS Capítulo 8701, Euro III.
- Forbidden: "Los mejores precios", "Somos líderes en...", "Amplia gama de...", "Haz clic aquí".
- Tone: "A senior trade engineer briefing a procurement director. Not a salesperson."

### Live voice samples (the register ads must hit)
- Hero slide 1: "Importación técnica para el mercado latinoamericano." / overline "Wings Global Trade" / CTA "Consulta técnica"
- Hero slide 2: "97 modelos. Precio CIF sin intermediarios." → "Ver camiones KAMA"
- Hero slide 3: "Maquinaria agrícola de origen verificado para el agro."
- StatBar: 97 Modelos disponibles · 05 Fabricantes verificados · 02 Zonas francas · 24h Respuesta garantizada
- Nosotros: "Dos posiciones en el corredor arancelario del Pacífico Sur" · "La posición es el argumento" · "El costo de internación es diferente desde dentro." · "La primera conversación es técnica. Sin precio adjunto." · "Tres pasos. Una cotización documentada." · "Mister — información antes de precio"
- Homepage Mister CTA: "¿Necesitas importar desde China? Mister te guía." — "Cotización CIF, zona franca, aranceles y nacionalización. Sin llamadas previas."

### Visual treatment for ads
- No stock photography, ever (brand system §8). Primary product visual = Technical Silhouette SVGs (warm-white monoline on navy); real photography only from owned assets (`public/Importacion/home-carousel/`, `public/Desktop Home/`, product masters in `assets/`).
- Motion: instrument-like — 0.3–0.6 s, standard ease, never spring/bounce. Blueprint Mode (navy, grid overlay, mono data) is "the brand's strongest differentiator" — a natural ad visual language.
- Logo: warm white on navy / navy on warm white; gold reserved for certification marks; never < 24 px.

---

## 4. Business Context

### Free-zone mechanics (nosotros page, verbatim data)
- **ZOFRATACNA** (Tacna, Perú, est. 1988): zona franca de transformación industrial; suspensión arancelaria hasta destino final en Perú y Bolivia; autoridad SUNAT; destino Perú, Bolivia, sur de Colombia.
- **ZOFRI** (Iquique, Chile, est. 1975): zona franca comercial e industrial; tránsito con 0% aranceles hacia Bolivia, Colombia y Ecuador; destino Chile, Colombia, Panamá, Cono Sur.
- Source markets: China, Tailandia, Japón, Dubai. Markets served: Perú, Chile, Colombia, Panamá, Costa Rica, Bolivia, R. Dominicana (`src/lib/constants.ts`).
- Ops WhatsApp: +50760250735. Email: comercial@wingsglobaltrade.com. Response SLA: 24 horas hábiles.

### Geography assessment for Meta targeting
- Locale is `es_PE` everywhere; register is Peruvian business Spanish. **Peru = primary market.**
- Chile/Bolivia ARE addressable: ZOFRI is physically in Chile with 0%-duty transit to Bolivia; ZOFRATACNA covers Bolivia. Bolivia (no coast, imports via Arica/Iquique corridor) is a strong secondary. Chile domestic buyers less differentiated (Chile already has low import tariffs — the free-zone arbitrage argument is weaker; ZOFRI's pitch there is operational, not tariff).
- Recommendation (assumption A3 below): launch Peru; test cells for Bolivia (Santa Cruz, La Paz, El Alto, Cochabamba) and northern Chile (Arica, Iquique, Antofagasta — mining corridor).

### KPI baseline (`spec/success-metrics.md`)
- North Star: Inquiry Conversion Rate (qualified submissions / unique visitors) — target ≥ 3%.
- Catalog ICR ≥ 4%; Mister-page ICR ≥ 15% (higher intent, longer funnel); ≥ 10 leads/week by day 60; lead response < 4 h; mobile/desktop conversion parity ≥ 0.7.
- Funnel stages already defined (Landing → Engaged → Interested → Intent → Converted) — the Meta event schema in `01-foundation/measurement-plan.md` maps 1:1 onto these.

### Measurement infrastructure — CRITICAL GAP
- **No Meta Pixel, no CAPI, no GA/PostHog exists in `src/`.** Only Vercel Analytics is referenced. Pixel + Conversions API installation is a hard prerequisite (workstream 0 in the measurement plan). Conversion signals do exist server-side (POST `/api/leads/*` 201, `/api/mister/submit` 201, WhatsApp deep-link clicks) — ideal CAPI hooks.

---

## 5. Agents & Skills Used in This Program

| Deliverable | Skill/agent | Why |
|---|---|---|
| All campaign strategy + concepts (02/03/04) | `creative-campaign-builder` skill | Campaign concepting, briefs, award-level bar |
| Spanish ad copy quality gate (all creative-briefs.md) | `copy-messaging-audit` skill | Register check: Peruvian B2B, brand copy rules |
| Brand extension rules for the master creative system (02) | `brand-universe` principles via WINGS_BRAND_SYSTEM.md | Brand doc is already authoritative; skill applied as checklist |
| Asset production follow-up wave (05) | social-creative-studio / Higgsfield pipeline (immersive-agency skill wave) | Queue formatted for direct ingestion |

Not used: visual-audit (no rendered ad assets exist yet to audit), lead-magnet-studio (candidate for a follow-up wave: customs doc pack as A3 lead magnet is specced in the lane maps).

---

## 6. Assumptions (explicit)

| # | Assumption | Reasoning |
|---|-----------|-----------|
| A1 | **Budget unknown.** All budgets expressed as % splits of a placeholder `{{MONTHLY_BUDGET}}`, with minimum-viable floors per ad set (Meta needs ~50 conversions/week/ad set to exit learning; at B2B lead CPAs this implies ≥ US$1,500–2,500/mo to run more than 2–3 conversion ad sets). | No budget figure anywhere in spec or docs. |
| A2 | **Category priority: camiones and maquinaria-agricola first.** | They carry the deepest real inventory (KAMA 97 modelos; 31 tractors + 4 application pages), both have hero slides, and agro has purpose-built SEO landing pages. Buses/equipo-industrial/repuestos get lighter always-on or umbrella treatment until inventory/photography deepens. |
| A3 | **Geography: Peru launch; Bolivia + northern Chile as labeled test cells (≤ 20% budget).** | es_PE locale; free-zone value prop strongest for Peru/Bolivia (tariff suspension); Chile domestic tariff arbitrage is weak so Chile targeting focuses on the mining/logistics corridor (Arica–Iquique–Antofagasta). |
| A4 | **Ads may say "cotización CIF documentada en 24 horas hábiles" (team promise) but must NEVER imply Mister itself gives prices or availability.** | Mister hard rules are architectural; an ad promising "precios al instante con IA" would break the product's core promise and create a rejected expectation. Note: legacy `misterContext` strings in `subcategory-catalog.ts` phrase user questions as "¿cuál es el precio CIF?" — that is the user's question INTO Mister, not Mister's output. |
| A5 | **Conversion events for optimization: catalog lead submit, Mister quotation submit, WhatsApp click-through.** Completed-diagnosis (pre_qualification stage reached) is a custom event we define. | These are the only real conversions; the site has no purchase event. |
| A6 | **Meta Business assets (page, IG account, verified domain) do not yet exist or are unknown.** Setup listed as prerequisite. | No evidence in repo. |
| A7 | **Language: Spanish (es-PE) creative only for launch.** Mister's en/nl/de locales are not ad-worthy audiences in LATAM geo targeting. | Site UI is Spanish-only; buyers are LATAM. |
| A8 | **Repuestos is a lot-based B2B line (cajas x 50), not retail** — ads target workshop/fleet purchasing managers, not consumers. | Seed data "Presentación: Caja x 50 unidades"; `/repuestos` page is Japanese-engine focused. |
| A9 | Product photography for ads = owned assets in `public/Importacion/`, `public/Desktop Home/`, `assets/` + Technical Silhouette treatment. No stock. | Brand system §8 prohibition. |

---

## 7. Open questions for Muaaz (none blocking — proceeding on assumptions above)

1. Monthly Meta budget and target CPL range?
2. Do Wings Facebook Page / Instagram / WhatsApp Business (+50760250735 on WABA?) exist? Click-to-WhatsApp ads require WABA.
3. Is Bolivia commercially serviceable today (broker/last-mile), or aspirational?
4. Any category Wings wants to push for inventory reasons (e.g., KAMA container arriving)?
