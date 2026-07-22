-- tower_39 · Rep identity foundation — per-user signature + WhatsApp profile.
-- Forward-only. The storage + reader contract three follow-up features build on
-- (onboarding UI, document rendering, WhatsApp wiring). Mirrors the shipped RB
-- idioms: tower.rb_set_updated_at() for updated_at, tower.audit_trigger() for the
-- audit log, and the tower_34 "authorize-in-the-action, mint via SERVICE ROLE"
-- private-bucket access model (no authenticated storage policy — the server
-- action IS the boundary).
--
-- PREREQ: tower_01 (is_group_admin), tower_07 (audit_trigger), tower_26
-- (rb_set_updated_at). Additive only — nothing shipped is altered.

set search_path to tower, public;

-- rep_profiles — one row per auth user (the rep). Retire-not-delete: NO delete
-- policy. signature_path points at an object in the private `rep-assets` bucket;
-- whatsapp_e164 is CHECK-gated to E.164 shape but stays nullable.
create table tower.rep_profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  title          text,
  signature_path text,
  whatsapp_e164  text,
  whatsapp_label text,
  onboarded_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- E.164: a leading '+', a non-zero country digit, then 7..14 more digits.
  -- NULL passes (constraints are satisfied on unknown) — an unset number is legal.
  constraint rep_profiles_whatsapp_e164_chk
    check (whatsapp_e164 is null or whatsapp_e164 ~ '^\+[1-9]\d{7,14}$')
);

-- updated_at — reuse the shipped self-contained BEFORE UPDATE trigger fn (tower_26).
create trigger rep_profiles_set_updated_at before update on tower.rep_profiles
  for each row execute function tower.rb_set_updated_at();

-- Audit — the shipped per-table trigger (tower_07); every mutation lands in
-- tower.audit_log (never written by the actions).
create trigger audit_rep_profiles after insert or update or delete
  on tower.rep_profiles for each row execute function tower.audit_trigger();

-- RLS — a rep sees/writes only their own row; group admins see/write all. No
-- DELETE policy anywhere (retire, never delete — append-only law).
alter table tower.rep_profiles enable row level security;

create policy rep_profiles_read on tower.rep_profiles for select
  using ( user_id = auth.uid() or is_group_admin() );
create policy rep_profiles_ins on tower.rep_profiles for insert
  with check ( user_id = auth.uid() or is_group_admin() );
create policy rep_profiles_upd on tower.rep_profiles for update
  using ( user_id = auth.uid() or is_group_admin() )
  with check ( user_id = auth.uid() or is_group_admin() );

-- Private storage bucket for rep signatures (mirrors tower_34's access model).
-- Signatures are svg/png only, capped at 512 KiB. PRIVATE: every read/write is
-- brokered by a server action that authorizes the caller, then asks the SERVICE
-- ROLE to mint a signed URL — the bucket carries no authenticated storage policy.
-- Idempotent: on conflict we correct the limits in place.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rep-assets',
  'rep-assets',
  false,
  524288, -- 512 KiB
  array['image/svg+xml','image/png']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
