# DEFERRED — catalog image pipeline

Append-only log. A source that cannot ship *yet* but is not rejected on merit
lands here (rights not cleared, SKU not confirmed, awaiting a better source).
Never edit or delete a row — supersede it with a new one. Move a cleared item
into the pipeline; a killed-on-merit item goes to `REJECTED.md` instead.

| type | url/file | sku | reason | date |
|---|---|---|---|---|
| source-quality | kamaqc.en.made-in-china.com dumper listings + kamaqc.com domestic pages (see outputs/kama-serie-gm/deferred-row.md) | kama-serie-gm | No ratified-domain source clears both the ~1200px floor AND level long-lens perspective; the one hi-res candidate fails G3 (rear-axle float from short-lens 3/4). Content exists and is rights-cleared — needs a long-lens ≥1200px source, likely supplier press kit. | 2026-07-08 |
| sku-mismatch | cnkama "HM6" + kamaqc heavy-dump listings (see outputs/kama-gm67e/deferred-row.md) | kama-gm67e | Exact-unit SKU; no public source uses "GM67E" (supplier-internal code) and nearest candidate mismatches engine (D40TCIF1 vs Yunnei YNF40E1) + GVW. Reconcile via the supplier spec-sheet that fed the DB row. | 2026-07-08 |
| manual-mask-needed | kamaqc.en.made-in-china.com M37A listing (see outputs/kama-serie-m3/deferred-row.md) | kama-serie-m3 | Extraction unfixable (foliage on both mirror arms, lamp pole, matting smudges) AND unit has foam-wrapped mirrors — not catalog-ready condition. Staged output withdrawn. Retry with a studio-white M3 frame. | 2026-07-08 |
| sku-mismatch + manual-mask-needed | kamaqc K67 listing + kamaauto.cn K6 single-cab (see outputs/kama-serie-k/deferred-row.md) | kama-serie-k | K67 frame has a worker fused into the front-left silhouette (manual mask); the clean K6 alternative is a van-derived microtruck whose GVW/class can't be verified against Serie K 4.3–6.3t. Founder may ratify K6 as family rep, or source a clean K67. | 2026-07-08 |
| sku-mismatch / no-exact-source | (none — no source names M36F) | kama-m36f | Exact-unit SKU; no source anywhere names M36F. Family siblings (M37A / generic M36) would be a fabricated model claim. Blocked pending an M36F-specific listing on a registry domain. | 2026-07-08 |
| manual-mask-needed + evidence-unconfirmed | kamaqc.en.made-in-china.com EM61b + EX/EM listings (see outputs/kama-serie-ex-em/deferred-row.md) | kama-serie-ex-em | Best KAMA-branded candidate traps background in mirror-arm gaps after the one allowed re-extraction; no candidate shows positive EV evidence for an explicitly-electric SKU; storefront mislabels brands (one "Kama Ex1" listing shows an AMAX truck). | 2026-07-08 |
