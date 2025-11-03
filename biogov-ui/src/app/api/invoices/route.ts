/**
 * Invoices API
 * CRUD operations for invoices
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
 * GET /api/invoices
 * List all invoices for the authenticated user
 *
 * Query params:
 * - status: filter by status (draft, sent, paid, overdue, canceled)
 * - customer_id: filter by customer
 * - limit: number of results (default 50)
 * - offset: pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;
    const userId = decoded.userId;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let sql = `
      SELECT
        i.*,
        c.name as customer_name,
        c.email as customer_email,
        c.company_name as customer_company_name,
        (i.total_cents - COALESCE(i.paid_amount_cents, 0)) as balance_cents
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = $1
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (status) {
      sql += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (customerId) {
      sql += ` AND i.customer_id = $${paramIndex}`;
      params.push(customerId);
      paramIndex++;
    }

    sql += ` ORDER BY i.issue_date DESC, i.created_at DESC`;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM invoices WHERE user_id = $1';
    const countParams: any[] = [userId];
    let countParamIndex = 2;

    if (status) {
      countSql += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (customerId) {
      countSql += ` AND customer_id = $${countParamIndex}`;
      countParams.push(customerId);
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    return NextResponse.json({
      success: true,
      data: {
        invoices: result.rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
 *
 * Body:
 * {
 *   customerId: string,
 *   dueDate: string (ISO date),
 *   lineItems: Array<{ description, quantity, rateCents }>,
 *   notes?: string,
 *   terms?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;
    const userId = decoded.userId;

    // Parse request body
    const body = await request.json();
    const { customerId, dueDate, lineItems, notes, terms, status } = body;

    // Validate required fields
    if (!customerId || !dueDate || !lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, dueDate, lineItems' },
        { status: 400 }
      );
    }

    // Verify customer belongs to user
    const customerCheck = await query(
      'SELECT id FROM customers WHERE id = $1 AND user_id = $2',
      [customerId, userId]
    );

    if (customerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate totals
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

    const vatRate = 18; // Israeli VAT rate 2025
    const vatCents = Math.round(subtotalCents * (vatRate / 100));
    const totalCents = subtotalCents + vatCents;

    // Generate invoice number
    const invoiceNumberResult = await query(
      'SELECT get_next_invoice_number($1) as invoice_number',
      [userId]
    );
    const invoiceNumber = invoiceNumberResult.rows[0].invoice_number;

    // Insert invoice
    const result = await query(
      `INSERT INTO invoices (
        user_id, customer_id, invoice_number, status,
        subtotal_cents, vat_cents, vat_rate, total_cents,
        issue_date, due_date, line_items, notes, terms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9, $10, $11, $12)
      RETURNING *`,
      [
        userId,
        customerId,
        invoiceNumber,
        status || 'draft',
        subtotalCents,
        vatCents,
        vatRate,
        totalCents,
        dueDate,
        JSON.stringify(processedLineItems),
        notes || null,
        terms || null,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('POST /api/invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
