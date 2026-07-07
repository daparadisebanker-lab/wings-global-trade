-- TOWER migration 1/9 · schema + identity & access + RLS helper functions
create schema if not exists tower;
set search_path to tower, public;

create table tower.brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz default now()
);

create table tower.lanes (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references tower.brands(id),
  code text unique not null,
  slug text not null,
  name text not null,
  archetype text not null check (archetype in
    ('EQUIPMENT','PROJECT','COMMODITY','PROGRAM','CREDENTIAL','ORIGIN')),
  status text not null default 'OPENING' check (status in ('OPENING','ACTIVE','ARCHIVED')),
  config jsonb not null default '{}',
  unique (brand_id, slug)
);

create table tower.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  is_group_admin boolean not null default false,
  created_at timestamptz default now()
);

create table tower.lane_memberships (
  user_id uuid not null references tower.profiles(id) on delete cascade,
  lane_id uuid not null references tower.lanes(id),
  role text not null check (role in
    ('LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER')),
  primary key (user_id, lane_id, role)
);

create or replace function tower.is_group_admin() returns boolean
language sql stable security definer set search_path = tower, public as
$$ select coalesce((select is_group_admin from tower.profiles where id = auth.uid()), false) $$;

create or replace function tower.has_lane_role(p_lane uuid, p_roles text[]) returns boolean
language sql stable security definer set search_path = tower, public as
$$ select tower.is_group_admin() or exists (
     select 1 from tower.lane_memberships m
     where m.user_id = auth.uid() and m.lane_id = p_lane and m.role = any(p_roles)) $$;

create index on tower.lanes (brand_id);
create index on tower.lane_memberships (lane_id);
