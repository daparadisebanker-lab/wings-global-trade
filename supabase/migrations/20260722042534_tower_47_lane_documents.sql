-- tower_47 · Documents / Drive hub — a per-brand (optionally per-lane) store for
-- the operating documents that don't live anywhere structured yet: spec sheets,
-- supplier docs, certificates, and saved quotations. Mister will pull from this
-- (Slice 3D). Numbered 47 to clear PR #4's 39–42 and the RB fiche 43–46.
--
-- Filename version (20260722042534) matches the version this migration was
-- recorded under when applied to the wings-operations project.
-- ------------------------------------------------------------
-- STORAGE ACCESS MODEL — identical to tower_34 (product-media / brand-kits):
-- the `lane-documents` bucket is PRIVATE with NO storage.objects policy. Every
-- read/write is brokered by a server action (documents.ts) that authorizes the
-- caller against the shipped predicates (has_brand_access / has_brand_role) and
-- only then asks the SERVICE-ROLE client to mint a signed upload/download URL.
-- Nothing is reachable except through a server-issued signed URL — "nothing
-- public by default" holds by construction.
--
-- Idempotent: safe to re-apply.

-- ── The index table ─────────────────────────────────────────────────────────
create table if not exists tower.documents (
  id           uuid primary key default gen_random_uuid(),
  brand_id     uuid not null references tower.brands(id),
  lane_id      uuid references tower.lanes(id),          -- null = brand-wide
  title        text not null,
  kind         text not null default 'DOCUMENT'
                 check (kind in ('SPEC_SHEET','QUOTATION','SUPPLIER_DOC','CERTIFICATE','DOCUMENT')),
  storage_path text not null,
  mime_type    text,
  size_bytes   bigint,
  meta         jsonb not null default '{}',
  uploaded_by  uuid references tower.profiles(id),
  created_at   timestamptz not null default now()
);

create index if not exists documents_brand_created_idx on tower.documents (brand_id, created_at desc);
create index if not exists documents_lane_created_idx  on tower.documents (lane_id, created_at desc);
create index if not exists documents_kind_idx           on tower.documents (kind);

-- ── RLS — read = any brand member; write/remove = the operating roles ────────
alter table tower.documents enable row level security;

create policy documents_read on tower.documents for select
  using (tower.has_brand_access(brand_id));

create policy documents_ins on tower.documents for insert
  with check (tower.has_brand_role(brand_id, array['LANE_DIRECTOR','TRADE_OPS','CATALOG_EDITOR','SALES']));

-- A drive needs removal (a wrong upload); gated to the write roles. The storage
-- object is cleaned up by the server action via the service role.
create policy documents_del on tower.documents for delete
  using (tower.has_brand_role(brand_id, array['LANE_DIRECTOR','TRADE_OPS','CATALOG_EDITOR']));

grant select, insert, delete on tower.documents to authenticated;

-- ── Audit (generic fn from migration 7) ──────────────────────────────────────
drop trigger if exists audit_documents on tower.documents;
create trigger audit_documents
  after insert or update or delete on tower.documents
  for each row execute function tower.audit_trigger();

-- ── The private bucket ───────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lane-documents',
  'lane-documents',
  false,
  52428800, -- 50 MiB — documents run larger than product images
  array[
    'application/pdf',
    'image/png','image/jpeg','image/webp',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword','application/vnd.ms-excel',
    'text/csv','text/plain'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
