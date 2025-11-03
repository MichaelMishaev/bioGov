'use client';

/**
 * Customers List Page
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Users, Mail, Phone, Building2 } from 'lucide-react';
import { formatCurrency } from '@/types/finances';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  invoice_count: number;
  total_billed_cents: number;
  total_outstanding_cents: number;
}

export default function CustomersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoadingCustomers(false);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">לקוחות</h1>
              <p className="text-white/80 text-sm">נהל את הלקוחות שלך</p>
            </div>
            <Button
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => router.push('/dashboard/customers/new')}
            >
              <Plus className="w-4 h-4 ml-2" />
              לקוח חדש
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto container-mobile py-6 sm:py-8">
        {loadingCustomers ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">טוען לקוחות...</p>
          </div>
        ) : customers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">אין לקוחות</h3>
              <p className="text-muted-foreground mb-4">התחל בהוספת לקוחות כדי לנהל חשבוניות</p>
              <Button onClick={() => router.push('/dashboard/customers/new')}>
                <Plus className="w-4 h-4 ml-2" />
                הוסף לקוח ראשון
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-1">{customer.name}</h3>
                  {customer.company_name && (
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {customer.company_name}
                    </p>
                  )}

                  <div className="space-y-2 text-sm mb-4">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{customer.invoice_count}</div>
                      <div className="text-xs text-muted-foreground">חשבוניות</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(customer.total_outstanding_cents / 100)}
                      </div>
                      <div className="text-xs text-muted-foreground">יתרה</div>
                    </div>
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
