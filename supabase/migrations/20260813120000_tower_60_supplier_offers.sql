-- tower_60 · Supplier FOB price book
-- The catalog of what suppliers have actually quoted us — captured from
-- WhatsApp/Alibaba/email screenshots (Mister's existing supplier-screenshot
-- capability) or typed in manually, regardless of product category. Append-only:
-- a new price is a new row (status ACTIVE/EXPIRED/SUPERSEDED), never an edit-in-
-- place of what was actually offered (Directive 4). Brand-scoped like
-- tower.suppliers itself (a supplier isn't tied to one lane).
--
-- Also gives tower.suppliers the contact fields it never had (name/country/
-- verified/qc_history/lanes only) — needed to actually act on a lead.
set search_path to tower, public;

-- ── suppliers: contact fields (additive) ─────────────────────────────────────
alter table suppliers
  add column if not exists contact_whatsapp text,
  add column if not exists contact_email    text,
  add column if not exists notes            text;

alter table suppliers
  add constraint suppliers_contact_whatsapp_len check (contact_whatsapp is null or char_length(contact_whatsapp) <= 40),
  add constraint suppliers_contact_email_len    check (contact_email is null or char_length(contact_email) <= 200),
  add constraint suppliers_notes_len            check (notes is null or char_length(notes) <= 2000);

-- ── supplier_offers: the FOB price history ───────────────────────────────────
create table supplier_offers (
  id                uuid primary key default gen_random_uuid(),
  brand_id          uuid not null references brands(id),
  supplier_id       uuid not null references suppliers(id),
  product_id        uuid references products(id),
  product_label     text not null,
  category_path     text[] not null default '{}',
  unit_price_minor  bigint,
  currency          text,
  price_unit        text,
  moq               text,
  incoterm          text,
  lead_time_days    int,
  port              text,
  hs_code           text,
  extras            jsonb not null default '[]',
  source            text not null default 'manual'
    check (source in ('whatsapp','alibaba','email','manual','other')),
  status            text not null default 'ACTIVE'
    check (status in ('ACTIVE','EXPIRED','SUPERSEDED')),
  valid_until       date,
  notes             text,
  captured_by       uuid references profiles(id) default auth.uid(),
  created_at        timestamptz not null default now(),
  constraint supplier_offers_product_label_len check (char_length(product_label) <= 300),
  constraint supplier_offers_price_unit_len     check (price_unit is null or char_length(price_unit) <= 60),
  constraint supplier_offers_moq_len            check (moq is null or char_length(moq) <= 120),
  constraint supplier_offers_incoterm_len       check (incoterm is null or char_length(incoterm) <= 10),
  constraint supplier_offers_port_len           check (port is null or char_length(port) <= 120),
  constraint supplier_offers_hs_code_len        check (hs_code is null or char_length(hs_code) <= 20),
  constraint supplier_offers_notes_len          check (notes is null or char_length(notes) <= 2000),
  constraint supplier_offers_currency_chk       check (currency is null or currency ~ '^[A-Z]{3}$'),
  constraint supplier_offers_price_positive     check (unit_price_minor is null or unit_price_minor > 0),
  constraint supplier_offers_lead_time_positive check (lead_time_days is null or lead_time_days > 0),
  constraint supplier_offers_extras_arr         check (jsonb_typeof(extras) = 'array')
);

create index supplier_offers_brand_idx    on supplier_offers (brand_id, created_at desc);
create index supplier_offers_supplier_idx on supplier_offers (supplier_id);
create index supplier_offers_product_idx  on supplier_offers (product_id);
create index supplier_offers_status_idx   on supplier_offers (brand_id, status);

-- ── Audit trigger (Directive 4 — every mutating table gets one before its UI) ─
create trigger audit_supplier_offers after insert or update or delete on supplier_offers
  for each row execute function tower.audit_trigger();

-- ── RLS — brand-scoped, same shape as tower_08's suppliers policies ──────────
alter table supplier_offers enable row level security;

create policy supplier_offers_read on supplier_offers for select
  using (tower.has_brand_access(brand_id));

create policy supplier_offers_ins on supplier_offers for insert
  with check (tower.has_brand_role(brand_id, array['LANE_DIRECTOR','TRADE_OPS','SALES']));

-- Corrections only (typo, mark EXPIRED/SUPERSEDED) — same role set as
-- suppliers_upd. No delete policy anywhere: append-only law.
create policy supplier_offers_upd on supplier_offers for update
  using (tower.has_brand_role(brand_id, array['LANE_DIRECTOR','TRADE_OPS']))
  with check (tower.has_brand_role(brand_id, array['LANE_DIRECTOR','TRADE_OPS']));

-- ── Grants (inherited from tower_11's default privileges; restated for clarity) ─
grant select, insert, update on supplier_offers to authenticated;
