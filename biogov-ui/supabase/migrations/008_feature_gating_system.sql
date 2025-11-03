-- Feature Gating System Migration
-- Phase 3 Week 4: Subscription tiers and feature access control
-- Created: November 3, 2025

-- ============================================================================
-- SUBSCRIPTION TIERS
-- ============================================================================

-- Enum for subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'professional');

-- Enum for subscription status
CREATE TYPE subscription_status AS ENUM (
  'active',
  'trial',
  'past_due',
  'canceled',
  'expired'
);

-- ============================================================================
-- USER SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Subscription details
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',

  -- Billing cycle
  billing_period VARCHAR(20) CHECK (billing_period IN ('monthly', 'yearly')),
  amount_cents INTEGER, -- Price paid per period (null for free tier)
  currency VARCHAR(3) DEFAULT 'ILS',

  -- Trial tracking
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  trial_used BOOLEAN DEFAULT FALSE,

  -- Subscription lifecycle
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE, -- For canceled subscriptions

  -- Payment tracking (for future Stripe/PayPal integration)
  payment_provider VARCHAR(50), -- 'stripe', 'paypal', 'manual', etc.
  external_subscription_id VARCHAR(255), -- Stripe subscription ID, etc.
  external_customer_id VARCHAR(255),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_billing_period CHECK (
    (tier = 'free' AND billing_period IS NULL) OR
    (tier != 'free' AND billing_period IS NOT NULL)
  ),
  CONSTRAINT valid_amount CHECK (
    (tier = 'free' AND amount_cents IS NULL) OR
    (tier != 'free' AND amount_cents > 0)
  )
);

-- Indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_tier ON user_subscriptions(tier);
CREATE INDEX idx_user_subscriptions_current_period_end ON user_subscriptions(current_period_end);

-- Unique active subscription per user
CREATE UNIQUE INDEX idx_user_subscriptions_active_user ON user_subscriptions(user_id)
  WHERE status = 'active';

-- ============================================================================
-- FEATURE FLAGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Feature identification
  feature_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'payment_reminders', 'bank_sync'
  feature_name VARCHAR(255) NOT NULL, -- Display name in Hebrew/English
  description TEXT,

  -- Access control
  required_tier subscription_tier NOT NULL DEFAULT 'professional',
  enabled BOOLEAN DEFAULT TRUE, -- Global feature flag (can disable feature entirely)

  -- Usage limits (null = unlimited)
  free_tier_limit INTEGER, -- Max usage for free tier (null = no access)
  starter_tier_limit INTEGER, -- Max usage for starter tier (null = unlimited)
  professional_tier_limit INTEGER, -- Max usage for pro tier (null = unlimited)

  -- Metadata
  category VARCHAR(50), -- 'invoicing', 'expenses', 'automation', 'reports', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick feature lookups
CREATE INDEX idx_feature_flags_key ON feature_flags(feature_key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled);

-- ============================================================================
-- FEATURE USAGE TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL,

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Period tracking (monthly reset)
  period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT DATE_TRUNC('month', NOW()),
  period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month'),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_feature_key FOREIGN KEY (feature_key) REFERENCES feature_flags(feature_key) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_feature_usage_user_feature ON feature_usage(user_id, feature_key);
CREATE INDEX idx_feature_usage_period ON feature_usage(period_start, period_end);

-- Unique constraint: one usage record per user per feature per period
CREATE UNIQUE INDEX idx_feature_usage_unique ON feature_usage(user_id, feature_key, period_start);

-- ============================================================================
-- DEFAULT SUBSCRIPTION DATA
-- ============================================================================

-- Insert default feature flags
INSERT INTO feature_flags (feature_key, feature_name, description, required_tier, category, free_tier_limit, starter_tier_limit, professional_tier_limit) VALUES
  -- Free tier features (available to all)
  ('basic_invoicing', 'חשבוניות בסיסיות', 'Create and send invoices to customers', 'free', 'invoicing', NULL, NULL, NULL),
  ('basic_expenses', 'הוצאות בסיסיות', 'Track business expenses', 'free', 'expenses', NULL, NULL, NULL),
  ('task_management', 'ניהול משימות', 'Compliance task tracking', 'free', 'compliance', NULL, NULL, NULL),

  -- Starter tier features
  ('profit_loss_reports', 'דוחות רווח והפסד', 'Profit & Loss statements with tax calculations', 'starter', 'reports', 0, NULL, NULL),
  ('cash_flow_tracking', 'מעקב תזרים מזומנים', 'Cash flow analysis and charts', 'starter', 'reports', 0, NULL, NULL),
  ('payment_tracking', 'מעקב תשלומים', 'Track invoice payments', 'starter', 'invoicing', 0, NULL, NULL),
  ('expense_categories', 'קטגוריות הוצאות', 'Categorize and analyze expenses', 'starter', 'expenses', 5, NULL, NULL),

  -- Professional tier features
  ('payment_reminders', 'תזכורות תשלום אוטומטיות', 'Automated email reminders for overdue invoices', 'professional', 'automation', 0, 10, NULL),
  ('bank_sync', 'סנכרון בנק', 'Automatic bank transaction sync', 'professional', 'automation', 0, 0, NULL),
  ('advanced_reports', 'דוחות מתקדמים', 'Custom financial reports and analytics', 'professional', 'reports', 0, 0, NULL),
  ('multi_currency', 'מטבעות מרובים', 'Support for multiple currencies', 'professional', 'invoicing', 0, 0, NULL),
  ('api_access', 'גישת API', 'API access for integrations', 'professional', 'integration', 0, 0, NULL)
ON CONFLICT (feature_key) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION has_feature_access(
  p_user_id UUID,
  p_feature_key VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_tier subscription_tier;
  v_required_tier subscription_tier;
  v_usage_count INTEGER;
  v_usage_limit INTEGER;
  v_enabled BOOLEAN;
BEGIN
  -- Get user's current subscription tier
  SELECT tier INTO v_user_tier
  FROM user_subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;

  -- Default to free if no subscription found
  IF v_user_tier IS NULL THEN
    v_user_tier := 'free';
  END IF;

  -- Get feature requirements
  SELECT
    required_tier,
    enabled,
    CASE v_user_tier
      WHEN 'free' THEN free_tier_limit
      WHEN 'starter' THEN starter_tier_limit
      WHEN 'professional' THEN professional_tier_limit
    END
  INTO v_required_tier, v_enabled, v_usage_limit
  FROM feature_flags
  WHERE feature_key = p_feature_key;

  -- Feature doesn't exist or is disabled
  IF v_required_tier IS NULL OR NOT v_enabled THEN
    RETURN FALSE;
  END IF;

  -- Check tier requirement
  IF v_user_tier::text < v_required_tier::text THEN
    RETURN FALSE;
  END IF;

  -- Check usage limit (if applicable)
  IF v_usage_limit IS NOT NULL THEN
    SELECT COALESCE(usage_count, 0) INTO v_usage_count
    FROM feature_usage
    WHERE user_id = p_user_id
      AND feature_key = p_feature_key
      AND period_start <= NOW()
      AND period_end > NOW();

    IF v_usage_count >= v_usage_limit THEN
      RETURN FALSE;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
  p_user_id UUID,
  p_feature_key VARCHAR
) RETURNS VOID AS $$
DECLARE
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  v_period_start := DATE_TRUNC('month', NOW());
  v_period_end := DATE_TRUNC('month', NOW() + INTERVAL '1 month');

  INSERT INTO feature_usage (user_id, feature_key, usage_count, last_used_at, period_start, period_end)
  VALUES (p_user_id, p_feature_key, 1, NOW(), v_period_start, v_period_end)
  ON CONFLICT (user_id, feature_key, period_start)
  DO UPDATE SET
    usage_count = feature_usage.usage_count + 1,
    last_used_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user's feature usage summary
CREATE OR REPLACE FUNCTION get_feature_usage_summary(p_user_id UUID)
RETURNS TABLE (
  feature_key VARCHAR,
  feature_name VARCHAR,
  usage_count INTEGER,
  usage_limit INTEGER,
  has_access BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ff.feature_key,
    ff.feature_name,
    COALESCE(fu.usage_count, 0) AS usage_count,
    CASE (SELECT tier FROM user_subscriptions WHERE user_id = p_user_id AND status = 'active' LIMIT 1)
      WHEN 'free' THEN ff.free_tier_limit
      WHEN 'starter' THEN ff.starter_tier_limit
      WHEN 'professional' THEN ff.professional_tier_limit
      ELSE ff.free_tier_limit
    END AS usage_limit,
    has_feature_access(p_user_id, ff.feature_key) AS has_access
  FROM feature_flags ff
  LEFT JOIN feature_usage fu ON ff.feature_key = fu.feature_key
    AND fu.user_id = p_user_id
    AND fu.period_start <= NOW()
    AND fu.period_end > NOW()
  WHERE ff.enabled = TRUE
  ORDER BY ff.category, ff.required_tier;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_usage_updated_at
  BEFORE UPDATE ON feature_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_subscriptions IS 'User subscription tiers and billing information';
COMMENT ON TABLE feature_flags IS 'Feature definitions and access requirements';
COMMENT ON TABLE feature_usage IS 'Track feature usage per user per month for usage limits';

COMMENT ON FUNCTION has_feature_access IS 'Check if user has access to a specific feature based on tier and usage';
COMMENT ON FUNCTION increment_feature_usage IS 'Increment feature usage counter for rate limiting';
COMMENT ON FUNCTION get_feature_usage_summary IS 'Get summary of all features with usage counts for a user';
