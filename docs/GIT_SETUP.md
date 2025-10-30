# Git Repository Setup Guide

## 🚀 Quick Setup (Connect to GitHub)

You have a GitHub repository ready: `git@github.com:MichaelMishaev/bioGov.git`

### Step 1: Initialize Git Repository

```bash
cd /Users/michaelmishayev/Desktop/Projects/bioGov

# Initialize git
git init

# Add all files
git add .

# Initial commit
git commit -m "chore: initial commit - project setup with Turborepo + Supabase + Redis"
```

### Step 2: Connect to GitHub

```bash
# Add remote
git remote add origin git@github.com:MichaelMishaev/bioGov.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 📋 Git Configuration Best Practices

### **Create .gitignore**

Already recommended in your `.gitignore`:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output
*.lcov

# Build outputs
.next/
out/
build/
dist/
.turbo/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor directories
.vscode/
.idea/
*.swp
*.swo
*.swn
*~

# OS files
.DS_Store
Thumbs.db

# Vercel
.vercel/

# Supabase
.supabase/

# Docker
docker-compose.override.yml

# Temporary files
*.tmp
*.temp
.cache/

# Strapi
apps/strapi/.tmp/
apps/strapi/public/uploads/
apps/strapi/build/
apps/strapi/.cache/

# TypeScript
*.tsbuildinfo
next-env.d.ts
