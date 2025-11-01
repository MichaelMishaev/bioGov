# Product Requirements Document (PRD)
## bioGov MVP - VAT Registration Assistant

**Version**: 1.0
**Date**: October 30, 2025
**Status**: MVP Definition
**Owner**: bioGov Team

---

## Executive Summary

**Product Name**: bioGov VAT Registration Assistant
**Tagline**: "Know Your VAT Status in 2 Minutes" (Hebrew: "דע את סטטוס המע\"מ שלך בתוך 2 דקות")

**Problem Statement**: Israeli small business owners and freelancers waste hours researching whether they need to register as VAT-exempt (עוסק פטור) or VAT-authorized (עוסק מורשה). The decision involves multiple factors (revenue, activity type, voluntary registration), and the official gov.il guidance is scattered across multiple pages with legal jargon.

**Solution**: A 5-question smart wizard that analyzes the user's business situation and provides:
1. Clear VAT status recommendation (exempt, authorized, or choice)
2. Personalized checklist of required forms (Form 821, etc.)
3. Direct links to official gov.il submission portals
4. Email capture for future compliance reminders

**Target Launch**: MVP within 4-6 weeks (1-2 sprints)

---

## 1. Target Audience

### Primary User Persona: "Dana - New Freelance Graphic Designer"

**Demographics**:
- Age: 28-35
- Location: Tel Aviv / Central Israel
- Occupation: Freelance designer, consultant, developer, photographer
- Language: Hebrew (primary), English (secondary)
- Tech-savvy: Medium-High (uses WhatsApp, Instagram, online banking)

**Pain Points**:
- "I don't know if I need to register for VAT"
- "The Tax Authority website is confusing and uses legal terms I don't understand"
- "I'm scared I'll register incorrectly and get fined"
- "I don't have time to read 10 different guides"
- "I need to start invoicing clients next week and I'm not ready"

**Motivations**:
- Start working legally as soon as possible
- Avoid mistakes that could lead to fines or audits
- Understand the process in simple Hebrew
- Get a clear action plan with exact steps

**Current Behavior**:
- Googles "עוסק פטור או מורשה" and reads 5+ blog posts
- Asks friends "what did you do?"
- Considers hiring an accountant just for registration (₪500-1,500)
- Procrastinates for weeks due to confusion

### Secondary User Persona: "Yossi - Small Business Owner"

**Demographics**:
- Age: 35-50
- Location: Anywhere in Israel
- Occupation: Shop owner, service provider (plumber, electrician), small manufacturer
- Language: Hebrew (primary)
- Tech-savvy: Low-Medium (uses WhatsApp, struggles with government portals)

**Pain Points**:
- "I'm already registered but I'm not sure if I chose the right status"
- "My revenue changed - do I need to update my VAT status?"
- "The accountant charges ₪500 just to answer basic questions"

---

## 2. MVP Goals & Success Metrics

### Business Goals
1. **Validation**: Prove there's demand for Israeli bureaucracy assistance tools
2. **User Acquisition**: Build email list of 500+ Israeli SMB owners (30 days post-launch)
3. **Product-Market Fit**: Achieve 70%+ "Very Helpful" feedback rating
4. **Foundation**: Create design system and architecture for future features (licensing, NI registration, compliance calendar)

### Success Metrics (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Quiz Completions** | 200+ in first 30 days | Analytics: Form submission count |
| **Email Signups** | 100+ (50% conversion) | Database: `users.email` count |
| **Feedback Score** | 70%+ "Very Helpful" (4-5 stars) | Database: AVG(`feedback.rating`) ≥ 4.0 |
| **Time to Complete** | < 3 minutes average | Analytics: Page load → Result page timestamp |
| **Mobile Usage** | 60%+ mobile traffic | Analytics: Device breakdown |
| **Return Rate** | 20%+ users return within 7 days | Analytics: Repeat visitor rate |
| **Social Shares** | 50+ shares (WhatsApp, Facebook) | Share button clicks + analytics |

### Leading Indicators (Early Signals)
- **Traffic Sources**: Organic search for "עוסק פטור מורשה", Facebook groups, word-of-mouth
- **Bounce Rate**: < 50% on landing page (indicates value proposition is clear)
- **Quiz Start Rate**: 70%+ visitors who land on homepage start the quiz
- **Question Drop-off**: < 10% abandon between questions (indicates smooth UX)

---

## 3. User Stories

### Epic: VAT Status Assessment

**US-1: Understand VAT Options**
**As a** new freelancer in Israel
**I want to** understand the difference between עוסק פטור and עוסק מורשה
**So that** I can make an informed decision before registering

**Acceptance Criteria**:
- Landing page explains VAT-exempt vs VAT-authorized in simple Hebrew
- Side-by-side comparison table with pros/cons
- Visual icons (✓/✗) for easy scanning
- Mobile-responsive design (60%+ traffic expected)

---

**US-2: Get Personalized Recommendation**
**As a** small business owner
**I want to** answer a few questions about my business
**So that** the system tells me which VAT status I need

**Acceptance Criteria**:
- Quiz has exactly 5 questions (no more - users will abandon)
- Progress indicator shows "Question 2 of 5"
- Questions are in Hebrew with RTL layout
- Each question has clear help text or tooltip
- Back button allows editing previous answers
- Auto-save progress (IndexedDB) in case user refreshes

**Questions**:
1. **Activity Type**: "What type of business activity?" (ציוד ומוצרים / שירותים / both)
2. **Projected Revenue**: "Expected annual revenue?" (< ₪120K / ₪120K-500K / > ₪500K)
3. **Client Types**: "Who are your clients?" (Individuals / Businesses / Both)
4. **Employees**: "Will you hire employees?" (Yes / No / Not sure)
5. **Voluntary Registration**: "Do you want to register as authorized even if exempt?" (Yes / No / Explain options)

---

**US-3: Receive Actionable Checklist**
**As a** user who completed the quiz
**I want to** see a personalized checklist of exactly what I need to do
**So that** I can register correctly without hiring an accountant

**Acceptance Criteria**:
- Results page shows:
  - Clear headline: "You need: עוסק מורשה" with color-coded badge
  - Explanation (2-3 sentences) of why this status applies
  - Numbered checklist of required actions:
    1. Fill Form 821 (VAT registration)
    2. Prepare required documents (ID, bank account, address proof)
    3. Submit via online portal or in-person
  - Direct links to official gov.il forms and portals
  - PDF download option for checklist (future feature)
- "Was this helpful?" feedback widget at bottom
- "Send me reminders" email signup form

---

**US-4: Save Results for Later**
**As a** user who needs to discuss with my spouse/accountant
**I want to** save my results and come back later
**So that** I don't have to re-take the quiz

**Acceptance Criteria**:
- Email signup form captures `name` and `email`
- System sends email with:
  - Personalized results summary
  - Direct link to results page (shareable URL with token)
  - "Return to bioGov" CTA button
- Email is in Hebrew with RTL layout
- Unsubscribe link at bottom (legal requirement)

---

**US-5: Provide Feedback**
**As a** user who used the tool
**I want to** rate my experience and leave a comment
**So that** the team improves the product

**Acceptance Criteria**:
- Feedback widget with:
  - 5-star rating (required)
  - Text comment (optional, max 500 chars)
  - "Submit" button
- Widget appears after viewing results (not intrusive)
- Thank you message after submission
- Admin can view aggregated feedback in Supabase dashboard

---

## 4. MVP Feature List

### ✅ In Scope (Must-Have)

#### **Landing Page**
- [ ] Hero section with value proposition (Hebrew)
- [ ] Problem/solution explanation (3 pain points)
- [ ] Side-by-side comparison: עוסק פטור vs עוסק מורשה
- [ ] "Start Free Assessment" CTA button (prominent, Carbon accent blue)
- [ ] Trust indicators: "Based on official Tax Authority guidelines" + gov.il citations
- [ ] Mobile-responsive (Tailwind breakpoints)

#### **5-Question Wizard**
- [ ] Progress indicator (1/5, 2/5, etc.)
- [ ] 5 questions with radio buttons or select dropdowns
- [ ] Help tooltips with "i" icon (explains complex terms)
- [ ] Back/Next navigation buttons
- [ ] Form validation (can't proceed without answering)
- [ ] Auto-save to IndexedDB (offline-first PWA feature)

#### **Results Page**
- [ ] Recommendation headline with color-coded badge
- [ ] Explanation paragraph (why this status applies)
- [ ] Numbered checklist (3-5 action items)
- [ ] External links to gov.il (open in new tab with icon)
- [ ] Email signup form (inline, above feedback)
- [ ] Feedback widget (5 stars + optional comment)
- [ ] "Start Over" button to retake quiz
- [ ] Social share buttons (WhatsApp, Facebook, copy link)

#### **Email Capture & Confirmation**
- [ ] Email form: Name (Hebrew), Email, "Send me tips" checkbox
- [ ] Form validation (valid email format)
- [ ] POST to Supabase `/users` table
- [ ] Confirmation email via Resend or Supabase Auth
- [ ] Email template in Hebrew (RTL layout)

#### **Feedback System**
- [ ] 5-star rating component (Carbon design)
- [ ] Optional text area (placeholder: "Help us improve...")
- [ ] POST to Supabase `/feedback` table
- [ ] Thank you message after submission

#### **PWA Features**
- [ ] Service Worker for offline access
- [ ] IndexedDB for quiz progress and results caching
- [ ] Manifest.json with Hebrew app name and icon
- [ ] Installable prompt ("Add to Home Screen")

#### **Analytics & Tracking**
- [ ] Plausible Analytics or Google Analytics 4
- [ ] Event tracking: quiz_started, quiz_completed, email_signup, feedback_submitted
- [ ] Conversion funnel: Landing → Quiz → Results → Email

---

### ❌ Out of Scope (Post-MVP)

#### **Phase 2 Features** (After 500+ users)
- Business Licensing Checker (complex logic, 30+ license types)
- National Insurance (NI) registration guide
- Compliance calendar with VAT deadline reminders
- Company registry autofill (ICA API integration)
- Multi-language support (Russian, English)
- User accounts with saved history
- Push notifications for deadlines
- Admin dashboard for content management (Strapi CMS)
- A/B testing framework

#### **Future Enhancements**
- PDF download of checklist
- Print-friendly results page
- WhatsApp chatbot integration
- Video explainers for each question
- Accountant referral marketplace (revenue model)
- Premium features (₪19/month for calendar + reminders)

---

## 5. User Flow Diagram

```
┌─────────────────────┐
│   Landing Page      │ → Problem/solution, CTA "Start"
│   (Homepage)        │
└──────────┬──────────┘
           │ Click "Start Assessment"
           ↓
┌─────────────────────┐
│   Question 1/5      │ → "Activity type?"
│   (Quiz Step)       │ → [Products / Services / Both]
└──────────┬──────────┘
           │ Click "Next"
           ↓
┌─────────────────────┐
│   Question 2/5      │ → "Projected revenue?"
└──────────┬──────────┘
           │ ...continues for 5 questions
           ↓
┌─────────────────────┐
│   Results Page      │ → "You need: עוסק מורשה"
│                     │ → Checklist (1. Form 821, 2. Docs, 3. Submit)
│                     │ → Links to gov.il
└──────────┬──────────┘
           │
           ├───→ Email Signup Form → Confirmation Email
           │
           └───→ Feedback Widget → Thank You Message
```

---

## 6. Functional Requirements

### FR-1: Quiz Logic Engine

**Requirement**: System determines VAT status based on user inputs

**Decision Tree**:

```
IF revenue < ₪120,000/year:
  → "עוסק פטור" (VAT-exempt)
  → UNLESS user selects "Voluntary registration"
    → Then offer choice: "You can choose exempt or authorized"

IF revenue ≥ ₪120,000 AND < ₪500,000:
  → "עוסק מורשה" (VAT-authorized, mandatory)

IF revenue ≥ ₪500,000:
  → "עוסק מורשה" + warning: "Consider hiring accountant for complex compliance"

ADDITIONAL FACTORS:
- IF activity = "Products" AND clients = "Businesses"
  → Recommend "עוסק מורשה" even if revenue < ₪120K (B2B clients expect VAT invoices)

- IF employees = "Yes"
  → Add note: "You'll also need to open withholding tax (ניכויים) file"
```

**Data Storage**: Store answers as JSON in `assessments.answers_json`:
```json
{
  "activity": "services",
  "revenue": "120k-500k",
  "clients": "both",
  "employees": "no",
  "voluntary": false
}
```

---

### FR-2: Form Validation

**Requirement**: Prevent invalid submissions

**Rules**:
- Email: Must match regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Name: 2-50 characters, Hebrew or Latin letters
- Rating: Required (1-5 stars)
- Comment: Optional, max 500 characters

**Error Messages** (Hebrew):
- "נא למלא שדה זה" (Please fill this field)
- "כתובת אימייל לא תקינה" (Invalid email address)

---

### FR-3: Email Delivery

**Requirement**: Send confirmation email after signup

**Template** (Hebrew RTL):
```
Subject: תוצאות הערכת מע"מ שלך - bioGov

שלום {name},

תודה שהשתמשת ב-bioGov!

התוצאה שלך: {result_status}

[קישור לתוצאות המלאות]

המלצות שלנו:
1. {action_1}
2. {action_2}
3. {action_3}

נשמח לשמוע ממך אם יש שאלות.

בהצלחה,
צוות bioGov

---
[הסרה מרשימת התפוצה]
```

**Delivery**: Use Resend.com (free tier: 3,000 emails/month) or Supabase Edge Functions with SMTP

---

## 7. Non-Functional Requirements

### Performance
- **Page Load Time**: < 2 seconds (LCP < 2.5s)
- **Quiz Response Time**: < 500ms per question transition
- **Time to Interactive (TTI)**: < 3 seconds
- **Mobile Score**: Lighthouse 90+ on mobile

### Accessibility (IS-5568 / WCAG 2.0 AA)
- Keyboard navigation for all interactive elements
- Screen reader support (semantic HTML, ARIA labels)
- Color contrast ratio: 4.5:1 for text, 3:1 for large text
- Focus indicators visible (2px outline)
- RTL layout for Hebrew content

### Security
- Input sanitization (prevent XSS)
- Rate limiting on API endpoints (10 requests/minute per IP)
- HTTPS only (enforced by Vercel)
- Email validation (prevent spam signups)
- CORS configuration (allow only biogov.il domain)

### SEO
- Meta tags: Title, description, OG tags (Hebrew)
- Structured data: FAQ schema, Organization schema
- Sitemap.xml with 3 pages (home, quiz, results)
- Robots.txt (allow all)
- Hebrew language tag: `<html lang="he" dir="rtl">`

### Browser Support
- Chrome/Edge 90+ (95% of Israeli users)
- Safari 14+ (iOS users)
- Firefox 88+
- No IE11 support (officially deprecated)

---

## 8. Technical Constraints

### Tech Stack (Fixed)
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui (Carbon Design System)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel (frontend), Supabase Cloud (backend)
- **Analytics**: Plausible Analytics (GDPR-friendly)

### Data Residency
- Supabase region: EU-West-1 (Ireland) - closest to Israel
- Comply with Israeli Privacy Protection Law (Amendment 13)
- No data stored in third-party analytics tools (Plausible is self-hostable)

### API Rate Limits
- Supabase free tier: 500MB database, 50,000 monthly active users
- Vercel free tier: 100GB bandwidth/month, unlimited requests

---

## 9. Assumptions & Dependencies

### Assumptions
1. Users have basic Hebrew literacy (target audience is Israeli residents)
2. 60%+ traffic will be mobile (based on Israeli web usage patterns)
3. Users trust gov.il citations more than blog content
4. Email signup conversion rate will be 30-50% (industry benchmark for B2C SaaS)
5. VAT threshold of ₪120,000 remains unchanged in 2025 (no new legislation)

### Dependencies
- **External**: gov.il website availability (deep-links must not break)
- **Internal**: Design system (DESIGN_PRINCIPLES.md) implemented in Tailwind
- **Legal**: Privacy policy and terms of service drafted (see `/docs/compliance/legalShield.md`)
- **Content**: VAT decision logic validated by Israeli accountant or tax professional (risk mitigation)

---

## 10. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Incorrect VAT logic** | Medium | High | Validate decision tree with 2+ accountants; add disclaimer "For guidance only, consult tax professional" |
| **Low user acquisition** | Medium | High | Pre-launch: Seed in Facebook groups (עצמאיים בישראל), Israeli startup forums; SEO optimization for "עוסק פטור מורשה" |
| **Gov.il links break** | Low | Medium | Monitor links monthly; use Web Archive for fallback; notify users if link is broken |
| **Privacy law violation** | Low | High | Draft DPIA (Data Protection Impact Assessment); minimize PII collection; add consent checkbox |
| **User abandons quiz** | High | Medium | A/B test question order; reduce from 7 to 5 questions; add progress indicator |
| **Email deliverability issues** | Medium | Low | Use Resend or SendGrid (high reputation); avoid spam triggers in content |

---

## 11. Success Criteria (Go/No-Go Decision)

**After 30 days post-launch**, evaluate:

### ✅ **GO** (Continue to Phase 2):
- 200+ quiz completions
- 70%+ feedback rating ≥ 4 stars
- 50%+ email signup conversion
- < 5% critical bug reports

### ❌ **NO-GO** (Pivot or Pause):
- < 100 quiz completions (low demand)
- < 50% feedback rating ≥ 4 stars (product doesn't solve problem)
- > 60% bounce rate on landing page (poor value proposition)

**Phase 2 Decision**: If GO criteria met, prioritize:
1. Business License Checker (2nd most common pain point)
2. Compliance calendar with email reminders
3. User accounts with saved assessments

---

## 12. Open Questions (To Resolve Before Dev)

1. **Legal Review**: Do we need Terms of Service + Privacy Policy for MVP? (Yes - see legalShield.md)
2. **Content Validation**: Should we hire an accountant to review VAT logic? (Recommended - budget ₪500-1,000)
3. **Email Domain**: Use biogov.il or biogov.co.il? (Purchase domain first)
4. **Analytics**: GDPR compliance - is Plausible enough or do we need cookie consent banner? (Amendment 13 compliance)
5. **Monetization**: Free forever or introduce paid tier after MVP? (Decide in Phase 2)

---

## 13. Appendix

### A. Glossary (Hebrew ↔ English)

| Hebrew | English | Definition |
|--------|---------|------------|
| עוסק פטור | VAT-Exempt Dealer | Annual revenue < ₪120K, no VAT on invoices |
| עוסק מורשה | VAT-Authorized Dealer | Must charge 18% VAT, can deduct input VAT |
| טופס 821 | Form 821 | VAT registration form at Tax Authority |
| ניכויים | Withholding Tax | Payroll tax file for employers |
| ביטוח לאומי | National Insurance | Social security contributions |
| רשות המסים | Tax Authority | Israeli government tax office |

### B. Related Documents
- `/docs/DESIGN_PRINCIPLES.md` - Carbon Design System spec
- `/docs/TECH_STACK_DECISION.md` - Why Next.js + Supabase
- `/docs/compliance/legalShield.md` - Privacy & legal requirements
- `/docs/MVP/UX_RESEARCH.md` - User journey wireframes
- `/docs/MVP/MVP_TECHNICAL_ARCHITECTURE.md` - Implementation details

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 30, 2025 | Claude Code + User | Initial MVP PRD - VAT Registration Assistant |

---

**Approval Required**: Product Owner, Tech Lead, Legal Advisor
**Next Steps**: UX wireframes → Technical architecture → Sprint planning
