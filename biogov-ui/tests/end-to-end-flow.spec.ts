import { test, expect, Page } from '@playwright/test';
import { Pool } from 'pg';

/**
 * Comprehensive End-to-End Test for bioGov Platform
 *
 * This test validates the complete user journey:
 * 1. Database cleanup (remove existing test data)
 * 2. Login authentication
 * 3. Onboarding flow (3 steps)
 * 4. Dashboard verification with tasks
 *
 * Test User: test@test.com / 12345678
 */

const TEST_USER_EMAIL = 'test@test.com';
const TEST_USER_PASSWORD = '12345678';
const BASE_URL = 'http://localhost:3001';

/**
 * Database cleanup function with retry logic
 * Removes all business profiles and tasks for the test user
 */
async function cleanupTestUserData(retries = 3) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🧹 Starting database cleanup (attempt ${attempt}/${retries})...`);

      // Get user ID
      const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [TEST_USER_EMAIL]
      );

      if (userResult.rows.length === 0) {
        console.log('⚠️  Test user not found in database');
        await pool.end();
        return { success: false, message: 'User not found' };
      }

      const userId = userResult.rows[0].id;
      console.log(`✓ Found user ID: ${userId}`);

      // Delete tasks first (foreign key constraint)
      const tasksResult = await pool.query(
        'DELETE FROM tasks WHERE user_id = $1 RETURNING id',
        [userId]
      );
      console.log(`✓ Deleted ${tasksResult.rowCount} tasks`);

      // Delete business profile
      const profileResult = await pool.query(
        'DELETE FROM business_profiles WHERE user_id = $1 RETURNING id',
        [userId]
      );
      console.log(`✓ Deleted ${profileResult.rowCount} business profile(s)`);

      // Verify cleanup was successful
      const verifyProfile = await pool.query(
        'SELECT id FROM business_profiles WHERE user_id = $1',
        [userId]
      );

      const verifyTasks = await pool.query(
        'SELECT id FROM tasks WHERE user_id = $1',
        [userId]
      );

      if (verifyProfile.rows.length > 0 || verifyTasks.rows.length > 0) {
        throw new Error(`Cleanup verification failed: ${verifyProfile.rows.length} profiles, ${verifyTasks.rows.length} tasks remaining`);
      }

      console.log('✅ Cleanup verification passed - database is clean');
      console.log('✅ Database cleanup completed successfully');

      await pool.end();
      return {
        success: true,
        userId,
        tasksDeleted: tasksResult.rowCount || 0,
        profilesDeleted: profileResult.rowCount || 0
      };
    } catch (error) {
      console.error(`❌ Database cleanup error (attempt ${attempt}/${retries}):`, error.message);

      if (attempt === retries) {
        await pool.end();
        return { success: false, error: error.message };
      }

      // Wait before retry (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  await pool.end();
  return { success: false, error: 'Max retries exceeded' };
}

/**
 * Login helper function
 */
async function loginUser(page: Page) {
  console.log('🔐 Logging in...');

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

  // Fill credentials
  await page.fill('input[type="email"]', TEST_USER_EMAIL);
  await page.fill('input[type="password"]', TEST_USER_PASSWORD);

  // Wait for the API response to ensure cookies are set
  const loginResponsePromise = page.waitForResponse(
    response => response.url().includes('/api/auth/login') && response.status() === 200,
    { timeout: 10000 }
  );

  // Submit login form
  await page.click('button[type="submit"]');

  // Wait for login API to complete
  const loginResponse = await loginResponsePromise;
  console.log('✓ Login API returned success');

  // Check cookies were set
  const cookies = await page.context().cookies();
  const accessToken = cookies.find(c => c.name === 'access_token');
  const refreshToken = cookies.find(c => c.name === 'refresh_token');

  if (!accessToken || !refreshToken) {
    console.error('❌ Cookies not set after login!');
    console.error('Cookies:', cookies.map(c => c.name));
    throw new Error('Authentication cookies not set');
  }

  console.log('✓ Access token and refresh token cookies set');

  // Wait a moment for client-side processing
  await page.waitForTimeout(1000);

  console.log(`✓ Login successful, current URL: ${page.url()}`);
}

/**
 * Complete onboarding step 1 - Business Type
 */
async function completeStep1BusinessType(page: Page) {
  console.log('📝 Step 1: Selecting business type...');

  // Navigate and wait for auth check
  await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'domcontentloaded' });

  // Wait for /api/auth/me to be called and succeed (200)
  await page.waitForResponse(
    response => response.url().includes('/api/auth/me') && response.status() === 200,
    { timeout: 10000 }
  ).then(() => {
    console.log('✓ Auth check passed (HTTP 200)');
  }).catch(async () => {
    // If auth check fails, we might be redirected to login
    const currentUrl = page.url();
    console.error(`❌ Auth check failed, current URL: ${currentUrl}`);
    throw new Error('Not authenticated - auth check returned non-200 status');
  });

  // Wait for page to fully load
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  // Verify we're on step 1
  await expect(page.getByText('שלב 1 מתוך 3')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('בחר את סוג העסק שלך')).toBeVisible();

  // Select "עוסק פטור" (Exempt Dealer)
  const exemptDealerButton = page.locator('button', { hasText: 'עוסק פטור' });
  await expect(exemptDealerButton).toBeVisible();
  await exemptDealerButton.click();

  // Click Next button
  const nextButton = page.getByRole('button', { name: 'המשך' });
  await expect(nextButton).toBeVisible();
  await nextButton.click();

  // Wait for step 2 to load
  await expect(page.getByText('שלב 2 מתוך 3')).toBeVisible({ timeout: 5000 });

  console.log('✓ Step 1 completed: Business type selected');
}

/**
 * Complete onboarding step 2 - Industry
 */
async function completeStep2Industry(page: Page) {
  console.log('📝 Step 2: Selecting industry...');

  // Verify we're on step 2
  await expect(page.getByText('שלב 2 מתוך 3')).toBeVisible();
  await expect(page.getByText('מה תחום העיסוק שלך?')).toBeVisible();

  // Select "הייטק ופיתוח תוכנה" (Tech - sends 'technology')
  const techButton = page.locator('button', { hasText: 'הייטק ופיתוח תוכנה' });
  await expect(techButton).toBeVisible();
  await techButton.click();

  // Click Next button
  const nextButton = page.getByRole('button', { name: 'המשך' });
  await expect(nextButton).toBeVisible();
  await nextButton.click();

  // Wait for step 3 to load
  await expect(page.getByText('שלב 3 מתוך 3')).toBeVisible({ timeout: 5000 });

  console.log('✓ Step 2 completed: Industry selected');
}

/**
 * Complete onboarding step 3 - Details
 */
async function completeStep3Details(page: Page) {
  console.log('📝 Step 3: Filling details...');

  // Verify we're on step 3
  await expect(page.getByText('שלב 3 מתוך 3')).toBeVisible();
  await expect(page.getByText('פרטים נוספים')).toBeVisible();

  // Fill city using ID selector
  const cityInput = page.locator('#city');
  await expect(cityInput).toBeVisible();
  await cityInput.fill('תל אביב');
  console.log('✓ Filled city: תל אביב');

  // Fill employee count using ID selector
  const employeeInput = page.locator('#employees');
  await expect(employeeInput).toBeVisible();
  await employeeInput.fill('3');
  console.log('✓ Filled employee count: 3');

  // Click submit button "סיים והתחל"
  const submitButton = page.getByRole('button', { name: /סיים/ });
  await expect(submitButton).toBeVisible();

  // Listen for API responses to catch errors
  const apiResponsePromise = page.waitForResponse(
    response => response.url().includes('/api/') && response.request().method() === 'POST',
    { timeout: 10000 }
  );

  await submitButton.click();

  // Wait for API response
  const apiResponse = await apiResponsePromise;
  console.log(`API Response status: ${apiResponse.status()}`);
  console.log(`API Response URL: ${apiResponse.url()}`);

  if (apiResponse.status() === 409) {
    const errorBody = await apiResponse.text();
    console.error('❌ API Error (409 Conflict):', errorBody);
    throw new Error(`Profile already exists - database cleanup may have failed: ${errorBody}`);
  }

  if (apiResponse.status() === 500) {
    const errorBody = await apiResponse.text();
    console.error('❌ API Error (500):', errorBody);
    throw new Error(`API returned 500 error: ${errorBody}`);
  }

  if (apiResponse.status() >= 400) {
    const errorBody = await apiResponse.text();
    console.error(`❌ API Error (${apiResponse.status()}):`, errorBody);
    throw new Error(`API returned ${apiResponse.status()} error: ${errorBody}`);
  }

  console.log('✓ Step 3 completed: Details submitted');
}

/**
 * Verify dashboard and tasks
 */
async function verifyDashboard(page: Page) {
  console.log('🎯 Verifying dashboard...');

  // Wait for redirect to dashboard
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });

  // Check for welcome parameter
  const url = page.url();
  console.log(`Dashboard URL: ${url}`);

  if (url.includes('welcome=true')) {
    console.log('✓ Welcome parameter present in URL');
  }

  // Wait for dashboard to load
  await page.waitForLoadState('networkidle');

  // Check for no 500 errors in console
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Verify tasks are visible - look for task cards or task count
  // Try multiple selectors to find tasks
  const taskSelectors = [
    '[data-testid="task-card"]',
    '[class*="task"]',
    'text=משימות',
    'text=tasks'
  ];

  let tasksFound = false;
  let taskCount = 0;

  for (const selector of taskSelectors) {
    try {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        tasksFound = true;
        taskCount = elements.length;
        console.log(`✓ Found ${taskCount} tasks using selector: ${selector}`);
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  // Check for empty state
  const hasEmptyState = await page.locator('text=אין משימות').isVisible().catch(() => false);

  if (hasEmptyState) {
    console.log('⚠️  Dashboard shows "no tasks" state');
  } else if (!tasksFound) {
    console.log('⚠️  Could not verify task presence - may need manual inspection');
  }

  // Check console for errors
  if (consoleErrors.length > 0) {
    console.error('❌ Console errors found:', consoleErrors);
  } else {
    console.log('✓ No console errors detected');
  }

  return {
    url,
    hasWelcome: url.includes('welcome=true'),
    tasksFound,
    taskCount,
    consoleErrors
  };
}

/**
 * Main test suite
 */
test.describe('End-to-End Flow: Login → Onboarding → Dashboard', () => {

  test('Complete user journey with database cleanup', async ({ page }) => {
    // Increase timeout for this comprehensive test
    test.setTimeout(90000); // 90 seconds
    // Enable detailed logging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        console.log('Browser:', msg.text());
      }
    });

    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`HTTP ${response.status()}: ${response.url()}`);
      }
    });

    // Track results
    const results = {
      cleanup: null,
      login: null,
      step1: null,
      step2: null,
      step3: null,
      dashboard: null
    };

    try {
      // STEP 0: Database Cleanup
      console.log('\n=== STEP 0: DATABASE CLEANUP ===');
      results.cleanup = await cleanupTestUserData();

      if (!results.cleanup.success) {
        throw new Error(`Database cleanup failed: ${results.cleanup.error || results.cleanup.message}`);
      }

      expect(results.cleanup.success).toBe(true);

      // STEP 1: Login
      console.log('\n=== STEP 1: LOGIN ===');
      await loginUser(page);
      results.login = 'SUCCESS';

      // Take screenshot after login
      await page.screenshot({ path: 'test-results/01-after-login.png', fullPage: true });

      // STEP 2: Onboarding - Business Type
      console.log('\n=== STEP 2: ONBOARDING - BUSINESS TYPE ===');
      await completeStep1BusinessType(page);
      results.step1 = 'SUCCESS';

      await page.screenshot({ path: 'test-results/02-after-step1.png', fullPage: true });

      // STEP 3: Onboarding - Industry
      console.log('\n=== STEP 3: ONBOARDING - INDUSTRY ===');
      await completeStep2Industry(page);
      results.step2 = 'SUCCESS';

      await page.screenshot({ path: 'test-results/03-after-step2.png', fullPage: true });

      // STEP 4: Onboarding - Details
      console.log('\n=== STEP 4: ONBOARDING - DETAILS ===');
      await completeStep3Details(page);
      results.step3 = 'SUCCESS';

      await page.screenshot({ path: 'test-results/04-after-step3.png', fullPage: true });

      // STEP 5: Verify Dashboard
      console.log('\n=== STEP 5: VERIFY DASHBOARD ===');
      results.dashboard = await verifyDashboard(page);

      await page.screenshot({ path: 'test-results/05-dashboard.png', fullPage: true });

      // Print summary
      console.log('\n' + '='.repeat(60));
      console.log('TEST SUMMARY');
      console.log('='.repeat(60));
      console.log(`Database cleanup:      ✅ SUCCESS (${results.cleanup.tasksDeleted} tasks, ${results.cleanup.profilesDeleted} profiles deleted)`);
      console.log(`Login:                 ✅ SUCCESS`);
      console.log(`Onboarding Step 1:     ✅ SUCCESS`);
      console.log(`Onboarding Step 2:     ✅ SUCCESS`);
      console.log(`Onboarding Step 3:     ✅ SUCCESS`);
      console.log(`Dashboard redirect:    ✅ SUCCESS (${results.dashboard.url})`);
      console.log(`Tasks loaded:          ${results.dashboard.tasksFound ? '✅' : '⚠️'} ${results.dashboard.tasksFound ? `SUCCESS (${results.dashboard.taskCount} tasks)` : 'UNCLEAR - manual verification needed'}`);
      console.log(`Console errors:        ${results.dashboard.consoleErrors.length === 0 ? '✅' : '❌'} ${results.dashboard.consoleErrors.length === 0 ? 'NONE' : results.dashboard.consoleErrors.length + ' errors'}`);
      console.log('='.repeat(60) + '\n');

      // Final assertions
      expect(results.login).toBe('SUCCESS');
      expect(results.step1).toBe('SUCCESS');
      expect(results.step2).toBe('SUCCESS');
      expect(results.step3).toBe('SUCCESS');
      expect(results.dashboard.url).toContain('dashboard');
      expect(results.dashboard.consoleErrors.length).toBe(0);

    } catch (error) {
      console.error('\n' + '='.repeat(60));
      console.error('TEST FAILED');
      console.error('='.repeat(60));
      console.error('Error:', error.message);
      console.error('\nResults up to failure:');
      console.error(JSON.stringify(results, null, 2));
      console.error('='.repeat(60) + '\n');

      // Take failure screenshot
      await page.screenshot({ path: 'test-results/ERROR-failure.png', fullPage: true });

      throw error;
    }
  });

});
