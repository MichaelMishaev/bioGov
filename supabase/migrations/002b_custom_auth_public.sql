-- ============================================================================
-- Migration: Custom Authentication System (Public Schema)
-- Created: 2025-11-01
-- Description: JWT-based auth with sessions, email verification, password reset
-- Note: Using public schema with auth_ prefix instead of auth schema
-- ============================================================================

BEGIN;

-- ============================================================================
-- TABLE: Update public.users for authentication
-- ============================================================================

-- Add password and authentication fields (if not exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'users'
                 AND column_name = 'password_hash') THEN
    ALTER TABLE public.users ADD COLUMN password_hash TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'users'
                 AND column_name = 'email_verified') THEN
    ALTER TABLE public.users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'users'
                 AND column_name = 'failed_login_attempts') THEN
    ALTER TABLE public.users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'users'
                 AND column_name = 'locked_until') THEN
    ALTER TABLE public.users ADD COLUMN locked_until TIMESTAMPTZ DEFAULT NULL;
  END IF;
END $$;

-- Add index for failed login tracking
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON public.users(locked_until)
WHERE locked_until IS NOT NULL;

-- ============================================================================
-- TABLE: public.auth_sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_token_hash TEXT NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  access_token_expires_at TIMESTAMPTZ NOT NULL,
  refresh_token_expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT unique_access_token UNIQUE (access_token_hash),
  CONSTRAINT unique_refresh_token UNIQUE (refresh_token_hash)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON public.auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_access_token_hash ON public.auth_sessions(access_token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_refresh_token_hash ON public.auth_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON public.auth_sessions(refresh_token_expires_at);

-- Partial index for active sessions only
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON public.auth_sessions(user_id, created_at DESC)
WHERE revoked_at IS NULL AND refresh_token_expires_at > NOW();

-- ============================================================================
-- TABLE: public.auth_email_verifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.auth_email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auth_email_verifications_token_hash ON public.auth_email_verifications(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_email_verifications_user_id ON public.auth_email_verifications(user_id);

-- Partial index for pending verifications only
CREATE INDEX IF NOT EXISTS idx_auth_email_verifications_pending ON public.auth_email_verifications(user_id)
WHERE verified_at IS NULL AND expires_at > NOW();

-- ============================================================================
-- TABLE: public.auth_password_resets
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.auth_password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auth_password_resets_token_hash ON public.auth_password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_password_resets_user_id ON public.auth_password_resets(user_id);

-- Partial index for unused tokens only
CREATE INDEX IF NOT EXISTS idx_auth_password_resets_unused ON public.auth_password_resets(user_id)
WHERE used_at IS NULL AND expires_at > NOW();

-- ============================================================================
-- TABLE: public.auth_audit_log
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.auth_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_action CHECK (action IN (
    'login',
    'login_failed',
    'logout',
    'signup',
    'email_verified',
    'password_changed',
    'password_reset_requested',
    'password_reset_completed',
    'session_revoked',
    'account_locked'
  ))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_id ON public.auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_action ON public.auth_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created_at ON public.auth_audit_log(created_at DESC);

-- Partial index for failed actions only
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_failures ON public.auth_audit_log(user_id, created_at DESC)
WHERE success = FALSE;

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Custom authentication system created successfully in public schema!';
  RAISE NOTICE 'Tables: auth_sessions, auth_email_verifications, auth_password_resets, auth_audit_log';
END $$;
