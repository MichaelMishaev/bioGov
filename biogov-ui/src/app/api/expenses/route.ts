/**
 * Expenses API Endpoints
 * Manages user expense tracking with receipt management
 * Phase 3 Week 2: Expense Tracker with OCR
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { query } from '@/lib/db';
import type { Expense, ExpenseCategory } from '@/types/finances';

interface JWTPayload {
  userId: string;
  email: string;
}

interface CreateExpenseRequest {
  amountCents: number;
  category: ExpenseCategory;
  description: string;
  vatCents?: number;
  vatRate?: number;
  vatDeductible?: boolean;
  receiptUrl?: string;
  merchantName?: string;
  transactionDate: string; // ISO date
  mileageKm?: number;
  mileageRatePerKm?: number;
  notes?: string;
}

/**
 * GET /api/expenses
 * List user expenses with optional filters
 * Query params: category, startDate, endDate, limit, offset
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

    // 2. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 3. Build dynamic query
    const conditions: string[] = ['user_id = $1'];
    const params: any[] = [userId];
    let paramIndex = 2;

    if (category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`transaction_date >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`transaction_date <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // 4. Execute query
    const result = await query(
      `SELECT
        id,
        user_id,
        amount_cents,
        currency,
        category,
        description,
        vat_cents,
        vat_rate,
        vat_deductible,
        receipt_url,
        merchant_name,
        transaction_date,
        ocr_processed,
        ocr_confidence,
        mileage_km,
        mileage_rate_per_km,
        notes,
        created_at,
        updated_at
      FROM expenses
      WHERE ${whereClause}
      ORDER BY transaction_date DESC, created_at DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    // 5. Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM expenses
       WHERE ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0]?.total || '0');

    // 6. Format response
    const expenses: Expense[] = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      amountCents: parseInt(row.amount_cents),
      currency: row.currency,
      category: row.category as ExpenseCategory,
      description: row.description,
      vatCents: parseInt(row.vat_cents || '0'),
      vatRate: parseFloat(row.vat_rate || '18'),
      vatDeductible: row.vat_deductible,
      receiptUrl: row.receipt_url,
      merchantName: row.merchant_name,
      transactionDate: row.transaction_date,
      ocrProcessed: row.ocr_processed,
      ocrConfidence: row.ocr_confidence ? parseFloat(row.ocr_confidence) : undefined,
      ocrRawText: row.ocr_raw_text,
      mileageKm: row.mileage_km ? parseFloat(row.mileage_km) : undefined,
      mileageRatePerKm: row.mileage_rate_per_km ? parseFloat(row.mileage_rate_per_km) : undefined,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        expenses,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error('Get expenses API error:', error);

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
 * POST /api/expenses
 * Create a new expense
 */
export async function POST(request: NextRequest) {
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

    // 2. Parse and validate request body
    const body: CreateExpenseRequest = await request.json();

    // Validate required fields
    if (!body.amountCents || body.amountCents <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!body.category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!body.description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!body.transactionDate) {
      return NextResponse.json(
        { error: 'Transaction date is required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      'fuel_mileage',
      'phone_internet',
      'office_rent',
      'equipment',
      'professional_services',
      'client_meetings',
      'training_courses',
      'office_supplies',
      'marketing',
      'insurance',
      'utilities',
      'other',
    ];

    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // 3. Calculate VAT if not provided
    const vatRate = body.vatRate || 18;
    const vatCents = body.vatCents !== undefined
      ? body.vatCents
      : Math.round(body.amountCents * (vatRate / (100 + vatRate)));

    // 4. Insert expense
    const result = await query(
      `INSERT INTO expenses (
        user_id,
        amount_cents,
        currency,
        category,
        description,
        vat_cents,
        vat_rate,
        vat_deductible,
        receipt_url,
        merchant_name,
        transaction_date,
        ocr_processed,
        mileage_km,
        mileage_rate_per_km,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING
        id,
        user_id,
        amount_cents,
        currency,
        category,
        description,
        vat_cents,
        vat_rate,
        vat_deductible,
        receipt_url,
        merchant_name,
        transaction_date,
        ocr_processed,
        mileage_km,
        mileage_rate_per_km,
        notes,
        created_at,
        updated_at`,
      [
        userId,
        body.amountCents,
        'ILS', // Default to Israeli Shekel
        body.category,
        body.description,
        vatCents,
        vatRate,
        body.vatDeductible !== undefined ? body.vatDeductible : true, // Default to deductible
        body.receiptUrl || null,
        body.merchantName || null,
        body.transactionDate,
        false, // OCR not processed for manual entries
        body.mileageKm || null,
        body.mileageRatePerKm || null,
        body.notes || null,
      ]
    );

    const expense = result.rows[0];

    // 5. Format response
    const formattedExpense: Expense = {
      id: expense.id,
      userId: expense.user_id,
      amountCents: parseInt(expense.amount_cents),
      currency: expense.currency,
      category: expense.category as ExpenseCategory,
      description: expense.description,
      vatCents: parseInt(expense.vat_cents),
      vatRate: parseFloat(expense.vat_rate),
      vatDeductible: expense.vat_deductible,
      receiptUrl: expense.receipt_url,
      merchantName: expense.merchant_name,
      transactionDate: expense.transaction_date,
      ocrProcessed: expense.ocr_processed,
      mileageKm: expense.mileage_km ? parseFloat(expense.mileage_km) : undefined,
      mileageRatePerKm: expense.mileage_rate_per_km ? parseFloat(expense.mileage_rate_per_km) : undefined,
      notes: expense.notes,
      createdAt: expense.created_at,
      updatedAt: expense.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: formattedExpense,
    });
  } catch (error) {
    console.error('Create expense API error:', error);

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
