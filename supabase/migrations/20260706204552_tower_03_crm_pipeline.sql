-- TOWER migration 3/9 · CRM (pipeline)
set search_path to tower, public;

create table tower.accounts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references tower.brands(id),
  name text not null,
  country text, region text,
  archetype_profile text,
  score int default 0,
  created_at timestamptz default now()
);

create table tower.contacts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references tower.accounts(id) on delete cascade,
  full_name text not null, email text, whatsapp text, role text
);

create table tower.rfqs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references tower.brands(id),
  lane_id uuid not null references tower.lanes(id),
  account_id uuid references tower.accounts(id),
  source text not null check (source in ('MISTER','RFQ_FORM','WHATSAPP','MANUAL','ADVISOR')),
  stage text not null,
  owner_id uuid references tower.profiles(id),
  mister_session_id uuid,
  currency text default 'USD',
  created_at timestamptz default now()
);

create table tower.rfq_lines (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references tower.rfqs(id) on delete cascade,
  product_id uuid references tower.products(id),
  description text,
  qty numeric not null,
  unit text not null,
  target_price_minor bigint, currency text default 'USD'
);

create table tower.quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references tower.rfqs(id),
  version int not null default 1,
  lines jsonb not null,
  total_minor bigint not null, currency text not null default 'USD',
  status text not null default 'DRAFT' check (status in ('DRAFT','SENT','ACCEPTED','REJECTED','EXPIRED')),
  valid_until date,
  created_by uuid references tower.profiles(id),
  created_at timestamptz default now()
);

create table tower.orders (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references tower.quotes(id),
  brand_id uuid not null references tower.brands(id),
  lane_id uuid not null references tower.lanes(id),
  account_id uuid not null references tower.accounts(id),
  status text not null default 'CONTRACTED'
    check (status in ('CONTRACTED','IN_PRODUCTION','READY','SHIPPED','DELIVERED','CLOSED','CANCELLED')),
  incoterm text, created_at timestamptz default now()
);

create index on tower.accounts (brand_id);
create index on tower.contacts (account_id);
create index on tower.rfqs (lane_id);
create index on tower.rfqs (account_id);
create index on tower.rfq_lines (rfq_id);
create index on tower.quotes (rfq_id);
create index on tower.orders (lane_id);
create index on tower.orders (account_id);
