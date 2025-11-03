'use client';

/**
 * Subscription Card Component
 * Displays user's subscription tier and upgrade options
 * Phase 3 Week 4: Feature Gating System
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Lock, TrendingUp } from 'lucide-react';

type SubscriptionTier = 'free' | 'starter' | 'professional';

interface SubscriptionData {
  tier: SubscriptionTier;
  status: string;
  features?: any;
  summary?: {
    totalFeatures: number;
    accessibleFeatures: number;
    restrictedFeatures: number;
  };
}

const TIER_INFO = {
  free: {
    name: 'חינם',
    nameEn: 'Free',
    price: '₪0',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    features: [
      'חשבוניות בסיסיות',
      'מעקב הוצאות',
      'ניהול משימות',
    ],
  },
  starter: {
    name: 'מתחיל',
    nameEn: 'Starter',
    price: '₪99',
    priceYearly: '₪990',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    features: [
      'כל תכונות החינם',
      'דוחות רווח והפסד',
      'מעקב תזרים מזומנים',
      'מעקב תשלומים',
      'קטגוריות הוצאות',
    ],
  },
  professional: {
    name: 'מקצועי',
    nameEn: 'Professional',
    price: '₪199',
    priceYearly: '₪1,990',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    features: [
      'כל תכונות המתחיל',
      'תזכורות תשלום אוטומטיות',
      'סנכרון בנק',
      'דוחות מתקדמים',
      'תמיכה במטבעות מרובים',
      'גישת API',
    ],
  },
};

export default function SubscriptionCard() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: SubscriptionTier, billingPeriod: 'monthly' | 'yearly') => {
    try {
      setUpgrading(true);

      // In production, this would integrate with payment provider (Stripe/PayPal)
      // For now, directly upgrade (free trial simulation)
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tier,
          billingPeriod,
          paymentProvider: 'manual', // Would be 'stripe' or 'paypal' in production
        }),
      });

      if (response.ok) {
        // Refresh subscription data
        await fetchSubscription();
        alert('שדרוג הצליח! כעת יש לך גישה לתכונות נוספות.');
      } else {
        const error = await response.json();
        alert(`שגיאה: ${error.error}`);
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('השדרוג נכשל. אנא נסה שנית.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTier = subscription?.tier || 'free';
  const tierInfo = TIER_INFO[currentTier];

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card className={`border-2 ${tierInfo.borderColor}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className={`w-5 h-5 ${tierInfo.color}`} />
            <span>המנוי שלך: {tierInfo.name}</span>
            {currentTier !== 'free' && (
              <span className={`text-sm font-normal ${tierInfo.color}`}>
                {tierInfo.price}/חודש
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Features */}
          <div>
            <h4 className="font-semibold mb-2">תכונות כלולות:</h4>
            <ul className="space-y-2">
              {tierInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Usage Summary */}
          {subscription?.summary && (
            <div className={`p-3 rounded-lg ${tierInfo.bgColor}`}>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <div className="font-bold text-lg">{subscription.summary.totalFeatures}</div>
                  <div className="text-muted-foreground">סה"כ תכונות</div>
                </div>
                <div>
                  <div className="font-bold text-lg text-green-600">{subscription.summary.accessibleFeatures}</div>
                  <div className="text-muted-foreground">זמינות</div>
                </div>
                <div>
                  <div className="font-bold text-lg text-orange-600">{subscription.summary.restrictedFeatures}</div>
                  <div className="text-muted-foreground">נעולות</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {currentTier !== 'professional' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            שדרג את המנוי שלך
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Starter Tier */}
            {currentTier === 'free' && (
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <CardHeader>
                  <CardTitle className="text-blue-600">מנוי מתחיל</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">₪99</div>
                    <div className="text-sm text-muted-foreground">לחודש</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      או ₪990/שנה (חסכון של ₪198)
                    </div>
                  </div>

                  <ul className="space-y-2 text-sm">
                    {TIER_INFO.starter.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleUpgrade('starter', 'monthly')}
                      disabled={upgrading}
                    >
                      {upgrading ? 'מעבד...' : 'שדרג למנוי חודשי'}
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleUpgrade('starter', 'yearly')}
                      disabled={upgrading}
                    >
                      שדרג למנוי שנתי (חסכון!)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Professional Tier */}
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors relative">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
                מומלץ
              </div>

              <CardHeader>
                <CardTitle className="text-purple-600">מנוי מקצועי</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-purple-600">₪199</div>
                  <div className="text-sm text-muted-foreground">לחודש</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    או ₪1,990/שנה (חסכון של ₪398)
                  </div>
                </div>

                <ul className="space-y-2 text-sm">
                  {TIER_INFO.professional.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleUpgrade('professional', 'monthly')}
                    disabled={upgrading}
                  >
                    {upgrading ? 'מעבד...' : 'שדרג למנוי חודשי'}
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleUpgrade('professional', 'yearly')}
                    disabled={upgrading}
                  >
                    שדרג למנוי שנתי (חסכון!)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Locked Features Notice */}
      {subscription?.summary && subscription.summary.restrictedFeatures > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">
                  יש לך {subscription.summary.restrictedFeatures} תכונות נעולות
                </h4>
                <p className="text-sm text-orange-800">
                  שדרג את המנוי שלך כדי לקבל גישה לכל התכונות המתקדמות
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
