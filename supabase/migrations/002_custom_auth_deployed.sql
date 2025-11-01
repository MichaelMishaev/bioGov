-- ============================================================================
-- Migration: Custom Authentication System (Fixed for Neon)
-- Created: 2025-11-01
-- Description: JWT-based auth with sessions, email verification, password reset
-- Note: Using public schema, removed NOW() from partial indexes (immutability issue)
-- ============================================================================

BEGIN;

-- ============================================================================
-- TABLE: Update public.users for authentication
-- ============================================================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_users_locked_until ON public.users(locked_until) WHERE locked_until IS NOT NULL;

COMMENT ON COLUMN public.users.password_hash IS 'Bcrypt hashed password (rounds=12)';
COMMENT ON COLUMN public.users.email_verified IS 'Email verification status';
COMMENT ON COLUMN public.users.failed_login_attempts IS 'Counter for brute-force protection';
COMMENT ON COLUMN public.users.locked_until IS 'Account lockout expiry';

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

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON public.auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_access_token_hash ON public.auth_sessions(access_token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_refresh_token_hash ON public.auth_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON public.auth_sessions(refresh_token_expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON public.auth_sessions(user_id, created_at DESC) WHERE revoked_at IS NULL;

COMMENT ON TABLE public.auth_sessions IS 'JWT session management with token hashes';
COMMENT ON COLUMN public.auth_sessions.access_token_hash IS 'SHA-256 hash of access token';
COMMENT ON COLUMN public.auth_sessions.refresh_token_hash IS 'SHA-256 hash of refresh token';

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

CREATE INDEX IF NOT EXISTS idx_auth_email_verifications_token_hash ON public.auth_email_verifications(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_email_verifications_user_id ON public.auth_email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_email_verifications_pending ON public.auth_email_verifications(user_id) WHERE verified_at IS NULL;

COMMENT ON TABLE public.auth_email_verifications IS 'Email verification tokens with 24-hour expiry';
COMMENT ON COLUMN public.auth_email_verifications.token_hash IS 'SHA-256 hash of verification token';

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

CREATE INDEX IF NOT EXISTS idx_auth_password_resets_token_hash ON public.auth_password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_password_resets_user_id ON public.auth_password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_password_resets_unused ON public.auth_password_resets(user_id) WHERE used_at IS NULL;

COMMENT ON TABLE public.auth_password_resets IS 'Password reset tokens with 1-hour expiry';
COMMENT ON COLUMN public.auth_password_resets.token_hash IS 'SHA-256 hash of reset token';

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
    'login', 'login_failed', 'logout', 'signup', 'email_verified',
    'password_changed', 'password_reset_requested', 'password_reset_completed',
    'session_revoked', 'account_locked'
  ))
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_id ON public.auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_action ON public.auth_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created_at ON public.auth_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_failures ON public.auth_audit_log(user_id, created_at DESC) WHERE success = FALSE;

COMMENT ON TABLE public.auth_audit_log IS 'Security audit trail for Israeli Privacy Law compliance';

-- ============================================================================
-- FUNCTION: public.auth_current_user_id()
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auth_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.user_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.auth_current_user_id IS 'Returns authenticated user ID from session variable';

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions" ON public.auth_sessions FOR SELECT USING (public.auth_current_user_id() = user_id);
CREATE POLICY "Users can revoke own sessions" ON public.auth_sessions FOR UPDATE USING (public.auth_current_user_id() = user_id);
CREATE POLICY "Users can read own verifications" ON public.auth_email_verifications FOR SELECT USING (public.auth_current_user_id() = user_id);
CREATE POLICY "Users can read own password resets" ON public.auth_password_resets FOR SELECT USING (public.auth_current_user_id() = user_id);
CREATE POLICY "Users can read own audit log" ON public.auth_audit_log FOR SELECT USING (public.auth_current_user_id() = user_id);

-- ============================================================================
-- CLEANUP FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auth_cleanup_expired_data()
RETURNS void AS $$
BEGIN
  DELETE FROM public.auth_sessions WHERE refresh_token_expires_at < NOW() - INTERVAL '30 days';
  DELETE FROM public.auth_email_verifications WHERE verified_at IS NOT NULL AND verified_at < NOW() - INTERVAL '7 days';
  DELETE FROM public.auth_email_verifications WHERE verified_at IS NULL AND expires_at < NOW() - INTERVAL '7 days';
  DELETE FROM public.auth_password_resets WHERE used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days';
  DELETE FROM public.auth_password_resets WHERE used_at IS NULL AND expires_at < NOW() - INTERVAL '7 days';
  DELETE FROM public.auth_audit_log WHERE created_at < NOW() - INTERVAL '1 year';
  RAISE NOTICE 'Cleanup complete';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.auth_cleanup_expired_data IS 'Delete expired sessions and tokens (run weekly)';

-- ============================================================================
-- UPDATE EMAIL LOGS
-- ============================================================================

ALTER TABLE public.email_logs DROP CONSTRAINT IF EXISTS valid_email_type;
ALTER TABLE public.email_logs ADD CONSTRAINT valid_email_type CHECK (email_type IN (
  'results', 'reminder', 'welcome', 'verification', 'password_reset'
));

COMMIT;

DO $$
BEGIN
  RAISE NOTICE '✅ Authentication system deployed successfully!';
  RAISE NOTICE 'Tables: auth_sessions, auth_email_verifications, auth_password_resets, auth_audit_log';
  RAISE NOTICE 'Function: auth_current_user_id(), auth_cleanup_expired_data()';
END $$;
