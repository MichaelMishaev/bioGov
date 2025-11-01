/**
 * Task Templates API Tests
 * Tests for /api/task-templates endpoints
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/task-templates/route';
import {
  cleanupDatabase,
  createAuthenticatedTestUser,
  createTestBusinessProfile,
  createTestTaskTemplate,
  createMockRequest,
  getResponseBody,
  assertSuccessResponse,
  setupTestDatabase,
} from '../helpers/test-utils';

describe('/api/task-templates', () => {
  setupTestDatabase();

  describe('GET', () => {
    it('should return all active templates when not authenticated', async () => {
      // Create some test templates
      await createTestTaskTemplate({
        template_code: 'TEST_VAT_MONTHLY',
        title_he: 'דוח מע"מ חודשי',
        category: 'vat',
      });

      await createTestTaskTemplate({
        template_code: 'TEST_TAX_ANNUAL',
        title_he: 'דוח שנתי למס הכנסה',
        category: 'income_tax',
      });

      const request = createMockRequest('GET', 'http://localhost:3000/api/task-templates');

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.success).toBe(true);
      expect(body.data.templates.length).toBeGreaterThanOrEqual(2);
      expect(body.data.count).toBeGreaterThanOrEqual(2);
      expect(body.data.personalized).toBe(false);

      // Check grouped structure
      expect(body.data.grouped).toBeDefined();
      expect(body.data.grouped.vat).toBeDefined();
      expect(body.data.grouped.income_tax).toBeDefined();
    });

    it('should filter templates by category', async () => {
      await createTestTaskTemplate({
        template_code: 'TEST_VAT_1',
        category: 'vat',
      });

      await createTestTaskTemplate({
        template_code: 'TEST_TAX_1',
        category: 'income_tax',
      });

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/task-templates?category=vat'
      );

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.templates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ category: 'vat' }),
        ])
      );

      // Should not include other categories
      const hasOtherCategories = body.data.templates.some(
        (t: any) => t.category !== 'vat'
      );
      expect(hasOtherCategories).toBe(false);
    });

    it('should return personalized templates when authenticated', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // Create business profile for registered VAT dealer
      await createTestBusinessProfile(userId, {
        business_type: 'company',
        vat_status: 'registered',
        industry: 'technology',
      });

      // Create templates with different applicability
      await createTestTaskTemplate({
        template_code: 'TEST_REGISTERED_ONLY',
        applies_to_vat_status: ['registered'],
        applies_to_business_types: ['company'],
      });

      await createTestTaskTemplate({
        template_code: 'TEST_EXEMPT_ONLY',
        applies_to_vat_status: ['exempt'],
        applies_to_business_types: ['sole_proprietor'],
      });

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/task-templates?personalized=true',
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.personalized).toBe(true);

      // Should include template for registered dealers
      const hasRegistered = body.data.templates.some(
        (t: any) => t.template_code === 'TEST_REGISTERED_ONLY'
      );
      expect(hasRegistered).toBe(true);

      // Should NOT include template for exempt dealers
      const hasExempt = body.data.templates.some(
        (t: any) => t.template_code === 'TEST_EXEMPT_ONLY'
      );
      expect(hasExempt).toBe(false);
    });

    it('should filter by industry when personalized', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestBusinessProfile(userId, {
        business_type: 'company',
        vat_status: 'registered',
        industry: 'food',
      });

      // Create industry-specific template
      await createTestTaskTemplate({
        template_code: 'TEST_FOOD_ONLY',
        applies_to_vat_status: ['registered'],
        applies_to_business_types: ['company'],
        applies_to_industries: ['food'],
      });

      // Create general template (no industry restriction)
      await createTestTaskTemplate({
        template_code: 'TEST_GENERAL',
        applies_to_vat_status: ['registered'],
        applies_to_business_types: ['company'],
        applies_to_industries: undefined as any,
      });

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/task-templates?personalized=true',
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // Should include both food-specific and general templates
      const hasFoodSpecific = body.data.templates.some(
        (t: any) => t.template_code === 'TEST_FOOD_ONLY'
      );
      const hasGeneral = body.data.templates.some(
        (t: any) => t.template_code === 'TEST_GENERAL'
      );

      expect(hasFoodSpecific).toBe(true);
      expect(hasGeneral).toBe(true);
    });

    it('should return templates sorted by category and priority', async () => {
      await createTestTaskTemplate({
        template_code: 'TEST_LOW_1',
        category: 'vat',
        default_priority: 'low',
      });

      await createTestTaskTemplate({
        template_code: 'TEST_URGENT_1',
        category: 'vat',
        default_priority: 'urgent',
      });

      await createTestTaskTemplate({
        template_code: 'TEST_HIGH_1',
        category: 'vat',
        default_priority: 'high',
      });

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/task-templates?category=vat'
      );

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // Check that urgent comes before high, high before low
      const templates = body.data.templates.filter((t: any) =>
        ['TEST_LOW_1', 'TEST_URGENT_1', 'TEST_HIGH_1'].includes(t.template_code)
      );

      const urgentIndex = templates.findIndex((t: any) => t.template_code === 'TEST_URGENT_1');
      const highIndex = templates.findIndex((t: any) => t.template_code === 'TEST_HIGH_1');
      const lowIndex = templates.findIndex((t: any) => t.template_code === 'TEST_LOW_1');

      expect(urgentIndex).toBeLessThan(highIndex);
      expect(highIndex).toBeLessThan(lowIndex);
    });

    it('should not return inactive templates', async () => {
      // Create inactive template directly with query
      await createTestTaskTemplate({
        template_code: 'TEST_INACTIVE',
        title_he: 'תבנית לא פעילה',
      });

      // Mark it as inactive
      const { query } = await import('@/lib/db');
      await query(
        `UPDATE public.task_templates SET is_active = FALSE WHERE template_code = 'TEST_INACTIVE'`
      );

      const request = createMockRequest('GET', 'http://localhost:3000/api/task-templates');

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // Should not include inactive template
      const hasInactive = body.data.templates.some(
        (t: any) => t.template_code === 'TEST_INACTIVE'
      );
      expect(hasInactive).toBe(false);
    });

    it('should include template metadata', async () => {
      await createTestTaskTemplate({
        template_code: 'TEST_WITH_METADATA',
        title_he: 'תבנית עם מטא-דאטה',
      });

      const request = createMockRequest('GET', 'http://localhost:3000/api/task-templates');

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      const template = body.data.templates.find(
        (t: any) => t.template_code === 'TEST_WITH_METADATA'
      );

      expect(template).toBeDefined();
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('template_code');
      expect(template).toHaveProperty('title_he');
      expect(template).toHaveProperty('description_he');
      expect(template).toHaveProperty('category');
      expect(template).toHaveProperty('default_priority');
      expect(template).toHaveProperty('recurrence_rule');
      expect(template).toHaveProperty('lead_time_days');
      expect(template).toHaveProperty('reminder_days');
      expect(template).toHaveProperty('applies_to_vat_status');
      expect(template).toHaveProperty('applies_to_business_types');
      expect(template).toHaveProperty('metadata');
      expect(template).toHaveProperty('created_at');
      expect(template).toHaveProperty('updated_at');
    });
  });
});
