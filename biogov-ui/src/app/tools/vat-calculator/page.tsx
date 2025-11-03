'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Calculator, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HelpTooltip } from '@/components/help/HelpTooltip';

export default function VATCalculatorPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'add' | 'extract'>('add');
  const VAT_RATE = 0.18; // 18%

  const calculateVAT = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return null;

    if (mode === 'add') {
      const vatAmount = num * VAT_RATE;
      const totalWithVAT = num + vatAmount;
      return {
        original: num,
        vat: vatAmount,
        total: totalWithVAT
      };
    } else {
      const originalAmount = num / (1 + VAT_RATE);
      const vatAmount = num - originalAmount;
      return {
        original: originalAmount,
        vat: vatAmount,
        total: num
      };
    }
  };

  const result = calculateVAT();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 flex items-center gap-3">
              <Calculator className="w-10 h-10 sm:w-12 sm:h-12" />
              מחשבון מע״מ
            </h1>
            <p className="text-white/90 text-base sm:text-lg">
              חשבו מע״מ בקלות - הוסיפו או הפרידו מע״מ מהסכום
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/help')}
          className="mb-6 hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5 ml-2" />
          חזרה למרכז העזרה
        </Button>

        {/* Info Banner */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>שימו לב:</strong> שיעור מע״מ בישראל הוא 18% החל מינואר 2025.
              המחשבון מעוגל לאגורות הקרובות ביותר.
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator Card */}
          <Card>
            <CardHeader>
              <CardTitle>מחשבון</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Selection */}
              <div>
                <Label className="mb-3 block">בחרו סוג חישוב:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={mode === 'add' ? 'default' : 'outline'}
                    onClick={() => setMode('add')}
                    className="h-auto py-4 flex-col gap-2"
                  >
                    <span className="text-lg">➕</span>
                    <span className="font-bold">הוספת מע״מ</span>
                    <span className="text-xs opacity-80">למחיר ללא מע״מ</span>
                  </Button>
                  <Button
                    variant={mode === 'extract' ? 'default' : 'outline'}
                    onClick={() => setMode('extract')}
                    className="h-auto py-4 flex-col gap-2"
                  >
                    <span className="text-lg">➖</span>
                    <span className="font-bold">הפרדת מע״מ</span>
                    <span className="text-xs opacity-80">ממחיר כולל מע״מ</span>
                  </Button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <Label htmlFor="amount" className="mb-2 flex items-center gap-2">
                  {mode === 'add' ? 'סכום ללא מע״מ' : 'סכום כולל מע״מ'}
                  <HelpTooltip
                    content={mode === 'add'
                      ? 'הזינו את הסכום לפני הוספת מע״מ (המחיר הבסיסי)'
                      : 'הזינו את הסכום הכולל עם מע״מ (המחיר הסופי)'
                    }
                  />
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-2xl h-14 pr-12 text-left"
                    step="0.01"
                    min="0"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ₪
                  </span>
                </div>
              </div>

              {/* Clear Button */}
              {amount && (
                <Button
                  variant="outline"
                  onClick={() => setAmount('')}
                  className="w-full"
                >
                  נקה
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card>
            <CardHeader>
              <CardTitle>תוצאות</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  {mode === 'add' ? (
                    <>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">סכום מקורי (ללא מע״מ)</div>
                        <div className="text-2xl font-bold text-gray-900">
                          ₪{result.original.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-4 bg-primary/10 rounded-lg">
                        <div className="text-sm text-primary mb-1">מע״מ (18%)</div>
                        <div className="text-2xl font-bold text-primary">
                          ₪{result.vat.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border-2 border-green-500">
                        <div className="text-sm text-green-700 mb-1">סכום כולל מע״מ</div>
                        <div className="text-3xl font-bold text-green-700">
                          ₪{result.total.toFixed(2)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-green-50 rounded-lg border-2 border-green-500">
                        <div className="text-sm text-green-700 mb-1">סכום כולל מע״מ</div>
                        <div className="text-3xl font-bold text-green-700">
                          ₪{result.total.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-4 bg-primary/10 rounded-lg">
                        <div className="text-sm text-primary mb-1">מע״מ (18%)</div>
                        <div className="text-2xl font-bold text-primary">
                          ₪{result.vat.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">סכום ללא מע״מ</div>
                        <div className="text-2xl font-bold text-gray-900">
                          ₪{result.original.toFixed(2)}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• שיעור מע״מ: 18%</div>
                      <div>• תוצאות מעוגלות לאגורות</div>
                      <div>• תקף מינואר 2025</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Calculator className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>הזינו סכום כדי לראות את התוצאות</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Examples */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>דוגמאות לשימוש</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-2">הוספת מע״מ</h4>
                <p className="text-sm text-blue-800 mb-2">
                  השירות שלכם עולה ₪1,000. כמה הלקוח צריך לשלם?
                </p>
                <div className="text-xs text-blue-700">
                  ₪1,000 + 18% = <strong>₪1,180</strong>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-bold text-purple-900 mb-2">הפרדת מע״מ</h4>
                <p className="text-sm text-purple-800 mb-2">
                  חשבונית על ₪590. כמה מע״מ יש בתוכה?
                </p>
                <div className="text-xs text-purple-700">
                  ₪590 ÷ 1.18 = ₪500 (סכום מקורי)<br/>
                  מע״מ: <strong>₪90</strong>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Help */}
        <Card className="mt-6 bg-gradient-to-r from-primary to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">רוצים ללמוד עוד על מע״מ?</h3>
            <p className="text-white/90 mb-4">
              במרכז העזרה יש מדריך מקיף על מע״מ, דוחות, ומועדי הגשה
            </p>
            <Button
              variant="secondary"
              onClick={() => router.push('/help?section=vat')}
            >
              למדריך המלא על מע״מ
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
