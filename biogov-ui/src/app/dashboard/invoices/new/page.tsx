'use client';

/**
 * Create Invoice Page
 * Form to create a new invoice with line items
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { formatCurrency, nisToC } from '@/types/finances';

interface Customer {
  id: string;
  name: string;
  email: string;
  company_name: string;
}

interface LineItem {
  description: string;
  quantity: number;
  rateCents: number;
  amountCents: number;
}

export default function NewInvoicePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, rateCents: 0, amountCents: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('תשלום תוך 30 יום');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch customers
  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  // Set default due date (30 days from now)
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setDueDate(date.toISOString().split('T')[0]);
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setCustomers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rateCents: 0, amountCents: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    // Recalculate amount
    if (field === 'quantity' || field === 'rateCents') {
      updated[index].amountCents = updated[index].quantity * updated[index].rateCents;
    }

    setLineItems(updated);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amountCents, 0);
  };

  const calculateVAT = () => {
    const subtotal = calculateSubtotal();
    return Math.round(subtotal * 0.18);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomerId) {
      setError('נא לבחור לקוח');
      return;
    }

    if (lineItems.some(item => !item.description || item.rateCents <= 0)) {
      setError('נא למלא את כל פרטי השורות');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          dueDate,
          lineItems,
          notes,
          terms,
          status: 'draft',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/invoices/${data.data.id}`);
      } else {
        const error = await res.json();
        setError(error.error || 'שגיאה ביצירת החשבונית');
      }
    } catch (err) {
      setError('שגיאה ביצירת החשבונית');
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
      {/* Header */}
      <header className="gradient-hero text-white sticky top-0 z-10 shadow-xl">
        <div className="container mx-auto container-mobile py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => router.push('/dashboard/invoices')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">צור חשבונית חדשה</h1>
              <p className="text-white/80 text-sm">מלא את הפרטים ליצירת חשבונית</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto container-mobile py-6 sm:py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>פרטי לקוח</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">בחר לקוח *</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      required
                    >
                      <option value="">-- בחר לקוח --</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.company_name ? `(${customer.company_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard/customers/new')}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      לקוח חדש
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Details */}
              <Card>
                <CardHeader>
                  <CardTitle>פרטי חשבונית</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">תאריך יעד לתשלום *</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <CardTitle>שורות חשבונית</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lineItems.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            placeholder="תיאור השירות/מוצר"
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                          />

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">כמות</label>
                              <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border rounded"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">מחיר ליחידה (₪)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.rateCents / 100}
                                onChange={(e) => updateLineItem(index, 'rateCents', nisToC(parseFloat(e.target.value) || 0))}
                                className="w-full p-2 border rounded"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">סכום</label>
                              <div className="p-2 bg-gray-50 border rounded font-semibold">
                                {formatCurrency(item.amountCents / 100)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {lineItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(index)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addLineItem} className="w-full">
                    <Plus className="w-4 h-4 ml-2" />
                    הוסף שורה
                  </Button>
                </CardContent>
              </Card>

              {/* Notes & Terms */}
              <Card>
                <CardHeader>
                  <CardTitle>הערות ותנאים</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">הערות</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      rows={3}
                      placeholder="הערות נוספות..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">תנאי תשלום</label>
                    <input
                      type="text"
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      placeholder="תשלום תוך 30 יום"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>סיכום חשבונית</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">סכום ביניים:</span>
                      <span>{formatCurrency(calculateSubtotal() / 100)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">מע"מ (18%):</span>
                      <span>{formatCurrency(calculateVAT() / 100)}</span>
                    </div>

                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>סה"כ:</span>
                      <span className="text-primary">{formatCurrency(calculateTotal() / 100)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={saving}>
                    <Save className="w-4 h-4 ml-2" />
                    {saving ? 'שומר...' : 'שמור טיוטה'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/dashboard/invoices')}
                  >
                    ביטול
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
