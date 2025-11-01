# Playwright MCP Integration

## Overview

bioGov uses **Playwright Model Context Protocol (MCP)** server to enable AI-powered browser automation for:
- Testing government website integrations
- Validating deep-link flows
- Checking Hebrew RTL layout
- Verifying IS-5568 accessibility compliance
- Monitoring government service changes

## What is Playwright MCP?

Playwright MCP is a Model Context Protocol server that provides browser automation capabilities using Playwright. Unlike screenshot-based approaches, it uses **accessibility trees** for fast, deterministic, and LLM-friendly automation.

### Key Advantages

- **No Vision Models Required**: Works with structured accessibility data
- **Fast & Lightweight**: No screenshot processing overhead
- **Deterministic**: Clear, unambiguous tool application
- **Israeli Government-Optimized**: Configured for Hebrew RTL, Israel timezone, and gov.il domains

---

## Installation

### For Claude Code (Recommended)

```bash
# Add Playwright MCP server to Claude Code
claude mcp add playwright npx @playwright/mcp@latest
```

### For Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### For VS Code with GitHub Copilot

1. Install MCP extension
2. Add to `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser", "chromium"]
    }
  }
}
```

### For Cursor IDE

1. Go to **Cursor Settings** → **MCP**
2. Click **Add new MCP Server**
3. Name: `playwright`
4. Command: `npx @playwright/mcp@latest`

---

## Configuration

bioGov includes two configuration files:

### 1. `.claude/mcp-config.json` (Claude Code)

Basic MCP server configuration for Claude Code:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser", "chromium",
        "--headless",
        "--viewport-size", "1920x1080",
        "--user-data-dir", ".playwright-mcp-profile"
      ]
    }
  }
}
```

### 2. `playwright-mcp.config.json` (Advanced)

Israeli-optimized configuration with:
- Hebrew locale (`he-IL`)
- Israel timezone (`Asia/Jerusalem`)
- Tel Aviv geolocation (32.0853°N, 34.7818°E)
- Government domain allowlist (`*.gov.il`, `*.btl.gov.il`)
- Ad/analytics blocklist
- Anti-bot detection headers

---

## Available Tools

When Playwright MCP is active, you have access to these tools:

### Navigation
- `browser_navigate` - Navigate to URL
- `browser_go_back` - Go back in history
- `browser_go_forward` - Go forward in history

### Interaction
- `browser_click` - Click elements (with modifiers: shift, ctrl, meta)
- `browser_type` - Type text into inputs
- `browser_press` - Press keyboard keys
- `browser_select` - Select dropdown options
- `browser_check` - Check checkboxes
- `browser_uncheck` - Uncheck checkboxes
- `browser_upload` - Upload files

### Inspection
- `browser_snapshot` - Get accessibility tree snapshot
- `browser_console_messages` - Retrieve console logs
- `browser_evaluate` - Execute JavaScript

### Management
- `browser_close` - Close browser page
- `browser_screenshot` - Capture screenshots (if vision enabled)
- `browser_pdf` - Generate PDF

---

## Usage Examples

### Example 1: Test VAT Form 821 Deep-Link

```typescript
// Ask Claude Code:
"Use Playwright MCP to navigate to the VAT Form 821 page and verify:
1. The page loads without errors
2. Hebrew text is displayed correctly (RTL)
3. The form is accessible (screen reader friendly)
4. All required fields are present"

// Claude will use browser_navigate, browser_snapshot, browser_console_messages
```

### Example 2: Monitor Government Link Health

```typescript
// Ask Claude Code:
"Use Playwright MCP to check all links in check-links.ts and verify:
1. Pages load successfully (200 status)
2. No 403/404 errors
3. Hebrew content is visible
4. No JavaScript errors in console"
```

### Example 3: Test Hebrew RTL Layout

```typescript
// Ask Claude Code:
"Navigate to our PWA demo and verify:
1. Text aligns to the right for Hebrew
2. Form inputs show placeholder on right
3. Buttons are in correct RTL order
4. Date pickers work with Hebrew calendar"
```

### Example 4: Accessibility Audit (IS-5568)

```typescript
// Ask Claude Code:
"Use Playwright MCP to audit our app for IS-5568 compliance:
1. Check all interactive elements have ARIA labels
2. Verify keyboard navigation works
3. Test focus states are visible
4. Ensure color contrast meets WCAG AA"
```

---

## Israeli Government Testing

### Testing MyGov SSO Flow

```bash
# Ask Claude Code:
"Use Playwright MCP to test MyGov authentication:
1. Navigate to https://my.gov.il/
2. Check if SSO login form appears
3. Verify Hebrew interface
4. Test redirect to our app (mock flow)"
```

### Testing Tax Authority Pages

```bash
# Ask Claude Code:
"Use Playwright MCP to validate Tax Authority links:
1. Form 821 (VAT authorized dealer)
2. Exempt dealer application
3. Verify all forms are in Hebrew
4. Check for accessibility issues"
```

### Testing National Insurance Portal

```bash
# Ask Claude Code:
"Navigate to National Insurance self-employed registration:
1. Check page loads without 403 errors
2. Verify Hebrew forms are readable
3. Test that required fields are marked
4. Check console for JavaScript errors"
```

---

## Configuration Details

### Browser Launch Options

```json
{
  "browserLaunchOptions": {
    "headless": true,
    "args": [
      "--disable-blink-features=AutomationControlled",  // Bypass bot detection
      "--disable-dev-shm-usage",                        // Docker compatibility
      "--no-sandbox"                                    // CI/CD compatibility
    ]
  }
}
```

### Browser Context Options (Israeli Settings)

```json
{
  "browserContextOptions": {
    "locale": "he-IL",                    // Hebrew locale
    "timezoneId": "Asia/Jerusalem",       // Israel timezone
    "geolocation": {
      "longitude": 34.7818,               // Tel Aviv coordinates
      "latitude": 32.0853
    },
    "permissions": [
      "clipboard-read",
      "clipboard-write"
    ]
  }
}
```

### Network Rules

**Block tracking/analytics**:
```json
{
  "blockPatterns": [
    "**/analytics.google.com/**",
    "**/doubleclick.net/**",
    "**/facebook.com/tr/**"
  ]
}
```

**Allow government domains**:
```json
{
  "allowPatterns": [
    "**/*.gov.il/**",
    "**/*.btl.gov.il/**",
    "**/*.data.gov.il/**"
  ]
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

Add Playwright MCP to your CI pipeline:

```yaml
name: E2E Tests with Playwright MCP

on:
  pull_request:
  schedule:
    - cron: '0 2 * * *'  # Daily at 4 AM Israel time

jobs:
  e2e-mcp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Playwright MCP
        run: npx playwright install chromium

      - name: Run MCP E2E Tests
        run: |
          # Claude Code can generate tests using MCP
          npx @playwright/mcp@latest --config playwright-mcp.config.json
```

---

## Troubleshooting

### Issue: 403 Errors on gov.il Sites

**Problem**: Government sites block automated requests.

**Solution**:
1. Use realistic `userAgent` (already configured)
2. Add delays between requests:
   ```typescript
   await page.waitForTimeout(2000);
   ```
3. Disable headless mode for local testing:
   ```json
   {
     "browserLaunchOptions": {
       "headless": false
     }
   }
   ```

### Issue: Hebrew Text Not Displaying

**Problem**: Missing Hebrew font support.

**Solution**:
1. Install Hebrew fonts on CI:
   ```yaml
   - name: Install Hebrew fonts
     run: sudo apt-get install fonts-noto-core fonts-dejavu-core
   ```

### Issue: Timeout on MyGov

**Problem**: MyGov has strict rate limiting.

**Solution**:
1. Increase timeout in config:
   ```json
   {
     "browserContextOptions": {
       "navigationTimeout": 60000
     }
   }
   ```
2. Add retry logic
3. Use persistent profile to avoid re-authentication

### Issue: MCP Server Not Found

**Problem**: `npx` cannot find `@playwright/mcp`.

**Solution**:
```bash
# Clear npx cache
npx clear-npx-cache

# Install globally
npm install -g @playwright/mcp

# Use explicit version
npx @playwright/mcp@0.0.44
```

---

## Best Practices

### 1. Use Persistent Profiles for Government Sites

Avoid repeated logins by persisting authentication:

```bash
# Run with persistent profile
npx @playwright/mcp@latest --user-data-dir .playwright-mcp-profile
```

Location:
- Windows: `%USERPROFILE%\AppData\Local\ms-playwright\mcp-chromium-profile`
- macOS: `~/Library/Caches/ms-playwright/mcp-chromium-profile`
- Linux: `~/.cache/ms-playwright/mcp-chromium-profile`

### 2. Test Hebrew RTL Layout First

Always validate RTL before LTR:

```typescript
// Good: Test Hebrew first
1. Navigate to page with locale=he-IL
2. Verify RTL alignment
3. Switch to English
4. Verify LTR alignment

// Bad: Test English only
```

### 3. Check Accessibility Tree

Use `browser_snapshot` to verify accessibility:

```typescript
// Ask Claude Code:
"Use browser_snapshot to verify all buttons have aria-labels in Hebrew"
```

### 4. Monitor Console Errors

Always check for JavaScript errors:

```typescript
// Ask Claude Code:
"After navigating, use browser_console_messages to check for errors"
```

### 5. Respect Rate Limits

Add delays for government sites:

```typescript
// Good: Respectful testing
await page.goto('https://www.gov.il/...');
await page.waitForTimeout(3000);

// Bad: Rapid requests (may get blocked)
await page.goto('https://www.gov.il/...');
await page.goto('https://www.gov.il/...');
await page.goto('https://www.gov.il/...');
```

---

## Resources

- **Official Docs**: https://github.com/microsoft/playwright-mcp
- **MCP Documentation**: https://modelcontextprotocol.io
- **Playwright Docs**: https://playwright.dev
- **IS-5568 Accessibility**: https://www.gov.il/en/Departments/Guides/website_accessibility

---

## Next Steps

1. **Test Local Setup**:
   ```bash
   # Verify Playwright MCP works
   npx @playwright/mcp@latest --version
   ```

2. **Test Government Links**:
   ```bash
   # Ask Claude Code to use MCP to check link-check.ts URLs
   "Use Playwright MCP to verify all government links work"
   ```

3. **Add to CI/CD**:
   - Update `.github/workflows/e2e-tests.yml`
   - Add Playwright MCP job
   - Configure Hebrew fonts

4. **Create Test Suite**:
   - VAT Form 821 flow
   - NI self-employed registration
   - Business licensing eligibility
   - Hebrew RTL layouts
   - IS-5568 accessibility

---

**Last Updated**: 2025-10-30
**Playwright MCP Version**: 0.0.44
**Maintained By**: bioGov Development Team
