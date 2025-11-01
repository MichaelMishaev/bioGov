"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Language = "he" | "en";

interface QuizAnswers {
  activity: string;
  revenue: string;
  clients: string;
  employees: string;
  voluntary: string;
}

const questions = [
  {
    id: 1,
    questionHe: "מה סוג הפעילות העסקית שלך?",
    questionEn: "What type of business activity?",
    optionsHe: [
      { value: "מוצרים", label: "מוצרים וציוד" },
      { value: "שירותים", label: "שירותים" },
      { value: "שניהם", label: "שניהם" },
    ],
    optionsEn: [
      { value: "מוצרים", label: "Products & Equipment" },
      { value: "שירותים", label: "Services" },
      { value: "שניהם", label: "Both" },
    ],
    field: "activity" as keyof QuizAnswers,
  },
  {
    id: 2,
    questionHe: "מה המחזור השנתי הצפוי?",
    questionEn: "Expected annual revenue?",
    optionsHe: [
      { value: "עד 120K", label: "פחות מ-₪120,000" },
      { value: "120K-500K", label: "₪120,000-500,000" },
      { value: "500K+", label: "מעל ₪500,000" },
    ],
    optionsEn: [
      { value: "עד 120K", label: "Less than ₪120,000" },
      { value: "120K-500K", label: "₪120,000-500,000" },
      { value: "500K+", label: "Over ₪500,000" },
    ],
    field: "revenue" as keyof QuizAnswers,
  },
  {
    id: 3,
    questionHe: "מי הלקוחות העיקריים שלך?",
    questionEn: "Who are your main clients?",
    optionsHe: [
      { value: "פרטיים", label: "לקוחות פרטיים (B2C)" },
      { value: "עסקים", label: "עסקים (B2B)" },
      { value: "מעורב", label: "מעורב" },
    ],
    optionsEn: [
      { value: "פרטיים", label: "Private clients (B2C)" },
      { value: "עסקים", label: "Businesses (B2B)" },
      { value: "מעורב", label: "Mixed" },
    ],
    field: "clients" as keyof QuizAnswers,
  },
  {
    id: 4,
    questionHe: "כמה עובדים יש לך?",
    questionEn: "How many employees?",
    optionsHe: [
      { value: "0", label: "אין עובדים (רק אני)" },
      { value: "1-5", label: "1-5 עובדים" },
      { value: "6+", label: "6 עובדים ומעלה" },
    ],
    optionsEn: [
      { value: "0", label: "No employees (just me)" },
      { value: "1-5", label: "1-5 employees" },
      { value: "6+", label: "6+ employees" },
    ],
    field: "employees" as keyof QuizAnswers,
  },
  {
    id: 5,
    questionHe: "מעוניין ברישום מרצון כעוסק מורשה?",
    questionEn: "Interested in voluntary registration?",
    helpTextHe: {
      title: "מה זה רישום מרצון?",
      content: [
        "גם אם אתה מתחת לסף ה-₪120,000, אתה יכול לבחור להירשם כעוסק מורשה מרצון.",
        "למה כדאי? אם יש לך הוצאות עסקיות גבוהות (ציוד, משרד, ספקים), תוכל לקבל החזר על המע\"מ ששילמת.",
        "למה לא כדאי? תצטרך לנהל ספרים, להגיש דוחות רבעוניים, ולגבות מע\"מ מהלקוחות (17% נוספים).",
      ],
    },
    helpTextEn: {
      title: "What is voluntary registration?",
      content: [
        "Even if you're below the ₪120,000 threshold, you can choose to register as VAT-authorized voluntarily.",
        "Why it's good: If you have high business expenses (equipment, office, suppliers), you can get VAT refunds on what you paid.",
        "Why it's not: You'll need to keep books, file quarterly reports, and charge clients VAT (17% extra).",
      ],
    },
    optionsHe: [
      { value: "כן", label: "כן, הסבר לי על היתרונות" },
      { value: "לא", label: "לא מעוניין" },
      { value: "לא בטוח", label: "לא בטוח" },
    ],
    optionsEn: [
      { value: "כן", label: "Yes, explain the benefits" },
      { value: "לא", label: "Not interested" },
      { value: "לא בטוח", label: "Not sure" },
    ],
    field: "voluntary" as keyof QuizAnswers,
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState<Language>("he");
  const [showHelp, setShowHelp] = useState<{ [key: number]: boolean }>({});

  const currentField = questions[currentQuestion].field;
  const selectedAnswer = answers[currentField];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isRTL = language === "he";

  const handleSelect = (value: string) => {
    setAnswers({ ...answers, [currentField]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // Reset help state when moving to next question
      setShowHelp({});
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.push("/");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (data.success) {
        // Store result in sessionStorage for results page
        sessionStorage.setItem("assessmentResult", JSON.stringify(data));
        router.push(`/results/${data.assessmentId}`);
      } else {
        alert("שגיאה: " + data.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("שגיאה בשליחת הבדיקה. נסה שוב.");
      setIsSubmitting(false);
    }
  };

  const question = questions[currentQuestion];
  const questionText = language === "he" ? question.questionHe : question.questionEn;
  const options = language === "he" ? question.optionsHe : question.optionsEn;
  const helpText = language === "he" ? question.helpTextHe : question.helpTextEn;

  return (
    <div className="min-h-screen bg-[#161616] text-[#f4f4f4]" style={{ fontFamily: "'Rubik', sans-serif" }} dir={isRTL ? "rtl" : "ltr"}>
      {/* Progress Header */}
      <header className="sticky top-0 z-50 bg-[#262626] border-b border-[#525252]">
        <div className="container mx-auto px-6 py-4">
          {/* Language Selector Pills */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex gap-2 bg-[#393939] rounded-lg p-1">
              <button
                onClick={() => setLanguage("he")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  language === "he"
                    ? "bg-[#0f62fe] text-white"
                    : "text-[#c6c6c6] hover:text-white"
                }`}
              >
                עברית
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  language === "en"
                    ? "bg-[#0f62fe] text-white"
                    : "text-[#c6c6c6] hover:text-white"
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Question Counter */}
          <div className="text-center text-[#c6c6c6] mb-3">
            {currentQuestion + 1}/{questions.length}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#393939] rounded-full h-2 mb-3">
            <div
              className="bg-[#0f62fe] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-3">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentQuestion
                    ? "bg-[#0f62fe]"
                    : index < currentQuestion
                    ? "bg-[#42be65]"
                    : "bg-[#525252]"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Question Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-3 leading-tight">
              {questionText}
            </h1>

            {/* Expandable Help Section for Question 5 */}
            {helpText && (
              <div className="mt-4">
                <button
                  onClick={() => setShowHelp({ ...showHelp, [currentQuestion]: !showHelp[currentQuestion] })}
                  className="w-full p-4 bg-[#262626] rounded-lg border-2 border-[#0f62fe] hover:bg-[#393939] transition-all text-right"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-2xl">{showHelp[currentQuestion] ? "▼" : "▶"}</span>
                    <div className="flex-1">
                      <span className="text-lg font-medium text-[#0f62fe]">
                        {helpText.title}
                      </span>
                    </div>
                    <span className="text-xl">💡</span>
                  </div>
                </button>

                {/* Expanded Help Content */}
                {showHelp[currentQuestion] && (
                  <div className="mt-3 p-6 bg-[#0f62fe] bg-opacity-10 border-2 border-[#0f62fe] rounded-lg space-y-4 animate-slide-down">
                    {helpText.content.map((text, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-[#0f62fe] font-bold">{index === 0 ? "📌" : index === 1 ? "✅" : "⚠️"}</span>
                        <p className="text-[#f4f4f4] leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full p-6 rounded-lg border-2 transition-all ${
                  isRTL ? "text-right" : "text-left"
                } ${
                  selectedAnswer === option.value
                    ? "border-[#0f62fe] bg-[#0f62fe] bg-opacity-20"
                    : "border-[#525252] bg-[#262626] hover:border-[#0f62fe] hover:bg-[#262626]"
                }`}
              >
                <div className={`flex items-center gap-4 ${isRTL ? "" : "flex-row-reverse"}`}>
                  {/* Radio Button */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all ${
                      selectedAnswer === option.value
                        ? "border-[#0f62fe] bg-[#0f62fe]"
                        : "border-[#525252]"
                    }`}
                  >
                    {selectedAnswer === option.value && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white" />
                      </div>
                    )}
                  </div>

                  {/* Text - Single Language Only */}
                  <div className="flex-1">
                    <div className="text-lg font-medium">{option.label}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer || isSubmitting}
            className={`w-full py-6 text-lg font-medium rounded-lg transition-all ${
              selectedAnswer && !isSubmitting
                ? "bg-[#0f62fe] hover:bg-[#0353e9] text-white"
                : "bg-[#393939] text-[#8d8d8d] cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                {language === "he" ? "מעבד..." : "Processing..."}
              </span>
            ) : currentQuestion === questions.length - 1 ? (
              language === "he" ? "◄ סיים ובדוק תוצאות" : "Finish & Check Results →"
            ) : (
              language === "he" ? "◄ המשך" : "Next →"
            )}
          </Button>

          {/* Back Button */}
          <button
            onClick={handleBack}
            className="w-full py-4 mt-4 text-[#0f62fe] hover:text-[#0353e9] font-medium transition-all"
          >
            {language === "he" ? "חזור ←" : "← Back"}
          </button>
        </div>
      </main>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
