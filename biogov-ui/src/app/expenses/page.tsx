'use client';

/**
 * Expenses Page
 * Comprehensive expense management with form and list
 * Phase 3 Week 2: Expense Tracker
 */

import { useState } from 'react';
import { Metadata } from 'next';
import ExpenseForm, { type ExpenseFormData } from '@/components/expenses/ExpenseForm';
import ExpenseList from '@/components/expenses/ExpenseList';
import type { Expense } from '@/types/finances';

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmitExpense = async (data: ExpenseFormData) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save expense');
      }

      // Success - close form and refresh list
      setShowForm(false);
      setRefreshKey((prev) => prev + 1);

      // Show success message
      alert('✅ הוצאה נשמרה בהצלחה!');
    } catch (error) {
      throw error; // Let ExpenseForm handle the error display
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    // Note: DELETE endpoint not yet implemented
    // This is a placeholder for future implementation
    throw new Error('מחיקת הוצאות תתווסף בעתיד');
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    // TODO: Open expense details modal or edit form
    console.log('Expense clicked:', expense);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול הוצאות</h1>
            <p className="text-gray-600">
              תעד וארגן את כל ההוצאות העסקיות שלך במקום אחד
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            {showForm ? (
              <>
                <span>✕</span>
                <span>סגור טופס</span>
              </>
            ) : (
              <>
                <span>+</span>
                <span>הוסף הוצאה</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Expense Form (collapsible) */}
          {showForm && (
            <div className="lg:col-span-1">
              <ExpenseForm
                onSubmit={handleSubmitExpense}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Right Column - Expense List */}
          <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <ExpenseList
              key={refreshKey}
              onExpenseClick={handleExpenseClick}
              onDelete={handleDeleteExpense}
            />
          </div>
        </div>

        {/* Educational Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tax Deduction Tips */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
            <span className="text-3xl block mb-3">💡</span>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              טיפים לניכוי מס
            </h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• שמור קבלות למשך 7 שנים</li>
              <li>• תעד קילומטראז' לנסיעות עסקיות</li>
              <li>• הוצאות משרד הביתי - עד 50%</li>
              <li>• פגישות לקוחות - ניכוי מוגבל</li>
            </ul>
          </div>

          {/* VAT Information */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <span className="text-3xl block mb-3">📊</span>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">מע״מ תשומות</h3>
            <p className="text-sm text-blue-800 mb-3">
              עוסק מורשה יכול לקזז מע״מ תשומות (מע״מ ששולם על הוצאות) מול מע״מ עסקאות
              (מע״מ שנגבה מלקוחות).
            </p>
            <p className="text-xs text-blue-700 font-semibold">
              שיעור מע״מ נוכחי: 18%
            </p>
          </div>

          {/* Category Guidelines */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
            <span className="text-3xl block mb-3">📋</span>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              קטגוריות מומלצות
            </h3>
            <p className="text-sm text-purple-800">
              שימוש עקבי בקטגוריות עוזר לזיהוי מגמות והכנת דוחות למס הכנסה וביטוח לאומי.
            </p>
            <ul className="text-xs text-purple-700 mt-3 space-y-1">
              <li>• דלק/קילומטראז׳ - ⛽</li>
              <li>• ציוד משרדי - 📎</li>
              <li>• שיווק - 📢</li>
              <li>• הדרכות - 🎓</li>
            </ul>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-start gap-4">
            <span className="text-4xl">📸</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">בקרוב: סריקת קבלות אוטומטית!</h3>
              <p className="text-amber-100 mb-3">
                צלם קבלה והמערכת תחלץ אוטומטית את הסכום, שם העסק והתאריך באמצעות
                טכנולוגיית OCR מתקדמת.
              </p>
              <div className="flex gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  תמיכה בעברית
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  עובד על נייד
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  דיוק גבוה
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            שאלות נפוצות
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-gray-900">
                מה ההבדל בין הוצאה רגילה להוצאה ניתנת לניכוי?
              </p>
              <p className="text-gray-600 mt-1">
                הוצאה ניתנת לניכוי היא הוצאה שהמס מאפשר לך להפחית מההכנסה החייבת
                במס. לדוגמה, ציוד משרדי, דלק לנסיעות עסקיות, וכו׳.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                האם אני חייב לשמור את הקבלה הפיזית?
              </p>
              <p className="text-gray-600 mt-1">
                כן! חוק הנהלת חשבונות מחייב שמירת קבלות למשך 7 שנים. מומלץ לשמור גם
                עותק דיגיטלי וגם את המקור.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                מה שיעור הקילומטראז׳ המותר לניכוי?
              </p>
              <p className="text-gray-600 mt-1">
                נכון ל-2025, שיעור הקילומטראז׳ הוא ₪2.35 לק״מ. זה מתעדכן מעת לעת על
                ידי רשות המסים.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
