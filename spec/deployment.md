# Wings Global Trade — Deployment

## Stack

| Layer | Service | Tier |
|-------|---------|------|
| Frontend | Vercel | Pro (or Hobby for staging) |
| Database | Supabase | Pro |
| File Storage | Supabase Storage | Included with Pro |
| AI | Anthropic Claude API | Pay-as-you-go |
| Transactional Email | Resend | Free tier → Pro when needed |
| WhatsApp Notifications | Twilio WhatsApp API | Pay-as-you-go |
| DNS | Cloudflare | Free |
| Domain | wingsglobaltrade.com (assumed) | External registrar |

---

## Repository Structure

```
wings-global-trade/
  .github/
    workflows/
      preview.yml       # Auto-deploy preview on PR
  supabase/
    migrations/
      0001_initial_schema.sql
      0002_seed_categories.sql
      0003_rls_policies.sql
      0004_storage_policies.sql
      0005_fts_index.sql
    seed.sql
    config.toml
  src/
    (Next.js app)
  public/
    fonts/
      flexo-regular.woff2
      flexo-medium.woff2
      flexo-bold.woff2
    images/
      logo.svg
      logo-dark.svg
  .env.local.example
  .gitignore
  next.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
  pnpm-lock.yaml
```

---

## Environment Variables

### `.env.local.example` (committed to repo, without values)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Resend (transactional email)
RESEND_API_KEY=re_...
OPS_EMAIL=ops@wingsglobaltrade.com

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=+14155238886    # Twilio sandbox or approved sender
OPS_WHATSAPP_NUMBER=+51...           # Wings ops WhatsApp number with country code

# App
NEXT_PUBLIC_APP_URL=https://wingsglobaltrade.com
NEXT_PUBLIC_WHATSAPP_DISPLAY=+51 XXX XXX XXX   # Displayed in UI

# Rate limiting (optional — Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

`.env.local` is in `.gitignore`. Never committed.

---

## Supabase Project Setup

### Initial Setup Commands

```bash
# Install Supabase CLI
pnpm add -g supabase

# Login
supabase login

# Initialize (from project root)
supabase init

# Link to remote project
supabase link --project-ref your-project-ref

# Apply migrations to remote
supabase db push

# Generate TypeScript types
supabase gen types typescript --project-id your-project-ref \
  --schema public > src/types/database.generated.ts
```

### Migration Execution Order

```
0001_initial_schema.sql    — Create all tables + indexes + triggers
0002_seed_categories.sql   — Insert 5 catalog categories
0003_rls_policies.sql      — All RLS policies (see data-model.md)
0004_storage_policies.sql  — wings-product-images bucket + read policy
0005_fts_index.sql         — Full-text search index on products
```

### Supabase Storage Configuration

```bash
# Create bucket via CLI or dashboard
# Bucket name: wings-product-images
# Public: true (read-only)
# File size limit: 10MB
# Allowed MIME types: image/jpeg, image/png, image/webp
```

---

## Vercel Deployment

### Project Setup

```bash
# Install Vercel CLI
pnpm add -g vercel

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Vercel Configuration

`next.config.ts`:
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Force server-side rendering for API routes that use service role key
  // Streaming responses for Accio Engine chat
  experimental: {
    serverActions: { allowedOrigins: ['wingsglobaltrade.com'] },
  },
}

export default nextConfig
```

### Vercel Environment Variables

Set in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Environments |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview |
| `ANTHROPIC_API_KEY` | Production, Preview |
| `RESEND_API_KEY` | Production, Preview |
| `OPS_EMAIL` | Production |
| `TWILIO_ACCOUNT_SID` | Production |
| `TWILIO_AUTH_TOKEN` | Production |
| `TWILIO_WHATSAPP_FROM` | Production |
| `OPS_WHATSAPP_NUMBER` | Production |
| `NEXT_PUBLIC_APP_URL` | Production, Preview |
| `NEXT_PUBLIC_WHATSAPP_DISPLAY` | Production, Preview |

Preview environments use staging Supabase project (separate project for isolation).

### Vercel Function Configuration

Accio chat endpoint requires extended timeout (streaming):

```typescript
// src/app/api/accio/chat/route.ts
export const maxDuration = 60  // 60 seconds for streaming response
export const dynamic = 'force-dynamic'
```

---

## Staging vs Production

| Aspect | Staging | Production |
|--------|---------|------------|
| Vercel environment | Preview (auto on PR) | Production |
| Supabase project | wings-staging | wings-production |
| Domain | wings-[branch]-[org].vercel.app | wingsglobaltrade.com |
| WhatsApp notifications | Disabled (log to console only) | Enabled |
| Email notifications | Resend test mode (→ test inbox) | Resend live |
| Claude API | Claude API (same key, lower limits) | Claude API |
| Seed data | Full category + 3 demo products | Full catalog |

Staging WhatsApp behavior: In staging, `sendWhatsAppNotification` checks `process.env.VERCEL_ENV` — if not `'production'`, it logs the payload to console instead of calling Twilio. This prevents ops inbox from receiving test inquiries.

---

## Domain & DNS (Cloudflare)

```
DNS Records:
  A     wingsglobaltrade.com        → Vercel IPs (76.76.19.61)
  CNAME www.wingsglobaltrade.com   → cname.vercel-dns.com
  
Email (for Resend DMARC/DKIM):
  TXT   _dmarc.wingsglobaltrade.com  → "v=DMARC1; p=none; rua=mailto:..."
  TXT   resend._domainkey            → [DKIM key from Resend dashboard]
  TXT   wingsglobaltrade.com         → "v=spf1 include:amazonses.com ~all"
```

Cloudflare proxy (orange cloud): enabled for DDoS protection. SSL: Full (strict). Caching: Cloudflare default for static assets, Vercel handles dynamic.

---

## pnpm Setup

```bash
# Node version requirement
node >= 20.0.0

# Install dependencies
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint
```

`package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "supabase:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID --schema public > src/types/database.generated.ts"
  }
}
```

`.npmrc`:
```
engine-strict=true
```

`package.json`:
```json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

---

## Post-Deployment Checklist

After each production deploy, verify:

- [ ] Homepage loads and category grid renders
- [ ] All 5 catalog category routes return 200
- [ ] `/accio` loads and first AI message appears within 1s
- [ ] Submit a test catalog inquiry → verify Supabase lead row created
- [ ] Submit a test Accio inquiry → verify lead + accio_project rows created
- [ ] Verify ops email received (check ops inbox)
- [ ] Verify WhatsApp message received (check Wings ops WhatsApp)
- [ ] Verify `notification_log` table has entries for both notifications
- [ ] Run Lighthouse on homepage: Performance > 85, Accessibility > 95
- [ ] Verify `robots.txt` allows crawling of catalog pages
- [ ] Verify Open Graph image renders correctly on WhatsApp link preview

---

## Rollback Procedure

Vercel maintains instant rollback to any previous deployment.

```bash
# List recent deployments
vercel ls

# Promote a previous deployment to production
vercel promote [deployment-url]
```

Supabase migrations are forward-only in MVP. No rollback migrations written for initial schema. If data corruption occurs: restore from Supabase daily backup (Pro tier includes point-in-time recovery).
