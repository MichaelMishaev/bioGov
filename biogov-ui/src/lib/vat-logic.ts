/**
 * VAT Registration Decision Logic for bioGov MVP
 * Determines VAT status based on 5 quiz questions
 *
 * Israeli VAT Rules (2025):
 * - Revenue < ₪120,000/year → עוסק פטור (VAT-exempt)
 * - Revenue ≥ ₪120,000/year → עוסק מורשה (VAT-authorized, mandatory)
 * - Voluntary registration available for exempt businesses
 */

export type VATStatus = 'פטור' | 'מורשה' | 'choice';

export interface QuizAnswers {
  activity: string; // e.g., "עצמאי" (freelance), "חברה" (company), "עמותה" (NGO)
  revenue: string; // e.g., "עד 120K", "120K-500K", "500K+"
  clients: string; // e.g., "פרטיים" (private), "עסקים" (B2B), "מעורב" (mixed)
  employees: string; // e.g., "0", "1-5", "6+"
  voluntary: string; // e.g., "כן" (yes), "לא" (no), "לא בטוח" (not sure)
}

export interface ChecklistItem {
  step: number;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  estimatedTime?: string;
}

export interface AssessmentResult {
  status: VATStatus;
  statusText: string;
  explanation: string;
  checklist: ChecklistItem[];
  metadata: {
    isVoluntaryEligible: boolean;
    requiresBookkeeping: boolean;
    requiresVATReports: boolean;
    estimatedTimeToComplete: string;
  };
}

/**
 * Main VAT assessment logic
 */
export function assessVATStatus(answers: QuizAnswers): AssessmentResult {
  // Parse revenue threshold
  const revenueThreshold = parseRevenue(answers.revenue);

  // Determine base status
  let status: VATStatus;
  let statusText: string;
  let explanation: string;

  if (revenueThreshold < 120000) {
    // Below threshold: Exempt or Voluntary
    if (answers.voluntary === 'כן') {
      status = 'choice';
      statusText = 'בחירה: פטור או מורשה';
      explanation =
        'המחזור שלך נמוך מ-₪120,000, כך שאתה זכאי לפטור ממע"מ. ' +
        'עם זאת, אתה יכול לבחור להירשם כעוסק מורשה מרצונך החופשי. ' +
        'רישום מרצון מתאים אם יש לך הוצאות גבוהות או לקוחות עסקיים.';
    } else {
      status = 'פטור';
      statusText = 'עוסק פטור ממע"מ';
      explanation =
        'המחזור שלך נמוך מ-₪120,000 לשנה. ' +
        'אתה זכאי לפטור ממע"מ, מה שאומר שאינך חייב לגבות מע"מ מלקוחות, ' +
        'אך גם לא יכול לקבל החזר על מע"מ עסקי.';
    }
  } else {
    // Above threshold: Mandatory registration
    status = 'מורשה';
    statusText = 'עוסק מורשה (חובה)';
    explanation =
      'המחזור שלך עולה על ₪120,000 לשנה. ' +
      'לפי חוק מע"מ, אתה חייב להירשם כעוסק מורשה. ' +
      'זה אומר שתגבה מע"מ מלקוחות (17%), תנהל ספרים, ותגיש דוחות רבעוניים.';
  }

  // Generate checklist based on status
  const checklist = generateChecklist(status, answers);

  // Generate metadata
  const metadata = {
    isVoluntaryEligible: revenueThreshold < 120000,
    requiresBookkeeping: status === 'מורשה' || (status === 'choice' && answers.voluntary === 'כן'),
    requiresVATReports: status === 'מורשה' || (status === 'choice' && answers.voluntary === 'כן'),
    estimatedTimeToComplete: estimateCompletionTime(status),
  };

  return {
    status,
    statusText,
    explanation,
    checklist,
    metadata,
  };
}

/**
 * Parse revenue string to number
 */
function parseRevenue(revenueStr: string): number {
  const lowerRevenue = revenueStr.toLowerCase();

  if (lowerRevenue.includes('עד') || lowerRevenue.includes('120') || lowerRevenue.includes('0-120')) {
    return 100000; // Assume average below threshold
  } else if (lowerRevenue.includes('120-500') || lowerRevenue.includes('120') || lowerRevenue.includes('500')) {
    return 300000; // Above threshold
  } else if (lowerRevenue.includes('500+') || lowerRevenue.includes('מיליון')) {
    return 600000; // Well above threshold
  }

  return 0; // Default to 0 if unparseable
}

/**
 * Estimate time to complete registration process
 */
function estimateCompletionTime(status: VATStatus): string {
  switch (status) {
    case 'פטור':
      return '5-10 דקות'; // Exempt: minimal steps
    case 'choice':
      return '2-3 שעות'; // Choice: research + registration
    case 'מורשה':
      return '3-5 שעות'; // Mandatory: full registration + bookkeeping setup
    default:
      return '1-2 שעות';
  }
}

/**
 * Generate action checklist based on VAT status
 */
function generateChecklist(status: VATStatus, answers: QuizAnswers): ChecklistItem[] {
  const baseChecklist: ChecklistItem[] = [];

  if (status === 'פטור') {
    // Checklist for VAT-exempt businesses
    baseChecklist.push(
      {
        step: 1,
        title: 'בדוק את המחזור השנתי שלך',
        description:
          'ודא שהמחזור השנתי שלך נמוך מ-₪120,000. אם אתה עולה על הסף, תצטרך להירשם כעוסק מורשה תוך 30 יום.',
        estimatedTime: '5 דקות',
      },
      {
        step: 2,
        title: 'הנפק חשבוניות ללא מע"מ',
        description:
          'הנפק חשבוניות עם הערה: "עוסק פטור אינו מחויב בניהול ספרי חשבונות ואינו עורך דוח שנתי". אין להוסיף מע"מ.',
        link: 'https://www.kolzchut.org.il/he/עוסק_פטור',
        linkText: 'מדריך עוסק פטור - כל זכות',
        estimatedTime: '10 דקות',
      },
      {
        step: 3,
        title: 'עקוב אחרי ההכנסות',
        description:
          'נהל רישום פשוט של הכנסות והוצאות כדי לעקוב אחרי סף ה-₪120,000. המלצה: שימוש בספרדשיט או תוכנת הנהלת חשבונות.',
        link: 'https://www.kolzchut.org.il/he/עוסק_פטור',
        linkText: 'מדריך עוסק פטור - כל זכות',
        estimatedTime: '30 דקות להקמה',
      }
    );
  } else if (status === 'choice') {
    // Checklist for businesses choosing between exempt and authorized
    baseChecklist.push(
      {
        step: 1,
        title: 'השווה: פטור מול מורשה',
        description:
          'קרא את ההבדלים בין עוסק פטור למורשה. עוסק מורשה יכול לקבל החזר מע"מ על הוצאות, אך חייב לנהל ספרים ולהגיש דוחות.',
        link: 'https://www.kolzchut.org.il/he/עוסק_פטור_או_עוסק_מורשה',
        linkText: 'השוואה מפורטת - כל זכות',
        estimatedTime: '15 דקות',
      },
      {
        step: 2,
        title: 'חשב עלויות והטבות',
        description:
          'האם ההוצאות העסקיות שלך גבוהות? אם כן, החזר מע"מ יכול לחסוך לך כסף. אם לא - פטור יחסוך עבודה ניהולית.',
        estimatedTime: '20 דקות',
      },
      {
        step: 3,
        title: 'התייעץ עם רואה חשבון (רצוי)',
        description:
          'רואה חשבון יכול לעזור לך להבין מה משתלם יותר בהתאם למצבך הספציפי. הייעוץ הראשוני בדרך כלל חינמי.',
        link: 'https://www.cpa.org.il/',
        linkText: 'איגוד רואי החשבון',
        estimatedTime: '1 שעה',
      },
      {
        step: 4,
        title: 'הירשם כעוסק מורשה (אם בחרת)',
        description:
          'מלא טופס 821 באתר מע"מ והגש בתוך 30 יום מתחילת הפעילות. תקבל אישור תוך 2-4 שבועות.',
        link: 'https://www.gov.il/he/service/vat-821',
        linkText: 'טופס 821 - רשות המסים',
        estimatedTime: '45 דקות',
      }
    );
  } else if (status === 'מורשה') {
    // Checklist for mandatory VAT-authorized businesses
    baseChecklist.push(
      {
        step: 1,
        title: 'הירשם כעוסק מורשה (חובה)',
        description:
          'מלא טופס 821 באתר רשות המסים. חובת הרישום חלה תוך 30 יום מהגעה לסף ₪120,000 או מתחילת הפעילות.',
        link: 'https://www.gov.il/he/service/vat-821',
        linkText: 'טופס 821 - רשות המסים',
        estimatedTime: '45 דקות',
      },
      {
        step: 2,
        title: 'הקם מערכת הנהלת חשבונות',
        description:
          'כעוסק מורשה, אתה חייב לנהל ספרי חשבונות מסודרים. אפשרויות: תוכנות מקומיות (Priority, חשבשבת) או ענן (QuickBooks, Zoho).',
        link: 'https://www.kolzchut.org.il/he/ניהול_ספרים_לעוסק_עצמאי',
        linkText: 'מדריך ניהול ספרים - כל זכות',
        estimatedTime: '2-3 שעות להקמה',
      },
      {
        step: 3,
        title: 'הנפק חשבוניות עם מע"מ',
        description:
          'החל מיום הרישום, הנפק חשבוניות כולל מע"מ (17%). החשבונית חייבת לכלול: מספר עוסק מורשה, תיאור מוצר/שירות, סכום + מע"מ.',
        link: 'https://www.kolzchut.org.il/he/עוסק_מורשה',
        linkText: 'מדריך עוסק מורשה - כל זכות',
        estimatedTime: '30 דקות',
      },
      {
        step: 4,
        title: 'הגש דוחות מע"מ רבעוניים',
        description:
          'הגש דוח מע"מ דו-חודשי/רבעוני (תלוי במחזור). הדוח כולל מע"מ שגבית מלקוחות מינוס מע"מ ששילמת לספקים.',
        link: 'https://www.gov.il/he/service/reporting-or-payment-of-vat-reports',
        linkText: 'דיווח ותשלום מע"מ - רשות המסים',
        estimatedTime: '1-2 שעות לדוח',
      },
      {
        step: 5,
        title: 'שקול העסקת רואה חשבון',
        description:
          'רואה חשבון מנוסה יכול לטפל בדוחות, להקטין טעויות, ולייעץ על ניכויים. עלות ממוצעת: ₪1,500-3,000 לחודש.',
        link: 'https://www.cpa.org.il/',
        linkText: 'איגוד רואי החשבון',
        estimatedTime: '1 שעה',
      }
    );
  }

  return baseChecklist;
}

/**
 * Validate quiz answers structure
 */
export function validateAnswers(answers: any): answers is QuizAnswers {
  return (
    typeof answers === 'object' &&
    typeof answers.activity === 'string' &&
    typeof answers.revenue === 'string' &&
    typeof answers.clients === 'string' &&
    typeof answers.employees === 'string' &&
    typeof answers.voluntary === 'string'
  );
}

/**
 * Hash IP address for rate limiting (SHA-256)
 */
export async function hashIP(ip: string): Promise<string> {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(ip).digest('hex');
}
