/**
 * Send Payment Reminder API Endpoint
 * Sends email reminder for overdue invoice
 * Phase 3 Week 3: Payment Reminder System
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { query } from '@/lib/db';
import { sendEmail, getReminderTemplate, type ReminderEmailData } from '@/lib/email';
import { differenceInDays } from 'date-fns';

interface JWTPayload {
  userId: string;
  email: string;
}

interface SendReminderBody {
  reminder_type?: 'gentle_reminder' | 'firm_reminder' | 'urgent_reminder' | 'final_notice';
  custom_message?: string;
  send_copy_to_self?: boolean;
}

/**
 * POST /api/invoices/:id/send-reminder
 * Sends payment reminder email for overdue invoice
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const invoiceId = params.id;

    // 2. Parse request body
    const body: SendReminderBody = await request.json().catch(() => ({}));

    // 3. Get invoice details with customer info
    const invoiceQuery = await query(
      `SELECT
        i.id,
        i.invoice_number,
        i.total_cents,
        i.due_date,
        i.issue_date,
        i.status,
        i.paid_amount_cents,
        i.user_id,
        c.id as customer_id,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        u.name as business_name,
        u.email as business_email,
        u.phone as business_phone
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      JOIN users u ON i.user_id = u.id
      WHERE i.id = $1`,
      [invoiceId]
    );

    if (invoiceQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoice = invoiceQuery.rows[0];

    // 4. Verify ownership
    if (invoice.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - Not your invoice' },
        { status: 403 }
      );
    }

    // 5. Validate invoice is overdue and unpaid
    const totalCents = parseInt(invoice.total_cents);
    const paidCents = parseInt(invoice.paid_amount_cents || '0');
    const balance = totalCents - paidCents;

    if (balance <= 0) {
      return NextResponse.json(
        { error: 'Invoice is already fully paid' },
        { status: 400 }
      );
    }

    const dueDate = new Date(invoice.due_date);
    const now = new Date();
    const daysOverdue = differenceInDays(now, dueDate);

    if (daysOverdue < 0) {
      return NextResponse.json(
        { error: 'Invoice is not yet overdue' },
        { status: 400 }
      );
    }

    // 6. Validate customer has email
    if (!invoice.customer_email) {
      return NextResponse.json(
        { error: 'Customer has no email address on file' },
        { status: 400 }
      );
    }

    // 7. Prepare email data
    const emailData: ReminderEmailData = {
      customerName: invoice.customer_name,
      invoiceNumber: invoice.invoice_number,
      amount: balance / 100,
      dueDate: new Date(invoice.due_date).toLocaleDateString('he-IL'),
      daysOverdue,
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://biogov.co.il'}/pay/${invoiceId}`,
      businessName: invoice.business_name,
      businessEmail: invoice.business_email,
      businessPhone: invoice.business_phone,
    };

    // 8. Get appropriate template or use custom type
    const reminderType = body.reminder_type || 'auto';
    let template;
    let actualType;

    if (reminderType === 'auto') {
      // Auto-select based on days overdue
      template = getReminderTemplate(daysOverdue, emailData);
      actualType = template.type;
    } else {
      // Use specified type
      template = getReminderTemplate(
        reminderType === 'final_notice' ? 30 :
        reminderType === 'urgent_reminder' ? 21 :
        reminderType === 'firm_reminder' ? 14 : 7,
        emailData
      );
      actualType = reminderType;
    }

    // Add custom message if provided
    let finalHtml = template.html;
    if (body.custom_message) {
      finalHtml = finalHtml.replace(
        '</div>',
        `<div style="background: #F3F4F6; border-right: 4px solid #3B82F6; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong>הודעה נוספת:</strong><br>
          ${body.custom_message}
        </div></div>`
      );
    }

    // 9. Send email
    const emailResult = await sendEmail({
      to: invoice.customer_email,
      subject: template.subject,
      html: finalHtml,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    // 10. Send copy to sender if requested
    if (body.send_copy_to_self && invoice.business_email) {
      await sendEmail({
        to: invoice.business_email,
        subject: `[עותק] ${template.subject}`,
        html: finalHtml,
      });
    }

    // 11. Log reminder in database
    await query(
      `INSERT INTO payment_reminders (
        invoice_id,
        reminder_type,
        sent_to,
        sent_at,
        email_id,
        custom_message
      ) VALUES ($1, $2, $3, NOW(), $4, $5)`,
      [
        invoiceId,
        actualType,
        invoice.customer_email,
        emailResult.id || null,
        body.custom_message || null,
      ]
    );

    // 12. Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Payment reminder sent successfully',
        reminder: {
          type: actualType,
          sent_to: invoice.customer_email,
          days_overdue: daysOverdue,
          balance: balance / 100,
          email_id: emailResult.id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send reminder error:', error);

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
