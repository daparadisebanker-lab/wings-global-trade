-- TOWER migration 58 · Client (account) CRM profile
-- Turns tower.accounts from a bare name + country into a real CRM record: lead
-- source, buyer archetype (the ecosystem's 7 purchase archetypes — reusing the
-- dormant archetype_profile column from tower_03), interest category, stated
-- demand, pipeline stage, city, currency, owner, notes; plus a primary-contact
-- flag on tower.contacts. All additive + nullable/defaulted. accounts & contacts
-- already carry audit_trigger (tower_07) and RLS (tower_08), so the new columns
-- inherit both — no new policy, no new trigger.
set search_path to tower, public;

-- ── accounts: the CRM profile ────────────────────────────────────────────────
alter table tower.accounts
  add column if not exists source   text,
  add column if not exists category text,
  add column if not exists demand   text,
  add column if not exists stage    text not null default 'lead',
  add column if not exists city     text,
  add column if not exists currency text not null default 'USD',
  add column if not exists owner_id uuid references tower.profiles(id),
  add column if not exists notes    text;

-- Value guards (an append-only intelligence set — extend, never mutate meaning).
alter table tower.accounts
  add constraint accounts_source_chk check (
    source is null or source in
    ('mister','whatsapp','referral','web','trade_fair','cold_outreach','network','other')),
  add constraint accounts_stage_chk check (
    stage in ('lead','qualified','quoted','negotiating','won','dormant')),
  add constraint accounts_currency_chk check (currency ~ '^[A-Z]{3}$'),
  add constraint accounts_archetype_chk check (
    archetype_profile is null or archetype_profile in
    ('EQUIPMENT','PROJECT','COMMODITY','PROGRAM','CREDENTIAL','ORIGIN','ALLOCATION')),
  add constraint accounts_category_len check (category is null or char_length(category) <= 120),
  add constraint accounts_city_len     check (city is null or char_length(city) <= 120),
  add constraint accounts_demand_len   check (demand is null or char_length(demand) <= 2000),
  add constraint accounts_notes_len    check (notes is null or char_length(notes) <= 4000);

create index if not exists accounts_stage_idx on tower.accounts (brand_id, stage);
create index if not exists accounts_owner_idx on tower.accounts (owner_id);

-- ── contacts: mark the primary contact (at most one per account) ─────────────
alter table tower.contacts
  add column if not exists is_primary boolean not null default false;

create unique index if not exists contacts_one_primary_per_account
  on tower.contacts (account_id) where is_primary;
