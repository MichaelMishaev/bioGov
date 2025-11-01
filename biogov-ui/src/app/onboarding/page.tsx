'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const BUSINESS_TYPES = [
  { value: 'osek_patur', label: 'עוסק פטור', description: 'מחזור עד 102,292 ₪' },
  { value: 'osek_murshe', label: 'עוסק מורשה', description: 'מחזור מעל 102,292 ₪' },
  { value: 'ltd', label: 'חברה בע״מ', description: 'חברה פרטית מוגבלת' },
];

const INDUSTRIES = [
  { value: 'consulting', label: 'ייעוץ וניהול' },
  { value: 'tech', label: 'הייטק ופיתוח תוכנה' },
  { value: 'food', label: 'מסעדות ומזון' },
  { value: 'retail', label: 'קמעונאות ומסחר' },
  { value: 'health', label: 'בריאות ורווחה' },
  { value: 'construction', label: 'בנייה ושיפוצים' },
  { value: 'services', label: 'שירותים אחרים' },
];

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form data
  const [businessType, setBusinessType] = useState('');
  const [industry, setIndustry] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleNext = () => {
    if (step === 1 && !businessType) {
      setError('נא לבחור סוג עסק');
      return;
    }
    if (step === 2 && !industry) {
      setError('נא לבחור תחום עיסוק');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/business-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType,
          industry,
          employeeCount: parseInt(employeeCount) || 0,
          municipality: city,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create business profile');
      }

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'שגיאה ביצירת פרופיל עסקי');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-12">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">הפרופיל נוצר בהצלחה!</h2>
            <p className="text-muted-foreground">מעביר אותך למערכת...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-20 rounded-full transition-colors ${
                    i <= step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">שלב {step} מתוך 3</span>
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && 'בחר את סוג העסק שלך'}
            {step === 2 && 'מה תחום העיסוק שלך?'}
            {step === 3 && 'פרטים נוספים'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'המידע הזה יעזור לנו להתאים את המשימות והתזכורות שלך'}
            {step === 2 && 'תחום העיסוק משפיע על רישוי ודרישות ציות'}
            {step === 3 && 'כמעט סיימנו! עוד כמה פרטים אחרונים'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Step 1: Business Type */}
            {step === 1 && (
              <div className="space-y-3">
                {BUSINESS_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setBusinessType(type.value)}
                    className={`w-full text-right p-4 rounded-lg border-2 transition-all hover:border-primary ${
                      businessType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-lg">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                      {businessType === type.value && (
                        <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Industry */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.value}
                    type="button"
                    onClick={() => setIndustry(ind.value)}
                    className={`text-center p-4 rounded-lg border-2 transition-all hover:border-primary ${
                      industry === ind.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium">{ind.label}</div>
                    {industry === ind.value && (
                      <CheckCircle2 className="w-5 h-5 text-primary mx-auto mt-2" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Additional Details */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city">עיר</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="תל אביב, ירושלים, חיפה..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employees">מספר עובדים</Label>
                  <Input
                    id="employees"
                    type="number"
                    placeholder="0"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    min="0"
                    className="text-right"
                  />
                  <p className="text-sm text-muted-foreground">
                    כולל עצמאים ושכירים (אם יש)
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                חזור
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading}
              >
                המשך
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'שומר...' : 'סיים והתחל'}
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
