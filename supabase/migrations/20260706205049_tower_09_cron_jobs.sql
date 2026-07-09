-- TOWER migration 9/9 · pg_cron: monthly partition + rollup refresh
create extension if not exists pg_cron;

-- idempotent reschedule
select cron.unschedule(jobid) from cron.job
  where jobname in ('tower_events_partition','tower_rollups_refresh');

-- 25th of each month: ensure next month's events partition exists ahead of the rollover
select cron.schedule('tower_events_partition', '0 0 25 * *',
  $cron$ select tower.ensure_events_partition((date_trunc('month', now()) + interval '1 month')::date) $cron$);

-- every 15 min: refresh the daily rollup the dashboards read (never raw events)
select cron.schedule('tower_rollups_refresh', '*/15 * * * *',
  $cron$ refresh materialized view concurrently tower.metric_rollups_daily $cron$);
