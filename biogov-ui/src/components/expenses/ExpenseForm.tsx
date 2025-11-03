'use client';

/**
 * Expense Form Component
 * Create or edit expenses with category selection and VAT calculation
 * Phase 3 Week 2: Expense Tracker
 */

import { useState } from 'react';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/types/finances';

interface ExpenseFormProps {
  onSubmit: (expense: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ExpenseFormData>;
  className?: string;
}

export interface ExpenseFormData {
  amountCents: number;
  category: ExpenseCategory;
  description: string;
  vatCents?: number;
  vatDeductible?: boolean;
  merchantName?: string;
  transactionDate: string;
  mileageKm?: number;
  notes?: string;
}

export default function ExpenseForm({
  onSubmit,
  onCancel,
  initialData,
  className = '',
}: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amountCents: initialData?.amountCents || 0,
    category: initialData?.category || 'other',
    description: initialData?.description || '',
    vatDeductible: initialData?.vatDeductible !== undefined ? initialData.vatDeductible : true,
    merchantName: initialData?.merchantName || '',
    transactionDate: initialData?.transactionDate || new Date().toISOString().split('T')[0],
    mileageKm: initialData?.mileageKm,
    notes: initialData?.notes || '',
  });

  const [amountDisplay, setAmountDisplay] = useState<string>(
    initialData?.amountCents ? (initialData.amountCents / 100).toString() : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryInfo = EXPENSE_CATEGORIES[formData.category];

  const handleAmountChange = (value: string) => {
    setAmountDisplay(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setFormData({ ...formData, amountCents: Math.round(numericValue * 100) });
    }
  };

  const handleCategoryChange = (category: ExpenseCategory) => {
    const categoryInfo = EXPENSE_CATEGORIES[category];
    setFormData({
      ...formData,
      category,
      vatDeductible: categoryInfo.defaultVatDeductible,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.amountCents <= 0) {
      setError('סכום חייב להיות גדול מ-0');
      return;
    }

    if (!formData.description.trim()) {
      setError('תיאור הוצאה חובה');
      return;
    }

    if (!formData.transactionDate) {
      setError('תאריך עסקה חובה');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      setError((err as Error).message || 'שגיאה בשמירת הוצאה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
      dir="rtl"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {initialData ? 'עריכת הוצאה' : 'הוספת הוצאה חדשה'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          סכום (₪) *
        </label>
        <input
          type="number"
          step="0.01"
          value={amountDisplay}
          onChange={(e) => handleAmountChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="0.00"
          required
        />
        {formData.amountCents > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            כולל מע״מ: ₪{(formData.amountCents / 100).toLocaleString('he-IL', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        )}
      </div>

      {/* Category Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          קטגוריה *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.values(EXPENSE_CATEGORIES).map((cat) => (
            <button
              key={cat.category}
              type="button"
              onClick={() => handleCategoryChange(cat.category)}
              className={`px-4 py-3 rounded-md border-2 transition-all ${
                formData.category === cat.category
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">{cat.icon}</span>
              <span className="text-xs font-medium">{cat.nameHe}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          תיאור *
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="לדוגמה: קנייה בסופר, חשמל חודש ינואר"
          required
        />
      </div>

      {/* Merchant Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          שם העסק (אופציונלי)
        </label>
        <input
          type="text"
          value={formData.merchantName}
          onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="לדוגמה: רמי לוי, פז, סלקום"
        />
      </div>

      {/* Transaction Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          תאריך העסקה *
        </label>
        <input
          type="date"
          value={formData.transactionDate}
          onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Mileage (for fuel_mileage category) */}
      {formData.category === 'fuel_mileage' && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-4">
          <label className="block text-sm font-medium text-blue-900 mb-2">
            קילומטר״ז (אופציונלי)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.mileageKm || ''}
            onChange={(e) =>
              setFormData({ ...formData, mileageKm: parseFloat(e.target.value) || undefined })
            }
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.0 ק״מ"
          />
          <p className="text-xs text-blue-600 mt-1">
            שיעור ניכוי ברירת מחדל: ₪2.35 לק״מ (2025)
          </p>
        </div>
      )}

      {/* VAT Deductible Checkbox */}
      <div className="mb-4 flex items-start">
        <input
          type="checkbox"
          id="vatDeductible"
          checked={formData.vatDeductible}
          onChange={(e) => setFormData({ ...formData, vatDeductible: e.target.checked })}
          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="vatDeductible" className="mr-2 text-sm text-gray-700">
          ניתן לניכוי במע״מ
          {!selectedCategoryInfo.defaultVatDeductible && (
            <span className="text-amber-600 mr-1">
              (קטגוריה זו בדרך כלל אינה ניתנת לניכוי מלא)
            </span>
          )}
        </label>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          הערות (אופציונלי)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="הערות נוספות להוצאה זו..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'שומר...' : initialData ? 'עדכן הוצאה' : 'הוסף הוצאה'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ביטול
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-md p-3">
        <p className="text-xs text-purple-900">
          <strong>טיפ:</strong> שמור את הקבלה המקורית! עליך לשמור קבלות פיזיות או דיגיטליות למשך 7 שנים
          לפי חוק הנהלת חשבונות.
        </p>
      </div>
    </form>
  );
}
