'use client';

/**
 * Unpaid Invoices Widget Component
 * Displays outstanding payments with status alerts
 * Phase 3: Daily Engagement Features
 */

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/types/finances';
import type { CashFlowSummary } from '@/types/finances';

interface UnpaidInvoicesWidgetProps {
  className?: string;
}

export default function UnpaidInvoicesWidget({
  className = '',
}: UnpaidInvoicesWidgetProps) {
  const [data, setData] = useState<CashFlowSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnpaidInvoices();
  }, []);

  const fetchUnpaidInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/finances/cash-flow', {
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('נדרש להתחבר מחדש');
        }
        throw new Error('Failed to fetch unpaid invoices');
      }

      const cashFlowData: CashFlowSummary = await response.json();
      setData(cashFlowData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
        <div className="text-red-600">
          <p className="font-semibold text-sm sm:text-base">שגיאה בטעינת נתונים</p>
          <p className="text-xs sm:text-sm">{error}</p>
          <button
            onClick={fetchUnpaidInvoices}
            className="mt-2 text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { unpaidInvoices } = data;
  const totalCount =
    unpaidInvoices.overdue.count +
    unpaidInvoices.dueSoon.count +
    unpaidInvoices.onTrack.count;
  const totalAmount =
    unpaidInvoices.overdue.amount +
    unpaidInvoices.dueSoon.amount +
    unpaidInvoices.onTrack.amount;

  // Show urgent alert if there are overdue invoices
  const hasOverdue = unpaidInvoices.overdue.count > 0;

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`} dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words">חשבוניות שטרם שולמו</h2>
        {hasOverdue && (
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full animate-pulse whitespace-nowrap">
            דורש תשומת לב!
          </span>
        )}
      </div>

      {/* Total Summary */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">סה״כ חשבוניות ממתינות</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalCount}</p>
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm text-gray-600">סכום כולל</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 break-words">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="space-y-3">
        {/* Overdue - Red Alert */}
        {unpaidInvoices.overdue.count > 0 && (
          <div className="bg-red-50 border-r-4 border-red-500 rounded-lg p-3 sm:p-4 hover:bg-red-100 transition-colors cursor-pointer">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-600 text-lg sm:text-xl">🚨</span>
                  <p className="text-xs sm:text-sm font-semibold text-red-800">
                    באיחור - דורש טיפול מיידי
                  </p>
                </div>
                <p className="text-xs text-red-600">
                  חלפה תאריך התשלום - שלח תזכורת או צור קשר עם הלקוח
                </p>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-red-900">
                  {unpaidInvoices.overdue.count}
                </p>
                <p className="text-xs sm:text-sm text-red-700 font-medium">
                  {formatCurrency(unpaidInvoices.overdue.amount)}
                </p>
              </div>
            </div>
            <button className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors">
              שלח תזכורת תשלום
            </button>
          </div>
        )}

        {/* Due Soon - Yellow Warning */}
        {unpaidInvoices.dueSoon.count > 0 && (
          <div className="bg-yellow-50 border-r-4 border-yellow-500 rounded-lg p-3 sm:p-4 hover:bg-yellow-100 transition-colors cursor-pointer">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-600 text-lg sm:text-xl">⏰</span>
                  <p className="text-xs sm:text-sm font-semibold text-yellow-800">
                    מועד תשלום מתקרב (תוך 7 ימים)
                  </p>
                </div>
                <p className="text-xs text-yellow-600">
                  מומלץ לשלוח תזכורת עדינה ללקוח
                </p>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-yellow-900">
                  {unpaidInvoices.dueSoon.count}
                </p>
                <p className="text-xs sm:text-sm text-yellow-700 font-medium">
                  {formatCurrency(unpaidInvoices.dueSoon.amount)}
                </p>
              </div>
            </div>
            <button className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors">
              שלח תזכורת מוקדמת
            </button>
          </div>
        )}

        {/* On Track - Green Success */}
        {unpaidInvoices.onTrack.count > 0 && (
          <div className="bg-green-50 border-r-4 border-green-500 rounded-lg p-3 sm:p-4 hover:bg-green-100 transition-colors cursor-pointer">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-600 text-lg sm:text-xl">✅</span>
                  <p className="text-xs sm:text-sm font-semibold text-green-800">
                    במסלול טוב (מעל 7 ימים)
                  </p>
                </div>
                <p className="text-xs text-green-600">
                  אין צורך בפעולה כרגע - נשלח תזכורת אוטומטית כאשר יגיע המועד
                </p>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-green-900">
                  {unpaidInvoices.onTrack.count}
                </p>
                <p className="text-xs sm:text-sm text-green-700 font-medium">
                  {formatCurrency(unpaidInvoices.onTrack.amount)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalCount === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <span className="text-5xl mb-3 block">🎉</span>
            <p className="text-lg font-semibold text-blue-900 mb-1">
              כל החשבוניות שולמו!
            </p>
            <p className="text-sm text-blue-600">
              אין לך חשבוניות ממתינות לתשלום כרגע
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {totalCount > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              צפה בכל החשבוניות
            </button>
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              דוח תזרים מזומנים
            </button>
          </div>
        </div>
      )}

      {/* Payment Statistics */}
      {totalCount > 0 && (
        <div className="mt-4 bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-700 font-medium mb-2">
            💡 טיפ: זמן תשלום ממוצע
          </p>
          <p className="text-xs text-purple-600">
            לקוחות בישראל משלמים בממוצע תוך 30-45 יום. שליחת תזכורות עוזרת לקצר את
            הזמן ב-40%.
          </p>
        </div>
      )}
    </div>
  );
}
