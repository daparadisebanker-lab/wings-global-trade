-- TOWER · Mister Torre L6 (RAG / company memory) — the knowledge corpus. Chunks are
-- ingested ON ARTIFACT APPROVAL (never from a DRAFT — approved facts only) and via a
-- Drive-folder sync later. Retrieval is HYBRID: pgvector cosine + keyword (tsvector) +
-- entity filter (lib/torre/rag.ts does the ranking math). Freshness law: rates/tariffs are
-- NEVER answered from here — this holds precedent, not prices. RLS + audit per convention.
set search_path to tower, public;

create extension if not exists vector;
create extension if not exists unaccent;

-- unaccent() is only STABLE, so it can't sit directly in a generated column; wrap it in an
-- IMMUTABLE function pinned to the dictionary. This lets the keyword tsvector fold accents
-- (matching lib/torre/rag.ts's client-side norm) AND stem Spanish.
create or replace function tower.immutable_unaccent(text)
  returns text language sql immutable parallel safe
  as $$ select public.unaccent('public.unaccent', $1) $$;

create table if not exists tower.knowledge_chunks (
  id           uuid primary key default gen_random_uuid(),
  brand_id     uuid not null references tower.brands(id),
  lane_id      uuid references tower.lanes(id),
  -- provenance: the source document/artifact this chunk came from (for citations)
  doc_id       text not null,
  title        text not null,
  doc_type     text not null,                 -- 'quote' | 'precedent' | 'sop' | 'acta' | 'email' | …
  chunk_ord    integer not null,
  heading      text,
  content      text not null,
  entity_refs  text[] not null default '{}',  -- account/import/hs ids for the entity-filter leg
  doc_date     date,
  -- embedding is nullable until the embed job runs (MOCK_CONNECTORS: no embed provider yet)
  embedding    vector(1536),
  -- generated keyword vector: Spanish stemming + accent folding, so 'cotización' matches a
  -- query normalized to 'cotizacion' (parity with rag.ts's accent-stripping)
  content_tsv  tsvector generated always as (to_tsvector('spanish', tower.immutable_unaccent(coalesce(heading,'') || ' ' || content))) stored,
  created_at   timestamptz not null default now(),
  unique (brand_id, doc_id, chunk_ord)
);

-- ANN index for cosine similarity (hnsw); keyword GIN index; entity + provenance lookups.
create index if not exists knowledge_chunks_embedding_idx on tower.knowledge_chunks using hnsw (embedding vector_cosine_ops);
create index if not exists knowledge_chunks_tsv_idx on tower.knowledge_chunks using gin (content_tsv);
create index if not exists knowledge_chunks_entity_idx on tower.knowledge_chunks using gin (entity_refs);
create index if not exists knowledge_chunks_brand_doc_idx on tower.knowledge_chunks (brand_id, doc_id);

alter table tower.knowledge_chunks enable row level security;

create policy knowledge_chunks_read on tower.knowledge_chunks for select using (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])
    else tower.has_brand_access(brand_id) end
);
-- Ingest is APPROVED-ONLY: approveTorreDraft (lib/actions/torre-review.ts) inserts the
-- chunks in the APPROVING OPERATOR's context right after the approval claim (approved-only
-- is enforced by that code path — doc_id is free text, not FK-constrained here). So these
-- insert roles MUST stay a SUPERSET of the ai_drafts approve roles (tower_16 ai_drafts_update:
-- LANE_DIRECTOR/TRADE_OPS per lane, group-admin for null lane) — otherwise an operator could
-- approve an artifact whose ingest then fails RLS silently. If approval is ever widened
-- (e.g. COTIZACION → SALES, per tower_51), widen this policy in lockstep. (A future nightly
-- embed/backfill may additionally run as service-role, bypassing RLS.)
create policy knowledge_chunks_write on tower.knowledge_chunks for insert with check (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS'])
    else tower.is_group_admin() end
);
-- Append-only in spirit (a precedent a citation points at must not mutate). Re-ingest
-- supersedes by (brand_id, doc_id, chunk_ord) via the service-role job (which can delete +
-- reinsert, clearing stale trailing chunks); no interactive update/delete policy or grant.

grant select, insert on tower.knowledge_chunks to authenticated;

drop trigger if exists audit_knowledge_chunks on tower.knowledge_chunks;
create trigger audit_knowledge_chunks
  after insert or update or delete on tower.knowledge_chunks
  for each row execute function tower.audit_trigger();

comment on table tower.knowledge_chunks is
  'Mister Torre RAG corpus (L6): approved-only precedent chunks; hybrid vector+keyword+entity retrieval. Never holds live rates/tariffs.';
