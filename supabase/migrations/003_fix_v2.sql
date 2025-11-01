-- =====================================================
-- Fix Script v2 for Migration 003
-- Solution: Use public.current_user_id() instead of auth schema
-- =====================================================

-- =====================================================
-- PART 1: Create current_user_id() in public schema
-- =====================================================

-- Create current_user_id function in public schema
-- This is a placeholder for RLS - in production, this would be set by your auth system
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
BEGIN
  -- In a real auth system, this would return the authenticated user's ID from session
  -- For now, we'll use a session variable approach
  RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.current_user_id IS 'Returns the current authenticated user ID from session variable app.current_user_id';

-- =====================================================
-- PART 2: Drop and recreate RLS policies
-- =====================================================

-- Drop all existing RLS policies that reference auth.current_user_id()
DROP POLICY IF EXISTS "Users can read own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can insert own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can update own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can read own completion history" ON public.deadlines_history;

-- Recreate with public.current_user_id()
CREATE POLICY "Users can read own business profile"
  ON public.business_profiles FOR SELECT
  USING (public.current_user_id() = user_id);

CREATE POLICY "Users can insert own business profile"
  ON public.business_profiles FOR INSERT
  WITH CHECK (public.current_user_id() = user_id);

CREATE POLICY "Users can update own business profile"
  ON public.business_profiles FOR UPDATE
  USING (public.current_user_id() = user_id);

CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL
  USING (public.current_user_id() = user_id)
  WITH CHECK (public.current_user_id() = user_id);

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (public.current_user_id() = user_id);

CREATE POLICY "Users can read own completion history"
  ON public.deadlines_history FOR SELECT
  USING (public.current_user_id() = user_id);

-- =====================================================
-- PART 3: Create deadlines_history if it doesn't exist
-- =====================================================

CREATE TABLE IF NOT EXISTS public.deadlines_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Completion details
  completed_at TIMESTAMPTZ NOT NULL,
  due_date DATE NOT NULL,
  was_late BOOLEAN DEFAULT FALSE,

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

-- Indexes for deadlines_history (skip if exist)
CREATE INDEX IF NOT EXISTS idx_deadlines_history_user_id ON public.deadlines_history(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_history_completed_at ON public.deadlines_history(completed_at);
CREATE INDEX IF NOT EXISTS idx_deadlines_history_was_late ON public.deadlines_history(was_late) WHERE was_late = TRUE;

-- Enable RLS
ALTER TABLE public.deadlines_history ENABLE ROW LEVEL SECURITY;

-- Policies (already created above)
CREATE POLICY IF NOT EXISTS "System can create history entries"
  ON public.deadlines_history FOR INSERT
  WITH CHECK (TRUE);

-- =====================================================
-- PART 4: Create trigger to calculate was_late
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_was_late()
RETURNS TRIGGER AS $$
BEGIN
  NEW.was_late := (NEW.completed_at::DATE > NEW.due_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_was_late ON public.deadlines_history;
CREATE TRIGGER set_was_late
  BEFORE INSERT OR UPDATE ON public.deadlines_history
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_was_late();

-- =====================================================
-- PART 5: Recreate v_upcoming_tasks view
-- =====================================================

DROP VIEW IF EXISTS public.v_upcoming_tasks CASCADE;

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
  (t.due_date - CURRENT_DATE)::INTEGER AS days_until_due,
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

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Fix v2 applied successfully!' AS status;

-- Count all tables
SELECT COUNT(*) AS total_tables_created
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'business_profiles',
    'task_templates',
    'tasks',
    'notifications',
    'deadlines_history'
  );

-- Count all views
SELECT COUNT(*) AS total_views_created
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN (
    'v_upcoming_tasks',
    'v_task_completion_stats',
    'v_pending_notifications'
  );
