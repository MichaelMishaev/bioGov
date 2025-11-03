'use client';

/**
 * Offline Indicator Component
 * Shows connection status and queued operations
 * PWA Feature - Mobile First
 */

import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Initial state
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide success message after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isOnline
          ? 'bg-green-500'
          : 'bg-amber-500'
      } text-white px-4 py-2 text-center text-sm font-medium shadow-lg`}
      dir="rtl"
    >
      {isOnline ? (
        <div className="flex items-center justify-center gap-2">
          <span>✓</span>
          <span>חזרת לאינטרנט - מסנכרן נתונים...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <span>⚠</span>
          <span>אין חיבור לאינטרנט - פועל במצב לא מקוון</span>
        </div>
      )}
    </div>
  );
}
