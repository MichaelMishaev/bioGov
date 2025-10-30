# bioGov Architecture

## 🏗️ Monorepo Structure (Turborepo + PNPM)

This document explains the complete architecture of bioGov, including the monorepo structure, technology choices, and data flow.

---

## 📂 Directory Structure

```
bioGov/                                      # Monorepo root
├── apps/
│   ├── web/                                 # Main PWA (Next.js 14+)
│   │   ├── src/
│   │   │   ├── app/                         # App Router pages
│   │   │   │   ├── (auth)/                 # Auth routes
│   │   │   │   ├── (dashboard)/            # Protected routes
│   │   │   │   ├── knowledge/              # Knowledge cards
│   │   │   │   ├── forms/                  # Form wizards
│   │   │   │   └── api/                    # API routes
│   │   │   ├── components/                 # App-specific components
│   │   │   ├── lib/                        # App-specific utilities
│   │   │   └── middleware.ts               # Next.js middleware
│   │   ├── public/
│   │   │   ├── manifest.json               # PWA manifest
│   │   │   ├── sw.js                       # Service Worker
│   │   │   └── icons/                      # PWA icons
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── tsconfig.json
│   │
│   ├── admin/                               # Admin Dashboard (Next.js)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── users/                  # User management
│   │   │   │   ├── analytics/              # Usage analytics
│   │   │   │   ├── audit-logs/             # Audit trail viewer
│   │   │   │   └── api/                    # Admin API routes
│   │   │   ├── components/
│   │   │   └── lib/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── strapi/                              # Strapi CMS
│       ├── src/
│       │   ├── api/                         # Content types
│       │   │   ├── knowledge-card/
│       │   │   ├── form-template/
│       │   │   ├── government-link/
│       │   │   └── deadline-override/
│       │   ├── extensions/                  # Custom plugins
│       │   └── admin/                       # Admin panel customization
│       ├── config/
│       │   ├── database.ts                  # Database config
│       │   ├── server.ts                    # Server config
│       │   └── plugins.ts                   # Plugin config
│       ├── public/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── ui/                                  # Shared React components
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Form.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── RTLProvider.tsx             # RTL context provider
│   │   │   └── index.ts                    # Barrel exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/                               # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── user.ts                     # User types
│   │   │   ├── business.ts                 # Business profile types
│   │   │   ├── task.ts                     # Task types
│   │   │   ├── vat.ts                      # VAT-related types
│   │   │   ├── compliance.ts               # Compliance calendar types
│   │   │   ├── government.ts               # Government API types
│   │   │   ├── database.ts                 # Supabase database types
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── supabase/                            # Supabase client wrapper
│   │   ├── src/
│   │   │   ├── client.ts                   # Singleton client
│   │   │   ├── auth.ts                     # Auth helpers
│   │   │   │   ├── signUp()
│   │   │   │   ├── signIn()
│   │   │   │   ├── signOut()
│   │   │   │   ├── requireMFA()
│   │   │   │   └── getCurrentUser()
│   │   │   ├── database.ts                 # Database helpers
│   │   │   │   ├── getUserProfile()
│   │   │   │   ├── getBusinessProfile()
│   │   │   │   ├── getTasks()
│   │   │   │   └── getComplianceCalendar()
│   │   │   ├── storage.ts                  # File storage helpers
│   │   │   │   ├── uploadDocument()
│   │   │   │   ├── downloadDocument()
│   │   │   │   └── deleteDocument()
│   │   │   ├── realtime.ts                 # Real-time subscriptions
│   │   │   │   ├── subscribeToTasks()
│   │   │   │   └── subscribeToCalendar()
│   │   │   └── index.ts
│   │   ├── migrations/                     # SQL migrations
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_rls_policies.sql
│   │   │   └── 003_audit_logs.sql
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── redis/                               # Redis client wrapper
│   │   ├── src/
│   │   │   ├── client.ts                   # Redis singleton
│   │   │   ├── cache.ts                    # Caching utilities
│   │   │   │   ├── cacheCompanyData()
│   │   │   │   ├── cacheLicenseData()
│   │   │   │   └── invalidateCache()
│   │   │   ├── queue.ts                    # Job queue (BullMQ)
│   │   │   │   ├── scheduleVATReminder()
│   │   │   │   ├── processReminderQueue()
│   │   │   │   └── sendPushNotification()
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── israeli-compliance/                  # Israeli compliance utilities
│   │   ├── src/
│   │   │   ├── encryption.ts               # AES-256 encryption
│   │   │   │   ├── encrypt()
│   │   │   │   ├── decrypt()
│   │   │   │   └── hashPassword()
│   │   │   ├── audit.ts                    # Audit logging
│   │   │   │   ├── logAccess()
│   │   │   │   ├── logDataExport()
│   │   │   │   ├── logDataDeletion()
│   │   │   │   └── getAuditTrail()
│   │   │   ├── privacy.ts                  # Privacy utilities
│   │   │   │   ├── anonymizeData()
│   │   │   │   ├── exportUserData()
│   │   │   │   ├── deleteUserData()
│   │   │   │   └── checkPPORequired()
│   │   │   ├── accessibility.ts            # IS-5568 helpers
│   │   │   │   ├── checkContrast()
│   │   │   │   ├── validateARIA()
│   │   │   │   └── generateA11yReport()
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── government-api/                      # Government API clients
│   │   ├── src/
│   │   │   ├── datagovil.ts                # data.gov.il client
│   │   │   │   ├── searchDatasets()
│   │   │   │   ├── getDataset()
│   │   │   │   └── queryDatastore()
│   │   │   ├── ica.ts                      # Company registry (ICA)
│   │   │   │   ├── lookupCompany()
│   │   │   │   ├── getCompanyDetails()
│   │   │   │   └── validateCompanyNumber()
│   │   │   ├── vat.ts                      # Tax Authority
│   │   │   │   ├── verifyVATDealer()
│   │   │   │   ├── getVATDeadlines()
│   │   │   │   └── fillForm821()
│   │   │   ├── licensing.ts                # Business licensing
│   │   │   │   ├── checkLicenseRequirement()
│   │   │   │   ├── getApprovalAuthorities()
│   │   │   │   └── getMunicipalPortal()
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── hebrew-utils/                        # Hebrew RTL utilities
│   │   ├── src/
│   │   │   ├── rtl.ts                      # RTL helpers
│   │   │   │   ├── getTextDirection()
│   │   │   │   ├── reverseForPDF()
│   │   │   │   └── mirrorLayout()
│   │   │   ├── date.ts                     # Israeli date formatting
│   │   │   │   ├── formatDate()            # DD/MM/YYYY
│   │   │   │   ├── formatHebrewDate()      # Hebrew calendar
│   │   │   │   ├── getJewishHolidays()
│   │   │   │   └── isShabbat()
│   │   │   ├── currency.ts                 # Shekel formatting
│   │   │   │   ├── formatCurrency()        # ₪123.45
│   │   │   │   └── parseCurrency()
│   │   │   ├── validation.ts               # Israeli validation
│   │   │   │   ├── validateIsraeliID()     # Teudat Zehut (9 digits)
│   │   │   │   ├── validateBankAccount()   # Israeli bank format
│   │   │   │   ├── validatePhoneNumber()   # 05X-XXXXXXX
│   │   │   │   └── validateVATNumber()
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── eslint-config/                       # Shared ESLint config
│   │   ├── index.js
│   │   └── package.json
│   │
│   └── typescript-config/                   # Shared TypeScript configs
│       ├── base.json                        # Base config
│       ├── nextjs.json                      # Next.js specific
│       ├── react-library.json               # React libraries
│       └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml                           # Turborepo CI/CD
│       ├── deploy-web.yml                   # Deploy main PWA
│       ├── deploy-admin.yml                 # Deploy admin
│       ├── deploy-strapi.yml                # Deploy Strapi
│       └── link-check.yml                   # Weekly link health check
│
├── supabase/
│   ├── migrations/                          # Database migrations
│   ├── functions/                           # Edge functions
│   └── config.toml                          # Supabase config
│
├── docker/
│   ├── docker-compose.yml                   # Local dev stack
│   ├── redis.dockerfile
│   └── strapi.dockerfile
│
├── pnpm-workspace.yaml                      # PNPM workspaces config
├── turbo.json                               # Turborepo pipeline
├── package.json                             # Root package.json
├── pnpm-lock.yaml                           # Lockfile
├── .env.example                             # Environment variables template
└── README.md
```

---

## 🔧 Technology Stack Details

### **1. Monorepo Management**

**Turborepo + PNPM**

Why this combo:
- ✅ **Turborepo**: Task orchestration, remote caching, dependency graphing
- ✅ **PNPM**: Efficient disk usage (content-addressable storage), fast installs
- ✅ **Best for Next.js**: First-class Vercel integration

**turbo.json** (pipeline configuration):
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

**pnpm-workspace.yaml**:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

### **2. Database & Auth: Supabase**

**Why Supabase over Firebase:**
- ✅ PostgreSQL (relational) vs Firebase (NoSQL)
- ✅ Self-hostable in Israel (data residency compliance)
- ✅ Built-in auth + database + storage + real-time (all-in-one)
- ✅ Row-Level Security (database enforces privacy)
- ✅ SQL queries (complex JOINs for compliance reports)
- ✅ Lower cost ($25/month vs $30-50/month)

**Supabase Features Used:**

1. **Authentication**
   - Email/password signup
   - Social login (Google)
   - Multi-Factor Authentication (MFA)
   - Magic links
   - Row-Level Security integration

2. **Database (PostgreSQL)**
   - Relational data (users, profiles, tasks, calendar)
   - Encrypted columns (PII data)
   - Audit logs (7-year retention)
   - Full-text search (Hebrew support)

3. **Storage**
   - User-uploaded documents (IDs, bank statements)
   - Form templates (PDFs)
   - Generated reports

4. **Real-time**
   - Live task updates
   - Compliance calendar notifications
   - Multi-user collaboration (future)

5. **Edge Functions** (optional)
   - Server-side PDF generation
   - Webhook handlers for government APIs

**Database Schema:**
See `packages/supabase/migrations/` for full schema.

**Row-Level Security (RLS) Example:**
```sql
-- Users can only see their own data
CREATE POLICY "Users view own profile"
ON business_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can only update their own tasks
CREATE POLICY "Users update own tasks"
ON tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM business_profiles
    WHERE id = tasks.profile_id
    AND user_id = auth.uid()
  )
);

-- Audit logs are read-only for users
CREATE POLICY "Users view own audit logs"
ON audit_logs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "No user updates to audit logs"
ON audit_logs FOR UPDATE
USING (false);
```

---

### **3. Cache & Jobs: Redis**

**Why Redis:**
- ✅ **Fast caching** (in-memory, sub-millisecond latency)
- ✅ **Job queues** (BullMQ for VAT deadline reminders)
- ✅ **Session storage** (faster than database queries)
- ✅ **Rate limiting** (prevent brute-force attacks)

**Use Cases:**

1. **Government API Caching**
   ```typescript
   // Cache company data from data.gov.il (24 hours)
   const cacheKey = `company:${companyNumber}`;
   const cached = await redis.get(cacheKey);

   if (cached) return JSON.parse(cached);

   const company = await datagovil.lookupCompany(companyNumber);
   await redis.setex(cacheKey, 86400, JSON.stringify(company));
   return company;
   ```

2. **VAT Deadline Reminder Queue**
   ```typescript
   import { Queue, Worker } from 'bullmq';

   const reminderQueue = new Queue('vat-reminders', {
     connection: redisConnection,
   });

   // Schedule reminder (7 days before deadline)
   await reminderQueue.add('vat-deadline', {
     userId: 'user-123',
     deadline: '2025-11-15',
     dealerType: 'monthly',
   }, {
     delay: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
   });

   // Worker processes reminders
   const worker = new Worker('vat-reminders', async (job) => {
     await sendPushNotification(job.data.userId, {
       title: 'תזכורת מע"מ / VAT Reminder',
       body: `מועד הגשה: ${job.data.deadline}`,
     });
   }, { connection: redisConnection });
   ```

3. **Session Storage**
   ```typescript
   // Store user session (1 hour expiry)
   await redis.setex(`session:${userId}`, 3600, JSON.stringify({
     userId,
     email,
     role,
     lastActive: Date.now(),
   }));
   ```

4. **Rate Limiting**
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

**Hosting Options:**
- **Development**: Docker (`docker run -d -p 6379:6379 redis:alpine`)
- **Production**: Upstash (serverless, free tier) or self-hosted (AWS ElastiCache, Azure Cache)

---

### **4. CMS: Strapi**

**Why Strapi:**
- ✅ **Non-developers can update content** (visual editor)
- ✅ **Multi-language support** (i18n plugin for Hebrew/English)
- ✅ **Versioning** (track changes, revert mistakes)
- ✅ **API-first** (REST + GraphQL for Next.js consumption)
- ✅ **Self-hostable** (data stays in Israel)
- ✅ **Free & open-source**

**Content Types:**

1. **Knowledge Card**
   - `title` (i18n: he, en)
   - `content` (rich text, i18n)
   - `category` (enum: VAT, NI, Licensing, Forms)
   - `officialSource` (URL to gov.il)
   - `lastVerified` (date)
   - `reviewDate` (date)
   - `status` (enum: active, needs_review, link_broken)
   - `relatedCards` (relation to other cards)

2. **Form Template**
   - `name` (i18n)
   - `formNumber` (e.g., "821")
   - `pdfUrl` (file upload)
   - `requiredDocuments` (array of objects)
   - `governmentService` (relation to GovernmentLink)
   - `instructions` (rich text, i18n)

3. **Government Link**
   - `title` (i18n)
   - `url` (URL)
   - `organization` (enum: Tax Authority, NI, Licensing, etc.)
   - `lastChecked` (date)
   - `status` (enum: active, broken, moved)
   - `archiveUrl` (URL to Wayback Machine or local archive)

4. **Deadline Override**
   - `period` (month/year)
   - `normalDeadline` (date)
   - `adjustedDeadline` (date)
   - `reason` (text: "Passover", "Rosh Hashanah", etc.)
   - `officialNotice` (URL)

**API Integration:**
```typescript
// In Next.js app
import { strapiClient } from '@biogov/strapi-client';

// Fetch knowledge card
const card = await strapiClient.get('/knowledge-cards', {
  params: {
    filters: { slug: 'what-is-vat' },
    locale: 'he',
    populate: '*',
  },
});

// Result:
{
  id: 1,
  title: "מהו מע\"מ?",
  content: "מס ערך מוסף (מע\"מ) הוא מס עקיף...",
  officialSource: "https://www.gov.il/...",
  lastVerified: "2025-10-30",
}
```

---

### **5. Frontend: Next.js 14+**

**App Router Features:**
- ✅ **Server Components** (faster initial load)
- ✅ **Server Actions** (form submissions without API routes)
- ✅ **Route Groups** (organize routes without affecting URL)
- ✅ **Metadata API** (SEO optimization)
- ✅ **Suspense & Streaming** (progressive rendering)

**PWA Configuration:**
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  reactStrictMode: true,
  i18n: {
    locales: ['he', 'en'],
    defaultLocale: 'he',
  },
  experimental: {
    serverActions: true,
  },
});
```

**Offline Strategy:**
```typescript
// Service Worker (sw.js)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('biogov-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/offline',
        '/knowledge',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/offline');
      });
    })
  );
});
```

---

## 📊 Data Flow

### **1. User Registration Flow**

```
User clicks "Sign Up"
   ↓
Next.js Form (apps/web/src/app/auth/signup)
   ↓
Server Action (apps/web/src/app/actions/auth.ts)
   ↓
Supabase Auth (@biogov/supabase)
   ├─ Create user account (auth.users)
   ├─ Send email verification
   └─ Return session token
   ↓
Create business profile (PostgreSQL)
   ├─ Insert into business_profiles table
   └─ Set RLS policies
   ↓
Log audit event (@biogov/israeli-compliance)
   └─ Insert into audit_logs table
   ↓
Redirect to onboarding flow
```

### **2. VAT Deadline Reminder Flow**

```
User completes business setup
   ↓
Determine VAT reporting frequency (monthly/bi-monthly)
   ↓
Calculate next deadline (@biogov/hebrew-utils)
   ├─ Apply 15th/16th/23rd rule
   ├─ Check holiday overrides (Strapi API)
   └─ Adjust for Shabbat
   ↓
Schedule reminder (Redis queue)
   ├─ 7 days before deadline
   ├─ 3 days before deadline
   └─ 1 day before deadline
   ↓
Worker processes queue (@biogov/redis)
   ├─ Check if task completed (Supabase)
   └─ If not completed → Send push notification
   ↓
User receives notification (FCM)
   └─ Click → Open app → Mark as completed
```

### **3. Company Lookup Flow**

```
User enters company number
   ↓
Next.js API Route (apps/web/src/app/api/company/lookup)
   ↓
Check Redis cache (@biogov/redis)
   ├─ Cache hit → Return cached data
   └─ Cache miss ↓
   ↓
Call data.gov.il API (@biogov/government-api)
   ├─ Query ICA company registry
   └─ Parse response
   ↓
Cache result (Redis, 24 hour TTL)
   ↓
Return to frontend
   ├─ Prefill form fields
   └─ Display company info
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflows**

bioGov uses **5 automated workflows** for continuous integration and deployment:

#### **1. CI Pipeline** (`.github/workflows/ci.yml`)

```
Trigger: Push to main/develop, Pull Requests
├─ Lint & Type Check (parallel)
├─ Test with coverage (parallel)
├─ Build all apps
├─ Accessibility testing (IS-5568)
├─ Security scan (npm audit + Snyk)
└─ Database migrations check
```

**Key Features:**
- ⚡ **Turborepo Remote Caching** (10x faster builds)
- 🔄 **Parallel execution** (lint + test simultaneously)
- ♿ **Accessibility** (automated IS-5568 compliance checks)
- 🔒 **Security** (dependency scanning, SAST)
- 📊 **Coverage reports** (Codecov integration)

#### **2. Deploy Web (PWA)** (`.github/workflows/deploy-web.yml`)

```
Trigger: Push to main (if apps/web changed)
├─ Build with Turborepo
├─ Deploy to Vercel (Israel-friendly CDN)
├─ Smoke tests (Playwright)
└─ Comment on PR with preview URL
```

**Deployment:** Vercel auto-deployment
- Production: https://biogov.il
- Preview: https://biogov-pr-123.vercel.app (every PR)

#### **3. Deploy Strapi** (`.github/workflows/deploy-strapi.yml`)

```
Trigger: Push to main (if apps/strapi changed)
├─ Build Strapi
├─ Build Docker image
├─ Push to AWS ECR (il-central-1)
├─ SSH to EC2 and deploy
└─ Health check
```

**Deployment:** AWS EC2 (Tel Aviv region) via Docker

#### **4. Government Links Health Check** (`.github/workflows/link-check.yml`)

```
Trigger: Every Monday 9 AM (cron)
├─ Check all gov.il links
├─ Generate report
└─ Create GitHub issue if broken links found
```

**Purpose:** Monitor government links (they change frequently!)

#### **5. Supabase Migrations** (`.github/workflows/supabase-migrations.yml`)

```
Trigger: Push to main (if supabase/migrations changed)
├─ Lint migrations
├─ Test locally (Docker)
├─ Apply to production
└─ Regenerate TypeScript types
```

**Auto-commits:** Updates `packages/types/src/database.ts`

### **CI/CD Performance**

| Phase | Without Cache | With Turborepo Cache |
|-------|---------------|---------------------|
| Lint | 5 min | 2 min |
| Test | 10 min | 3 min (cache) |
| Build | 15 min | 5 min (cache) |
| **Total** | **30 min** | **5 min** ⚡ |

**Improvement:** 6x faster with remote caching!

---

## 🚀 Deployment Architecture

### **Development Environment**

```
Developer machine
├─ apps/web → localhost:3000
├─ apps/admin → localhost:3001
├─ apps/strapi → localhost:1337
├─ Supabase → localhost:54321 (Docker)
└─ Redis → localhost:6379 (Docker)
```

### **Production Environment** (Israeli Hosting)

```
┌─────────────────────────────────────────────┐
│        Vercel (or AWS Israel region)        │
│  ┌────────────┐         ┌────────────┐     │
│  │  apps/web  │         │ apps/admin │     │
│  │  (PWA)     │         │ (Dashboard)│     │
│  │  Next.js   │         │  Next.js   │     │
│  └────────────┘         └────────────┘     │
└─────────────────────────────────────────────┘
              ↓                      ↓
┌─────────────────────────────────────────────┐
│          Supabase (Self-hosted)             │
│       AWS Israel region (Tel Aviv)          │
│  ┌──────────────────────────────────────┐   │
│  │  PostgreSQL (RDS or EC2)             │   │
│  │  - Users, Profiles, Tasks, Logs      │   │
│  │  - Encrypted PII                     │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Auth Server                         │   │
│  │  - MFA, Social login                 │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Storage (S3)                        │   │
│  │  - User documents                    │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│        Redis (Upstash or ElastiCache)       │
│  - Caching (government API responses)       │
│  - Job queue (VAT reminders)                │
│  - Session storage                          │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│     Strapi CMS (Docker on AWS EC2)          │
│  - Knowledge cards                          │
│  - Form templates                           │
│  - Government links                         │
└─────────────────────────────────────────────┘
```

---

## 🔐 Security Architecture

### **Data Encryption**

1. **At Rest** (Supabase PostgreSQL)
   - AES-256 encryption for sensitive columns (ID numbers, bank accounts)
   - Encrypted backups
   - Key rotation every 90 days

2. **In Transit**
   - TLS 1.3 for all connections
   - HTTPS only (HSTS headers)
   - Certificate pinning for mobile app

3. **In Use**
   - Row-Level Security (RLS) enforces access control at database level
   - JWT tokens for API authentication
   - MFA required for sensitive operations

### **Audit Logging**

All actions logged to `audit_logs` table:
- User logins/logouts
- Data access (who viewed what, when)
- Data modifications (who changed what)
- Data exports/deletions
- Permission changes
- Security incidents

**Retention**: 7 years (Israeli regulatory requirement)

---

## 📈 Scalability Considerations

### **Current Scale (MVP)**
- **Users**: 100-1,000
- **Database**: Supabase free tier (500MB)
- **Redis**: Upstash free tier (10K commands/day)
- **Strapi**: Single EC2 instance

### **Future Scale (Growth)**
- **Users**: 10,000-100,000
- **Database**: Supabase Pro ($25/month) or self-hosted (RDS Multi-AZ)
- **Redis**: Upstash Pro or ElastiCache cluster
- **Strapi**: Kubernetes cluster with load balancer
- **CDN**: CloudFront (Israel edge location) for static assets

---

## 🎯 Key Architectural Decisions

### **1. Why Monorepo?**
- ✅ Shared types prevent API/frontend mismatches
- ✅ Atomic commits (update API + frontend together)
- ✅ Faster refactoring (change shared code, see impact everywhere)
- ✅ Code reuse (Israeli compliance utils used by all apps)

### **2. Why Turborepo over NX?**
- ✅ Simpler learning curve (better for small team)
- ✅ First-class Next.js support
- ✅ Vercel integration (remote caching)
- ✅ Less configuration overhead

### **3. Why Supabase over Firebase?**
- ✅ PostgreSQL (relational) for complex queries
- ✅ Self-hostable in Israel (data residency)
- ✅ All-in-one (auth + DB + storage + realtime)
- ✅ Row-Level Security (privacy compliance)

### **4. Why Redis?**
- ✅ Required for job queues (VAT reminders)
- ✅ Fast caching (government APIs can be slow)
- ✅ Session storage (faster than DB queries)
- ✅ Industry standard (easy to hire developers)

### **5. Why Strapi?**
- ✅ Non-developers can update content (critical!)
- ✅ Content changes frequently (government rules)
- ✅ Multi-language support (Hebrew/English)
- ✅ Free & self-hostable

---

## 🛠️ Development Workflow

### **Day-to-Day Development**

1. **Create new feature branch**
   ```bash
   git checkout -b feature/vat-calculator
   ```

2. **Add shared types** (if needed)
   ```bash
   cd packages/types
   # Edit src/vat.ts
   ```

3. **Implement in web app**
   ```bash
   cd apps/web
   pnpm dev
   # Develop feature
   ```

4. **Write tests**
   ```bash
   pnpm test --filter=@biogov/utils
   ```

5. **Type-check entire monorepo**
   ```bash
   pnpm typecheck
   ```

6. **Lint and format**
   ```bash
   pnpm lint --fix
   pnpm format
   ```

7. **Build to verify**
   ```bash
   pnpm build --filter=web
   ```

8. **Commit (Turborepo caches successful builds)**
   ```bash
   git commit -m "feat: add VAT calculator"
   git push
   ```

9. **CI/CD runs** (uses remote cache)
   - Lint, typecheck, test, build
   - Only rebuilds changed packages
   - Deploys to staging

---

## 📚 Additional Resources

- **Turborepo Docs**: https://turbo.build/repo/docs
- **Supabase Docs**: https://supabase.com/docs
- **Strapi Docs**: https://docs.strapi.io
- **Next.js App Router**: https://nextjs.org/docs/app
- **PNPM Workspaces**: https://pnpm.io/workspaces
- **BullMQ (Redis Queue)**: https://docs.bullmq.io

---

## 🤝 Contributing

See individual package READMEs for detailed contribution guidelines.

**Key Principles:**
1. **Type safety first** - No `any` types
2. **Test critical paths** - Especially Israeli compliance logic
3. **Document government APIs** - Links change frequently
4. **Accessibility always** - IS-5568 compliance is law
5. **Privacy by design** - Minimize PII collection
