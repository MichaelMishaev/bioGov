'use client';

/**
 * Expense List Component
 * Display and filter user expenses with category breakdown
 * Phase 3 Week 2: Expense Tracker
 */

import { useState, useEffect } from 'react';
import {
  EXPENSE_CATEGORIES,
  formatCurrency,
  formatDateShort,
  type Expense,
  type ExpenseCategory,
} from '@/types/finances';

interface ExpenseListProps {
  onExpenseClick?: (expense: Expense) => void;
  onDelete?: (expenseId: string) => Promise<void>;
  className?: string;
}

export default function ExpenseList({
  onExpenseClick,
  onDelete,
  className = '',
}: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      params.append('limit', '100');

      const response = await fetch(`/api/expenses?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const result = await response.json();
      setExpenses(result.data?.expenses || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!onDelete) return;

    if (!confirm('האם אתה בטוח שברצונך למחוק הוצאה זו?')) {
      return;
    }

    try {
      await onDelete(expenseId);
      setExpenses(expenses.filter((exp) => exp.id !== expenseId));
    } catch (err) {
      alert('שגיאה במחיקת הוצאה: ' + (err as Error).message);
    }
  };

  // Sort expenses
  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
    } else {
      return b.amountCents - a.amountCents;
    }
  });

  // Calculate total
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amountCents, 0);
  const totalVAT = expenses.reduce((sum, exp) => sum + exp.vatCents, 0);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-red-600">
          <p className="font-semibold">שגיאה בטעינת הוצאות</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchExpenses}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`} dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">רשימת הוצאות</h2>
        <div className="text-left">
          <p className="text-sm text-gray-600">סה״כ הוצאות</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalAmount / 100)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            סינון לפי קטגוריה
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              הכל ({expenses.length})
            </button>
            {Object.values(EXPENSE_CATEGORIES).map((cat) => {
              const count = expenses.filter((exp) => exp.category === cat.category).length;
              if (count === 0 && categoryFilter !== cat.category) return null;

              return (
                <button
                  key={cat.category}
                  onClick={() => setCategoryFilter(cat.category)}
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    categoryFilter === cat.category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.nameHe}</span>
                  {count > 0 && <span className="text-xs">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">מיון:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1 rounded-md text-sm ${
                sortBy === 'date'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              לפי תאריך
            </button>
            <button
              onClick={() => setSortBy('amount')}
              className={`px-3 py-1 rounded-md text-sm ${
                sortBy === 'amount'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              לפי סכום
            </button>
          </div>
        </div>
      </div>

      {/* Expense List */}
      {sortedExpenses.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-5xl block mb-3">📦</span>
          <p className="text-lg font-semibold text-gray-900 mb-1">אין הוצאות להצגה</p>
          <p className="text-sm text-gray-600">
            {categoryFilter !== 'all'
              ? 'לא נמצאו הוצאות בקטגוריה זו'
              : 'התחל לתעד הוצאות כדי לנהל את התזרים שלך'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedExpenses.map((expense) => {
            const categoryInfo = EXPENSE_CATEGORIES[expense.category];
            const amountNIS = expense.amountCents / 100;
            const vatNIS = expense.vatCents / 100;

            return (
              <div
                key={expense.id}
                onClick={() => onExpenseClick?.(expense)}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Category Icon + Details */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {categoryInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {expense.description}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {categoryInfo.nameHe}
                        {expense.merchantName && ` • ${expense.merchantName}`}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>📅 {formatDateShort(expense.transactionDate)}</span>
                        {expense.vatDeductible && (
                          <span className="text-green-600">✓ ניתן לניכוי במע״מ</span>
                        )}
                        {expense.mileageKm && (
                          <span>🚗 {expense.mileageKm.toFixed(1)} ק״מ</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-left flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(amountNIS)}
                    </p>
                    {vatNIS > 0 && (
                      <p className="text-xs text-gray-500">
                        מע״מ: {formatCurrency(vatNIS)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {expense.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{expense.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {onDelete && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(expense.id);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      מחק
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {sortedExpenses.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-600 mb-1">סה״כ הוצאות</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalAmount / 100)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-green-700 mb-1">סה״כ מע״מ ניתן לניכוי</p>
              <p className="text-xl font-bold text-green-900">
                {formatCurrency(totalVAT / 100)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
