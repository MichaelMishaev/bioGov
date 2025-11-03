/**
 * Financial Tracking Type Definitions
 * Phase 3: Daily Engagement Features
 */

// Expense Categories
export type ExpenseCategory =
  | 'fuel_mileage'
  | 'phone_internet'
  | 'office_rent'
  | 'equipment'
  | 'professional_services'
  | 'client_meetings'
  | 'training_courses'
  | 'office_supplies'
  | 'marketing'
  | 'insurance'
  | 'utilities'
  | 'other';

export interface ExpenseCategoryInfo {
  category: ExpenseCategory;
  nameHe: string;
  nameEn: string;
  icon: string;
  defaultVatDeductible: boolean;
}

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, ExpenseCategoryInfo> = {
  fuel_mileage: {
    category: 'fuel_mileage',
    nameHe: 'דלק/קילומטראז\'',
    nameEn: 'Fuel/Mileage',
    icon: '⛽',
    defaultVatDeductible: true,
  },
  phone_internet: {
    category: 'phone_internet',
    nameHe: 'טלפון/אינטרנט',
    nameEn: 'Phone/Internet',
    icon: '📱',
    defaultVatDeductible: true,
  },
  office_rent: {
    category: 'office_rent',
    nameHe: 'שכירות משרד',
    nameEn: 'Office Rent',
    icon: '🏢',
    defaultVatDeductible: true,
  },
  equipment: {
    category: 'equipment',
    nameHe: 'ציוד',
    nameEn: 'Equipment',
    icon: '🖥️',
    defaultVatDeductible: true,
  },
  professional_services: {
    category: 'professional_services',
    nameHe: 'שירותים מקצועיים',
    nameEn: 'Professional Services',
    icon: '📄',
    defaultVatDeductible: true,
  },
  client_meetings: {
    category: 'client_meetings',
    nameHe: 'פגישות לקוחות',
    nameEn: 'Client Meetings',
    icon: '☕',
    defaultVatDeductible: false, // Limited deduction
  },
  training_courses: {
    category: 'training_courses',
    nameHe: 'הדרכות/קורסים',
    nameEn: 'Training/Courses',
    icon: '🎓',
    defaultVatDeductible: true,
  },
  office_supplies: {
    category: 'office_supplies',
    nameHe: 'ציוד משרדי',
    nameEn: 'Office Supplies',
    icon: '📎',
    defaultVatDeductible: true,
  },
  marketing: {
    category: 'marketing',
    nameHe: 'שיווק',
    nameEn: 'Marketing',
    icon: '📢',
    defaultVatDeductible: true,
  },
  insurance: {
    category: 'insurance',
    nameHe: 'ביטוחים',
    nameEn: 'Insurance',
    icon: '🛡️',
    defaultVatDeductible: true,
  },
  utilities: {
    category: 'utilities',
    nameHe: 'חשמל/מים/ארנונה',
    nameEn: 'Utilities',
    icon: '⚡',
    defaultVatDeductible: true,
  },
  other: {
    category: 'other',
    nameHe: 'אחר',
    nameEn: 'Other',
    icon: '📦',
    defaultVatDeductible: true,
  },
};

// Expense
export interface Expense {
  id: string;
  userId: string;
  amountCents: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  vatCents: number;
  vatRate: number;
  vatDeductible: boolean;
  receiptUrl?: string;
  merchantName?: string;
  transactionDate: string; // ISO date
  ocrProcessed: boolean;
  ocrConfidence?: number;
  ocrRawText?: string;
  mileageKm?: number;
  mileageRatePerKm?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice Payment
export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amountCents: number;
  currency: string;
  paymentDate: string; // ISO date
  paymentMethod?: string;
  transactionId?: string;
  referenceNumber?: string;
  isPartial: boolean;
  notes?: string;
  createdAt: string;
}

// Financial Goal
export type GoalType = 'monthly_revenue' | 'annual_revenue' | 'profit_margin' | 'expense_limit';

export interface FinancialGoal {
  id: string;
  userId: string;
  goalType: GoalType;
  targetAmountCents?: number;
  targetPercentage?: number;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  goalId: string;
  currentAmountCents: number;
  targetAmountCents: number;
  progressPercentage: number;
  daysRemaining: number;
  isOnTrack: boolean;
}

// Cash Flow Snapshot
export interface CashFlowSnapshot {
  id: string;
  userId: string;
  snapshotDate: string; // ISO date
  revenueCents: number;
  revenuePaidCents: number;
  revenueUnpaidCents: number;
  expensesCents: number;
  profitCents: number;
  cashBalanceCents: number;
  invoicesSent: number;
  invoicesPaid: number;
  invoicesOverdue: number;
  vatCollectedCents: number;
  vatPaidCents: number;
  vatOwedCents: number;
  createdAt: string;
  updatedAt: string;
}

// Cash Flow Summary (API Response)
export interface CashFlowSummary {
  today: {
    revenue: number; // in ILS (₪)
    expenses: number;
    profit: number;
  };
  thisWeek: {
    revenue: number;
    expenses: number;
    profit: number;
    changeVsLastWeek: number; // percentage
  };
  thisMonth: {
    revenue: number;
    expenses: number;
    profit: number;
    changeVsLastMonth: number; // percentage
  };
  unpaidInvoices: {
    overdue: { count: number; amount: number };
    dueSoon: { count: number; amount: number };
    onTrack: { count: number; amount: number };
  };
  goal?: {
    target: number;
    current: number;
    percentage: number;
    isOnTrack: boolean;
  };
}

// P&L Report
export interface ProfitLossReport {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    total: number; // in ILS (₪)
    byCategory?: Record<string, number>;
  };
  expenses: {
    total: number;
    byCategory: Record<ExpenseCategory, number>;
  };
  profit: {
    gross: number; // revenue - expenses
    net: number; // after taxes
  };
  taxes: {
    vatCollected: number;
    vatPaid: number;
    vatOwed: number;
    incomeTaxEstimate: number; // 30% for self-employed
    nationalInsurance: number; // 7.6% for self-employed
  };
  takeHome: number; // Estimated take-home after all taxes
}

// Expense Summary (for analytics)
export interface ExpenseSummary {
  total: number;
  byCategory: Record<ExpenseCategory, number>;
  byMonth: Record<string, number>; // YYYY-MM -> amount
  avgMonthly: number;
  topMerchants: Array<{ name: string; amount: number }>;
}

// Helper functions
export function formatCurrency(amountNIS: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountNIS);
}

export function formatCurrencyDetailed(amountNIS: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountNIS);
}

export function centsToNIS(cents: number): number {
  return cents / 100;
}

export function nisToC(nis: number): number {
  return Math.round(nis * 100);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('he-IL', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Calculate VAT from total amount (18%)
export function calculateVAT(totalAmount: number, vatRate: number = 18): number {
  // If amount includes VAT: VAT = amount * (rate / (100 + rate))
  return totalAmount * (vatRate / (100 + vatRate));
}

// Calculate amount before VAT
export function removeVAT(totalAmount: number, vatRate: number = 18): number {
  return totalAmount - calculateVAT(totalAmount, vatRate);
}

// Add VAT to amount
export function addVAT(amountBeforeVAT: number, vatRate: number = 18): number {
  return amountBeforeVAT * (1 + vatRate / 100);
}
