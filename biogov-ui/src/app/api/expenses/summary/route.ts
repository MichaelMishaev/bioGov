/**
 * Expense Summary API Endpoint
 * Provides aggregated expense analytics
 * Phase 3 Week 2: Expense Tracker
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { query } from '@/lib/db';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import type { ExpenseSummary, ExpenseCategory } from '@/types/finances';

interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * GET /api/expenses/summary
 * Returns aggregated expense data for analytics
 * Query params: startDate, endDate (optional, defaults to last 12 months)
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

    // 2. Parse query parameters or use defaults (last 12 months)
    const searchParams = request.nextUrl.searchParams;
    const now = new Date();
    const defaultStartDate = format(subMonths(now, 11), 'yyyy-MM-dd');
    const defaultEndDate = format(endOfMonth(now), 'yyyy-MM-dd');

    const startDate = searchParams.get('startDate') || defaultStartDate;
    const endDate = searchParams.get('endDate') || defaultEndDate;

    // 3. Get total expenses
    const totalResult = await query(
      `SELECT COALESCE(SUM(amount_cents), 0) as total
       FROM expenses
       WHERE user_id = $1
         AND transaction_date >= $2
         AND transaction_date <= $3`,
      [userId, startDate, endDate]
    );

    const totalCents = parseInt(totalResult.rows[0]?.total || '0');

    // 4. Get expenses by category
    const categoryResult = await query(
      `SELECT
        category,
        SUM(amount_cents) as total
      FROM expenses
      WHERE user_id = $1
        AND transaction_date >= $2
        AND transaction_date <= $3
      GROUP BY category
      ORDER BY total DESC`,
      [userId, startDate, endDate]
    );

    const byCategory: Record<ExpenseCategory, number> = {
      fuel_mileage: 0,
      phone_internet: 0,
      office_rent: 0,
      equipment: 0,
      professional_services: 0,
      client_meetings: 0,
      training_courses: 0,
      office_supplies: 0,
      marketing: 0,
      insurance: 0,
      utilities: 0,
      other: 0,
    };

    categoryResult.rows.forEach((row) => {
      const category = row.category as ExpenseCategory;
      const amountNIS = parseInt(row.total) / 100;
      byCategory[category] = amountNIS;
    });

    // 5. Get expenses by month (last 12 months)
    const monthResult = await query(
      `SELECT
        TO_CHAR(transaction_date, 'YYYY-MM') as month,
        SUM(amount_cents) as total
      FROM expenses
      WHERE user_id = $1
        AND transaction_date >= $2
        AND transaction_date <= $3
      GROUP BY month
      ORDER BY month ASC`,
      [userId, startDate, endDate]
    );

    const byMonth: Record<string, number> = {};
    monthResult.rows.forEach((row) => {
      const month = row.month;
      const amountNIS = parseInt(row.total) / 100;
      byMonth[month] = amountNIS;
    });

    // Fill in missing months with 0
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      months.push(monthKey);
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = 0;
      }
    }

    // 6. Calculate average monthly expense
    const monthsWithExpenses = Object.values(byMonth).filter(amount => amount > 0).length;
    const avgMonthly = monthsWithExpenses > 0
      ? totalCents / 100 / monthsWithExpenses
      : 0;

    // 7. Get top merchants
    const merchantResult = await query(
      `SELECT
        merchant_name,
        SUM(amount_cents) as total,
        COUNT(*) as count
      FROM expenses
      WHERE user_id = $1
        AND transaction_date >= $2
        AND transaction_date <= $3
        AND merchant_name IS NOT NULL
      GROUP BY merchant_name
      ORDER BY total DESC
      LIMIT 10`,
      [userId, startDate, endDate]
    );

    const topMerchants = merchantResult.rows.map((row) => ({
      name: row.merchant_name,
      amount: parseInt(row.total) / 100,
      count: parseInt(row.count),
    }));

    // 8. Build response
    const summary: ExpenseSummary = {
      total: totalCents / 100,
      byCategory,
      byMonth,
      avgMonthly: Math.round(avgMonthly * 100) / 100, // Round to 2 decimals
      topMerchants,
    };

    return NextResponse.json({
      success: true,
      data: summary,
      metadata: {
        startDate,
        endDate,
        months: months.length,
      },
    });
  } catch (error) {
    console.error('Expense summary API error:', error);

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
