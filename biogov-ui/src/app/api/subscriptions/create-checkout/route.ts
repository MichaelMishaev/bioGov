/**
 * POST /api/subscriptions/create-checkout
 * Create a Stripe Checkout session to start subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, createOrRetrieveCustomer, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { query } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

interface CheckoutRequestBody {
  tier: 'starter' | 'professional' | 'business';
  billingPeriod: 'monthly' | 'annual';
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as { userId: string };
    const userId = decoded.userId;

    // 2. Get user information
    const users = await query(
      `SELECT id, email, subscription_tier
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (users.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users.rows[0];

    // 3. Parse request body
    const body: CheckoutRequestBody = await request.json();
    const { tier, billingPeriod } = body;

    // Validate tier
    if (!['starter', 'professional', 'business'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier', message: 'Tier must be starter, professional, or business' },
        { status: 400 }
      );
    }

    // Validate billing period
    if (!['monthly', 'annual'].includes(billingPeriod)) {
      return NextResponse.json(
        { error: 'Invalid billing period', message: 'Billing period must be monthly or annual' },
        { status: 400 }
      );
    }

    // 4. Get Stripe price ID
    const priceKey = `${tier}_${billingPeriod}` as keyof typeof STRIPE_PRICE_IDS;
    const priceId = STRIPE_PRICE_IDS[priceKey];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured', message: 'This subscription tier is not available yet' },
        { status: 500 }
      );
    }

    // 5. Create or retrieve Stripe customer
    const customerId = await createOrRetrieveCustomer(user.email, userId);

    // 6. Check if user already has an active subscription
    const existingSubscriptions = await query(
      `SELECT id, status
       FROM subscriptions
       WHERE user_id = $1
         AND status IN ('active', 'trialing')
       LIMIT 1`,
      [userId]
    );

    if (existingSubscriptions.rows.length > 0) {
      return NextResponse.json(
        {
          error: 'Subscription exists',
          message: 'You already have an active subscription. Please cancel or upgrade through billing portal.',
        },
        { status: 400 }
      );
    }

    // 7. Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003';
    const session = await createCheckoutSession({
      customerId,
      priceId,
      userId,
      userEmail: user.email,
      successUrl: `${baseUrl}/dashboard?subscription=success`,
      cancelUrl: `${baseUrl}/pricing?subscription=canceled`,
      trialDays: user.subscription_tier === 'free' ? 45 : undefined, // 45-day trial for new users
    });

    // 8. Return checkout URL
    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
