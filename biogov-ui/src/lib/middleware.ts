/**
 * API Middleware Utilities
 * Provides authentication verification and session management for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './auth';
import { query } from './db';

/**
 * Error response structure
 */
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Authenticated request context
 */
export interface AuthContext {
  userId: string;
  email: string;
  name: string;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 400,
  error: string = 'Bad Request'
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error,
      message,
      statusCode,
    },
    { status: statusCode }
  );
}

/**
 * Extract and verify access token from request cookies
 * Returns user ID if valid, null otherwise
 */
export async function verifyAuthToken(request: NextRequest): Promise<string | null> {
  try {
    // Get access token from cookies
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return null;
    }

    // Verify token
    const payload = verifyAccessToken(accessToken);

    if (!payload || !payload.userId) {
      return null;
    }

    // Verify user exists in database
    const result = await query(
      'SELECT id FROM public.users WHERE id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return payload.userId;
  } catch (error) {
    console.error('Auth token verification error:', error);
    return null;
  }
}

/**
 * Get authenticated user context
 * Returns user details if authenticated, null otherwise
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  try {
    const userId = await verifyAuthToken(request);

    if (!userId) {
      return null;
    }

    // Fetch user details
    const result = await query<{
      id: string;
      email: string;
      name: string;
    }>(
      'SELECT id, email, name FROM public.users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    console.error('Get auth context error:', error);
    return null;
  }
}

/**
 * Middleware: Require authentication for API route
 * Usage: const auth = await requireAuth(request);
 * Returns authenticated user context or throws error response
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const authContext = await getAuthContext(request);

  if (!authContext) {
    throw createErrorResponse(
      'Authentication required. Please log in.',
      401,
      'Unauthorized'
    );
  }

  return authContext;
}

/**
 * Set session variable for RLS policies
 * This should be called after authentication to enable Row-Level Security
 */
export async function setSessionUserId(userId: string): Promise<void> {
  try {
    await query('SELECT set_config($1, $2, false)', ['app.user_id', userId]);
  } catch (error) {
    console.error('Failed to set session user ID:', error);
    throw error;
  }
}

/**
 * Clear session variable (for cleanup)
 */
export async function clearSessionUserId(): Promise<void> {
  try {
    await query('SELECT set_config($1, $2, false)', ['app.user_id', '']);
  } catch (error) {
    console.error('Failed to clear session user ID:', error);
  }
}

/**
 * Get current user ID from session variable
 * This is primarily for debugging/verification
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const result = await query<{ user_id: string }>(
      "SELECT current_setting('app.user_id', true) AS user_id"
    );

    const userId = result.rows[0]?.user_id;
    return userId && userId !== '' ? userId : null;
  } catch (error) {
    return null;
  }
}

/**
 * Validate request body against required fields
 */
export function validateRequestBody<T extends Record<string, any>>(
  body: any,
  requiredFields: (keyof T)[]
): { valid: boolean; missing?: string[] } {
  if (!body || typeof body !== 'object') {
    return { valid: false, missing: requiredFields as string[] };
  }

  const missing = requiredFields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    return { valid: false, missing: missing as string[] };
  }

  return { valid: true };
}

/**
 * Safely parse JSON request body
 */
export async function parseRequestBody<T = any>(request: NextRequest): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch (error) {
    return null;
  }
}

/**
 * Execute API handler with authentication and error handling
 * This is a higher-order function that wraps API route handlers
 */
export async function withAuth(
  request: NextRequest,
  handler: (auth: AuthContext, request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Verify authentication
    const auth = await requireAuth(request);

    // Set session variable for RLS
    await setSessionUserId(auth.userId);

    // Execute handler
    const response = await handler(auth, request);

    // Clear session variable
    await clearSessionUserId();

    return response;
  } catch (error) {
    // Clear session on error
    await clearSessionUserId();

    // If it's already a NextResponse (from requireAuth), return it
    if (error instanceof NextResponse) {
      return error;
    }

    // Otherwise, create generic error response
    console.error('API handler error:', error);
    return createErrorResponse(
      'Internal server error',
      500,
      'Internal Server Error'
    );
  }
}

/**
 * Parse query parameters with type safety
 */
export function getQueryParam(request: NextRequest, param: string): string | null {
  const url = new URL(request.url);
  return url.searchParams.get(param);
}

/**
 * Parse multiple query parameters
 */
export function getQueryParams(request: NextRequest, params: string[]): Record<string, string | null> {
  const url = new URL(request.url);
  const result: Record<string, string | null> = {};

  for (const param of params) {
    result[param] = url.searchParams.get(param);
  }

  return result;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    // Create new window
    const resetAt = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (record.count >= maxRequests) {
    // Limit exceeded
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment count
  record.count++;
  rateLimitMap.set(identifier, record);

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Clean up expired rate limit records (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
