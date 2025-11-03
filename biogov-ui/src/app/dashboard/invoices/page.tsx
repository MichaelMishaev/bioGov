'use client';

/**
 * Invoices List Page
 * Display all invoices with filtering and actions
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, FileText, Send, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/types/finances';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_company_name: string;
  status: string;
  total_cents: number;
  balance_cents: number;
  issue_date: string;
  due_date: string;
}

export default function InvoicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user, selectedStatus]);

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const url = selectedStatus === 'all'
        ? '/api/invoices'
        : `/api/invoices?status=${selectedStatus}`;

      const res = await fetch(url, { credentials: 'include' });

      if (res.ok) {
        const data = await res.json();
        setInvoices(data.data.invoices || []);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-500',
    };

    const labels: Record<string, string> = {
      draft: 'טיוטה',
      sent: 'נשלח',
      paid: 'שולם',
      overdue: 'באיחור',
      canceled: 'בוטל',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">חשבוניות</h1>
              <p className="text-white/80 text-sm">נהל את החשבוניות שלך</p>
            </div>
            <Button
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => router.push('/dashboard/invoices/new')}
            >
              <Plus className="w-4 h-4 ml-2" />
              חשבונית חדשה
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto container-mobile py-6 sm:py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'draft', 'sent', 'overdue', 'paid'].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status === 'all' ? 'הכל' : status === 'draft' ? 'טיוטות' : status === 'sent' ? 'נשלחו' : status === 'overdue' ? 'באיחור' : 'שולמו'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        {loadingInvoices ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">טוען חשבוניות...</p>
          </div>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">אין חשבוניות</h3>
              <p className="text-muted-foreground mb-4">
                {selectedStatus === 'all' ? 'עדיין לא יצרת חשבוניות' : `אין חשבוניות בסטטוס "${selectedStatus}"`}
              </p>
              <Button onClick={() => router.push('/dashboard/invoices/new')}>
                <Plus className="w-4 h-4 ml-2" />
                צור חשבונית ראשונה
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card
                key={invoice.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                        {getStatusBadge(invoice.status)}
                      </div>

                      <p className="text-muted-foreground">
                        {invoice.customer_name}
                        {invoice.customer_company_name && ` • ${invoice.customer_company_name}`}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span>הונפק: {formatDate(invoice.issue_date)}</span>
                        <span>יעד: {formatDate(invoice.due_date)}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {formatCurrency(invoice.total_cents / 100)}
                      </div>
                      {invoice.balance_cents > 0 && invoice.balance_cents < invoice.total_cents && (
                        <div className="text-sm text-muted-foreground">
                          יתרה: {formatCurrency(invoice.balance_cents / 100)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                    {invoice.status === 'sent' || invoice.status === 'overdue' ? (
                      <>
                        <Button size="sm" variant="outline">
                          <Send className="w-4 h-4 ml-2" />
                          שלח תזכורת
                        </Button>
                        <Button size="sm" variant="outline">
                          <DollarSign className="w-4 h-4 ml-2" />
                          רשום תשלום
                        </Button>
                      </>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
