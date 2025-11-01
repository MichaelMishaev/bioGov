"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#161616] text-[#f4f4f4]" style={{ fontFamily: "'Rubik', sans-serif" }} dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#161616] border-b border-[#525252]">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-bold">
            🏠 <span className="text-[#0f62fe]">bio</span>Gov
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">מדיניות פרטיות</h1>
            <p className="text-lg text-[#c6c6c6]">
              עדכון אחרון: ינואר 2025
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 prose prose-invert max-w-none">
            {/* Introduction */}
            <section className="bg-[#262626] rounded-lg p-8 border border-[#525252]">
              <h2 className="text-2xl font-semibold mb-4">הקדמה</h2>
              <p className="text-[#c6c6c6] leading-relaxed">
                bioGov מחויב להגן על פרטיותך ועל המידע האישי שלך. מדיניות פרטיות זו מסבירה אילו נתונים אנו
                אוספים, כיצד משתמשים בהם, ומה הזכויות שלך לגבי המידע האישי שלך.
              </p>
              <p className="text-[#c6c6c6] leading-relaxed mt-3">
                השירות שלנו מתאים לחוק הגנת הפרטיות, התשמ"א-1981 (ותיקון 13 שנכנס לתוקף ב-14 באוגוסט 2025),
                וכן לתקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017.
              </p>
            </section>

            {/* Data Collection */}
            <section className="bg-[#262626] rounded-lg p-8 border border-[#525252]">
              <h2 className="text-2xl font-semibold mb-4">🔍 מידע שאנו אוספים</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">1. מידע שאתה מספק מרצונך</h3>
              <ul className="space-y-2 text-[#c6c6c6]">
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>תשובות לשאלון הזכאות:</strong> סוג פעילות, מחזור שנתי צפוי, סוג לקוחות, מספר עובדים, עניין ברישום מרצון</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>מידע ליצירת קשר (אופציונלי):</strong> שם, כתובת דוא"ל (רק אם בחרת לקבל תוצאות במייל או להירשם לעדכונים)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>משוב:</strong> דירוג ותגובות על השירות (אנונימי אלא אם בחרת לספק פרטים)</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">2. מידע שנאסף באופן אוטומטי</h3>
              <ul className="space-y-2 text-[#c6c6c6]">
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>כתובת IP (מוצפנת):</strong> למניעת שימוש לרעה (הגבלת קצב - עד 10 בדיקות ליום לכתובת IP)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>User Agent:</strong> סוג דפדפן ומכשיר (לצורכי תאימות טכנית)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>תאריך ושעת השימוש:</strong> למעקב אחר נפח שימוש ושיפור השירות</span>
                </li>
              </ul>
            </section>

            {/* Data Usage */}
            <section className="bg-[#262626] rounded-lg p-8 border border-[#525252]">
              <h2 className="text-2xl font-semibold mb-4">📊 שימוש במידע</h2>
              <p className="text-[#c6c6c6] mb-4">אנו משתמשים במידע שלך אך ורק למטרות הבאות:</p>
              <ul className="space-y-2 text-[#c6c6c6]">
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>מתן השירות:</strong> חישוב זכאותך לסטטוס מע"מ ויצירת צ'קליסט מותאם אישית</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>תקשורת:</strong> שליחת תוצאות בדיקה, תזכורות, ועדכונים (רק אם ביקשת זאת)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>אנליטיקה:</strong> ניתוח תבניות שימוש לשיפור השירות (בצורה אנונימית)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>אבטחה:</strong> מניעת שימוש לרעה והגנה מפני התקפות</span>
                </li>
              </ul>
              <div className="bg-[#0f62fe] bg-opacity-10 border-2 border-[#0f62fe] rounded-lg p-4 mt-6">
                <p className="text-[#f4f4f4] font-medium">
                  ⚠️ אנחנו <strong>לעולם לא</strong> נמכור, נשכיר, או נשתף את המידע האישי שלך עם גורמים שלישיים למטרות שיווקיות.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section className="bg-[#262626] rounded-lg p-8 border border-[#525252]">
              <h2 className="text-2xl font-semibold mb-4">⏱️ שמירת מידע</h2>
              <ul className="space-y-2 text-[#c6c6c6]">
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>תוצאות בדיקה:</strong> 12 חודשים (אלא אם תבקש מחיקה מוקדמת)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>כתובות IP מוצפנות:</strong> 24 שעות (למניעת שימוש לרעה בלבד)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>משוב:</strong> ללא הגבלת זמן (אנונימי)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>רישום למיילים:</strong> עד שתבקש הסרה (ניתן לבטל מנוי בכל עת)</span>
                </li>
              </ul>
            </section>

            {/* User Rights */}
            <section className="bg-[#262626] rounded-lg p-8 border border-[#525252]">
              <h2 className="text-2xl font-semibold mb-4">✅ הזכויות שלך</h2>
              <p className="text-[#c6c6c6] mb-4">לפי חוק הגנת הפרטיות, יש לך את הזכויות הבאות:</p>
              <ul className="space-y-2 text-[#c6c6c6]">
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>זכות עיון:</strong> לדעת אילו נתונים אנו מחזיקים עליך</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>זכות תיקון:</strong> לתקן מידע שגוי או לא מדויק</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>זכות מחיקה:</strong> למחוק את כל המידע שלך ממערכותינו</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>זכות להתנגד:</strong> להתנגד לשימושים מסוימים במידע שלך</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>זכות להעברה:</strong> לקבל עותק של הנתונים שלך בפורמט מובנה</span>
                </li>
              </ul>
              <p className="text-[#c6c6c6] mt-4">
                כדי לממש זכויות אלו, צור איתנו קשר בכתובת: <a href="/contact" className="text-[#0f62fe] hover:underline">דרך טופס יצירת הקשר</a>
              </p>
            </section>

            {/* Security */}
            <section className="bg-[#262626] rounded-lg p-8 border border-[#525252]">
              <h2 className="text-2xl font-semibold mb-4">🔒 אבטחת מידע</h2>
              <p className="text-[#c6c6c6] mb-4">
                אנו נוקטים אמצעי אבטחה מתקדמים כנדרש על-פי תקנות הגנת הפרטיות (אבטחת מידע):
              </p>
              <ul className="space-y-2 text-[#c6c6c6]">
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>הצפנת תעבורה:</strong> כל התקשורת מוצפנת באמצעות HTTPS/TLS</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>הצפנת מאגרי מידע:</strong> נתונים רגישים מוצפנים במנוחה (at rest)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>בקרת גישה:</strong> גישה מוגבלת לעובדים מורשים בלבד</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>גיבויים:</strong> גיבויים תקופתיים למניעת אובדן מידע</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>לוגים ומעקב:</strong> ניטור פעילות חשודה ותקיפות סייבר</span>
                </li>
              </ul>
            </section>

            {/* Cookies */}
            <section className="bg-[#262626] rounded-lg p-8 border border-[#525252]">
              <h2 className="text-2xl font-semibold mb-4">🍪 עוגיות (Cookies)</h2>
              <p className="text-[#c6c6c6] mb-4">
                אנו משתמשים בעוגיות טכניות בלבד (לא שיווקיות):
              </p>
              <ul className="space-y-2 text-[#c6c6c6]">
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>Session Cookies:</strong> לשמירת התקדמות בשאלון</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0f62fe] mt-1">•</span>
                  <span><strong>Preference Cookies:</strong> שפה נבחרת (עברית/אנגלית)</span>
                </li>
              </ul>
              <p className="text-[#c6c6c6] mt-4">
                אתה יכול לחסום עוגיות בהגדרות הדפדפן שלך, אך זה עלול להשפיע על פונקציונליות האתר.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-[#0f62fe] bg-opacity-10 border-2 border-[#0f62fe] rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">📧 יצירת קשר</h2>
              <p className="text-[#c6c6c6] mb-4">
                אם יש לך שאלות או דאגות לגבי מדיניות הפרטיות שלנו, או אם ברצונך לממש את זכויותיך:
              </p>
              <Link href="/contact" className="inline-block bg-[#0f62fe] hover:bg-[#0353e9] text-white px-6 py-3 rounded-lg font-medium transition-all">
                צור קשר
              </Link>
            </section>

            {/* Last Updated */}
            <div className="text-center text-[#8d8d8d] text-sm mt-12">
              <p>מדיניות פרטיות זו עודכנה לאחרונה בינואר 2025</p>
              <p className="mt-2">אנו שומרים את הזכות לעדכן מדיניות זו. שינויים מהותיים יפורסמו באתר.</p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Link href="/" className="text-[#0f62fe] hover:text-[#0353e9] font-medium">
              ← חזור לדף הבית
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#525252] mt-16 py-8">
        <div className="container mx-auto px-6 text-center text-[#8d8d8d] text-sm">
          <p>© 2025 bioGov. כל הזכויות שמורות.</p>
          <div className="mt-2 space-x-4">
            <Link href="/about" className="hover:text-[#0f62fe]">
              אודות
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#0f62fe]">
              צור קשר
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
