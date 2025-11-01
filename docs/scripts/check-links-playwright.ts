/**
 * Government Links Health Checker - Playwright Edition
 *
 * This script uses Playwright to check government links with real browser automation.
 * This bypasses many 403 errors and provides more accurate results.
 *
 * Usage:
 *   pnpm tsx docs/scripts/check-links-playwright.ts
 *
 * Exit codes:
 *   0 - All links healthy
 *   1 - Broken links found
 */

import { chromium, Browser, Page } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

// ============================================
// CONFIGURATION
// ============================================

/**
 * All government links used in bioGov
 */
const GOVERNMENT_LINKS = {
  // Tax Authority (רשות המסים)
  vat: {
    form821: 'https://www.gov.il/he/service/vat-821',
    form821English: 'https://www.gov.il/en/service/vat-821',
    exemptDealer: 'https://www.gov.il/he/service/request-open-exempt-dealer-via-internet',
    verifyStatus: 'https://www.gov.il/he/service/vat-apply-online',
    deadlines: 'https://www.gov.il/he/pages/pa151025-2',
    hub: 'https://www.gov.il/en/departments/topics/value_added_tax/govil-landing-page',
  },

  // National Insurance (ביטוח לאומי)
  nationalInsurance: {
    selfEmployed: 'https://www.btl.gov.il/Insurance/National%20Insurance/type_list/Self_Employed/Pages/default.aspx',
    integratedFlow: 'https://www.btl.gov.il/About/news/Pages/ArchiveFolder/2025/PtictTik.aspx',
    personalArea: 'https://ps.btl.gov.il/',
    englishSelfEmployed: 'https://www.btl.gov.il/English%20Homepage/Insurance/National%20Insurance/Detailsoftypes/SelfEmployedPerson/Pages/HowtoRegister.aspx',
  },

  // Business Licensing (רישוי עסקים)
  licensing: {
    hub: 'https://www.gov.il/he/departments/topics/business_licensure/govil-landing-page',
    apply: 'https://www.gov.il/he/service/application-for-new-business-license',
    dataset: 'https://data.gov.il/dataset/business-licensing-br7',
  },

  // Corporations Authority (רשם החברות)
  companies: {
    extract: 'https://www.gov.il/he/service/company_extract',
    dataset: 'https://data.gov.il/dataset/ica_companies',
    datasetResource: 'https://data.gov.il/dataset/ica_companies/resource/f004176c-b85f-4542-8901-7b3176f9a054',
  },

  // MyGov (הזדהות לאומית)
  myGov: {
    home: 'https://my.gov.il/',
    ssoFaq: 'https://www.gov.il/he/pages/signup_sso_faq',
  },

  // Privacy & Legal
  privacy: {
    dataSecurityRegs: 'https://www.gov.il/en/pages/data_security_eng',
    dataSecurityRegsPDF: 'https://www.gov.il/BlobFolder/legalinfo/data_security_regulation/en/PROTECTION%20OF%20PRIVACY%20REGULATIONS.pdf',
  },

  // Accessibility
  accessibility: {
    is5568PDF: 'https://www.gov.il/BlobFolder/legalinfo/israeli_accessibility_standards_pdf/he/sitedocs_si-5568-1-september-2023.pdf',
    guide: 'https://www.gov.il/en/Departments/Guides/website_accessibility',
  },

  // Business Founders
  general: {
    businessFounders: 'https://www.gov.il/en/departments/targetaudience/taxes-audience-open-new-business/govil-landing-page',
  },
};

/**
 * Priority levels for links
 */
enum LinkPriority {
  CRITICAL = 'critical', // User cannot complete registration without this
  HIGH = 'high',         // Important for core functionality
  MEDIUM = 'medium',     // Nice to have, informational
  LOW = 'low',           // Optional, supplementary content
}

/**
 * Assign priority to each link category
 */
const LINK_PRIORITIES: Record<string, LinkPriority> = {
  'vat.form821': LinkPriority.CRITICAL,
  'vat.form821English': LinkPriority.CRITICAL,
  'vat.exemptDealer': LinkPriority.CRITICAL,
  'vat.verifyStatus': LinkPriority.HIGH,
  'vat.deadlines': LinkPriority.HIGH,
  'vat.hub': LinkPriority.MEDIUM,

  'nationalInsurance.selfEmployed': LinkPriority.CRITICAL,
  'nationalInsurance.integratedFlow': LinkPriority.HIGH,
  'nationalInsurance.personalArea': LinkPriority.HIGH,
  'nationalInsurance.englishSelfEmployed': LinkPriority.MEDIUM,

  'licensing.hub': LinkPriority.HIGH,
  'licensing.apply': LinkPriority.HIGH,
  'licensing.dataset': LinkPriority.MEDIUM,

  'companies.extract': LinkPriority.HIGH,
  'companies.dataset': LinkPriority.MEDIUM,
  'companies.datasetResource': LinkPriority.MEDIUM,

  'myGov.home': LinkPriority.CRITICAL,
  'myGov.ssoFaq': LinkPriority.MEDIUM,

  'privacy.dataSecurityRegs': LinkPriority.HIGH,
  'privacy.dataSecurityRegsPDF': LinkPriority.MEDIUM,

  'accessibility.is5568PDF': LinkPriority.HIGH,
  'accessibility.guide': LinkPriority.MEDIUM,

  'general.businessFounders': LinkPriority.MEDIUM,
};

// ============================================
// TYPES
// ============================================

interface LinkCheckResult {
  category: string;
  key: string;
  url: string;
  status: number | null;
  ok: boolean;
  error?: string;
  priority: LinkPriority;
  responseTime: number;
  pageTitle?: string;
  hasHebrewContent?: boolean;
  consoleErrors: string[];
}

// ============================================
// PLAYWRIGHT LINK CHECKER
// ============================================

/**
 * Check a single link using Playwright
 */
async function checkLinkWithPlaywright(
  page: Page,
  category: string,
  key: string,
  url: string,
  priority: LinkPriority
): Promise<LinkCheckResult> {
  const startTime = Date.now();
  const consoleErrors: string[] = [];

  // Listen for console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // Navigate with real browser behavior
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const responseTime = Date.now() - startTime;
    const status = response?.status() ?? null;
    const ok = status !== null && status >= 200 && status < 400;

    // Get page title
    const pageTitle = await page.title().catch(() => undefined);

    // Check for Hebrew content (simple check)
    const bodyText = await page.textContent('body').catch(() => '');
    const hasHebrewContent = /[\u0590-\u05FF]/.test(bodyText || '');

    // Wait a bit for any delayed console errors
    await page.waitForTimeout(1000);

    return {
      category,
      key,
      url,
      status,
      ok,
      priority,
      responseTime,
      pageTitle,
      hasHebrewContent,
      consoleErrors: consoleErrors.slice(0, 3), // Limit to first 3 errors
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      category,
      key,
      url,
      status: null,
      ok: false,
      error: error.message || 'Unknown error',
      priority,
      responseTime,
      consoleErrors,
    };
  }
}

/**
 * Flatten nested links object
 */
function flattenLinks(links: any): Array<{ category: string; key: string; url: string; priority: LinkPriority }> {
  const flattened: Array<{ category: string; key: string; url: string; priority: LinkPriority }> = [];

  for (const [category, categoryLinks] of Object.entries(links)) {
    for (const [key, url] of Object.entries(categoryLinks as Record<string, string>)) {
      const priorityKey = `${category}.${key}`;
      const priority = LINK_PRIORITIES[priorityKey] || LinkPriority.LOW;
      flattened.push({ category, key, url, priority });
    }
  }

  return flattened;
}

/**
 * Check all links using Playwright
 */
async function checkAllLinks(): Promise<LinkCheckResult[]> {
  const links = flattenLinks(GOVERNMENT_LINKS);
  const results: LinkCheckResult[] = [];

  console.log(`🔍 Checking ${links.length} government links with Playwright...\n`);

  // Launch browser with Israeli settings
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
    ],
  });

  const context = await browser.newContext({
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: false,
  });

  const page = await context.newPage();

  // Check links sequentially to avoid overwhelming government servers
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    console.log(`[${i + 1}/${links.length}] Checking ${link.category}.${link.key}...`);

    const result = await checkLinkWithPlaywright(
      page,
      link.category,
      link.key,
      link.url,
      link.priority
    );

    results.push(result);

    // Log result immediately
    if (result.ok) {
      console.log(`  ✅ ${result.status} (${result.responseTime}ms)${result.hasHebrewContent ? ' [Hebrew ✓]' : ''}`);
    } else {
      console.log(`  ❌ ${result.status || 'ERROR'} - ${result.error || 'Failed'}`);
    }

    // Respectful delay between requests
    await page.waitForTimeout(2000);
  }

  await browser.close();

  return results;
}

// ============================================
// REPORTING
// ============================================

/**
 * Group results by priority
 */
function groupByPriority(results: LinkCheckResult[]): Record<LinkPriority, LinkCheckResult[]> {
  return results.reduce((acc, result) => {
    if (!acc[result.priority]) {
      acc[result.priority] = [];
    }
    acc[result.priority].push(result);
    return acc;
  }, {} as Record<LinkPriority, LinkCheckResult[]>);
}

/**
 * Generate console report
 */
function generateConsoleReport(results: LinkCheckResult[]): void {
  const broken = results.filter((r) => !r.ok);
  const healthy = results.filter((r) => r.ok);

  console.log('\n' + '='.repeat(80));
  console.log('📊 PLAYWRIGHT LINK HEALTH CHECK RESULTS');
  console.log('='.repeat(80));
  console.log('');
  console.log(`✅ Healthy: ${healthy.length}`);
  console.log(`❌ Broken: ${broken.length}`);
  console.log(`📈 Total: ${results.length}`);
  console.log('');

  if (broken.length === 0) {
    console.log('🎉 All links are healthy!');
    return;
  }

  const groupedBroken = groupByPriority(broken);

  // Critical
  if (groupedBroken[LinkPriority.CRITICAL]?.length > 0) {
    console.log('🔴 CRITICAL BROKEN LINKS (User registration blocked!)');
    console.log('-'.repeat(80));
    groupedBroken[LinkPriority.CRITICAL].forEach((result) => {
      console.log(`🔴 ${result.category}.${result.key}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Status: ${result.status || 'ERROR'}`);
      if (result.error) console.log(`   Error: ${result.error}`);
      if (result.pageTitle) console.log(`   Title: ${result.pageTitle}`);
      if (result.consoleErrors.length > 0) {
        console.log(`   Console Errors: ${result.consoleErrors.join(', ')}`);
      }
      console.log('');
    });
  }

  // High
  if (groupedBroken[LinkPriority.HIGH]?.length > 0) {
    console.log('🟠 HIGH PRIORITY BROKEN LINKS (Core functionality affected)');
    console.log('-'.repeat(80));
    groupedBroken[LinkPriority.HIGH].forEach((result) => {
      console.log(`🟠 ${result.category}.${result.key}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Status: ${result.status || 'ERROR'}`);
      if (result.error) console.log(`   Error: ${result.error}`);
      console.log('');
    });
  }

  // Medium
  if (groupedBroken[LinkPriority.MEDIUM]?.length > 0) {
    console.log('🟡 MEDIUM PRIORITY BROKEN LINKS (Informational content)');
    console.log('-'.repeat(80));
    groupedBroken[LinkPriority.MEDIUM].forEach((result) => {
      console.log(`🟡 ${result.category}.${result.key}: ${result.url} (Status: ${result.status || 'ERROR'})`);
    });
    console.log('');
  }

  console.log(`📝 Report saved to: link-check-playwright-report.md`);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results: LinkCheckResult[]): string {
  const broken = results.filter((r) => !r.ok);
  const healthy = results.filter((r) => r.ok);

  if (broken.length === 0) {
    return `## ✅ All Links Healthy!\n\n**Total Links Checked:** ${results.length}\n\n**Average Response Time:** ${Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length)}ms\n\n**Auto-generated by:** Playwright Link Health Check\n**Date:** ${new Date().toISOString()}\n`;
  }

  const groupedBroken = groupByPriority(broken);

  let md = `## 🚨 Weekly Link Health Check Failed\n\n`;
  md += `**Broken Links Found:** ${broken.length}\n\n`;

  // Critical
  if (groupedBroken[LinkPriority.CRITICAL]?.length > 0) {
    md += `### 🔴 CRITICAL (${groupedBroken[LinkPriority.CRITICAL].length})\n\n`;
    md += `**Impact:** Users cannot complete registration!\n\n`;
    groupedBroken[LinkPriority.CRITICAL].forEach((result) => {
      md += `- **${result.category}.${result.key}**\n`;
      md += `  - URL: ${result.url}\n`;
      md += `  - Status: ${result.status || 'ERROR'}\n`;
      if (result.error) md += `  - Error: ${result.error}\n`;
      if (result.pageTitle) md += `  - Page Title: ${result.pageTitle}\n`;
      if (result.consoleErrors.length > 0) {
        md += `  - Console Errors: ${result.consoleErrors.join(', ')}\n`;
      }
      md += '\n';
    });
  }

  // High
  if (groupedBroken[LinkPriority.HIGH]?.length > 0) {
    md += `### 🟠 HIGH PRIORITY (${groupedBroken[LinkPriority.HIGH].length})\n\n`;
    md += `**Impact:** Core functionality affected\n\n`;
    groupedBroken[LinkPriority.HIGH].forEach((result) => {
      md += `- **${result.category}.${result.key}**\n`;
      md += `  - URL: ${result.url}\n`;
      md += `  - Status: ${result.status || 'ERROR'}\n`;
      if (result.error) md += `  - Error: ${result.error}\n`;
      md += '\n';
    });
  }

  // Medium
  if (groupedBroken[LinkPriority.MEDIUM]?.length > 0) {
    md += `### 🟡 MEDIUM PRIORITY (${groupedBroken[LinkPriority.MEDIUM].length})\n\n`;
    groupedBroken[LinkPriority.MEDIUM].forEach((result) => {
      md += `- ${result.category}.${result.key}: ${result.url} (Status: ${result.status || 'ERROR'})\n`;
    });
    md += '\n';
  }

  md += `---\n\n`;
  md += `### 🔧 Action Required\n\n`;
  md += `1. Visit gov.il and find new URLs for broken links\n`;
  md += `2. Update code in relevant files\n`;
  md += `3. Update Strapi CMS knowledge cards\n`;
  md += `4. Update documentation files\n`;
  md += `5. Test updated links manually\n`;
  md += `6. Deploy changes\n\n`;
  md += `**Auto-generated by:** Playwright Link Health Check (Real Browser)\n`;
  md += `**Date:** ${new Date().toISOString()}\n`;

  return md;
}

// ============================================
// MAIN
// ============================================

async function main() {
  try {
    const results = await checkAllLinks();

    // Generate console report
    generateConsoleReport(results);

    // Generate markdown report
    const markdownReport = generateMarkdownReport(results);
    const reportPath = join(process.cwd(), 'link-check-playwright-report.md');
    writeFileSync(reportPath, markdownReport, 'utf-8');

    // Exit with appropriate code
    const broken = results.filter((r) => !r.ok);
    if (broken.length > 0) {
      console.log(`\n❌ ${broken.length} broken link(s) found.\n`);
      process.exit(1);
    } else {
      console.log('\n✅ All links are healthy!\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
