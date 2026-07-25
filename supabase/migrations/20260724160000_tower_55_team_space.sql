-- TOWER migration 55 · Team space + @mentions (WS6)
-- An internal, ORG-WIDE team stream: any Tower user posts a short note and can
-- @mention teammates; a mention is an IN-SYSTEM notification (D3 — no email).
-- Minimal by design ("we don't need it to compete with the dock").
set search_path to tower, public;

-- ── Notes ────────────────────────────────────────────────────────────────────
-- author_name is a denormalized snapshot so the stream renders without reading
-- other users' profiles rows (profiles_read is self/admin-only — see tower_08).
-- It is STAMPED server-side by a trigger (below) from the caller's own profile —
-- never trusted from the client — so a note can't be attributed to someone else.
create table tower.team_notes (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references tower.profiles(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 200),
  body        text not null check (char_length(body) between 1 and 2000),
  created_at  timestamptz not null default now()
);

-- ── Mentions (the notification) ──────────────────────────────────────────────
-- One row per mentioned teammate per note. read_at null = unread.
create table tower.team_note_mentions (
  id                 uuid primary key default gen_random_uuid(),
  note_id            uuid not null references tower.team_notes(id) on delete cascade,
  mentioned_user_id  uuid not null references tower.profiles(id) on delete cascade,
  read_at            timestamptz,
  created_at         timestamptz not null default now(),
  unique (note_id, mentioned_user_id)
);

create index team_notes_created_idx on tower.team_notes (created_at desc);
create index team_note_mentions_user_idx on tower.team_note_mentions (mentioned_user_id, read_at);
create index team_note_mentions_note_idx on tower.team_note_mentions (note_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table tower.team_notes enable row level security;
alter table tower.team_note_mentions enable row level security;

-- Org-wide, APPEND-ONLY internal space (house law, tower_08 — no DELETE policies;
-- tower_11 grants no DELETE either): any authenticated Tower user (has a profiles
-- row) can read the stream and post as themselves. Notes are not edited or
-- deleted — the stream is a ledger.
create policy team_notes_read on tower.team_notes for select using (
  exists (select 1 from tower.profiles p where p.id = auth.uid()));
create policy team_notes_ins on tower.team_notes for insert with check (author_id = auth.uid());

-- A mention is readable by the mentioned teammate OR the note's author; the note
-- author creates mentions (only for their own note); the mentioned user marks it
-- read — and read_at is the ONLY column they may change (grant is column-scoped
-- below, matching the tower_36 status-grant precedent).
create policy team_note_mentions_read on tower.team_note_mentions for select using (
  mentioned_user_id = auth.uid()
  or exists (select 1 from tower.team_notes n where n.id = note_id and n.author_id = auth.uid()));
create policy team_note_mentions_ins on tower.team_note_mentions for insert with check (
  exists (select 1 from tower.team_notes n where n.id = note_id and n.author_id = auth.uid()));
create policy team_note_mentions_upd on tower.team_note_mentions for update using (
  mentioned_user_id = auth.uid()) with check (mentioned_user_id = auth.uid());

-- Column-scope the mentioned user's UPDATE to read_at only (they must not be able
-- to repoint note_id / rewrite id / forge created_at). tower_11 default-granted
-- full-column UPDATE to authenticated; narrow it here.
revoke update on tower.team_note_mentions from authenticated;
grant update (read_at) on tower.team_note_mentions to authenticated;

-- ── Roster (the @mention source) ─────────────────────────────────────────────
-- profiles_read is self/admin-only, so a rep can't list teammates to @mention.
-- This SECURITY DEFINER function exposes ONLY (id, full_name) — never
-- is_group_admin or any other column — to any authenticated user, which is the
-- expected transparency for an internal team space. STABLE, fixed search_path.
create or replace function tower.team_roster()
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = tower, public
as $$
  select p.id, p.full_name from tower.profiles p order by p.full_name asc
$$;

revoke all on function tower.team_roster() from public;
grant execute on function tower.team_roster() to authenticated;

-- ── Server-stamped columns (integrity) ───────────────────────────────────────
-- author_name is stamped from the caller's OWN profile (never the client's
-- string), and created_at is forced to now() — so a note can't be attributed to
-- someone else or pinned to the top with a forged timestamp. SECURITY DEFINER so
-- it can read profiles past profiles_read (same idiom as team_roster), fixed
-- search_path.
create or replace function tower.team_notes_before_insert()
returns trigger
language plpgsql
security definer
set search_path = tower, public
as $$
begin
  new.author_name := coalesce(
    nullif(trim((select p.full_name from tower.profiles p where p.id = auth.uid())), ''),
    'Equipo');
  new.created_at := now();
  return new;
end;
$$;

create trigger team_notes_before_insert_trg
  before insert on tower.team_notes
  for each row execute function tower.team_notes_before_insert();

-- A mention is always born unread and now()-stamped — a note author can't
-- pre-mark a mention read (suppressing the notification) or forge its time.
create or replace function tower.team_note_mentions_before_insert()
returns trigger
language plpgsql
as $$
begin
  new.read_at := null;
  new.created_at := now();
  return new;
end;
$$;

create trigger team_note_mentions_before_insert_trg
  before insert on tower.team_note_mentions
  for each row execute function tower.team_note_mentions_before_insert();
