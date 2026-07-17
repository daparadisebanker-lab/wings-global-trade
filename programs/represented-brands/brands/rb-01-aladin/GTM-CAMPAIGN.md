# RB/01 Áladín — «CONTENEDOR 001» · Distribution-Channel GTM Campaign

> **Status: DRAFT for ratification — written 2026-07-16.** This is the GTM
> layer SPEC §8.8 anticipated ("brand-container closings as perishable
> campaigns, same anatomy as shared-container slot campaigns") applied to
> RB/01. It sells through machinery that is already LIVE:
> `/marcas/aladin` shelf + configurator + slot ledger (RB01-40HC-001 OPEN).
> Decision gates for Muaaz in §12. Campaign anatomy is written to be
> reusable verbatim for RB/02+ — only the brand layer changes.
>
> **v1.1 (2026-07-16, Muaaz: «built around these real prices and
> leverage»):** commercial sections rebuilt on the real price set from
> [`ALADIN_CUPO_PRICING_v1.xlsx`](./ALADIN_CUPO_PRICING_v1.xlsx) — working
> scenario 40% markup, EXW Tacna (ratified). Publication of any number
> remains blocked on ONE question: the fiscal basis of the S/ 16 cost
> ([`ZOFRATACNA.md`](./ZOFRATACNA.md) §4-Q3). If that basis shifts the
> spread, the markup dial moves — the architecture and the leverage story
> do not.

---

## 0 · Brief

| | |
|---|---|
| Product | Papel Higiénico de Bambú (pack ×10 rollos · 4 capas · 30 m) + Papel Facial (390 hojas). 100% fibra virgen de bambú, sin químicos ni lejía. «¡Cuida tu salud!» |
| Objective | Open a quantity distribution channel: sell Áladín by container and by cupo, launching the product commercially through it |
| Unit math | **1 cupo = 94 cajas = 564 paquetes = 5,640 rollos = 912 kg** · Contenedor 40HC = 10 cupos = 940 cajas (+5 holgura) — ratified template v2 |
| Working prices (v1 set) | Cupo higiénico **S/ 12,634** · cupo mixto (66H+32F) **S/ 14,515** · contenedor dedicado **S/ 116,229** — 40% markup, EXW Tacna; fiscal basis pending |
| Segment 1 (first) | Existing retail chains — SPSA (Plaza Vea/Vivanda) codification 2020 is the door-opener; named-account direct sales |
| Segment 2 (extend) | Wholesale markets — Mercado de Productores (Santa Anita), Mesa Redonda-adjacent distributors, provincial mayoristas |
| Where it lives | `wingsglobaltrade.com/marcas/aladin` is the proposal. PDFs and print are shadows of the URL, never the other way |
| Budget tier | Scrappy: field sales + WhatsApp + per-closing Meta budget. No always-on brand spend |
| Success | Contenedor 001 closes 10/10 · ≥3 cupo-holders reserve on Contenedor 002 unprompted · ≥2 net-new buyers arrive by referral per container |

**Competitive context — what the category does that this must not:** the tissue
category in Peru is owned by giants (Protisa/Elite, Kimberly-Clark) who sell
through distributor layers with list prices and credit terms. Nobody in the
category sells *a share of a container* to a mid-size buyer. That absence is
the campaign.

---

## 1 · Strategic foundation

**The human truth.** Every mid-size retailer and mayorista knows the import
price exists — and knows it was never for them. It belongs to whoever can
swallow a full container. They buy from the layer above and resent every
margin point it takes.

**The cultural tension.** Group-buying is already how this market behaves
(the validated «Trae tu grupo» insight: buyers coordinate containers
informally in WhatsApp). Meanwhile eco-products are moving from niche to
shelf-anchor in Lima retail. Áladín sits on both currents.

**The brand point of view.** Áladín does not ask retailers to stock a new
brand. It asks them to *become its importer* — with Wings supplying the
trust the informal version lacks.

**The strategic idea (one sentence):**
> **The container ledger is the marketing calendar — every container is a
> numbered, perishable campaign, and every cupo-holder becomes a recruited
> distributor.**

Contenedor 001, 002, 003… the campaign never "runs"; it *closes*, again and
again. Marketing rhythm = logistics rhythm. Nothing is advertised that is not
literally filling.

**Audience truths.**
- *Chain buyer (S1):* negotiates in margin points and shelf-days; fears
  supply gaps more than price; needs codification, GTINs, and a category
  story for the buying committee. Proof beats promise.
- *Mayorista (S2):* negotiates in cajas and rotation; cash cycles, no
  patience for decks; trusts what he can see filling and what his peers
  already bought. WhatsApp is his desk.
- *Channel fit note:* one cupo (5.640 rollos) is calibrated to a mayorista
  or chain DC — not a bodega. Bodegas buy **from** cupo-holders. The
  campaign does not sell to everyone; it recruits the ten right buyers per
  container and makes each one a distribution node.

---

## 2 · The commercial instrument (the offer itself)

### 2.1 Pricing law
- **Per-cupo all-in price, one number** (precedent: shared-container
  `slot_price_usd`). Per-unit prices **never** appear on the site —
  wholesale-language lint applies to every campaign surface.
- Price formula: `slot_price = costo_pack_Tacna × packs_per_cupo × (1 + markup)`.
  Cost basis (Muaaz, 2026-07-16): higiénico **S/ 16/pack** · facial
  **S/ 14/pack×5**, ex-almacén Tacna; retail targets S/ 30 · S/ 25. The full
  model — markup scenarios, tier ladder, freight, container P&L — lives in
  [`ALADIN_CUPO_PRICING_v1.xlsx`](./ALADIN_CUPO_PRICING_v1.xlsx) (drivers on
  INPUTS; regenerate structure via `build_pricing_workbook.py`). Ratify the
  ladder percentages **from that workbook only** (this doc's [A]/[B]/[C] are
  placeholders). This campaign is the reason to flip G3 from «a cotizar» to
  published prices.
- **Pricing basis:** recommendation dual-incoterm — published cupo price is
  **EXW Tacna** (single all-in number; freight is 1.5–5% of retail per pack
  and provincial mayoristas run their own carriers) + a transparent per-city
  delivered *estimate* in the instrument; chains (S1) are quoted delivered
  to their CD. Decision gate §12.
- Off-site sales conversations may discuss per-unit economics (a chain
  buyer will demand them); the *published* surfaces never do.

### 2.2 The benefits ladder (working price set v1 — higiénico, 40% markup)

| Tier | Cupos | Precio por cupo | Buyer keeps (s/ venta @ S/ 30) | Benefits (cumulative down the ladder) |
|---|---|---|---|---|
| **CUPO** | 1 | **S/ 12,634** | 25.3% (S/ 4,286/cupo) | Certificado numerado «Cupo n/10 · Contenedor 00N» · kit punto de venta (afiche + cenefa + exhibidor de cartón) · seguimiento del contenedor por WhatsApp (milestones) · listing on the aladin.pe «puntos de venta» map |
| **CUPO×3** | 2–3 | −3% → **S/ 12,255** | 27.6% (S/ 4,665/cupo) | 48 h pre-launch reservation window on the next container · featured post (co-op social, geo-tagged to their comercio) |
| **MEDIO** | 5 | −6% → **S/ 11,876** | 29.8% (S/ 5,044/cupo) | Zone preference for the cycle (soft territorial priority, not legal exclusivity) · personalized POS (comercio name printed) · direct ops line |
| **CONTENEDOR** | 10 | −8% → **S/ 11,623** (total S/ 116,229) | 31.3% (S/ 52,971/contenedor) | They set the closing date · composition choice (higiénico/facial mix once the facial template is ratified) · right of first refusal on the next cycle |

The ladder's design intent, now visible in the numbers: **the buyer's margin
climbs from 25.3% to 31.3% as he commits deeper** — concentration is
rewarded on his side of the table, not just ours. The 3/6/8 discounts are
the working set (ESCALERA sheet drivers); ratify or move them there.

### 2.3 The referral mechanic — «Cupo Padrino»
- Every cupo-holder gets an attributed link (`/marcas/aladin?ref={token}` —
  reuse the shared-container `invite_events` grammar; do not build new
  attribution).
- When the referred buyer's reservation reaches **CONFIRMED** (never
  RESERVED — anti-abuse), the referrer earns a credit of 2% of one cupo
  (working set: **S/ 253**), applied to their **next** container only
  (protects cash on the current close).
- One credit per referred account's first container. Credits stack up to a
  cap of one free cupo per cycle.
- Why it works here: §1's channel-fit truth — cupo-holders know exactly ten
  peers who should hold the other cupos. The referral loop is the
  «Trae tu grupo» behavior pointed at brand cargo.

### 2.4 Vocabulary law (SPEC §8.4)
One public word: **cupos**. Mister disambiguates at induction («¿cupos para
tu propia mercadería, o cupos de una marca que representamos?»). This
campaign never coins a synonym — no "slots", no "participaciones".

### 2.5 The leverage — what the numbers actually sell

The campaign does not sell paper; it sells the buyer's P&L. Every sales
surface (deck, WhatsApp, tablero pitch) leads with HIS side of the table:

| Offer | Buyer invests | Resale value | Buyer's profit | Velocity |
|---|---|---|---|---|
| Cupo higiénico | S/ 12,634 | S/ 16,920 (564 × S/ 30) | **S/ 4,286 (25.3%)** | ~14 sem @ 40 packs/sem → ~S/ 304/sem |
| **Cupo mixto (66H+32F)** — the default offer | S/ 14,515 | S/ 19,080 (facial @ S/ 25) · S/ 21,960 (@ S/ 35) | **S/ 4,565 → S/ 7,445 (23.9% → 33.9%)** | facial tail cut from 1,062 to 288 packs |
| CONTENEDOR (10 cupos) | S/ 116,229 | S/ 169,200 | **S/ 52,971 (31.3%)** | he sets the closing date |

Leverage principles:
1. **The mixed cupo is the recommended default offer** — assortment (two
   góndolas, one investment), rotation solved, and the facial-at-S/ 35
   upside makes it the best margin story in the catalog. Pure higiénico is
   the entry; mixto is what the field sells.
2. **The ladder is the buyer's growth plan**, framed as such: «cada cupo
   adicional sube TU margen» (25.3% → 31.3%).
3. **Profit-per-week is the mayorista's language** — S/ 300+/week per cupo
   beats any percentage in a market aisle.
4. **Surface law:** the buyer-margin story (resale at S/ 30/35, his profit)
   lives in the deck, WhatsApp, and field pitch ONLY. The site publishes
   per-cupo price + cascade — never unit retail prices (wholesale lint).
5. All figures = working set v1 (40% markup, EXW Tacna, consistent tax
   basis). One fiscal answer (ZOFRATACNA §4-Q3) revalidates or moves them.

---

## 3 · Campaign territories (three, one recommendation)

### T1 — «Precio de Importador» *(the equalizer — recommended spine)*
- **Core idea:** the import price stopped requiring the whole container.
  Ten buyers, one container, importer economics for each.
- **Manifesto line:** *El precio siempre existió. Solo que no era para ti.*
- **Campaign line:** **«Precio de importador. Sin el contenedor completo.»**
- **Why it wins:** it names the resentment (§1 human truth) in the buyer's
  own math vocabulary; entirely ownable — no tissue brand can copy it
  without building the machinery.
- **Risk:** price-led framing invites commodity comparison; mitigated by the
  certificate/trust layer and the eco differentiation beneath it.

### T2 — «La góndola que no fue árbol» *(the eco shelf — support layer)*
- **Core idea:** the only paper on the shelf that was never a tree. The
  retailer who takes the cupo owns the eco shelf before his competitor does.
- **Campaign line:** «El único papel de tu góndola que no fue árbol.»
- **Why it matters:** this is the **sell-through layer** — it's what the POS
  kit says to end consumers so the cupo-holder's 5.640 rollos rotate. A
  channel campaign that ignores sell-through creates one-time buyers.
- **Risk as lead:** mayoristas buy margin, not planet. Never lead with this
  in S2.

### T3 — «El contenedor se llena» *(the countdown — the rhythm mechanism)*
- **Core idea:** the FillMeter is the ad (shared-container §5.2 precedent).
  Every container is a numbered public event that fills and closes.
- **Campaign line:** «Quedan {n} de 10 cupos · Contenedor 00N · cierra {fecha}.»
- **Why it wins:** urgency is real, not manufactured — the kill rule
  (auto-pause at close) makes every claim true by construction.
- **Risk:** a meter stuck at 2/10 for weeks is anti-marketing. Mitigation:
  §7 launch sequencing seeds Contenedor 001 with named-account sales
  *before* any public meter is shown.

**Ruling recommended:** T1 is the program spine (all masthead copy), T3 is
the always-on rhythm (every closing), T2 is the consumer-facing support kit.
They are layers of one system, not alternatives.

---

## 4 · Campaign development — «CONTENEDOR 001»

### Hero execution — the numbered container as public event
Contenedor 001 (= RB01-40HC-001, already OPEN in the ledger) is launched,
filled, closed, shipped, and unloaded **in public view**:

1. **Naming:** every container carries its ledger number on every surface —
   the campaign system IS the container ledger.
2. **The certificate:** each confirmed cupo produces a numbered physical
   certificate — «Cupo 3/10 · Contenedor 001 · 94 cajas · 5,640 rollos» —
   document grammar, RB seal, Áladín green on white. Merchants frame
   credentials; this one also carries the QR to their live tracking.
3. **The fill, broadcast:** each fill-state change fires the existing OG
   regeneration + WhatsApp status rhythm (shared-container §5.3 pipeline,
   pointed at brand containers).
4. **The arrival:** Callao unloading photographed/filmed as evidence
   (photography law: *scenario may be generated; evidence may not* — arrival
   content is always real). Delivered to cupo-holders as content they can
   repost: «Llegó el Contenedor 001. Cupo 7 es de {comercio}.»
5. **The reset:** closing content for 001 is launch content for 002. The
   final frame of every cycle: «Contenedor 002 abre el {fecha}.»

### Field execution — «El tablero del contenedor» (S2 signature)
A physical FillMeter — printed container diagram, 10 cupo cells — stands at
the Wings/Áladín stand in Mercado de Productores, updated daily by hand as
the digital ledger moves. Merchants watch it fill in the aisle. The tablet
next to it shows the live configurator; reserving takes one WhatsApp
message. The digital meter made tangible is the cheapest possible
experiential piece and produces its own conversation.

### S1 execution — the chain proposal («Programa de Abastecimiento por Contenedor»)
For named accounts (SPSA first — the 2020 codification means GTINs, master
boxes, and pallet specs are already in their PIM):
- A quarterly container calendar with reserved cupos per cycle, price locked
  per cycle — supply-continuity framing, not spot-buy framing.
- Proof stack: SPSA codification 2020 · GTINs live · «No requiere» registro
  sanitario (SPSA validation) · MandateSeal representation letter.
  **SPSA proof lives in the private deck and sales conversations only —
  never on public site copy (2026-07-10 ruling: site uses free-zone
  logistics framing; SPSA stays in internal docs).**
- Category story for the buying committee: eco-shelf anchor + T2 consumer
  support per arrival.
- Delivered as a 6-page A4 deck (document grammar) whose every number QRs
  into `/marcas/aladin/contenedor` — the deck expires, the URL doesn't.

### Earned media
The story is «el primer contenedor compartido de una marca en el Perú» —
trade press (agencia de aduanas newsletters, retail trade media) gets the
Contenedor 001 arrival as a case: ten mid-size buyers imported directly,
with names (with consent). The certificate wall photo is the asset.

---

## 5 · Copy system (ES canonical; EN only where the site already carries it)

**Masthead / hero**
- «Precio de importador. Sin el contenedor completo.»
- Alt A: «Un contenedor. Diez cupos. El precio que antes exigía los diez.»
- Alt B: «Tu cupo en el contenedor.»

**The cascade (numbers are the brand asset — always tabular, never prose;
customer-facing figures use es-PE comma thousands — 5,640 not 5.640, per the
2026-07-10 Mister formatting ruling). Site-safe — per-cupo price only:**
> 1 cupo = 94 cajas = 564 paquetes = 5,640 rollos · 912 kg
> **S/ 12,634 · EXW Tacna · entrega estimada a tu ciudad, transparente**
> Contenedor 40HC · 10 cupos · cierra {fecha}

**Urgency states (T3, auto-generated from fill state):**
- 0–50%: «Contenedor 00N abierto · {n} de 10 cupos disponibles»
- 50–80%: «Quedan {n} de 10 cupos · cierra {fecha}»
- 80%+: «Últimos {n} cupos · Contenedor 00N»
- Closed: «Contenedor 00N cerrado. Contenedor 00N+1 abre el {fecha}.» + waitlist CTA

**Referral:** «Presenta a un comprador. Cuando confirme su cupo, tu próximo
cupo baja.»

**S1 (chains):** «Ya estamos codificados. Ahora llegamos por contenedor.» ·
«Abastecimiento por ciclo, precio por ciclo.»

**S2 (mayoristas, WhatsApp register — short, numbers first; off-site only,
margin story allowed):**
«Papel de bambú, directo de importación. 1 cupo = 94 cajas = 5,640 rollos
por S/ 12,634 (EXW Tacna). Se revende a S/ 30 el pack — te quedan más de
S/ 4,200 por cupo. Quedan {n}. ¿Te aparto uno?»

**El cupo surtido (the field's default pitch, off-site):**
«Higiénico + facial en un solo cupo: S/ 14,515. Dos góndolas, una
inversión — y el facial es donde más ganas.»

**Ladder upsell line (deck/field):**
«Cada cupo adicional sube TU margen: 25% con uno, 31% con el contenedor.»

**Sell-through kit (T2, consumer-facing POS):**
- «El único papel de esta góndola que no fue árbol.»
- «100% bambú. Sin químicos, sin lejía.» · «¡Cuida tu salud!» (brand slogan, locked)

**Mister handoff line (rb-aladin pack):** «¿Cupos para tu propia mercadería,
o cupos de Áladín, la marca que representamos?» (§8.4 disambiguation, verbatim).

**Forbidden everywhere on-site:** per-unit prices, «compra ya», carts,
retail vocabulary (lint list applies to brand shelves per SPEC §4).

---

## 6 · Art direction

- **System:** Áladín `--rb-*` tokens on the white canvas — greens
  #5E8A16/#4C7012, copper #C77029 decor-only; Wings type system (NissanOpti /
  Flexo / Teko); numerals always Teko/tabular. No Value Serif / Mabry on any
  Wings-side surface (kit law).
- **Grammar:** document, not advertisement. Certificates, stamps, cascades,
  the RB seal, container corrugation texture (kit assets exist:
  `kit/container/`, `kit/seal/`, `kit/textures/`). Every piece should look
  like it could be filed with a customs broker.
- **The meter is the key visual** in every format: 1:1 feed, 9:16 Stories,
  4:5 — static + 6 s animated (meter fills to current state, countdown
  ticks). Same anatomy as shared-container §5.2.
- **Photography:** two registers — (1) product macro on document-cream
  (exists in catálogo assets, pending source-tag attestation), (2) evidence:
  containers, Callao, pallets, hands — never generated. Hero photography set
  is still a kit gap; until it exists, executions are typography-and-number-led
  (which suits the document grammar anyway).

---

## 7 · Channels & sequencing (three waves, each gated)

### Wave 1 — Named accounts (S1) · weeks 1–3 · QUIET
No public campaign. Direct sales against the chain proposal (§4-S1) + the
first 3–4 mayorista relationships from existing distribution. Goal: seed
Contenedor 001 to ≥40% before anything public — the public meter must never
start empty (T3 risk).
**Gate:** ≥4 cupos CONFIRMED · pricing published on the shelf (G3 flip) ·
certificates printed.

### Wave 2 — Wholesale field launch (S2) · weeks 3–8
- Field presence: el tablero at Productores + tablet configurator + printed
  one-pager (QR → shelf).
- WhatsApp Business: opted-in broadcast list, one message per fill-state
  change maximum (rhythm, not spam; Ley 29733 discipline — pull, never push).
- Meta perishable campaign per closing (§5.3 automation pipeline, brand
  container trigger): geo Lima-este wholesale zones + retargeting stack;
  kill rule at close.
**Gate:** Contenedor 001 CLOSED 10/10 · CAC per cupo measured · fill
velocity recorded (feeds 002's deadline).
Note: 001 is pure higiénico (the seeded template). Ratify the mixed
template (MIXTO sheet) during Wave 2 so **Contenedor 002 opens as the first
cupo surtido** — the field's default pitch needs a container to point at.

### Wave 3 — The loop · continuous from 002
- «Cupo Padrino» referral live (§2.3) · arrival content from 001 becomes
  acquisition content for 002 · brand-container card appears on the public
  slot marketplace shelf when shared-container Phase 2 ships it (§8.4
  ruling: shared demand pool, distinct card type).
- Chains move from spot cupos to the quarterly calendar (S1 retention form).
**Gate:** referral coefficient ≥0.2 (2 net-new buyers per 10 cupos) · ≥3
repeat holders on 002 · decision point: open Contenedor 003 concurrent or
sequential (fill-velocity data decides).

---

## 8 · Platform sync requirements (what must exist; most already does)

| Surface | Status | Needed for campaign |
|---|---|---|
| `/marcas/aladin` shelf + configurator + ledger | **LIVE** | — |
| Slot price display | «a cotizar» | **G3 flip:** publish per-cupo price once workbook validates landed cost |
| Benefits ladder module | missing | Render §2.2 tiers on `/marcas/aladin/contenedor` from data (not hardcoded copy) |
| Referral attribution | grammar exists (shared-container `invite_events`) | `?ref={token}` on brand shelf + credit ledger (TOWER-side, simple table) |
| OG image with live fill state | spec'd (shared-container §5.3) | Point the regeneration job at `rb_public_containers` |
| Numbered certificate generator | missing | PDF from allocation row (document grammar) — small, high-leverage |
| aladin.pe → shelf | missing | «Venta mayorista / por contenedor» CTA on aladin.pe pointing at the shelf; puntos-de-venta map for tier benefit |
| Mister rb-aladin pack | spec'd (SPEC §5, Phase 4) | Required before Wave 2 (field traffic hits Mister) |

The proposal is the URL. Every printed piece carries its QR. Nothing is
built as a static duplicate of what the shelf already renders.

---

## 9 · Measurement (KPI tree per SPEC §8.8)

Per container: shelf visit → configurator open → mode chosen → reservation →
CONFIRMED · fill rate · days-to-fill · CAC per cupo (paid vs field vs
referral) · referral coefficient · repeat-holder rate across containers ·
sell-through proxy (cupo-holder reorder gap). These numbers are the brand
renewal/negotiation asset — commercial data, not telemetry.

---

## 10 · Five versions (condensed)

| Version | Optimization | Delta from the recommended build |
|---|---|---|
| A · Cultural | «El primer contenedor compartido del Perú» story-led; earned media first | Slower; needs 001 closed as proof before it exists |
| **B · Conversion (recommended)** | Waves 1–3 exactly as §7 | — |
| C · Award | The certificate + tablero as design objects; arrival film as case study | Craft spend on top of B, not instead of it |
| D · Distinctiveness | Bamboo/eco identity campaign leads (T2 first) | Wrong for S2; only if a consumer brand budget appears |
| E · Minimum budget | Wave 1 + WhatsApp + tablero only, zero paid | Viable — Meta layer is an accelerant, not a dependency |

---

## 11 · Honesty scorecard (the skill's standard, applied without flattery)

Strategy 88 · cultural intelligence 78 · creative courage 72 · craft
(potential) 85 · emotional impact on the actual audience 90. This is a trade
campaign: its Cannes ceiling is Creative B2B / Creative Commerce, and only
version C with a genuinely crafted certificate system, tablero, and arrival
film gets near a shortlist. What it will actually win is the only jury that
matters here: **ten cupos, closed, twice.** Do not spend award money before
Contenedor 002.

---

## 12 · Decision gates (Muaaz, before Wave 1)

1. **G3 flip + markup base — working set ADOPTED as draft (v1.1):** 40%
   markup → the §2.2/§2.5 prices. Publication is blocked ONLY on the fiscal
   basis (gate 2-bis); if the basis shifts the spread, the markup dial moves
   in INPUTS C33 — ladder, copy, and leverage story regenerate from the
   workbook without redesign.
2. **Ladder percentages — working set 3/6/8 + padrino 2% adopted as draft.**
   Ratify or adjust in ESCALERA (INPUTS C34–C37); this doc's tables restate
   the workbook, never the reverse.
2-ter. **Facial retail position:** S/ 25 vs S/ 35 (FACIAL sheet, second
   grid). At S/ 35 facial is the buyer's best margin (44% s/venta) and the
   engine of the cupo surtido — recommend S/ 35 as the suggested resale
   price in all sell-through material.
2-bis. **Pricing basis — RESOLVED in direction (Muaaz 2026-07-16):** EXW
   Tacna published price + transparent delivered estimates (FLETE sheet);
   chains quoted delivered-to-CD. **Remaining blocker is fiscal, not
   commercial:** ZOFRATACNA exit = importation (arancel + IGV/IPM 18% +
   percepción) — see [`ZOFRATACNA.md`](./ZOFRATACNA.md). The basis of the
   S/ 16 cost (§3 of that file) must be pinned with the agencia de aduana
   **before any price publishes** — it can halve the real margin.
3. **Territory rule for MEDIO tier:** confirm "zone preference" wording —
   soft priority (recommended) vs contractual exclusivity (don't; it
   constrains 002+).
4. **Referral reward form:** % credit (recommended) vs fixed S/ amount.
5. **S1 target list:** confirm SPSA re-activation as first named account +
   the 3–4 existing mayorista relationships that seed Wave 1.
6. **Prereqs already flagged in KIT-INTAKE that Wave 1 inherits:** current
   box dims confirmation (template `PUBLISHED` gate) · representation letter
   (MandateSeal) · source-tag attestations · hero photography (or explicit
   typography-led ruling, §6).
