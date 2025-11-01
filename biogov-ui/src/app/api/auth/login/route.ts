/**
 * POST /api/auth/login
 * User login endpoint with JWT token generation and brute-force protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getAccessTokenExpiry,
  getRefreshTokenExpiry,
  isAccountLocked,
  getLockExpiry,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '@/lib/auth';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // ========================================================================
    // Input Validation
    // ========================================================================

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      );
    }

    // ========================================================================
    // Get User from Database
    // ========================================================================

    const userResult = await query<{
      id: string;
      email: string;
      name: string;
      password_hash: string;
      email_verified: boolean;
      failed_login_attempts: number;
      locked_until: Date | null;
    }>(
      `SELECT
        id,
        email,
        name,
        password_hash,
        email_verified,
        failed_login_attempts,
        locked_until
      FROM public.users
      WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    const user = userResult.rows[0];

    // ========================================================================
    // Check if User Exists
    // ========================================================================

    if (!user) {
      // Don't reveal if user exists (security)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ========================================================================
    // Check if Account is Locked (Brute-Force Protection)
    // ========================================================================

    if (isAccountLocked(user.failed_login_attempts, user.locked_until)) {
      const lockExpiry = new Date(user.locked_until!);
      const remainingMinutes = Math.ceil(
        (lockExpiry.getTime() - Date.now()) / 60000
      );

      // Log failed login attempt
      const ipAddress = request.headers.get('x-forwarded-for') || request.ip;
      const userAgent = request.headers.get('user-agent');

      await query(
        `INSERT INTO public.auth_audit_log (
          user_id,
          action,
          ip_address,
          user_agent,
          success,
          error_message,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.id,
          'login_failed',
          ipAddress,
          userAgent,
          false,
          'Account locked',
          JSON.stringify({ remainingMinutes }),
        ]
      );

      return NextResponse.json(
        {
          error: `Account locked due to too many failed login attempts. Try again in ${remainingMinutes} minutes.`,
        },
        { status: 429 } // Too Many Requests
      );
    }

    // ========================================================================
    // Verify Password
    // ========================================================================

    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = user.failed_login_attempts + 1;
      const shouldLock = newFailedAttempts >= 5;

      await query(
        `UPDATE public.users
        SET
          failed_login_attempts = $1,
          locked_until = $2
        WHERE id = $3`,
        [
          newFailedAttempts,
          shouldLock ? getLockExpiry() : null,
          user.id,
        ]
      );

      // Log failed login attempt
      const ipAddress = request.headers.get('x-forwarded-for') || request.ip;
      const userAgent = request.headers.get('user-agent');

      await query(
        `INSERT INTO public.auth_audit_log (
          user_id,
          action,
          ip_address,
          user_agent,
          success,
          error_message,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.id,
          'login_failed',
          ipAddress,
          userAgent,
          false,
          'Invalid password',
          JSON.stringify({
            failedAttempts: newFailedAttempts,
            locked: shouldLock,
          }),
        ]
      );

      if (shouldLock) {
        return NextResponse.json(
          {
            error:
              'Account locked due to too many failed login attempts. Try again in 15 minutes.',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ========================================================================
    // Reset Failed Login Attempts (Successful Login)
    // ========================================================================

    await query(
      `UPDATE public.users
      SET
        failed_login_attempts = 0,
        locked_until = NULL
      WHERE id = $1`,
      [user.id]
    );

    // ========================================================================
    // Generate JWT Tokens
    // ========================================================================

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Hash tokens for secure storage
    const accessTokenHash = hashToken(accessToken);
    const refreshTokenHash = hashToken(refreshToken);

    // Calculate expiry timestamps
    const accessTokenExpiresAt = getAccessTokenExpiry();
    const refreshTokenExpiresAt = getRefreshTokenExpiry();

    // ========================================================================
    // Store Session in Database
    // ========================================================================

    const ipAddress = request.headers.get('x-forwarded-for') || request.ip;
    const userAgent = request.headers.get('user-agent');

    const sessionResult = await query<{
      id: string;
      created_at: Date;
    }>(
      `INSERT INTO public.auth_sessions (
        user_id,
        access_token_hash,
        refresh_token_hash,
        access_token_expires_at,
        refresh_token_expires_at,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at`,
      [
        user.id,
        accessTokenHash,
        refreshTokenHash,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        ipAddress,
        userAgent,
      ]
    );

    const session = sessionResult.rows[0];

    // ========================================================================
    // Log Successful Login (Audit Trail)
    // ========================================================================

    await query(
      `INSERT INTO public.auth_audit_log (
        user_id,
        action,
        ip_address,
        user_agent,
        success,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        'login',
        ipAddress,
        userAgent,
        true,
        JSON.stringify({ sessionId: session.id }),
      ]
    );

    // ========================================================================
    // Set HTTP-Only Cookies
    // ========================================================================

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified,
        },
        session: {
          id: session.id,
          createdAt: session.created_at,
          expiresAt: refreshTokenExpiresAt,
        },
      },
      { status: 200 }
    );

    // Set access token cookie (15 minutes)
    response.cookies.set(
      'access_token',
      accessToken,
      getAccessTokenCookieOptions()
    );

    // Set refresh token cookie (7 days)
    response.cookies.set(
      'refresh_token',
      refreshToken,
      getRefreshTokenCookieOptions()
    );

    return response;
  } catch (error: any) {
    console.error('Login error:', error);

    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
