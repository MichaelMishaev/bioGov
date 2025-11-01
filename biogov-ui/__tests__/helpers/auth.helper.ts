/**
 * Authentication Helper for Tests
 * Provides utilities for creating test users, logging in, and managing test tokens
 */

import { hashPassword, generateAccessToken, generateRefreshToken, hashToken } from '@/lib/auth'
import { query } from '@/lib/db'
import { seedTestUser, cleanupTestUser } from './db.helper'
import { generateUniqueEmail } from './fixtures'

interface TestUserCredentials {
  email: string
  password: string
  name: string
  consentGiven?: boolean
}

interface TestUserWithTokens {
  id: string
  email: string
  name: string
  password: string
  accessToken: string
  refreshToken: string
  emailVerified: boolean
}

/**
 * Create a test user with hashed password
 * @param credentials User credentials
 * @returns Created user data with password (plain text)
 */
export async function createTestUser(
  credentials?: Partial<TestUserCredentials>
): Promise<{ id: string; email: string; name: string; password: string }> {
  const defaultCredentials: TestUserCredentials = {
    email: generateUniqueEmail('test'),
    password: 'TestPass123!',
    name: 'Test User',
    consentGiven: true,
    ...credentials,
  }

  const passwordHash = await hashPassword(defaultCredentials.password)

  const user = await seedTestUser({
    email: defaultCredentials.email,
    name: defaultCredentials.name,
    passwordHash,
    consentGiven: defaultCredentials.consentGiven,
    emailVerified: false,
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    password: defaultCredentials.password, // Return plain text password for testing
  }
}

/**
 * Create a test user with valid session tokens
 * @param credentials User credentials
 * @returns User data with access and refresh tokens
 */
export async function createAuthenticatedTestUser(
  credentials?: Partial<TestUserCredentials>
): Promise<TestUserWithTokens> {
  const user = await createTestUser(credentials)

  // Generate tokens
  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  // Store session in database
  const accessTokenHash = hashToken(accessToken)
  const refreshTokenHash = hashToken(refreshToken)

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
      new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      '127.0.0.1',
      'jest-test-agent',
    ]
  )

  return {
    ...user,
    accessToken,
    refreshToken,
    emailVerified: false,
  }
}

/**
 * Create multiple test users
 * @param count Number of users to create
 * @returns Array of created users
 */
export async function createMultipleTestUsers(count: number) {
  const users = []

  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: generateUniqueEmail(`testuser${i}`),
      name: `Test User ${i + 1}`,
    })
    users.push(user)
  }

  return users
}

/**
 * Login a test user and return tokens
 * This simulates a successful login without going through the API
 */
export async function loginTestUser(userId: string): Promise<{
  accessToken: string
  refreshToken: string
}> {
  const accessToken = generateAccessToken(userId)
  const refreshToken = generateRefreshToken(userId)

  const accessTokenHash = hashToken(accessToken)
  const refreshTokenHash = hashToken(refreshToken)

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
      userId,
      accessTokenHash,
      refreshTokenHash,
      new Date(Date.now() + 15 * 60 * 1000),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      '127.0.0.1',
      'jest-test-agent',
    ]
  )

  return { accessToken, refreshToken }
}

/**
 * Generate expired access token for testing
 */
export function generateExpiredAccessToken(userId: string): string {
  // Note: This won't actually be expired in JWT, but we can mock the database state
  return generateAccessToken(userId)
}

/**
 * Generate expired refresh token for testing
 */
export function generateExpiredRefreshToken(userId: string): string {
  return generateRefreshToken(userId)
}

/**
 * Create a session with expired tokens in the database
 */
export async function createExpiredSession(userId: string) {
  const accessToken = generateAccessToken(userId)
  const refreshToken = generateRefreshToken(userId)

  const accessTokenHash = hashToken(accessToken)
  const refreshTokenHash = hashToken(refreshToken)

  // Create session with expired timestamps
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
      userId,
      accessTokenHash,
      refreshTokenHash,
      new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      '127.0.0.1',
      'jest-test-agent',
    ]
  )

  return { accessToken, refreshToken }
}

/**
 * Revoke a session (mark as revoked)
 */
export async function revokeSession(accessToken: string) {
  const accessTokenHash = hashToken(accessToken)

  await query(
    `UPDATE public.auth_sessions
    SET revoked_at = NOW()
    WHERE access_token_hash = $1`,
    [accessTokenHash]
  )
}

/**
 * Verify email for test user
 */
export async function verifyTestUserEmail(userId: string) {
  await query(
    `UPDATE public.users
    SET email_verified = true
    WHERE id = $1`,
    [userId]
  )
}

/**
 * Set failed login attempts for testing brute-force protection
 */
export async function setFailedLoginAttempts(email: string, attempts: number) {
  const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null

  await query(
    `UPDATE public.users
    SET failed_login_attempts = $1, locked_until = $2
    WHERE email = $3`,
    [attempts, lockUntil, email]
  )
}

/**
 * Get authentication cookies as a string for supertest
 */
export function getAuthCookies(accessToken: string, refreshToken: string): string[] {
  return [
    `access_token=${accessToken}; Path=/; HttpOnly`,
    `refresh_token=${refreshToken}; Path=/; HttpOnly`,
  ]
}

/**
 * Parse cookies from supertest response
 */
export function parseCookies(setCookieHeaders: string[]): Record<string, string> {
  const cookies: Record<string, string> = {}

  setCookieHeaders.forEach((cookie) => {
    const parts = cookie.split(';')[0].split('=')
    cookies[parts[0]] = parts[1]
  })

  return cookies
}

/**
 * Clean up test user by email
 */
export async function deleteTestUser(email: string) {
  await cleanupTestUser(email)
}

/**
 * Clean up all test data (for afterAll hooks)
 */
export async function cleanupAllTestUsers() {
  await query('DELETE FROM public.users WHERE email LIKE $1', ['%@example.com'])
}
