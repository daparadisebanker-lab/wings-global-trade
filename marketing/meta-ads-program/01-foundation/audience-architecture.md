# Audience Architecture — Wings Global Trade Meta Ads

**Foundation document. Every campaign (02/03/04) builds on this.**
Source of truth: the five Mister archetypes (`spec/MISTER_MASTER_BRIEF.md` §0, `src/types/mister.ts`).

---

## 0. The governing insight

Meta in Peru cannot target "gerente de logística en minera de Arequipa" — B2B job-title precision does not exist there. But Wings has something no competitor has: **Mister is a five-lane segmentation engine sitting behind the click.** The site resolves the archetype in 2–3 questions and adapts the entire funnel.

Therefore the architecture is:

> **The hook does the targeting. Mister does the qualifying.**
> Ads are written in archetype-coded language (the same keyword signals `src/lib/mister/archetype.ts` listens for), run against deliberately broad-but-interested audiences, and self-select the right buyer. Precision lives on-site, not in the ad set.

This means: fewer, broader ad sets; more, sharper creative variants. It also means every ad's language should *feed* Mister's classifier — a visitor arriving from the reseller ad saying "quiero distribuir" resolves to A4 in one turn.

---

## 1. Archetype × Category Matrix

Which archetypes buy which categories, and which campaign serves them. (P = primary target of that category's campaign, S = secondary, — = not addressed.)

| Category | A1 Lead/End Buyer | A2 Project Manager | A3 Logistics Mgr | A4 Reseller | A5 Wholesale Partner |
|---|---|---|---|---|---|
| Maquinaria Agrícola | **P** — agricultor/fundo comprando tractor propio | **P** — agroindustria, proyectos de riego/cultivo a escala | S — solo como carga | **P** — distribuidor regional de maquinaria | S — programa multi-SKU |
| Camiones (KAMA, 97 modelos) | **P** — transportista dueño-operador, flota pequeña | **P** — minería/construcción, renovación de flota | **S** — operador logístico ampliando flota propia | **P** — dealer de vehículos comerciales | S |
| Buses | S — operador pequeño (turismo, personal) | **P** — empresa de transporte, concesiones, rutas | — | S | S |
| Equipo Industrial | **P** — dueño de planta/taller PYME | **P** — proyectos (obra, planta, faena) | S — energía de respaldo para depósitos | S | S |
| Repuestos (lotes, caja x 50) | S — jefe de mantenimiento de flota | S | — | **P** — casa de repuestos, distribuidor | **P** — abastecimiento multi-país |
| **Mister (producto)** | **P** | **P** | **P** — el único canal que le habla de corredor/Incoterms | **P** | **P** — desk humano, Mister pre-califica |

Reading the matrix by row tells each category campaign whom to code its hooks for. Reading by column: A1+A2 concentrate in agro/camiones (the deep-inventory categories — this is why they get broken-out campaigns, see `05-execution/campaign-structure.md`); A3 and A5 are only fully served by the Mister campaign.

---

## 2. Per-Archetype Targeting Definitions

Format per archetype: who they are in the Peruvian market → Meta signals → funnel entry → what the ad must say (tied to Mister's own signal vocabulary).

### A1 — The Lead / End Buyer (`lead_buyer`)
*"Buying for own use, price-sensitive. Primary need: education + confidence."* (brief §0)

- **Who (Peru):** Agricultor mediano (arroz en San Martín/Lambayeque, frutales en Ica/La Libertad, sierra ganadera), transportista dueño-operador, dueño de PYME industrial. Compra 1–2 unidades. Le aterra equivocarse importando: le han contado de estafas, de contenedores retenidos en aduana, de "precios finales" que no eran finales.
- **Awareness level (Schwartz):** problem-aware — knows he needs the machine, doesn't trust the import channel.
- **Meta targeting:**
  - Interests: Agricultura, Maquinaria agrícola, Tractor, John Deere, Massey Ferguson, Kubota, New Holland (brands Wings actually carries — `data/product-catalog.json`), Camión, Transporte por carretera, Ganadería, Arroz (cultivo)
  - Geo: Peru — depto. layering per category (see category strategies); exclude Lima-centrism for agro (weight Piura, Lambayeque, La Libertad, San Martín, Ica, Arequipa, Junín)
  - Age 28–60, all genders (skews male in practice; do not restrict)
  - Advantage+ expansion ON — creative self-selects
- **Lookalike seed:** all-leads list (catalog + Mister submits) once ≥ 100; interim seed = WhatsApp ops contact list export.
- **Funnel entry:** category/application landing page (`/catalogo/...` or `/aplicacion/arrozal` etc.) — NOT Mister-first; A1 needs to see the machine before the conversation.
- **Ad language must contain** (mirrors `archetype.ts` A1 signals): "para tu operación", "importa directo", "tu primer tractor importado" — first-person ownership framing.
- **Retargeting path:** category page view → Mister nudge creative ("resuelve tus dudas antes de comprometerte") → WhatsApp non-closer gets the 24h-quote-promise creative.

### A2 — The Project Manager (`project_manager`)
*"Procurement inside a larger operation. Primary need: specs + timelines + docs."*

- **Who (Peru):** Jefe de logística/procurement en agroindustrial (arándanos, espárragos, caña), constructora, minera contratista, empresa de transporte licitando rutas. Tiene una especificación y una fecha de obra. Compra contra presupuesto aprobado y proceso de PO.
- **Awareness:** solution-aware — comparing supply channels; needs proof of documentation discipline.
- **Meta targeting:**
  - Interests: Ingeniería civil, Construcción, Minería, Gestión de proyectos, Cadena de suministro, Licitación, Agroindustria + the machinery interests above
  - Behaviors: Administradores de páginas de empresa (the closest Meta proxy for "works at a company that buys things")
  - Geo: Peru urban + mining corridors (Arequipa, Moquegua, Cajamarca, La Libertad) for camiones/industrial
  - Placement: weight Facebook feed + in-stream (B2B decision-makers over-index on FB vs IG in Peru)
- **Lookalike seed:** Mister leads where `archetype = project_manager` (the `mister_projects` table stores this — a segmentation asset no competitor has).
- **Funnel entry:** product detail page (spec table visible) or Mister directly when the ad leads with compliance/docs.
- **Ad language:** "especificación", "certificación", "cumplimiento", "ficha técnica", "obra", dates and norms (Euro V, Stage III, IP54 — real spec values from `seed.json`). Never "oferta".
- **Retargeting:** spec-sheet carousel → "cotización formal para procurement en 24 horas hábiles" → meeting-booking framing (Mister lane A2 handoff includes CAL).

### A3 — The Logistics Manager (`logistics_manager`)
*"Moving goods compliantly. Primary need: customs docs, Incoterms, container specs, Tacna/Iquique corridor."*

- **Who:** Jefe de operaciones/comercio exterior en operador logístico, agencia de aduanas, importadora establecida. Already imports; evaluates Wings as corridor infrastructure, not as a catalog. Smallest audience, highest sophistication.
- **Awareness:** most-aware of the mechanics; product-unaware of Wings. Sell the position: two free zones, one operator.
- **Meta targeting:**
  - Interests: Comercio internacional, Logística, Transporte de mercancías, Aduana, Cadena de suministro, Exportación, Incoterms (if available as interest; else Freight forwarder pages)
  - Geo: Lima + Tacna + Arica/Iquique/Antofagasta (Chile cell) + Santa Cruz/La Paz (Bolivia cell) — this archetype IS the cross-border audience
  - Tight audience → run inside the Mister campaign, not standalone; budget floor problems otherwise
- **Lookalike seed:** none at launch (too few). Build from `mister_projects.archetype = logistics_manager`.
- **Funnel entry:** **Mister directly.** The catalog says nothing to A3; Mister's corridor knowledge (Incoterm matrix, container fill, ZOFRATACNA/ZOFRI flow, doc packs — lane A3 information nodes) is the product.
- **Ad language:** trade shorthand, exactly as Mister's tone calibration prescribes: "FCL o LCL", "20'GP o 40'HC", "corredor Tacna–Iquique", "suspensión arancelaria". Jargon here is a feature — it filters.
- **Retargeting:** doc-pack lead magnet creative (customs checklist per country — specced as Mister lane A3 `LOGI` downloads) → specialist contact.

### A4 — The Reseller (`reseller`)
*"Reselling for margin. Primary need: margins, MOQs, exclusivity, catalog breadth."*

- **Who:** Dueño de casa comercial de maquinaria/repuestos en provincia, dealer de camiones usados queriendo línea nueva, ferretería industrial grande. Thinks in margin and rotation; asks "¿puedo ganar plata con esto?"
- **Awareness:** solution-aware — has suppliers; Wings must beat them on channel structure (free-zone cost base + breadth: 97 KAMA models, 5 tractor brands).
- **Meta targeting:**
  - Interests: Venta al por mayor, Comercio, Distribución (negocios), Emprendimiento, Negocio pequeño + machinery interests
  - Behaviors: Administradores de páginas de empresa; Compradores involucrados (engaged shoppers) as weak proxy
  - Geo: Peru national, weight commercial hubs (Lima, Arequipa, Trujillo, Huancayo, Juliaca — Juliaca specifically: the Puno commercial node feeding the Bolivia corridor)
- **Lookalike seed:** `mister_projects.archetype = reseller` leads.
- **Funnel entry:** Mister (MOQ/margin conversation is Mister lane A4's job) or `/catalogo` breadth view.
- **Ad language:** "margen", "MOQ", "línea", "territorio", "tus clientes" — again literally Mister's A4 classifier vocabulary.
- **Retargeting:** MOQ-table carousel → "habla con el equipo de canal" (partnerships handoff per lane A4).

### A5 — The Wholesale / B2B Logistics Partner (`wholesale_partner`)
*"Volume + integration. Primary need: multi-SKU, customs clearance, multi-country, long-term supply."*

- **Who:** Importadora/distribuidora regional operando 2+ países (Perú–Bolivia–Chile), trading companies, grupos con flotas propias y clientes B2B. Handful of real prospects in the whole region.
- **Decision:** **No dedicated prospecting ad set.** The audience is too small and too senior for Meta prospecting economics. A5 is reached as spillover from A3/A4 creative + retargeting + the brand campaign's authority effect. Mister re-resolves A4→A5 mid-conversation (brief: re-classification is silent), and lane A5 always hands to the wholesale desk. Budget saved goes to A1/A2.
- **What we DO build:** an A5 retargeting layer — anyone who reached Mister `pre_qualification` with reseller/wholesale signals gets the "programa mayorista" creative (framework agreement framing, multi-country doc structure).
- **Ad language (retargeting only):** "programa", "multi-país", "acuerdo marco", "consolidación multi-SKU".

---

## 3. Retargeting Architecture (the three-layer path)

The mission-critical sequence: **site visitor → Mister conversation abandoner → WhatsApp non-closer.** Each layer is a custom audience with dedicated creative pressure. All events defined in `01-foundation/measurement-plan.md` §2.

### Layer R1 — Site visitor, no Mister engagement
- **Audience:** Pixel `PageView` on `/catalogo/*` last 30d, EXCLUDING `mister_open` and `Lead`.
- **Segmented by category URL** (`/catalogo/camiones/*` vs `/catalogo/maquinaria-agricola/*` ...) so the creative shows the category they browsed.
- **Message job:** convert browsing into conversation. Creative: "Viste la ficha. Ahora resuelve lo que la ficha no responde." → Mister. Product-specific DPA-style carousels once catalog feed exists (post-MVP; the API at `/api/products` can generate a feed).
- **Window/frequency:** 30d, cap ~4/week. Peru CPMs are low; frequency discipline matters more than reach.

### Layer R2 — Mister conversation abandoner
- **Audience:** `mister_open` OR `mister_induction_complete` last 30d, EXCLUDING `mister_prequal_reached` and `Lead`.
- **This is the highest-value cold-recovery audience in the whole program:** they told Mister what they're working on (archetype resolved, stored in `mister_projects`) and left before handoff.
- **Message job:** resume the conversation. Mister already supports session persistence (`session_id`, `SavedInquiryBanner` exists for catalog); creative promise: "Mister guarda tu consulta. Retómala donde la dejaste." CTA deep-links `/mister`.
- **Refinement when volume allows:** split by furthest stage reached (`mister_stage_discovery` vs `mister_stage_consideration` event params) — abandoners at consideration get the quotation-form creative directly.

### Layer R3 — WhatsApp non-closer
- **Audience:** `wa_click` (any WhatsApp deep-link click — `WhatsAppButton` component, Mister `connect_whatsapp` action) last 14d, EXCLUDING `Lead` (form submit) and EXCLUDING a suppression list uploaded from ops (customers who DID close, exported from the WhatsApp ops workflow — manual CSV upload weekly until CRM exists).
- **Message job:** remove the last-step friction. They intended human contact and stalled. Creative: the 24h documented-quote promise ("Cotización CIF documentada en 24 horas hábiles" — nosotros page, verbatim) + the WGT reference-number trust device. Objective: Click-to-WhatsApp ad straight back into the thread.
- **Window:** 14d only — WhatsApp intent decays fast.

### Suppression stack (applies everywhere)
- `Lead` last 90d excluded from all prospecting and R1/R2 (they're in the ops pipeline; ads would only annoy).
- Ops-uploaded closed-won/closed-lost list.
- Employees/internal IPs.

### Lookalike ladder (build order)
1. **Seed 0 (day 1):** WhatsApp ops contacts export → 1% LAL Peru — imperfect but real buyers.
2. **Seed 1 (≥100 leads):** all `Lead` events → 1% LAL, replaces interest stacks in best-performing ad sets.
3. **Seed 2 (≥100 Mister leads):** `mister_prequal_reached` → the intent-quality LAL.
4. **Seed 3 (mature):** per-archetype LALs from `mister_projects.archetype` — the endgame: audience segmentation generated by the product's own diagnosis engine. No competitor can replicate this seed.

---

## 4. Funnel entry map (summary)

| Archetype | Cold entry | Retarget entry | Conversion event |
|---|---|---|---|
| A1 | Category / application landing page | Mister nudge → WhatsApp promise | `Lead` (catalog or Mister) |
| A2 | Product detail (spec) or Mister | Spec carousel → formal quote | `Lead` + meeting |
| A3 | Mister direct | Doc-pack magnet → specialist | `mister_whatsapp_handoff` |
| A4 | Mister direct or /catalogo breadth | MOQ carousel → canal team | `Lead` (reseller-flagged) |
| A5 | (no cold) | Programa mayorista creative | human-mediated — `mister_whatsapp_handoff` |

---

*Traceability: archetype definitions, lane handoffs, and tone calibration quoted from `spec/MISTER_MASTER_BRIEF.md`; classifier vocabulary from `src/lib/mister/archetype.ts`; brands/models from `data/product-catalog.json` + `src/data/kama-trucks.json`; geography from `src/lib/constants.ts` + nosotros page free-zone data; quote promise from `src/app/nosotros/page.tsx`.*
