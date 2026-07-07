-- TOWER migration 7/9 · generic audit trigger + attach to every mutating table
set search_path to tower, public;

create or replace function tower.audit_trigger() returns trigger
language plpgsql security definer set search_path = tower, public as $fn$
declare
  v_row_id uuid;
  v_src jsonb;
begin
  v_src := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_row_id := case when v_src ? 'id' and jsonb_typeof(v_src->'id') = 'string'
                   then (v_src->>'id')::uuid else null end;
  if tg_op = 'DELETE' then
    insert into tower.audit_log(actor, table_name, row_id, action, before, after)
      values (auth.uid(), tg_table_name, v_row_id, 'DELETE', to_jsonb(old), null);
    return old;
  elsif tg_op = 'UPDATE' then
    insert into tower.audit_log(actor, table_name, row_id, action, before, after)
      values (auth.uid(), tg_table_name, v_row_id, 'UPDATE', to_jsonb(old), to_jsonb(new));
    return new;
  else
    insert into tower.audit_log(actor, table_name, row_id, action, before, after)
      values (auth.uid(), tg_table_name, v_row_id, 'INSERT', null, to_jsonb(new));
    return new;
  end if;
end $fn$;

-- Attach to every mutating domain table (events = append-only high-volume, audit_log = self: both excluded)
do $do$
declare
  t text;
  tbls text[] := array[
    'brands','lanes','profiles','lane_memberships','spec_schemas',
    'products','product_versions','product_media','accounts','contacts','rfqs','rfq_lines',
    'quotes','orders','suppliers','containers','container_commitments','purchase_orders',
    'qc_checks','trade_documents','landed_costs','tasks'];
begin
  foreach t in array tbls loop
    execute format('drop trigger if exists audit_%1$s on tower.%1$I', t);
    execute format('create trigger audit_%1$s after insert or update or delete on tower.%1$I '
                   'for each row execute function tower.audit_trigger()', t);
  end loop;
end $do$;
