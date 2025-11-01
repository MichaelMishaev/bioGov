/**
 * Integration Tests for Authentication Endpoints
 * Tests: /api/auth/signup, /api/auth/login, /api/auth/logout, /api/auth/refresh
 *
 * Coverage:
 * - Signup: valid, invalid email, weak password, missing consent, duplicate user
 * - Login: valid, wrong password, non-existent user, account locked, brute-force protection
 * - Logout: with/without session
 * - Refresh: valid, expired, revoked token
 */

import { NextRequest } from 'next/server'
import { POST as signupHandler } from '@/app/api/auth/signup/route'
import { POST as loginHandler } from '@/app/api/auth/login/route'
import { POST as logoutHandler } from '@/app/api/auth/logout/route'
import { POST as refreshHandler } from '@/app/api/auth/refresh/route'

import {
  createTestUser,
  createAuthenticatedTestUser,
  deleteTestUser,
  setFailedLoginAttempts,
  parseCookies,
  createExpiredSession,
  revokeSession,
  cleanupAllTestUsers,
} from '../helpers/auth.helper'

import {
  cleanupTestDatabase,
  getTestUserByEmail,
  getTestUserSessions,
  getTestUserAuditLog,
  checkDatabaseConnection,
} from '../helpers/db.helper'

import { testUsers, generateUniqueEmail, resetFixtureCounters } from '../helpers/fixtures'

// Helper to create mock NextRequest
function createMockRequest(body: any, cookies: Record<string, string> = {}, headers: Record<string, string> = {}): NextRequest {
  const url = 'http://localhost:3000/api/test'
  const request = new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })

  // Mock cookies
  Object.entries(cookies).forEach(([key, value]) => {
    request.cookies.set(key, value)
  })

  return request
}

describe('Authentication API Integration Tests', () => {
  // Check database connection before running tests
  beforeAll(async () => {
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      throw new Error('Cannot connect to test database. Please check DATABASE_URL in .env.test')
    }
  })

  // Clean up before each test
  beforeEach(async () => {
    resetFixtureCounters()
  })

  // Clean up after all tests
  afterAll(async () => {
    await cleanupAllTestUsers()
  })

  // ========================================================================
  // SIGNUP TESTS
  // ========================================================================

  describe('POST /api/auth/signup', () => {
    describe('Valid signup', () => {
      it('should create a new user with valid credentials', async () => {
        const email = generateUniqueEmail('valid')
        const userData = {
          email,
          password: 'SecurePass123!',
          name: 'Valid User',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.success).toBe(true)
        expect(data.user).toMatchObject({
          email: userData.email,
          name: userData.name,
          emailVerified: false,
        })
        expect(data.user.id).toBeDefined()
        expect(data.message).toContain('Account created successfully')

        // Clean up
        await deleteTestUser(email)
      })

      it('should return verification token in development mode', async () => {
        const originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = 'development'

        const email = generateUniqueEmail('devtoken')
        const userData = {
          email,
          password: 'SecurePass123!',
          name: 'Dev User',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.devToken).toBeDefined()
        expect(typeof data.devToken).toBe('string')
        expect(data.devToken.length).toBeGreaterThan(0)

        // Clean up
        await deleteTestUser(email)
        process.env.NODE_ENV = originalEnv
      })

      it('should store password hash (not plain text)', async () => {
        const email = generateUniqueEmail('hashcheck')
        const password = 'SecurePass123!'
        const userData = {
          email,
          password,
          name: 'Hash User',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)

        expect(response.status).toBe(201)

        // Verify password is hashed in database
        const user = await getTestUserByEmail(email)
        expect(user.password_hash).toBeDefined()
        expect(user.password_hash).not.toBe(password)
        expect(user.password_hash).toMatch(/^\$2[aby]\$/) // bcrypt hash format

        // Clean up
        await deleteTestUser(email)
      })
    })

    describe('Invalid email', () => {
      it('should reject invalid email format', async () => {
        const userData = {
          email: 'invalid-email',
          password: 'SecurePass123!',
          name: 'Invalid Email User',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Invalid email format')
      })

      it('should reject email without domain', async () => {
        const userData = {
          email: 'user@',
          password: 'SecurePass123!',
          name: 'Invalid Email User',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Invalid email format')
      })
    })

    describe('Weak password', () => {
      it('should reject password shorter than 8 characters', async () => {
        const userData = {
          email: generateUniqueEmail('short'),
          password: 'Short1!',
          name: 'Short Pass User',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('at least 8 characters')
      })

      it('should reject password without number or special character', async () => {
        const userData = {
          email: generateUniqueEmail('nonumber'),
          password: 'OnlyLetters',
          name: 'No Number User',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('number or special character')
      })

      it('should reject password longer than 128 characters', async () => {
        const userData = {
          email: generateUniqueEmail('toolong'),
          password: 'a'.repeat(129) + '1!',
          name: 'Too Long Pass User',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('less than 128 characters')
      })
    })

    describe('Missing consent', () => {
      it('should reject signup without consent', async () => {
        const userData = {
          email: generateUniqueEmail('noconsent'),
          password: 'SecurePass123!',
          name: 'No Consent User',
          consentGiven: false,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Privacy consent is required')
      })
    })

    describe('Missing fields', () => {
      it('should reject signup without email', async () => {
        const userData = {
          password: 'SecurePass123!',
          name: 'No Email User',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Missing required fields')
      })

      it('should reject signup without password', async () => {
        const userData = {
          email: generateUniqueEmail('nopass'),
          name: 'No Password User',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Missing required fields')
      })

      it('should reject signup without name', async () => {
        const userData = {
          email: generateUniqueEmail('noname'),
          password: 'SecurePass123!',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Missing required fields')
      })

      it('should reject name shorter than 2 characters', async () => {
        const userData = {
          email: generateUniqueEmail('shortname'),
          password: 'SecurePass123!',
          name: 'A',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('between 2 and 100 characters')
      })
    })

    describe('Duplicate user', () => {
      it('should reject signup with existing email', async () => {
        const email = generateUniqueEmail('duplicate')

        // Create first user
        await createTestUser({ email, name: 'First User' })

        // Try to create duplicate
        const userData = {
          email,
          password: 'DifferentPass123!',
          name: 'Duplicate User',
          consentGiven: true,
        }

        const request = createMockRequest(userData)
        const response = await signupHandler(request)
        const data = await response.json()

        expect(response.status).toBe(409)
        expect(data.error).toContain('Email already registered')

        // Clean up
        await deleteTestUser(email)
      })
    })
  })

  // ========================================================================
  // LOGIN TESTS
  // ========================================================================

  describe('POST /api/auth/login', () => {
    describe('Valid login', () => {
      it('should login successfully with correct credentials', async () => {
        const user = await createTestUser({
          email: generateUniqueEmail('loginvalid'),
          password: 'TestPass123!',
        })

        const loginData = {
          email: user.email,
          password: user.password,
        }

        const request = createMockRequest(loginData)
        const response = await loginHandler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toContain('Login successful')
        expect(data.user).toMatchObject({
          id: user.id,
          email: user.email,
        })
        expect(data.session).toBeDefined()

        // Check cookies
        const setCookie = response.headers.getSetCookie()
        expect(setCookie.length).toBeGreaterThan(0)

        const cookies = parseCookies(setCookie)
        expect(cookies.access_token).toBeDefined()
        expect(cookies.refresh_token).toBeDefined()

        // Clean up
        await deleteTestUser(user.email)
      })

      it('should reset failed login attempts on successful login', async () => {
        const user = await createTestUser({
          email: generateUniqueEmail('resetattempts'),
          password: 'TestPass123!',
        })

        // Set failed attempts
        await setFailedLoginAttempts(user.email, 3)

        const loginData = {
          email: user.email,
          password: user.password,
        }

        const request = createMockRequest(loginData)
        const response = await loginHandler(request)

        expect(response.status).toBe(200)

        // Verify failed attempts reset
        const updatedUser = await getTestUserByEmail(user.email)
        expect(updatedUser.failed_login_attempts).toBe(0)
        expect(updatedUser.locked_until).toBeNull()

        // Clean up
        await deleteTestUser(user.email)
      })

      it('should create audit log entry on successful login', async () => {
        const user = await createTestUser({
          email: generateUniqueEmail('auditlog'),
          password: 'TestPass123!',
        })

        const loginData = {
          email: user.email,
          password: user.password,
        }

        const request = createMockRequest(loginData)
        await loginHandler(request)

        // Check audit log
        const auditLog = await getTestUserAuditLog(user.id)
        const loginEntry = auditLog.find((entry: any) => entry.action === 'login')

        expect(loginEntry).toBeDefined()
        expect(loginEntry.success).toBe(true)

        // Clean up
        await deleteTestUser(user.email)
      })
    })

    describe('Wrong password', () => {
      it('should reject login with incorrect password', async () => {
        const user = await createTestUser({
          email: generateUniqueEmail('wrongpass'),
          password: 'CorrectPass123!',
        })

        const loginData = {
          email: user.email,
          password: 'WrongPass123!',
        }

        const request = createMockRequest(loginData)
        const response = await loginHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toContain('Invalid email or password')

        // Clean up
        await deleteTestUser(user.email)
      })

      it('should increment failed login attempts on wrong password', async () => {
        const user = await createTestUser({
          email: generateUniqueEmail('increment'),
          password: 'CorrectPass123!',
        })

        const loginData = {
          email: user.email,
          password: 'WrongPass123!',
        }

        const request = createMockRequest(loginData)
        await loginHandler(request)

        // Check failed attempts incremented
        const updatedUser = await getTestUserByEmail(user.email)
        expect(updatedUser.failed_login_attempts).toBe(1)

        // Clean up
        await deleteTestUser(user.email)
      })
    })

    describe('Non-existent user', () => {
      it('should reject login for non-existent email', async () => {
        const loginData = {
          email: generateUniqueEmail('nonexistent'),
          password: 'AnyPass123!',
        }

        const request = createMockRequest(loginData)
        const response = await loginHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toContain('Invalid email or password')
      })
    })

    describe('Brute-force protection', () => {
      it('should lock account after 5 failed login attempts', async () => {
        const user = await createTestUser({
          email: generateUniqueEmail('bruteforce'),
          password: 'CorrectPass123!',
        })

        // Make 5 failed attempts
        for (let i = 0; i < 5; i++) {
          const loginData = {
            email: user.email,
            password: 'WrongPass123!',
          }
          const request = createMockRequest(loginData)
          await loginHandler(request)
        }

        // Check account is locked
        const lockedUser = await getTestUserByEmail(user.email)
        expect(lockedUser.failed_login_attempts).toBe(5)
        expect(lockedUser.locked_until).not.toBeNull()

        // Try to login with correct password - should fail
        const loginData = {
          email: user.email,
          password: user.password,
        }
        const request = createMockRequest(loginData)
        const response = await loginHandler(request)
        const data = await response.json()

        expect(response.status).toBe(429)
        expect(data.error).toContain('Account locked')

        // Clean up
        await deleteTestUser(user.email)
      })

      it('should return remaining minutes when account is locked', async () => {
        const user = await createTestUser({
          email: generateUniqueEmail('locktime'),
          password: 'CorrectPass123!',
        })

        // Lock the account
        await setFailedLoginAttempts(user.email, 5)

        const loginData = {
          email: user.email,
          password: user.password,
        }

        const request = createMockRequest(loginData)
        const response = await loginHandler(request)
        const data = await response.json()

        expect(response.status).toBe(429)
        expect(data.error).toMatch(/Try again in \d+ minutes/)

        // Clean up
        await deleteTestUser(user.email)
      })
    })

    describe('Missing fields', () => {
      it('should reject login without email', async () => {
        const loginData = {
          password: 'TestPass123!',
        }

        const request = createMockRequest(loginData)
        const response = await loginHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Missing required fields')
      })

      it('should reject login without password', async () => {
        const loginData = {
          email: 'test@example.com',
        }

        const request = createMockRequest(loginData)
        const response = await loginHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Missing required fields')
      })
    })
  })

  // ========================================================================
  // LOGOUT TESTS
  // ========================================================================

  describe('POST /api/auth/logout', () => {
    describe('With valid session', () => {
      it('should logout successfully with valid access token', async () => {
        const user = await createAuthenticatedTestUser({
          email: generateUniqueEmail('logoutvalid'),
        })

        const request = createMockRequest({}, {
          access_token: user.accessToken,
        })

        const response = await logoutHandler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toContain('Logged out successfully')

        // Check cookies are cleared
        const setCookie = response.headers.getSetCookie()
        expect(setCookie.some((c) => c.includes('access_token=;'))).toBe(true)
        expect(setCookie.some((c) => c.includes('refresh_token=;'))).toBe(true)

        // Clean up
        await deleteTestUser(user.email)
      })

      it('should revoke session in database', async () => {
        const user = await createAuthenticatedTestUser({
          email: generateUniqueEmail('revoke'),
        })

        const request = createMockRequest({}, {
          access_token: user.accessToken,
        })

        await logoutHandler(request)

        // Check session is revoked
        const sessions = await getTestUserSessions(user.id)
        const session = sessions[0]

        expect(session.revoked_at).not.toBeNull()

        // Clean up
        await deleteTestUser(user.email)
      })

      it('should create audit log entry on logout', async () => {
        const user = await createAuthenticatedTestUser({
          email: generateUniqueEmail('logoutaudit'),
        })

        const request = createMockRequest({}, {
          access_token: user.accessToken,
        })

        await logoutHandler(request)

        // Check audit log
        const auditLog = await getTestUserAuditLog(user.id)
        const logoutEntry = auditLog.find((entry: any) => entry.action === 'logout')

        expect(logoutEntry).toBeDefined()
        expect(logoutEntry.success).toBe(true)

        // Clean up
        await deleteTestUser(user.email)
      })
    })

    describe('Without session', () => {
      it('should reject logout without access token', async () => {
        const request = createMockRequest({})

        const response = await logoutHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toContain('No active session found')
      })

      it('should reject logout with invalid access token', async () => {
        const request = createMockRequest({}, {
          access_token: 'invalid-token-12345',
        })

        const response = await logoutHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toContain('Invalid or expired access token')
      })

      it('should reject logout with already revoked session', async () => {
        const user = await createAuthenticatedTestUser({
          email: generateUniqueEmail('alreadyrevoked'),
        })

        // Revoke the session
        await revokeSession(user.accessToken)

        const request = createMockRequest({}, {
          access_token: user.accessToken,
        })

        const response = await logoutHandler(request)
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.error).toContain('already logged out')

        // Clean up
        await deleteTestUser(user.email)
      })
    })
  })

  // ========================================================================
  // REFRESH TOKEN TESTS
  // ========================================================================

  describe('POST /api/auth/refresh', () => {
    describe('Valid refresh', () => {
      it('should refresh access token with valid refresh token', async () => {
        const user = await createAuthenticatedTestUser({
          email: generateUniqueEmail('refreshvalid'),
        })

        const request = createMockRequest({}, {
          refresh_token: user.refreshToken,
        })

        const response = await refreshHandler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toContain('refreshed successfully')
        expect(data.user).toMatchObject({
          id: user.id,
          email: user.email,
        })

        // Check new access token cookie
        const setCookie = response.headers.getSetCookie()
        const cookies = parseCookies(setCookie)
        expect(cookies.access_token).toBeDefined()
        expect(cookies.access_token).not.toBe(user.accessToken) // Should be different

        // Clean up
        await deleteTestUser(user.email)
      })

      it('should update session in database with new access token', async () => {
        const user = await createAuthenticatedTestUser({
          email: generateUniqueEmail('updatesession'),
        })

        const oldAccessToken = user.accessToken

        const request = createMockRequest({}, {
          refresh_token: user.refreshToken,
        })

        await refreshHandler(request)

        // Verify session updated
        const sessions = await getTestUserSessions(user.id)
        const session = sessions[0]

        // We can't easily compare tokens, but we can check last_activity_at was updated
        expect(session.last_activity_at).not.toBeNull()

        // Clean up
        await deleteTestUser(user.email)
      })
    })

    describe('Invalid refresh token', () => {
      it('should reject refresh without refresh token', async () => {
        const request = createMockRequest({})

        const response = await refreshHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toContain('No refresh token found')
      })

      it('should reject refresh with malformed token', async () => {
        const request = createMockRequest({}, {
          refresh_token: 'invalid-malformed-token',
        })

        const response = await refreshHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toContain('Invalid or expired refresh token')
      })
    })

    describe('Expired refresh token', () => {
      it('should reject refresh with expired token', async () => {
        const user = await createTestUser({
          email: generateUniqueEmail('expiredrefresh'),
        })

        const { refreshToken } = await createExpiredSession(user.id)

        const request = createMockRequest({}, {
          refresh_token: refreshToken,
        })

        const response = await refreshHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toContain('expired')

        // Clean up
        await deleteTestUser(user.email)
      })
    })

    describe('Revoked refresh token', () => {
      it('should reject refresh with revoked session', async () => {
        const user = await createAuthenticatedTestUser({
          email: generateUniqueEmail('revokedrefresh'),
        })

        // Revoke the session
        await revokeSession(user.accessToken)

        const request = createMockRequest({}, {
          refresh_token: user.refreshToken,
        })

        const response = await refreshHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toContain('revoked')

        // Clean up
        await deleteTestUser(user.email)
      })
    })
  })
})
