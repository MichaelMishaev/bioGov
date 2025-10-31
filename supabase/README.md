# Supabase Database Setup

This directory contains the database schema and migrations for bioGov MVP.

## 📋 Prerequisites

1. **Supabase CLI** (for local development):
   ```bash
   npm install -g supabase
   # or
   brew install supabase/tap/supabase
   ```

2. **Docker Desktop** (required for local Supabase):
   - Download: https://www.docker.com/products/docker-desktop

## 🚀 Quick Start

### Option 1: Use Supabase Cloud (Recommended for MVP)

1. **Create Project**:
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Project name: `biogov-mvp`
   - Database password: (save securely!)
   - Region: `Europe West (Ireland)` (closest to Israel)

2. **Get API Keys**:
   - Go to Project Settings → API
   - Copy:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role secret` key → `SUPABASE_SERVICE_KEY`

3. **Add to `.env.local`**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   ```

4. **Run Migration**:
   ```bash
   cd /Users/michaelmishayev/Desktop/Projects/bioGov

   # Link to your project
   supabase link --project-ref your-project-ref

   # Push migration to Supabase Cloud
   supabase db push
   ```

5. **Verify**:
   - Go to Supabase Dashboard → Table Editor
   - You should see: `users`, `assessments`, `feedback`, `email_logs`

---

### Option 2: Local Development (Optional)

1. **Start Supabase Locally**:
   ```bash
   cd /Users/michaelmishayev/Desktop/Projects/bioGov
   supabase start
   ```

   This will:
   - Start PostgreSQL (port 54322)
   - Start Supabase Studio (http://localhost:54323)
   - Apply migrations automatically
   - Show local API keys

2. **Access Local Studio**:
   - Open: http://localhost:54323
   - View tables, run queries, test RLS policies

3. **Stop Local Supabase**:
   ```bash
   supabase stop
   ```

---

## 📁 Directory Structure

```
supabase/
├── config.toml              # Supabase configuration
├── migrations/
│   └── 001_initial_schema.sql  # Initial database schema
├── functions/               # Edge Functions (future)
│   └── send-results-email/
└── README.md               # This file
```

---

## 🗄️ Database Schema

### Tables

1. **`users`** - User accounts for email delivery
   - `id` (UUID, PK)
   - `email` (TEXT, UNIQUE)
   - `name` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMPTZ)
   - `consent_given` (BOOLEAN)
   - `unsubscribed_at` (TIMESTAMPTZ, nullable)

2. **`assessments`** - VAT registration assessments
   - `id` (UUID, PK)
   - `user_id` (UUID, FK to users, nullable)
   - `answers_json` (JSONB) - Quiz answers
   - `result_status` (TEXT) - פטור, מורשה, or choice
   - `result_checklist` (JSONB) - Action items
   - `ip_hash` (TEXT) - SHA-256 hash for rate limiting
   - `user_agent` (TEXT)
   - `created_at` (TIMESTAMPTZ)

3. **`feedback`** - User ratings and comments
   - `id` (UUID, PK)
   - `user_id` (UUID, FK, nullable)
   - `assessment_id` (UUID, FK)
   - `rating` (INTEGER, 1-5)
   - `comment` (TEXT, max 500 chars)
   - `created_at` (TIMESTAMPTZ)

4. **`email_logs`** - Email delivery tracking
   - `id` (UUID, PK)
   - `user_id` (UUID, FK)
   - `email_type` (TEXT) - results, reminder, welcome
   - `sent_at`, `opened_at`, `clicked_at` (TIMESTAMPTZ)
   - `bounce_reason` (TEXT, nullable)

### Row-Level Security (RLS)

All tables have RLS enabled with the following policies:

- **users**: Anyone can signup, users can read/update own data
- **assessments**: Anyone can create and read (shareable URLs)
- **feedback**: Anyone can submit, only admins can read all
- **email_logs**: Only service role can read/write

### Views

1. **`assessment_stats`** - Aggregated assessment counts by VAT status
2. **`daily_signups`** - Daily user signup trends
3. **`feedback_summary`** - Average rating, positive %, total count

---

## 🔧 Common Operations

### View Tables

```bash
supabase db remote-table list
```

### Run SQL Query

```bash
supabase db remote-sql "SELECT COUNT(*) FROM public.users;"
```

### Reset Database (⚠️ Deletes All Data)

```bash
supabase db reset
```

### Create New Migration

```bash
supabase migration new add_new_feature
# Edit the new file in supabase/migrations/
supabase db push
```

### Export Schema

```bash
supabase db dump --schema public > schema_backup.sql
```

---

## 📊 Sample Queries

### Get Total Assessments by Status

```sql
SELECT
  result_status,
  COUNT(*) AS total
FROM public.assessments
GROUP BY result_status
ORDER BY total DESC;
```

### Get Average Feedback Rating

```sql
SELECT
  AVG(rating) AS avg_rating,
  COUNT(*) AS total_feedback
FROM public.feedback;
```

### Get Recent Signups (Last 7 Days)

```sql
SELECT
  DATE(created_at) AS signup_date,
  COUNT(*) AS signups
FROM public.users
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;
```

### Get Assessments with Feedback

```sql
SELECT
  a.id AS assessment_id,
  a.result_status,
  f.rating,
  f.comment,
  a.created_at
FROM public.assessments a
LEFT JOIN public.feedback f ON a.id = f.assessment_id
ORDER BY a.created_at DESC
LIMIT 10;
```

---

## 🛡️ Security

### Best Practices

1. **Never commit `.env` files** to Git
2. **Use service_role key only in backend** (API routes), never in client
3. **Always use RLS policies** instead of disabling RLS
4. **Hash sensitive data** (e.g., IP addresses) before storing
5. **Validate input** with Zod schemas in API routes

### Testing RLS Policies

```sql
-- Test as anonymous user
SET LOCAL role TO anon;
SELECT * FROM public.users; -- Should return empty (no access)

-- Test as authenticated user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims.sub TO 'user-uuid-here';
SELECT * FROM public.users; -- Should return only that user's data
```

---

## 📧 Email Setup (Future)

To enable email notifications:

1. **Configure SMTP** in Supabase Dashboard → Authentication → Settings
2. **Create Edge Function** for sending emails:
   ```bash
   supabase functions new send-results-email
   ```
3. **Deploy Function**:
   ```bash
   supabase functions deploy send-results-email
   ```

---

## 🐛 Troubleshooting

### Error: "relation does not exist"

- Solution: Run `supabase db push` to apply migrations

### Error: "permission denied for table"

- Solution: Check RLS policies, ensure grants are set correctly

### Error: "password authentication failed"

- Solution: Reset database password in Supabase Dashboard

### Error: "Cannot connect to local Supabase"

- Solution: Ensure Docker is running, try `supabase stop` then `supabase start`

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [JSONB in PostgreSQL](https://www.postgresql.org/docs/current/datatype-json.html)

---

## ✅ Next Steps

After setting up the database:

1. ✅ Database schema created
2. ⬜ Create API routes in `biogov-ui/src/app/api/`
3. ⬜ Implement VAT logic in `lib/vat-logic.ts`
4. ⬜ Build quiz UI components
5. ⬜ Set up email service (Resend.com)
6. ⬜ Deploy to Vercel

---

**Questions?** Check `/docs/MVP/MVP_TECHNICAL_ARCHITECTURE.md` for full implementation details.
