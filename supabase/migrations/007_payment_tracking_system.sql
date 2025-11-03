/**
 * Migration 007: Payment Tracking System
 * Phase 3 Week 3: Payment reminders and tracking
 * Created: 2025-11-03
 */

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Payment methods
CREATE TYPE payment_method AS ENUM (
  'cash',
  'bank_transfer',
  'check',
  'credit_card',
  'paypal',
  'bit',
  'other'
);

-- ============================================================================
-- TABLES
-- ============================================================================

/**
 * invoice_payments table
 * Tracks partial and full payments for invoices
 */
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Payment details
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT DEFAULT 'ILS',
  payment_date DATE NOT NULL,
  payment_method payment_method NOT NULL,

  -- Transaction tracking
  transaction_id TEXT, -- Bank reference or payment processor ID
  reference_number TEXT, -- Check number or other reference

  -- Receipt tracking
  receipt_url TEXT, -- Link to payment receipt/confirmation

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON invoice_payments(payment_date);
CREATE INDEX idx_payments_payment_method ON invoice_payments(payment_method);

/**
 * payment_reminders table
 * Tracks automated payment reminder emails sent
 */
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Reminder details
  reminder_type TEXT NOT NULL, -- 'gentle_7d', 'firm_14d', 'urgent_21d', 'final_30d'
  days_overdue INTEGER NOT NULL DEFAULT 0,

  -- Email tracking
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient_email TEXT NOT NULL,
  email_subject TEXT,
  email_body TEXT,

  -- Response tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'bounced', 'replied'

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX idx_reminders_sent_at ON payment_reminders(sent_at);
CREATE INDEX idx_reminders_reminder_type ON payment_reminders(reminder_type);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

/**
 * Function: calculate_invoice_balance
 * Returns the remaining balance on an invoice after all payments
 */
CREATE OR REPLACE FUNCTION calculate_invoice_balance(invoice_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  total_cents INTEGER;
  paid_cents INTEGER;
BEGIN
  -- Get invoice total
  SELECT total_cents INTO total_cents
  FROM invoices
  WHERE id = invoice_id_param;

  -- Get sum of all payments
  SELECT COALESCE(SUM(amount_cents), 0) INTO paid_cents
  FROM invoice_payments
  WHERE invoice_id = invoice_id_param;

  -- Return balance
  RETURN total_cents - paid_cents;
END;
$$ LANGUAGE plpgsql;

/**
 * Function: update_invoice_payment_status
 * Updates invoice status based on payments
 * Triggers after payment insert/update/delete
 */
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  invoice_total INTEGER;
  total_paid INTEGER;
  invoice_status_current TEXT;
BEGIN
  -- Get invoice total and current status
  SELECT total_cents, status INTO invoice_total, invoice_status_current
  FROM invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  -- Calculate total paid
  SELECT COALESCE(SUM(amount_cents), 0) INTO total_paid
  FROM invoice_payments
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  -- Update invoice status and paid_amount
  IF total_paid >= invoice_total THEN
    -- Fully paid
    UPDATE invoices
    SET status = 'paid',
        paid_amount_cents = invoice_total,
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  ELSIF total_paid > 0 THEN
    -- Partially paid
    UPDATE invoices
    SET paid_amount_cents = total_paid,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  ELSE
    -- No payments
    UPDATE invoices
    SET paid_amount_cents = 0,
        paid_at = NULL,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id)
      AND invoice_status_current != 'paid'; -- Don't change if manually marked paid
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update invoice status after payment changes
DROP TRIGGER IF EXISTS trigger_update_invoice_payment_status ON invoice_payments;
CREATE TRIGGER trigger_update_invoice_payment_status
  AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_payment_status();

/**
 * Function: get_overdue_invoices
 * Returns invoices that are overdue for payment reminders
 */
CREATE OR REPLACE FUNCTION get_overdue_invoices(user_id_param UUID)
RETURNS TABLE (
  invoice_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  total_cents INTEGER,
  due_date DATE,
  days_overdue INTEGER,
  last_reminder_sent_at TIMESTAMPTZ,
  last_reminder_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id AS invoice_id,
    c.name AS customer_name,
    c.email AS customer_email,
    i.total_cents,
    i.due_date,
    EXTRACT(DAY FROM NOW() - i.due_date)::INTEGER AS days_overdue,
    pr.sent_at AS last_reminder_sent_at,
    pr.reminder_type AS last_reminder_type
  FROM invoices i
  JOIN customers c ON i.customer_id = c.id
  LEFT JOIN LATERAL (
    SELECT reminder_type, sent_at
    FROM payment_reminders
    WHERE invoice_id = i.id
    ORDER BY sent_at DESC
    LIMIT 1
  ) pr ON TRUE
  WHERE i.user_id = user_id_param
    AND i.status = 'sent'
    AND i.due_date < CURRENT_DATE
    AND (i.paid_amount_cents IS NULL OR i.paid_amount_cents < i.total_cents)
  ORDER BY i.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

-- invoice_payments policies
CREATE POLICY "Users can view their own invoice payments"
  ON invoice_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments for their invoices"
  ON invoice_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own payments"
  ON invoice_payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own payments"
  ON invoice_payments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

-- payment_reminders policies
CREATE POLICY "Users can view reminders for their invoices"
  ON payment_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = payment_reminders.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reminders for their invoices"
  ON payment_reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = payment_reminders.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Add payment methods to existing invoices (if needed)
COMMENT ON TYPE payment_method IS 'Payment methods accepted for invoices';
COMMENT ON TABLE invoice_payments IS 'Tracks payments received for invoices';
COMMENT ON TABLE payment_reminders IS 'Tracks automated payment reminder emails';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON invoice_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON payment_reminders TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 007 completed: Payment Tracking System';
  RAISE NOTICE '- Created invoice_payments table';
  RAISE NOTICE '- Created payment_reminders table';
  RAISE NOTICE '- Added payment_method enum';
  RAISE NOTICE '- Created helper functions for payment tracking';
  RAISE NOTICE '- Enabled RLS policies';
END $$;
