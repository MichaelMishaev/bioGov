/**
 * Feature Gating Utility
 * Handles subscription tier checks and feature access control
 * Phase 3 Week 4: Feature Gating System
 */

import { query } from './db';

// ============================================================================
// TYPES
// ============================================================================

export type SubscriptionTier = 'free' | 'starter' | 'professional';
export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'canceled' | 'expired';

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingPeriod?: 'monthly' | 'yearly';
  amountCents?: number;
  currency: string;
  trialEndsAt?: Date;
  trialUsed: boolean;
  startsAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd?: Date;
  canceledAt?: Date;
  endsAt?: Date;
  paymentProvider?: string;
  externalSubscriptionId?: string;
  externalCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlag {
  featureKey: string;
  featureName: string;
  description?: string;
  requiredTier: SubscriptionTier;
  enabled: boolean;
  freeTierLimit?: number;
  starterTierLimit?: number;
  professionalTierLimit?: number;
  category?: string;
}

export interface FeatureUsage {
  featureKey: string;
  featureName: string;
  usageCount: number;
  usageLimit?: number;
  hasAccess: boolean;
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: SubscriptionTier;
  usageCount?: number;
  usageLimit?: number;
}

// ============================================================================
// SUBSCRIPTION TIER PRICING (ILS)
// ============================================================================

export const SUBSCRIPTION_PRICING = {
  free: {
    monthly: 0,
    yearly: 0,
    name: 'חינם',
    nameEn: 'Free',
  },
  starter: {
    monthly: 9900, // ₪99.00
    yearly: 99000, // ₪990.00 (save 2 months)
    name: 'מתחיל',
    nameEn: 'Starter',
  },
  professional: {
    monthly: 19900, // ₪199.00
    yearly: 199000, // ₪1,990.00 (save 2 months)
    name: 'מקצועי',
    nameEn: 'Professional',
  },
} as const;

// ============================================================================
// FEATURE DEFINITIONS
// ============================================================================

export const FEATURES = {
  // Free tier
  BASIC_INVOICING: 'basic_invoicing',
  BASIC_EXPENSES: 'basic_expenses',
  TASK_MANAGEMENT: 'task_management',

  // Starter tier
  PROFIT_LOSS_REPORTS: 'profit_loss_reports',
  CASH_FLOW_TRACKING: 'cash_flow_tracking',
  PAYMENT_TRACKING: 'payment_tracking',
  EXPENSE_CATEGORIES: 'expense_categories',

  // Professional tier
  PAYMENT_REMINDERS: 'payment_reminders',
  BANK_SYNC: 'bank_sync',
  ADVANCED_REPORTS: 'advanced_reports',
  MULTI_CURRENCY: 'multi_currency',
  API_ACCESS: 'api_access',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user's current active subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const result = await query(
    `SELECT
      id,
      user_id as "userId",
      tier,
      status,
      billing_period as "billingPeriod",
      amount_cents as "amountCents",
      currency,
      trial_ends_at as "trialEndsAt",
      trial_used as "trialUsed",
      starts_at as "startsAt",
      current_period_start as "currentPeriodStart",
      current_period_end as "currentPeriodEnd",
      canceled_at as "canceledAt",
      ends_at as "endsAt",
      payment_provider as "paymentProvider",
      external_subscription_id as "externalSubscriptionId",
      external_customer_id as "externalCustomerId",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM user_subscriptions
    WHERE user_id = $1 AND status = 'active'
    LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as UserSubscription;
}

/**
 * Get user's subscription tier (defaults to 'free' if no subscription)
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const subscription = await getUserSubscription(userId);
  return subscription?.tier || 'free';
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(
  userId: string,
  featureKey: string
): Promise<FeatureAccessResult> {
  try {
    const result = await query(
      `SELECT has_feature_access($1, $2) as has_access`,
      [userId, featureKey]
    );

    const hasAccess = result.rows[0]?.has_access || false;

    if (!hasAccess) {
      // Get feature details to provide upgrade info
      const featureResult = await query(
        `SELECT required_tier as "requiredTier" FROM feature_flags WHERE feature_key = $1`,
        [featureKey]
      );

      const requiredTier = featureResult.rows[0]?.requiredTier as SubscriptionTier;

      return {
        hasAccess: false,
        reason: 'Upgrade required',
        upgradeRequired: requiredTier,
      };
    }

    return { hasAccess: true };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return {
      hasAccess: false,
      reason: 'Error checking access',
    };
  }
}

/**
 * Increment feature usage counter (for rate-limited features)
 */
export async function incrementFeatureUsage(
  userId: string,
  featureKey: string
): Promise<void> {
  try {
    await query(
      `SELECT increment_feature_usage($1, $2)`,
      [userId, featureKey]
    );
  } catch (error) {
    console.error('Error incrementing feature usage:', error);
    throw error;
  }
}

/**
 * Get user's feature usage summary
 */
export async function getFeatureUsageSummary(
  userId: string
): Promise<FeatureUsage[]> {
  try {
    const result = await query(
      `SELECT * FROM get_feature_usage_summary($1)`,
      [userId]
    );

    return result.rows.map(row => ({
      featureKey: row.feature_key,
      featureName: row.feature_name,
      usageCount: row.usage_count || 0,
      usageLimit: row.usage_limit,
      hasAccess: row.has_access || false,
    }));
  } catch (error) {
    console.error('Error getting feature usage summary:', error);
    return [];
  }
}

/**
 * Create a free tier subscription for a new user
 */
export async function createFreeSubscription(userId: string): Promise<void> {
  try {
    await query(
      `INSERT INTO user_subscriptions (user_id, tier, status)
       VALUES ($1, 'free', 'active')
       ON CONFLICT DO NOTHING`,
      [userId]
    );
  } catch (error) {
    console.error('Error creating free subscription:', error);
    throw error;
  }
}

/**
 * Upgrade user's subscription to a new tier
 */
export async function upgradeSubscription(
  userId: string,
  newTier: SubscriptionTier,
  billingPeriod: 'monthly' | 'yearly',
  paymentProvider?: string,
  externalSubscriptionId?: string
): Promise<void> {
  try {
    const pricing = SUBSCRIPTION_PRICING[newTier];
    const amountCents = billingPeriod === 'monthly' ? pricing.monthly : pricing.yearly;

    // Cancel existing subscription
    await query(
      `UPDATE user_subscriptions
       SET status = 'canceled', canceled_at = NOW(), ends_at = current_period_end
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    // Create new subscription
    const currentPeriodEnd = new Date();
    if (billingPeriod === 'monthly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    await query(
      `INSERT INTO user_subscriptions (
        user_id, tier, status, billing_period, amount_cents, currency,
        current_period_end, payment_provider, external_subscription_id
      ) VALUES ($1, $2, 'active', $3, $4, 'ILS', $5, $6, $7)`,
      [userId, newTier, billingPeriod, amountCents, currentPeriodEnd, paymentProvider, externalSubscriptionId]
    );
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    throw error;
  }
}

/**
 * Cancel user's subscription (at end of billing period)
 */
export async function cancelSubscription(userId: string): Promise<void> {
  try {
    await query(
      `UPDATE user_subscriptions
       SET status = 'canceled', canceled_at = NOW(), ends_at = current_period_end
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Middleware helper for API routes to check feature access
 */
export async function requireFeatureAccess(
  userId: string,
  featureKey: string
): Promise<{ authorized: boolean; error?: { message: string; upgradeRequired?: SubscriptionTier } }> {
  const access = await hasFeatureAccess(userId, featureKey);

  if (!access.hasAccess) {
    return {
      authorized: false,
      error: {
        message: access.reason || 'Access denied',
        upgradeRequired: access.upgradeRequired,
      },
    };
  }

  return { authorized: true };
}

/**
 * Format subscription tier name in Hebrew
 */
export function formatTierName(tier: SubscriptionTier): string {
  return SUBSCRIPTION_PRICING[tier].name;
}

/**
 * Format price in ILS
 */
export function formatPrice(amountCents: number): string {
  const amount = amountCents / 100;
  return `₪${amount.toFixed(0)}`;
}

/**
 * Get tier comparison data for upgrade prompts
 */
export function getTierComparison(currentTier: SubscriptionTier, targetTier: SubscriptionTier) {
  const current = SUBSCRIPTION_PRICING[currentTier];
  const target = SUBSCRIPTION_PRICING[targetTier];

  return {
    currentTier: {
      name: current.name,
      monthlyPrice: formatPrice(current.monthly),
    },
    targetTier: {
      name: target.name,
      monthlyPrice: formatPrice(target.monthly),
      yearlyPrice: formatPrice(target.yearly),
      monthlySavings: formatPrice((target.monthly * 12 - target.yearly)),
    },
  };
}
