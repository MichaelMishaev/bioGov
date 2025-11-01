/**
 * Business Profiles API Tests
 * Tests for /api/business-profiles endpoints
 */

import { NextRequest } from 'next/server';
import { GET, POST, PATCH } from '@/app/api/business-profiles/route';
import {
  cleanupDatabase,
  createAuthenticatedTestUser,
  createTestBusinessProfile,
  createMockRequest,
  getResponseBody,
  assertSuccessResponse,
  assertErrorResponse,
  setupTestDatabase,
} from '../helpers/test-utils';

describe('/api/business-profiles', () => {
  setupTestDatabase();

  describe('GET', () => {
    it('should return 401 when not authenticated', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/business-profiles');

      const response = await GET(request as NextRequest);

      assertErrorResponse(response, 401);
      const body = await getResponseBody(response);
      expect(body.error).toBe('Unauthorized');
    });

    it('should return 404 when user has no business profile', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('GET', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertErrorResponse(response, 404);
      const body = await getResponseBody(response);
      expect(body.message).toContain('not found');
    });

    it('should return business profile when authenticated and profile exists', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();
      await createTestBusinessProfile(userId, {
        business_type: 'company',
        vat_status: 'registered',
        industry: 'technology',
        employee_count: 10,
      });

      const request = createMockRequest('GET', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        user_id: userId,
        business_type: 'company',
        vat_status: 'registered',
        industry: 'technology',
        employee_count: 10,
      });
      expect(body.data.id).toBeDefined();
      expect(body.data.created_at).toBeDefined();
    });
  });

  describe('POST', () => {
    it('should return 401 when not authenticated', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/business-profiles', {
        body: {
          business_type: 'sole_proprietor',
          vat_status: 'exempt',
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 401);
    });

    it('should return 400 when required fields are missing', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          // Missing required fields
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('Missing required fields');
    });

    it('should return 400 when business_type is invalid', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          business_type: 'invalid_type',
          vat_status: 'exempt',
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('Invalid business_type');
    });

    it('should return 400 when vat_status is invalid', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          business_type: 'sole_proprietor',
          vat_status: 'invalid_status',
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('Invalid vat_status');
    });

    it('should return 400 when employee_count is negative', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          business_type: 'company',
          vat_status: 'registered',
          employee_count: -5,
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('employee_count');
    });

    it('should return 409 when profile already exists', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();
      await createTestBusinessProfile(userId);

      const request = createMockRequest('POST', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          business_type: 'sole_proprietor',
          vat_status: 'exempt',
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 409);
      const body = await getResponseBody(response);
      expect(body.message).toContain('already exists');
    });

    it('should create business profile with required fields only', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          business_type: 'sole_proprietor',
          vat_status: 'exempt',
        },
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      expect(response.status).toBe(201);

      const body = await getResponseBody(response);
      expect(body.success).toBe(true);
      expect(body.message).toContain('created successfully');
      expect(body.data).toMatchObject({
        user_id: userId,
        business_type: 'sole_proprietor',
        vat_status: 'exempt',
      });
    });

    it('should create business profile with all optional fields', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          business_type: 'company',
          vat_status: 'registered',
          industry: 'technology',
          employee_count: 25,
          fiscal_year_start: '2025-01-01',
          business_established_date: '2020-06-15',
          municipality: 'Tel Aviv',
          metadata: {
            company_number: '123456789',
            notes: 'Test company',
          },
        },
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      expect(response.status).toBe(201);

      const body = await getResponseBody(response);
      expect(body.data).toMatchObject({
        user_id: userId,
        business_type: 'company',
        vat_status: 'registered',
        industry: 'technology',
        employee_count: 25,
        municipality: 'Tel Aviv',
      });
      expect(body.data.metadata).toMatchObject({
        company_number: '123456789',
        notes: 'Test company',
      });
    });
  });

  describe('PATCH', () => {
    it('should return 401 when not authenticated', async () => {
      const request = createMockRequest('PATCH', 'http://localhost:3000/api/business-profiles', {
        body: {
          vat_status: 'registered',
        },
      });

      const response = await PATCH(request as NextRequest);

      assertErrorResponse(response, 401);
    });

    it('should return 400 when body is empty', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('PATCH', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {},
      });

      const response = await PATCH(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('at least one field');
    });

    it('should return 404 when profile does not exist', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('PATCH', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          vat_status: 'registered',
        },
      });

      const response = await PATCH(request as NextRequest);

      assertErrorResponse(response, 404);
      const body = await getResponseBody(response);
      expect(body.message).toContain('not found');
    });

    it('should update single field', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();
      await createTestBusinessProfile(userId, {
        vat_status: 'exempt',
      });

      const request = createMockRequest('PATCH', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          vat_status: 'registered',
        },
      });

      const response = await PATCH(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);
      expect(body.data.vat_status).toBe('registered');
    });

    it('should update multiple fields', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();
      await createTestBusinessProfile(userId);

      const request = createMockRequest('PATCH', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          business_type: 'company',
          vat_status: 'registered',
          industry: 'technology',
          employee_count: 50,
          municipality: 'Jerusalem',
        },
      });

      const response = await PATCH(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);
      expect(body.data).toMatchObject({
        business_type: 'company',
        vat_status: 'registered',
        industry: 'technology',
        employee_count: 50,
        municipality: 'Jerusalem',
      });
    });

    it('should enforce RLS - cannot update other users profiles', async () => {
      // This test verifies that RLS policies prevent cross-user access
      const user1 = await createAuthenticatedTestUser('user1@example.com');
      const user2 = await createAuthenticatedTestUser('user2@example.com');

      await createTestBusinessProfile(user1.userId);

      // Try to update user1's profile with user2's token
      const request = createMockRequest('PATCH', 'http://localhost:3000/api/business-profiles', {
        cookies: { access_token: user2.cookie.split('=')[1] },
        body: {
          vat_status: 'registered',
        },
      });

      const response = await PATCH(request as NextRequest);

      // Should return 404 because RLS filters out user1's profile
      assertErrorResponse(response, 404);
    });
  });
});
