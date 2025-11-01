"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface ChecklistItem {
  step: number;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  estimatedTime?: string;
}

interface AssessmentResult {
  status: string;
  statusText: string;
  explanation: string;
  checklist: ChecklistItem[];
  metadata: {
    isVoluntaryEligible: boolean;
    requiresBookkeeping: boolean;
    requiresVATReports: boolean;
    estimatedTimeToComplete: string;
  };
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Email signup form
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Feedback form
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    // Try to get from sessionStorage first (from quiz submission)
    const stored = sessionStorage.getItem("assessmentResult");
    if (stored) {
      const data = JSON.parse(stored);
      setResult(data.result);
      setLoading(false);
      sessionStorage.removeItem("assessmentResult");
      return;
    }

    // Otherwise fetch from API
    fetchResult();
  }, [assessmentId]);

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/results/${assessmentId}`);
      const data = await response.json();

      if (data.success) {
        // Map API response to expected format
        const mappedResult: AssessmentResult = {
          status: data.assessment.result.status,
          statusText: getStatusText(data.assessment.result.status),
          explanation: getExplanation(data.assessment.result.status),
          checklist: data.assessment.result.checklist,
          metadata: {
            isVoluntaryEligible: data.assessment.answers.revenue === "עד 120K",
            requiresBookkeeping: data.assessment.result.status === "מורשה",
            requiresVATReports: data.assessment.result.status === "מורשה",
            estimatedTimeToComplete: "2-3 שעות",
          },
        };
        setResult(mappedResult);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("שגיאה בטעינת התוצאות");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      פטור: "עוסק פטור ממע\"מ",
      מורשה: "עוסק מורשה (חובה)",
      choice: "בחירה: פטור או מורשה",
    };
    return statusMap[status] || status;
  };

  const getExplanation = (status: string) => {
    const explanations: Record<string, string> = {
      פטור: 'המחזור שלך נמוך מ-₪120,000 לשנה. אתה זכאי לפטור ממע"מ, מה שאומר שאינך חייב לגבות מע"מ מלקוחות, אך גם לא יכול לקבל החזר על מע"מ עסקי.',
      מורשה: 'המחזור שלך עולה על ₪120,000 לשנה. לפי חוק מע"מ, אתה חייב להירשם כעוסק מורשה. זה אומר שתגבה מע"מ מלקוחות (17%), תנהל ספרים, ותגיש דוחות רבעוניים.',
      choice: 'המחזור שלך נמוך מ-₪120,000, כך שאתה זכאי לפטור ממע"מ. עם זאת, אתה יכול לבחור להירשם כעוסק מורשה מרצונך החופשי. רישום מרצון מתאים אם יש לך הוצאות גבוהות או לקוחות עסקיים.',
    };
    return explanations[status] || "";
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert("יש לאשר את תנאי השימוש");
      return;
    }

    setEmailSubmitting(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, consentGiven: consent, assessmentId }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSuccess(true);
        setTimeout(() => setShowEmailForm(false), 2000);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("שגיאה בשליחת הטופס");
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("בחר דירוג");
      return;
    }

    setFeedbackSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, rating, comment }),
      });

      const data = await response.json();

      if (data.success) {
        setFeedbackSuccess(true);
        setTimeout(() => setShowFeedback(false), 2000);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("שגיאה בשליחת המשוב");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161616] text-[#f4f4f4] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <div className="text-xl">טוען תוצאות...</div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#161616] text-[#f4f4f4] flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">{error || "תוצאות לא נמצאו"}</h1>
          <Link href="/quiz">
            <Button className="bg-[#0f62fe] hover:bg-[#0353e9] text-white">
              התחל בדיקה חדשה
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = result.status === "פטור" ? "#42be65" : result.status === "מורשה" ? "#0f62fe" : "#ff832b";

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
          {/* Result Badge */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">✅ התוצאה שלך:</h1>
            <div
              className="inline-block px-8 py-6 rounded-lg border-2 mb-6"
              style={{ borderColor: statusColor, backgroundColor: `${statusColor}20` }}
            >
              <div className="text-3xl font-bold mb-2">{result.statusText}</div>
              <div className="text-sm text-[#c6c6c6]">
                {result.status === "פטור" && "VAT-Exempt Dealer"}
                {result.status === "מורשה" && "VAT-Authorized Dealer"}
                {result.status === "choice" && "You Can Choose"}
              </div>
            </div>

            <p className="text-lg text-[#c6c6c6] leading-relaxed">{result.explanation}</p>
          </div>

          {/* Checklist */}
          <div className="bg-[#262626] rounded-lg p-6 sm:p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
              📋 מה אתה צריך לעשות:
            </h2>
            <div className="space-y-8">
              {result.checklist.map((item, index) => (
                <div
                  key={item.step}
                  className={`border-r-4 border-[#0f62fe] pr-6 pb-8 ${index !== result.checklist.length - 1 ? 'border-b border-[#393939]' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0f62fe] text-white flex items-center justify-center font-bold text-lg shadow-lg">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                      <p className="text-[#c6c6c6] mb-4 leading-relaxed">{item.description}</p>

                      {/* Action Buttons Row */}
                      <div className="flex flex-col sm:flex-row gap-3 items-start">
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-[#0f62fe] hover:bg-[#0353e9] text-white rounded-lg font-medium transition-all hover:shadow-lg hover:scale-105 hover:-translate-y-0.5"
                          >
                            <span>🔗</span>
                            <span>{item.linkText || "פתח את האתר"}</span>
                            <span className="text-sm">↗</span>
                          </a>
                        )}
                        {item.estimatedTime && (
                          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#393939] text-[#c6c6c6] rounded-lg text-sm border border-[#525252]">
                            <span>⏱</span>
                            <span>זמן משוער: {item.estimatedTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip */}
          <div className="bg-[#0f62fe] bg-opacity-10 border-2 border-[#0f62fe] rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold mb-2">טיפ מקצועי:</h3>
                <p className="text-[#c6c6c6]">
                  רוב העצמאיים משלימים את התהליך תוך 1-2 ימי עסקים דרך הפורטל המקוון.
                </p>
              </div>
            </div>
          </div>

          {/* Calendar CTA */}
          <div className="bg-[#0f62fe]/10 border border-[#0f62fe] rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-[#f4f4f4] mb-2">
              🗓️ רוצה לקבל תזכורות אוטומטיות לכל המועדים?
            </h3>
            <p className="text-[#c6c6c6] mb-4">
              בנה לוח שנה אישי עם כל המועדים הרלוונטיים לעסק שלך - מע"מ, מס הכנסה, ביטוח לאומי ועוד
            </p>
            <Button
              onClick={() => {
                // Save VAT status to sessionStorage for onboarding
                sessionStorage.setItem('vatAssessment', JSON.stringify({
                  status: result.status,
                  assessmentId: assessmentId,
                  timestamp: new Date().toISOString()
                }));
                // Redirect to signup (or dashboard if already logged in)
                router.push('/signup?redirect=onboarding');
              }}
              className="w-full bg-[#0f62fe] hover:bg-[#0353e9] text-white py-4 text-lg font-semibold"
            >
              בנה לוח שנה אישי בחינם →
            </Button>
          </div>

          {/* Email Signup */}
          {!emailSuccess && (
            <div className="bg-[#262626] rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                📧 שלח לי את התוצאות הללו
              </h2>
              {!showEmailForm ? (
                <Button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full bg-[#0f62fe] hover:bg-[#0353e9] text-white py-4"
                >
                  שלח תוצאות למייל
                </Button>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">שם מלא</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#393939] border border-[#525252] focus:border-[#0f62fe] focus:outline-none"
                      placeholder="יוסי כהן"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">דואר אלקטרוני</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#393939] border border-[#525252] focus:border-[#0f62fe] focus:outline-none"
                      placeholder="yossi@example.com"
                    />
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      required
                      className="mt-1"
                    />
                    <label htmlFor="consent" className="text-sm text-[#c6c6c6]">
                      אני מאשר קבלת טיפים ותזכורות (ניתן להסיר בכל עת)
                    </label>
                  </div>
                  <Button
                    type="submit"
                    disabled={emailSubmitting}
                    className="w-full bg-[#0f62fe] hover:bg-[#0353e9] text-white py-4"
                  >
                    {emailSubmitting ? "שולח..." : "שלח לי את התוצאות"}
                  </Button>
                </form>
              )}
            </div>
          )}

          {emailSuccess && (
            <div className="bg-[#42be65] bg-opacity-10 border-2 border-[#42be65] rounded-lg p-6 mb-8 text-center">
              <span className="text-4xl">✅</span>
              <p className="text-lg mt-2">התוצאות נשלחו בהצלחה!</p>
            </div>
          )}

          {/* Feedback */}
          {!feedbackSuccess && (
            <div className="bg-[#262626] rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6">האם זה עזר לך?</h2>
              {!showFeedback ? (
                <Button
                  onClick={() => setShowFeedback(true)}
                  className="w-full bg-[#393939] hover:bg-[#525252] text-white py-4"
                >
                  דרג את הכלי
                </Button>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-3">דירוג:</label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-4xl transition-all ${
                            star <= rating ? "text-[#ff832b]" : "text-[#525252]"
                          }`}
                        >
                          {star <= rating ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">תגובה (אופציונלי)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-[#393939] border border-[#525252] focus:border-[#0f62fe] focus:outline-none resize-none"
                      placeholder="מה אהבת? מה היית משפר?"
                    />
                    <div className="text-xs text-[#8d8d8d] mt-1">
                      {comment.length}/500 תווים
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={feedbackSubmitting || rating === 0}
                    className="w-full bg-[#0f62fe] hover:bg-[#0353e9] text-white py-4"
                  >
                    {feedbackSubmitting ? "שולח..." : "שלח משוב"}
                  </Button>
                </form>
              )}
            </div>
          )}

          {feedbackSuccess && (
            <div className="bg-[#42be65] bg-opacity-10 border-2 border-[#42be65] rounded-lg p-6 mb-8 text-center">
              <span className="text-4xl">🙏</span>
              <p className="text-lg mt-2">תודה על המשוב!</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Link href="/quiz">
              <Button className="w-full bg-[#262626] hover:bg-[#393939] text-white py-4 border border-[#525252]">
                ⟲ התחל שוב
              </Button>
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("הקישור הועתק ללוח!");
              }}
              className="w-full bg-[#262626] hover:bg-[#393939] text-white py-4 rounded-lg border border-[#525252]"
            >
              🔗 העתק קישור לשיתוף
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
