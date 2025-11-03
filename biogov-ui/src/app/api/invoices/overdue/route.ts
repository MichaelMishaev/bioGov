/**
 * Overdue Invoices API Endpoint
 * Lists invoices that need payment reminders
 * Phase 3 Week 3: Payment Tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { query } from '@/lib/db';
import { differenceInDays } from 'date-fns';

interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * GET /api/invoices/overdue
 * Returns invoices that are past due and need reminders
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    const decoded = verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JWTPayload;
    const userId = decoded.userId;

    // 2. Get overdue invoices with customer info
    const invoices = await query(
      `SELECT
        i.id,
        i.invoice_number,
        i.total_cents,
        i.due_date,
        i.issue_date,
        i.status,
        i.paid_amount_cents,
        c.id as customer_id,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        (
          SELECT COUNT(*)
          FROM payment_reminders pr
          WHERE pr.invoice_id = i.id
        ) as reminders_sent,
        (
          SELECT pr2.sent_at
          FROM payment_reminders pr2
          WHERE pr2.invoice_id = i.id
          ORDER BY pr2.sent_at DESC
          LIMIT 1
        ) as last_reminder_sent_at,
        (
          SELECT pr3.reminder_type
          FROM payment_reminders pr3
          WHERE pr3.invoice_id = i.id
          ORDER BY pr3.sent_at DESC
          LIMIT 1
        ) as last_reminder_type
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = $1
        AND i.status = 'sent'
        AND i.due_date < CURRENT_DATE
        AND (i.paid_amount_cents IS NULL OR i.paid_amount_cents < i.total_cents)
      ORDER BY i.due_date ASC`,
      [userId]
    );

    // 3. Calculate days overdue and categorize
    const now = new Date();
    const categorized = {
      urgent: [] as any[], // 30+ days overdue
      overdue: [] as any[], // 14-29 days overdue
      recent: [] as any[], // 1-13 days overdue
    };

    invoices.rows.forEach((inv) => {
      const daysOverdue = differenceInDays(now, new Date(inv.due_date));
      const totalCents = parseInt(inv.total_cents);
      const paidCents = parseInt(inv.paid_amount_cents || '0');
      const balanceCents = totalCents - paidCents;

      const invoiceData = {
        id: inv.id,
        invoice_number: inv.invoice_number,
        customer: {
          id: inv.customer_id,
          name: inv.customer_name,
          email: inv.customer_email,
          phone: inv.customer_phone,
        },
        total: totalCents / 100,
        paid: paidCents / 100,
        balance: balanceCents / 100,
        issue_date: inv.issue_date,
        due_date: inv.due_date,
        days_overdue: daysOverdue,
        reminders_sent: parseInt(inv.reminders_sent || '0'),
        last_reminder_sent_at: inv.last_reminder_sent_at,
        last_reminder_type: inv.last_reminder_type,
        recommended_action: daysOverdue >= 30
          ? 'final_notice'
          : daysOverdue >= 21
          ? 'urgent_reminder'
          : daysOverdue >= 14
          ? 'firm_reminder'
          : 'gentle_reminder',
      };

      if (daysOverdue >= 30) {
        categorized.urgent.push(invoiceData);
      } else if (daysOverdue >= 14) {
        categorized.overdue.push(invoiceData);
      } else {
        categorized.recent.push(invoiceData);
      }
    });

    // 4. Calculate summary statistics
    const totalOverdue = invoices.rows.length;
    const totalAmount = invoices.rows.reduce((sum, inv) => {
      const totalCents = parseInt(inv.total_cents);
      const paidCents = parseInt(inv.paid_amount_cents || '0');
      return sum + (totalCents - paidCents);
    }, 0);

    return NextResponse.json({
      summary: {
        total_count: totalOverdue,
        total_amount: totalAmount / 100,
        urgent_count: categorized.urgent.length,
        overdue_count: categorized.overdue.length,
        recent_count: categorized.recent.length,
      },
      invoices: {
        urgent: categorized.urgent,
        overdue: categorized.overdue,
        recent: categorized.recent,
      },
    });
  } catch (error) {
    console.error('Get overdue invoices error:', error);

    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
