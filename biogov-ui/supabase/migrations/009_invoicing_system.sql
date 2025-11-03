-- Invoicing & Customer Management System Migration
-- Created: November 3, 2025
-- Adds complete invoice, customer, and payment management

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Customer Details
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company_name VARCHAR(255),
  tax_id VARCHAR(50), -- Israeli ID / Company ID (ת.ז / ח.פ / ע.מ)

  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Israel',

  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Index for user queries
  CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================

CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'canceled');

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,

  -- Invoice Details
  invoice_number VARCHAR(100) NOT NULL,
  status invoice_status DEFAULT 'draft',

  -- Amounts (in agorot/cents)
  subtotal_cents INTEGER NOT NULL, -- Amount before VAT
  vat_cents INTEGER NOT NULL, -- VAT amount (18%)
  vat_rate DECIMAL(5,2) DEFAULT 18.00, -- VAT percentage
  total_cents INTEGER NOT NULL, -- Total including VAT
  paid_amount_cents INTEGER DEFAULT 0, -- Amount paid so far

  currency VARCHAR(3) DEFAULT 'ILS',

  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE, -- When fully paid

  -- Line Items (stored as JSON)
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: [{ description: "Web Development", quantity: 10, rate_cents: 50000, amount_cents: 500000 }]

  -- Notes
  notes TEXT,
  terms TEXT, -- Payment terms

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT invoice_number_unique UNIQUE (user_id, invoice_number)
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);

-- ============================================================================
-- INVOICE_PAYMENTS TABLE (Already exists from Week 3, but adding if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Payment Details
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50), -- 'cash', 'bank_transfer', 'credit_card', 'check', etc.

  -- References
  transaction_id VARCHAR(255), -- External payment ID (bank, PayPal, etc.)
  reference_number VARCHAR(255), -- Check number, invoice reference, etc.

  -- Flags
  is_partial BOOLEAN DEFAULT FALSE, -- True if partial payment

  -- Notes
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT invoice_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_invoice_payments_payment_date ON invoice_payments(payment_date);

-- ============================================================================
-- PAYMENT_REMINDERS TABLE (Already exists from Week 3, but adding if not exists)
-- ============================================================================

CREATE TYPE reminder_type AS ENUM ('gentle_reminder', 'firm_reminder', 'urgent_reminder', 'final_notice');

CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Reminder Details
  reminder_type reminder_type NOT NULL,
  sent_to VARCHAR(255) NOT NULL, -- Email address
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Email tracking
  email_id VARCHAR(255), -- Resend email ID
  custom_message TEXT, -- Optional custom message added to template

  CONSTRAINT payment_reminders_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX idx_payment_reminders_sent_at ON payment_reminders(sent_at);

-- ============================================================================
-- EXPENSES TABLE
-- ============================================================================

CREATE TYPE expense_category AS ENUM (
  'fuel_mileage',
  'phone_internet',
  'office_rent',
  'equipment',
  'professional_services',
  'client_meetings',
  'training_courses',
  'office_supplies',
  'marketing',
  'insurance',
  'utilities',
  'other'
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Expense Details
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  category expense_category NOT NULL,
  description TEXT NOT NULL,

  -- VAT
  vat_cents INTEGER NOT NULL DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 18.00,
  vat_deductible BOOLEAN DEFAULT TRUE,

  -- Receipt
  receipt_url TEXT, -- URL to receipt image/PDF
  merchant_name VARCHAR(255),

  -- Date
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- OCR (if receipt uploaded)
  ocr_processed BOOLEAN DEFAULT FALSE,
  ocr_confidence DECIMAL(5,2), -- 0-100
  ocr_raw_text TEXT,

  -- Mileage (for fuel/mileage category)
  mileage_km DECIMAL(10,2),
  mileage_rate_per_km DECIMAL(10,2), -- ₪ per km

  -- Notes
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_transaction_date ON expenses(transaction_date);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get next invoice number
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  v_year VARCHAR(4);
  v_count INTEGER;
  v_number VARCHAR(100);
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');

  SELECT COUNT(*) + 1 INTO v_count
  FROM invoices
  WHERE user_id = p_user_id
    AND invoice_number LIKE v_year || '-%';

  v_number := v_year || '-' || LPAD(v_count::TEXT, 4, '0');

  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice balance
CREATE OR REPLACE FUNCTION get_invoice_balance(p_invoice_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total INTEGER;
  v_paid INTEGER;
BEGIN
  SELECT total_cents INTO v_total
  FROM invoices
  WHERE id = p_invoice_id;

  SELECT COALESCE(SUM(amount_cents), 0) INTO v_paid
  FROM invoice_payments
  WHERE invoice_id = p_invoice_id;

  RETURN v_total - v_paid;
END;
$$ LANGUAGE plpgsql;

-- Function to update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
DECLARE
  v_total INTEGER;
  v_paid INTEGER;
  v_balance INTEGER;
  v_due_date DATE;
  v_new_status invoice_status;
BEGIN
  -- Get invoice details
  SELECT total_cents, due_date INTO v_total, v_due_date
  FROM invoices
  WHERE id = NEW.invoice_id;

  -- Calculate total paid
  SELECT COALESCE(SUM(amount_cents), 0) INTO v_paid
  FROM invoice_payments
  WHERE invoice_id = NEW.invoice_id;

  v_balance := v_total - v_paid;

  -- Determine new status
  IF v_balance <= 0 THEN
    v_new_status := 'paid';
  ELSIF v_due_date < CURRENT_DATE THEN
    v_new_status := 'overdue';
  ELSE
    v_new_status := 'sent';
  END IF;

  -- Update invoice
  UPDATE invoices
  SET
    paid_amount_cents = v_paid,
    status = v_new_status,
    paid_date = CASE WHEN v_balance <= 0 THEN CURRENT_DATE ELSE NULL END,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update invoice status on payment
CREATE TRIGGER trigger_update_invoice_status
  AFTER INSERT ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_status();

-- Trigger to update invoices.updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update customers.updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update expenses.updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE customers IS 'Customer contact information and details';
COMMENT ON TABLE invoices IS 'Invoices issued to customers with line items';
COMMENT ON TABLE invoice_payments IS 'Payments received for invoices';
COMMENT ON TABLE payment_reminders IS 'Email reminders sent for overdue invoices';
COMMENT ON TABLE expenses IS 'Business expenses with receipts and VAT tracking';

COMMENT ON FUNCTION get_next_invoice_number IS 'Generate next invoice number in format YYYY-####';
COMMENT ON FUNCTION get_invoice_balance IS 'Calculate remaining balance on invoice (total - paid)';
COMMENT ON FUNCTION update_invoice_status IS 'Automatically update invoice status when payment is recorded';
