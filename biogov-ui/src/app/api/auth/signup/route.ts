/**
 * POST /api/auth/signup
 * User registration endpoint with email verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  hashPassword,
  validateEmail,
  validatePassword,
  generateSecureToken,
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '@/lib/auth';

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  consentGiven: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SignupRequest = await request.json();
    const { email, password, name, consentGiven } = body;

    // ========================================================================
    // Input Validation
    // ========================================================================

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Validate name length
    if (name.trim().length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate consent (Israeli Privacy Law requirement)
    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Privacy consent is required' },
        { status: 400 }
      );
    }

    // ========================================================================
    // Check if User Already Exists
    // ========================================================================

    const existingUser = await query(
      'SELECT id, email, email_verified FROM public.users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 } // Conflict
      );
    }

    // ========================================================================
    // Hash Password
    // ========================================================================

    const passwordHash = await hashPassword(password);

    // ========================================================================
    // Create User Record
    // ========================================================================

    const userResult = await query<{
      id: string;
      email: string;
      name: string;
      created_at: Date;
    }>(
      `INSERT INTO public.users (
        email,
        name,
        password_hash,
        consent_given,
        email_verified,
        failed_login_attempts
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, created_at`,
      [
        email.toLowerCase().trim(),
        name.trim(),
        passwordHash,
        consentGiven,
        false, // Email not verified yet
        0, // No failed attempts yet
      ]
    );

    const user = userResult.rows[0];

    // ========================================================================
    // Generate Email Verification Token
    // ========================================================================

    const verificationToken = generateSecureToken();
    const tokenHash = hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await query(
      `INSERT INTO public.auth_email_verifications (
        user_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // ========================================================================
    // Log Signup Event (Audit Trail)
    // ========================================================================

    const ipAddress = request.headers.get('x-forwarded-for') || request.ip;
    const userAgent = request.headers.get('user-agent');

    await query(
      `INSERT INTO public.auth_audit_log (
        user_id,
        action,
        ip_address,
        user_agent,
        success
      )
      VALUES ($1, $2, $3, $4, $5)`,
      [user.id, 'signup', ipAddress, userAgent, true]
    );

    // ========================================================================
    // Send Verification Email (Future Implementation)
    // ========================================================================

    // TODO: Send email with verification link
    // const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Verify your bioGov account',
    //   template: 'verification',
    //   data: { name: user.name, link: verificationLink }
    // });

    console.log('📧 Verification email would be sent to:', user.email);
    console.log('🔑 Verification token (dev only):', verificationToken);

    // ========================================================================
    // Create Authentication Session (Auto-login after signup)
    // ========================================================================

    // Generate JWT tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const accessTokenHash = hashToken(accessToken);
    const refreshTokenHash = hashToken(refreshToken);

    // Calculate expiry times
    const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create session in database
    await query(
      `INSERT INTO public.auth_sessions (
        user_id,
        access_token_hash,
        refresh_token_hash,
        access_token_expires_at,
        refresh_token_expires_at,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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

    console.log('✅ Authentication session created for user:', user.id);

    // ========================================================================
    // Response with Authentication Cookies
    // ========================================================================

    const response = NextResponse.json(
      {
        success: true,
        message:
          'Account created successfully. You are now logged in.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: false,
        },
        // Include token in dev mode only
        ...(process.env.NODE_ENV === 'development' && {
          devToken: verificationToken,
        }),
      },
      { status: 201 }
    );

    // Set authentication cookies
    const accessCookieOptions = getAccessTokenCookieOptions();
    const refreshCookieOptions = getRefreshTokenCookieOptions();

    response.cookies.set('access_token', accessToken, accessCookieOptions);
    response.cookies.set('refresh_token', refreshToken, refreshCookieOptions);

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);

    // Handle database constraint violations
    if (error.code === '23505') {
      // Unique constraint violation
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during signup' },
      { status: 500 }
    );
  }
}
