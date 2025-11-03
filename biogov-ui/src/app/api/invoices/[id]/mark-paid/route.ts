/**
 * Mark Invoice as Paid API Endpoint
 * Quick action to mark invoice as fully paid
 * Phase 3 Week 3: Payment Tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { query } from '@/lib/db';

interface JWTPayload {
  userId: string;
  email: string;
}

interface MarkPaidBody {
  payment_date?: string; // Optional, defaults to today
  payment_method?: 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'paypal' | 'bit' | 'other';
  notes?: string;
}

/**
 * POST /api/invoices/:id/mark-paid
 * Quickly mark an invoice as fully paid
 * Creates a payment record for the full remaining balance
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const invoiceId = params.id;

    // 2. Verify invoice ownership and get details
    const invoiceCheck = await query(
      `SELECT
        id,
        user_id,
        total_cents,
        status,
        COALESCE(paid_amount_cents, 0) as paid_cents
      FROM invoices
      WHERE id = $1`,
      [invoiceId]
    );

    if (invoiceCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoice = invoiceCheck.rows[0];

    if (invoice.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - Not your invoice' },
        { status: 403 }
      );
    }

    // 3. Check if already fully paid
    const totalCents = parseInt(invoice.total_cents);
    const paidCents = parseInt(invoice.paid_cents);
    const remainingBalance = totalCents - paidCents;

    if (remainingBalance <= 0) {
      return NextResponse.json(
        {
          error: 'Invoice is already fully paid',
          invoice: {
            id: invoiceId,
            total: totalCents / 100,
            paid: paidCents / 100,
            balance: 0,
          },
        },
        { status: 400 }
      );
    }

    // 4. Parse request body (optional fields)
    let body: MarkPaidBody = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional, use defaults
    }

    const paymentDate = body.payment_date || new Date().toISOString().split('T')[0];
    const paymentMethod = body.payment_method || 'cash';

    // 5. Create payment record for remaining balance
    const payment = await query(
      `INSERT INTO invoice_payments (
        invoice_id,
        amount_cents,
        payment_date,
        payment_method,
        notes,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        amount_cents,
        payment_date,
        payment_method,
        notes,
        created_at`,
      [
        invoiceId,
        remainingBalance,
        paymentDate,
        paymentMethod,
        body.notes || 'Marked as paid',
        userId,
      ]
    );

    const newPayment = payment.rows[0];

    // 6. Update invoice status to paid
    await query(
      `UPDATE invoices
      SET
        status = 'paid',
        paid_amount_cents = total_cents,
        paid_at = NOW(),
        updated_at = NOW()
      WHERE id = $1`,
      [invoiceId]
    );

    // 7. Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Invoice marked as fully paid',
        payment: {
          id: newPayment.id,
          amount: remainingBalance / 100,
          payment_date: newPayment.payment_date,
          payment_method: newPayment.payment_method,
          notes: newPayment.notes,
          created_at: newPayment.created_at,
        },
        invoice: {
          id: invoiceId,
          total: totalCents / 100,
          paid: totalCents / 100,
          balance: 0,
          status: 'paid',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mark paid error:', error);

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
