/**
 * POST /api/auth/refresh
 * Token refresh endpoint - generates new access token using refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  verifyRefreshToken,
  generateAccessToken,
  hashToken,
  getAccessTokenExpiry,
  getAccessTokenCookieOptions,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // ========================================================================
    // Get Refresh Token from Cookie
    // ========================================================================

    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      );
    }

    // ========================================================================
    // Verify Refresh Token
    // ========================================================================

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // ========================================================================
    // Hash Refresh Token to Find Session
    // ========================================================================

    const refreshTokenHash = hashToken(refreshToken);

    // ========================================================================
    // Validate Session in Database
    // ========================================================================

    const sessionResult = await query<{
      id: string;
      user_id: string;
      revoked_at: Date | null;
      refresh_token_expires_at: Date;
    }>(
      `SELECT
        id,
        user_id,
        revoked_at,
        refresh_token_expires_at
      FROM public.auth_sessions
      WHERE refresh_token_hash = $1`,
      [refreshTokenHash]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];

    // Check if session is revoked
    if (session.revoked_at) {
      return NextResponse.json(
        { error: 'Session has been revoked. Please log in again.' },
        { status: 401 }
      );
    }

    // Check if refresh token is expired
    if (new Date(session.refresh_token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Refresh token has expired. Please log in again.' },
        { status: 401 }
      );
    }

    // ========================================================================
    // Verify User Still Exists and Not Locked
    // ========================================================================

    const userResult = await query<{
      id: string;
      email: string;
      name: string;
      email_verified: boolean;
      locked_until: Date | null;
    }>(
      `SELECT
        id,
        email,
        name,
        email_verified,
        locked_until
      FROM public.users
      WHERE id = $1`,
      [session.user_id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return NextResponse.json(
        { error: 'Account is locked. Please try again later.' },
        { status: 403 }
      );
    }

    // ========================================================================
    // Generate New Access Token
    // ========================================================================

    const newAccessToken = generateAccessToken(user.id);
    const newAccessTokenHash = hashToken(newAccessToken);
    const newAccessTokenExpiresAt = getAccessTokenExpiry();

    // ========================================================================
    // Update Session in Database
    // ========================================================================

    await query(
      `UPDATE public.auth_sessions
      SET
        access_token_hash = $1,
        access_token_expires_at = $2,
        last_activity_at = NOW()
      WHERE id = $3`,
      [newAccessTokenHash, newAccessTokenExpiresAt, session.id]
    );

    // ========================================================================
    // Set New Access Token Cookie
    // ========================================================================

    const response = NextResponse.json(
      {
        success: true,
        message: 'Access token refreshed successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified,
        },
        tokenExpiresAt: newAccessTokenExpiresAt,
      },
      { status: 200 }
    );

    // Set new access token cookie (15 minutes)
    response.cookies.set(
      'access_token',
      newAccessToken,
      getAccessTokenCookieOptions()
    );

    return response;
  } catch (error: any) {
    console.error('Token refresh error:', error);

    return NextResponse.json(
      { error: 'Internal server error during token refresh' },
      { status: 500 }
    );
  }
}
