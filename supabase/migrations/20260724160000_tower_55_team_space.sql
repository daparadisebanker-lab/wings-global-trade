-- TOWER migration 55 · Team space + @mentions (WS6)
set search_path to tower, public;

create table tower.team_notes (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references tower.profiles(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 200),
  body        text not null check (char_length(body) between 1 and 2000),
  created_at  timestamptz not null default now()
);

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

alter table tower.team_notes enable row level security;
alter table tower.team_note_mentions enable row level security;

create policy team_notes_read on tower.team_notes for select using (
  exists (select 1 from tower.profiles p where p.id = auth.uid()));
create policy team_notes_ins on tower.team_notes for insert with check (author_id = auth.uid());

create policy team_note_mentions_read on tower.team_note_mentions for select using (
  mentioned_user_id = auth.uid()
  or exists (select 1 from tower.team_notes n where n.id = note_id and n.author_id = auth.uid()));
create policy team_note_mentions_ins on tower.team_note_mentions for insert with check (
  exists (select 1 from tower.team_notes n where n.id = note_id and n.author_id = auth.uid()));
create policy team_note_mentions_upd on tower.team_note_mentions for update using (
  mentioned_user_id = auth.uid()) with check (mentioned_user_id = auth.uid());

revoke update on tower.team_note_mentions from authenticated;
grant update (read_at) on tower.team_note_mentions to authenticated;

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
