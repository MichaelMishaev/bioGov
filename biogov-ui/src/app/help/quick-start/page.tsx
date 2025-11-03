'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CheckCircle2, Rocket, Zap, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FlowDiagram } from '@/components/help/FlowDiagram';

export default function QuickStartPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 flex items-center gap-3">
              <Rocket className="w-10 h-10 sm:w-12 sm:h-12" />
              מדריך התחלה מהירה
            </h1>
            <p className="text-white/90 text-base sm:text-lg">
              3 שלבים פשוטים להתחלת עבודה עם bioGov - תוך 10 דקות תהיו מוכנים לעבודה!
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/help')}
          className="mb-6 hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5 ml-2" />
          חזרה למרכז העזרה
        </Button>

        {/* Quick Overview */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              סקירה מהירה - מה תקבלו?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">לוח משימות אישי</h3>
                  <p className="text-sm text-gray-600">כל המשימות שצריך לבצע בהתאם לעסק שלכם</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">תזכורות אוטומטיות</h3>
                  <p className="text-sm text-gray-600">לא תפספסו שום מועד חשוב למע"מ או ביטוח לאומי</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">ציון תאימות</h3>
                  <p className="text-sm text-gray-600">מעקב אחר רמת הציות והסדר של העסק</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Registration */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl sm:text-2xl flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  הרשמה למערכת
                </h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  ההרשמה למערכת פשוטה ומהירה. כל מה שצריך זה כתובת אימייל וסיסמה.
                </p>

                <div className="space-y-4">
                  <div className="bg-blue-50 border-r-4 border-blue-400 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-2">📝 מה להכין מראש:</h4>
                    <ul className="text-sm text-blue-900 space-y-1 mr-4">
                      <li>• כתובת אימייל פעילה</li>
                      <li>• מספר עוסק / ח.פ. (אופציונלי - אפשר להוסיף מאוחר יותר)</li>
                      <li>• פרטי העסק הבסיסיים (שם, סוג פעילות)</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-900 mb-2">⚡ טיפ חשוב:</h4>
                    <p className="text-sm text-yellow-900">
                      השתמשו באימייל שאתם בודקים באופן קבוע - דרכו תקבלו תזכורות חשובות על מועדים קרובים!
                    </p>
                  </div>

                  <Button
                    className="w-full sm:w-auto"
                    size="lg"
                    onClick={() => router.push('/signup')}
                  >
                    התחילו עכשיו - הרשמה חינם
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Profile Setup */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl sm:text-2xl flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  מילוי פרטי העסק
                </h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  לאחר ההרשמה, המערכת תשאל אתכם מספר שאלות פשוטות כדי להבין את העסק שלכם ולהתאים את לוח המשימות.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">🏢 סוג העסק</h4>
                      <p className="text-sm text-gray-600">
                        עצמאי, חברה בע"מ, שותפות - זה משפיע על החובות הבירוקרטיות
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">💼 סוג הפעילות</h4>
                      <p className="text-sm text-gray-600">
                        מה העסק עושה? (שירותים, מסחר, ייצור)
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">📊 מחזור עסקאות</h4>
                      <p className="text-sm text-gray-600">
                        משפיע על הסטטוס במע"מ (פטור/מורשה)
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">🏙️ מיקום</h4>
                      <p className="text-sm text-gray-600">
                        רלוונטי לרישוי עסקים ולכתובות ממשלתיות
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 border-r-4 border-green-400 p-4 rounded-lg">
                    <h4 className="font-bold text-green-900 mb-2">✨ האלגוריתם החכם שלנו:</h4>
                    <p className="text-sm text-green-900">
                      על סמך התשובות, המערכת תיצור עבורכם לוח משימות מותאם אישית עם כל הדברים שצריך לעשות - מרישום בביטוח לאומי ועד הגשת דוחות מע"מ!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Start Working */}
        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl sm:text-2xl flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  התחילו לעבוד!
                </h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  מעולה! עכשיו אתם בלוח הבקרה. הנה מה שכדאי לעשות עכשיו:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-white border-r-4 border-primary rounded-lg shadow-sm">
                    <span className="text-2xl flex-shrink-0">1️⃣</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">סמנו משימות שכבר עשיתם</h4>
                      <p className="text-sm text-gray-600">
                        אם כבר נרשמתם לביטוח לאומי או פתחתם עוסק - סמנו את זה! זה ישפר את ציון התאימות שלכם.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white border-r-4 border-primary rounded-lg shadow-sm">
                    <span className="text-2xl flex-shrink-0">2️⃣</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">טפלו במשימות באיחור (אם יש)</h4>
                      <p className="text-sm text-gray-600">
                        משימות באדום דחופות! הן עלולות לגרור קנסות. טפלו בהן קודם.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white border-r-4 border-primary rounded-lg shadow-sm">
                    <span className="text-2xl flex-shrink-0">3️⃣</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">הגדירו תזכורות</h4>
                      <p className="text-sm text-gray-600">
                        וודאו שהמערכת יכולה לשלוח לכם תזכורות באימייל. כך לא תפספסו מועדים חשובים.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white border-r-4 border-primary rounded-lg shadow-sm">
                    <span className="text-2xl flex-shrink-0">4️⃣</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">עקבו אחר ציון התאימות</h4>
                      <p className="text-sm text-gray-600">
                        הציון מראה עד כמה אתם "על זה" - שאפו לציון מעל 85!
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-r-4 border-purple-400 p-4 rounded-lg mt-6">
                    <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      המלצה שלנו:
                    </h4>
                    <p className="text-sm text-purple-900">
                      היכנסו למערכת לפחות פעם בשבוע (למשל כל יום ראשון בבוקר) כדי לעדכן משימות ולבדוק אם יש משהו חדש. זה לוקח 5 דקות ויחסוך לכם הרבה כאבי ראש!
                    </p>
                  </div>

                  <Button
                    className="w-full sm:w-auto mt-4"
                    size="lg"
                    onClick={() => router.push('/dashboard')}
                  >
                    קדימה ללוח הבקרה!
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Flow */}
        <div className="mb-8">
          <FlowDiagram
            title="זרימת העבודה היומיומית עם bioGov"
            orientation="horizontal"
            steps={[
              {
                id: '1',
                title: 'התחברות',
                description: 'פתחו את המערכת',
                icon: '🔐'
              },
              {
                id: '2',
                title: 'בדיקה',
                description: 'ראו מה יש לעשות',
                icon: '👀'
              },
              {
                id: '3',
                title: 'ביצוע',
                description: 'טפלו במשימות',
                icon: '✅'
              },
              {
                id: '4',
                title: 'עדכון',
                description: 'סמנו כהושלם',
                icon: '🎯'
              },
              {
                id: '5',
                title: 'מעקב',
                description: 'צפו בציון עולה',
                icon: '📈'
              }
            ]}
          />
        </div>

        {/* Need Help? */}
        <Card className="bg-gradient-to-r from-primary to-purple-600 text-white">
          <CardContent className="p-6 sm:p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">צריכים עזרה נוספת?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              במרכז העזרה תמצאו מדריכים מפורטים לכל נושא, זרימות עבודה, שאלות נפוצות ומילון מונחים.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/help')}
              >
                למרכז העזרה המלא
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => router.push('/help/videos')}
              >
                צפו במדריכי וידאו
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
