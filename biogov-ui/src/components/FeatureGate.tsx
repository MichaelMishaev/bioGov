'use client';

/**
 * Feature Gate Component
 * Displays upgrade prompts for restricted features
 * Phase 3 Week 4: Feature Gating System
 */

import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, TrendingUp, Zap } from 'lucide-react';

type SubscriptionTier = 'starter' | 'professional';

interface FeatureGateProps {
  /** The minimum tier required to access this feature */
  requiredTier: SubscriptionTier;
  /** Feature name in Hebrew */
  featureName: string;
  /** Feature description in Hebrew */
  featureDescription?: string;
  /** Icon component */
  icon?: ReactNode;
  /** Callback when upgrade button is clicked */
  onUpgrade?: (tier: SubscriptionTier) => void;
}

const TIER_INFO = {
  starter: {
    name: 'מתחיל',
    price: '₪99',
    color: 'blue',
    benefits: [
      'דוחות רווח והפסד מלאים',
      'מעקב תזרים מזומנים',
      'מעקב תשלומים',
      'קטגוריות הוצאות',
    ],
  },
  professional: {
    name: 'מקצועי',
    price: '₪199',
    color: 'purple',
    benefits: [
      'תזכורות תשלום אוטומטיות',
      'סנכרון בנק אוטומטי',
      'דוחות מתקדמים',
      'תמיכה במטבעות מרובים',
      'גישת API',
    ],
  },
};

export default function FeatureGate({
  requiredTier,
  featureName,
  featureDescription,
  icon,
  onUpgrade,
}: FeatureGateProps) {
  const tierInfo = TIER_INFO[requiredTier];
  const colorClass = tierInfo.color === 'blue' ? 'blue' : 'purple';

  const bgColors = {
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
  };

  const borderColors = {
    blue: 'border-blue-200',
    purple: 'border-purple-200',
  };

  const textColors = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  };

  const buttonColors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade(requiredTier);
    } else {
      // Default: redirect to subscription page
      window.location.href = '/dashboard/subscription';
    }
  };

  return (
    <Card className={`border-2 ${borderColors[colorClass]} ${bgColors[colorClass]}`}>
      <CardContent className="p-6 sm:p-8">
        <div className="text-center max-w-md mx-auto space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            {icon ? (
              <div className={`p-4 rounded-full ${bgColors[colorClass]} border-2 ${borderColors[colorClass]}`}>
                {icon}
              </div>
            ) : (
              <Lock className={`w-16 h-16 ${textColors[colorClass]}`} />
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              {featureName}
            </h3>
            {featureDescription && (
              <p className="text-muted-foreground text-sm sm:text-base">
                {featureDescription}
              </p>
            )}
          </div>

          {/* Lock Notice */}
          <div className={`p-4 rounded-lg border ${borderColors[colorClass]} bg-white`}>
            <div className="flex items-start gap-3">
              <Crown className={`w-5 h-5 ${textColors[colorClass]} flex-shrink-0 mt-0.5`} />
              <div className="text-right">
                <h4 className="font-semibold mb-1">
                  תכונה זו זמינה במנוי {tierInfo.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  שדרג את המנוי שלך ל-{tierInfo.name} כדי לקבל גישה לתכונה זו ועוד
                </p>
              </div>
            </div>
          </div>

          {/* Tier Benefits */}
          <div className="text-right">
            <h4 className="font-semibold mb-3 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              מה כלול במנוי {tierInfo.name}:
            </h4>
            <ul className="space-y-2 text-sm">
              {tierInfo.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${textColors[colorClass]} flex-shrink-0`} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className={`p-4 rounded-lg ${bgColors[colorClass]} border ${borderColors[colorClass]}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${textColors[colorClass]} mb-1`}>
                {tierInfo.price}
              </div>
              <div className="text-sm text-muted-foreground">לחודש</div>
              <div className="text-xs text-muted-foreground mt-1">
                או חסכון עם תשלום שנתי
              </div>
            </div>
          </div>

          {/* Upgrade Button */}
          <div className="space-y-3">
            <Button
              className={`w-full ${buttonColors[colorClass]} text-white`}
              size="lg"
              onClick={handleUpgradeClick}
            >
              <Crown className="w-5 h-5 ml-2" />
              שדרג למנוי {tierInfo.name}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => window.location.href = '/dashboard/subscription'}
            >
              השוואת כל החבילות →
            </Button>
          </div>

          {/* Guarantee */}
          <p className="text-xs text-muted-foreground">
            ✓ ביטול בכל עת • ✓ ללא התחייבות • ✓ גישה מיידית לכל התכונות
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
