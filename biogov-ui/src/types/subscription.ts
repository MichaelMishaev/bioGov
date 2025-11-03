/**
 * Subscription & Monetization Type Definitions
 * Israeli compliance-aware subscription tiers
 */

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'business' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
export type BillingPeriod = 'monthly' | 'annual';

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingPeriod?: BillingPeriod;
  amountCents?: number;
  currency: string;
  trialStart?: string;
  trialEnd?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAt?: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionTierFeatures {
  tier: SubscriptionTier;
  nameEn: string;
  nameHe: string;
  priceMonthlyNIS: number; // in ILS (shekels)
  priceAnnualNIS: number;
  features: {
    complianceCalendar: boolean;
    vatQuiz: boolean;
    govLinks: boolean;
    invoiceGeneration?: boolean;
    taskReminders?: boolean;
    documentStorageGB?: number;
    bankSync?: boolean;
    autoVatReports?: boolean;
    expenseOCR?: boolean;
    paymentLinks?: boolean;
    ecommerceIntegrations?: number; // -1 = unlimited
    accountantSharing?: boolean;
    autoTaxFiling?: boolean;
    paymentProcessing?: boolean;
    advancedReports?: boolean;
    digitalSignatures?: boolean;
    prioritySupport?: boolean;
    whiteLabel?: boolean;
    apiAccess?: boolean;
    customIntegrations?: boolean;
    sla?: boolean;
    dedicatedManager?: boolean;
  };
  limits: {
    tasks: number; // -1 = unlimited
    invoices: number;
    customers: number;
    businesses: number;
    documentStorageGB?: number;
  };
}

// Subscription tier configuration
export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierFeatures> = {
  free: {
    tier: 'free',
    nameEn: 'Free',
    nameHe: 'חינם',
    priceMonthlyNIS: 0,
    priceAnnualNIS: 0,
    features: {
      complianceCalendar: false,
      vatQuiz: true,
      govLinks: true,
    },
    limits: {
      tasks: 5,
      invoices: 0,
      customers: 0,
      businesses: 1,
    },
  },
  starter: {
    tier: 'starter',
    nameEn: 'Starter',
    nameHe: 'מתחילים',
    priceMonthlyNIS: 49,
    priceAnnualNIS: 490, // Save ₪98/year
    features: {
      complianceCalendar: true,
      vatQuiz: true,
      govLinks: true,
      invoiceGeneration: true,
      taskReminders: true,
      documentStorageGB: 1,
    },
    limits: {
      tasks: -1, // unlimited
      invoices: -1,
      customers: 50,
      businesses: 1,
    },
  },
  professional: {
    tier: 'professional',
    nameEn: 'Professional',
    nameHe: 'מקצועי',
    priceMonthlyNIS: 99,
    priceAnnualNIS: 990, // Save ₪198/year
    features: {
      complianceCalendar: true,
      vatQuiz: true,
      govLinks: true,
      invoiceGeneration: true,
      taskReminders: true,
      documentStorageGB: 10,
      bankSync: true,
      autoVatReports: true,
      expenseOCR: true,
      paymentLinks: true,
      ecommerceIntegrations: 1,
      accountantSharing: true,
    },
    limits: {
      tasks: -1,
      invoices: -1,
      customers: 500,
      businesses: 3,
      documentStorageGB: 10,
    },
  },
  business: {
    tier: 'business',
    nameEn: 'Business',
    nameHe: 'עסקי',
    priceMonthlyNIS: 199,
    priceAnnualNIS: 1990, // Save ₪398/year
    features: {
      complianceCalendar: true,
      vatQuiz: true,
      govLinks: true,
      invoiceGeneration: true,
      taskReminders: true,
      documentStorageGB: 100,
      bankSync: true,
      autoVatReports: true,
      expenseOCR: true,
      paymentLinks: true,
      ecommerceIntegrations: -1, // unlimited
      accountantSharing: true,
      autoTaxFiling: true,
      paymentProcessing: true,
      advancedReports: true,
      digitalSignatures: true,
      prioritySupport: true,
    },
    limits: {
      tasks: -1,
      invoices: -1,
      customers: -1,
      businesses: -1,
      documentStorageGB: 100,
    },
  },
  enterprise: {
    tier: 'enterprise',
    nameEn: 'Enterprise',
    nameHe: 'ארגוני',
    priceMonthlyNIS: 0, // Custom pricing
    priceAnnualNIS: 0,
    features: {
      complianceCalendar: true,
      vatQuiz: true,
      govLinks: true,
      invoiceGeneration: true,
      taskReminders: true,
      bankSync: true,
      autoVatReports: true,
      expenseOCR: true,
      paymentLinks: true,
      ecommerceIntegrations: -1,
      accountantSharing: true,
      autoTaxFiling: true,
      paymentProcessing: true,
      advancedReports: true,
      digitalSignatures: true,
      prioritySupport: true,
      whiteLabel: true,
      apiAccess: true,
      customIntegrations: true,
      sla: true,
      dedicatedManager: true,
    },
    limits: {
      tasks: -1,
      invoices: -1,
      customers: -1,
      businesses: -1,
      documentStorageGB: -1,
    },
  },
};

// Helper function to check if user has access to a feature
export function hasFeature(tier: SubscriptionTier, feature: keyof SubscriptionTierFeatures['features']): boolean {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  return tierConfig.features[feature] === true || (typeof tierConfig.features[feature] === 'number' && (tierConfig.features[feature] as number) !== 0);
}

// Helper function to check if user is within limits
export function isWithinLimit(tier: SubscriptionTier, limitType: keyof SubscriptionTierFeatures['limits'], currentValue: number): boolean {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  const limit = tierConfig.limits[limitType];

  if (typeof limit !== 'number') return true;
  if (limit === -1) return true; // unlimited
  return currentValue < limit;
}

// Get upgrade path recommendation
export function getUpgradePath(currentTier: SubscriptionTier): SubscriptionTier | null {
  const tierOrder: SubscriptionTier[] = ['free', 'starter', 'professional', 'business', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) return null;
  return tierOrder[currentIndex + 1];
}

// Calculate savings for annual billing
export function calculateAnnualSavings(tier: SubscriptionTier): number {
  const config = SUBSCRIPTION_TIERS[tier];
  const monthlyTotal = config.priceMonthlyNIS * 12;
  return monthlyTotal - config.priceAnnualNIS;
}

// Format price in ILS
export function formatPrice(priceNIS: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceNIS);
}
