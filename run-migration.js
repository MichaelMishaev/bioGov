#!/usr/bin/env node

/**
 * Neon Database Migration Runner
 * Runs the initial schema migration for bioGov MVP
 *
 * Usage: node run-migration.js
 */

require('dotenv').config({ path: './biogov-ui/.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting Neon database migration...\n');

  // Validate DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('📡 Connecting to Neon database...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Neon
    },
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon successfully!\n');

    // Read migration file (Neon-compatible version)
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '001_initial_schema_neon.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(`✅ Migration file loaded (${migrationSQL.length} characters)\n`);

    // Run migration
    console.log('⚙️  Executing migration SQL...');
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully!\n');

    // Verify tables created
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`\n✅ Created ${result.rows.length} tables:`);
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    // Verify views created
    const viewsResult = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(`\n✅ Created ${viewsResult.rows.length} views:`);
    viewsResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    // Test a simple query
    console.log('\n🧪 Testing database connection with sample query...');
    const testResult = await client.query('SELECT COUNT(*) FROM public.users;');
    console.log(`✅ Users table accessible (count: ${testResult.rows[0].count})\n`);

    console.log('🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Verify tables in Neon console: https://console.neon.tech/');
    console.log('   2. Create database client utility (lib/db.ts)');
    console.log('   3. Build API routes (/api/assess, /api/signup, /api/feedback)');
    console.log('   4. Implement VAT logic (lib/vat-logic.ts)\n');

  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed.');
  }
}

// Run migration
runMigration();
