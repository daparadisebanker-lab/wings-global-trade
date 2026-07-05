# Brand / Umbrella Campaign — Strategy

**Level:** whole-site. The roof under which every category campaign lives.
**Objective:** awareness + trust priming for a high-consideration purchase. This campaign never asks for the lead; it makes the lead cheaper everywhere else.

---

## 1. Strategic foundation

**The human truth.** The Peruvian importer of machinery has been burned or knows someone who has: the "precio final" that grew at nationalization, the intermediary who vanished after the deposit, the container held at SUNAT because a certificate was missing. He doesn't fear Chinese machinery — he fears the channel. What he wants is not a discount; it's to stop feeling like the least-informed person in his own purchase.

**The cultural tension.** Chinese-origin equipment has won the price argument in LATAM (KAMA, SNH, Chinese-built John Deere lines are already on Peruvian roads and fields), but the buying experience is still a bazaar: WhatsApp catalogs with prices that mean nothing, marketplaces with anonymous sellers. The category talks like a market stall. Nobody talks like an operator.

**The brand point of view** (already written, verbatim on the site): *"La posición es el argumento"* (`nosotros`). Wings doesn't claim to be cheaper or better — it occupies two physical positions inside the tariff corridor (ZOFRATACNA 1988, ZOFRI 1975) and lets the mechanics speak: *"El costo de internación es diferente desde dentro."*

**The strategic idea (one sentence):**
> **Wings turns importing from an act of faith into an act of documentation.**

**Campaign platform / working title:** **«Desde dentro»** — from inside the free zone, from inside the cost structure, from inside the documentation. Every execution shows something the buyer normally never gets to see.

**Tone signature:** documental, técnico, sereno. (The brand's own register: "a senior trade engineer briefing a procurement director" — `WINGS_BRAND_SYSTEM.md` §6.)

**What the category does that this must not:** exclamation marks, "¡Mejor precio!", urgency stickers, stock-photo handshakes, price-first claims. Every one of these is explicitly forbidden by the brand's copy rules — which is convenient, because their absence IS the differentiation.

---

## 2. Why an umbrella campaign at all (at this budget stage)

- A tractor/truck purchase gestates for weeks–months. Pure conversion pressure on a cold audience wastes the consideration window; a cheap awareness layer (Peru CPMs are low) keeps Wings present while the buyer matures.
- All five categories share one argument (the corridor position) — telling it once at brand level is cheaper than five times at category level.
- The StatBar numbers already exist as proof devices: **97 modelos · 05 fabricantes verificados · 02 zonas francas · 24h respuesta** (`StatBar.tsx`, verbatim).

Budget share: **~10% of {{MONTHLY_BUDGET}}** (see `05-execution/campaign-structure.md`). Objective: ThruPlay (video) + Reach (static), Peru broad 25–60 with machinery/agro/transport/construction interest union — deliberately loose; this layer feeds the R1 pixel pool.

---

## 3. The master creative system («Documento» system)

The visual thesis is already written: *"Import intelligence should read like a certified document, not a marketplace listing"* (`WINGS_VISUAL_THESIS.md` via brand system). The ad system applies it literally: **every Wings ad is composed as a document, not as an ad.**

**Layout grammar (all levels — brand, category, Mister):**
- Navy `#001E50` field. Warm white `#F8F6F0` text. Gold `#C4933F` ONLY on the CTA element and one meaning-carrying annotation (never decorative — brand rule).
- Header band: `WINGS GLOBAL TRADE` + a document reference in the label face (Teko): `WGT-2847 · ZOFRATACNA`, or `HS 8701 · TRACTORES`. Reference numbers carry weight (copy rule 6) — every ad carries one.
- Display line in NissanOpti (weight 400 only — it has no other), sentence case, periods.
- ALL numbers in Teko (the live mono/label face): HP, m³, kVA, tonnage, "24h". If it is a measurement, it is Teko — no exceptions (brand rule).
- One thin warm-white rule (1px) separating header from body — the AnimatedRule motif from the site.
- Product visual: owned photography (`public/Importacion/`, `public/Desktop Home/`, `assets/` masters) on navy, or the Technical Silhouette monoline treatment. **No stock photography ever** (brand system §8).
- Footer strip: tagline `Precisión. Proximidad. Confianza.` in Teko caps, small.
- Motion (Reels/video): instrument-like — line draws, staggered text clip-ups (the hero carousel's own 80ms stagger), count-ups on stats. 0.3–0.6s, standard ease, never spring (`src/lib/motion.ts` vocabulary). Blueprint Mode aesthetic (navy + 1px grid overlay + mono data callouts) is the hero treatment for video.

**Format masters:** 9:16 (Reels/Stories), 4:5 (feed), 1:1 (carousel cards), all derived from one composition. Safe zones: keep document header out of top 14% / bottom 20% on 9:16.

**Sound direction (Reels):** low room tone + mechanical foley (container latch, stamp, diesel start) — no music beds with vocals. The stamp/seal sound is the brand's sonic period: it closes every video.

---

## 4. The breakout decision rule (umbrella vs standalone category campaign)

A category LEAVES the umbrella and gets its own conversion campaign when ALL three hold:

1. **Inventory depth:** ≥ 8 real SKUs with owned imagery and complete spec tables (today: camiones ✓ 97 KAMA models; maquinaria-agricola ✓ 31 tractors + 4 application LPs; buses ✗ 3–4 SKUs; equipo-industrial ✗ 3 SKUs; repuestos ✗ lot-based, thin imagery).
2. **Demand signal:** the category's umbrella/R1 segment produced ≥ 8 leads in the trailing 30 days OR ops reports inbound demand (e.g., a KAMA container landing).
3. **Budget floor:** the category ad set can sustain ≥ US$25–30/day without starving another proven ad set — below that it can't exit Meta's learning phase on `Lead`.

A category RETURNS to the umbrella when CPL > 2.5× program average for 3 consecutive weeks or inventory drops below the depth bar.

**Launch state:** camiones + maquinaria-agricola broken out (03), buses/equipo-industrial/repuestos live inside the umbrella as rotating document-ads + R1 category retargeting only. Their full campaign kits in `03-category-campaigns/` are pre-built and activate when the rule triggers.

---

## 5. What success looks like

- Brand campaign is NOT judged on CPL. Judged on: cost per ThruPlay, R1 pool growth rate, and the delta in prospecting CTR/CPL for category campaigns (weeks 3+ vs weeks 1–2) — the umbrella exists to make everything else cheaper.
- Secondary: branded search impressions ("wings global trade", "wings tacna") in Search Console — the offline-to-online echo.
