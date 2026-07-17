# ZOFRATACNA — fiscal treatment of RB/01 cupo sales from the Tacna warehouse

> Researched 2026-07-16 (web sources below). This answers GTM-CAMPAIGN §12
> gate 2-bis at the framework level; the per-line numbers (tariff rate,
> percepción) need one session with the agencia de aduana before prices
> publish. **Nothing here changes the EXW-Tacna ruling — it changes what
> the published number must contain.**

---

## 1 · The regime, in five facts

1. **Inside the zone: suspended.** Goods entering ZOFRATACNA are not
   nationalized; import duties and taxes are suspended while stored there.
   Zone users enjoy exoneration of IR/IGV/ISC/IPM for authorized activities
   *within* the zone (storage, distribution, maquila, industry).
2. **Exit to the rest of Peru = an importation.** Merchandise **not
   manufactured in the zone** (our case — Chinese-made paper, stored) that
   leaves toward the resto del territorio nacional pays **all import
   taxes**: ad valorem + IGV + IPM (+ISC where applicable), via a customs
   declaration. This is the governing fact for the cupo model.
3. **The famous Tacna exemption is not ours.** The IGV/ISC-exempt sales of
   the Zona Comercial de Tacna apply only to natural persons (tourist
   regime) buying within the commercial zone, under franchise limits.
   Wholesale cupos to Lima/Arequipa get nothing from it.
4. **Rates.** IGV 16% + IPM 2% = **18% combined**. Ad valorem bands in Peru:
   0/4/6/11% — the 4818.10 (papel higiénico) line is **probably 6%, to be
   confirmed**. The **TLC Perú–China** can reduce it (possibly to 0% by now —
   tariff elimination runs since 2010, up to 17 years for sensitive lines)
   **only with a certificate of origin from the Chinese mill**. The SUNAT
   aduanet per-line lookup was unreachable from this session — confirm the
   subpartida treatment with the agencia.
5. **Percepción del IGV** applies to imports (typically 3.5% general, 10%
   first-time importer — cash-flow, creditable later). Confirm rate and
   applicability to zone exits.

## 2 · Two possible sale structures

| | **A — Áladín nationalizes (recommended)** | B — buyer nationalizes (ZOFRI-style) |
|---|---|---|
| What happens | We file the DAM at exit, pay arancel + IGV/IPM (IGV becomes crédito fiscal), sell nationalized goods with factura | Sale occurs in-zone; buyer is importer of record for his cupo, pays his own import taxes |
| Buyer friction | None — normal factura con IGV | Each buyer needs customs handling per exit; only sophisticated mayoristas accept |
| Fits | S1 chains (require factura) + all of S2 | A possible advanced tier later, never launch |
| Cupo price meaning | Precio nacionalizado, es-standard invoice | Precio in-zone «sin impuestos» — looks lower, isn't simpler |

Structure A keeps the campaign's «precio de importador» promise honest — the
buyer gets import economics *without becoming an importer*. Structure B is
the literal version and it reintroduces exactly the friction the cupo
exists to remove.

## 3 · The trap the workbook cannot see: the basis of «S/ 16»

The workbook's 30–50% margins are only real once the tax basis of the
S/ 16 cost is pinned. Retail S/ 30 is a consumer price → **con IGV** by
nature → S/ 25.42 sin IGV. Three readings of the cost:

| If S/ 16 is… | Comparable cost (sin IGV) | Real spread (sin IGV) |
|---|---|---|
| Nationalized, sin IGV, arancel included | 16.00 | **9.42** |
| In-zone, pre-tax (arancel 6% still due at exit) | ~16.96 | **8.46** |
| Nationalized, con IGV | 13.56 | **11.86** |

The apparent S/ 14 spread only exists in the third reading. In the first
two, a «40% markup» priced con IGV yields a true margin of roughly 12–19%
on cost — half of what the sheet shows. **This single question moves more
money than every ladder percentage combined.** Until it's answered, do not
publish prices.

## 4 · Questions for the agencia de aduana / contador (one session)

1. Subpartida 4818.10.00.00: confirmed ad valorem, TLC-China category and
   current preferential rate; can the mill issue the certificate of origin?
   (Facial line 4818.20 too.)
2. Percepción applicable to our exits (3.5% vs 10%) and importer registration
   status.
3. **The basis of S/ 16 / S/ 14** — which row of §3's table is true.
4. Does any in-zone activity (final packing/maquila) change the exit
   treatment? (Zone-manufactured goods exit at 0% ad valorem — probably out
   of reach for repacking, but worth the question.)
5. If a buyer ever nationalizes his own cupo (Structure B): DAM per cupo vs
   consolidated — same open question as shared-container spec §7.1.

## 5 · Consequences already applied

- Workbook INPUTS fiscal note updated to point here; margins remain stated
  on a consistent-basis assumption until §4-Q3 is answered.
- GTM-CAMPAIGN §12 gate 2-bis now resolves through this file.
- The «precio de importador» claim survives all readings — what changes is
  our margin, not the buyer's story.

## Sources

- [SUNAT — Informe N° 015-2006-SUNAT/2B0000](https://www.sunat.gob.pe/legislacion/oficios/2006/oficios/i0152006.htm) (exit-to-national-territory treatment)
- [ZOFRATACNA — régimen y beneficios](https://www.zofratacna.com.pe/contenido.aspx?id=01000000443DCB88EC2C103A38D04EE2114E1731AF40744E373EEFA5)
- [CMS Law — Modifican Ley de Zona Franca y Zona Comercial de Tacna](https://cms.law/es/per/publication/modifican-ley-de-zona-franca-y-zona-comercial-de-tacna) · [Modifican beneficios y exoneraciones](https://cms.law/es/per/publication/modifican-beneficios-y-exoneraciones-tributarias-otorgadas-a-usuarios-de-zofratacna)
- [MINCETUR — TLC Perú–China, categorías de desgravación](http://www.acuerdoscomerciales.gob.pe/en_vigencia/china/Documentos/docs/Cat._de_desgravacin_China.pdf) · [beneficios](http://www.acuerdoscomerciales.gob.pe/en_vigencia/china/Beneficios.html)
- [FAM Logistics — Importar de China a Perú: impuestos 2025](https://famlc.com/importar-de-china-a-peru-impuestos-aranceles-y-costos-aduaneros-2025/) (bandas 0/4/6/11%, IGV/IPM)
- [SUNAT — Arancel de Aduanas](https://www.sunat.gob.pe/orientacionaduanera/aranceles/Aranceles.html) (per-line confirmation pending — aduanet lookup unreachable)
