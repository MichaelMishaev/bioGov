/**
 * Automated Payment Reminders Cron Job
 * Runs daily to send automatic payment reminders for overdue invoices
 * Phase 3 Week 3: Payment Reminder System
 *
 * Schedule: Daily at 9:00 AM Israel Time
 * Trigger: Vercel Cron / External cron service
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail, getReminderTemplate, type ReminderEmailData } from '@/lib/email';
import { differenceInDays } from 'date-fns';

/**
 * GET /api/cron/send-reminders
 * Automatically sends payment reminders for overdue invoices
 *
 * Security: Should be called with a cron secret or from Vercel Cron
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify cron authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid cron secret' },
        { status: 401 }
      );
    }

    const startTime = Date.now();
    const results = {
      total_checked: 0,
      reminders_sent: 0,
      errors: [] as string[],
      sent_invoices: [] as any[],
    };

    // 2. Get all overdue invoices that need reminders
    // Strategy: Send reminder every 7 days after due date (7, 14, 21, 30+)
    const overdueInvoices = await query(
      `SELECT
        i.id as invoice_id,
        i.invoice_number,
        i.total_cents,
        i.paid_amount_cents,
        i.due_date,
        i.user_id,
        c.id as customer_id,
        c.name as customer_name,
        c.email as customer_email,
        u.name as business_name,
        u.email as business_email,
        u.phone as business_phone,
        (
          SELECT MAX(pr.sent_at)
          FROM payment_reminders pr
          WHERE pr.invoice_id = i.id
        ) as last_reminder_sent_at,
        (
          SELECT COUNT(*)
          FROM payment_reminders pr
          WHERE pr.invoice_id = i.id
        ) as reminder_count
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      JOIN users u ON i.user_id = u.id
      WHERE i.status = 'sent'
        AND i.due_date < CURRENT_DATE
        AND (i.paid_amount_cents IS NULL OR i.paid_amount_cents < i.total_cents)
        AND c.email IS NOT NULL
      ORDER BY i.due_date ASC`
    );

    results.total_checked = overdueInvoices.rows.length;

    // 3. Process each overdue invoice
    for (const invoice of overdueInvoices.rows) {
      try {
        const totalCents = parseInt(invoice.total_cents);
        const paidCents = parseInt(invoice.paid_amount_cents || '0');
        const balance = totalCents - paidCents;

        if (balance <= 0) {
          continue; // Skip fully paid invoices
        }

        const dueDate = new Date(invoice.due_date);
        const now = new Date();
        const daysOverdue = differenceInDays(now, dueDate);

        // Determine if reminder should be sent today
        const lastReminderDate = invoice.last_reminder_sent_at
          ? new Date(invoice.last_reminder_sent_at)
          : null;

        let shouldSendReminder = false;

        // Reminder schedule logic
        if (daysOverdue >= 30) {
          // 30+ days: Send every 7 days
          if (!lastReminderDate) {
            shouldSendReminder = true;
          } else {
            const daysSinceLastReminder = differenceInDays(now, lastReminderDate);
            shouldSendReminder = daysSinceLastReminder >= 7;
          }
        } else if (daysOverdue >= 21) {
          // 21-29 days: Send if no reminder in last 7 days
          if (!lastReminderDate) {
            shouldSendReminder = true;
          } else {
            const daysSinceLastReminder = differenceInDays(now, lastReminderDate);
            shouldSendReminder = daysSinceLastReminder >= 7;
          }
        } else if (daysOverdue >= 14) {
          // 14-20 days: Send once
          shouldSendReminder = !lastReminderDate || parseInt(invoice.reminder_count) === 0;
        } else if (daysOverdue >= 7) {
          // 7-13 days: Send once
          shouldSendReminder = !lastReminderDate || parseInt(invoice.reminder_count) === 0;
        }

        if (!shouldSendReminder) {
          continue;
        }

        // 4. Prepare email data
        const emailData: ReminderEmailData = {
          customerName: invoice.customer_name,
          invoiceNumber: invoice.invoice_number,
          amount: balance / 100,
          dueDate: dueDate.toLocaleDateString('he-IL'),
          daysOverdue,
          paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://biogov.co.il'}/pay/${invoice.invoice_id}`,
          businessName: invoice.business_name,
          businessEmail: invoice.business_email,
          businessPhone: invoice.business_phone,
        };

        // 5. Get appropriate template
        const template = getReminderTemplate(daysOverdue, emailData);

        // 6. Send email
        const emailResult = await sendEmail({
          to: invoice.customer_email,
          subject: template.subject,
          html: template.html,
        });

        if (emailResult.success) {
          // 7. Log reminder in database
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
              invoice.invoice_id,
              template.type,
              invoice.customer_email,
              emailResult.id || null,
              'Automatic daily reminder',
            ]
          );

          results.reminders_sent++;
          results.sent_invoices.push({
            invoice_id: invoice.invoice_id,
            invoice_number: invoice.invoice_number,
            customer: invoice.customer_name,
            days_overdue: daysOverdue,
            reminder_type: template.type,
          });
        } else {
          results.errors.push(
            `Failed to send to ${invoice.customer_email} for invoice ${invoice.invoice_number}: ${emailResult.error}`
          );
        }
      } catch (error) {
        results.errors.push(
          `Error processing invoice ${invoice.invoice_number}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    const duration = Date.now() - startTime;

    // 8. Return summary
    return NextResponse.json(
      {
        success: true,
        message: 'Payment reminder cron job completed',
        results: {
          ...results,
          duration_ms: duration,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cron job error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/send-reminders
 * Manually trigger the reminder cron job (for testing)
 */
export async function POST(request: NextRequest) {
  // Reuse GET logic for manual triggers
  return GET(request);
}
