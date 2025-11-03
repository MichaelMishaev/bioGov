#!/usr/bin/env node
/**
 * Clean Test Data Script
 *
 * This script cleans up test data from the database for test@test.com
 * Run this manually before browser testing to ensure a clean state
 *
 * Usage:
 *   npm run clean-test
 *   or
 *   DATABASE_URL="..." tsx scripts/clean-test-data.ts
 */

import { Client } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || '';
const TEST_EMAIL = 'test@test.com';

async function cleanTestData() {
  if (!DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is required');
    console.error('');
    console.error('Usage:');
    console.error('  DATABASE_URL="postgresql://..." tsx scripts/clean-test-data.ts');
    console.error('  or');
    console.error('  npm run clean-test');
    process.exit(1);
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✓ Connected successfully');

    console.log(`\n🧹 Cleaning test data for ${TEST_EMAIL}...`);

    // Get user ID
    const userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [TEST_EMAIL]
    );

    if (userResult.rows.length === 0) {
      console.log(`✅ No test user found with email ${TEST_EMAIL}`);
      console.log('   Nothing to clean!');
      return;
    }

    const userId = userResult.rows[0].id;
    console.log(`✓ Found user ID: ${userId}`);

    // Delete tasks first (foreign key constraint)
    console.log('\n📋 Deleting tasks...');
    const tasksResult = await client.query(
      'DELETE FROM tasks WHERE user_id = $1',
      [userId]
    );
    console.log(`✓ Deleted ${tasksResult.rowCount} task(s)`);

    // Delete business profile
    console.log('\n🏢 Deleting business profile...');
    const profileResult = await client.query(
      'DELETE FROM business_profiles WHERE user_id = $1',
      [userId]
    );
    console.log(`✓ Deleted ${profileResult.rowCount} business profile(s)`);

    // Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const verifyProfile = await client.query(
      'SELECT COUNT(*) as count FROM business_profiles WHERE user_id = $1',
      [userId]
    );

    const verifyTasks = await client.query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = $1',
      [userId]
    );

    const profileCount = parseInt(verifyProfile.rows[0].count);
    const taskCount = parseInt(verifyTasks.rows[0].count);

    if (profileCount === 0 && taskCount === 0) {
      console.log('✅ Verification passed - database is clean');
      console.log(`   - Business profiles: ${profileCount}`);
      console.log(`   - Tasks: ${taskCount}`);
    } else {
      console.error('❌ Verification failed!');
      console.error(`   - Business profiles remaining: ${profileCount}`);
      console.error(`   - Tasks remaining: ${taskCount}`);
      throw new Error('Cleanup verification failed');
    }

    console.log('\n✅ Cleanup completed successfully!');
    console.log('\n💡 You can now run manual browser tests or E2E tests');

  } catch (error: any) {
    console.error('\n❌ Cleanup failed:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the cleanup
cleanTestData()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  });
