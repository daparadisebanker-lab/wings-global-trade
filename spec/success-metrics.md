# Wings Global Trade — Success Metrics

## North Star Metric

**Inquiry Conversion Rate (ICR)**

```
ICR = Total qualified submissions / Total unique visitors × 100
```

A "qualified submission" is defined as:
- A catalog inquiry form submission that passes Zod validation and creates a `leads` row, OR
- An Accio Engine submission where TPR `completeness` is `'minimum'` or `'complete'`

Contact form submissions (flow: 'contact') are excluded from ICR — they are not primary funnel events.

**Baseline assumption:** A well-optimized B2B trade platform targeting warm traffic should achieve 2–4% ICR. Wings should target 3%+ at steady state, given high purchase intent of the target audience.

---

## Conversion Funnel Definition

### Catalog Flow Funnel

```
Stage 1 — Landing       Unique visitors to homepage or catalog
Stage 2 — Engaged       Clicked a category tile or product card (pageview on /catalogo/*)
Stage 3 — Interested    Opened a product detail page (/catalogo/[category]/[slug])
Stage 4 — Intent        Scrolled to or clicked the inquiry form (form visible)
Stage 5 — Converted     Submitted inquiry (POST /api/leads/catalog → 201)
```

| Funnel Stage | Measurement Method |
|---|---|
| Landing | Vercel Analytics unique visitors |
| Engaged | Navigation event (Next.js route change to /catalogo/*) |
| Interested | Product page pageview |
| Intent | Form interaction (focus on first field) |
| Converted | Successful API response (logged in Supabase) |

Expected drop-off: 60–70% between each stage is normal for cold traffic. Target is to minimize drop-off between Interested → Converted.

### Accio Engine Funnel

```
Stage 1 — Entry         Unique visitors to /accio
Stage 2 — Engaged       Sent at least 1 message to Accio chat
Stage 3 — TPR Partial   Captured ≥ 3 TPR fields (product, quantity, destination)
Stage 4 — TPR Minimum   Accio project reaches completeness = 'minimum' (5+ fields)
Stage 5 — Estimate      CIF estimate generated and displayed
Stage 6 — Converted     Submitted Accio lead (POST /api/accio/submit → 201)
```

The Accio funnel is longer and will have lower volume but higher lead quality. Target: 25%+ conversion from Stage 2 (engaged) to Stage 6 (converted).

---

## KPIs

### Primary KPIs (measured weekly)

| KPI | Definition | Target (steady state) |
|-----|-----------|----------------------|
| Inquiry Conversion Rate | Submissions / Unique visitors | ≥ 3% |
| Catalog ICR | Catalog submissions / Catalog unique visitors | ≥ 4% |
| Accio ICR | Accio submissions / Accio page visitors | ≥ 15% |
| Leads per week | Total new leads in `leads` table | ≥ 10 by day 60 |
| Lead response time | Time from submission to ops WhatsApp reply | < 4 hours |

### Secondary KPIs (measured monthly)

| KPI | Definition | Target |
|-----|-----------|--------|
| TPR Completeness Rate | Accio leads with completeness = 'complete' / Total Accio leads | ≥ 60% |
| Catalog engagement depth | Avg product pages per session | ≥ 2.5 |
| Search-to-route accuracy | Search queries correctly routed (inferred from bounce rate) | ≥ 75% |
| Notification delivery rate | Notifications sent without error / Total notifications | ≥ 98% |
| Page performance | Core Web Vitals LCP | < 2.5s |
| Mobile conversion parity | Mobile ICR / Desktop ICR | ≥ 0.7 |

### Lead Quality Metrics (Accio Engine)

| Metric | Definition | Target |
|--------|-----------|--------|
| TPR completeness at submission | % of 10 fields captured | ≥ 70% (7/10 fields) |
| CIF estimate present | Accio leads with estimate at submission | ≥ 80% |
| HS code confidence | Leads where AI confirmed HS code | ≥ 50% |
| Contact info quality | Leads where phone passes E.164 validation | ≥ 95% |
| Multi-market leads | Leads for non-Peru/Chile destinations | tracked (no target) |

---

## 30 / 60 / 90 Day Targets

### Day 30 — Launch Validation

**Objective:** Confirm the platform works end-to-end and first real leads are arriving.

| Target | Success Criteria |
|--------|-----------------|
| Platform live | Vercel production URL resolves, all flows functional |
| First lead | ≥ 1 catalog inquiry submitted by a real buyer |
| First Accio lead | ≥ 1 Accio Engine submission |
| Notification reliability | 100% of test submissions trigger WhatsApp + email |
| No critical bugs | Zero 500 errors on primary flows in past 7 days |
| Catalog content | ≥ 10 products across ≥ 3 categories in database |
| Performance | Lighthouse Performance score ≥ 80 on homepage |

Leads target: ≥ 5 total by day 30 (driven by direct outreach from Wings team).

### Day 60 — Channel Activation

**Objective:** Organic and referral traffic beginning. ICR measurable.

| Target | Success Criteria |
|--------|-----------------|
| Unique visitors | ≥ 200 unique visitors in the month |
| Total leads | ≥ 20 cumulative leads |
| ICR | Measurable (enough traffic to compute, target ≥ 2%) |
| Catalog breadth | ≥ 25 products across all 5 categories |
| Accio completeness | ≥ 3 Accio leads with TPR completeness = 'complete' |
| Search routing | Search bar in active use (event tracking shows > 10 searches/week) |
| Ops workflow | Wings team responds to all leads within 4 hours |

### Day 90 — Optimization Phase

**Objective:** ICR optimized. Pipeline visible. Free zone value proposition proven.

| Target | Success Criteria |
|--------|-----------------|
| ICR | ≥ 3% overall |
| Total leads | ≥ 60 cumulative |
| Accio leads | ≥ 20 Accio submissions (≥ 30% of total) |
| Qualified leads | ≥ 40% of Accio leads with full TPR (all 10 fields) |
| Multi-country | ≥ 3 distinct destination countries represented in leads |
| CIF estimate usage | ≥ 80% of Accio leads include CIF estimate |
| Free zone pipeline | ≥ 1 Accio lead converted to active Wings project |
| SEO | ≥ 5 catalog product pages indexed in Google |

---

## Measurement Implementation

### What Gets Tracked Without Analytics Tools

The Supabase `leads` table is the primary source of truth. Every lead contains:
- `flow` (catalog / accio / contact) — for flow segmentation
- `destination_country` — for market analysis
- `created_at` — for time-series analysis
- `accio_project_id` — joins to TPR completeness data

SQL query for weekly conversion report:
```sql
SELECT
  date_trunc('week', created_at) AS week,
  flow,
  count(*) AS leads,
  count(DISTINCT destination_country) AS markets
FROM leads
GROUP BY 1, 2
ORDER BY 1 DESC;
```

SQL query for Accio quality:
```sql
SELECT
  ap.completeness,
  count(*) AS count,
  round(avg(
    CASE WHEN ap.fob_estimate_usd IS NOT NULL THEN 1 ELSE 0 END
  ) * 100, 1) AS pct_with_estimate
FROM accio_projects ap
GROUP BY ap.completeness;
```

### Vercel Analytics

Enable Vercel Analytics (built-in) for:
- Unique visitor counts
- Page view breakdown by route
- Core Web Vitals per page

No third-party analytics in MVP (no cookie banner required for Vercel Analytics).

### Notification Health Monitoring

```sql
-- Check notification failure rate (run weekly)
SELECT
  channel,
  status,
  count(*) AS count,
  round(count(*) * 100.0 / sum(count(*)) OVER (PARTITION BY channel), 2) AS pct
FROM notification_log
WHERE created_at > now() - interval '7 days'
GROUP BY channel, status
ORDER BY channel, status;
```

Alert threshold: If WhatsApp or email failure rate exceeds 5% in any week, investigate immediately.

---

## Definition of Failure

The platform is not working if:
1. ICR stays below 1% after 60 days of real traffic (conversion problem)
2. Ops receives leads but cannot follow up within 24 hours (process problem)
3. Accio Engine leads arrive with average TPR completeness below 50% (AI quality problem)
4. Notification delivery rate drops below 95% (infrastructure problem)
5. Any production incident causes loss of lead data (data integrity problem)

---

## What Success Looks Like at 6 Months

One Wings sales cycle (custom machinery order) facilitated through the platform with ZOFRATACNA processing justifies the entire platform investment. The platform's financial case is made by a single qualified Accio Engine lead that converts to a container shipment.

At 6 months, the platform should be generating ≥ 20 qualified leads per month, of which ≥ 5 are Accio Engine leads with full TPR and CIF estimates. Wings ops should be closing ≥ 2 transactions per month traceable to platform inquiries.
