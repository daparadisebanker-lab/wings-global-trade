# Wings Global Trade — Lead Magnet Strategy

## Context Summary

**Audience:** LATAM B2B importers — Peruvian and Chilean SME owners, purchasing managers, wholesalers, and distributors importing heavy machinery, commercial vehicles, buses, industrial equipment, and spare parts from China, Thailand, Japan, and Dubai.

**Two distinct personas:**
- Persona A (Catalog Buyer): Has a specific product type in mind, needs specs and pricing to self-qualify before inquiring.
- Persona B (Free Zone Reseller): Importing at volume, knows trade terminology, needs a sourcing partner with free zone infrastructure and a preliminary CIF estimate before committing to a conversation.

**Proximity to offer:** Both personas are close. The inquiry form IS the offer. The lead magnet must not replace the inquiry — it must capture the visitor who is not yet ready to submit a formal inquiry and pull them into a trust sequence that leads back to that same form within 48–72 hours.

**The conversion tension:** Wings has no account system, no saved carts, no retargeting pixel infrastructure. A visitor who leaves without submitting is permanently lost. The lead magnet solves this: it creates a named, contactable prospect from a visitor who otherwise disappears.

---

## Three Lead Magnet Concepts

### Concept 1 — Calculadora de Costo CIF por Zona Franca

**Format:** Interactive HTML tool (web-based, no download required — result delivered to email as branded PDF)

**Premise:** The visitor inputs product category, quantity, source market, and destination country. The calculator outputs a preliminary CIF breakdown — FOB estimate, freight estimate, insurance, arancel — and compares the landed cost via ZOFRATACNA/ZOFRI against the standard import corridor. The result is emailed as a branded PDF summary.

**Why it works:** It delivers the single most valuable number this audience needs before committing to any sourcing conversation — what will this actually cost me, landed, in my country. The free zone saving (15–40%) is the hero data point: it makes the prospect realize Wings has a structural cost advantage they cannot replicate without Wings' infrastructure. This is the Pre-Sell Effect in practice.

**Urgency: 9/10** — Cost certainty is the primary decision blocker for every importer before they commit to a volume inquiry. Without a number, there is no conversation.

**Relevance: 10/10** — Directly maps to the Accio Engine's core value proposition. Every Persona B visitor has this question before they will engage. Every Persona A visitor has it before they will submit a price inquiry.

**Proximity: 10/10** — The person who uses a CIF calculator is actively evaluating an import. They are days or weeks from placing an order. This is the highest-proximity possible audience for a sourcing inquiry CTA.

**Composite: 29/30**

---

### Concept 2 — Guia de Importacion via Zona Franca para Peru y Chile

**Format:** PDF guide, 8–12 pages

**Premise:** A step-by-step walkthrough of how the free zone import corridor works for machinery and vehicles — what ZOFRATACNA and ZOFRI are, the legal framework, the cost savings mechanism, the documentation required, the timeline from order to delivery at destination port. Includes a glossary of incoterms and a checklist of documents needed per destination country.

**Why it works:** Many Persona A and Persona B buyers know free zones exist but do not understand the process well enough to commit to using them. This guide eliminates the education barrier. The reader who finishes it understands they need an operator with free zone presence — which is precisely what Wings is.

**Urgency: 6/10** — Useful but not immediately urgent. The prospect can postpone reading a guide without consequence.

**Relevance: 9/10** — Very relevant to both personas. High educational value for anyone importing through Wings' product categories and markets.

**Proximity: 7/10** — Educational content attracts researchers who may be 3–6 months from an actual import, diluting lead quality relative to the offer.

**Composite: 22/30**

---

### Concept 3 — Tabla de Codigos HS y Aranceles para Importadores LATAM

**Format:** PDF reference sheet, 2–3 pages (printable)

**Premise:** A curated cheat sheet covering the HS codes and applicable import duty rates for Wings' five product categories across Peru, Chile, Colombia, and Panama. Includes the free zone duty reduction applicable at ZOFRATACNA and ZOFRI, and a column showing standard corridor rate vs. free zone rate for direct comparison.

**Why it works:** Purchasing managers and trading company buyers reference HS codes constantly. A formatted, Wings-branded reference they can pin to their desk is perceived as genuinely useful. Every time they consult it, they see Wings.

**Urgency: 7/10** — High for the moment someone is actively preparing a customs declaration or budget estimate. Lower otherwise.

**Relevance: 8/10** — Relevant to both personas but more useful to Persona B (volume importers who calculate duties regularly).

**Proximity: 6/10** — HS code lookup is an early-stage research activity. The prospect may be several sourcing cycles away from a Wings inquiry.

**Composite: 21/30**

---

## Selected Concept: Concept 1 — Calculadora de Costo CIF por Zona Franca

**Composite score: 29/30**

This concept scores highest on all three dimensions because it delivers a specific number — not generic knowledge — and that number is the single most valuable piece of information a LATAM importer needs before placing a volume inquiry. It also functions as a pre-sell instrument: by showing the free zone saving explicitly in USD, it makes the prospect financially dependent on Wings' infrastructure to capture that saving. No Alibaba listing, no local freight broker, and no generic sourcing agent delivers this calculation with LATAM free zone specificity. The CIF calculator creates a problem — "how do I capture this saving?" — that only Wings solves.

---

## Full Development: Calculadora de Costo CIF por Zona Franca

### Title (Spanish, conversion-optimized)

**Calcula tu Costo CIF Real via Zona Franca — Peru y Chile**

**Subtitle:** Ingresa tu producto y cantidad. Recibe el desglose completo: FOB estimado, flete, seguro, arancel, y el ahorro concreto por importar via ZOFRATACNA o ZOFRI.

**Why this title converts:** It leads with the output (costo CIF real), not the tool. "Real" signals this is grounded in Wings' actual source market and free zone data — not a generic estimate. The subtitle specifies exactly what the user receives, removing all ambiguity about what they are signing up for.

---

### Format

Interactive HTML tool hosted at `wingsglobaltrade.com/calcular` — also accessible as a modal or slide-in panel triggered from product detail pages and the Accio Engine entry page.

The calculation runs via Wings' existing `/api/accio/estimate` logic (same CIF calculator, same duty-rates.ts table, same freight lookup) — meaning the tool costs nothing additional to build. The only new infrastructure is the email gate and PDF generation.

The tool is gated: the calculation inputs (Step 1) are fully visible without any email. The result is shown after the prospect provides their email in Step 2. This is the capture mechanism. Gating before any value is shown increases friction unnecessarily — gating after the prospect has already committed 60 seconds of input is frictionless by comparison.

---

### Content Architecture — Screen by Screen

#### Screen 1 — Inputs (No gate)

**Headline:** Calcula tu Costo CIF via Zona Franca

**Subhead:** Descubre cuánto ahorras importando via ZOFRATACNA (Peru) o ZOFRI (Chile) frente al corredor estándar.

**Inputs:**
- Categoría de producto (dropdown): Maquinaria agrícola / Camiones y vehículos comerciales / Buses / Equipo industrial / Repuestos y partes
- Mercado de origen (dropdown): China / Tailandia / Japón / Dubai
- País de destino (dropdown): Peru / Chile / Colombia / Panama / Bolivia / Costa Rica / República Dominicana
- Cantidad: número + unidad (unidades / contenedores 20ft / contenedores 40ft)
- Precio objetivo por unidad (USD)

**CTA:** Calcular ahorro estimado

**Trust micro-copy below button:** Estimación preliminar basada en datos de flete vigentes y tasas arancelarias publicadas. Wings confirma la cotización formal en 24 horas.

---

#### Screen 2 — Email Gate (shown after "Calcular" is clicked)

**Headline:** Tu estimado está listo

**Subhead:** Ingresa tu correo para ver el desglose completo y recibir el PDF — sin costo, sin compromiso.

**Inputs:**
- Nombre completo (required)
- Correo electrónico (required)
- WhatsApp (optional — copy: "Te enviamos el resumen directamente por WhatsApp si prefieres")
- Empresa (optional)
- País (pre-filled from Step 1, editable)

**CTA:** Ver mi estimado CIF

**Objection handling (small text below button):** No compartimos tu información con terceros. Solo el equipo de Wings se pondrá en contacto si decides continuar.

---

#### Screen 3 — Result Display

Structured breakdown table, rendered in Wings' brand palette (navy header, gold accents, warm-white data rows, DM Mono for numbers, Cormorant Garamond for section labels).

**Sección A — Desglose CIF: Corredor Estándar**

| Componente | Valor estimado (USD) |
|---|---|
| FOB estimado (x unidades, origen) | [calculated] |
| Flete estimado a puerto de destino | [calculated] |
| Seguro (1.5% CIF) | [calculated] |
| CIF Total | [calculated] |
| Arancel aplicable (capítulo HS, país destino) | [rate %] |
| Derecho de importación estimado | [calculated] |
| Costo total estimado importación | [CIF + duty] |

**Sección B — Via Wings: Corredor de Zona Franca**

| Componente | Valor estimado (USD) |
|---|---|
| Corredor recomendado | ZOFRATACNA (Peru) o ZOFRI (Chile) |
| Beneficio arancelario aplicable | [% reduction] |
| Arancel con zona franca | [calculated] |
| Costo total via Wings Zona Franca | [calculated] |
| **Ahorro estimado vs. corredor estándar** | **[USD amount] — [%]** |

The savings line is the hero. It should be typeset larger than any other data point on the page.

**Sección C — Nota de estimación**

Esta estimación es preliminar y está basada en datos de flete vigentes, márgenes de aprovisionamiento estándar por categoría (maquinaria 18%, vehículos 15%, repuestos 22%, equipo industrial 20%), y tasas arancelarias publicadas para [destination_country] + capítulo HS [chapter]. Wings confirma la cotización formal dentro de las 24 horas siguientes a la recepción de la consulta.

**CTA primario (gold button):** Enviar consulta formal a Wings

This button links to `/accio` with the product category, source market, destination country, quantity, and target price pre-populated as URL parameters — so the Accio Engine starts with full context and does not re-ask what the calculator already collected.

**CTA secundario (outline button):** Descargar PDF de esta estimación

Sends the branded PDF to the email already captured. No additional action required from the user.

**Trust line:** Wings opera desde ZOFRATACNA (Tacna, Peru) y ZOFRI (Iquique, Chile).

---

#### PDF Delivery (Email attachment)

The PDF mirrors the result screen. Content:
- User's inputs (product category, origin market, destination, quantity, target price per unit)
- Full CIF breakdown — standard corridor vs. Wings free zone corridor side by side
- Savings summary in bold
- Wings contact details (WhatsApp number + email)
- Disclaimer text
- QR code linking to `/accio` with pre-populated context

**Perceived value test:** Would a purchasing manager pay $30–50 USD for a document that gives them a defensible landed cost estimate for a machinery import, with free zone savings identified, formatted for internal presentation? Yes. This document gets forwarded to CFOs and procurement directors. It does the downstream trust work Wings does not have to do manually.

---

## Opt-In Page Copy (Spanish)

Applies to the standalone page at `/calcular` and to any modal or embedded panel placement.

**Headline:**
Cuánto cuesta realmente importar via Zona Franca

**Subheadline:**
La calculadora de Wings estima tu costo CIF completo — FOB, flete, seguro y arancel — y lo compara con el corredor estándar. En 60 segundos, tienes el número que necesitas para evaluar si la operación tiene sentido.

**What you get (bullets):**
- El costo CIF desglosado para tu categoría de producto, cantidad y mercado de origen exacto — no una estimación genérica
- El arancel de importación aplicable en tu país de destino, identificado por capítulo HS
- El ahorro estimado en dólares y porcentaje por importar via ZOFRATACNA (Peru) o ZOFRI (Chile) versus el corredor estándar
- Un PDF descargable con todos los datos, listo para presentar a tu equipo financiero o dirección comercial
- Sin cuenta. Sin compromiso. El equipo de Wings revisa tu consulta formal en 24 horas si decides continuar.

**CTA button:**
Calcular mi costo CIF

**Objection handling (below the CTA):**

No necesitas comprometerte a nada para ver tu estimado. La calculadora usa datos reales de flete por corredor, márgenes de aprovisionamiento por categoría, y tasas arancelarias publicadas — no es un estimador genérico. Si los números tienen sentido para tu operación, el siguiente paso natural es enviar una consulta formal. Si no, tienes el desglose para tus registros internos.

**Trust signal:**
Wings opera con infraestructura física en ZOFRATACNA (Tacna, Peru) y ZOFRI (Iquique, Chile). El ahorro que muestra la calculadora proviene del régimen arancelario real de zona franca — no es descuento de marketing.

---

## Email Delivery Sequence

The sequence moves the prospect from "lead who saw their CIF estimate" to "qualified inquiry submission." Three emails. Each has one CTA.

---

### Email 1 — Envio inmediato (within 5 minutes of opt-in)

**Subject:** Tu estimado CIF via Zona Franca — Wings

**Angle:** Functional delivery + one specific insight from their calculation that makes the number concrete.

**Structure:**
- Confirm the PDF is attached and the result link is accessible.
- One paragraph making the savings number specific: "Para [X unidades] de [categoría] desde [origen] hacia [destino], el ahorro estimado via [ZOFRATACNA/ZOFRI] es de USD [Y] — equivalente al [Z]% del valor total de la operación. En una importación de esta escala, ese ahorro cubre con frecuencia el costo de flete completo."
- One paragraph explaining the mechanism without jargon: "Este ahorro proviene de [specific mechanism — e.g., reducción arancelaria bajo el régimen de zona franca + suspensión del IGV en tránsito para mercadería en re-exportación]. No es un descuento negociado — es un beneficio estructural del corredor."
- CTA: "Si los números tienen sentido para tu operación, el Accio Engine de Wings puede recibir tus especificaciones técnicas y generar una cotización formal. [Iniciar consulta en Accio Engine]"

---

### Email 2 — Dia 2 (24 hours after opt-in)

**Subject:** Lo que la mayoria de importadores no calcula antes de cerrar una operacion

**Angle:** Education that creates a problem only Wings solves — specifically, the hidden costs that erode margins on standard corridor imports that the CIF calculator does not fully capture.

**Structure:**
- Open with a concrete frame: "El costo CIF es solo la mitad del cuadro. La mayoría de importadores que operan fuera de zona franca absorben tres costos adicionales que no aparecen en ninguna cotización inicial."
- List the three costs precisely:
  1. Almacenaje portuario por demora en trámite aduanero — promedio 12 a 18 días adicionales en el corredor estándar para maquinaria pesada que requiere inspección técnica.
  2. Diferencia de tipo de cambio entre el FOB pactado y el momento del pago de aranceles — relevante en operaciones superiores a USD 50,000 con plazos de despacho extendidos.
  3. Costo de financiamiento del capital inmovilizado durante el período de internamiento — frecuentemente ignorado en el análisis de rentabilidad de la operación.
- Bridge: "La zona franca reduce el impacto de los dos primeros porque el proceso de internamiento está simplificado bajo el régimen de zona franca. Wings gestiona el tránsito directo desde [ZOFRATACNA/ZOFRI] a tu destino, con tiempos de despacho confirmados antes del embarque."
- CTA: "Si quieres que revisemos tu requerimiento específico, el equipo de Wings puede evaluar si tu operación califica para el corredor de zona franca. [Enviar mis especificaciones a Wings]" — links to /accio

---

### Email 3 — Dia 5 (4 days after Email 2)

**Subject:** Una pregunta directa sobre tu importacion

**Angle:** Direct personal outreach from a named Wings team member. No educational content. One question. Two paths.

**Structure:**
- "Hace unos días calculaste el costo CIF para [product_category] desde [origin] hacia [destination]. Quería preguntarte directamente: ¿tienes una operación activa en evaluación, o fue una consulta exploratoria?"
- "Si tienes una operación activa, el Accio Engine puede recoger tus especificaciones técnicas en 10 minutos y Wings genera una cotización formal en 24 horas. Si es exploratoria, igual podemos orientarte sin compromiso — responde este correo con lo que tienes en mente."
- CTA: "Iniciar consulta en Accio Engine: [wingsglobaltrade.com/accio]"
- Sign-off from a named Wings team member — not "el equipo de Wings." This signals human follow-up, not automation, and increases reply rate from B2B buyers who are accustomed to being in a nurture sequence they never asked for.

**Why Email 3 converts:** This audience is B2B operators. They respond to directness from a specific person, not a sequence. The question "tienes una operación activa?" forces a mental self-qualification. The prospect who answers yes is a hot lead ready for Accio. The one who does not reply by email can receive a single WhatsApp follow-up if their number was captured at Step 2 — converting the calculator into a WhatsApp warm lead at zero additional cost.

---

## Placement on the Wings Platform

The lead magnet functions as a secondary conversion path. It captures visitors not yet ready to submit a formal inquiry, without competing with or undermining the primary inquiry CTA. The rule: the calculator is always visually subordinate to the primary CTA. Never larger. Never higher. Never at the expense of the ready visitor's path to submission.

---

### Placement 1 — Product Detail Page — HIGHEST PRIORITY

**Where:** Below the primary "Solicitar cotización" CTA on every product detail page (`/catalogo/[category]/[slug]`).

**When:** Inline, always visible. Not exit intent. Always present.

**Format:** A slim banner or secondary card component, visually subordinate (outline style, not filled gold).

**Copy:** ¿Todavía evaluando el costo total de esta operación? Calcula el costo CIF estimado via Zona Franca — gratis, en 60 segundos.

**Link text:** Usar la calculadora CIF de Wings

**Implementation note:** Opens as a modal overlay (not a page navigation) so the product page remains in the background. When the user completes the calculator and sees the "Enviar consulta formal" CTA in the result, clicking it pre-fills the inquiry with the product already selected.

**Rationale:** This is where Persona A is closest to converting. If they do not submit the inquiry immediately, it is because they have a cost question. The calculator answers that question, captures their email, and the Email 1 CTA brings them back to the exact inquiry they deferred. The calculator does not compete with the inquiry — it is a holding pattern that keeps the lead warm.

---

### Placement 2 — Accio Engine Entry (/accio) — SECONDARY

**Where:** Above the chat interface, visible on page load before the first message is sent.

**When:** Inline card, visible only for visitors who arrive at /accio without URL parameters (i.e., without product context already injected). Visitors routed from the search bar or from a product page arrive with context and should go straight to chat.

**Format:** Two compact cards side by side:

Left card (primary): Tengo mis especificaciones — empezar el Accio Engine
Right card (secondary): Quiero estimar el costo primero — Calculadora CIF

**Rationale:** Some Persona B visitors arrive at /accio but are not yet ready to commit to the full TPR conversation. They need a number before they'll engage in a 10-minute AI chat. The calculator gives them a lower-friction entry point that still captures their contact details. The Accio Engine CTA in the calculator result brings them back to /accio with product context pre-populated, so the chat starts further along the TPR collection.

---

### Placement 3 — Homepage (Trust Section) — SUPPORTING

**Where:** In the free zone credentials or "Cómo funciona Wings" section of the homepage, below the category grid.

**When:** Inline, always visible.

**Format:** A single-sentence hook within a broader section block.

**Copy:** Descubre cuánto ahorras importando via ZOFRATACNA o ZOFRI.

**Link text:** Calcular mi costo CIF

**Rationale:** Visitors who scroll past the category grid but have not clicked into a product are in research mode. This gives them a concrete action that is less committal than an inquiry form but more valuable than further browsing. It converts passive interest into a named lead.

---

### Placement 4 — Exit Intent (Desktop, Phase 2)

**Where:** Triggered when cursor moves toward the browser chrome on product detail pages or /accio, after minimum 30 seconds on page.

**When:** One-time per session. Desktop only — mobile has no reliable exit intent signal.

**Format:** Centered modal overlay.

**Headline:** Antes de irte — tu estimado CIF en 60 segundos

**Subhead:** Sin registro. Sin compromiso. El desglose de costos para tu importación, listo para descargar.

**CTA:** Calcular ahora

**Rationale:** Exit intent on product pages is the last moment to capture a high-intent visitor before they are permanently lost. A visitor who spent 30+ seconds reading specs and still did not submit has a specific objection — usually cost uncertainty. The calculator answers that objection. The conversion rate on this placement will be lower than inline placements but captures leads that would otherwise be unrecoverable.

---

## How the Lead Magnet Complements Rather Than Competes With the Inquiry CTA

The inquiry CTA (primary conversion) and the calculator (secondary conversion) serve different visitor states:

| Visitor State | Primary Path | Lead Magnet Role |
|---|---|---|
| Ready — has specs, knows what they want | Solicitar cotizacion / Enviar consulta | Not shown / subordinate — do not interrupt |
| Evaluating — has product interest, needs cost certainty first | Calculator → email sequence → inquiry CTA in Email 1 | Core use case |
| Researching — browsing categories, no specific product | Homepage → category grid → product detail | Calculator on homepage trust section |
| Leaving — was on product page, did not convert | Exit intent modal → calculator | Recovery mechanism |

The calculator does not compete with the inquiry form because it targets a different decision state. A visitor ready to submit an inquiry has already resolved their cost question or does not need to. The calculator targets the visitor who is one data point away from being ready.

The email sequence closes the loop: Email 1 delivers the result and immediately offers the inquiry CTA. Email 2 deepens the argument for the Wings free zone advantage. Email 3 is a direct human ask. A well-qualified calculator lead who follows the sequence will submit a formal inquiry within 5 days of downloading their result — and that inquiry will frequently be better qualified than a cold form submission, because the prospect has already seen a cost breakdown, self-selected on viability, and has a document they are ready to share internally.

The downstream metric to track: inquiry rate from calculator leads vs. organic product page visitors. If the sequence works, calculator leads should convert to formal inquiry at 2–3x the rate of cold visitors.
