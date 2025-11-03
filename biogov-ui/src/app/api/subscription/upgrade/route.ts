/**
 * Subscription Upgrade API
 * Handles subscription tier upgrades
 * Phase 3 Week 4: Feature Gating System
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import {
  upgradeSubscription,
  SubscriptionTier,
  SUBSCRIPTION_PRICING,
  formatPrice,
} from '@/lib/featureGating';

interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * POST /api/subscription/upgrade
 * Upgrade user's subscription to a new tier
 *
 * Body:
 * {
 *   tier: 'starter' | 'professional',
 *   billingPeriod: 'monthly' | 'yearly',
 *   paymentProvider?: string,
 *   externalSubscriptionId?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;
    const userId = decoded.userId;

    // Get request body
    const body = await request.json();
    const {
      tier,
      billingPeriod,
      paymentProvider,
      externalSubscriptionId,
    } = body;

    // Validate tier
    if (!tier || !['starter', 'professional'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier. Must be "starter" or "professional".' },
        { status: 400 }
      );
    }

    // Validate billing period
    if (!billingPeriod || !['monthly', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json(
        { error: 'Invalid billing period. Must be "monthly" or "yearly".' },
        { status: 400 }
      );
    }

    // Upgrade subscription
    await upgradeSubscription(
      userId,
      tier as SubscriptionTier,
      billingPeriod as 'monthly' | 'yearly',
      paymentProvider,
      externalSubscriptionId
    );

    // Get pricing info
    const pricing = SUBSCRIPTION_PRICING[tier as SubscriptionTier];
    const amountCents = billingPeriod === 'monthly' ? pricing.monthly : pricing.yearly;

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${pricing.name} tier`,
      subscription: {
        tier,
        billingPeriod,
        amount: formatPrice(amountCents),
        amountCents,
      },
    });
  } catch (error) {
    console.error('POST /api/subscription/upgrade error:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}
