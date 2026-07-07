-- TOWER migration 4/9 · ERP (container desk)
set search_path to tower, public;

create table tower.suppliers (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references tower.brands(id),
  name text not null, country text, verified boolean default false,
  qc_history jsonb default '[]', lanes uuid[] default '{}'
);

create table tower.containers (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references tower.brands(id),
  lane_id uuid not null references tower.lanes(id),
  code text unique not null,
  kind text not null default '40HC' check (kind in ('20GP','40GP','40HC','REEFER')),
  capacity_cbm numeric not null,
  mode text not null default 'DEDICATED' check (mode in ('DEDICATED','SHARED')),
  status text not null default 'OPEN'
    check (status in ('OPEN','FILLING','BOOKED','IN_TRANSIT','ARRIVED','CLEARED','CLOSED')),
  route jsonb default '{}',
  public_fill_visible boolean default true,
  created_at timestamptz default now()
);

create table tower.container_commitments (
  id uuid primary key default gen_random_uuid(),
  container_id uuid not null references tower.containers(id) on delete cascade,
  order_id uuid references tower.orders(id),
  account_id uuid references tower.accounts(id),
  cbm numeric not null check (cbm > 0),
  status text not null default 'RESERVED' check (status in ('RESERVED','CONFIRMED','LOADED','RELEASED')),
  created_at timestamptz default now()
);

create table tower.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  container_id uuid references tower.containers(id),
  supplier_id uuid not null references tower.suppliers(id),
  lane_id uuid not null references tower.lanes(id),
  lines jsonb not null,
  total_minor bigint not null, currency text not null default 'USD',
  status text not null default 'ISSUED'
    check (status in ('ISSUED','CONFIRMED','IN_PRODUCTION','QC_PENDING','QC_PASSED','SHIPPED','CANCELLED'))
);

create table tower.qc_checks (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references tower.purchase_orders(id),
  checkpoint text not null, result text check (result in ('PASS','FAIL','CONDITIONAL')),
  evidence jsonb default '[]',
  checked_by uuid references tower.profiles(id), checked_at timestamptz
);

create table tower.trade_documents (
  id uuid primary key default gen_random_uuid(),
  container_id uuid references tower.containers(id),
  order_id uuid references tower.orders(id),
  kind text not null,
  storage_path text not null,
  uploaded_by uuid references tower.profiles(id), uploaded_at timestamptz default now()
);

create table tower.landed_costs (
  container_id uuid primary key references tower.containers(id),
  fob_minor bigint, freight_minor bigint, insurance_minor bigint,
  duties_minor bigint, handling_minor bigint,
  currency text not null default 'USD',
  computed_at timestamptz default now()
);

create index on tower.suppliers (brand_id);
create index on tower.containers (lane_id);
create index on tower.container_commitments (container_id);
create index on tower.container_commitments (order_id);
create index on tower.purchase_orders (container_id);
create index on tower.purchase_orders (supplier_id);
create index on tower.qc_checks (purchase_order_id);
create index on tower.trade_documents (container_id);
