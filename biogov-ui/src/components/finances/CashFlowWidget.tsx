'use client';

/**
 * Cash Flow Widget Component
 * Displays real-time financial data with trend charts
 * Phase 3: Daily Engagement Features
 */

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatPercentage } from '@/types/finances';
import type { CashFlowSummary } from '@/types/finances';

type TimeRange = 'today' | 'week' | 'month';

interface CashFlowWidgetProps {
  className?: string;
}

export default function CashFlowWidget({ className = '' }: CashFlowWidgetProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [data, setData] = useState<CashFlowSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCashFlow();
  }, []);

  const fetchCashFlow = async () => {
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
        throw new Error('Failed to fetch cash flow data');
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
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-red-600">
          <p className="font-semibold">שגיאה בטעינת נתונים</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchCashFlow}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
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

  // Get current period data based on selected time range
  const currentData =
    timeRange === 'today'
      ? data.today
      : timeRange === 'week'
      ? data.thisWeek
      : data.thisMonth;

  const changePercentage =
    timeRange === 'week'
      ? data.thisWeek.changeVsLastWeek
      : timeRange === 'month'
      ? data.thisMonth.changeVsLastMonth
      : 0;

  const isPositiveChange = changePercentage >= 0;

  // Prepare chart data
  const chartData = [
    {
      name: 'הכנסות',
      value: currentData.revenue,
      color: '#10B981', // green
    },
    {
      name: 'הוצאות',
      value: currentData.expenses,
      color: '#EF4444', // red
    },
    {
      name: 'רווח',
      value: currentData.profit,
      color: currentData.profit >= 0 ? '#3B82F6' : '#F59E0B', // blue or amber
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`} dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">תזרים מזומנים</h2>
        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
          <button
            onClick={() => setTimeRange('today')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              timeRange === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            היום
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            השבוע
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            החודש
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {/* Revenue */}
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
          <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">הכנסות</p>
          <p className="text-lg sm:text-2xl font-bold text-green-900 break-words">
            {formatCurrency(currentData.revenue)}
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200">
          <p className="text-xs sm:text-sm text-red-700 font-medium mb-1">הוצאות</p>
          <p className="text-lg sm:text-2xl font-bold text-red-900 break-words">
            {formatCurrency(currentData.expenses)}
          </p>
        </div>

        {/* Profit */}
        <div
          className={`rounded-lg p-3 sm:p-4 border ${
            currentData.profit >= 0
              ? 'bg-blue-50 border-blue-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <p
            className={`text-xs sm:text-sm font-medium mb-1 ${
              currentData.profit >= 0 ? 'text-blue-700' : 'text-amber-700'
            }`}
          >
            רווח נקי
          </p>
          <p
            className={`text-lg sm:text-2xl font-bold break-words ${
              currentData.profit >= 0 ? 'text-blue-900' : 'text-amber-900'
            }`}
          >
            {formatCurrency(currentData.profit)}
          </p>
          {timeRange !== 'today' && (
            <p
              className={`text-xs mt-1 ${
                isPositiveChange ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositiveChange ? '↑' : '↓'}{' '}
              {formatPercentage(Math.abs(changePercentage))}{' '}
              <span className="hidden sm:inline">
                {timeRange === 'week' ? 'לעומת שבוע שעבר' : 'לעומת חודש שעבר'}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6 -mx-2 sm:mx-0">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
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
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              fill="#93C5FD"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Goal Progress (if exists) */}
      {data.goal && (
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-purple-700 font-medium">יעד חודשי</p>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                data.goal.isOnTrack
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {data.goal.isOnTrack ? '✓ במסלול' : '⚠ מתחת ליעד'}
            </span>
          </div>
          <div className="relative w-full h-4 bg-purple-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 right-0 h-full rounded-full transition-all duration-500 ${
                data.goal.isOnTrack ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(data.goal.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-purple-900">
            <span>{formatCurrency(data.goal.current)}</span>
            <span>{formatPercentage(data.goal.percentage)}</span>
            <span>{formatCurrency(data.goal.target)}</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-2 mt-6">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors">
          צור חשבונית חדשה
        </button>
        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors">
          הוסף הוצאה
        </button>
      </div>
    </div>
  );
}
