-- TOWER migration 56 · Rep test-product library (WS8)
-- Backs the "Prueba" marketing source's private saved library: trial products a
-- rep can save, reuse and delete. When this is applied the app's "Mi biblioteca"
-- panel activates; when it isn't, the library reads error and the panel stays
-- hidden (the Prueba compose is dormant-safe and purely ephemeral).
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
  updated_at   timestamptz not null default now(),
  -- The image key must be EXACTLY `<owner-uuid>/<image-uuid>.<ext>` — a full-shape
  -- match, not a prefix (a `../` traversal would escape the prefix AND the bucket
  -- when a service role signs it). Blocks the cross-rep signed-read IDOR at the DB.
  constraint rep_test_products_image_owned
    check (image_path is null or
           image_path ~ ('^' || owner_id::text || '/[0-9a-f-]{36}\.(png|jpg|webp)$'))
);

create index rep_test_products_owner_idx on tower.rep_test_products (owner_id, updated_at desc);

alter table tower.rep_test_products enable row level security;

-- Own-row only, all verbs (a trial library is private to its rep). DELETE needs
-- an explicit grant — tower_11 default-grants only select/insert/update — so the
-- del policy can actually fire (a rep can remove their own trials).
create policy rep_test_products_read on tower.rep_test_products for select using (owner_id = auth.uid());
create policy rep_test_products_ins on tower.rep_test_products for insert with check (owner_id = auth.uid());
create policy rep_test_products_upd on tower.rep_test_products for update using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy rep_test_products_del on tower.rep_test_products for delete using (owner_id = auth.uid());
grant delete on tower.rep_test_products to authenticated;

-- created_at / updated_at are always server-stamped, never client-forged: the
-- insert trigger stamps both; the update trigger preserves created_at and moves
-- updated_at forward (so the (owner_id, updated_at desc) index stays truthful).
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

create or replace function tower.rep_test_products_before_update()
returns trigger language plpgsql as $$
begin
  new.created_at := old.created_at;  -- never forgeable on update
  new.updated_at := now();
  return new;
end;
$$;
create trigger rep_test_products_before_update_trg
  before update on tower.rep_test_products
  for each row execute function tower.rep_test_products_before_update();

-- Private image bucket (no public policy; reads are service-role signed URLs,
-- exactly like tower_39's rep-assets bucket). Idempotent insert.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rep-test-assets', 'rep-test-assets', false, 4194304,
        array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
