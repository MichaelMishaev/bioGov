/**
 * Invoice Payments API Endpoint
 * Records and tracks payments for invoices
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

interface PaymentBody {
  amount: number; // In NIS (not cents)
  payment_date: string; // ISO date string
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'paypal' | 'bit' | 'other';
  transaction_id?: string;
  reference_number?: string;
  notes?: string;
}

/**
 * GET /api/invoices/:id/payments
 * List all payments for an invoice
 */
export async function GET(
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

    // 2. Verify invoice ownership
    const invoiceCheck = await query(
      `SELECT id, user_id, total_cents FROM invoices WHERE id = $1`,
      [invoiceId]
    );

    if (invoiceCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoiceCheck.rows[0].user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - Not your invoice' },
        { status: 403 }
      );
    }

    // 3. Get all payments for this invoice
    const payments = await query(
      `SELECT
        id,
        amount_cents,
        payment_date,
        payment_method,
        transaction_id,
        reference_number,
        notes,
        created_at
      FROM invoice_payments
      WHERE invoice_id = $1
      ORDER BY payment_date DESC, created_at DESC`,
      [invoiceId]
    );

    // 4. Calculate totals
    const invoiceTotal = parseInt(invoiceCheck.rows[0].total_cents);
    const totalPaid = payments.rows.reduce(
      (sum, p) => sum + parseInt(p.amount_cents),
      0
    );
    const balance = invoiceTotal - totalPaid;

    return NextResponse.json({
      invoice_id: invoiceId,
      invoice_total: invoiceTotal / 100, // Convert to NIS
      total_paid: totalPaid / 100,
      balance: balance / 100,
      is_fully_paid: balance <= 0,
      payments: payments.rows.map((p) => ({
        id: p.id,
        amount: parseInt(p.amount_cents) / 100,
        payment_date: p.payment_date,
        payment_method: p.payment_method,
        transaction_id: p.transaction_id,
        reference_number: p.reference_number,
        notes: p.notes,
        created_at: p.created_at,
      })),
    });
  } catch (error) {
    console.error('Get payments error:', error);

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

/**
 * POST /api/invoices/:id/payments
 * Record a new payment for an invoice
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

    // 2. Verify invoice ownership
    const invoiceCheck = await query(
      `SELECT id, user_id, total_cents, status FROM invoices WHERE id = $1`,
      [invoiceId]
    );

    if (invoiceCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoiceCheck.rows[0].user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - Not your invoice' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body: PaymentBody = await request.json();

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount - must be positive' },
        { status: 400 }
      );
    }

    if (!body.payment_date) {
      return NextResponse.json(
        { error: 'Payment date is required' },
        { status: 400 }
      );
    }

    if (!body.payment_method) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Convert amount to cents
    const amountCents = Math.round(body.amount * 100);

    // 4. Check if payment exceeds remaining balance
    const currentPaid = await query(
      `SELECT COALESCE(SUM(amount_cents), 0) as total_paid
       FROM invoice_payments
       WHERE invoice_id = $1`,
      [invoiceId]
    );

    const totalPaidSoFar = parseInt(currentPaid.rows[0]?.total_paid || '0');
    const invoiceTotal = parseInt(invoiceCheck.rows[0].total_cents);
    const remainingBalance = invoiceTotal - totalPaidSoFar;

    if (amountCents > remainingBalance) {
      return NextResponse.json(
        {
          error: 'Payment exceeds remaining balance',
          remaining_balance: remainingBalance / 100,
          attempted_payment: body.amount,
        },
        { status: 400 }
      );
    }

    // 5. Insert payment record
    const payment = await query(
      `INSERT INTO invoice_payments (
        invoice_id,
        amount_cents,
        payment_date,
        payment_method,
        transaction_id,
        reference_number,
        notes,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        amount_cents,
        payment_date,
        payment_method,
        transaction_id,
        reference_number,
        notes,
        created_at`,
      [
        invoiceId,
        amountCents,
        body.payment_date,
        body.payment_method,
        body.transaction_id || null,
        body.reference_number || null,
        body.notes || null,
        userId,
      ]
    );

    const newPayment = payment.rows[0];

    // 6. Calculate new totals
    const newTotalPaid = totalPaidSoFar + amountCents;
    const newBalance = invoiceTotal - newTotalPaid;
    const isFullyPaid = newBalance <= 0;

    // 7. Return success with updated invoice status
    return NextResponse.json(
      {
        success: true,
        payment: {
          id: newPayment.id,
          amount: amountCents / 100,
          payment_date: newPayment.payment_date,
          payment_method: newPayment.payment_method,
          transaction_id: newPayment.transaction_id,
          reference_number: newPayment.reference_number,
          notes: newPayment.notes,
          created_at: newPayment.created_at,
        },
        invoice: {
          id: invoiceId,
          total: invoiceTotal / 100,
          total_paid: newTotalPaid / 100,
          balance: newBalance / 100,
          is_fully_paid: isFullyPaid,
          status: isFullyPaid ? 'paid' : invoiceCheck.rows[0].status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Record payment error:', error);

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
