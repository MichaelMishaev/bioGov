-- =====================================================
-- Phase 3: Daily Engagement Features - Financial Tracking
-- =====================================================
-- Features: Expenses, Cash Flow, Payment Tracking, Goals
-- Created: 2025-11-03
-- =====================================================

-- =====================================================
-- 1. EXPENSE CATEGORIES (Enum)
-- =====================================================

CREATE TYPE expense_category AS ENUM (
  'fuel_mileage',      -- ⛽ דלק/קילומטראז'
  'phone_internet',    -- 📱 טלפון/אינטרנט
  'office_rent',       -- 🏢 שכירות משרד
  'equipment',         -- 🖥️ ציוד
  'professional_services', -- 📄 שירותים מקצועיים
  'client_meetings',   -- ☕ פגישות לקוחות
  'training_courses',  -- 🎓 הדרכות/קורסים
  'office_supplies',   -- 📎 ציוד משרדי
  'marketing',         -- 📢 שיווק
  'insurance',         -- 🛡️ ביטוחים
  'utilities',         -- ⚡ חשמל/מים/ארנונה
  'other'              -- אחר
);

-- =====================================================
-- 2. EXPENSES TABLE
-- =====================================================

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Transaction details
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT DEFAULT 'ILS',
  category expense_category NOT NULL,
  description TEXT NOT NULL,

  -- VAT tracking (Israeli 18%)
  vat_cents INTEGER DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 18.00,
  vat_deductible BOOLEAN DEFAULT TRUE, -- Can this VAT be deducted?

  -- Receipt info
  receipt_url TEXT, -- S3/Storage URL
  merchant_name TEXT,
  transaction_date DATE NOT NULL,

  -- OCR metadata
  ocr_processed BOOLEAN DEFAULT FALSE,
  ocr_confidence DECIMAL(3,2), -- 0.00 to 1.00
  ocr_raw_text TEXT, -- Original OCR output for debugging

  -- Mileage tracking (for fuel_mileage category)
  mileage_km DECIMAL(10,2), -- Kilometers driven
  mileage_rate_per_km DECIMAL(5,2) DEFAULT 2.35, -- Israeli rate 2025: ₪2.35/km

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_transaction_date ON expenses(transaction_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_receipt_url ON expenses(receipt_url) WHERE receipt_url IS NOT NULL;

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE expenses IS 'Business expenses with OCR receipt scanning';
COMMENT ON COLUMN expenses.vat_deductible IS 'Whether this expense VAT can be deducted (input tax)';
COMMENT ON COLUMN expenses.mileage_km IS 'For fuel_mileage category - kilometers driven for business';

-- =====================================================
-- 3. INVOICE PAYMENTS TRACKING
-- =====================================================

CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Payment details
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT DEFAULT 'ILS',
  payment_date DATE NOT NULL,
  payment_method payment_method,

  -- Transaction tracking
  transaction_id TEXT, -- External transaction ID (bank, Bit, etc.)
  reference_number TEXT, -- Invoice reference for reconciliation

  -- Partial payments support
  is_partial BOOLEAN DEFAULT FALSE,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON invoice_payments(payment_date DESC);
CREATE INDEX idx_payments_transaction_id ON invoice_payments(transaction_id) WHERE transaction_id IS NOT NULL;

COMMENT ON TABLE invoice_payments IS 'Track invoice payments including partial payments';
COMMENT ON COLUMN invoice_payments.is_partial IS 'True if this is a partial payment (invoice not fully paid)';

-- =====================================================
-- 4. FINANCIAL GOALS
-- =====================================================

CREATE TYPE goal_type AS ENUM (
  'monthly_revenue',   -- Monthly revenue target
  'annual_revenue',    -- Annual revenue target
  'profit_margin',     -- Target profit margin %
  'expense_limit'      -- Monthly expense cap
);

CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Goal details
  goal_type goal_type NOT NULL,
  target_amount_cents INTEGER, -- For revenue/expense goals (in agorot)
  target_percentage DECIMAL(5,2), -- For profit margin goals

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Active status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Validation
  CHECK (
    (goal_type IN ('monthly_revenue', 'annual_revenue', 'expense_limit') AND target_amount_cents IS NOT NULL)
    OR
    (goal_type = 'profit_margin' AND target_percentage IS NOT NULL)
  )
);

CREATE INDEX idx_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_goals_period ON financial_goals(period_start, period_end);
CREATE INDEX idx_goals_active ON financial_goals(is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE financial_goals IS 'User-defined financial goals for tracking progress';

-- =====================================================
-- 5. CASH FLOW SNAPSHOTS (Daily Aggregates)
-- =====================================================

CREATE TABLE cash_flow_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Date
  snapshot_date DATE NOT NULL,

  -- Revenue metrics (from invoices)
  revenue_cents INTEGER DEFAULT 0,
  revenue_paid_cents INTEGER DEFAULT 0, -- Actually received
  revenue_unpaid_cents INTEGER DEFAULT 0, -- Outstanding

  -- Expense metrics
  expenses_cents INTEGER DEFAULT 0,

  -- Calculated metrics
  profit_cents INTEGER DEFAULT 0, -- revenue_paid - expenses
  cash_balance_cents INTEGER DEFAULT 0, -- Cumulative

  -- Invoice metrics
  invoices_sent INTEGER DEFAULT 0,
  invoices_paid INTEGER DEFAULT 0,
  invoices_overdue INTEGER DEFAULT 0,

  -- VAT tracking
  vat_collected_cents INTEGER DEFAULT 0, -- Output tax
  vat_paid_cents INTEGER DEFAULT 0, -- Input tax
  vat_owed_cents INTEGER DEFAULT 0, -- Net VAT liability

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one snapshot per day per user
  CONSTRAINT unique_snapshot_per_day UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_snapshots_user_date ON cash_flow_snapshots(user_id, snapshot_date DESC);

CREATE TRIGGER update_snapshots_updated_at
  BEFORE UPDATE ON cash_flow_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE cash_flow_snapshots IS 'Pre-calculated daily financial summaries for performance';
COMMENT ON COLUMN cash_flow_snapshots.cash_balance_cents IS 'Cumulative cash balance up to this date';

-- =====================================================
-- 6. PAYMENT REMINDER LOG
-- =====================================================

CREATE TYPE reminder_type AS ENUM ('gentle', 'firm', 'final', 'escalation');
CREATE TYPE reminder_channel AS ENUM ('email', 'sms', 'whatsapp', 'phone');

CREATE TABLE payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Reminder details
  reminder_type reminder_type NOT NULL,
  channel reminder_channel NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Delivery tracking
  delivered BOOLEAN DEFAULT FALSE,
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,

  -- Content
  subject TEXT,
  message TEXT,

  -- Response tracking
  response_received BOOLEAN DEFAULT FALSE,
  response_text TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX idx_reminders_sent_at ON payment_reminders(sent_at DESC);

COMMENT ON TABLE payment_reminders IS 'Log of all payment reminders sent to clients';

-- =====================================================
-- 7. FUNCTIONS: Cash Flow Calculations
-- =====================================================

-- Calculate total revenue for period
CREATE OR REPLACE FUNCTION calculate_revenue(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COALESCE(SUM(total_cents), 0)
  INTO v_total
  FROM invoices
  WHERE user_id = p_user_id
    AND issue_date BETWEEN p_start_date AND p_end_date
    AND status != 'canceled';

  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Calculate total expenses for period
CREATE OR REPLACE FUNCTION calculate_expenses(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount_cents), 0)
  INTO v_total
  FROM expenses
  WHERE user_id = p_user_id
    AND transaction_date BETWEEN p_start_date AND p_end_date;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Calculate profit for period
CREATE OR REPLACE FUNCTION calculate_profit(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER AS $$
BEGIN
  RETURN calculate_revenue(p_user_id, p_start_date, p_end_date) -
         calculate_expenses(p_user_id, p_start_date, p_end_date);
END;
$$ LANGUAGE plpgsql;

-- Get unpaid invoices summary
CREATE OR REPLACE FUNCTION get_unpaid_summary(p_user_id UUID)
RETURNS TABLE (
  overdue_count INTEGER,
  overdue_amount_cents BIGINT,
  due_soon_count INTEGER,
  due_soon_amount_cents BIGINT,
  on_track_count INTEGER,
  on_track_amount_cents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Overdue (past due date)
    COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status NOT IN ('paid', 'canceled'))::INTEGER,
    COALESCE(SUM(total_cents) FILTER (WHERE due_date < CURRENT_DATE AND status NOT IN ('paid', 'canceled')), 0)::BIGINT,

    -- Due soon (next 7 days)
    COUNT(*) FILTER (WHERE due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' AND status NOT IN ('paid', 'canceled'))::INTEGER,
    COALESCE(SUM(total_cents) FILTER (WHERE due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' AND status NOT IN ('paid', 'canceled')), 0)::BIGINT,

    -- On track (> 7 days away)
    COUNT(*) FILTER (WHERE due_date > CURRENT_DATE + INTERVAL '7 days' AND status NOT IN ('paid', 'canceled'))::INTEGER,
    COALESCE(SUM(total_cents) FILTER (WHERE due_date > CURRENT_DATE + INTERVAL '7 days' AND status NOT IN ('paid', 'canceled')), 0)::BIGINT

  FROM invoices
  WHERE user_id = p_user_id
    AND status != 'canceled';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. FUNCTIONS: Goal Progress Tracking
-- =====================================================

CREATE OR REPLACE FUNCTION get_goal_progress(p_goal_id UUID)
RETURNS TABLE (
  goal_id UUID,
  current_amount_cents INTEGER,
  target_amount_cents INTEGER,
  progress_percentage DECIMAL(5,2),
  days_remaining INTEGER,
  is_on_track BOOLEAN
) AS $$
DECLARE
  v_goal RECORD;
  v_current INTEGER;
  v_days_total INTEGER;
  v_days_elapsed INTEGER;
  v_expected_progress DECIMAL(5,2);
BEGIN
  -- Get goal details
  SELECT * INTO v_goal
  FROM financial_goals
  WHERE id = p_goal_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Calculate current value based on goal type
  IF v_goal.goal_type IN ('monthly_revenue', 'annual_revenue') THEN
    v_current := calculate_revenue(
      v_goal.user_id,
      v_goal.period_start,
      LEAST(v_goal.period_end, CURRENT_DATE)
    );
  ELSIF v_goal.goal_type = 'expense_limit' THEN
    v_current := calculate_expenses(
      v_goal.user_id,
      v_goal.period_start,
      LEAST(v_goal.period_end, CURRENT_DATE)
    );
  END IF;

  -- Calculate progress
  v_days_total := v_goal.period_end - v_goal.period_start;
  v_days_elapsed := CURRENT_DATE - v_goal.period_start;
  v_expected_progress := (v_days_elapsed::DECIMAL / v_days_total::DECIMAL) * 100;

  RETURN QUERY SELECT
    p_goal_id,
    v_current,
    v_goal.target_amount_cents,
    CASE
      WHEN v_goal.target_amount_cents > 0
      THEN (v_current::DECIMAL / v_goal.target_amount_cents::DECIMAL * 100)
      ELSE 0
    END,
    v_goal.period_end - CURRENT_DATE,
    CASE
      WHEN v_goal.goal_type IN ('monthly_revenue', 'annual_revenue')
      THEN (v_current::DECIMAL / v_goal.target_amount_cents::DECIMAL * 100) >= v_expected_progress
      WHEN v_goal.goal_type = 'expense_limit'
      THEN v_current < v_goal.target_amount_cents
      ELSE TRUE
    END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

-- Expenses: Users can only see their own
CREATE POLICY expenses_policy ON expenses
  FOR ALL USING (user_id = auth.uid());

-- Invoice Payments: Users can access payments for their invoices
CREATE POLICY invoice_payments_policy ON invoice_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

-- Financial Goals: Users can only see their own
CREATE POLICY financial_goals_policy ON financial_goals
  FOR ALL USING (user_id = auth.uid());

-- Cash Flow Snapshots: Users can only see their own
CREATE POLICY cash_flow_snapshots_policy ON cash_flow_snapshots
  FOR ALL USING (user_id = auth.uid());

-- Payment Reminders: Users can see reminders for their invoices
CREATE POLICY payment_reminders_policy ON payment_reminders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = payment_reminders.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

-- =====================================================
-- 10. SAMPLE DATA (For Testing)
-- =====================================================

-- Insert sample expense categories for autocomplete
CREATE TABLE expense_category_templates (
  category expense_category PRIMARY KEY,
  name_he TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  common_merchants TEXT[], -- Common merchant names for auto-categorization
  default_vat_deductible BOOLEAN DEFAULT TRUE
);

INSERT INTO expense_category_templates VALUES
('fuel_mileage', 'דלק/קילומטראז''', 'Fuel/Mileage', '⛽', ARRAY['דלק', 'פז', 'סונול', 'דור אלון', 'יעלון'], TRUE),
('phone_internet', 'טלפון/אינטרנט', 'Phone/Internet', '📱', ARRAY['בזק', 'סלקום', 'פלאפון', 'פרטנר', 'הוט'], TRUE),
('office_rent', 'שכירות משרד', 'Office Rent', '🏢', ARRAY[], TRUE),
('equipment', 'ציוד', 'Equipment', '🖥️', ARRAY['KSP', 'Ivory', 'Bug', 'iDigital'], TRUE),
('professional_services', 'שירותים מקצועיים', 'Professional Services', '📄', ARRAY['רואה חשבון', 'עורך דין', 'יועץ'], TRUE),
('client_meetings', 'פגישות לקוחות', 'Client Meetings', '☕', ARRAY['ארומה', 'קפה קפה', 'קפה גרג', 'נספרסו'], FALSE), -- Limited deduction
('training_courses', 'הדרכות/קורסים', 'Training/Courses', '🎓', ARRAY[], TRUE),
('office_supplies', 'ציוד משרדי', 'Office Supplies', '📎', ARRAY['סטימצקי', 'אופיס דיפו', 'רמי לוי', 'סופר-פארם'], TRUE),
('marketing', 'שיווק', 'Marketing', '📢', ARRAY['Google', 'Facebook', 'Meta'], TRUE),
('insurance', 'ביטוחים', 'Insurance', '🛡️', ARRAY[], TRUE),
('utilities', 'חשמל/מים/ארנונה', 'Utilities', '⚡', ARRAY['חברת חשמל', 'מי עירוני'], TRUE),
('other', 'אחר', 'Other', '📦', ARRAY[], TRUE);

COMMENT ON TABLE expense_category_templates IS 'Expense category reference data with Hebrew/English names';

-- =====================================================
-- END OF MIGRATION
-- =====================================================

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
