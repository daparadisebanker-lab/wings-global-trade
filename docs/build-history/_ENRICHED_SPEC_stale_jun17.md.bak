# Wings Global Trade — ENRICHED SPEC (v2)

> **Authority:** This document supersedes the original `/spec/` files for Phase 2 implementation.
> It synthesizes the contributions of the full 13-agent council. Where it conflicts with v1 spec
> files, this document wins. Where a contribution file (`/spec/contributions/*.md`) gives more
> granular detail, defer to it. Builder reads this first, then the relevant contribution file.
>
> **Prime directive:** Enhance the existing v1 codebase at `C:\Users\Muaaz\projects\wings-global-trade`.
> Do not break existing functionality. Do not rename routes, slugs, or data keys. Apply the
> council's intelligence as a refinement layer over working code.

---

## 0. NON-NEGOTIABLE CONSTRAINTS (read before touching code)

1. **Do not change category slugs.** The codebase, data, icons, and SEO all use:
   `maquinaria-agricola`, `camiones`, `buses`, `equipo-industrial`, `repuestos`.
   The ia-architect proposed `camiones-vehiculos` / `equipamiento-industrial` — **REJECT those.**
   Display labels may differ from slugs (label "Camiones y Vehículos" → slug `camiones`).
2. **"Motor Accio" is the Spanish UI name** for the AI flow. Never "Accio Engine", "chatbot",
   "asistente", or "IA" in user-facing Spanish copy. Code identifiers stay English (`AccioChat`, `/accio`).
3. **No 3D / WebGL / Lottie / GSAP / video backgrounds.** Immersion is CSS + SVG + rAF only.
   Framer Motion is the only motion library. Total added JS from immersion = 0 KB.
4. **No exclamation marks anywhere in Spanish copy.** No "solución", "plataforma" (standalone),
   "innovador", "disruptivo". `te` (tuteo), never `usted`.
5. **Conversion is the north star.** Inquiry conversion rate. Every change must serve a buyer
   reaching a submission faster, with more trust. Nothing decorative.
6. **TypeScript everywhere, pnpm, Tailwind utilities, `@/` imports, server-only secrets/AI calls.**

---

## 1. GOVERNING THESIS (brand-strategist + designer)

**Visual thesis:** *Trade intelligence visualized at the precision of a customs manifest, with the warmth of a handshake.* Every screen reads like **a trade document that has been designed** — documentation-grade precision (DM Mono, exact numbers, tight grids) plus human proximity (warm paper tones, serif headlines, real market names).

**Category Wings defines:** *Operador Comercial Digital* (The Digital Trade Operator) — not a marketplace, not a directory, not a broker. The first LATAM B2B trade platform with a managed free-zone AI engine in the discovery layer.

**The ONE ownable thing:** *Wings publishes the CIF estimate before you call them.* No competitor does this. The CIF card must feel like a Bloomberg terminal, not a price-quote widget — every number justified, source market explicit, free zone named.

**Thought-leadership belief:** *"El margen se pierde entre el proveedor y el puerto — no en la fábrica."* Importers lose 15–40% of margin in the logistics/customs corridor. The free zone is a structural advantage they don't know they can access.

**Voice:** Direct. Operational. Earned. Peer-to-peer (senior buyer to senior trade partner).

---

## 2. VISUAL SYSTEM (designer + brand-strategist + immersion)

### 2.1 Color tokens — extend `tailwind.config.ts` + `globals.css`

Keep all existing tokens. ADD:
```css
--color-gold-subtle:        rgba(196,147,63,0.12);  /* highlight rows, free-zone chip */
--color-surface-overlay:    rgba(0,30,80,0.72);     /* modal/drawer scrim */
--color-border-focus:       rgba(196,147,63,0.40);  /* focus ring color */
--color-navy-light:         #002266;
--color-navy-dark:          #001040;
```
Tailwind `colors` should expose nested `gold: { DEFAULT, hover, active, subtle }` and `navy: { DEFAULT, light, dark }` (additive — do not remove flat `gold`/`navy` already used).

### 2.2 Typography scale (apply as Tailwind `fontSize` + utility classes)

| Token | Font | Size | Weight | Line | Tracking |
|---|---|---|---|---|---|
| display-xl | Cormorant | clamp(3rem,5vw,5rem) | 600 | 1.05 | -0.02em |
| display-lg | Cormorant | clamp(2.25rem,4vw,3.75rem) | 600 | 1.1 | -0.015em |
| display-md | Cormorant | clamp(1.875rem,3vw,2.5rem) | 400 | 1.15 | -0.01em |
| display-sm | Cormorant | clamp(1.5rem,2.5vw,2rem) | 400 | 1.2 | 0 |
| body-lg | Flexo | 1.125rem | 400 | 1.6 | 0 |
| body-md | Flexo | 1rem | 400 | 1.5 | 0 |
| body-sm | Flexo | 0.875rem | 400 | 1.45 | 0 |
| label-lg | Flexo | 0.875rem | 500 | 1 | 0.01em |
| label-md | Flexo | 0.8125rem | 500 | 1 | 0.01em |
| label-sm | Flexo | 0.75rem | 500 | 1 | 0.08em (UPPERCASE) |
| mono-lg | DM Mono | 1rem | 500 | 1.3 | 0 |
| mono-md | DM Mono | 0.875rem | 400 | 1.4 | 0 |
| mono-sm | DM Mono | 0.75rem | 300 | 1.4 | 0 |

**Typographic fingerprint:** category overlines (`MAQUINARIA AGRÍCOLA`) = `label-sm` + uppercase + 0.08em. Use this overline pattern on every section header and product category context.

### 2.3 THE distinctive visual decision
**Gold top-border reveal on hover for every card** (category tiles, product cards, feature cards): initial `border-top: 2px solid transparent` → `#C4933F` on hover, `transition: border-top-color 0.15s ease`. This is the platform's visual signature — makes gold feel earned, not decorative.

### 2.4 Grid & rhythm
- Max content width `max-w-7xl` (1280px), `mx-auto`, `px-4 sm:px-6 lg:px-8`.
- Product/category grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, gap-6/gap-4.
- Section padding `py-20 md:py-28`.
- **Section alternation** navy ↔ warm-white, never two same adjacent, footer always navy.

### 2.5 Imagery & icons
- Documentary machinery photography, no people in hero (equipment is hero). Hero uses CSS gradient mesh + grain, no photo.
- Product images `aspect-ratio: 4/3`, `object-fit: cover`.
- Icons: existing category SVGs in `/public/icons/**`; supplementary icons via Lucide, 1.5px stroke, rounded caps, no fill, 24px. Never mix icon styles per screen.
- Alt text: Spanish, specific (model + context).

### 2.6 Immersion layer (immersion-engineer) — CSS/SVG only, 0 KB JS added
- **Hero:** layered navy = base `#001E50` + two `radial-gradient` mesh light sources + static SVG `feTurbulence` grain at ~4% opacity + 1px gold `border-bottom` at 0.15 opacity. (Exact gradient values in immersion-engineer.md §1.)
- **Hero text:** word-by-word stagger, `letterSpacing 0.08em→0` + opacity, 60ms stagger, 0.4s each. "Precisión" renders gold; "Proximidad. Confianza." warm-white. SearchBar enters last.
- **MarketMap (THE signature moment):** inline SVG LATAM map. Active markets filled navy @8%, inactive @3%. Gold destination pins with staggered `<animate>` pulse (r 6→10, cascading begin 0–2.4s north→south). Source-market square markers (China/Japan/Thailand/Dubai) in DM Mono. Freight-corridor bezier arcs `stroke #C4933F` dashed, animated `stroke-dashoffset` 3s loop = "freight in transit". IntersectionObserver gates play-state, `once`. `role="img"` + title/desc. Full reduced-motion static fallback.
- **TrustBar:** zone identity cards (DM Mono), rAF count-up on numeric figures (0→value, 800ms, ease-out cubic, gold mono-lg).
- **Product card hover:** existing lift + source badge translateY(-2px) + image `scale(1.03)` 300ms.
- **TPR progress track:** 2px bar atop TprSheet, gold fill `width = captured/total`, 0.6s ease-out.

---

## 3. COPY SYSTEM (copywriter + brand-strategist) — apply verbatim

### 3.1 Tagline
Primary: **Precisión. Proximidad. Confianza.** Secondary claim (Motor Accio only): **El precio CIF antes de la primera llamada.**

### 3.2 Navigation labels
`Inicio` · `Catálogo` (dropdown) · `Motor Accio` · `Nosotros` · `Contacto` · CTA `Consultar por WhatsApp` (rightmost).
Catalog dropdown labels→slugs: `Maquinaria Agrícola`→maquinaria-agricola · `Camiones y Vehículos`→camiones · `Buses`→buses · `Equipamiento Industrial`→equipo-industrial · `Repuestos`→repuestos.

### 3.3 Page heroes (use PRIMARY option; alternates in copywriter.md)
- **Home H1:** "Importación técnica para el mercado latinoamericano." Sub: "Catálogo curado de maquinaria agrícola, camiones, buses y equipamiento industrial — con acceso a zona franca en ZOFRATACNA y ZOFRI para importaciones de volumen."
- **Catálogo H1:** "Catálogo Wings — [Categoría]". Sub: "[N] modelos de origen [mercados]. Solicitud de consulta sin cuenta requerida."
- **Product H1:** "[Modelo]". Sub: "[Categoría] · Origen: [Mercado] · Disponible vía ZOFRATACNA / ZOFRI".
- **Accio H1:** "Importación gestionada desde zona franca." Sub: "El Motor Accio reúne tu Requisito Técnico de Producto y calcula un estimado CIF real — vía ZOFRATACNA (Tacna, Perú) o ZOFRI (Iquique, Chile). Sin llamadas previas."
- **Nosotros H1:** "Operadores de comercio. No intermediarios."
- **Contacto H1:** "Habla con el equipo."

### 3.4 CTAs (action + outcome — exact strings)
Home: `Explorar catálogo` / `Iniciar consulta técnica`. Accio tile: `Calcular mi importación`. Product card: `Ver especificaciones`. Product detail: `Solicitar este modelo`. Inquiry submit: `Enviar solicitud de consulta`. Accio after minimum: `Ver mi estimado CIF`. Accio submit: `Enviar consulta técnica`. Nav WhatsApp: `Consultar por WhatsApp`. Footer WhatsApp: `Abrir conversación en WhatsApp`.

### 3.5 Motor Accio opening message (hardcoded first assistant turn)
```
Soy el Motor Accio de Wings Global Trade.

Te ayudo a estructurar tu Requisito Técnico de Producto y a calcular un estimado CIF
real vía zona franca — ZOFRATACNA (Tacna, Perú) o ZOFRI (Iquique, Chile).

Para comenzar: ¿qué categoría de producto buscas importar?

(Puedes mencionarme el tipo de maquinaria, el código HS si lo tienes, o describir
el uso que le darás — lo que te resulte más fácil.)
```
Personality: tuteo; confirms each field ("Anotado. 50 unidades de tracción 4×4."); on uncertainty "No tengo certeza sobre ese código HS específico — el equipo lo confirmará en 24h."; one question per turn; uses FOB/CIF/HS naturally.

### 3.6 States (full tables in copywriter.md)
- Empty (no results): "No encontramos productos para esa búsqueda. Prueba con otra categoría o inicia una consulta técnica con el Motor Accio."
- Error (submit fail): "No pudimos enviar tu solicitud. Intenta nuevamente o escríbenos por WhatsApp."
- Confirm (catalog): "Solicitud enviada. El equipo Wings te contactará en menos de 24 horas."
- Confirm (Accio): "Consulta técnica enviada. Recibirás tu análisis de importación en menos de 24 horas." + reference number (see §6).
- Placeholders: name "Tu nombre completo"; email "correo@empresa.com"; phone "+51 999 000 000"; Accio input "Describe lo que necesitas importar...".

---

## 4. UX & FLOWS (experience + game-designer)

### 4.1 Two journeys
- **Catalog:** Landing → category tile → product grid → product detail (badge first, gallery, spec summary, inquiry anchor, full table, variants) → `Solicitar este modelo` → inline success + WhatsApp. Target < 4 min.
- **Accio:** Landing/tile → /accio split (chat left, TPR right) → immediate hardcoded greeting → 6–10 one-question turns with live TPR fill → minimum reached → `Ver mi estimado CIF` animates in → CIF card reveal → `Enviar consulta técnica` (contact form) → success + reference number.

### 4.2 The single most important conversion moment
**The `Ver mi estimado CIF` button appearing at minimum TPR completeness**, then the CIF card sliding in as a document. Button animates in (opacity + y, 0.4s), gold, full-width mobile. Click → skeleton (1.5–3s perceived calc) → CIF card slide-up. Make it feel like a real calculation, not a widget.

### 4.3 Trust architecture (place at decision points, not footer)
Hero subheadline names ZOFRATACNA·ZOFRI → source-market badges on every card → "Consulta sin compromiso. Sin cuenta requerida." above each submit → specific 24h SLA in success → named free zones + instant first AI message at Accio → CIF breakdown specificity (not rounded).

### 4.4 Friction fixes (apply)
- Inquiry form: ≤6 visible fields; notes optional/collapsible; validate on blur; sticky mobile CTA appears after spec table.
- Accio: typing indicator < 200ms; streaming; minimum completeness at 6 fields not 10; never let buyer be >2 questions from estimate without telling them.
- Mobile Accio: full-screen chat; TPR as bottom drawer; toggle button always shows field-count badge `Ver resumen · 6/10`; at minimum, label → `Ver estimado CIF` (gold).
- Disabled submit must always list missing fields below it — never silent.

### 4.5 Engagement mechanics (game-designer) — professional restraint
- **Primary mechanic:** TPR completeness *gates* the CIF estimate; the reveal is the reward. Field count shown as `6 / 10 campos` in DM Mono (NOT a percentage progress bar in the sheet body; the 2px top track is the only quantified bar). Header states: "Requisito técnico" (empty) → "Listo para estimar" (minimum, gold) → "Requisito completo" (full, gold + 1px gold sheet border).
- **CIF reveal:** line items populate sequentially FOB→Flete→Seguro→CIF Total; **CIF total counts up 0→value over 800ms** in gold DM Mono; savings % counts up last (variable reward).
- **Reference number** at submission `WGT-[year]-[sequence]` from lead ID; specific follow-up timestamp ("antes del martes 18 de junio, 18:00").
- **AI conversation arc** varies tone: turns 1–3 exploratory, 4–6 confirmatory, 7–8 momentum ("Casi listos…"), 9–10 wrap-up. One question per turn, always.
- **Excluded:** confetti, sound, percentages-as-game, level-up language, streaks, points, social-proof tickers.

---

## 5. MOTION SYSTEM (animator) — replace `src/lib/motion.ts`

### 5.1 Personality & signature
Precise. Grounded. Efficient. Easings:
```
enter [0,0,0.2,1] · exit [0.4,0,1,1] · interaction [0.25,0.1,0.25,1] · transition [0.4,0,0.2,1]
```
Durations (ms): instant 0 · fast 150 · normal 300 · slow 500 · cinematic 800 (hero only). Nothing > 800ms.

### 5.2 THE SOUL LAYER — TPR field-capture pulse (exclusive to TprField capture event)
On capture: gold dot `scale [1,1.4,1]` 250ms ease-out + value `opacity 0→1` 300ms (0.1s delay) + row background gold shimmer `rgba(196,147,63,0)→0.08→0` 400ms. This is the heartbeat of Motor Accio: "We got that. You're making progress." Reduced-motion: scale `[1,1.1,1]` (the one animation NOT suppressed, only softened).

### 5.3 Variant objects (paste into `src/lib/motion.ts`)
Use the full set from animator.md §"Complete Framer Motion Variant Objects": `FADE_UP`, `FADE_UP_SLOW`, `FADE_IN`, `SCROLL_REVEAL`, `STAGGER_CONTAINER`, `STAGGER_ITEM`, `SLIDE_FROM_RIGHT`, `PAGE_ENTER`, `TPR_CAPTURE_DOT`, `TPR_CAPTURE_VALUE`. **Compatibility note:** existing components import `FADE_UP_TRANSITION`, `FADE_IN_TRANSITION`, `STAGGER_CONTAINER_FAST`, `SLIDE_UP`, `MENU_SLIDE`, `VIEWPORT_ONCE`. **Keep those exports** (re-point easing to the new `enter` curve `[0,0,0.2,1]` where they used `[0.25,0.1,0.25,1]`) so nothing breaks. Page-load choreography & per-component hover specs in animator.md.

### 5.4 Page transitions
`<AnimatePresence>` route transitions: `PAGE_ENTER` (opacity+y 8px, 350ms). No horizontal slides. Always provide `useReducedMotion()` fallback (opacity-only, 0.01s).

---

## 6. AI ARCHITECTURE (ai-engineer) — apply to `src/lib/claude.ts`

- Replace `ACCIO_SYSTEM_PROMPT` with the complete production Spanish prompt in ai-engineer.md (free-zone ops, FOB/CIF formulas, HS guidance per category, LATAM duty knowledge, incoterms, `|||JSON_START|||…|||JSON_END|||` extraction protocol, stage-by-stage conversation rules, one-question-per-turn, uncertainty scripts that NEVER fabricate duty rates).
- Extend `extractTprFields()` to parse the full-TPR-state JSON block format the new prompt emits. Keep backward-compat with current parser shape.
- Models: `claude-haiku-4-5` for chat turns; `claude-sonnet-4-6` for CIF estimation on unusual HS codes. SSE events: text delta, `tpr_update`, `done`. Context: full conversation history + current TPR state per request.
- 3 contextual quick-actions per Accio screen state (empty / mid-conversation / estimate-ready) — strings in ai-engineer.md.
- Uncertainty: when a duty/HS value is unknown, mark "tasa estimada" / defer to 24h team confirmation. Never invent a rate.

---

## 7. FINANCIAL DISPLAY (finance) — apply to CIF calculator display

- Formula confirmed; margins by slug: maquinaria-agricola 18%, camiones 15%, buses 15%, equipo-industrial 20%, repuestos 22%. Insurance `(FOB+Freight)×0.015`, min $150. Freight table + ZOFRATACNA/ZOFRI +$200 transfer in finance.md.
- **Edge cases:** target_price 0/null → "Por favor ingresa un precio objetivo"; qty 0 → "La cantidad debe ser mayor a 0"; unknown HS → category default + "tasa estimada"; unknown country → Peru default + note; freight miss → $2,800 default flagged estimated.
- **Number format (es-PE):** `Intl.NumberFormat('es-PE',{style:'currency',currency:'USD',minimumFractionDigits:0,maximumFractionDigits:0})` → "US$ 47,320". Rates `toFixed(1)` → "9.0%".
- **CIF card rows (labels exact):** `FOB estimado (en origen)` / `Flete internacional` / `Seguro de carga (1.5%)` / —— / `CIF total` / `Arancel estimado (9.0%)` / —— / `Costo total estimado en destino` / `Zona franca: ZOFRATACNA (Tacna, Perú)`.
- **Disclaimer (always):** "Estimado preliminar basado en datos del Motor Accio. Los valores finales de flete, arancel y honorarios se confirman con la propuesta formal de Wings."

---

## 8. IA & NAVIGATION (ia-architect) — slugs locked per §0

- Primary nav + catalog dropdown per §3.2. Motor Accio is a top-level item, NEVER inside Catálogo.
- URLs: `/`, `/catalogo`, `/catalogo/[category]`, `/catalogo/[category]/[slug]`, `/accio`, `/nosotros`, `/contacto`. Query: `?q=`, `?context=`.
- Breadcrumbs (separator `·`, not `/`): `Inicio · Catálogo · Maquinaria Agrícola · [Modelo]`. Emit `BreadcrumbList` JSON-LD.
- Category filters order: Origen (multi) → Disponibilidad → Potencia/Tonelaje (range) → Tipo. Filter state in URL for shareability.
- Internal linking: product→same-category (3) + /accio; category→/accio CTA; home→all 5 + /accio; nosotros→/catalogo+/accio; accio success→/catalogo; 404→/catalogo+/accio.
- Classification: classify by primary use case, not construction similarity.

---

## 9. SEO & AEO (seo-agent) — Phase 2A parallel task owns implementation

- Per-page primary keyword, title (<60), meta desc (<155), H1 — full table in seo-agent.md.
- JSON-LD: Organization (global/layout), WebSite+SearchAction (home), Product (no `price` field — prices are null/on-inquiry), BreadcrumbList (catalog/product), FAQPage (/accio, /nosotros). Exact field values in seo-agent.md.
- `robots.ts` + `sitemap.ts` per priorities: `/`=1.0, `/accio`=0.9, categories 0.7–0.8, products 0.7, nosotros/contacto 0.5.
- AEO: each page answers a named question set (Accio = "cómo calcular CIF de China a Perú" is the highest-value anchor). Image alt convention: Spanish, model + context.

---

## 10. GROWTH CONTEXT (lead-magnet + campaigner) — informs copy/placement, not core build

- **Lead magnet (v2-ready, design hooks now):** the CIF cost calculator concept = essentially the public-facing Motor Accio estimate gated by email. Offer points: product-detail page (modal below inquiry CTA) and Accio entry for context-less visitors. Do not let it compete with the primary inquiry CTA.
- **Campaign anchor:** "El Número Antes de La Llamada" → drives to `/accio`. Build the **Shareable CIF Card** as a design affordance in the Accio success state (document-styled card with `WGT-[year]-[seq]` ref, FOB/flete/seguro/CIF/arancel/total, free zone, destination). MVP render server-side (satori) — Builder may stub the share action; the visual card in success state is in scope.

---

## 11. BUILDER WORK ORDER (Phase 2A — non-breaking enhancement)

1. **Tokens:** extend `tailwind.config.ts` + `globals.css` per §2.1–2.2 (additive). Add typography utilities.
2. **Copy:** replace every user-facing string across pages/components with §3 strings (and copywriter.md tables). "Accio Engine"→"Motor Accio" in all Spanish UI.
3. **Motion:** rewrite `src/lib/motion.ts` per §5.3 keeping back-compat exports; wire new variants where components already consume motion.
4. **AI:** swap `ACCIO_SYSTEM_PROMPT` + extend `extractTprFields()` per §6.
5. **Finance display:** apply §7 formatting + labels + disclaimer to `CifEstimateCard` and `cif-calculator` display path; implement count-up on CIF total.
6. **UX:** §4 friction fixes — TPR field-count header, mobile drawer badge, disabled-submit missing-field list, success-state reference number + specific timestamp.
7. **Hero immersion:** §2.6 gradient mesh + grain + gold rule (CSS only).
8. **IA:** breadcrumbs (`·`), internal links per §8, nav label corrections.
9. Write `build/BUILDER_COMPLETE.flag` when done.

**Animator (Phase 2B)** owns: MarketMap SVG animation, Soul Layer in `TprField`, page-load choreography, hover states, page transitions, reduced-motion. **Designer (Phase 2B)** owns: token consistency audit, gold-top-border-on-hover everywhere, Awwwards verdict.

---

## 12. ACCEPTANCE (quality gates)
- `pnpm build` — zero TS errors.
- All Spanish copy matches §3 (no "Accio Engine", no `!`).
- Soul Layer present in TprField; MarketMap animates with reduced-motion fallback.
- CIF card formatting matches §7 exactly.
- Designer Awwwards verdict: YES.
- Flags: BUILDER_COMPLETE, SEO_COMPLETE, ANIMATION_COMPLETE, DESIGN_REVIEW_COMPLETE.
