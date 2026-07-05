# Meta Campaign Structure — Wings Global Trade

Budget placeholder: `{{MONTHLY_BUDGET}}` (US$/mo). Percentages below are launch splits; the weekly cadence in `01-foundation/measurement-plan.md` §3 reallocates them.
**Minimum viable program:** ~US$2,000/mo. Below that, run only C3 (Mister) + C4 (retargeting) + B2 statics in C1 — comment inline.

---

## Campaign tree

```
BM: Wings Global Trade  ·  Pixel/CAPI per measurement-plan §0  ·  Ad account TZ: America/Lima, USD

C1 — WGT_Brand_Umbrella ................................. 10% {{MONTHLY_BUDGET}}
  Objective: Awareness (video views + reach)
  └─ AS 1.1  PE_Broad_25-60_MachineryUnion
       Audiences: interest union (agro+trucks+construction+industry), Advantage+ ON
       Ads: B1 «Desde dentro» 30s/15s · B3 «97/05/02/24» loop
            B2a/B2b/B2c «Ficha de operación» statics
            BU1-3 / IN1-3 / RP1 rotate here (umbrella residents, 1-2 live at a time)
            B4 manifesto = test cell, 10% of AS budget

C2 — WGT_Categorias_Leads ............................... 45%
  Objective: Leads (website), optimization: Lead (CAPI, deduped)
  ├─ AS 2.1  Agro_A1_UseCases ................ 15%
  │    Geo: Piura/Lambayeque/LaLibertad/SanMartín/Ica/Junín + national
  │    Ads: AG1 arrozal · AG1b frutales · AG1c surco · AG1d ganadería
  │         + AG4 trust bridge + AG5 reseller (~20% share)
  ├─ AS 2.2  Agro_A2_Agroindustria ........... 8%
  │    Page-admin + agroindustry interests, Lima/Ica/LaLibertad
  │    Ads: AG2 spec carousel · AG3 cosechadora
  ├─ AS 2.3  Camiones_A1_Transportistas ...... 15%
  │    Freight-corridor geo; Ads: CM1 «97 modelos» · CM4 duty-education
  └─ AS 2.4  Camiones_A2_MineriaObra ......... 7%
       Mining depts; Ads: CM2 volquete · CM3 cadena de frío (micro-share)
  [Buses/Industrial/Repuestos ad sets: PRE-BUILT, PAUSED — activate per breakout
   rule (02-brand-campaign/strategy.md §4) using their category kits]

C3 — WGT_Mister ........................................ 25%
  Objective: Leads, optimization: mister_prequal_reached → migrate to Lead at ≥50/wk
  ├─ AS 3.1  Mister_A1_Confianza_PE .......... 15%
  │    Ads: MS1 «Las preguntas» · MS2 «No puede cotizarte» · MS6 (test 10%)
  ├─ AS 3.2  Mister_A3_Corredor_PE ........... 5%
  │    Comercio internacional/Logística/Aduana; Lima+Tacna
  │    Ads: MS3 static + carousel
  └─ AS 3.3  Mister_A3_Corredor_XBORDER ...... 5%   ← geo test cell
       Bolivia (Santa Cruz, La Paz, El Alto, Cochabamba) + Chile (Arica, Iquique,
       Antofagasta); Ads: MS3. Decision gate week 8: CPL ≤ 1.5× Peru or cut.

C4 — WGT_Retargeting ................................... 20%
  Objective: Leads (R1/R2) · Engagement→CTWA (R3, requires WABA on +50760250735)
  ├─ AS 4.1  R1_SiteVisitors_30d_byCategory .. 8%
  │    Dynamic category split; Ads: CM5 KAMA carousel · AG2 · RP3 cross-sell
  ├─ AS 4.2  R2_MisterAbandoners_30d ......... 7%
  │    mister_open ∧ ¬prequal ∧ ¬Lead; Ads: MS4 «Retoma donde la dejaste»
  └─ AS 4.3  R3_WhatsApp_NonClosers_14d ...... 5%
       wa_click ∧ ¬Lead − ops suppression list; Ads: MS5 CTWA
  Global exclusions: Lead 90d, ops closed list, employees.
```

---

## Naming convention

`WGT_{level}_{cell}_{geo}` for ad sets; ads: `{concept-id}_{format}_{variant}` (e.g. `AG1_reel_916_arrozal`). Concept IDs are defined in the creative-briefs files — they are the join key between Ads Manager, the asset queue, and the decisions log.

## Learning-phase economics (why the tree is this shape)

Meta wants ~50 optimization events/ad set/week. At B2B CPLs no ad set below ~US$25–30/day can realistically exit learning on `Lead` — hence: few ad sets, broad audiences, creative doing the segmentation (foundation doc §0), and `mister_prequal_reached` (a higher-frequency event) as C3's launch optimization target.

## Kill / scale triggers (operational, from measurement plan §3)

| Trigger | Action |
|---|---|
| Ad: spend ≥ 1.5× target CPL with 0 leads, ≥2,000 impr | Pause ad |
| Ad: CPL > 2× target over 7d | Pause, replace from asset queue |
| Ad set: CPL ≤ 0.8× target 7 consecutive days | +20% budget (single step, then re-observe) |
| Ad set: frequency > 3.5 (retargeting > 5) | Rotate creative from queue |
| Mister ad: >60% of its sessions resolve `unresolved` archetype | Hook attracts curiosity, not intent — kill |
| XBORDER cell: week-8 CPL > 1.5× Peru | Cut cell, fold budget into AS 3.1 |
| Category (umbrella resident): ≥8 leads/30d + inventory bar met + budget floor | Activate its paused ad set (breakout rule) |
| Broken-out category: CPL > 2.5× program avg 3 consecutive weeks | Demote to umbrella |

## Launch checklist (sequential)

1. Workstream 0 instrumentation verified (Events Manager test events green).
2. Business assets: FB page + IG + domain verified + WABA status on +50760250735 confirmed (blocks AS 4.3 only).
3. Upload launch-wave assets (P0 batch, asset-production-queue.md).
4. Enable C2 + C3 (day 1) → C4 shells (day 1, they fill as traffic arrives) → C1 (day 7, after conversion signal exists).
5. First decisions log entry + weekly Monday cadence begins.
