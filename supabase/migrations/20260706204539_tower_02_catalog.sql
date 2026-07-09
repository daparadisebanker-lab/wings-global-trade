-- TOWER migration 2/9 · catalog (PIM)
set search_path to tower, public;

create table tower.spec_schemas (
  id uuid primary key default gen_random_uuid(),
  archetype text not null,
  lane_id uuid references tower.lanes(id),
  version int not null,
  json_schema jsonb not null,
  created_at timestamptz default now(),
  unique (archetype, lane_id, version)
);

create table tower.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references tower.brands(id),
  lane_id uuid not null references tower.lanes(id),
  slug text not null,
  status text not null default 'DRAFT'
    check (status in ('DRAFT','IN_REVIEW','PUBLISHED','RETIRED')),
  category_path text[] not null default '{}',
  name jsonb not null,
  specs jsonb not null default '{}',
  spec_schema_id uuid references tower.spec_schemas(id),
  hs_code text,
  moq numeric, cbm_per_unit numeric,
  created_by uuid references tower.profiles(id),
  updated_at timestamptz default now(),
  unique (lane_id, slug)
);

create table tower.product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references tower.products(id),
  version int not null,
  snapshot jsonb not null,
  published_by uuid references tower.profiles(id),
  published_at timestamptz default now(),
  unique (product_id, version)
);

create table tower.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references tower.products(id) on delete cascade,
  storage_path text not null,
  kind text not null check (kind in ('HERO','GALLERY','TECHNICAL','CERTIFICATE')),
  sort int not null default 0,
  meta jsonb default '{}'
);

create index on tower.products (lane_id);
create index on tower.products (brand_id);
create index on tower.products (status);
create index on tower.product_versions (product_id);
create index on tower.product_media (product_id);
