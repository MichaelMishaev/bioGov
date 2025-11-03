# Phase 3 Development Plan - Daily Engagement Features

## 🎯 Objective
Transform bioGov from "monthly compliance checker" to "daily business companion" by adding features users consume every day.

## 📋 Sprint Plan (4 Weeks)

### **Week 1: Foundation & Cash Flow Dashboard** ✅ **COMPLETE**

#### Day 1-2: Database Schema & API ✅
- [x] ✅ Extend database schema for financial tracking
  - `expenses` table (receipts, categories, VAT)
  - `invoice_payments` table (payment tracking)
  - `financial_goals` table (revenue targets)
  - `cash_flow_snapshots` table (daily summaries)
- [x] ✅ Create API endpoints:
  - `GET /api/finances/cash-flow` - Daily/weekly/monthly aggregates
  - ~~`GET /api/finances/unpaid-invoices`~~ (merged into cash-flow endpoint)
  - ~~`POST /api/finances/goals`~~ (deferred to Week 3)
  - ~~`GET /api/finances/summary`~~ (merged into cash-flow endpoint)

#### Day 3-5: Cash Flow Dashboard UI ✅
- [x] ✅ Create `/dashboard/finances` page
- [x] ✅ Build `CashFlowWidget` component
  - Today/Week/Month tabs ✅
  - Trend chart (Recharts - Area chart) ✅
  - Comparison indicators (+18% vs last week) ✅
  - Goal progress bar ✅
- [x] ✅ Build `UnpaidInvoicesWidget` component
  - Overdue count (red alert) ✅
  - Due soon (yellow warning) ✅
  - On track (green) ✅
  - Quick action buttons ✅
- [x] ✅ Integrate into main dashboard
- [x] ✅ Add Hebrew RTL styling

#### Deliverable: ✅ **ACHIEVED**
✅ Users can see cash flow, revenue trends, unpaid invoices
✅ Dashboard updates in real-time
✅ Goal tracking functional

**Implementation Details**:
- Files Created: 7 (API route, 2 components, 1 page, types, migration, summary)
- Lines of Code: ~1,500
- Libraries Added: recharts, date-fns
- Documentation: WEEK1_IMPLEMENTATION_SUMMARY.md

---

### **Week 2: Expense Tracker with OCR** ✅ **PHASE 1 COMPLETE** (Manual Entry)

#### Day 1-2: Expense Database & API ✅
- [x] ✅ Create `expenses` table schema (already in migration 006):
  - id, user_id, amount_cents, category
  - description, receipt_url, vat_cents, merchant_name
  - transaction_date, ocr_processed, mileage tracking
  - created_at, updated_at
- [x] ✅ Expense categories (Israeli-specific):
  - 12 categories: Fuel/Mileage, Phone/Internet, Office Rent,
  - Equipment, Professional Services, Client Meetings,
  - Training/Courses, Office Supplies, Marketing, Insurance, Utilities, Other
- [x] ✅ API endpoints:
  - `GET /api/expenses` - List expenses (filtered by date/category) ✅
  - `POST /api/expenses` - Add expense ✅
  - `GET /api/expenses/summary` - Category breakdown ✅
  - ~~`POST /api/expenses/ocr`~~ (deferred to Phase 2 - OCR)
  - ~~`DELETE /api/expenses/:id`~~ (deferred to future sprint)

#### Day 3-4: OCR Integration ⏸️ **DEFERRED TO PHASE 2**
- [ ] Research OCR options:
  - Option 1: Google Cloud Vision API (best accuracy)
  - Option 2: Tesseract.js (free, client-side)
  - Option 3: Azure Computer Vision (good Hebrew support)
- [ ] Implement OCR service:
  - Extract: Amount, Merchant, Date
  - Detect VAT (18%)
  - Handle Hebrew text
- [ ] Test with real Israeli receipts (SuperPharm, Rami Levy, gas stations)

#### Day 5: Expense Tracker UI ✅
- [x] ✅ Create `/expenses` page
- [x] ✅ Build `ExpenseForm` component
  - Manual entry option ✅
  - Category selector with icons ✅
  - VAT auto-calculation (18%) ✅
  - Mileage tracking for fuel_mileage category ✅
  - Notes field ✅
  - ~~Receipt upload (mobile camera)~~ (deferred to OCR phase)
- [x] ✅ Build `ExpenseList` component
  - Filterable by date/category ✅
  - Sort by date/amount ✅
  - Summary totals (expenses + VAT) ✅
  - ~~Edit/delete actions~~ (delete deferred)
  - ~~Export to CSV/PDF~~ (deferred to Week 3)
- [ ] Mobile-optimized UI (camera upload) - OCR phase

#### Deliverable: ✅ **PHASE 1 ACHIEVED** (Manual Entry Complete)
✅ Users can manually enter expenses with full details
✅ Expenses categorized and tracked (12 categories with icons)
✅ VAT automatically calculated (18%)
✅ Monthly expense reports via summary API
⏸️ OCR receipt scanning (deferred - see Phase 2 below)
⏸️ Mobile camera upload (deferred - see Phase 2 below)

**Implementation Details**:
- Files Created: 5 (2 API routes, 2 components, 1 page)
- Lines of Code: ~800
- Categories: 12 Israeli-specific categories with Hebrew names
- VAT Calculation: Automatic 18% extraction from total amount
- Mileage: Special handling for fuel_mileage with ₪2.35/km rate

**Phase 2 (OCR) - Planned for Later**:
When OCR is implemented, users will be able to:
- Upload receipt photos (mobile camera)
- Auto-extract: Amount, Merchant, Date, VAT
- Review and confirm OCR data
- Edit extracted fields before saving
- Store receipt images in Supabase Storage

---

### **Week 3: Payment Reminders & P&L**

#### Day 1-2: Payment Tracking System
- [ ] Create `invoice_payments` table:
  ```sql
  - id, invoice_id, amount_cents, payment_date
  - payment_method, transaction_id, notes
  ```
- [ ] Payment reminder logic:
  - Day 7: Gentle email
  - Day 14: SMS reminder
  - Day 21: Firm email
  - Day 30: Escalation notice
- [ ] API endpoints:
  - `POST /api/invoices/:id/mark-paid` - Record payment
  - `GET /api/invoices/overdue` - List overdue invoices
  - `POST /api/invoices/:id/send-reminder` - Send reminder
  - `GET /api/invoices/payment-stats` - Average days to pay

#### Day 3: Automated Reminder System
- [ ] Integrate email service (Resend or SendGrid)
- [ ] Create email templates:
  - Gentle reminder (Day 7)
  - Firm reminder (Day 21)
  - Hebrew + English versions
- [ ] Scheduled job (cron):
  - Check daily for overdue invoices
  - Send reminders automatically
  - Log all communications

#### Day 4-5: P&L Dashboard
- [ ] Create `ProfitLossWidget` component
  - Revenue (from invoices)
  - Expenses (from expenses table)
  - Net profit calculation
  - Breakdown by category (pie chart)
- [ ] Tax calculations:
  - VAT collected vs VAT paid
  - Net VAT owed
  - Income tax estimate (30%)
  - National Insurance (7.6%)
  - Take-home projection
- [ ] Monthly comparison (this vs last 3 months)

#### Deliverable:
✅ Automated payment reminders working
✅ P&L dashboard shows real-time profit
✅ Tax liability calculations accurate

---

### **Week 4: Polish, Testing & Integration**

#### Day 1-2: Dashboard Integration
- [ ] Redesign main `/dashboard` to feature:
  - Cash Flow widget (top)
  - Unpaid Invoices alert (if any)
  - P&L summary
  - Quick actions (Add Expense, Create Invoice)
  - Compliance tasks (existing)
- [ ] Add "Upgrade" prompts for free users:
  - "Unlock Cash Flow Dashboard → Starter"
  - "Unlock Expense OCR → Professional"
- [ ] Feature gating:
  - Free: View last 7 days cash flow only
  - Starter: 30 days + manual expenses
  - Professional: All-time + OCR

#### Day 3: Mobile Optimization
- [ ] Test on iPhone/Android
- [ ] Optimize camera upload flow
- [ ] Responsive design for all widgets
- [ ] PWA features (offline expense logging)

#### Day 4: Hebrew Localization
- [ ] Translate all new UI strings
- [ ] RTL layout verification
- [ ] Number formatting (₪ symbol, comma separators)
- [ ] Date formatting (Hebrew dates)

#### Day 5: QA & User Testing
- [ ] Create test scenarios:
  - New user onboarding → sees empty cash flow
  - Add 3 invoices → cash flow updates
  - Upload receipt → OCR extracts correctly
  - Mark invoice paid → unpaid count decreases
- [ ] Performance testing:
  - Dashboard loads < 1 second
  - OCR processes < 3 seconds
  - Charts render smoothly
- [ ] Bug fixes and polish

#### Deliverable:
✅ Fully integrated dashboard with daily features
✅ Mobile-optimized experience
✅ Hebrew localization complete
✅ Feature gating enforced
✅ QA passed

---

## 🗄️ Database Schema (New Tables)

### `expenses` Table
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Transaction details
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'ILS',
  category TEXT NOT NULL,
  description TEXT NOT NULL,

  -- VAT tracking
  vat_cents INTEGER DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 18.00,

  -- Receipt info
  receipt_url TEXT,
  merchant_name TEXT,
  transaction_date DATE NOT NULL,

  -- OCR metadata
  ocr_confidence DECIMAL(3,2),
  ocr_raw_text TEXT,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_transaction_date ON expenses(transaction_date);
CREATE INDEX idx_expenses_category ON expenses(category);
```

### `invoice_payments` Table
```sql
CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Payment details
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'ILS',
  payment_date DATE NOT NULL,
  payment_method payment_method,

  -- Transaction tracking
  transaction_id TEXT,
  reference_number TEXT,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON invoice_payments(payment_date);
```

### `financial_goals` Table
```sql
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Goal details
  goal_type TEXT NOT NULL, -- 'monthly_revenue', 'annual_revenue', 'profit_margin'
  target_amount_cents INTEGER,
  target_percentage DECIMAL(5,2),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON financial_goals(user_id);
```

### `cash_flow_snapshots` Table (Daily aggregates for performance)
```sql
CREATE TABLE cash_flow_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Date
  snapshot_date DATE NOT NULL,

  -- Aggregated data (in agorot)
  revenue_cents INTEGER DEFAULT 0,
  expenses_cents INTEGER DEFAULT 0,
  profit_cents INTEGER DEFAULT 0,

  -- Invoice metrics
  invoices_sent INTEGER DEFAULT 0,
  invoices_paid INTEGER DEFAULT 0,
  invoices_overdue INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_snapshot_per_day UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_snapshots_user_date ON cash_flow_snapshots(user_id, snapshot_date);
```

---

## 🛠️ Technology Stack

### OCR Options (Ranked)
1. **Google Cloud Vision API** ⭐⭐⭐⭐⭐
   - Pros: Best accuracy, handles Hebrew, fast
   - Cons: $1.50 per 1,000 requests
   - Use case: Professional/Business tiers

2. **Tesseract.js** ⭐⭐⭐
   - Pros: Free, client-side, no API calls
   - Cons: Lower accuracy, slower, large bundle
   - Use case: Starter tier (basic OCR)

3. **Azure Computer Vision** ⭐⭐⭐⭐
   - Pros: Good Hebrew support, reasonable pricing
   - Cons: Microsoft ecosystem
   - Use case: Alternative to Google

**Decision**: Use **Google Cloud Vision API** for Professional+ tiers, **Tesseract.js** for Starter tier.

### Charts Library
- **Recharts** ⭐⭐⭐⭐⭐
  - React-friendly
  - Responsive
  - Good documentation
  - RTL support

### Email Service
- **Resend** ⭐⭐⭐⭐⭐
  - Modern API
  - Good templates
  - Affordable ($0.10 per 1,000 emails)
  - React email templates

---

## 📊 Feature Gating Matrix

| Feature | Free | Starter | Professional | Business |
|---------|------|---------|--------------|----------|
| Cash Flow Dashboard (days) | 7 | 30 | All-time | All-time |
| Revenue Goal Tracking | ❌ | ✅ | ✅ | ✅ |
| Expense Tracking (manual) | 5/month | 50/month | Unlimited | Unlimited |
| Expense OCR | ❌ | ❌ | ✅ | ✅ |
| Receipt Storage | ❌ | 1GB | 10GB | 100GB |
| Unpaid Invoices Tracker | ❌ | ✅ | ✅ | ✅ |
| Payment Reminders | ❌ | Email only | Email+SMS | Email+SMS+WhatsApp |
| P&L Dashboard | Last month | Last 12m | All-time | All-time + forecasts |
| Tax Calculator | ❌ | Basic | Advanced | Advanced + advisor |
| Category Analytics | ❌ | ✅ | ✅ | ✅ |
| Export Reports | ❌ | CSV | CSV+PDF | CSV+PDF+Excel |

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Cash flow calculation logic
- [ ] VAT calculation (18%)
- [ ] Date range filtering
- [ ] Category aggregation
- [ ] Goal progress calculation

### Integration Tests
- [ ] Invoice creation → cash flow update
- [ ] Payment recorded → unpaid count decreases
- [ ] Expense added → P&L recalculates
- [ ] OCR upload → data extracted

### E2E Tests (Playwright)
- [ ] User adds invoice → sees in cash flow
- [ ] User uploads receipt → expense saved
- [ ] User marks invoice paid → dashboard updates
- [ ] User sets goal → progress tracked

### Performance Tests
- [ ] Dashboard loads with 100 invoices < 1s
- [ ] OCR processes receipt < 3s
- [ ] Charts render 12 months data smoothly
- [ ] Mobile camera upload works on 3G

### Accessibility Tests
- [ ] Screen reader compatible
- [ ] Keyboard navigation
- [ ] Color contrast (charts)
- [ ] Hebrew RTL layout

---

## 🚀 Deployment Plan

### Environment Setup
```env
# Google Cloud Vision API
GOOGLE_CLOUD_VISION_API_KEY=your_key_here
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Email (Resend)
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=noreply@biogov.co.il

# Feature Flags
ENABLE_CASH_FLOW_DASHBOARD=true
ENABLE_EXPENSE_OCR=true
ENABLE_PAYMENT_REMINDERS=true
```

### Database Migration
```bash
# Run Phase 3 migration
psql $DATABASE_URL -f supabase/migrations/006_phase3_financial_features.sql
```

### Cron Jobs (for reminders)
```bash
# Daily at 9 AM Israel time
0 9 * * * node scripts/send-payment-reminders.js

# Daily at midnight - generate cash flow snapshots
0 0 * * * node scripts/generate-snapshots.js
```

---

## 📈 Success Metrics

### Engagement Targets
- **DAU**: 40% (from 5%)
- **Session duration**: 5 minutes (from 30 seconds)
- **Sessions per week**: 12 (from 1)

### Feature Adoption
- **Cash Flow Dashboard**: 80% of paid users check daily
- **Expense Tracker**: 60% add at least 1 expense per week
- **P&L Dashboard**: 70% view at least once per week

### Revenue Impact
- **Upgrade rate**: 30% Free → Starter (from 15%)
- **Professional tier adoption**: 40% (from 20%)
- **Churn reduction**: <5% monthly (from 10%)

### Performance Benchmarks
- Dashboard initial load: < 1 second
- OCR processing: < 3 seconds
- Chart rendering: < 500ms
- Mobile responsiveness: 100/100 Lighthouse score

---

## 🎯 Next Steps After Week 4

### Phase 3.1 (Month 2)
- WhatsApp Bot integration
- Tax Savings Advisor (AI-powered)
- Business Health Score

### Phase 3.2 (Month 3)
- Quote Generator with conversion tracking
- Client CRM with payment history
- Referral Program

### Phase 3.3 (Month 4)
- Accountant Portal (B2B2C)
- Multi-user collaboration
- API access for integrations

---

**Status**: Ready to begin implementation
**Start Date**: 2025-11-03
**Target Completion**: 2025-12-01 (4 weeks)
**Owner**: Development Team
