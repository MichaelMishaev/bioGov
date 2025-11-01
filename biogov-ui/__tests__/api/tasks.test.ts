/**
 * Tasks API Tests
 * Tests for /api/tasks endpoints (GET, POST, PATCH, DELETE)
 */

import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from '@/app/api/tasks/route';
import {
  cleanupDatabase,
  createAuthenticatedTestUser,
  createTestBusinessProfile,
  createTestTask,
  createMockRequest,
  getResponseBody,
  assertSuccessResponse,
  assertErrorResponse,
  setupTestDatabase,
  TestDates,
} from '../helpers/test-utils';

describe('/api/tasks', () => {
  setupTestDatabase();

  describe('GET', () => {
    it('should return 401 when not authenticated', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/tasks');

      const response = await GET(request as NextRequest);

      assertErrorResponse(response, 401);
    });

    it('should return empty array when user has no tasks', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('GET', 'http://localhost:3000/api/tasks', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.success).toBe(true);
      expect(body.data.tasks).toEqual([]);
      expect(body.data.pagination.total).toBe(0);
    });

    it('should return all user tasks', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestTask(userId, { title: 'Task 1' });
      await createTestTask(userId, { title: 'Task 2' });
      await createTestTask(userId, { title: 'Task 3' });

      const request = createMockRequest('GET', 'http://localhost:3000/api/tasks', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.tasks.length).toBe(3);
      expect(body.data.pagination.total).toBe(3);
    });

    it('should filter upcoming tasks', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestTask(userId, { title: 'Past', due_date: TestDates.yesterday });
      await createTestTask(userId, { title: 'Today', due_date: TestDates.today });
      await createTestTask(userId, { title: 'Future', due_date: TestDates.tomorrow });

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/tasks?filter=upcoming',
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      // Should include today and future, not past
      expect(body.data.tasks.length).toBeGreaterThanOrEqual(2);
      const hasPastTask = body.data.tasks.some((t: any) => t.title === 'Past');
      expect(hasPastTask).toBe(false);
    });

    it('should filter overdue tasks', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestTask(userId, {
        title: 'Overdue',
        due_date: TestDates.yesterday,
        completed_at: null,
      });

      await createTestTask(userId, {
        title: 'Upcoming',
        due_date: TestDates.tomorrow,
        completed_at: null,
      });

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/tasks?filter=overdue',
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.tasks.length).toBe(1);
      expect(body.data.tasks[0].title).toBe('Overdue');
      expect(body.data.tasks[0].urgency_status).toBe('overdue');
    });

    it('should filter completed tasks', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestTask(userId, {
        title: 'Completed',
        completed_at: new Date().toISOString(),
      });

      await createTestTask(userId, {
        title: 'Pending',
        completed_at: null,
      });

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/tasks?filter=completed',
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.tasks.length).toBe(1);
      expect(body.data.tasks[0].title).toBe('Completed');
      expect(body.data.tasks[0].completed_at).not.toBeNull();
    });

    it('should filter by category', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestTask(userId, { title: 'VAT Task', category: 'vat' });
      await createTestTask(userId, { title: 'Tax Task', category: 'income_tax' });

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/tasks?category=vat',
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.tasks.length).toBe(1);
      expect(body.data.tasks[0].category).toBe('vat');
    });

    it('should filter by priority', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestTask(userId, { title: 'Urgent Task', priority: 'urgent' });
      await createTestTask(userId, { title: 'Low Task', priority: 'low' });

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/tasks?priority=urgent',
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.tasks.length).toBe(1);
      expect(body.data.tasks[0].priority).toBe('urgent');
    });

    it('should filter by date range', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestTask(userId, { title: 'Last Week', due_date: TestDates.lastWeek });
      await createTestTask(userId, { title: 'Today', due_date: TestDates.today });
      await createTestTask(userId, { title: 'Next Week', due_date: TestDates.nextWeek });

      const request = createMockRequest(
        'GET',
        `http://localhost:3000/api/tasks?from_date=${TestDates.today}&to_date=${TestDates.nextWeek}`,
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.tasks.length).toBe(2);
      const titles = body.data.tasks.map((t: any) => t.title);
      expect(titles).toContain('Today');
      expect(titles).toContain('Next Week');
      expect(titles).not.toContain('Last Week');
    });

    it('should enforce pagination limits', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      // Create 15 tasks
      for (let i = 0; i < 15; i++) {
        await createTestTask(userId, { title: `Task ${i + 1}` });
      }

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/tasks?limit=10&offset=0',
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.tasks.length).toBe(10);
      expect(body.data.pagination.total).toBe(15);
      expect(body.data.pagination.hasMore).toBe(true);
    });

    it('should include urgency status for each task', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      await createTestTask(userId, { title: 'Overdue', due_date: TestDates.yesterday });
      await createTestTask(userId, { title: 'Today', due_date: TestDates.today });
      await createTestTask(userId, { title: 'This Week', due_date: TestDates.nextWeek });

      const request = createMockRequest('GET', 'http://localhost:3000/api/tasks', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      const overdueTask = body.data.tasks.find((t: any) => t.title === 'Overdue');
      const todayTask = body.data.tasks.find((t: any) => t.title === 'Today');
      const thisWeekTask = body.data.tasks.find((t: any) => t.title === 'This Week');

      expect(overdueTask.urgency_status).toBe('overdue');
      expect(todayTask.urgency_status).toBe('today');
      expect(thisWeekTask.urgency_status).toBe('this_week');
    });

    it('should only return tasks for authenticated user (RLS)', async () => {
      const user1 = await createAuthenticatedTestUser('user1@example.com');
      const user2 = await createAuthenticatedTestUser('user2@example.com');

      await createTestTask(user1.userId, { title: 'User 1 Task' });
      await createTestTask(user2.userId, { title: 'User 2 Task' });

      const request = createMockRequest('GET', 'http://localhost:3000/api/tasks', {
        cookies: { access_token: user1.cookie.split('=')[1] },
      });

      const response = await GET(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);

      expect(body.data.tasks.length).toBe(1);
      expect(body.data.tasks[0].title).toBe('User 1 Task');
    });
  });

  describe('POST', () => {
    it('should return 401 when not authenticated', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks', {
        body: {
          title: 'New Task',
          due_date: TestDates.tomorrow,
          category: 'vat',
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 401);
    });

    it('should return 400 when required fields are missing', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks', {
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

    it('should return 400 when category is invalid', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          title: 'New Task',
          due_date: TestDates.tomorrow,
          category: 'invalid_category',
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('Invalid category');
    });

    it('should return 400 when due_date is invalid', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          title: 'New Task',
          due_date: 'invalid-date',
          category: 'vat',
        },
      });

      const response = await POST(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('valid date');
    });

    it('should create task with required fields only', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          title: 'New Task',
          due_date: TestDates.tomorrow,
          category: 'vat',
        },
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      expect(response.status).toBe(201);

      const body = await getResponseBody(response);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        user_id: userId,
        title: 'New Task',
        due_date: TestDates.tomorrow,
        category: 'vat',
        priority: 'medium', // Default priority
      });
      expect(body.data.id).toBeDefined();
    });

    it('should create task with all optional fields', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('POST', 'http://localhost:3000/api/tasks', {
        cookies: { access_token: cookie.split('=')[1] },
        body: {
          title: 'Detailed Task',
          description: 'Task with all fields',
          due_date: TestDates.nextMonth,
          category: 'income_tax',
          priority: 'urgent',
          recurring_pattern: 'FREQ=MONTHLY;BYMONTHDAY=15',
          metadata: {
            notes: 'Important task',
            reference_number: '12345',
          },
        },
      });

      const response = await POST(request as NextRequest);

      assertSuccessResponse(response);
      expect(response.status).toBe(201);

      const body = await getResponseBody(response);
      expect(body.data).toMatchObject({
        user_id: userId,
        title: 'Detailed Task',
        description: 'Task with all fields',
        category: 'income_tax',
        priority: 'urgent',
        recurring_pattern: 'FREQ=MONTHLY;BYMONTHDAY=15',
      });
      expect(body.data.metadata).toMatchObject({
        notes: 'Important task',
        reference_number: '12345',
      });
    });
  });

  describe('PATCH', () => {
    it('should return 401 when not authenticated', async () => {
      const request = createMockRequest(
        'PATCH',
        'http://localhost:3000/api/tasks?id=00000000-0000-0000-0000-000000000000',
        {
          body: { title: 'Updated' },
        }
      );

      const response = await PATCH(request as NextRequest);

      assertErrorResponse(response, 401);
    });

    it('should return 400 when task ID is missing', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('PATCH', 'http://localhost:3000/api/tasks', {
        cookies: { access_token: cookie.split('=')[1] },
        body: { title: 'Updated' },
      });

      const response = await PATCH(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('Task ID is required');
    });

    it('should return 400 when task ID is invalid UUID', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest(
        'PATCH',
        'http://localhost:3000/api/tasks?id=invalid-uuid',
        {
          cookies: { access_token: cookie.split('=')[1] },
          body: { title: 'Updated' },
        }
      );

      const response = await PATCH(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('Invalid task ID format');
    });

    it('should return 400 when body is empty', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest(
        'PATCH',
        'http://localhost:3000/api/tasks?id=00000000-0000-0000-0000-000000000000',
        {
          cookies: { access_token: cookie.split('=')[1] },
          body: {},
        }
      );

      const response = await PATCH(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('at least one field');
    });

    it('should return 404 when task does not exist', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest(
        'PATCH',
        'http://localhost:3000/api/tasks?id=00000000-0000-0000-0000-000000000000',
        {
          cookies: { access_token: cookie.split('=')[1] },
          body: { title: 'Updated' },
        }
      );

      const response = await PATCH(request as NextRequest);

      assertErrorResponse(response, 404);
    });

    it('should update single field', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();
      const task = await createTestTask(userId, { title: 'Original Title' });

      const request = createMockRequest(
        'PATCH',
        `http://localhost:3000/api/tasks?id=${task.id}`,
        {
          cookies: { access_token: cookie.split('=')[1] },
          body: { title: 'Updated Title' },
        }
      );

      const response = await PATCH(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);
      expect(body.data.title).toBe('Updated Title');
    });

    it('should update multiple fields', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();
      const task = await createTestTask(userId);

      const request = createMockRequest(
        'PATCH',
        `http://localhost:3000/api/tasks?id=${task.id}`,
        {
          cookies: { access_token: cookie.split('=')[1] },
          body: {
            title: 'Updated',
            description: 'New description',
            priority: 'urgent',
            due_date: TestDates.nextWeek,
          },
        }
      );

      const response = await PATCH(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);
      expect(body.data).toMatchObject({
        title: 'Updated',
        description: 'New description',
        priority: 'urgent',
        due_date: TestDates.nextWeek,
      });
    });

    it('should mark task as completed', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();
      const task = await createTestTask(userId);

      const completedAt = new Date().toISOString();

      const request = createMockRequest(
        'PATCH',
        `http://localhost:3000/api/tasks?id=${task.id}`,
        {
          cookies: { access_token: cookie.split('=')[1] },
          body: { completed_at: completedAt },
        }
      );

      const response = await PATCH(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);
      expect(body.data.completed_at).toBeDefined();
    });

    it('should enforce RLS - cannot update other users tasks', async () => {
      const user1 = await createAuthenticatedTestUser('user1@example.com');
      const user2 = await createAuthenticatedTestUser('user2@example.com');

      const task = await createTestTask(user1.userId);

      // Try to update user1's task with user2's token
      const request = createMockRequest(
        'PATCH',
        `http://localhost:3000/api/tasks?id=${task.id}`,
        {
          cookies: { access_token: user2.cookie.split('=')[1] },
          body: { title: 'Hacked!' },
        }
      );

      const response = await PATCH(request as NextRequest);

      // Should return 404 because RLS filters out user1's task
      assertErrorResponse(response, 404);
    });
  });

  describe('DELETE', () => {
    it('should return 401 when not authenticated', async () => {
      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/tasks?id=00000000-0000-0000-0000-000000000000'
      );

      const response = await DELETE(request as NextRequest);

      assertErrorResponse(response, 401);
    });

    it('should return 400 when task ID is missing', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest('DELETE', 'http://localhost:3000/api/tasks', {
        cookies: { access_token: cookie.split('=')[1] },
      });

      const response = await DELETE(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('Task ID is required');
    });

    it('should return 400 when task ID is invalid UUID', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/tasks?id=invalid-uuid',
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await DELETE(request as NextRequest);

      assertErrorResponse(response, 400);
      const body = await getResponseBody(response);
      expect(body.message).toContain('Invalid task ID format');
    });

    it('should return 404 when task does not exist', async () => {
      const { cookie } = await createAuthenticatedTestUser();

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/tasks?id=00000000-0000-0000-0000-000000000000',
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await DELETE(request as NextRequest);

      assertErrorResponse(response, 404);
    });

    it('should delete task successfully', async () => {
      const { userId, cookie } = await createAuthenticatedTestUser();
      const task = await createTestTask(userId, { title: 'To Delete' });

      const request = createMockRequest(
        'DELETE',
        `http://localhost:3000/api/tasks?id=${task.id}`,
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      const response = await DELETE(request as NextRequest);

      assertSuccessResponse(response);
      const body = await getResponseBody(response);
      expect(body.success).toBe(true);
      expect(body.message).toContain('deleted successfully');
      expect(body.data.id).toBe(task.id);
      expect(body.data.title).toBe('To Delete');
    });

    it('should enforce RLS - cannot delete other users tasks', async () => {
      const user1 = await createAuthenticatedTestUser('user1@example.com');
      const user2 = await createAuthenticatedTestUser('user2@example.com');

      const task = await createTestTask(user1.userId);

      // Try to delete user1's task with user2's token
      const request = createMockRequest(
        'DELETE',
        `http://localhost:3000/api/tasks?id=${task.id}`,
        {
          cookies: { access_token: user2.cookie.split('=')[1] },
        }
      );

      const response = await DELETE(request as NextRequest);

      // Should return 404 because RLS filters out user1's task
      assertErrorResponse(response, 404);
    });

    it('should cascade delete related notifications', async () => {
      const { query } = await import('@/lib/db');
      const { userId, cookie } = await createAuthenticatedTestUser();
      const task = await createTestTask(userId);

      // Create a notification for the task
      await query(
        `INSERT INTO public.notifications (task_id, user_id, notification_type, scheduled_at)
         VALUES ($1, $2, 'email', NOW() + INTERVAL '1 day')`,
        [task.id, userId]
      );

      // Delete the task
      const request = createMockRequest(
        'DELETE',
        `http://localhost:3000/api/tasks?id=${task.id}`,
        {
          cookies: { access_token: cookie.split('=')[1] },
        }
      );

      await DELETE(request as NextRequest);

      // Verify notification was deleted (CASCADE)
      const notificationCheck = await query(
        `SELECT COUNT(*) as count FROM public.notifications WHERE task_id = $1`,
        [task.id]
      );

      expect(parseInt(notificationCheck.rows[0].count)).toBe(0);
    });
  });
});
