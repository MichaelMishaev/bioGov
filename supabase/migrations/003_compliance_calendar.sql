-- =====================================================
-- Migration: 003_compliance_calendar.sql
-- Purpose: Israeli Business Compliance Calendar System
-- Created: 2025-11-01
-- Description: Task management, notifications, business profiles,
--              and compliance templates for Israeli businesses
-- =====================================================

-- =====================================================
-- PART 1: BUSINESS PROFILES
-- =====================================================

-- Business profile information for personalized compliance
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,

  -- Business classification
  business_type TEXT NOT NULL CHECK (business_type IN (
    'sole_proprietor',    -- עוסק פטור / עוסק מורשה
    'partnership',        -- שותפות
    'company',           -- חברה בע"מ
    'nonprofit',         -- עמותה
    'cooperative'        -- אגודה שיתופית
  )),

  -- VAT status
  vat_status TEXT NOT NULL CHECK (vat_status IN (
    'exempt',            -- פטור ממע"מ
    'registered',        -- עוסק מורשה
    'pending'            -- בהליך רישום
  )),

  -- Industry classification (for industry-specific regulations)
  industry TEXT CHECK (industry IN (
    'retail',            -- קמעונאות
    'services',          -- שירותים
    'technology',        -- היי-טק
    'food',              -- מזון ומסעדות
    'healthcare',        -- בריאות
    'construction',      -- בניה
    'education',         -- חינוך
    'finance',           -- פיננסים
    'manufacturing',     -- תעשייה
    'agriculture',       -- חקלאות
    'other'
  )),

  -- Employee count (for labor law compliance)
  employee_count INTEGER CHECK (employee_count >= 0),

  -- Fiscal year start (default: January 1)
  fiscal_year_start DATE DEFAULT '2025-01-01',

  -- Business registration date
  business_established_date DATE,

  -- Location (for local municipality taxes)
  municipality TEXT,

  -- Additional metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key
  CONSTRAINT fk_business_profiles_user FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON DELETE CASCADE
);

-- Indexes for business_profiles
CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX idx_business_profiles_vat_status ON public.business_profiles(vat_status);
CREATE INDEX idx_business_profiles_business_type ON public.business_profiles(business_type);
CREATE INDEX idx_business_profiles_industry ON public.business_profiles(industry);

-- =====================================================
-- PART 2: TASK TEMPLATES
-- =====================================================

-- Reusable compliance task blueprints
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template identification
  template_code TEXT UNIQUE NOT NULL, -- e.g., 'VAT_MONTHLY', 'TAX_ANNUAL'

  -- Content (Hebrew)
  title_he TEXT NOT NULL,
  description_he TEXT,

  -- Categorization
  category TEXT NOT NULL CHECK (category IN (
    'vat',               -- מע"מ
    'income_tax',        -- מס הכנסה
    'social_security',   -- ביטוח לאומי
    'license',           -- רישוי עסקי
    'financial_reports', -- דוחות כספיים
    'labor_law',         -- דיני עבודה
    'municipality',      -- ארנונה ומיסי עירייה
    'insurance',         -- ביטוחים
    'other'
  )),

  -- Priority
  default_priority TEXT DEFAULT 'medium' CHECK (default_priority IN (
    'low', 'medium', 'high', 'urgent'
  )),

  -- Recurrence rule (iCalendar RRULE format)
  -- Examples:
  -- Monthly: "FREQ=MONTHLY;BYMONTHDAY=15" (every 15th)
  -- Quarterly: "FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=15"
  -- Annual: "FREQ=YEARLY;BYMONTH=4;BYMONTHDAY=30" (April 30)
  recurrence_rule TEXT,

  -- Lead time (days before due date to create task)
  lead_time_days INTEGER DEFAULT 30,

  -- Reminder settings (days before due date)
  reminder_days INTEGER[] DEFAULT ARRAY[7, 3, 1],

  -- Applicability filters
  applies_to_vat_status TEXT[] DEFAULT ARRAY['exempt', 'registered'],
  applies_to_business_types TEXT[] DEFAULT ARRAY['sole_proprietor', 'partnership', 'company'],
  applies_to_industries TEXT[],

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata (e.g., legal references, required documents)
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for task_templates
CREATE INDEX idx_task_templates_category ON public.task_templates(category);
CREATE INDEX idx_task_templates_active ON public.task_templates(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_task_templates_code ON public.task_templates(template_code);

-- =====================================================
-- PART 3: TASKS
-- =====================================================

-- User-specific compliance tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_id UUID, -- NULL for custom user-created tasks

  -- Task details
  title TEXT NOT NULL,
  description TEXT,

  -- Scheduling
  due_date DATE NOT NULL,

  -- Categorization
  category TEXT NOT NULL CHECK (category IN (
    'vat', 'income_tax', 'social_security', 'license',
    'financial_reports', 'labor_law', 'municipality', 'insurance', 'other'
  )),

  priority TEXT DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'urgent'
  )),

  -- Status
  completed_at TIMESTAMPTZ,

  -- Recurrence
  recurring_pattern TEXT, -- iCalendar RRULE
  parent_task_id UUID, -- For recurring task instances

  -- Metadata
  metadata JSONB DEFAULT '{}', -- Can store proof_urls, notes, etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign keys
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_template FOREIGN KEY (template_id)
    REFERENCES public.task_templates(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_parent FOREIGN KEY (parent_task_id)
    REFERENCES public.tasks(id) ON DELETE CASCADE
);

-- Indexes for tasks (optimized for common queries)
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_user_due_date ON public.tasks(user_id, due_date);
CREATE INDEX idx_tasks_user_category ON public.tasks(user_id, category);
CREATE INDEX idx_tasks_completed ON public.tasks(user_id, completed_at) WHERE completed_at IS NULL;
CREATE INDEX idx_tasks_upcoming ON public.tasks(due_date) WHERE completed_at IS NULL;
CREATE INDEX idx_tasks_template_id ON public.tasks(template_id);

-- =====================================================
-- PART 4: NOTIFICATIONS
-- =====================================================

-- Notification queue for task reminders
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Notification details
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'email',
    'sms',
    'push',
    'whatsapp'
  )),

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sent',
    'failed',
    'cancelled'
  )),

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign keys
  CONSTRAINT fk_notifications_task FOREIGN KEY (task_id)
    REFERENCES public.tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON DELETE CASCADE
);

-- Indexes for notifications (optimized for processing queue)
CREATE INDEX idx_notifications_scheduled_status ON public.notifications(scheduled_at, status)
  WHERE status = 'pending';
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_task_id ON public.notifications(task_id);

-- =====================================================
-- PART 5: DEADLINES HISTORY
-- =====================================================

-- Audit trail for completed tasks
CREATE TABLE IF NOT EXISTS public.deadlines_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Completion details
  completed_at TIMESTAMPTZ NOT NULL,
  due_date DATE NOT NULL,
  was_late BOOLEAN GENERATED ALWAYS AS (completed_at::DATE > due_date) STORED,

  -- Proof of completion
  proof_uploaded BOOLEAN DEFAULT FALSE,
  proof_urls TEXT[],

  -- Notes
  completion_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign keys
  CONSTRAINT fk_deadlines_history_task FOREIGN KEY (task_id)
    REFERENCES public.tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_deadlines_history_user FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON DELETE CASCADE
);

-- Indexes for deadlines_history
CREATE INDEX idx_deadlines_history_user_id ON public.deadlines_history(user_id);
CREATE INDEX idx_deadlines_history_completed_at ON public.deadlines_history(completed_at);
CREATE INDEX idx_deadlines_history_was_late ON public.deadlines_history(was_late) WHERE was_late = TRUE;

-- =====================================================
-- PART 6: HELPER FUNCTIONS
-- =====================================================

-- Function: Calculate next due date from recurrence rule
CREATE OR REPLACE FUNCTION public.calculate_next_due_date(
  recurrence_rule TEXT,
  last_due_date DATE
)
RETURNS DATE AS $$
DECLARE
  next_date DATE;
  freq TEXT;
  interval_val INTEGER;
  month_day INTEGER;
  month_val INTEGER;
BEGIN
  -- Parse RRULE (simplified implementation)
  -- Example: "FREQ=MONTHLY;BYMONTHDAY=15"

  -- Extract frequency
  freq := substring(recurrence_rule FROM 'FREQ=([A-Z]+)');

  -- Extract interval (default 1)
  interval_val := COALESCE(
    substring(recurrence_rule FROM 'INTERVAL=(\d+)')::INTEGER,
    1
  );

  -- Calculate next date based on frequency
  CASE freq
    WHEN 'DAILY' THEN
      next_date := last_due_date + (interval_val || ' days')::INTERVAL;

    WHEN 'WEEKLY' THEN
      next_date := last_due_date + (interval_val || ' weeks')::INTERVAL;

    WHEN 'MONTHLY' THEN
      -- Extract BYMONTHDAY if present
      month_day := substring(recurrence_rule FROM 'BYMONTHDAY=(\d+)')::INTEGER;

      IF month_day IS NOT NULL THEN
        -- Set specific day of month
        next_date := (last_due_date + (interval_val || ' months')::INTERVAL);
        next_date := DATE_TRUNC('month', next_date) + (month_day - 1 || ' days')::INTERVAL;
      ELSE
        -- Same day next month
        next_date := last_due_date + (interval_val || ' months')::INTERVAL;
      END IF;

    WHEN 'YEARLY' THEN
      -- Extract BYMONTH and BYMONTHDAY if present
      month_val := substring(recurrence_rule FROM 'BYMONTH=(\d+)')::INTEGER;
      month_day := substring(recurrence_rule FROM 'BYMONTHDAY=(\d+)')::INTEGER;

      IF month_val IS NOT NULL AND month_day IS NOT NULL THEN
        -- Specific date each year
        next_date := MAKE_DATE(
          EXTRACT(YEAR FROM last_due_date)::INTEGER + interval_val,
          month_val,
          month_day
        );
      ELSE
        -- Same date next year
        next_date := last_due_date + (interval_val || ' years')::INTERVAL;
      END IF;

    ELSE
      -- Unknown frequency, return NULL
      RETURN NULL;
  END CASE;

  RETURN next_date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Generate tasks from template for a user
CREATE OR REPLACE FUNCTION public.generate_tasks_from_template(
  p_template_id UUID,
  p_user_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 year'
)
RETURNS TABLE (task_id UUID, due_date DATE) AS $$
DECLARE
  v_template RECORD;
  v_profile RECORD;
  v_current_date DATE;
  v_task_id UUID;
BEGIN
  -- Get template
  SELECT * INTO v_template FROM public.task_templates WHERE id = p_template_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found: %', p_template_id;
  END IF;

  -- Get user's business profile
  SELECT * INTO v_profile FROM public.business_profiles WHERE user_id = p_user_id;

  -- Check if template applies to this user
  IF v_profile.vat_status IS NOT NULL AND
     NOT (v_profile.vat_status = ANY(v_template.applies_to_vat_status)) THEN
    RETURN; -- Template doesn't apply
  END IF;

  IF v_profile.business_type IS NOT NULL AND
     NOT (v_profile.business_type = ANY(v_template.applies_to_business_types)) THEN
    RETURN; -- Template doesn't apply
  END IF;

  -- Generate recurring tasks
  v_current_date := p_start_date;

  WHILE v_current_date <= p_end_date LOOP
    -- Insert task
    INSERT INTO public.tasks (
      user_id,
      template_id,
      title,
      description,
      due_date,
      category,
      priority,
      recurring_pattern
    ) VALUES (
      p_user_id,
      p_template_id,
      v_template.title_he,
      v_template.description_he,
      v_current_date,
      v_template.category,
      v_template.default_priority,
      v_template.recurrence_rule
    )
    RETURNING id INTO v_task_id;

    -- Return task info
    task_id := v_task_id;
    due_date := v_current_date;
    RETURN NEXT;

    -- Calculate next occurrence
    v_current_date := public.calculate_next_due_date(
      v_template.recurrence_rule,
      v_current_date
    );

    -- Break if no more recurrences
    IF v_current_date IS NULL THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 7: TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON public.task_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Create history entry when task completed
CREATE OR REPLACE FUNCTION public.create_completion_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create history if task was just completed
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    INSERT INTO public.deadlines_history (
      task_id,
      user_id,
      completed_at,
      due_date,
      completion_notes,
      metadata
    ) VALUES (
      NEW.id,
      NEW.user_id,
      NEW.completed_at,
      NEW.due_date,
      NEW.metadata->>'completion_notes',
      NEW.metadata
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_completion_history
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_completion_history();

-- Trigger: Auto-create notifications for new tasks
CREATE OR REPLACE FUNCTION public.create_task_notifications()
RETURNS TRIGGER AS $$
DECLARE
  v_reminder_day INTEGER;
  v_scheduled_at TIMESTAMPTZ;
BEGIN
  -- Get template reminder settings or use defaults
  IF NEW.template_id IS NOT NULL THEN
    -- Use template reminder days
    FOR v_reminder_day IN
      SELECT UNNEST(reminder_days)
      FROM public.task_templates
      WHERE id = NEW.template_id
    LOOP
      v_scheduled_at := (NEW.due_date - v_reminder_day)::TIMESTAMPTZ;

      -- Only create if in future
      IF v_scheduled_at > NOW() THEN
        INSERT INTO public.notifications (
          task_id,
          user_id,
          notification_type,
          scheduled_at,
          status
        ) VALUES (
          NEW.id,
          NEW.user_id,
          'email', -- Default to email
          v_scheduled_at,
          'pending'
        );
      END IF;
    END LOOP;
  ELSE
    -- Default reminders: 7, 3, 1 days before
    FOREACH v_reminder_day IN ARRAY ARRAY[7, 3, 1]
    LOOP
      v_scheduled_at := (NEW.due_date - v_reminder_day)::TIMESTAMPTZ;

      IF v_scheduled_at > NOW() THEN
        INSERT INTO public.notifications (
          task_id,
          user_id,
          notification_type,
          scheduled_at,
          status
        ) VALUES (
          NEW.id,
          NEW.user_id,
          'email',
          v_scheduled_at,
          'pending'
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_notifications
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_task_notifications();

-- =====================================================
-- PART 8: ROW-LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines_history ENABLE ROW LEVEL SECURITY;

-- Business Profiles: Users own their profiles
CREATE POLICY "Users can read own business profile"
  ON public.business_profiles FOR SELECT
  USING (auth.current_user_id() = user_id);

CREATE POLICY "Users can insert own business profile"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.current_user_id() = user_id);

CREATE POLICY "Users can update own business profile"
  ON public.business_profiles FOR UPDATE
  USING (auth.current_user_id() = user_id);

-- Task Templates: Public read, admin write
CREATE POLICY "Anyone can read active task templates"
  ON public.task_templates FOR SELECT
  USING (is_active = TRUE);

-- Tasks: Users own their tasks
CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.current_user_id() = user_id)
  WITH CHECK (auth.current_user_id() = user_id);

-- Notifications: Users own their notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.current_user_id() = user_id);

CREATE POLICY "System can manage notifications"
  ON public.notifications FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Deadlines History: Users own their history
CREATE POLICY "Users can read own completion history"
  ON public.deadlines_history FOR SELECT
  USING (auth.current_user_id() = user_id);

CREATE POLICY "System can create history entries"
  ON public.deadlines_history FOR INSERT
  WITH CHECK (TRUE);

-- =====================================================
-- PART 9: ISRAELI COMPLIANCE TASK TEMPLATES
-- =====================================================

-- VAT Templates
INSERT INTO public.task_templates (template_code, title_he, description_he, category, recurrence_rule, default_priority, lead_time_days, reminder_days, applies_to_vat_status) VALUES
('VAT_MONTHLY', 'דוח מע"מ חודשי', 'הגשת דוח מע"מ לרשות המסים עד ה-15 בחודש', 'vat', 'FREQ=MONTHLY;BYMONTHDAY=15', 'high', 10, ARRAY[7, 3, 1], ARRAY['registered']),
('VAT_BIMONTHLY', 'דוח מע"מ דו-חודשי', 'הגשת דוח מע"מ דו-חודשי לרשות המסים', 'vat', 'FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=15', 'high', 10, ARRAY[7, 3, 1], ARRAY['registered']);

-- Income Tax Templates
INSERT INTO public.task_templates (template_code, title_he, description_he, category, recurrence_rule, default_priority, lead_time_days, reminder_days) VALUES
('TAX_ADVANCE_Q1', 'מקדמה רבעונית Q1', 'תשלום מקדמה על מס הכנסה - רבעון ראשון (ינואר-מרץ)', 'income_tax', 'FREQ=YEARLY;BYMONTH=4;BYMONTHDAY=15', 'high', 14, ARRAY[14, 7, 3]),
('TAX_ADVANCE_Q2', 'מקדמה רבעונית Q2', 'תשלום מקדמה על מס הכנסה - רבעון שני (אפריל-יוני)', 'income_tax', 'FREQ=YEARLY;BYMONTH=7;BYMONTHDAY=15', 'high', 14, ARRAY[14, 7, 3]),
('TAX_ADVANCE_Q3', 'מקדמה רבעונית Q3', 'תשלום מקדמה על מס הכנסה - רבעון שלישי (יוני-ספטמבר)', 'income_tax', 'FREQ=YEARLY;BYMONTH=10;BYMONTHDAY=15', 'high', 14, ARRAY[14, 7, 3]),
('TAX_ADVANCE_Q4', 'מקדמה רבעונית Q4', 'תשלום מקדמה על מס הכנסה - רבעון רביעי (אוקטובר-דצמבר)', 'income_tax', 'FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=15', 'high', 14, ARRAY[14, 7, 3]),
('TAX_ANNUAL_RETURN', 'דוח שנתי למס הכנסה', 'הגשת דוח שנתי לרשות המסים - אפריל 30', 'income_tax', 'FREQ=YEARLY;BYMONTH=4;BYMONTHDAY=30', 'urgent', 30, ARRAY[30, 14, 7, 3]);

-- Social Security (Bituach Leumi) Templates
INSERT INTO public.task_templates (template_code, title_he, description_he, category, recurrence_rule, default_priority, lead_time_days, reminder_days) VALUES
('BITUACH_LEUMI_MONTHLY', 'דיווח חודשי לביטוח לאומי', 'דיווח ותשלום לביטוח לאומי עד ה-15 בחודש', 'social_security', 'FREQ=MONTHLY;BYMONTHDAY=15', 'high', 10, ARRAY[7, 3, 1]),
('BITUACH_LEUMI_ANNUAL', 'דוח שנתי לביטוח לאומי', 'הגשת דוח שנתי לביטוח לאומי', 'social_security', 'FREQ=YEARLY;BYMONTH=3;BYMONTHDAY=31', 'high', 21, ARRAY[21, 14, 7]);

-- Business License Templates
INSERT INTO public.task_templates (template_code, title_he, description_he, category, recurrence_rule, default_priority, lead_time_days, reminder_days) VALUES
('BUSINESS_LICENSE_RENEWAL', 'חידוש רישיון עסק', 'חידוש רישיון עסק בעירייה - בדוק תאריך תפוגה', 'license', 'FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=31', 'urgent', 60, ARRAY[60, 30, 14, 7]);

-- Financial Reporting Templates
INSERT INTO public.task_templates (template_code, title_he, description_he, category, recurrence_rule, default_priority, lead_time_days, reminder_days, applies_to_business_types) VALUES
('FINANCIAL_STATEMENTS_ANNUAL', 'דוחות כספיים שנתיים', 'הכנת דוחות כספיים מבוקרים - חברות בע"מ', 'financial_reports', 'FREQ=YEARLY;BYMONTH=3;BYMONTHDAY=31', 'urgent', 60, ARRAY[60, 30, 14], ARRAY['company']),
('BALANCE_SHEET_QUARTERLY', 'מאזן רבעוני', 'הכנת מאזן רבעוני לדירקטוריון', 'financial_reports', 'FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=30', 'medium', 21, ARRAY[14, 7], ARRAY['company']);

-- Labor Law Templates
INSERT INTO public.task_templates (template_code, title_he, description_he, category, recurrence_rule, default_priority, lead_time_days, reminder_days) VALUES
('MONTHLY_PAYROLL', 'תלושי שכר חודשיים', 'הפקת ותשלום משכורות לעובדים', 'labor_law', 'FREQ=MONTHLY;BYMONTHDAY=9', 'urgent', 7, ARRAY[5, 3, 1]),
('ANNUAL_VACATION_REVIEW', 'סגירת שנת חופשה', 'בדיקת יתרות חופשה שנתיות לעובדים', 'labor_law', 'FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=31', 'medium', 30, ARRAY[30, 14]);

-- Municipality Templates
INSERT INTO public.task_templates (template_code, title_he, description_he, category, recurrence_rule, default_priority, lead_time_days, reminder_days) VALUES
('ARNONA_BIMONTHLY', 'תשלום ארנונה', 'תשלום ארנונה דו-חודשי לעירייה', 'municipality', 'FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=1', 'medium', 7, ARRAY[7, 3]);

-- Insurance Templates
INSERT INTO public.task_templates (template_code, title_he, description_he, category, recurrence_rule, default_priority, lead_time_days, reminder_days) VALUES
('BUSINESS_INSURANCE_RENEWAL', 'חידוש ביטוח עסקי', 'חידוש ביטוח עסק (אחריות מקצועית, רכוש)', 'insurance', 'FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1', 'high', 45, ARRAY[45, 30, 14]),
('LIABILITY_INSURANCE_RENEWAL', 'חידוש ביטוח אחריות', 'חידוש ביטוח אחריות מעבידים', 'insurance', 'FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1', 'high', 45, ARRAY[45, 30, 14]);

-- Additional Industry-Specific Templates
INSERT INTO public.task_templates (template_code, title_he, description_he, category, recurrence_rule, default_priority, lead_time_days, reminder_days, applies_to_industries) VALUES
('HEALTH_LICENSE_FOOD', 'חידוש רישיון משרד הבריאות', 'חידוש רישיון עסק מזון ממשרד הבריאות', 'license', 'FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=31', 'urgent', 60, ARRAY[60, 30, 14], ARRAY['food']),
('CONSTRUCTION_SAFETY_REPORT', 'דוח בטיחות באתר', 'הגשת דוח בטיחות חודשי לפיקוח עבודה', 'labor_law', 'FREQ=MONTHLY;BYMONTHDAY=1', 'high', 5, ARRAY[5, 2], ARRAY['construction']);

-- =====================================================
-- PART 10: VIEWS FOR ANALYTICS
-- =====================================================

-- View: Upcoming tasks for all users
CREATE OR REPLACE VIEW public.v_upcoming_tasks AS
SELECT
  t.id,
  t.user_id,
  u.email,
  u.name,
  t.title,
  t.due_date,
  t.category,
  t.priority,
  EXTRACT(DAY FROM (t.due_date - CURRENT_DATE))::INTEGER AS days_until_due,
  CASE
    WHEN t.due_date < CURRENT_DATE THEN 'overdue'
    WHEN t.due_date = CURRENT_DATE THEN 'today'
    WHEN t.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
    WHEN t.due_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'this_month'
    ELSE 'future'
  END AS urgency_status
FROM public.tasks t
JOIN public.users u ON t.user_id = u.id
WHERE t.completed_at IS NULL
ORDER BY t.due_date ASC;

-- View: Task completion statistics
CREATE OR REPLACE VIEW public.v_task_completion_stats AS
SELECT
  user_id,
  COUNT(*) AS total_tasks,
  COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS completed_tasks,
  COUNT(*) FILTER (WHERE completed_at IS NULL) AS pending_tasks,
  COUNT(*) FILTER (WHERE completed_at IS NULL AND due_date < CURRENT_DATE) AS overdue_tasks,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE completed_at IS NOT NULL) / NULLIF(COUNT(*), 0),
    2
  ) AS completion_rate
FROM public.tasks
GROUP BY user_id;

-- View: Pending notifications queue
CREATE OR REPLACE VIEW public.v_pending_notifications AS
SELECT
  n.id,
  n.task_id,
  n.user_id,
  u.email,
  u.name,
  t.title AS task_title,
  t.due_date,
  n.notification_type,
  n.scheduled_at,
  n.retry_count
FROM public.notifications n
JOIN public.users u ON n.user_id = u.id
JOIN public.tasks t ON n.task_id = t.id
WHERE n.status = 'pending'
  AND n.scheduled_at <= NOW()
ORDER BY n.scheduled_at ASC;

-- =====================================================
-- PART 11: UTILITY FUNCTIONS
-- =====================================================

-- Function: Get user's compliance score
CREATE OR REPLACE FUNCTION public.get_user_compliance_score(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_score NUMERIC;
BEGIN
  SELECT
    ROUND(
      100.0 *
      COUNT(*) FILTER (WHERE completed_at IS NOT NULL AND completed_at::DATE <= due_date) /
      NULLIF(COUNT(*) FILTER (WHERE completed_at IS NOT NULL), 0),
      2
    )
  INTO v_score
  FROM public.tasks
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE - INTERVAL '1 year';

  RETURN COALESCE(v_score, 100.0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get tasks due in next N days
CREATE OR REPLACE FUNCTION public.get_upcoming_tasks(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  task_id UUID,
  title TEXT,
  due_date DATE,
  category TEXT,
  priority TEXT,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.due_date,
    t.category,
    t.priority,
    EXTRACT(DAY FROM (t.due_date - CURRENT_DATE))::INTEGER
  FROM public.tasks t
  WHERE t.user_id = p_user_id
    AND t.completed_at IS NULL
    AND t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
  ORDER BY t.due_date ASC, t.priority DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- PART 12: COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.business_profiles IS 'User business information for personalized compliance recommendations';
COMMENT ON TABLE public.task_templates IS 'Reusable compliance task blueprints with recurrence rules';
COMMENT ON TABLE public.tasks IS 'User-specific compliance tasks and deadlines';
COMMENT ON TABLE public.notifications IS 'Notification queue for task reminders (email/SMS/push)';
COMMENT ON TABLE public.deadlines_history IS 'Audit trail of completed tasks for compliance reporting';

COMMENT ON FUNCTION public.calculate_next_due_date IS 'Calculates next occurrence based on iCalendar RRULE';
COMMENT ON FUNCTION public.generate_tasks_from_template IS 'Creates recurring tasks for a user from a template';
COMMENT ON FUNCTION public.get_user_compliance_score IS 'Returns user on-time completion percentage (0-100)';
COMMENT ON FUNCTION public.get_upcoming_tasks IS 'Returns tasks due in next N days for a user';

-- =====================================================
-- END OF MIGRATION
-- =====================================================

-- Verification queries (for testing):
-- SELECT COUNT(*) FROM public.task_templates; -- Should return 18+ templates
-- SELECT * FROM public.task_templates WHERE category = 'vat';
-- SELECT template_code, title_he FROM public.task_templates ORDER BY category;
