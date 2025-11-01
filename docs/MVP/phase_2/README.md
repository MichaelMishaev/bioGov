# Phase 2: Authentication System - Quick Start

## Overview

This folder contains the complete implementation guide for building a custom authentication system for bioGov using **Railway PostgreSQL** and **Next.js**.

---

## Files in This Guide

| File | Description | Time to Complete |
|------|-------------|------------------|
| `RAILWAY_AUTH_IMPLEMENTATION.md` | Railway setup + database schema + auth logic | Days 1-3 (13 hours) |
| `RAILWAY_AUTH_IMPLEMENTATION_PART2.md` | Middleware, protected routes, email verification | Days 4-5 (11 hours) |
| `RAILWAY_AUTH_IMPLEMENTATION_PART3.md` | UI components, testing, deployment | Days 6-7 (13 hours) |

**Total Estimated Time:** 7 days (~37 hours of active work)

---

## Quick Navigation

### 🚀 Getting Started (Day 1)
Start here: [`RAILWAY_AUTH_IMPLEMENTATION.md`](./RAILWAY_AUTH_IMPLEMENTATION.md)
- Railway account setup
- PostgreSQL database creation
- Migration from Neon to Railway
- Auth schema design

### 🔐 Core Auth System (Days 2-5)
Continue with:
- Part 1: Signup/Login API endpoints
- Part 2: [`RAILWAY_AUTH_IMPLEMENTATION_PART2.md`](./RAILWAY_AUTH_IMPLEMENTATION_PART2.md)
  - Middleware for protected routes
  - Token refresh logic
  - Email verification
  - Password reset

### 🎨 Frontend & Launch (Days 6-7)
Finish with: [`RAILWAY_AUTH_IMPLEMENTATION_PART3.md`](./RAILWAY_AUTH_IMPLEMENTATION_PART3.md)
- React components (login/signup forms)
- Auth context provider
- Protected dashboard
- Testing checklist
- Production deployment

---

## What You'll Build

### Features
✅ Secure signup/login (email + password)
✅ JWT token authentication (access + refresh)
✅ Email verification
✅ Password reset
✅ Protected routes (middleware)
✅ Session management
✅ Account lockout (brute-force protection)
✅ Audit logging
✅ Israeli Privacy Law compliance

### Tech Stack
- **Database:** Railway PostgreSQL
- **Backend:** Next.js API Routes
- **Auth:** Custom JWT (bcrypt + jsonwebtoken)
- **Frontend:** React + TypeScript
- **Deployment:** Railway (all-in-one)

---

## Prerequisites

Before starting, ensure you have:
- ✅ Existing bioGov codebase
- ✅ GitHub account (for Railway)
- ✅ Credit card (Railway requires it, but $5 free credit = ~2 weeks free)
- ✅ Node.js 18+ installed locally

---

## Cost Breakdown

| Phase | Service | Monthly Cost |
|-------|---------|--------------|
| Development | Railway (free $5 credit) | **$0** for ~2 weeks |
| Production | Railway PostgreSQL | ~$5 |
| Production | Railway App Hosting | ~$5 |
| **Total Production Cost** | | **~$10/month** |

**Note:** Can scale to 1,000 users before needing to upgrade.

---

## Implementation Checklist

### Day 1: Setup ✅
- [ ] Create Railway account
- [ ] Deploy PostgreSQL database
- [ ] Migrate existing data from Neon
- [ ] Run auth migration (add sessions, verifications tables)
- [ ] Test database connection

### Days 2-3: Backend Auth ✅
- [ ] Install dependencies (bcrypt, jsonwebtoken)
- [ ] Create auth utility functions
- [ ] Build signup endpoint
- [ ] Build login endpoint
- [ ] Test with Postman/curl

### Days 4-5: Advanced Features ✅
- [ ] Create auth middleware
- [ ] Build logout endpoint
- [ ] Build token refresh endpoint
- [ ] Build email verification endpoint
- [ ] Build password reset endpoints

### Days 6-7: Frontend & Deploy ✅
- [ ] Create Auth context
- [ ] Build login page
- [ ] Build signup page
- [ ] Build protected dashboard
- [ ] Manual testing (all flows)
- [ ] Deploy to Railway production
- [ ] Test on production URL

---

## Quick Commands Reference

```bash
# Start development
cd /Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui
npm run dev

# Connect to Railway database
psql $DATABASE_URL

# Run migration
psql $DATABASE_URL < supabase/migrations/002_custom_auth.sql

# Check active sessions
psql $DATABASE_URL -c "SELECT * FROM auth.sessions ORDER BY created_at DESC;"

# Test signup API
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123","name":"Test User","consentGiven":true}'

# Test login API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'
```

---

## Troubleshooting

### Issue: "Cannot connect to Railway database"
**Solution:** Check DATABASE_URL in `.env.local` matches Railway connection string.

### Issue: "JWT token invalid"
**Solution:** Verify ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are set in environment variables.

### Issue: "Cookies not set in browser"
**Solution:** In production, ensure `secure: true` is only set when using HTTPS.

### Issue: "RLS policies not working"
**Solution:** Check that middleware sets `app.user_id` session variable:
```typescript
await db.query('SET app.user_id = $1', [userId]);
```

---

## Next Steps After Auth

Once authentication is complete, you can:
1. **Build the compliance calendar** (using authenticated user sessions)
2. **Add email reminders** (integrate with Resend.com)
3. **Create user profile page** (update name, change password)
4. **Implement task management** (VAT deadlines, tax filing reminders)

---

## Support

If you get stuck:
1. Check the specific error in the implementation file
2. Search the troubleshooting section in Part 3
3. Verify database schema is correct (run verification queries)
4. Check Railway logs for backend errors

---

## Timeline Estimate

**Realistic Schedule:**
- **Week 1 (Days 1-3):** Setup + Backend Auth = 13 hours
- **Week 2 (Days 4-5):** Middleware + Email Verification = 11 hours
- **Week 2 (Days 6-7):** Frontend + Testing + Deploy = 13 hours

**Total:** ~37 hours of focused work over 7 days

**Aggressive Schedule (if experienced):**
- Can compress to 4-5 days by working longer hours
- Skip email verification initially (add later)

---

## Files Summary

```
phase_2/
├── README.md                              ← You are here
├── RAILWAY_AUTH_IMPLEMENTATION.md         ← Start here (Part 1)
├── RAILWAY_AUTH_IMPLEMENTATION_PART2.md   ← Middleware & verification (Part 2)
└── RAILWAY_AUTH_IMPLEMENTATION_PART3.md   ← UI & deployment (Part 3)
```

---

## Ready to Start?

👉 **Begin with:** [`RAILWAY_AUTH_IMPLEMENTATION.md`](./RAILWAY_AUTH_IMPLEMENTATION.md)

Follow the guide step-by-step. Each phase has detailed code examples, SQL queries, and testing instructions.

**Good luck building your auth system!** 🚀
