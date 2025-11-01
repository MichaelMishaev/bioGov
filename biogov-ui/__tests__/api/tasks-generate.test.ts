/**
 * Task Generation API Tests
 * Tests for /api/tasks/generate endpoint
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/tasks/generate/route';
import {
  cleanupDatabase,
  createAuthenticatedTestUser,
  createTestBusinessProfile,
  createTestTaskTemplate,
  createMockRequest,
  getResponseBody,
  assertSuccessResponse,
  assertErrorResponse,
  setupTestDatabase,
  TestDates,
} from '../helpers/test-utils';

describe('/api/tasks/generate', () => {
  setupTestDatabase();

  describe('POST', () => {
    it('should return 401 when not authenticated', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        body: {},
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 401);
    });

    it('should return 400 when user has no business profile', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {},
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('Business profile required');
    });

    it('should return 400 when start_date is invalid', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();
      await createTestBusinessProfile(userId);

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          start_date: 'invalid-date',
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('start_date must be a valid date');
    });

    it('should return 400 when start_date is after end_date', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();
      await createTestBusinessProfile(userId);

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          start_date: TestDates.nextMonth,
          end_date: TestDates.today,
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('start_date must be before end_date');
    });

    it('should generate tasks from all applicable templates', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestBusinessProfile(userId, {
        business_type: 'company',
        vat_status: 'registered',
      });

      // Create template that applies to registered companies
      await createTestTaskTemplate({
        template_code: 'TEST_MONTHLY_VAT',
        title_he: 'דוח מע"מ חודשי',
        category: 'vat',
        recurrence_rule: 'FREQ=MONTHLY;BYMONTHDAY=15',
        applies_to_vat_status: ['registered'],
        applies_to_business_types: ['company'],
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          start_date: '2025-11-01',
          end_date: '2026-01-31', // 3 months -> should generate 3 tasks
        },
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      expect(response.status).toBe(201);

      const body = await getResponseBody(response);
      expect(body.success).toBe(true);
      expect(body.data.count).toBeGreaterThanOrEqual(3);
      expect(body.data.tasks.length).toBeGreaterThanOrEqual(3);

      // Check that tasks were generated with correct dates
      const taskDates = body.data.tasks.map((t: any) => t.due_date).sort();
      expect(taskDates).toContain('2025-11-15');
      expect(taskDates).toContain('2025-12-15');
      expect(taskDates).toContain('2026-01-15');
    });

    it('should generate tasks from specific template only', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestBusinessProfile(userId, {
        business_type: 'company',
        vat_status: 'registered',
      });

      // Create multiple templates
      const template1 = await createTestTaskTemplate({
        template_code: 'TEST_SPECIFIC',
        recurrence_rule: 'FREQ=MONTHLY;BYMONTHDAY=15',
        applies_to_vat_status: ['registered'],
        applies_to_business_types: ['company'],
      });

      await createTestTaskTemplate({
        template_code: 'TEST_OTHER',
        recurrence_rule: 'FREQ=MONTHLY;BYMONTHDAY=20',
        applies_to_vat_status: ['registered'],
        applies_to_business_types: ['company'],
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          template_id: template1.id,
          start_date: '2025-11-01',
          end_date: '2025-12-31',
        },
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // All generated tasks should be from the specified template
      const allFromTemplate = body.data.tasks.every(
        (t: any) => t.template_id === template1.id
      );
      expect(allFromTemplate).toBe(true);
    });

    it('should not generate tasks from templates that do not apply', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // User is exempt dealer
      await createTestBusinessProfile(userId, {
        business_type: 'sole_proprietor',
        vat_status: 'exempt',
      });

      // Create template only for registered dealers
      await createTestTaskTemplate({
        template_code: 'TEST_REGISTERED_ONLY',
        applies_to_vat_status: ['registered'], // Does not apply to exempt
        applies_to_business_types: ['sole_proprietor', 'company'],
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          start_date: '2025-11-01',
          end_date: '2026-01-31',
        },
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // Should not generate any tasks from the template
      const hasRegisteredOnlyTasks = body.data.tasks.some(
        (t: any) => t.title && t.title.includes('REGISTERED')
      );
      expect(hasRegisteredOnlyTasks).toBe(false);
    });

    it('should filter by business type', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // User is sole proprietor
      await createTestBusinessProfile(userId, {
        business_type: 'sole_proprietor',
        vat_status: 'registered',
      });

      // Create template only for companies
      await createTestTaskTemplate({
        template_code: 'TEST_COMPANY_ONLY',
        title_he: 'דוח כספי שנתי',
        applies_to_vat_status: ['registered'],
        applies_to_business_types: ['company'], // Does not apply to sole_proprietor
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {},
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // Should not generate company-only tasks
      const hasCompanyOnlyTasks = body.data.tasks.some(
        (t: any) => t.title && t.title.includes('כספי')
      );
      expect(hasCompanyOnlyTasks).toBe(false);
    });

    it('should filter by industry if specified in template', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // User is in technology industry
      await createTestBusinessProfile(userId, {
        business_type: 'company',
        vat_status: 'registered',
        industry: 'technology',
      });

      // Create food-industry specific template
      await createTestTaskTemplate({
        template_code: 'TEST_FOOD_ONLY',
        title_he: 'רישיון משרד הבריאות',
        applies_to_vat_status: ['registered'],
        applies_to_business_types: ['company'],
        applies_to_industries: ['food'], // Does not apply to technology
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {},
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // Should not generate food-only tasks
      const hasFoodOnlyTasks = body.data.tasks.some(
        (t: any) => t.title && t.title.includes('משרד הבריאות')
      );
      expect(hasFoodOnlyTasks).toBe(false);
    });

    it('should use default date range when not specified', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestBusinessProfile(userId);

      await createTestTaskTemplate({
        template_code: 'TEST_DEFAULT_RANGE',
        recurrence_rule: 'FREQ=MONTHLY;BYMONTHDAY=1',
        applies_to_vat_status: ['registered', 'exempt'],
        applies_to_business_types: ['sole_proprietor'],
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {},
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // Default is 1 year, so should generate ~12 monthly tasks
      expect(body.data.count).toBeGreaterThanOrEqual(10);
      expect(body.data.date_range).toBeDefined();
      expect(body.data.date_range.start_date).toBeDefined();
      expect(body.data.date_range.end_date).toBeDefined();
    });

    it('should include task details in response', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestBusinessProfile(userId);

      await createTestTaskTemplate({
        template_code: 'TEST_DETAILS',
        title_he: 'משימת בדיקה',
        category: 'vat',
        default_priority: 'high',
        recurrence_rule: 'FREQ=MONTHLY;BYMONTHDAY=15',
        applies_to_vat_status: ['registered', 'exempt'],
        applies_to_business_types: ['sole_proprietor'],
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          start_date: '2025-11-01',
          end_date: '2025-11-30',
        },
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.tasks.length).toBeGreaterThan(0);

      const task = body.data.tasks[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('due_date');
      expect(task).toHaveProperty('category');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('template_id');
      expect(task).toHaveProperty('created_at');
    });

    it('should return 404 when template_id does not exist', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestBusinessProfile(userId);

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          template_id: '00000000-0000-0000-0000-000000000000',
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 404);
      const body = await getResponseBody(response);
      expect(body.message).toContain('Template not found');
    });

    it('should handle yearly recurrence correctly', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestBusinessProfile(userId);

      await createTestTaskTemplate({
        template_code: 'TEST_YEARLY',
        title_he: 'דוח שנתי',
        recurrence_rule: 'FREQ=YEARLY;BYMONTH=4;BYMONTHDAY=30',
        applies_to_vat_status: ['registered', 'exempt'],
        applies_to_business_types: ['sole_proprietor'],
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks/generate', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          start_date: '2025-01-01',
          end_date: '2027-12-31', // 3 years
        },
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // Should generate tasks for April 30 of each year
      const yearlyTasks = body.data.tasks.filter((t: any) =>
        t.title.includes('שנתי')
      );

      expect(yearlyTasks.length).toBeGreaterThanOrEqual(3);

      const taskDates = yearlyTasks.map((t: any) => t.due_date).sort();
      expect(taskDates).toContain('2025-04-30');
      expect(taskDates).toContain('2026-04-30');
      expect(taskDates).toContain('2027-04-30');
    });
  });
});
