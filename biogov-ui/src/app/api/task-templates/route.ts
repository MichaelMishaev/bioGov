/**
 * Task Templates API Endpoints
 * Manages compliance task templates for Israeli businesses
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthContext,
  setSessionUserId,
  clearSessionUserId,
  createErrorResponse,
  getQueryParam,
} from '@/lib/middleware';
import { query } from '@/lib/db';

// Type definitions
interface TaskTemplate {
  id: string;
  template_code: string;
  title_he: string;
  description_he: string;
  category: string;
  default_priority: string;
  recurrence_rule: string;
  lead_time_days: number;
  reminder_days: number[];
  applies_to_vat_status: string[];
  applies_to_business_types: string[];
  applies_to_industries: string[] | null;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface BusinessProfile {
  business_type: string;
  vat_status: string;
  industry: string | null;
}

/**
 * GET /api/task-templates
 * Retrieve all active task templates
 *
 * Query Parameters:
 * - category: Filter by category (vat, income_tax, social_security, etc.)
 * - personalized: If true, filter by user's business profile (requires auth)
 *
 * Public endpoint - authentication optional
 * If authenticated and personalized=true, returns only applicable templates
 */
export async function GET(request: NextRequest) {
  try {
    // Optional authentication
    const auth = await getAuthContext(request);

    // Get query parameters
    const category = getQueryParam(request, 'category');
    const personalized = getQueryParam(request, 'personalized') === 'true';

    let businessProfile: BusinessProfile | null = null;

    // If personalized filtering requested, fetch user's business profile
    if (personalized && auth) {
      await setSessionUserId(auth.userId);

      const profileResult = await query<BusinessProfile>(
        `SELECT business_type, vat_status, industry
         FROM public.business_profiles
         WHERE user_id = $1`,
        [auth.userId]
      );

      if (profileResult.rows.length > 0) {
        businessProfile = profileResult.rows[0];
      }

      await clearSessionUserId();
    }

    // Build query
    let queryText = `
      SELECT
        id,
        template_code,
        title_he,
        description_he,
        category,
        default_priority,
        recurrence_rule,
        lead_time_days,
        reminder_days,
        applies_to_vat_status,
        applies_to_business_types,
        applies_to_industries,
        is_active,
        metadata,
        created_at,
        updated_at
      FROM public.task_templates
      WHERE is_active = TRUE
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    // Filter by category if provided
    if (category) {
      queryText += ` AND category = $${paramIndex++}`;
      queryParams.push(category);
    }

    // Add personalized filtering
    if (businessProfile) {
      // Filter by VAT status
      queryText += ` AND $${paramIndex++} = ANY(applies_to_vat_status)`;
      queryParams.push(businessProfile.vat_status);

      // Filter by business type
      queryText += ` AND $${paramIndex++} = ANY(applies_to_business_types)`;
      queryParams.push(businessProfile.business_type);

      // Filter by industry (if specified in template)
      if (businessProfile.industry) {
        queryText += ` AND (
          applies_to_industries IS NULL
          OR $${paramIndex++} = ANY(applies_to_industries)
        )`;
        queryParams.push(businessProfile.industry);
      } else {
        queryText += ` AND applies_to_industries IS NULL`;
      }
    }

    // Order by category and priority
    queryText += `
      ORDER BY
        CASE category
          WHEN 'vat' THEN 1
          WHEN 'income_tax' THEN 2
          WHEN 'social_security' THEN 3
          WHEN 'license' THEN 4
          WHEN 'financial_reports' THEN 5
          WHEN 'labor_law' THEN 6
          WHEN 'municipality' THEN 7
          WHEN 'insurance' THEN 8
          ELSE 9
        END,
        CASE default_priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END,
        title_he ASC
    `;

    // Execute query
    const result = await query<TaskTemplate>(queryText, queryParams);

    // Group by category for better organization
    const templatesByCategory: Record<string, TaskTemplate[]> = {};

    for (const template of result.rows) {
      if (!templatesByCategory[template.category]) {
        templatesByCategory[template.category] = [];
      }
      templatesByCategory[template.category].push(template);
    }

    return NextResponse.json({
      success: true,
      data: {
        templates: result.rows,
        grouped: templatesByCategory,
        count: result.rows.length,
        personalized: !!businessProfile,
      },
    });
  } catch (error) {
    await clearSessionUserId();

    console.error('GET /api/task-templates error:', error);
    return createErrorResponse(
      'Failed to fetch task templates',
      500,
      'Internal Server Error'
    );
  }
}
