/**
 * Email Utility using Resend
 * Handles payment reminder emails for overdue invoices
 * Phase 3 Week 3: Payment Reminder System
 */

import { Resend } from 'resend';

// Initialize Resend with API key from environment (lazy initialization)
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail({ to, subject, html, from }: EmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Default from address (configure in .env)
    const fromAddress = from || process.env.EMAIL_FROM || 'noreply@biogov.co.il';

    const client = getResendClient();
    const { data, error } = await client.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Email send failed',
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error',
    };
  }
}

/**
 * Payment Reminder Email Templates
 * Hebrew templates for different stages of overdue invoices
 */

export interface ReminderEmailData {
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  paymentUrl?: string;
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
}

/**
 * Day 7: Gentle Reminder (תזכורת נעימה)
 */
export function getGentleReminderTemplate(data: ReminderEmailData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>תזכורת תשלום</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      direction: rtl;
      background-color: #f5f5f5;
      padding: 20px;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #1F2937;
    }
    .invoice-box {
      background: #F3F4F6;
      border-right: 4px solid #3B82F6;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .invoice-box .label {
      color: #6B7280;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .invoice-box .value {
      color: #1F2937;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .amount {
      font-size: 32px;
      color: #3B82F6;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background: #3B82F6;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      transition: background 0.3s;
    }
    .button:hover {
      background: #2563EB;
    }
    .footer {
      background: #F9FAFB;
      padding: 20px;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
      border-top: 1px solid #E5E7EB;
    }
    .contact {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 14px;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 תזכורת ידידותית לתשלום</h1>
    </div>

    <div class="content">
      <div class="greeting">
        שלום ${data.customerName},
      </div>

      <p>
        אנו כותבים אליך תזכורת ידידותית בנוגע לחשבונית שטרם שולמה.
      </p>

      <div class="invoice-box">
        <div class="label">מספר חשבונית:</div>
        <div class="value">#${data.invoiceNumber}</div>

        <div class="label">תאריך פירעון:</div>
        <div class="value">${data.dueDate}</div>

        <div class="label">סכום לתשלום:</div>
        <div class="amount">₪${data.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</div>
      </div>

      <p>
        החשבונית באיחור של <strong>${data.daysOverdue} ימים</strong>.
      </p>

      <p>
        נשמח אם תוכל לטפל בתשלום בהקדם האפשרי. אם כבר שילמת, אנא התעלם מהודעה זו.
      </p>

      ${data.paymentUrl ? `
        <div style="text-align: center;">
          <a href="${data.paymentUrl}" class="button">לתשלום מאובטח 🔒</a>
        </div>
      ` : ''}

      <p>
        אם יש לך שאלות או בעיות בתשלום, אנא צור קשר איתנו.
      </p>

      <div class="contact">
        <strong>${data.businessName}</strong><br>
        📧 ${data.businessEmail}
        ${data.businessPhone ? `<br>📞 ${data.businessPhone}` : ''}
      </div>
    </div>

    <div class="footer">
      תודה על שיתוף הפעולה 🙏<br>
      הודעה זו נשלחה אוטומטית מ-bioGov
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Day 14: Firm Reminder (תזכורת חריפה)
 */
export function getFirmReminderTemplate(data: ReminderEmailData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>תזכורת תשלום חשובה</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      direction: rtl;
      background-color: #f5f5f5;
      padding: 20px;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #1F2937;
    }
    .invoice-box {
      background: #FEF3C7;
      border-right: 4px solid #F59E0B;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .invoice-box .label {
      color: #78350F;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .invoice-box .value {
      color: #92400E;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .amount {
      font-size: 32px;
      color: #D97706;
      font-weight: bold;
    }
    .warning {
      background: #FEF3C7;
      border: 2px solid #F59E0B;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .warning strong {
      color: #92400E;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background: #F59E0B;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .button:hover {
      background: #D97706;
    }
    .footer {
      background: #F9FAFB;
      padding: 20px;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
      border-top: 1px solid #E5E7EB;
    }
    .contact {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 14px;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ תזכורת תשלום חשובה</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.customerName},
      </div>

      <p>
        זו תזכורת שנייה בנוגע לחשבונית שטרם שולמה. החשבונית כבר באיחור משמעותי.
      </p>

      <div class="invoice-box">
        <div class="label">מספר חשבונית:</div>
        <div class="value">#${data.invoiceNumber}</div>

        <div class="label">תאריך פירעון (עבר):</div>
        <div class="value">${data.dueDate}</div>

        <div class="label">סכום לתשלום:</div>
        <div class="amount">₪${data.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</div>
      </div>

      <div class="warning">
        <strong>⏰ החשבונית באיחור של ${data.daysOverdue} ימים</strong>
      </div>

      <p>
        אנא טפל בתשלום זה <strong>בהקדם האפשרי</strong> כדי למנוע עיכובים נוספים.
      </p>

      ${data.paymentUrl ? `
        <div style="text-align: center;">
          <a href="${data.paymentUrl}" class="button">שלם עכשיו 💳</a>
        </div>
      ` : ''}

      <p>
        אם יש בעיה או שאלה בנוגע לחשבונית זו, אנא צור קשר איתנו <strong>מיד</strong>.
      </p>

      <div class="contact">
        <strong>${data.businessName}</strong><br>
        📧 ${data.businessEmail}
        ${data.businessPhone ? `<br>📞 ${data.businessPhone}` : ''}
      </div>
    </div>

    <div class="footer">
      תודה על תשומת הלב<br>
      הודעה זו נשלחה אוטומטית מ-bioGov
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Day 21: Urgent Reminder (תזכורת דחופה)
 */
export function getUrgentReminderTemplate(data: ReminderEmailData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>תזכורת דחופה - פעולה מיידית נדרשת</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      direction: rtl;
      background-color: #f5f5f5;
      padding: 20px;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      border: 3px solid #EF4444;
    }
    .header {
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #1F2937;
      font-weight: bold;
    }
    .invoice-box {
      background: #FEE2E2;
      border-right: 4px solid #EF4444;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .invoice-box .label {
      color: #7F1D1D;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .invoice-box .value {
      color: #991B1B;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .amount {
      font-size: 36px;
      color: #DC2626;
      font-weight: bold;
    }
    .urgent-box {
      background: #FEE2E2;
      border: 3px solid #EF4444;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .urgent-box strong {
      color: #991B1B;
      font-size: 18px;
      display: block;
      margin-bottom: 10px;
    }
    .button {
      display: inline-block;
      background: #EF4444;
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 18px;
      margin: 20px 0;
    }
    .button:hover {
      background: #DC2626;
    }
    .footer {
      background: #F9FAFB;
      padding: 20px;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
      border-top: 1px solid #E5E7EB;
    }
    .contact {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 14px;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 תזכורת דחופה - פעולה מיידית נדרשת</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.customerName},
      </div>

      <p style="font-size: 16px; font-weight: bold; color: #991B1B;">
        זו תזכורת <strong>דחופה וחשובה</strong> בנוגע לחשבונית שטרם שולמה.
      </p>

      <div class="invoice-box">
        <div class="label">מספר חשבונית:</div>
        <div class="value">#${data.invoiceNumber}</div>

        <div class="label">תאריך פירעון (עבר!):</div>
        <div class="value">${data.dueDate}</div>

        <div class="label">סכום לתשלום:</div>
        <div class="amount">₪${data.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</div>
      </div>

      <div class="urgent-box">
        <strong>⚠️ החשבונית באיחור של ${data.daysOverdue} ימים!</strong>
        <p style="margin: 10px 0; color: #991B1B;">
          אנא טפל בתשלום <strong>היום</strong> למניעת פעולות נוספות
        </p>
      </div>

      <p>
        לאחר מספר תזכורות, החשבונית עדיין לא שולמה. אנו נאלצים לדרוש תשלום מיידי.
      </p>

      ${data.paymentUrl ? `
        <div style="text-align: center;">
          <a href="${data.paymentUrl}" class="button">שלם מיידית 🔴</a>
        </div>
      ` : ''}

      <p style="font-weight: bold;">
        אם אינך מסוגל לשלם, <strong>חובה ליצור קשר איתנו מיידית</strong> כדי להגיע להסדר.
      </p>

      <div class="contact">
        <strong>${data.businessName}</strong><br>
        📧 ${data.businessEmail}
        ${data.businessPhone ? `<br>📞 ${data.businessPhone}` : ''}
      </div>
    </div>

    <div class="footer">
      דורש תשומת לב מיידית<br>
      הודעה זו נשלחה אוטומטית מ-bioGov
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Day 30+: Final Notice (הודעה אחרונה)
 */
export function getFinalNoticeTemplate(data: ReminderEmailData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>הודעה אחרונה - התראה משפטית</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      direction: rtl;
      background-color: #f5f5f5;
      padding: 20px;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      overflow: hidden;
      border: 4px solid #7C2D12;
    }
    .header {
      background: linear-gradient(135deg, #7C2D12 0%, #991B1B 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #1F2937;
      font-weight: bold;
    }
    .invoice-box {
      background: #FEF3C7;
      border: 3px solid #7C2D12;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .invoice-box .label {
      color: #7C2D12;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .invoice-box .value {
      color: #92400E;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .amount {
      font-size: 40px;
      color: #7C2D12;
      font-weight: bold;
    }
    .final-notice {
      background: #7C2D12;
      color: white;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
      text-align: center;
    }
    .final-notice strong {
      font-size: 20px;
      display: block;
      margin-bottom: 15px;
    }
    .final-notice p {
      font-size: 16px;
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      background: #7C2D12;
      color: white;
      padding: 18px 50px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 18px;
      margin: 20px 0;
    }
    .button:hover {
      background: #991B1B;
    }
    .legal-notice {
      background: #FEF3C7;
      border-right: 4px solid #7C2D12;
      padding: 20px;
      margin: 20px 0;
      font-size: 14px;
      color: #78350F;
    }
    .footer {
      background: #F9FAFB;
      padding: 20px;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
      border-top: 1px solid #E5E7EB;
    }
    .contact {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 14px;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⛔ הודעה אחרונה - התראה משפטית</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.customerName},
      </div>

      <p style="font-size: 17px; font-weight: bold; color: #7C2D12;">
        זו ההודעה האחרונה לפני נקיטת צעדים משפטיים.
      </p>

      <div class="invoice-box">
        <div class="label">מספר חשבונית:</div>
        <div class="value">#${data.invoiceNumber}</div>

        <div class="label">תאריך פירעון המקורי:</div>
        <div class="value">${data.dueDate}</div>

        <div class="label">סכום חוב:</div>
        <div class="amount">₪${data.amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</div>
      </div>

      <div class="final-notice">
        <strong>🚫 החשבונית באיחור של ${data.daysOverdue} ימים</strong>
        <p>
          לאחר מספר תזכורות, החשבונית עדיין לא שולמה.
        </p>
        <p style="font-size: 18px; font-weight: bold;">
          יש לשלם תוך 48 שעות למניעת הליכים משפטיים.
        </p>
      </div>

      <div class="legal-notice">
        <strong>⚖️ התראה משפטית:</strong><br><br>
        אי תשלום תוך 48 שעות עלול להוביל ל:
        <ul style="text-align: right; margin-right: 20px;">
          <li>הפניה לגבייה משפטית</li>
          <li>דיווח למוסדות אשראי</li>
          <li>הוספת עלויות הליכים משפטיים</li>
          <li>ריבית פיגורים על פי חוק</li>
        </ul>
      </div>

      ${data.paymentUrl ? `
        <div style="text-align: center;">
          <a href="${data.paymentUrl}" class="button">שלם עכשיו ומנע הליכים 🔴</a>
        </div>
      ` : ''}

      <p style="font-weight: bold; font-size: 16px;">
        <strong style="color: #7C2D12;">זו ההזדמנות האחרונה</strong> לסגור את החוב לפני פעולות משפטיות.
        אם יש בעיה, צור קשר <strong>מיידית</strong>.
      </p>

      <div class="contact">
        <strong>${data.businessName}</strong><br>
        📧 ${data.businessEmail}
        ${data.businessPhone ? `<br>📞 ${data.businessPhone}` : ''}
      </div>
    </div>

    <div class="footer">
      התראה משפטית אחרונה<br>
      הודעה זו נשלחה אוטומטית מ-bioGov
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Get the appropriate template based on days overdue
 */
export function getReminderTemplate(daysOverdue: number, data: ReminderEmailData): { subject: string; html: string; type: string } {
  if (daysOverdue >= 30) {
    return {
      type: 'final_notice',
      subject: `⛔ הודעה אחרונה - חשבונית #${data.invoiceNumber} - פעולה מיידית נדרשת`,
      html: getFinalNoticeTemplate(data),
    };
  } else if (daysOverdue >= 21) {
    return {
      type: 'urgent_reminder',
      subject: `🚨 תזכורת דחופה - חשבונית #${data.invoiceNumber} באיחור של ${daysOverdue} ימים`,
      html: getUrgentReminderTemplate(data),
    };
  } else if (daysOverdue >= 14) {
    return {
      type: 'firm_reminder',
      subject: `⚠️ תזכורת חשובה - חשבונית #${data.invoiceNumber} טרם שולמה`,
      html: getFirmReminderTemplate(data),
    };
  } else {
    return {
      type: 'gentle_reminder',
      subject: `🔔 תזכורת תשלום - חשבונית #${data.invoiceNumber}`,
      html: getGentleReminderTemplate(data),
    };
  }
}
