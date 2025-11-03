'use client';

/**
 * Profit & Loss Widget Component
 * Displays comprehensive P&L statement with Israeli tax calculations
 * Phase 3 Week 3: P&L Dashboard
 */

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatPercentage } from '@/types/finances';

type TimePeriod = 'month' | 'quarter' | 'year' | 'all-time';

interface ProfitLossData {
  period: {
    type: string;
    label: string;
    start_date: string;
    end_date: string;
  };
  revenue: {
    gross: number;
    vat_collected: number;
    net: number;
    invoice_count: number;
    paid_count: number;
    average_invoice: number;
  };
  expenses: {
    total: number;
    vat_paid: number;
    expense_count: number;
    average_expense: number;
    by_category: Array<{
      category: string;
      amount: number;
      amount_cents: number;
    }>;
  };
  profit: {
    gross: number;
    gross_margin_percent: number;
    net: number;
    net_margin_percent: number;
  };
  vat: {
    collected: number;
    paid: number;
    net_owed: number;
    rate_percent: number;
  };
  taxes: {
    income_tax: number;
    national_insurance: number;
    health_tax: number;
    total: number;
    effective_rate_percent: number;
  };
  take_home: {
    amount: number;
    after_vat_and_taxes: number;
  };
  comparison?: {
    period: string;
    revenue_change_percent: number;
    profit_change_percent: number;
  };
}

interface ProfitLossWidgetProps {
  className?: string;
}

export default function ProfitLossWidget({ className = '' }: ProfitLossWidgetProps) {
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfitLoss();
  }, [period]);

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/finances/profit-loss?period=${period}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('נדרש להתחבר מחדש');
        }
        throw new Error('Failed to fetch profit & loss data');
      }

      const plData: ProfitLossData = await response.json();
      setData(plData);
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
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
            onClick={fetchProfitLoss}
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

  // Prepare chart data
  const overviewChartData = [
    { name: 'הכנסות', value: data.revenue.net, color: '#10B981' },
    { name: 'הוצאות', value: data.expenses.total, color: '#EF4444' },
    { name: 'רווח', value: data.profit.gross, color: data.profit.gross >= 0 ? '#3B82F6' : '#F59E0B' },
  ];

  const taxChartData = [
    { name: 'מס הכנסה', value: data.taxes.income_tax },
    { name: 'ביטוח לאומי', value: data.taxes.national_insurance },
    { name: 'מס בריאות', value: data.taxes.health_tax },
  ];

  // Category colors for pie chart
  const CATEGORY_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
    '#06B6D4', '#A855F7',
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`} dir="rtl">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">דוח רווח והפסד</h2>
          <p className="text-xs sm:text-sm text-gray-600">{data.period.label}</p>
        </div>
        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
          <button
            onClick={() => setPeriod('month')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              period === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            חודש
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              period === 'quarter'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            רבעון
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              period === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            שנה
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {/* Revenue */}
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
          <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">הכנסות נטו</p>
          <p className="text-lg sm:text-2xl font-bold text-green-900 break-words">
            {formatCurrency(data.revenue.net)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {data.revenue.invoice_count} חשבוניות
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200">
          <p className="text-xs sm:text-sm text-red-700 font-medium mb-1">הוצאות</p>
          <p className="text-lg sm:text-2xl font-bold text-red-900 break-words">
            {formatCurrency(data.expenses.total)}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {data.expenses.expense_count} הוצאות
          </p>
        </div>

        {/* Gross Profit */}
        <div
          className={`rounded-lg p-3 sm:p-4 border ${
            data.profit.gross >= 0
              ? 'bg-blue-50 border-blue-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <p
            className={`text-xs sm:text-sm font-medium mb-1 ${
              data.profit.gross >= 0 ? 'text-blue-700' : 'text-amber-700'
            }`}
          >
            רווח גולמי
          </p>
          <p
            className={`text-lg sm:text-2xl font-bold break-words ${
              data.profit.gross >= 0 ? 'text-blue-900' : 'text-amber-900'
            }`}
          >
            {formatCurrency(data.profit.gross)}
          </p>
          <p
            className={`text-xs mt-1 ${
              data.profit.gross >= 0 ? 'text-blue-600' : 'text-amber-600'
            }`}
          >
            {formatPercentage(data.profit.gross_margin_percent)} רווחיות
          </p>
        </div>
      </div>

      {/* Comparison Indicator */}
      {data.comparison && (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-6 border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">שינוי לעומת חודש שעבר</p>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500">הכנסות</p>
              <p
                className={`text-sm font-semibold ${
                  data.comparison.revenue_change_percent >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {data.comparison.revenue_change_percent >= 0 ? '↑' : '↓'}{' '}
                {formatPercentage(Math.abs(data.comparison.revenue_change_percent))}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">רווח</p>
              <p
                className={`text-sm font-semibold ${
                  data.comparison.profit_change_percent >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {data.comparison.profit_change_percent >= 0 ? '↑' : '↓'}{' '}
                {formatPercentage(Math.abs(data.comparison.profit_change_percent))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Chart */}
      <div className="mb-6 -mx-2 sm:mx-0">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">סקירה כללית</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={overviewChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              style={{ fontSize: '12px', fontFamily: 'inherit' }}
            />
            <YAxis
              stroke="#6B7280"
              style={{ fontSize: '12px', fontFamily: 'inherit' }}
              tickFormatter={(value) => `₪${value.toLocaleString('he-IL')}`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '8px',
                direction: 'rtl',
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {overviewChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tax Breakdown */}
      <div className="bg-purple-50 rounded-lg p-3 sm:p-4 mb-6 border border-purple-200">
        <h3 className="text-sm sm:text-base font-semibold text-purple-900 mb-3">
          מסים והטלים
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-purple-700">מס הכנסה (30%)</span>
            <span className="text-sm sm:text-base font-bold text-purple-900">
              {formatCurrency(data.taxes.income_tax)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-purple-700">ביטוח לאומי (7.6%)</span>
            <span className="text-sm sm:text-base font-bold text-purple-900">
              {formatCurrency(data.taxes.national_insurance)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-purple-700">מס בריאות (5%)</span>
            <span className="text-sm sm:text-base font-bold text-purple-900">
              {formatCurrency(data.taxes.health_tax)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-purple-300">
            <span className="text-xs sm:text-sm font-semibold text-purple-900">
              סה״כ מסים
            </span>
            <span className="text-base sm:text-lg font-bold text-purple-900">
              {formatCurrency(data.taxes.total)}
            </span>
          </div>
          <p className="text-xs text-purple-600 mt-2">
            שיעור מס אפקטיבי: {formatPercentage(data.taxes.effective_rate_percent)}
          </p>
        </div>
      </div>

      {/* VAT Position */}
      <div
        className={`rounded-lg p-3 sm:p-4 mb-6 border ${
          data.vat.net_owed >= 0
            ? 'bg-orange-50 border-orange-200'
            : 'bg-blue-50 border-blue-200'
        }`}
      >
        <h3
          className={`text-sm sm:text-base font-semibold mb-3 ${
            data.vat.net_owed >= 0 ? 'text-orange-900' : 'text-blue-900'
          }`}
        >
          מצב מע״מ (18%)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={`text-xs ${data.vat.net_owed >= 0 ? 'text-orange-600' : 'text-blue-600'}`}>
              מע״מ שנגבה
            </p>
            <p
              className={`text-sm sm:text-base font-bold ${
                data.vat.net_owed >= 0 ? 'text-orange-900' : 'text-blue-900'
              }`}
            >
              {formatCurrency(data.vat.collected)}
            </p>
          </div>
          <div>
            <p className={`text-xs ${data.vat.net_owed >= 0 ? 'text-orange-600' : 'text-blue-600'}`}>
              מע״מ ששולם
            </p>
            <p
              className={`text-sm sm:text-base font-bold ${
                data.vat.net_owed >= 0 ? 'text-orange-900' : 'text-blue-900'
              }`}
            >
              {formatCurrency(data.vat.paid)}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-orange-300">
          <p className={`text-xs ${data.vat.net_owed >= 0 ? 'text-orange-700' : 'text-blue-700'}`}>
            {data.vat.net_owed >= 0 ? 'לתשלום למס הכנסה' : 'זיכוי ממס הכנסה'}
          </p>
          <p
            className={`text-lg sm:text-xl font-bold ${
              data.vat.net_owed >= 0 ? 'text-orange-900' : 'text-blue-900'
            }`}
          >
            {formatCurrency(Math.abs(data.vat.net_owed))}
          </p>
        </div>
      </div>

      {/* Net Profit / Take Home */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 sm:p-6 text-white mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3">רווח נקי (לאחר מסים)</h3>
        <p className="text-3xl sm:text-4xl font-bold mb-2">
          {formatCurrency(data.take_home.amount)}
        </p>
        <p className="text-xs sm:text-sm text-blue-100">
          {formatPercentage(data.profit.net_margin_percent)} רווחיות נטו
        </p>
        <div className="mt-4 pt-4 border-t border-blue-500">
          <p className="text-xs text-blue-100 mb-1">נשאר לאחר תשלום מע״מ ומסים</p>
          <p className="text-xl sm:text-2xl font-bold">
            {formatCurrency(data.take_home.after_vat_and_taxes)}
          </p>
        </div>
      </div>

      {/* Expenses by Category - Only if there are expenses */}
      {data.expenses.by_category.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
            פילוח הוצאות לפי קטגוריה
          </h3>
          <div className="space-y-2">
            {data.expenses.by_category
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 8)
              .map((cat, index) => {
                const percentage =
                  (cat.amount / data.expenses.total) * 100;
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs sm:text-sm text-gray-700">{cat.category}</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
