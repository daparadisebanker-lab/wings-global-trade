# kama-serie-ex-em — DEFERRED

| sku | type | date | reason |
|---|---|---|---|
| kama-serie-ex-em | manual-mask-needed + evidence-unconfirmed + source-reliability | 2026-07-08 | Best KAMA-branded candidate (EM61b) fails extraction at the driver-side dual mirror arms after the one allowed re-extraction; EV nature not visually confirmable for any candidate; the KAMA made-in-china storefront mislabels brands. Deferred rather than ship a compromised hero for an explicitly "electric" SKU. |

## Full findings (founder review)

The EX/EM heavy-electric family has **no manufacturer-domain (kamaauto.cn / kamaqc.com) source** — every candidate is a `kamaqc.en.made-in-china.com` marketplace listing (registry class `supplier_provided`). Larger tier reachable via the `2f0j00`-prefixed CDN URL (~1000–1500px); the discovery-noted `3f2j00` prefix returns 100px thumbnails.

### Why deferred (three independent reasons)

1. **Thin-structure extraction failure (the spec trigger).** The strongest candidate, EM61b (a genuinely KAMA-branded single-cab flatbed, GVW 4495 kg — in the 3.5–8 t EX/EM class, 3/4 front), extracts cleanly on the body but **traps background (tree branches) in the open-air gaps around the driver-side dual west-coast mirror arms.** `remove_background` at native (1000px) and again at 2000px (the one permitted re-extraction) both left the mirror-gap background; it is connected to the truck, so keep-largest-component cannot remove it. Per C-HERO Step 5, persistent thin-structure failure after one re-extraction → defer (manual-mask-needed). **Structure needing a manual mask: driver-side dual mirror arms + the cab-to-mirror gaps.** See `intake/kama-serie-ex-em/cutout-reextract-mirrors-failed.png`.

2. **EV evidence not visually confirmable (evidence law).** The SKU is "KAMA EX/EM — Heavy ELECTRIC Truck." No ex-em candidate image shows positive EV evidence (no charge port, no HV cabling, no EV/BEV badging visible from the available 3/4-front angles). The electric claim would rest only on the marketplace listing title + spec match. For an explicitly-electric SKU, staging a truck whose electric nature cannot be verified risks a fabricated claim.

3. **Source reliability (the AMAX mislabel).** One listing titled "China Kama Ex1 Rhd Electric Truck" (product EmyrlLAPOZpv) actually shows an **AMAX**-branded truck ("仁顺/Renshun" on the roof deflector, AMAX grille emblem) — NOT a KAMA vehicle. The storefront's titles cannot be trusted blindly; each image needs its brand verified visually.

### Path to complete this SKU later
- Manual mask of EM61b's mirror arms (Photoshop/one-off), OR
- A manufacturer-domain (kamaauto.cn) EX/EM electric source with a cleaner mirror background, OR
- A side-profile EX/EM shot (mirrors against sky, no trapped-branch gap) that is verifiably KAMA-branded AND shows EV evidence.
