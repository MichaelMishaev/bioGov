# bioGov Legal Shield Implementation Roadmap
## Complete Strategy for Israeli Law Compliance (Solo Dev + AI)

**Document Version:** 1.0
**Created:** October 30, 2025
**Status:** Ready for Implementation

---

## EXECUTIVE SUMMARY

This roadmap implements the **legalShield.md** protection framework using **4 specialized AI subagents** to ensure bioGov complies with all Israeli digital service laws while minimizing legal risk as a solo-developer, no-budget MVP.

### The Legal Shield Strategy:
1. **Prevent violations** through proactive compliance
2. **Limit liability** through proper legal documentation
3. **Maintain trust** through transparency and accuracy
4. **Enable scaling** with sustainable compliance operations

### Time Investment: 2-3 weeks (40-60 hours)
### Cost: ~₪2,000 (company formation) + ₪0 for everything else (AI-assisted)
### Risk Reduction: HIGH → MEDIUM (acceptable for MVP)

---

## PHASE 1: FOUNDATION (Week 1 - 16 hours)

### Day 1-2: Company Formation & Legal Structure (8 hours)

**Objective:** Protect personal assets with Israeli LLC.

#### Actions:
1. **Form Israeli Company (עמותה or ח.פ.)**
   - Cost: ~₪2,000
   - Benefit: Limits personal liability
   - Process: Use lawyer or online service (Liranlawer.co.il, Mishpaton.co.il)
   - Deliverable: Company registration number (ח.פ.)

2. **AI Subagent: legal-text-generator**
   ```bash
   # Invoke AI agent to generate foundation documents
   > Use legal-text-generator to create:
   > 1. Terms of Service (Israeli jurisdiction)
   > 2. Privacy Policy (Amendment 13 compliant)
   > 3. Accessibility Statement (IS-5568)
   > 4. Email footer templates
   ```

3. **Customize Generated Text**
   - Replace placeholders: [COMPANY NAME], [ISRAELI ADDRESS], [REGISTRATION NUMBER]
   - Add actual emails: privacy@biogov.il, support@biogov.il, access@biogov.il
   - Set liability cap: ₪100 (minimum reasonable amount)
   - Date stamp: "Last Updated: [TODAY]"

4. **AI Subagent: israeli-legal-compliance**
   ```bash
   # Review generated legal text
   > Use israeli-legal-compliance to audit:
   > - ToS for Israeli jurisdiction compliance
   > - Privacy Policy for Amendment 13 coverage
   > - Check for Consumer Protection Law violations
   > - Verify no state symbols/impersonation
   ```

**Deliverables:**
- ✅ Israeli LLC registration
- ✅ Terms of Service (Hebrew + English)
- ✅ Privacy Policy (Hebrew + English)
- ✅ Accessibility Statement
- ✅ Legal compliance audit report

---

### Day 3: Database Schema for Legal Content (4 hours)

**Objective:** Store legal banners, official sources, consent logs.

#### Implementation:

1. **Create Legal Tables (Prisma/Supabase)**
```typescript
// prisma/schema.prisma

model LegalBanner {
  id          String   @id @default(cuid())
  key         String   @unique // "not_gov_info_only", "footer_non_affiliation"
  placement   String   // "top_of_guidance", "footer", "before_submit"
  textEn      String   // English text
  textHe      String   // Hebrew text
  textRu      String?  // Russian (optional)
  textFr      String?  // French (optional)
  sources     Json     // [{label: "...", url: "..."}]
  updatedAt   DateTime @updatedAt
  createdAt   DateTime @default(now())
}

model OfficialSource {
  id          String   @id @default(cuid())
  stepKey     String   // "vat_open_file", "company_registration"
  title       String   // "Open VAT file (עוסק)"
  authority   String   // "Tax Authority", "Bituach Leumi"
  url         String   // "https://www.gov.il/..."
  lastChecked DateTime
  isActive    Boolean  @default(true)
  statusCode  Int?     // HTTP status code
  createdAt   DateTime @default(now())
}

model ConsentLog {
  id          String   @id @default(cuid())
  userId      String
  channel     String   // "marketing_email", "marketing_sms"
  method      String   // "web_checkbox", "settings_page"
  consented   Boolean
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?  // Null for system actions
  action      String   // "login", "data_export", "admin_edit"
  resource    String?  // "User", "Business", "Task"
  resourceId  String?
  metadata    Json?    // Additional context
  ipAddress   String?
  timestamp   DateTime @default(now())

  user        User?    @relation(fields: [userId], references: [id])
}

model LinkHealthCheck {
  id            String   @id @default(cuid())
  url           String
  statusCode    Int
  responseTime  Int      // milliseconds
  checkedAt     DateTime @default(now())
  notes         String?
}
```

2. **Seed Legal Banners**
```typescript
// prisma/seed-legal.ts

import { legalBannersData } from '@/legalShield-data.json';

async function seedLegalBanners() {
  const banners = [
    {
      key: "not_gov_info_only",
      placement: "top_of_guidance",
      textEn: "Not an official government service. Guidance only—verify with the official source below.",
      textHe: "שירות עצמאי. אינו שירות ממשלתי רשמי. המידע כללי בלבד—בדקו בקישור הרשמי.",
      textRu: "Независимый сервис. Не является официальной государственной службой. Информация носит общий характер—проверяйте на официальном сайте.",
      sources: [
        {
          label: "Consumer Protection Authority",
          url: "https://www.gov.il/en/departments/consumer_protection_and_fair_trade_authority"
        }
      ]
    },
    {
      key: "footer_non_affiliation",
      placement: "footer",
      textEn: "Independent service • Not affiliated with any ministry/authority • No state emblems used",
      textHe: "שירות עצמאי • אינו מסונף לכל משרד/רשות • ללא שימוש בסמלי מדינה",
      textRu: "Независимый сервис • Не связан с министерствами/органами власти • Государственные символы не используются",
      sources: [
        {
          label: "Flag & Emblem Law",
          url: "https://www.adalah.org/.../Flag-and-Emblem-Law-1949.pdf"
        }
      ]
    },
    {
      key: "review_before_submit",
      placement: "before_submit",
      textEn: "I have reviewed this form and understand that [APP NAME] is NOT providing legal/tax advice. I am responsible for verifying information and submitting correctly.",
      textHe: "סקרתי את הטופס ומבין/ה ש-[APP NAME] אינו מספק ייעוץ משפטי/מס. אני אחראי/ת לאימות המידע ולהגשה נכונה.",
      textRu: "Я проверил эту форму и понимаю, что [APP NAME] НЕ предоставляет юридические/налоговые консультации. Я несу ответственность за проверку информации и правильную подачу.",
      sources: []
    }
  ];

  for (const banner of banners) {
    await prisma.legalBanner.upsert({
      where: { key: banner.key },
      update: banner,
      create: banner
    });
  }
}
```

3. **Seed Official Sources**
```typescript
// Use legalShield.md section 2 "AI-ready official sources map"

const officialSources = [
  {
    stepKey: "vat_open_file",
    title: "Open VAT file (עוסק)",
    authority: "Israel Tax Authority",
    url: "https://www.gov.il/en/departments/topics/value_added_tax",
    lastChecked: new Date()
  },
  {
    stepKey: "company_registration",
    title: "Register a Company (חברה בע״מ)",
    authority: "Corporations Authority",
    url: "https://www.gov.il/en/service/company_registration",
    lastChecked: new Date()
  },
  {
    stepKey: "bituach_self_employed",
    title: "Register as self-employed for NII",
    authority: "National Insurance (Bituach Leumi)",
    url: "https://www.btl.gov.il/English%20Homepage/Insurance/National%20Insurance/Detailsoftypes/SelfEmployedPerson/Pages/HowtoRegister.aspx",
    lastChecked: new Date()
  },
  {
    stepKey: "business_license",
    title: "Check if your business needs a license",
    authority: "Ministry of Interior",
    url: "https://www.gov.il/en/pages/business_licensing_law_1968",
    lastChecked: new Date()
  }
];
```

**Deliverables:**
- ✅ Prisma schema with legal tables
- ✅ Seed data for banners and official sources
- ✅ Migration applied to database

---

### Day 4: UI Components for Legal Content (4 hours)

**Objective:** Reusable React components for disclaimers, banners, consent.

#### Implementation:

1. **Disclaimer Banner Component**
```typescript
// components/legal/DisclaimerBanner.tsx

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  stepKey?: string; // Optional: show official source for specific step
  placement?: 'top_of_guidance' | 'before_submit';
}

export function DisclaimerBanner({ stepKey, placement = 'top_of_guidance' }: DisclaimerBannerProps) {
  const { data: banner } = useQuery({
    queryKey: ['legal-banner', placement],
    queryFn: () => fetch(`/api/legal/banner?placement=${placement}`).then(r => r.json())
  });

  const { data: officialSource } = useQuery({
    queryKey: ['official-source', stepKey],
    queryFn: () => stepKey ? fetch(`/api/legal/source?step=${stepKey}`).then(r => r.json()) : null,
    enabled: !!stepKey
  });

  if (!banner) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6" role="alert">
      <div className="flex">
        <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" aria-hidden="true" />
        <div>
          <p className="text-sm text-yellow-800">
            {banner.textEn} {/* Use i18n here */}
          </p>
          {officialSource && (
            <p className="text-xs text-yellow-700 mt-2">
              <strong>Last updated:</strong> {new Date(officialSource.lastChecked).toLocaleDateString()} •{' '}
              <strong>Official source:</strong>{' '}
              <a href={officialSource.url} target="_blank" rel="noopener noreferrer" className="underline">
                {officialSource.authority} →
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

2. **Review Checkbox Component**
```typescript
// components/legal/ReviewCheckbox.tsx

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface ReviewCheckboxProps {
  required?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ReviewCheckbox({ required = true, onCheckedChange }: ReviewCheckboxProps) {
  const [checked, setChecked] = useState(false);

  const handleChange = (newChecked: boolean) => {
    setChecked(newChecked);
    onCheckedChange(newChecked);
  };

  return (
    <div className="flex items-start space-x-2 p-4 border border-gray-300 rounded-md bg-gray-50">
      <Checkbox
        id="review-confirm"
        checked={checked}
        onCheckedChange={handleChange}
        required={required}
      />
      <label htmlFor="review-confirm" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        I have <strong>reviewed</strong> this form and understand that bioGov is <strong>NOT providing legal/tax advice</strong>.
        I am responsible for verifying information and submitting correctly.
      </label>
    </div>
  );
}
```

3. **Marketing Consent Component**
```typescript
// components/legal/MarketingConsent.tsx

import { Checkbox } from '@/components/ui/checkbox';

interface MarketingConsentProps {
  onConsentChange: (consented: boolean) => void;
}

export function MarketingConsent({ onConsentChange }: MarketingConsentProps) {
  return (
    <div className="flex items-start space-x-2 mt-4">
      <Checkbox
        id="marketing-consent"
        defaultChecked={false} // CRITICAL: Unchecked by default
        onCheckedChange={onConsentChange}
      />
      <label htmlFor="marketing-consent" className="text-sm">
        ☐ I agree to receive <strong>marketing updates</strong> (email/SMS). I can unsubscribe at any time.
      </label>
    </div>
  );
}

// Usage in signup form:
const handleMarketingConsent = async (consented: boolean) => {
  // Log consent to database
  await fetch('/api/consent/log', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      channel: 'marketing_email',
      method: 'web_checkbox',
      consented,
      ipAddress: req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent']
    })
  });
};
```

4. **Footer Badge Component**
```typescript
// components/legal/FooterBadge.tsx

export function FooterBadge() {
  return (
    <div className="text-center text-sm text-gray-600 mt-8 pt-6 border-t border-gray-200">
      <p>
        Independent service • <strong>Not affiliated</strong> with any ministry/authority • No state emblems used
      </p>
    </div>
  );
}
```

**Deliverables:**
- ✅ DisclaimerBanner component (with official source chip)
- ✅ ReviewCheckbox component (before form submission)
- ✅ MarketingConsent component (anti-spam compliant)
- ✅ FooterBadge component (non-affiliation)

---

## PHASE 2: CONTENT INTEGRATION (Week 2 - 20 hours)

### Day 5-6: Legal Pages Creation (8 hours)

**Objective:** Publish ToS, Privacy Policy, Accessibility Statement.

#### Actions:

1. **Create Legal Pages Directory**
```bash
mkdir -p app/(legal)/legal/{terms,privacy,accessibility,cookies}
```

2. **Use AI Subagent: legal-text-generator**
```bash
> Use legal-text-generator to create:
> 1. /legal/terms page (full ToS from template)
> 2. /legal/privacy page (full Privacy Policy)
> 3. /legal/accessibility page (Accessibility Statement)
> 4. /legal/cookies page (Cookie Policy - optional)
>
> Customize with:
> - Company name: bioGov Ltd.
> - Registration: ח.פ. [NUMBER]
> - Address: [Israeli address]
> - Emails: privacy@biogov.il, support@biogov.il, access@biogov.il
> - Date: October 30, 2025
```

3. **Implement Pages**
```typescript
// app/(legal)/legal/terms/page.tsx

export const metadata = {
  title: 'Terms of Service | bioGov',
  description: 'Terms of Service for bioGov - Israeli jurisdiction, consumer protection compliant'
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-sm text-gray-600 mb-8">
        <strong>Last Updated:</strong> October 30, 2025
      </p>

      {/* Content generated by legal-text-generator */}
      <div className="prose prose-lg max-w-none">
        {/* Insert full ToS markdown */}
      </div>
    </div>
  );
}

// Same for /legal/privacy, /legal/accessibility
```

4. **Add Footer Links**
```typescript
// components/layout/Footer.tsx

export function Footer() {
  return (
    <footer className="bg-gray-100 py-12 mt-20">
      <div className="container mx-auto px-4">
        <FooterBadge />

        <div className="mt-8 text-center space-x-4">
          <Link href="/legal/terms" className="text-sm text-gray-700 hover:underline">
            Terms of Service
          </Link>
          <Link href="/legal/privacy" className="text-sm text-gray-700 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/legal/accessibility" className="text-sm text-gray-700 hover:underline">
            Accessibility
          </Link>
          <Link href="/legal/cookies" className="text-sm text-gray-700 hover:underline">
            Cookies
          </Link>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          © 2025 bioGov Ltd. ח.פ. [NUMBER]. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
```

**Deliverables:**
- ✅ /legal/terms page (Hebrew + English)
- ✅ /legal/privacy page (Hebrew + English)
- ✅ /legal/accessibility page (Hebrew + English)
- ✅ /legal/cookies page (optional)
- ✅ Footer with legal links

---

### Day 7-8: Integrate Disclaimers Sitewide (6 hours)

**Objective:** Add "Not government service" banners to every guidance page.

#### Actions:

1. **Identify Guidance Pages**
```bash
# Find all pages that provide official guidance
find app -name "*guidance*" -o -name "*checklist*" -o -name "*form*"
```

2. **Add DisclaimerBanner**
```typescript
// app/(app)/guidance/vat-registration/page.tsx

import { DisclaimerBanner } from '@/components/legal/DisclaimerBanner';

export default function VATRegistrationPage() {
  return (
    <div>
      {/* Add banner at top of every guidance page */}
      <DisclaimerBanner stepKey="vat_open_file" placement="top_of_guidance" />

      <h1>How to Register for VAT (עוסק מורשה)</h1>
      {/* Rest of content */}
    </div>
  );
}
```

3. **Add Before-Submit Review**
```typescript
// components/forms/FormSubmitButton.tsx

import { ReviewCheckbox } from '@/components/legal/ReviewCheckbox';
import { useState } from 'react';

export function FormSubmitButton({ onSubmit }: { onSubmit: () => void }) {
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  return (
    <div>
      <ReviewCheckbox onCheckedChange={setReviewConfirmed} />

      <button
        onClick={onSubmit}
        disabled={!reviewConfirmed}
        className="mt-4 btn-primary"
      >
        Generate Form
      </button>
    </div>
  );
}
```

4. **AI Subagent: israeli-legal-compliance**
```bash
> Use israeli-legal-compliance to audit:
> - Check all guidance pages have disclaimers
> - Verify "Official Source" chips present
> - Ensure "Last Updated" dates visible
> - Check no state symbols in UI (blue-white palettes, emblems)
> - Review for misleading language ("guaranteed", "official")
```

**Deliverables:**
- ✅ DisclaimerBanner on 100% of guidance pages
- ✅ ReviewCheckbox before form submissions
- ✅ Official source chips with gov.il links
- ✅ Compliance audit report (zero violations)

---

### Day 9: Email Templates & Anti-Spam (6 hours)

**Objective:** Compliant email templates with unsubscribe links.

#### Actions:

1. **Email Footer Template**
```typescript
// lib/email/templates/footer.tsx

export function EmailFooter({ unsubscribeUrl }: { unsubscribeUrl: string }) {
  return (
    <footer style={{ fontSize: '12px', color: '#666', marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
      <p>You are receiving this email because you <strong>opted in</strong> to bioGov updates.</p>
      <p>
        <a href={unsubscribeUrl}>Unsubscribe</a> |
        <a href="https://biogov.il/settings/email-preferences">Email Preferences</a> |
        <a href="https://biogov.il/legal/privacy">Privacy Policy</a>
      </p>
      <p>
        bioGov Ltd.<br />
        [Israeli Address]<br />
        support@biogov.il
      </p>
    </footer>
  );
}
```

2. **Unsubscribe Endpoint**
```typescript
// app/api/unsubscribe/route.ts

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token'); // Signed token with userId + channel

  // Verify token, extract userId
  const { userId, channel } = verifyUnsubscribeToken(token);

  // Log consent withdrawal
  await prisma.consentLog.create({
    data: {
      userId,
      channel,
      method: 'email_unsubscribe_link',
      consented: false,
      timestamp: new Date()
    }
  });

  // Update user preferences
  await prisma.user.update({
    where: { id: userId },
    data: { marketingEmailOptIn: false }
  });

  return NextResponse.redirect('/unsubscribed?success=true');
}
```

3. **Consent Logging Middleware**
```typescript
// lib/consent/logConsent.ts

export async function logMarketingConsent({
  userId,
  channel,
  consented,
  method,
  ipAddress,
  userAgent
}: {
  userId: string;
  channel: 'marketing_email' | 'marketing_sms';
  consented: boolean;
  method: 'web_checkbox' | 'settings_page' | 'email_unsubscribe_link';
  ipAddress?: string;
  userAgent?: string;
}) {
  await prisma.consentLog.create({
    data: {
      userId,
      channel,
      consented,
      method,
      ipAddress,
      userAgent,
      timestamp: new Date()
    }
  });
}
```

**Deliverables:**
- ✅ Email footer component (anti-spam compliant)
- ✅ Unsubscribe endpoint (one-click, < 24 hours)
- ✅ Consent logging (audit trail)
- ✅ Email preferences page

---

## PHASE 3: MONITORING & MAINTENANCE (Week 3 - 20 hours)

### Day 10-11: Link Health Monitoring System (10 hours)

**Objective:** Automated monthly link checks for gov.il URLs.

#### Actions:

1. **Link Check Script**
```typescript
// scripts/check-links.ts

import { prisma } from '@/lib/prisma';

const ALL_LINKS = [
  'https://www.gov.il/en/departments/topics/value_added_tax',
  'https://www.gov.il/en/service/company_registration',
  'https://www.btl.gov.il/English%20Homepage/Insurance/National%20Insurance/Detailsoftypes/SelfEmployedPerson/Pages/HowtoRegister.aspx',
  'https://www.gov.il/en/pages/business_licensing_law_1968',
  'https://www.gov.il/en/pages/data_security_regulation',
  'https://www.gov.il/en/pages/website_accessibility'
  // ... add all official links from legalShield.md section 2
];

async function checkLinks() {
  const results = [];

  for (const url of ALL_LINKS) {
    const startTime = Date.now();

    try {
      const response = await fetch(url, { method: 'HEAD' });
      const responseTime = Date.now() - startTime;

      await prisma.linkHealthCheck.create({
        data: {
          url,
          statusCode: response.status,
          responseTime,
          checkedAt: new Date()
        }
      });

      if (response.status !== 200) {
        console.warn(`⚠️ ${url} returned ${response.status}`);
      } else {
        console.log(`✅ ${url} is active (${responseTime}ms)`);
      }

      results.push({ url, status: response.status, responseTime });
    } catch (error) {
      console.error(`🔴 ${url} failed:`, error.message);

      await prisma.linkHealthCheck.create({
        data: {
          url,
          statusCode: 0,
          responseTime: 0,
          checkedAt: new Date(),
          notes: `Error: ${error.message}`
        }
      });
    }
  }

  return results;
}

// Run monthly via cron or GitHub Actions
checkLinks().then(results => {
  console.log(`\n📊 Checked ${results.length} links`);
  const broken = results.filter(r => r.status !== 200);
  if (broken.length > 0) {
    console.error(`\n🔴 ${broken.length} broken links found!`);
    // Send alert email
  }
});
```

2. **GitHub Actions Workflow**
```yaml
# .github/workflows/link-check.yml

name: Monthly Link Health Check

on:
  schedule:
    - cron: '0 9 1 * *'  # 9am on 1st of each month
  workflow_dispatch:  # Manual trigger

jobs:
  check-links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run link check
        run: npm run check-links
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Create issue if links broken
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🔴 Broken government links detected',
              body: 'Monthly link check found broken links. See workflow run for details.',
              labels: ['compliance', 'urgent']
            })
```

3. **AI Subagent: content-freshness-monitor**
```bash
> Use content-freshness-monitor monthly to:
> 1. Run link health check script
> 2. Generate Link Health Report
> 3. Flag broken links (404s, 301 redirects)
> 4. Check "Last Updated" dates (<90 days)
> 5. Create GitHub issues for fixes needed
```

**Deliverables:**
- ✅ Link check script (TypeScript)
- ✅ GitHub Actions workflow (monthly cron)
- ✅ LinkHealthCheck database table
- ✅ Alert system (email + GitHub issues)

---

### Day 12-13: Compliance Auditing System (6 hours)

**Objective:** Quarterly compliance audits (security, accessibility, privacy).

#### Actions:

1. **Compliance Audit Script**
```bash
#!/bin/bash
# scripts/compliance-audit.sh

echo "🔍 Starting Compliance Audit..."

# Security Checks
echo "\n1. Security Audit"
echo "- Checking for secrets in code..."
git secrets --scan
npx snyk test --severity-threshold=high

echo "- Checking admin 2FA..."
# Query database for admins without 2FA
npx tsx scripts/check-admin-2fa.ts

# Accessibility Checks
echo "\n2. Accessibility Audit"
echo "- Running Lighthouse..."
npx lighthouse http://localhost:3000 --only-categories=accessibility --output=json --output-path=./reports/lighthouse.json

echo "- Running axe-core..."
npx axe http://localhost:3000 --save ./reports/axe.json

# Privacy Checks
echo "\n3. Privacy Audit"
echo "- Checking data retention..."
npx tsx scripts/check-data-retention.ts

echo "- Checking consent logs..."
npx tsx scripts/check-consent-coverage.ts

# Anti-Spam Checks
echo "\n4. Anti-Spam Audit"
echo "- Checking email templates for unsubscribe links..."
grep -r "unsubscribe" components/email --include="*.tsx"

echo "\n✅ Audit complete. Check ./reports/ for details."
```

2. **AI Subagent: compliance-auditor**
```bash
> Use compliance-auditor quarterly to:
> 1. Run compliance audit script
> 2. Review all 5 audit domains (Security, Accessibility, Anti-Spam, Privacy, Consumer Protection)
> 3. Generate Compliance Audit Report with pass/fail status
> 4. Create action items for fixes (Critical <7 days, High <30 days)
> 5. Calculate compliance score (target: >90%)
```

3. **Compliance Dashboard**
```typescript
// app/(admin)/admin/compliance/page.tsx

export default async function ComplianceDashboardPage() {
  const latestChecks = await prisma.linkHealthCheck.findMany({
    take: 100,
    orderBy: { checkedAt: 'desc' }
  });

  const brokenLinks = latestChecks.filter(c => c.statusCode !== 200);
  const linkHealthScore = ((latestChecks.length - brokenLinks.length) / latestChecks.length) * 100;

  const consentLogs = await prisma.consentLog.count();
  const marketingEmails = await prisma.user.count({ where: { marketingEmailOptIn: true } });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Compliance Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Link Health</h3>
          <p className="text-4xl font-bold">{linkHealthScore.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">{brokenLinks.length} broken links</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Consent Logs</h3>
          <p className="text-4xl font-bold">{consentLogs}</p>
          <p className="text-sm text-gray-600">{marketingEmails} opted-in users</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Last Audit</h3>
          <p className="text-lg">October 30, 2025</p>
          <p className="text-sm text-green-600">✅ Passed (94/100)</p>
        </div>
      </div>

      {/* Broken links table */}
      {brokenLinks.length > 0 && (
        <div className="mt-8 bg-red-50 p-6 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-4">🔴 Broken Links Requiring Attention</h3>
          <ul className="space-y-2">
            {brokenLinks.map(link => (
              <li key={link.id} className="text-sm">
                <a href={link.url} target="_blank" className="underline">{link.url}</a>
                <span className="ml-2 text-red-600">HTTP {link.statusCode}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

**Deliverables:**
- ✅ Compliance audit script (bash + TypeScript)
- ✅ Quarterly audit schedule (calendar reminder)
- ✅ Compliance dashboard (admin UI)
- ✅ Automated compliance scoring

---

### Day 14: Documentation & Team Training (4 hours)

**Objective:** Document processes, train (future) team on compliance.

#### Actions:

1. **Compliance Operations Manual**
```markdown
# bioGov Compliance Operations Manual

## Overview

This manual documents all compliance processes for bioGov to ensure adherence to Israeli digital service laws.

## Legal Framework

- Consumer Protection Law (1981)
- Privacy Protection Law + Amendment 13 (2025)
- Data Security Regulations (2017)
- IS-5568 / WCAG 2.0 AA Accessibility
- Communications Law (Anti-Spam)
- Standard Contracts Law (1982)

## Monthly Tasks

### Week 1: Link Health Check
- **Owner:** Dev Team
- **Tool:** AI Subagent (content-freshness-monitor)
- **Action:** Run `npm run check-links`
- **Output:** Link Health Report
- **SLA:** Fix broken links within 48 hours

### Week 2: Content Review
- **Owner:** Content Team
- **Tool:** Manual review + AI Subagent (israeli-legal-compliance)
- **Action:** Review 5-10 guidance pages for accuracy
- **Output:** Update "Last Updated" dates if changed

### Week 3: Security Check
- **Owner:** Dev Team
- **Action:** Run `npm audit`, check admin 2FA, review access logs
- **Output:** Security checklist (pass/fail)

### Week 4: User Feedback
- **Owner:** Support Team
- **Action:** Review user reports of broken links, outdated info
- **Output:** Ticket resolution, content updates

## Quarterly Tasks

### Compliance Audit (Q1, Q2, Q3, Q4)
- **Owner:** CTO + Legal (if hired)
- **Tool:** AI Subagent (compliance-auditor)
- **Action:** Full audit (security, accessibility, privacy, anti-spam, consumer protection)
- **Output:** Compliance Audit Report with action items

### Content Deep Dive
- **Owner:** Content Team + Dev
- **Tool:** AI Subagent (content-freshness-monitor)
- **Action:** Visit key gov.il pages, check for procedure changes, law amendments
- **Output:** Quarterly Content Review report

## Annual Tasks

### Legal Text Review
- **Owner:** CTO + External Lawyer (recommended)
- **Action:** Review ToS, Privacy Policy, ensure current with law
- **Output:** Updated legal pages if needed

### Penetration Testing (Optional, Post-Revenue)
- **Owner:** CTO
- **Vendor:** Israeli security firm (e.g., CyberArk, Check Point)
- **Budget:** ₪10K-₪30K
- **Output:** Pentest report with remediation plan

## Incident Response

### Data Breach
1. **Detection:** Alert via Sentry, user report, or security scan
2. **Assessment:** Incident Commander (CTO) evaluates scope
3. **Containment:** Isolate affected systems, revoke tokens
4. **Investigation:** Review logs, identify root cause
5. **Notification:** PPA within 72 hours, users if severe
6. **Remediation:** Fix vulnerability, deploy patch
7. **Post-Mortem:** Document lessons, update runbook

### Broken Official Link
1. **Detection:** Monthly link check, user report
2. **Verification:** Test link manually
3. **Search:** Check gov.il site, Internet Archive
4. **Update:** Replace link or add "temporarily unavailable" notice
5. **SLA:** Fix within 48 hours

## Training Materials

### New Developer Onboarding
- Read: CLAUDE.md, legalShield.md, this manual
- Watch: Compliance training video (TBD)
- Understand: AI Subagents (how to invoke for compliance reviews)

### Legal Compliance Quiz (Pre-Commit)
1. What is the Agoda ruling? (Answer: Israeli law applies to Israeli consumers)
2. Can we pre-check the marketing consent checkbox? (Answer: No, Amendment 40 anti-spam)
3. What's our liability cap in ToS? (Answer: ₪100 minimum)
4. Where do we store personal data? (Answer: Israel / Supabase IL region)
5. What's the PPA breach notification deadline? (Answer: 72 hours)

## Contact Information

**Privacy Officer (if appointed):** [Name, Email]
**Legal Contact:** [Lawyer Name, Firm, Email]
**Security Contact:** [CTO Email]
**PPA:** https://www.gov.il/en/departments/the_privacy_protection_authority
```

2. **Save to `/docs/`**
```bash
# Move to documentation
mv COMPLIANCE_OPERATIONS_MANUAL.md /Users/michaelmishayev/Desktop/Projects/bioGov/docs/

# Add to Git
git add docs/COMPLIANCE_OPERATIONS_MANUAL.md
git commit -m "docs: add compliance operations manual"
```

**Deliverables:**
- ✅ Compliance Operations Manual (comprehensive)
- ✅ Monthly/Quarterly/Annual task checklists
- ✅ Incident response procedures
- ✅ Training materials for future team

---

## PHASE 4: CONTINUOUS IMPROVEMENT (Ongoing)

### Ongoing Actions:

1. **Monthly Link Checks** (2 hours/month)
   - Run automated script via GitHub Actions
   - Review Link Health Report
   - Fix broken links within 48 hours

2. **Quarterly Audits** (8 hours/quarter)
   - Full compliance audit via `compliance-auditor` subagent
   - Generate report, fix critical/high issues
   - Update legal text if laws change

3. **Annual Legal Review** (16 hours/year)
   - Hire Israeli lawyer for ToS/Privacy Policy review (₪2K-₪5K)
   - Update for new laws (e.g., Amendment 14 if passed)
   - Conduct penetration testing (post-revenue)

4. **User Feedback Loop** (Ongoing)
   - Monitor support emails for broken link reports
   - Implement "Report Issue" button on guidance pages
   - Respond within 24-48 hours

---

## SUCCESS METRICS

### Legal Protection (Risk Mitigation):
- ✅ Israeli LLC formed (personal liability shielded)
- ✅ ToS/Privacy Policy published (consumer protection compliant)
- ✅ Disclaimers on 100% of guidance pages (no misleading content)
- ✅ Liability cap defined (₪100, reasonable)
- ✅ No state symbols used (no impersonation)

### Compliance Scores:
- **Link Health:** >95% active links
- **Accessibility:** Lighthouse >95, zero WCAG AA violations
- **Privacy:** 100% user rights exercisable (export, delete)
- **Anti-Spam:** 100% marketing emails have unsubscribe
- **Security:** Zero critical vulnerabilities

### Operational Metrics:
- **Broken links fixed:** <48 hours
- **Compliance audits:** Quarterly (4x/year minimum)
- **User complaints:** <1% report outdated/broken links
- **Breach incidents:** Zero

---

## AI SUBAGENT USAGE SUMMARY

| Subagent | When to Invoke | Key Actions |
|----------|----------------|-------------|
| **israeli-legal-compliance** | After legal text changes, pre-launch audit | Review ToS/Privacy, check Israeli law compliance, audit for state symbols |
| **content-freshness-monitor** | Monthly link checks, quarterly content reviews | Test gov.il links, check form versions, detect procedure changes |
| **legal-text-generator** | Creating/updating legal pages, email templates | Generate ToS, Privacy Policy, disclaimers, banners, consent flows |
| **compliance-auditor** | Quarterly audits, pre-launch, after major features | Full audit (security, accessibility, privacy, anti-spam), generate report |

### How to Invoke (Claude Code):
```bash
# Example 1: Generate updated Privacy Policy
> Use legal-text-generator to update Privacy Policy for Amendment 13 (August 2025 changes)

# Example 2: Monthly link check
> Use content-freshness-monitor to run monthly link health check and generate report

# Example 3: Quarterly audit
> Use compliance-auditor to conduct Q4 2025 full compliance audit (all 5 domains)

# Example 4: Review new feature for compliance
> Use israeli-legal-compliance to audit the new "auto-file VAT return" feature for legal risks
```

---

## COST BREAKDOWN (Total: ~₪2,000 MVP)

| Item | Cost | Frequency | Notes |
|------|------|-----------|-------|
| Israeli LLC Formation | ₪2,000 | One-time | Lawyer or online service |
| Legal Text (AI-generated) | ₪0 | One-time | Using legal-text-generator subagent |
| Link Monitoring | ₪0 | Monthly | GitHub Actions (free tier) |
| Compliance Audits | ₪0 | Quarterly | Using compliance-auditor subagent |
| Accessibility Testing | ₪0 | Monthly | Lighthouse, axe-core (free tools) |
| **Total MVP** | **₪2,000** | - | - |
| | | | |
| **Post-Revenue (Optional):** | | | |
| Cyber Insurance | ₪5K-₪15K | Annual | Once ₪50K MRR |
| Penetration Testing | ₪10K-₪30K | Annual | Israeli security firm |
| Legal Consultation | ₪2K-₪5K | Annual | ToS/Privacy review |

---

## TIMELINE SUMMARY

| Week | Phase | Hours | Key Deliverables |
|------|-------|-------|------------------|
| **Week 1** | Foundation | 16 | LLC, ToS, Privacy Policy, DB schema, UI components |
| **Week 2** | Content Integration | 20 | Legal pages, disclaimers sitewide, email templates |
| **Week 3** | Monitoring & Maintenance | 20 | Link monitoring, compliance auditing, documentation |
| **Ongoing** | Continuous Improvement | 2-8/month | Monthly checks, quarterly audits, user feedback |

**Total Initial Investment:** 56 hours (2-3 weeks for solo dev with AI assistance)

---

## CONCLUSION

This implementation roadmap provides a **complete, actionable strategy** for deploying bioGov's legal shield using the `legalShield.md` framework and **4 specialized AI subagents**.

### Key Advantages:
1. **Low Cost:** ₪2,000 total (LLC formation), everything else AI-assisted
2. **Solo-Dev Feasible:** 56 hours over 3 weeks with AI multiplying productivity
3. **Israeli Law Compliant:** Amendment 13, IS-5568, Consumer Protection, Anti-Spam
4. **Scalable:** Automated monitoring, quarterly audits, clear processes
5. **Risk Mitigation:** Liability shield (LLC), proper disclaimers, no impersonation

### Next Steps:
1. **Review this roadmap** with legal advisor (optional but recommended)
2. **Start Phase 1:** Form LLC, generate legal text with AI subagents
3. **Implement Phases 2-3:** Integrate disclaimers, build monitoring systems
4. **Launch with confidence:** Legal shield in place, compliance ongoing

---

**Questions? Invoke AI subagents for assistance:**
- Legal text needs? → `legal-text-generator`
- Compliance review? → `israeli-legal-compliance`
- Link health check? → `content-freshness-monitor`
- Quarterly audit? → `compliance-auditor`

**Let's build a legally sound, trustworthy service for Israeli SMBs. 🇮🇱**
