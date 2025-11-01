'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { AlertCircle, Check, X } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength validation
  const passwordValidation = {
    length: password.length >= 8,
    hasNumberOrSpecial: /[0-9!@#$%^&*(),.?":{}|<>]/.test(password),
    notTooLong: password.length <= 128,
  };

  const isPasswordValid = passwordValidation.length &&
                          passwordValidation.hasNumberOrSpecial &&
                          passwordValidation.notTooLong;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('הסיסמה אינה עומדת בדרישות');
      return;
    }

    if (!consent) {
      setError('יש להסכים לתנאי השימוש');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, name, consent);
    } catch (err: any) {
      setError(err.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">הצטרף ל-bioGov</CardTitle>
          <CardDescription className="text-base">
            צור חשבון חדש כדי להתחיל לנהל את הציות העסקי שלך
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">שם מלא</Label>
              <Input
                id="name"
                type="text"
                placeholder="משה כהן"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">כתובת אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="text-right"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="text-right"
                dir="ltr"
              />

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    {passwordValidation.length ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-destructive" />
                    )}
                    <span className={passwordValidation.length ? 'text-green-600' : 'text-muted-foreground'}>
                      לפחות 8 תווים
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordValidation.hasNumberOrSpecial ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-destructive" />
                    )}
                    <span className={passwordValidation.hasNumberOrSpecial ? 'text-green-600' : 'text-muted-foreground'}>
                      כולל מספר או תו מיוחד
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={loading}
              />
              <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                אני מסכים/ה{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  לתנאי השימוש
                </Link>
                {' '}ו
                <Link href="/privacy" className="text-primary hover:underline">
                  למדיניות הפרטיות
                </Link>
                {' '}של bioGov
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isPasswordValid || !consent}
            >
              {loading ? 'נרשם...' : 'הרשם'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              כבר יש לך חשבון?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                התחבר
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
