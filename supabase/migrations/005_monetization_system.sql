-- =====================================================
-- bioGov Monetization System - Complete Database Schema
-- =====================================================
-- Features: Subscriptions, Invoices, Customers, Payment Links
-- Israeli Compliance: E-invoicing, Allocation Numbers, 18% VAT
-- Created: 2025-11-03
-- =====================================================

-- =====================================================
-- 1. SUBSCRIPTION TIERS & PLANS
-- =====================================================

CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'professional', 'business', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'paused');
CREATE TYPE billing_period AS ENUM ('monthly', 'annual');

-- Store subscription information
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Stripe references
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Subscription details
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  billing_period billing_period DEFAULT 'monthly',

  -- Pricing
  amount_cents INTEGER, -- in agorot (₪1 = 100 agorot)
  currency TEXT DEFAULT 'ILS',

  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Billing dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one active subscription per user
  CONSTRAINT one_active_subscription_per_user UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);

-- Update timestamp automatically
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE subscriptions IS 'User subscription tiers and billing information';
COMMENT ON COLUMN subscriptions.amount_cents IS 'Subscription price in agorot (₪1 = 100 agorot)';
COMMENT ON COLUMN subscriptions.trial_end IS '45-day free trial period';

-- =====================================================
-- 2. CUSTOMER MANAGEMENT (Users Customers)
-- =====================================================

CREATE TYPE customer_type AS ENUM ('individual', 'business');

-- Customer database for user-generated invoices
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Customer details
  customer_type customer_type NOT NULL DEFAULT 'individual',
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Business details (for customer_type = 'business')
  company_name TEXT,
  company_id TEXT, -- Israeli HP number (ח.פ.)
  vat_number TEXT, -- Israeli VAT dealer number (עוסק מורשה)

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'IL',

  -- Financial
  currency TEXT DEFAULT 'ILS',
  tax_exempt BOOLEAN DEFAULT FALSE,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_vat_number ON customers(vat_number);

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE customers IS 'Customers of bioGov users (for invoice generation)';
COMMENT ON COLUMN customers.company_id IS 'Israeli company number (ח.פ.) for businesses';
COMMENT ON COLUMN customers.vat_number IS 'Israeli VAT dealer number for tax invoices';

-- =====================================================
-- 3. ISRAELI TAX INVOICES
-- =====================================================

CREATE TYPE invoice_type AS ENUM ('tax_invoice', 'receipt', 'quote', 'proforma', 'credit_note');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'canceled');
CREATE TYPE payment_method AS ENUM ('cash', 'credit_card', 'bank_transfer', 'bit', 'check', 'other');

-- Invoice table with Israeli compliance
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Invoice identification
  invoice_number TEXT NOT NULL, -- Sequential per user
  invoice_type invoice_type NOT NULL DEFAULT 'tax_invoice',
  status invoice_status NOT NULL DEFAULT 'draft',

  -- Israeli E-invoicing Compliance (2025+)
  reference_number TEXT, -- Required from 2025
  allocation_number TEXT, -- Required for transactions > threshold
  requires_allocation_number BOOLEAN DEFAULT FALSE, -- Auto-set based on amount

  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,

  -- Financial amounts (in agorot)
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 18.00, -- Israeli VAT 18% (2025)
  vat_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,

  -- Payment
  payment_method payment_method,
  paid_amount_cents INTEGER DEFAULT 0,

  -- Currency
  currency TEXT DEFAULT 'ILS',

  -- Business details (from user's business profile)
  issuer_name TEXT NOT NULL,
  issuer_company_id TEXT, -- User's HP number
  issuer_vat_number TEXT, -- User's VAT number
  issuer_address TEXT,
  issuer_phone TEXT,
  issuer_email TEXT,

  -- Customer details (snapshot at invoice time)
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_company_id TEXT,
  customer_vat_number TEXT,
  customer_address TEXT,

  -- Additional info
  notes TEXT,
  internal_notes TEXT, -- Not shown on PDF
  terms TEXT, -- Payment terms

  -- PDF generation
  pdf_url TEXT, -- S3/Storage URL
  pdf_generated_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique invoice numbers per user
  CONSTRAINT unique_invoice_number_per_user UNIQUE(user_id, invoice_number)
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_reference_number ON invoices(reference_number);

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE invoices IS 'Israeli tax-compliant invoices generated by users';
COMMENT ON COLUMN invoices.reference_number IS 'Israeli e-invoicing reference number (mandatory 2025+)';
COMMENT ON COLUMN invoices.allocation_number IS 'Required for transactions > ₪20K (2025), > ₪10K (2026), > ₪5K (Jun 2026)';
COMMENT ON COLUMN invoices.vat_rate IS 'Israeli VAT rate - 18% as of 2025';
COMMENT ON COLUMN invoices.subtotal_cents IS 'Amount in agorot before VAT (₪1 = 100 agorot)';

-- =====================================================
-- 4. INVOICE LINE ITEMS
-- =====================================================

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Item details
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL, -- Price per unit in agorot

  -- Calculations
  subtotal_cents INTEGER NOT NULL, -- quantity * unit_price_cents
  vat_rate DECIMAL(5,2) DEFAULT 18.00,
  vat_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,

  -- Item order
  line_order INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_line_order ON invoice_items(line_order);

COMMENT ON TABLE invoice_items IS 'Line items for invoices';
COMMENT ON COLUMN invoice_items.unit_price_cents IS 'Price per unit in agorot (₪1 = 100 agorot)';

-- =====================================================
-- 5. PAYMENT LINKS
-- =====================================================

CREATE TYPE payment_link_status AS ENUM ('active', 'expired', 'used', 'canceled');

CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

  -- Link details
  short_code TEXT NOT NULL UNIQUE, -- e.g., "abc123" for /pay/abc123
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'ILS',

  -- Status
  status payment_link_status NOT NULL DEFAULT 'active',

  -- Description
  title TEXT NOT NULL,
  description TEXT,

  -- Expiration
  expires_at TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 1, -- For recurring links
  use_count INTEGER DEFAULT 0,

  -- Stripe
  stripe_payment_link_id TEXT,
  stripe_checkout_session_id TEXT,

  -- Success handling
  success_url TEXT,
  cancel_url TEXT,

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX idx_payment_links_short_code ON payment_links(short_code);
CREATE INDEX idx_payment_links_status ON payment_links(status);
CREATE INDEX idx_payment_links_invoice_id ON payment_links(invoice_id);

CREATE TRIGGER update_payment_links_updated_at
  BEFORE UPDATE ON payment_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE payment_links IS 'Shareable payment links for collecting payments';
COMMENT ON COLUMN payment_links.short_code IS 'URL-safe code for /pay/:code route';

-- =====================================================
-- 6. SUBSCRIPTION USAGE LIMITS
-- =====================================================

-- Track feature usage for enforcement
CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Usage counters
  invoices_created INTEGER DEFAULT 0,
  customers_added INTEGER DEFAULT 0,
  payment_links_created INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,

  -- Storage
  storage_bytes BIGINT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_usage_per_period UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX idx_subscription_usage_period ON subscription_usage(period_start, period_end);

COMMENT ON TABLE subscription_usage IS 'Track feature usage for tier limits';

-- =====================================================
-- 7. STRIPE WEBHOOK EVENTS LOG
-- =====================================================

-- Log all Stripe webhooks for debugging and audit
CREATE TABLE stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,

  -- Payload
  payload JSONB NOT NULL,

  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stripe_events_type ON stripe_webhook_events(event_type);
CREATE INDEX idx_stripe_events_processed ON stripe_webhook_events(processed);
CREATE INDEX idx_stripe_events_created_at ON stripe_webhook_events(created_at);

COMMENT ON TABLE stripe_webhook_events IS 'Audit log of all Stripe webhook events';

-- =====================================================
-- 8. ADD SUBSCRIPTION TIER TO USERS TABLE
-- =====================================================

-- Add subscription_tier column to users table if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

COMMENT ON COLUMN users.subscription_tier IS 'Current subscription tier (denormalized for quick access)';
COMMENT ON COLUMN users.trial_ends_at IS '45-day free trial expiration date';

-- =====================================================
-- 9. FUNCTIONS FOR INVOICE NUMBER GENERATION
-- =====================================================

-- Generate next sequential invoice number for user
CREATE OR REPLACE FUNCTION generate_invoice_number(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_next_number INTEGER;
  v_year TEXT;
BEGIN
  -- Get current year
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Get next number in sequence for this year
  SELECT COALESCE(MAX(CAST(SPLIT_PART(invoice_number, '-', 2) AS INTEGER)), 0) + 1
  INTO v_next_number
  FROM invoices
  WHERE user_id = p_user_id
    AND invoice_number LIKE v_year || '-%';

  -- Return formatted invoice number: YYYY-NNNN (e.g., 2025-0001)
  RETURN v_year || '-' || LPAD(v_next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_invoice_number IS 'Generate sequential invoice number per year per user';

-- =====================================================
-- 10. FUNCTIONS FOR ALLOCATION NUMBER CHECK
-- =====================================================

-- Check if invoice requires allocation number based on Israeli regulations
CREATE OR REPLACE FUNCTION check_allocation_number_required(p_total_cents INTEGER, p_invoice_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
  v_threshold_cents INTEGER;
BEGIN
  -- Israeli e-invoicing thresholds:
  -- 2025: ₪20,000 (2,000,000 agorot)
  -- 2026 (Jan 1+): ₪10,000 (1,000,000 agorot)
  -- 2026 (Jun 1+): ₪5,000 (500,000 agorot)

  IF p_invoice_date >= '2026-06-01' THEN
    v_threshold_cents := 500000; -- ₪5,000
  ELSIF p_invoice_date >= '2026-01-01' THEN
    v_threshold_cents := 1000000; -- ₪10,000
  ELSE
    v_threshold_cents := 2000000; -- ₪20,000
  END IF;

  RETURN p_total_cents >= v_threshold_cents;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_allocation_number_required IS 'Determine if invoice needs allocation number per Israeli law';

-- =====================================================
-- 11. TRIGGER TO AUTO-SET ALLOCATION NUMBER REQUIREMENT
-- =====================================================

CREATE OR REPLACE FUNCTION set_invoice_allocation_requirement()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-set requires_allocation_number based on amount and date
  NEW.requires_allocation_number := check_allocation_number_required(
    NEW.total_cents,
    NEW.issue_date
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_allocation_requirement
  BEFORE INSERT OR UPDATE OF total_cents, issue_date ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_allocation_requirement();

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Users can only see their own
CREATE POLICY subscriptions_policy ON subscriptions
  FOR ALL USING (user_id = auth.uid());

-- Customers: Users can only manage their own customers
CREATE POLICY customers_policy ON customers
  FOR ALL USING (user_id = auth.uid());

-- Invoices: Users can only manage their own invoices
CREATE POLICY invoices_policy ON invoices
  FOR ALL USING (user_id = auth.uid());

-- Invoice Items: Users can access items of their invoices
CREATE POLICY invoice_items_policy ON invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

-- Payment Links: Users can only manage their own links
CREATE POLICY payment_links_policy ON payment_links
  FOR ALL USING (user_id = auth.uid());

-- Subscription Usage: Users can only see their own usage
CREATE POLICY subscription_usage_policy ON subscription_usage
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 13. SEED DATA: SUBSCRIPTION TIERS
-- =====================================================

-- Create a reference table for tier features (for documentation)
CREATE TABLE subscription_tier_features (
  tier subscription_tier PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_he TEXT NOT NULL,
  price_monthly_cents INTEGER,
  price_annual_cents INTEGER,
  features JSONB NOT NULL,
  limits JSONB NOT NULL
);

INSERT INTO subscription_tier_features (tier, name_en, name_he, price_monthly_cents, price_annual_cents, features, limits) VALUES
('free', 'Free', 'חינם', 0, 0,
  '{"compliance_calendar": false, "vat_quiz": true, "gov_links": true}'::jsonb,
  '{"tasks": 5, "invoices": 0, "customers": 0, "businesses": 1}'::jsonb
),
('starter', 'Starter', 'מתחילים', 4900, 49000,
  '{"compliance_calendar": true, "invoice_generation": true, "task_reminders": true, "document_storage_gb": 1}'::jsonb,
  '{"tasks": -1, "invoices": -1, "customers": 50, "businesses": 1}'::jsonb
),
('professional', 'Professional', 'מקצועי', 9900, 99000,
  '{"bank_sync": true, "auto_vat_reports": true, "expense_ocr": true, "payment_links": true, "ecommerce_integrations": 1, "accountant_sharing": true}'::jsonb,
  '{"tasks": -1, "invoices": -1, "customers": 500, "businesses": 3, "document_storage_gb": 10}'::jsonb
),
('business', 'Business', 'עסקי', 19900, 199000,
  '{"auto_tax_filing": true, "payment_processing": true, "ecommerce_integrations": -1, "advanced_reports": true, "digital_signatures": true, "priority_support": true}'::jsonb,
  '{"tasks": -1, "invoices": -1, "customers": -1, "businesses": -1, "document_storage_gb": 100}'::jsonb
),
('enterprise', 'Enterprise', 'ארגוני', NULL, NULL,
  '{"white_label": true, "api_access": true, "custom_integrations": true, "sla": true, "dedicated_manager": true}'::jsonb,
  '{"tasks": -1, "invoices": -1, "customers": -1, "businesses": -1, "document_storage_gb": -1}'::jsonb
);

COMMENT ON TABLE subscription_tier_features IS 'Reference table defining features and limits per tier (-1 = unlimited)';

-- =====================================================
-- END OF MIGRATION
-- =====================================================

-- Grant permissions (if using Supabase service role)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
