import { test, expect } from '@playwright/test';
import { Client } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || '';

async function queryDatabase(query: string, params: any[] = []) {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    await client.end();
  }
}

test.describe('Simple Auth Test: Signup and Login', () => {
  const testEmail = 'test@test.com';
  const testPassword = '12345678';
  const testName = 'Test User';

  test('should signup and login successfully', async ({ page }) => {
    console.log('\n🚀 STARTING AUTHENTICATION TEST');
    console.log('📧 Email:', testEmail);
    console.log('🔐 Password:', testPassword);
    console.log('\n' + '='.repeat(80) + '\n');

    // ========================================================================
    // PART 1: SIGNUP
    // ========================================================================
    console.log('📝 PART 1: SIGNUP');
    console.log('─'.repeat(80));

    await page.goto('http://localhost:3002/signup');
    console.log('✅ Navigated to signup page');

    // Fill form
    await page.fill('#name', testName);
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.check('#consent');
    console.log('✅ Filled signup form');

    // Submit and wait for navigation
    await Promise.all([
      page.waitForURL('**/onboarding', { timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);
    console.log('✅ Signup successful - redirected to onboarding');

    // Wait for page to settle
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for database writes

    // ========================================================================
    // PART 2: VERIFY DATABASE
    // ========================================================================
    console.log('\n🗄️  PART 2: VERIFY DATABASE');
    console.log('─'.repeat(80));

    const users = await queryDatabase(
      'SELECT id, email, name, email_verified, consent_given FROM users WHERE email = $1',
      [testEmail]
    );

    if (users.length === 0) {
      console.error('❌ USER NOT FOUND IN DATABASE!');
      throw new Error('User was not created');
    }

    console.log('✅ User exists in database:');
    console.log('   - ID:', users[0].id);
    console.log('   - Email:', users[0].email);
    console.log('   - Name:', users[0].name);
    console.log('   - Consent:', users[0].consent_given);

    const userId = users[0].id;

    // Check auth session
    const sessions = await queryDatabase(
      'SELECT id, access_token_hash, refresh_token_hash FROM auth_sessions WHERE user_id = $1',
      [userId]
    );

    if (sessions.length === 0) {
      console.error('❌ AUTH SESSION NOT FOUND!');
      throw new Error('Auth session was not created');
    }

    console.log('✅ Auth session exists:');
    console.log('   - Session ID:', sessions[0].id);
    console.log('   - access_token_hash:', sessions[0].access_token_hash ? '✓' : '✗');
    console.log('   - refresh_token_hash:', sessions[0].refresh_token_hash ? '✓' : '✗');

    if (!sessions[0].access_token_hash || !sessions[0].refresh_token_hash) {
      console.error('❌ TOKEN HASHES ARE MISSING!');
      throw new Error('Token hashes not set in session');
    }

    // ========================================================================
    // PART 3: CHECK COOKIES
    // ========================================================================
    console.log('\n🍪 PART 3: CHECK COOKIES');
    console.log('─'.repeat(80));

    const cookies = await page.context().cookies();
    const accessToken = cookies.find(c => c.name === 'access_token');
    const refreshToken = cookies.find(c => c.name === 'refresh_token');

    if (!accessToken || !refreshToken) {
      console.error('❌ COOKIES NOT SET!');
      console.log('Cookies found:', cookies.map(c => c.name).join(', '));
      throw new Error('Authentication cookies not set');
    }

    console.log('✅ Cookies are set:');
    console.log('   - access_token: ✓');
    console.log('   - refresh_token: ✓');

    // ========================================================================
    // PART 4: LOGOUT
    // ========================================================================
    console.log('\n🚪 PART 4: LOGOUT');
    console.log('─'.repeat(80));

    await page.context().clearCookies();
    console.log('✅ Cleared cookies (logged out)');

    // ========================================================================
    // PART 5: LOGIN
    // ========================================================================
    console.log('\n🔑 PART 5: LOGIN');
    console.log('─'.repeat(80));

    await page.goto('http://localhost:3002/login');
    console.log('✅ Navigated to login page');

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    console.log('✅ Filled login form');

    // Submit and wait for navigation
    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);
    console.log('✅ Login successful - redirected to dashboard');

    // Verify dashboard content
    await expect(page.locator('text=לוח בקרה')).toBeVisible({ timeout: 10000 });
    console.log('✅ Dashboard content is visible');

    // ========================================================================
    // FINAL SUMMARY
    // ========================================================================
    console.log('\n' + '='.repeat(80));
    console.log('🎉 ALL TESTS PASSED! 🎉');
    console.log('='.repeat(80));
    console.log('\n✅ Signup: User created successfully');
    console.log('✅ Database: User and session records verified');
    console.log('✅ Cookies: Authentication tokens set');
    console.log('✅ Auto-login: Redirected to onboarding after signup');
    console.log('✅ Logout: Cookies cleared');
    console.log('✅ Login: Successfully logged in');
    console.log('✅ Dashboard: Accessed successfully');
    console.log('\n' + '='.repeat(80) + '\n');
  });
});
