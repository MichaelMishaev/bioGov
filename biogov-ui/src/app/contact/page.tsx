"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call (replace with actual contact API later)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Contact form submitted:", { name, email, subject, message });

    setSuccess(true);
    setSubmitting(false);

    // Reset form
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");

    // Hide success message after 5 seconds
    setTimeout(() => setSuccess(false), 5000);
  };

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
            <h1 className="text-4xl font-bold mb-4">צור קשר</h1>
            <p className="text-xl text-[#c6c6c6]">
              יש לך שאלה, הצעה, או משוב? נשמח לשמוע ממך
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-[#42be65] bg-opacity-10 border-2 border-[#42be65] rounded-lg p-6 mb-8 text-center animate-fade-in">
              <span className="text-4xl">✅</span>
              <p className="text-lg mt-2 font-medium">ההודעה נשלחה בהצלחה!</p>
              <p className="text-[#c6c6c6] text-sm mt-1">נחזור אליך בהקדם האפשרי</p>
            </div>
          )}

          {/* Contact Form */}
          <div className="bg-[#262626] rounded-lg p-8 border border-[#525252] mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  שם מלא <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#393939] border border-[#525252] focus:border-[#0f62fe] focus:outline-none focus:ring-2 focus:ring-[#0f62fe] focus:ring-opacity-50 transition-all"
                  placeholder="יוסי כהן"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  דואר אלקטרוני <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#393939] border border-[#525252] focus:border-[#0f62fe] focus:outline-none focus:ring-2 focus:ring-[#0f62fe] focus:ring-opacity-50 transition-all"
                  placeholder="yossi@example.com"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  נושא <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#393939] border border-[#525252] focus:border-[#0f62fe] focus:outline-none focus:ring-2 focus:ring-[#0f62fe] focus:ring-opacity-50 transition-all"
                >
                  <option value="">בחר נושא...</option>
                  <option value="general">שאלה כללית</option>
                  <option value="technical">תמיכה טכנית</option>
                  <option value="feedback">משוב על השירות</option>
                  <option value="privacy">שאלות פרטיות</option>
                  <option value="partnership">הצעת שיתוף פעולה</option>
                  <option value="other">אחר</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  הודעה <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  maxLength={1000}
                  className="w-full px-4 py-3 rounded-lg bg-[#393939] border border-[#525252] focus:border-[#0f62fe] focus:outline-none focus:ring-2 focus:ring-[#0f62fe] focus:ring-opacity-50 transition-all resize-none"
                  placeholder="כתוב את ההודעה שלך כאן..."
                />
                <div className="text-xs text-[#8d8d8d] mt-1 text-left">
                  {message.length}/1000 תווים
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0f62fe] hover:bg-[#0353e9] text-white py-4 text-lg font-medium disabled:bg-[#393939] disabled:text-[#8d8d8d] disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    שולח...
                  </span>
                ) : (
                  "שלח הודעה"
                )}
              </Button>
            </form>
          </div>

          {/* Alternative Contact Methods */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Email */}
            <div className="bg-[#262626] rounded-lg p-6 border border-[#525252]">
              <div className="flex items-start gap-4">
                <span className="text-3xl">📧</span>
                <div>
                  <h3 className="font-semibold mb-2">דואר אלקטרוני</h3>
                  <p className="text-[#c6c6c6] text-sm mb-2">נשיב תוך 24-48 שעות</p>
                  <a href="mailto:support@biogov.co.il" className="text-[#0f62fe] hover:underline">
                    support@biogov.co.il
                  </a>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-[#262626] rounded-lg p-6 border border-[#525252]">
              <div className="flex items-start gap-4">
                <span className="text-3xl">❓</span>
                <div>
                  <h3 className="font-semibold mb-2">שאלות נפוצות</h3>
                  <p className="text-[#c6c6c6] text-sm mb-2">תשובות לשאלות שכיחות</p>
                  <Link href="/faq" className="text-[#0f62fe] hover:underline">
                    עבור לשאלות נפוצות
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-6 mb-12">
            {/* Response Time */}
            <div className="bg-[#0f62fe] bg-opacity-10 border-2 border-[#0f62fe] rounded-lg p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <h3 className="font-semibold mb-2">זמן תגובה</h3>
                  <p className="text-[#c6c6c6] text-sm">
                    אנו משתדלים לענות לכל הפניות תוך 24-48 שעות בימי עסקים (ראשון-חמישי).
                    פניות דחופות יטופלו בעדיפות גבוהה יותר.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-[#262626] rounded-lg p-6 border border-[#525252]">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold mb-2">פרטיות ואבטחה</h3>
                  <p className="text-[#c6c6c6] text-sm">
                    המידע שתשלח יישמר באופן מאובטח ולא ישותף עם צדדים שלישיים.
                    לפרטים נוספים, ראה את{" "}
                    <Link href="/privacy" className="text-[#0f62fe] hover:underline">
                      מדיניות הפרטיות
                    </Link>{" "}
                    שלנו.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
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
            <Link href="/privacy" className="hover:text-[#0f62fe]">
              מדיניות פרטיות
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
