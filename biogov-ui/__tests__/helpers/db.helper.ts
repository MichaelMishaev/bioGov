/**
 * Database Helper for Tests
 * Provides utilities for database cleanup and seeding test data
 */

import { query, getClient } from '@/lib/db'

/**
 * Clean up all test data from database
 * WARNING: Only use in test environment!
 */
export async function cleanupTestDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('cleanupTestDatabase can only be called in test environment!')
  }

  try {
    // Delete in reverse order of foreign key dependencies
    await query('DELETE FROM public.auth_audit_log WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE $1)', ['%@example.com'])
    await query('DELETE FROM public.auth_sessions WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE $1)', ['%@example.com'])
    await query('DELETE FROM public.auth_email_verifications WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE $1)', ['%@example.com'])
    await query('DELETE FROM public.auth_password_resets WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE $1)', ['%@example.com'])

    // Delete test users
    await query('DELETE FROM public.users WHERE email LIKE $1', ['%@example.com'])

    console.log('✅ Test database cleaned up successfully')
  } catch (error) {
    console.error('❌ Error cleaning up test database:', error)
    throw error
  }
}

/**
 * Clean up specific user and related data
 */
export async function cleanupTestUser(email: string) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('cleanupTestUser can only be called in test environment!')
  }

  try {
    // Get user ID first
    const userResult = await query('SELECT id FROM public.users WHERE email = $1', [email])

    if (userResult.rows.length === 0) {
      return // User doesn't exist, nothing to clean
    }

    const userId = userResult.rows[0].id

    // Delete related records
    await query('DELETE FROM public.auth_audit_log WHERE user_id = $1', [userId])
    await query('DELETE FROM public.auth_sessions WHERE user_id = $1', [userId])
    await query('DELETE FROM public.auth_email_verifications WHERE user_id = $1', [userId])
    await query('DELETE FROM public.auth_password_resets WHERE user_id = $1', [userId])

    // Delete user
    await query('DELETE FROM public.users WHERE id = $1', [userId])

    console.log(`✅ Test user ${email} cleaned up successfully`)
  } catch (error) {
    console.error(`❌ Error cleaning up test user ${email}:`, error)
    throw error
  }
}

/**
 * Seed a test user and return the user data
 */
export async function seedTestUser(userData: {
  email: string
  name: string
  passwordHash: string
  consentGiven?: boolean
  emailVerified?: boolean
}) {
  try {
    const result = await query<{
      id: string
      email: string
      name: string
      email_verified: boolean
      created_at: Date
    }>(
      `INSERT INTO public.users (
        email,
        name,
        password_hash,
        consent_given,
        email_verified,
        failed_login_attempts
      )
      VALUES ($1, $2, $3, $4, $5, 0)
      RETURNING id, email, name, email_verified, created_at`,
      [
        userData.email,
        userData.name,
        userData.passwordHash,
        userData.consentGiven ?? true,
        userData.emailVerified ?? false,
      ]
    )

    return result.rows[0]
  } catch (error) {
    console.error('❌ Error seeding test user:', error)
    throw error
  }
}

/**
 * Get user by email
 */
export async function getTestUserByEmail(email: string) {
  const result = await query<{
    id: string
    email: string
    name: string
    password_hash: string
    email_verified: boolean
    failed_login_attempts: number
    locked_until: Date | null
    created_at: Date
  }>(
    `SELECT
      id,
      email,
      name,
      password_hash,
      email_verified,
      failed_login_attempts,
      locked_until,
      created_at
    FROM public.users
    WHERE email = $1`,
    [email]
  )

  return result.rows[0] || null
}

/**
 * Lock a user account for testing
 */
export async function lockTestUserAccount(email: string) {
  const lockUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

  await query(
    `UPDATE public.users
    SET failed_login_attempts = 5, locked_until = $1
    WHERE email = $2`,
    [lockUntil, email]
  )
}

/**
 * Get all sessions for a user
 */
export async function getTestUserSessions(userId: string) {
  const result = await query(
    `SELECT * FROM public.auth_sessions WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  )

  return result.rows
}

/**
 * Revoke all sessions for a user
 */
export async function revokeTestUserSessions(userId: string) {
  await query(
    `UPDATE public.auth_sessions SET revoked_at = NOW() WHERE user_id = $1`,
    [userId]
  )
}

/**
 * Get audit log entries for a user
 */
export async function getTestUserAuditLog(userId: string) {
  const result = await query(
    `SELECT * FROM public.auth_audit_log WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  )

  return result.rows
}

/**
 * Check if database is accessible
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as connected')
    return result.rows[0].connected === 1
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

/**
 * Execute a transaction for testing
 */
export async function executeTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await getClient()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
