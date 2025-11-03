/**
 * Cash Flow API Endpoint
 * Returns daily, weekly, and monthly financial aggregates
 * Phase 3: Daily Engagement Features
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { query } from '@/lib/db';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
  subWeeks,
  subMonths,
  differenceInDays,
} from 'date-fns';
import type { CashFlowSummary } from '@/types/finances';

interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * GET /api/finances/cash-flow
 * Returns cash flow summary for today, this week, and this month
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

    // 2. Get date ranges
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });

    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // 3. Calculate today's metrics
    const todayRevenue = await query(
      `SELECT COALESCE(SUM(total_cents), 0) as total
       FROM invoices
       WHERE user_id = $1
         AND issue_date >= $2
         AND issue_date <= $3
         AND status != 'canceled'`,
      [userId, todayStart.toISOString().split('T')[0], todayEnd.toISOString().split('T')[0]]
    );

    const todayExpenses = await query(
      `SELECT COALESCE(SUM(amount_cents), 0) as total
       FROM expenses
       WHERE user_id = $1
         AND transaction_date >= $2
         AND transaction_date <= $3`,
      [userId, todayStart.toISOString().split('T')[0], todayEnd.toISOString().split('T')[0]]
    );

    const todayRevenueCents = parseInt(todayRevenue.rows[0]?.total || '0');
    const todayExpensesCents = parseInt(todayExpenses.rows[0]?.total || '0');
    const todayProfitCents = todayRevenueCents - todayExpensesCents;

    // 4. Calculate this week's metrics
    const weekRevenue = await query(
      `SELECT COALESCE(SUM(total_cents), 0) as total
       FROM invoices
       WHERE user_id = $1
         AND issue_date >= $2
         AND issue_date <= $3
         AND status != 'canceled'`,
      [userId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]]
    );

    const weekExpenses = await query(
      `SELECT COALESCE(SUM(amount_cents), 0) as total
       FROM expenses
       WHERE user_id = $1
         AND transaction_date >= $2
         AND transaction_date <= $3`,
      [userId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]]
    );

    const lastWeekRevenue = await query(
      `SELECT COALESCE(SUM(total_cents), 0) as total
       FROM invoices
       WHERE user_id = $1
         AND issue_date >= $2
         AND issue_date <= $3
         AND status != 'canceled'`,
      [userId, lastWeekStart.toISOString().split('T')[0], lastWeekEnd.toISOString().split('T')[0]]
    );

    const lastWeekExpenses = await query(
      `SELECT COALESCE(SUM(amount_cents), 0) as total
       FROM expenses
       WHERE user_id = $1
         AND transaction_date >= $2
         AND transaction_date <= $3`,
      [userId, lastWeekStart.toISOString().split('T')[0], lastWeekEnd.toISOString().split('T')[0]]
    );

    const weekRevenueCents = parseInt(weekRevenue.rows[0]?.total || '0');
    const weekExpensesCents = parseInt(weekExpenses.rows[0]?.total || '0');
    const weekProfitCents = weekRevenueCents - weekExpensesCents;

    const lastWeekRevenueCents = parseInt(lastWeekRevenue.rows[0]?.total || '0');
    const lastWeekExpensesCents = parseInt(lastWeekExpenses.rows[0]?.total || '0');
    const lastWeekProfitCents = lastWeekRevenueCents - lastWeekExpensesCents;

    const changeVsLastWeek =
      lastWeekProfitCents !== 0
        ? ((weekProfitCents - lastWeekProfitCents) / lastWeekProfitCents) * 100
        : weekProfitCents > 0
        ? 100
        : 0;

    // 5. Calculate this month's metrics
    const monthRevenue = await query(
      `SELECT COALESCE(SUM(total_cents), 0) as total
       FROM invoices
       WHERE user_id = $1
         AND issue_date >= $2
         AND issue_date <= $3
         AND status != 'canceled'`,
      [userId, monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]]
    );

    const monthExpenses = await query(
      `SELECT COALESCE(SUM(amount_cents), 0) as total
       FROM expenses
       WHERE user_id = $1
         AND transaction_date >= $2
         AND transaction_date <= $3`,
      [userId, monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]]
    );

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

    const monthRevenueCents = parseInt(monthRevenue.rows[0]?.total || '0');
    const monthExpensesCents = parseInt(monthExpenses.rows[0]?.total || '0');
    const monthProfitCents = monthRevenueCents - monthExpensesCents;

    const lastMonthRevenueCents = parseInt(lastMonthRevenue.rows[0]?.total || '0');
    const lastMonthExpensesCents = parseInt(lastMonthExpenses.rows[0]?.total || '0');
    const lastMonthProfitCents = lastMonthRevenueCents - lastMonthExpensesCents;

    const changeVsLastMonth =
      lastMonthProfitCents !== 0
        ? ((monthProfitCents - lastMonthProfitCents) / lastMonthProfitCents) * 100
        : monthProfitCents > 0
        ? 100
        : 0;

    // 6. Get unpaid invoices summary
    const unpaidInvoices = await query(
      `SELECT
        id,
        total_cents,
        due_date,
        status
      FROM invoices
      WHERE user_id = $1
        AND status = 'sent'
        AND (
          paid_amount_cents IS NULL
          OR paid_amount_cents < total_cents
        )`,
      [userId]
    );

    const nowDate = now.toISOString().split('T')[0];
    let overdueCount = 0;
    let overdueAmount = 0;
    let dueSoonCount = 0;
    let dueSoonAmount = 0;
    let onTrackCount = 0;
    let onTrackAmount = 0;

    unpaidInvoices.rows.forEach((invoice) => {
      const dueDate = invoice.due_date;
      const amountCents = parseInt(invoice.total_cents);
      const daysUntilDue = differenceInDays(new Date(dueDate), now);

      if (daysUntilDue < 0) {
        // Overdue
        overdueCount++;
        overdueAmount += amountCents;
      } else if (daysUntilDue <= 7) {
        // Due soon (within 7 days)
        dueSoonCount++;
        dueSoonAmount += amountCents;
      } else {
        // On track
        onTrackCount++;
        onTrackAmount += amountCents;
      }
    });

    // 7. Get active financial goal (if any)
    const activeGoal = await query(
      `SELECT
        goal_type,
        target_amount_cents,
        target_percentage,
        period_start,
        period_end
      FROM financial_goals
      WHERE user_id = $1
        AND is_active = TRUE
        AND period_start <= $2
        AND period_end >= $2
      ORDER BY created_at DESC
      LIMIT 1`,
      [userId, nowDate]
    );

    let goalData = undefined;
    if (activeGoal.rows.length > 0) {
      const goal = activeGoal.rows[0];
      const targetCents = parseInt(goal.target_amount_cents || '0');
      const currentCents =
        goal.goal_type === 'monthly_revenue' ? monthRevenueCents : monthProfitCents;
      const percentage = targetCents > 0 ? (currentCents / targetCents) * 100 : 0;
      const isOnTrack = percentage >= 75; // Consider on track if 75%+ of goal

      goalData = {
        target: targetCents / 100, // Convert to NIS
        current: currentCents / 100,
        percentage,
        isOnTrack,
      };
    }

    // 8. Build response
    const response: CashFlowSummary = {
      today: {
        revenue: todayRevenueCents / 100,
        expenses: todayExpensesCents / 100,
        profit: todayProfitCents / 100,
      },
      thisWeek: {
        revenue: weekRevenueCents / 100,
        expenses: weekExpensesCents / 100,
        profit: weekProfitCents / 100,
        changeVsLastWeek: Math.round(changeVsLastWeek * 10) / 10, // Round to 1 decimal
      },
      thisMonth: {
        revenue: monthRevenueCents / 100,
        expenses: monthExpensesCents / 100,
        profit: monthProfitCents / 100,
        changeVsLastMonth: Math.round(changeVsLastMonth * 10) / 10,
      },
      unpaidInvoices: {
        overdue: {
          count: overdueCount,
          amount: overdueAmount / 100,
        },
        dueSoon: {
          count: dueSoonCount,
          amount: dueSoonAmount / 100,
        },
        onTrack: {
          count: onTrackCount,
          amount: onTrackAmount / 100,
        },
      },
      goal: goalData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Cash flow API error:', error);

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
