"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
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
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">אודות bioGov</h1>
            <p className="text-xl text-[#c6c6c6]">
              המדריך החכם לניווט בירוקרטיה ממשלתית לעסקים קטנים ובינוניים בישראל
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Mission */}
            <div className="bg-[#262626] rounded-lg p-8 border border-[#525252]">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">🎯</span>
                <div>
                  <h2 className="text-2xl font-semibold mb-3">המשימה שלנו</h2>
                  <p className="text-[#c6c6c6] leading-relaxed">
                    bioGov נוצר כדי לפשט את התהליך המורכב של רישום עסקי והגשת דוחות לרשויות הממשלתיות בישראל.
                    אנחנו מאמינים שכל עצמאי ובעל עסק קטן צריך לקבל גישה פשוטה ומובנה למידע על חובות הרישום,
                    מע"מ, ביטוח לאומי, ורישוי עסקים.
                  </p>
                </div>
              </div>
            </div>

            {/* What We Do */}
            <div className="bg-[#262626] rounded-lg p-8 border border-[#525252]">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">✅</span>
                <div>
                  <h2 className="text-2xl font-semibold mb-3">מה אנחנו עושים?</h2>
                  <ul className="space-y-3 text-[#c6c6c6]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#0f62fe] mt-1">•</span>
                      <span>בדיקת זכאות אוטומטית לסטטוס עוסק פטור או מורשה במע"מ</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#0f62fe] mt-1">•</span>
                      <span>מדריכים מפורטים לרישום בביטוח לאומי, רשות המסים, ורישוי עסקים</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#0f62fe] mt-1">•</span>
                      <span>קישורים ישירים לטפסים ולשירותים הממשלתיים הרלוונטיים</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#0f62fe] mt-1">•</span>
                      <span>תזכורות על מועדי הגשת דוחות ותשלומים</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-[#262626] rounded-lg p-8 border border-[#525252]">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">⚙️</span>
                <div>
                  <h2 className="text-2xl font-semibold mb-3">איך זה עובד?</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0f62fe] text-white flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">ענה על 5 שאלות פשוטות</h3>
                        <p className="text-[#c6c6c6] text-sm">
                          על סוג הפעילות, מחזור שנתי, סוג לקוחות, מספר עובדים, ועניין ברישום מרצון
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0f62fe] text-white flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">קבל המלצה מותאמת אישית</h3>
                        <p className="text-[#c6c6c6] text-sm">
                          המערכת תנתח את התשובות שלך ותקבע האם אתה עוסק פטור, מורשה, או זכאי לבחירה
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0f62fe] text-white flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">פעל לפי צ'קליסט מפורט</h3>
                        <p className="text-[#c6c6c6] text-sm">
                          קבל רשימת משימות צעד-אחר-צעד עם קישורים ישירים לטפסים והסברים ברורים
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-[#0f62fe] bg-opacity-10 border-2 border-[#0f62fe] rounded-lg p-8">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🔒</span>
                <div>
                  <h2 className="text-2xl font-semibold mb-3">פרטיות ואבטחה</h2>
                  <p className="text-[#c6c6c6] leading-relaxed mb-3">
                    אנחנו מכבדים את הפרטיות שלך. bioGov לא אוסף מידע אישי מזהה ללא הסכמה מפורשת,
                    ולעולם לא משתף נתונים עם גורמים שלישיים.
                  </p>
                  <Link href="/privacy">
                    <Button variant="outline" className="border-[#0f62fe] text-[#0f62fe] hover:bg-[#0f62fe] hover:text-white">
                      קרא את מדיניות הפרטיות
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-[#262626] rounded-lg p-8 border border-[#525252] text-center">
              <h2 className="text-2xl font-semibold mb-4">יש לך שאלות?</h2>
              <p className="text-[#c6c6c6] mb-6">
                נשמח לעזור ולשמוע את המשוב שלך על המערכת
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-[#0f62fe] hover:bg-[#0353e9] text-white w-full sm:w-auto">
                    צור קשר
                  </Button>
                </Link>
                <Link href="/quiz">
                  <Button variant="outline" className="border-[#525252] text-white hover:bg-[#393939] w-full sm:w-auto">
                    התחל בדיקת זכאות
                  </Button>
                </Link>
              </div>
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
            <Link href="/privacy" className="hover:text-[#0f62fe]">
              מדיניות פרטיות
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
