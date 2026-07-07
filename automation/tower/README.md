# TOWER · n8n automation

n8n workflows that drive TOWER's scheduled Intelligence + ops jobs. They run on
the **shared ecosystem n8n instance** (root CLAUDE.md §Stack), in the TOWER
pipeline group. Import each `*.workflow.json` here, set the env vars it needs,
then activate.

## `weekly-lane-brief.workflow.json`

**Trigger:** Schedule — every Monday 07:00 (weekly cron).

**What it does:** fans out to one run per lane, computes the current ISO week
(e.g. `2026-W27`), calls the TOWER brief endpoint per lane, and posts each
returned digest as a **DRAFT for review** — never auto-published. This is the
scheduled twin of `WeeklyBrief` (COMPONENT_TREE §4) and honors the core law:
*Intelligence proposes, humans dispose* (TOWER CLAUDE.md Directive 7).

**Endpoint it calls** (API_MAP.md · Intelligence):

```
POST {TOWER_BASE_URL}/api/ai/brief
Body: { lane, week }
→ { data: { markdown } }   digest markdown (sonnet)
```

The result is forwarded to `TOWER_BRIEF_REVIEW_WEBHOOK` as:

```
POST {TOWER_BRIEF_REVIEW_WEBHOOK}
{ status: "DRAFT", kind: "weekly_lane_brief", lane, week, markdown }
```

Point that webhook at the review inbox that fronts the WhatsApp/email digest
send (a human approves before it goes out).

### Import

1. n8n → **Workflows → Import from File** → select `weekly-lane-brief.workflow.json`.
2. Set the env vars below on the n8n instance (Settings → Variables, or host env).
3. Open the workflow, confirm the Schedule node's timezone matches ops, **Save**,
   then toggle **Active**. (`active` ships `false` — activation is deliberate.)

### Env / webhook it needs

| Var | Purpose |
|-----|---------|
| `TOWER_BASE_URL` | TOWER origin, no trailing slash (e.g. `https://tower.wingsglobaltrade.com`) |
| `TOWER_SERVICE_TOKEN` | Bearer token for the server-to-server call to `/api/ai/brief` |
| `TOWER_BRIEF_LANES` | Comma-separated lane slugs to brief (e.g. `machinery,interiors,provisions`) — add a lane here, no workflow edit |
| `TOWER_BRIEF_REVIEW_WEBHOOK` | URL that receives each `DRAFT` brief for human review before send |

> A new lane needs **zero** workflow edits — append its slug to
> `TOWER_BRIEF_LANES` (ecosystem CLAUDE.md: lane N+1 costs a fraction of lane N).
