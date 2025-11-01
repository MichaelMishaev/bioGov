/**
 * Government Links Health Checker
 *
 * This script checks all government links (gov.il, btl.gov.il, data.gov.il)
 * for availability and reports broken links.
 *
 * Usage:
 *   pnpm tsx docs/scripts/check-links.ts
 *
 * Exit codes:
 *   0 - All links healthy
 *   1 - Broken links found
 */

import axios from 'axios';

// ============================================
// CONFIGURATION
// ============================================

/**
 * All government links used in bioGov
 *
 * Add new links here as you discover them in your app
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
  responseTime?: number;
}

// ============================================
// LINK CHECKER
// ============================================

/**
 * Check a single link's health
 */
async function checkLink(
  category: string,
  key: string,
  url: string,
  priority: LinkPriority
): Promise<LinkCheckResult> {
  const startTime = Date.now();

  try {
    const response = await axios.head(url, {
      timeout: 15000, // 15 seconds
      maxRedirects: 5,
      validateStatus: () => true, // Don't throw on 4xx/5xx
      headers: {
        'User-Agent': 'bioGov-LinkChecker/1.0',
      },
    });

    const responseTime = Date.now() - startTime;

    // Consider 200-399 as OK (includes redirects)
    const ok = response.status >= 200 && response.status < 400;

    return {
      category,
      key,
      url,
      status: response.status,
      ok,
      priority,
      responseTime,
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
    };
  }
}

/**
 * Flatten nested links object into array
 */
function flattenLinks(links: any, parentKey = ''): Array<{ category: string; key: string; url: string; priority: LinkPriority }> {
  const result: Array<{ category: string; key: string; url: string; priority: LinkPriority }> = [];

  for (const [key, value] of Object.entries(links)) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === 'string') {
      // It's a URL
      const priority = LINK_PRIORITIES[fullKey] || LinkPriority.MEDIUM;
      result.push({ category: parentKey, key, url: value, priority });
    } else if (typeof value === 'object' && value !== null) {
      // It's a nested object
      result.push(...flattenLinks(value, fullKey));
    }
  }

  return result;
}

/**
 * Check all government links
 */
async function checkAllLinks(): Promise<LinkCheckResult[]> {
  const flatLinks = flattenLinks(GOVERNMENT_LINKS);

  console.log(`🔍 Checking ${flatLinks.length} government links...\n`);

  // Check all links in parallel (with concurrency limit)
  const CONCURRENCY = 10; // Check 10 links at a time
  const results: LinkCheckResult[] = [];

  for (let i = 0; i < flatLinks.length; i += CONCURRENCY) {
    const batch = flatLinks.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(({ category, key, url, priority }) =>
        checkLink(category, key, url, priority)
      )
    );
    results.push(...batchResults);

    // Show progress
    console.log(`Progress: ${Math.min(i + CONCURRENCY, flatLinks.length)}/${flatLinks.length} links checked`);
  }

  return results;
}

// ============================================
// REPORTING
// ============================================

/**
 * Get emoji for priority
 */
function getPriorityEmoji(priority: LinkPriority): string {
  switch (priority) {
    case LinkPriority.CRITICAL:
      return '🔴';
    case LinkPriority.HIGH:
      return '🟠';
    case LinkPriority.MEDIUM:
      return '🟡';
    case LinkPriority.LOW:
      return '🟢';
    default:
      return '⚪';
  }
}

/**
 * Format results for console output
 */
function formatResults(results: LinkCheckResult[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 LINK HEALTH CHECK RESULTS');
  console.log('='.repeat(80) + '\n');

  const healthy = results.filter(r => r.ok);
  const broken = results.filter(r => !r.ok);

  // Summary
  console.log(`✅ Healthy: ${healthy.length}`);
  console.log(`❌ Broken: ${broken.length}`);
  console.log(`📈 Total: ${results.length}\n`);

  if (broken.length === 0) {
    console.log('🎉 All government links are healthy!\n');
    return;
  }

  // Group broken links by priority
  const brokenByCritical = broken.filter(r => r.priority === LinkPriority.CRITICAL);
  const brokenByHigh = broken.filter(r => r.priority === LinkPriority.HIGH);
  const brokenByMedium = broken.filter(r => r.priority === LinkPriority.MEDIUM);
  const brokenByLow = broken.filter(r => r.priority === LinkPriority.LOW);

  // Report broken links by priority
  if (brokenByCritical.length > 0) {
    console.log('🔴 CRITICAL BROKEN LINKS (User registration blocked!)');
    console.log('-'.repeat(80));
    brokenByCritical.forEach(printBrokenLink);
    console.log('');
  }

  if (brokenByHigh.length > 0) {
    console.log('🟠 HIGH PRIORITY BROKEN LINKS (Core functionality affected)');
    console.log('-'.repeat(80));
    brokenByHigh.forEach(printBrokenLink);
    console.log('');
  }

  if (brokenByMedium.length > 0) {
    console.log('🟡 MEDIUM PRIORITY BROKEN LINKS (Informational content)');
    console.log('-'.repeat(80));
    brokenByMedium.forEach(printBrokenLink);
    console.log('');
  }

  if (brokenByLow.length > 0) {
    console.log('🟢 LOW PRIORITY BROKEN LINKS (Optional content)');
    console.log('-'.repeat(80));
    brokenByLow.forEach(printBrokenLink);
    console.log('');
  }
}

/**
 * Print a single broken link
 */
function printBrokenLink(result: LinkCheckResult): void {
  console.log(`${getPriorityEmoji(result.priority)} ${result.category}.${result.key}`);
  console.log(`   URL: ${result.url}`);
  console.log(`   Status: ${result.status || 'TIMEOUT/ERROR'}`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
  console.log('');
}

/**
 * Generate markdown report for GitHub issue
 */
function generateMarkdownReport(results: LinkCheckResult[]): string {
  const broken = results.filter(r => !r.ok);

  if (broken.length === 0) {
    return 'All government links are healthy! ✅';
  }

  let markdown = `## 🚨 Weekly Link Health Check Failed\n\n`;
  markdown += `**Broken Links Found:** ${broken.length}\n\n`;

  // Group by priority
  const byCritical = broken.filter(r => r.priority === LinkPriority.CRITICAL);
  const byHigh = broken.filter(r => r.priority === LinkPriority.HIGH);
  const byMedium = broken.filter(r => r.priority === LinkPriority.MEDIUM);
  const byLow = broken.filter(r => r.priority === LinkPriority.LOW);

  if (byCritical.length > 0) {
    markdown += `### 🔴 CRITICAL (${byCritical.length})\n\n`;
    markdown += `**Impact:** Users cannot complete registration!\n\n`;
    byCritical.forEach(r => {
      markdown += `- **${r.category}.${r.key}**\n`;
      markdown += `  - URL: ${r.url}\n`;
      markdown += `  - Status: ${r.status || 'TIMEOUT/ERROR'}\n`;
      if (r.error) markdown += `  - Error: ${r.error}\n`;
      markdown += `\n`;
    });
  }

  if (byHigh.length > 0) {
    markdown += `### 🟠 HIGH PRIORITY (${byHigh.length})\n\n`;
    markdown += `**Impact:** Core functionality affected\n\n`;
    byHigh.forEach(r => {
      markdown += `- **${r.category}.${r.key}**\n`;
      markdown += `  - URL: ${r.url}\n`;
      markdown += `  - Status: ${r.status || 'TIMEOUT/ERROR'}\n`;
      markdown += `\n`;
    });
  }

  if (byMedium.length > 0) {
    markdown += `### 🟡 MEDIUM PRIORITY (${byMedium.length})\n\n`;
    byMedium.forEach(r => {
      markdown += `- ${r.category}.${r.key}: ${r.url} (Status: ${r.status || 'ERROR'})\n`;
    });
    markdown += `\n`;
  }

  if (byLow.length > 0) {
    markdown += `### 🟢 LOW PRIORITY (${byLow.length})\n\n`;
    byLow.forEach(r => {
      markdown += `- ${r.category}.${r.key}: ${r.url} (Status: ${r.status || 'ERROR'})\n`;
    });
    markdown += `\n`;
  }

  markdown += `---\n\n`;
  markdown += `### 🔧 Action Required\n\n`;
  markdown += `1. Visit gov.il and find new URLs for broken links\n`;
  markdown += `2. Update code in relevant files\n`;
  markdown += `3. Update Strapi CMS knowledge cards\n`;
  markdown += `4. Update documentation files\n`;
  markdown += `5. Test updated links manually\n`;
  markdown += `6. Deploy changes\n\n`;
  markdown += `**Auto-generated by:** Weekly Link Health Check workflow\n`;
  markdown += `**Date:** ${new Date().toISOString()}\n`;

  return markdown;
}

// ============================================
// MAIN
// ============================================

async function main() {
  try {
    const results = await checkAllLinks();
    formatResults(results);

    const broken = results.filter(r => !r.ok);

    // Save markdown report to file (for GitHub Actions to use)
    const report = generateMarkdownReport(results);
    const fs = await import('fs');
    await fs.promises.writeFile('link-check-report.md', report);
    console.log('📝 Report saved to: link-check-report.md\n');

    // Exit with error code if any links are broken
    if (broken.length > 0) {
      console.error(`\n❌ ${broken.length} broken link(s) found.\n`);
      process.exit(1);
    } else {
      console.log('\n✅ All links healthy. Exiting successfully.\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();
