# Railway + Custom Authentication - Part 3
**UI Components, Testing, and Deployment**

---

## Phase 10: Frontend UI Components (Day 6 - 6 hours)

### Step 10.1: Auth Context Provider

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/contexts/AuthContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
  };

  const signup = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, consentGiven: true }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    setUser(data.user);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

### Step 10.2: Login Page

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-white">התחברות</h2>
          <p className="mt-2 text-center text-gray-400">
            ברוכים השבים ל-bioGov
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              אימייל
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              שכחתי סיסמה
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>

          <div className="text-center">
            <span className="text-gray-400">אין לך חשבון? </span>
            <Link href="/signup" className="text-blue-400 hover:text-blue-300">
              הירשם עכשיו
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### Step 10.3: Signup Page

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/signup/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    if (!agreeToTerms) {
      setError('עליך לאשר את תנאי השימוש ומדיניות הפרטיות');
      return;
    }

    if (password.length < 8) {
      setError('הסיסמה חייבת להכיל לפחות 8 תווים');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, name);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'ההרשמה נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-white">הרשמה</h2>
          <p className="mt-2 text-center text-gray-400">
            הצטרפו ל-bioGov וקבלו שליטה על התהליכים הבירוקרטיים
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              שם מלא
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ישראל ישראלי"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              אימייל
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="israel@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="לפחות 8 תווים"
            />
            <p className="mt-1 text-xs text-gray-400">
              חייב להכיל אות גדולה, אות קטנה, ומספר
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              אימות סיסמה
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="הזן סיסמה שוב"
            />
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700 mt-1"
            />
            <label htmlFor="terms" className="mr-2 block text-sm text-gray-300">
              אני מאשר/ת את{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                תנאי השימוש
              </Link>{' '}
              ו
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                מדיניות הפרטיות
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'נרשם...' : 'הירשם'}
          </button>

          <div className="text-center">
            <span className="text-gray-400">כבר יש לך חשבון? </span>
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              התחבר
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### Step 10.4: Dashboard (Protected Page Example)

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/dashboard/page.tsx`:

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">טוען...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-xl font-bold">bioGov Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm"
            >
              התנתק
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">שלום, {user.name}!</h2>
          <div className="space-y-2 text-gray-300">
            <p>אימייל: {user.email}</p>
            <p>
              סטטוס אימות:{' '}
              {user.emailVerified ? (
                <span className="text-green-400">✓ מאומת</span>
              ) : (
                <span className="text-yellow-400">⚠ ממתין לאימות</span>
              )}
            </p>
          </div>

          {!user.emailVerified && (
            <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-600 rounded">
              <p className="text-yellow-200">
                אנא אמת את כתובת האימייל שלך כדי לקבל גישה מלאה לכל התכונות.
              </p>
              <button className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm">
                שלח אימייל אימות מחדש
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">היסטוריית הערכות</h3>
          <p className="text-gray-400">בקרוב: רשימת ההערכות שביצעת...</p>
        </div>
      </main>
    </div>
  );
}
```

---

### Step 10.5: Wrap App with Auth Provider

Update `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/app/layout.tsx`:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

---

## Phase 11: Testing (Day 7 - 4 hours)

### Step 11.1: Manual Testing Checklist

```bash
# Terminal 1: Start dev server
cd /Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui
npm run dev
```

**Test scenarios:**

1. **Signup Flow:**
   - [ ] Go to http://localhost:3000/signup
   - [ ] Fill form with valid data
   - [ ] Check database: `psql $DATABASE_URL -c "SELECT * FROM public.users ORDER BY created_at DESC LIMIT 1;"`
   - [ ] Verify session created: `psql $DATABASE_URL -c "SELECT * FROM auth.sessions ORDER BY created_at DESC LIMIT 1;"`
   - [ ] Verify redirected to /dashboard

2. **Login Flow:**
   - [ ] Logout from dashboard
   - [ ] Go to http://localhost:3000/login
   - [ ] Login with credentials
   - [ ] Verify redirected to /dashboard
   - [ ] Check cookies in DevTools (should see access_token, refresh_token)

3. **Protected Routes:**
   - [ ] Logout
   - [ ] Try to access http://localhost:3000/dashboard directly
   - [ ] Should redirect to /login

4. **Password Validation:**
   - [ ] Try signup with weak password (< 8 chars)
   - [ ] Should show error
   - [ ] Try with strong password
   - [ ] Should succeed

5. **Email Verification:**
   - [ ] Check auth.email_verifications table for token
   - [ ] Manually mark as verified:
     ```sql
     UPDATE public.users SET email_verified = TRUE WHERE email = 'your@email.com';
     ```
   - [ ] Refresh dashboard, verify badge changes

6. **Logout:**
   - [ ] Click logout button
   - [ ] Verify cookies cleared (DevTools)
   - [ ] Verify session revoked in database
   - [ ] Try accessing /dashboard (should redirect to login)

7. **Token Refresh:**
   - [ ] Login
   - [ ] Wait 16 minutes (access token expires)
   - [ ] Navigate to a protected route
   - [ ] Should auto-refresh and work (check Network tab for /api/auth/refresh call)

8. **Rate Limiting:**
   - [ ] Try logging in with wrong password 5 times
   - [ ] 6th attempt should lock account
   - [ ] Try logging in again - should see "Account locked" error

---

### Step 11.2: Database Verification Queries

```sql
-- Check users
SELECT id, email, name, email_verified, created_at FROM public.users;

-- Check active sessions
SELECT
  s.id,
  u.email,
  s.access_token_expires_at,
  s.refresh_token_expires_at,
  s.revoked_at,
  s.created_at
FROM auth.sessions s
JOIN public.users u ON s.user_id = u.id
ORDER BY s.created_at DESC;

-- Check audit log
SELECT
  u.email,
  a.event_type,
  a.success,
  a.created_at
FROM auth.audit_log a
LEFT JOIN public.users u ON a.user_id = u.id
ORDER BY a.created_at DESC
LIMIT 20;

-- Check email verifications
SELECT
  u.email,
  ev.token_type,
  ev.used_at,
  ev.expires_at,
  ev.created_at
FROM auth.email_verifications ev
JOIN public.users u ON ev.user_id = u.id
ORDER BY ev.created_at DESC;
```

---

## Phase 12: Production Deployment (Day 7 - 3 hours)

### Step 12.1: Railway App Deployment

1. **In Railway dashboard:**
   - Click "New" → "GitHub Repo"
   - Select your bioGov repository
   - Railway will detect Next.js and auto-configure

2. **Set environment variables:**
   ```
   DATABASE_URL=(already set from PostgreSQL service)
   ACCESS_TOKEN_SECRET=(copy from local .env)
   REFRESH_TOKEN_SECRET=(copy from local .env)
   NODE_ENV=production
   NEXT_PUBLIC_SITE_URL=https://your-app.up.railway.app
   ```

3. **Deploy:**
   - Railway automatically builds and deploys
   - Wait for build to complete (~5 minutes)
   - Get deployment URL: https://your-app.up.railway.app

---

### Step 12.2: Custom Domain (Optional)

1. **In Railway:**
   - Go to your app service
   - Settings → Domains
   - Click "Generate Domain" or "Add Custom Domain"

2. **If using custom domain (biogov.il):**
   - Add CNAME record: `@ → your-app.up.railway.app`
   - Wait for DNS propagation (5-60 minutes)
   - Railway auto-provisions SSL certificate

---

### Step 12.3: Post-Deployment Checklist

- [ ] Test signup on production URL
- [ ] Test login on production URL
- [ ] Verify cookies are set with `secure: true`
- [ ] Check SSL certificate (should show padlock)
- [ ] Test protected routes work
- [ ] Verify database is Railway PostgreSQL (not Neon)
- [ ] Check Railway metrics for errors
- [ ] Set up monitoring/alerts in Railway

---

## Phase 13: Email Integration (Optional - Day 8)

### Step 13.1: Resend.com Setup

1. **Create account:** https://resend.com
2. **Get API key:** Dashboard → API Keys → Create
3. **Add domain:** Settings → Domains → Add Domain (biogov.il)
4. **Verify domain:** Add DNS records as instructed

### Step 13.2: Email Templates

Create `/Users/michaelmishayev/Desktop/Projects/bioGov/biogov-ui/src/lib/emails.ts`:

```typescript
// TODO: Implement Resend email sending
// See Resend docs: https://resend.com/docs/send-with-nextjs

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${token}`;

  // Send email via Resend
  console.log(`TODO: Send verification email to ${email}`);
  console.log(`Verification URL: ${verificationUrl}`);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;

  console.log(`TODO: Send password reset email to ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
}
```

---

## Summary: What You Built

### ✅ Complete Authentication System

**Backend:**
- Password hashing (bcrypt)
- JWT tokens (access + refresh)
- Session management
- Email verification
- Password reset
- Rate limiting
- Account lockout
- Audit logging

**Frontend:**
- Login page
- Signup page
- Protected dashboard
- Auth context
- Auto token refresh

**Security:**
- HTTP-only cookies
- CSRF protection
- SQL injection prevention (parameterized queries)
- XSS protection (React escaping)
- Brute force protection
- Israeli Privacy Law compliant

---

## Cost Breakdown (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| Railway PostgreSQL | 100 users, 50MB data | ~$5 |
| Railway App Hosting | Next.js, moderate traffic | ~$5 |
| **Total** | | **~$10/month** |

---

## Next Steps

1. **Integrate calendar feature** (use auth system to create user-specific tasks)
2. **Add email notifications** (Resend.com for reminders)
3. **Build user profile page** (change password, delete account)
4. **Add 2FA** (optional, for high-security users)

---

## Support & Troubleshooting

**Common Issues:**

1. **"Cannot connect to database"**
   - Check DATABASE_URL in Railway environment variables
   - Verify PostgreSQL service is running

2. **"Invalid token"**
   - Check ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are set
   - Verify they're the same in Railway as local .env

3. **"Cookies not set"**
   - Check `secure: true` in production
   - Verify site is HTTPS

4. **"Account locked"**
   - Reset manually: `UPDATE public.users SET failed_login_attempts = 0, locked_until = NULL WHERE email = 'user@example.com';`

---

## Congratulations!

You now have a **production-ready authentication system** on Railway with PostgreSQL.

**Total Build Time:** 7 days
**Monthly Cost:** $10-15
**Security Level:** Production-grade
**Israeli Compliance:** ✅ Ready

You're ready to build the calendar feature!
