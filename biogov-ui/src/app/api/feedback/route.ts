/**
 * API Route: POST /api/feedback
 * Collects user feedback ratings and comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, query } from '@/lib/db';

interface FeedbackRequest {
  assessmentId: string;
  rating: number;
  comment?: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: FeedbackRequest = await request.json();
    const { assessmentId, rating, comment, userId } = body;

    // Validate required fields
    if (!assessmentId) {
      return NextResponse.json(
        {
          error: 'Missing assessment ID',
          message: 'מזהה הבדיקה חסר',
        },
        { status: 400 }
      );
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json(
        {
          error: 'Missing rating',
          message: 'דירוג חסר',
        },
        { status: 400 }
      );
    }

    // Validate rating range (1-5)
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        {
          error: 'Invalid rating',
          message: 'הדירוג חייב להיות מספר שלם בין 1 ל-5',
        },
        { status: 400 }
      );
    }

    // Validate comment length (max 500 characters)
    if (comment && comment.length > 500) {
      return NextResponse.json(
        {
          error: 'Comment too long',
          message: 'התגובה ארוכה מדי (מקסימום 500 תווים)',
        },
        { status: 400 }
      );
    }

    // Verify assessment exists
    const assessment = await db.getAssessmentById(assessmentId);
    if (!assessment) {
      return NextResponse.json(
        {
          error: 'Assessment not found',
          message: 'הבדיקה לא נמצאה במערכת',
        },
        { status: 404 }
      );
    }

    // Check if feedback already exists for this assessment
    const existingFeedback = await query(
      `SELECT id FROM public.feedback WHERE assessment_id = $1`,
      [assessmentId]
    );

    if (existingFeedback.rows.length > 0) {
      return NextResponse.json(
        {
          error: 'Feedback already submitted',
          message: 'כבר נשלחה משוב לבדיקה זו',
        },
        { status: 409 }
      );
    }

    // Create feedback entry
    try {
      const feedback = await db.createFeedback({
        userId: userId || undefined,
        assessmentId,
        rating,
        comment: comment || undefined,
      });

      return NextResponse.json(
        {
          success: true,
          feedbackId: feedback.id,
          message: 'תודה על המשוב!',
        },
        { status: 201 }
      );
    } catch (error: any) {
      // Handle foreign key violation (invalid assessmentId)
      if (error.code === '23503') {
        return NextResponse.json(
          {
            error: 'Invalid assessment ID',
            message: 'מזהה הבדיקה אינו תקין',
          },
          { status: 400 }
        );
      }

      // Handle check constraint violation (invalid rating)
      if (error.code === '23514') {
        return NextResponse.json(
          {
            error: 'Invalid rating or comment',
            message: 'הדירוג או התגובה אינם תקינים',
          },
          { status: 400 }
        );
      }

      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Error in /api/feedback:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'אירעה שגיאה בשליחת המשוב. נסה שוב מאוחר יותר.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler to retrieve feedback summary (for admin dashboard)
 */
export async function GET() {
  try {
    const summary = await db.getFeedbackSummary();

    return NextResponse.json(
      {
        success: true,
        summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/feedback:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve feedback summary',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
