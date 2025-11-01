/**
 * Generate Tasks API Endpoint
 * Automatically generates tasks from templates for a date range
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  setSessionUserId,
  clearSessionUserId,
  createErrorResponse,
  parseRequestBody,
  isValidDate,
  isValidUUID,
} from '@/lib/middleware';
import { query } from '@/lib/db';

// Type definitions
interface GenerateTasksRequest {
  template_id?: string; // Optional: specific template, otherwise use all applicable
  start_date?: string; // Default: today
  end_date?: string; // Default: 1 year from start_date
}

interface GeneratedTask {
  task_id: string;
  due_date: string;
}

/**
 * POST /api/tasks/generate
 * Generate tasks from templates for a specific date range
 *
 * Request Body:
 * - template_id (optional): Generate from specific template only
 * - start_date (optional): Start date for generation (default: today)
 * - end_date (optional): End date for generation (default: 1 year from start)
 *
 * This endpoint uses the database function public.generate_tasks_from_template()
 * which respects business profile applicability filters
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request);

    // Parse request body
    const body = await parseRequestBody<GenerateTasksRequest>(request);

    // Set defaults
    const startDate = body?.start_date || new Date().toISOString().split('T')[0];
    const endDate =
      body?.end_date ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year from now

    // Validate dates
    if (!isValidDate(startDate)) {
      return createErrorResponse('start_date must be a valid date (YYYY-MM-DD)', 400);
    }

    if (!isValidDate(endDate)) {
      return createErrorResponse('end_date must be a valid date (YYYY-MM-DD)', 400);
    }

    // Validate template_id (if provided)
    if (body?.template_id && !isValidUUID(body.template_id)) {
      return createErrorResponse('Invalid template_id format', 400);
    }

    // Ensure start_date is before end_date
    if (new Date(startDate) > new Date(endDate)) {
      return createErrorResponse('start_date must be before end_date', 400);
    }

    // Set session for RLS
    await setSessionUserId(auth.userId);

    // Check if user has a business profile
    const profileCheck = await query(
      `SELECT id FROM public.business_profiles WHERE user_id = $1`,
      [auth.userId]
    );

    if (profileCheck.rows.length === 0) {
      await clearSessionUserId();
      return createErrorResponse(
        'Business profile required. Please create a business profile first.',
        400,
        'Precondition Failed'
      );
    }

    let generatedTasks: GeneratedTask[] = [];

    if (body?.template_id) {
      // Generate from specific template
      const result = await query<GeneratedTask>(
        `SELECT task_id, due_date
         FROM public.generate_tasks_from_template(
           $1::UUID,
           $2::UUID,
           $3::DATE,
           $4::DATE
         )`,
        [body.template_id, auth.userId, startDate, endDate]
      );

      generatedTasks = result.rows;
    } else {
      // Generate from all applicable templates
      // First, get all active templates
      const templatesResult = await query<{ id: string; template_code: string }>(
        `SELECT id, template_code FROM public.task_templates WHERE is_active = TRUE`
      );

      // Generate tasks from each template
      for (const template of templatesResult.rows) {
        try {
          const result = await query<GeneratedTask>(
            `SELECT task_id, due_date
             FROM public.generate_tasks_from_template(
               $1::UUID,
               $2::UUID,
               $3::DATE,
               $4::DATE
             )`,
            [template.id, auth.userId, startDate, endDate]
          );

          generatedTasks.push(...result.rows);
        } catch (error) {
          // Log but continue with other templates
          console.warn(
            `Failed to generate tasks from template ${template.template_code}:`,
            error
          );
        }
      }
    }

    // Fetch full task details for generated tasks
    let tasksDetails = [];
    if (generatedTasks.length > 0) {
      const taskIds = generatedTasks.map((t) => t.task_id);
      const tasksResult = await query(
        `SELECT
          id,
          title,
          description,
          due_date,
          category,
          priority,
          template_id,
          created_at
         FROM public.tasks
         WHERE id = ANY($1::UUID[])
         ORDER BY due_date ASC`,
        [taskIds]
      );

      tasksDetails = tasksResult.rows;
    }

    // Clear session
    await clearSessionUserId();

    return NextResponse.json(
      {
        success: true,
        message: `Successfully generated ${generatedTasks.length} task(s)`,
        data: {
          count: generatedTasks.length,
          tasks: tasksDetails,
          date_range: {
            start_date: startDate,
            end_date: endDate,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    await clearSessionUserId();

    // Handle authentication errors
    if (error instanceof NextResponse) {
      return error;
    }

    console.error('POST /api/tasks/generate error:', error);

    // Check for specific database errors
    const err = error as any;
    if (err?.message?.includes('Template not found')) {
      return createErrorResponse('Template not found', 404, 'Not Found');
    }

    return createErrorResponse(
      'Failed to generate tasks',
      500,
      'Internal Server Error'
    );
  }
}
