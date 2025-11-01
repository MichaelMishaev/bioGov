# MVP Technical Architecture
## bioGov - VAT Registration Assistant

**Version**: 1.0
**Date**: October 30, 2025
**Status**: MVP Implementation Spec
**Owner**: bioGov Engineering Team

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [API Endpoints](#4-api-endpoints)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Deployment & Infrastructure](#6-deployment--infrastructure)
7. [Security & Privacy](#7-security--privacy)
8. [Performance Optimization](#8-performance-optimization)
9. [Development Workflow](#9-development-workflow)

---

## 1. Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER DEVICES                         │
│   📱 Mobile (65%)         💻 Desktop (35%)                   │
│   iOS Safari, Android Chrome    Chrome, Firefox, Safari     │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS
                  ↓
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL CDN (Edge Network)                 │
│   • Global CDN (< 50ms latency)                              │
│   • Auto HTTPS, DDoS protection                              │
│   • Automatic scaling                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js 14 App Router)                │
│                                                               │
│  📄 Pages:                                                   │
│  ├── / (landing page)                                        │
│  ├── /assessment (quiz)                                      │
│  ├── /results/[id] (results page)                           │
│  └── /api/* (API routes)                                     │
│                                                               │
│  🎨 UI Layer:                                                │
│  ├── Tailwind CSS + Carbon Design System                    │
│  ├── Shadcn/ui components                                   │
│  ├── Radix UI primitives                                    │
│  └── Lucide React icons                                     │
│                                                               │
│  💾 Client Storage:                                          │
│  ├── IndexedDB (quiz progress, offline cache)               │
│  └── LocalStorage (user preferences)                        │
│                                                               │
│  📊 Analytics:                                               │
│  └── Plausible Analytics (privacy-friendly)                 │
└─────────────────┬───────────────────────────────────────────┘
                  │ REST API
                  │ (JSON over HTTPS)
                  ↓
┌─────────────────────────────────────────────────────────────┐
│               BACKEND (Supabase Platform)                    │
│                                                               │
│  🗄️ PostgreSQL Database:                                    │
│  ├── users (email signups)                                  │
│  ├── assessments (quiz results)                             │
│  └── feedback (ratings + comments)                          │
│                                                               │
│  🔐 Authentication:                                          │
│  ├── Email/password (optional for MVP)                      │
│  └── Anonymous sessions (guest access)                      │
│                                                               │
│  📨 Email Service:                                           │
│  ├── Supabase Edge Functions + Resend.com                   │
│  └── Transactional emails (results delivery)                │
│                                                               │
│  🔄 Real-time (Future):                                      │
│  └── WebSocket for live admin dashboard                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
USER ACTION                  FRONTEND                  BACKEND

1. Visit homepage
   ↓
   Load landing page    →   SSR render (Next.js)
   ↓
   View content              (no API call needed)

2. Start quiz
   ↓
   Answer question      →   Save to IndexedDB
   ↓                        (offline-first)
   Click "Next"

3. Complete quiz (Q5)
   ↓
   Click "See Results"  →   POST /api/assess
   ↓                            ↓
   (Loading state...)       Process answers
                            Apply VAT logic
                            ↓
   Display results      ←   JSON response:
                            {
                              status: "פטור",
                              checklist: [...],
                              explanation: "..."
                            }

4. Enter email
   ↓
   Fill form            →   POST /api/signup
   Click "Send"             ↓
   ↓                        INSERT INTO users
   (Spinner...)             Trigger email via
                            Supabase Edge Function
                            ↓
   "Email sent!" ✓      ←   { success: true }

5. Submit feedback
   ↓
   Rate 5 stars         →   POST /api/feedback
   Type comment             ↓
   Click "Submit"           INSERT INTO feedback
   ↓                        ↓
   "Thank you!" ✓       ←   { success: true }
```

---

## 2. Tech Stack

### Frontend

| Layer | Technology | Version | Purpose | Justification |
|-------|-----------|---------|---------|---------------|
| **Framework** | Next.js | 14.2.18 | React framework with App Router | SSR, SEO, easy deployment to Vercel |
| **Language** | TypeScript | 5.x | Type safety | Catch bugs at compile-time, better IDE support |
| **UI Library** | React | 18.3 | Component-based UI | Industry standard, large ecosystem |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS | Rapid development, consistent design |
| **Component Library** | Shadcn/ui + Radix UI | Latest | Accessible primitives | WCAG-compliant, headless components |
| **Icons** | Lucide React | Latest | Icon set | Open-source, tree-shakeable, 1000+ icons |
| **Forms** | React Hook Form | 7.x | Form management | Performance, easy validation |
| **Validation** | Zod | 3.x | Schema validation | Type-safe, runtime validation |
| **State Management** | React Context + Hooks | Built-in | Global state (minimal) | No Redux needed for simple app |
| **PWA** | next-pwa | 5.x | Service Worker, offline | Installable app, offline quiz progress |
| **Analytics** | Plausible | SaaS | Privacy-friendly analytics | GDPR-compliant, no cookies |

### Backend

| Layer | Technology | Purpose | Justification |
|-------|-----------|---------|---------------|
| **Database** | Supabase (PostgreSQL) | Relational DB | Open-source, self-hostable, SQL |
| **Authentication** | Supabase Auth | Optional user accounts | Built-in, supports email/social login |
| **API** | Next.js API Routes | RESTful endpoints | Serverless, easy to deploy |
| **Email** | Resend.com | Transactional emails | 3,000 free/month, React email templates |
| **File Storage** | Supabase Storage | PDF downloads (future) | S3-compatible, CDN |

### Infrastructure

| Service | Provider | Purpose | Free Tier |
|---------|----------|---------|-----------|
| **Hosting** | Vercel | Frontend deployment | 100GB bandwidth, unlimited requests |
| **Database** | Supabase Cloud | PostgreSQL + Auth + Storage | 500MB DB, 50K MAU |
| **Domain** | Namecheap / Cloudflare | biogov.il or biogov.co.il | ~$15/year |
| **SSL** | Vercel (Let's Encrypt) | HTTPS | Free, auto-renewed |
| **CDN** | Vercel Edge Network | Global caching | Included |
| **Analytics** | Plausible | Privacy analytics | €9/month or self-hosted |

### Development Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | Code editor |
| **ESLint + Prettier** | Code quality, formatting |
| **GitHub** | Version control |
| **GitHub Actions** | CI/CD (auto-deploy to Vercel) |
| **Lighthouse** | Performance audits |
| **Figma** | UI/UX design |

---

## 3. Database Schema

### ER Diagram

```
┌─────────────────────────┐
│        users            │
├─────────────────────────┤
│ id (PK, uuid)           │
│ email (unique)          │──┐
│ name                    │  │
│ created_at              │  │
│ updated_at              │  │
│ consent_given           │  │
│ unsubscribed_at         │  │
└─────────────────────────┘  │
                             │ 1:N
                             │
┌─────────────────────────┐  │
│     assessments         │  │
├─────────────────────────┤  │
│ id (PK, uuid)           │  │
│ user_id (FK, nullable)  │──┘
│ answers_json            │
│ result_status           │
│ result_checklist        │
│ ip_hash                 │
│ user_agent              │
│ created_at              │
└─────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│       feedback          │  │    email_logs           │
├─────────────────────────┤  ├─────────────────────────┤
│ id (PK, uuid)           │  │ id (PK, uuid)           │
│ user_id (FK, nullable)  │  │ user_id (FK)            │
│ assessment_id (FK)      │  │ email_type              │
│ rating (1-5)            │  │ sent_at                 │
│ comment                 │  │ opened_at               │
│ created_at              │  │ clicked_at              │
└─────────────────────────┘  └─────────────────────────┘
```

### Table Definitions

#### `users` Table

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  consent_given BOOLEAN DEFAULT FALSE,
  unsubscribed_at TIMESTAMPTZ DEFAULT NULL,

  -- Indexes
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Row-Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Anyone can insert (signup)
CREATE POLICY "Anyone can signup"
  ON public.users
  FOR INSERT
  WITH CHECK (true);
```

**Columns**:
- `id`: Unique user identifier (UUID v4)
- `email`: User's email address (validated, unique)
- `name`: User's full name (Hebrew or Latin)
- `created_at`: Signup timestamp
- `updated_at`: Last profile update
- `consent_given`: Privacy policy acceptance (required before email send)
- `unsubscribed_at`: Unsubscribe timestamp (soft delete)

**Privacy Notes**:
- Email is only collected for sending results (explicit consent)
- No phone numbers, addresses, or IDs stored
- Users can unsubscribe anytime (add unsubscribe link to emails)

---

#### `assessments` Table

```sql
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  answers_json JSONB NOT NULL,
  result_status TEXT NOT NULL, -- 'פטור', 'מורשה', 'choice'
  result_checklist JSONB NOT NULL,
  ip_hash TEXT, -- SHA-256 hash for rate limiting (privacy-friendly)
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT valid_status CHECK (result_status IN ('פטור', 'מורשה', 'choice'))
);

-- Indexes
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX idx_assessments_ip_hash ON public.assessments(ip_hash);

-- Row-Level Security
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create assessments (anonymous allowed)
CREATE POLICY "Anyone can create assessments"
  ON public.assessments
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can read their own assessments
CREATE POLICY "Users can read own assessments"
  ON public.assessments
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);
```

**Columns**:
- `id`: Unique assessment ID (shareable URL: `/results/{id}`)
- `user_id`: Optional link to user (nullable for anonymous users)
- `answers_json`: Quiz answers as JSON:
  ```json
  {
    "activity": "services",
    "revenue": "under_120k",
    "clients": "both",
    "employees": "no",
    "voluntary": false
  }
  ```
- `result_status`: VAT status result (enum: פטור, מורשה, choice)
- `result_checklist`: Action items as JSON array:
  ```json
  [
    {
      "step": 1,
      "title": "Fill Form 821",
      "link": "https://taxes.gov.il/...",
      "description": "VAT registration form"
    }
  ]
  ```
- `ip_hash`: SHA-256 hash of IP address (for rate limiting, not storing raw IP)
- `user_agent`: Browser info (for analytics, debugging)
- `created_at`: Assessment completion timestamp

**Why JSONB?**
- Flexible schema (can add new questions without migrations)
- Supports indexing (GIN index for fast JSON queries)
- Native PostgreSQL type (better than TEXT with JSON string)

---

#### `feedback` Table

```sql
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT comment_length CHECK (LENGTH(comment) <= 500)
);

-- Indexes
CREATE INDEX idx_feedback_assessment_id ON public.feedback(assessment_id);
CREATE INDEX idx_feedback_rating ON public.feedback(rating);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);

-- Row-Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit feedback
CREATE POLICY "Anyone can submit feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only admins can read all feedback
CREATE POLICY "Admins can read all feedback"
  ON public.feedback
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
```

**Columns**:
- `id`: Unique feedback ID
- `user_id`: Optional user link (if email was provided)
- `assessment_id`: Link to specific assessment (for context)
- `rating`: 1-5 stars (required)
- `comment`: Optional text feedback (max 500 characters)
- `created_at`: Submission timestamp

**Usage**:
- Admin dashboard shows aggregated stats: AVG(rating), recent comments
- Can filter feedback by rating, date range, user segment

---

#### `email_logs` Table (Optional - for email deliverability tracking)

```sql
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'results', 'reminder', 'welcome'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounce_reason TEXT,

  -- Constraints
  CONSTRAINT valid_email_type CHECK (email_type IN ('results', 'reminder', 'welcome'))
);

-- Indexes
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);
```

**Purpose**: Track email delivery for debugging (not MVP-critical)

---

### Database Migrations

**Migration File**: `supabase/migrations/001_initial_schema.sql`

```sql
-- Migration: Initial schema for bioGov MVP
-- Created: 2025-10-30
-- Description: Users, assessments, feedback tables

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  consent_given BOOLEAN DEFAULT FALSE,
  unsubscribed_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Create assessments table
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  answers_json JSONB NOT NULL,
  result_status TEXT NOT NULL CHECK (result_status IN ('פטור', 'מורשה', 'choice')),
  result_checklist JSONB NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX idx_assessments_ip_hash ON public.assessments(ip_hash);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT CHECK (LENGTH(comment) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_assessment_id ON public.feedback(assessment_id);
CREATE INDEX idx_feedback_rating ON public.feedback(rating);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);

-- Enable Row-Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policies (see individual table sections above)

COMMIT;
```

**Apply Migration**:
```bash
npx supabase db push
```

---

## 4. API Endpoints

### Endpoint Overview

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/assess` | POST | Submit quiz answers, get VAT result | No (public) |
| `/api/signup` | POST | Email signup, trigger confirmation email | No (public) |
| `/api/feedback` | POST | Submit rating + comment | No (public) |
| `/api/results/[id]` | GET | Retrieve assessment results by ID | No (shareable link) |
| `/api/health` | GET | Health check (monitoring) | No (public) |

---

### `POST /api/assess`

**Purpose**: Process quiz answers and return personalized VAT recommendation

**Request**:
```json
POST /api/assess
Content-Type: application/json

{
  "answers": {
    "activity": "services",
    "revenue": "under_120k",
    "clients": "both",
    "employees": "no",
    "voluntary": false
  },
  "userId": "uuid-optional" // nullable
}
```

**Response** (Success):
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "assessmentId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "result": {
    "status": "פטור",
    "statusLabel": "VAT-Exempt Dealer",
    "explanation": "Based on your projected revenue (< ₪120,000/year), you qualify for VAT-exempt status. However, since you serve business clients, you may benefit from voluntary registration as an authorized dealer.",
    "checklist": [
      {
        "step": 1,
        "title": "Fill Form 821 (VAT Registration)",
        "description": "Complete the VAT registration form online or in-person",
        "link": "https://taxes.gov.il/forms/821",
        "linkText": "Open Form ↗"
      },
      {
        "step": 2,
        "title": "Prepare Required Documents",
        "description": "Gather: ID card, bank account proof, address proof",
        "documents": [
          "צילום תעודת זהות (ID copy)",
          "אישור חשבון בנק (Bank confirmation)",
          "אישור כתובת (Address proof)"
        ]
      },
      {
        "step": 3,
        "title": "Submit to Tax Authority",
        "description": "Online submission via gov.il or in-person at local office",
        "link": "https://taxes.gov.il/offices",
        "linkText": "Find Tax Office ↗"
      }
    ],
    "notes": [
      "✓ Most freelancers complete this in 1-2 business days",
      "⚠ If you voluntarily register as מורשה, you cannot revert to פטור for 2 years"
    ]
  },
  "resultsUrl": "https://biogov.il/results/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response** (Error - Validation Failed):
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid input",
  "details": {
    "answers.revenue": "Required field missing"
  }
}
```

**Response** (Error - Rate Limit):
```json
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

**Implementation** (`app/api/assess/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { assessVATStatus } from '@/lib/vat-logic';
import { hashIP } from '@/lib/security';

// Validation schema
const assessmentSchema = z.object({
  answers: z.object({
    activity: z.enum(['products', 'services', 'both']),
    revenue: z.enum(['under_120k', '120k_500k', 'over_500k']),
    clients: z.enum(['individuals', 'businesses', 'both']),
    employees: z.enum(['yes', 'no', 'not_sure']),
    voluntary: z.boolean(),
  }),
  userId: z.string().uuid().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    const { answers, userId } = assessmentSchema.parse(body);

    // Rate limiting (by IP hash)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const ipHash = hashIP(ip);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY! // Server-side key
    );

    // Check rate limit: max 10 assessments per hour per IP
    const { count } = await supabase
      .from('assessments')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (count && count >= 10) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: 3600 },
        { status: 429 }
      );
    }

    // Apply VAT decision logic
    const result = assessVATStatus(answers);

    // Store assessment in database
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        answers_json: answers,
        result_status: result.status,
        result_checklist: result.checklist,
        ip_hash: ipHash,
        user_agent: request.headers.get('user-agent'),
      })
      .select()
      .single();

    if (error) throw error;

    // Return result
    return NextResponse.json({
      assessmentId: assessment.id,
      result: result,
      resultsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/results/${assessment.id}`,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**VAT Logic** (`lib/vat-logic.ts`):

```typescript
export function assessVATStatus(answers: QuizAnswers): AssessmentResult {
  const { activity, revenue, clients, employees, voluntary } = answers;

  // Case 1: Revenue >= ₪500K → Mandatory מורשה
  if (revenue === 'over_500k') {
    return {
      status: 'מורשה',
      statusLabel: 'VAT-Authorized Dealer (Mandatory)',
      explanation: 'Your projected revenue exceeds ₪500,000/year. You are required to register as an authorized VAT dealer (עוסק מורשה).',
      checklist: generateChecklist('מורשה', true),
      notes: [
        '⚠ Consider hiring an accountant for complex VAT compliance',
        '✓ You can deduct input VAT on business expenses',
      ],
    };
  }

  // Case 2: Revenue between ₪120K-500K → Mandatory מורשה
  if (revenue === '120k_500k') {
    return {
      status: 'מורשה',
      statusLabel: 'VAT-Authorized Dealer (Mandatory)',
      explanation: 'Your projected revenue is between ₪120,000-500,000/year. You are required to register as an authorized VAT dealer (עוסק מורשה).',
      checklist: generateChecklist('מורשה', false),
      notes: [
        '✓ You must charge 18% VAT on invoices',
        '✓ You can deduct input VAT on expenses',
        'ℹ File VAT reports monthly or bi-monthly',
      ],
    };
  }

  // Case 3: Revenue < ₪120K → פטור or choice
  if (revenue === 'under_120k') {
    // Sub-case: B2B clients → Recommend מורשה even if under threshold
    if (clients === 'businesses') {
      return {
        status: 'choice',
        statusLabel: 'Your Choice: פטור or מורשה',
        explanation: 'Your revenue qualifies for VAT-exempt status (< ₪120K). However, since you primarily serve business clients, voluntary registration as מורשה may be beneficial (B2B clients often prefer VAT invoices).',
        checklist: [
          ...generateChecklist('פטור', false),
          {
            step: 4,
            title: 'Consider Voluntary Registration',
            description: 'Authorized status allows you to deduct input VAT and appear more professional to B2B clients',
            link: 'https://taxes.gov.il/voluntary-vat',
            linkText: 'Learn More ↗',
          },
        ],
        notes: [
          'ℹ You can choose either status',
          '⚠ If you register as מורשה voluntarily, you cannot revert to פטור for 2 years',
        ],
      };
    }

    // Sub-case: Voluntary registration requested
    if (voluntary) {
      return {
        status: 'מורשה',
        statusLabel: 'VAT-Authorized Dealer (Voluntary)',
        explanation: 'You qualify for VAT-exempt status (< ₪120K), but you chose voluntary registration as מורשה. This allows you to deduct input VAT and issue standard tax invoices.',
        checklist: generateChecklist('מורשה', false),
        notes: [
          '✓ You can deduct input VAT on expenses',
          '⚠ You cannot revert to פטור for 2 years',
        ],
      };
    }

    // Default: פטור
    return {
      status: 'פטור',
      statusLabel: 'VAT-Exempt Dealer',
      explanation: 'Your projected revenue is under ₪120,000/year. You qualify for VAT-exempt status (עוסק פטור). This is the simplest option with minimal paperwork.',
      checklist: generateChecklist('פטור', false),
      notes: [
        '✓ No VAT on invoices (simpler for clients)',
        '✓ Less paperwork (annual report only)',
        'ℹ You can switch to מורשה later if revenue increases',
      ],
    };
  }

  // Fallback (should never reach here)
  throw new Error('Invalid assessment parameters');
}
```

---

### `POST /api/signup`

**Purpose**: Capture email for results delivery + future updates

**Request**:
```json
POST /api/signup
Content-Type: application/json

{
  "name": "Dana Levi",
  "email": "dana@example.com",
  "assessmentId": "a1b2c3d4-...",
  "consentGiven": true
}
```

**Response** (Success):
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "userId": "uuid",
  "emailSent": true,
  "message": "תודה! שלחנו לך את התוצאות במייל"
}
```

**Implementation** (`app/api/signup/route.ts`):

```typescript
export async function POST(request: NextRequest) {
  const { name, email, assessmentId, consentGiven } = await request.json();

  // Validate
  if (!consentGiven) {
    return NextResponse.json(
      { error: 'Consent required' },
      { status: 400 }
    );
  }

  // Insert user
  const { data: user } = await supabase
    .from('users')
    .insert({ name, email, consent_given: true })
    .select()
    .single();

  // Link assessment to user
  await supabase
    .from('assessments')
    .update({ user_id: user.id })
    .eq('id', assessmentId);

  // Send email via Edge Function
  await supabase.functions.invoke('send-results-email', {
    body: { userId: user.id, assessmentId },
  });

  return NextResponse.json({
    userId: user.id,
    emailSent: true,
    message: 'תודה! שלחנו לך את התוצאות במייל',
  }, { status: 201 });
}
```

---

### `POST /api/feedback`

**Purpose**: Collect user ratings and comments

**Request**:
```json
POST /api/feedback
Content-Type: application/json

{
  "assessmentId": "a1b2c3d4-...",
  "rating": 5,
  "comment": "Super helpful! Saved me ₪800 on accountant"
}
```

**Response** (Success):
```json
HTTP/1.1 201 Created

{
  "success": true,
  "message": "תודה על המשוב שלך!"
}
```

**Implementation**:
```typescript
export async function POST(request: NextRequest) {
  const { assessmentId, rating, comment } = await request.json();

  // Validation
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
  }

  // Insert feedback
  await supabase.from('feedback').insert({
    assessment_id: assessmentId,
    rating,
    comment: comment || null,
  });

  return NextResponse.json({
    success: true,
    message: 'תודה על המשוב שלך!',
  }, { status: 201 });
}
```

---

## 5. Frontend Architecture

### Directory Structure

```
biogov-ui/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout (Rubik font, RTL)
│   │   ├── page.tsx              # Landing page
│   │   ├── assessment/
│   │   │   └── page.tsx          # Quiz wizard
│   │   ├── results/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Results page (dynamic route)
│   │   ├── api/                  # API routes
│   │   │   ├── assess/
│   │   │   │   └── route.ts
│   │   │   ├── signup/
│   │   │   │   └── route.ts
│   │   │   └── feedback/
│   │   │       └── route.ts
│   │   └── globals.css           # Tailwind imports
│   │
│   ├── components/
│   │   ├── ui/                   # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   └── ...
│   │   ├── quiz/
│   │   │   ├── QuizQuestion.tsx  # Reusable question component
│   │   │   ├── QuizProgress.tsx  # Progress indicator (1/5, 2/5...)
│   │   │   └── QuizNavigation.tsx # Back/Next buttons
│   │   ├── results/
│   │   │   ├── ResultsBadge.tsx  # Status badge (פטור/מורשה)
│   │   │   ├── Checklist.tsx     # Action items list
│   │   │   └── EmailSignup.tsx   # Email capture form
│   │   ├── feedback/
│   │   │   └── FeedbackWidget.tsx # 5-star rating + comment
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client
│   │   ├── vat-logic.ts          # Assessment algorithm
│   │   ├── validation.ts         # Zod schemas
│   │   ├── security.ts           # IP hashing, rate limiting
│   │   └── utils.ts              # Helper functions (cn, formatDate)
│   │
│   ├── types/
│   │   ├── quiz.ts               # Quiz types
│   │   ├── assessment.ts         # Assessment types
│   │   └── database.ts           # Supabase types (auto-generated)
│   │
│   └── hooks/
│       ├── useQuizProgress.ts    # Quiz state management
│       └── useLocalStorage.ts    # Persist quiz answers
│
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service Worker
│   ├── icons/                    # App icons (192x192, 512x512)
│   └── robots.txt
│
├── supabase/
│   ├── config.toml               # Supabase config
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── functions/
│       └── send-results-email/   # Edge Function for email
│           └── index.ts
│
├── .env.local                    # Environment variables
├── next.config.js                # Next.js config (PWA, i18n)
├── tailwind.config.ts            # Tailwind + Carbon Design tokens
├── tsconfig.json                 # TypeScript config
└── package.json
```

---

### Key Components

#### `QuizQuestion.tsx` (Reusable Quiz Step)

```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

interface QuizQuestionProps {
  question: string;
  questionHe: string; // Hebrew translation
  options: Array<{
    value: string;
    label: string;
    labelHe: string;
  }>;
  helpText?: string;
  onAnswer: (value: string) => void;
  currentStep: number;
  totalSteps: number;
}

export function QuizQuestion({
  question,
  questionHe,
  options,
  helpText,
  onAnswer,
  currentStep,
  totalSteps,
}: QuizQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      onAnswer(selected);
    }
  };

  return (
    <Card className="p-8 bg-secondary border border-subtle">
      {/* Progress */}
      <div className="mb-6 text-sm text-secondary">
        {currentStep} / {totalSteps}
      </div>

      {/* Question */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{question}</h2>
        <p className="text-xl opacity-70">{questionHe}</p>
      </div>

      {/* Options */}
      <RadioGroup value={selected || ''} onValueChange={setSelected}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value={option.value} id={option.value} />
            <Label htmlFor={option.value} className="cursor-pointer">
              <div className="font-medium">{option.labelHe}</div>
              <div className="text-sm opacity-70">{option.label}</div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Help Tooltip */}
      {helpText && (
        <div className="mt-4 flex items-center gap-2">
          <InfoIcon className="w-4 h-4 text-accent" />
          <Tooltip content={helpText}>
            <span className="text-sm cursor-help">Need help?</span>
          </Tooltip>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={() => history.back()}>
          ← Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selected}
          className="bg-accent hover:brightness-110"
        >
          Next →
        </Button>
      </div>
    </Card>
  );
}
```

---

## 6. Deployment & Infrastructure

### Environment Variables

**`.env.local`** (Development):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key (server-side only)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Email (Resend.com)
RESEND_API_KEY=re_your_key

# Analytics (Plausible)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=biogov.il
```

**Vercel Environment Variables** (Production):
- Add same variables in Vercel dashboard
- `SUPABASE_SERVICE_KEY` → Secret (not exposed to client)
- Auto-deploy on push to `main` branch

---

### Deployment Steps

1. **Connect GitHub to Vercel**:
   ```bash
   vercel login
   vercel link
   ```

2. **Configure Build**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables** in Vercel dashboard

4. **Deploy**:
   ```bash
   git push origin main
   # Vercel auto-deploys on push
   ```

5. **Custom Domain**:
   - Purchase `biogov.il` (Namecheap: ~$15/year)
   - Add DNS records in Vercel:
     ```
     A    @     76.76.21.21
     CNAME www  cname.vercel-dns.com
     ```

---

## 7. Security & Privacy

### Data Protection

1. **Minimal Data Collection**:
   - Only collect email + name (no phone, address, ID)
   - Anonymous assessments allowed (no login required)

2. **Encryption**:
   - HTTPS enforced (Vercel SSL)
   - Supabase encrypts data at rest (AES-256)

3. **Row-Level Security (RLS)**:
   - Users can only read their own data
   - API keys never exposed to client

4. **IP Hashing**:
   - Store SHA-256 hash, not raw IP (privacy-friendly rate limiting)

5. **GDPR/Amendment 13 Compliance**:
   - Privacy policy with consent checkbox
   - Unsubscribe link in all emails
   - Data retention: 2 years, then auto-delete

### Rate Limiting

**Implementation** (`lib/rate-limit.ts`):
```typescript
import crypto from 'crypto';

export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

export async function checkRateLimit(
  ipHash: string,
  limit: number = 10,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<boolean> {
  const { count } = await supabase
    .from('assessments')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', new Date(Date.now() - windowMs).toISOString());

  return count ? count < limit : true;
}
```

---

## 8. Performance Optimization

### Metrics Targets

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **First Input Delay (FID)** | < 100ms | Chrome DevTools |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **Time to Interactive (TTI)** | < 3s | Lighthouse |
| **Bundle Size** | < 200KB (gzipped) | Next.js build analyzer |

### Optimization Strategies

1. **Image Optimization**:
   - Use Next.js `<Image>` component
   - WebP format, lazy loading
   - CDN delivery via Vercel

2. **Font Loading**:
   - Rubik already loaded in `layout.tsx`
   - `font-display: swap` to avoid FOIT

3. **Code Splitting**:
   - Dynamic imports for heavy components
   ```typescript
   const FeedbackWidget = dynamic(() => import('@/components/feedback/FeedbackWidget'));
   ```

4. **Caching**:
   - Supabase responses cached (Stale-While-Revalidate)
   - Static pages: ISR (Incremental Static Regeneration)

5. **Tree Shaking**:
   - Import only used Tailwind classes
   - Lucide icons: import individual icons, not full library

---

## 9. Development Workflow

### Local Development

```bash
# Clone repo
git clone https://github.com/yourorg/biogov.git
cd biogov/biogov-ui

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in Supabase keys

# Run dev server
npm run dev
# Open http://localhost:3001

# Run Supabase locally (optional)
npx supabase start
```

### Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# E2E tests (Playwright - future)
npm run test:e2e
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/email-signup

# Commit with conventional commits
git commit -m "feat(api): add email signup endpoint"

# Push and create PR
git push origin feature/email-signup
# Open PR on GitHub → Auto-deploys preview URL
```

### CI/CD (GitHub Actions)

**`.github/workflows/ci.yml`**:
```yaml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 10. Monitoring & Analytics

### Health Checks

**Endpoint**: `/api/health`

```typescript
export async function GET() {
  // Check Supabase connection
  const { error } = await supabase.from('users').select('id').limit(1);

  if (error) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() });
}
```

### Analytics (Plausible)

**Track Events**:
```typescript
// In _app.tsx or layout.tsx
import Plausible from 'plausible-tracker';

const plausible = Plausible({
  domain: 'biogov.il',
});

// Track page views (auto)
plausible.enableAutoPageviews();

// Track custom events
plausible.trackEvent('quiz_started');
plausible.trackEvent('quiz_completed', { props: { status: 'פטור' } });
plausible.trackEvent('email_signup');
plausible.trackEvent('feedback_submitted', { props: { rating: 5 } });
```

---

## 11. Appendix

### Supabase Setup Checklist

- [ ] Create Supabase project (free tier)
- [ ] Copy API keys to `.env.local`
- [ ] Run migration: `npx supabase db push`
- [ ] Enable RLS policies
- [ ] Configure email templates (Supabase Auth)
- [ ] Set up Edge Function for email delivery

### Resend.com Setup

- [ ] Create account (free tier: 3,000 emails/month)
- [ ] Verify domain (DNS TXT record)
- [ ] Copy API key to environment variables
- [ ] Create email template (React Email)

### Vercel Setup

- [ ] Connect GitHub repo
- [ ] Add environment variables
- [ ] Configure custom domain
- [ ] Enable auto-deploy on push

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 30, 2025 | Claude Code + User | Initial MVP technical architecture |

---

**Next Steps**: Database implementation → API endpoints → Frontend components → Testing → Launch 🚀
