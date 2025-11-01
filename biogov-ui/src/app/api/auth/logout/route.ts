/**
 * POST /api/auth/logout
 * User logout endpoint - revokes session and clears cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccessToken, hashToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // ========================================================================
    // Get Access Token from Cookie
    // ========================================================================

    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 401 }
      );
    }

    // ========================================================================
    // Verify Access Token
    // ========================================================================

    const decoded = verifyAccessToken(accessToken);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      );
    }

    // ========================================================================
    // Hash Token to Find Session
    // ========================================================================

    const accessTokenHash = hashToken(accessToken);

    // ========================================================================
    // Revoke Session in Database
    // ========================================================================

    const sessionResult = await query<{
      id: string;
      user_id: string;
    }>(
      `UPDATE public.auth_sessions
      SET revoked_at = NOW()
      WHERE access_token_hash = $1
        AND revoked_at IS NULL
        AND refresh_token_expires_at > NOW()
      RETURNING id, user_id`,
      [accessTokenHash]
    );

    if (sessionResult.rows.length === 0) {
      // Session not found or already revoked
      return NextResponse.json(
        { error: 'Session not found or already logged out' },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];

    // ========================================================================
    // Log Logout Event (Audit Trail)
    // ========================================================================

    const ipAddress = request.headers.get('x-forwarded-for') || request.ip;
    const userAgent = request.headers.get('user-agent');

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
        session.user_id,
        'logout',
        ipAddress,
        userAgent,
        true,
        JSON.stringify({ sessionId: session.id }),
      ]
    );

    // ========================================================================
    // Clear Cookies
    // ========================================================================

    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Clear access token cookie
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    // Clear refresh token cookie
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);

    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    );
  }
}
