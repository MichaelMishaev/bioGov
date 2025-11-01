/**
 * Test Utilities for API Testing
 * Provides helpers for authentication, database setup, and common test patterns
 */

import { query, pool } from '@/lib/db';
import { generateAccessToken, hashPassword } from '@/lib/auth';

// ============================================================================
// DATABASE SETUP
// ============================================================================

/**
 * Clean up test database - removes all test data
 * WARNING: This will delete ALL data from the database!
 * Only use in test environment
 */
export async function cleanupDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('cleanupDatabase can only be called in test environment');
  }

  await query('DELETE FROM public.deadlines_history');
  await query('DELETE FROM public.notifications');
  await query('DELETE FROM public.tasks');
  await query('DELETE FROM public.task_templates WHERE template_code LIKE \'TEST_%\'');
  await query('DELETE FROM public.business_profiles');
  await query('DELETE FROM public.auth_audit_log');
  await query('DELETE FROM public.auth_sessions');
  await query('DELETE FROM public.auth_email_verifications');
  await query('DELETE FROM public.auth_password_resets');
  await query('DELETE FROM public.users WHERE email LIKE \'test%@example.com\'');
}

/**
 * Create a test user
 */
export async function createTestUser(email: string = 'test@example.com', name: string = 'Test User') {
  const hashedPassword = await hashPassword('TestPassword123!');

  const result = await query<{
    id: string;
    email: string;
    name: string;
    created_at: Date;
  }>(
    `INSERT INTO public.users (email, name, password_hash, email_verified)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, created_at`,
    [email, name, hashedPassword, true]
  );

  return result.rows[0];
}

/**
 * Create a test business profile
 */
export async function createTestBusinessProfile(
  userId: string,
  options: {
    business_type?: string;
    vat_status?: string;
    industry?: string;
    employee_count?: number;
  } = {}
) {
  const result = await query<any>(
    `INSERT INTO public.business_profiles (
      user_id,
      business_type,
      vat_status,
      industry,
      employee_count
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [
      userId,
      options.business_type || 'sole_proprietor',
      options.vat_status || 'registered',
      options.industry || 'services',
      options.employee_count || 0,
    ]
  );

  return result.rows[0];
}

/**
 * Create a test task
 */
export async function createTestTask(
  userId: string,
  options: {
    title?: string;
    description?: string;
    due_date?: string;
    category?: string;
    priority?: string;
    completed_at?: string | null;
  } = {}
) {
  const result = await query<any>(
    `INSERT INTO public.tasks (
      user_id,
      title,
      description,
      due_date,
      category,
      priority,
      completed_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      userId,
      options.title || 'Test Task',
      options.description || 'Test task description',
      options.due_date || '2025-12-31',
      options.category || 'vat',
      options.priority || 'medium',
      options.completed_at || null,
    ]
  );

  return result.rows[0];
}

/**
 * Create a test task template
 */
export async function createTestTaskTemplate(
  options: {
    template_code?: string;
    title_he?: string;
    category?: string;
    recurrence_rule?: string;
    applies_to_vat_status?: string[];
    applies_to_business_types?: string[];
  } = {}
) {
  const result = await query<any>(
    `INSERT INTO public.task_templates (
      template_code,
      title_he,
      description_he,
      category,
      recurrence_rule,
      default_priority,
      applies_to_vat_status,
      applies_to_business_types
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      options.template_code || 'TEST_TEMPLATE',
      options.title_he || 'תבנית בדיקה',
      'תיאור תבנית בדיקה',
      options.category || 'vat',
      options.recurrence_rule || 'FREQ=MONTHLY;BYMONTHDAY=15',
      'medium',
      options.applies_to_vat_status || ['registered', 'exempt'],
      options.applies_to_business_types || ['sole_proprietor', 'company'],
    ]
  );

  return result.rows[0];
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Generate auth cookie header for test requests
 */
export function generateAuthCookie(userId: string): string {
  const accessToken = generateAccessToken(userId);
  return `access_token=${accessToken}`;
}

/**
 * Create a test user and return auth cookie
 */
export async function createAuthenticatedTestUser(email?: string, name?: string) {
  const user = await createTestUser(email, name);
  const cookie = generateAuthCookie(user.id);

  return {
    user,
    cookie,
    userId: user.id,
  };
}

// ============================================================================
// REQUEST HELPERS
// ============================================================================

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(
  method: string,
  url: string,
  options: {
    body?: any;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  } = {}
): Request {
  const headers = new Headers(options.headers || {});

  // Add cookies
  if (options.cookies) {
    const cookieString = Object.entries(options.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    headers.set('cookie', cookieString);
  }

  // Add content-type for POST/PATCH requests
  if ((method === 'POST' || method === 'PATCH') && options.body) {
    headers.set('content-type', 'application/json');
  }

  return new Request(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Assert that response is successful (2xx status)
 */
export function assertSuccessResponse(response: Response) {
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
}

/**
 * Assert that response has error (4xx or 5xx status)
 */
export function assertErrorResponse(response: Response, expectedStatus?: number) {
  if (expectedStatus) {
    expect(response.status).toBe(expectedStatus);
  } else {
    expect(response.status).toBeGreaterThanOrEqual(400);
  }
}

/**
 * Parse JSON response body
 */
export async function getResponseBody<T = any>(response: Response): Promise<T> {
  const text = await response.text();
  return JSON.parse(text) as T;
}

// ============================================================================
// DATE HELPERS
// ============================================================================

/**
 * Get date string in YYYY-MM-DD format
 */
export function getDateString(daysFromNow: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Get dates for common test scenarios
 */
export const TestDates = {
  yesterday: getDateString(-1),
  today: getDateString(0),
  tomorrow: getDateString(1),
  nextWeek: getDateString(7),
  nextMonth: getDateString(30),
  nextYear: getDateString(365),
  lastWeek: getDateString(-7),
  lastMonth: getDateString(-30),
};

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Setup and teardown for test suites
 */
export function setupTestDatabase() {
  beforeAll(async () => {
    // Ensure we're in test environment
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Tests must be run in test environment (NODE_ENV=test)');
    }
  });

  afterEach(async () => {
    // Clean up after each test
    await cleanupDatabase();
  });

  afterAll(async () => {
    // Close database connections
    await pool.end();
  });
}
