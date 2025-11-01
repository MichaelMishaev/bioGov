# bioGov Database Schema Documentation

**Last Updated:** 2025-11-01
**Database:** Railway PostgreSQL
**Version:** 1.0

---

## Overview

bioGov uses PostgreSQL with Row-Level Security (RLS) policies for data protection. The database is divided into schemas:

- `public` - Application data (users, assessments, tasks)
- `auth` - Authentication system (sessions, verifications, audit logs)

---

## Schema Diagram (Text Format)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         PUBLIC SCHEMA                                      │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────┐       ┌──────────────┐       ┌──────────────┐           │
│  │   users     │◄──────│ assessments  │──────►│   feedback   │           │
│  │─────────────│       │──────────────│       │──────────────│           │
│  │ id          │       │ id           │       │ id           │           │
│  │ email       │       │ user_id (FK) │       │ user_id (FK) │           │
│  │ name        │       │ answers_json │       │ rating       │           │
│  │ password    │       │ result_status│       │ comment      │           │
│  │ created_at  │       │ created_at   │       │ created_at   │           │
│  └──────┬──────┘       └──────────────┘       └──────────────┘           │
│         │                                                                  │
│         │              ┌──────────────┐       ┌──────────────┐           │
│         ├──────────────│  email_logs  │       │    tasks     │◄──┐       │
│         │              │──────────────│       │──────────────│   │       │
│         │              │ id           │   ┌──►│ id           │   │       │
│         │              │ user_id (FK) │   │   │ user_id (FK) │   │       │
│         │              │ email_type   │   │   │ template_id  │───┼───┐   │
│         │              │ sent_at      │   │   │ title        │   │   │   │
│         │              └──────────────┘   │   │ due_date     │   │   │   │
│         │                                 │   │ completed_at │   │   │   │
│         │              ┌──────────────┐   │   └───────┬──────┘   │   │   │
│         ├──────────────│business_     │   │           │          │   │   │
│         │              │  profiles    │   │           │          │   │   │
│         │              │──────────────│   │   ┌───────▼──────┐   │   │   │
│         │              │ id           │   │   │notifications │   │   │   │
│         │              │ user_id (FK) │   │   │──────────────│   │   │   │
│         │              │ business_type│   │   │ id           │   │   │   │
│         │              │ vat_status   │   │   │ task_id (FK) │───┘   │   │
│         │              │ industry     │   │   │ user_id (FK) │       │   │
│         │              └──────────────┘   │   │ scheduled_at │       │   │
│         │                                 │   │ status       │       │   │
│         │              ┌──────────────┐   │   └──────────────┘       │   │
│         └──────────────│deadlines_    │   │                          │   │
│                        │  history     │   │   ┌──────────────┐       │   │
│                        │──────────────│   │   │task_templates│◄──────┘   │
│                        │ id           │   │   │──────────────│           │
│                        │ task_id (FK) │───┘   │ id           │           │
│                        │ user_id (FK) │       │ template_code│           │
│                        │ completed_at │       │ title_he     │           │
│                        │ was_late     │       │ category     │           │
│                        └──────────────┘       │ recurrence   │           │
│                                               └──────────────┘           │
└───────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          AUTH SCHEMA                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌────────────────────┐                 │
│  │    sessions     │    │ email_verifications│                 │
│  │─────────────────│    │────────────────────│                 │
│  │ id              │    │ id                 │                 │
│  │ user_id (FK)    │    │ user_id (FK)       │                 │
│  │ access_token    │    │ token_hash         │                 │
│  │ refresh_token   │    │ expires_at         │                 │
│  │ expires_at      │    │ verified_at        │                 │
│  └─────────────────┘    └────────────────────┘                 │
│                                                                  │
│  ┌─────────────────┐    ┌────────────────────┐                 │
│  │ password_resets │    │    audit_log       │                 │
│  │─────────────────│    │────────────────────│                 │
│  │ id              │    │ id                 │                 │
│  │ user_id (FK)    │    │ user_id (FK)       │                 │
│  │ token_hash      │    │ action             │                 │
│  │ expires_at      │    │ ip_address         │                 │
│  │ used_at         │    │ created_at         │                 │
│  └─────────────────┘    └────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Table Definitions

### 1. PUBLIC SCHEMA

#### 1.1 `public.users`

**Purpose:** User accounts with authentication credentials

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier |
| `email` | TEXT | UNIQUE, NOT NULL | User email (validated format) |
| `name` | TEXT | NOT NULL | Full name (Hebrew/English) |
| `password_hash` | TEXT | NOT NULL | Bcrypt hashed password |
| `email_verified` | BOOLEAN | DEFAULT FALSE | Email verification status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| `consent_given` | BOOLEAN | DEFAULT FALSE | Privacy policy acceptance |
| `unsubscribed_at` | TIMESTAMPTZ | DEFAULT NULL | Unsubscribe timestamp |
| `failed_login_attempts` | INTEGER | DEFAULT 0 | Brute-force protection counter |
| `locked_until` | TIMESTAMPTZ | DEFAULT NULL | Account lockout expiry |

**Indexes:**
- `idx_users_email` - Fast email lookups for login
- `idx_users_created_at` - Chronological sorting
- `idx_users_unsubscribed` - Filter active users

**Constraints:**
- Email format validation regex
- Name length: 2-100 characters
- Password hash must be bcrypt format

---

#### 1.2 `public.assessments`

**Purpose:** VAT registration quiz results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Shareable assessment ID |
| `user_id` | UUID | FK → users(id) ON DELETE SET NULL | Owner (nullable for anonymous) |
| `answers_json` | JSONB | NOT NULL | Quiz answers as JSON |
| `result_status` | TEXT | CHECK IN ('פטור', 'מורשה', 'choice') | VAT recommendation |
| `result_checklist` | JSONB | NOT NULL | Action steps as JSON |
| `ip_hash` | TEXT | | SHA-256 hashed IP for rate limiting |
| `user_agent` | TEXT | | Browser info for analytics |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Assessment timestamp |

**Indexes:**
- `idx_assessments_user_id` - User's assessment history
- `idx_assessments_created_at` - Recent assessments
- `idx_assessments_answers_json` (GIN) - JSON queries
- `idx_assessments_result_status` - Stats by status

---

#### 1.3 `public.feedback`

**Purpose:** User ratings and comments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Feedback entry ID |
| `user_id` | UUID | FK → users(id) | User who submitted |
| `assessment_id` | UUID | FK → assessments(id) ON DELETE CASCADE | Related assessment |
| `rating` | INTEGER | CHECK 1-5 | Star rating |
| `comment` | TEXT | Max 500 chars | Optional text feedback |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Submission timestamp |

**Indexes:**
- `idx_feedback_rating` - Filter by rating
- `idx_feedback_created_at` - Recent feedback

---

#### 1.4 `public.email_logs`

**Purpose:** Email delivery tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Log entry ID |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE | Recipient |
| `email_type` | TEXT | CHECK IN ('results', 'reminder', 'welcome', 'verification', 'password_reset') | Email category |
| `sent_at` | TIMESTAMPTZ | DEFAULT NOW() | Send timestamp |
| `opened_at` | TIMESTAMPTZ | | Tracking pixel timestamp |
| `clicked_at` | TIMESTAMPTZ | | Link click timestamp |
| `bounce_reason` | TEXT | | Delivery failure reason |

---

#### 1.5 `public.business_profiles`

**Purpose:** Business information for personalized compliance recommendations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Profile ID |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE, UNIQUE | Profile owner |
| `business_type` | TEXT | CHECK IN ('sole_proprietor', 'partnership', 'company', 'nonprofit', 'cooperative') | Legal entity type |
| `vat_status` | TEXT | CHECK IN ('exempt', 'registered', 'pending') | VAT registration status |
| `industry` | TEXT | CHECK IN (...) | Industry sector for regulations |
| `employee_count` | INTEGER | CHECK >= 0 | Number of employees |
| `fiscal_year_start` | DATE | DEFAULT '2025-01-01' | Fiscal year start date |
| `business_established_date` | DATE | | Business registration date |
| `municipality` | TEXT | | Municipality for local taxes |
| `metadata` | JSONB | DEFAULT '{}' | Additional business data |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Profile creation |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_business_profiles_user_id` - Fast user lookup
- `idx_business_profiles_vat_status` - Filter by VAT status
- `idx_business_profiles_business_type` - Filter by entity type
- `idx_business_profiles_industry` - Industry-specific queries

---

#### 1.6 `public.task_templates`

**Purpose:** Reusable compliance task blueprints with recurrence rules

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Template ID |
| `template_code` | TEXT | UNIQUE NOT NULL | Unique identifier (e.g., 'VAT_MONTHLY') |
| `title_he` | TEXT | NOT NULL | Hebrew task title |
| `description_he` | TEXT | | Hebrew task description |
| `category` | TEXT | CHECK IN ('vat', 'income_tax', 'social_security', 'license', ...) | Task category |
| `default_priority` | TEXT | CHECK IN ('low', 'medium', 'high', 'urgent') | Default priority |
| `recurrence_rule` | TEXT | | iCalendar RRULE format |
| `lead_time_days` | INTEGER | DEFAULT 30 | Days before due to create task |
| `reminder_days` | INTEGER[] | DEFAULT ARRAY[7, 3, 1] | Days before due to send reminders |
| `applies_to_vat_status` | TEXT[] | | VAT statuses this applies to |
| `applies_to_business_types` | TEXT[] | | Business types this applies to |
| `applies_to_industries` | TEXT[] | | Industries this applies to |
| `is_active` | BOOLEAN | DEFAULT TRUE | Template enabled |
| `metadata` | JSONB | DEFAULT '{}' | Legal references, documents |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Template creation |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_task_templates_category` - Filter by category
- `idx_task_templates_active` - Active templates only
- `idx_task_templates_code` - Fast code lookup

**Sample Templates Included:**
- `VAT_MONTHLY` - Monthly VAT report (15th of month)
- `VAT_BIMONTHLY` - Bi-monthly VAT report
- `TAX_ADVANCE_Q1-Q4` - Quarterly advance tax payments
- `TAX_ANNUAL_RETURN` - Annual tax return (April 30)
- `BITUACH_LEUMI_MONTHLY` - Monthly social security report
- `BUSINESS_LICENSE_RENEWAL` - Annual license renewal
- `FINANCIAL_STATEMENTS_ANNUAL` - Annual financial statements
- `MONTHLY_PAYROLL` - Monthly payroll processing
- And 10+ more Israeli compliance tasks

---

#### 1.7 `public.tasks`

**Purpose:** User-specific compliance tasks and deadlines

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Task ID |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE | Task owner |
| `template_id` | UUID | FK → task_templates(id) ON DELETE SET NULL | Source template (NULL for custom) |
| `title` | TEXT | NOT NULL | Task title (Hebrew) |
| `description` | TEXT | | Detailed instructions |
| `due_date` | DATE | NOT NULL | Deadline date |
| `category` | TEXT | CHECK IN ('vat', 'income_tax', ...) | Task category |
| `priority` | TEXT | CHECK IN ('low', 'medium', 'high', 'urgent') | Priority level |
| `completed_at` | TIMESTAMPTZ | | Completion timestamp |
| `recurring_pattern` | TEXT | | iCalendar RRULE |
| `parent_task_id` | UUID | FK → tasks(id) ON DELETE CASCADE | Parent recurring task |
| `metadata` | JSONB | DEFAULT '{}' | Notes, proof URLs |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Task creation |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_tasks_user_id` - User's tasks
- `idx_tasks_user_due_date` - Upcoming tasks by user
- `idx_tasks_user_category` - Filter by category
- `idx_tasks_completed` - Incomplete tasks only
- `idx_tasks_upcoming` - All upcoming tasks
- `idx_tasks_template_id` - Template-generated tasks

---

#### 1.8 `public.notifications`

**Purpose:** Notification queue for task reminders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Notification ID |
| `task_id` | UUID | FK → tasks(id) ON DELETE CASCADE | Related task |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE | Recipient |
| `notification_type` | TEXT | CHECK IN ('email', 'sms', 'push', 'whatsapp') | Delivery method |
| `scheduled_at` | TIMESTAMPTZ | NOT NULL | When to send |
| `sent_at` | TIMESTAMPTZ | | Actual send time |
| `status` | TEXT | CHECK IN ('pending', 'sent', 'failed', 'cancelled') | Delivery status |
| `error_message` | TEXT | | Failure reason |
| `retry_count` | INTEGER | DEFAULT 0 | Number of retries |
| `metadata` | JSONB | DEFAULT '{}' | Additional data |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_notifications_scheduled_status` - Processing queue
- `idx_notifications_user_id` - User's notifications
- `idx_notifications_task_id` - Task's notifications

---

#### 1.9 `public.deadlines_history`

**Purpose:** Audit trail of completed tasks for compliance reporting

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | History entry ID |
| `task_id` | UUID | FK → tasks(id) ON DELETE CASCADE | Completed task |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE | User who completed |
| `completed_at` | TIMESTAMPTZ | NOT NULL | Completion timestamp |
| `due_date` | DATE | NOT NULL | Original deadline |
| `was_late` | BOOLEAN | GENERATED (computed) | Auto-computed lateness |
| `proof_uploaded` | BOOLEAN | DEFAULT FALSE | Has completion proof |
| `proof_urls` | TEXT[] | | Document URLs |
| `completion_notes` | TEXT | | User notes |
| `metadata` | JSONB | DEFAULT '{}' | Additional data |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Entry creation |

**Indexes:**
- `idx_deadlines_history_user_id` - User's history
- `idx_deadlines_history_completed_at` - Chronological queries
- `idx_deadlines_history_was_late` - Late tasks only

---

### 2. AUTH SCHEMA

#### 2.1 `auth.sessions`

**Purpose:** JWT token session management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Session ID |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE | Session owner |
| `access_token_hash` | TEXT | NOT NULL | SHA-256 hash of access token |
| `refresh_token_hash` | TEXT | NOT NULL | SHA-256 hash of refresh token |
| `access_token_expires_at` | TIMESTAMPTZ | NOT NULL | Access token expiry (15 min) |
| `refresh_token_expires_at` | TIMESTAMPTZ | NOT NULL | Refresh token expiry (7 days) |
| `ip_address` | INET | | Login IP address |
| `user_agent` | TEXT | | Browser/device info |
| `last_activity_at` | TIMESTAMPTZ | DEFAULT NOW() | Last API request timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Session start timestamp |
| `revoked_at` | TIMESTAMPTZ | DEFAULT NULL | Manual logout timestamp |

**Indexes:**
- `idx_sessions_user_id` - User's active sessions
- `idx_sessions_access_token_hash` - Fast token lookups
- `idx_sessions_refresh_token_hash` - Refresh token validation
- `idx_sessions_expires_at` - Cleanup expired sessions

**Notes:**
- Tokens are hashed (SHA-256) before storage
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Revoked sessions cannot be reused

---

#### 2.2 `auth.email_verifications`

**Purpose:** Email verification tokens

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Verification ID |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE | User to verify |
| `token_hash` | TEXT | NOT NULL, UNIQUE | SHA-256 hashed token |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Token expiry (24 hours) |
| `verified_at` | TIMESTAMPTZ | DEFAULT NULL | Verification timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Token generation timestamp |

**Indexes:**
- `idx_email_verifications_token_hash` - Fast token lookups
- `idx_email_verifications_user_id` - User's verification history

---

#### 2.3 `auth.password_resets`

**Purpose:** Password reset tokens

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Reset request ID |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE | User requesting reset |
| `token_hash` | TEXT | NOT NULL, UNIQUE | SHA-256 hashed token |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Token expiry (1 hour) |
| `used_at` | TIMESTAMPTZ | DEFAULT NULL | Password change timestamp |
| `ip_address` | INET | | Request origin IP |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Request timestamp |

**Indexes:**
- `idx_password_resets_token_hash` - Fast token lookups
- `idx_password_resets_user_id` - User's reset history

---

#### 2.4 `auth.audit_log`

**Purpose:** Security event tracking (Israeli Privacy Law compliance)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Log entry ID |
| `user_id` | UUID | FK → users(id) ON DELETE SET NULL | User who performed action |
| `action` | TEXT | NOT NULL | Action type (login, logout, password_change, etc.) |
| `ip_address` | INET | | Request IP address |
| `user_agent` | TEXT | | Browser/device info |
| `success` | BOOLEAN | DEFAULT TRUE | Action success status |
| `error_message` | TEXT | | Failure reason (if applicable) |
| `metadata` | JSONB | | Additional context as JSON |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Event timestamp |

**Indexes:**
- `idx_audit_log_user_id` - User's activity history
- `idx_audit_log_action` - Filter by action type
- `idx_audit_log_created_at` - Chronological queries

**Action Types:**
- `login` - Successful login
- `login_failed` - Failed login attempt
- `logout` - Manual logout
- `signup` - Account creation
- `email_verified` - Email verification
- `password_changed` - Password update
- `password_reset_requested` - Password reset request
- `session_revoked` - Forced logout (admin action)
- `account_locked` - Brute-force lockout

---

## Row-Level Security (RLS) Policies

### PUBLIC SCHEMA

#### `public.users`

| Policy | Operation | Rule |
|--------|-----------|------|
| "Users can read own data" | SELECT | `auth.current_user_id() = id` |
| "Anyone can signup" | INSERT | `true` |
| "Users can update own data" | UPDATE | `auth.current_user_id() = id` |

#### `public.assessments`

| Policy | Operation | Rule |
|--------|-----------|------|
| "Anyone can create assessments" | INSERT | `true` |
| "Anyone can read assessments" | SELECT | `true` (shareable links) |

#### `public.feedback`

| Policy | Operation | Rule |
|--------|-----------|------|
| "Anyone can submit feedback" | INSERT | `true` |
| "Admins can read all feedback" | SELECT | `auth.current_user_id() IS NOT NULL` |

#### `public.business_profiles`

| Policy | Operation | Rule |
|--------|-----------|------|
| "Users can read own business profile" | SELECT | `auth.current_user_id() = user_id` |
| "Users can insert own business profile" | INSERT | `auth.current_user_id() = user_id` |
| "Users can update own business profile" | UPDATE | `auth.current_user_id() = user_id` |

#### `public.task_templates`

| Policy | Operation | Rule |
|--------|-----------|------|
| "Anyone can read active task templates" | SELECT | `is_active = TRUE` |

#### `public.tasks`

| Policy | Operation | Rule |
|--------|-----------|------|
| "Users can manage own tasks" | ALL | `auth.current_user_id() = user_id` |

#### `public.notifications`

| Policy | Operation | Rule |
|--------|-----------|------|
| "Users can read own notifications" | SELECT | `auth.current_user_id() = user_id` |
| "System can manage notifications" | ALL | `TRUE` (for background jobs) |

#### `public.deadlines_history`

| Policy | Operation | Rule |
|--------|-----------|------|
| "Users can read own completion history" | SELECT | `auth.current_user_id() = user_id` |
| "System can create history entries" | INSERT | `TRUE` (auto-triggered) |

### AUTH SCHEMA

#### `auth.sessions`

| Policy | Operation | Rule |
|--------|-----------|------|
| "Users can read own sessions" | SELECT | `auth.current_user_id() = user_id` |
| "Users can revoke own sessions" | UPDATE | `auth.current_user_id() = user_id` |

#### `auth.audit_log`

| Policy | Operation | Rule |
|--------|-----------|------|
| "Users can read own audit log" | SELECT | `auth.current_user_id() = user_id` |

---

## Helper Functions

### Authentication

#### `auth.current_user_id()`

**Purpose:** Returns the UUID of the currently authenticated user.

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.user_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

**Usage:**
- Middleware sets `app.user_id` session variable after verifying JWT
- RLS policies use this function to enforce data access rules

---

### Compliance Calendar Functions

#### `public.calculate_next_due_date(recurrence_rule, last_due_date)`

**Purpose:** Calculates next occurrence date from iCalendar RRULE format.

**Parameters:**
- `recurrence_rule TEXT` - iCalendar RRULE (e.g., "FREQ=MONTHLY;BYMONTHDAY=15")
- `last_due_date DATE` - Previous occurrence date

**Returns:** `DATE` - Next occurrence date

**Supported Frequencies:**
- `DAILY` - Daily recurrence with interval
- `WEEKLY` - Weekly recurrence with interval
- `MONTHLY` - Monthly on specific day (BYMONTHDAY) or same day
- `YEARLY` - Yearly on specific month/day (BYMONTH, BYMONTHDAY)

**Example Usage:**
```sql
SELECT public.calculate_next_due_date(
  'FREQ=MONTHLY;BYMONTHDAY=15',
  '2025-01-15'::DATE
); -- Returns: 2025-02-15

SELECT public.calculate_next_due_date(
  'FREQ=YEARLY;BYMONTH=4;BYMONTHDAY=30',
  '2025-04-30'::DATE
); -- Returns: 2026-04-30
```

---

#### `public.generate_tasks_from_template(template_id, user_id, start_date, end_date)`

**Purpose:** Generates recurring tasks for a user from a template.

**Parameters:**
- `p_template_id UUID` - Template to use
- `p_user_id UUID` - User to create tasks for
- `p_start_date DATE` - Start of generation period (default: today)
- `p_end_date DATE` - End of generation period (default: 1 year from today)

**Returns:** Table of `(task_id UUID, due_date DATE)`

**Example Usage:**
```sql
-- Generate next year's VAT tasks for user
SELECT * FROM public.generate_tasks_from_template(
  (SELECT id FROM public.task_templates WHERE template_code = 'VAT_MONTHLY'),
  'user-uuid-here',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year'
);
```

**Notes:**
- Automatically checks template applicability based on user's business profile
- Skips tasks if template doesn't match user's VAT status or business type
- Creates notifications automatically via trigger

---

#### `public.get_user_compliance_score(user_id)`

**Purpose:** Calculates user's on-time completion rate (0-100%).

**Parameters:**
- `p_user_id UUID` - User to calculate score for

**Returns:** `NUMERIC` - Percentage of tasks completed on time in past year

**Example Usage:**
```sql
SELECT public.get_user_compliance_score('user-uuid-here');
-- Returns: 87.50 (87.5% of tasks completed on time)
```

---

#### `public.get_upcoming_tasks(user_id, days)`

**Purpose:** Returns user's tasks due in next N days.

**Parameters:**
- `p_user_id UUID` - User to query
- `p_days INTEGER` - Days ahead to look (default: 30)

**Returns:** Table of tasks with days remaining

**Example Usage:**
```sql
-- Get tasks due in next 7 days
SELECT * FROM public.get_upcoming_tasks('user-uuid-here', 7);
```

---

## Triggers

### 1. Auto-update `updated_at` timestamp

**Applies to tables:**
- `public.users`
- `public.business_profiles`
- `public.task_templates`
- `public.tasks`
- `public.notifications`

**Trigger Name:** `update_<table>_updated_at`
**Fires:** BEFORE UPDATE

```sql
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

### 2. Task Completion History

**Trigger:** `task_completion_history`
**Table:** `public.tasks`
**Fires:** AFTER UPDATE

**Purpose:** Automatically creates audit trail entry when task is completed.

**Implementation:**
```sql
CREATE TRIGGER task_completion_history
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_completion_history();
```

**Behavior:**
- Triggers when `completed_at` changes from NULL to a timestamp
- Inserts entry into `deadlines_history` table
- Automatically calculates `was_late` field (computed column)

---

### 3. Auto-create Task Notifications

**Trigger:** `auto_create_notifications`
**Table:** `public.tasks`
**Fires:** AFTER INSERT

**Purpose:** Automatically schedules reminder notifications for new tasks.

**Implementation:**
```sql
CREATE TRIGGER auto_create_notifications
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_task_notifications();
```

**Behavior:**
- If task has `template_id`, uses template's `reminder_days` array
- Otherwise, uses default reminders: 7, 3, 1 days before due date
- Only creates notifications scheduled in the future
- Creates email notifications by default (can be customized per user)

**Example:** Task due on 2025-02-15 creates notifications for:
- 2025-02-08 (7 days before)
- 2025-02-12 (3 days before)
- 2025-02-14 (1 day before)

---

### 4. Cleanup expired sessions (future)

**Cron job (Railway or external):**
```sql
DELETE FROM auth.sessions
WHERE refresh_token_expires_at < NOW() - INTERVAL '30 days';
```

---

## Views (Analytics)

### Assessment & User Analytics

#### 1. `public.assessment_stats`

**Purpose:** VAT status distribution

```sql
SELECT result_status, COUNT(*) AS total_count
FROM public.assessments
GROUP BY result_status;
```

#### 2. `public.daily_signups`

**Purpose:** User growth tracking

```sql
SELECT DATE(created_at) AS signup_date, COUNT(*) AS signups
FROM public.users
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;
```

#### 3. `public.feedback_summary`

**Purpose:** Customer satisfaction metrics

```sql
SELECT AVG(rating) AS avg_rating,
       COUNT(*) FILTER (WHERE rating >= 4) AS positive_count
FROM public.feedback;
```

---

### Compliance Calendar Analytics

#### 4. `public.v_upcoming_tasks`

**Purpose:** All users' upcoming tasks with urgency status

**Columns:**
- `id` - Task ID
- `user_id` - Task owner
- `email`, `name` - User details
- `title`, `due_date`, `category`, `priority` - Task details
- `days_until_due` - Days remaining
- `urgency_status` - 'overdue', 'today', 'this_week', 'this_month', 'future'

**Usage:**
```sql
-- Get all overdue tasks
SELECT * FROM public.v_upcoming_tasks WHERE urgency_status = 'overdue';

-- Get tasks due this week
SELECT * FROM public.v_upcoming_tasks WHERE urgency_status = 'this_week';
```

---

#### 5. `public.v_task_completion_stats`

**Purpose:** Per-user task completion statistics

**Columns:**
- `user_id` - User ID
- `total_tasks` - Total tasks ever created
- `completed_tasks` - Number completed
- `pending_tasks` - Number still pending
- `overdue_tasks` - Number overdue
- `completion_rate` - Percentage completed (0-100)

**Usage:**
```sql
-- Get users with low completion rates
SELECT * FROM public.v_task_completion_stats
WHERE completion_rate < 50
ORDER BY completion_rate ASC;

-- Get users with overdue tasks
SELECT * FROM public.v_task_completion_stats
WHERE overdue_tasks > 0
ORDER BY overdue_tasks DESC;
```

---

#### 6. `public.v_pending_notifications`

**Purpose:** Notification processing queue

**Columns:**
- `id` - Notification ID
- `task_id`, `user_id` - Related entities
- `email`, `name` - User details
- `task_title`, `due_date` - Task details
- `notification_type` - Delivery method
- `scheduled_at` - When to send
- `retry_count` - Number of failed attempts

**Usage:**
```sql
-- Get notifications ready to send
SELECT * FROM public.v_pending_notifications
WHERE scheduled_at <= NOW()
ORDER BY scheduled_at ASC
LIMIT 100;
```

**Note:** This view powers the background notification worker.

---

## Migration Files

| File | Description | Status |
|------|-------------|--------|
| `001_initial_schema.sql` | Users, assessments, feedback tables | ✅ Deployed |
| `002_custom_auth.sql` | Auth schema (sessions, verifications, audit) | ✅ Ready |
| `003_compliance_calendar.sql` | Compliance calendar system (5 tables, 18+ templates) | ✅ Ready |

---

## Compliance Calendar Implementation Details

### Task Template Coverage

The migration includes **18+ pre-configured Israeli compliance templates**:

**VAT (מע"מ):**
- Monthly VAT reports (15th of month)
- Bi-monthly VAT reports

**Income Tax (מס הכנסה):**
- Quarterly advance tax payments (Q1-Q4)
- Annual tax return (April 30)

**Social Security (ביטוח לאומי):**
- Monthly reports and payments (15th)
- Annual report (March 31)

**Business Licensing (רישוי עסקי):**
- Annual license renewal
- Industry-specific licenses (food, construction)

**Financial Reporting (דוחות כספיים):**
- Annual audited statements (companies)
- Quarterly balance sheets

**Labor Law (דיני עבודה):**
- Monthly payroll processing (9th)
- Annual vacation balance review

**Municipality (עירייה):**
- Bi-monthly arnona payments

**Insurance (ביטוחים):**
- Annual business insurance renewal
- Liability insurance renewal

### Automation Features

1. **Intelligent Task Generation:**
   - Tasks auto-filter by user's business type, VAT status, industry
   - Respects fiscal year start date for financial tasks
   - Handles recurring patterns (daily, weekly, monthly, quarterly, yearly)

2. **Smart Notifications:**
   - Auto-creates 3 reminders per task: 7, 3, 1 days before due
   - Template-specific reminder schedules (e.g., 60, 30, 14 days for licenses)
   - Retry logic for failed notifications

3. **Compliance Tracking:**
   - Automatic audit trail creation on task completion
   - Late/on-time calculation (computed column)
   - Compliance score calculation function (percentage on-time)

4. **Data Integrity:**
   - Row-Level Security on all tables
   - Cascade deletions (user deletion removes all related data)
   - Generated columns for computed values
   - Automatic timestamp updates

---

## Next Steps

1. ✅ Deploy `001_initial_schema.sql` to Railway PostgreSQL
2. ✅ Create `002_custom_auth.sql` migration
3. ⏳ Deploy `002_custom_auth.sql` and test authentication
4. ✅ Create `003_compliance_calendar.sql` migration
5. ⏳ Deploy `003_compliance_calendar.sql` to database
6. ⏳ Build compliance calendar API endpoints
7. ⏳ Create notification worker (cron job)
8. ⏳ Build frontend task management UI

---

## Israeli Privacy Law Compliance

### Amendment 13 Requirements

1. **User Consent:** `users.consent_given` field
2. **Data Portability:** Export API (future)
3. **Right to Delete:** Cascade deletions on `users` table
4. **Audit Trail:** `auth.audit_log` table
5. **Data Minimization:** Only essential fields stored
6. **Encryption:** Passwords (bcrypt), tokens (SHA-256)

### IS 5568 Accessibility

- Database field names in English (UI in Hebrew)
- JSONB fields for flexible content localization

---

## Cost Optimization

### Indexes

- Only critical indexes created (avoid over-indexing)
- GIN indexes only for JSONB queries

### Retention Policies

- Email logs: Delete after 90 days
- Audit logs: Keep for 1 year (legal requirement)
- Expired sessions: Delete after 30 days

---

**End of Database Schema Documentation**
