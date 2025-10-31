/**
 * API Route: POST /api/assess
 * Processes quiz answers and returns VAT registration recommendation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  assessVATStatus,
  validateAnswers,
  hashIP,
  QuizAnswers,
} from '@/lib/vat-logic';

// Rate limiting configuration
const RATE_LIMIT_MAX = 10; // Maximum assessments per IP per 24 hours
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { answers, userId } = body;

    // Validate answers structure
    if (!validateAnswers(answers)) {
      return NextResponse.json(
        {
          error: 'Invalid answers format',
          message: 'Quiz answers must include: activity, revenue, clients, employees, voluntary',
        },
        { status: 400 }
      );
    }

    // Get IP address for rate limiting
    const ip = getClientIP(request);
    const ipHash = await hashIP(ip);

    // Check rate limit
    const assessmentCount = await db.checkRateLimit(ipHash);
    if (assessmentCount >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `מקסימום ${RATE_LIMIT_MAX} בדיקות ליום. נסה שוב מחר.`,
        },
        { status: 429 }
      );
    }

    // Run VAT assessment logic
    const result = assessVATStatus(answers as QuizAnswers);

    // Get user agent for analytics
    const userAgent = request.headers.get('user-agent') || undefined;

    // Save assessment to database
    const assessment = await db.createAssessment({
      userId: userId || undefined,
      answersJson: answers,
      resultStatus: result.status,
      resultChecklist: result.checklist,
      ipHash,
      userAgent,
    });

    // Return assessment result
    return NextResponse.json(
      {
        success: true,
        assessmentId: assessment.id,
        result: {
          status: result.status,
          statusText: result.statusText,
          explanation: result.explanation,
          checklist: result.checklist,
          metadata: result.metadata,
        },
        shareUrl: `/results/${assessment.id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in /api/assess:', error);

    // Return generic error to client (don't leak internal details)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'אירעה שגיאה בעיבוד הבדיקה. נסה שוב מאוחר יותר.',
      },
      { status: 500 }
    );
  }
}

/**
 * Extract client IP address from request
 * Handles various proxy headers (Vercel, Railway, Cloudflare)
 */
function getClientIP(request: NextRequest): string {
  // Try common proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback (localhost in development)
  return '127.0.0.1';
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
