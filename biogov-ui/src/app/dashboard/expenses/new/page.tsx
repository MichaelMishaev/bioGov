'use client';

/**
 * New Expense Page
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { EXPENSE_CATEGORIES, ExpenseCategory, nisToC } from '@/types/finances';

export default function NewExpensePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    amount: '',
    category: 'office_supplies' as ExpenseCategory,
    description: '',
    merchantName: '',
    transactionDate: new Date().toISOString().split('T')[0],
    vatDeductible: true,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('נא להזין סכום תקין');
      return;
    }

    if (!formData.description) {
      setError('נא להזין תיאור');
      return;
    }

    setSaving(true);

    try {
      const amountNIS = parseFloat(formData.amount);
      const amountCents = nisToC(amountNIS);
      const vatRate = 18;
      const vatCents = formData.vatDeductible ? Math.round(amountCents * (vatRate / (100 + vatRate))) : 0;

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amountCents,
          category: formData.category,
          description: formData.description,
          merchantName: formData.merchantName || null,
          transactionDate: formData.transactionDate,
          vatCents,
          vatRate,
          vatDeductible: formData.vatDeductible,
          notes: formData.notes || null,
        }),
      });

      if (res.ok) {
        router.push('/dashboard/expenses');
      } else {
        const error = await res.json();
        setError(error.error || 'שגיאה ברישום ההוצאה');
      }
    } catch (err) {
      setError('שגיאה ברישום ההוצאה');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header className="gradient-hero text-white sticky top-0 z-10 shadow-xl">
        <div className="container mx-auto container-mobile py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => router.push('/dashboard/expenses')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">הוצאה חדשה</h1>
              <p className="text-white/80 text-sm">רשום הוצאה עסקית</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto container-mobile py-6 sm:py-8 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>פרטי הוצאה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">סכום (₪) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">תאריך *</label>
                  <input
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">קטגוריה *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  {Object.values(EXPENSE_CATEGORIES).map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.icon} {cat.nameHe}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">תיאור *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="למה ההוצאה?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">שם ספק</label>
                <input
                  type="text"
                  value={formData.merchantName}
                  onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="מאיפה קנית?"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="vatDeductible"
                  checked={formData.vatDeductible}
                  onChange={(e) => setFormData({ ...formData, vatDeductible: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="vatDeductible" className="text-sm font-medium cursor-pointer">
                  ניכוי מע"מ (18%)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">העלה קבלה</label>
                <Button type="button" variant="outline" className="w-full">
                  <Upload className="w-4 h-4 ml-2" />
                  בחר קובץ
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  העלה תמונה או PDF של הקבלה (אופציונלי)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">הערות</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="הערות נוספות..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={saving}>
                  <Save className="w-4 h-4 ml-2" />
                  {saving ? 'שומר...' : 'שמור הוצאה'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/expenses')}
                >
                  ביטול
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
