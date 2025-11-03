/**
 * Financial Dashboard Page
 * Comprehensive view of cash flow, expenses, and financial health
 * Phase 3: Daily Engagement Features
 */

import { Metadata } from 'next';
import CashFlowWidget from '@/components/finances/CashFlowWidget';
import UnpaidInvoicesWidget from '@/components/finances/UnpaidInvoicesWidget';
import ProfitLossWidget from '@/components/finances/ProfitLossWidget';

export const metadata: Metadata = {
  title: 'תזרים מזומנים | bioGov',
  description: 'נהל את התזרים הכספי של העסק שלך - הכנסות, הוצאות, רווחים וחשבוניות ממתינות',
};

export default function FinancesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* Navigation Back to Dashboard */}
      <div className="max-w-7xl mx-auto mb-4">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          <span className="text-lg">→</span>
          <span>חזור ללוח הבקרה</span>
        </a>
      </div>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
          תזרים מזומנים ומצב כספי
        </h1>
        <p className="text-sm sm:text-base text-gray-600 break-words">
          תצוגה מקיפה של המצב הכספי של העסק שלך - מעודכן בזמן אמת
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Cash Flow (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <CashFlowWidget />

          {/* Profit & Loss Statement */}
          <div className="mt-6">
            <ProfitLossWidget />
          </div>

          {/* Additional Financial Metrics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Stats Card 1 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  ממוצע חודשי
                </h3>
                <span className="text-2xl">📊</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">הכנסות</span>
                  <span className="text-lg font-bold text-green-600">
                    ₪15,000
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">הוצאות</span>
                  <span className="text-lg font-bold text-red-600">₪8,500</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">
                    רווח נקי
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    ₪6,500
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Card 2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  מצב מע״מ
                </h3>
                <span className="text-2xl">💰</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">מע״מ שנגבה</span>
                  <span className="text-lg font-bold text-green-600">
                    ₪2,700
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">מע״מ ששולם</span>
                  <span className="text-lg font-bold text-red-600">₪1,530</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">
                    לתשלום
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    ₪1,170
                  </span>
                </div>
              </div>
              <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                צור דוח מע״מ
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              תנועות אחרונות
            </h3>
            <div className="space-y-3">
              {[
                {
                  type: 'income',
                  description: 'חשבונית #2024-1234',
                  amount: 5000,
                  date: '15 דצמבר',
                },
                {
                  type: 'expense',
                  description: 'דלק - תחנת פז',
                  amount: -250,
                  date: '14 דצמבר',
                },
                {
                  type: 'income',
                  description: 'חשבונית #2024-1233',
                  amount: 3200,
                  date: '12 דצמבר',
                },
                {
                  type: 'expense',
                  description: 'אירוח אתר',
                  amount: -180,
                  date: '10 דצמבר',
                },
              ].map((transaction, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      <span className="text-lg">
                        {transaction.type === 'income' ? '↓' : '↑'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : ''}
                    {transaction.amount.toLocaleString('he-IL', {
                      style: 'currency',
                      currency: 'ILS',
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full text-blue-600 hover:text-blue-700 text-sm font-medium">
              צפה בכל התנועות ←
            </button>
          </div>
        </div>

        {/* Right Column - Unpaid Invoices & Actions (1/3 width on large screens) */}
        <div className="lg:col-span-1 space-y-6">
          <UnpaidInvoicesWidget />

          {/* Quick Actions Panel */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">פעולות מהירות</h3>
            <div className="space-y-3">
              <button className="w-full bg-white hover:bg-gray-100 text-blue-600 px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-between">
                <span>צור חשבונית חדשה</span>
                <span className="text-xl">📄</span>
              </button>
              <button className="w-full bg-white hover:bg-gray-100 text-blue-600 px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-between">
                <span>הוסף הוצאה</span>
                <span className="text-xl">📸</span>
              </button>
              <button className="w-full bg-white hover:bg-gray-100 text-blue-600 px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-between">
                <span>רשום תשלום</span>
                <span className="text-xl">💳</span>
              </button>
              <button className="w-full bg-white hover:bg-gray-100 text-blue-600 px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-between">
                <span>צפה בלקוחות</span>
                <span className="text-xl">👥</span>
              </button>
            </div>
          </div>

          {/* Financial Health Score */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                ציון בריאות כספית
              </h3>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 border-4 border-green-500">
                <span className="text-3xl font-bold text-green-700">85</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">מצוין!</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">תזרים מזומנים חיובי</span>
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">יחס רווח טוב</span>
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ללא חריגות מע״מ</span>
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">תשלומים בזמן</span>
                <span className="text-yellow-600 font-semibold">~</span>
              </div>
            </div>
            <button className="mt-4 w-full text-blue-600 hover:text-blue-700 text-sm font-medium">
              קבל המלצות לשיפור ←
            </button>
          </div>

          {/* Upgrade Prompt for Free Users */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-md p-6 text-white">
            <div className="text-center">
              <span className="text-4xl mb-3 block">🚀</span>
              <h3 className="text-lg font-semibold mb-2">
                שדרג לחבילה מקצועית
              </h3>
              <p className="text-sm text-purple-100 mb-4">
                קבל גישה לדוחות P&L, סריקת קבלות OCR, סנכרון בנק אוטומטי ועוד
              </p>
              <button className="w-full bg-white hover:bg-gray-100 text-purple-600 px-4 py-3 rounded-md text-sm font-bold transition-colors">
                שדרג עכשיו - ₪99/חודש
              </button>
              <p className="text-xs text-purple-200 mt-2">
                45 יום ניסיון חינם
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
