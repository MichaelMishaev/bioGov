-- =====================================================
-- Verification Script: 003_compliance_calendar.sql
-- Purpose: Test migration deployment
-- Run after: 003_compliance_calendar.sql
-- =====================================================

-- =====================================================
-- PART 1: TABLE VERIFICATION
-- =====================================================

SELECT 'Testing table creation...' AS test_section;

-- Check all 5 tables exist
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'business_profiles',
    'task_templates',
    'tasks',
    'notifications',
    'deadlines_history'
  )
ORDER BY table_name;

-- Expected: 5 rows

-- =====================================================
-- PART 2: TEMPLATE VERIFICATION
-- =====================================================

SELECT 'Testing task templates...' AS test_section;

-- Count templates
SELECT COUNT(*) AS total_templates
FROM public.task_templates;

-- Expected: 18

-- List all template codes
SELECT template_code, title_he, category, default_priority
FROM public.task_templates
ORDER BY category, template_code;

-- Check VAT templates
SELECT COUNT(*) AS vat_templates
FROM public.task_templates
WHERE category = 'vat';

-- Expected: 2 (VAT_MONTHLY, VAT_BIMONTHLY)

-- =====================================================
-- PART 3: INDEX VERIFICATION
-- =====================================================

SELECT 'Testing indexes...' AS test_section;

-- Count indexes on new tables
SELECT
  tablename,
  COUNT(*) AS index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'business_profiles',
    'task_templates',
    'tasks',
    'notifications',
    'deadlines_history'
  )
GROUP BY tablename
ORDER BY tablename;

-- Expected totals:
-- business_profiles: 5 (1 PK + 4 indexes)
-- task_templates: 4 (1 PK + 3 indexes)
-- tasks: 7 (1 PK + 6 indexes)
-- notifications: 4 (1 PK + 3 indexes)
-- deadlines_history: 4 (1 PK + 3 indexes)

-- =====================================================
-- PART 4: FUNCTION VERIFICATION
-- =====================================================

SELECT 'Testing functions...' AS test_section;

-- List all compliance-related functions
SELECT
  proname AS function_name,
  pg_get_function_arguments(oid) AS arguments
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'calculate_next_due_date',
    'generate_tasks_from_template',
    'get_user_compliance_score',
    'get_upcoming_tasks',
    'create_completion_history',
    'create_task_notifications',
    'update_updated_at_column'
  )
ORDER BY proname;

-- Expected: 7 functions

-- Test calculate_next_due_date function
SELECT 'Testing calculate_next_due_date...' AS test_section;

-- Test monthly recurrence
SELECT
  'Monthly test (15th)' AS test_case,
  public.calculate_next_due_date(
    'FREQ=MONTHLY;BYMONTHDAY=15',
    '2025-01-15'::DATE
  ) AS next_date,
  '2025-02-15'::DATE AS expected;

-- Test yearly recurrence
SELECT
  'Yearly test (April 30)' AS test_case,
  public.calculate_next_due_date(
    'FREQ=YEARLY;BYMONTH=4;BYMONTHDAY=30',
    '2025-04-30'::DATE
  ) AS next_date,
  '2026-04-30'::DATE AS expected;

-- Test quarterly recurrence (every 3 months)
SELECT
  'Quarterly test' AS test_case,
  public.calculate_next_due_date(
    'FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=15',
    '2025-01-15'::DATE
  ) AS next_date,
  '2025-04-15'::DATE AS expected;

-- =====================================================
-- PART 5: VIEW VERIFICATION
-- =====================================================

SELECT 'Testing views...' AS test_section;

-- Check views exist
SELECT viewname
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN (
    'v_upcoming_tasks',
    'v_task_completion_stats',
    'v_pending_notifications'
  )
ORDER BY viewname;

-- Expected: 3 views

-- =====================================================
-- PART 6: TRIGGER VERIFICATION
-- =====================================================

SELECT 'Testing triggers...' AS test_section;

-- List triggers on new tables
SELECT
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  tgtype AS trigger_type
FROM pg_trigger
WHERE tgrelid IN (
  'public.business_profiles'::regclass,
  'public.task_templates'::regclass,
  'public.tasks'::regclass,
  'public.notifications'::regclass
)
  AND tgname NOT LIKE 'RI_%' -- Exclude foreign key triggers
ORDER BY table_name, trigger_name;

-- Expected triggers:
-- business_profiles: update_business_profiles_updated_at
-- task_templates: update_task_templates_updated_at
-- tasks: update_tasks_updated_at, task_completion_history, auto_create_notifications
-- notifications: update_notifications_updated_at

-- =====================================================
-- PART 7: RLS POLICY VERIFICATION
-- =====================================================

SELECT 'Testing RLS policies...' AS test_section;

-- Check RLS enabled
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'business_profiles',
    'task_templates',
    'tasks',
    'notifications',
    'deadlines_history'
  )
ORDER BY tablename;

-- Expected: All should have rls_enabled = TRUE

-- Count policies per table
SELECT
  schemaname,
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'business_profiles',
    'task_templates',
    'tasks',
    'notifications',
    'deadlines_history'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Expected:
-- business_profiles: 3 policies
-- task_templates: 1 policy
-- tasks: 1 policy
-- notifications: 2 policies
-- deadlines_history: 2 policies

-- =====================================================
-- PART 8: DATA INTEGRITY TEST
-- =====================================================

SELECT 'Testing data integrity...' AS test_section;

-- Test CHECK constraints on business_profiles
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.business_profiles'::regclass
  AND contype = 'c' -- CHECK constraint
ORDER BY conname;

-- Test FOREIGN KEY constraints on tasks
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table,
  confdeltype AS on_delete_action
FROM pg_constraint
WHERE conrelid = 'public.tasks'::regclass
  AND contype = 'f' -- FOREIGN KEY constraint
ORDER BY conname;

-- Expected:
-- fk_tasks_user -> users (CASCADE)
-- fk_tasks_template -> task_templates (SET NULL)
-- fk_tasks_parent -> tasks (CASCADE)

-- =====================================================
-- PART 9: SAMPLE DATA TEST
-- =====================================================

SELECT 'Testing sample data insertion...' AS test_section;

-- Insert test user (skip if auth not set up)
-- INSERT INTO public.users (email, name, password_hash, email_verified, consent_given)
-- VALUES ('test@example.com', 'Test User', '$2a$10$dummy', TRUE, TRUE)
-- RETURNING id;

-- For now, just verify template data
SELECT category, COUNT(*) AS template_count
FROM public.task_templates
WHERE is_active = TRUE
GROUP BY category
ORDER BY category;

-- Expected distribution:
-- financial_reports: 2
-- income_tax: 5
-- insurance: 2
-- labor_law: 3
-- license: 2
-- municipality: 1
-- social_security: 2
-- vat: 2

-- =====================================================
-- PART 10: PERFORMANCE TEST
-- =====================================================

SELECT 'Testing query performance...' AS test_section;

-- Test index usage on common queries
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM public.task_templates
WHERE category = 'vat'
  AND is_active = TRUE;

-- Should use idx_task_templates_category or idx_task_templates_active

-- =====================================================
-- PART 11: HEBREW TEXT VERIFICATION
-- =====================================================

SELECT 'Testing Hebrew content...' AS test_section;

-- Verify Hebrew text in templates
SELECT
  template_code,
  title_he,
  LENGTH(title_he) AS title_length,
  description_he IS NOT NULL AS has_description
FROM public.task_templates
WHERE template_code IN ('VAT_MONTHLY', 'TAX_ANNUAL_RETURN', 'BITUACH_LEUMI_MONTHLY')
ORDER BY template_code;

-- Expected: Hebrew characters display correctly

-- =====================================================
-- PART 12: SUMMARY
-- =====================================================

SELECT 'Migration verification complete!' AS test_section;

SELECT
  'Tables' AS component,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public'
     AND table_name IN ('business_profiles', 'task_templates', 'tasks', 'notifications', 'deadlines_history')
  ) AS created,
  5 AS expected,
  CASE
    WHEN (SELECT COUNT(*) FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name IN ('business_profiles', 'task_templates', 'tasks', 'notifications', 'deadlines_history')) = 5
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status

UNION ALL

SELECT
  'Templates' AS component,
  (SELECT COUNT(*) FROM public.task_templates) AS created,
  18 AS expected,
  CASE
    WHEN (SELECT COUNT(*) FROM public.task_templates) >= 18
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status

UNION ALL

SELECT
  'Functions' AS component,
  (SELECT COUNT(*) FROM pg_proc
   WHERE pronamespace = 'public'::regnamespace
     AND proname IN ('calculate_next_due_date', 'generate_tasks_from_template',
                     'get_user_compliance_score', 'get_upcoming_tasks',
                     'create_completion_history', 'create_task_notifications',
                     'update_updated_at_column')
  ) AS created,
  7 AS expected,
  CASE
    WHEN (SELECT COUNT(*) FROM pg_proc
          WHERE pronamespace = 'public'::regnamespace
            AND proname IN ('calculate_next_due_date', 'generate_tasks_from_template',
                           'get_user_compliance_score', 'get_upcoming_tasks',
                           'create_completion_history', 'create_task_notifications',
                           'update_updated_at_column')) = 7
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status

UNION ALL

SELECT
  'Views' AS component,
  (SELECT COUNT(*) FROM pg_views
   WHERE schemaname = 'public'
     AND viewname IN ('v_upcoming_tasks', 'v_task_completion_stats', 'v_pending_notifications')
  ) AS created,
  3 AS expected,
  CASE
    WHEN (SELECT COUNT(*) FROM pg_views
          WHERE schemaname = 'public'
            AND viewname IN ('v_upcoming_tasks', 'v_task_completion_stats', 'v_pending_notifications')) = 3
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status;

-- =====================================================
-- END OF VERIFICATION
-- =====================================================

-- Final message
SELECT
  '🎉 Migration 003 verification complete!' AS message,
  'Check the status column above - all should show ✅ PASS' AS next_steps;
