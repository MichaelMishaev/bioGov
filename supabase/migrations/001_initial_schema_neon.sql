-- ============================================================================
-- Migration: Initial Schema for bioGov MVP (Neon PostgreSQL)
-- Created: 2025-10-30
-- Description: Users, assessments, and feedback tables
-- Note: RLS policies removed (authorization handled in API routes)
-- ============================================================================

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE: users
-- Purpose: Store user information for email delivery and consent tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  consent_given BOOLEAN DEFAULT FALSE,
  unsubscribed_at TIMESTAMPTZ DEFAULT NULL,

  -- Email format validation
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),

  -- Name length validation
  CONSTRAINT name_length CHECK (LENGTH(name) BETWEEN 2 AND 100)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_unsubscribed ON public.users(unsubscribed_at) WHERE unsubscribed_at IS NOT NULL;

-- Comments
COMMENT ON TABLE public.users IS 'User accounts for email delivery and consent tracking';
COMMENT ON COLUMN public.users.id IS 'Unique user identifier (UUID v4)';
COMMENT ON COLUMN public.users.email IS 'User email address (validated, unique)';
COMMENT ON COLUMN public.users.name IS 'Full name in Hebrew or Latin characters';
COMMENT ON COLUMN public.users.consent_given IS 'Privacy policy acceptance (required before email)';
COMMENT ON COLUMN public.users.unsubscribed_at IS 'Timestamp when user unsubscribed (soft delete)';

-- ============================================================================
-- TABLE: assessments
-- Purpose: Store quiz answers and VAT recommendations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  answers_json JSONB NOT NULL,
  result_status TEXT NOT NULL,
  result_checklist JSONB NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validate result_status enum
  CONSTRAINT valid_status CHECK (result_status IN ('פטור', 'מורשה', 'choice')),

  -- Validate answers_json structure
  CONSTRAINT valid_answers_json CHECK (
    answers_json ? 'activity' AND
    answers_json ? 'revenue' AND
    answers_json ? 'clients' AND
    answers_json ? 'employees' AND
    answers_json ? 'voluntary'
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_ip_hash ON public.assessments(ip_hash);
CREATE INDEX IF NOT EXISTS idx_assessments_result_status ON public.assessments(result_status);

-- GIN index for JSONB queries (allows fast filtering by answers)
CREATE INDEX IF NOT EXISTS idx_assessments_answers_json ON public.assessments USING GIN (answers_json);

-- Comments
COMMENT ON TABLE public.assessments IS 'VAT registration assessments with quiz answers and results';
COMMENT ON COLUMN public.assessments.id IS 'Unique assessment ID (shareable via URL: /results/{id})';
COMMENT ON COLUMN public.assessments.user_id IS 'Optional link to user (null for anonymous assessments)';
COMMENT ON COLUMN public.assessments.answers_json IS 'Quiz answers as JSON (activity, revenue, clients, employees, voluntary)';
COMMENT ON COLUMN public.assessments.result_status IS 'VAT status result: פטור (exempt), מורשה (authorized), or choice';
COMMENT ON COLUMN public.assessments.result_checklist IS 'Action items as JSON array with steps, links, descriptions';
COMMENT ON COLUMN public.assessments.ip_hash IS 'SHA-256 hash of IP address for rate limiting (not storing raw IP)';
COMMENT ON COLUMN public.assessments.user_agent IS 'Browser user agent string for analytics and debugging';

-- ============================================================================
-- TABLE: feedback
-- Purpose: Collect user ratings and comments
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validate rating range
  CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5),

  -- Validate comment length
  CONSTRAINT comment_length CHECK (LENGTH(comment) <= 500 OR comment IS NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_assessment_id ON public.feedback(assessment_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Comments
COMMENT ON TABLE public.feedback IS 'User feedback ratings and comments';
COMMENT ON COLUMN public.feedback.id IS 'Unique feedback entry ID';
COMMENT ON COLUMN public.feedback.user_id IS 'Optional link to user (null for anonymous feedback)';
COMMENT ON COLUMN public.feedback.assessment_id IS 'Link to specific assessment for context';
COMMENT ON COLUMN public.feedback.rating IS '1-5 star rating (required)';
COMMENT ON COLUMN public.feedback.comment IS 'Optional text comment (max 500 characters)';

-- ============================================================================
-- TABLE: email_logs
-- Purpose: Track email delivery, opens, and clicks
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounce_reason TEXT,

  -- Validate email_type enum
  CONSTRAINT valid_email_type CHECK (email_type IN ('results', 'reminder', 'welcome'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON public.email_logs(email_type);

-- Comments
COMMENT ON TABLE public.email_logs IS 'Email delivery tracking for debugging and analytics';
COMMENT ON COLUMN public.email_logs.email_type IS 'Type: results (assessment results), reminder (deadline), welcome (signup)';
COMMENT ON COLUMN public.email_logs.opened_at IS 'Timestamp when email was opened (via tracking pixel)';
COMMENT ON COLUMN public.email_logs.clicked_at IS 'Timestamp when link was clicked';

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update users.updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ANALYTICS VIEWS (Helper queries for admin dashboard)
-- ============================================================================

-- View: Assessment stats by result status
CREATE OR REPLACE VIEW public.assessment_stats AS
SELECT
  result_status,
  COUNT(*) AS total_count,
  COUNT(DISTINCT user_id) AS unique_users
FROM public.assessments
GROUP BY result_status;

COMMENT ON VIEW public.assessment_stats IS 'Aggregated stats: total assessments, unique users per VAT status';

-- View: Daily signups
CREATE OR REPLACE VIEW public.daily_signups AS
SELECT
  DATE(created_at) AS signup_date,
  COUNT(*) AS signups,
  COUNT(*) FILTER (WHERE unsubscribed_at IS NULL) AS active_users
FROM public.users
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

COMMENT ON VIEW public.daily_signups IS 'Daily user signups with active vs unsubscribed breakdown';

-- View: Feedback summary
CREATE OR REPLACE VIEW public.feedback_summary AS
SELECT
  AVG(rating) AS avg_rating,
  COUNT(*) FILTER (WHERE rating >= 4) AS positive_count,
  COUNT(*) FILTER (WHERE rating <= 2) AS negative_count,
  COUNT(*) AS total_feedback,
  ROUND(100.0 * COUNT(*) FILTER (WHERE rating >= 4) / NULLIF(COUNT(*), 0), 2) AS positive_percentage
FROM public.feedback;

COMMENT ON VIEW public.feedback_summary IS 'Aggregated feedback metrics: avg rating, positive %, total count';

-- ============================================================================
-- FINALIZE
-- ============================================================================

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ bioGov MVP database schema created successfully!';
  RAISE NOTICE 'Tables: users, assessments, feedback, email_logs';
  RAISE NOTICE 'Views: assessment_stats, daily_signups, feedback_summary';
  RAISE NOTICE 'Note: Authorization handled in API routes (no RLS)';
END $$;
