-- TOWER · tower_56 — issuing_entities. The group's legal ISSUING COMPANIES and the
-- per-document identity they print (legal name, tax id RUC/RUT, address, banking,
-- ports-as-text, tax posture, locale, footer policy). This is a DIFFERENT axis from
-- tower.org_rules (tower_51): org_rules = per-BRAND commercial policy (margin,
-- incoterm, validity, approval matrix); issuing_entities = per-LEGAL-ENTITY document
-- identity. Wings Global Trade S.A.C. (PE) and Import-Export Shining Star Ltda (CL)
-- are two entities that can both serve one brand's imports; which one issues is a
-- function of the destination (resolveIssuer) or an explicit quotes.issuer_id.
--
-- Shape: uuid PK + a stable text `code` (the app slug 'wgt-pe' / 'shining-star-cl'),
-- the house idiom (lanes/represented_brands) — the shared audit_trigger casts the
-- row id to uuid, so a text PK would break it. `quotes.issuer_id` references the
-- unique `code`, which is exactly the value the TS registry (issuers.ts) uses as its
-- entity id. The runtime source of truth for resolution stays that typed registry
-- (issuerById/resolveIssuer); this table persists the same data for the FK + future
-- admin editing — keep the two in sync when either moves.
--
-- Group-level config (not brand-scoped): read by any authenticated member, written
-- by group admins only. Retire, never delete (Directive 4 → retired_at, no delete
-- policy). Money posture is basis points (Directive 3).
set search_path to tower, public;

create table if not exists tower.issuing_entities (
  id                   uuid primary key default gen_random_uuid(),
  code                 text not null unique,           -- app slug: 'wgt-pe', 'shining-star-cl'
  key                  text not null unique,           -- display key: 'WGT-PE', 'SHINING-CL'
  country              text not null,                  -- ISO-3166 alpha-2
  tax_id_label         text not null,                  -- 'RUC' | 'RUT' | 'NIT' …
  doc_prefix           text not null,                  -- PF-{prefix}-YYYY-NNNN
  issuer               jsonb not null,                 -- CompanyInfo (header/footer)
  exporter             jsonb not null,                 -- TradeParty (Vendedor/Exportador)
  banking              jsonb,                          -- BankingDetails | null → section hidden
  terms                jsonb not null,                 -- ProformaTerms defaults
  default_incoterm     text not null,
  tax_label            text not null,
  tax_bps              int  not null check (tax_bps between 0 and 10000),
  default_issue_city   text not null,
  locale               text not null check (locale in ('es', 'es-en')),
  footer_shows_address boolean not null default true,
  serves               jsonb not null default '{}',    -- {countries:[], ports:[]}
  retired_at           timestamptz,
  updated_at           timestamptz not null default now(),
  created_at           timestamptz not null default now()
);

alter table tower.issuing_entities enable row level security;

-- Read: any authenticated member of the group (issuer identity is not secret).
create policy issuing_entities_read on tower.issuing_entities for select using (true);
-- Write / update: group admins only.
create policy issuing_entities_write on tower.issuing_entities for insert with check (
  tower.is_group_admin()
);
create policy issuing_entities_update on tower.issuing_entities for update using (
  tower.is_group_admin()
);
-- No delete policy — retire via retired_at (Directive 4).

grant select, insert, update on tower.issuing_entities to authenticated;

drop trigger if exists audit_issuing_entities on tower.issuing_entities;
create trigger audit_issuing_entities
  after insert or update or delete on tower.issuing_entities
  for each row execute function tower.audit_trigger();

-- Keep updated_at honest on edits (shared house idiom, tower_26/tower_51).
drop trigger if exists set_updated_at_issuing_entities on tower.issuing_entities;
create trigger set_updated_at_issuing_entities
  before update on tower.issuing_entities
  for each row execute function tower.rb_set_updated_at();

-- ── quotes: which entity issued (explicit choice wins over resolveIssuer) + per-doc
-- locale. issuer_id stores the entity `code` (the TS registry id), FK to the unique code. ──
alter table tower.quotes
  add column if not exists issuer_id text references tower.issuing_entities(code),
  add column if not exists locale    text check (locale in ('es', 'es-en'));

-- ── Seed the two entities from lib/quotation/issuers.ts (idempotent on code) ───
insert into tower.issuing_entities
  (code, key, country, tax_id_label, doc_prefix, issuer, exporter, banking, terms,
   default_incoterm, tax_label, tax_bps, default_issue_city, locale, footer_shows_address, serves)
values
  (
    'wgt-pe', 'WGT-PE', 'PE', 'RUC', 'WGT',
    '{"name":"WINGS GLOBAL TRADE","tagline":"SOLUCIONES INTEGRALES EN IMPORTACIÓN","email":"comercial@wingsglobaltrade.com","whatsapp":"+507 6025-07","address":"Ctra. Panamericana Sur Km. 1303  Mz. Q  Lt. 8-9","website":"wingsglobaltrade.com","logoSrc":"/brand/wings-imagotipo.svg"}'::jsonb,
    '{"name":"WINGS GLOBAL TRADE S.A.C.","taxId":"20601234567","address":"Ctra. Panamericana Sur Km. 1303  Mz. Q  Lt. 8-9","city":"Tacna, Perú","phone":"+507 6025-07","email":"comercial@wingsglobaltrade.com","website":"wingsglobaltrade.com"}'::jsonb,
    '{"bank":"Banco de Crédito del Perú","accountName":"WINGS GLOBAL TRADE S.A.C.","accountUsd":"191-60012345-1-12","swift":"BCPLPEPL","cci":"00219100601234511200"}'::jsonb,
    '{"portOfOrigin":"Shanghai, China","portOfDestination":"Callao, Perú","paymentTerms":"30% de adelanto y 70% antes del embarque","deliveryTime":"30 - 45 días calendario después de confirmada la orden.","validityText":"15 días calendarios.","warranty":"12 meses o 20 000 km (Lo que ocurra primero)"}'::jsonb,
    'CIF - Callao (Incoterms ® 2020)', 'IGV 18%', 1800, 'Lima', 'es-en', true,
    '{"countries":["perú","peru"],"ports":["callao","lima","paita","tacna"]}'::jsonb
  ),
  (
    'shining-star-cl', 'SHINING-CL', 'CL', 'RUT', 'WGT',
    '{"name":"WINGS GLOBAL TRADE","tagline":"SOLUCIONES INTEGRALES EN IMPORTACIÓN","email":"importaciones@wingsglobaltrade.com","whatsapp":"+507 6025-07","address":"Pasaje Cuatro 2213, Condominio Oasis, Iquique, Chile","website":"wingsglobaltrade.com","logoSrc":"/brand/wings-imagotipo.svg"}'::jsonb,
    '{"name":"IMPORT - EXPORT SHINING STAR LIMITADA","taxId":"76029544-2","address":"Pasaje Cuatro 2213, Condominio Oasis","city":"Iquique, Chile","phone":"+56 937305608","email":"importaciones@wingsglobaltrade.com","website":"wingsglobaltrade.com"}'::jsonb,
    null,
    '{"portOfOrigin":"Qingdao, China","portOfDestination":"Iquique, Chile","paymentTerms":"50% adelantado y 50% al embarque en el puerto de origen.","deliveryTime":"Embarque dentro de 30 días naturales tras recibir el pago final.","validityText":"15 días desde la fecha de esta proforma.","warranty":null}'::jsonb,
    'FOB (Incoterms ® 2020)', 'FOB', 0, 'Iquique', 'es', false,
    '{"countries":["chile","bolivia"],"ports":["iquique","zofri","antofagasta","arica"]}'::jsonb
  )
on conflict (code) do nothing;
