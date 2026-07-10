# RB/01 Áladín — Product spec data (PIM seed)

> Extracted 2026-07-10 from the SPSA (Supermercados Peruanos — Plaza Vea /
> Vivanda) codification workbooks, downloaded 11-Dec-2020 (user Claudia
> Palacios). Source files archived at
> `~/projects/aladin/assets/codificacion-spsa-2020/`.
> **Provenance note:** this is a real retailer codification — the brand was
> enriched into SPSA's PIM. Commercial proof usable in the shelf's trust
> layer. **Staleness note:** data is from Dec 2020 — costs are dead
> (internal reference only, never published) and dimensions must be
> re-confirmed against current production before the template goes
> `PUBLISHED`.

## Product 1 — Papel Higiénico de Bambú

| Field | Value |
|---|---|
| GTIN (unit = pack) | 0723707931803 (EAN-13) |
| Unit sold | Pack × 10 rollos, 30 m/rollo, 4 capas, individually wrapped |
| Sheet size | 103 × 102 mm |
| Roll weight | 160 g → pack 1.600 g |
| Pack dims | 513 × 104 × 215 mm *(workbook says 5130×1040×2150 — 10× data-entry error; corrected values consistent with 10 rolls ~103 mm Ø)* |
| **Master box** | **6 packs = 60 rollos** · GTIN master = unit GTIN |
| Box dims | 330 × 440 × 535 mm → **0,0777 m³** |
| Box weight | 9,7 kg *(matches the stated ~10 kg)* |
| Pallet (SPSA CD) | 5 cajas/camada × 5 camadas = **25 cajas/pallet** *(Muaaz stated ≤15 — different pallet spec; reconcile at ops)* |
| Reg. sanitario | **No requiere** (per SPSA validation, 2020) |
| Origin | China (CN) · Importado |
| Cost (Dec 2020) | S/ 16,77/pack — STALE, internal only |
| Web copy (ES) | «Papel higiénico ecológico de bambú, pack ×10 rollos de 4 capas y 30 metros.» 100% fibras vírgenes de bambú, sin químicos ni lejía, hoja simple, vida útil ilimitada |

## Product 2 — Papel Facial de Bambú

| Field | Value |
|---|---|
| GTIN (unit) | 0723707931797 (EAN-13) |
| Unit sold | Empaque de 390 hojas ultra suaves, 3 capas |
| Unit dims / weight | 70 × 95 × 175 mm · 190 g |
| **Master box** | **9 packs × 5 empaques = 45 unidades** · GTIN master = unit GTIN |
| Box dims | 360 × 295 × 555 mm → **0,0590 m³** |
| Box weight | 9,7 kg |
| Pallet (SPSA CD) | 8 cajas/camada × 5 camadas = **40 cajas/pallet** |
| Reg. sanitario | **No requiere** (per SPSA validation, 2020) |
| Origin | China (CN) · Importado |
| Cost (Dec 2020) | S/ 23,85 — STALE, internal only |
| Web copy (ES) | «Papel Facial de bambú» — fragancia natural, no irrita ni raspa la piel, producto ecológico |

## Draft `rb_packing_profiles`

```
papel-higienico-bambu:  package_kind='box' · units_per_package=60 (rollos)
                        package_cbm=0.0777 · package_kg=9.70 · stackable=true
papel-facial-bambu:     package_kind='box' · units_per_package=45 (empaques 390 hojas)
                        package_cbm=0.0590 · package_kg=9.70 · stackable=true
```

## Packing study — RESOLVED 2026-07-10 («40HC is the way»)

Best single-orientation axis-aligned grid against ISO interior dims
(40GP 12.032×2.352×2.393 · 40HC 12.032×2.352×2.698), floor-loaded:

| Producto | 40GP | 40HC |
|---|---|---|
| Higiénico (330×440×535) | 770 (22×7×5, 88,3 % vol, 7,5 t) | **945** (27×7×5, 96,1 % vol, 9,2 t) |
| Facial (360×295×555) | 1.056 (33×4×8, 91,9 % vol, 10,2 t) | **1.188** (33×4×9, 91,7 % vol, 11,5 t) |

Weight is never the bound (max load ≈40 % of payload — both products cube
out). The stated «1.000 cajas/40 ft» was a 40HC figure (945 computed; mixed
stuffing ≈970). **Ruling: higiénico template = 40HC, 10 cupos × 94 = 940
commercial + 5 holgura.** Facial on 40HC drafts at 10 × 118 = 1.180 (not
yet ratified). Assumes free stacking orientation and 2020 box dims — the
server-side packing math (SPEC §3.2) computes from `package_cbm` and always
overrides display figures. Visual study: container-loading display artifact
(claude.ai/code/artifact/7873679f-69ab-4e2c-a1e3-0a50553d3479).
