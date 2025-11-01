# Railway + Custom Authentication - Part 2
**Middleware, Protected Routes, and Email Verification**

---

## Phase 5: Authentication Middleware (Day 4 - 4 hours)

### Step 5.1: Create Auth Middleware

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, hashToken } from '@/lib/auth';
import { db } from '@/lib/db';

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/settings'];

// Public routes (no auth required)
const PUBLIC_ROUTES = ['/', '/quiz', '/login', '/signup', '/results'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // No tokens = redirect to login
  if (!accessToken && !refreshToken) {
    const loginUrl = new NextResponse.redirect(new URL('/login', request.url));
    loginUrl.cookies.set('redirect_after_login', pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });
    return loginUrl;
  }

  // Verify access token
  let payload = accessToken ? verifyAccessToken(accessToken) : null;

  // If access token expired, try refreshing
  if (!payload && refreshToken) {
    const refreshPayload = verifyRefreshToken(refreshToken);

    if (refreshPayload) {
      // Verify refresh token exists in database
      const sessionResult = await db.query(
        `SELECT id FROM auth.sessions
         WHERE user_id = $1
         AND refresh_token_hash = $2
         AND revoked_at IS NULL
         AND refresh_token_expires_at > NOW()`,
        [refreshPayload.userId, hashToken(refreshToken)]
      );

      if (sessionResult.rows.length > 0) {
        // Generate new access token
        const newAccessToken = generateAccessToken({
          userId: refreshPayload.userId,
          email: refreshPayload.email,
        });

        // Update session
        await db.query(
          `UPDATE auth.sessions
           SET access_token_hash = $1,
               access_token_expires_at = $2,
               last_activity_at = NOW()
           WHERE user_id = $3 AND refresh_token_hash = $4`,
          [
            hashToken(newAccessToken),
            new Date(Date.now() + 15 * 60 * 1000),
            refreshPayload.userId,
            hashToken(refreshToken),
          ]
        );

        // Set new access token cookie
        const response = NextResponse.next();
        response.cookies.set('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60,
          path: '/',
        });

        // Set user ID for RLS
        response.headers.set('X-User-Id', refreshPayload.userId);

        return response;
      }
    }

    // Refresh token invalid = redirect to login
    const loginUrl = new NextResponse.redirect(new URL('/login', request.url));
    loginUrl.cookies.delete('access_token');
    loginUrl.cookies.delete('refresh_token');
    return loginUrl;
  }

  // Access token valid
  if (payload) {
    const response = NextResponse.next();
    response.headers.set('X-User-Id', payload.userId);
    return response;
  }

  // Fallback: redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

### Step 5.2: Helper to Get Current User in API Routes

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/lib/get-user.ts`:

```typescript
import { NextRequest } from 'next/server';
import { verifyAccessToken } from './auth';

export interface CurrentUser {
  userId: string;
  email: string;
}

/**
 * Get current authenticated user from request
 * Use this in API routes to enforce authentication
 */
export function getCurrentUser(request: NextRequest): CurrentUser | null {
  // Get access token from cookie
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return null;
  }

  // Verify token
  const payload = verifyAccessToken(accessToken);

  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
  };
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in API routes that MUST have a user
 */
export function requireAuth(request: NextRequest): CurrentUser {
  const user = getCurrentUser(request);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
```

---

## Phase 6: Logout & Session Management (Day 4 - 2 hours)

### Step 6.1: Logout Endpoint

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/api/auth/logout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/auth';
import { getCurrentUser } from '@/lib/get-user';

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get refresh token
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (refreshToken) {
      // Revoke session in database
      await db.query(
        `UPDATE auth.sessions
         SET revoked_at = NOW()
         WHERE user_id = $1 AND refresh_token_hash = $2`,
        [user.userId, hashToken(refreshToken)]
      );

      // Log logout event
      await db.query(
        `INSERT INTO auth.audit_log (user_id, event_type, success, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.userId, 'logout', true, request.ip || null, request.headers.get('user-agent') || null]
      );
    }

    // Clear cookies
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### Step 6.2: Refresh Token Endpoint

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/api/auth/refresh/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRefreshToken, generateAccessToken, hashToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Check if session exists and is valid
    const sessionResult = await db.query(
      `SELECT id FROM auth.sessions
       WHERE user_id = $1
       AND refresh_token_hash = $2
       AND revoked_at IS NULL
       AND refresh_token_expires_at > NOW()`,
      [payload.userId, hashToken(refreshToken)]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Session expired or revoked' }, { status: 401 });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    // Update session
    await db.query(
      `UPDATE auth.sessions
       SET access_token_hash = $1,
           access_token_expires_at = $2,
           last_activity_at = NOW()
       WHERE user_id = $3 AND refresh_token_hash = $4`,
      [
        hashToken(newAccessToken),
        new Date(Date.now() + 15 * 60 * 1000),
        payload.userId,
        hashToken(refreshToken),
      ]
    );

    // Set new access token cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Phase 7: Email Verification (Day 5 - 4 hours)

### Step 7.1: Verify Email Endpoint

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/api/auth/verify-email/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Verification token required' }, { status: 400 });
    }

    // Find verification record
    const result = await db.query(
      `SELECT id, user_id, expires_at, used_at, attempts
       FROM auth.email_verifications
       WHERE token = $1 AND token_type = 'email_verification'`,
      [token]
    );

    const verification = result.rows[0];

    if (!verification) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 404 });
    }

    // Check if already used
    if (verification.used_at) {
      return NextResponse.json({ error: 'Verification token already used' }, { status: 400 });
    }

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Verification token expired. Request a new one.' },
        { status: 410 }
      );
    }

    // Check max attempts
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Request a new token.' },
        { status: 429 }
      );
    }

    // Mark as used
    await db.query(
      `UPDATE auth.email_verifications
       SET used_at = NOW()
       WHERE id = $1`,
      [verification.id]
    );

    // Update user
    await db.query(
      `UPDATE public.users
       SET email_verified = TRUE,
           email_verified_at = NOW()
       WHERE id = $1`,
      [verification.user_id]
    );

    // Log event
    await db.query(
      `INSERT INTO auth.audit_log (user_id, event_type, success, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        verification.user_id,
        'email_verification',
        true,
        request.ip || null,
        request.headers.get('user-agent') || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### Step 7.2: Resend Verification Email Endpoint

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/api/auth/resend-verification/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateVerificationToken } from '@/lib/auth';
import { getCurrentUser } from '@/lib/get-user';

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if already verified
    const userResult = await db.query(
      'SELECT email_verified FROM public.users WHERE id = $1',
      [user.userId]
    );

    if (userResult.rows[0]?.email_verified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Rate limit: max 3 resends per hour
    const recentSends = await db.query(
      `SELECT COUNT(*) as count FROM auth.email_verifications
       WHERE user_id = $1
       AND token_type = 'email_verification'
       AND created_at > NOW() - INTERVAL '1 hour'`,
      [user.userId]
    );

    if (parseInt(recentSends.rows[0].count) >= 3) {
      return NextResponse.json(
        { error: 'Too many verification emails sent. Please wait an hour.' },
        { status: 429 }
      );
    }

    // Invalidate old tokens
    await db.query(
      `UPDATE auth.email_verifications
       SET used_at = NOW()
       WHERE user_id = $1 AND token_type = 'email_verification' AND used_at IS NULL`,
      [user.userId]
    );

    // Generate new token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.query(
      `INSERT INTO auth.email_verifications (user_id, token, token_type, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.userId, verificationToken, 'email_verification', expiresAt]
    );

    // TODO: Send email via Resend.com
    // await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Phase 8: Password Reset (Day 5 - 3 hours)

### Step 8.1: Forgot Password Endpoint

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/api/auth/forgot-password/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateVerificationToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find user
    const userResult = await db.query(
      'SELECT id FROM public.users WHERE email = $1',
      [email]
    );

    // Always return success (don't reveal if email exists)
    if (userResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    const user = userResult.rows[0];

    // Rate limit: max 3 reset requests per hour
    const recentResets = await db.query(
      `SELECT COUNT(*) as count FROM auth.email_verifications
       WHERE user_id = $1
       AND token_type = 'password_reset'
       AND created_at > NOW() - INTERVAL '1 hour'`,
      [user.id]
    );

    if (parseInt(recentResets.rows[0].count) >= 3) {
      return NextResponse.json(
        { error: 'Too many reset requests. Please wait an hour.' },
        { status: 429 }
      );
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await db.query(
      `INSERT INTO auth.email_verifications (user_id, token, token_type, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, resetToken, 'password_reset', expiresAt]
    );

    // TODO: Send reset email via Resend.com
    // await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### Step 8.2: Reset Password Endpoint

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/api/auth/reset-password/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password required' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Password requirements not met', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Find reset token
    const result = await db.query(
      `SELECT id, user_id, expires_at, used_at
       FROM auth.email_verifications
       WHERE token = $1 AND token_type = 'password_reset'`,
      [token]
    );

    const reset = result.rows[0];

    if (!reset) {
      return NextResponse.json({ error: 'Invalid reset token' }, { status: 404 });
    }

    if (reset.used_at) {
      return NextResponse.json({ error: 'Reset token already used' }, { status: 400 });
    }

    if (new Date(reset.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Reset token expired' }, { status: 410 });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await db.query(
      `UPDATE public.users
       SET password_hash = $1,
           failed_login_attempts = 0,
           locked_until = NULL
       WHERE id = $2`,
      [passwordHash, reset.user_id]
    );

    // Mark token as used
    await db.query(
      `UPDATE auth.email_verifications
       SET used_at = NOW()
       WHERE id = $1`,
      [reset.id]
    );

    // Revoke all existing sessions
    await db.query(
      `UPDATE auth.sessions
       SET revoked_at = NOW()
       WHERE user_id = $1`,
      [reset.user_id]
    );

    // Log event
    await db.query(
      `INSERT INTO auth.audit_log (user_id, event_type, success, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        reset.user_id,
        'password_reset',
        true,
        request.ip || null,
        request.headers.get('user-agent') || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! Please log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Phase 9: Get Current User Info (Day 5 - 1 hour)

### Step 9.1: Me Endpoint

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/api/auth/me/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/get-user';

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get full user info
    const result = await db.query(
      `SELECT id, email, name, email_verified, email_verified_at, created_at, last_login_at
       FROM public.users
       WHERE id = $1`,
      [user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## TO BE CONTINUED IN PART 3...

See `RAILWAY_AUTH_IMPLEMENTATION_PART3.md` for:
- UI components (login/signup forms)
- Protected pages
- Testing guide
- Deployment checklist
