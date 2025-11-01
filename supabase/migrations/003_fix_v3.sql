-- =====================================================
-- Migration Fix: 003_compliance_calendar.sql
-- Purpose: Fix RLS policies and views
-- Created: 2025-11-01
-- =====================================================

-- =====================================================
-- PART 1: DROP EXISTING POLICIES (if any exist)
-- =====================================================

DROP POLICY IF EXISTS "Users can read own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can insert own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can update own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Anyone can read active task templates" ON public.task_templates;
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can read own completion history" ON public.deadlines_history;
DROP POLICY IF EXISTS "System can create history entries" ON public.deadlines_history;

-- =====================================================
-- PART 2: CREATE RLS POLICIES (FIXED)
-- =====================================================

-- Business Profiles: Users own their profiles
CREATE POLICY "Users can read own business profile"
  ON public.business_profiles FOR SELECT
  USING (auth.user_id()::UUID = user_id);

CREATE POLICY "Users can insert own business profile"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.user_id()::UUID = user_id);

CREATE POLICY "Users can update own business profile"
  ON public.business_profiles FOR UPDATE
  USING (auth.user_id()::UUID = user_id);

-- Task Templates: Public read, admin write
CREATE POLICY "Anyone can read active task templates"
  ON public.task_templates FOR SELECT
  USING (is_active = TRUE);

-- Tasks: Users own their tasks
CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.user_id()::UUID = user_id)
  WITH CHECK (auth.user_id()::UUID = user_id);

-- Notifications: Users own their notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.user_id()::UUID = user_id);

CREATE POLICY "System can manage notifications"
  ON public.notifications FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Deadlines History: Users own their history
CREATE POLICY "Users can read own completion history"
  ON public.deadlines_history FOR SELECT
  USING (auth.user_id()::UUID = user_id);

CREATE POLICY "System can create history entries"
  ON public.deadlines_history FOR INSERT
  WITH CHECK (TRUE);

-- =====================================================
-- PART 3: FIX VIEWS
-- =====================================================

-- Drop and recreate v_upcoming_tasks with correct syntax
DROP VIEW IF EXISTS public.v_upcoming_tasks;

CREATE VIEW public.v_upcoming_tasks AS
SELECT
  t.id,
  t.user_id,
  u.email,
  u.name,
  t.title,
  t.due_date,
  t.category,
  t.priority,
  (t.due_date - CURRENT_DATE) AS days_until_due,
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
-- END OF FIX
-- =====================================================
