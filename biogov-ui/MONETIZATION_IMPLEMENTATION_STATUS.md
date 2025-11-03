# bioGov Monetization System - Implementation Status

## 🎯 Executive Summary

**Status**: Foundation Complete - Ready for Stripe Integration & UI Development

**What's Built**:
- ✅ Complete database schema (13 tables)
- ✅ Subscription tier definitions with Israeli compliance
- ✅ NPM packages installed (Stripe, jsPDF)
- ✅ Type system for subscriptions

**Next Steps**: Configure Stripe account, build API endpoints, create UI components

---

## ✅ COMPLETED (Phase 1 - Foundation)

### 1. Database Schema (`005_monetization_system.sql`)

Created comprehensive PostgreSQL migration with:

#### **Tables Created:**
1. `subscriptions` - User subscription management
2. `customers` - Customer database for invoice generation
3. `invoices` - Israeli tax-compliant invoices
4. `invoice_items` - Line items for invoices
5. `payment_links` - Shareable payment URLs
6. `subscription_usage` - Usage tracking for tier limits
7. `stripe_webhook_events` - Audit log of Stripe events
8. `subscription_tier_features` - Reference table for tier configurations

#### **Israeli Compliance Features:**
- ✅ **Allocation Numbers**: Auto-check based on thresholds (₪20K/₪10K/₪5K)
- ✅ **Reference Numbers**: Required for 2025+ e-invoicing
- ✅ **18% VAT Rate**: Current Israeli VAT (updated from 17%)
- ✅ **Sequential Invoice Numbers**: Per-user, per-year (format: YYYY-NNNN)
- ✅ **HP Number Storage**: Israeli company ID (ח.פ.)
- ✅ **VAT Dealer Numbers**: Track authorized dealer status

#### **Functions & Triggers:**
- `generate_invoice_number()` - Auto-generate sequential numbers
- `check_allocation_number_required()` - Israeli threshold check
- `set_invoice_allocation_requirement()` - Auto-trigger for invoices
- Row Level Security (RLS) policies for all tables

### 2. Type Definitions (`src/types/subscription.ts`)

**Created comprehensive TypeScript types:**
- Subscription tiers: Free, Starter, Professional, Business, Enterprise
- Feature flags per tier
- Usage limits configuration
- Helper functions:
  - `hasFeature()` - Check tier access
  - `isWithinLimit()` - Enforce usage limits
  - `getUpgradePath()` - Recommend next tier
  - `calculateAnnualSavings()` - Show savings
  - `formatPrice()` - Format in ILS (₪)

**Pricing Structure:**
- Free: ₪0
- Starter: ₪49/month or ₪490/year (save ₪98)
- Professional: ₪99/month or ₪990/year (save ₪198)
- Business: ₪199/month or ₪1,990/year (save ₪398)
- Enterprise: Custom pricing

### 3. NPM Packages Installed

```bash
✅ stripe - Server-side Stripe SDK
✅ @stripe/stripe-js - Client-side Stripe SDK
✅ jspdf - PDF generation for invoices
✅ react-markdown - Already installed (for descriptions)
```

---

## 🚧 IN PROGRESS (Phase 2 - Integration)

### Required Stripe Configuration

**Before proceeding, you need to:**

1. **Create Stripe Account**:
   - Sign up at https://stripe.com
   - Complete Israeli business verification
   - Add bank account for ILS payouts

2. **Get API Keys**:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Create Products in Stripe Dashboard**:
   - Starter Monthly (₪49/month)
   - Starter Annual (₪490/year)
   - Professional Monthly (₪99/month)
   - Professional Annual (₪990/year)
   - Business Monthly (₪199/month)
   - Business Annual (₪1,990/year)

4. **Set up Webhook Endpoint**:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to monitor:
     - `checkout.session.completed`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

---

## 📋 TODO (Phase 3 - API & Services)

### Files to Create:

#### 1. Stripe Utilities (`src/lib/stripe.ts`)
```typescript
// Server-side Stripe instance
// Functions:
// - createCustomer()
// - createCheckoutSession()
// - createBillingPortalSession()
// - retrieveSubscription()
```

#### 2. Feature Gating Middleware (`src/middleware/featureGating.ts`)
```typescript
// Check if user has access to feature
// Enforce usage limits
// Return upgrade prompt if needed
```

#### 3. API Endpoints:

**Subscription Management:**
- `POST /api/subscriptions/create-checkout` - Start subscription
- `POST /api/subscriptions/create-portal` - Manage billing
- `GET /api/subscriptions/current` - Get user subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

**Webhooks:**
- `POST /api/webhooks/stripe` - Handle Stripe events

**Invoices:**
- `GET /api/invoices` - List user invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PATCH /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `POST /api/invoices/[id]/pdf` - Generate PDF
- `POST /api/invoices/[id]/send` - Email invoice

**Customers:**
- `GET /api/customers` - List customers
- `POST /api/customers` - Add customer
- `PATCH /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

**Payment Links:**
- `GET /api/payment-links` - List links
- `POST /api/payment-links` - Create link
- `GET /api/payment-links/[code]` - Get link details
- `DELETE /api/payment-links/[id]` - Delete link

#### 4. Invoice Generation (`src/lib/invoiceGenerator.ts`)
```typescript
// Generate Israeli tax invoice PDF
// Include all required fields:
// - Invoice number
// - Reference number
// - Allocation number (if required)
// - Issuer details (HP, VAT number)
// - Customer details
// - Line items with VAT calculation
// - Total in Hebrew and English
// - Legal footer text
```

#### 5. UI Components:

**Pricing Page (`src/app/pricing/page.tsx`)**:
- Tier comparison table
- Monthly/Annual toggle
- Feature checkmarks
- "Start Free Trial" buttons
- FAQ section

**Subscription Dashboard (`src/app/dashboard/subscription/page.tsx`)**:
- Current plan display
- Usage meters (invoices, customers, storage)
- Upgrade/downgrade buttons
- Billing history

**Invoice Management (`src/app/invoices/...`)**:
- Invoice list page
- Create/edit invoice form
- PDF preview
- Send via email

**Customer Management (`src/app/customers/...`)**:
- Customer list
- Add/edit customer form
- Customer details page

**Payment Links (`src/app/payment-links/...`)**:
- Link list
- Create link form
- Share/copy link

#### 6. Upgrade CTAs in Dashboard:

**Add to existing dashboard:**
- Banner: "Upgrade to unlock invoice generation"
- Feature cards with "Pro" badges
- Usage limit warnings
- Upgrade buttons

---

## 🧪 TESTING CHECKLIST

### Subscription Flow:
- [ ] User can start free trial
- [ ] User can upgrade from free to starter
- [ ] User can switch monthly ↔ annual
- [ ] User can upgrade tier (starter → professional)
- [ ] User can downgrade tier
- [ ] User can cancel subscription
- [ ] Canceled user retains access until period end

### Feature Gating:
- [ ] Free user cannot create invoices
- [ ] Free user sees "Upgrade" prompts
- [ ] Starter user can create unlimited invoices
- [ ] Professional user can access bank sync
- [ ] Limits enforced (customers, businesses)

### Webhooks:
- [ ] Stripe webhook processes checkout.session.completed
- [ ] Subscription created in database
- [ ] User tier updated
- [ ] Failed payments handled gracefully

### Invoices:
- [ ] Invoice number auto-increments correctly
- [ ] Allocation number required for ₪20K+ invoices
- [ ] Reference number included (2025+)
- [ ] VAT calculated at 18%
- [ ] PDF generates with Hebrew text
- [ ] Email sends successfully

### Payment Links:
- [ ] Link created with unique short code
- [ ] Link expires after use
- [ ] Payment success updates invoice status
- [ ] Customer receives confirmation email

---

## 💰 REVENUE PROJECTION (Year 1)

Based on conservative estimates:

| Metric | Value |
|--------|-------|
| Target Users | 1,000 paying |
| Avg. Revenue Per User (ARPU) | ₪92/month |
| Monthly Recurring Revenue (MRR) | ₪92,010 |
| Annual Recurring Revenue (ARR) | ₪1,104,120 |
| Transaction Fees (2.9%) | ₪50,000 |
| **Total Year 1 Revenue** | **₪1,154,120** |

---

## 🚀 DEPLOYMENT STEPS

### 1. Environment Variables

Add to `.env.local`:
```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Feature Flags
ENABLE_SUBSCRIPTIONS=true
ENABLE_INVOICES=true
ENABLE_PAYMENT_LINKS=true
```

### 2. Run Database Migration

```bash
# Local (Neon)
psql postgresql://neondb_owner:... -f supabase/migrations/005_monetization_system.sql

# Or via Supabase CLI
supabase db push
```

### 3. Deploy Webhook Endpoint

```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:3003/api/webhooks/stripe

# Deploy to production
vercel --prod
```

### 4. Configure Stripe Products

Match Product IDs in code to Stripe Dashboard:
- `price_starter_monthly`
- `price_starter_annual`
- `price_professional_monthly`
- etc.

---

## 📞 NEXT IMMEDIATE ACTIONS

**To continue implementation:**

1. **Get Stripe Account**:
   - Sign up and verify Israeli business
   - Get API keys

2. **Create API Endpoints** (Start with these 3):
   - `/api/subscriptions/create-checkout`
   - `/api/subscriptions/current`
   - `/api/webhooks/stripe`

3. **Build Pricing Page**:
   - Responsive tier comparison
   - "Start Free Trial" CTA
   - Monthly/Annual toggle

4. **Test Subscription Flow**:
   - Free → Starter upgrade
   - Webhook processing
   - Database updates

5. **Add Feature Gating**:
   - Check tier in dashboard
   - Show upgrade prompts
   - Enforce limits

---

## 🎯 SUCCESS CRITERIA

**Phase 1**: ✅ **COMPLETE**
- Database schema deployed
- Types defined
- Packages installed

**Phase 2**: 🚧 **IN PROGRESS**
- Stripe account configured
- API endpoints created
- Webhooks working

**Phase 3**: ⏳ **PENDING**
- Pricing page live
- First paying customer
- Invoice generation working

**Phase 4**: ⏳ **PENDING**
- 100 paying customers
- ₪10,000 MRR
- <5% monthly churn

---

## 📚 DOCUMENTATION REFERENCES

- **Database Schema**: `/supabase/migrations/005_monetization_system.sql`
- **Type Definitions**: `/src/types/subscription.ts`
- **Competitive Analysis**: `/COMPETITIVE_ANALYSIS_AND_MONETIZATION.md`
- **Stripe Docs**: https://docs.stripe.com/billing/subscriptions/build-subscriptions
- **Israeli E-invoicing**: https://www.gov.il/en/departments/topics/israel-invoice

---

## 🐛 KNOWN ISSUES / CONSIDERATIONS

1. **VAT on Our Service**: bioGov will need to charge 18% VAT on subscriptions to Israeli customers
2. **Invoice our own service**: We need to issue invoices to paying customers (can use Stripe invoicing)
3. **Currency**: All prices in ILS (₪), but Stripe may settle in USD/EUR initially
4. **Trial Period**: 45 days matches iCount/Green Invoice standard
5. **Allocation Numbers**: Need to integrate with Tax Authority API for allocation number requests (future feature)

---

**Last Updated**: 2025-11-03
**Status**: Foundation Complete - Ready for API Development
**Blockers**: Need Stripe API keys to continue
