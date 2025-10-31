/**
 * API Route: GET /api/results/[id]
 * Retrieves assessment results by ID (for shareable URLs)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          error: 'Invalid ID format',
          message: 'מזהה הבדיקה אינו תקין',
        },
        { status: 400 }
      );
    }

    // Retrieve assessment from database
    const assessment = await db.getAssessmentById(id);

    if (!assessment) {
      return NextResponse.json(
        {
          error: 'Assessment not found',
          message: 'הבדיקה לא נמצאה במערכת',
        },
        { status: 404 }
      );
    }

    // Format response
    return NextResponse.json(
      {
        success: true,
        assessment: {
          id: assessment.id,
          createdAt: assessment.created_at,
          answers: assessment.answers_json,
          result: {
            status: assessment.result_status,
            checklist: assessment.result_checklist,
          },
          user: assessment.email
            ? {
                email: assessment.email,
                name: assessment.name,
              }
            : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/results/[id]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'אירעה שגיאה בטעינת התוצאות. נסה שוב מאוחר יותר.',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
