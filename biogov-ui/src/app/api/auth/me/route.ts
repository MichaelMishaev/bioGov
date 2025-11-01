/**
 * GET /api/auth/me
 * Get current authenticated user information
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccessToken, hashToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookies
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database
    const userResult = await query<{
      id: string;
      email: string;
      name: string;
      email_verified: boolean;
      created_at: Date;
    }>(
      `SELECT
        id,
        email,
        name,
        email_verified,
        created_at
      FROM public.users
      WHERE id = $1`,
      [payload.userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify session exists and is valid
    const accessTokenHash = hashToken(accessToken);
    const sessionResult = await query(
      `SELECT id
      FROM public.auth_sessions
      WHERE user_id = $1
        AND access_token_hash = $2
        AND access_token_expires_at > NOW()
        AND revoked_at IS NULL`,
      [user.id, accessTokenHash]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get current user error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
