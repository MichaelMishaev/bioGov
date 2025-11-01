# Railway + Custom Authentication Implementation Guide
**bioGov MVP - Phase 2: Authentication System**

---

## Overview

This guide walks through implementing a production-ready custom authentication system using Railway PostgreSQL and Next.js.

**Estimated Time:** 7 days
**Monthly Cost:** $10-15 (Railway PostgreSQL + app hosting)
**What You Get:** Secure auth system with email verification, password reset, JWT tokens, and Israeli compliance

---

## Prerequisites

Before starting, ensure you have:
- ✅ Existing bioGov codebase
- ✅ Neon database with current data
- ✅ GitHub account (for Railway)
- ✅ Credit card (for Railway - $5 free credit, then pay-as-you-go)

---

## Phase 1: Railway Setup (Day 1 - 2 hours)

### Step 1.1: Create Railway Account

1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub
4. You receive **$5 free credit** automatically

**Why GitHub login?**
- Easier deployment from Git repos
- Auto-deploys on push
- Free CI/CD pipeline

---

### Step 1.2: Create PostgreSQL Database

1. **In Railway dashboard:**
   - Click "New Project"
   - Select "Deploy PostgreSQL"
   - Wait 30 seconds for provisioning

2. **Get your connection string:**
   - Click on the PostgreSQL service
   - Go to "Variables" tab
   - Copy `DATABASE_URL` value
   - Should look like: `postgresql://postgres:password@region.railway.app:5432/railway`

3. **Save credentials:**
   ```bash
   # Add to /Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/.env.local

   # Replace existing DATABASE_URL
   DATABASE_URL="postgresql://postgres:xxx@monorail.proxy.rlwy.net:12345/railway"
   ```

---

### Step 1.3: Migrate Existing Data from Neon

**Option A: Export/Import (Recommended for small datasets)**

```bash
# 1. Export from Neon
pg_dump "postgresql://neondb_owner:npg_sqgk5oMBfp2E@ep-floral-cake-ahtvnv7l-pooler.c-3.us-east-1.aws.neon.tech/neondb" > neon_backup.sql

# 2. Import to Railway
psql "postgresql://postgres:xxx@monorail.proxy.rlwy.net:12345/railway" < neon_backup.sql

# 3. Verify tables exist
psql "postgresql://postgres:xxx@monorail.proxy.rlwy.net:12345/railway" -c "\dt public.*"
```

**Option B: Fresh Migration (Recommended for clean start)**

```bash
# Just run your migration file on Railway
cd /Users/michaelmishayev/Desktop/Projects/bioGov

# Connect to Railway and run migration
psql $DATABASE_URL < supabase/migrations/001_initial_schema.sql
```

---

### Step 1.4: Test Connection

```bash
cd /Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui

# Test database connection
npm run dev

# Visit http://localhost:3000/api/assess and check if it works
```

**Expected:** No errors in terminal, API responds normally.

---

## Phase 2: Auth Database Schema (Day 1 - 3 hours)

### Step 2.1: Create Auth Schema

Create new migration file:

```bash
touch supabase/migrations/002_custom_auth.sql
```

**File content:**

```sql
-- ============================================================================
-- Migration: Custom Authentication System for Railway
-- Created: 2025-10-31
-- Purpose: Replace Supabase Auth with custom JWT-based authentication
-- ============================================================================

BEGIN;

-- Create auth schema for separation
CREATE SCHEMA IF NOT EXISTS auth;

-- ============================================================================
-- TABLE: auth.sessions
-- Purpose: Store active user sessions with JWT tokens
-- ============================================================================

CREATE TABLE auth.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Token storage
  access_token_hash TEXT NOT NULL, -- SHA-256 hash of access token
  refresh_token_hash TEXT NOT NULL, -- SHA-256 hash of refresh token

  -- Expiration
  access_token_expires_at TIMESTAMPTZ NOT NULL,
  refresh_token_expires_at TIMESTAMPTZ NOT NULL,

  -- Security audit
  ip_address INET,
  user_agent TEXT,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ DEFAULT NULL,

  -- Indexes
  CONSTRAINT valid_expiration CHECK (refresh_token_expires_at > access_token_expires_at)
);

CREATE INDEX idx_sessions_user_id ON auth.sessions(user_id);
CREATE INDEX idx_sessions_access_token ON auth.sessions(access_token_hash);
CREATE INDEX idx_sessions_refresh_token ON auth.sessions(refresh_token_hash);
CREATE INDEX idx_sessions_expires ON auth.sessions(access_token_expires_at) WHERE revoked_at IS NULL;

COMMENT ON TABLE auth.sessions IS 'Active user sessions with JWT tokens';

-- ============================================================================
-- TABLE: auth.email_verifications
-- Purpose: Email verification tokens (6-digit codes + links)
-- ============================================================================

CREATE TABLE auth.email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Verification token
  token TEXT UNIQUE NOT NULL, -- 6-digit code or UUID link
  token_type TEXT NOT NULL CHECK (token_type IN ('email_verification', 'password_reset')),

  -- Expiration and usage
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  attempts INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT max_attempts CHECK (attempts <= 5)
);

CREATE INDEX idx_email_verifications_token ON auth.email_verifications(token) WHERE used_at IS NULL;
CREATE INDEX idx_email_verifications_user ON auth.email_verifications(user_id, token_type);

COMMENT ON TABLE auth.email_verifications IS 'Email verification and password reset tokens';

-- ============================================================================
-- TABLE: auth.audit_log
-- Purpose: Log all authentication events for security
-- ============================================================================

CREATE TABLE auth.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Event details
  event_type TEXT NOT NULL, -- 'signup', 'login', 'logout', 'password_change', etc.
  success BOOLEAN NOT NULL,
  error_message TEXT,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON auth.audit_log(user_id);
CREATE INDEX idx_audit_log_event_type ON auth.audit_log(event_type);
CREATE INDEX idx_audit_log_created_at ON auth.audit_log(created_at DESC);

COMMENT ON TABLE auth.audit_log IS 'Authentication event audit trail';

-- ============================================================================
-- UPDATE: public.users table
-- Add auth-related fields
-- ============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ DEFAULT NULL;

-- Add constraints
ALTER TABLE public.users
  ADD CONSTRAINT password_required CHECK (password_hash IS NOT NULL OR email_verified = FALSE);

COMMENT ON COLUMN public.users.password_hash IS 'Bcrypt hashed password (cost factor 12)';
COMMENT ON COLUMN public.users.failed_login_attempts IS 'Counter for brute-force protection';
COMMENT ON COLUMN public.users.locked_until IS 'Account locked until this timestamp (after 5 failed attempts)';

-- ============================================================================
-- FUNCTION: auth.current_user_id()
-- Purpose: Replacement for Supabase auth.uid()
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
BEGIN
  -- Get user_id from session variable (set by middleware)
  RETURN NULLIF(current_setting('app.user_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION auth.current_user_id IS 'Returns current authenticated user ID (replaces Supabase auth.uid())';

-- ============================================================================
-- UPDATE RLS POLICIES: Replace auth.uid() with auth.current_user_id()
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Recreate with custom function
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.current_user_id() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.current_user_id() = id);

-- Update assessments policies
DROP POLICY IF EXISTS "Anyone can read assessments" ON public.assessments;

CREATE POLICY "Users can read own assessments"
  ON public.assessments
  FOR SELECT
  USING (auth.current_user_id() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create assessments"
  ON public.assessments
  FOR INSERT
  WITH CHECK (auth.current_user_id() = user_id OR user_id IS NULL);

-- ============================================================================
-- FUNCTION: Clean up expired sessions (call via cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.sessions
  WHERE access_token_expires_at < NOW() - INTERVAL '7 days'
     OR revoked_at IS NOT NULL;

  DELETE FROM auth.email_verifications
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auth.cleanup_expired_sessions IS 'Remove expired sessions and tokens (run daily via cron)';

-- ============================================================================
-- GRANTS: Allow authenticated users to access auth schema
-- ============================================================================

GRANT USAGE ON SCHEMA auth TO authenticated, anon;
GRANT SELECT ON auth.sessions TO authenticated;
GRANT SELECT, INSERT, DELETE ON auth.email_verifications TO authenticated;
GRANT INSERT ON auth.audit_log TO authenticated, anon;

COMMIT;

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Custom auth schema created successfully!';
  RAISE NOTICE 'Tables: auth.sessions, auth.email_verifications, auth.audit_log';
  RAISE NOTICE 'Function: auth.current_user_id() replaces auth.uid()';
  RAISE NOTICE 'RLS: Updated to use custom auth function';
END $$;
```

---

### Step 2.2: Run Auth Migration

```bash
cd /Users/michaelmishayev/Desktop/Projects/bioGov

# Apply migration to Railway
psql $DATABASE_URL < supabase/migrations/002_custom_auth.sql

# Verify tables created
psql $DATABASE_URL -c "\dt auth.*"
```

**Expected output:**
```
 Schema |        Name          | Type  |  Owner
--------+----------------------+-------+----------
 auth   | sessions             | table | postgres
 auth   | email_verifications  | table | postgres
 auth   | audit_log            | table | postgres
```

---

## Phase 3: Auth Backend Logic (Day 2-3 - 8 hours)

### Step 3.1: Install Dependencies

```bash
cd /Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui

npm install bcrypt jsonwebtoken
npm install --save-dev @types/bcrypt @types/jsonwebtoken
```

---

### Step 3.2: Create Auth Utilities

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/lib/auth.ts`:

```typescript
/**
 * Custom Authentication System for bioGov
 * Replaces Supabase Auth with JWT-based authentication
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';

// JWT secrets (IMPORTANT: Add to .env.local)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

// Token expiration
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Bcrypt cost factor
const BCRYPT_ROUNDS = 12;

/**
 * Password Hashing
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * JWT Token Generation
 */
export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'biogov.il',
    audience: 'biogov-users',
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'biogov.il',
    audience: 'biogov-users',
  });
}

/**
 * JWT Token Verification
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'biogov.il',
      audience: 'biogov-users',
    }) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'biogov.il',
      audience: 'biogov-users',
    }) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Token Hashing (for database storage)
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verification Code Generation
 */
export function generateVerificationCode(): string {
  // 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateVerificationToken(): string {
  // Secure random token (URL-safe)
  return randomBytes(32).toString('base64url');
}

/**
 * Password Validation
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Email Validation
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

---

### Step 3.3: Update Environment Variables

Add to `.env.local`:

```bash
# Authentication Secrets (GENERATE THESE!)
ACCESS_TOKEN_SECRET="your-super-secret-access-token-key-min-32-chars"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-min-32-chars"
```

**Generate secure secrets:**

```bash
# In terminal, run:
node -e "console.log('ACCESS_TOKEN_SECRET=\"' + require('crypto').randomBytes(64).toString('hex') + '\"')"
node -e "console.log('REFRESH_TOKEN_SECRET=\"' + require('crypto').randomBytes(64).toString('hex') + '\"')"
```

Copy output to `.env.local`.

---

## Phase 4: Authentication API Routes (Day 3-4 - 10 hours)

### Step 4.1: Signup Endpoint

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/api/auth/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  hashPassword,
  validatePassword,
  validateEmail,
  generateVerificationToken,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, consentGiven } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Password requirements not met', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    if (!consentGiven) {
      return NextResponse.json(
        { error: 'You must accept the privacy policy' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await db.createUser(email, name, consentGiven);

    // Update password hash
    await db.query(
      'UPDATE public.users SET password_hash = $1 WHERE id = $2',
      [passwordHash, user.id]
    );

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.query(
      `INSERT INTO auth.email_verifications (user_id, token, token_type, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, verificationToken, 'email_verification', expiresAt]
    );

    // TODO: Send verification email via Resend.com
    // await sendVerificationEmail(email, verificationToken);

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Store session
    await db.query(
      `INSERT INTO auth.sessions (
        user_id, access_token_hash, refresh_token_hash,
        access_token_expires_at, refresh_token_expires_at,
        ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user.id,
        hashToken(accessToken),
        hashToken(refreshToken),
        new Date(Date.now() + 15 * 60 * 1000), // 15 min
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        request.ip || null,
        request.headers.get('user-agent') || null,
      ]
    );

    // Log audit event
    await db.query(
      `INSERT INTO auth.audit_log (user_id, event_type, success, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, 'signup', true, request.ip || null, request.headers.get('user-agent') || null]
    );

    // Set HTTP-only cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: false,
      },
      message: 'Account created! Please verify your email.',
    });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Step 4.2: Login Endpoint

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '@/lib/auth';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find user
    const result = await db.query(
      `SELECT id, email, name, password_hash, email_verified,
              failed_login_attempts, locked_until
       FROM public.users
       WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil(
        (new Date(user.locked_until).getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`,
        },
        { status: 423 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      // Increment failed attempts
      const newAttempts = user.failed_login_attempts + 1;
      const lockUntil =
        newAttempts >= MAX_LOGIN_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_DURATION)
          : null;

      await db.query(
        `UPDATE public.users
         SET failed_login_attempts = $1,
             locked_until = $2
         WHERE id = $3`,
        [newAttempts, lockUntil, user.id]
      );

      // Log failed attempt
      await db.query(
        `INSERT INTO auth.audit_log (user_id, event_type, success, error_message, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.id,
          'login',
          false,
          'Invalid password',
          request.ip || null,
          request.headers.get('user-agent') || null,
        ]
      );

      if (lockUntil) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Account locked for 15 minutes.' },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          error: 'Invalid email or password',
          attemptsLeft: MAX_LOGIN_ATTEMPTS - newAttempts,
        },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login
    await db.query(
      `UPDATE public.users
       SET failed_login_attempts = 0,
           locked_until = NULL,
           last_login_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Store session
    await db.query(
      `INSERT INTO auth.sessions (
        user_id, access_token_hash, refresh_token_hash,
        access_token_expires_at, refresh_token_expires_at,
        ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user.id,
        hashToken(accessToken),
        hashToken(refreshToken),
        new Date(Date.now() + 15 * 60 * 1000),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        request.ip || null,
        request.headers.get('user-agent') || null,
      ]
    );

    // Log successful login
    await db.query(
      `INSERT INTO auth.audit_log (user_id, event_type, success, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, 'login', true, request.ip || null, request.headers.get('user-agent') || null]
    );

    // Set cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
      },
    });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## TO BE CONTINUED IN NEXT FILE...

This file is Part 1 of 3. See:
- `RAILWAY_AUTH_IMPLEMENTATION_PART2.md` for middleware, logout, and verification
- `RAILWAY_AUTH_IMPLEMENTATION_PART3.md` for UI components and testing
