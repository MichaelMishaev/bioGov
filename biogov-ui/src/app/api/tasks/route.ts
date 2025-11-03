/**
 * Tasks API Endpoints
 * Manages user-specific compliance tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  setSessionUserId,
  clearSessionUserId,
  createErrorResponse,
  parseRequestBody,
  validateRequestBody,
  getQueryParam,
  isValidDate,
  isValidUUID,
} from '@/lib/middleware';
import { query } from '@/lib/db';

// Type definitions
interface Task {
  id: string;
  user_id: string;
  template_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  category: string;
  priority: string;
  completed_at: string | null;
  recurring_pattern: string | null;
  parent_task_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  due_date: string;
  category: string;
  priority?: string;
  recurring_pattern?: string;
  metadata?: Record<string, any>;
}

interface UpdateTaskRequest {
  title?: string;
  description?: string;
  due_date?: string;
  category?: string;
  priority?: string;
  completed_at?: string | null;
  metadata?: Record<string, any>;
}

// Valid enum values
const VALID_CATEGORIES = [
  'vat', 'income_tax', 'social_security', 'license',
  'financial_reports', 'labor_law', 'municipality', 'insurance', 'other'
];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

/**
 * GET /api/tasks
 * Retrieve user's tasks with optional filtering
 *
 * Query Parameters:
 * - filter: 'upcoming' | 'overdue' | 'completed' | 'all' (default: 'all')
 * - category: Filter by category
 * - priority: Filter by priority
 * - from_date: Filter tasks from this date (YYYY-MM-DD)
 * - to_date: Filter tasks until this date (YYYY-MM-DD)
 * - limit: Number of results (default: 100, max: 500)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request);

    // Set session for RLS
    await setSessionUserId(auth.userId);

    // Get query parameters
    const filter = getQueryParam(request, 'filter') || 'all';
    const category = getQueryParam(request, 'category');
    const priority = getQueryParam(request, 'priority');
    const fromDate = getQueryParam(request, 'from_date');
    const toDate = getQueryParam(request, 'to_date');
    const limit = Math.min(parseInt(getQueryParam(request, 'limit') || '100'), 500);
    const offset = parseInt(getQueryParam(request, 'offset') || '0');

    // Validate dates
    if (fromDate && !isValidDate(fromDate)) {
      await clearSessionUserId();
      return createErrorResponse('Invalid from_date format. Use YYYY-MM-DD', 400);
    }

    if (toDate && !isValidDate(toDate)) {
      await clearSessionUserId();
      return createErrorResponse('Invalid to_date format. Use YYYY-MM-DD', 400);
    }

    // Build query
    let queryText = `
      SELECT
        t.id,
        t.user_id,
        t.template_id,
        t.title,
        t.description,
        t.due_date,
        t.category,
        t.priority,
        t.completed_at,
        t.recurring_pattern,
        t.parent_task_id,
        t.metadata,
        t.created_at,
        t.updated_at,
        (t.due_date - CURRENT_DATE) AS days_until_due,
        CASE
          WHEN t.completed_at IS NOT NULL THEN 'completed'
          WHEN t.due_date < CURRENT_DATE THEN 'overdue'
          WHEN t.due_date = CURRENT_DATE THEN 'today'
          WHEN t.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
          WHEN t.due_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'this_month'
          ELSE 'future'
        END AS urgency_status
      FROM public.tasks t
      WHERE t.user_id = $1
    `;

    const queryParams: any[] = [auth.userId];
    let paramIndex = 2;

    // Apply filter
    switch (filter) {
      case 'upcoming':
        queryText += ` AND t.completed_at IS NULL AND t.due_date >= CURRENT_DATE`;
        break;
      case 'overdue':
        queryText += ` AND t.completed_at IS NULL AND t.due_date < CURRENT_DATE`;
        break;
      case 'completed':
        queryText += ` AND t.completed_at IS NOT NULL`;
        break;
      case 'all':
      default:
        // No additional filter
        break;
    }

    // Apply category filter
    if (category) {
      queryText += ` AND t.category = $${paramIndex++}`;
      queryParams.push(category);
    }

    // Apply priority filter
    if (priority) {
      queryText += ` AND t.priority = $${paramIndex++}`;
      queryParams.push(priority);
    }

    // Apply date range filters
    if (fromDate) {
      queryText += ` AND t.due_date >= $${paramIndex++}`;
      queryParams.push(fromDate);
    }

    if (toDate) {
      queryText += ` AND t.due_date <= $${paramIndex++}`;
      queryParams.push(toDate);
    }

    // Order by due date and priority
    queryText += `
      ORDER BY
        t.completed_at NULLS FIRST,
        t.due_date ASC,
        CASE t.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);

    // Execute query
    const result = await query<Task & { days_until_due: number; urgency_status: string }>(
      queryText,
      queryParams
    );

    // Get total count for pagination
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM public.tasks WHERE user_id = $1`,
      [auth.userId]
    );

    // Clear session
    await clearSessionUserId();

    return NextResponse.json({
      success: true,
      data: {
        tasks: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          limit,
          offset,
          hasMore: offset + limit < parseInt(countResult.rows[0].count),
        },
      },
    });
  } catch (error) {
    await clearSessionUserId();

    // Handle authentication errors
    if (error instanceof NextResponse) {
      return error;
    }

    console.error('GET /api/tasks error:', error);
    return createErrorResponse(
      'Failed to fetch tasks',
      500,
      'Internal Server Error'
    );
  }
}

/**
 * POST /api/tasks
 * Create a custom task (not from template)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request);

    // Parse request body
    const body = await parseRequestBody<CreateTaskRequest>(request);

    if (!body) {
      return createErrorResponse('Invalid request body', 400);
    }

    // Validate required fields
    const validation = validateRequestBody<CreateTaskRequest>(body, [
      'title',
      'due_date',
      'category',
    ]);

    if (!validation.valid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing?.join(', ')}`,
        400
      );
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(body.category)) {
      return createErrorResponse(
        `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        400
      );
    }

    // Validate priority (if provided)
    if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
      return createErrorResponse(
        `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`,
        400
      );
    }

    // Validate due_date
    if (!isValidDate(body.due_date)) {
      return createErrorResponse('due_date must be a valid date (YYYY-MM-DD)', 400);
    }

    // Set session for RLS
    await setSessionUserId(auth.userId);

    // Insert task
    const result = await query<Task>(
      `INSERT INTO public.tasks (
        user_id,
        title,
        description,
        due_date,
        category,
        priority,
        recurring_pattern,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        user_id,
        template_id,
        title,
        description,
        due_date,
        category,
        priority,
        completed_at,
        recurring_pattern,
        parent_task_id,
        metadata,
        created_at,
        updated_at`,
      [
        auth.userId,
        body.title,
        body.description || null,
        body.due_date,
        body.category,
        body.priority || 'medium',
        body.recurring_pattern || null,
        body.metadata ? JSON.stringify(body.metadata) : '{}',
      ]
    );

    // Clear session
    await clearSessionUserId();

    return NextResponse.json(
      {
        success: true,
        message: 'Task created successfully',
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    await clearSessionUserId();

    // Handle authentication errors
    if (error instanceof NextResponse) {
      return error;
    }

    console.error('POST /api/tasks error:', error);
    return createErrorResponse(
      'Failed to create task',
      500,
      'Internal Server Error'
    );
  }
}

/**
 * PATCH /api/tasks?id=<task_id>
 * Update a task (e.g., mark as completed, change due date)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request);

    // Get task ID from query parameters
    const taskId = getQueryParam(request, 'id');

    if (!taskId) {
      return createErrorResponse('Task ID is required (query parameter: id)', 400);
    }

    if (!isValidUUID(taskId)) {
      return createErrorResponse('Invalid task ID format', 400);
    }

    // Parse request body
    const body = await parseRequestBody<UpdateTaskRequest>(request);

    if (!body || Object.keys(body).length === 0) {
      return createErrorResponse('Request body must contain at least one field to update', 400);
    }

    // Validate category (if provided)
    if (body.category && !VALID_CATEGORIES.includes(body.category)) {
      return createErrorResponse(
        `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        400
      );
    }

    // Validate priority (if provided)
    if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
      return createErrorResponse(
        `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`,
        400
      );
    }

    // Validate due_date (if provided)
    if (body.due_date && !isValidDate(body.due_date)) {
      return createErrorResponse('due_date must be a valid date (YYYY-MM-DD)', 400);
    }

    // Set session for RLS
    await setSessionUserId(auth.userId);

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }

    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(body.description);
    }

    if (body.due_date !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(body.due_date);
    }

    if (body.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(body.category);
    }

    if (body.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(body.priority);
    }

    if (body.completed_at !== undefined) {
      updates.push(`completed_at = $${paramIndex++}`);
      values.push(body.completed_at);
    }

    if (body.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(body.metadata));
    }

    // Add task_id and user_id for WHERE clause
    values.push(taskId, auth.userId);

    // Execute update
    const result = await query<Task>(
      `UPDATE public.tasks
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
       RETURNING
        id,
        user_id,
        template_id,
        title,
        description,
        due_date,
        category,
        priority,
        completed_at,
        recurring_pattern,
        parent_task_id,
        metadata,
        created_at,
        updated_at`,
      values
    );

    // Clear session
    await clearSessionUserId();

    if (result.rows.length === 0) {
      return createErrorResponse(
        'Task not found or you do not have permission to update it',
        404,
        'Not Found'
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    await clearSessionUserId();

    // Handle authentication errors
    if (error instanceof NextResponse) {
      return error;
    }

    console.error('PATCH /api/tasks error:', error);
    return createErrorResponse(
      'Failed to update task',
      500,
      'Internal Server Error'
    );
  }
}

/**
 * DELETE /api/tasks?id=<task_id>
 * Delete a task
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request);

    // Get task ID from query parameters
    const taskId = getQueryParam(request, 'id');

    if (!taskId) {
      return createErrorResponse('Task ID is required (query parameter: id)', 400);
    }

    if (!isValidUUID(taskId)) {
      return createErrorResponse('Invalid task ID format', 400);
    }

    // Set session for RLS
    await setSessionUserId(auth.userId);

    // Delete task (CASCADE will handle related notifications and history)
    const result = await query<Task>(
      `DELETE FROM public.tasks
       WHERE id = $1 AND user_id = $2
       RETURNING id, title`,
      [taskId, auth.userId]
    );

    // Clear session
    await clearSessionUserId();

    if (result.rows.length === 0) {
      return createErrorResponse(
        'Task not found or you do not have permission to delete it',
        404,
        'Not Found'
      );
    }

    return NextResponse.json({
      success: true,
      message: `Task "${result.rows[0].title}" deleted successfully`,
      data: {
        id: result.rows[0].id,
        title: result.rows[0].title,
      },
    });
  } catch (error) {
    await clearSessionUserId();

    // Handle authentication errors
    if (error instanceof NextResponse) {
      return error;
    }

    console.error('DELETE /api/tasks error:', error);
    return createErrorResponse(
      'Failed to delete task',
      500,
      'Internal Server Error'
    );
  }
}
