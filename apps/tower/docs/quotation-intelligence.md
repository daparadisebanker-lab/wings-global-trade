# Quotation Intelligence — issuer resolution & the document variable model

> Status: **layer shipped for the proforma path** (`issuers.ts` + wired into
> `actions/proforma.ts` + renderer). UI surfacing and persistence are **proposed**
> (last section). Written from the first live Chilean proforma (PF-WGT-2026-0723).

## 1. The problem this solves

Before this work the entire quotation/proforma stack was hardwired to **one
issuing entity** — Wings Global Trade S.A.C. (Perú, RUC, IGV 18 %, Callao/Lima).
Issuer, exporter party, banking, ports and term defaults were **hardcoded
TypeScript constants**; only the buyer/importer was data-derived. There was no
concept of *which company issues a document*, no destination, no market.

Building the Chilean proforma by hand surfaced the real rule:

> **The issuing legal entity — and every value it prints (legal name, tax id,
> address, phone, email, banking, default ports, incoterm, tax posture, document
> language, footer policy) — is a deterministic function of the DESTINATION the
> goods are quoted to.**

Callao/Perú → Wings Global Trade S.A.C. (PE). Iquique/Chile — the ZOFRI free‑zone
route that serves Bolivian buyers — → **Import‑Export Shining Star Ltda (CL)**.

## 2. What shipped (code)

| File | Change |
|------|--------|
| `src/lib/quotation/issuers.ts` | **New.** `IssuerEntity` type; the two entities' saved data (`WINGS_PE`, `SHINING_STAR_CL`); `ISSUER_REGISTRY`; `resolveIssuer(destination)`; `issuerById`; `withEntityProformaTerms`; `hasBankingDetails`. |
| `src/lib/quotation/issuers.test.ts` | **New.** 11 tests — destination routing, id lookup, entity invariants, entity-aware term merge. |
| `src/lib/actions/proforma.ts` | Resolves the entity from `terms.portOfDestination` (else buyer country) and sources exporter / issuer / banking / terms / incoterm / issue-city / tax posture / locale from it. Default path is byte-for-byte unchanged. |
| `src/lib/quotation/proforma.ts` | `ProformaDocument` gains optional `issuerId` + `locale` (traceability). |
| `components/pipeline/proforma-document/ProformaDocument.tsx` | Hides the "Datos bancarios" section when the entity has no bank block. |

**Backward compatibility:** `WINGS_PE` is *composed from* the existing
`WINGS_ISSUER` / `WINGS_EXPORTER` / `DEFAULT_BANKING` / `DEFAULT_PROFORMA_TERMS`
constants, and it is `DEFAULT_ISSUER`. Any quote that does not resolve to a
specific entity renders exactly as before. New entities are added to the
registry, never by forking document code (the "one box, many liveries" law).

### Resolution precedence (design)
1. **Explicit** `quotes.issuer_id` (once persisted) → `issuerById()`. *Always wins.*
2. **Destination** → `resolveIssuer({ port, country })` (shipped).
3. **Default** → `WINGS_PE`.

### Tax posture rule
The default entity keeps the stored `tax_label`/`tax_bps` (today's IGV 18 %). A
*specifically matched* entity imposes its own posture — so a Chilean export
prints **no IGV line** (`taxBps: 0`, FOB) without the operator touching the tax
field. This is the one place the entity overrides stored columns; it is
commented at the seam.

## 3. The document variable model (the "other elements")

Every edit made while building the live proforma maps to a variable. Grouped by
**where the value comes from** — which is exactly how TOWER should source them:

### A · Entity-resolved (by destination — the intelligence layer)
| Variable | PE (Wings) | CL (Shining Star) |
|---|---|---|
| Legal name / party | WINGS GLOBAL TRADE S.A.C. | IMPORT‑EXPORT SHINING STAR LIMITADA |
| Tax id + label | RUC 20601234567 | RUT 76029544‑2 |
| Address / city | Panamericana Sur / Tacna, Perú | Pasaje Cuatro 2213, Cond. Oasis / Iquique, Chile |
| Entity phone | +507 6025‑07 | +56 937305608 |
| Email | comercial@… | importaciones@… |
| Banking block | BCP account shown | **omitted** |
| Default ports | Shanghai → Callao | Qingdao → Iquique |
| Default incoterm | CIF ‑ Callao | FOB |
| Tax posture | IGV 18 % | FOB / none |
| Default issue city | Lima | Iquique |
| Document locale | ES + EN | **ES only** |
| Footer shows address | yes | no |
| Doc series prefix | WGT | WGT (shared) |

### B · Quote-stored (per document; jsonb on `tower.quotes`)
Buyer/importer party (company, tax id, contact, address, country) · line items
(description, qty, unit price → amount) · non‑product lines (freight, frame) ·
term overrides (payment, delivery, validity, incoterm) · observations · issue
city override · currency · validity dates · doc number.

### C · Rep-resolved (`tower.rep_profiles`, per `created_by`)
"Atendido por" name + title · **signature** (vectorized SVG) · rep WhatsApp.
(Footer *general* number stays the entity's, not the rep's — a distinction we
made explicit on the live doc.)

### D · Presentation policy (entity default, per-doc override)
Locale (ES / ES+EN) · banking shown/hidden · footer address shown/hidden ·
tail anchored to bottom padding · page budget.

## 4. TOWER UI/UX assessment

**Current state.** Quotes are born from Mister (`saveMisterQuoteDraft`) or the
pipeline, then optionally edited via `saveQuotationDetails` — whose Zod schema
accepts only `billTo`, `taxLabel`, `taxBps`, `terms`, `observations`. There is
**no issuer selector, no destination field, no market, no banking/locale toggle**
anywhere. The document pages are pure renders.

**Gaps vs the variable model.** The whole of group A (entity) and most of group D
(policy) are invisible to the operator and un-persisted. Destination — the single
input that drives group A — is captured only on the public marketing
`QuotationForm` (`apps/site`) as a country string, and is thrown away.

**Recommendations (in priority order):**

1. **Surface the resolved issuer, don't hide it.** On the quote editor and in
   `QuotationsWindow`, show an **Issuer chip** ("Emite: Shining Star · CL") next
   to each quote, derived by the same `resolveIssuer`. The operator must see
   which entity a document will go out as *before* issuing.
2. **Add a Destination field** (port + country) to the quote editor and the
   `saveQuotationDetails` schema. It already exists conceptually in
   `terms.portOfDestination`; make it a first-class, validated field with a
   port/free‑zone picker (Callao, Iquique/ZOFRI, Antofagasta, Arica…). This is
   the primary driver of entity resolution.
3. **Issuer override.** Default to the destination-resolved entity but allow a
   manual override (the `issuer_id` precedence above) for edge cases — a
   dropdown seeded from `ISSUER_REGISTRY`, disabled-by-default with an "override"
   affordance so the auto path stays the norm.
4. **Entity-driven defaults auto-fill, editable.** When the entity resolves,
   auto-populate ports, incoterm, payment terms, tax posture, locale and banking
   visibility from its defaults (already implemented server-side); expose them as
   pre-filled, overridable fields rather than silent constants.
5. **Locale toggle** (ES / ES+EN) — entity default, per-doc override. Requires
   the renderer to honor `doc.locale` (today it is bilingual-hardcoded; the field
   is already threaded through the model).
6. **Banking + footer-address toggles** — entity default, per-doc override. The
   banking toggle is already honored by the renderer (`hasBankingDetails`).
7. **Entity admin.** A small settings surface to edit an entity's saved data
   (address, phone, banking, ports) once it lives in the DB (§5) — a "contact
   change is a one-line edit" without a deploy.

## 5. Persistence proposal (not yet applied — migration only, never manual prod SQL)

`issuers.ts` is the seed of record today. To make entities data-driven and let a
document remember which entity issued it, add (via a `supabase/migrations/` file,
reviewed and applied through the normal flow):

```sql
-- tower.issuing_entities — the group's legal issuing companies (append-only id)
create table tower.issuing_entities (
  id            text primary key,              -- 'wgt-pe', 'shining-star-cl'
  key           text unique not null,          -- 'WGT-PE', 'SHINING-CL'
  country       text not null,                 -- ISO-3166 alpha-2
  tax_id_label  text not null,                 -- 'RUC' | 'RUT' | 'NIT' …
  doc_prefix    text not null default 'WGT',
  issuer        jsonb not null,                -- CompanyInfo (header/footer)
  exporter      jsonb not null,                -- TradeParty
  banking       jsonb,                         -- BankingDetails | null (null → hidden)
  terms         jsonb not null,                -- ProformaTerms defaults
  default_incoterm text not null,
  tax_label     text not null,
  tax_bps       int  not null default 0 check (tax_bps between 0 and 10000),
  default_issue_city text not null,
  locale        text not null default 'es' check (locale in ('es','es-en')),
  footer_shows_address boolean not null default true,
  serves        jsonb not null default '{"countries":[],"ports":[]}',
  created_at    timestamptz not null default now()
);

-- Link a document to the entity that issued it (explicit override wins over resolution)
alter table tower.quotes
  add column if not exists issuer_id text references tower.issuing_entities(id),
  add column if not exists locale    text;   -- per-doc locale override
```

Then `actions/proforma.ts` becomes: `issuerById(row.issuer_id) ?? resolveIssuer(signal)`,
reading entity rows from the table instead of the in-code registry (the registry
stays as the seed + typed fallback). `mint_quote_no` / the `WGT` doc-series should
read `doc_prefix` if per-entity numbering is ever wanted (today it is shared).

## 6. Not done here (explicit)
- The quote/cotización action (`quotation.ts`) and RB container action still use
  the single `WINGS_ISSUER`. The same `resolveIssuer` seam applies; wiring is
  mechanical and mirrors `proforma.ts`.
- Renderer locale switching (ES-only) is modelled (`doc.locale`) but not yet
  implemented in `ProformaDocument.tsx` (still bilingual).
- No UI was built — this document specifies it.
