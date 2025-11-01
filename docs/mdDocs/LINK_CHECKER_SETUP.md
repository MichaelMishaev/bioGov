# Link Checker Implementation Guide

## 📋 Overview

This guide explains how to implement and use the automated government link checker for bioGov.

---

## 🚀 Quick Start (Before Monorepo)

### **Option 1: Standalone Script (Current Setup)**

You can run the link checker RIGHT NOW before setting up the full monorepo:

```bash
cd /Users/michaelmishayev/Desktop/Projects/bioGov/docs/scripts

# Install dependencies
npm install

# Run the script
npm run check-links
```

**Expected Output:**
```
🔍 Checking 25 government links...

Progress: 10/25 links checked
Progress: 20/25 links checked
Progress: 25/25 links checked

================================================================================
📊 LINK HEALTH CHECK RESULTS
================================================================================

✅ Healthy: 23
❌ Broken: 2
📈 Total: 25

🔴 CRITICAL BROKEN LINKS (User registration blocked!)
--------------------------------------------------------------------------------
🔴 vat.exemptDealer
   URL: https://www.gov.il/he/service/request-open-exempt-dealer-via-internet
   Status: 404
   Error: Not Found

...
```

---

## 📦 Implementation in Monorepo

Once you set up Turborepo, move the script to the proper location:

### **Step 1: Create Package Structure**

```bash
# From monorepo root
mkdir -p packages/government-api/src
mkdir -p packages/government-api/scripts
```

### **Step 2: Move Script to Package**

```bash
# Copy the check-links script
cp docs/scripts/check-links.ts packages/government-api/scripts/
```

### **Step 3: Create Package Configuration**

Create `packages/government-api/package.json`:

```json
{
  "name": "@biogov/government-api",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "scripts": {
    "check-links": "tsx scripts/check-links.ts",
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest"
  },
  "dependencies": {
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "vitest": "^1.2.0"
  }
}
```

### **Step 4: Update Root package.json**

Add script to root `package.json`:

```json
{
  "scripts": {
    "check-links": "pnpm --filter=@biogov/government-api run check-links"
  }
}
```

### **Step 5: Update GitHub Actions Workflow**

The workflow `.github/workflows/link-check.yml` already references this:

```yaml
- name: Check all government links
  run: pnpm --filter=@biogov/government-api run check-links
```

**It will work automatically once you set up the monorepo!**

---

## 🔧 How to Use

### **Manual Check (Development)**

```bash
# From monorepo root
pnpm check-links

# Or from package
cd packages/government-api
pnpm check-links
```

### **Automated Check (CI/CD)**

GitHub Actions runs this automatically:
- **When:** Every Monday at 9 AM Israel time
- **How:** `.github/workflows/link-check.yml`
- **Result:** Creates GitHub issue if broken links found

### **Force Run Now**

Go to GitHub Actions → "Government Links Health Check" → "Run workflow"

---

## 📝 Adding New Links

When you add new government links to your app, update the script:

### **1. Add Link to Script**

Edit `packages/government-api/scripts/check-links.ts`:

```typescript
const GOVERNMENT_LINKS = {
  // ... existing links ...

  // NEW CATEGORY
  newCategory: {
    myNewLink: 'https://www.gov.il/he/some-new-page',
  },
};
```

### **2. Set Priority**

```typescript
const LINK_PRIORITIES: Record<string, LinkPriority> = {
  // ... existing priorities ...

  'newCategory.myNewLink': LinkPriority.HIGH, // or CRITICAL/MEDIUM/LOW
};
```

### **3. Test It**

```bash
pnpm check-links
```

---

## 📊 Understanding Output

### **Console Output**

```
🔍 Checking 25 government links...
Progress: 25/25 links checked

================================================================================
📊 LINK HEALTH CHECK RESULTS
================================================================================

✅ Healthy: 23
❌ Broken: 2
📈 Total: 25

🔴 CRITICAL BROKEN LINKS (User registration blocked!)
--------------------------------------------------------------------------------
🔴 vat.form821
   URL: https://www.gov.il/he/service/vat-821
   Status: 404
   Error: Not Found
```

**Meaning:**
- ✅ **Healthy (23)**: Links work correctly
- ❌ **Broken (2)**: Links are down or moved
- 🔴 **Critical**: Users can't complete registration
- 🟠 **High**: Core features affected
- 🟡 **Medium**: Informational content affected
- 🟢 **Low**: Optional content affected

### **GitHub Issue Created**

When broken links are found, you'll get a GitHub issue like:

```markdown
Title: 🔗 Broken Government Links Detected

## 🚨 Weekly Link Health Check Failed

**Broken Links Found:** 2

### 🔴 CRITICAL (1)

**Impact:** Users cannot complete registration!

- **vat.form821**
  - URL: https://www.gov.il/he/service/vat-821
  - Status: 404
  - Error: Not Found

### 🟠 HIGH PRIORITY (1)

**Impact:** Core functionality affected

- **nationalInsurance.integratedFlow**
  - URL: https://www.btl.gov.il/About/news/...
  - Status: 301

---

### 🔧 Action Required

1. Visit gov.il and find new URLs for broken links
2. Update code in relevant files
3. Update Strapi CMS knowledge cards
4. Update documentation files
5. Test updated links manually
6. Deploy changes

**Auto-generated by:** Weekly Link Health Check workflow
**Date:** 2025-10-30T09:00:00.000Z
```

---

## 🛠️ Customization

### **Change Check Frequency**

Edit `.github/workflows/link-check.yml`:

```yaml
on:
  schedule:
    # Every Monday at 9 AM Israel time (7 AM UTC)
    - cron: '0 7 * * 1'

    # Change to daily:
    # - cron: '0 7 * * *'

    # Change to every 3 hours:
    # - cron: '0 */3 * * *'
```

### **Change Timeout**

Edit `check-links.ts`:

```typescript
const response = await axios.head(url, {
  timeout: 15000, // 15 seconds (default)
  // Change to 30 seconds:
  // timeout: 30000,
});
```

### **Add Retry Logic**

```typescript
async function checkLinkWithRetry(
  category: string,
  key: string,
  url: string,
  priority: LinkPriority,
  maxRetries = 3
): Promise<LinkCheckResult> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await checkLink(category, key, url, priority);
      if (result.ok) return result;

      // If not ok, retry
      lastError = result;
      console.log(`  Retry ${attempt}/${maxRetries} for ${url}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    } catch (error) {
      lastError = error;
    }
  }

  return lastError;
}
```

### **Send Slack Notification**

Add to `check-links.ts`:

```typescript
async function notifySlack(brokenLinks: LinkCheckResult[]) {
  if (!process.env.SLACK_WEBHOOK_URL) return;

  const criticalLinks = brokenLinks.filter(l => l.priority === LinkPriority.CRITICAL);

  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: `🚨 ${brokenLinks.length} government links are broken!`,
    attachments: [
      {
        color: 'danger',
        title: `🔴 ${criticalLinks.length} CRITICAL links (user registration blocked)`,
        text: criticalLinks.map(l => `• ${l.url} (${l.status})`).join('\n'),
      },
    ],
  });
}

// Call in main():
if (broken.length > 0) {
  await notifySlack(broken);
}
```

Then add `SLACK_WEBHOOK_URL` to GitHub Secrets.

---

## 🧪 Testing

### **Test Single Link**

```typescript
// Add this function to check-links.ts
async function testSingleLink(url: string) {
  const result = await checkLink('test', 'test', url, LinkPriority.MEDIUM);
  console.log(result);
}

// Run: testSingleLink('https://www.gov.il/he/service/vat-821');
```

### **Test All Links Locally**

```bash
# Before committing changes
cd packages/government-api
pnpm check-links
```

### **Test GitHub Actions Workflow Locally**

Use [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Run workflow locally
act schedule -j check-links
```

---

## 🔍 Troubleshooting

### **Script Fails with "axios not found"**

```bash
# Install dependencies
cd packages/government-api
pnpm install
```

### **All Links Fail with Timeout**

**Cause:** Government websites may block automated requests.

**Solution:** Add delay between requests:

```typescript
// In checkAllLinks()
for (let i = 0; i < flatLinks.length; i += CONCURRENCY) {
  const batch = flatLinks.slice(i, i + CONCURRENCY);
  const batchResults = await Promise.all(/* ... */);
  results.push(...batchResults);

  // Add delay
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second
}
```

### **Some Links Always Fail**

**Cause:** Some government sites require cookies/sessions.

**Solution:** Use GET instead of HEAD:

```typescript
// Change axios.head to axios.get
const response = await axios.get(url, {
  timeout: 15000,
  maxRedirects: 5,
  validateStatus: () => true,
});
```

### **GitHub Actions Workflow Not Running**

**Check:**
1. Workflow file is in `.github/workflows/link-check.yml`
2. GitHub Actions are enabled (Settings → Actions)
3. Schedule syntax is correct (cron format)

**Manual trigger:**
GitHub → Actions → "Government Links Health Check" → "Run workflow"

---

## 📈 Advanced Features

### **1. Track Link Health Over Time**

Store results in Supabase:

```typescript
// Add to check-links.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key in CI
);

async function saveLinkHistory(results: LinkCheckResult[]) {
  const records = results.map(r => ({
    url: r.url,
    category: r.category,
    key: r.key,
    status: r.status,
    ok: r.ok,
    error: r.error,
    response_time: r.responseTime,
    checked_at: new Date().toISOString(),
  }));

  await supabase.from('link_health_history').insert(records);
}

// Call in main()
await saveLinkHistory(results);
```

Create table:

```sql
CREATE TABLE link_health_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  status INT,
  ok BOOLEAN NOT NULL,
  error TEXT,
  response_time INT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_link_health_url ON link_health_history(url);
CREATE INDEX idx_link_health_checked_at ON link_health_history(checked_at);
```

### **2. Auto-Update Strapi**

Mark broken links in Strapi CMS:

```typescript
import axios from 'axios';

async function updateStrapiLinkStatus(url: string, status: 'active' | 'link_broken') {
  const strapiUrl = process.env.STRAPI_URL;
  const strapiToken = process.env.STRAPI_API_TOKEN;

  // Find knowledge cards with this URL
  const response = await axios.get(`${strapiUrl}/api/knowledge-cards`, {
    params: {
      filters: { officialSource: { $eq: url } },
    },
    headers: {
      Authorization: `Bearer ${strapiToken}`,
    },
  });

  // Update each card
  for (const card of response.data.data) {
    await axios.put(
      `${strapiUrl}/api/knowledge-cards/${card.id}`,
      {
        data: {
          status,
          lastChecked: new Date().toISOString(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${strapiToken}`,
        },
      }
    );
  }
}

// Call in main() for broken links
for (const brokenLink of broken) {
  await updateStrapiLinkStatus(brokenLink.url, 'link_broken');
}
```

### **3. Generate Dashboard**

Create a simple HTML dashboard:

```typescript
function generateHTMLReport(results: LinkCheckResult[]): string {
  const healthy = results.filter(r => r.ok);
  const broken = results.filter(r => !r.ok);

  return `
<!DOCTYPE html>
<html>
<head>
  <title>bioGov Link Health Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .summary { display: flex; gap: 20px; margin-bottom: 40px; }
    .card { padding: 20px; border-radius: 8px; flex: 1; }
    .healthy { background: #d4edda; color: #155724; }
    .broken { background: #f8d7da; color: #721c24; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .critical { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <h1>bioGov Government Links Health Check</h1>
  <p>Last checked: ${new Date().toLocaleString('he-IL')}</p>

  <div class="summary">
    <div class="card healthy">
      <h2>${healthy.length}</h2>
      <p>Healthy Links</p>
    </div>
    <div class="card broken">
      <h2>${broken.length}</h2>
      <p>Broken Links</p>
    </div>
  </div>

  ${broken.length > 0 ? `
    <h2>Broken Links</h2>
    <table>
      <thead>
        <tr>
          <th>Priority</th>
          <th>Category</th>
          <th>URL</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${broken.map(r => `
          <tr class="${r.priority}">
            <td>${getPriorityEmoji(r.priority)} ${r.priority}</td>
            <td>${r.category}.${r.key}</td>
            <td><a href="${r.url}">${r.url}</a></td>
            <td>${r.status || 'ERROR'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p>✅ All links are healthy!</p>'}
</body>
</html>
  `;
}

// Save dashboard
import fs from 'fs';
const html = generateHTMLReport(results);
await fs.promises.writeFile('link-health-dashboard.html', html);
console.log('📊 Dashboard saved to: link-health-dashboard.html');
```

---

## ✅ Implementation Checklist

- [x] Script created (`docs/scripts/check-links.ts`)
- [x] Dependencies listed (`docs/scripts/package.json`)
- [x] GitHub Actions workflow created (`.github/workflows/link-check.yml`)
- [ ] Install dependencies: `cd docs/scripts && npm install`
- [ ] Test script: `npm run check-links`
- [ ] Add new links as you discover them
- [ ] Set link priorities (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] Push to GitHub
- [ ] Verify GitHub Actions runs on Monday
- [ ] Add optional features (Slack, Supabase tracking, Strapi updates)

---

## 🎉 Ready to Use!

The link checker is **ready to run right now**:

```bash
cd /Users/michaelmishayev/Desktop/Projects/bioGov/docs/scripts
npm install
npm run check-links
```

Once you push to GitHub, it will run automatically every Monday! 🚀
