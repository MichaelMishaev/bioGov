# Railway Environment Variables Setup

## Required Environment Variables

After your Railway deployment succeeds, add these environment variables to your Next.js service:

### 1. Generate Secrets (Run locally first)

```bash
# Generate ACCESS_TOKEN_SECRET (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate REFRESH_TOKEN_SECRET (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Add to Railway

Go to your Next.js service → **Variables** tab → Add the following:

```bash
# Database (copy from your PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Auth Secrets (paste generated values from above)
ACCESS_TOKEN_SECRET=<paste_first_generated_value>
REFRESH_TOKEN_SECRET=<paste_second_generated_value>

# Environment
NODE_ENV=production

# Site URL (will be your Railway-generated URL)
NEXT_PUBLIC_SITE_URL=https://your-app-name.up.railway.app
```

### 3. After Adding Variables

Railway will automatically redeploy your app with the new environment variables.

### 4. Test Your Deployment

Once deployed, visit: `https://your-app-name.up.railway.app`

You should see your bioGov landing page!

---

## Current Status

**Right now:** Railway is building your app after we pushed the code to GitHub.

**Wait for:** Build to complete successfully (check Deployments tab)

**Then:** Add environment variables above and redeploy

**Finally:** Test the live site!
