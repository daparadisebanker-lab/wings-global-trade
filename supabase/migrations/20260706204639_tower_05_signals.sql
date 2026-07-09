-- TOWER migration 5/9 · signals (analytics) — partitioned events + rollup matview
set search_path to tower, public;

create table tower.events (
  id bigint generated always as identity,
  occurred_at timestamptz not null default now(),
  brand_slug text not null, lane_slug text not null,
  session_hash text not null,
  event text not null,
  product_slug text, path text, meta jsonb default '{}',
  primary key (id, occurred_at)
) partition by range (occurred_at);

create index on tower.events (occurred_at);
create index on tower.events (brand_slug, lane_slug, event);

-- Month-partition helper (called now for current+next month, and monthly by cron)
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
  end if;
end $$;

select tower.ensure_events_partition(current_date);
select tower.ensure_events_partition((date_trunc('month', current_date) + interval '1 month')::date);

create materialized view tower.metric_rollups_daily as
select date_trunc('day', occurred_at) as day, brand_slug, lane_slug, event,
       product_slug, count(*) as n, count(distinct session_hash) as sessions
from tower.events group by 1,2,3,4,5;

create unique index metric_rollups_daily_uq on tower.metric_rollups_daily
  (day, brand_slug, lane_slug, event, (coalesce(product_slug, '')));
