-- ============================================================================
-- Migration: Custom Authentication System
-- Created: 2025-11-01
-- Description: JWT-based auth with sessions, email verification, password reset
-- ============================================================================

BEGIN;

-- ============================================================================
-- SCHEMA: Create auth schema
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS auth;

-- ============================================================================
-- TABLE: Update public.users for authentication
-- ============================================================================

-- Add password and authentication fields to existing users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ DEFAULT NULL;

-- Add NOT NULL constraint after migration (allows existing users)
-- In production: UPDATE users SET password_hash = '<temp>' WHERE password_hash IS NULL;
-- Then: ALTER TABLE public.users ALTER COLUMN password_hash SET NOT NULL;

-- Add index for failed login tracking
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON public.users(locked_until) WHERE locked_until IS NOT NULL;

-- Comments
COMMENT ON COLUMN public.users.password_hash IS 'Bcrypt hashed password (rounds=12)';
COMMENT ON COLUMN public.users.email_verified IS 'Email verification status (via email_verifications table)';
COMMENT ON COLUMN public.users.failed_login_attempts IS 'Counter for brute-force protection (resets on successful login)';
COMMENT ON COLUMN public.users.locked_until IS 'Account lockout expiry (NULL = not locked, set after 5 failed attempts)';

-- ============================================================================
-- TABLE: auth.sessions
-- Purpose: JWT token session management
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth.sessions (
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

  -- Prevent duplicate active sessions for same tokens
  CONSTRAINT unique_access_token UNIQUE (access_token_hash),
  CONSTRAINT unique_refresh_token UNIQUE (refresh_token_hash)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_access_token_hash ON auth.sessions(access_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token_hash ON auth.sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON auth.sessions(refresh_token_expires_at);

-- Partial index for active sessions only
CREATE INDEX IF NOT EXISTS idx_sessions_active ON auth.sessions(user_id, created_at DESC)
WHERE revoked_at IS NULL AND refresh_token_expires_at > NOW();

-- Comments
COMMENT ON TABLE auth.sessions IS 'JWT session management with token hashes and expiry tracking';
COMMENT ON COLUMN auth.sessions.access_token_hash IS 'SHA-256 hash of access token (verified on each API request)';
COMMENT ON COLUMN auth.sessions.refresh_token_hash IS 'SHA-256 hash of refresh token (used to generate new access tokens)';
COMMENT ON COLUMN auth.sessions.access_token_expires_at IS 'Access token expiry (default: 15 minutes)';
COMMENT ON COLUMN auth.sessions.refresh_token_expires_at IS 'Refresh token expiry (default: 7 days)';
COMMENT ON COLUMN auth.sessions.revoked_at IS 'Manual logout timestamp (revoked sessions cannot be used)';

-- ============================================================================
-- TABLE: auth.email_verifications
-- Purpose: Email verification tokens (24-hour expiry)
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth.email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_verifications_token_hash ON auth.email_verifications(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON auth.email_verifications(user_id);

-- Partial index for pending verifications only
CREATE INDEX IF NOT EXISTS idx_email_verifications_pending ON auth.email_verifications(user_id)
WHERE verified_at IS NULL AND expires_at > NOW();

-- Comments
COMMENT ON TABLE auth.email_verifications IS 'Email verification tokens with 24-hour expiry';
COMMENT ON COLUMN auth.email_verifications.token_hash IS 'SHA-256 hash of verification token (sent via email)';
COMMENT ON COLUMN auth.email_verifications.verified_at IS 'Timestamp when user clicked verification link';

-- ============================================================================
-- TABLE: auth.password_resets
-- Purpose: Password reset tokens (1-hour expiry)
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth.password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON auth.password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON auth.password_resets(user_id);

-- Partial index for unused tokens only
CREATE INDEX IF NOT EXISTS idx_password_resets_unused ON auth.password_resets(user_id)
WHERE used_at IS NULL AND expires_at > NOW();

-- Comments
COMMENT ON TABLE auth.password_resets IS 'Password reset tokens with 1-hour expiry';
COMMENT ON COLUMN auth.password_resets.token_hash IS 'SHA-256 hash of reset token (sent via email)';
COMMENT ON COLUMN auth.password_resets.used_at IS 'Timestamp when user completed password reset';

-- ============================================================================
-- TABLE: auth.audit_log
-- Purpose: Security event tracking (Israeli Privacy Law Amendment 13)
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validate action types
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
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON auth.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON auth.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON auth.audit_log(created_at DESC);

-- Partial index for failed actions only (security monitoring)
CREATE INDEX IF NOT EXISTS idx_audit_log_failures ON auth.audit_log(user_id, created_at DESC)
WHERE success = FALSE;

-- Comments
COMMENT ON TABLE auth.audit_log IS 'Security audit trail for Israeli Privacy Law compliance';
COMMENT ON COLUMN auth.audit_log.action IS 'Action type: login, logout, signup, password_changed, etc.';
COMMENT ON COLUMN auth.audit_log.success IS 'Action success status (false = failed attempt)';
COMMENT ON COLUMN auth.audit_log.metadata IS 'Additional context as JSON (e.g., failed login reason)';

-- ============================================================================
-- FUNCTION: auth.current_user_id()
-- Purpose: Get authenticated user ID from session variable
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.user_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION auth.current_user_id IS 'Returns UUID of authenticated user from app.user_id session variable';

-- ============================================================================
-- ROW-LEVEL SECURITY: Enable RLS on auth tables
-- ============================================================================

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: auth.sessions
-- ============================================================================

-- Policy: Users can read their own sessions
CREATE POLICY "Users can read own sessions"
  ON auth.sessions
  FOR SELECT
  USING (auth.current_user_id() = user_id);

-- Policy: Users can revoke their own sessions (logout)
CREATE POLICY "Users can revoke own sessions"
  ON auth.sessions
  FOR UPDATE
  USING (auth.current_user_id() = user_id);

-- Policy: Only backend can create sessions (no direct INSERT from client)
-- (Backend uses service role, not RLS-restricted connection)

-- ============================================================================
-- POLICIES: auth.email_verifications
-- ============================================================================

-- Policy: Users can read their own verification status
CREATE POLICY "Users can read own verifications"
  ON auth.email_verifications
  FOR SELECT
  USING (auth.current_user_id() = user_id);

-- ============================================================================
-- POLICIES: auth.password_resets
-- ============================================================================

-- Policy: Users can read their own password reset history
CREATE POLICY "Users can read own password resets"
  ON auth.password_resets
  FOR SELECT
  USING (auth.current_user_id() = user_id);

-- ============================================================================
-- POLICIES: auth.audit_log
-- ============================================================================

-- Policy: Users can read their own audit log
CREATE POLICY "Users can read own audit log"
  ON auth.audit_log
  FOR SELECT
  USING (auth.current_user_id() = user_id);

-- ============================================================================
-- GRANTS: Allow backend to access auth schema
-- ============================================================================

-- Grant usage on auth schema to authenticated users
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant SELECT on sessions, verifications, resets (read-only for users)
GRANT SELECT ON auth.sessions TO authenticated;
GRANT SELECT ON auth.email_verifications TO authenticated;
GRANT SELECT ON auth.password_resets TO authenticated;
GRANT SELECT ON auth.audit_log TO authenticated;

-- Grant UPDATE on sessions for logout (revoke session)
GRANT UPDATE ON auth.sessions TO authenticated;

-- ============================================================================
-- CLEANUP: Function to delete expired tokens/sessions
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Delete expired sessions (older than 30 days past expiry)
  DELETE FROM auth.sessions
  WHERE refresh_token_expires_at < NOW() - INTERVAL '30 days';

  -- Delete verified email verifications (older than 7 days)
  DELETE FROM auth.email_verifications
  WHERE verified_at IS NOT NULL AND verified_at < NOW() - INTERVAL '7 days';

  -- Delete expired email verifications (older than 7 days past expiry)
  DELETE FROM auth.email_verifications
  WHERE verified_at IS NULL AND expires_at < NOW() - INTERVAL '7 days';

  -- Delete used password resets (older than 7 days)
  DELETE FROM auth.password_resets
  WHERE used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days';

  -- Delete expired password resets (older than 7 days past expiry)
  DELETE FROM auth.password_resets
  WHERE used_at IS NULL AND expires_at < NOW() - INTERVAL '7 days';

  -- Keep audit logs for 1 year (legal requirement)
  DELETE FROM auth.audit_log
  WHERE created_at < NOW() - INTERVAL '1 year';

  RAISE NOTICE '✅ Cleanup complete: Deleted expired sessions, tokens, and old audit logs';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auth.cleanup_expired_data IS 'Delete expired sessions, tokens, and old audit logs (run weekly via cron)';

-- ============================================================================
-- UPDATE: Email logs table (add new email types)
-- ============================================================================

-- Drop old constraint if exists
ALTER TABLE public.email_logs DROP CONSTRAINT IF EXISTS valid_email_type;

-- Add new constraint with verification and password reset types
ALTER TABLE public.email_logs
ADD CONSTRAINT valid_email_type CHECK (email_type IN (
  'results',
  'reminder',
  'welcome',
  'verification',
  'password_reset'
));

-- ============================================================================
-- FINALIZE
-- ============================================================================

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Custom authentication system created successfully!';
  RAISE NOTICE 'Schema: auth (sessions, email_verifications, password_resets, audit_log)';
  RAISE NOTICE 'Function: auth.current_user_id() for RLS policies';
  RAISE NOTICE 'Cleanup: Run auth.cleanup_expired_data() weekly via cron';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Build signup/login API endpoints (Next.js API routes)';
  RAISE NOTICE '2. Build authentication middleware';
  RAISE NOTICE '3. Test auth flow with Postman';
END $$;
