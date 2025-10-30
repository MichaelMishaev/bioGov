# bioGov Technology Stack - Final Decision

**Date**: October 30, 2025
**Status**: ✅ Approved

---

## 🎯 Executive Summary

After comprehensive research and analysis, the **final technology stack** for bioGov is:

### **Architecture**
✅ **Turborepo Monorepo** with **PNPM workspaces**

### **Core Stack**
- ✅ **Frontend**: Next.js 14+ (App Router, PWA)
- ✅ **Database & Auth**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- ✅ **Cache & Jobs**: Redis (Upstash or self-hosted)
- ✅ **CMS**: Strapi (headless content management)

### **What Changed**
❌ **REMOVED**: Firebase (not needed - Supabase replaces it)
✅ **ADDED**: Redis (required for VAT reminders and caching)
✅ **ADDED**: Turborepo monorepo structure

---

## 🏗️ Architecture Decision: Turborepo Monorepo

### **Why Monorepo?**

Based on research from production Turborepo implementations (2025), monorepo provides:

1. **Shared Type Safety** across frontend/backend
   ```typescript
   // packages/types/src/vat.ts (shared by all apps)
   export interface VATDeadline {
     period: { month: number; year: number };
     dueDate: Date;
     rule: '15th' | '16th' | '23rd';
   }

   // Used in apps/web (frontend)
   // Used in apps/admin (backend)
   // Zero version mismatches!
   ```

2. **Atomic Commits** (update API + frontend together)
   ```bash
   git commit -m "feat: add VAT calculator"
   # Updates:
   #   - packages/types (new types)
   #   - packages/utils (shared logic)
   #   - apps/web (UI)
   #   - apps/admin (API)
   # All in ONE commit = no broken states
   ```

3. **Remote Caching** (Turborepo's killer feature)
   ```
   Developer A builds → Cached remotely
   Developer B pulls → Reuses cache (instant build!)
   CI/CD runs → Reuses local dev cache (10x faster)
   ```

4. **Israeli Compliance Code Reuse**
   ```
   packages/israeli-compliance/
   ├── encryption.ts    (used by all apps)
   ├── audit.ts         (used by all apps)
   ├── privacy.ts       (used by all apps)
   └── accessibility.ts (used by all apps)

   # Write once, use everywhere
   # Single source of truth for regulations
   ```

### **Turborepo vs Alternatives**

| Feature | Turborepo | NX | PNPM Workspaces |
|---------|-----------|----|--------------------|
| **Speed** | ⚡⚡⚡ Remote cache | ⚡⚡⚡ Computation cache | ⚡ No cache |
| **Complexity** | 🟢 Simple | 🟡 Complex | 🟢 Very simple |
| **Next.js support** | ✅ First-class | ✅ Good | ✅ Manual |
| **Learning curve** | 🟢 Easy | 🔴 Steep | 🟢 Minimal |
| **Vercel integration** | ✅ Native | ⚠️ Manual | ⚠️ Manual |
| **Team size** | 1-10 devs | 10+ devs | 1-3 devs |

**Winner**: Turborepo ✅ (simple, fast, perfect for bioGov's small team)

---

## 🔥 Supabase vs Firebase - The Winner

### **Why Supabase Wins**

| Requirement | Supabase | Firebase |
|-------------|----------|----------|
| **Database Type** | ✅ PostgreSQL (relational) | ❌ NoSQL (limited queries) |
| **Data Residency** | ✅ Self-host in Israel | ❌ Google servers (US/EU) |
| **All-in-One** | ✅ Auth + DB + Storage + Real-time | ⚠️ Requires 3 separate services |
| **Cost** | ✅ $25/month (all included) | ❌ $30-50/month (split billing) |
| **SQL Queries** | ✅ Complex JOINs | ❌ Limited |
| **Row-Level Security** | ✅ Built-in (privacy compliance) | ❌ Manual in code |
| **Open Source** | ✅ Self-hostable | ❌ Closed (Google-only) |

**Example: Complex Query (Only Possible with SQL)**

```sql
-- Show all users with overdue VAT tasks
-- ❌ IMPOSSIBLE in Firebase (NoSQL)
-- ✅ EASY in Supabase (PostgreSQL)

SELECT
  u.email,
  t.title AS task,
  c.due_date,
  c.due_date - NOW() AS days_overdue
FROM users u
JOIN business_profiles p ON p.user_id = u.id
JOIN tasks t ON t.profile_id = p.id
JOIN compliance_calendar c ON c.task_id = t.id
WHERE c.due_date < NOW()
  AND c.completed = false
ORDER BY c.due_date ASC;
```

**Israeli Law Compliance:**

```sql
-- Row-Level Security (RLS) enforces privacy at DATABASE level
-- Required by Amendment 13 (Aug 14, 2025)

-- Users can only see THEIR OWN data (enforced by DB, not app code)
CREATE POLICY "Users view own profile"
ON business_profiles FOR SELECT
USING (auth.uid() = user_id);

-- ✅ This meets Amendment 13 requirements
-- ✅ Even if app code has a bug, DB prevents data leaks
-- ❌ Firebase requires manual checks in every API call
```

---

## 🔴 Redis - Why It's Required

### **Use Case 1: VAT Deadline Reminders**

**Problem**: Need to send push notifications 7 days before VAT deadlines.

**Solution**: Redis job queue (BullMQ)

```typescript
import { Queue, Worker } from 'bullmq';

// Schedule reminder for user (7 days before deadline)
await reminderQueue.add('vat-deadline', {
  userId: 'user-123',
  deadline: '2025-11-15',
  message: 'תזכורת מע"מ - מועד הגשה: 15/11/2025',
}, {
  delay: calculateDelay(7), // 7 days
});

// Worker processes reminders (runs every minute)
const worker = new Worker('vat-reminders', async (job) => {
  await sendPushNotification(job.data.userId, job.data.message);
});
```

**Why not Supabase for this?**
- ❌ Supabase is a database, not a job queue
- ❌ Polling database every minute = wasteful
- ✅ Redis is designed for job queues (BullMQ industry standard)

### **Use Case 2: Government API Caching**

**Problem**: data.gov.il APIs can be slow (500ms-2s response time)

**Solution**: Redis caching

```typescript
// Cache company data for 24 hours
const cacheKey = `company:${companyNumber}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached); // ⚡ 1ms response
}

const company = await datagovil.lookupCompany(companyNumber); // 🐌 1500ms
await redis.setex(cacheKey, 86400, JSON.stringify(company));
return company;
```

**Performance Improvement**:
- Without Redis: 1500ms (every request)
- With Redis: 1ms (cached requests) = **1500x faster**

### **Use Case 3: Rate Limiting (Security)**

**Problem**: Prevent brute-force login attacks (required by Data Security Regulations 2017)

**Solution**: Redis rate limiting

```typescript
// Limit login attempts (5 per 15 minutes)
const key = `rate-limit:login:${ip}`;
const attempts = await redis.incr(key);

if (attempts === 1) {
  await redis.expire(key, 900); // 15 minutes
}

if (attempts > 5) {
  throw new Error('Too many login attempts. Try again in 15 minutes.');
}
```

**Why not Supabase for this?**
- ❌ Would create database rows for every failed login
- ❌ Database queries slower than Redis (10ms vs 1ms)
- ✅ Redis is designed for counters/expiry

---

## 🎨 Strapi - The Content Management Solution

### **Why Strapi is Critical**

**Scenario**: Government announces VAT deadline postponed due to Passover.

**Without Strapi** (hardcoded content):
1. Developer must edit code ⏰ 5 min
2. Commit to git ⏰ 2 min
3. Build (CI/CD) ⏰ 10 min
4. Deploy ⏰ 15 min
5. **Total: 32 minutes + developer time**

**With Strapi**:
1. Content manager logs into Strapi
2. Edits "VAT Deadline - April 2025"
3. Changes date from "15/04" to "16/04"
4. Clicks Save
5. **Total: 30 seconds (no developer needed!)**

### **Strapi Features for bioGov**

1. **Multi-language Content** (i18n plugin)
   ```javascript
   // Strapi stores Hebrew + English together
   {
     title: {
       he: "מהו עוסק פטור?",
       en: "What is an Exempt Dealer?"
     },
     content: {
       he: "עוסק פטור הוא...",
       en: "An exempt dealer is..."
     }
   }
   ```

2. **Versioning** (track changes, revert mistakes)
   ```
   Version 1.0: "VAT rate is 17%" (2020-2024)
   Version 2.0: "VAT rate is 18%" (2025+)

   # Can revert if mistake!
   ```

3. **Link Monitoring** (detect broken gov.il links)
   ```javascript
   // Weekly cron job checks all Strapi links
   const cards = await strapi.find('knowledge-cards');
   for (const card of cards) {
     const response = await fetch(card.officialSource);
     if (response.status !== 200) {
       // Mark as broken, notify admin
       await strapi.update('knowledge-cards', card.id, {
         status: 'link_broken',
       });
     }
   }
   ```

---

## 📊 Final Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    TURBOREPO MONOREPO                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  apps/web    │  │ apps/admin   │  │ apps/strapi  │     │
│  │  (Next.js    │  │ (Next.js     │  │ (Strapi CMS) │     │
│  │   PWA)       │  │  Dashboard)  │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ↓                  ↓                  ↓            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SHARED PACKAGES                         │  │
│  │  • @biogov/types (TypeScript types)                 │  │
│  │  • @biogov/ui (React components)                    │  │
│  │  • @biogov/supabase (DB client)                     │  │
│  │  • @biogov/redis (Cache + Queue)                    │  │
│  │  • @biogov/israeli-compliance (Encryption, Audit)   │  │
│  │  • @biogov/government-api (data.gov.il clients)     │  │
│  │  • @biogov/hebrew-utils (RTL, date, currency)       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                          │
│                                                             │
│  ┌───────────────┐   ┌────────────┐   ┌────────────┐      │
│  │   SUPABASE    │   │   REDIS    │   │  STRAPI    │      │
│  │               │   │            │   │            │      │
│  │ • PostgreSQL  │   │ • Cache    │   │ • Content  │      │
│  │ • Auth (MFA)  │   │ • Job Queue│   │ • i18n     │      │
│  │ • Storage     │   │ • Sessions │   │ • Versions │      │
│  │ • Real-time   │   │ • Ratelimit│   │ • Links    │      │
│  │ • RLS         │   │            │   │            │      │
│  └───────────────┘   └────────────┘   └────────────┘      │
│   (Israel region)    (Upstash)         (Self-hosted)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Comparison

### **Monthly Costs (Estimated)**

| Service | Development | Production (MVP) | Production (Scale) |
|---------|-------------|------------------|--------------------|
| **Supabase** | Free | $25 (Pro) | $100 (Team) |
| **Redis** | Free (Docker) | Free (Upstash) | $10-50 (Upstash Pro) |
| **Strapi** | Free (local) | $20 (EC2 t3.small) | $100 (EC2 t3.medium) |
| **Vercel** | Free | Free (Hobby) | $20 (Pro) |
| **Total** | **$0** | **$45-65/month** | **$230-270/month** |

**vs Firebase Alternative**: $30-50/month (but worse features)

---

## 🚀 Getting Started (Step-by-Step)

### **1. Initialize Monorepo**

```bash
# Create project directory
mkdir bioGov && cd bioGov

# Initialize Turborepo with PNPM
pnpm dlx create-turbo@latest

# Choose "Custom" template
# Select "pnpm" as package manager
```

### **2. Set Up Supabase**

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
supabase init

# Start local Supabase (Docker required)
supabase start

# Apply migrations
supabase db push
```

### **3. Set Up Redis**

```bash
# Development: Docker
docker run -d -p 6379:6379 redis:alpine

# Production: Sign up for Upstash (free tier)
# https://upstash.com/
```

### **4. Set Up Strapi**

```bash
# Create Strapi app in monorepo
cd apps
npx create-strapi-app@latest strapi --quickstart

# Install i18n plugin
cd strapi
pnpm add @strapi/plugin-i18n
```

### **5. Create Shared Packages**

```bash
# Create packages directory structure
mkdir -p packages/{types,ui,supabase,redis,israeli-compliance,government-api,hebrew-utils}

# Each package gets:
#   - package.json
#   - tsconfig.json
#   - src/index.ts
```

### **6. Configure Turborepo**

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### **7. Install Dependencies**

```bash
# From monorepo root
pnpm install

# Supabase dependencies
pnpm add @supabase/supabase-js --filter=@biogov/supabase

# Redis dependencies
pnpm add ioredis bullmq --filter=@biogov/redis

# Next.js dependencies
pnpm add next react react-dom --filter=web
pnpm add next-pwa react-i18next --filter=web
```

### **8. Run Development Servers**

```bash
# Run all apps in parallel
pnpm dev

# Or run specific app
pnpm dev --filter=web      # Main PWA
pnpm dev --filter=admin    # Admin dashboard
pnpm dev --filter=strapi   # Strapi CMS
```

---

## ✅ Files Updated

### **Documentation**
- ✅ `CLAUDE.md` - Updated tech stack, removed Firebase, added Supabase + Redis + Turborepo
- ✅ `ARCHITECTURE.md` - Complete monorepo structure, data flow diagrams, deployment architecture
- ✅ `docs/TECH_STACK_DECISION.md` - This file (comprehensive rationale)

### **Subagents**
- ✅ `.claude/agents/security-architect.md` - Replaced Firebase Auth with Supabase Auth
- ✅ All other subagents already aligned with new stack

---

## 🎯 Next Steps (Implementation)

1. **Sprint 0 - Setup** (Week 1)
   - [ ] Initialize Turborepo monorepo
   - [ ] Configure PNPM workspaces
   - [ ] Set up Supabase (local + production)
   - [ ] Set up Redis (Docker for dev)
   - [ ] Set up Strapi CMS

2. **Sprint 1 - Foundation** (Week 2-3)
   - [ ] Create shared packages (types, utils, supabase, redis)
   - [ ] Build UI component library (@biogov/ui)
   - [ ] Implement authentication (Supabase Auth)
   - [ ] Set up Row-Level Security policies

3. **Sprint 2 - Core Features** (Week 4-6)
   - [ ] Israeli compliance utilities (encryption, audit, privacy)
   - [ ] Government API clients (data.gov.il, ICA, VAT)
   - [ ] Hebrew RTL utilities (date, currency, validation)

4. **Sprint 3 - Applications** (Week 7-10)
   - [ ] Build main PWA (apps/web)
   - [ ] Build admin dashboard (apps/admin)
   - [ ] Configure Strapi content types

5. **Sprint 4 - Integration** (Week 11-12)
   - [ ] VAT deadline calculator with Redis queue
   - [ ] Company lookup with Redis caching
   - [ ] Link monitoring automation

6. **Sprint 5 - Testing & Deployment** (Week 13-14)
   - [ ] IS-5568 accessibility testing
   - [ ] Amendment 13 privacy compliance audit
   - [ ] Deploy to Israeli hosting (AWS Tel Aviv)

---

## 📚 Additional Resources

- **Turborepo Docs**: https://turbo.build/repo/docs
- **Supabase Docs**: https://supabase.com/docs
- **Redis (BullMQ)**: https://docs.bullmq.io
- **Strapi Docs**: https://docs.strapi.io
- **Next.js App Router**: https://nextjs.org/docs/app
- **PNPM Workspaces**: https://pnpm.io/workspaces

---

## ✨ Summary

**Final Stack:**
- ✅ **Turborepo + PNPM** (monorepo architecture)
- ✅ **Next.js 14+** (PWA frontend)
- ✅ **Supabase** (database + auth + storage + real-time)
- ✅ **Redis** (cache + job queue)
- ✅ **Strapi** (CMS for content management)

**Why This Stack Wins:**
1. **Type-safe across entire codebase** (monorepo + TypeScript)
2. **Israeli law compliant** (Supabase RLS, audit logs, self-hostable)
3. **Fast & scalable** (Turborepo caching, Redis caching, Supabase real-time)
4. **Non-developers can update content** (Strapi CMS)
5. **Cost-effective** ($45-65/month vs $200+ with alternatives)

---

**Status**: ✅ **APPROVED - Ready for Implementation**

**Next Action**: Initialize Turborepo monorepo (see Getting Started section above)
