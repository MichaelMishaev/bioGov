/**
 * Customers API
 * CRUD operations for customers
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
 * GET /api/customers
 * List all customers for the authenticated user
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
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');

    // Build query
    let sql = `
      SELECT c.*,
        COUNT(i.id) as invoice_count,
        COALESCE(SUM(i.total_cents), 0) as total_billed_cents,
        COALESCE(SUM(i.total_cents - COALESCE(i.paid_amount_cents, 0)), 0) as total_outstanding_cents
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE c.user_id = $1
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (isActive !== null) {
      sql += ` AND c.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    if (search) {
      sql += ` AND (c.name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` GROUP BY c.id ORDER BY c.name ASC`;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers
 * Create a new customer
 *
 * Body:
 * {
 *   name: string,
 *   email?: string,
 *   phone?: string,
 *   companyName?: string,
 *   taxId?: string,
 *   addressLine1?: string,
 *   addressLine2?: string,
 *   city?: string,
 *   postalCode?: string,
 *   country?: string,
 *   notes?: string
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
    const {
      name,
      email,
      phone,
      companyName,
      taxId,
      addressLine1,
      addressLine2,
      city,
      postalCode,
      country,
      notes,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Insert customer
    const result = await query(
      `INSERT INTO customers (
        user_id, name, email, phone, company_name, tax_id,
        address_line1, address_line2, city, postal_code, country, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        userId,
        name,
        email || null,
        phone || null,
        companyName || null,
        taxId || null,
        addressLine1 || null,
        addressLine2 || null,
        city || null,
        postalCode || null,
        country || 'Israel',
        notes || null,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
