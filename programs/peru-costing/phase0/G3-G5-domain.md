# Phase-0 Domain Memo — G5 (rate source of truth) · G3 (stowage simulator)

> TOWER Wave 6 — Peru Costing. Decision memo for Muaaz. Grounded in the live
> `wings-operations` source (cloned) and the TOWER schema. Written 2026-07-20.
> Recommendations only — not law until sign-off (`SPEC.md §8`).

---

## G5 · Rate source of truth

**Gate.** Today every SUNAT rate and the exchange rate is a free-text per-operation
input. Which of these are regulatory constants that belong in a versioned config,
and which are genuinely per-operation? And is Ad Valorem entered per product or
driven by an HS-code table?

**Real SUNAT context (what the rates actually are).**
- **IGV importación = 18%** — 16% IGV + 2% IPM (Impuesto de Promoción Municipal). A
  single legislated constant, changes by law, not per deal. Engine default `0.18`
  (`calculations.ts:170` DEFAULT_INPUTS `igvRate: 0.18`).
- **Percepción = 3.5%** typical (SUNAT sets 3.5% / 5% / 10% by importer/goods class;
  3.5% is the ordinary case). Regulatory, low-cardinality. Engine `0.035`
  (`calculations.ts:171`).
- **Insurance = 1.5%** presumptive when incoterm is not CIF (`calculations.ts:61`
  `insRate.times(cifBase)`). A house/underwriting rate, not a per-deal negotiable.
  Engine `0.015` (`calculations.ts:172`).
- **ISC** — already *derived*, not entered: `deriveISCRate` (`calculations.ts:11-15`)
  reads `fuelType`/`engineCC` (hybrid/diesel → 0; ≤1400cc → 5%; >1400cc → 7.5%).
  Those inputs are product-spec fields, so ISC is a rate *table keyed on specs*, not
  an operator number.
- **Ad Valorem** — per **HS code** in Peru: 0% / 6% / 11% tiers by tariff line
  (`calculations.ts:65` `adVal.times(cif)`, default `0`). This is the one rate that
  legitimately varies product-to-product — but by HS code, not by operator whim.
- **Exchange rate (TC)** — genuinely per-operation market data; changes daily and is
  the value the deal is actually struck at. Engine `3.70` (`calculations.ts:173`).

**Options.**
- **A — keep all rates per-op (status quo).** Max flexibility, zero new tables. But
  no source of truth: two operators enter 18% and 18.5% and both cost sheets look
  valid. Violates the "no magic numbers" rule TOWER inherits (`SPEC.md §2.3`).
- **B — versioned config for IGV/percepción/insurance/ISC; TC + Ad Valorem per-op.**
  Regulatory constants live in `costing_config` (already drafted, `SPEC.md §4`:
  `igv_bps 1800`, `percepcion_bps 350`, `insurance_bps 150`, `isc_threshold_cc 1400`,
  `isc_low_bps 500`, `isc_high_bps 750`, `effective_from`, versioned). TC stays a
  per-op input (`exchange_rate_milli`, `SPEC.md §4`). Ad Valorem stays per-product
  entry.
- **C — B plus an HS→Ad Valorem lookup.** Products already carry `hs_code`
  (`DATABASE_SCHEMA.sql:77`) and `cbm_per_unit` (`:78`). A small seeded
  `ad_valorem_by_hs` table (or per-HS rate on the arancel) supplies the default; the
  cost sheet reads the product's `hs_code` and pre-fills 0/6/11, with a per-op
  override kept for the exceptions.

**Trade-offs.** B/C add config plumbing and a "which version applied?" concept — but
`cost_calculations.config_version` (`SPEC.md §4`) is already in the draft schema, so
the cost of provenance is nearly paid. None of this is a SUNAT *feed*: rates are
hand-seeded and hand-versioned; a live integration stays out of scope until there is
a reason to build it. Percepción's 3.5/5/10 classes and Ad Valorem exceptions still
need a per-op override so the config never blocks an unusual deal.

**Recommendation — C.** Move IGV, percepción, insurance, and the ISC thresholds into
versioned `costing_config` (bps, `effective_from`, per `brand_id`); keep **TC
per-operation** (market data, not a rate); drive **Ad Valorem from a seeded HS→rate
table** keyed on `products.hs_code`, defaulting the 0/6/11 tier with a **per-op
override** retained for edge cases. No SUNAT feed now — the config table *is* the
"feed," updated by hand and versioned, and `config_version` on every saved sheet
records exactly which numbers priced it. Parity is unaffected: the engine still takes
explicit bps + TC inputs, so `fixtures.json` stays the regression gate.

**Ops/Muaaz confirm (one sentence):** Confirm IGV 18% / percepción 3.5% / insurance
1.5% / ISC 5%–7.5%@1400cc are stable house constants safe to version centrally (with
a per-op override), and that Ad Valorem should default from each product's HS code.

---

## G3 · Stowage simulator — still needed?

**Gate.** Is `simularContenedor` a live operational need TOWER cannot answer, or is
it outside TOWER's declared CBM-commitment scope?

**What each side actually models.**
- **wings-operations** (`container.ts:104-205`) answers a *physical* question: given a
  unit's L×W×H and weight and category (moto/atv/auto/maquinaria/genérica), how many
  fit a `20ST/40ST/40HC/OT20/FR40` — by door fit, floor packing with rotation
  (`calcPiso`, `:141`), stacking levels (`:151-154`), volume with a maniobra/amarre
  discount (`:156-158`), container weight max, and the **Callao MTC 32.5t road limit**
  (`LIMITE_TERRESTRE_PE_KG = 32500`, `:75`, `:161`), returning the binding
  `factor_limitante` (volumen/peso/piso/restricción_portuaria, `:178-182`).
- **TOWER** (`containers-logic.ts:20-42`) answers a *booking* question: it sums
  committed CBM (`sumCommittedCbm`) against a **manually entered** `capacity_cbm`
  (`DATABASE_SCHEMA.sql:178`, `numeric not null`) and renders fill %
  (`computeFillPercent`). CBM is taken as a given input on each commitment
  (`commitments.cbm`, `:192`); TOWER never derives a unit count from geometry, weight,
  or a road limit. `kind` is a label (`20GP/40GP/40HC/REEFER`, `:177`), not a solved
  geometry.

So the two do **not** overlap: TOWER consumes CBM; the sim *produces* it. TOWER
genuinely cannot answer "how many of this machine fit in a 40HC?" — and for a
vehicle/heavy-machinery importer (DEFAULT_INPUTS is a Toyota with `fuelType`/
`engineCC`, `calculations.ts:154-158`) the naive `capacity_cbm ÷ cbm_per_unit`
division would be **wrong the moment weight or the 32.5t Callao limit binds before
volume** — exactly the case the sim exists to catch.

**Options.** (A) Descope entirely — retire the sim with wings-operations; ops sizes
loads by hand/CBM. (B) Port in a blocking wave — build the geometry table + packing
into the Container Desk now. (C) Port lean, gated (`SPEC.md §3E/6.6`) — build only on
ops confirmation, feeding `cbm_per_unit`/`capacity_cbm` and the FillMeter.

**Trade-offs.** Descoping is cheapest and keeps decommission unblocked *if* the sim
isn't part of any real workflow — but it silently drops the Callao road-limit check,
which is a real binding constraint no other TOWER surface reproduces. Porting now is a
non-trivial build (geometry table, category configs, rotation/stacking) for a
capability nothing downstream consumes today, so it should not gate the engine port
(A–D), which is the actual decommission blocker.

**Recommendation — C, defaulting to keep-but-descoped-from-the-blocking-set.** It is a
real, non-duplicated capability, so do not delete the logic — but no TOWER workflow
reads it yet, so it must **not** block the decommission wave. Port it in **6.6 only if
ops confirms live use**, where it becomes a container-detail calculator that outputs
`cbm_per_unit` and a suggested `capacity_cbm` into the existing commitment/FillMeter
model (turning a physical answer into TOWER's CBM currency). If ops does not use it,
descope explicitly and retire it with the source app.

**Ops/Muaaz confirm (one sentence):** Do you today use wings-operations to answer "how
many units fit in a 40HC (and does weight or the Callao 32.5t limit bind first)?" as
an input to how you quote or plan a container — yes ports it in 6.6, no descopes it.
