-- TOWER migration 10 · lock down events partitions (service-role-only ingest; RLS parent doesn't propagate to partitions for direct access)
set search_path to tower, public;

-- existing partitions
alter table tower.events_202607 enable row level security;
alter table tower.events_202608 enable row level security;

-- make every future partition self-lock on creation
create or replace function tower.ensure_events_partition(target date)
returns void language plpgsql set search_path = tower, public as $$
declare
  start_date date := date_trunc('month', target)::date;
  end_date   date := (date_trunc('month', target) + interval '1 month')::date;
  part_name  text := 'events_' || to_char(start_date, 'YYYYMM');
begin
  if not exists (
    select 1 from pg_class where relname = part_name and relnamespace = 'tower'::regnamespace
  ) then
    execute format('create table tower.%I partition of tower.events for values from (%L) to (%L)',
                   part_name, start_date, end_date);
    execute format('alter table tower.%I enable row level security', part_name);
  end if;
end $$;
