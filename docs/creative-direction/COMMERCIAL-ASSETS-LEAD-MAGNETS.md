# Wings Global Trade — Commercial Asset Strategy
## Product Page Intelligence × Lead Magnet Agent Collaboration
**Date:** 2026-06-19 | **References:** REBUILD-100.md · IA-AUDIT-2026-06-19.md · lead-magnet-studio/SKILL.md

---

## THE CORE INSIGHT

The product page rebuilt to 100/100 is not just a catalog entry. It is a **B2B data intelligence instrument** — the densest, most technically precise machinery reference in the LatAm import space. Every data layer it generates is unique to Wings: altitude HP correction, ZOFRATACNA duty rates, named-port transit times, certification detection, operational field intelligence.

None of this information exists in one place anywhere else in the market.

That information asymmetry is the commercial asset. Lead magnets are how you extract it from the platform and distribute it to buyers who haven't yet visited the catalog.

**The principle:** The product page at 100/100 generates category-level intelligence as a byproduct of doing its primary job. Lead magnets are that intelligence aggregated, packaged, and placed at the edge of the buyer funnel — where the buyer exists before they find Wings.

---

## THE DATA FLYWHEEL

```
Product Page Intelligence Layers
         ↓
Aggregated at Category Level
         ↓
Packaged as Lead Magnets (6 formats below)
         ↓
Distributed at the funnel edge (LinkedIn, trade press, Google)
         ↓
Contact captured → Wings ops notified
         ↓
Buyer enters the catalog with trust already established
         ↓
Inquiry submitted → conversion
```

Each lead magnet is scored on three axes from the lead-magnet-studio skill:
- **Urgency** (how acutely does the buyer need this right now?) /10
- **Relevance** (how precisely is this matched to the buyer's role?) /10
- **Proximity** (how close is this buyer to placing an inquiry?) /10

---

---

## ASSET 01 — HP en Altitud Calculator

### Concept
An interactive single-page HTML tool. The buyer inputs their machine's HP and target operating altitude. The tool returns: effective HP at that altitude, recommended HP headroom for their application, and a shortlist of Wings catalog machines that meet the corrected power requirement.

**Title (final):**
> "Calculadora de Potencia Real en Altitud — ¿Cuánto HP llega a su operación en Puno, Cusco o Ayacucho?"

### Why This Converts
Altitude performance degradation is the single most expensive unknown for Peruvian machinery buyers outside Lima. A buyer in Ayacucho (2,740m) purchasing a 100HP tractor will receive a machine that delivers ~83HP at their operating site. If they budgeted for 100HP operations, they underbought by 17%. This calculator makes that visible and urgent — and then solves it by pointing to the right product.

**The pre-sell effect (Law 4):** The calculator gives away the formula. It creates the problem (your chosen machine is undersized for your altitude) and the tool that solves it points directly into the Wings catalog.

### Data Source in Rebuilt Page
- `altitudeHpCorrection()` from `src/lib/product-intelligence.ts` (Phase 0)
- `EnginePowerBand` component (Phase 1) — the visual curve logic
- RANGES constant from `spec-normalize.ts` — catalog HP range

### Audience Profile
- Role: Agricultural operations manager, logistics director, procurement lead
- Geography: Peru sierra (Puno, Cusco, Ayacucho, Junín, Cajamarca, Arequipa highlands)
- Pain: Underpowered machinery in field; wasted capex on wrong spec
- Urgency: 9/10 — affects every purchase decision
- Relevance: 10/10 — applies to every machine Wing sells
- Proximity: 9/10 — person using this tool is actively evaluating machines

### Format
Interactive HTML single page. Two inputs: HP value (numeric field) + Altitude in msnm (slider from 0–5000). Output: corrected HP, % loss, recommended HP range for application, 2–3 catalog machines that meet the corrected spec.

Static fallback: 1-page PDF reference table (HP × altitude matrix) for buyers without internet at site.

### Placement
- Product page: below EnginePowerBand in the left column — "¿Opera en sierra? Calcula tu HP efectivo →"
- Catalog category pages: banner above product grid for maquinaria-agricola and camiones
- LinkedIn: promoted post targeting Peru logistics/agribusiness decision-makers
- Partner channels: Peruvian agricultural associations (CONVEAGRO, regional chambers)

### Conversion Hook
After the calculation: "Su operación necesita un mínimo de [X] HP en condiciones estándar. Estos modelos cumplen ese requisito desde ZOFRATACNA:" → 2-3 product cards with direct inquiry CTA.

---

### Lead-Magnet Agent Activation Prompt

```
You are the Lead Magnet agent working for Wings Global Trade — a B2B import platform for Latin American machinery importers. Stack: Next.js 15, TypeScript, Tailwind, pnpm. Primary market: Peru (ZOFRATACNA free trade zone). Clients are agribusiness, logistics, and industrial operations managers who import machinery from China.

Read ~/.claude/skills/lead-magnet-studio/SKILL.md first.

MODE: BUILD — the concept is defined. Execute it.

PRODUCT/OFFER: Wings Global Trade catalog of agricultural machinery, trucks, buses, and industrial equipment sourced from China via ZOFRATACNA, Peru.

AUDIENCE: Agricultural and logistics operations managers in the Peruvian sierra (Puno, Cusco, Ayacucho, Junín, Cajamarca). They purchase machinery and consistently underestimate altitude performance degradation. A machine rated at 100HP loses 15-20% power at 3,000-4,000m. Most buyers don't know this until the machine underperforms in the field.

LEAD MAGNET CONCEPT:
Title: "Calculadora de Potencia Real en Altitud — ¿Cuánto HP llega a su operación?"
Format: Interactive HTML single page (use vanilla HTML + inline CSS + inline JS — no framework, must be self-contained in one .html file)

CONTENT ARCHITECTURE:

Section 1 — Input form:
- HP input: number field, label "HP nominal del equipo", placeholder "ej. 100"
- Altitude input: range slider 0–5000 (step 100), label "Altitud de operación (msnm)", with live value display
- Application type: select — "Agrícola / Tractor", "Transporte / Camión", "Industrial / Montacargas"
- CTA button: "Calcular potencia efectiva"

Section 2 — Results (hidden until calculate clicked):
- Big number: HP efectivo (calculated as: hp * 0.97^floor(max(0,altitude-2000)/300), rounded to integer)
- Loss %: Math.round((1 - effective/nominal) * 100) + "% de reducción por altitud"
- Recomendación box: if loss > 15% → "Para esta altitud recomendamos un equipo con al menos [nominal * 1.22] HP nominales." If loss 8-15% → "Pérdida moderada. Verifique reserva de potencia con el proveedor." If loss < 8% → "Pérdida leve. El equipo opera dentro de rango aceptable."
- HP range table: show HP efectivo at 2000m, 2500m, 3000m, 3500m, 4000m for the entered HP value.

Section 3 — CTA:
- "Consulte los modelos disponibles en Wings que cumplen este requisito:"
- Placeholder product cards (3 cards styled in navy/gold matching Wings brand)
- Final CTA: "Solicitar cotización con potencia certificada → [form link]"

DESIGN: Brand colors Navy #001E50, Gold #C4933F, Warm White #F8F6F0. DM Mono for all data, Flexo/system-ui for body. No gradients. Clean, clinical, expert.

OPT-IN PAGE COPY (write as a separate section at the end of your output):
- Headline: "Su máquina pierde hasta un 20% de potencia en la sierra. ¿Cuánto pierde la suya?"
- Subhead: "Calcule la potencia real de cualquier equipo a su altitud de operación — en 30 segundos."
- 3 bullets: specific, no exclamations, in Spanish
- CTA: "Calcular ahora — sin registro"
- Trust line: "Usado por equipos de operaciones en más de 12 regiones del Perú."

OUTPUT FILES:
- /lead-magnets/hp-altitud-calculator.html (the complete self-contained tool)
- /lead-magnets/hp-altitud-calculator-content.md (copy architecture and opt-in page copy)
Signal completion with /lead-magnets/MAGNET_COMPLETE.flag
```

---

---

## ASSET 02 — Guía de Aranceles ZOFRATACNA

### Concept
A 2-page reference card. HS chapters for every machinery and vehicle category Wings sells, matched to ZOFRATACNA and ZOFRI duty rates, compared to standard corridor rates. The buyer immediately sees: importing via the free zone saves them X% in duty.

**Title (final):**
> "Aranceles ZOFRATACNA vs. Importación Directa: La Tabla que Todo Comprador de Maquinaria Necesita Antes de Cotizar"

### Why This Converts
Customs duty is one of the three biggest unknowns for a B2B machinery buyer. A buyer comparing "China FOB $45,000" against budget doesn't know if the final landed cost is $52,000 or $68,000. This table makes the calculation transparent and simultaneously positions Wings as the expert operator who knows the corridor — and uses it.

**The pre-sell effect:** The table reveals the savings (6–9% ad valorem avoided via ZOFRATACNA). The implementation of those savings requires a sourcing partner who operates via the zone. That is Wings.

### Data Source in Rebuilt Page
- `duty-rates.ts` — complete DUTY_RATE_TABLE (all countries × all chapters)
- `HS_CHAPTER` mapping from `product-intelligence.ts` (Phase 0)
- `BlueprintDataLayer` HS + duty rate display (Phase 5)
- `categoryDutyRate()` function

### Audience Profile
- Role: CFO, procurement manager, head of operations, customs agent (intermediary)
- Geography: Peru, Bolivia, Chile, Colombia (all served markets in duty-rates.ts)
- Pain: Can't estimate landed cost without calling a broker; brokers are slow
- Urgency: 8/10 — every purchase decision requires this calculation
- Relevance: 9/10
- Proximity: 8/10 — financial decision-makers who download this have budget authority

### Format
PDF — 2 pages. Page 1: duty rate matrix (destination country × HS chapter × rate). Page 2: ZOFRATACNA vs. direct import comparison with example calculation, Wings contact CTA. Clean tabular design. Print-ready.

### Placement
- Google organic: target "arancel importación maquinaria Peru", "ZOFRATACNA arancel tractor"
- Wings contact page + footer: "Descargue la guía de aranceles →"
- Accio Engine completion screen: "Mientras preparamos su cotización, aquí tiene la tabla de aranceles de referencia →"

---

### Lead-Magnet Agent Activation Prompt

```
You are the Lead Magnet agent for Wings Global Trade (B2B machinery import, Peru/Chile/Bolivia via ZOFRATACNA and ZOFRI free trade zones).

Read ~/.claude/skills/lead-magnet-studio/SKILL.md first.

MODE: BUILD

AUDIENCE: Procurement managers and CFOs in Peru, Bolivia, and Chile evaluating large capital equipment imports from Asia. They cannot estimate landed cost without calling a customs broker. The biggest budget unknown is: "how much will I actually pay in duties?"

LEAD MAGNET CONCEPT:
Title: "Aranceles ZOFRATACNA vs. Importación Directa: La Tabla que Todo Comprador de Maquinaria Necesita Antes de Cotizar"
Format: PDF (generate as complete HTML with print-perfect CSS — WeasyPrint-ready if available, else clean HTML for browser print)

CONTENT TO INCLUDE:

Page 1 — Duty Rate Reference Table:
A table with these exact values (use them verbatim):

HS Chapter | Description | Perú (ZOFRATACNA) | Chile | Colombia | Bolivia
84xx | Maquinaria agrícola / industrial | 6% | 6% | 5% | 5%
85xx | Maquinaria eléctrica / generadores | 6% | 6% | 5% | 5%
87xx | Vehículos (camiones, buses, tractores) | 9% | 6% | 10% | 10%
40xx | Neumáticos / caucho | 6% | 6% | 10% | 10%

Below the table: footnote "Tasas ad valorem de referencia. Verificar con agente de aduana antes de nacionalizar. Fuente: WTO Tariff Schedules + SUNAT Perú."

Page 1 continued — ZOFRATACNA Savings Calculator:
Show a worked example:
"Maquinaria agrícola — valor FOB USD 45,000
Flete + seguro (CIF): USD 4,800
Valor CIF total: USD 49,800
Arancel estándar (sin zona franca): 6% → USD 2,988
Arancel vía ZOFRATACNA: 0% en zona → ahorro estimado: USD 2,988
Ahorro adicional por optimización de tránsito: ~18.5% vs. corredor estándar"

Page 2 — How It Works (brief):
3-step visual: 1. Origen (China/Tailandia) → 2. ZOFRATACNA/ZOFRI → 3. Destino final
Below: "Wings Global Trade opera directamente en zona franca. Sin intermediarios en el corredor de importación."
CTA box: "Solicite su cotización CIF con desglose completo de aranceles → [wings contact]"

DESIGN: Navy #001E50 background for headers, gold #C4933F for data values, warm white #F8F6F0 page background. DM Mono for all numbers. Flexo/system-ui for body. Professional, dense, print-ready. No decorative elements — only information.

OPT-IN PAGE COPY (write separately):
Headline: "¿Cuánto pagará realmente en aranceles? La tabla que su agente de aduana no le muestra antes de cotizar."
Subhead: "Descargue la referencia de aranceles ZOFRATACNA para maquinaria — actualizada 2025."
3 bullets: specific numbers, no exclamations
CTA: "Descargar tabla — PDF gratuito"
Trust: "Utilizada por importadores en Perú, Bolivia y Chile."

OUTPUT FILES:
- /lead-magnets/aranceles-zofratacna.html (print-ready HTML/PDF source)
- /lead-magnets/aranceles-zofratacna-content.md
Signal: /lead-magnets/MAGNET_COMPLETE.flag
```

---

---

## ASSET 03 — Radar de Comparación de Tractores

### Concept
A PDF report featuring SpecFingerprint radar charts for the 8 highest-demand tractors in the Wings catalog, overlaid in pairs for direct visual comparison. Each radar carries axis labels, actual values, and a one-line operational note. The buyer sees at a glance which machine scores on which dimension.

**Title (final):**
> "Los 8 Tractores de Mayor Demanda en ZOFRATACNA: Comparación Técnica por Radar de Especificaciones"

### Why This Converts
The SpecFingerprint is the most visually distinctive element in the rebuilt page. At scale (8 machines compared), it becomes a genuine decision tool. Procurement managers compare machines constantly and hate switching between tabs. A single document with visual fingerprints + key specs + catalog proximity score gives them everything they need to shortlist.

**Identity signal (Law 5):** Downloading a document called "Comparación Técnica por Radar" signals that the buyer is technical, serious, and comparing. This is the exact buyer Wings wants.

### Data Source in Rebuilt Page
- `SpecFingerprint` component — SVG output for each product
- `rawSpecValues()` from spec-normalize.ts — actual values to label vertices
- `catalogPercentile()` from product-intelligence.ts — context labels
- Comparison ghost polygon feature (Phase 2)

### Audience Profile
- Role: Agricultural procurement manager, farm director, cooperative purchasing manager
- Pain: Can't compare machines across multiple tabs efficiently; spec tables don't show relative strengths
- Urgency: 7/10 — comparison phase, not yet at inquiry
- Relevance: 10/10 for active evaluators
- Proximity: 8/10 — comparison = pre-inquiry

### Format
PDF — 10 pages. Cover + 8 product pages (one per tractor) + comparison matrix page. Each product page: radar at large size (200px+ equivalent), 6 axis values labeled, 3 key operational specs, source market, inquiry CTA. Final page: all 8 radars in a 2×4 grid for side-by-side visual comparison.

### Placement
- Category page (maquinaria-agricola) comparison section: "Descargue la comparación técnica completa →"
- After a buyer adds 2+ products to the compare bar
- LinkedIn sponsored content targeting agricultural decision-makers Peru/Bolivia
- Email to previous inquirers in maquinaria-agricola category

---

### Lead-Magnet Agent Activation Prompt

```
You are the Lead Magnet agent for Wings Global Trade (B2B machinery import, Peru via ZOFRATACNA).

Read ~/.claude/skills/lead-magnet-studio/SKILL.md first.

MODE: BUILD

AUDIENCE: Agricultural procurement managers and farm directors in Peru and Bolivia who are actively comparing 3–8 tractor models before making a purchase decision. They are technical, not marketing-receptive, and will respond to comparative engineering data — not promises.

LEAD MAGNET CONCEPT:
Title: "Los 8 Tractores de Mayor Demanda en ZOFRATACNA: Comparación Técnica por Radar de Especificaciones"
Format: HTML (print-ready, each page is a structured template with SVG radars — WeasyPrint-friendly)

CONTENT ARCHITECTURE:

Page 1 — Cover:
"INFORME COMPARATIVO TÉCNICO · MAQUINARIA AGRÍCOLA · WINGS GLOBAL TRADE"
Subtitle: "Análisis de especificaciones técnicas para los 8 modelos de mayor rotación en importaciones via ZOFRATACNA, actualizado 2025"
DM Mono, Navy background, Gold accent line.

Pages 2–9 — One page per tractor (use these 8 placeholder products — actual values to be replaced with real Supabase data at generation time):
For each tractor page, render:
a) Product name (Cormorant Garamond, 18px, navy)
b) SpecFingerprint SVG radar (draw this as an actual inline SVG, not a placeholder):
   - 6 axes: HP, CARGA, GVW, BATALLA, VEL, PESO
   - Use these sample normalized values for the 8 tractors (0-1 scale):
     Tractor A: hp=0.22, payload=0.35, gvw=0.28, wheelbase=0.45, speed=0.30, weight=0.25
     Tractor B: hp=0.35, payload=0.50, gvw=0.42, wheelbase=0.52, speed=0.38, weight=0.38
     Tractor C: hp=0.48, payload=0.62, gvw=0.55, wheelbase=0.60, speed=0.45, weight=0.50
     Tractor D: hp=0.55, payload=0.40, gvw=0.45, wheelbase=0.55, speed=0.60, weight=0.45
     Tractor E: hp=0.62, payload=0.55, gvw=0.58, wheelbase=0.65, speed=0.55, weight=0.58
     Tractor F: hp=0.70, payload=0.70, gvw=0.68, wheelbase=0.70, speed=0.62, weight=0.65
     Tractor G: hp=0.78, payload=0.65, gvw=0.72, wheelbase=0.75, speed=0.68, weight=0.70
     Tractor H: hp=0.85, payload=0.80, gvw=0.82, wheelbase=0.80, speed=0.72, weight=0.78
   - Draw the SVG radar at 200×200px with actual polygon path computed from the values, 3 ring scaffolds, axis lines, gold vertex dots, axis labels with DM Mono 8px
c) 3 key spec rows: HP / GVW / Capacidad de Carga in DM Mono
d) One-line operational note: written for a sierra operator (altitude, terrain, use case)
e) Mini CTA: "Ver ficha completa → wings-global-trade.com/catalogo/..."

Page 10 — Comparison Grid:
Title: "Vista Comparativa — 8 Modelos"
All 8 radars at 120×120px in a 2×4 grid. Product name below each. No other decoration.

Page 11 — CTA page:
"¿Necesita una comparación personalizada para su operación?"
"Nuestro equipo técnico prepara una selección de modelos según su altitud de operación, carga y presupuesto."
CTA button: "Solicitar comparación personalizada →"

DESIGN SYSTEM: Same as always — Navy #001E50, Gold #C4933F, Warm White #F8F6F0, DM Mono for all data, Cormorant Garamond for product names. Print-ready.

OPT-IN PAGE COPY (separate section):
Headline: "8 tractores. Un documento. La comparación técnica que le ahorra 3 semanas de investigación."
Subhead: "Radares de especificaciones, datos de potencia y contexto operativo para los modelos de mayor demanda en ZOFRATACNA."
3 bullets: technical, specific, no hype
CTA: "Descargar comparación — PDF gratuito"
Trust: "Información técnica verificada. Sin marketing. Solo datos."

OUTPUT FILES:
- /lead-magnets/radar-comparacion-tractores.html
- /lead-magnets/radar-comparacion-tractores-content.md
Signal: /lead-magnets/MAGNET_COMPLETE.flag
```

---

---

## ASSET 04 — Manual de Campo: Lo Que el Catálogo No Te Dice

### Concept
A category-specific operational guide — one version per category (4 total) or a combined 20-page guide. Uses the FieldReport content as seed material, expanded with altitude correction formulas, MTC/SUTRAN regulatory notes, ZOFRATACNA admission requirements, and real maintenance considerations for Andean conditions.

**Title (final):**
> "Lo Que el Catálogo No Te Dice: Guía Técnica para Operar Maquinaria Importada en Perú"

### Why This Converts
Every piece of information in this guide is the type a buyer discovers only after they've received and deployed the machine. Learning it before saves them real money. The pre-sell creates obligation: the buyer thinks "Wings told me this before I even bought — they actually know this business."

**Proximity trap:** The guide surfaces regulatory requirements (MTC homologation, INDECOPI certifications, SUTRAN compliance) that the buyer now knows they need to solve. Wings is the natural solver.

### Data Source in Rebuilt Page
- `FieldReport` content from the new product-specific API (Phase 4)
- `altitudeHpCorrection()` — for concrete altitude-HP examples in the guide
- `detectCertifications()` — to list which certifications matter per category
- SPEC_CONTEXT map from ProductSpecTable — expanded into the guide

### Format
PDF per category, 12–16 pages each. Or one combined PDF with category tabs. Each section: operational facts, concrete numbers, regulatory references, a checklist for pre-deployment verification.

### Placement
- Accio Engine TPR completion: "Antes de finalizar su cotización, descargue la guía de campo →"
- Blog/SEO: target "importar tractor Peru", "camion chino homologacion Peru"
- Post-inquiry follow-up email: send to all new leads as nurture content

---

### Lead-Magnet Agent Activation Prompt

```
You are the Lead Magnet agent for Wings Global Trade (B2B machinery import, Peru via ZOFRATACNA).

Read ~/.claude/skills/lead-magnet-studio/SKILL.md first.

MODE: BUILD

AUDIENCE: Operations managers and technical directors at Peruvian agricultural companies, logistics operators, and municipal governments who are importing machinery for the first time or have had bad experiences with underpowered/non-compliant machines. They are technical. They trust data over claims.

LEAD MAGNET CONCEPT:
Title: "Lo Que el Catálogo No Te Dice: Guía Técnica para Operar Maquinaria Importada en Perú"
Subtitle: "Altitud, homologación, mantenimiento y zonas francas — la inteligencia operativa que los proveedores no publican"
Format: PDF, 16 pages, structured as a field manual

CONTENT ARCHITECTURE:

Page 1 — Cover + purpose statement:
"Esta guía contiene información que la mayoría de importadores aprende después de la primera compra. Está diseñada para que usted la aprenda antes."

Pages 2–4 — CAPÍTULO 1: Potencia en Altitud:
- Formula explanation: HP efectivo = HP nominal × 0.97^floor((altitud - 2000) / 300)
- Reference table: HP loss by altitude (2000m, 2500m, 3000m, 3500m, 4000m, 4500m) for nominal HP values 50, 80, 100, 120, 150, 180HP
- Rule of thumb: "Para operación habitual sobre 3.000 msnm, compre 20% más HP del que necesita en llano"
- Application note per category: tractores (sierra agrícola), camiones (ruta Callao-La Paz), buses (servicio interprovincial), equipo-industrial (ZOFRATACNA, elevación en bodega)

Pages 5–7 — CAPÍTULO 2: Homologación y Requisitos Peruanos:
- MTC requirements for commercial vehicles (resolution reference, SUTRAN compliance)
- Emission norms: Euro II mínimo para importación regular; Euro III/IV para licitaciones públicas
- INDECOPI certification requirements for lifting equipment (montacargas, grúas)
- Practical checklist: 8 documents required before nationalization

Pages 8–10 — CAPÍTULO 3: ZOFRATACNA — Cómo Funciona:
- What ZOFRATACNA is (simple explanation, not legal jargon)
- What it costs to process vs. direct import
- Admission classes by HS chapter
- Timeline from arrival at ZOFRATACNA to Lima delivery: 7-12 business days
- What Wings handles vs. what the buyer handles

Pages 11–13 — CAPÍTULO 4: Mantenimiento en Condiciones Andinas:
- Fuel system: altitude affects fuel/air mixture — carburetors vs. injection systems
- Cooling systems: reduce coolant change intervals at altitude (heat dissipation is harder)
- Hydraulic oil viscosity in cold highland temperatures
- Tire pressure correction for altitude
- Filter change intervals: dusty highland conditions = 40% shorter intervals than factory spec

Pages 14–15 — CAPÍTULO 5: Lista de Verificación Pre-Despliegue:
A 20-item checklist organized by: Documentación / Especificaciones / Condiciones del sitio / Infraestructura / Proveedor

Page 16 — CTA:
"¿Necesita un modelo específico para su altitud y aplicación? Nuestro equipo técnico hace la selección por usted."
"Consulta sin compromiso: respuesta en 24 horas."
[Inquiry CTA]

TONE: Technical, direct, peer-to-peer. Like a senior engineer briefing a junior buyer. No marketing language. Specific numbers always. Short paragraphs. Heavy use of tables, checklists, and formulas.

DESIGN: Field manual aesthetic — Navy headers, warm white pages, gold accent rules, DM Mono for all technical data, Flexo/system-ui for body text. Dense but well-organized. Print-ready.

OPT-IN PAGE COPY (write separately):
Headline: "La información que su proveedor no le da hasta que el equipo ya llegó a obra."
Subhead: "16 páginas de inteligencia técnica sobre altitud, homologación y zonas francas — antes de firmar su orden de compra."
3 bullets (ultra-specific, no hype)
CTA: "Descargar guía de campo — gratis"
Trust: "Basado en más de [X] importaciones procesadas vía ZOFRATACNA."

OUTPUT FILES:
- /lead-magnets/guia-campo-maquinaria-peru.html
- /lead-magnets/guia-campo-maquinaria-peru-content.md
Signal: /lead-magnets/MAGNET_COMPLETE.flag
```

---

---

## ASSET 05 — China → ZOFRATACNA en 38 Días

### Concept
A visual timeline document — one horizontal strip showing every step of the import journey from factory departure in China to delivery at the buyer's site in Peru, with number of days per step, key documents required at each node, and costs by phase.

**Title (final):**
> "China a Lima en 38 Días: El Timeline Completo de una Importación Vía ZOFRATACNA (Con Costos y Documentos)"

### Why This Converts
The single most paralyzing unknown for first-time importers is: "How long does this actually take?" This timeline removes that uncertainty entirely. Every step is labeled, timed, and document-mapped. The buyer can plan their operation around it.

**The strategic gift:** The timeline makes the complexity visible AND manageable. It would take the buyer months of broker conversations to assemble this picture. Wings gives it away — and immediately establishes that Wings is the guide who knows every step of that journey.

### Data Source in Rebuilt Page
- `ProvenanceRibbon` node data + `getTransitDays()` (Phase 0, Phase 3)
- `TradeRouteAnimation` particle route + labels (Phase 3)
- `ORIGIN_PORTS` lookup — port names and countries
- Accio Engine CIF calculator — cost data per phase

### Format
PDF — 2 pages. Page 1: full horizontal timeline (SVG-driven, beautiful). Page 2: document checklist per phase + Wings role at each step.

### Placement
- Homepage above-the-fold or trust bar section
- Accio Engine introduction screen: "Antes de empezar, descargue el timeline completo →"
- LinkedIn targeted at first-time importers
- Google: "como importar maquinaria de china a peru", "importacion maquinaria ZOFRATACNA pasos"

---

### Lead-Magnet Agent Activation Prompt

```
You are the Lead Magnet agent for Wings Global Trade (B2B machinery import, Peru via ZOFRATACNA).

Read ~/.claude/skills/lead-magnet-studio/SKILL.md first.

MODE: BUILD

AUDIENCE: Business owners and operations managers who have never imported from Asia before. They have identified a machinery need, know they want to import directly (not buy local), and are paralyzed by not knowing what the process involves or how long it takes. This is their first question before any price conversation.

LEAD MAGNET CONCEPT:
Title: "China a Lima en 38 Días: El Timeline Completo de una Importación Vía ZOFRATACNA"
Subtitle: "Cada paso, cada documento, cada costo estimado — desde fábrica hasta su obra"
Format: HTML (print-ready, 2 pages A4 landscape / A4 portrait)

CONTENT ARCHITECTURE:

Page 1 — Visual Timeline (LANDSCAPE or full-width):

Draw an SVG timeline with these exact 8 nodes and day counts:

Node 1: FÁBRICA (China) — Día 0
  "Orden de producción / confirmación · Inspección pre-embarque"
  Cost note: "Depósito: 30% FOB"
  
Node 2: PUERTO DE ORIGEN (Yantian · Guangdong) — Día 3
  "B/L emitido · Seguro de carga contratado · Contenedor cerrado"
  Cost note: "Flete prepagado: incluido en CIF"
  
Node 3: EN TRÁNSITO — Días 3–31
  The ocean leg — wide horizontal line, animated shimmer in HTML
  "28 días promedio desde China"
  Cost note: "Seguro ICC-C: 1.5% del valor CIF"
  
Node 4: CALLAO / PUERTO DESTINO — Día 31
  "Descarga y revisión documental aduanera"
  "DUA (Declaración Única de Aduana) presentada por agente"
  
Node 5: TRASLADO ZOFRATACNA — Días 31–34
  "Traslado terrestre Callao → Tacna (1,350 km, 18-20 horas)"
  Cost note: "Transporte interno: USD 450–650 por contenedor"
  
Node 6: PROCESO EN ZONA FRANCA — Días 34–38
  "Recepción en zona · Verificación documental · Emisión de admisión"
  "ZOFRATACNA emite Certificado de Admisión"
  
Node 7: NACIONALIZACIÓN — Día 38–42
  "Pago de arancel (si aplica) · Levante aduanero"
  "Entrega DUA definitiva al comprador"
  
Node 8: ENTREGA EN DESTINO — Días 38–45
  "Despacho desde Tacna al destino final del cliente"
  "Lima: +1-2d · Arequipa: +1d · Cusco: +2d · Puno: +2d"

DESIGN OF TIMELINE: Navy background. Gold dashed line connecting nodes. Each node: circle or square marker in gold. Node title in DM Mono bold 9px warm-white. Sub-text in DM Mono 7px warm-white/65. Cost notes in DM Mono 7px gold/80. Wide horizontal layout. The ocean leg spans more horizontal space than the land legs.

Page 2 — Documents + Wings Role:

Left column — "Documentos por Fase":
A clean table: Phase | Documento | Quién lo gestiona
(Factory) | Factura comercial, Packing List | Proveedor / Wings
(Puerto origen) | Bill of Lading, Seguro de carga | Naviera / Wings
(Aduana Perú) | DUA de tránsito | Agente aduanero
(ZOFRATACNA) | Solicitud de admisión, Certificado de admisión | Wings / agente zona
(Nacionalización) | DUA definitiva, Liquidación arancelaria | Agente aduanero

Right column — "El rol de Wings en cada fase":
Short paragraph per phase explaining exactly what Wings does vs. what the buyer is responsible for.

Bottom — Full-width CTA:
"¿Listo para iniciar su importación?"
"Su consulta con Wings tarda 24 horas en recibir una propuesta formal con timeline personalizado."
[CTA: "Iniciar consulta →"]

OPT-IN PAGE COPY (separate):
Headline: "¿Cuánto tiempo tarda importar maquinaria de China a Lima? 38 días. Aquí está cada uno."
Subhead: "El primer documento que necesita antes de hablar con cualquier proveedor o agente de aduana."
3 bullets: numbers, specific, no hype
CTA: "Descargar timeline — sin registro"
Trust: "Más de [X] importaciones procesadas vía ZOFRATACNA · Respuesta en 24h."

OUTPUT FILES:
- /lead-magnets/timeline-china-zofratacna.html
- /lead-magnets/timeline-china-zofratacna-content.md
Signal: /lead-magnets/MAGNET_COMPLETE.flag
```

---

---

## ASSET 06 — Checklist de Preparación para Importación

### Concept
A 2-page branded checklist mirroring the ImportReadinessMeter's 5-step procurement logic — but expanded from a UI element into a printed decision guide. Each step becomes a section with 3–4 specific items the buyer must verify before moving to the next.

**Title (final):**
> "Los 5 Pasos Antes de Su Primera Consulta: Checklist de Preparación para Importadores de Maquinaria"

### Why This Converts
This is the retargeting magnet — for buyers who have browsed but haven't submitted an inquiry. The ImportReadinessMeter tells them where they are in the process. The checklist tells them what they still need to do. It eliminates the "I'm not ready yet" objection by making readiness achievable, specific, and immediate.

**The pre-sell effect:** Step 5 of the checklist is "Completar el formulario de consulta." The checklist literally guides the buyer to the inquiry form as its final action.

### Data Source in Rebuilt Page
- `ImportReadinessMeter` 5-step logic (Phase 7)
- `FieldReport` regulatory notes (Phase 4) — supply the checklist items for steps 3–4
- `STEP_LABELS` and `STEP_ACTIONS` constants

### Format
PDF, 2 pages. Clean checklist with checkboxes, 5 sections matching the meter steps, each with 3–4 specific items. Final item in step 5: "Enviar consulta a Wings con sus datos y requerimiento técnico."

### Placement
- Exit-intent trigger on product pages: shows when buyer attempts to leave without submitting inquiry
- Email retargeting: sent to sessions that viewed ≥2 products without inquiry
- Comparison bar: "Antes de comparar, ¿está preparado?" link
- Accio Engine pre-chat screen

---

### Lead-Magnet Agent Activation Prompt

```
You are the Lead Magnet agent for Wings Global Trade (B2B machinery import, Peru via ZOFRATACNA).

Read ~/.claude/skills/lead-magnet-studio/SKILL.md first.

MODE: BUILD

AUDIENCE: B2B buyers who have been researching machinery imports for weeks but keep putting off making a formal inquiry because they feel "not ready." They have budget authority but doubt their own technical knowledge. The main objection: "I need to know more before I reach out to a supplier."

LEAD MAGNET CONCEPT:
Title: "Los 5 Pasos Antes de Su Primera Consulta: Checklist de Preparación para Importadores de Maquinaria"
Format: PDF, 2 pages, printable checklist

CONTENT ARCHITECTURE:

Page 1 — Steps 1–3:

PASO 1 · PRODUCTO (Tú tienes esto cuando llegas al catálogo)
□ Sé qué tipo de equipo necesito (tractor, camión, bus, equipo industrial)
□ Tengo una referencia de HP o capacidad mínima para mi aplicación
□ He revisado al menos 3 modelos disponibles en el catálogo
□ Entiendo que el HP efectivo en mi altitud puede ser 15–20% menor al nominal

PASO 2 · EXPLORADO (Lo que aprende el comprador serio)
□ He leído las especificaciones completas del modelo que me interesa
□ Sé qué norma de emisiones aplica para mi categoría (Euro II mínimo para Perú)
□ He identificado si el equipo requiere homologación MTC o certificación INDECOPI
□ He revisado el Informe de Campo para condiciones operativas en mi región

PASO 3 · VARIANTE (La decisión técnica)
□ He seleccionado la variante específica (modelo, motorización, tracción)
□ He confirmado el GVW contra los límites por eje de mis rutas
□ He verificado disponibilidad de repuestos o proveedor de servicio en mi región
□ He comparado al menos 2 variantes o modelos equivalentes

Page 2 — Steps 4–5 + CTA:

PASO 4 · CONSULTA (Lo que el proveedor necesita de usted)
□ Tengo claro el volumen de compra (1 unidad, 3–5, 10+)
□ Tengo un presupuesto referencial (FOB, CIF, o precio puesto en obra)
□ Sé el puerto de destino o la región donde se desplegará el equipo
□ He confirmado si necesito financiamiento o pago contado

PASO 5 · ENVIADO (La acción que desbloquea todo)
□ He completado el formulario de consulta con mis datos de contacto
□ He adjuntado o descrito mi requerimiento técnico principal
□ He indicado mi plazo estimado de compra
☑ ACCIÓN FINAL: Enviar consulta a Wings Global Trade →

Below Step 5:
"Wings responde en 24 horas con: precio CIF estimado · ficha técnica completa · opciones de variante recomendadas para su aplicación."

DESIGN: Warm white background. Navy headers with step number. Gold checkboxes (square, 8px). DM Mono for all labels. Flexo/system-ui for body. Enough whitespace to write notes. Printable. No graphics except a thin gold rule between steps.

Footer: "Wings Global Trade · Precisión. Proximidad. Confianza. · wings-global-trade.com"

OPT-IN PAGE COPY (separate):
Headline: "¿Listo para importar o todavía preparándose? Este checklist lo dice en 2 minutos."
Subhead: "Los 5 pasos que separan a un comprador preparado de uno que pierde tiempo y dinero en el proceso."
3 bullets: action-oriented, specific
CTA: "Descargar checklist — 2 páginas"
Trust: "Sin registro. Sin spam. Solo la lista."

OUTPUT FILES:
- /lead-magnets/checklist-preparacion-importacion.html
- /lead-magnets/checklist-preparacion-importacion-content.md
Signal: /lead-magnets/MAGNET_COMPLETE.flag
```

---

---

## COLLABORATION WORKFLOW: Page → Agent → Asset

### How This Works in Practice

The 6 lead magnets above are not separate projects. They are downstream outputs of the same data that the rebuilt product page generates. The collaboration pattern is:

```
1. REBUILD phases 0–7 complete (product-intelligence.ts exists)
      ↓
2. DATA EXTRACTION: For each lead magnet, the specific data payload
   is identified (duty rates, transit times, altitude formulas, etc.)
      ↓
3. PROMPT ACTIVATION: Paste the activation prompt into a new
   Claude Code session. The lead-magnet agent executes SKILL.md
   and produces the asset in /lead-magnets/
      ↓
4. REVIEW: All agent output is reviewed before publishing.
   The lead-magnet agent produces HTML/content — Wings team
   approves copy and visual direction.
      ↓
5. DEPLOY: Assets deployed as standalone pages or PDFs on
   Wings domain or Vercel CDN
      ↓
6. PLACEMENT: CTAs wired into product page, catalog pages,
   Accio Engine, email flows
```

### Which Assets to Build First

Priority order by impact × speed:

| # | Asset | Build Time | Urgency | Placement |
|---|---|:---:|:---:|---|
| 1 | HP en Altitud Calculator | 2h | 9/10 | Product page + category page |
| 2 | Timeline China → ZOFRATACNA | 1.5h | 8/10 | Homepage + Accio Engine |
| 3 | Checklist de Preparación | 1h | 7/10 | Exit-intent + email |
| 4 | Guía de Aranceles ZOFRATACNA | 2h | 8/10 | Google SEO + footer |
| 5 | Manual de Campo | 4h | 7/10 | Post-inquiry email |
| 6 | Radar de Comparación | 3h | 6/10 | Comparison bar + LinkedIn |

Build 1, 2, 3 first. They cover the entire funnel: evaluation (1), planning (2), conversion (3).

---

## THE PRODUCT PAGE AS THE MASTER LEAD MAGNET

One final insight: the rebuilt product page at 100/100 is itself the most powerful lead magnet Wings has.

The Blueprint Mode data layer — once it reveals HS codes, duty rates, full spec tables, compliance data, and dimensional engineering drawings — is a level of technical depth that no LatAm machinery catalog publishes. A buyer who discovers that layer will share the URL. They will return to it. They will reference it in procurement meetings.

**The page earns trust. The lead magnets distribute that trust to buyers who haven't found the page yet.**

The asymmetry to defend: Wings is the only platform that treats B2B machinery buyers as technical professionals. The lead magnets are how that positioning spreads beyond the catalog.

---

*Document authored: 2026-06-19 | Wings Global Trade · Creative Intelligence × Commercial Assets*
*References: REBUILD-100.md · IA-AUDIT-2026-06-19.md · lead-magnet-studio/SKILL.md · lead-magnet.md agent*
