# CI/CD Pipeline Documentation

## 🚀 Overview

bioGov uses **GitHub Actions** with **Turborepo remote caching** for fast, efficient CI/CD pipelines.

### Key Features
- ⚡ **Turborepo Remote Caching** - Reuses build artifacts across CI runs (10x faster)
- 🔄 **Parallel Jobs** - Lint, test, and build run simultaneously
- 🎯 **Smart Deployments** - Only deploy changed apps
- ✅ **Israeli Compliance** - Automated accessibility and security checks
- 🔗 **Link Monitoring** - Weekly government link health checks

---

## 📋 Workflows

### 1. **CI Pipeline** (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**

```
┌──────────────────────────────────────────┐
│          1. Lint & Type Check            │
│          (10 minutes)                    │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│          2. Test (with coverage)         │
│          (15 minutes)                    │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│          3. Build (all apps)             │
│          (20 minutes)                    │
└──────────────────────────────────────────┘
                  ↓
┌────────────────┬────────────┬────────────┐
│  4. A11y Test  │ 5. Security│ 6. Database│
│  (IS-5568)     │    Scan    │ Migrations │
└────────────────┴────────────┴────────────┘
                  ↓
┌──────────────────────────────────────────┐
│      7. Deployment Summary               │
└──────────────────────────────────────────┘
```

**Key Features:**
- **Turborepo Remote Caching**: Reuses builds from local dev
- **Parallel Execution**: Lint and test run simultaneously
- **Accessibility Testing**: Ensures IS-5568 (WCAG 2.0 AA) compliance
- **Security Scanning**: npm audit + Snyk
- **Coverage Reports**: Uploads to Codecov

---

### 2. **Deploy Web (PWA)** (`.github/workflows/deploy-web.yml`)

**Triggers:**
- Push to `main` (if `apps/web/**` or `packages/**` changed)
- Manual trigger

**Deployment Target:** Vercel

**Steps:**
1. Build with Turborepo (uses remote cache)
2. Deploy to Vercel
3. Run smoke tests (Playwright)
4. Comment on PR with preview URL

**Environment Variables Required:**
```bash
VERCEL_TOKEN              # Vercel API token
VERCEL_ORG_ID            # Vercel organization ID
VERCEL_PROJECT_ID_WEB    # Vercel project ID for web app
SUPABASE_URL             # Production Supabase URL
SUPABASE_ANON_KEY        # Production Supabase anon key
STRAPI_URL               # Production Strapi URL
```

---

### 3. **Deploy Strapi CMS** (`.github/workflows/deploy-strapi.yml`)

**Triggers:**
- Push to `main` (if `apps/strapi/**` changed)
- Manual trigger

**Deployment Target:** AWS EC2 (Israel region) via Docker

**Steps:**
1. Build Strapi with Turborepo
2. Build Docker image
3. Push to Amazon ECR (il-central-1 region)
4. SSH to EC2 and deploy container
5. Health check

**Environment Variables Required:**
```bash
AWS_ACCESS_KEY_ID           # AWS credentials
AWS_SECRET_ACCESS_KEY       # AWS credentials
EC2_HOST                    # EC2 instance IP
EC2_USERNAME                # SSH username
EC2_SSH_KEY                 # SSH private key
STRAPI_DB_HOST              # PostgreSQL host
STRAPI_DB_PORT              # PostgreSQL port
STRAPI_DB_NAME              # Database name
STRAPI_DB_USERNAME          # Database username
STRAPI_DB_PASSWORD          # Database password
STRAPI_ADMIN_JWT_SECRET     # JWT secret for admin
STRAPI_API_TOKEN_SALT       # API token salt
```

---

### 4. **Government Links Health Check** (`.github/workflows/link-check.yml`)

**Triggers:**
- Every Monday at 9 AM Israel time (cron)
- Manual trigger

**Purpose:** Monitor all government links (gov.il, btl.gov.il, data.gov.il) for breakage

**Steps:**
1. Run link checker script
2. Generate report
3. If broken links found → Create GitHub issue
4. Upload report as artifact

**Output:** Automated issue creation with:
- List of broken links
- Priority labels (critical/medium/low)
- Action items for team

---

### 5. **Supabase Migrations** (`.github/workflows/supabase-migrations.yml`)

**Triggers:**
- Push to `main` (if `supabase/migrations/**` changed)
- Manual trigger

**Steps:**
1. Lint migrations (`supabase db lint`)
2. Test locally (Docker)
3. Apply to production Supabase
4. Regenerate TypeScript types
5. Auto-commit updated types

**Environment Variables Required:**
```bash
SUPABASE_PROJECT_REF     # Supabase project reference
SUPABASE_ACCESS_TOKEN    # Supabase API token
SUPABASE_DB_PASSWORD     # Database password
```

---

## 🔧 Setup Instructions

### Step 1: Configure GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### **Turborepo Secrets**
```bash
TURBO_TOKEN=<your-vercel-token>
TURBO_TEAM=<your-vercel-team-slug>
```

Get these from: https://vercel.com/account/tokens

#### **Vercel Secrets**
```bash
VERCEL_TOKEN=<vercel-api-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID_WEB=<web-project-id>
```

Get `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID_WEB`:
```bash
cd apps/web
vercel link
cat .vercel/project.json
```

#### **Supabase Secrets**
```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_PROJECT_REF=<project-ref>
SUPABASE_ACCESS_TOKEN=<access-token>
SUPABASE_DB_PASSWORD=<db-password>
```

Get these from: https://supabase.com/dashboard/project/_/settings/api

#### **AWS Secrets** (for Strapi deployment)
```bash
AWS_ACCESS_KEY_ID=<aws-access-key>
AWS_SECRET_ACCESS_KEY=<aws-secret-key>
EC2_HOST=<ec2-ip-address>
EC2_USERNAME=ubuntu
EC2_SSH_KEY=<private-key-content>
```

#### **Strapi Secrets**
```bash
STRAPI_URL=https://strapi.biogov.il
STRAPI_DB_HOST=<rds-endpoint>
STRAPI_DB_PORT=5432
STRAPI_DB_NAME=strapi
STRAPI_DB_USERNAME=strapi
STRAPI_DB_PASSWORD=<secure-password>
STRAPI_ADMIN_JWT_SECRET=<random-64-char-string>
STRAPI_API_TOKEN_SALT=<random-64-char-string>
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### **Optional Secrets**
```bash
CODECOV_TOKEN=<codecov-token>         # For coverage reports
SNYK_TOKEN=<snyk-token>               # For security scanning
```

---

### Step 2: Enable GitHub Actions

1. Go to **Settings → Actions → General**
2. **Workflow permissions**: Select "Read and write permissions"
3. **Allow GitHub Actions to create and approve pull requests**: ✅ Enable

---

### Step 3: Configure Turborepo Remote Cache

**Option A: Vercel Remote Cache** (Recommended)

Already configured! Just add `TURBO_TOKEN` and `TURBO_TEAM` secrets.

**Option B: GitHub Actions Cache** (Free alternative)

Already configured via `rharkor/caching-for-turbo@v1.5` action.

**Option C: Self-hosted S3 Cache** (Advanced)

See: https://turbo.build/repo/docs/core-concepts/remote-caching#self-hosting

---

## 📊 CI/CD Performance

### **Before Turborepo (estimated)**
```
Lint:  5 minutes
Test:  10 minutes
Build: 15 minutes
Total: 30 minutes (sequential)
```

### **With Turborepo + Remote Cache**
```
Lint:  2 minutes (parallel)
Test:  3 minutes (parallel, cached)
Build: 5 minutes (cached from local dev)
Total: 5 minutes (parallel + cache hits)
```

**Improvement:** 6x faster ⚡

---

## 🎯 Deployment Strategies

### **Web App (PWA)**

**Strategy:** Vercel auto-deployment

- **Production**: `main` branch → https://biogov.il
- **Preview**: Every PR → https://biogov-pr-123.vercel.app
- **Staging**: `develop` branch → https://staging.biogov.il

**Rollback:** Instant via Vercel dashboard

### **Admin Dashboard**

**Strategy:** Same as Web App (separate Vercel project)

- **Production**: `main` branch → https://admin.biogov.il

### **Strapi CMS**

**Strategy:** Blue-Green deployment on EC2

1. Deploy new Docker container
2. Health check (30 seconds)
3. If healthy → stop old container
4. If unhealthy → rollback

**Rollback:**
```bash
# SSH to EC2
ssh ubuntu@<ec2-ip>

# List recent images
docker images | grep biogov-strapi

# Run previous version
docker run -d --name strapi <previous-image-id>
```

---

## 🔒 Security Best Practices

### **1. Secret Scanning**

GitHub automatically scans for exposed secrets. Additional protection:

```yaml
# .github/workflows/secret-scan.yml
- name: 🔍 Scan for secrets
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event.repository.default_branch }}
    head: HEAD
```

### **2. Dependency Scanning**

Automated via `npm audit` and Snyk in CI pipeline.

**Fix vulnerabilities:**
```bash
pnpm audit --fix
```

### **3. SAST (Static Application Security Testing)**

**CodeQL** (optional):
```yaml
# .github/workflows/codeql.yml
- uses: github/codeql-action/init@v3
  with:
    languages: javascript, typescript
```

---

## 🧪 Testing Strategy

### **Unit Tests**
```bash
pnpm turbo test
```

Runs Jest tests for all packages.

### **Integration Tests**
```bash
pnpm turbo test:integration
```

Tests API endpoints with Supabase local instance.

### **E2E Tests (Playwright)**
```bash
pnpm --filter=web run test:e2e
```

Tests critical user flows:
- User registration
- VAT calculator
- Form submission
- Offline mode

### **Accessibility Tests**
```bash
pnpm turbo test:a11y
```

Runs Axe accessibility checker:
- Color contrast (WCAG AA)
- Keyboard navigation
- Screen reader compatibility
- Hebrew RTL layout

### **Smoke Tests (Post-Deployment)**
```bash
PLAYWRIGHT_TEST_BASE_URL=https://biogov.il pnpm test:e2e:smoke
```

Quick sanity checks:
- Homepage loads
- Login works
- API responds

---

## 📈 Monitoring

### **Build Monitoring**

GitHub Actions dashboard shows:
- Build duration trends
- Success/failure rate
- Cache hit rate

### **Deployment Monitoring**

**Vercel:**
- https://vercel.com/dashboard/deployments
- Real-time logs
- Performance metrics

**Strapi:**
```bash
# View logs
ssh ubuntu@<ec2-ip>
docker logs -f strapi

# Monitor resources
docker stats strapi
```

### **Uptime Monitoring**

**Recommended:** UptimeRobot or Pingdom

Monitor:
- https://biogov.il (Web App)
- https://admin.biogov.il (Admin)
- https://strapi.biogov.il/_health (Strapi)

---

## 🚨 Troubleshooting

### **Build Fails with "Turborepo cache error"**

**Solution:**
```bash
# Clear remote cache
pnpm turbo run build --force

# Or use GitHub Actions cache instead
# Already configured in workflows
```

### **Vercel Deployment Fails**

**Check:**
1. `VERCEL_TOKEN` is valid
2. `VERCEL_PROJECT_ID_WEB` matches project
3. Build succeeds locally: `pnpm turbo build --filter=web`

**Debug:**
```bash
vercel logs <deployment-url>
```

### **Strapi Deployment Fails**

**SSH to EC2 and check:**
```bash
ssh ubuntu@<ec2-ip>

# Check container status
docker ps -a

# View logs
docker logs strapi

# Check disk space
df -h

# Check memory
free -m
```

### **Migrations Fail**

**Rollback:**
```bash
supabase db reset --linked
```

**Check migration syntax:**
```bash
supabase db lint
```

---

## 📚 Additional Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Turborepo CI Docs**: https://turbo.build/repo/docs/crafting-your-repository/constructing-ci
- **Vercel Deployment**: https://vercel.com/docs/deployments
- **Supabase CLI**: https://supabase.com/docs/guides/cli
- **Playwright CI**: https://playwright.dev/docs/ci

---

## ✅ Checklist: Production-Ready CI/CD

- [ ] All GitHub secrets configured
- [ ] Turborepo remote cache enabled
- [ ] Vercel projects linked
- [ ] AWS EC2 set up (Israel region)
- [ ] Supabase production instance created
- [ ] Domain names configured (biogov.il, admin.biogov.il, strapi.biogov.il)
- [ ] SSL certificates installed
- [ ] Monitoring tools configured (UptimeRobot, Sentry)
- [ ] Backup strategy implemented
- [ ] Rollback procedures documented
- [ ] Team trained on CI/CD workflows
