/**
 * Compliance Score API Endpoint
 * Calculates and returns user's compliance score and statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  setSessionUserId,
  clearSessionUserId,
  createErrorResponse,
} from '@/lib/middleware';
import { query } from '@/lib/db';

// Type definitions
interface ComplianceScore {
  score: number; // 0-100
  grade: string; // A+, A, B+, B, C+, C, D, F
  description: string;
}

interface TaskStatistics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  completed_on_time: number;
  completed_late: number;
  completion_rate: number; // percentage
  on_time_rate: number; // percentage
}

interface CategoryBreakdown {
  category: string;
  total: number;
  completed: number;
  overdue: number;
  completion_rate: number;
}

interface RecentActivity {
  recent_completions: number; // last 30 days
  upcoming_this_week: number;
  upcoming_this_month: number;
}

interface ComplianceScoreResponse {
  score: ComplianceScore;
  statistics: TaskStatistics;
  category_breakdown: CategoryBreakdown[];
  recent_activity: RecentActivity;
  streak: {
    current: number; // days with no overdue tasks
    longest: number; // best streak
  };
}

/**
 * Calculate grade from score
 */
function calculateGrade(score: number): { grade: string; description: string } {
  if (score >= 97) {
    return { grade: 'A+', description: 'Excellent! Perfect compliance record.' };
  } else if (score >= 93) {
    return { grade: 'A', description: 'Excellent compliance. Keep up the great work!' };
  } else if (score >= 90) {
    return { grade: 'A-', description: 'Great compliance. Very few issues.' };
  } else if (score >= 87) {
    return { grade: 'B+', description: 'Good compliance with minor delays.' };
  } else if (score >= 83) {
    return { grade: 'B', description: 'Good compliance. Some room for improvement.' };
  } else if (score >= 80) {
    return { grade: 'B-', description: 'Satisfactory compliance with occasional delays.' };
  } else if (score >= 77) {
    return { grade: 'C+', description: 'Fair compliance. Several tasks need attention.' };
  } else if (score >= 73) {
    return { grade: 'C', description: 'Fair compliance. Improvement needed.' };
  } else if (score >= 70) {
    return { grade: 'C-', description: 'Below average compliance. Action required.' };
  } else if (score >= 60) {
    return { grade: 'D', description: 'Poor compliance. Immediate attention needed.' };
  } else {
    return { grade: 'F', description: 'Critical compliance issues. Urgent action required!' };
  }
}

/**
 * GET /api/compliance/score
 * Get user's compliance score and detailed statistics
 *
 * This endpoint uses the database function public.get_user_compliance_score()
 * and queries various task statistics to provide a comprehensive overview
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request);

    // Set session for RLS
    await setSessionUserId(auth.userId);

    // Get compliance score from database function
    const scoreResult = await query<{ score: number }>(
      `SELECT public.get_user_compliance_score($1) as score`,
      [auth.userId]
    );

    const rawScore = scoreResult.rows[0]?.score || 100.0;
    const gradeInfo = calculateGrade(rawScore);

    // Get task statistics
    const statsResult = await query<{
      total_tasks: string;
      completed_tasks: string;
      pending_tasks: string;
      overdue_tasks: string;
      completion_rate: number;
    }>(
      `SELECT
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as completed_tasks,
        COUNT(*) FILTER (WHERE completed_at IS NULL) as pending_tasks,
        COUNT(*) FILTER (WHERE completed_at IS NULL AND due_date < CURRENT_DATE) as overdue_tasks,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE completed_at IS NOT NULL) / NULLIF(COUNT(*), 0),
          2
        ) as completion_rate
       FROM public.tasks
       WHERE user_id = $1`,
      [auth.userId]
    );

    const stats = statsResult.rows[0] || {
      total_tasks: '0',
      completed_tasks: '0',
      pending_tasks: '0',
      overdue_tasks: '0',
      completion_rate: 0,
    };

    // Get on-time completion stats
    const onTimeResult = await query<{
      completed_on_time: string;
      completed_late: string;
      on_time_rate: number;
    }>(
      `SELECT
        COUNT(*) FILTER (WHERE completed_at::DATE <= due_date) as completed_on_time,
        COUNT(*) FILTER (WHERE completed_at::DATE > due_date) as completed_late,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE completed_at::DATE <= due_date) / NULLIF(COUNT(*), 0),
          2
        ) as on_time_rate
       FROM public.tasks
       WHERE user_id = $1 AND completed_at IS NOT NULL`,
      [auth.userId]
    );

    const onTimeStats = onTimeResult.rows[0] || {
      completed_on_time: '0',
      completed_late: '0',
      on_time_rate: 100.0,
    };

    // Get category breakdown
    const categoryResult = await query<{
      category: string;
      total: string;
      completed: string;
      overdue: string;
      completion_rate: number;
    }>(
      `SELECT
        category,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as completed,
        COUNT(*) FILTER (WHERE completed_at IS NULL AND due_date < CURRENT_DATE) as overdue,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE completed_at IS NOT NULL) / COUNT(*),
          2
        ) as completion_rate
       FROM public.tasks
       WHERE user_id = $1
       GROUP BY category
       ORDER BY total DESC`,
      [auth.userId]
    );

    // Get recent activity
    const activityResult = await query<{
      recent_completions: string;
      upcoming_this_week: string;
      upcoming_this_month: string;
    }>(
      `SELECT
        COUNT(*) FILTER (
          WHERE completed_at IS NOT NULL
          AND completed_at >= CURRENT_DATE - INTERVAL '30 days'
        ) as recent_completions,
        COUNT(*) FILTER (
          WHERE completed_at IS NULL
          AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        ) as upcoming_this_week,
        COUNT(*) FILTER (
          WHERE completed_at IS NULL
          AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        ) as upcoming_this_month
       FROM public.tasks
       WHERE user_id = $1`,
      [auth.userId]
    );

    const activity = activityResult.rows[0] || {
      recent_completions: '0',
      upcoming_this_week: '0',
      upcoming_this_month: '0',
    };

    // Calculate streak (simplified - days without overdue tasks)
    // For a more accurate streak, you'd need to track daily compliance
    const currentOverdue = parseInt(stats.overdue_tasks);
    const currentStreak = currentOverdue === 0 ? 1 : 0; // Simplified

    // Get longest streak from history (if available)
    const streakResult = await query<{ longest_streak: number }>(
      `SELECT COALESCE(
        (metadata->>'longest_streak')::INTEGER,
        1
      ) as longest_streak
       FROM public.business_profiles
       WHERE user_id = $1`,
      [auth.userId]
    );

    const longestStreak = streakResult.rows[0]?.longest_streak || 1;

    // Clear session
    await clearSessionUserId();

    // Build response
    const response: ComplianceScoreResponse = {
      score: {
        score: Math.round(rawScore * 10) / 10, // Round to 1 decimal
        grade: gradeInfo.grade,
        description: gradeInfo.description,
      },
      statistics: {
        total_tasks: parseInt(stats.total_tasks),
        completed_tasks: parseInt(stats.completed_tasks),
        pending_tasks: parseInt(stats.pending_tasks),
        overdue_tasks: parseInt(stats.overdue_tasks),
        completed_on_time: parseInt(onTimeStats.completed_on_time),
        completed_late: parseInt(onTimeStats.completed_late),
        completion_rate: stats.completion_rate,
        on_time_rate: onTimeStats.on_time_rate,
      },
      category_breakdown: categoryResult.rows.map((row) => ({
        category: row.category,
        total: parseInt(row.total),
        completed: parseInt(row.completed),
        overdue: parseInt(row.overdue),
        completion_rate: row.completion_rate,
      })),
      recent_activity: {
        recent_completions: parseInt(activity.recent_completions),
        upcoming_this_week: parseInt(activity.upcoming_this_week),
        upcoming_this_month: parseInt(activity.upcoming_this_month),
      },
      streak: {
        current: currentStreak,
        longest: longestStreak,
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    await clearSessionUserId();

    // Handle authentication errors
    if (error instanceof NextResponse) {
      return error;
    }

    console.error('GET /api/compliance/score error:', error);
    return createErrorResponse(
      'Failed to calculate compliance score',
      500,
      'Internal Server Error'
    );
  }
}
