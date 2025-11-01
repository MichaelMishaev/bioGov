-- =====================================================
-- Fix Script for Migration 003
-- Fixes: Generated column, auth function, deadlines_history
-- =====================================================

-- =====================================================
-- PART 1: Create auth.current_user_id() function
-- =====================================================

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create current_user_id function (returns NULL in non-auth context)
-- This is a placeholder for RLS - in production, this would be set by your auth system
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
BEGIN
  -- In a real auth system, this would return the authenticated user's ID
  -- For now, return NULL (RLS policies will block access)
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- PART 2: Create deadlines_history table (fixed)
-- =====================================================

-- Drop if exists (from failed creation)
DROP TABLE IF EXISTS public.deadlines_history CASCADE;

-- Create without generated column (use trigger instead)
CREATE TABLE IF NOT EXISTS public.deadlines_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Completion details
  completed_at TIMESTAMPTZ NOT NULL,
  due_date DATE NOT NULL,
  was_late BOOLEAN DEFAULT FALSE, -- Changed from GENERATED to DEFAULT

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

-- Enable RLS
ALTER TABLE public.deadlines_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own completion history"
  ON public.deadlines_history FOR SELECT
  USING (auth.current_user_id() = user_id);

CREATE POLICY "System can create history entries"
  ON public.deadlines_history FOR INSERT
  WITH CHECK (TRUE);

-- =====================================================
-- PART 3: Create trigger to calculate was_late
-- =====================================================

-- Function to calculate if task was late
CREATE OR REPLACE FUNCTION public.calculate_was_late()
RETURNS TRIGGER AS $$
BEGIN
  NEW.was_late := (NEW.completed_at::DATE > NEW.due_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set was_late on insert/update
CREATE TRIGGER set_was_late
  BEFORE INSERT OR UPDATE ON public.deadlines_history
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_was_late();

-- =====================================================
-- PART 4: Recreate v_upcoming_tasks view (fixed)
-- =====================================================

-- Drop if exists
DROP VIEW IF EXISTS public.v_upcoming_tasks CASCADE;

-- Create with fixed date arithmetic
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
  (t.due_date - CURRENT_DATE)::INTEGER AS days_until_due, -- Fixed EXTRACT
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
-- PART 5: Add comment
-- =====================================================

COMMENT ON TABLE public.deadlines_history IS 'Audit trail of completed tasks for compliance reporting';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test that everything works
SELECT 'Fix applied successfully!' AS status;

-- Verify deadlines_history exists
SELECT COUNT(*) AS deadlines_history_exists
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'deadlines_history';

-- Verify view exists
SELECT COUNT(*) AS v_upcoming_tasks_exists
FROM pg_views
WHERE schemaname = 'public'
  AND viewname = 'v_upcoming_tasks';
