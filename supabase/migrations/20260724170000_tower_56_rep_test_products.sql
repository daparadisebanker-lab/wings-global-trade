-- TOWER migration 56 · Rep test-product library (WS8, QUEUED — NOT YET APPLIED)
-- The "Prueba" marketing source ships EPHEMERAL (composed + shared in-session,
-- image held in the browser, nothing stored). This migration is the designed,
-- ready-to-activate foundation for the LATER rep-private library: saved trial
-- products a rep can reuse and track. It is committed but intentionally UNAPPLIED
-- until approved via the migration pipeline; the app's ephemeral Prueba flow does
-- not read these tables, so applying (or not) changes nothing today.
--
-- Mutation/RLS law mirrors tower.rep_profiles (tower_39): a rep only ever touches
-- their OWN rows; a private storage bucket holds the trial image.
set search_path to tower, public;

create table tower.rep_test_products (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references tower.profiles(id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 200),
  category     text check (char_length(category) <= 120),
  specs        jsonb not null default '[]',   -- [{label,value}] as exhibited on the card
  price_note   text check (char_length(price_note) <= 80),
  moq          text check (char_length(moq) <= 40),
  image_path   text,                          -- private-bucket path, resolved to a signed URL on read
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index rep_test_products_owner_idx on tower.rep_test_products (owner_id, updated_at desc);

alter table tower.rep_test_products enable row level security;

-- Own-row only, all verbs (a trial library is private to its rep). Column-scoped
-- grants keep created_at server-defaulted.
create policy rep_test_products_read on tower.rep_test_products for select using (owner_id = auth.uid());
create policy rep_test_products_ins on tower.rep_test_products for insert with check (owner_id = auth.uid());
create policy rep_test_products_upd on tower.rep_test_products for update using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy rep_test_products_del on tower.rep_test_products for delete using (owner_id = auth.uid());

-- created_at is always server-stamped (never client-forged).
create or replace function tower.rep_test_products_before_insert()
returns trigger language plpgsql as $$
begin
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;
create trigger rep_test_products_before_insert_trg
  before insert on tower.rep_test_products
  for each row execute function tower.rep_test_products_before_insert();

-- Private image bucket (no public policy; reads are service-role signed URLs,
-- exactly like tower_39's rep-assets bucket). Idempotent insert.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rep-test-assets', 'rep-test-assets', false, 4194304,
        array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
