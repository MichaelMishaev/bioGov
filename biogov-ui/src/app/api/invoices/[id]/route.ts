/**
 * Individual Invoice API
 * GET, PUT, DELETE operations for a single invoice
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { query } from '@/lib/db';

interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * GET /api/invoices/:id
 * Get a single invoice with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;
    const userId = decoded.userId;

    const invoiceId = params.id;

    // Fetch invoice with customer details
    const result = await query(
      `SELECT
        i.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.company_name as customer_company_name,
        c.tax_id as customer_tax_id,
        c.address_line1 as customer_address_line1,
        c.address_line2 as customer_address_line2,
        c.city as customer_city,
        c.postal_code as customer_postal_code,
        c.country as customer_country,
        (i.total_cents - COALESCE(i.paid_amount_cents, 0)) as balance_cents
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.id = $1 AND i.user_id = $2`,
      [invoiceId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Fetch payments
    const paymentsResult = await query(
      `SELECT * FROM invoice_payments
       WHERE invoice_id = $1
       ORDER BY payment_date DESC`,
      [invoiceId]
    );

    // Fetch reminders
    const remindersResult = await query(
      `SELECT * FROM payment_reminders
       WHERE invoice_id = $1
       ORDER BY sent_at DESC`,
      [invoiceId]
    );

    const invoice = result.rows[0];
    invoice.payments = paymentsResult.rows;
    invoice.reminders = remindersResult.rows;

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('GET /api/invoices/:id error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/invoices/:id
 * Update an existing invoice
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;
    const userId = decoded.userId;

    const invoiceId = params.id;

    // Verify invoice ownership
    const checkResult = await query(
      'SELECT id, status FROM invoices WHERE id = $1 AND user_id = $2',
      [invoiceId, userId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { dueDate, lineItems, notes, terms, status } = body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(dueDate);
    }

    if (lineItems !== undefined) {
      // Recalculate totals
      let subtotalCents = 0;
      const processedLineItems = lineItems.map((item: any) => {
        const amountCents = item.quantity * item.rateCents;
        subtotalCents += amountCents;
        return {
          description: item.description,
          quantity: item.quantity,
          rateCents: item.rateCents,
          amountCents,
        };
      });

      const vatRate = 18;
      const vatCents = Math.round(subtotalCents * (vatRate / 100));
      const totalCents = subtotalCents + vatCents;

      updates.push(`subtotal_cents = $${paramIndex++}`);
      values.push(subtotalCents);

      updates.push(`vat_cents = $${paramIndex++}`);
      values.push(vatCents);

      updates.push(`total_cents = $${paramIndex++}`);
      values.push(totalCents);

      updates.push(`line_items = $${paramIndex++}`);
      values.push(JSON.stringify(processedLineItems));
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(notes);
    }

    if (terms !== undefined) {
      updates.push(`terms = $${paramIndex++}`);
      values.push(terms);
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at
    updates.push(`updated_at = NOW()`);

    // Add WHERE clause params
    values.push(invoiceId, userId);

    const sql = `
      UPDATE invoices
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;

    const result = await query(sql, values);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('PUT /api/invoices/:id error:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invoices/:id
 * Delete an invoice (only if draft or no payments)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;
    const userId = decoded.userId;

    const invoiceId = params.id;

    // Check if invoice can be deleted (no payments)
    const checkResult = await query(
      `SELECT i.id, i.status, COUNT(p.id) as payment_count
       FROM invoices i
       LEFT JOIN invoice_payments p ON i.id = p.invoice_id
       WHERE i.id = $1 AND i.user_id = $2
       GROUP BY i.id, i.status`,
      [invoiceId, userId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoice = checkResult.rows[0];

    if (invoice.payment_count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete invoice with payments. Cancel it instead.' },
        { status: 400 }
      );
    }

    // Delete invoice
    await query(
      'DELETE FROM invoices WHERE id = $1 AND user_id = $2',
      [invoiceId, userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/invoices/:id error:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
