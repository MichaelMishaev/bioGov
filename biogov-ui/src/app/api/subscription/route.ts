/**
 * Subscription Management API
 * Handles user subscription operations and feature access checks
 * Phase 3 Week 4: Feature Gating System
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import {
  getUserSubscription,
  getFeatureUsageSummary,
  hasFeatureAccess,
  FeatureAccessResult,
} from '@/lib/featureGating';

interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * GET /api/subscription
 * Get current user's subscription details and feature access
 */
export async function GET(request: NextRequest) {
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

    // Get subscription details
    const subscription = await getUserSubscription(userId);

    // Get feature usage summary
    const features = await getFeatureUsageSummary(userId);

    // Group features by category
    const featuresByCategory: Record<string, typeof features> = {};
    features.forEach(feature => {
      const category = getCategoryFromFeatureKey(feature.featureKey);
      if (!featuresByCategory[category]) {
        featuresByCategory[category] = [];
      }
      featuresByCategory[category].push(feature);
    });

    return NextResponse.json({
      success: true,
      subscription: subscription || {
        tier: 'free',
        status: 'active',
      },
      features: featuresByCategory,
      summary: {
        totalFeatures: features.length,
        accessibleFeatures: features.filter(f => f.hasAccess).length,
        restrictedFeatures: features.filter(f => !f.hasAccess).length,
      },
    });
  } catch (error) {
    console.error('GET /api/subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription/check-access
 * Check if user has access to a specific feature
 *
 * Body: { featureKey: string }
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
    const { featureKey } = body;

    if (!featureKey) {
      return NextResponse.json(
        { error: 'Feature key is required' },
        { status: 400 }
      );
    }

    // Check access
    const access: FeatureAccessResult = await hasFeatureAccess(userId, featureKey);

    return NextResponse.json({
      success: true,
      featureKey,
      access,
    });
  } catch (error) {
    console.error('POST /api/subscription/check-access error:', error);
    return NextResponse.json(
      { error: 'Failed to check feature access' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get category from feature key
 */
function getCategoryFromFeatureKey(featureKey: string): string {
  if (featureKey.includes('invoice') || featureKey.includes('payment')) {
    return 'invoicing';
  }
  if (featureKey.includes('expense')) {
    return 'expenses';
  }
  if (featureKey.includes('report') || featureKey.includes('cash_flow') || featureKey.includes('profit_loss')) {
    return 'reports';
  }
  if (featureKey.includes('reminder') || featureKey.includes('sync')) {
    return 'automation';
  }
  if (featureKey.includes('task')) {
    return 'compliance';
  }
  if (featureKey.includes('api')) {
    return 'integration';
  }
  return 'other';
}
