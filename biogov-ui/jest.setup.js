/**
 * Jest Setup File
 * Runs before each test suite to configure the test environment
 */

// Load environment variables from .env.test
require('dotenv').config({ path: '.env.test' })

// Set test environment
process.env.NODE_ENV = 'test'

// Mock console methods to reduce noise during tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: console.error, // Keep error logs for debugging
}

// Global test timeout
jest.setTimeout(30000)

// Clean up after all tests
afterAll(async () => {
  // Close database connections
  const { closePool } = require('./src/lib/db')
  await closePool()
})
