/**
 * API Route: POST /api/signup
 * Handles email signup for assessment results delivery
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, query } from '@/lib/db';

interface SignupRequest {
  email: string;
  name: string;
  consentGiven: boolean;
  assessmentId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SignupRequest = await request.json();
    const { email, name, consentGiven, assessmentId } = body;

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'שם ואימייל הם שדות חובה',
        },
        { status: 400 }
      );
    }

    // Validate email format (basic validation - database has regex constraint)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: 'Invalid email format',
          message: 'כתובת האימייל אינה תקינה',
        },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        {
          error: 'Invalid name length',
          message: 'השם חייב להכיל בין 2 ל-100 תווים',
        },
        { status: 400 }
      );
    }

    // Check if consent was given (required for GDPR/Israeli Privacy Law)
    if (!consentGiven) {
      return NextResponse.json(
        {
          error: 'Consent required',
          message: 'יש לאשר את תנאי השימוש ומדיניות הפרטיות',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.findUserByEmail(email);

    let user;
    if (existingUser) {
      // User already exists
      if (existingUser.unsubscribed_at) {
        return NextResponse.json(
          {
            error: 'User unsubscribed',
            message: 'כתובת האימייל הזאת ביטלה את ההרשמה. צור קשר לשחזור.',
          },
          { status: 403 }
        );
      }

      user = existingUser;
    } else {
      // Create new user
      try {
        user = await db.createUser(email, name, consentGiven);
      } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          // Duplicate email
          return NextResponse.json(
            {
              error: 'Email already exists',
              message: 'כתובת האימייל כבר רשומה במערכת',
            },
            { status: 409 }
          );
        }

        // Handle check constraint violation (invalid email format)
        if (error.code === '23514') {
          return NextResponse.json(
            {
              error: 'Invalid email format',
              message: 'כתובת האימייל אינה תקינה',
            },
            { status: 400 }
          );
        }

        throw error; // Re-throw other errors
      }
    }

    // If assessmentId provided, link assessment to user
    if (assessmentId) {
      try {
        // Update assessment with user_id
        await query(
          `UPDATE public.assessments SET user_id = $1 WHERE id = $2`,
          [user.id, assessmentId]
        );
      } catch (error) {
        console.error('Failed to link assessment to user:', error);
        // Don't fail the signup if assessment linking fails
      }
    }

    // TODO: Send welcome email (future - when Resend.com is configured)
    // await sendWelcomeEmail(user.email, user.name);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        message: 'נרשמת בהצלחה! תוצאות הבדיקה נשלחו לאימייל.',
      },
      { status: existingUser ? 200 : 201 }
    );
  } catch (error) {
    console.error('Error in /api/signup:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'אירעה שגיאה בהרשמה. נסה שוב מאוחר יותר.',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
