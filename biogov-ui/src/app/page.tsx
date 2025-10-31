"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#161616] text-[#f4f4f4]" style={{ fontFamily: "'Rubik', sans-serif" }} dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#161616] border-b border-[#525252]">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            🏠 <span className="text-[#0f62fe]">bio</span>Gov
          </div>
          <button className="text-[#c6c6c6] hover:text-[#f4f4f4]">
            ☰ תפריט
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            🎯 דע את סטטוס המע"מ שלך ב-2 דקות
          </h1>
          <p className="text-xl md:text-2xl text-[#c6c6c6] mb-8 leading-relaxed">
            חינם, פשוט, מבוסס על הנחיות רשמיות של רשות המיסים
          </p>
          <Link href="/quiz">
            <Button
              className="w-full md:w-auto px-12 py-6 text-lg font-medium bg-[#0f62fe] hover:bg-[#0353e9] text-white rounded-lg transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5"
            >
              התחל בדיקה חינם ◀
            </Button>
          </Link>
        </div>
      </section>

      {/* Pain Points */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto bg-[#262626] rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">📊 הבעיה:</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-[#da1e28] text-xl">❌</span>
              <span className="text-lg">אתרי ממשלה מבלבלים</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#da1e28] text-xl">❌</span>
              <span className="text-lg">עצות סותרות באינטרנט</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#da1e28] text-xl">❌</span>
              <span className="text-lg">יעוץ רואה חשבון יקר</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            עוסק פטור vs עוסק מורשה
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* פטור Card */}
            <div className="bg-[#262626] rounded-lg p-6 border-2 border-[#42be65]">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-2">עוסק פטור</h3>
                <div className="text-sm text-[#c6c6c6]">VAT-Exempt</div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-[#42be65]">✓</span>
                  <span>{'< ₪120,000 שנתי'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#42be65]">✓</span>
                  <span>ללא מע"מ</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#42be65]">✓</span>
                  <span>ניהול פשוט</span>
                </li>
              </ul>
            </div>

            {/* מורשה Card */}
            <div className="bg-[#262626] rounded-lg p-6 border-2 border-[#0f62fe]">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-2">עוסק מורשה</h3>
                <div className="text-sm text-[#c6c6c6]">VAT-Authorized</div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-[#0f62fe]">✓</span>
                  <span>{'≥ ₪120,000 שנתי'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#0f62fe]">✓</span>
                  <span>מע"מ 17%</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#0f62fe]">✓</span>
                  <span>ניכויים</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button
              variant="outline"
              className="text-[#0f62fe] border-[#0f62fe] hover:bg-[#0f62fe] hover:text-white"
            >
              למד עוד ↓
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto bg-[#262626] rounded-lg p-8">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-[#42be65] text-xl">✅</span>
              <span className="text-lg">מבוסס על חוקי רשות המיסים</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#42be65] text-xl">✅</span>
              <span className="text-lg">חינם, לא נדרש כרטיס אשראי</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#42be65] text-xl">✅</span>
              <span className="text-lg">לוקח פחות מ-3 דקות</span>
            </li>
          </ul>

          <div className="mt-8 text-center">
            <Link href="/quiz">
              <Button
                className="w-full md:w-auto px-12 py-6 text-lg font-medium bg-[#0f62fe] hover:bg-[#0353e9] text-white rounded-lg transition-all duration-200"
              >
                התחל בדיקה ◀
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-[#525252] mt-12">
        <div className="max-w-3xl mx-auto text-center text-[#c6c6c6]">
          <div className="flex justify-center gap-6 mb-4 text-sm">
            <Link href="/about" className="hover:text-[#0f62fe]">אודות</Link>
            <Link href="/privacy" className="hover:text-[#0f62fe]">פרטיות</Link>
            <Link href="/contact" className="hover:text-[#0f62fe]">צור קשר</Link>
          </div>
          <div className="text-sm">
            © 2025 bioGov. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  );
}
