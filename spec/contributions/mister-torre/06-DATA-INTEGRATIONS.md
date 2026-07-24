# 06 — Data Model, Integrations & Permissions

Assumed backend: **Supabase** (Postgres + RLS + Storage + Edge Functions + pgvector). Adapter note: any Postgres works; keep the schema, swap the platform services.

## Core entities (the tower truth Mister reads/writes via tools)

```
clients(id, name, nit, contacts[], language, tone_notes, terms)
suppliers(id, name, country, contacts[], history_rating, negotiated_terms)
imports(id, client_id, supplier_id, machine{make,model,specs,value,weight,dims},
        incoterm, origin_port, dest_port, stage, milestones[], container{...},
        costs{fob,freight,insurance,duties,other,margin,currency,trm_date},
        status, risk_flags[], created_by)
quotes(id, client_id, import_id?, machine{...}, scenarios[{incoterm, landed_cost_breakdown}],
       margin_rule_applied, validity_until, status: draft|sent|won|lost, lost_reason?)
artifacts(id, type, schema_version, payload jsonb, version, status: draft|review|approved|sent|filed,
          parent_id?, sources[], confidence_map, created_by: 'mister'|user_id,
          approved_by?, side_effect_log[])
documents(id, import_id, type, storage_path, extracted jsonb, status, due_date, owner)
rate_tables(id, route, mode, container_type, rate, currency, valid_from, valid_to, source)
tariff_positions(id, hs_code, description, duty_pct, iva_pct, notes, verified_by, verified_at)
org_rules(margin_rules jsonb, incoterm_defaults, ports_default, approval_matrix)
tasks(id, title, entity_ref, owner, due, origin: user|mister_watch|artifact_blocker)
watch_events(id, rule, entity_ref, severity, cost_of_inaction, draft_artifact_id, resolved_by?)
knowledge_chunks(id, embedding vector, text, entity_refs[], doc_type, language, source_ref, date)
audit_log(id, actor, action, entity_ref, tool, model, tokens, sources[], ts)
```

Conventions: money as integer minor units + currency + date (TRM dated for COP); every Mister-visible row carries provenance; soft deletes only.

## Integrations (adapter pattern — `integrations/<name>/`, one interface each)

| Connector | Direction | v1 scope |
|-----------|-----------|----------|
| **Email** (Gmail API or SMTP/IMAP) | in/out | out: approved `comunicacion` sends; in: thread capture onto import records (read-only v1) |
| **WhatsApp** (provider API, e.g. Meta Cloud) | in/out | out: approved messages + brief digests; in: message capture to records |
| **Google Drive** | in | watch `03 Wings` folders → ingest docs to `documents` + corpus (the pipeline already proven in this workspace) |
| **Carrier/vessel tracking** (Marine Traffic-class API or manual paste v0) | in | ETA/discharge events → The Watch |
| **TRM/FX** (banrep/openexchange) | in | dated rates for `compute_landed_cost` |
| **Accounting** (Siigo/Alegra/etc.) | out later | v1: export XLSX; direct write is v2 |

All connectors: server-side, queued (retries + dead-letter), logged to `audit_log`, and **pausable** from Ajustes (05 kill switch).

## Permissions (RLS + tool layer, defense in depth)

| Role | Sees | Approves |
|------|------|----------|
| `direccion` | everything | everything incl. org_rules |
| `comercial` | own clients' records, quotes, rates (sell side) | quotes, client comms |
| `ops` | all imports, documents, suppliers | status reports, supplier/agent comms, checklists |
| `finanzas` | costs, margins, payments, all read | payment comms, cost sheets |

- Mister's tool calls execute **as the requesting operator** (their RLS context) — he can never leak across roles; the Brief is composed per-role server-side.
- `approval_matrix` in org_rules maps artifact type → approving roles; the UI approve button simply isn't rendered otherwise.
- Client-PII never leaves the tower except inside approved artifacts; model calls send only the fields the run needs (context builder whitelists per profile).

## Environments & keys
`.env`: `ANTHROPIC_API_KEY`, `SUPABASE_URL/SERVICE_ROLE (server only)`, connector creds. No key ever in client bundles; edge functions hold connector secrets. Separate `staging` project with anonymized seed data (`seed/demo.sql` ships in repo: 3 clients, 6 imports across stages, rate + tariff samples) so the whole system runs without production data.
