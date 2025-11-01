/**
 * Compliance Score API Tests
 * Tests for /api/compliance/score endpoint
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/compliance/score/route';
import {
  cleanupDatabase,
  createAuthenticatedTestUser,
  createTestTask,
  createMockRequest,
  getResponseBody,
  assertSuccessResponse,
  assertErrorResponse,
  setupTestDatabase,
  TestDates,
} from '../helpers/test-utils';

describe('/api/compliance/score', () => {
  setupTestDatabase();

  describe('GET', () => {
    it('should return 401 when not authenticated', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score');

      const response = await GET(request as NextRequest);

      assertErrorResponse(response, 401);
    });

    it('should return perfect score (100) for new user with no tasks', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.success).toBe(true);
      expect(body.data.score.score).toBe(100);
      expect(body.data.score.grade).toBe('A+');
      expect(body.data.statistics).toMatchObject({
        total_tasks: 0,
        completed_tasks: 0,
        pending_tasks: 0,
        overdue_tasks: 0,
      });
    });

    it('should calculate score correctly with all tasks completed on time', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // Create 5 tasks, all completed on time
      const completedDate = new Date(TestDates.yesterday).toISOString();
      for (let i = 0; i < 5; i++) {
        await createTestTask(userId, {
          title: `Task ${i + 1}`,
          due_date: TestDates.today,
          completed_at: completedDate, // Completed before due date
        });
      }

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.score.score).toBe(100);
      expect(body.data.score.grade).toBe('A+');
      expect(body.data.statistics).toMatchObject({
        total_tasks: 5,
        completed_tasks: 5,
        pending_tasks: 0,
        overdue_tasks: 0,
        completed_on_time: 5,
        completed_late: 0,
        on_time_rate: 100,
      });
    });

    it('should penalize score for late completions', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // Create tasks with some late completions
      await createTestTask(userId, {
        title: 'On Time 1',
        due_date: '2025-10-01',
        completed_at: '2025-09-30T10:00:00Z', // On time
      });

      await createTestTask(userId, {
        title: 'Late 1',
        due_date: '2025-10-01',
        completed_at: '2025-10-05T10:00:00Z', // 4 days late
      });

      await createTestTask(userId, {
        title: 'Late 2',
        due_date: '2025-10-10',
        completed_at: '2025-10-15T10:00:00Z', // 5 days late
      });

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // Score should be less than 100 due to late completions
      expect(body.data.score.score).toBeLessThan(100);
      expect(body.data.statistics.completed_on_time).toBe(1);
      expect(body.data.statistics.completed_late).toBe(2);
      expect(body.data.statistics.on_time_rate).toBeCloseTo(33.33, 1); // 1/3 = 33.33%
    });

    it('should show overdue tasks in statistics', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // Create overdue tasks
      await createTestTask(userId, {
        title: 'Overdue 1',
        due_date: TestDates.lastWeek,
        completed_at: null,
      });

      await createTestTask(userId, {
        title: 'Overdue 2',
        due_date: TestDates.yesterday,
        completed_at: null,
      });

      // Create upcoming task
      await createTestTask(userId, {
        title: 'Upcoming',
        due_date: TestDates.tomorrow,
        completed_at: null,
      });

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.statistics).toMatchObject({
        total_tasks: 3,
        completed_tasks: 0,
        pending_tasks: 3,
        overdue_tasks: 2,
      });
    });

    it('should provide category breakdown', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // Create tasks in different categories
      await createTestTask(userId, {
        title: 'VAT Task 1',
        category: 'vat',
        completed_at: new Date().toISOString(),
      });

      await createTestTask(userId, {
        title: 'VAT Task 2',
        category: 'vat',
        completed_at: null,
      });

      await createTestTask(userId, {
        title: 'Tax Task 1',
        category: 'income_tax',
        completed_at: new Date().toISOString(),
      });

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.category_breakdown).toBeInstanceOf(Array);
      expect(body.data.category_breakdown.length).toBeGreaterThan(0);

      const vatCategory = body.data.category_breakdown.find(
        (c: any) => c.category === 'vat'
      );

      expect(vatCategory).toBeDefined();
      expect(vatCategory.total).toBe(2);
      expect(vatCategory.completed).toBe(1);
      expect(vatCategory.completion_rate).toBeCloseTo(50, 0);
    });

    it('should track recent activity', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // Recent completions (last 30 days)
      await createTestTask(userId, {
        title: 'Recent 1',
        completed_at: new Date().toISOString(),
      });

      await createTestTask(userId, {
        title: 'Recent 2',
        completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      });

      // Upcoming this week
      await createTestTask(userId, {
        title: 'This Week',
        due_date: TestDates.nextWeek,
        completed_at: null,
      });

      // Upcoming this month
      await createTestTask(userId, {
        title: 'This Month',
        due_date: TestDates.nextMonth,
        completed_at: null,
      });

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.recent_activity).toBeDefined();
      expect(body.data.recent_activity.recent_completions).toBe(2);
      expect(body.data.recent_activity.upcoming_this_week).toBeGreaterThanOrEqual(1);
      expect(body.data.recent_activity.upcoming_this_month).toBeGreaterThanOrEqual(2);
    });

    it('should return grade A+ for 97-100% score', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // Perfect record
      for (let i = 0; i < 10; i++) {
        await createTestTask(userId, {
          title: `Task ${i + 1}`,
          due_date: `2025-10-${String(i + 1).padStart(2, '0')}`,
          completed_at: `2025-10-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
        });
      }

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.score.score).toBeGreaterThanOrEqual(97);
      expect(body.data.score.grade).toBe('A+');
      expect(body.data.score.description).toContain('Excellent');
    });

    it('should return appropriate grade for lower scores', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // Mixed record: some on time, some late
      for (let i = 0; i < 5; i++) {
        await createTestTask(userId, {
          title: `On Time ${i + 1}`,
          due_date: `2025-10-${String(i + 1).padStart(2, '0')}`,
          completed_at: `2025-10-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
        });
      }

      for (let i = 5; i < 10; i++) {
        await createTestTask(userId, {
          title: `Late ${i + 1}`,
          due_date: `2025-10-${String(i + 1).padStart(2, '0')}`,
          completed_at: `2025-10-${String(i + 5).padStart(2, '0')}T10:00:00Z`, // 4+ days late
        });
      }

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // 50% on-time rate should result in a lower grade
      expect(body.data.score.score).toBeLessThan(90);
      expect(['B+', 'B', 'B-', 'C+', 'C', 'C-']).toContain(body.data.score.grade);
    });

    it('should include streak information', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // All tasks completed (no overdue)
      await createTestTask(userId, {
        title: 'Completed',
        completed_at: new Date().toISOString(),
      });

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.streak).toBeDefined();
      expect(body.data.streak.current).toBeDefined();
      expect(body.data.streak.longest).toBeDefined();
    });

    it('should show zero current streak when there are overdue tasks', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // Create overdue task
      await createTestTask(userId, {
        title: 'Overdue',
        due_date: TestDates.yesterday,
        completed_at: null,
      });

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.streak.current).toBe(0);
    });

    it('should only consider tasks from last year for score calculation', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // Old task (>1 year ago) - should not affect score
      await createTestTask(userId, {
        title: 'Very Old',
        due_date: '2023-01-01',
        completed_at: '2023-01-15T10:00:00Z', // Late but old
      });

      // Recent task (within 1 year) - should affect score
      await createTestTask(userId, {
        title: 'Recent',
        due_date: TestDates.lastWeek,
        completed_at: TestDates.lastWeek + 'T10:00:00Z',
      });

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // Score calculation should only consider recent tasks
      // The response should include all tasks in statistics but score should be based on recent
      expect(body.data.score.score).toBe(100); // 1 task on time = 100%
    });

    it('should handle edge case of all tasks overdue', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // All tasks overdue
      for (let i = 0; i < 5; i++) {
        await createTestTask(userId, {
          title: `Overdue ${i + 1}`,
          due_date: TestDates.lastWeek,
          completed_at: null,
        });
      }

      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.statistics.overdue_tasks).toBe(5);
      expect(body.data.statistics.completed_tasks).toBe(0);
      expect(body.data.streak.current).toBe(0);
    });

    it('should enforce RLS - only show score for authenticated user', async () => {
      const user1 = await createAuthenticatedTestUser('user1@example.com');
      const user2 = await createAuthenticatedTestUser('user2@example.com');

      // Create tasks for user1
      await createTestTask(user1.userId, { title: 'User 1 Task' });

      // Request score with user2's token
      const request = createMockRequest('GET', 'http://localhost:3000/api/compliance/score', {
        cookies: { access_token: user2.cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // User2 should have 0 tasks (RLS enforced)
      expect(body.data.statistics.total_tasks).toBe(0);
    });
  });
});
