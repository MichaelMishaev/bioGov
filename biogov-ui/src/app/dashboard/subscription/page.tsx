'use client';

/**
 * Subscription Management Page
 * Displays subscription tiers and allows users to upgrade/manage their plan
 * Phase 3 Week 4: Feature Gating System
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import SubscriptionCard from '@/components/SubscriptionCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SubscriptionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="gradient-hero text-white sticky top-0 z-10 shadow-xl">
        <div className="container mx-auto container-mobile py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">ניהול מנוי</h1>
              <p className="text-white/80 text-sm">בחר את החבילה המתאימה לך</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto container-mobile py-6 sm:py-8">
        <SubscriptionCard />
      </div>
    </div>
  );
}
