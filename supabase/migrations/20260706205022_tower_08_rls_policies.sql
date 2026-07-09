-- TOWER migration 8/9 · RLS on every domain table (products = template; role map from PRODUCT_BRIEF)
-- No DELETE policies anywhere: append-only worlds retire via status, never delete.
set search_path to tower, public;

-- brand-scope helpers (suppliers/accounts are brand-scoped, not lane-scoped)
create or replace function tower.has_brand_access(p_brand uuid) returns boolean
language sql stable security definer set search_path = tower, public as
$$ select tower.is_group_admin() or exists (
     select 1 from tower.lane_memberships m
     join tower.lanes l on l.id = m.lane_id
     where m.user_id = auth.uid() and l.brand_id = p_brand) $$;

create or replace function tower.has_brand_role(p_brand uuid, p_roles text[]) returns boolean
language sql stable security definer set search_path = tower, public as
$$ select tower.is_group_admin() or exists (
     select 1 from tower.lane_memberships m
     join tower.lanes l on l.id = m.lane_id
     where m.user_id = auth.uid() and l.brand_id = p_brand and m.role = any(p_roles)) $$;

-- ===== IDENTITY & ACCESS =====
alter table tower.brands enable row level security;
create policy brands_read on tower.brands for select using (tower.has_brand_access(id));
create policy brands_admin_ins on tower.brands for insert with check (tower.is_group_admin());
create policy brands_admin_upd on tower.brands for update using (tower.is_group_admin()) with check (tower.is_group_admin());

alter table tower.lanes enable row level security;
create policy lanes_read on tower.lanes for select using (
  tower.is_group_admin() or exists (select 1 from tower.lane_memberships m where m.user_id = auth.uid() and m.lane_id = id));
create policy lanes_admin_ins on tower.lanes for insert with check (tower.is_group_admin());
create policy lanes_admin_upd on tower.lanes for update using (tower.is_group_admin()) with check (tower.is_group_admin());

alter table tower.profiles enable row level security;
create policy profiles_read on tower.profiles for select using (id = auth.uid() or tower.is_group_admin());
create policy profiles_self_ins on tower.profiles for insert with check (id = auth.uid() or tower.is_group_admin());
create policy profiles_upd on tower.profiles for update using (id = auth.uid() or tower.is_group_admin())
  with check (case when tower.is_group_admin() then true else is_group_admin = false end);

alter table tower.lane_memberships enable row level security;
create policy memberships_read on tower.lane_memberships for select using (user_id = auth.uid() or tower.is_group_admin());
create policy memberships_admin_ins on tower.lane_memberships for insert with check (tower.is_group_admin());
create policy memberships_admin_upd on tower.lane_memberships for update using (tower.is_group_admin()) with check (tower.is_group_admin());

-- ===== CATALOG =====
alter table tower.spec_schemas enable row level security;
create policy spec_read on tower.spec_schemas for select using (
  tower.is_group_admin() or lane_id is null
  or exists (select 1 from tower.lane_memberships m where m.user_id = auth.uid() and m.lane_id = lane_id));
create policy spec_admin_ins on tower.spec_schemas for insert with check (tower.is_group_admin());
create policy spec_admin_upd on tower.spec_schemas for update using (tower.is_group_admin()) with check (tower.is_group_admin());

alter table tower.products enable row level security;
create policy products_read on tower.products for select
  using (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']));
create policy products_ins on tower.products for insert
  with check (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR']));
create policy products_upd on tower.products for update
  using (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR']))
  with check (case when status in ('PUBLISHED','RETIRED')
                   then tower.has_lane_role(lane_id, array['LANE_DIRECTOR']) else true end);

alter table tower.product_versions enable row level security;
create policy pv_read on tower.product_versions for select using (
  exists (select 1 from tower.products p where p.id = product_id
          and tower.has_lane_role(p.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])));
create policy pv_ins on tower.product_versions for insert with check (
  exists (select 1 from tower.products p where p.id = product_id
          and tower.has_lane_role(p.lane_id, array['LANE_DIRECTOR'])));

alter table tower.product_media enable row level security;
create policy pm_read on tower.product_media for select using (
  exists (select 1 from tower.products p where p.id = product_id
          and tower.has_lane_role(p.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])));
create policy pm_ins on tower.product_media for insert with check (
  exists (select 1 from tower.products p where p.id = product_id
          and tower.has_lane_role(p.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR'])));
create policy pm_upd on tower.product_media for update using (
  exists (select 1 from tower.products p where p.id = product_id
          and tower.has_lane_role(p.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR'])))
  with check (exists (select 1 from tower.products p where p.id = product_id
          and tower.has_lane_role(p.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR'])));

-- ===== CRM =====
alter table tower.accounts enable row level security;
create policy accounts_read on tower.accounts for select using (tower.has_brand_access(brand_id));
create policy accounts_ins on tower.accounts for insert with check (tower.has_brand_role(brand_id, array['LANE_DIRECTOR','SALES']));
create policy accounts_upd on tower.accounts for update using (tower.has_brand_role(brand_id, array['LANE_DIRECTOR','SALES']))
  with check (tower.has_brand_role(brand_id, array['LANE_DIRECTOR','SALES']));

alter table tower.contacts enable row level security;
create policy contacts_read on tower.contacts for select using (
  exists (select 1 from tower.accounts a where a.id = account_id and tower.has_brand_access(a.brand_id)));
create policy contacts_ins on tower.contacts for insert with check (
  exists (select 1 from tower.accounts a where a.id = account_id and tower.has_brand_role(a.brand_id, array['LANE_DIRECTOR','SALES'])));
create policy contacts_upd on tower.contacts for update using (
  exists (select 1 from tower.accounts a where a.id = account_id and tower.has_brand_role(a.brand_id, array['LANE_DIRECTOR','SALES'])))
  with check (exists (select 1 from tower.accounts a where a.id = account_id and tower.has_brand_role(a.brand_id, array['LANE_DIRECTOR','SALES'])));

alter table tower.rfqs enable row level security;
create policy rfqs_read on tower.rfqs for select using (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']));
create policy rfqs_ins on tower.rfqs for insert with check (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','SALES']));
create policy rfqs_upd on tower.rfqs for update using (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','SALES']))
  with check (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','SALES']));

alter table tower.rfq_lines enable row level security;
create policy rfql_read on tower.rfq_lines for select using (
  exists (select 1 from tower.rfqs r where r.id = rfq_id and tower.has_lane_role(r.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])));
create policy rfql_ins on tower.rfq_lines for insert with check (
  exists (select 1 from tower.rfqs r where r.id = rfq_id and tower.has_lane_role(r.lane_id, array['LANE_DIRECTOR','SALES'])));
create policy rfql_upd on tower.rfq_lines for update using (
  exists (select 1 from tower.rfqs r where r.id = rfq_id and tower.has_lane_role(r.lane_id, array['LANE_DIRECTOR','SALES'])))
  with check (exists (select 1 from tower.rfqs r where r.id = rfq_id and tower.has_lane_role(r.lane_id, array['LANE_DIRECTOR','SALES'])));

alter table tower.quotes enable row level security;
create policy quotes_read on tower.quotes for select using (
  exists (select 1 from tower.rfqs r where r.id = rfq_id and tower.has_lane_role(r.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])));
create policy quotes_ins on tower.quotes for insert with check (
  exists (select 1 from tower.rfqs r where r.id = rfq_id and tower.has_lane_role(r.lane_id, array['LANE_DIRECTOR','SALES'])));
create policy quotes_upd on tower.quotes for update using (
  exists (select 1 from tower.rfqs r where r.id = rfq_id and tower.has_lane_role(r.lane_id, array['LANE_DIRECTOR','SALES'])))
  with check (exists (select 1 from tower.rfqs r where r.id = rfq_id and tower.has_lane_role(r.lane_id, array['LANE_DIRECTOR','SALES'])));

alter table tower.orders enable row level security;
create policy orders_read on tower.orders for select using (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']));
create policy orders_ins on tower.orders for insert with check (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','SALES']));
create policy orders_upd on tower.orders for update using (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','SALES','TRADE_OPS']))
  with check (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','SALES','TRADE_OPS']));

-- ===== ERP =====
alter table tower.suppliers enable row level security;
create policy suppliers_read on tower.suppliers for select using (tower.has_brand_access(brand_id));
create policy suppliers_ins on tower.suppliers for insert with check (tower.has_brand_role(brand_id, array['LANE_DIRECTOR','TRADE_OPS']));
create policy suppliers_upd on tower.suppliers for update using (tower.has_brand_role(brand_id, array['LANE_DIRECTOR','TRADE_OPS']))
  with check (tower.has_brand_role(brand_id, array['LANE_DIRECTOR','TRADE_OPS']));

alter table tower.containers enable row level security;
create policy containers_read on tower.containers for select using (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']));
create policy containers_ins on tower.containers for insert with check (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS']));
create policy containers_upd on tower.containers for update using (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS']))
  with check (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS']));

alter table tower.container_commitments enable row level security;
create policy cc_read on tower.container_commitments for select using (
  exists (select 1 from tower.containers c where c.id = container_id and tower.has_lane_role(c.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])));
create policy cc_ins on tower.container_commitments for insert with check (
  exists (select 1 from tower.containers c where c.id = container_id and tower.has_lane_role(c.lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES'])));
create policy cc_upd on tower.container_commitments for update using (
  exists (select 1 from tower.containers c where c.id = container_id and tower.has_lane_role(c.lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES'])))
  with check (exists (select 1 from tower.containers c where c.id = container_id and tower.has_lane_role(c.lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES'])));

alter table tower.purchase_orders enable row level security;
create policy po_read on tower.purchase_orders for select using (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']));
create policy po_ins on tower.purchase_orders for insert with check (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS']));
create policy po_upd on tower.purchase_orders for update using (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS']))
  with check (tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS']));

alter table tower.qc_checks enable row level security;
create policy qc_read on tower.qc_checks for select using (
  exists (select 1 from tower.purchase_orders po where po.id = purchase_order_id and tower.has_lane_role(po.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])));
create policy qc_ins on tower.qc_checks for insert with check (
  exists (select 1 from tower.purchase_orders po where po.id = purchase_order_id and tower.has_lane_role(po.lane_id, array['LANE_DIRECTOR','TRADE_OPS'])));
create policy qc_upd on tower.qc_checks for update using (
  exists (select 1 from tower.purchase_orders po where po.id = purchase_order_id and tower.has_lane_role(po.lane_id, array['LANE_DIRECTOR','TRADE_OPS'])))
  with check (exists (select 1 from tower.purchase_orders po where po.id = purchase_order_id and tower.has_lane_role(po.lane_id, array['LANE_DIRECTOR','TRADE_OPS'])));

alter table tower.trade_documents enable row level security;
create policy td_read on tower.trade_documents for select using (
  (container_id is not null and exists (select 1 from tower.containers c where c.id = container_id and tower.has_lane_role(c.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])))
  or (order_id is not null and exists (select 1 from tower.orders o where o.id = order_id and tower.has_lane_role(o.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER']))));
create policy td_ins on tower.trade_documents for insert with check (
  (container_id is not null and exists (select 1 from tower.containers c where c.id = container_id and tower.has_lane_role(c.lane_id, array['LANE_DIRECTOR','TRADE_OPS'])))
  or (order_id is not null and exists (select 1 from tower.orders o where o.id = order_id and tower.has_lane_role(o.lane_id, array['LANE_DIRECTOR','TRADE_OPS']))));

alter table tower.landed_costs enable row level security;
create policy lc_read on tower.landed_costs for select using (
  exists (select 1 from tower.containers c where c.id = container_id and tower.has_lane_role(c.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])));
create policy lc_ins on tower.landed_costs for insert with check (
  exists (select 1 from tower.containers c where c.id = container_id and tower.has_lane_role(c.lane_id, array['LANE_DIRECTOR','TRADE_OPS'])));
create policy lc_upd on tower.landed_costs for update using (
  exists (select 1 from tower.containers c where c.id = container_id and tower.has_lane_role(c.lane_id, array['LANE_DIRECTOR','TRADE_OPS'])))
  with check (exists (select 1 from tower.containers c where c.id = container_id and tower.has_lane_role(c.lane_id, array['LANE_DIRECTOR','TRADE_OPS'])));

-- ===== OPS =====
alter table tower.tasks enable row level security;
create policy tasks_read on tower.tasks for select using (
  case when lane_id is not null then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])
       else tower.has_brand_access(brand_id) end);
create policy tasks_ins on tower.tasks for insert with check (
  case when lane_id is not null then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES'])
       else tower.has_brand_role(brand_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES']) end);
create policy tasks_upd on tower.tasks for update using (
  case when lane_id is not null then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES'])
       else tower.has_brand_role(brand_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES']) end)
  with check (
  case when lane_id is not null then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES'])
       else tower.has_brand_role(brand_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES']) end);

-- events: service-role insert only; no user-facing policies (RLS on, zero policies = locked to service role)
alter table tower.events enable row level security;

-- audit_log: select restricted to group admin; inserts happen via SECURITY DEFINER trigger (owner bypasses RLS)
alter table tower.audit_log enable row level security;
create policy audit_read on tower.audit_log for select using (tower.is_group_admin());
