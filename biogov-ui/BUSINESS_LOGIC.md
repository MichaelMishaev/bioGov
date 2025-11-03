# bioGov Business Logic & User Journey

## Complete User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  BIOGOV USER JOURNEY                         │
└─────────────────────────────────────────────────────────────┘

1. 🎯 QUIZ (Optional Entry Point)
   URL: /quiz
   ├─> 5 questions about business
   ├─> Calculates VAT status recommendation
   ├─> Stores result in sessionStorage
   └─> Redirects to: /signup

2. 📝 SIGNUP
   URL: /signup
   ├─> User creates account (email, password, name, consent)
   ├─> POST /api/auth/signup
   ├─> Creates user record in database
   ├─> Auto-login (sets JWT cookies)
   └─> Redirects to: /onboarding

3. 🔧 ONBOARDING (Multi-Step Form)
   URL: /onboarding

   Step 1: Business Type
   ├─> עוסק פטור (Exempt Dealer) - Revenue < 102,292 ₪
   ├─> עוסק מורשה (Authorized Dealer) - Revenue > 102,292 ₪
   └─> חברה בע״מ (Ltd Company)

   Step 2: Industry Selection
   ├─> ייעוץ וניהול (Consulting & Management)
   ├─> הייטק ופיתוח תוכנה (Tech & Software Development)
   ├─> מסעדות ומזון (Restaurants & Food)
   ├─> קמעונאות ומסחר (Retail & Commerce)
   └─> ... more options

   Step 3: Business Details
   ├─> Municipality (עיריה)
   ├─> Employee Count
   └─> Submit

   Backend Actions:
   ├─> POST /api/business-profiles (creates profile)
   ├─> POST /api/tasks/generate (generates compliance tasks)
   └─> Redirects to: /dashboard?welcome=true

4. 📊 DASHBOARD
   URL: /dashboard
   ├─> Displays compliance tasks
   ├─> Upcoming deadlines
   ├─> Progress tracking
   └─> Task management
```

## Database Schema

### Key Tables

#### users
- `id` (uuid, PK)
- `email` (unique)
- `name`
- `password_hash`
- `email_verified` (boolean)
- `consent_given` (boolean)
- `created_at`, `updated_at`

#### business_profiles
- `id` (uuid, PK)
- `user_id` (FK → users.id, unique)
- `business_type` (enum: sole_proprietor, partnership, company, nonprofit, cooperative)
- `vat_status` (enum: exempt, registered, pending)
- `industry` (enum: retail, services, technology, food, healthcare, etc.)
- `employee_count` (integer)
- `fiscal_year_start` (date)
- `business_established_date` (date)
- `municipality` (text)
- `metadata` (jsonb)
- `created_at`, `updated_at`

#### compliance_tasks
- `id` (uuid, PK)
- `user_id` (FK → users.id)
- `title` (text)
- `description` (text)
- `task_type` (enum: vat_filing, tax_payment, license_renewal, etc.)
- `due_date` (date)
- `priority` (enum: low, medium, high, urgent)
- `status` (enum: pending, in_progress, completed, overdue)
- `metadata` (jsonb)
- `created_at`, `updated_at`, `completed_at`

#### auth_sessions
- `id` (uuid, PK)
- `user_id` (FK → users.id)
- `access_token_hash` (text)
- `refresh_token_hash` (text)
- `access_token_expires_at` (timestamp)
- `refresh_token_expires_at` (timestamp)
- `ip_address` (text)
- `user_agent` (text)
- `created_at`, `updated_at`

## Business Logic Rules

### VAT Status Determination

**Exempt Dealer (עוסק פטור)**
- Annual revenue < 102,292 ₪
- No VAT collection or filing
- Must register if revenue exceeds threshold
- Tasks generated:
  - Open tax file with Tax Authority
  - Register with National Insurance (Bituach Leumi)
  - Check municipal license requirements

**Authorized Dealer (עוסק מורשה)**
- Annual revenue ≥ 102,292 ₪
- Must collect 18% VAT
- Monthly VAT filing required
- Filing deadlines (Israeli-specific rules):
  - **15th Rule**: Most dealers file by 15th of following month
  - **16th Rule**: Extension to 16th for certain categories
  - **23rd Rule**: Large businesses file by 23rd
- Tasks generated:
  - Monthly VAT filing reminders
  - Quarterly bookkeeping tasks
  - E-invoicing compliance (2025+ requirement)
  - Annual tax return

**Ltd Company (חברה בע״מ)**
- All of Authorized Dealer requirements
- Plus:
  - Annual financial statements
  - Board meeting documentation
  - Registrar of Companies updates
  - Corporate governance tasks

### Task Generation Logic

When a business profile is created, the system generates tasks based on:

1. **Business Type** → Determines which compliance categories apply
2. **VAT Status** → Affects tax filing requirements
3. **Industry** → Industry-specific licenses and regulations
4. **Municipality** → Local licensing requirements
5. **Employee Count** → Payroll and NI obligations

### Task Templates

Located in `task_templates` table with:
- Template name
- Task type
- Default priority
- Description template
- Frequency (one-time, monthly, quarterly, annually)
- Applicable business types
- Applicable VAT statuses

## API Endpoints

### Authentication

**POST /api/auth/signup**
- Creates user account
- Auto-login after signup
- Returns JWT tokens in HTTP-only cookies

**POST /api/auth/login**
- Validates credentials
- Creates new session
- Returns JWT tokens

**POST /api/auth/logout**
- Invalidates session
- Clears cookies

**GET /api/auth/me**
- Returns current user info
- Validates JWT token

### Business Profiles

**GET /api/business-profiles**
- Fetch authenticated user's profile
- Returns 404 if no profile exists

**POST /api/business-profiles**
- Create business profile
- Validates all fields
- Returns 409 if profile already exists

**PATCH /api/business-profiles**
- Update existing profile
- Partial updates supported

### Tasks

**GET /api/tasks**
- Fetch user's compliance tasks
- Supports filtering by status, type, date range
- Supports pagination

**POST /api/tasks**
- Create custom task

**PATCH /api/tasks/:id**
- Update task status
- Mark as completed

**POST /api/tasks/generate**
- Generate tasks based on business profile
- Uses task templates
- Date range parameters

## Israeli Compliance Rules

### VAT Regulations
- Current rate: 18% (as of January 2025)
- Exempt threshold: 102,292 ₪ annually
- Filing deadlines: 15th/16th/23rd depending on category
- Holiday adjustments: Deadlines shift if they fall on Shabbat or holidays

### E-Invoicing Requirements
- **Reference Number** (מספר אסמכתא): Required from 2025
- **Allocation Number** (מספר קבלה): Phased rollout
  - 2026: Revenue > 15,000 ₪
  - 2027: Revenue > 10,000 ₪
  - 2028: Revenue > 5,000 ₪
- Digital receipts must be retained for 7 years

### National Insurance (ביטוח לאומי)
- Self-employed must register within 30 days
- Monthly contributions based on income
- Quarterly advance payments

### Business Licensing (רישוי עסקים)
- Municipality-specific requirements
- Varies by industry (food service has strictest rules)
- Annual renewal required
- Ministry approvals may be needed (Health, Environment, etc.)

## Testing the Complete Flow

### Manual Test Steps

1. **Fresh Signup**
   ```
   Navigate to: http://localhost:3002/signup
   Fill: email, password, name
   Check: consent checkbox
   Click: Sign Up
   ```

2. **Should Auto-Redirect to Onboarding**
   ```
   URL should be: /onboarding
   ```

3. **Complete Onboarding**
   ```
   Step 1: Select Business Type (e.g., "עוסק פטור")
   Step 2: Select Industry (e.g., "ייעוץ וניהול")
   Step 3: Fill Municipality and Employees
   Click: Submit
   ```

4. **Verify Tasks Generated**
   ```
   URL should be: /dashboard?welcome=true
   Should see: Compliance tasks based on profile
   ```

### Automated Test with curl

```bash
# 1. Signup
curl -X POST http://localhost:3002/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test-flow@example.com",
    "password": "TestPass123!",
    "name": "Flow Test User",
    "consentGiven": true
  }' \
  -c cookies.txt

# 2. Create Business Profile
curl -X POST http://localhost:3002/api/business-profiles \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{
    "business_type": "sole_proprietor",
    "vat_status": "exempt",
    "industry": "services",
    "employee_count": 1,
    "municipality": "תל אביב"
  }'

# 3. Generate Tasks
curl -X POST http://localhost:3002/api/tasks/generate \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{
    "start_date": "2025-11-02",
    "end_date": "2026-02-02"
  }'

# 4. Fetch Tasks
curl http://localhost:3002/api/tasks -b cookies.txt
```

## Current Status

✅ **Completed**:
- Authentication system (signup, login, logout)
- Business profiles API (GET, POST, PATCH)
- Onboarding UI (3-step form)
- Dashboard UI
- Database schema with RLS
- Task generation API
- Quiz flow

❌ **Known Issues**:
1. Signup redirect works correctly, but existing users who logged in manually missed onboarding
2. Dashboard doesn't check for missing profile and redirect to onboarding
3. No validation that profile exists before showing dashboard content

✨ **Recommended Improvements**:
1. Add profile check to dashboard page (redirect to onboarding if missing)
2. Add welcome banner on first dashboard visit
3. Add task filtering and search
4. Implement calendar view for deadlines
5. Add email notifications for upcoming tasks
6. Implement e-invoicing compliance checker
7. Add government deep-linking (MyGov SSO integration)

## For Developers

### Adding a New Task Type

1. Add enum value to database:
   ```sql
   ALTER TYPE task_type ADD VALUE 'new_task_type';
   ```

2. Create task template:
   ```sql
   INSERT INTO task_templates (
     name, task_type, title, description, priority, frequency
   ) VALUES (...);
   ```

3. Update task generation logic in `/api/tasks/generate`

### Adding a New Business Type

1. Update database enum
2. Update `VALID_BUSINESS_TYPES` in `/api/business-profiles/route.ts`
3. Update UI options in `/onboarding/page.tsx`
4. Add task templates for new type

### Debugging Auth Issues

- Check cookies: `document.cookie` in browser console
- Verify token: Decode JWT at https://jwt.io
- Check session: Query `auth_sessions` table
- Verify RLS: Check `auth.user_id()` in database queries

---

**Last Updated**: November 2, 2025
**Version**: 1.0
**Status**: MVP Complete, Ready for Testing
