/**
 * Profit & Loss (P&L) API Endpoint
 * Calculates revenue, expenses, profit, and Israeli tax obligations
 * Phase 3 Week 3: P&L Dashboard
 *
 * ISRAELI TAX RATES (2025):
 * - VAT: 18% (effective Jan 1, 2025)
 * - Income Tax: ~30% average for self-employed (progressive)
 * - National Insurance: 7.6% for self-employed
 * - Health Tax: 5%
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { query } from '@/lib/db';
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  format,
} from 'date-fns';

interface JWTPayload {
  userId: string;
  email: string;
}

// Israeli tax rates (configurable)
const TAX_RATES = {
  vat: 0.18, // 18% VAT (effective 2025)
  income_tax: 0.30, // 30% average for self-employed
  national_insurance: 0.076, // 7.6% for self-employed
  health_tax: 0.05, // 5% health tax
};

/**
 * GET /api/finances/profit-loss
 * Query params:
 * - period: 'month' | 'quarter' | 'year' | 'all-time'
 * - year: YYYY (optional, defaults to current year)
 * - month: MM (optional, defaults to current month)
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
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    // 3. Calculate date ranges based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;

    switch (period) {
      case 'month':
        if (yearParam && monthParam) {
          const targetDate = new Date(parseInt(yearParam), parseInt(monthParam) - 1, 1);
          startDate = startOfMonth(targetDate);
          endDate = endOfMonth(targetDate);
          periodLabel = format(targetDate, 'MMMM yyyy');
        } else {
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          periodLabel = format(now, 'MMMM yyyy');
        }
        break;

      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0);
        periodLabel = `Q${currentQuarter + 1} ${now.getFullYear()}`;
        break;

      case 'year':
        if (yearParam) {
          startDate = startOfYear(new Date(parseInt(yearParam), 0, 1));
          endDate = endOfYear(new Date(parseInt(yearParam), 0, 1));
          periodLabel = yearParam;
        } else {
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          periodLabel = now.getFullYear().toString();
        }
        break;

      case 'all-time':
        startDate = new Date('2020-01-01'); // Far enough back
        endDate = now;
        periodLabel = 'All Time';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid period. Use: month, quarter, year, or all-time' },
          { status: 400 }
        );
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // 4. Calculate REVENUE from invoices
    const revenueQuery = await query(
      `SELECT
        COALESCE(SUM(total_cents), 0) as gross_revenue_cents,
        COALESCE(SUM(
          CASE
            WHEN vat_rate > 0 THEN total_cents * vat_rate / (100 + vat_rate)
            ELSE 0
          END
        ), 0) as vat_collected_cents,
        COUNT(*) as invoice_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
      FROM invoices
      WHERE user_id = $1
        AND issue_date >= $2
        AND issue_date <= $3
        AND status != 'canceled'`,
      [userId, startDateStr, endDateStr]
    );

    const revenueData = revenueQuery.rows[0];
    const grossRevenueCents = parseInt(revenueData.gross_revenue_cents || '0');
    const vatCollectedCents = parseInt(revenueData.vat_collected_cents || '0');
    const invoiceCount = parseInt(revenueData.invoice_count || '0');
    const paidCount = parseInt(revenueData.paid_count || '0');

    // Net revenue (excluding VAT)
    const netRevenueCents = grossRevenueCents - vatCollectedCents;

    // 5. Calculate EXPENSES
    const expensesQuery = await query(
      `SELECT
        COALESCE(SUM(amount_cents), 0) as total_expenses_cents,
        COALESCE(SUM(vat_cents), 0) as vat_paid_cents,
        COUNT(*) as expense_count,
        category,
        COALESCE(SUM(amount_cents), 0) as category_total_cents
      FROM expenses
      WHERE user_id = $1
        AND transaction_date >= $2
        AND transaction_date <= $3
      GROUP BY category`,
      [userId, startDateStr, endDateStr]
    );

    const expensesByCategory = expensesQuery.rows.map((row) => ({
      category: row.category,
      amount: parseInt(row.category_total_cents) / 100,
      amount_cents: parseInt(row.category_total_cents),
    }));

    const totalExpensesCents = expensesByCategory.reduce(
      (sum, cat) => sum + cat.amount_cents,
      0
    );

    const vatPaidCents = expensesQuery.rows.reduce(
      (sum, row) => sum + parseInt(row.vat_paid_cents || '0'),
      0
    );

    const expenseCount = expensesQuery.rows.reduce(
      (sum, row) => sum + parseInt(row.expense_count || '0'),
      0
    );

    // 6. Calculate GROSS PROFIT
    const grossProfitCents = netRevenueCents - totalExpensesCents;
    const grossProfitMargin = netRevenueCents > 0
      ? (grossProfitCents / netRevenueCents) * 100
      : 0;

    // 7. Calculate VAT POSITION
    const netVatOwedCents = vatCollectedCents - vatPaidCents;

    // 8. Calculate TAXES (on gross profit)
    // Taxable income = Gross Profit (net revenue - expenses)
    const taxableIncomeCents = grossProfitCents;

    // Income tax (30% average)
    const incomeTaxCents = Math.round(taxableIncomeCents * TAX_RATES.income_tax);

    // National Insurance (7.6%)
    const nationalInsuranceCents = Math.round(taxableIncomeCents * TAX_RATES.national_insurance);

    // Health tax (5%)
    const healthTaxCents = Math.round(taxableIncomeCents * TAX_RATES.health_tax);

    // Total taxes (income + NI + health)
    const totalTaxesCents = incomeTaxCents + nationalInsuranceCents + healthTaxCents;

    // 9. Calculate NET PROFIT (take-home)
    // Net Profit = Gross Profit - Income Tax - National Insurance - Health Tax
    // (VAT is separate - owed to government but not part of profit calc)
    const netProfitCents = grossProfitCents - totalTaxesCents;
    const netProfitMargin = netRevenueCents > 0
      ? (netProfitCents / netRevenueCents) * 100
      : 0;

    // 10. Calculate comparison with previous period
    let comparisonData = null;
    if (period === 'month' && !monthParam) {
      // Compare with last month
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const lastMonthRevenue = await query(
        `SELECT COALESCE(SUM(total_cents), 0) as total
         FROM invoices
         WHERE user_id = $1
           AND issue_date >= $2
           AND issue_date <= $3
           AND status != 'canceled'`,
        [userId, lastMonthStart.toISOString().split('T')[0], lastMonthEnd.toISOString().split('T')[0]]
      );

      const lastMonthExpenses = await query(
        `SELECT COALESCE(SUM(amount_cents), 0) as total
         FROM expenses
         WHERE user_id = $1
           AND transaction_date >= $2
           AND transaction_date <= $3`,
        [userId, lastMonthStart.toISOString().split('T')[0], lastMonthEnd.toISOString().split('T')[0]]
      );

      const lastMonthRevenueCents = parseInt(lastMonthRevenue.rows[0]?.total || '0');
      const lastMonthExpensesCents = parseInt(lastMonthExpenses.rows[0]?.total || '0');
      const lastMonthProfitCents = lastMonthRevenueCents - lastMonthExpensesCents;

      const revenueChange = lastMonthRevenueCents > 0
        ? ((grossRevenueCents - lastMonthRevenueCents) / lastMonthRevenueCents) * 100
        : 0;
      const profitChange = lastMonthProfitCents > 0
        ? ((grossProfitCents - lastMonthProfitCents) / lastMonthProfitCents) * 100
        : 0;

      comparisonData = {
        period: 'last_month',
        revenue_change_percent: Math.round(revenueChange * 10) / 10,
        profit_change_percent: Math.round(profitChange * 10) / 10,
      };
    }

    // 11. Build response
    const response = {
      period: {
        type: period,
        label: periodLabel,
        start_date: startDateStr,
        end_date: endDateStr,
      },
      revenue: {
        gross: grossRevenueCents / 100,
        vat_collected: vatCollectedCents / 100,
        net: netRevenueCents / 100,
        invoice_count: invoiceCount,
        paid_count: paidCount,
        average_invoice: invoiceCount > 0 ? grossRevenueCents / invoiceCount / 100 : 0,
      },
      expenses: {
        total: totalExpensesCents / 100,
        vat_paid: vatPaidCents / 100,
        expense_count: expenseCount,
        average_expense: expenseCount > 0 ? totalExpensesCents / expenseCount / 100 : 0,
        by_category: expensesByCategory,
      },
      profit: {
        gross: grossProfitCents / 100,
        gross_margin_percent: Math.round(grossProfitMargin * 10) / 10,
        net: netProfitCents / 100,
        net_margin_percent: Math.round(netProfitMargin * 10) / 10,
      },
      vat: {
        collected: vatCollectedCents / 100,
        paid: vatPaidCents / 100,
        net_owed: netVatOwedCents / 100,
        rate_percent: TAX_RATES.vat * 100,
      },
      taxes: {
        income_tax: incomeTaxCents / 100,
        national_insurance: nationalInsuranceCents / 100,
        health_tax: healthTaxCents / 100,
        total: totalTaxesCents / 100,
        effective_rate_percent: taxableIncomeCents > 0
          ? Math.round((totalTaxesCents / taxableIncomeCents) * 1000) / 10
          : 0,
      },
      take_home: {
        amount: netProfitCents / 100,
        after_vat_and_taxes: (netProfitCents - netVatOwedCents) / 100,
      },
      comparison: comparisonData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('P&L API error:', error);

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
