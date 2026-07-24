-- TOWER · Mister Torre L6 (RAG / company memory) — the knowledge corpus. Chunks are
-- ingested ON ARTIFACT APPROVAL (never from a DRAFT — approved facts only) and via a
-- Drive-folder sync later. Retrieval is HYBRID: pgvector cosine + keyword (tsvector) +
-- entity filter (lib/torre/rag.ts does the ranking math). Freshness law: rates/tariffs are
-- NEVER answered from here — this holds precedent, not prices. RLS + audit per convention.
set search_path to tower, public;

create extension if not exists vector;

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
  -- generated keyword vector for the hybrid keyword leg (Spanish + unaccent-friendly)
  content_tsv  tsvector generated always as (to_tsvector('simple', coalesce(heading,'') || ' ' || content)) stored,
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
-- Ingest happens on approval via a privileged path; interactive write mirrors the
-- operational roles that can approve the source artifact.
create policy knowledge_chunks_write on tower.knowledge_chunks for insert with check (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS'])
    else tower.is_group_admin() end
);
-- Corpus is append-only in spirit (a precedent a citation points at must not mutate);
-- re-ingest supersedes by (brand_id, doc_id, chunk_ord). No update policy/grant.

grant select, insert on tower.knowledge_chunks to authenticated;

drop trigger if exists audit_knowledge_chunks on tower.knowledge_chunks;
create trigger audit_knowledge_chunks
  after insert or update or delete on tower.knowledge_chunks
  for each row execute function tower.audit_trigger();

comment on table tower.knowledge_chunks is
  'Mister Torre RAG corpus (L6): approved-only precedent chunks; hybrid vector+keyword+entity retrieval. Never holds live rates/tariffs.';
