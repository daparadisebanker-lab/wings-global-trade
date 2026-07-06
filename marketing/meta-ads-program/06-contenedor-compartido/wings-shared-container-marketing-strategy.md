# CONTENEDOR COMPARTIDO — Full Marketing Strategy
## Wings Global Trade · «Trae tu Grupo» · «Oiga, Mister»

> **Companion to:** `programs/shared-container/wings-shared-container-spec.md`. This document is the go-to-market program for the shared-container feature. It assumes the spec's mechanics (invite links, fill meter, slot pricing, WhatsApp-first onboarding, hybrid mode) and turns them into a campaign system. Destination inside the project: `marketing/meta-ads-program/06-contenedor-compartido/`.

---

## 1. STRATEGIC FOUNDATION

**The human truth.** Smaller machinery buyers in Peru are not priced out of importing by the machines — they're priced out by the *container*. The unit of importation is bigger than the unit of ambition. So they either overpay a local reseller, or they improvise: a WhatsApp group, a handshake, a friend-of-a-friend, and prayer that nobody backs out. Buying together is not a new behavior we're introducing — it's a behavior they already have, done badly, with fear attached.

**The cultural tension.** In Peru, pooling is native commerce — la junta, la pollada, comprar en colectivo. But at machinery-import scale, the informal version breaks: real money, real liability, strangers' cargo in the same box. The tension: *the culture knows how to buy together; the infrastructure doesn't exist.* Wings builds the infrastructure and lets the culture do the marketing.

**The brand point of view.** Every buyer has spent years saying «oiga, mister» to someone — the contact, the trader, the guy who knows. Wings' POV: *el mister ahora es tuyo.* Not an app replacing a relationship — the relationship, made permanent, transparent, and always on WhatsApp.

**The strategic idea (one sentence):**
> **Importar ya no es un privilegio de quien llena un contenedor — es de quien trae su grupo.**
> *(Importing is no longer the privilege of whoever can fill a container — it belongs to whoever brings their group.)*

**Audience truth.** The core buyer is the independent machinery buyer / small distributor — Arequipa, Tacna, Juliaca, Lima Norte — who resents the reseller's markup, distrusts what he can't see (costs, cargo status, who's handling his money), and trusts three things: his own group, a person who answers, and a number that doesn't change. He is on a mid-range Android, in WhatsApp, right now.

---

## 2. THREE CAMPAIGN TERRITORIES

### Territory A — «TRAE TU GRUPO» *(recommended lead)*
**Core idea:** Name the behavior buyers already have and attach Wings to it. The campaign never sells software — it sells the group's move: *you and your people, one container, one clear price each.*
**Manifesto line (internal):** El contenedor siempre fue de varios. Ahora tiene sistema.
**Campaign line:** **«Trae tu grupo. El contenedor lo ponemos nosotros.»**
**Why it wins:** zero education cost — the audience recognizes itself instantly; the invite link makes the ad's promise literal (the CTA *is* the behavior); it compounds via the viral loop, so paid spend seeds organic groups.
**Why it could fail:** if the product's group onboarding has any friction, the campaign over-promises; and it under-serves the buyer who *has no group* (that's Territory C's job in Phase 2).

### Territory B — «OIGA, MISTER»
**Core idea:** Personify the category's own vocabulary. Every execution opens with the phrase buyers already use to start this exact conversation — and Mister answers. A dialogue campaign: real buyer questions («¿cuánto me sale el cupo?», «¿dónde está mi carga?», «¿y si uno se baja?») answered in Mister's street-fluent register.
**Manifesto line:** El mister que siempre contesta.
**Campaign line:** **«Oiga, Mister — ¿queda cupo?»**
**Why it wins:** it's the audience's words, not advertising's; it doubles as product demo (every ad shows the WhatsApp conversation the tap will start); it's the brand campaign that makes Mister famous beyond this feature.
**Why it could fail:** as the *lead* for the container feature it sells the character before the mechanism; buyers need the mechanism (price, slots, deadline) to act. Better as the voice layer across all lanes than as the standalone hero.

### Territory C — «QUEDAN 3 CUPOS» *(the performance engine)*
**Core idea:** The inventory is the advertising. Each open container is a live, perishable ad unit: route, all-in price, fill meter, countdown. No metaphors — the product state, published.
**Manifesto line:** La urgencia no se inventa. Se muestra.
**Campaign line (format, not fixed):** **«Quedan {n} de {total} cupos · ${precio} todo incluido · cierra {fecha}.»**
**Why it wins:** it's the most honest performance creative in the category — concrete, priced, deadlined, three things machinery ads never are; it automates (n8n pipeline already specced); every container generates its own campaign for near-zero creative cost.
**Why it could fail:** stale state kills it — a «quedan 3» that's actually full destroys exactly the trust it exists to build (mitigated: live revalidation is already in the spec); and it needs Territory A/B running above it or the numbers arrive without meaning.

### The architecture (not a choice — a stack)
**A is the campaign. B is the voice. C is the engine.** «Trae tu grupo» leads and defines the feature; every piece of copy in every lane speaks in the «oiga, mister» register; and once containers exist, Territory C runs perpetually underneath, converting the demand A creates. This mirrors the funnel: A = TOF/MOF (name the behavior), C = BOF (name the price and the deadline), B = the connective tissue that makes it all sound like one brand.

---

## 3. FULL CAMPAIGN DEVELOPMENT — «TRAE TU GRUPO»

### 3.1 Hero execution — the 30–45s launch film («La Junta»)
**Format:** vertical-first film, 9:16 master, cutdowns 15s/6s.
**Setting:** real, unglamorous, correct — a taller in Arequipa, a depósito near Tacna, fluorescent light, thermos of coffee, mid-range Androids on the table.
**Narrative:** Three buyers around one phone. One says what they all know: «Solos, no llenamos el contenedor.» Beat. The lead opens WhatsApp: «Oiga, Mister…». Cut to the Mister thread — the fork question appears: *¿Importas solo o compartido?* He taps **Con mi grupo**. The invite link lands in their group chat; we watch the fill meter animate as each partner taps in — segment by segment, name by name — until the container silhouette is full.
**Final frame:** the full fill meter, then the line: **«Trae tu grupo. El contenedor lo ponemos nosotros.»** Endcard: `wings.trade` + WhatsApp CTA.
**Emotional arc:** resignation → recognition → the quiet satisfaction of a solved logistics problem. No triumph music. Machinery buyers distrust triumph music.

### 3.2 Social & digital executions
1. **«El grupo ya existe» (Reels, 15s):** screen-recording aesthetic — a WhatsApp group named «Importación Marzo 🚢» scrolling real-feeling coordination chaos («¿quién paga el flete?» «¿y si Julio se baja?»), hard cut to the invite link landing in the chat, tap, fill meter. Copy: *«Tu grupo ya sabe comprar junto. Ahora tiene sistema.»* CTA: Enviar mensaje (WhatsApp).
2. **«Un precio, todo incluido» (static, 1:1 + 4:5):** one huge DM Mono number — `$X,XXX` — with the checklist below (flete ✓ seguro ✓ zona franca ✓ despacho ✓). Copy: *«Tu cupo. Un número. Sin sorpresas.»* This is the anti-opacity ad; it targets the reseller-markup resentment directly.
3. **«Cómo funciona» (carousel, 5 cards):** the three illustrated steps from the landing page, verbatim — ad and product teach identically: ① Dile a Mister qué traes → ② Manda el enlace a tu grupo → ③ Cada uno con su cupo, su cuenta, su tracking.
4. **«El mister contesta» (Reels, dialogue format, Territory B voice):** real question as on-screen text — «Oiga Mister, ¿y si el contenedor no se llena?» — answered honestly with the published fallback rule. Trust as content. Series-able: one objection per piece, straight from the FAQ accordion.
5. **Retargeting static (fill meter live-state):** auto-generated per container from the OG-image system — meter at current fill, «Quedan {n} cupos», countdown. (This is where Territory C begins; same asset, warmer copy for warm audiences: *«Tu contenedor te está esperando.»*)

### 3.3 OOH / print (opportunistic, not core)
1. **Ruta Tacna:** billboard on the Panamericana approach to Tacna — the fill meter, half-full, «Quedan 5 cupos a este destino» + WhatsApp number. The location *is* the targeting.
2. **Ferias y expos de maquinaria:** printed one-pager = the invite landing page on paper, QR to a live container. The fill meter printed at *that morning's* state (print-on-demand per event day) — the detail people photograph.

### 3.4 Activation — «El primer contenedor»
Launch stunt: Wings opens one flagship public container (Phase 2) or documents one real founding group (Phase 1) end-to-end — group formed, meter filling, sailing, arrival at Tacna, each buyer picking up cargo. Every milestone posted as content. The first container's story becomes the permanent «¿Cómo funciona?» proof asset and the earned-media hook: *the platform that lets small Peruvian buyers import like the big ones, together.* Pitch to trade/logistics press and regional business media in Arequipa/Tacna.

### 3.5 Earned / organic loop
The invite link **is** the earned channel: every private container puts a Wings link with a rich preview card into at least one WhatsApp group Wings could never buy its way into. Support it: make the OG card beautiful (fill meter, route, price — specced), give leads a share script, and celebrate closed containers back to the group («Contenedor cerrado 🎉 — 10/10 cupos») as shareable moments.

---

## 4. AUDIENCE ARCHITECTURE

### 4.1 Segments (mapped to the existing archetype matrix)
| Segment | Who | Lane entry | Primary message |
|---|---|---|---|
| **El Líder** | The buyer with a group — organizes, has done informal shared imports | Territory A, TOF | «Trae tu grupo» — you bring people, we bring structure |
| **El Socio** | Enters via invite link — never sees an ad first | Product-led (landing → WhatsApp) | Lead's endorsement + one clear price |
| **El Independiente** | No group, priced out of solo FCL | Territory C, Phase 2 | «Quedan {n} cupos» — join without knowing anyone |
| **El Revendedor cansado** | Currently buying from local resellers at markup | Territory A static #2 | The all-in price vs. what he pays now |
| **El Repetidor** | Past importers, waitlist, closed-container members | Retargeting/CRM | «¿Siguiente contenedor?» + route alerts |

Cross-reference each against the five Mister archetypes in `01-foundation/audience-architecture.md`; El Líder and El Independiente likely map to existing lanes, El Socio is *new* — product-acquired, not ad-acquired — and must be tracked separately or the viral loop's CAC advantage disappears in blended numbers.

### 4.2 Meta targeting construction
- **El Líder:** business-owner/SMB behaviors × machinery-category interests × regions (Arequipa, Tacna, Lima Norte, Juliaca) × lookalike seed = leads of filled containers (the highest-value seed in the account once ≥50 exist).
- **El Independiente:** category interests × exclusion of existing members × broader geo; creative does the qualifying (the price qualifies harder than any interest stack).
- **Retargeting stack (from spec §5.2):** site visitors 30d → invite-landing viewers who didn't tap WhatsApp (highest intent, lowest cost) → Mister-conversation abandoners → waitlist → past importers. Each with distinct creative temperature.
- **Geo note (open decision #3 in the spec):** if Chile/Bolivia buyers are confirmed in scope, duplicate slot campaigns with CLP/BOB price rendering and Iquique-route emphasis. Do not launch cross-border until the founder decides.

### 4.3 The viral loop as a channel
Treat invites as a formal acquisition channel with its own funnel: `invite opened → wa_started → account created → slot reserved` (all events exist in `invite_events`). **Channel KPI: viral coefficient ≥ 2.0 net-new accounts per private container.** Paid's job in Phase 1 is not volume — it is *seeding leads whose groups multiply the spend.*

---

## 5. COPY & MESSAGING SYSTEM
*(Spanish canonical, English annotation of intent. Register: «oiga, mister» — direct, street-fluent, usted by default, numbers early, zero corporate softening.)*

**Campaign line:** «Trae tu grupo. El contenedor lo ponemos nosotros.»

**Hero headlines (3):**
1. «Solos no llenan un contenedor. Juntos, sobra.» *(names the math of the problem)*
2. «Importar en grupo siempre existió. El sistema, no.» *(behavior validation + the gap Wings fills)*
3. «Un contenedor. Diez cupos. Un precio cada uno.» *(pure mechanism, DM Mono energy)*

**Slot-campaign copy formula (Territory C, template variables):**
Primary: «Contenedor a {destino} cierra el {fecha}. Quedan {n} de {total} cupos. Tu cupo: ${precio} — flete, seguro, zona franca y despacho incluidos.»
Headline: «Quedan {n} cupos» · Description: «Reserva por WhatsApp» *(Phase 2 adds: «Reserva con ${depósito}. Si no cierra: {fallback}.» — the guarantee is copy, not fine print)*

**Objection-handling series (Territory B, one per asset):**
- «¿Y si uno del grupo se baja?» → «Tu contrato es con Wings, no con ellos. Tu cupo no depende de nadie más.»
- «¿Quién agarra la plata?» → «Nadie del grupo. Todo pasa por Wings, cada pago con su comprobante en tu cuenta.»
- «¿Cómo sé cuánto espacio uso?» → «Mister calcula los m³ por ti. Tu tarjeta de cupo lo muestra antes de que pagues.»
- «¿Y si el contenedor no se llena?» → published fallback rule, verbatim, per container.

**WhatsApp CTA texts (prefilled):**
- Invite flow: «Hola Mister, quiero mi cupo en el contenedor {código}»
- Cold/slot ad: «Oiga Mister, ¿queda cupo a {destino}?» *(the campaign line as literal user action — the audience's phrase becomes the conversion event)*

**Milestone template voice (retention copy is marketing):** «Su contenedor zarpó de {origen} 🚢 Llega a {destino} aprox. el {fecha}. Todo en orden con su carga.» — every update reinforces the promise the ads made: you always know where your money and machine are.

---

## 6. VISUAL & ART DIRECTION BRIEF

**Visual world.** Extend the Wings system — never a parallel campaign aesthetic. Warm paper ground; the fill meter's claimed-state accent is the campaign's only saturated color. Photography: real depósitos, real hands, real Androids — available light, no gloss; the register is *documentary confidence*, not aspiration. Casting: actual buyer physiognomy and age (35–55), never startup-young.

**Typography.** Campaign lines in Cormorant Garamond display. **Every number — price, CBM, countdown, «quedan {n}» — in DM Mono, always.** The mono treatment is the trust argument made visual: data that looks like data. DM Sans for functional UI text in screen-capture creative.

**The fill meter as brand asset.** It appears in every execution, always in the same construction (container silhouette, left-to-right, segmented by slots, hatched = reserved). In film it is the emotional climax device (segments filling = the group assembling). In statics it is the layout's anchor. In OOH it is the whole idea. Motion spec: sequential segment fill, ~400ms total, ease-out — identical to the product (spec §4.3), so the ad and the app are provably the same object.

**Editing rhythm (film):** unhurried, cut on actions not beats, WhatsApp UI shown real and unretouched (buyers can smell a mocked-up chat). Sound: ambient taller noise; no score until the meter fills — then one restrained tone.

---

## 7. THE PERISHABLE CAMPAIGN ENGINE (Territory C, operationalized)

Per spec §5.3, every container auto-generates its campaign. Marketing additions to that pipeline:

1. **Creative states by fill level:** 0–49% = discovery copy («Se abrió un contenedor a {destino}») · 50–79% = social-proof copy («{n} compradores confirmados») · **80%+ = urgency copy («Últimos {n} cupos»)** — the n8n trigger already regenerates assets at these thresholds; this defines what each state *says*.
2. **Budget logic:** flat daily budget per open container at launch; after 5 containers, reallocate by *fill-velocity elasticity* — spend follows containers that respond, deadline-weighted (double daily budget in the final 5 days if unfilled).
3. **Kill discipline (non-negotiable):** ad paused within minutes of `closed`/`cancelled`; landing flips to «Contenedor cerrado» + waitlist CTA. One screenshot of Wings advertising a full container costs more trust than the campaign built.
4. **Hybrid moment as a marketing event:** when a private group opens its remaining slots, the public ad *leads with the group*: «5 cupos tomados por un grupo de {ciudad}. Quedan 5.» Committed strangers are proof; a committed *group* is better proof.

---

## 8. LAUNCH PHASING (locked to product phases)

**Phase 1 — with «Trae tu grupo» MVP** *(private groups only)*
- Objective: seed **Líderes**. Territory A launch film + statics #1–3, tight geo (Arequipa, Tacna, Lima Norte), conversion event = Mister fork reached with «Con mi grupo» selected.
- Document the first real containers → the «primer contenedor» proof asset.
- Success: 3 containers filled · viral coefficient measured · CAC per *container* (not per lead) established.
- **Do not run slot campaigns yet** — there is no public inventory; Territory C ads without claimable slots are a broken promise.

**Phase 2 — with public slots + hybrid**
- Territory C engine goes live (n8n pipeline) · objection series (Territory B) scales as always-on trust layer · marketplace shelf becomes a retargeting destination · «Súmame a uno» audiences (El Independiente) open.
- Success: fill velocity by route · paid-public CAC/slot vs. private-viral CAC/slot converging · ≥1 hybrid container closed by public strangers.

**Phase 3 — scale**
- Route-level demand campaigns informed by waitlist + fill-velocity data («¿A qué destino abrimos el próximo?» as engagement content that doubles as demand research) · lookalikes from filled-container leads · cross-border lane if approved.

---

## 9. MEASUREMENT

**KPI tree (extends `01-foundation/measurement-plan.md`):**
`impression → landing view → wa_started (CAPI, container_id) → account created → slot reserved → committed/deposit → container closed → delivered → repeat`

**The four numbers that decide the program:**
1. **Viral coefficient** per private container (target ≥2.0)
2. **CAC per filled slot**, split private-viral vs. paid-public
3. **Fill velocity** (days `filling`→`closed`) by route — the supply-side health metric
4. **Invite-landing → WhatsApp tap rate** vs. public-landing rate — the trust-UI gauge (public converging toward private = the trust badges and guarantees are doing their job)

**Testing cadence (weekly):** one variable per lane — Territory A: headline 1 vs 2 vs 3 · Territory C: price-led vs. urgency-led primary text · landings: countdown position, trust-badge order. Kill at <50% of lane-median WhatsApp-tap rate after 1,000 impressions; scale winners into the template system so every future container inherits them.

---

## 10. RISKS & HONEST ASSESSMENT

- **The campaign is a promise the product must keep in ≤3 taps.** «Trae tu grupo» dies if the invite→WhatsApp→cupo flow has any friction. Marketing launch gates on the spec's onboarding being live and fast — not "mostly working."
- **Stale urgency is the fastest way to lose this market.** Live fill-state on every ad-adjacent surface is a marketing requirement, not just an engineering one.
- **Territory B without Territory A is a character without a plot; C without inventory is a lie.** Respect the stack order.
- **Award-lens honesty:** Territory A has genuine Cannes-shaped bones — a real cultural insight (colectivo commerce), a product mechanic as the creative mechanic (the invite link), and a documentable human story (the first container). What would hold it back is craft budget on the film. Shoot the documentary version well and «El primer contenedor» is a case-study film that works in both Lima and on a jury reel. But the business wins on Territory C's boring, honest numbers — fund accordingly.
