/**
 * Test Fixtures - Sample data for testing
 */

export const testUsers = {
  validUser: {
    email: 'test.user@example.com',
    password: 'SecurePass123!',
    name: 'Test User',
    consentGiven: true,
  },
  validUser2: {
    email: 'jane.doe@example.com',
    password: 'AnotherPass456!',
    name: 'Jane Doe',
    consentGiven: true,
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'SecurePass123!',
    name: 'Invalid Email User',
    consentGiven: true,
  },
  weakPassword: {
    email: 'weak.password@example.com',
    password: 'weak',
    name: 'Weak Password User',
    consentGiven: true,
  },
  noConsent: {
    email: 'no.consent@example.com',
    password: 'SecurePass123!',
    name: 'No Consent User',
    consentGiven: false,
  },
  missingFields: {
    email: 'missing@example.com',
    // password intentionally missing
    name: 'Missing Fields User',
    consentGiven: true,
  },
}

export const testBusinessProfiles = {
  freelancer: {
    businessName: 'Test Freelancer',
    businessType: 'עוסק_פטור',
    vatStatus: 'exempt',
    industryCategory: 'טכנולוגיה',
  },
  authorizedDealer: {
    businessName: 'Test Company Ltd',
    businessType: 'עוסק_מורשה',
    vatStatus: 'registered',
    industryCategory: 'שירותים',
  },
}

export const testTasks = {
  upcoming: {
    title: 'Monthly VAT Report',
    description: 'Submit monthly VAT report',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'pending',
    priority: 'high',
    category: 'tax',
  },
  overdue: {
    title: 'Quarterly Tax Payment',
    description: 'Pay quarterly income tax',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'pending',
    priority: 'urgent',
    category: 'tax',
  },
  completed: {
    title: 'Annual Report',
    description: 'Submit annual financial report',
    dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    status: 'completed',
    priority: 'medium',
    category: 'reporting',
    completedAt: new Date(),
  },
}

export const testTaskTemplates = {
  monthlyVAT: {
    name: 'Monthly VAT Report',
    description: 'Submit monthly VAT report to tax authority',
    frequency: 'monthly',
    priority: 'high',
    category: 'tax',
    applicabilityRules: {
      vatStatus: ['registered'],
    },
  },
  quarterlyTax: {
    name: 'Quarterly Income Tax',
    description: 'Pay quarterly income tax advance',
    frequency: 'quarterly',
    priority: 'high',
    category: 'tax',
    applicabilityRules: {
      vatStatus: ['registered', 'exempt'],
    },
  },
}

// Helper to generate unique email for each test
let emailCounter = 0
export function generateUniqueEmail(prefix: string = 'test'): string {
  emailCounter++
  return `${prefix}.${Date.now()}.${emailCounter}@example.com`
}

// Helper to generate unique business name
let businessCounter = 0
export function generateUniqueBusinessName(prefix: string = 'Test Business'): string {
  businessCounter++
  return `${prefix} ${Date.now()}-${businessCounter}`
}

// Reset counters between test suites
export function resetFixtureCounters() {
  emailCounter = 0
  businessCounter = 0
}
