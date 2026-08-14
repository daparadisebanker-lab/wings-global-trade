-- tower_61 · Client window: assign suppliers to an account
-- The link a rep needs on a client's page — "which suppliers are we sourcing
-- this client from" — separate from the FOB price book itself (tower_60).
-- A tag/assignment table, not a domain fact: unlike supplier_offers this one
-- gets a delete policy (unassigning is a normal edit), same house pattern as
-- tower.rb_memberships (tower_25) and tower.documents (tower_47).
set search_path to tower, public;

create table account_suppliers (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references accounts(id) on delete cascade,
  supplier_id uuid not null references suppliers(id),
  note        text,
  created_by  uuid references profiles(id) default auth.uid(),
  created_at  timestamptz not null default now(),
  constraint account_suppliers_note_len check (note is null or char_length(note) <= 500),
  unique (account_id, supplier_id)
);

create index account_suppliers_account_idx  on account_suppliers (account_id);
create index account_suppliers_supplier_idx on account_suppliers (supplier_id);

-- ── Audit trigger (Directive 4) ───────────────────────────────────────────────
create trigger audit_account_suppliers after insert or update or delete on account_suppliers
  for each row execute function tower.audit_trigger();

-- ── RLS — scoped through the account's brand (mirrors tower.contacts) ────────
alter table account_suppliers enable row level security;

create policy account_suppliers_read on account_suppliers for select using (
  exists (select 1 from accounts a where a.id = account_id and tower.has_brand_access(a.brand_id)));

-- Insert also requires the supplier to belong to the SAME brand as the
-- account — a join table can't otherwise stop a cross-brand mismatch RLS
-- alone wouldn't catch (both sides pass their own brand-scoped read/role
-- check independently).
create policy account_suppliers_ins on account_suppliers for insert with check (
  exists (
    select 1 from accounts a join suppliers s on s.id = supplier_id
    where a.id = account_id and a.brand_id = s.brand_id
      and tower.has_brand_role(a.brand_id, array['LANE_DIRECTOR','SALES'])
  ));

create policy account_suppliers_del on account_suppliers for delete using (
  exists (select 1 from accounts a where a.id = account_id and tower.has_brand_role(a.brand_id, array['LANE_DIRECTOR','SALES'])));

-- ── Grants (inherited from tower_11's default privileges; restated for clarity) ─
grant select, insert, delete on account_suppliers to authenticated;
