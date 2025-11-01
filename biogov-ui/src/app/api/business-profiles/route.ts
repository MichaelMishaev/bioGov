/**
 * Business Profiles API Endpoints
 * Manages user business profile information for compliance personalization
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  setSessionUserId,
  clearSessionUserId,
  createErrorResponse,
  parseRequestBody,
  validateRequestBody,
  isValidDate,
} from '@/lib/middleware';
import { query } from '@/lib/db';

// Type definitions
interface BusinessProfile {
  id: string;
  user_id: string;
  business_type: 'sole_proprietor' | 'partnership' | 'company' | 'nonprofit' | 'cooperative';
  vat_status: 'exempt' | 'registered' | 'pending';
  industry?: string;
  employee_count?: number;
  fiscal_year_start?: string;
  business_established_date?: string;
  municipality?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface CreateProfileRequest {
  business_type: string;
  vat_status: string;
  industry?: string;
  employee_count?: number;
  fiscal_year_start?: string;
  business_established_date?: string;
  municipality?: string;
  metadata?: Record<string, any>;
}

interface UpdateProfileRequest {
  business_type?: string;
  vat_status?: string;
  industry?: string;
  employee_count?: number;
  fiscal_year_start?: string;
  business_established_date?: string;
  municipality?: string;
  metadata?: Record<string, any>;
}

// Valid enum values
const VALID_BUSINESS_TYPES = ['sole_proprietor', 'partnership', 'company', 'nonprofit', 'cooperative'];
const VALID_VAT_STATUS = ['exempt', 'registered', 'pending'];
const VALID_INDUSTRIES = [
  'retail', 'services', 'technology', 'food', 'healthcare',
  'construction', 'education', 'finance', 'manufacturing', 'agriculture', 'other'
];

/**
 * GET /api/business-profiles
 * Retrieve the authenticated user's business profile
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request);

    // Set session for RLS
    await setSessionUserId(auth.userId);

    // Fetch business profile
    const result = await query<BusinessProfile>(
      `SELECT
        id,
        user_id,
        business_type,
        vat_status,
        industry,
        employee_count,
        fiscal_year_start,
        business_established_date,
        municipality,
        metadata,
        created_at,
        updated_at
      FROM public.business_profiles
      WHERE user_id = $1`,
      [auth.userId]
    );

    // Clear session
    await clearSessionUserId();

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Business profile not found. Please create one first.',
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    await clearSessionUserId();

    // Handle authentication errors
    if (error instanceof NextResponse) {
      return error;
    }

    console.error('GET /api/business-profiles error:', error);
    return createErrorResponse(
      'Failed to fetch business profile',
      500,
      'Internal Server Error'
    );
  }
}

/**
 * POST /api/business-profiles
 * Create a new business profile for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request);

    // Parse request body
    const body = await parseRequestBody<CreateProfileRequest>(request);

    if (!body) {
      return createErrorResponse('Invalid request body', 400);
    }

    // Validate required fields
    const validation = validateRequestBody<CreateProfileRequest>(body, [
      'business_type',
      'vat_status',
    ]);

    if (!validation.valid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing?.join(', ')}`,
        400
      );
    }

    // Validate business_type
    if (!VALID_BUSINESS_TYPES.includes(body.business_type)) {
      return createErrorResponse(
        `Invalid business_type. Must be one of: ${VALID_BUSINESS_TYPES.join(', ')}`,
        400
      );
    }

    // Validate vat_status
    if (!VALID_VAT_STATUS.includes(body.vat_status)) {
      return createErrorResponse(
        `Invalid vat_status. Must be one of: ${VALID_VAT_STATUS.join(', ')}`,
        400
      );
    }

    // Validate industry (if provided)
    if (body.industry && !VALID_INDUSTRIES.includes(body.industry)) {
      return createErrorResponse(
        `Invalid industry. Must be one of: ${VALID_INDUSTRIES.join(', ')}`,
        400
      );
    }

    // Validate employee_count (if provided)
    if (body.employee_count !== undefined) {
      if (typeof body.employee_count !== 'number' || body.employee_count < 0) {
        return createErrorResponse('employee_count must be a non-negative number', 400);
      }
    }

    // Validate dates (if provided)
    if (body.fiscal_year_start && !isValidDate(body.fiscal_year_start)) {
      return createErrorResponse('fiscal_year_start must be a valid date (YYYY-MM-DD)', 400);
    }

    if (body.business_established_date && !isValidDate(body.business_established_date)) {
      return createErrorResponse('business_established_date must be a valid date (YYYY-MM-DD)', 400);
    }

    // Set session for RLS
    await setSessionUserId(auth.userId);

    // Check if profile already exists
    const existing = await query(
      'SELECT id FROM public.business_profiles WHERE user_id = $1',
      [auth.userId]
    );

    if (existing.rows.length > 0) {
      await clearSessionUserId();
      return createErrorResponse(
        'Business profile already exists. Use PATCH to update.',
        409,
        'Conflict'
      );
    }

    // Insert business profile
    const result = await query<BusinessProfile>(
      `INSERT INTO public.business_profiles (
        user_id,
        business_type,
        vat_status,
        industry,
        employee_count,
        fiscal_year_start,
        business_established_date,
        municipality,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        user_id,
        business_type,
        vat_status,
        industry,
        employee_count,
        fiscal_year_start,
        business_established_date,
        municipality,
        metadata,
        created_at,
        updated_at`,
      [
        auth.userId,
        body.business_type,
        body.vat_status,
        body.industry || null,
        body.employee_count || null,
        body.fiscal_year_start || null,
        body.business_established_date || null,
        body.municipality || null,
        body.metadata ? JSON.stringify(body.metadata) : '{}',
      ]
    );

    // Clear session
    await clearSessionUserId();

    return NextResponse.json(
      {
        success: true,
        message: 'Business profile created successfully',
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

    console.error('POST /api/business-profiles error:', error);
    return createErrorResponse(
      'Failed to create business profile',
      500,
      'Internal Server Error'
    );
  }
}

/**
 * PATCH /api/business-profiles
 * Update the authenticated user's business profile
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request);

    // Parse request body
    const body = await parseRequestBody<UpdateProfileRequest>(request);

    if (!body || Object.keys(body).length === 0) {
      return createErrorResponse('Request body must contain at least one field to update', 400);
    }

    // Validate business_type (if provided)
    if (body.business_type && !VALID_BUSINESS_TYPES.includes(body.business_type)) {
      return createErrorResponse(
        `Invalid business_type. Must be one of: ${VALID_BUSINESS_TYPES.join(', ')}`,
        400
      );
    }

    // Validate vat_status (if provided)
    if (body.vat_status && !VALID_VAT_STATUS.includes(body.vat_status)) {
      return createErrorResponse(
        `Invalid vat_status. Must be one of: ${VALID_VAT_STATUS.join(', ')}`,
        400
      );
    }

    // Validate industry (if provided)
    if (body.industry && !VALID_INDUSTRIES.includes(body.industry)) {
      return createErrorResponse(
        `Invalid industry. Must be one of: ${VALID_INDUSTRIES.join(', ')}`,
        400
      );
    }

    // Validate employee_count (if provided)
    if (body.employee_count !== undefined) {
      if (typeof body.employee_count !== 'number' || body.employee_count < 0) {
        return createErrorResponse('employee_count must be a non-negative number', 400);
      }
    }

    // Validate dates (if provided)
    if (body.fiscal_year_start && !isValidDate(body.fiscal_year_start)) {
      return createErrorResponse('fiscal_year_start must be a valid date (YYYY-MM-DD)', 400);
    }

    if (body.business_established_date && !isValidDate(body.business_established_date)) {
      return createErrorResponse('business_established_date must be a valid date (YYYY-MM-DD)', 400);
    }

    // Set session for RLS
    await setSessionUserId(auth.userId);

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.business_type !== undefined) {
      updates.push(`business_type = $${paramIndex++}`);
      values.push(body.business_type);
    }

    if (body.vat_status !== undefined) {
      updates.push(`vat_status = $${paramIndex++}`);
      values.push(body.vat_status);
    }

    if (body.industry !== undefined) {
      updates.push(`industry = $${paramIndex++}`);
      values.push(body.industry);
    }

    if (body.employee_count !== undefined) {
      updates.push(`employee_count = $${paramIndex++}`);
      values.push(body.employee_count);
    }

    if (body.fiscal_year_start !== undefined) {
      updates.push(`fiscal_year_start = $${paramIndex++}`);
      values.push(body.fiscal_year_start);
    }

    if (body.business_established_date !== undefined) {
      updates.push(`business_established_date = $${paramIndex++}`);
      values.push(body.business_established_date);
    }

    if (body.municipality !== undefined) {
      updates.push(`municipality = $${paramIndex++}`);
      values.push(body.municipality);
    }

    if (body.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(body.metadata));
    }

    // Add user_id for WHERE clause
    values.push(auth.userId);

    // Execute update
    const result = await query<BusinessProfile>(
      `UPDATE public.business_profiles
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING
        id,
        user_id,
        business_type,
        vat_status,
        industry,
        employee_count,
        fiscal_year_start,
        business_established_date,
        municipality,
        metadata,
        created_at,
        updated_at`,
      values
    );

    // Clear session
    await clearSessionUserId();

    if (result.rows.length === 0) {
      return createErrorResponse(
        'Business profile not found. Use POST to create one.',
        404,
        'Not Found'
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Business profile updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    await clearSessionUserId();

    // Handle authentication errors
    if (error instanceof NextResponse) {
      return error;
    }

    console.error('PATCH /api/business-profiles error:', error);
    return createErrorResponse(
      'Failed to update business profile',
      500,
      'Internal Server Error'
    );
  }
}
