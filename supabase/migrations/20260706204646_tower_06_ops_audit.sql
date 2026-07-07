-- TOWER migration 6/9 · ops (tasks + audit_log)
set search_path to tower, public;

create table tower.tasks (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references tower.brands(id),
  lane_id uuid references tower.lanes(id),
  ref_table text, ref_id uuid,
  title text not null, assignee_id uuid references tower.profiles(id),
  due_date date, status text default 'OPEN' check (status in ('OPEN','DONE','CANCELLED'))
);

create table tower.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz default now(),
  actor uuid, table_name text not null, row_id uuid,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  before jsonb, after jsonb
);

create index on tower.tasks (lane_id);
create index on tower.tasks (assignee_id);
create index on tower.audit_log (table_name, row_id);
create index on tower.audit_log (at);
