/**
 * Authentication Utilities for JWT-based Auth System
 * Provides password hashing, JWT token generation/verification, and token hashing
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// JWT Configuration
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || '';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || '';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const BCRYPT_ROUNDS = 12; // Recommended for production

// Validate secrets at module load
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  console.error('⚠️ Missing JWT secrets in environment variables!');
  console.error('Required: ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET');
}

// ============================================================================
// Password Utilities (Bcrypt)
// ============================================================================

/**
 * Hash a password using bcrypt with 12 rounds
 * @param password - Plain text password
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a bcrypt hash
 * @param password - Plain text password
 * @param hash - Bcrypt hash from database
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// ============================================================================
// JWT Token Generation
// ============================================================================

/**
 * Generate an access token (15 minutes expiry)
 * @param userId - User's UUID
 * @returns Signed JWT token
 */
export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'biogov-api',
    audience: 'biogov-client',
  });
}

/**
 * Generate a refresh token (7 days expiry)
 * @param userId - User's UUID
 * @returns Signed JWT token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'biogov-api',
    audience: 'biogov-client',
  });
}

/**
 * Calculate expiry timestamp for access token
 * @returns Date object 15 minutes from now
 */
export function getAccessTokenExpiry(): Date {
  return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
}

/**
 * Calculate expiry timestamp for refresh token
 * @returns Date object 7 days from now
 */
export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
}

// ============================================================================
// JWT Token Verification
// ============================================================================

/**
 * Verify an access token and extract payload
 * @param token - JWT token string
 * @returns Decoded payload with userId, or null if invalid
 */
export function verifyAccessToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'biogov-api',
      audience: 'biogov-client',
    }) as { userId: string };

    return decoded;
  } catch (error) {
    // Token expired, invalid, or malformed
    return null;
  }
}

/**
 * Verify a refresh token and extract payload
 * @param token - JWT token string
 * @returns Decoded payload with userId, or null if invalid
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'biogov-api',
      audience: 'biogov-client',
    }) as { userId: string };

    return decoded;
  } catch (error) {
    // Token expired, invalid, or malformed
    return null;
  }
}

// ============================================================================
// Token Hashing (for Database Storage)
// ============================================================================

/**
 * Hash a token using SHA-256 for secure database storage
 * @param token - JWT token or random token string
 * @returns Hex-encoded SHA-256 hash
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a secure random token (32 bytes = 64 hex characters)
 * Used for email verification and password reset tokens
 * @returns Hex-encoded random token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ============================================================================
// Password Validation
// ============================================================================

/**
 * Validate password strength
 * @param password - Plain text password
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (password.length > 128) {
    return 'Password must be less than 128 characters';
  }

  // Check for at least one number or special character
  if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one number or special character';
  }

  return null; // Valid
}

/**
 * Validate email format
 * @param email - Email string
 * @returns true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// ============================================================================
// Rate Limiting Helpers
// ============================================================================

/**
 * Check if account is locked
 * @param failedAttempts - Number of failed login attempts
 * @param lockedUntil - Timestamp when lock expires
 * @returns true if locked, false otherwise
 */
export function isAccountLocked(
  failedAttempts: number,
  lockedUntil: Date | null
): boolean {
  if (failedAttempts >= 5 && lockedUntil) {
    return new Date() < new Date(lockedUntil);
  }
  return false;
}

/**
 * Calculate lock expiry time (15 minutes from now)
 * @returns Date object for lock expiry
 */
export function getLockExpiry(): Date {
  return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
}

// ============================================================================
// Cookie Helpers
// ============================================================================

/**
 * Get secure cookie configuration for production
 * @returns Cookie options object
 */
export function getSecureCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true, // Prevent XSS attacks
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax' as const, // CSRF protection
    path: '/', // Available on all routes
  };
}

/**
 * Get cookie options for access token (15 minutes)
 */
export function getAccessTokenCookieOptions() {
  return {
    ...getSecureCookieOptions(),
    maxAge: 15 * 60, // 15 minutes in seconds
  };
}

/**
 * Get cookie options for refresh token (7 days)
 */
export function getRefreshTokenCookieOptions() {
  return {
    ...getSecureCookieOptions(),
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}
